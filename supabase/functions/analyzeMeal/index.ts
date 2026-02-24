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

        // Convert file to base64
        const arrayBuffer = await fileData.arrayBuffer()
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        const mediaType = 'image/jpeg'

        let systemPrompt = `You are an expert wellness, nutrition, and lifestyle AI. 
Analyze the provided meal image and return your analysis strictly as a JSON object with the following schema:
{
  "components": [{"name": "string", "confidence": 0.0 - 1.0}],
  "macros": {"calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0},
  "feel_score": {"energy": 0-100, "satiety": 0-100, "digestion": 0-100, "sleep": 0-100, "cravings": 0-100},
  "why": ["string"],
  "toxic_score": {"score": 0, "additives": [], "level": "Low"},
  "micro_swap": {"title": "string", "steps": ["string"]},
  "warnings": ["string"],
  "prediction": {"energy_impact": "string (impact of this meal on energy over the next few hours)", "advice": "string (proactive tip to balance the meal)", "fatigue_warning": boolean (true if the meal might cause a blood sugar spike or crash, false otherwise)}
}
Only return the JSON and nothing else. Respond in French. Ensure your tone is positive, non-judgmental, and acts as a proactive health coach.`

        let userPromptText = "Analyze this meal photo."

        if (meal.context) {
            if (meal.context.type === 'barcode') {
                systemPrompt = `You are an expert wellness, nutrition, and lifestyle AI. 
The user has scanned a food product barcode. You will be provided with the product's raw OpenFoodFacts data (ingredients, additives, nutritional values).
Analyze this data carefully to determine if the product is ultra-processed, dangerous, or healthy.
Return your analysis strictly as a JSON object with the following schema:
{
  "components": [{"name": "string (product name)", "confidence": 1.0}],
  "macros": {"calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0},
  "feel_score": {"energy": 0-100, "satiety": 0-100, "digestion": 0-100, "sleep": 0-100, "cravings": 0-100},
  "why": ["string"],
  "toxic_score": {"score": 0-100 (where 100 is highly toxic/ultra-processed, 0 is natural/whole food), "additives": ["string"], "level": "Low" | "Medium" | "High" | "Critical"},
  "micro_swap": {"title": "string", "steps": ["string"]},
  "warnings": ["string"],
  "prediction": {"energy_impact": "string", "advice": "string", "fatigue_warning": boolean}
}
Only return the JSON and nothing else. Respond in French. Ensure your tone is positive, non-judgmental, and acts as a proactive health coach, but be very clear about industrial food risks.`

                userPromptText = `Analyze this barcode product. 
Product Name: ${meal.context.product_name}
Ingredients: ${meal.context.ingredients}
Additives: ${JSON.stringify(meal.context.additives)}
Nutriments: ${JSON.stringify(meal.context.nutriments)}`
            } else {
                userPromptText += ` Context: ${JSON.stringify(meal.context)}`
            }
        }

        const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
        if (!anthropicKey) {
            throw new Error('Anthropic API key is not configured')
        }

        // Call Anthropic Vision (Claude 3.5 Sonnet)
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mediaType,
                                    data: base64Image
                                }
                            },
                            {
                                type: 'text',
                                text: userPromptText
                            }
                        ]
                    }
                ]
            })
        })

        if (!anthropicResponse.ok) {
            const err = await anthropicResponse.text()
            throw new Error(`Anthropic error: ${anthropicResponse.status} ${err}`)
        }

        const resultBody = await anthropicResponse.json()
        const textContent = resultBody.content[0].text

        // Parse JSON
        let analysisResult: any
        try {
            const jsonStrMatch = textContent.match(/\{[\s\S]*\}/)
            analysisResult = JSON.parse(jsonStrMatch ? jsonStrMatch[0] : textContent)
        } catch (_e) {
            throw new Error('Failed to parse Anthropic response as JSON: ' + textContent)
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
