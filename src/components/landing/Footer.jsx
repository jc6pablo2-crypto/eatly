import { Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from './LanguageContext'

export default function Footer() {
    const { t } = useLanguage()

    return (
        <footer className="relative bg-foreground overflow-hidden">

            <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-brand-500/20 blur-[150px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4 mix-blend-screen"></div>
            <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-accent-500/15 blur-[120px] rounded-full pointer-events-none -translate-x-1/4 translate-y-1/4 mix-blend-screen"></div>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 relative z-10">

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

                <div className="text-center mb-24 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        viewport={{ once: true }}
                        className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center mb-10 border border-white/10 shadow-2xl"
                    >
                        <Sparkles className="w-10 h-10 text-brand-400" />
                    </motion.div>

                    <h2 className="text-5xl md:text-8xl font-extrabold tracking-tighter text-white mb-6">
                        {t('foot_title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">Glow.</span>
                    </h2>

                    <p className="text-xl text-gray-400 font-medium mb-12 max-w-2xl">
                        {t('foot_desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/welcome" className="group px-10 py-5 bg-white text-foreground rounded-full font-extrabold text-xl shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                            {t('foot_cta')}
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </motion.div>
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-12 border-t border-white/10 pt-16 flex-wrap">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                <svg viewBox="0 0 100 100" className="w-8 h-8">
                                    <defs>
                                        <linearGradient id="logoGradFoot" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#38bbbf" />
                                            <stop offset="100%" stopColor="#f9836b" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M50 95 C 50 95, 10 65, 10 35 C 10 15, 30 5, 50 20 C 70 5, 90 15, 90 35 C 90 65, 50 95, 50 95 Z" fill="url(#logoGradFoot)" />
                                    <path d="M25 45 Q 50 20 75 35 Q 50 60 25 45 Z" fill="#ffffff" opacity="0.9" />
                                    <path d="M32 43 Q 50 28 68 37 Q 50 52 32 43 Z" fill="url(#logoGradFoot)" opacity="0.8" />
                                </svg>
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-white">Eatly</span>
                        </div>
                        <p className="text-gray-400 font-medium text-sm max-w-sm mb-8 leading-relaxed">
                            {t('foot_disclaimer')}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-extrabold tracking-tight mb-6 uppercase text-[10px]">{t('foot_prod')}</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            <li><a href="#hero" className="hover:text-brand-400 transition-colors">{t('nav_vision')}</a></li>
                            <li><a href="#process" className="hover:text-brand-400 transition-colors">{t('nav_intel')}</a></li>
                            <li><a href="#pricing" className="hover:text-brand-400 transition-colors">{t('nav_pricing')}</a></li>
                            <li><Link to="/login" className="hover:text-brand-400 transition-colors">{t('nav_login')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-extrabold tracking-tight mb-6 uppercase text-[10px]">{t('foot_legal')}</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">{t('foot_link_privacy')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('foot_link_terms')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('foot_link_data')}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mt-16 pt-8 border-t border-white/5 text-gray-500 text-xs font-medium">
                    <p>{t('foot_copyright')}</p>
                    <p>{t('foot_design')}</p>
                </div>
            </div>
        </footer>
    )
}
