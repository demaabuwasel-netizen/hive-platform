import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Mail } from 'lucide-react'
import HiveLogo from '../components/HiveLogo'
import { signUp, logIn, signInWithGoogle, getUserRow, updateUserRow, requestPasswordReset } from '../services/auth'

// ── Google brand icon ─────────────────────────────────────────────────────────

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

// ── Main auth page ────────────────────────────────────────────────────────────

export default function Auth() {
  const [params]      = useSearchParams()
  const initialMode   = params.get('mode') === 'signup' ? 'signup' : 'login'
  const prefilledRole = params.get('role')   // 'student' | 'ngo' from landing CTAs

  const [mode, setMode]               = useState(initialMode)
  const [form, setForm]               = useState({ name: '', email: '', password: '' })
  const [showPassword, setShow]       = useState(false)
  const [error, setError]             = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [googleLoading, setGLoading]  = useState(false)
  const [forgotOpen, setForgotOpen]   = useState(false)
  const [resetEmail, setResetEmail]   = useState('')
  const [resetState, setResetState]   = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [resetError, setResetError]   = useState('')

  const navigate = useNavigate()

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  // After email sign-up, apply prefilled role ONLY for new users.
  // Do NOT navigate — let AppContext's hydrateUser + guards handle routing.
  // This prevents the double-navigation race that causes role flips and blank pages.
  async function applyPrefillRoleForNewUser(authUserId) {
    // CRITICAL SAFETY: Only apply prefilled role to NEW users, never returning users.
    // Returning users must keep their existing role (no flipping based on URL param).
    if (!prefilledRole || (prefilledRole !== 'student' && prefilledRole !== 'ngo')) {
      return // No prefilled role, skip
    }

    try {
      await updateUserRow(authUserId, { role: prefilledRole })
      console.log('[auth] prefilled role set to', prefilledRole, 'for new user', authUserId)
    } catch (err) {
      console.error('[auth] failed to set prefilled role:', err.message)
      // Non-fatal: user can still select role manually
    }
  }

  // ── Email submit ─────────────────────────────────────────────────────────────
  // After sign-up/login, do NOT navigate here.
  // AppContext's onAuthStateChange listener will fire immediately and handle routing via hydrateUser + guards.
  // This eliminates the race condition that causes role flips and blank pages.
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email.trim() || !form.password) { setError('Please fill in all required fields.'); return }
    if (mode === 'signup' && !form.name.trim()) { setError('Please enter your name.'); return }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const authUser = await signUp({ name: form.name, email: form.email, password: form.password })
        // For new sign-ups, optionally apply prefilled role from URL param
        // (e.g., landing page CTA with ?role=student)
        // But ONLY for brand new users, not returning users.
        await applyPrefillRoleForNewUser(authUser.id)
        // DO NOT NAVIGATE — AppContext will handle it via onAuthStateChange
      } else {
        const authUser = await logIn({ email: form.email, password: form.password })
        // For returning users, do NOT touch the role — it's already in DB
        // AppContext's onAuthStateChange will fire and route based on existing data
        // DO NOT NAVIGATE — AppContext will handle it via onAuthStateChange
      }
      // Success: Supabase will fire SIGNED_IN, AppContext will hydrate, guards will route
      // User will see loading screen briefly while AppContext initializes
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────────
  // Supabase redirects the browser to Google and back. The session is
  // picked up automatically by AppContext's onAuthStateChange listener.
  async function handleGoogleClick() {
    setGLoading(true)
    try {
      await signInWithGoogle()
      // Page navigates away — nothing more to do here
    } catch (err) {
      setError(err.message)
      setGLoading(false)
    }
  }

  async function handleResetRequest(e) {
    e.preventDefault()
    if (!resetEmail.trim()) { setResetError('Please enter your email address.'); return }
    setResetState('sending')
    setResetError('')
    try {
      await requestPasswordReset(resetEmail.trim())
      setResetState('sent')
    } catch (err) {
      setResetError(err.message)
      setResetState('error')
    }
  }

  function closeForgot() {
    setForgotOpen(false)
    setResetEmail('')
    setResetState('idle')
    setResetError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FAFCFF] to-[#F0F7FF]">
      {/* Animated soft blue balloon bloom background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-12 right-1/3 w-[600px] h-[600px] bg-[#C5E5FF] rounded-full opacity-12 blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, -25, 35, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#A8D8F0] rounded-full opacity-10 blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 40, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#D0E8FF] rounded-full opacity-8 blur-[140px]"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="p-6">
          <Link to="/" aria-label="Hive home">
            <HiveLogo size={24} nameSize="text-[1.45rem]" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-3xl p-8 border border-[#E6EAF0] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#202124] mb-2">
                  {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-[#5F6368] text-xs">
                  {mode === 'signup'
                    ? 'Join students and NGOs doing real work around the world.'
                    : "Good to see you again — let's pick up where you left off."}
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex bg-[#F0F3F8] rounded-2xl p-1 mb-6 gap-1">
                {['signup', 'login'].map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError('') }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      mode === m ? 'bg-white text-[#0B84FF] shadow-[0_2px_8px_rgba(11,132,255,0.12)] border border-[#E6EAF0]' : 'text-[#5F6368] hover:text-[#202124]'
                    }`}
                  >
                    {m === 'signup' ? 'Sign up' : 'Log in'}
                  </button>
                ))}
              </div>

              {/* Google button */}
              <button
                onClick={handleGoogleClick}
                disabled={submitting || googleLoading}
                className="w-full flex items-center justify-center gap-2 bg-white border border-[#E6EAF0] rounded-[16px] px-4 py-3 text-[#202124] font-semibold text-xs hover:border-[#D5DCE6] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {googleLoading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-[#E6EAF0] border-t-[#0B84FF] rounded-full"
                    />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <GoogleIcon size={16} />
                    Continue with Google
                  </>
                )}
              </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#E6EAF0]" />
              <span className="text-[10px] text-[#8A8F98] font-medium tracking-wide">or continue with email</span>
              <div className="flex-1 h-px bg-[#E6EAF0]" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <label className="block text-xs font-semibold text-[#202124] mb-2">Full name</label>
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="Your name" autoComplete="name"
                      className="w-full px-4 py-3 rounded-[16px] border-2 border-[#E6EAF0] bg-white font-medium text-sm text-[#202124] placeholder-[#8A8F98] focus:outline-none focus:border-[#0B84FF] focus:ring-3 focus:ring-[#0B84FF]/10 transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-semibold text-[#0B163F] mb-2">Email address</label>
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full px-4 py-3 rounded-[16px] border-2 border-[#E6E8EF] bg-white font-medium text-sm text-[#0B163F] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0B163F] focus:shadow-sm transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-[#0B163F]">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setForgotOpen(true); setResetEmail(form.email) }}
                      className="text-[10px] text-[#8A8F98] hover:text-[#0B84FF] transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full px-4 py-3 rounded-[16px] border-2 border-[#E6E8EF] bg-white font-medium text-sm text-[#0B163F] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0B163F] focus:shadow-sm transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8F98] hover:text-[#0B84FF] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs text-[#FF4D4F] bg-[#FFF1F0] border border-[#FFCCC7] rounded-2xl px-3 py-2 font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting || googleLoading}
                className="px-6 py-3 rounded-[14px] bg-[#0B84FF] text-white font-semibold text-xs mt-1 transition-all flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[rgba(11,132,255,0.2)]"
              >
                {submitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    />
                    {mode === 'signup' ? 'Creating…' : 'Signing in…'}
                  </>
                ) : (
                  <>
                    {mode === 'signup' ? 'Create account' : 'Log in'}
                    <ArrowRight size={14} className="ml-1" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-[#5F6368] mt-5">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError('') }}
                className="text-[#0B84FF] font-semibold hover:underline"
              >
                {mode === 'signup' ? 'Log in' : 'Sign up'}
              </button>
            </p>

            {mode === 'signup' && (
              <p className="text-center text-[10px] text-[#8A8F98] mt-4 leading-relaxed">
                By creating an account you agree to our terms. We'll never share your data.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Forgot-password modal ── */}
      <AnimatePresence>
        {forgotOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={closeForgot}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
            >
              <div className="w-full max-w-sm pointer-events-auto bg-white rounded-3xl p-8 border border-[#E6EAF0] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                {resetState === 'sent' ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#E6F2FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail size={24} className="text-[#0B163F]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#202124] mb-2">Check your email</h2>
                    <p className="text-xs text-[#5F6368] leading-relaxed mb-6">
                      We sent a password reset link to{' '}
                      <span className="font-semibold text-[#202124]">{resetEmail}</span>.
                      It may take a minute to arrive.
                    </p>
                    <button
                      onClick={closeForgot}
                      className="w-full px-6 py-3 rounded-[14px] bg-[#0B84FF] text-white font-semibold text-xs transition-all hover:shadow-lg hover:shadow-[rgba(11,132,255,0.2)]"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-lg font-bold text-[#202124] mb-2">Reset your password</h2>
                      <p className="text-xs text-[#5F6368]">
                        Enter your email and we'll send you a reset link.
                      </p>
                    </div>

                    <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#0B163F] mb-2">
                          Email address
                        </label>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={e => { setResetEmail(e.target.value); setResetError('') }}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-[#E6EAF0] bg-white font-medium text-sm text-[#202124] placeholder-[#8A8F98] focus:outline-none focus:border-[#0B84FF] focus:ring-3 focus:ring-[#0B84FF]/10 transition-all"
                        />
                      </div>

                      <AnimatePresence>
                        {resetError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-xs text-[#FF4D4F] bg-[#FFF1F0] border border-[#FFCCC7] rounded-2xl px-3 py-2 font-medium"
                          >
                            {resetError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={resetState === 'sending'}
                        className="w-full px-6 py-3 rounded-[14px] bg-[#0B84FF] text-white font-semibold text-xs transition-all flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[rgba(11,132,255,0.2)]"
                      >
                        {resetState === 'sending' ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                            />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send reset link
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={closeForgot}
                        className="text-xs text-[#5F6368] hover:text-[#0B84FF] transition-colors text-center font-medium"
                      >
                        Cancel
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
