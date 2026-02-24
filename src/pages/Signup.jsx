import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { Mail, Lock, ArrowRight, Loader2, Feather, ChevronLeft, User } from 'lucide-react'

export default function Signup() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!isSupabaseConfigured) {
            setError('Configuration Supabase manquante. Contactez le support.')
            setLoading(false)
            return
        }

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        first_name: firstName,
                        last_name: lastName
                    }
                }
            })

            setLoading(false)

            if (authError) {
                const msg = authError.message
                if (msg.includes('already registered')) {
                    setError('Cet email est déjà utilisé. Essayez de vous connecter.')
                } else if (msg.includes('rate limit')) {
                    setError('Trop de tentatives. Veuillez patienter quelques minutes.')
                } else if (msg.includes('password')) {
                    setError('Le mot de passe doit contenir au moins 6 caractères.')
                } else if (msg.includes('email')) {
                    setError('Adresse email invalide.')
                } else {
                    setError(msg)
                }
            } else if (data?.user) {
                if (data.session) {
                    navigate('/onboarding')
                } else {
                    navigate('/verify')
                }
            }
        } catch (err) {
            setLoading(false)
            console.error('Signup network error:', err)
            if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
                setError('Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.')
            } else {
                setError(`Erreur inattendue: ${err.message}`)
            }
        }
    }

    return (
        <div className="page-container flex flex-col px-6 bg-white animated-gradient-bg">
            <Link to="/" className="absolute top-8 left-6 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-gray-500 hover:text-foreground transition-colors z-20">
                <ChevronLeft className="w-6 h-6" />
            </Link>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full z-10 pt-10">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-white text-brand-600 rounded-[1.2rem] flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-100">
                        <Feather className="w-7 h-7" />
                    </div>
                    <h1 className="text-[1.75rem] font-extrabold tracking-tight mb-1 text-foreground">S'inscrire</h1>
                    <p className="text-gray-500 font-medium text-base">Capturez votre bien-être</p>
                </div>

                <div className="glass-card p-6 bg-white/80">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm mb-4 text-center font-medium border border-red-100">{error}</div>}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="relative group flex-1">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Prénom"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="input-field pl-14"
                                    required
                                />
                            </div>
                            <div className="relative group flex-1">
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="input-field pl-6"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="email"
                                placeholder="Adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-14"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Mot de passe (+6 car.)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-14"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="pt-3">
                            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Créer un compte'}
                                {!loading && <ArrowRight className="w-5 h-5 ml-1" />}
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-400 mt-3 leading-relaxed">
                            En vous inscrivant, vous acceptez nos Termes et Conditions.
                        </p>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6 mb-4 font-medium">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-foreground font-bold hover:text-brand-600 transition-colors border-b-2 border-foreground hover:border-brand-600 pb-0.5">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    )
}
