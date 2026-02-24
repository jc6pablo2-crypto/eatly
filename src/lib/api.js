import { supabase } from './supabaseClient'

export async function uploadMealPhoto(userId, file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`

    const { data, error } = await supabase.storage
        .from('meal_photos')
        .upload(fileName, file)

    if (error) throw error
    return data.path
}

export async function createMealRecord(userId, imagePath, context) {
    const { data, error } = await supabase
        .from('meals')
        .insert({
            user_id: userId,
            image_path: imagePath,
            context,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function analyzeMeal(mealId) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/functions/v1/analyzeMeal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ meal_id: mealId })
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Analysis failed: ${errorText}`)
    }

    return response.json()
}

export async function saveMealFeedback(mealId, userId, sliders) {
    const { data, error } = await supabase
        .from('meal_feedback')
        .insert({
            meal_id: mealId,
            user_id: userId,
            sliders
        })
        .select()
        .single()

    if (error) throw error
    return data
}

// Get recent meals with their associated analysis
export async function getUserMeals(userId, limit = 5) {
    const { data, error } = await supabase
        .from('meals')
        .select(`
            *,
            meal_analysis (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}

// Get meals within a date range for Insights
export async function getWeeklyMeals(userId, startDate, endDate) {
    const { data, error } = await supabase
        .from('meals')
        .select(`
            *,
            meal_analysis (*)
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data
}

// Get the count of meals logged today by the user
export async function getTodayMealCount(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // We can't easily query just count by itself in a single simple call without counting rows
    // Let's use the exact select syntax with { count: 'exact' }
    const { count, error } = await supabase
        .from('meals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())

    if (error) throw error
    return count || 0
}
