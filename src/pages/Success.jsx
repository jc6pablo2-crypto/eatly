import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Success() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#F7F9FA] flex flex-col items-center justify-center px-6 selection:bg-brand-500/30">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-xl text-center border border-gray-100 relative overflow-hidden"
            >
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">Paiement Réussi !</h1>
                <p className="text-gray-500 font-medium mb-8">
                    Bienvenue dans Eatly Premium. Votre abonnement a été activé avec succès et vous avez désormais accès à toutes les fonctionnalités avancées.
                </p>

                <Link
                    to="/dashboard"
                    className="w-full py-4 text-center rounded-2xl bg-foreground text-white font-extrabold hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    Aller au Tableau de bord <ArrowRight className="w-5 h-5" />
                </Link>
            </motion.div>
        </div>
    )
}
