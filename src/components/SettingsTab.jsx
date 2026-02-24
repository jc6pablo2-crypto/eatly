import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { Settings, ChevronLeft, Edit2, Flame, Sun, ScanLine, User, Heart, Utensils, Watch, ChevronRight, Loader2, Crown, Lock, Sparkles, Zap, BarChart3, X, Check, Save } from 'lucide-react'

export default function SettingsTab() {
    const { user, profile, refreshProfile } = useAuth()
    const [stats, setStats] = useState({ streak: 0, glow: 0, scanned: 0 })
    const [loadingStats, setLoadingStats] = useState(true)
    const [activeDrawer, setActiveDrawer] = useState(null) // 'info' | 'goals' | 'prefs' | 'devices'
    const isPremium = profile?.is_premium

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
                let totalGlow = 0, totalScoreCount = 0
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
                const activeDates = new Set(meals.map(m => { const d = new Date(m.created_at); d.setHours(0, 0, 0, 0); return d.getTime() }))
                if (activeDates.has(currentDate.getTime())) { streak = 1 }
                else { const y = new Date(currentDate); y.setDate(y.getDate() - 1); if (activeDates.has(y.getTime())) { streak = 1; currentDate = y } }
                if (streak > 0) { while (true) { currentDate.setDate(currentDate.getDate() - 1); if (activeDates.has(currentDate.getTime())) streak++; else break } }
                setStats({ streak, glow, scanned })
            } catch (e) { console.error(e) } finally { setLoadingStats(false) }
        }
        loadStats()
    }, [user])

    const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/' }

    const displayName = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile?.first_name ? profile.first_name
            : user?.email ? user.email.split('@')[0] : 'Utilisateur'
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1).replace(/[._]/g, ' ')

    return (
        <div className="flex flex-col bg-[#F7F9FA] pb-10 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
                <div className="w-10"></div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Profil</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-6 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-3">
                    <div className="absolute inset-[-10px] rounded-full bg-gradient-to-tr from-brand-300 via-amber-200 to-brand-100 blur-md opacity-80"></div>
                    <div className="relative w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                        <div className="w-full h-full bg-gradient-to-tr from-blue-100 to-brand-50 flex items-center justify-center">
                            <User className="w-10 h-10 text-brand-500/50" />
                        </div>
                    </div>
                </div>

                <h2 className="text-[1.5rem] font-extrabold text-foreground tracking-tight mb-1.5">{formattedName}</h2>
                {isPremium ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm mb-5">
                        <Crown className="w-4 h-4 text-brand-500" /><span className="text-xs font-bold text-brand-500">Premium</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-200 mb-5">
                        <span className="text-xs font-bold text-gray-400">Plan Gratuit</span>
                    </div>
                )}

                {/* Stats */}
                <div className="flex gap-3 w-full mb-5">
                    <StatCard icon={Flame} iconBg="bg-orange-50" iconColor="text-orange-500" value={stats.streak} label="Série" loading={loadingStats} fillIcon />
                    <StatCard icon={Sun} iconBg="bg-brand-50" iconColor="text-brand-500" value={stats.glow || '--'} label="Glow" loading={loadingStats} glow />
                    <StatCard icon={ScanLine} iconBg="bg-blue-50" iconColor="text-blue-500" value={stats.scanned} label="Scans" loading={loadingStats} />
                </div>

                {/* Premium Upsell (free only) */}
                {!isPremium && (
                    <Link to="/paywall" className="w-full mb-5 block">
                        <div className="relative rounded-2xl overflow-hidden p-[1.5px]">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-400 via-purple-400 to-accent-400 animate-[spin_6s_linear_infinite] bg-[length:200%_200%]"></div>
                            <div className="relative bg-white rounded-[0.85rem] p-4 z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                                        <Crown className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-foreground text-sm">Passer Premium</h3>
                                        <p className="text-[11px] text-gray-400 font-medium">Scans ∞ · IA avancée · Historique</p>
                                    </div>
                                </div>
                                <div className="bg-foreground text-white px-3 py-1.5 rounded-xl text-xs font-bold">12€<span className="text-gray-400 font-medium">/mo</span></div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Menu Lists — ALL CLICKABLE */}
                <div className="w-full bg-white rounded-[1.5rem] p-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-3">
                    <MenuItem icon={User} iconColor="text-emerald-500" iconBg="bg-emerald-50" label="Informations Personnelles" onClick={() => setActiveDrawer('info')} />
                    <div className="h-px bg-gray-50 mx-4" />
                    <MenuItem icon={Heart} iconColor="text-rose-500" iconBg="bg-rose-50" label="Mes Objectifs Santé" onClick={() => setActiveDrawer('goals')} />
                    <div className="h-px bg-gray-50 mx-4" />
                    <MenuItem icon={Utensils} iconColor="text-amber-500" iconBg="bg-amber-50" label="Préférences Alimentaires" onClick={() => setActiveDrawer('prefs')} />
                </div>

                <div className="w-full bg-white rounded-2xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-6">
                    <MenuItem icon={Watch} iconColor="text-slate-500" iconBg="bg-slate-50" label="Appareils Connectés" onClick={() => setActiveDrawer('devices')} badge="Bientôt" />
                </div>

                <button onClick={handleLogout} className="w-full py-3.5 bg-red-50 text-red-500 font-bold text-base rounded-2xl active:scale-95 transition-all mb-3">Déconnexion</button>
                <span className="text-xs text-gray-300 font-bold mb-6">Eatly v2.0.4</span>
            </div>

            {/* ===== DRAWERS ===== */}
            {activeDrawer && (
                <div className="fixed inset-0 z-[200]">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setActiveDrawer(null)}></div>
                    <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto hide-scrollbar">
                        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full"></div></div>
                        {activeDrawer === 'info' && <PersonalInfoDrawer onClose={() => setActiveDrawer(null)} />}
                        {activeDrawer === 'goals' && <GoalsDrawer onClose={() => setActiveDrawer(null)} />}
                        {activeDrawer === 'prefs' && <PreferencesDrawer onClose={() => setActiveDrawer(null)} />}
                        {activeDrawer === 'devices' && <DevicesDrawer onClose={() => setActiveDrawer(null)} />}
                    </div>
                </div>
            )}
        </div>
    )
}

