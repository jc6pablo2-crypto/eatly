import { useState } from 'react'
import { Home, Book, BarChart2, User, ScanLine } from 'lucide-react'
import MealCapture from '../components/MealCapture'
import HistoryTab from '../components/HistoryTab'
import InsightsTab from '../components/InsightsTab'
import SettingsTab from '../components/SettingsTab'
import DiaryTab from '../components/DiaryTab'
import MealAnalysis from '../components/MealAnalysis'

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('home')
    const [selectedMeal, setSelectedMeal] = useState(null)

    return (
        <div className="page-container flex flex-col bg-background">
            <main className="flex-1 overflow-y-auto w-full pb-28 hide-scrollbar">
                {activeTab === 'home' && <HistoryTab onSeeAll={() => setActiveTab('diary')} onSelectMeal={setSelectedMeal} />}
                {activeTab === 'diary' && <DiaryTab onSelectMeal={setSelectedMeal} />}
                {activeTab === 'capture' && <MealCapture />}
                {activeTab === 'insights' && <InsightsTab />}
                {activeTab === 'profile' && <SettingsTab />}
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
                            <button onClick={() => setActiveTab('capture')} className="floating-scan-btn text-white z-50">
                                <ScanLine className="w-8 h-8 stroke-[2.5px]" />
                            </button>
                        </div>

                        <div className="flex justify-around flex-1 pl-6">
                            <NavButton id="insights" icon={BarChart2} label="Analyses" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
                            <NavButton id="profile" icon={User} label="Profil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
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
        </div>
    )
}

function NavButton({ icon: Icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center space-y-1.5 p-2 transition-all active:scale-95 group w-14">
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-brand-50 text-brand-600 scale-110 shadow-sm' : 'text-gray-400 group-hover:text-gray-600'}`}>
                <Icon className={`w-6 h-6 stroke-[2px] transition-colors ${active ? 'fill-brand-50/50' : 'fill-transparent'}`} />
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {label}
            </span>
        </button>
    )
}
