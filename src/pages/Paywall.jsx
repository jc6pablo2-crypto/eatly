import { Sparkles, ArrowRight, Lock, Crown, Zap, BarChart3, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Paywall() {
    const { profile } = useAuth()
    const isPremium = profile?.is_premium

    if (isPremium) {
        return (
            <div className="page-container flex flex-col px-6 bg-white animated-gradient-bg">
                <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full z-10">
                    <div className="w-20 h-20 rounded-3xl bg-brand-50 flex items-center justify-center mb-6">
                        <Crown className="w-10 h-10 text-brand-500" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-foreground mb-2 text-center">Vous êtes Premium ✨</h1>
                    <p className="text-gray-500 text-center mb-8 font-medium">Vous avez accès à toutes les fonctionnalités Eatly. Merci pour votre confiance !</p>
                    <Link to="/dashboard" className="btn-primary w-full text-lg">
                        Retour au Dashboard <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        )
    }

    const features = [
        { icon: Zap, title: 'Scans illimités', desc: 'Plus de limite de 3 repas par jour' },
        { icon: BarChart3, title: 'Analyses IA avancées', desc: 'Score Prédictif, Score Toxique, insights complets' },
        { icon: History, title: 'Historique complet', desc: 'Accédez à tous vos repas passés et tendances' },
        { icon: Sparkles, title: 'Coaching IA personnalisé', desc: 'Conseils macro-nutritionnels et prédictions d\'énergie' },
    ]

    return (
        <div className="page-container flex flex-col bg-white animated-gradient-bg overflow-y-auto hide-scrollbar">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/30">
                    <Crown className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-[1.75rem] font-extrabold text-foreground tracking-tight mb-2">Eatly Premium</h1>
                <p className="text-gray-500 font-medium text-sm max-w-xs mx-auto">Débloquez tout le potentiel de votre alimentation avec l'IA</p>
            </div>

            {/* Features List */}
            <div className="px-6 space-y-3 mb-6">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <f.icon className="w-6 h-6 text-brand-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm">{f.title}</h3>
                            <p className="text-xs text-gray-400 font-medium">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pricing Card */}
            <div className="px-6 mb-6">
                <div className="relative rounded-[2rem] overflow-hidden p-[2px] shadow-xl">
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,#38bbbf_360deg)] animate-[spin_4s_linear_infinite]"></div>
                    <div className="relative bg-white rounded-[1.9rem] p-6 z-10 text-center">
                        <div className="flex items-end justify-center gap-1 mb-1">
                            <span className="text-4xl font-extrabold text-foreground">12€</span>
                            <span className="text-gray-400 font-bold text-sm mb-1">/mois</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-5">Annulez à tout moment</p>

                        <Link
                            to="/#pricing"
                            className="w-full py-4 text-center rounded-2xl bg-foreground text-white font-extrabold text-lg hover:bg-gray-800 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-foreground/20"
                        >
                            Devenir Premium <Sparkles className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Back link */}
            <div className="px-6 pb-10 text-center">
                <Link to="/dashboard" className="text-sm text-gray-400 font-medium hover:text-foreground transition-colors">
                    Continuer avec le plan gratuit
                </Link>
            </div>
        </div>
    )
}
