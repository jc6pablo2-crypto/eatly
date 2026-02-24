import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Loader2, Zap, Target, Leaf, Moon } from 'lucide-react'

const GOALS = [
    { id: 'energy', label: 'Plus d\'énergie', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'weight', label: 'Perte de poids', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'digestion', label: 'Meilleure digestion', icon: Leaf, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'sleep', label: 'Meilleur sommeil', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
]

export default function Onboarding() {
    const { updateProfile } = useAuth()
    const navigate = useNavigate()
    const [selectedGoal, setSelectedGoal] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!selectedGoal) return
        setLoading(true)
        await updateProfile({ goal: selectedGoal })
        navigate('/')
        setLoading(false)
    }

    return (
        <div className="page-container flex flex-col px-6 pt-12">
            <div className="mb-10 text-center space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Bienvenue.</h1>
                <p className="text-gray-500 text-lg leading-relaxed">
                    Pour personnaliser vos recommandations,<br />quel est votre objectif principal ?
                </p>
            </div>

            <div className="grid gap-4 flex-1">
                {GOALS.map((goal) => {
                    const isSelected = selectedGoal === goal.id
                    const Icon = goal.icon
                    return (
                        <button
                            key={goal.id}
                            onClick={() => setSelectedGoal(goal.id)}
                            className={`text-left p-5 rounded-3xl border-2 transition-all duration-300 flex items-center gap-5 ${isSelected
                                ? 'border-brand-500 bg-brand-50/50 shadow-sm scale-[1.02]'
                                : 'border-transparent bg-white shadow-sm hover:scale-[1.01] hover:shadow-md'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${goal.bg}`}>
                                <Icon className={`w-6 h-6 ${goal.color}`} />
                            </div>
                            <span className="font-semibold text-lg text-foreground">{goal.label}</span>
                        </button>
                    )
                })}
            </div>

            <div className="mt-8">
                <button
                    onClick={handleSave}
                    disabled={!selectedGoal || loading}
                    className="btn-primary w-full text-lg py-4"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Commencer'}
                </button>
            </div>
        </div>
    )
}
