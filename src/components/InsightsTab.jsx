import { useState, useEffect, useMemo } from 'react'
import { Calendar, Moon, ArrowUpRight, ArrowRight, Loader2, Lock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getWeeklyMeals } from '../lib/api'
import PremiumCTA from './PremiumCTA'

export default function InsightsTab() {
    const { user, profile } = useAuth()
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)

    const isPremium = profile?.is_premium

    // Calculate dates
    const { startDate, endDate, dateLabel } = useMemo(() => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 6)
        start.setHours(0, 0, 0, 0)

        const labelStr = `${start.toLocaleString('fr-FR', { month: 'short', day: 'numeric' })} - ${end.toLocaleString('fr-FR', { month: 'short', day: 'numeric' })}`
        return { startDate: start, endDate: end, dateLabel: labelStr }
    }, [])

    useEffect(() => {
        async function load() {
            if (!user) return
            try {
                const data = await getWeeklyMeals(user.id, startDate.toISOString(), endDate.toISOString())
                setMeals(data || [])
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        load()
    }, [user, startDate, endDate])

    // Process data for charts
    const { weeklyData, overallAvgGlow, totals, recentMeals } = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startDate)
            d.setDate(d.getDate() + i)
            return {
                date: d,
                day: d.toLocaleString('fr-FR', { weekday: 'short' })[0].toUpperCase(),
                meals: [],
                isCurrent: i === 6 // Today
            }
        })

        let totalGlowSum = 0
        let totalGlowCount = 0
        let totProtein = 0, totCarbs = 0, totFat = 0

        meals.forEach(m => {
            const d = new Date(m.created_at).setHours(0, 0, 0, 0)
            const dayObj = last7Days.find(day => day.date.getTime() === d)

            // Score
            const ai = m.meal_analysis?.[0]?.result || {}
            let score = 0
            if (ai.feel_score) {
                const vals = Object.values(ai.feel_score)
                score = Math.floor(vals.reduce((a, b) => a + b, 0) / vals.length)
            }

            if (dayObj) {
                dayObj.meals.push(score)
            }
            totalGlowSum += score
            totalGlowCount++

            // Macros
            const mac = ai.macros || { protein_g: 0, carbs_g: 0, fat_g: 0 }
            totProtein += mac.protein_g
            totCarbs += mac.carbs_g
            totFat += mac.fat_g
        })

        const wData = last7Days.map(day => {
            day.value = day.meals.length > 0 ? Math.floor(day.meals.reduce((a, b) => a + b, 0) / day.meals.length) : 0
            return day
        })

        const sortedMeals = [...meals].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

        return {
            weeklyData: wData,
            overallAvgGlow: totalGlowCount > 0 ? Math.floor(totalGlowSum / totalGlowCount) : 0,
            totals: { protein: totProtein, carbs: totCarbs, fat: totFat },
            recentMeals: sortedMeals
        }
    }, [meals, startDate])

    return (
        <div className="flex flex-col bg-[#F7F9FA] px-6 pt-12 pb-10">

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-gray-400 font-semibold mb-1">Votre Progression</p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Glow Hebdomadaire</h1>
                </div>
                <div className="flex flex-col gap-3">
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-foreground active:scale-95 transition-transform">
                        <Moon className="w-6 h-6 fill-current" />
                    </button>
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-foreground active:scale-95 transition-transform">
                        <Calendar className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center justify-between bg-white rounded-full px-6 py-4 shadow-sm mb-6">
                <span className="text-gray-400 text-sm font-bold">&lt;</span>
                <span className="font-bold text-foreground">{dateLabel}</span>
                <span className="text-gray-400 text-sm font-bold">&gt;</span>
            </div>

            {!isPremium ? (
                <div className="mb-10 mt-6 relative z-10">
                    <PremiumCTA
                        title="Analyses Avancées"
                        description="Débloquez vos graphiques de Glow Score, vos totaux macro-nutritionnels et votre historique."
                        variant="box"
                    />
                </div>
            ) : (
                <>
                    {/* Average Glow Score Chart Card */}
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8">
                        <p className="text-gray-400 font-semibold mb-2">Score Glow Moyen</p>
                        <div className="flex items-end gap-3 mb-8">
                            <h2 className="text-5xl font-extrabold text-foreground tracking-tight">{overallAvgGlow || '--'}</h2>
                            {overallAvgGlow > 0 && (
                                <div className="flex items-center gap-1 bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 mb-1.5">
                                    <ArrowUpRight className="w-3 h-3 stroke-[3px]" />
                                    Tendance
                                </div>
                            )}
                        </div>

                        {/* Bar Chart Mockup */}
                        <div className="flex items-end justify-between h-32 px-2 relative z-10">
                            {weeklyData.map((data, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 w-8">
                                    {/* Floating tooltip simulation for current day */}
                                    {data.isCurrent && (
                                        <div className="absolute top-0 bg-foreground text-white text-xs font-bold px-2 py-1 rounded-lg">
                                            {data.value}
                                        </div>
                                    )}
                                    {/* Bar */}
                                    <div
                                        className={`w-3.5 rounded-t-full rounded-b-full transition-all duration-500 mt-auto ${data.isCurrent ? 'bg-gradient-to-t from-blue-400 to-brand-400' : 'bg-brand-200/50'}`}
                                        style={{ height: `${data.value}%` }}
                                    />
                                    <span className={`text-[11px] font-bold ${data.isCurrent ? 'text-foreground' : 'text-gray-400'}`}>
                                        {data.day}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Nutrition */}
                    <h3 className="text-lg font-bold text-foreground mb-4">Nutrition Hebdomadaire</h3>
                    <div className="flex gap-4 w-full mb-8">
                        <NutritionCard title="Protéines" value={`${totals.protein}g`} colorClass="text-blue-500" bgClass="bg-blue-50" ringColor="border-blue-500" />
                        <NutritionCard title="Glucides" value={`${totals.carbs}g`} colorClass="text-orange-500" bgClass="bg-orange-50" ringColor="border-orange-500" />
                        <NutritionCard title="Lipides" value={`${totals.fat}g`} colorClass="text-brand-500" bgClass="bg-brand-50" ringColor="border-brand-500" />
                    </div>

                    {/* Recent History */}
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-lg font-bold text-foreground">Historique Récent</h3>
                        <button className="text-brand-500 text-sm font-bold mb-0.5">Tout voir</button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="w-full flex justify-center py-6"><Loader2 className="animate-spin text-brand-500 w-8 h-8" /></div>
                        ) : recentMeals.length === 0 ? (
                            <div className="text-center text-gray-400 font-medium py-4">Aucun repas enregistré cette semaine.</div>
                        ) : (
                            recentMeals.map((meal, idx) => {
                                const ai = meal.meal_analysis?.[0]?.result || {}
                                const title = ai.components?.[0]?.name || "Repas"
                                let score = 85
                                if (ai.feel_score) {
                                    const vals = Object.values(ai.feel_score)
                                    score = Math.floor(vals.reduce((a, b) => a + b, 0) / vals.length)
                                }
                                const gBadge = score > 80 ? "Glow Élevé" : score > 50 ? "Glow Moyen" : "Glow Faible"
                                const time = new Date(meal.created_at).toLocaleString('fr-FR', { weekday: 'short', hour: 'numeric', minute: 'numeric' })
                                const colors = ['bg-brand-100', 'bg-blue-100', 'bg-rose-100', 'bg-amber-100']

                                return (
                                    <HistoryCard
                                        key={meal.id}
                                        title={<span className="capitalize">{title}</span>}
                                        sub={time}
                                        kcal={ai.macros?.calories || 0}
                                        glowBadge={gBadge}
                                        imgColor={colors[idx % 4]}
                                    />
                                )
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

function NutritionCard({ title, value, colorClass, bgClass, ringColor }) {
    return (
        <div className="flex-1 bg-white rounded-3xl p-4 flex flex-col items-center shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            {/* Fake Circular Progress */}
            <div className={`w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center relative mb-3 ${colorClass}`}>
                <div className={`absolute inset-0 rounded-full border-4 border-transparent ${ringColor} border-t-transparent border-r-transparent transform -rotate-45`}></div>
                <ArrowUpRight className={`w-4 h-4 text-current`} />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-gray-400 mb-0.5">{title}</span>
            <span className="text-[17px] font-extrabold text-foreground">{value}</span>
        </div>
    )
}

function HistoryCard({ title, sub, kcal, glowBadge, imgColor }) {
    return (
        <div className="bg-white rounded-3xl p-3 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-[1.2rem] ${imgColor} shrink-0 ring-4 ring-white shadow-sm`}></div>
            <div className="flex-1">
                <h4 className="font-bold text-foreground text-[15px]">{title}</h4>
                <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
            </div>
            <div className="flex flex-col items-end gap-1 px-2">
                {glowBadge ? (
                    <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {glowBadge}
                    </span>
                ) : (
                    <span className="text-base font-extrabold text-foreground leading-none">{kcal}</span>
                )}
                <span className="text-[10px] text-gray-400 font-bold uppercase">{glowBadge ? `${kcal} kcal` : 'kcal'}</span>
            </div>
        </div>
    )
}
