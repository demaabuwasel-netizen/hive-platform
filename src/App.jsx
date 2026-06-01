import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './services/supabase'
import { getUserRow } from './services/auth'
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

// ─── Auth redirect handler ────────────────────────────────────────────────────
// Listens for Supabase SIGNED_IN events and redirects to the correct page.
//
// WHY NOT check window.location.hash:
//   Supabase JS clears #access_token synchronously inside createClient()
//   (via history.replaceState in _handleImplicitGrantFlow). By the time
//   any React useEffect runs, the hash is already gone.
//
// WHY filter to non-email providers:
//   Auth.jsx handles its own redirect after email/password sign-in.
//   SIGNED_IN fires for all methods, so we only intercept OAuth here to
//   avoid double-redirects.

function OAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session?.user) return

        const provider = session.user.app_metadata?.provider ?? 'email'

        // Email/password sign-in is handled by Auth.jsx — skip it here
        if (provider === 'email') return

        const uid   = session.user.id
        const email = session.user.email

        console.log('[auth] OAuth SIGNED_IN', { uid, email, provider })

        const userRow = await getUserRow(uid)
        console.log('[auth] public.users row:', userRow)

        let dest
        if (!userRow?.role) {
          dest = '/role-selection'
          console.log('[auth] redirect → /role-selection (no role set)')
        } else if (!userRow?.onboarding_complete) {
          dest = `/onboarding/${userRow.role}`
          console.log('[auth] redirect →', dest, '(onboarding incomplete)')
        } else {
          dest = userRow.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/student'
          console.log('[auth] redirect →', dest, '(fully onboarded)')
        }

        navigate(dest, { replace: true })
      }
    )
    return () => subscription.unsubscribe()
  }, [navigate])

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
