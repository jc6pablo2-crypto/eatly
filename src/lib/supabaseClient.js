import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '⛔ SUPABASE CONFIG MISSING!\n' +
        `VITE_SUPABASE_URL = ${supabaseUrl || 'UNDEFINED'}\n` +
        `VITE_SUPABASE_ANON_KEY = ${supabaseAnonKey ? '***set***' : 'UNDEFINED'}\n` +
        'Make sure these are set in your .env file or Vercel Environment Variables.'
    )
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)

// Export a helper to check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
