// Profile persistence — wraps Supabase.
// Normalizes snake_case DB columns ↔ camelCase JS objects.

import { supabase } from './supabase'

// Normalize skills from DB: could be string[] (old data) or {name,level}[] (new)
function normalizeSkills(raw) {
  return (raw ?? []).map(s => typeof s === 'string' ? { name: s, level: '' } : s)
}

// ── Student profiles ──────────────────────────────────────────────────────────

function dbToStudent(row) {
  if (!row) return null
  return {
    field:               row.field,
    university:         row.university,
    skills:             normalizeSkills(row.skills),
    courses:            row.courses      ?? [],
    interests:          row.interests    ?? [],
    experience:         row.experience,
    experiences:        row.experiences  ?? [],
    goals:              row.goals,
    languages:          row.languages    ?? [],
    availability:       row.availability,
    workMode:           row.work_mode,
    startDate:          row.start_date,
    startMonth:         row.start_month,
    startYear:          row.start_year,
    startImmediately:   row.start_immediately ?? false,
    preferredRoles:     row.preferred_roles,
    links:              row.links        ?? {},
    bio:                row.bio,
    phone:              row.phone,
  }
}

function studentToDb(userId, profile) {
  // skills column is text[] — extract name strings from {name,level} objects
  const skillNames = (profile.skills ?? [])
    .map(s => (typeof s === 'string' ? s : s?.name))
    .filter(Boolean)

  return {
    user_id:           userId,
    field:             profile.field           ?? null,
    university:        profile.university      ?? null,
    skills:            skillNames,
    courses:           profile.courses         ?? [],
    interests:         profile.interests       ?? [],
    experience:        profile.experience?.trim()      || null,
    experiences:       profile.experiences     ?? [],
    goals:             profile.goals?.trim()           || null,
    languages:         profile.languages       ?? [],
    availability:      profile.availability    ?? null,
    work_mode:         profile.workMode        ?? null,
    start_date:        profile.startDate       ?? null,
    start_month:       profile.startMonth      ?? null,
    start_year:        profile.startYear       ?? null,
    start_immediately: profile.startImmediately ?? false,
    preferred_roles:   profile.preferredRoles  ?? null,
    links:             profile.links           ?? {},
    bio:               profile.bio?.trim()             || null,
    phone:             profile.phone?.trim()          || null,
    updated_at:        new Date().toISOString(),
  }
}

