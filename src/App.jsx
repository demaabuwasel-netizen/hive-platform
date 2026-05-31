import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Landing from './pages/Landing'
import ForStudents from './pages/ForStudents'
import ForNGOs from './pages/ForNGOs'
import HowItWorks from './pages/HowItWorks'
import About from './pages/About'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'
import RoleSelection from './pages/RoleSelection'
import StudentOnboarding from './pages/StudentOnboarding'
import NGOOnboarding from './pages/NGOOnboarding'
import StudentProfile from './pages/StudentProfile'
import NGOProfile from './pages/NGOProfile'
import StudentDashboard from './pages/StudentDashboard'
import NGODashboard from './pages/NGODashboard'
import MatchResults from './pages/MatchResults'
import MatchExplanation from './pages/MatchExplanation'
import Opportunities from './pages/Opportunities'
import Applicants from './pages/Applicants'
import Interviews from './pages/Interviews'
import Analytics from './pages/Analytics'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import Applications from './pages/Applications'
import Saved from './pages/Saved'
import CreateOpportunity from './pages/CreateOpportunity'
import EditStudentProfile from './pages/EditStudentProfile'
import EditNGOProfile from './pages/EditNGOProfile'
import DashboardLayout from './components/DashboardLayout'
import { AppProvider, useApp } from './context/AppContext'
import HiveLogo from './components/HiveLogo'
import ScrollToTop from './components/ScrollToTop'

// ─── Guards ───────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }} className="flex flex-col items-center gap-4">
        <motion.div animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
          <HiveLogo size={44} showName={false} />
        </motion.div>
        <p className="text-navy-400 text-sm font-medium">Loading…</p>
      </motion.div>
    </div>
  )
}

function GuestOnly({ children }) {
  const { user, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (user) {
    if (user.onboardingComplete)
      return <Navigate to={user.role === 'student' ? '/dashboard/student' : '/dashboard/ngo'} replace />
    return <Navigate to="/role-selection" replace />
  }
  return children
}

function RequireAuth({ children }) {
  const { user, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function OnboardingGuard({ children }) {
  const { user, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (user.onboardingComplete)
    return <Navigate to={user.role === 'student' ? '/profile/student' : '/profile/ngo'} replace />
  return children
}

// Wraps the persistent DashboardLayout with auth guard
function ProtectedDashboard() {
  const { user, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  return <DashboardLayout />
}

// ─── OAuth callback handler ───────────────────────────────────────────────────
// AppProvider sits outside BrowserRouter and cannot call useNavigate.
// This component runs inside the router and handles the redirect after
// Google (or any OAuth) redirects back to the app with #access_token in the URL.

function OAuthCallback() {
  const { user, loading } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    // Only handle OAuth bearer callbacks — not password-reset recovery links
    if (!hash.includes('access_token') || hash.includes('type=recovery')) return
    if (loading || !user) return

    const dest = user.onboardingComplete
      ? (user.role === 'student' ? '/dashboard/student' : '/dashboard/ngo')
      : '/role-selection'

    navigate(dest, { replace: true })
  }, [user, loading, navigate])

  return null
}

// ─── Routes ───────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { loading } = useApp()
  if (loading) return <LoadingScreen />

  return (
    <>
      <OAuthCallback />
      <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/for-students"  element={<ForStudents />} />
      <Route path="/for-ngos"      element={<ForNGOs />} />
      <Route path="/how-it-works"  element={<HowItWorks />} />
      <Route path="/about"         element={<About />} />
      <Route path="/auth"           element={<GuestOnly><Auth /></GuestOnly>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/match/:id" element={<MatchExplanation />} />

      {/* ── Onboarding ── */}
      <Route path="/role-selection"     element={<RequireAuth><RoleSelection /></RequireAuth>} />
      <Route path="/onboarding/student" element={<OnboardingGuard><StudentOnboarding /></OnboardingGuard>} />
      <Route path="/onboarding/ngo"     element={<OnboardingGuard><NGOOnboarding /></OnboardingGuard>} />

      {/* ── Profile ── */}
      <Route path="/profile/student"      element={<Navigate to="/settings" replace />} />
      <Route path="/profile/student/edit" element={<RequireAuth><EditStudentProfile /></RequireAuth>} />
      <Route path="/profile/ngo"          element={<RequireAuth><NGOProfile /></RequireAuth>} />
      <Route path="/profile/ngo/edit"     element={<RequireAuth><EditNGOProfile /></RequireAuth>} />

      {/* ── Create opportunity (full-page, no sidebar) ── */}
      <Route path="/opportunities/new"    element={<RequireAuth><CreateOpportunity /></RequireAuth>} />

      {/* ── Dashboard shell — sidebar persists across all child routes ── */}
      <Route element={<ProtectedDashboard />}>
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/ngo"     element={<NGODashboard />} />
        <Route path="/opportunities"     element={<Opportunities />} />
        <Route path="/applicants"        element={<Applicants />} />
        <Route path="/interviews"        element={<Interviews />} />
        <Route path="/analytics"         element={<Analytics />} />
        <Route path="/messages"          element={<Messages />} />
        <Route path="/settings"          element={<Settings />} />
        <Route path="/applications"      element={<Applications />} />
        <Route path="/saved"             element={<Saved />} />
        <Route path="/matches"           element={<MatchResults />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
