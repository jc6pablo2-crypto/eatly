import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, Flame, ScanLine, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import { useLanguage } from './LanguageContext'

export default function HeroSection() {
    const targetRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    })
    const { t } = useLanguage()

    const y = useTransform(scrollYProgress, [0, 1], [0, 300])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 20, stiffness: 50, mass: 1 }
    const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-50, 50]), springConfig)
    const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-50, 50]), springConfig)
    const glowXAlt = useSpring(useTransform(mouseX, [-0.5, 0.5], [50, -50]), springConfig)
    const glowYAlt = useSpring(useTransform(mouseY, [-0.5, 0.5], [50, -50]), springConfig)

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e
            const x = clientX / window.innerWidth - 0.5
            const y = clientY / window.innerHeight - 0.5
            mouseX.set(x)
            mouseY.set(y)
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }
    const textVariants = { hidden: { y: "150%" }, visible: { y: "0%", transition: { type: 'spring', stiffness: 80, damping: 20 } } }

    return (
        <section id="hero" ref={targetRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 min-h-screen">

            <motion.div style={{ x: glowX, y: glowY }} className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-brand-300/20 rounded-full blur-[120px] pointer-events-none -z-10" />
            <motion.div style={{ x: glowXAlt, y: glowYAlt }} className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-accent-300/20 rounded-full blur-[120px] pointer-events-none -z-10" />

            <motion.div className="flex-1 text-center md:text-left z-10" variants={containerVariants} initial="hidden" animate="visible">
                <div className="overflow-hidden mb-6 inline-block">
                    <motion.div variants={textVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-100 shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-brand-500 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        </span>
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">{t('hero_badge')}</span>
                    </motion.div>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-6 text-foreground flex flex-col">
                    <div className="overflow-hidden"><motion.span variants={textVariants} className="block pb-2">{t('hero_title1')}</motion.span></div>
                    <div className="overflow-hidden">
                        <motion.span variants={textVariants} className="block">{t('hero_title2')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Glow.</span></motion.span>
                    </div>
                </h1>

                <div className="overflow-hidden">
                    <motion.p variants={textVariants} className="text-lg md:text-xl text-gray-500 font-medium mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed">
                        {t('hero_desc')}
                    </motion.p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    <Link to="/welcome" className="relative group overflow-hidden w-full sm:w-auto px-8 py-4 bg-foreground text-background rounded-full font-bold text-lg shadow-[0_8px_30px_rgba(28,34,43,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span className="relative z-10 flex items-center gap-2 tracking-tight">{t('hero_cta1')} <ArrowRight className="w-5 h-5" /></span>
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </Link>
                </div>
            </motion.div>

            <motion.div className="flex-1 relative w-full max-w-md mx-auto perspective-[2500px] z-10 hidden md:block" style={{ y, opacity }}>
                <motion.div animate={{ y: [0, -25, 0], rotateX: [12, 18, 12], rotateY: [-18, -12, -18] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="relative w-full aspect-[1/2.1] rounded-[3.5rem] bg-white border-[12px] border-[#1C222B] shadow-2xl overflow-hidden preserve-3d group ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-[#F7F9FA] p-6 pt-12 flex flex-col pointer-events-none">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{t('hero_mockup_today')}</h2>
                                <p className="text-xs text-brand-500 font-bold uppercase tracking-widest mt-1">{t('hero_mockup_profile')}</p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Flame className="w-6 h-6 text-accent-500 fill-accent-500/20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center mb-6 relative overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-gray-50">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
                            <div className="relative text-5xl font-extrabold z-10 text-foreground tracking-tighter">88<span className="text-2xl text-gray-300">/100</span></div>
                            <div className="text-xs font-bold text-gray-400 z-10 uppercase tracking-widest mt-2">{t('hero_mockup_score')}</div>
                            <div className="w-full h-2 bg-gray-50 rounded-full mt-8 overflow-hidden z-10 relative">
                                <div className="absolute left-0 top-0 bottom-0 w-[88%] bg-gradient-to-r from-brand-400 to-accent-400 rounded-full"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('hero_mockup_protein')}</span>
                                <div className="text-2xl font-extrabold text-foreground tracking-tight mt-1">112<span className="text-sm text-gray-300">g</span></div>
                            </div>
                            <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('hero_mockup_carbs')}</span>
                                <div className="text-2xl font-extrabold text-foreground tracking-tight mt-1">180<span className="text-sm text-gray-300">g</span></div>
                            </div>
                        </div>
                    </div>

                    <motion.div initial={{ z: 20, x: -20, opacity: 0 }} animate={{ z: 150, x: -60, opacity: 1 }} transition={{ delay: 0.6, duration: 1.2, type: "spring" }} className="absolute top-1/4 -left-16 bg-white/80 text-foreground backdrop-blur-2xl p-4 rounded-[1.5rem] shadow-2xl border border-white/60 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100">
                            <ScanLine className="w-6 h-6 text-brand-500" />
                        </div>
                        <div className="flex flex-col pr-4">
                            <span className="text-[16px] font-extrabold tracking-tight">+450 kcal</span>
                            <span className="text-[11px] text-gray-500 font-medium">{t('hero_mockup_toast')}</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ z: 30, x: 20, opacity: 0 }} animate={{ z: 120, x: 60, opacity: 1 }} transition={{ delay: 0.9, duration: 1.2, type: "spring" }} className="absolute bottom-[30%] -right-16 bg-white/80 text-foreground backdrop-blur-2xl p-4 rounded-[1.5rem] shadow-2xl border border-white/60 flex items-center gap-4">
                        <div className="flex flex-col pl-4 items-end">
                            <span className="text-[16px] font-extrabold tracking-tight text-accent-500">{t('hero_mockup_opt')}</span>
                            <span className="text-[11px] text-gray-500 font-medium">{t('hero_mockup_hyd')}</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-accent-50 flex items-center justify-center border border-accent-100">
                            <Activity className="w-6 h-6 text-accent-500" />
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    )
}
