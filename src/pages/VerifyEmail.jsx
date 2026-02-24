import { Link } from 'react-router-dom'
import { MailCheck, ArrowRight } from 'lucide-react'

export default function VerifyEmail() {
    return (
        <div className="page-container flex flex-col justify-center px-6 bg-white animated-gradient-bg">
            <div className="glass-card mb-auto mt-32 text-center p-10 animate-in zoom-in-95 duration-500 rounded-[2.5rem]">

                <div className="w-24 h-24 bg-brand-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <MailCheck className="w-12 h-12 text-brand-600" />
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-foreground">Vérifiez vos emails</h1>

                <p className="text-gray-500 mb-8 leading-relaxed text-lg">
                    Nous vous avons envoyé un lien pour confirmer votre adresse et activer votre compte VIP.
                </p>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-8 text-sm text-gray-400 font-medium">
                    N'oubliez pas de vérifier vos courriers indésirables (spams) si vous ne trouvez pas notre message d'ici quelques minutes.
                </div>

                <Link to="/login" className="btn-primary w-full py-4 text-lg">
                    Retour à la connexion <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
            </div>
        </div>
    )
}
