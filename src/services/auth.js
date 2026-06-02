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

export async function getUserRow(userId, { signal } = {}) {
  let q = supabase.from('users').select('*').eq('id', userId).maybeSingle()
  if (signal) q = q.abortSignal(signal)
  const { data, error } = await q
  if (error) {
    console.error('[getUserRow] error:', error.message, '(code:', error.code, ')')
    return null
  }
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

// ── Password reset ────────────────────────────────────────────────────────────

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(error.message)
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}

// Ensure a public.users row exists — called on every sign-in (handles first OAuth).
// Accepts an optional AbortSignal so the caller can enforce a deadline.
export async function ensureUserRow(authUser, { signal } = {}) {
  // Use maybeSingle() instead of single() — single() throws PGRST116 for 0 rows
  // which can trigger the Supabase retry loop (3x, 7 s total delay).
  let selectQ = supabase.from('users').select('id').eq('id', authUser.id).maybeSingle()
  if (signal) selectQ = selectQ.abortSignal(signal)
  const { data: existing, error: selErr } = await selectQ

  if (selErr) console.warn('[ensureUserRow] select error (non-fatal):', selErr.message)
  if (existing) return   // row already exists

  const name =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split('@')[0] ||
    ''

  let insertQ = supabase.from('users').insert({
    id:                  authUser.id,
    name,
    email:               authUser.email,
    role:                null,
    onboarding_complete: false,
    provider:            authUser.app_metadata?.provider || 'email',
  })
  if (signal) insertQ = insertQ.abortSignal(signal)
  const { error: insErr } = await insertQ

  if (insErr && insErr.code !== '23505') {  // 23505 = duplicate key — race condition, not a real error
    console.error('[ensureUserRow] insert error:', insErr.message, '(code:', insErr.code, ')')
  } else {
    console.log('[ensureUserRow] created users row for uid:', authUser.id)
  }
}
