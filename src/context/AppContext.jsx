import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { ensureUserRow, getUserRow, updateUserRow, logOut as authLogOut } from '../services/auth'
import { loadStudentProfile, loadNgoProfile, saveProfile } from '../services/storage'
import i18n from '../i18n/index'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUserState]       = useState(null)
  const [profile, setProfileState] = useState(null)
  const [loading, setLoading]      = useState(true)

  // Load our extended user row + matching profile, given a Supabase auth user.
  // 10-second AbortController covers EVERY Supabase call — none can hang forever.
  // Never throws — always resolves via try/catch/finally.
  const hydrateUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUserState(null)
      setProfileState(null)
      return
    }

    console.log('[hydrateUser] start — uid:', authUser.id,
      'provider:', authUser.app_metadata?.provider ?? 'email')

    const ctrl  = new AbortController()
    const timer = setTimeout(() => {
      console.error('[hydrateUser] 10 s AbortController firing — uid:', authUser.id)
      ctrl.abort()
    }, 10000)

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

    // Track whether we successfully set a real user state.
    // If so, don't overwrite it with minimal on abort/error.
    let userWasSet = false

    try {
      // ── 1. Ensure public.users row ──────────────────────────────────────────
      console.log('[hydrateUser] step 1 — ensureUserRow')
      await ensureUserRow(authUser, { signal: ctrl.signal })
      console.log('[hydrateUser] step 1 — done')

      // ── 2. Fetch full users row ─────────────────────────────────────────────
      console.log('[hydrateUser] step 2 — getUserRow')
      const userRow = await getUserRow(authUser.id, { signal: ctrl.signal })
      console.log('[hydrateUser] step 2 — done, row:', userRow
        ? `role=${userRow.role} onboarding=${userRow.onboarding_complete}`
        : 'null')

      if (!userRow) {
        console.warn('[hydrateUser] users row missing — using minimal state')
        setUserState(minimal)
        userWasSet = true
        return
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
      setUserState(merged)
      userWasSet = true
      console.log('[hydrateUser] user state set — role:', merged.role,
        'onboardingComplete:', merged.onboardingComplete)

      // Restore stored language + theme from DB on login
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

      // ── 3. Load role-specific profile (signal passed — can be aborted too) ──
      if (userRow.role === 'student') {
        console.log('[hydrateUser] step 3 — loadStudentProfile')
        const p = await loadStudentProfile(authUser.id, { signal: ctrl.signal })
        setProfileState(p)
        console.log('[hydrateUser] step 3 — done, profile:', p ? 'loaded' : 'null')
      } else if (userRow.role === 'ngo') {
        console.log('[hydrateUser] step 3 — loadNgoProfile')
        const p = await loadNgoProfile(authUser.id, { signal: ctrl.signal })
        setProfileState(p)
        console.log('[hydrateUser] step 3 — done, profile:', p ? 'loaded' : 'null')
      } else {
        console.log('[hydrateUser] step 3 — skipped (role is null)')
      }

    } catch (err) {
      const isAbort = err.name === 'AbortError'
      console.error('[hydrateUser]', isAbort ? 'ABORTED (10 s)' : 'ERROR',
        '— uid:', authUser.id, isAbort ? '' : err.message)
      // Only fall back to minimal if we never set a real user state.
      // If the abort happened during profile load (step 3), the user is already
      // in context — don't wipe that good state, just skip the profile.
      if (!userWasSet) setUserState(minimal)
    } finally {
      clearTimeout(timer)
      console.log('[hydrateUser] complete — uid:', authUser.id)
    }
  }, [])

  useEffect(() => {
    let disposed        = false
    let hydrateStarted  = false

    // Absolute ceiling: no matter what, loading MUST clear within 15 s.
    // This catches any code path where setLoading(false) is somehow missed.
    const ceiling = setTimeout(() => {
      if (!disposed) {
        console.error('[AppContext] 15 s absolute ceiling hit — forcing setLoading(false)')
        setLoading(false)
      }
    }, 15000)

    // ── Step 1: read localStorage synchronously ───────────────────────────────
    let storedUser = null
    try {
      const lsKey = Object.keys(localStorage).find(
        k => k?.startsWith('sb-') && k.endsWith('-auth-token')
      )
      if (lsKey) {
        const val = JSON.parse(localStorage.getItem(lsKey) ?? 'null')
        storedUser = val?.user ?? null
        console.log('[AppContext] localStorage token found — uid:', storedUser?.id ?? 'none')
      } else {
        console.log('[AppContext] no localStorage session token')
      }
    } catch (e) {
      console.warn('[AppContext] localStorage read error:', e.message)
    }

    // ── Step 2: no stored session → clear loading immediately ─────────────────
    if (!storedUser) {
      clearTimeout(ceiling)
      setLoading(false)
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

    // ── Step 3: stored session found → call getSession() to validate/refresh ───
    const bail = setTimeout(async () => {
      if (disposed || hydrateStarted) return
      hydrateStarted = true
      console.warn('[AppContext] getSession() timed out — localStorage fallback, uid:', storedUser.id)
      try { await hydrateUser(storedUser) } catch (err) { console.error('[AppContext] fallback hydrate error:', err) }
      if (!disposed) { clearTimeout(ceiling); setLoading(false) }
    }, 12000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(bail)
      if (disposed || hydrateStarted) { if (!disposed) { clearTimeout(ceiling); setLoading(false) } return }
      hydrateStarted = true
      if (session?.user) {
        console.log('[AppContext] getSession() — valid, uid:', session.user.id,
          'provider:', session.user.app_metadata?.provider ?? 'email')
        try { await hydrateUser(session.user) }
        catch (err) { console.error('[AppContext] hydrateUser error:', err) }
      } else {
        console.log('[AppContext] getSession() — session expired / refresh failed')
        setUserState(null); setProfileState(null)
      }
      if (!disposed) { clearTimeout(ceiling); setLoading(false) }
    }).catch(async err => {
      clearTimeout(bail)
      if (disposed || hydrateStarted) { if (!disposed) { clearTimeout(ceiling); setLoading(false) } return }
      hydrateStarted = true
      console.error('[AppContext] getSession() network error — localStorage fallback:', err.message)
      try { await hydrateUser(storedUser) } catch {}
      if (!disposed) { clearTimeout(ceiling); setLoading(false) }
    })

    // ── Step 4: subscribe for all subsequent auth events ──────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AppContext] auth event:', event, 'uid:', session?.user?.id ?? 'none')

        if (event === 'SIGNED_OUT') {
          setUserState(null)
          setProfileState(null)
          setLoading(false)
          return
        }

        // SIGNED_IN fires after email/password or OAuth login
        // TOKEN_REFRESHED fires when autoRefreshToken renews the JWT
        // PASSWORD_RECOVERY fires when a recovery link is opened
        // USER_UPDATED fires after updateUser()
        if (session?.user && (
          event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' ||
          event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED'
        )) {
          try { await hydrateUser(session.user) }
          catch (err) { console.error('[AppContext]', event, 'hydrateUser error:', err) }
        }
        // INITIAL_SESSION is intentionally not handled here:
        // getSession() (step 3) already covers the initial restore.
      }
    )

    return () => { disposed = true; clearTimeout(bail); clearTimeout(ceiling); subscription.unsubscribe() }
  }, [hydrateUser])

  // Called from RoleSelection — sets role in DB and updates context
  async function updateRole(role) {
    if (!user) return
    // Reset onboarding step to 0 when selecting a new role to ensure fresh start
    await updateUserRow(user.id, { role, onboarding_step: 0 })
    setUserState(prev => prev ? { ...prev, role, onboardingStep: 0 } : prev)
  }

  // Called at the end of onboarding — saves profile to DB, marks complete.
  // Uses bare mutations (no .select() / .single()) to avoid the known PostgREST
  // hang where the response is held open waiting for a row.
  async function completeOnboarding(profileData) {
    if (!user) throw new Error('Not authenticated — please refresh and try again.')

    const t0 = Date.now()
    const elapsed = () => `+${Date.now() - t0}ms`

    // ── Step 1: upsert student_profiles (or ngo_profiles) ──────────────────
    // saveProfile handles its own AbortController internally (12 s deadline).
    console.log(`[onboarding ${elapsed()}] step 1 — saveProfile (role=${user.role}, userId=${user.id})`)
    try {
      await saveProfile(user.id, profileData, user.role)
    } catch (err) {
      console.error(`[onboarding ${elapsed()}] step 1 FAILED:`, err)
      throw new Error(`Profile save failed: ${err.message}`)
    }
    console.log(`[onboarding ${elapsed()}] step 1 — done`)

    // ── Step 2: mark onboarding complete in users table ────────────────────
    console.log(`[onboarding ${elapsed()}] step 2 — users.update onboarding_complete`)
    const ctrl2 = new AbortController()
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
      console.error(`[onboarding ${elapsed()}] step 2 FAILED (fetch):`, err)
      throw new Error(err.name === 'AbortError'
        ? 'Supabase did not respond within 12 s on step 2 — retry.'
        : `User update failed: ${err.message}`)
    }
    clearTimeout(abort2)
    if (userErr) {
      console.error(`[onboarding ${elapsed()}] step 2 FAILED:`, userErr)
      throw new Error(`User update failed: ${userErr.message}`)
    }
    console.log(`[onboarding ${elapsed()}] step 2 — done`)

    setProfileState(profileData)
    console.log(`[onboarding ${elapsed()}] complete ✓`)
    // NOTE: onboardingComplete is NOT set here — StudentOnboarding shows its
    // success screen first and calls markOnboardingDone() before navigating.
    // Setting it here would fire OnboardingGuard immediately and eject the user
    // before the success screen renders.
  }

  // Called by StudentOnboarding's success screen button, right before navigate.
  // Updating onboardingComplete here (not inside completeOnboarding) lets the
  // success screen render first without being ejected by OnboardingGuard.
  function markOnboardingDone() {
    setUserState(prev => prev ? { ...prev, onboardingComplete: true } : prev)
  }

  // Called from Settings or edit profile pages — updates profile without
  // touching the onboarding flag or the user row
  async function updateProfile(profileData) {
    if (!user) return
    await saveProfile(user.id, profileData, user.role)
    setProfileState(profileData)
  }

  // Plain setter — used when a profile update has already been persisted
  // by the caller (e.g. EditStudentProfile calls the service directly)
  function setProfile(next) {
    setProfileState(typeof next === 'function' ? next(profile) : next)
  }

  // Shallow-merge updates into the in-memory user object (e.g. after a name change)
  function patchUser(updates) {
    setUserState(prev => prev ? { ...prev, ...updates } : prev)
  }

  async function logout() {
    await authLogOut()
    setUserState(null)
    setProfileState(null)
  }

  return (
    <AppContext.Provider value={{
      user,
      profile,
      setProfile,
      patchUser,
      updateRole,
      completeOnboarding,
      markOnboardingDone,
      updateProfile,
      logout,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
