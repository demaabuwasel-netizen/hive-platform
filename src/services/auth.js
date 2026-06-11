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
    const { data, error } = await withQueryTimeout(q, 30000, 'getUserRow SELECT')
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
    tid = setTimeout(() => {
      console.warn(`[withQueryTimeout] ⏰ TIMER FIRED — ${label} after ${ms}ms`)
      reject(new Error(`${label} timed out after ${ms} ms`))
    }, ms)
  })
  return Promise.race([
    queryBuilder.then(result => { clearTimeout(tid); return result }),
    timer,
  ])
}

// ── Account reconciliation ────────────────────────────────────────────────────
// Handles the case where the same person has signed up with both Google and
// email/password. Supabase creates two auth.users rows (different IDs, same email).
// This function calls a Supabase RPC (SECURITY DEFINER) that:
//   1. Finds an existing public.users row with the same email but different ID
//   2. Copies role/onboarding/prefs to the new auth ID
//   3. Re-points student_profiles / ngo_profiles to the new user_id
//
// Required SQL (run once in Supabase SQL editor):
// ─────────────────────────────────────────────────────────────────────────────
// CREATE OR REPLACE FUNCTION reconcile_user_by_email(
//   p_new_id  uuid, p_email text, p_name text, p_provider text
// ) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
// DECLARE v_old users%ROWTYPE; v_result jsonb;
// BEGIN
//   SELECT * INTO v_old FROM users WHERE email = p_email AND id != p_new_id LIMIT 1;
//   IF v_old.id IS NULL THEN RETURN NULL; END IF;
//   INSERT INTO users (id,name,email,role,onboarding_complete,onboarding_step,provider,preferred_language,preferred_theme)
//   VALUES (p_new_id,COALESCE(v_old.name,p_name),p_email,v_old.role,v_old.onboarding_complete,
//           v_old.onboarding_step,p_provider,v_old.preferred_language,v_old.preferred_theme)
//   ON CONFLICT (id) DO UPDATE SET role=EXCLUDED.role, onboarding_complete=EXCLUDED.onboarding_complete,
//     onboarding_step=EXCLUDED.onboarding_step, preferred_language=EXCLUDED.preferred_language,
//     preferred_theme=EXCLUDED.preferred_theme;
//   UPDATE student_profiles SET user_id = p_new_id WHERE user_id = v_old.id;
//   UPDATE ngo_profiles     SET user_id = p_new_id WHERE user_id = v_old.id;
//   SELECT jsonb_build_object('old_id',v_old.id,'role',v_old.role,
//     'onboarding_complete',v_old.onboarding_complete,'onboarding_step',v_old.onboarding_step,
//     'preferred_language',v_old.preferred_language,'preferred_theme',v_old.preferred_theme)
//   INTO v_result;
//   RETURN v_result;
// END; $$;
// REVOKE ALL ON FUNCTION reconcile_user_by_email FROM PUBLIC;
// GRANT EXECUTE ON FUNCTION reconcile_user_by_email TO authenticated;
// ─────────────────────────────────────────────────────────────────────────────
export async function reconcileUserByEmail(authUser) {
  const name     = authUser.user_metadata?.full_name || authUser.user_metadata?.name
                || authUser.email?.split('@')[0] || ''
  const provider = authUser.app_metadata?.provider || 'email'

  console.log('[reconcile] checking for linked account — email:', authUser.email, 'uid:', authUser.id)

  try {
    const { data, error } = await withQueryTimeout(
      supabase.rpc('reconcile_user_by_email', {
        p_new_id: authUser.id, p_email: authUser.email, p_name: name, p_provider: provider,
      }),
      5000, 'reconcile_user_by_email'
    )
    if (error) {
      console.warn('[reconcile] RPC unavailable (run the SQL above to enable):', error.message)
      return null
    }
    if (data) {
      console.log('[reconcile] ✓ accounts merged — old_id:', data.old_id, '→', authUser.id,
        '| role:', data.role, '| onboarding_complete:', data.onboarding_complete)
    } else {
      console.log('[reconcile] no linked account found by email')
    }
    return data   // null if no match; object with role/onboarding data if merged
  } catch (err) {
    console.warn('[reconcile] error:', err.message)
    return null
  }
}

// Ensure a public.users row exists — called on every sign-in.
// 1. SELECT by auth user ID. If found → done.
// 2. If not found → try email reconciliation (links Google ↔ email/password accounts).
// 3. If reconciliation finds nothing → INSERT a fresh blank row.
// Each Supabase call is capped at 4 s via Promise.race.
export async function ensureUserRow(authUser, { signal } = {}) {
  const uid = authUser.id
  const t   = Date.now()
  const ms  = () => `+${Date.now() - t}ms`

  // ── SELECT: check if row already exists by auth UID ───────────────────────
  console.log('[ensureUserRow] SELECT start — uid:', uid)
  let existing = null
  try {
    let q = supabase.from('users').select('id').eq('id', uid).maybeSingle()
    if (signal) q = q.abortSignal(signal)
    const { data, error } = await withQueryTimeout(q, 30000, 'ensureUserRow SELECT')
    console.log(`[ensureUserRow] SELECT end ${ms()} — data:`, data, 'error:', error?.message ?? null)
    if (error) console.warn('[ensureUserRow] SELECT error (non-fatal):', error.message, 'code:', error.code)
    existing = data
  } catch (err) {
    console.warn(`[ensureUserRow] SELECT timed out/threw ${ms()} — ${err.message} — skipping INSERT`)
    return
  }

  if (existing) {
    console.log(`[ensureUserRow] row exists ${ms()}`)
    return
  }

  // ── No row by ID — try email reconciliation first ─────────────────────────
  // Handles Google sign-in for a user who previously registered by email/password.
  // If the RPC isn't set up yet, this is a no-op and we fall through to INSERT.
  const reconciled = await reconcileUserByEmail(authUser).catch(() => null)
  if (reconciled) {
    console.log(`[ensureUserRow] row created via reconciliation ${ms()}`)
    return
  }

  // ── INSERT: create a fresh row for a genuinely new user ───────────────────
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
    const { data, error } = await withQueryTimeout(q, 30000, 'ensureUserRow INSERT')
    if (error && error.code !== '23505') {
      console.error(`[ensureUserRow] INSERT error ${ms()}:`, error.message, '(code:', error.code, ')')
    } else if (error?.code === '23505') {
      console.log(`[ensureUserRow] INSERT duplicate (race) ${ms()}`)
    } else {
      console.log(`[ensureUserRow] INSERT done ${ms()}`)
    }
  } catch (err) {
    console.warn(`[ensureUserRow] INSERT timed out/threw ${ms()} — ${err.message}`)
  }
}
