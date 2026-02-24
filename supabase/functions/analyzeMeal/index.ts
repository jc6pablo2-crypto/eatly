/// <reference types="https://deno.land/x/types/index.d.ts" />

// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js
// The IDE may show errors for Deno-specific imports and globals, but they work at runtime.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { meal_id } = await req.json()
        if (!meal_id) {
            throw new Error('meal_id is required')
        }

        // Verify API keys exist
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const authHeader = req.headers.get('Authorization')

        if (!supabaseUrl || !authHeader) {
            throw new Error('Missing environment or authorization header')
        }

        const supabaseClient = createClient(
            supabaseUrl,
            Deno.env.get('SUPABASE_ANON_KEY')!
        )

        // Verify user is authenticated using their specific JWT token passed in the header
        const jwt = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt)

        if (userError || !user) {
            console.error('[Eatly] Edge Function Auth Error:', userError)
            throw new Error('Unauthorized or invalid JWT')
        }

        // Create Admin client to bypass RLS for internal server operations
        const supabaseAdmin = createClient(
            supabaseUrl,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Get the meal to find the image path
        const { data: meal, error: mealError } = await supabaseAdmin
            .from('meals')
            .select('image_path, context')
            .eq('id', meal_id)
            .eq('user_id', user.id) // Enforce security manually
            .single()

        if (mealError || !meal) {
            console.error('[Eatly] Fetch meal error:', mealError)
            throw new Error('Meal not found')
        }

        // Get signed URL to download image or download directly via Supabase client
        const { data: fileData, error: downloadError } = await supabaseAdmin
            .storage
            .from('meal_photos')
            .download(meal.image_path)

        if (downloadError) {
            throw new Error('Could not download image: ' + downloadError.message)
        }

        // Convert file to base64 safely without throwing stack limit errors
        const arrayBuffer = await fileData.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        let binary = ''
        const chunkSize = 8192
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = Array.from(uint8Array.subarray(i, i + chunkSize))
            binary += String.fromCharCode.apply(null, chunk)
        }
        const base64Image = btoa(binary)
        const mediaType = 'image/jpeg'

        let systemPrompt = `You are an expert wellness, nutrition, and lifestyle AI. 
Analyze the provided meal image and return your analysis strictly as a valid JSON object matching the structure below. 
IMPORTANT: The values in the structure below are just EXAMPLES. You MUST replace all strings, numbers, and booleans with your actual precise estimated values for the user's meal. Do NOT copy the example values! For example, do not output 450 for calories unless the meal is actually 450 calories.

{
  "components": [{"name": "Saumon et Brocolis", "confidence": 0.95}],
  "macros": {"calories": 450, "protein_g": 35, "carbs_g": 15, "fat_g": 20},
  "feel_score": {"energy": 85, "satiety": 90, "digestion": 80, "sleep": 80, "cravings": 10},
  "why": ["High protein promotes satiety.", "Rich in Omega-3."],
  "toxic_score": {"score": 5, "additives": [], "level": "Low"},
  "micro_swap": {"title": "Ajouter de l'huile d'olive", "steps": ["Un filet d'huile pour de bonnes graisses."]},
  "warnings": ["Aucun avertissement particulier."],
  "prediction": {"energy_impact": "Énergie stable sur 4 heures", "advice": "Boire de l'eau", "fatigue_warning": false}
}

CRITICAL: Return ONLY the JSON object. Do not include markdown formatting (like \`\`\`json). All textual values should be in French, but keep the exact JSON keys as defined.`

        let userPromptText = "Analyze this meal photo."

        if (meal.context) {
            if (meal.context.type === 'barcode') {
                systemPrompt = `You are an expert wellness, nutrition, and lifestyle AI. 
The user has scanned a food product barcode. You will be provided with the product's raw OpenFoodFacts data (ingredients, additives, nutritional values).
Analyze this data carefully to determine if the product is ultra-processed, dangerous, or healthy.
Return your analysis strictly as a JSON object with the following schema:
{
  "components": [{"name": "Nom du produit", "confidence": 0.99}],
  "macros": {"calories": 250, "protein_g": 5, "carbs_g": 30, "fat_g": 12},
  "feel_score": {"energy": 60, "satiety": 40, "digestion": 50, "sleep": 70, "cravings": 80},
  "why": ["Explication 1", "Explication 2"],
  "toxic_score": {"score": 85, "additives": ["E150d", "E621"], "level": "High"},
  "micro_swap": {"title": "Alternative saine", "steps": ["Étape 1"]},
  "warnings": ["Contient beaucoup de sucre"],
  "prediction": {"energy_impact": "Pic d'énergie court", "advice": "Conseil santé", "fatigue_warning": true}
}

CRITICAL: Return ONLY the JSON object. Do not include markdown formatting (like \`\`\`json). All textual values should be in French, but keep the exact JSON keys as defined. Ensure your tone is positive, non-judgmental, and acts as a proactive health coach, but be very clear about industrial food risks.`

                userPromptText = `Analyze this barcode product. 
Product Name: ${meal.context.product_name}
Ingredients: ${meal.context.ingredients}
Additives: ${JSON.stringify(meal.context.additives)}
Nutriments: ${JSON.stringify(meal.context.nutriments)}`
            } else {
                userPromptText += ` Context: ${JSON.stringify(meal.context)}`
            }
        }

        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) {
            throw new Error('Gemini API key is not configured')
        }

        // Call Google Gemini 2.5 Flash
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    parts: [
                        { inlineData: { mimeType: mediaType, data: base64Image } },
                        { text: userPromptText }
                    ]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.4
                }
            })
        })

        if (!geminiResponse.ok) {
            const err = await geminiResponse.text()
            throw new Error(`Gemini API error: ${geminiResponse.status} ${err}`)
        }

        const resultBody = await geminiResponse.json()
        const textContent = resultBody.candidates?.[0]?.content?.parts?.[0]?.text

        if (!textContent) {
            throw new Error('Empty response from Gemini API')
        }

        // Because we enforced 'application/json' in generationConfig, 
        // Gemini guarantees the textContent is pure JSON.
        let analysisResult: any
        try {
            analysisResult = JSON.parse(textContent)
        } catch (_e) {
            throw new Error('Gemini guaranteed JSON but parsing failed: ' + textContent)
        }

        // Save back to DB
        const adminSupabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const { data: inserted, error: insertError } = await adminSupabase
            .from('meal_analysis')
            .insert({
                meal_id: meal_id,
                user_id: user.id,
                result: analysisResult
            })
            .select()
            .single()

        if (insertError) {
            console.error(insertError)
            throw new Error('Failed to save analysis to db: ' + insertError.message)
        }

        return new Response(JSON.stringify(inserted), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
