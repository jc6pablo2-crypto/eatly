import { useState, useEffect, useCallback } from 'react'
import { Home, Book, BarChart2, User, ScanLine, Crown, Lock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getTodayMealCount } from '../lib/api'
import MealCapture from '../components/MealCapture'
import HistoryTab from '../components/HistoryTab'
import InsightsTab from '../components/InsightsTab'
import SettingsTab from '../components/SettingsTab'
import DiaryTab from '../components/DiaryTab'
import MealAnalysis from '../components/MealAnalysis'
import PaywallTab from '../components/PaywallTab'

const FREE_SCAN_LIMIT = 3

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('home')
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [scanCount, setScanCount] = useState(0)
    const [showLimitModal, setShowLimitModal] = useState(false)
    const { user, profile } = useAuth()
    const isPremium = profile?.is_premium

    // Fetch today's scan count for free users
    const refreshScanCount = useCallback(async () => {
        if (!user || isPremium) return
        try {
            const count = await getTodayMealCount(user.id)
            setScanCount(count)
        } catch (e) {
            console.error('Failed to fetch scan count', e)
        }
    }, [user, isPremium])

    useEffect(() => {
        refreshScanCount()
    }, [refreshScanCount, activeTab]) // re-check when switching tabs (e.g. after a scan)

    const handleScanPress = () => {
        if (!isPremium && scanCount >= FREE_SCAN_LIMIT) {
            setShowLimitModal(true)
            return
        }
        setActiveTab('capture')
    }

    return (
        <div className="page-container flex flex-col bg-background">
            <main className="flex-1 overflow-y-auto w-full pb-28 hide-scrollbar">
                {activeTab === 'home' && <HistoryTab onSeeAll={() => setActiveTab('diary')} onSelectMeal={setSelectedMeal} onShowProfile={() => setActiveTab('profile')} />}
                {activeTab === 'diary' && <DiaryTab onSelectMeal={setSelectedMeal} />}
                {activeTab === 'capture' && <MealCapture onClose={() => setActiveTab('home')} />}
                {activeTab === 'insights' && <InsightsTab onSwitchTab={setActiveTab} />}
                {activeTab === 'profile' && <SettingsTab />}
                {activeTab === 'premium' && <PaywallTab />}
            </main>

            {/* Bottom Navigation with Floating Button */}
            {activeTab !== 'capture' && (
                <nav className="bottom-nav h-24 px-6 relative">
                    <div className="flex justify-between items-center h-full w-full">
                        <div className="flex justify-around flex-1 pr-6">
                            <NavButton id="home" icon={Home} label="Accueil" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                            <NavButton id="diary" icon={Book} label="Agenda" active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} />
                        </div>

                        {/* Center Floating Scan Button */}
                        <div className="relative font-sans shrink-0 w-16">
                            <button onClick={handleScanPress} className="floating-scan-btn text-white z-50 relative">
                                <ScanLine className="w-8 h-8 stroke-[2.5px]" />
                                {/* Scan count badge for free users */}
                                {!isPremium && (
                                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold border-2 border-white ${scanCount >= FREE_SCAN_LIMIT ? 'bg-red-500 text-white' : 'bg-white text-foreground'}`}>
                                        {scanCount >= FREE_SCAN_LIMIT ? <Lock className="w-2.5 h-2.5" /> : `${FREE_SCAN_LIMIT - scanCount}`}
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-around flex-1 pl-6">
                            <NavButton id="insights" icon={BarChart2} label="Analyses" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
                            {isPremium ? (
                                <NavButton id="profile" icon={User} label="Profil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                            ) : (
                                <NavButton id="premium" icon={Crown} label="Premium" active={activeTab === 'premium'} onClick={() => setActiveTab('premium')} isPremiumTab />
                            )}
                        </div>
                    </div>
                </nav>
            )}

            {selectedMeal && (
                <MealAnalysis
                    meal={selectedMeal}
                    analysis={selectedMeal.meal_analysis?.[0]}
                    image={selectedMeal.image_url}
                    onClose={() => setSelectedMeal(null)}
                />
            )}

            {/* ===== LIMIT REACHED MODAL ===== */}
            {showLimitModal && (
                <div className="fixed inset-0 z-[300] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLimitModal(false)}></div>
                    <div className="relative max-w-md w-full bg-white rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
                        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full"></div></div>
                        <div className="px-8 pb-10 pt-4 text-center">
                            {/* Lock icon */}
                            <div className="w-20 h-20 mx-auto mb-5 relative">
                                <div className="absolute inset-0 bg-red-50 rounded-3xl flex items-center justify-center">
                                    <Lock className="w-9 h-9 text-red-500" />
                                </div>
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-extrabold w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-white shadow-sm">
                                    {scanCount}
                                </div>
                            </div>

                            <h2 className="text-xl font-extrabold text-foreground mb-2">Limite de scans atteinte</h2>
                            <p className="text-gray-500 text-sm font-medium mb-2">
                                Vous avez utilisé vos <span className="font-bold text-foreground">{FREE_SCAN_LIMIT} scans gratuits</span> aujourd'hui.
                            </p>
                            <p className="text-gray-400 text-xs font-medium mb-6">
                                Vos scans se réinitialiseront demain à minuit, ou passez à Premium pour des scans illimités.
                            </p>

                            {/* Progress bar */}
                            <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: '100%' }}></div>
                            </div>

                            <button
                                onClick={() => { setShowLimitModal(false); setActiveTab('premium') }}
                                className="w-full py-4 text-center rounded-2xl bg-foreground text-white font-extrabold text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-foreground/15 mb-3"
                            >
                                <Crown className="w-5 h-5" /> Passer à Premium — 12€/mois
                            </button>

                            <button
                                onClick={() => setShowLimitModal(false)}
                                className="w-full py-3 text-center text-gray-400 font-semibold text-sm active:scale-95 transition-all"
                            >
                                Réessayer demain
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function NavButton({ icon: Icon, label, active, onClick, isPremiumTab }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center space-y-1.5 p-2 transition-all active:scale-95 group w-14">
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${active
                ? isPremiumTab
                    ? 'bg-yellow-50 text-yellow-600 scale-110 shadow-sm'
                    : 'bg-brand-50 text-brand-600 scale-110 shadow-sm'
                : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                <Icon className={`w-6 h-6 stroke-[2px] transition-colors ${active
                    ? isPremiumTab ? 'fill-yellow-50/50' : 'fill-brand-50/50'
                    : 'fill-transparent'
                    }`} />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${active
                ? isPremiumTab ? 'text-yellow-600' : 'text-brand-600'
                : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                {label}
            </span>
        </button>
    )
}
