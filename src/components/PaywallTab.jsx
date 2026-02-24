import { Sparkles, ArrowRight, Lock, Crown, Zap, BarChart3, History } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function PaywallTab() {
    const { profile } = useAuth()
    const isPremium = profile?.is_premium

    if (isPremium) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
                <div className="w-20 h-20 rounded-3xl bg-brand-50 flex items-center justify-center mb-6">
                    <Crown className="w-10 h-10 text-brand-500" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground mb-2 text-center">Vous êtes Premium ✨</h1>
                <p className="text-gray-500 text-center mb-8 font-medium">Toutes les fonctionnalités sont débloquées !</p>
            </div>
        )
    }

    const features = [
        { icon: Zap, title: 'Scans illimités', desc: 'Plus de limite de 3 repas par jour' },
        { icon: BarChart3, title: 'Analyses IA avancées', desc: 'Score Prédictif, Score Toxique, insights complets' },
        { icon: History, title: 'Historique complet', desc: 'Accédez à tous vos repas passés et tendances' },
        { icon: Sparkles, title: 'Coaching IA personnalisé', desc: 'Conseils macro et prédictions d\'énergie' },
    ]

    return (
        <div className="flex flex-col bg-[#F7F9FA] px-6 pt-12 pb-10">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
                    <Crown className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-[1.75rem] font-extrabold text-foreground tracking-tight mb-1">Eatly Premium</h1>
                <p className="text-gray-400 font-medium text-sm max-w-xs mx-auto">Débloquez tout le potentiel de votre alimentation avec l'IA</p>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-6">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
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
            <div className="relative rounded-[2rem] overflow-hidden p-[2px] shadow-xl mb-4">
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,#38bbbf_360deg)] animate-[spin_4s_linear_infinite]"></div>
                <div className="relative bg-white rounded-[1.9rem] p-6 z-10 text-center">
                    <div className="flex items-end justify-center gap-1 mb-1">
                        <span className="text-4xl font-extrabold text-foreground">12€</span>
                        <span className="text-gray-400 font-bold text-sm mb-1">/mois</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Annulez à tout moment</p>

                    <button className="w-full py-4 text-center rounded-2xl bg-foreground text-white font-extrabold text-lg hover:bg-gray-800 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-foreground/20">
                        Devenir Premium <Sparkles className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
