import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { Bell, Flame, Droplets, Utensils, Loader2 } from 'lucide-react'
import { getUserMeals } from '../lib/api'

export default function HistoryTab({ onSeeAll, onSelectMeal }) {
    const { user } = useAuth()
    const userName = user?.email?.split('@')[0] || 'Utilisateur'
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user) return
            try {
                // Fetch recent meals
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

    // Calculate arc rotation (from -45deg empty, to +135deg full)
    const calPercentage = Math.min(totals.cal / GOALS.cal, 1)
    const arcRotation = -45 + (180 * calPercentage)

    // Generate week days dynamically
    const generateWeek = () => {
        const days = []
        for (let i = 0; i < 5; i++) {
            const d = new Date()
            d.setDate(d.getDate() - (2 - i)) // Center is today (idx 2)
            days.push({
                day: d.toLocaleString('en-US', { weekday: 'short' })[0],
                date: d.getDate().toString().padStart(2, '0'),
                active: i === 2
            })
        }
        return days
    }
    const weekDays = generateWeek()

    return (
        <div className="flex flex-col min-h-screen bg-[#F7F9FA] px-6 pt-12 pb-10">

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-gray-400 font-semibold mb-1 text-[15px]">{today.toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'long' })}</p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground capitalize">Bonjour {userName}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-foreground active:scale-95 transition-transform">
                        <Bell className="w-5 h-5 fill-transparent" />
                    </button>
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                        <div className="w-6 h-6 bg-rose-200 rounded-sm"></div>
                    </div>
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
                    {/* Background Arc */}
                    <div className="absolute inset-0 border-[18px] border-gray-100 rounded-t-full border-b-0"></div>
                    {/* Progress Arc */}
                    <div className="absolute inset-0 border-[18px] border-blue-500 rounded-t-full border-b-0 origin-bottom transition-all duration-1000 ease-out"
                        style={{ transform: `rotate(${arcRotation}deg)`, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>

                    {/* Center Stats */}
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
            {/* Fake Circular Background Image for styling */}
            <div className={`absolute top-0 right-0 w-32 h-full ${imgBg} rounded-l-[100px] border-l-4 border-white translate-x-4`}></div>

            <div className="relative z-10 w-2/3">
                <h4 className="text-[20px] font-extrabold text-foreground tracking-tight mb-1 capitalize line-clamp-1">{title}</h4>
                <p className="text-[13px] text-gray-400 font-medium leading-tight pr-4 mb-4 line-clamp-2 capitalize">{desc}</p>
                <div className={`inline-flex px-3 py-1 rounded-lg ${kcalColor} text-[13px] font-bold`}>
                    {kcal}
                </div>
            </div>

            {/* Ingredient micro-icons at bottom */}
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
