// Auth service — all localStorage operations live here.
// To migrate to a real backend (Firebase / Auth0 / Supabase),
// replace the bodies of these functions while keeping the same API shape.

const USERS_KEY   = 'sb_users'
const SESSION_KEY = 'sb_session'

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// ── Mock Google personas ──────────────────────────────────────────────────────
// Each has a stable ID so returning users always restore the same account.
// In a real app this data comes from Google's OAuth token payload.

export const GOOGLE_PERSONAS = [
  {
    id:     'google_maya',
    name:   'Maya Cohen',
    email:  'maya.cohen@gmail.com',
    avatar: null,
  },
  {
    id:     'google_omar',
    name:   'Omar Khatib',
    email:  'omar.khatib@gmail.com',
    avatar: null,
  },
  {
    id:     'google_lina',
    name:   'Lina Mansour',
    email:  'lina.mansour@gmail.com',
    avatar: null,
  },
  {
    id:     'google_noor',
    name:   'Noor Ahmad',
    email:  'noor.ahmad@gmail.com',
    avatar: null,
  },
]

// ── Email / password ──────────────────────────────────────────────────────────

export function signUp({ name, email, password }) {
  const users = getUsers()
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const user = {
    id:           crypto.randomUUID(),
    name:         name.trim(),
    email:        email.toLowerCase().trim(),
    avatar:       null,
    // NOTE: btoa is NOT a secure hash — replace with bcrypt/argon2 on a real backend.
    passwordHash: btoa(password),
    provider:     'email',
    role:         null,
    onboardingComplete: false,
    createdAt:    new Date().toISOString(),
  }
  saveUsers([...users, user])
  localStorage.setItem(SESSION_KEY, user.id)
  return user
}

export function logIn({ email, password }) {
  const users = getUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
  if (!user) throw new Error('No account found with this email.')
  if (user.provider === 'google') {
    throw new Error('This account was created with Google. Please use "Continue with Google".')
  }
  if (user.passwordHash !== btoa(password)) throw new Error('Incorrect password.')
  localStorage.setItem(SESSION_KEY, user.id)
  return user
}

// ── Google OAuth (mock) ───────────────────────────────────────────────────────
// Replace this function body with real OAuth when ready:
//   Firebase:  const result = await signInWithPopup(auth, new GoogleAuthProvider())
//              const { uid, displayName, email, photoURL } = result.user
//   Auth0:     const user = await loginWithPopup({ connection: 'google-oauth2' })
//   Supabase:  await supabase.auth.signInWithOAuth({ provider: 'google' })

export function mockGoogleLogin(personaId) {
  const persona = GOOGLE_PERSONAS.find(p => p.id === personaId) ?? GOOGLE_PERSONAS[0]
  const users   = getUsers()
  let user      = users.find(u => u.id === persona.id)

  if (!user) {
    // First-time sign-in: create an account record for this persona
    user = {
      id:                persona.id,
      name:              persona.name,
      email:             persona.email,
      avatar:            persona.avatar,
      provider:          'google',
      role:              null,
      onboardingComplete: false,
      createdAt:         new Date().toISOString(),
    }
    saveUsers([...users, user])
  }

  localStorage.setItem(SESSION_KEY, user.id)
  return user
}

// ── Session helpers ───────────────────────────────────────────────────────────

export function getSession() {
  const id = localStorage.getItem(SESSION_KEY)
  if (!id) return null
  return getUsers().find(u => u.id === id) || null
}

export function updateStoredUser(id, updates) {
  const users   = getUsers()
  const updated = users.map(u => u.id === id ? { ...u, ...updates } : u)
  saveUsers(updated)
  return updated.find(u => u.id === id) || null
}

// Clears the active session only — profile data stays in localStorage
// so the user's work is not lost on next sign-in.
export function logOut() {
  localStorage.removeItem(SESSION_KEY)
}
