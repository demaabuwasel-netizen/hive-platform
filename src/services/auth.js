// Auth service — wraps Supabase Auth.
// All callers use the same function names as before; only the bodies changed.

import { supabase } from './supabase'

// ── Email / password ──────────────────────────────────────────────────────────

export async function signUp({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw new Error(error.message)
  return data.user
}

export async function logIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data.user
}

// ── Google OAuth ──────────────────────────────────────────────────────────────
// This triggers a full-page redirect to Google and back.
// AppContext's onAuthStateChange listener handles the session after redirect.

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  if (error) throw new Error(error.message)
}

// ── Session helpers ───────────────────────────────────────────────────────────

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function logOut() {
  await supabase.auth.signOut()
}

// ── User row helpers ──────────────────────────────────────────────────────────

export async function getUserRow(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function updateUserRow(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// Ensure a user row exists after OAuth sign-in.
// Called in AppContext after every SIGNED_IN event.
export async function ensureUserRow(authUser) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', authUser.id)
    .single()

  if (existing) return

  const name =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split('@')[0] ||
    ''

  await supabase.from('users').insert({
    id:                  authUser.id,
    name,
    email:               authUser.email,
    role:                null,
    onboarding_complete: false,
    provider:            authUser.app_metadata?.provider || 'email',
  })
}
