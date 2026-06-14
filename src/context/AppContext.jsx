import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { ensureUserRow, getUserRow, updateUserRow, getProfileRow, upsertProfileRow, logOut as authLogOut } from '../services/auth'
import { loadStudentProfile, loadNgoProfile, saveProfile } from '../services/storage'
import i18n from '../i18n/index'

const AppContext = createContext(null)

// ── Profile localStorage cache ─────────────────────────────────────────────────
// Stores role + onboarding status so the app can restore instantly on refresh
// without waiting for DB calls. Written after every successful hydrateUser.
// Cleared on logout. Falls back gracefully if localStorage is unavailable.
const PROFILE_CACHE_KEY = 'hive_profile_cache'

function readProfileCache(uid) {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.uid === uid ? parsed : null
  } catch { return null }
}

function writeProfileCache(merged) {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
      uid:               merged.id,
      role:              merged.role,
      onboardingComplete: merged.onboardingComplete,
      name:              merged.name,
      avatar:            merged.avatar,
      provider:          merged.provider,
    }))
  } catch {}
}

function clearProfileCache() {
  try { localStorage.removeItem(PROFILE_CACHE_KEY) } catch {}
}

// ── Promise.race timeout helper ────────────────────────────────────────────────
// Uses JS-level timers, NOT AbortSignal — PostgREST-js v2 can swallow AbortError
// and leave the Promise pending even after signal.abort() fires (known issue).
function withStep(promise, label, ms = 4000) {
  let tid
  return Promise.race([
    Promise.resolve(promise).then(r => { clearTimeout(tid); return r }),
    new Promise((_, reject) => {
      tid = setTimeout(() => {
        console.warn(`[withStep] ⏰ TIMER FIRED — ${label} cap=${ms}ms`)
        reject(new Error(`[step:${label}] timed out after ${ms}ms`))
      }, ms)
    }),
  ])
}

