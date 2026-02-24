import { motion } from 'framer-motion'
import { Flame, Activity, Heart, CheckCircle2 } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export default function Insights() {
    const { t } = useLanguage()
    return (
        <section className="py-32 bg-[#F7F9FA] relative">
            <div className="max-w-7xl mx-auto px-6">

                <div className="mb-20">
                    <span className="text-accent-500 font-bold tracking-widest text-[10px] uppercase mb-4 block">{t('ins_badge')}</span>
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground max-w-2xl">
                        {t('ins_title')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                    <BentoCard className="md:col-span-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-300/10 rounded-full blur-[80px] -z-10 transition-transform duration-1000 group-hover:scale-110"></div>
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                            <Flame className="w-6 h-6 text-brand-500" />
                        </div>
                        <h3 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">{t('ins_1_title')}</h3>
                        <p className="text-gray-500 font-medium max-w-md">{t('ins_1_desc')}</p>

                        <div className="absolute bottom-6 right-6 text-8xl font-extrabold text-foreground/5 tracking-tighter pointer-events-none">GLW</div>
                    </BentoCard>

                    <BentoCard className="bg-foreground text-background relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-12 h-12 bg-white/10 rounded-[1rem] flex items-center justify-center mb-6">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight mb-2">{t('ins_2_title')}</h3>
                        <p className="text-gray-400 font-medium text-sm">{t('ins_2_desc')}</p>
                    </BentoCard>

                    <BentoCard className="relative overflow-hidden group">
                        <div className="w-12 h-12 bg-accent-50 text-accent-500 rounded-[1rem] flex items-center justify-center mb-6">
                            <Heart className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight text-foreground mb-2">{t('ins_3_title')}</h3>
                        <p className="text-gray-500 font-medium text-sm">{t('ins_3_desc')}</p>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-300/10 rounded-tl-full -z-10 group-hover:scale-125 transition-transform duration-700 delay-100"></div>
                    </BentoCard>

                    <BentoCard className="md:col-span-2 relative border border-gray-100/50 flex flex-col justify-end p-8 bg-gradient-to-tr from-white to-brand-50/30 overflow-hidden">
                        <div className="absolute top-8 right-8 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-8 h-8 text-brand-500" />
                        </div>
                        <h3 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">{t('ins_4_title')}</h3>
                        <p className="text-gray-500 font-medium max-w-sm">{t('ins_4_desc')}</p>
                    </BentoCard>

                </div>
            </div>
        </section>
    )
}

function BentoCard({ children, className = "" }) {
    return (
        <motion.div
            whileHover={{ scale: 1.01, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/5 ${className}`}
        >
            {children}
        </motion.div>
    )
}
