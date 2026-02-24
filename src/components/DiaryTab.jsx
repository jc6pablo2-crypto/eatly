import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getUserMeals } from '../lib/api'
import { Utensils, Loader2, ChevronRight, Calendar, ChevronLeft, X } from 'lucide-react'
import PremiumCTA from './PremiumCTA'

export default function DiaryTab({ onSelectMeal }) {
    const { user, profile } = useAuth()
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState(null) // null = all, or a Date object
    const [showDatePicker, setShowDatePicker] = useState(false)

    const isPremium = profile?.is_premium

    useEffect(() => {
        async function load() {
            if (!user) return
            try {
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
        return new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', minute: 'numeric', hour12: false }).format(new Date(ts))
    }

    const formatDate = (ts) => {
        const d = new Date(ts)
        if (d.toDateString() === new Date().toDateString()) return 'Aujourd\'hui'
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
        if (d.toDateString() === yesterday.toDateString()) return 'Hier'
        return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' }).format(d)
    }

    // Apply date filter
    const filteredMeals = dateFilter
        ? meals.filter(m => {
            const d = new Date(m.created_at)
            return d.toDateString() === dateFilter.toDateString()
        })
        : meals

    // Group meals by date
    const grouped = {}
    filteredMeals.forEach(m => {
        const d = formatDate(m.created_at)
        if (!grouped[d]) grouped[d] = []
        grouped[d].push(m)
    })

    // Separate today from past dates for free users
    const dateKeys = Object.keys(grouped)
    const todayKey = dateKeys.find(k => k === 'Aujourd\'hui')
    const pastKeys = dateKeys.filter(k => k !== 'Aujourd\'hui')

    // Get unique dates from meals for the date picker
    const uniqueDates = [...new Set(meals.map(m => {
        const d = new Date(m.created_at)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
    }))].sort((a, b) => b - a).map(t => new Date(t))

    const filterLabel = dateFilter
        ? new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(dateFilter)
        : 'Tous les jours'

    return (
        <div className="flex flex-col bg-[#F7F9FA] px-6 pt-12 pb-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Agenda</h1>
                    <p className="text-gray-400 font-semibold mb-1 text-[15px]">Votre journal alimentaire</p>
                </div>
                <button
                    onClick={() => setShowDatePicker(true)}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform relative"
                >
                    <Calendar className="w-5 h-5 text-foreground" />
                    {dateFilter && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-500 rounded-full border-2 border-[#F7F9FA]"></div>}
                </button>
            </div>

            {/* Active filter pill */}
            {dateFilter && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-full text-sm font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        {filterLabel}
                        <button onClick={() => setDateFilter(null)} className="ml-1 w-5 h-5 bg-brand-200/50 rounded-full flex items-center justify-center">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-500 w-10 h-10" /></div>
            ) : filteredMeals.length === 0 ? (
                <div className="w-full bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center text-gray-400 font-medium flex flex-col items-center">
                    <Utensils className="w-12 h-12 text-gray-200 mb-4" />
                    {dateFilter ? 'Aucun repas pour cette date.' : 'Aucun repas enregistré pour le moment.'}
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

            {/* ===== DATE PICKER DRAWER ===== */}
            {showDatePicker && (
                <div className="fixed inset-0 z-[200]">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowDatePicker(false)}></div>
                    <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[60vh] overflow-y-auto hide-scrollbar">
                        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full"></div></div>
                        <div className="px-6 pb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-extrabold text-foreground text-lg">Filtrer par date</h2>
                                <button onClick={() => setShowDatePicker(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            {/* All dates button */}
                            <button
                                onClick={() => { setDateFilter(null); setShowDatePicker(false) }}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 mb-2 transition-all active:scale-[0.98] ${!dateFilter ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 bg-white'}`}
                            >
                                <span className={`font-bold text-sm ${!dateFilter ? 'text-brand-600' : 'text-foreground'}`}>Tous les jours</span>
                                <span className="text-xs text-gray-400 font-medium">{meals.length} repas</span>
                            </button>

                            {/* Individual dates */}
                            <div className="space-y-2">
                                {uniqueDates.map((d, i) => {
                                    const count = meals.filter(m => new Date(m.created_at).toDateString() === d.toDateString()).length
                                    const isActive = dateFilter && dateFilter.toDateString() === d.toDateString()
                                    const label = formatDate(d.toISOString())

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => { setDateFilter(d); setShowDatePicker(false) }}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${isActive ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 bg-white'}`}
                                        >
                                            <span className={`font-bold text-sm capitalize ${isActive ? 'text-brand-600' : 'text-foreground'}`}>{label}</span>
                                            <span className="text-xs text-gray-400 font-medium">{count} repas</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
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
