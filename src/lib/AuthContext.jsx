import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
        setProfile(data)
        setLoading(false)
    }

    const value = {
        user,
        profile,
        loading,
        signOut: () => supabase.auth.signOut(),
        updateProfile: async (updates) => {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({ user_id: user.id, ...updates })
                .select()
                .single()
            if (data) setProfile(data)
            return { data, error }
        }
    }

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext)
}
