import { useState, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, X } from 'lucide-react'
import HiveLogo from '../components/HiveLogo'
import { useApp } from '../context/AppContext'
import {
  signUp, logIn, mockGoogleLogin, updateStoredUser,
  GOOGLE_PERSONAS,
} from '../services/auth'
import { loadProfile } from '../services/storage'

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

// ── Account picker modal ──────────────────────────────────────────────────────

function GoogleAccountPicker({ onSelect, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-900/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-sm overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[rgba(13,24,61,0.08)]">
          <div className="flex items-center gap-3">
            <GoogleIcon size={22} />
            <div>
              <p className="text-sm font-bold text-[#0D183D]">Sign in with Google</p>
              <p className="text-xs text-navy-400">Choose an account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-navy-400 hover:bg-[#FFF7E6] hover:text-navy-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Account list */}
        <div className="py-2">
          {GOOGLE_PERSONAS.map((persona, i) => (
            <motion.button
              key={persona.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(persona)}
              className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-cream-50 transition-colors text-left"
            >
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-11 h-11 rounded-full bg-cream-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0D183D] truncate">{persona.name}</p>
                <p className="text-xs text-navy-400 truncate">{persona.email}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-cream-50 border-t border-[rgba(13,24,61,0.08)]">
          <p className="text-xs text-navy-400 text-center leading-relaxed">
            This is a demo — no real Google sign-in occurs.
            Each account is fully independent with its own profile data.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── "Signing in" overlay ──────────────────────────────────────────────────────

function SigningInOverlay({ persona }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-900/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-xs p-8 flex flex-col items-center gap-5"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <GoogleIcon size={32} />

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-base font-bold text-[#0D183D]">Signing in…</p>
          <p className="text-xs text-navy-400">Connecting your Google account</p>
        </div>

        <div className="flex items-center gap-3 bg-cream-50 border border-[rgba(13,24,61,0.08)] rounded-2xl px-4 py-3 w-full">
          <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-full bg-cream-200 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0D183D] truncate">{persona.name}</p>
            <p className="text-xs text-navy-400 truncate">{persona.email}</p>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-2" aria-label="Loading">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-honey-400"
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ delay: i * 0.18, repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main auth page ────────────────────────────────────────────────────────────

export default function Auth() {
  const [params]      = useSearchParams()
  const initialMode   = params.get('mode') === 'signup' ? 'signup' : 'login'
  const prefilledRole = params.get('role') // 'student' | 'ngo' from landing CTAs

  const [mode, setMode]             = useState(initialMode)
  const [form, setForm]             = useState({ name: '', email: '', password: '' })
  const [showPassword, setShow]     = useState(false)
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleStep, setGoogleStep] = useState(null) // null | 'picker' | 'signing-in'
  const [googlePersona, setPersona] = useState(null)

  const { setUser, setProfile } = useApp()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const afterAuth = useCallback((authUser) => {
    let finalUser = authUser
    if (prefilledRole && !authUser.onboardingComplete && (prefilledRole === 'student' || prefilledRole === 'ngo')) {
      finalUser = updateStoredUser(authUser.id, { role: prefilledRole }) || { ...authUser, role: prefilledRole }
    }
    setUser(finalUser)
    const savedProfile = loadProfile(finalUser.id)
    if (savedProfile) setProfile(savedProfile)

    if (finalUser.onboardingComplete) {
      navigate(finalUser.role === 'student' ? '/dashboard/student' : '/dashboard/ngo', { replace: true })
    } else if (finalUser.role) {
      navigate(finalUser.role === 'student' ? '/onboarding/student' : '/onboarding/ngo', { replace: true })
    } else {
      navigate('/role-selection', { replace: true })
    }
  }, [prefilledRole, setUser, setProfile, navigate])

  // ── Email submit ─────────────────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault()
    if (!form.email.trim() || !form.password) { setError('Please fill in all required fields.'); return }
    if (mode === 'signup' && !form.name.trim()) { setError('Please enter your name.'); return }
    setSubmitting(true)
    try {
      const authUser = mode === 'signup'
        ? signUp({ name: form.name, email: form.email, password: form.password })
        : logIn({ email: form.email, password: form.password })
      afterAuth(authUser)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  // ── Google flow ──────────────────────────────────────────────────────────────
  function openGooglePicker() { setGoogleStep('picker') }

  function handlePersonaSelect(persona) {
    setPersona(persona)
    setGoogleStep('signing-in')
    // Simulate OAuth round-trip delay
    setTimeout(() => {
      try {
        const authUser = mockGoogleLogin(persona.id)
        afterAuth(authUser)
      } catch (err) {
        setError(err.message)
        setGoogleStep(null)
      }
    }, 1600)
  }

  function cancelGoogle() { setGoogleStep(null); setPersona(null) }

  return (
    <>
      {/* ── Google modals (portalled above everything) ── */}
      <AnimatePresence>
        {googleStep === 'picker' && (
          <GoogleAccountPicker onSelect={handlePersonaSelect} onClose={cancelGoogle} />
        )}
        {googleStep === 'signing-in' && googlePersona && (
          <SigningInOverlay persona={googlePersona} />
        )}
      </AnimatePresence>

      {/* ── Auth card ── */}
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

              {/* Toggle */}
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
                onClick={openGooglePicker}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 bg-white border border-cream-300 rounded-2xl px-6 py-3 text-navy-700 font-semibold text-sm hover:bg-cream-50 hover:border-navy-200 hover:shadow-soft active:scale-[0.98] transition-all duration-200 shadow-card disabled:opacity-50 disabled:cursor-not-allowed mb-5"
              >
                <GoogleIcon />
                Continue with Google
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
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
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
                      <button type="button" className="text-xs text-navy-400 hover:text-navy-600 transition-colors">
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
                  disabled={submitting}
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
      </div>
    </>
  )
}
