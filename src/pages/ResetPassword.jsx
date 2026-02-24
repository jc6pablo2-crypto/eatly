import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Loader2, ArrowRight } from 'lucide-react'

export default function ResetPassword() {
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isRecovery, setIsRecovery] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const navigate = useNavigate()

    useEffect(() => {
        // Check if we arrived here via a recovery link (hash containing access_token or type=recovery)
        const hash = window.location.hash
        if (hash && hash.includes('type=recovery')) {
            setIsRecovery(true)
        }
    }, [])

    const handleSendReset = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) setMessage({ type: 'error', text: error.message })
            else setMessage({ type: 'success', text: 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.' })
        } catch (err) {
            console.error('Reset password error:', err)
            setMessage({ type: 'error', text: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.' })
        }
        setLoading(false)
    }

    const handleUpdatePassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) setMessage({ type: 'error', text: error.message })
            else {
                setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' })
                setTimeout(() => navigate('/'), 2000)
            }
        } catch (err) {
            console.error('Update password error:', err)
            setMessage({ type: 'error', text: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.' })
        }
        setLoading(false)
    }

    return (
        <div className="page-container flex flex-col justify-center px-6">
            <div className="glass-card mb-auto mt-24">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">
                        {isRecovery ? 'Nouveau mot de passe' : 'Mot de passe oublié'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isRecovery ? 'Choisissez un mot de passe sécurisé' : 'Entrez votre email pour recevoir un lien de réinitialisation'}
                    </p>
                </div>

                {message.text && (
                    <div className={`p-3 rounded-xl text-sm mb-6 text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message.text}
                    </div>
                )}

                {isRecovery ? (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Nouveau mot de passe"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field"
                            required
                            minLength={6}
                        />
                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mettre à jour'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSendReset} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            required
                        />
                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer le lien'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    )
}
