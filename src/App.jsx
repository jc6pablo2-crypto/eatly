import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'

// Pages
import LandingPage from './pages/LandingPage'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import AuthCallback from './pages/AuthCallback'
import ResetPassword from './pages/ResetPassword'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Success from './pages/Success'

function PrivateRoute({ children }) {
  const { user, loading, profile } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center animated-gradient-bg">Loading...</div>
  if (!user) return <Navigate to="/welcome" replace />
  if (profile && !profile.goal && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function App() {
  const { user, loading } = useAuth()

  return (
    <div className="font-sans antialiased bg-background min-h-screen text-foreground">
      <Routes>
        <Route path="/" element={user && !loading ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/welcome" element={user && !loading ? <Navigate to="/dashboard" replace /> : <Welcome />} />
        <Route path="/login" element={user && !loading ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={user && !loading ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/verify" element={user && !loading ? <Navigate to="/" replace /> : <VerifyEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />

        <Route path="/onboarding" element={
          <PrivateRoute>
            <Onboarding />
          </PrivateRoute>
        } />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