export function AppProvider({ children }) {
  const [user, setUserState]             = useState(null)
  const [profile, setProfileState]       = useState(null)
  const [loading, setLoading]            = useState(true)
  // Set to true when the 9-second ceiling fires — triggers recovery UI in LoadingScreen
  const [loadingTimedOut, setTimedOut]   = useState(false)

  // ── hydrateUser ─────────────────────────────────────────────────────────────
  // Steps 1+2 use withStep with 2 s caps. Step 3 (profile) is fire-and-forget.
  // Every await has explicit BEFORE/AFTER console logs with a per-call run-ID
  // and elapsed-ms so the exact hanging query is visible in the console.
  const hydrateUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUserState(null); setProfileState(null); return
    }

    // Unique 4-char ID so parallel calls are distinguishable in the console
    const runId = Math.random().toString(36).slice(2, 6).toUpperCase()
    const t0    = Date.now()
    const ms    = () => `+${Date.now() - t0}ms`
    const log   = (...a) => console.log( `[hU:${runId}]`, ms(), ...a)
    const warn  = (...a) => console.warn( `[hU:${runId}]`, ms(), ...a)
    const err   = (...a) => console.error(`[hU:${runId}]`, ms(), ...a)

    log('START — uid:', authUser.id,
      '| provider:', authUser.app_metadata?.provider ?? 'email',
      '| email:', authUser.email)

    const minimal = {
      id:                 authUser.id,
      email:              authUser.email,
      name:               authUser.user_metadata?.full_name
                            ?? authUser.user_metadata?.name
                            ?? authUser.email?.split('@')[0]
                            ?? 'User',
      avatar:             authUser.user_metadata?.avatar_url ?? null,
      role:               null,
      onboardingComplete: false,
      onboardingStep:     0,
      provider:           authUser.app_metadata?.provider ?? 'email',
    }

    let userWasSet = false

    try {
      // ── Step 1: ensureUserRow (3 s cap — SELECT + possible INSERT) ─────────
      log('STEP 1 — BEFORE ensureUserRow  [withStep cap=3000ms]')
      await withStep(ensureUserRow(authUser), 'ensureUserRow', 3000)
      log('STEP 1 — AFTER  ensureUserRow  OK')

      // ── Step 2: getUserRow (3 s cap) ───────────────────────────────────────
      log('STEP 2 — BEFORE getUserRow     [withStep cap=3000ms]')
      const userRow = await withStep(getUserRow(authUser.id), 'getUserRow', 3000)
      log('STEP 2 — AFTER  getUserRow',
        userRow
          ? `role=${userRow.role} onboarding_complete=${userRow.onboarding_complete}`
          : 'null (row missing or RLS denied)')

      // ── Step 2.5: getProfileRow — authoritative role + onboarding_completed ─
      // profiles table takes priority. If missing/empty, falls back to userRow.
      log('STEP 2.5 — BEFORE getProfileRow [withStep cap=3000ms]')
      let profileRow = null
      try {
        profileRow = await withStep(getProfileRow(authUser.id), 'getProfileRow', 3000)
        log('STEP 2.5 — AFTER  getProfileRow',
          profileRow
            ? `role=${profileRow.role} onboarding_completed=${profileRow.onboarding_completed}`
            : 'null (no profiles row — will fall back to users table)')
      } catch (e) {
        warn('STEP 2.5 — getProfileRow timed out:', e.message, '— continuing with users table')
      }

      // Determine effective role + onboarding from whichever source has data.
      // Priority: profiles.role > users.role (profiles is the new authoritative source).
      // Both may be null for a brand-new user — that is expected and correct.
      const effectiveRole      = profileRow?.role              ?? userRow?.role              ?? null
      const effectiveOnboarded = profileRow?.onboarding_completed ?? userRow?.onboarding_complete ?? false

      log('STEP 2.5 — RESOLVED',
        `effectiveRole=${effectiveRole}`,
        `effectiveOnboarded=${effectiveOnboarded}`,
        `source: profiles=${!!profileRow?.role} | users=${!!userRow?.role}`)

      if (!userRow && !profileRow) {
        // Both DB queries returned nothing. Use the localStorage cache if available
        // so a Supabase timeout doesn't flash a completed user back to role-selection.
        const cached = readProfileCache(authUser.id)
        if (cached?.role) {
          warn('STEP 2.5 — Both DB queries empty, using cache fallback role:', cached.role)
          setUserState({
            id:                 authUser.id,
            email:              authUser.email,
            name:               cached.name   ?? minimal.name,
            avatar:             cached.avatar ?? minimal.avatar,
            role:               cached.role,
            onboardingComplete: cached.onboardingComplete ?? false,
            onboardingStep:     0,
            provider:           cached.provider ?? minimal.provider,
            preferredLanguage:  'en',
            preferredTheme:     'system',
          })
          userWasSet = true
        } else {
          warn('STEP 2.5 — Both DB queries empty, no cache → minimal state (new user)')
          setUserState(minimal); userWasSet = true
        }
        return
      }

      const merged = {
        id:                 authUser.id,
        email:              authUser.email,
        name:               userRow?.name ?? minimal.name,
        avatar:             userRow?.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
        role:               effectiveRole,
        onboardingComplete: effectiveOnboarded,
        onboardingStep:     userRow?.onboarding_step ?? 0,
        provider:           userRow?.provider ?? minimal.provider,
        preferredLanguage:  userRow?.preferred_language ?? 'en',
        preferredTheme:     userRow?.preferred_theme    ?? 'system',
      }
      setUserState(merged); userWasSet = true
      writeProfileCache(merged)
      log('STEP 2.5 — user state COMMITTED | role:', merged.role,
        '| onboardingComplete:', merged.onboardingComplete)

      // Apply stored language / theme preferences
      const pLang  = userRow?.preferred_language
      const pTheme = userRow?.preferred_theme
      if (pLang && pLang !== i18n.language) {
        i18n.changeLanguage(pLang)
        localStorage.setItem('hive_lang', pLang)
        document.documentElement.dir  = (pLang === 'ar' || pLang === 'he') ? 'rtl' : 'ltr'
        document.documentElement.lang = pLang
      }
      if (pTheme) {
        localStorage.setItem('hive_theme', pTheme)
        const resolved = pTheme === 'system'
          ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : pTheme
        document.documentElement.setAttribute('data-theme', resolved)
        document.documentElement.classList[resolved === 'dark' ? 'add' : 'remove']('dark')
      }

      // ── Step 3: profile — fire-and-forget (never blocks loading) ──────────
      if (merged.role === 'student') {
        log('STEP 3 — loadStudentProfile (background)')
        withStep(loadStudentProfile(authUser.id), 'loadStudentProfile', 4000)
          .then(p => { setProfileState(p); log('STEP 3 — loadStudentProfile', p ? 'loaded' : 'null') })
          .catch(e => warn('STEP 3 — loadStudentProfile ERROR:', e.message))
      } else if (merged.role === 'ngo') {
        log('STEP 3 — loadNgoProfile (background)')
        withStep(loadNgoProfile(authUser.id), 'loadNgoProfile', 4000)
          .then(p => { setProfileState(p); log('STEP 3 — loadNgoProfile', p ? 'loaded' : 'null') })
          .catch(e => warn('STEP 3 — loadNgoProfile ERROR:', e.message))
      } else {
        log('STEP 3 — skipped (effectiveRole=null — new user)')
      }

    } catch (catchErr) {
      err('CAUGHT at step:', catchErr.message)
      if (!userWasSet) {
        // DB calls failed. Use the localStorage cache before falling back to
        // minimal state — prevents a Supabase timeout from bouncing completed users
        // to role-selection.
        const cached = readProfileCache(authUser.id)
        if (cached?.role) {
          warn('DB error — using profile cache as recovery, role:', cached.role)
          setUserState({
            id:                 authUser.id,
            email:              authUser.email,
            name:               cached.name   ?? minimal.name,
            avatar:             cached.avatar ?? minimal.avatar,
            role:               cached.role,
            onboardingComplete: cached.onboardingComplete ?? false,
            onboardingStep:     0,
            provider:           cached.provider ?? minimal.provider,
            preferredLanguage:  'en',
            preferredTheme:     'system',
          })
        } else {
          warn('DB error, no cache → minimal fallback (new user or cleared cache)')
          setUserState(minimal)
        }
      }
    }

    log('COMPLETE')
  }, [])

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let disposed       = false
    let hydrateStarted = false

    // finish() — call exactly once per bootstrap to clear the loading gate
    function finish() {
      if (!disposed) { clearTimeout(ceiling); setLoading(false) }
    }

    // ── Absolute ceiling: 12 s ───────────────────────────────────────────────
    // Worst case: bail(3 s) + ensureUserRow(2 s) + getUserRow(2 s)
    //             + getProfileRow(2 s) = 9 s. 12 s gives a 3 s buffer.
    // In practice the optimistic-cache path clears loading immediately.
    const ceiling = setTimeout(() => {
      if (!disposed) {
        console.error('[AppContext] 12 s ceiling fired — forcing loading=false')
        setLoading(false)
        setTimedOut(true)
      }
    }, 12000)

    // ── Step 1: read localStorage synchronously ───────────────────────────────
    let storedUser = null
    try {
      const lsKey = Object.keys(localStorage).find(
        k => k?.startsWith('sb-') && k.endsWith('-auth-token')
      )
      if (lsKey) {
        const val  = JSON.parse(localStorage.getItem(lsKey) ?? 'null')
        storedUser = val?.user ?? null
        console.log('[AppContext] localStorage token — uid:', storedUser?.id ?? 'none',
          'provider:', storedUser?.app_metadata?.provider ?? '?')
      } else {
        console.log('[AppContext] no localStorage token')
      }
    } catch (e) {
      console.warn('[AppContext] localStorage read error:', e.message)
    }

    // ── Optimistic restore ────────────────────────────────────────────────────
    // If we have a valid localStorage cache entry for this user, apply it
    // immediately so route guards see role + onboardingComplete without
    // waiting for any network call. The DB validation below will refresh it.
    if (storedUser) {
      const cached = readProfileCache(storedUser.id)
      if (cached) {
        console.log('[AppContext] cache HIT — restoring immediately uid:', storedUser.id,
          'role:', cached.role, 'onboarding:', cached.onboardingComplete)
        setUserState({
          id:                 storedUser.id,
          email:              storedUser.email,
          name:               cached.name   ?? storedUser.user_metadata?.full_name ?? storedUser.email?.split('@')[0] ?? 'User',
          avatar:             cached.avatar ?? storedUser.user_metadata?.avatar_url ?? null,
          role:               cached.role,
          onboardingComplete: cached.onboardingComplete,
          onboardingStep:     0,
          provider:           cached.provider ?? storedUser.app_metadata?.provider ?? 'email',
        })
        finish()  // loading=false instantly — route guards use cache
      }
    }

    // ── Step 2: no stored session → clear loading immediately ─────────────────
    if (!storedUser) {
      finish()
      // Still subscribe for future SIGNED_IN (user logs in from auth page)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('[AppContext] auth event:', event, 'uid:', session?.user?.id ?? 'none')
          if (event === 'SIGNED_OUT') {
            clearProfileCache(); setUserState(null); setProfileState(null)
          } else if (session?.user) {
            try { await hydrateUser(session.user) }
            catch (err) { console.error('[AppContext]', event, 'hydrateUser error:', err) }
          }
        }
      )
      return () => { disposed = true; subscription.unsubscribe() }
    }

    // ── Step 3: stored session found — validate with getSession() ─────────────
    // bail fires if getSession() takes > 3 s, using storedUser as fallback.
    // 3 s chosen so bail + steps (2 s each) = 7 s stays under the 9 s ceiling.
    const bail = setTimeout(async () => {
      if (disposed || hydrateStarted) return
      hydrateStarted = true
      console.warn('[AppContext] getSession bail (3 s) — using storedUser fallback, uid:', storedUser.id)
      try { await hydrateUser(storedUser) } catch (e) { console.error('[AppContext] fallback error:', e.message) }
      finish()
    }, 3000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(bail)
      if (disposed || hydrateStarted) { finish(); return }
      hydrateStarted = true
      if (session?.user) {
        console.log('[AppContext] getSession valid — uid:', session.user.id,
          'provider:', session.user.app_metadata?.provider ?? 'email')
        try { await hydrateUser(session.user) }
        catch (e) { console.error('[AppContext] hydrateUser error:', e.message) }
      } else {
        console.log('[AppContext] getSession returned null — session expired')
        setUserState(null); setProfileState(null); clearProfileCache()
      }
      finish()
    }).catch(async err => {
      clearTimeout(bail)
      if (disposed || hydrateStarted) { finish(); return }
      hydrateStarted = true
      console.error('[AppContext] getSession network error:', err.message, '— using storedUser')
      try { await hydrateUser(storedUser) } catch (e) { console.error('[AppContext] fallback error:', e.message) }
      finish()
    })

    // ── Step 4: subscribe for subsequent auth events ──────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AppContext] auth event:', event, 'uid:', session?.user?.id ?? 'none')

        if (event === 'SIGNED_OUT') {
          clearProfileCache()
          setUserState(null); setProfileState(null); setLoading(false)
          return
        }

        // SIGNED_IN, TOKEN_REFRESHED, PASSWORD_RECOVERY, USER_UPDATED
        if (session?.user && (
          event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' ||
          event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED'
        )) {
          try { await hydrateUser(session.user) }
          catch (err) { console.error('[AppContext]', event, 'hydrateUser error:', err) }
        }
        // INITIAL_SESSION is covered by getSession() above
      }
    )

    return () => { disposed = true; clearTimeout(bail); clearTimeout(ceiling); subscription.unsubscribe() }
  }, [hydrateUser])

  // ── Exposed actions ──────────────────────────────────────────────────────────

  async function updateRole(role) {
    if (!user) return
    await updateUserRow(user.id, { role })
    upsertProfileRow(user.id, { role })
    setUserState(prev => {
      const next = prev ? { ...prev, role } : prev
      if (next) writeProfileCache(next)
      return next
    })
  }

  async function completeOnboarding(profileData) {
    if (!user) throw new Error('Not authenticated — please refresh and try again.')

    const t0 = Date.now()
    const elapsed = () => `+${Date.now() - t0}ms`

    console.log(`[onboarding ${elapsed()}] step 1 — saveProfile (role=${user.role}, userId=${user.id})`)
    try {
      await saveProfile(user.id, profileData, user.role)
    } catch (err) {
      console.error(`[onboarding ${elapsed()}] step 1 FAILED:`, err)
      throw new Error(`Profile save failed: ${err.message}`)
    }
    console.log(`[onboarding ${elapsed()}] step 1 — done`)

    console.log(`[onboarding ${elapsed()}] step 2 — users.update onboarding_complete`)
    const ctrl2  = new AbortController()
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
      throw new Error(err.name === 'AbortError'
        ? 'Supabase did not respond within 12 s on step 2 — retry.'
        : `User update failed: ${err.message}`)
    }
    clearTimeout(abort2)
    if (userErr) throw new Error(`User update failed: ${userErr.message}`)
    console.log(`[onboarding ${elapsed()}] step 2 — done`)

    // Write onboarding_completed to profiles table — best-effort, never blocks
    upsertProfileRow(user.id, { onboarding_completed: true })

    // Update local state so route guards immediately see onboarding as complete.
    // Without this, user.onboardingComplete remains false until the next full
    // hydrateUser cycle, causing OnboardingGuard to bounce the user back.
    setProfileState(profileData)
    setUserState(prev => {
      const next = prev ? { ...prev, onboardingComplete: true } : prev
      if (next) writeProfileCache(next)
      return next
    })
    console.log(`[onboarding ${elapsed()}] complete ✓`)
  }

  function markOnboardingDone() {
    setUserState(prev => prev ? { ...prev, onboardingComplete: true } : prev)
  }

  async function updateProfile(profileData) {
    if (!user) return
    await saveProfile(user.id, profileData, user.role)
    setProfileState(profileData)
  }

  function setProfile(next) {
    setProfileState(typeof next === 'function' ? next(profile) : next)
  }

  function patchUser(updates) {
    setUserState(prev => prev ? { ...prev, ...updates } : prev)
  }

  async function logout() {
    await authLogOut()
    clearProfileCache()
    setUserState(null); setProfileState(null)
  }

  return (
    <AppContext.Provider value={{
      user, profile, loading, loadingTimedOut,
      setProfile, patchUser,
      updateRole, completeOnboarding, markOnboardingDone, updateProfile, logout,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
