import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Settings, ChevronLeft, Edit2, CheckCircle2, Flame, Sun, ScanLine, User, Heart, Utensils, Watch, ChevronRight, Loader2 } from 'lucide-react'

export default function SettingsTab() {
    const { user, profile } = useAuth()
    const [stats, setStats] = useState({ streak: 0, glow: 0, scanned: 0 })
    const [loadingStats, setLoadingStats] = useState(true)

    useEffect(() => {
        async function loadStats() {
            if (!user) return
            try {
                const { data: meals } = await supabase
                    .from('meals')
                    .select('created_at, meal_analysis(result)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (!meals) return

                const scanned = meals.length

                let totalGlow = 0
                let totalScoreCount = 0
                meals.forEach(m => {
                    const ai = m.meal_analysis?.[0]?.result
                    if (ai?.feel_score) {
                        const vals = Object.values(ai.feel_score)
                        totalGlow += Math.floor(vals.reduce((a, b) => a + b, 0) / vals.length)
                        totalScoreCount++
                    }
                })
                const glow = totalScoreCount > 0 ? Math.floor(totalGlow / totalScoreCount) : 0

                let streak = 0
                let currentDate = new Date()
                currentDate.setHours(0, 0, 0, 0)

                const activeDates = new Set(meals.map(m => {
                    const d = new Date(m.created_at)
                    d.setHours(0, 0, 0, 0)
                    return d.getTime()
                }))

                if (activeDates.has(currentDate.getTime())) {
                    streak = 1
                } else {
                    const yesterday = new Date(currentDate)
                    yesterday.setDate(yesterday.getDate() - 1)
                    if (activeDates.has(yesterday.getTime())) {
                        streak = 1
                        currentDate = yesterday
                    }
                }

                if (streak > 0) {
                    while (true) {
                        currentDate.setDate(currentDate.getDate() - 1)
                        if (activeDates.has(currentDate.getTime())) {
                            streak++
                        } else {
                            break
                        }
                    }
                }

                setStats({ streak, glow, scanned })
            } catch (e) {
                console.error(e)
            } finally {
                setLoadingStats(false)
            }
        }
        loadStats()
    }, [user])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    // Determine the name to display
    const displayName = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile?.first_name
            ? profile.first_name
            : user?.email ? user.email.split('@')[0] : 'Utilisateur';

    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1).replace(/[._]/g, ' ');

    return (
        <div className="flex flex-col min-h-screen bg-[#F7F9FA] pb-10">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-6">
                <button className="p-2 -ml-2 text-foreground active:opacity-70"><ChevronLeft className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Profil</h1>
                <button className="p-2 -mr-2 text-foreground active:opacity-70"><Settings className="w-6 h-6" /></button>
            </div>

            <div className="px-6 flex flex-col items-center">

                {/* Avatar with Glow */}
                <div className="relative mb-4">
                    <div className="absolute inset-[-10px] rounded-full bg-gradient-to-tr from-brand-300 via-amber-200 to-brand-100 blur-md opacity-80"></div>
                    <div className="relative w-28 h-28 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                        <div className="w-full h-full bg-gradient-to-tr from-blue-100 to-brand-50 flex items-center justify-center">
                            <User className="w-12 h-12 text-brand-500/50" />
                        </div>
                    </div>
                    {/* Edit Badge */}
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                        <Edit2 className="w-4 h-4 text-brand-500" />
                    </button>
                </div>

                {/* Name & Premium Badge */}
                <h2 className="text-[1.75rem] font-extrabold text-foreground tracking-tight mb-2">
                    {formattedName}
                </h2>
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm mb-8">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    <span className="text-sm font-semibold text-brand-500">Membre Premium</span>
                </div>

                {/* 3 Stats Grid */}
                <div className="flex gap-4 w-full mb-8">
                    <div className="flex-1 bg-white rounded-3xl p-4 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-2">
                            <Flame className="w-6 h-6 text-orange-500 fill-orange-500/20" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">
                            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-gray-300" /> : stats.streak}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">Série</span>
                    </div>

                    <div className="flex-1 bg-white rounded-3xl p-4 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-gradient-to-r from-brand-300 to-brand-500 blur-xl"></div>
                        <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-2">
                            <Sun className="w-6 h-6 text-brand-500" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">
                            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-gray-300" /> : (stats.glow || '--')}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">Score Glow</span>
                    </div>

                    <div className="flex-1 bg-white rounded-3xl p-4 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                            <ScanLine className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">
                            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-gray-300" /> : stats.scanned}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">Scannés</span>
                    </div>
                </div>

                {/* Menu Lists */}
                <div className="w-full bg-white rounded-[2rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-4">
                    <MenuItem icon={User} iconColor="text-emerald-500" iconBg="bg-emerald-50" label="Informations Personnelles" />
                    <div className="h-px bg-gray-50 mx-4" />
                    <MenuItem icon={Heart} iconColor="text-rose-500" iconBg="bg-rose-50" label="Mes Objectifs Santé" />
                    <div className="h-px bg-gray-50 mx-4" />
                    <MenuItem icon={Utensils} iconColor="text-amber-500" iconBg="bg-amber-50" label="Préférences Alimentaires" />
                </div>

                <div className="w-full bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8">
                    <MenuItem icon={Watch} iconColor="text-slate-500" iconBg="bg-slate-50" label="Appareils Connectés" badge="2 Actifs" />
                </div>

                {/* Log Out Button */}
                <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-50 text-red-500 font-bold text-lg rounded-2xl active:scale-95 transition-all mb-4"
                >
                    Déconnexion
                </button>
                <span className="text-xs text-gray-300 font-bold mb-8">Eatly v2.0.4</span>

            </div>
        </div>
    )
}

function MenuItem({ icon: Icon, iconColor, iconBg, label, badge }) {
    return (
        <button className="w-full flex items-center justify-between p-3 active:opacity-70 transition-opacity rounded-xl">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <span className="text-[1.05rem] font-semibold text-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                {badge && <span className="bg-brand-50 text-brand-600 text-xs font-bold px-2.5 py-1 rounded-full">{badge}</span>}
                <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
        </button>
    )
}
