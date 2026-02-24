import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'

export default function Nav() {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)
    const { lang, changeLanguage, t } = useLanguage()

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setIsScrolled(latest > 50)
        })
    }, [scrollY])

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-gray-100/50 shadow-sm' : 'bg-transparent border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 relative group cursor-pointer">
                    <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                        <svg viewBox="0 0 100 100" className="w-9 h-9 drop-shadow-md">
                            <defs>
                                <linearGradient id="logoGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#38bbbf" />
                                    <stop offset="100%" stopColor="#f9836b" />
                                </linearGradient>
                            </defs>
                            <path d="M50 95 C 50 95, 10 65, 10 35 C 10 15, 30 5, 50 20 C 70 5, 90 15, 90 35 C 90 65, 50 95, 50 95 Z" fill="url(#logoGradNav)" />
                            <path d="M25 45 Q 50 20 75 35 Q 50 60 25 45 Z" fill="#ffffff" opacity="0.9" />
                            <path d="M32 43 Q 50 28 68 37 Q 50 52 32 43 Z" fill="url(#logoGradNav)" opacity="0.8" />
                        </svg>
                    </div>
                    <span className="text-[1.75rem] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">Eatly</span>
                </div>

                <div className="flex items-center gap-8 hidden md:flex">
                    <a href="#hero" className="text-gray-500 font-bold hover:text-brand-600 transition-colors">{t('nav_vision')}</a>
                    <a href="#process" className="text-gray-500 font-bold hover:text-brand-600 transition-colors">{t('nav_intel')}</a>
                    <a href="#pricing" className="text-gray-500 font-bold hover:text-brand-600 transition-colors">{t('nav_pricing')}</a>
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Selector */}
                    <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/50 hover:bg-gray-100/80 rounded-full transition-colors hidden sm:flex border border-gray-100">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <select
                            value={lang}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="bg-transparent text-foreground font-bold text-sm cursor-pointer outline-none appearance-none pr-2"
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>

                    <Link to="/login" className="hidden lg:block px-4 py-2 text-foreground font-bold hover:text-brand-600 transition-colors">{t('nav_login')}</Link>
                    <Link to="/welcome" className="relative group bg-gradient-to-r from-brand-500 to-accent-500 text-white px-6 py-2.5 rounded-full font-bold shadow-xl shadow-brand-500/20 active:scale-95 transition-all overflow-hidden hidden sm:block">
                        <span className="relative z-10">{t('nav_cta')}</span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </Link>
                </div>
            </div>
        </motion.nav>
    )
}
