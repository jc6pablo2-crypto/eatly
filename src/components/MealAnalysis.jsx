import { ArrowLeft, Share2, Plus, Zap, Sparkles, CheckCircle2, Droplets, ArrowRight, Battery, BatteryWarning, Activity, ShieldAlert, AlertTriangle, Lock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import PremiumCTA from './PremiumCTA'

// Real Data binding for the V3 Analysis Showcase
export default function MealAnalysis({ image, meal, analysis, onClose }) {
    const { profile } = useAuth()
    const isPremium = profile?.is_premium

    const ai = analysis?.result || {}
    const macros = ai.macros || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    const prediction = ai.prediction
    const toxicScore = ai.toxic_score

    // Calculate global glow score from the 5 indices
    const calculateGlow = () => {
        if (!ai.feel_score) return 0
        const vals = Object.values(ai.feel_score)
        return Math.floor(vals.reduce((a, b) => a + b, 0) / vals.length)
    }
    const glowScore = calculateGlow()

    // format date
    const dateStr = new Date(meal?.created_at || new Date()).toLocaleString('fr-FR', { weekday: 'short', hour: 'numeric', minute: 'numeric' })
    const mainComponent = ai.components?.[0]?.name || "Repas sain"

    return (
        <div className="fixed inset-0 z-[200] bg-[#F7F9FA] overflow-y-auto animate-in slide-in-from-bottom duration-500 flex flex-col">

            {/* Header (Overlapping Image) */}
            <div className="relative h-[45vh] shrink-0 bg-foreground rounded-b-[3.5rem] overflow-hidden">
                {/* Background Image / Captured Image */}
                {image ? (
                    <img
                        src={image}
                        alt="Meal Analysis"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-600"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-black/40"></div>

                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pt-safe z-10 pt-12">
                    <button onClick={onClose} className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white active:scale-95">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-white font-bold text-lg">Analyse</h2>
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white active:scale-95">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Floating Meal Score Pill */}
                <div className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-3xl border border-white/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl z-10">
                    <div className="w-6 h-6 rounded-full border-[3px] border-brand-400 flex items-center justify-center bg-brand-50/10">
                        <span className="text-[9px] font-bold text-brand-400">{glowScore}</span>
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">Score du repas</span>
                </div>
            </div>

            <div className="flex-1 px-6 -mt-6 relative z-20 pb-32">

                {/* Title Section */}
                <div className="flex justify-between items-start mb-6 pt-10">
                    <div className="flex-1 pr-4">
                        <h1 className="text-[28px] font-extrabold text-foreground tracking-tight leading-tight mb-1 capitalize line-clamp-2">{mainComponent}</h1>
                        <p className="text-gray-400 text-[13px] font-medium">{dateStr}</p>
                    </div>
                    <button className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)] active:scale-95 transition-transform shrink-0">
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                {/* 4 Stat Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <StatCard icon={Zap} iconColor="text-orange-500" iconBg="bg-orange-50" value={macros.calories} label="ÉNERGIE KCAL" />
                    <StatCard icon={Sparkles} iconColor="text-purple-500" iconBg="bg-purple-50" value={glowScore > 80 ? "Élevé" : glowScore > 50 ? "Moyen" : "Faible"} label="INDICE GLOW" />
                    <RingCard value={`${macros.protein_g}g`} label="PROTÉINES" colorClass="text-blue-500" ringClass="border-blue-500" />
                    <RingCard value={`${macros.fat_g}g`} label="LIPIDES" colorClass="text-red-500" ringClass="border-red-500" />
                </div>

                {/* Toxic Score Block (Scan Produit) */}
                {toxicScore && (
                    <div className={`rounded-[2rem] p-6 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]
                    ${(!isPremium || toxicScore.level === 'High' || toxicScore.level === 'Critical') ? 'bg-red-50' :
                            toxicScore.level === 'Medium' ? 'bg-orange-50' : 'bg-brand-50'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                ${(!isPremium || toxicScore.level === 'High' || toxicScore.level === 'Critical') ? 'bg-red-100 text-red-600' :
                                        toxicScore.level === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-brand-100 text-brand-600'}`}>
                                    {(!isPremium || toxicScore.level === 'High' || toxicScore.level === 'Critical') ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className={`font-extrabold text-[16px] leading-tight
                                    ${(!isPremium || toxicScore.level === 'High' || toxicScore.level === 'Critical') ? 'text-red-900' :
                                            toxicScore.level === 'Medium' ? 'text-orange-900' : 'text-brand-900'}`}>
                                        Score Toxique Industriel
                                    </h4>
                                    <span className={`text-[12px] font-bold uppercase tracking-wide
                                    ${(!isPremium || toxicScore.level === 'High' || toxicScore.level === 'Critical') ? 'text-red-600' :
                                            toxicScore.level === 'Medium' ? 'text-orange-600' : 'text-brand-600'}`}>
                                        Niveau : {isPremium ? toxicScore.level : 'Masqué'}
                                    </span>
                                </div>
                            </div>
                            <div className={`text-2xl font-black ${(!isPremium || toxicScore.level === 'High' || toxicScore.level === 'Critical') ? 'text-red-500' :
                                toxicScore.level === 'Medium' ? 'text-orange-500' : 'text-brand-500'}`}>
                                {isPremium ? toxicScore.score : '??'}<span className="text-[12px] font-bold text-gray-500">/100</span>
                            </div>
                        </div>

                        {!isPremium ? (
                            <PremiumCTA variant="inline" title="Score Toxique Inspecteur" description="Découvrez les additifs cachés (E-xxx) en passant Premium." />
                        ) : (
                            <>
                                {toxicScore.additives && toxicScore.additives.length > 0 && (
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Additifs Détectés</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {toxicScore.additives.map((additive, i) => (
                                                <span key={i} className="px-2 py-1 bg-white rounded-lg text-[11px] font-bold text-gray-700 shadow-sm border border-gray-100">
                                                    {additive}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(!toxicScore.additives || toxicScore.additives.length === 0) && (
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                                        <span className="text-[12px] font-bold text-brand-700 block">Aucun additif toxique détecté. Excellent choix !</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Eatly AI Insights */}
                <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[100px] -mr-10 -mt-10 opacity-50 pointer-events-none"></div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h3 className="font-extrabold text-foreground text-lg">Analyses Eatly AI</h3>
                    </div>

                    <p className="text-gray-500 text-[14px] leading-relaxed font-medium mb-5">
                        {ai.why ? ai.why.join(' ') : "Excellent choix pour vos objectifs !"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <Badge icon={CheckCircle2} text="Aligné à l'objectif" color="text-brand-600 bg-brand-100" />
                        <Badge icon={Droplets} text="Hydratant" color="text-blue-600 bg-blue-100" />
                    </div>
                </div>

                {/* Predictive Glow Score Block */}
                {prediction && (
                    <div className={`rounded-[2rem] p-6 mb-6 border ${(!isPremium || prediction.fatigue_warning) ? 'bg-orange-50/50 border-orange-100' : 'bg-brand-50/50 border-brand-100'}`}>
                        <div className="flex items-start gap-4 mb-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${(!isPremium || prediction.fatigue_warning) ? 'bg-orange-100 text-orange-600' : 'bg-brand-100 text-brand-600'}`}>
                                {(!isPremium || prediction.fatigue_warning) ? <BatteryWarning className="w-5 h-5" /> : <Battery className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className={`font-extrabold text-[15px] mb-1 ${(!isPremium || prediction.fatigue_warning) ? 'text-orange-900' : 'text-brand-900'}`}>
                                    Prédiction d'Énergie
                                </h4>
                                <p className={`text-[13px] leading-tight font-semibold flex items-center gap-1 ${(!isPremium || prediction.fatigue_warning) ? 'text-orange-700/80' : 'text-brand-700/80'}`}>
                                    {isPremium ? prediction.energy_impact : <><Lock className="w-3 h-3" /> Analyse verrouillée</>}
                                </p>
                            </div>
                        </div>

                        {!isPremium ? (
                            <PremiumCTA variant="inline" title="Prédiction d'Énergie" description="Anticipez vos coups de fatigue et pics de glycémie avec Premium." />
                        ) : (
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 flex gap-3 items-start">
                                <Activity className={`w-4 h-4 mt-0.5 shrink-0 ${prediction.fatigue_warning ? 'text-orange-500' : 'text-brand-500'}`} />
                                <p className="text-[13px] font-medium text-foreground/80 leading-snug">
                                    <span className="font-bold block mb-0.5">Conseil Proactif :</span>
                                    {prediction.advice}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Macros Breakdown */}
                <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-10">
                    <div className="flex justify-between items-end mb-6">
                        <h4 className="font-bold text-foreground text-[17px]">Détail des Macros</h4>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">par portion</span>
                    </div>

                    <div className="space-y-5">
                        <MacroRow label="Glucides" amount={`${macros.carbs_g}g`} color="bg-orange-400" percentage={`${Math.min((macros.carbs_g / 300) * 100, 100)}%`} />
                        <MacroRow label="Protéines" amount={`${macros.protein_g}g`} color="bg-blue-500" percentage={`${Math.min((macros.protein_g / 200) * 100, 100)}%`} />
                        <MacroRow label="Lipides" amount={`${macros.fat_g}g`} color="bg-red-400" percentage={`${Math.min((macros.fat_g / 100) * 100, 100)}%`} />
                    </div>
                </div>

            </div>

            {/* Sticky Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
                <button onClick={onClose} className="w-full bg-foreground text-white font-bold text-[17px] py-[18px] rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl">
                    Enregistrer au journal <ArrowRight className="w-5 h-5 ml-1" />
                </button>
            </div>

        </div>
    )
}

function StatCard({ icon: Icon, iconColor, iconBg, value, label }) {
    return (
        <div className="bg-white rounded-3xl p-5 flex flex-col items-center justify-center shadow-[0_8px_20px_rgb(0,0,0,0.02)]">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${iconBg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <span className="text-[20px] font-extrabold text-foreground leading-none mb-1">{value}</span>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{label}</span>
        </div>
    )
}

function RingCard({ value, label, ringClass, colorClass }) {
    return (
        <div className="bg-white rounded-3xl p-5 flex flex-col items-center justify-center shadow-[0_8px_20px_rgb(0,0,0,0.02)] relative overflow-hidden">
            <div className={`w-14 h-14 rounded-full border-[5px] border-gray-100 flex items-center justify-center mb-3 relative`}>
                <div className={`absolute inset-[-5px] rounded-full border-[5px] border-transparent ${ringClass} border-r-transparent border-b-transparent transform rotate-45`}></div>
                {label === 'PROTÉINES' ? <span className={`text-[18px] ${colorClass}`}>💪</span> : <span className={`text-[18px] ${colorClass}`}>🔥</span>}
            </div>
            <span className="text-[20px] font-extrabold text-foreground leading-none mb-1 text-center">{value}</span>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase text-center">{label}</span>
        </div>
    )
}

function Badge({ icon: Icon, text, color }) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold ${color}`}>
            <Icon className="w-3.5 h-3.5" />
            {text}
        </div>
    )
}

function MacroRow({ label, amount, color, percentage }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
                <span className="text-[13px] font-semibold text-gray-500">{label}</span>
                <span className="text-[12px] font-bold text-foreground">{amount}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: percentage }}></div>
            </div>
        </div>
    )
}