export async function saveStudentProfile(userId, profile) {
  const payload = studentToDb(userId, profile)
  console.log('[storage] saveStudentProfile payload:', JSON.stringify(payload))
  const t = Date.now()

  // Abort the underlying fetch if Supabase doesn't respond within 12 seconds.
  // Without an AbortSignal the fetch hangs forever; each retry then competes with
  // the previous orphaned request, causing a lock-wait cascade.
  const controller = new AbortController()
  const abortTimer = setTimeout(() => controller.abort(), 12000)

  try {
    const { error } = await supabase
      .from('student_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .abortSignal(controller.signal)

    clearTimeout(abortTimer)
    console.log(`[storage] saveStudentProfile done in ${Date.now() - t}ms`, error ?? 'ok')
    if (error) throw new Error(`student_profiles upsert: ${error.message}`)
  } catch (err) {
    clearTimeout(abortTimer)
    console.log(`[storage] saveStudentProfile error in ${Date.now() - t}ms`, err.message)
    if (err.name === 'AbortError') {
      throw new Error('Supabase did not respond within 12 s — check your connection and retry.')
    }
    throw err
  }
}

export async function loadStudentProfile(userId, { signal } = {}) {
  let q = supabase.from('student_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (signal) q = q.abortSignal(signal)
  const { data, error } = await q
  if (error) { console.error('[loadStudentProfile] error:', error.message); return null }
  return dbToStudent(data)
}

// ── NGO profiles ──────────────────────────────────────────────────────────────

function dbToNgo(row) {
  if (!row) return null
  return {
    name:        row.name,
    location:    row.location,
    phone:       row.phone,
    description: row.description,
    helpNeeded:  row.help_needed,
    imageUrl:    row.image_url,
    tags:        row.tags ?? [],
    website:     row.website,
    instagram:   row.instagram,
    twitter:     row.twitter,
  }
}

function ngoToDb(userId, profile) {
  return {
    user_id:     userId,
    name:        profile.name        ?? null,
    location:    profile.location    ?? null,
    phone:       profile.phone       ?? null,
    description: profile.description ?? null,
    help_needed: profile.helpNeeded  ?? null,
    image_url:   profile.imageUrl    ?? null,
    tags:        profile.tags        ?? [],
    website:     profile.website     ?? null,
    instagram:   profile.instagram   ?? null,
    twitter:     profile.twitter     ?? null,
    updated_at:  new Date().toISOString(),
  }
}

export async function saveNgoProfile(userId, profile) {
  const { error } = await supabase
    .from('ngo_profiles')
    .upsert(ngoToDb(userId, profile), { onConflict: 'user_id' })
  if (error) throw new Error(error.message)
}

export async function loadNgoProfile(userId, { signal } = {}) {
  let q = supabase.from('ngo_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (signal) q = q.abortSignal(signal)
  const { data, error } = await q
  if (error) { console.error('[loadNgoProfile] error:', error.message); return null }
  return dbToNgo(data)
}

// ── Generic helpers (role-aware) ──────────────────────────────────────────────

export async function saveProfile(userId, profile, role) {
  if (role === 'ngo') return saveNgoProfile(userId, profile)
  return saveStudentProfile(userId, profile)
}

export async function loadProfile(userId, role) {
  if (role === 'ngo') return loadNgoProfile(userId)
  return loadStudentProfile(userId)
}

// ── Onboarding draft (auto-save) ──────────────────────────────────────────────

// Upserts partial profile data + records the current step index.
// Best-effort: never throws — returns true on success, false on any error.
export async function saveOnboardingDraft(userId, role, data, step) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)

  // For students, flatten linkedin/github/portfolio into the links object
  // that studentToDb expects (the onboarding form stores them as flat fields).
  const studentData = role !== 'ngo' ? {
    ...data,
    links: data.links ?? {
      linkedin:  data.linkedin  ?? null,
      github:    data.github    ?? null,
      portfolio: data.portfolio ?? null,
    },
  } : null

  const profileUpsert = role === 'ngo'
    ? supabase.from('ngo_profiles').upsert(ngoToDb(userId, data), { onConflict: 'user_id' }).abortSignal(ctrl.signal)
    : supabase.from('student_profiles').upsert(studentToDb(userId, studentData), { onConflict: 'user_id' }).abortSignal(ctrl.signal)

  const stepUpdate = supabase
    .from('users')
    .update({ onboarding_step: step })
    .eq('id', userId)
    .abortSignal(ctrl.signal)

  try {
    const [pRes, sRes] = await Promise.all([profileUpsert, stepUpdate])
    if (pRes.error) console.warn('[draft] profile:', pRes.error.message)
    if (sRes.error) console.warn('[draft] step:', sRes.error.message)
    return !pRes.error && !sRes.error
  } catch (err) {
    console.warn('[draft] save error:', err.message)
    return false
  } finally {
    clearTimeout(timer)
  }
}

// Converts a loaded student_profiles row back into the onboarding data shape.
export function studentProfileToData(profile) {
  if (!profile) return {}
  return {
    field:        profile.field        ?? '',
    university:   profile.university   ?? '',
    skills:       profile.skills       ?? [],
    courses:      profile.courses      ?? [],
    interests:    profile.interests    ?? [],
    experience:   profile.experience   ?? '',
    goals:        profile.goals        ?? '',
    languages:    profile.languages    ?? [],
    availability: profile.availability ?? '',
    phone:        profile.phone        ?? '',
    linkedin:     profile.links?.linkedin  ?? '',
    github:       profile.links?.github    ?? '',
    portfolio:    profile.links?.portfolio ?? '',
  }
}

// Converts a loaded ngo_profiles row back into the onboarding data shape.
export function ngoProfileToData(profile) {
  if (!profile) return {}
  return {
    name:        profile.name        ?? '',
    location:    profile.location    ?? '',
    phone:       profile.phone       ?? '',
    description: profile.description ?? '',
    helpNeeded:  profile.helpNeeded  ?? '',
    imageUrl:    profile.imageUrl    ?? '',
    website:     profile.website     ?? '',
    instagram:   profile.instagram   ?? '',
    twitter:     profile.twitter     ?? '',
  }
}