// ======================== SUB COMPONENTS ========================

function StatCard({ icon: Icon, iconBg, iconColor, value, label, loading, fillIcon, glow }) {
    return (
        <div className={`flex-1 bg-white rounded-2xl p-3 flex flex-col items-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] ${glow ? 'relative overflow-hidden' : ''}`}>
            {glow && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-gradient-to-r from-brand-300 to-brand-500 blur-xl"></div>}
            <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center mb-1.5`}>
                <Icon className={`w-5 h-5 ${iconColor} ${fillIcon ? 'fill-orange-500/20' : ''}`} />
            </div>
            <span className="text-xl font-bold text-foreground">{loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-300" /> : value}</span>
            <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">{label}</span>
        </div>
    )
}

function MenuItem({ icon: Icon, iconColor, iconBg, label, badge, onClick }) {
    return (
        <button onClick={onClick} className="w-full flex items-center justify-between p-3 active:opacity-70 transition-opacity rounded-xl">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBg}`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
                <span className="text-sm font-semibold text-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
                <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
        </button>
    )
}

// ======================== DRAWERS ========================

function PersonalInfoDrawer({ onClose }) {
    const { user, profile } = useAuth()
    const [firstName, setFirstName] = useState(profile?.first_name || '')
    const [lastName, setLastName] = useState(profile?.last_name || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        await supabase.from('profiles').update({ first_name: firstName, last_name: lastName }).eq('user_id', user.id)
        setSaving(false)
        setSaved(true)
        setTimeout(() => { setSaved(false); onClose() }, 1000)
    }

    return (
        <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-foreground text-lg">Informations Personnelles</h2>
                <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Prénom</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="input-field" placeholder="Votre prénom" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Nom</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="input-field" placeholder="Votre nom" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="input-field opacity-50 cursor-not-allowed" />
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><Check className="w-5 h-5" /> Sauvegardé !</> : <><Save className="w-5 h-5" /> Enregistrer</>}
                </button>
            </div>
        </div>
    )
}

