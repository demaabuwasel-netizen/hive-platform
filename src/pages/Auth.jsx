import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
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

  // After email sign-up/in, apply prefilled role if provided, then navigate.
  async function applyRoleAndRedirect(authUserId, isNewUser = false) {
    // Apply prefilled role from landing-page CTA (?role=student / ?role=ngo)
    if (prefilledRole && (prefilledRole === 'student' || prefilledRole === 'ngo')) {
      await updateUserRow(authUserId, { role: prefilledRole })
    }

    // Read the authoritative user row to decide where to send the user.
    // For new sign-ups, the role may have just been set above.
    const userRow = await getUserRow(authUserId)

    console.log('[auth] email SIGNED_IN', {
      uid:      authUserId,
      isNewUser,
      role:     userRow?.role,
      onboarding_complete: userRow?.onboarding_complete,
    })

    let dest
    if (!userRow?.role) {
      dest = '/role-selection'
    } else if (!userRow?.onboarding_complete) {
      dest = `/onboarding/${userRow.role}`
    } else {
      dest = userRow.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/student'
    }

    console.log('[auth] redirect →', dest)
    navigate(dest, { replace: true })
  }

  // ── Email submit ─────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email.trim() || !form.password) { setError('Please fill in all required fields.'); return }
    if (mode === 'signup' && !form.name.trim()) { setError('Please enter your name.'); return }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const authUser = await signUp({ name: form.name, email: form.email, password: form.password })
        await applyRoleAndRedirect(authUser.id, true)
      } else {
        const authUser = await logIn({ email: form.email, password: form.password })
        await applyRoleAndRedirect(authUser.id, false)
      }
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
    <div className="min-h-screen bg-[#FFF7E6] flex flex-col">
      <div className="p-6">
        <Link to="/" aria-label="Hive home">
          <HiveLogo size={28} nameSize="text-lg" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <div className="card">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                key={mode}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-4xl mb-3"
              >
                {mode === 'signup' ? '👋' : '✨'}
              </motion.div>
              <h1 className="text-2xl font-bold text-[#0D183D] mb-1">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-[#4B6382] text-sm">
                {mode === 'signup'
                  ? 'Join students and NGOs doing real work around the world.'
                  : "Good to see you again — let's pick up where you left off."}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-[#FFF7E6] rounded-2xl p-1 mb-6">
              {['signup', 'login'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    mode === m ? 'bg-white text-[#0D183D] shadow-card' : 'text-navy-400 hover:text-navy-600'
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
              className="w-full flex items-center justify-center gap-3 bg-white border border-cream-300 rounded-2xl px-6 py-3 text-navy-700 font-semibold text-sm hover:bg-cream-50 hover:border-navy-200 hover:shadow-soft active:scale-[0.98] transition-all duration-200 shadow-card disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {googleLoading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="inline-block w-4 h-4 border-2 border-navy-200 border-t-navy-600 rounded-full"
                />
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-cream-300" />
              <span className="text-xs text-navy-300 font-medium tracking-wide">or continue with email</span>
              <div className="flex-1 h-px bg-cream-300" />
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
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Full name</label>
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="Your name" autoComplete="name" className="input-field"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Email address</label>
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email" className="input-field"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-navy-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setForgotOpen(true); setResetEmail(form.email) }}
                      className="text-xs text-navy-400 hover:text-navy-600 transition-colors"
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
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-300 hover:text-[#4B6382] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting || googleLoading}
                className="btn-honey mt-2 w-full text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    />
                    Please wait…
                  </span>
                ) : mode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </form>

            <p className="text-center text-sm text-navy-400 mt-5">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError('') }}
                className="text-navy-600 font-medium hover:underline"
              >
                {mode === 'signup' ? 'Log in' : 'Sign up'}
              </button>
            </p>

            {mode === 'signup' && (
              <p className="text-center text-xs text-navy-300 mt-4 leading-relaxed">
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
              className="fixed inset-0 z-40 bg-[#0D183D]/40 backdrop-blur-sm"
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
              <div className="card w-full max-w-sm pointer-events-auto">
                {resetState === 'sent' ? (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-4">📬</div>
                    <h2 className="text-lg font-bold text-[#0D183D] mb-2">Check your email</h2>
                    <p className="text-sm text-[#4B6382] leading-relaxed mb-6">
                      We sent a password reset link to{' '}
                      <span className="font-semibold text-[#0D183D]">{resetEmail}</span>.
                      It may take a minute to arrive.
                    </p>
                    <button onClick={closeForgot} className="btn-honey w-full py-3">
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-3xl mb-3">🔑</div>
                      <h2 className="text-lg font-bold text-[#0D183D] mb-1">Reset your password</h2>
                      <p className="text-sm text-[#4B6382]">
                        Enter your email and we'll send you a reset link.
                      </p>
                    </div>

                    <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={e => { setResetEmail(e.target.value); setResetError('') }}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="input-field"
                        />
                      </div>

                      <AnimatePresence>
                        {resetError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                          >
                            {resetError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={resetState === 'sending'}
                        className="btn-honey w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {resetState === 'sending' ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                            />
                            Sending…
                          </span>
                        ) : 'Send reset link'}
                      </button>

                      <button
                        type="button"
                        onClick={closeForgot}
                        className="text-sm text-navy-400 hover:text-navy-600 transition-colors text-center"
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
  )
}
