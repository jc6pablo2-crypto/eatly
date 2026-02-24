import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Zap, Heart, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react'

const slides = [
    {
        title: "Mangez en pleine conscience.",
        subtitle: "Découvrez l'impact réel de vos assiettes sur votre énergie et votre bien-être.",
        icon: Camera,
        color: "text-brand-600",
        bg: "bg-brand-50"
    },
    {
        title: "Une IA à votre service.",
        subtitle: "Prenez votre repas en photo. Snap & Eat analyse instantanément les composants.",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-50"
    },
    {
        title: "Optimisez vos habitudes.",
        subtitle: "Recevez un FeelScore, des micro-swaps et suivez votre évolution sur la semaine.",
        icon: Heart,
        color: "text-rose-500",
        bg: "bg-rose-50"
    }
]

export default function Welcome() {
    const [currentSlide, setCurrentSlide] = useState(0)

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1)
        }
    }

    const Icon = slides[currentSlide].icon

    return (
        <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-white">
            {/* Dynamic Background Blurs */}
            <div className="absolute top-0 left-0 w-full h-[60vh] animated-gradient-bg rounded-b-[4rem] shadow-sm transform -skew-y-3 origin-top-left -mt-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 blur-3xl rounded-full"></div>
            </div>

            <div className="flex-1 flex flex-col pt-24 px-6 relative z-10">
                <div className="flex-1 flex flex-col items-center justify-center text-center">

                    <div className={`mb-12 relative w-32 h-32 flex items-center justify-center rounded-[2.5rem] shadow-2xl ${slides[currentSlide].bg} animate-in zoom-in duration-500`}>
                        <div className="absolute inset-0 bg-white/60 rounded-[2.5rem] backdrop-blur-xl border border-white/50"></div>
                        <Icon className={`w-14 h-14 relative z-10 ${slides[currentSlide].color}`} />
                    </div>

                    <div className="space-y-4 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                            {slides[currentSlide].title}
                        </h1>
                        <p className="text-lg text-gray-500 leading-relaxed font-medium px-4">
                            {slides[currentSlide].subtitle}
                        </p>
                    </div>
                </div>

                {/* Indicators */}
                <div className="flex justify-center gap-3 mb-12">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-foreground' : 'w-2 bg-gray-200'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="px-6 pb-12 pt-6 bg-white relative z-10 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.03)] border-t border-gray-50">
                {currentSlide < slides.length - 1 ? (
                    <button onClick={nextSlide} className="btn-primary w-full py-5 text-lg group">
                        Continuer <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Link to="/signup" className="btn-primary w-full py-5 text-lg flex justify-between items-center px-8">
                            <span>Créer un compte</span>
                            <ChevronRight className="w-5 h-5 opacity-70" />
                        </Link>
                        <Link to="/login" className="btn-secondary w-full py-5 text-lg border-transparent shadow-none bg-gray-50 hover:bg-gray-100">
                            Déjà membre ? Se connecter
                        </Link>
                    </div>
                )}
            </div>

        </div>
    )
}
