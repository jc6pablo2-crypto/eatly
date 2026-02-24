import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
    const navigate = useNavigate()
    const [error, setError] = useState(null)

    useEffect(() => {
        // Supabase auth listener or URL hash check
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
                setError(error.message)
            } else if (data.session) {
                navigate('/')
            } else {
                setError('Lien expiré ou invalide.')
            }
        }

        // Slight delay to allow Supabase client to process the URL hash automatically
        const timer = setTimeout(checkSession, 1500)
        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className="page-container flex flex-col items-center justify-center">
            {error ? (
                <div className="glass-card text-center p-8">
                    <p className="text-red-500 font-medium mb-4">{error}</p>
                    <button onClick={() => navigate('/login')} className="btn-primary w-full">
                        Retour
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                    <p className="text-gray-500 font-medium">Authentification en cours...</p>
                </div>
            )}
        </div>
    )
}
