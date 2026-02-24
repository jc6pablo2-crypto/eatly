import { motion } from 'framer-motion'
import { ScanLine, BrainCircuit, Sparkles } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export default function Process() {
    const { t } = useLanguage()
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    }

    return (
        <section id="process" className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-24 max-w-2xl mx-auto">
                    <span className="text-brand-500 font-bold tracking-widest text-[10px] uppercase mb-4 block">{t('proc_badge')}</span>
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 text-foreground">{t('proc_title')}</h2>
                    <p className="text-xl text-gray-500 font-medium">{t('proc_desc')}</p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-3 gap-8 relative"
                >
                    <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-brand-100 via-accent-200 to-brand-100 -z-10"></div>

                    <StepCard
                        num="01"
                        title={t('proc_1_title')}
                        desc={t('proc_1_desc')}
                        icon={ScanLine}
                        color="brand"
                    />
                    <StepCard
                        num="02"
                        title={t('proc_2_title')}
                        desc={t('proc_2_desc')}
                        icon={BrainCircuit}
                        color="accent"
                    />
                    <StepCard
                        num="03"
                        title={t('proc_3_title')}
                        desc={t('proc_3_desc')}
                        icon={Sparkles}
                        color="brand"
                    />
                </motion.div>
            </div>
        </section>
    )
}

function StepCard({ num, title, desc, icon: Icon, color }) {
    const isBrand = color === 'brand'
    return (
        <motion.div variants={{ hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } } }} whileHover={{ y: -10, scale: 1.02 }} className={`flex flex-col p-8 md:p-10 rounded-[2.5rem] border border-gray-100/50 bg-[#F7F9FA]/50 backdrop-blur-xl relative z-10 transition-shadow duration-500 hover:shadow-2xl ${isBrand ? 'hover:shadow-brand-500/10' : 'hover:shadow-accent-500/10'}`}>
            <div className="flex items-end justify-between mb-12">
                <div className={`w-20 h-20 ${isBrand ? 'bg-brand-50 text-brand-500' : 'bg-accent-50 text-accent-500'} rounded-[1.5rem] flex items-center justify-center shadow-sm relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent"></div>
                    <Icon className="w-8 h-8 relative z-10" />
                </div>
                <span className="text-5xl font-extrabold text-foreground/5 tracking-tighter">{num}</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight mb-4 text-foreground">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
        </motion.div>
    )
}
