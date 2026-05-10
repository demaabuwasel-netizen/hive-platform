// Profile persistence — all profile read/write operations live here.
// To migrate to a real backend, replace these with API calls (fetch/axios/supabase-js)
// while keeping the same function signatures.

const PROFILE_PREFIX = 'sb_profile_'

export function saveProfile(userId, profile) {
  localStorage.setItem(`${PROFILE_PREFIX}${userId}`, JSON.stringify(profile))
}

export function loadProfile(userId) {
  try {
    const raw = localStorage.getItem(`${PROFILE_PREFIX}${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearProfile(userId) {
  localStorage.removeItem(`${PROFILE_PREFIX}${userId}`)
}
