import { createContext, useContext, useState, useEffect } from 'react'
import { getSession, updateStoredUser, logOut as authLogOut } from '../services/auth'
import { saveProfile, loadProfile } from '../services/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUserState] = useState(null)
  const [profile, setProfileState] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on first mount
  useEffect(() => {
    const sessionUser = getSession()
    if (sessionUser) {
      setUserState(sessionUser)
      const savedProfile = loadProfile(sessionUser.id)
      if (savedProfile) setProfileState(savedProfile)
    }
    setLoading(false)
  }, [])

  // Plain state setter used after auth — Auth.jsx sets the full user object
  function setUser(next) {
    setUserState(typeof next === 'function' ? next : next)
  }

  // Plain state setter for profile; call saveProfile separately when persisting
  function setProfile(next) {
    setProfileState(next)
  }

  // Update the user's role in both localStorage and context
  function updateRole(role) {
    if (!user) return
    updateStoredUser(user.id, { role })
    setUserState(prev => prev ? { ...prev, role } : prev)
  }

  // Mark onboarding done, persist the profile, update context
  function completeOnboarding(profileData) {
    if (!user) return
    updateStoredUser(user.id, { onboardingComplete: true })
    saveProfile(user.id, profileData)
    setUserState(prev => prev ? { ...prev, onboardingComplete: true } : prev)
    setProfileState(profileData)
  }

  function logout() {
    authLogOut()
    setUserState(null)
    setProfileState(null)
  }

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      profile,
      setProfile,
      updateRole,
      completeOnboarding,
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
