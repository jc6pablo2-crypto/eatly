import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, ArrowRight, Loader2, Sparkles, ChevronLeft } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
        else navigate('/')
        setLoading(false)
    }

    const handleMagicLink = async () => {
        if (!email) return setError('Veuillez entrer votre email pour le lien magique')
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) setError(error.message)
        else setSuccess('Lien magique envoyé. Vérifiez vos emails !')
        setLoading(false)
    }

    return (
        <div className="page-container flex flex-col px-6 bg-white animated-gradient-bg">
            <Link to="/" className="absolute top-12 left-6 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-gray-500 hover:text-foreground transition-colors z-20">
                <ChevronLeft className="w-6 h-6" />
            </Link>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full z-10 pt-16">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-foreground text-brand-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/40 to-transparent"></div>
                        <Sparkles className="w-8 h-8 relative z-10" />
                    </div>
                    <h1 className="text-[2rem] font-extrabold tracking-tight mb-2 text-foreground">Connexion</h1>
                    <p className="text-gray-500 font-medium text-lg">Retrouvez votre routine</p>
                </div>

                <div className="glass-card p-8 bg-white/80">
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 text-center font-medium border border-red-100">{error}</div>}
                    {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-sm mb-6 text-center font-medium border border-emerald-100">{success}</div>}

                    <form onSubmit={handleLogin} className="space-y-5">
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
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-14"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Link to="/reset-password" className="text-sm text-brand-600 font-bold active:opacity-70 transition-opacity">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <div className="pt-2 space-y-3">
                            <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Se connecter'}
                                {!loading && <ArrowRight className="w-5 h-5 ml-1" />}
                            </button>

                            <div className="relative py-3 flex items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="shrink-0 mx-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">ou</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <button type="button" onClick={handleMagicLink} disabled={loading} className="btn-secondary w-full text-base">
                                Recevoir un Lien Magique
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-10 font-medium">
                    Nouveau sur l'app ?{' '}
                    <Link to="/signup" className="text-foreground font-bold hover:text-brand-600 transition-colors border-b-2 border-foreground hover:border-brand-600 pb-0.5">
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    )
}
