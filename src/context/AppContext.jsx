import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { ensureUserRow, getUserRow, updateUserRow, logOut as authLogOut } from '../services/auth'
import { loadStudentProfile, loadNgoProfile, saveProfile } from '../services/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUserState]       = useState(null)
  const [profile, setProfileState] = useState(null)
  const [loading, setLoading]      = useState(true)

  // Load our extended user row + matching profile, given a Supabase auth user.
  // Never throws — always resolves so the caller can reliably clear loading state.
  const hydrateUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUserState(null)
      setProfileState(null)
      return
    }

    console.log('[hydrateUser] auth user:', {
      id:       authUser.id,
      email:    authUser.email,
      provider: authUser.app_metadata?.provider,
    })

    // Ensure a public.users row exists (handles first Google sign-in)
    await ensureUserRow(authUser)

    const userRow = await getUserRow(authUser.id)
    console.log('[hydrateUser] public.users row:', userRow)

    if (!userRow) {
      // getUserRow failed (network error, RLS issue, etc.).
      // Fall back to minimal auth-only state so the user is NOT logged out
      // over a temporary DB hiccup. They'll land on role-selection (role=null).
      console.warn('[hydrateUser] users row missing — using minimal auth state')
      setUserState({
        id:                 authUser.id,
        email:              authUser.email,
        name:               authUser.user_metadata?.full_name
                              ?? authUser.user_metadata?.name
                              ?? authUser.email?.split('@')[0]
                              ?? 'User',
        avatar:             authUser.user_metadata?.avatar_url ?? null,
        role:               null,
        onboardingComplete: false,
        provider:           authUser.app_metadata?.provider ?? 'email',
      })
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
    }
    console.log('[hydrateUser] merged user:', {
      role: merged.role, onboardingComplete: merged.onboardingComplete,
    })
    setUserState(merged)

    if (userRow.role === 'student') {
      const p = await loadStudentProfile(authUser.id)
      setProfileState(p)
    } else if (userRow.role === 'ngo') {
      const p = await loadNgoProfile(authUser.id)
      setProfileState(p)
    }
  }, [])

  // Bootstrap: subscribe to auth state changes.
  //
  // WHY no getSession() call here:
  //   onAuthStateChange fires INITIAL_SESSION on every page load (with the
  //   existing session if one exists, or null if not). Calling getSession()
  //   separately causes two parallel hydrateUser executions (double hydration
  //   race). INITIAL_SESSION is the single reliable bootstrap event.
  //
  // WHY setLoading(false) only in INITIAL_SESSION:
  //   INITIAL_SESSION is guaranteed to fire exactly once per page load,
  //   making it the correct and only place to clear the loading gate.
  useEffect(() => {
    // Safety bail — fires only if INITIAL_SESSION never arrives (should not happen)
    const bail = setTimeout(() => {
      console.warn('[AppContext] INITIAL_SESSION never fired — clearing loading')
      setLoading(false)
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AppContext] auth event:', event, 'uid:', session?.user?.id ?? 'none')

        if (event === 'SIGNED_OUT') {
          setUserState(null)
          setProfileState(null)
          clearTimeout(bail)
          setLoading(false)
          return
        }

        if (event === 'INITIAL_SESSION' || event === 'PASSWORD_RECOVERY') {
          // Cancel the safety bail immediately — INITIAL_SESSION has arrived,
          // so the bail's "never fired" scenario can no longer happen.
          // Cancelling here (before await) prevents the bail from racing with
          // a slow hydrateUser and incorrectly setting loading=false early.
          clearTimeout(bail)

          if (session?.user) {
            console.log('[AppContext] session found — uid:', session.user.id,
              'provider:', session.user.app_metadata?.provider ?? 'email')
            try { await hydrateUser(session.user) }
            catch (err) { console.error('[AppContext]', event, 'hydrateUser error:', err) }
          } else {
            console.log('[AppContext] no session on', event, '— user is logged out')
          }

          setLoading(false)
          return
        }

        // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED …
        if (session?.user) {
          try { await hydrateUser(session.user) }
          catch (err) { console.error('[AppContext]', event, 'hydrateUser error:', err) }
        }
      }
    )

    return () => { subscription.unsubscribe(); clearTimeout(bail) }
  }, [hydrateUser])

  // Called from RoleSelection — sets role in DB and updates context
  async function updateRole(role) {
    if (!user) return
    await updateUserRow(user.id, { role })
    setUserState(prev => prev ? { ...prev, role } : prev)
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
