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
    field:        row.field,
    university:   row.university,
    skills:       normalizeSkills(row.skills),
    courses:      row.courses      ?? [],
    interests:    row.interests    ?? [],
    experience:   row.experience,
    goals:        row.goals,
    languages:    row.languages    ?? [],
    availability: row.availability,
    links:        row.links        ?? {},
    bio:          row.bio,
    phone:        row.phone,
  }
}

function studentToDb(userId, profile) {
  return {
    user_id:      userId,
    field:        profile.field        ?? null,
    university:   profile.university   ?? null,
    skills:       profile.skills       ?? [],
    courses:      profile.courses      ?? [],
    interests:    profile.interests    ?? [],
    experience:   profile.experience   ?? null,
    goals:        profile.goals        ?? null,
    languages:    profile.languages    ?? [],
    availability: profile.availability ?? null,
    links:        profile.links        ?? {},
    bio:          profile.bio          ?? null,
    phone:        profile.phone        ?? null,
    updated_at:   new Date().toISOString(),
  }
}

export async function saveStudentProfile(userId, profile) {
  const { error } = await supabase
    .from('student_profiles')
    .upsert(studentToDb(userId, profile), { onConflict: 'user_id' })
  if (error) throw new Error(error.message)
}

export async function loadStudentProfile(userId) {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
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

export async function loadNgoProfile(userId) {
  const { data, error } = await supabase
    .from('ngo_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
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
