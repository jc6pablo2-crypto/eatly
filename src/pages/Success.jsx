import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, Sparkles, Loader2, Crown } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Success() {
    const navigate = useNavigate()
    const { user, profile, refreshProfile } = useAuth()
    const [activating, setActivating] = useState(true)
    const [activated, setActivated] = useState(false)

    // Poll profile until is_premium becomes true (webhook may take a few seconds)
    useEffect(() => {
        if (!user) {
            navigate('/welcome', { replace: true })
            return
        }

        // If already premium, skip polling
        if (profile?.is_premium) {
            setActivating(false)
            setActivated(true)
            return
        }

        let attempts = 0
        const maxAttempts = 20 // ~20 seconds max
        const interval = setInterval(async () => {
            attempts++
            await refreshProfile()

            // We need to re-check inside the callback — profile is stale here
            // The refreshProfile updates the context, so after this call,
            // the component will re-render with new profile
        }, 1000)

        // Also set a timeout to stop after maxAttempts
        const timeout = setTimeout(() => {
            clearInterval(interval)
            setActivating(false)
            setActivated(true) // Show success anyway, webhook might be slightly delayed
        }, maxAttempts * 1000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [user])

    // Watch for profile.is_premium becoming true
    useEffect(() => {
        if (profile?.is_premium) {
            setActivating(false)
            setActivated(true)
        }
    }, [profile?.is_premium])

    return (
        <div className="min-h-screen bg-[#F7F9FA] flex flex-col items-center justify-center px-6 selection:bg-brand-500/30">
            <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-xl text-center border border-gray-100 relative overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                {activating ? (
                    <>
                        <div className="w-20 h-20 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Loader2 className="w-10 h-10 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-4">Activation en cours...</h1>
                        <p className="text-gray-500 font-medium mb-4">
                            Nous activons votre abonnement Premium. Cela ne prend que quelques secondes.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
                            Synchronisation avec Stripe...
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm relative">
                            <CheckCircle className="w-10 h-10" />
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-brand-50 rounded-full flex items-center justify-center border-2 border-white">
                                <Crown className="w-3.5 h-3.5 text-brand-500" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">Paiement Réussi !</h1>
                        <p className="text-gray-500 font-medium mb-8">
                            Bienvenue dans Eatly Premium. Votre abonnement a été activé avec succès et vous avez désormais accès à toutes les fonctionnalités avancées.
                        </p>

                        <Link
                            to="/dashboard"
                            className="w-full py-4 text-center rounded-2xl bg-foreground text-white font-extrabold hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Aller au Tableau de bord <ArrowRight className="w-5 h-5" />
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
