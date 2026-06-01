import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import HiveLogo from '../components/HiveLogo'
import { updatePassword } from '../services/auth'
import { supabase } from '../services/supabase'

// States: 'verifying' | 'ready' | 'invalid' | 'done'
// WHY no window.location.hash check:
//   Supabase JS v2 clears #access_token synchronously inside createClient()
//   via history.replaceState before any React component mounts or useEffect runs.
//   Checking the hash here always sees an empty string → "invalid link".
//   The correct approach is to rely on the PASSWORD_RECOVERY auth event and
//   on getSession() for when the token was already processed before mounting.

export default function ResetPassword() {
  const navigate = useNavigate()

  const [phase, setPhase]       = useState('verifying') // 'verifying' | 'ready' | 'invalid' | 'done'
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [showCf, setShowCf]     = useState(false)
  const [error, setError]       = useState('')
  const [submitting, setSub]    = useState(false)

  useEffect(() => {
    let cancelled = false
    let invalidTimer = null

    function markReady() {
      if (cancelled) return
      clearTimeout(invalidTimer)
      setPhase('ready')
    }

    // Fast path: if Supabase already exchanged the recovery token before this
    // component mounted, getSession() will immediately return a valid session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) {
        markReady()
        return
      }
      // No session yet. Start a 7-second window for the PASSWORD_RECOVERY
      // event to arrive. If it never comes, the token is expired or invalid.
      invalidTimer = setTimeout(() => {
        if (!cancelled) setPhase('invalid')
      }, 7000)
    })

    // Event path: PASSWORD_RECOVERY fires when Supabase exchanges the token
    // from the URL. This is the primary path when the exchange happens after
    // the component mounts.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[ResetPassword] auth event:', event)
        if (event === 'PASSWORD_RECOVERY' && session) {
          markReady()
        }
      }
    )

    return () => {
      cancelled = true
      clearTimeout(invalidTimer)
      subscription.unsubscribe()
    }
  }, [])

  function validate() {
    if (!password)              { setError('Please enter a new password.'); return false }
    if (password.length < 6)   { setError('Password must be at least 6 characters.'); return false }
    if (password !== confirm)  { setError('Passwords do not match.'); return false }
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSub(true)
    setError('')
    try {
      await updatePassword(password)
      setPhase('done')
      setTimeout(() => navigate('/auth', { replace: true }), 2800)
    } catch (err) {
      setError(err.message)
      setSub(false)
    }
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
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="card">

            {/* ── Verifying ── */}
            {phase === 'verifying' && (
              <div className="text-center py-8">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                  className="inline-block w-8 h-8 border-2 border-navy-200 border-t-navy-500 rounded-full mb-4"
                />
                <p className="text-sm text-[#4B6382]">Verifying your link…</p>
              </div>
            )}

            {/* ── Invalid / expired ── */}
            {phase === 'invalid' && (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">🔗</div>
                <h1 className="text-xl font-bold text-[#0D183D] mb-2">Link expired or invalid</h1>
                <p className="text-sm text-[#4B6382] leading-relaxed mb-6">
                  This password reset link has expired or has already been used.
                  Please request a new one.
                </p>
                <Link to="/auth" className="btn-honey inline-block py-3 px-8">
                  Back to login
                </Link>
              </div>
            )}

            {/* ── Success ── */}
            {phase === 'done' && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  className="flex justify-center mb-4">
                  <CheckCircle2 size={52} className="text-emerald-500" />
                </motion.div>
                <h1 className="text-xl font-bold text-[#0D183D] mb-2">Password updated!</h1>
                <p className="text-sm text-[#4B6382]">Redirecting you to login…</p>
              </div>
            )}

            {/* ── Form ── */}
            {phase === 'ready' && (
              <>
                <div className="text-center mb-8">
                  <div className="text-4xl mb-3">🔒</div>
                  <h1 className="text-2xl font-bold text-[#0D183D] mb-1">Set a new password</h1>
                  <p className="text-sm text-[#4B6382]">
                    Choose a strong password for your Hive account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError('') }}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        className="input-field pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-300 hover:text-[#4B6382] transition-colors"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showCf ? 'text' : 'password'}
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setError('') }}
                        placeholder="Repeat your new password"
                        autoComplete="new-password"
                        className="input-field pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCf(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-300 hover:text-[#4B6382] transition-colors"
                        aria-label={showCf ? 'Hide password' : 'Show password'}
                      >
                        {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
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
                        Updating…
                      </span>
                    ) : 'Update password'}
                  </button>
                </form>
              </>
            )}

          </div>
        </motion.div>
      </div>
    </div>
  )
}
