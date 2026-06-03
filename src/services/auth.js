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
  console.log('[getUserRow] SELECT — uid:', userId)
  try {
    let q = supabase.from('users').select('*').eq('id', userId).maybeSingle()
    if (signal) q = q.abortSignal(signal)
    const { data, error } = await withQueryTimeout(q, 5000, 'getUserRow SELECT')
    if (error) {
      console.error('[getUserRow] Supabase error:', error.message, '(code:', error.code, ')')
      return null
    }
    console.log('[getUserRow] done — row:', data ? `role=${data.role}` : 'null')
    return data
  } catch (err) {
    console.error('[getUserRow] failed:', err.message)
    return null
  }
}

export async function updateUserRow(userId, updates) {
  // Bare update — no .select()/.single() to avoid PostgREST hang
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
  if (error) throw new Error(error.message)
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

// Race a Supabase query against a ms-millisecond timeout.
// Returns { data, error } on success/Supabase-error, throws on timeout.
// Using Promise.race rather than AbortSignal because postgrest-js v2 can
// swallow AbortError (shouldThrowOnError=false converts it to an error object
// but the Promise may still stay pending), leaving await forever.
function withQueryTimeout(queryBuilder, ms, label) {
  let tid
  const timer = new Promise((_, reject) => {
    tid = setTimeout(() => reject(new Error(`${label} timed out after ${ms} ms`)), ms)
  })
  return Promise.race([
    queryBuilder.then(result => { clearTimeout(tid); return result }),
    timer,
  ])
}

// Ensure a public.users row exists — called on every sign-in (handles first OAuth).
export async function ensureUserRow(authUser, { signal } = {}) {
  const uid = authUser.id
  const t   = Date.now()

  // ── SELECT: check if row already exists ────────────────────────────────────
  console.log('[ensureUserRow] SELECT — uid:', uid)
  let existing = null
  try {
    let q = supabase.from('users').select('id').eq('id', uid).maybeSingle()
    if (signal) q = q.abortSignal(signal)
    const { data, error } = await withQueryTimeout(q, 5000, 'ensureUserRow SELECT')
    if (error) console.warn('[ensureUserRow] SELECT error (non-fatal):', error.message)
    existing = data
  } catch (err) {
    console.warn('[ensureUserRow] SELECT failed:', err.message, 'after', Date.now()-t, 'ms — skipping row creation')
    return  // bail out; getUserRow will also fail and hydrateUser falls back to minimal state
  }

  if (existing) {
    console.log('[ensureUserRow] row exists — uid:', uid, 'in', Date.now()-t, 'ms')
    return
  }

  // ── INSERT: create the row ─────────────────────────────────────────────────
  const name = authUser.user_metadata?.full_name
             || authUser.user_metadata?.name
             || authUser.email?.split('@')[0]
             || ''

  console.log('[ensureUserRow] INSERT — uid:', uid)
  try {
    let q = supabase.from('users').insert({
      id:                  uid,
      name,
      email:               authUser.email,
      role:                null,
      onboarding_complete: false,
      provider:            authUser.app_metadata?.provider || 'email',
    })
    if (signal) q = q.abortSignal(signal)
    const { error } = await withQueryTimeout(q, 5000, 'ensureUserRow INSERT')
    if (error && error.code !== '23505') {
      console.error('[ensureUserRow] INSERT error:', error.message, '(code:', error.code, ')')
    } else {
      console.log('[ensureUserRow] row created — uid:', uid, 'in', Date.now()-t, 'ms')
    }
  } catch (err) {
    console.warn('[ensureUserRow] INSERT failed:', err.message, 'after', Date.now()-t, 'ms')
    // Non-fatal: getUserRow may still return a row (e.g. created by a trigger)
  }
}
