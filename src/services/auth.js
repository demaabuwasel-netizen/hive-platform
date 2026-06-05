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
  const t = Date.now()
  const ms = () => `+${Date.now() - t}ms`
  console.log('[getUserRow] SELECT start — uid:', userId)
  try {
    let q = supabase.from('users').select('*').eq('id', userId).maybeSingle()
    if (signal) q = q.abortSignal(signal)
    const { data, error } = await withQueryTimeout(q, 4000, 'getUserRow SELECT')
    if (error) {
      console.error(`[getUserRow] Supabase error ${ms()}:`, error.message, '(code:', error.code, ')')
      return null
    }
    console.log(`[getUserRow] done ${ms()} — row:`, data ? `role=${data.role} onboarding=${data.onboarding_complete}` : 'null')
    return data
  } catch (err) {
    console.error(`[getUserRow] timed out/threw ${ms()}:`, err.message)
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
// Each Supabase call is capped internally at 4 s via Promise.race (belt-and-suspenders
// against the outer withStep cap in AppContext and PostgREST promise-swallowing).
export async function ensureUserRow(authUser, { signal } = {}) {
  const uid = authUser.id
  const t   = Date.now()
  const ms  = () => `+${Date.now() - t}ms`

  // ── SELECT: check if row already exists ────────────────────────────────────
  console.log('[ensureUserRow] SELECT start — uid:', uid)
  let existing = null
  try {
    let q = supabase.from('users').select('id').eq('id', uid).maybeSingle()
    if (signal) q = q.abortSignal(signal)
    const { data, error } = await withQueryTimeout(q, 4000, 'ensureUserRow SELECT')
    console.log(`[ensureUserRow] SELECT end ${ms()} — data:`, data, 'error:', error?.message ?? null)
    if (error) console.warn('[ensureUserRow] SELECT error (non-fatal):', error.message, 'code:', error.code)
    existing = data
  } catch (err) {
    console.warn(`[ensureUserRow] SELECT timed out/threw ${ms()} — ${err.message} — skipping INSERT`)
    return
  }

  if (existing) {
    console.log(`[ensureUserRow] row exists ${ms()} — skipping INSERT`)
    return
  }

  // ── INSERT: create the row ─────────────────────────────────────────────────
  const name = authUser.user_metadata?.full_name
             || authUser.user_metadata?.name
             || authUser.email?.split('@')[0]
             || ''

  console.log(`[ensureUserRow] INSERT start ${ms()} — uid:`, uid, 'name:', name, 'email:', authUser.email)
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
    const { data, error } = await withQueryTimeout(q, 4000, 'ensureUserRow INSERT')
    if (error && error.code !== '23505') {
      console.error(`[ensureUserRow] INSERT error ${ms()}:`, error.message, '(code:', error.code, ')')
    } else if (error?.code === '23505') {
      console.log(`[ensureUserRow] INSERT duplicate (race — row created by parallel call) ${ms()}`)
    } else {
      console.log(`[ensureUserRow] INSERT done ${ms()} — data:`, data)
    }
  } catch (err) {
    console.warn(`[ensureUserRow] INSERT timed out/threw ${ms()} — ${err.message}`)
    // Non-fatal: getUserRow will still run and may find the row
  }
}
