import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, Quote } from 'lucide-react'
import { useRef } from 'react'
import { useLanguage } from './LanguageContext'

export default function Testimonials() {
    const targetRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    })
    const { t } = useLanguage()

    const x1 = useTransform(scrollYProgress, [0, 1], [0, -300])
    const x2 = useTransform(scrollYProgress, [0, 1], [-300, 0])

    const row1 = [
        { name: "Sarah Jenkins", role: t('role_coach'), text: t('test_1'), img: "41" },
        { name: "Marc Dubois", role: t('role_entrepreneur'), text: t('test_2'), img: "32" },
        { name: "Elena Rossi", role: t('role_nutri'), text: t('test_3'), img: "45" },
        { name: "James Lin", role: t('role_designer'), text: t('test_4'), img: "11" },
    ]

    const row2 = [
        { name: "Alex Costa", role: t('role_athlete'), text: t('test_5'), img: "22" },
        { name: "Nina Kraviz", role: t('role_dev'), text: t('test_6'), img: "33" },
        { name: "Chloe Smith", role: t('role_student'), text: t('test_7'), img: "16" },
        { name: "David Kim", role: t('role_doc'), text: t('test_8'), img: "15" },
    ]

    return (
        <section ref={targetRef} className="py-32 bg-[#F7F9FA] relative overflow-hidden">
            <div className="absolute top-0 right-1/3 w-96 h-96 bg-accent-100/40 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
                <span className="text-brand-500 font-bold tracking-widest text-[10px] uppercase mb-4 block">{t('test_badge')}</span>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground mb-4">{t('test_title')}</h2>
                <p className="text-xl text-gray-500 font-medium">{t('test_desc')}</p>
            </div>

            <div className="flex flex-col gap-6 w-full overflow-hidden">
                <motion.div style={{ x: x1 }} className="flex gap-6 w-[200vw] px-6">
                    {row1.map((item, i) => <ReviewCard key={`r1-${i}`} {...item} />)}
                    {row1.map((item, i) => <ReviewCard key={`r1-dup-${i}`} {...item} />)}
                </motion.div>

                <motion.div style={{ x: x2 }} className="flex gap-6 w-[200vw] px-6">
                    {row2.map((item, i) => <ReviewCard key={`r2-${i}`} {...item} />)}
                    {row2.map((item, i) => <ReviewCard key={`r2-dup-${i}`} {...item} />)}
                </motion.div>
            </div>
        </section>
    )
}

function ReviewCard({ name, role, text, img }) {
    return (
        <div className="w-[400px] shrink-0 bg-white rounded-[2rem] p-8 border border-white hover:border-brand-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500 cursor-default group relative overflow-hidden">
            <div className="absolute top-6 right-8 opacity-5 text-brand-500 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                <Quote size={80} />
            </div>

            <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="w-4 h-4 text-accent-400 fill-accent-400" />)}
            </div>

            <p className="text-foreground font-medium italic leading-relaxed mb-8 relative z-10">"{text}"</p>

            <div className="flex items-center gap-4 relative z-10">
                <img src={`https://i.pravatar.cc/150?img=${img}`} alt={name} className="w-12 h-12 rounded-full border border-gray-100 object-cover" />
                <div>
                    <h4 className="font-extrabold text-foreground text-sm tracking-tight">{name}</h4>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{role}</p>
                </div>
            </div>
        </div>
    )
}
