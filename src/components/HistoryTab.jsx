import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { Bell, Flame, Droplets, Utensils, Loader2, User, X, Sparkles, Lightbulb, Zap } from 'lucide-react'
import { getUserMeals } from '../lib/api'

export default function HistoryTab({ onSeeAll, onSelectMeal, onShowProfile }) {
    const { user, profile } = useAuth()
    const displayName = profile?.first_name || user?.email?.split('@')[0] || 'Utilisateur'
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [showNotifications, setShowNotifications] = useState(false)

    useEffect(() => {
        async function load() {
            if (!user) return
            try {
                const data = await getUserMeals(user.id, 20)
                setMeals(data || [])
            } catch (e) {
                console.error("Failed to load history", e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    // Filter today's meals
    const today = new Date()
    const todayMeals = meals.filter(m => {
        const d = new Date(m.created_at)
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    })

    // Calculate totals based on actual AI analysis macros
    const totals = todayMeals.reduce((acc, meal) => {
        const macros = meal.meal_analysis?.[0]?.result?.macros || { calories: 0, carbs_g: 0, protein_g: 0, fat_g: 0 }
        return {
            cal: acc.cal + macros.calories,
            carbs: acc.carbs + macros.carbs_g,
            protein: acc.protein + macros.protein_g,
            fat: acc.fat + macros.fat_g
        }
    }, { cal: 0, carbs: 0, protein: 0, fat: 0 })

    const GOALS = { cal: 2200, carbs: 250, fat: 70, protein: 140 }

    const calPercentage = Math.min(totals.cal / GOALS.cal, 1)
    const arcRotation = -45 + (180 * calPercentage)

    const generateWeek = () => {
        const days = []
        for (let i = 0; i < 5; i++) {
            const d = new Date()
            d.setDate(d.getDate() - (2 - i))
            days.push({
                day: d.toLocaleString('en-US', { weekday: 'short' })[0],
                date: d.getDate().toString().padStart(2, '0'),
                active: i === 2
            })
        }
        return days
    }
    const weekDays = generateWeek()

    // Generate AI recommendations based on meal data
    const getRecommendations = () => {
        const recs = []
        if (todayMeals.length === 0) {
            recs.push({ icon: Zap, title: 'Commencez votre journée', desc: 'Scannez votre premier repas pour obtenir des insights nutritionnels personnalisés.', color: 'bg-blue-50', iconColor: 'text-blue-500' })
        }
        if (totals.protein < GOALS.protein * 0.5 && todayMeals.length > 0) {
            recs.push({ icon: Flame, title: 'Protéines insuffisantes', desc: `Vous êtes à ${Math.round(totals.protein)}g/${GOALS.protein}g. Pensez à ajouter des œufs, poulet ou légumineuses.`, color: 'bg-orange-50', iconColor: 'text-orange-500' })
        }
        if (totals.cal > GOALS.cal * 0.8 && todayMeals.length > 0) {
            recs.push({ icon: Lightbulb, title: 'Objectif calorique bientôt atteint', desc: `Il vous reste ${Math.max(0, GOALS.cal - totals.cal)} kcal. Optez pour un repas léger ce soir.`, color: 'bg-emerald-50', iconColor: 'text-emerald-500' })
        }
        if (totals.fat > GOALS.fat * 0.9 && todayMeals.length > 0) {
            recs.push({ icon: Sparkles, title: 'Lipides élevés', desc: `${Math.round(totals.fat)}g/${GOALS.fat}g consommés. Privilégiez les aliments faibles en gras pour la suite.`, color: 'bg-purple-50', iconColor: 'text-purple-500' })
        }
        // Always show a general tip
        recs.push({ icon: Sparkles, title: 'Hydratation', desc: 'N\'oubliez pas de boire au moins 2L d\'eau aujourd\'hui pour optimiser votre métabolisme.', color: 'bg-brand-50', iconColor: 'text-brand-500' })
        return recs
    }

    return (
        <div className="flex flex-col bg-[#F7F9FA] px-6 pt-12 pb-10 relative">

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-sm">
                                <defs>
                                    <linearGradient id="logoGradHist" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#38bbbf" />
                                        <stop offset="100%" stopColor="#f9836b" />
                                    </linearGradient>
                                </defs>
                                <path d="M50 95 C 50 95, 10 65, 10 35 C 10 15, 30 5, 50 20 C 70 5, 90 15, 90 35 C 90 65, 50 95, 50 95 Z" fill="url(#logoGradHist)" />
                                <path d="M25 45 Q 50 20 75 35 Q 50 60 25 45 Z" fill="#ffffff" opacity="0.9" />
                                <path d="M32 43 Q 50 28 68 37 Q 50 52 32 43 Z" fill="url(#logoGradHist)" opacity="0.8" />
                            </svg>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">Eatly</span>
                    </div>
                    <p className="text-gray-400 font-semibold mb-1 text-[13px] uppercase tracking-wider">{today.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground capitalize">Bonjour {displayName}</h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* Bell — AI Notifications */}
                    <button
                        onClick={() => setShowNotifications(true)}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-foreground active:scale-95 transition-transform relative"
                    >
                        <Bell className="w-5 h-5 fill-transparent" />
                        {/* Notification dot */}
                        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent-500 rounded-full border-2 border-white"></div>
                    </button>
                    {/* Profile avatar */}
                    <button
                        onClick={() => onShowProfile && onShowProfile()}
                        className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center shadow-sm border-2 border-white active:scale-95 transition-transform"
                    >
                        <User className="w-5 h-5 text-brand-600" />
                    </button>
                </div>
            </div>

            {/* Week Calendar */}
            <div className="flex justify-between items-center mb-8 px-2">
                {weekDays.map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col items-center justify-center w-14 h-20 rounded-full transition-all duration-300 ${item.active ? 'bg-foreground text-white shadow-xl scale-110' : 'text-gray-400'}`}
                    >
                        <span className={`text-xs font-bold mb-1 ${item.active ? 'text-gray-300' : 'text-gray-400'}`}>{item.day}</span>
                        <span className={`text-lg font-extrabold ${item.active ? 'text-white' : 'text-foreground'}`}>{item.date}</span>
                    </div>
                ))}
            </div>

            {/* Main Metric Card */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-10 flex flex-col items-center relative overflow-hidden z-10">

                {/* Semi-circular Progress */}
                <div className="relative w-48 h-24 mb-6 mt-4">
                    <div className="absolute inset-0 border-[18px] border-gray-100 rounded-t-full border-b-0"></div>
                    <div className="absolute inset-0 border-[18px] border-blue-500 rounded-t-full border-b-0 origin-bottom transition-all duration-1000 ease-out"
                        style={{ transform: `rotate(${arcRotation}deg)`, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>

                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center translate-y-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-1 shadow-sm border border-white relative -top-8">
                            <Flame className="w-4 h-4 text-blue-500 fill-blue-500" />
                        </div>
                        <span className="text-4xl font-extrabold text-foreground tracking-tight leading-none mb-1">{Math.max(0, GOALS.cal - totals.cal)}</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">kcal Restantes</span>
                    </div>
                </div>

                {/* Macros */}
                <div className="flex justify-between w-full mt-6 px-2">
                    <MacroBar label="Glucides" current={totals.carbs} max={GOALS.carbs} color="bg-orange-400" />
                    <MacroBar label="Lipides" current={totals.fat} max={GOALS.fat} color="bg-brand-500" />
                    <MacroBar label="Protéines" current={totals.protein} max={GOALS.protein} color="bg-blue-500" />
                </div>
            </div>

            <div className="flex justify-between items-end mb-6">
                <h3 className="text-[1.35rem] font-bold text-foreground tracking-tight">Repas d'aujourd'hui</h3>
                <button onClick={onSeeAll} className="text-blue-500 text-sm font-bold mb-1 active:scale-95 transition-transform">Tout voir</button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 snap-x hide-scrollbar">
                {loading ? (
                    <div className="w-full flex justify-center py-6"><Loader2 className="animate-spin text-brand-500 w-8 h-8" /></div>
                ) : todayMeals.length === 0 ? (
                    <div className="w-full bg-white rounded-3xl p-6 shadow-sm text-center text-gray-400 font-medium">
                        Aucun repas scanné aujourd'hui.<br />Appuyez sur Scanner pour commencer !
                    </div>
                ) : (
                    todayMeals.map((meal, index) => {
                        const ai = meal.meal_analysis?.[0]?.result
                        const comps = ai?.components || []
                        const mainName = comps[0]?.name || "Repas sain"
                        const desc = comps.map(c => c.name).join(', ')
                        const kcal = ai?.macros?.calories || 0
                        const colors = ['bg-amber-50', 'bg-blue-50', 'bg-brand-50', 'bg-rose-50']
                        const txtColors = ['text-yellow-800 bg-yellow-100', 'text-blue-800 bg-blue-100', 'text-brand-800 bg-brand-100', 'text-rose-800 bg-rose-100']

                        return (
                            <MealCard
                                key={meal.id}
                                title={mainName}
                                desc={desc}
                                kcal={`${kcal} kcal`}
                                kcalColor={txtColors[index % 4]}
                                imgBg={colors[index % 4]}
                                componentsCount={comps.length}
                                onClick={() => onSelectMeal && onSelectMeal(meal)}
                            />
                        )
                    })
                )}
            </div>

            {/* ===== AI NOTIFICATION DRAWER ===== */}
            {showNotifications && (
                <div className="fixed inset-0 z-[200]">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowNotifications(false)}></div>

                    {/* Drawer */}
                    <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[75vh] overflow-y-auto hide-scrollbar">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-brand-500" />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-foreground text-lg">Recommandations IA</h2>
                                    <p className="text-xs text-gray-400 font-medium">Basées sur vos repas d'aujourd'hui</p>
                                </div>
                            </div>
                            <button onClick={() => setShowNotifications(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center active:scale-95">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="px-6 pb-8 space-y-3">
                            {getRecommendations().map((rec, i) => (
                                <div key={i} className={`flex items-start gap-3 rounded-2xl p-4 ${rec.color} border border-white/50`}>
                                    <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 ${rec.iconColor}`}>
                                        <rec.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm mb-0.5">{rec.title}</h4>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{rec.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

function MacroBar({ label, current, max, color }) {
    const percentage = Math.min((parseInt(current) / parseInt(max)) * 100, 100)

    return (
        <div className="flex flex-col items-center w-1/3 px-2">
            <span className="text-[13px] font-bold text-foreground mb-2">{label}</span>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">
                {current}/{max}g
            </span>
        </div>
    )
}

function MealCard({ title, desc, kcal, kcalColor, imgBg, componentsCount, onClick }) {
    return (
        <button onClick={onClick} className="text-left bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-w-[280px] snap-center flex flex-col justify-between relative overflow-hidden h-[200px] active:scale-[0.98] transition-transform">
            <div className={`absolute top-0 right-0 w-32 h-full ${imgBg} rounded-l-[100px] border-l-4 border-white translate-x-4`}></div>

            <div className="relative z-10 w-2/3">
                <h4 className="text-[20px] font-extrabold text-foreground tracking-tight mb-1 capitalize line-clamp-1">{title}</h4>
                <p className="text-[13px] text-gray-400 font-medium leading-tight pr-4 mb-4 line-clamp-2 capitalize">{desc}</p>
                <div className={`inline-flex px-3 py-1 rounded-lg ${kcalColor} text-[13px] font-bold`}>
                    {kcal}
                </div>
            </div>

            <div className="relative z-10 flex -space-x-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-brand-100 border-2 border-white flex items-center justify-center shadow-sm">
                    <Droplets className="w-4 h-4 text-brand-500" />
                </div>
                <div className="w-8 h-8 rounded-full bg-foreground border-2 border-white flex items-center justify-center shadow-sm">
                    <Utensils className="w-4 h-4 text-white" />
                </div>
                {componentsCount > 2 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center shadow-sm text-[10px] font-bold text-gray-500">
                        +{componentsCount - 2}
                    </div>
                )}
            </div>
        </button>
    )
}
