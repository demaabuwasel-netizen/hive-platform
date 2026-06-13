import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { supabase } from './services/supabase'
import { motion, AnimatePresence } from 'framer-motion'
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
  // loadingTimedOut is set by AppContext's 8-second ceiling — shows recovery
  // immediately without waiting for a local timer (which can reset on remounts).
  const { loadingTimedOut } = useApp()
  const [localTimeout, setLocalTimeout] = useState(false)

  useEffect(() => {
    // Fallback: also show recovery after 5 s of local mounting.
    // This catches cases where loadingTimedOut isn't available yet.
    const t = setTimeout(() => setLocalTimeout(true), 5000)
    return () => clearTimeout(t)
  }, [])

  const showRecovery = loadingTimedOut || localTimeout

  function clearSessionAndLogin() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .forEach(k => localStorage.removeItem(k))
    } catch {}
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-4 text-center">

        <motion.div
          animate={showRecovery ? { scale: 1 } : { scale: [1, 1.06, 1] }}
          transition={showRecovery
            ? { duration: 0 }
            : { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
          <HiveLogo size={44} showName={false} />
        </motion.div>

        {!showRecovery && (
          <p className="text-navy-400 text-sm font-medium">Loading…</p>
        )}

        <AnimatePresence>
          {showRecovery && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-3 mt-2">
              <p className="text-navy-600 text-sm font-semibold">Taking longer than expected</p>
              <p className="text-navy-400 text-xs max-w-[240px] leading-relaxed">
                This could be a slow connection or a temporary Supabase issue.
              </p>
              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: '#FFB703' }}>
                  Retry
                </button>
                <button
                  onClick={clearSessionAndLogin}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-navy-600 border border-[rgba(13,24,61,0.15)] hover:bg-[rgba(13,24,61,0.04)] transition-colors">
                  Return to login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
    if (user.role)
      return <Navigate to={`/onboarding/${user.role}`} replace />
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

// Guards /role-selection — redirects completed users straight to their dashboard.
function RoleSelectionGuard({ children }) {
  const { user, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (user.onboardingComplete)
    return <Navigate to={user.role === 'student' ? '/dashboard/student' : '/dashboard/ngo'} replace />
  return children
}

function OnboardingGuard({ children }) {
  const { user, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  // No role yet — shouldn't be in onboarding, send back to role-selection
  if (!user.role) return <Navigate to="/role-selection" replace />
  if (user.onboardingComplete)
    return <Navigate to={user.role === 'student' ? '/dashboard/student' : '/dashboard/ngo'} replace />
  return children
}

// Wraps the persistent DashboardLayout with auth guard
function ProtectedDashboard() {
  const { user, loading } = useApp()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  return <DashboardLayout />
}

// ─── OAuth redirect handler ───────────────────────────────────────────────────
// Routes the user to the correct page after Google (or any OAuth) sign-in.
//
// Design decisions:
//
// 1. Uses AppContext's already-hydrated user state for routing — does NOT make
//    its own getUserRow() call. AppContext's hydrateUser() already ran
//    ensureUserRow + getUserRow (with reconciliation). Duplicating those calls
//    here introduces a race where a cold DB query returns null and the user
//    is wrongly sent to /role-selection.
//
// 2. Handles both SIGNED_IN and INITIAL_SESSION:
//    - SIGNED_IN fires when a fresh OAuth token arrives.
//    - INITIAL_SESSION fires when onAuthStateChange is subscribed with an
//      existing session. OAuthCallback mounts after loading=false; if SIGNED_IN
//      already fired while loading=true (the common case), we catch it via
//      INITIAL_SESSION + a public-path guard instead of losing the redirect.
//
// 3. Email sign-in is handled by Auth.jsx — filtered out here by provider check.

// Public pages where a returning OAuth user should be redirected to their dashboard.
const OAUTH_PUBLIC_PATHS = new Set(['/', '/auth', '/for-students', '/for-ngos', '/how-it-works', '/about'])

function OAuthCallback() {
  const { user, loading } = useApp()
  const navigate    = useNavigate()
  const location    = useLocation()
  // useState (not useRef) so that setting needsRoute=true triggers the routing effect
  // even when user/loading haven't changed (e.g. INITIAL_SESSION for a stored session).
  const [needsRoute, setNeedsRoute] = useState(false)
  const locationRef = useRef(location.pathname)

  useEffect(() => { locationRef.current = location.pathname }, [location.pathname])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) return
      const provider = session.user.app_metadata?.provider ?? 'email'
      if (provider === 'email') return  // email flow handled in Auth.jsx

      console.log('[auth] OAuthCallback —', event, '| provider:', provider, '| uid:', session.user.id)

      if (event === 'SIGNED_IN') {
        setNeedsRoute(true)
      } else if (event === 'INITIAL_SESSION' && OAUTH_PUBLIC_PATHS.has(locationRef.current)) {
        // Catches the case where SIGNED_IN fired while AppContext was still loading
        // (optimistic-cache path) — INITIAL_SESSION fires on subscription and routes.
        setNeedsRoute(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!needsRoute || loading || !user) return
    setNeedsRoute(false)

    const dest = !user.role
      ? '/role-selection'
      : !user.onboardingComplete
      ? `/onboarding/${user.role}`
      : user.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/student'

    console.log('[OAuthCallback] ROUTING DECISION', {
      uid:                user.id,
      provider:           user.provider,
      role:               user.role,
      onboardingComplete: user.onboardingComplete,
      decision:           dest,
    })
    navigate(dest, { replace: true })
  }, [loading, user, navigate, needsRoute])

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
      <Route path="/role-selection"     element={<RoleSelectionGuard><RoleSelection /></RoleSelectionGuard>} />
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
