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
  // Uses a bare UPDATE (no .select().single()) to avoid a known hang where
  // PostgREST holds the response open waiting for the row, causing the
  // promise to never settle.
  async function completeOnboarding(profileData) {
    if (!user) return

    console.log('[onboarding] step 1 — saving profile…')
    await saveProfile(user.id, profileData, user.role)
    console.log('[onboarding] step 1 — done')

    console.log('[onboarding] step 2 — marking onboarding_complete…')
    const { error } = await supabase
      .from('users')
      .update({ onboarding_complete: true })
      .eq('id', user.id)
    if (error) throw new Error(error.message)
    console.log('[onboarding] step 2 — done')

    setUserState(prev => prev ? { ...prev, onboardingComplete: true } : prev)
    setProfileState(profileData)
    console.log('[onboarding] complete ✓')
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
