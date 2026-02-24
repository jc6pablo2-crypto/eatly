import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getUserMeals } from '../lib/api'
import { Utensils, Loader2, ChevronRight, Calendar } from 'lucide-react'
import PremiumCTA from './PremiumCTA'

export default function DiaryTab({ onSelectMeal }) {
    const { user, profile } = useAuth()
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)

    const isPremium = profile?.is_premium

    useEffect(() => {
        async function load() {
            if (!user) return
            try {
                // Fetch recent meals
                const data = await getUserMeals(user.id, 50)
                setMeals(data || [])
            } catch (e) {
                console.error("Failed to load history", e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    const formatTime = (ts) => {
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(ts))
    }

    const formatDate = (ts) => {
        const d = new Date(ts)
        if (d.toDateString() === new Date().toDateString()) return 'Today'
        return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d)
    }

    // Group meals by date
    const grouped = {}
    meals.forEach(m => {
        const d = formatDate(m.created_at)
        if (!grouped[d]) grouped[d] = []
        grouped[d].push(m)
    })

    // Separate today from past dates for free users
    const dateKeys = Object.keys(grouped)
    const todayKey = dateKeys.find(k => k === 'Today')
    const pastKeys = dateKeys.filter(k => k !== 'Today')

    return (
        <div className="flex flex-col min-h-screen bg-[#F7F9FA] px-6 pt-12 pb-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Agenda</h1>
                    <p className="text-gray-400 font-semibold mb-1 text-[15px]">Votre journal alimentaire complet</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-foreground active:scale-95 transition-transform">
                    <Calendar className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500 w-10 h-10" /></div>
            ) : meals.length === 0 ? (
                <div className="w-full bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center text-gray-400 font-medium flex flex-col items-center">
                    <Utensils className="w-12 h-12 text-gray-200 mb-4" />
                    Aucun repas enregistré pour le moment.
                </div>
            ) : (
                <div className="space-y-8 pb-10">
                    {/* Today's meals — always visible */}
                    {todayKey && (
                        <DateGroup
                            dateKey={todayKey}
                            meals={grouped[todayKey]}
                            formatTime={formatTime}
                            onSelectMeal={onSelectMeal}
                        />
                    )}

                    {/* Past meals — locked for free users */}
                    {!isPremium && pastKeys.length > 0 ? (
                        <div className="mt-2">
                            <PremiumCTA
                                title="Historique Complet"
                                description="Accédez à tous vos repas passés, tendances et statistiques en devenant Premium."
                                variant="box"
                            />
                        </div>
                    ) : (
                        pastKeys.map(dateKey => (
                            <DateGroup
                                key={dateKey}
                                dateKey={dateKey}
                                meals={grouped[dateKey]}
                                formatTime={formatTime}
                                onSelectMeal={onSelectMeal}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function DateGroup({ dateKey, meals, formatTime, onSelectMeal }) {
    return (
        <div>
            <h3 className="text-[14px] font-bold text-gray-500 tracking-wider uppercase mb-4 pl-2">{dateKey}</h3>
            <div className="space-y-4">
                {meals.map((meal) => {
                    const ai = meal.meal_analysis?.[0]?.result
                    const comps = ai?.components || []
                    const mainName = comps[0]?.name || "Repas sain"
                    const kcal = ai?.macros?.calories || 0

                    return (
                        <button
                            key={meal.id}
                            onClick={() => onSelectMeal && onSelectMeal(meal)}
                            className="w-full bg-white rounded-[1.5rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center justify-between active:scale-[0.98] transition-all text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center relative shadow-inner overflow-hidden">
                                    {meal.image_url ? (
                                        <img src={meal.image_url} alt="meal" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <Utensils className="w-6 h-6 text-brand-400" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-[16px] font-extrabold text-foreground tracking-tight capitalize line-clamp-1">{mainName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[12px] text-gray-400 font-semibold">{formatTime(meal.created_at)}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="text-[12px] text-brand-600 font-bold">{kcal} kcal</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