function GoalsDrawer({ onClose }) {
    const { user, profile } = useAuth()
    const [goal, setGoal] = useState(profile?.goal || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const goals = [
        { id: 'weight_loss', label: 'Perte de poids', emoji: '🏋️' },
        { id: 'muscle_gain', label: 'Prise de muscle', emoji: '💪' },
        { id: 'balanced', label: 'Alimentation équilibrée', emoji: '🥗' },
        { id: 'energy', label: 'Plus d\'énergie', emoji: '⚡' },
        { id: 'sleep', label: 'Meilleur sommeil', emoji: '😴' },
        { id: 'digestion', label: 'Meilleure digestion', emoji: '🌿' },
    ]

    const handleSave = async () => {
        setSaving(true)
        await supabase.from('profiles').update({ goal }).eq('user_id', user.id)
        setSaving(false)
        setSaved(true)
        setTimeout(() => { setSaved(false); onClose() }, 1000)
    }

    return (
        <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-foreground text-lg">Objectifs Santé</h2>
                <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-400 font-medium mb-4">Sélectionnez votre objectif principal</p>
            <div className="space-y-2 mb-6">
                {goals.map(g => (
                    <button key={g.id} onClick={() => setGoal(g.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${goal === g.id ? 'border-brand-500 bg-brand-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                        <span className="text-2xl">{g.emoji}</span>
                        <span className={`font-bold text-sm ${goal === g.id ? 'text-brand-600' : 'text-foreground'}`}>{g.label}</span>
                        {goal === g.id && <Check className="w-5 h-5 text-brand-500 ml-auto" />}
                    </button>
                ))}
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><Check className="w-5 h-5" /> Sauvegardé !</> : <><Save className="w-5 h-5" /> Enregistrer</>}
            </button>
        </div>
    )
}

function PreferencesDrawer({ onClose }) {
    const { user, profile } = useAuth()
    const allPrefs = [
        { id: 'vegetarian', label: 'Végétarien', emoji: '🥬' },
        { id: 'vegan', label: 'Végan', emoji: '🌱' },
        { id: 'gluten_free', label: 'Sans gluten', emoji: '🌾' },
        { id: 'lactose_free', label: 'Sans lactose', emoji: '🥛' },
        { id: 'halal', label: 'Halal', emoji: '🕌' },
        { id: 'keto', label: 'Keto', emoji: '🥑' },
        { id: 'no_sugar', label: 'Sans sucre ajouté', emoji: '🍬' },
        { id: 'high_protein', label: 'Riche en protéines', emoji: '🍗' },
    ]

    const [selected, setSelected] = useState(() => {
        try { return profile?.food_preferences || [] } catch { return [] }
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const toggle = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
    }

    const handleSave = async () => {
        setSaving(true)
        await supabase.from('profiles').update({ food_preferences: selected }).eq('user_id', user.id)
        setSaving(false)
        setSaved(true)
        setTimeout(() => { setSaved(false); onClose() }, 1000)
    }

    return (
        <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-foreground text-lg">Préférences Alimentaires</h2>
                <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-400 font-medium mb-4">Sélectionnez vos régimes et restrictions</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
                {allPrefs.map(p => (
                    <button key={p.id} onClick={() => toggle(p.id)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-[0.98] ${selected.includes(p.id) ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 bg-white'}`}>
                        <span className="text-lg">{p.emoji}</span>
                        <span className={`font-semibold text-xs ${selected.includes(p.id) ? 'text-brand-600' : 'text-foreground'}`}>{p.label}</span>
                    </button>
                ))}
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><Check className="w-5 h-5" /> Sauvegardé !</> : <><Save className="w-5 h-5" /> Enregistrer</>}
            </button>
        </div>
    )
}

function DevicesDrawer({ onClose }) {
    return (
        <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-foreground text-lg">Appareils Connectés</h2>
                <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <Watch className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">Bientôt disponible</h3>
                <p className="text-sm text-gray-400 text-center max-w-xs font-medium">
                    La connexion avec Apple Watch, Fitbit et autres appareils connectés sera disponible dans une prochaine mise à jour.
                </p>
            </div>
        </div>
    )
}
