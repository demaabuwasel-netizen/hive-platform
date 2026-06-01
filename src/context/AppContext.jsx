import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { ensureUserRow, getUserRow, updateUserRow, logOut as authLogOut } from '../services/auth'
import { loadStudentProfile, loadNgoProfile, saveProfile } from '../services/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUserState]       = useState(null)
  const [profile, setProfileState] = useState(null)
  const [loading, setLoading]      = useState(true)

  // Load our extended user row + matching profile, given a Supabase auth user
  const hydrateUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUserState(null)
      setProfileState(null)
      return
    }

    // Ensure a users-table row exists (handles first Google sign-in)
    await ensureUserRow(authUser)

    const userRow = await getUserRow(authUser.id)
    if (!userRow) return

    // Merge auth metadata + our users-table row into a single object
    const merged = {
      id:                 authUser.id,
      email:              authUser.email,
      name:               userRow.name,
      avatar:             userRow.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
      role:               userRow.role,
      onboardingComplete: userRow.onboarding_complete,
      provider:           userRow.provider,
    }
    setUserState(merged)

    // Load role-specific profile
    if (userRow.role === 'student') {
      const p = await loadStudentProfile(authUser.id)
      setProfileState(p)
    } else if (userRow.role === 'ngo') {
      const p = await loadNgoProfile(authUser.id)
      setProfileState(p)
    }
  }, [])

  // Bootstrap: get current session, then subscribe to auth changes
  useEffect(() => {
    // Hard 6-second bail-out so a hanging network call never blocks the UI
    const bail = setTimeout(() => setLoading(false), 6000)

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) await hydrateUser(session.user)
      })
      .catch(console.error)
      .finally(() => {
        clearTimeout(bail)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUserState(null)
          setProfileState(null)
          return
        }
        if (session?.user) await hydrateUser(session.user)
      }
    )

    return () => subscription.unsubscribe()
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
