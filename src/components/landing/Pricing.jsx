import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from './LanguageContext'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabaseClient'

export default function Pricing() {
    const { t } = useLanguage()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async () => {
        if (!user) {
            navigate('/signup')
            return
        }

        setLoading(true)
        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId: 'price_1T490U47SpUR9TmodZR66zOl',
                    successUrl: `${window.location.origin}/success`,
                    cancelUrl: `${window.location.origin}/`,
                }
            })

            if (error) throw error

            if (data?.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Error starting checkout:', err)
            alert("Erreur lors de la création de la session de paiement.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section id="pricing" className="py-32 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-20">
                    <span className="text-brand-500 font-bold tracking-widest text-[10px] uppercase mb-4 block">{t('pr_badge')}</span>
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 text-foreground">{t('pr_title')}</h2>
                    <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">{t('pr_desc')}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                    <div className="p-10 rounded-[2.5rem] bg-[#F7F9FA] border border-gray-100/50 flex flex-col justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                        <div>
                            <h3 className="text-2xl font-extrabold tracking-tight mb-2 text-foreground">{t('pr_free_title')}</h3>
                            <p className="text-gray-500 font-medium mb-8">{t('pr_free_desc')}</p>
                            <div className="mb-10">
                                <span className="text-5xl font-extrabold text-foreground tracking-tighter">0€</span>
                                <span className="text-gray-400 font-bold">{t('pr_free_mo')}</span>
                            </div>

                            <ul className="space-y-4 mb-12">
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                    {t('pr_free_f1')}
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                    {t('pr_free_f2')}
                                </li>
                                <li className="flex items-center gap-3 text-gray-600 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                    {t('pr_free_f3')}
                                </li>
                            </ul>
                        </div>
                        <Link to="/welcome" className="w-full py-4 text-center rounded-2xl bg-white border border-gray-200 text-foreground font-bold hover:bg-gray-50 active:scale-95 transition-all">{t('pr_free_cta')}</Link>
                    </div>

                    <div className="relative rounded-[2.5rem] overflow-hidden p-[2px] shadow-2xl hover:scale-[1.02] transition-transform duration-500 group">
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,#38bbbf_360deg)] animate-[spin_4s_linear_infinite]"></div>
                        <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent_0_340deg,#f9836b_360deg)] animate-[spin_4s_linear_infinite]"></div>

                        <div className="relative h-full bg-foreground rounded-[2.4rem] p-10 flex flex-col justify-between z-10 selection:bg-brand-500/30">

                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[60px] pointer-events-none rounded-full group-hover:bg-brand-500/20 transition-colors duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 blur-[60px] pointer-events-none rounded-full group-hover:bg-accent-500/20 transition-colors duration-1000"></div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-2xl font-extrabold tracking-tight text-white">{t('pr_pro_title')}</h3>
                                    <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{t('pr_pro_badge')}</span>
                                    </div>
                                </div>
                                <p className="text-gray-400 font-medium mb-8">{t('pr_pro_desc')}</p>
                                <div className="mb-10 text-white">
                                    <span className="text-5xl font-extrabold tracking-tighter">12€</span>
                                    <span className="text-gray-400 font-bold">{t('pr_pro_mo')}</span>
                                </div>

                                <ul className="space-y-4 mb-12">
                                    <li className="flex items-center gap-3 text-gray-300 font-medium tracking-wide">
                                        <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                        {t('pr_pro_f1')}
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-300 font-medium tracking-wide">
                                        <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                        {t('pr_pro_f2')}
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-300 font-medium tracking-wide">
                                        <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 flex-shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                        {t('pr_pro_f3')}
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-300 font-medium tracking-wide">
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0"><Check className="w-3.5 h-3.5" /></div>
                                        {t('pr_pro_f4')}
                                    </li>
                                </ul>
                            </div>
                            <button onClick={handleSubscribe} disabled={loading} className="w-full py-4 text-center rounded-2xl bg-white text-foreground font-extrabold hover:bg-gray-100 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-70">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin text-brand-500" /> : <>{t('pr_pro_cta')} <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
