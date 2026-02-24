import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { saveMealFeedback } from '../lib/api'
import { Loader2 } from 'lucide-react'

export default function FeedbackModal({ meal, onClose, onSaved }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const [sliders, setSliders] = useState({
        energy: 50,
        satiety: 50,
        digestion: 50,
        sleepiness: 50,
        cravings: 50
    })

    const labels = {
        energy: "Niveau d'énergie",
        satiety: "Satiété (Faim ?)",
        digestion: "Confort digestif",
        sleepiness: "Somnolence",
        cravings: "Envies de sucre/snack"
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await saveMealFeedback(meal.id, user.id, sliders)
            onSaved(meal.id, sliders)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md px-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">

                <h3 className="text-xl font-bold mb-1 text-center">Comment vous sentez-vous ?</h3>
                <p className="text-xs text-gray-500 text-center mb-6">Évaluez l'impact de ce repas (1 à 4h après)</p>

                <div className="space-y-5">
                    {Object.keys(sliders).map(key => (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold">{labels[key]}</span>
                                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{sliders[key]}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={sliders[key]}
                                onChange={e => setSliders({ ...sliders, [key]: parseInt(e.target.value) })}
                                className="w-full accent-brand-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={onClose} disabled={loading} className="btn-secondary flex-1 py-3 text-sm rounded-xl">
                        Ignorer
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-3 text-sm rounded-xl">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                    </button>
                </div>

            </div>
        </div>
    )
}
