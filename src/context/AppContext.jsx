import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { ensureUserRow, getUserRow, updateUserRow, logOut as authLogOut } from '../services/auth'
import { loadStudentProfile, loadNgoProfile, saveProfile } from '../services/storage'
import i18n from '../i18n/index'

const AppContext = createContext(null)

// ── Promise.race timeout helper ────────────────────────────────────────────────
// Every async call in hydrateUser goes through this. It uses JS-level timers,
// NOT AbortSignal — because PostgREST-js v2 can swallow AbortError and leave
// the Promise pending even after signal.abort() fires (known issue).
function withStep(promise, label, ms = 4000) {
  let tid
  return Promise.race([
    Promise.resolve(promise).then(r => { clearTimeout(tid); return r }),
    new Promise((_, reject) => {
      tid = setTimeout(
        () => reject(new Error(`[step:${label}] timed out after ${ms}ms`)),
        ms
      )
    }),
  ])
}

export function AppProvider({ children }) {
  const [user, setUserState]             = useState(null)
  const [profile, setProfileState]       = useState(null)
  const [loading, setLoading]            = useState(true)
  // Set to true when the 9-second ceiling fires — triggers recovery UI in LoadingScreen
  const [loadingTimedOut, setTimedOut]   = useState(false)

  // ── hydrateUser ─────────────────────────────────────────────────────────────
  // Steps 1+2 use withStep with 6 s caps. Step 3 (profile) is fire-and-forget.
  // Worst-case blocking time: 6+6 = 12 s (exceeds 9 s ceiling but never throws). Never throws — always resolves via try/catch.
  const hydrateUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUserState(null); setProfileState(null); return
    }

    console.log('[hydrateUser] start — uid:', authUser.id,
      'provider:', authUser.app_metadata?.provider ?? 'email')

    const minimal = {
      id:                 authUser.id,
      email:              authUser.email,
      name:               authUser.user_metadata?.full_name
                            ?? authUser.user_metadata?.name
                            ?? authUser.email?.split('@')[0]
                            ?? 'User',
      avatar:             authUser.user_metadata?.avatar_url ?? null,
      role:               null,
      onboardingComplete: false,
      onboardingStep:     0,
      provider:           authUser.app_metadata?.provider ?? 'email',
    }

    let userWasSet = false

    try {
      // ── 1. ensureUserRow (6 s cap) ─────────────────────────────────────────
      // Increased from 4s to 6s for slow Supabase connections
      console.log('[hydrateUser] step 1 — ensureUserRow')
      await withStep(ensureUserRow(authUser), 'ensureUserRow', 6000)
      console.log('[hydrateUser] step 1 — done')

      // ── 2. getUserRow (6 s cap) ────────────────────────────────────────────
      // Increased from 4s to 6s for slow Supabase connections
      console.log('[hydrateUser] step 2 — getUserRow')
      const userRow = await withStep(getUserRow(authUser.id), 'getUserRow', 6000)
      console.log('[hydrateUser] step 2 — done:', userRow
        ? `role=${userRow.role} onboarding=${userRow.onboarding_complete}`
        : 'null (will use minimal state)')

      if (!userRow) {
        console.warn('[hydrateUser] users row missing — minimal state')
        setUserState(minimal); userWasSet = true; return
      }

      const merged = {
        id:                 authUser.id,
        email:              authUser.email,
        name:               userRow.name,
        avatar:             userRow.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
        role:               userRow.role,
        onboardingComplete: userRow.onboarding_complete,
        onboardingStep:     userRow.onboarding_step ?? 0,
        provider:           userRow.provider,
        preferredLanguage:  userRow.preferred_language ?? 'en',
        preferredTheme:     userRow.preferred_theme    ?? 'system',
      }
      setUserState(merged); userWasSet = true
      console.log('[hydrateUser] user set — role:', merged.role,
        'onboardingComplete:', merged.onboardingComplete)

      // Apply stored language / theme preferences
      const pLang  = userRow.preferred_language
      const pTheme = userRow.preferred_theme
      if (pLang && pLang !== i18n.language) {
        i18n.changeLanguage(pLang)
        localStorage.setItem('hive_lang', pLang)
        document.documentElement.dir  = (pLang === 'ar' || pLang === 'he') ? 'rtl' : 'ltr'
        document.documentElement.lang = pLang
      }
      if (pTheme) {
        localStorage.setItem('hive_theme', pTheme)
        const resolved = pTheme === 'system'
          ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : pTheme
        document.documentElement.setAttribute('data-theme', resolved)
        document.documentElement.classList[resolved === 'dark' ? 'add' : 'remove']('dark')
      }

      // ── 3. Profile load — fire-and-forget (never blocks finish/loading) ────
      // Loading clears after step 2. Profile arrives asynchronously and triggers
      // a re-render on whichever page the user is viewing. Pages handle null profile.
      if (userRow.role === 'student') {
        console.log('[hydrateUser] step 3 — loadStudentProfile (background)')
        withStep(loadStudentProfile(authUser.id), 'loadStudentProfile', 4000)
          .then(p => {
            setProfileState(p)
            console.log('[hydrateUser] step 3 — done, profile:', p ? 'loaded' : 'null')
          })
          .catch(e => {
            console.warn('[hydrateUser] step 3 profile error:', e.message)
            // Still set to null so pages know profile failed to load
            setProfileState(null)
          })
      } else if (userRow.role === 'ngo') {
        console.log('[hydrateUser] step 3 — loadNgoProfile (background)')
        withStep(loadNgoProfile(authUser.id), 'loadNgoProfile', 4000)
          .then(p => {
            setProfileState(p)
            console.log('[hydrateUser] step 3 — done, profile:', p ? 'loaded' : 'null')
          })
          .catch(e => {
            console.warn('[hydrateUser] step 3 profile error:', e.message)
            // Still set to null so pages know profile failed to load
            setProfileState(null)
          })
      } else {
        console.log('[hydrateUser] step 3 — skipped (role null)')
      }

    } catch (err) {
      console.error('[hydrateUser] failed at step:', err.message)
      if (!userWasSet) {
        console.warn('[hydrateUser] applying minimal fallback state')
        setUserState(minimal)
      }
      // If we had set user already (step 3 timed out), keep the good state
    }

    console.log('[hydrateUser] complete — uid:', authUser.id)
  }, [])

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let disposed       = false
    let hydrateStarted = false

    // finish() — call exactly once per bootstrap to clear the loading gate
    function finish() {
      if (!disposed) { clearTimeout(ceiling); setLoading(false) }
    }

    // ── Absolute ceiling: 9 s ────────────────────────────────────────────────
    // Worst case: bail(3 s) + ensureUserRow(2 s) + getUserRow(2 s) = 7 s.
    // The ceiling at 9 s gives a 2 s buffer and should NEVER fire in practice.
    const ceiling = setTimeout(() => {
      if (!disposed) {
        console.error('[AppContext] 9 s ceiling fired — forcing loading=false')
        setLoading(false)
        setTimedOut(true)
      }
    }, 9000)

    // ── Step 1: read localStorage synchronously ───────────────────────────────
    let storedUser = null
    try {
      const lsKey = Object.keys(localStorage).find(
        k => k?.startsWith('sb-') && k.endsWith('-auth-token')
      )
      if (lsKey) {
        const val  = JSON.parse(localStorage.getItem(lsKey) ?? 'null')
        storedUser = val?.user ?? null
        console.log('[AppContext] localStorage token — uid:', storedUser?.id ?? 'none',
          'provider:', storedUser?.app_metadata?.provider ?? '?')
      } else {
        console.log('[AppContext] no localStorage token')
      }
    } catch (e) {
      console.warn('[AppContext] localStorage read error:', e.message)
    }

    // ── Step 2: no stored session → clear loading immediately ─────────────────
    if (!storedUser) {
      finish()
      // Still subscribe for future SIGNED_IN (user logs in from auth page)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('[AppContext] auth event:', event, 'uid:', session?.user?.id ?? 'none')
          if (event === 'SIGNED_OUT') {
            setUserState(null); setProfileState(null)
          } else if (session?.user) {
            try { await hydrateUser(session.user) }
            catch (err) { console.error('[AppContext]', event, 'hydrateUser error:', err) }
          }
        }
      )
      return () => { disposed = true; subscription.unsubscribe() }
    }

    // ── Step 3: stored session found — validate with getSession() ─────────────
    // bail fires if getSession() takes > 3 s, using storedUser as fallback.
    // 3 s chosen so bail + steps (2 s each) = 7 s stays under the 9 s ceiling.
    const bail = setTimeout(async () => {
      if (disposed || hydrateStarted) return
      hydrateStarted = true
      console.warn('[AppContext] getSession bail (3 s) — using storedUser fallback, uid:', storedUser.id)
      try { await hydrateUser(storedUser) } catch (e) { console.error('[AppContext] fallback error:', e.message) }
      finish()
    }, 3000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(bail)
      if (disposed || hydrateStarted) { finish(); return }
      hydrateStarted = true
      if (session?.user) {
        console.log('[AppContext] getSession valid — uid:', session.user.id,
          'provider:', session.user.app_metadata?.provider ?? 'email')
        try { await hydrateUser(session.user) }
        catch (e) { console.error('[AppContext] hydrateUser error:', e.message) }
      } else {
        console.log('[AppContext] getSession returned null — session expired')
        setUserState(null); setProfileState(null)
      }
      finish()
    }).catch(async err => {
      clearTimeout(bail)
      if (disposed || hydrateStarted) { finish(); return }
      hydrateStarted = true
      console.error('[AppContext] getSession network error:', err.message, '— using storedUser')
      try { await hydrateUser(storedUser) } catch (e) { console.error('[AppContext] fallback error:', e.message) }
      finish()
    })

    // ── Step 4: subscribe for subsequent auth events ──────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AppContext] auth event:', event, 'uid:', session?.user?.id ?? 'none')

        if (event === 'SIGNED_OUT') {
          setUserState(null); setProfileState(null); setLoading(false)
          return
        }

        // SIGNED_IN, TOKEN_REFRESHED, PASSWORD_RECOVERY, USER_UPDATED
        if (session?.user && (
          event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' ||
          event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED'
        )) {
          try { await hydrateUser(session.user) }
          catch (err) { console.error('[AppContext]', event, 'hydrateUser error:', err) }
        }
        // INITIAL_SESSION is covered by getSession() above
      }
    )

    return () => { disposed = true; clearTimeout(bail); clearTimeout(ceiling); subscription.unsubscribe() }
  }, [hydrateUser])

  // ── Exposed actions ──────────────────────────────────────────────────────────

  async function updateRole(role) {
    if (!user) return
    // Reset onboarding step to 0 when selecting a new role to ensure fresh start
    await updateUserRow(user.id, { role, onboarding_step: 0 })
    setUserState(prev => prev ? { ...prev, role, onboardingStep: 0 } : prev)
  }

  async function completeOnboarding(profileData) {
    if (!user) throw new Error('Not authenticated — please refresh and try again.')

    const t0 = Date.now()
    const elapsed = () => `+${Date.now() - t0}ms`

    console.log(`[onboarding ${elapsed()}] step 1 — saveProfile (role=${user.role}, userId=${user.id})`)
    try {
      await saveProfile(user.id, profileData, user.role)
    } catch (err) {
      console.error(`[onboarding ${elapsed()}] step 1 FAILED:`, err)
      throw new Error(`Profile save failed: ${err.message}`)
    }
    console.log(`[onboarding ${elapsed()}] step 1 — done`)

    console.log(`[onboarding ${elapsed()}] step 2 — users.update onboarding_complete`)
    const ctrl2  = new AbortController()
    const abort2 = setTimeout(() => ctrl2.abort(), 12000)
    let userErr
    try {
      ;({ error: userErr } = await supabase
        .from('users')
        .update({ onboarding_complete: true })
        .eq('id', user.id)
        .abortSignal(ctrl2.signal))
    } catch (err) {
      clearTimeout(abort2)
      throw new Error(err.name === 'AbortError'
        ? 'Supabase did not respond within 12 s on step 2 — retry.'
        : `User update failed: ${err.message}`)
    }
    clearTimeout(abort2)
    if (userErr) throw new Error(`User update failed: ${userErr.message}`)
    console.log(`[onboarding ${elapsed()}] step 2 — done`)

    setProfileState(profileData)
    console.log(`[onboarding ${elapsed()}] complete ✓`)
  }

  function markOnboardingDone() {
    setUserState(prev => prev ? { ...prev, onboardingComplete: true } : prev)
  }

  async function updateProfile(profileData) {
    if (!user) return
    await saveProfile(user.id, profileData, user.role)
    setProfileState(profileData)
  }

  function setProfile(next) {
    setProfileState(typeof next === 'function' ? next(profile) : next)
  }

  function patchUser(updates) {
    setUserState(prev => prev ? { ...prev, ...updates } : prev)
  }

  async function logout() {
    await authLogOut()
    setUserState(null); setProfileState(null)
  }

  return (
    <AppContext.Provider value={{
      user, profile, loading, loadingTimedOut,
      setProfile, patchUser,
      updateRole, completeOnboarding, markOnboardingDone, updateProfile, logout,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
