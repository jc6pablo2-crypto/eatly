import { Sparkles, ArrowRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PremiumCTA({ title, description, variant = 'box' }) {
    if (variant === 'inline') {
        return (
            <div className="bg-white/50 backdrop-blur-sm border border-brand-100 rounded-2xl p-4 flex items-center justify-between group hover:border-brand-200 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-sm">{title}</h4>
                        <p className="text-xs text-brand-600/70 font-medium">{description}</p>
                    </div>
                </div>
                <Link to="/paywall" className="bg-foreground text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform whitespace-nowrap">
                    Débloquer <Sparkles className="w-3.5 h-3.5" />
                </Link>
            </div>
        )
    }

    return (
        <div className="relative rounded-[2rem] overflow-hidden p-[2px] shadow-lg group">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,#38bbbf_360deg)] animate-[spin_4s_linear_infinite]"></div>

            <div className="relative h-full bg-white rounded-[1.9rem] p-8 flex flex-col items-center text-center z-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[40px] pointer-events-none rounded-full"></div>

                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 text-brand-500 relative">
                    <Lock className="w-8 h-8 absolute" />
                    <Sparkles className="w-4 h-4 absolute top-2 right-2 text-accent-500 animate-pulse" />
                </div>

                <h3 className="text-xl font-extrabold text-foreground mb-2">{title}</h3>
                <p className="text-gray-500 font-medium mb-8 max-w-sm">
                    {description}
                </p>

                <Link to="/paywall" className="w-full py-3.5 text-center rounded-xl bg-foreground text-white font-extrabold hover:bg-gray-800 flex items-center justify-center gap-2 active:scale-95 transition-all">
                    Passer à Eatly Premium <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
