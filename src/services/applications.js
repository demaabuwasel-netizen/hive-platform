import { supabase } from './supabase'

const STATUS_LABEL = {
  submitted:    'Application sent',
  under_review: 'Under review',
  shortlisted:  'Shortlisted',
  interview:    'Interview scheduled',
  accepted:     'Accepted',
  rejected:     'Not selected',
}

function dbToApp(row) {
  if (!row) return null
  return {
    id:            row.id,
    studentId:     row.student_id,
    opportunityId: row.opportunity_id,
    ngoId:         row.ngo_id,
    message:       row.message,
    availability:  row.availability,
    links:         row.links        ?? {},
    status:        row.status,
    statusLabel:   STATUS_LABEL[row.status] ?? row.status,
    submittedAt:   row.submitted_at,
    // joined fields (when fetched with selects)
    ngoName:       row.opportunities?.org_name ?? row.ngo_profiles?.name ?? null,
    role:          row.opportunities?.title    ?? null,
    location:      row.opportunities?.location ?? row.ngo_profiles?.location ?? null,
    category:      row.opportunities?.category ?? null,
  }
}

// Submit a new application
export async function submitApplication({ studentId, opportunityId, ngoId, message, availability, links }) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      student_id:     studentId,
      opportunity_id: opportunityId ?? null,
      ngo_id:         ngoId,
      message,
      availability,
      links: links ?? {},
      status: 'submitted',
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return dbToApp(data)
}

// Student: fetch all own applications
export async function fetchStudentApplications(studentId) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      opportunities (title, org_name, category, location),
      ngo_profiles  (name, location)
    `)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToApp)
}

// NGO: fetch all applications to a specific opportunity
export async function fetchApplicationsForOpportunity(opportunityId) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      student_profiles (field, university, skills, languages, availability, bio, links)
    `)
    .eq('opportunity_id', opportunityId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(row => ({
    ...dbToApp(row),
    studentProfile: row.student_profiles ?? null,
  }))
}

// NGO: fetch all applications across all their opportunities
export async function fetchNgoApplications(ngoId) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      opportunities (title, category, location),
      student_profiles (field, university, skills, languages, availability, bio)
    `)
    .eq('ngo_id', ngoId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(row => ({
    ...dbToApp(row),
    studentProfile: row.student_profiles ?? null,
  }))
}

// NGO: update application status
export async function updateApplicationStatus(applicationId, status) {
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
  if (error) throw new Error(error.message)
}

// ── Skill helpers ─────────────────────────────────────────────────────────────

function toSkillObjects(raw) {
  return (raw ?? []).map(s => typeof s === 'string' ? { name: s, level: '' } : s)
}

function computeMatchScore(studentSkills, oppSkills) {
  const studentNames = toSkillObjects(studentSkills).map(s => s.name.toLowerCase())
  const oppNames = (oppSkills ?? []).map(s => (typeof s === 'string' ? s : s.name ?? '').toLowerCase())
  if (!oppNames.length) return 68
  const matched = studentNames.filter(s => oppNames.some(o => o.includes(s.split(' ')[0]) || s.includes(o.split(' ')[0])))
  return Math.min(60 + matched.length * 9, 95)
}

function matchedSkillNames(studentSkills, oppSkills) {
  const studentObjs = toSkillObjects(studentSkills)
  const oppNames = (oppSkills ?? []).map(s => (typeof s === 'string' ? s : s.name ?? '').toLowerCase())
  return studentObjs.filter(s => oppNames.some(o => o.includes(s.name.toLowerCase().split(' ')[0]) || s.name.toLowerCase().includes(o.split(' ')[0]))).map(s => s.name)
}

// NGO: rich applicant list — joins applications, users, student_profiles, opportunities
export async function fetchNgoApplicants(ngoId) {
  // Step 1: applications + opportunity data
  const { data: apps, error } = await supabase
    .from('applications')
    .select('*, opportunities(title, category, skills, location)')
    .eq('ngo_id', ngoId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  if (!apps?.length) return []

  const studentIds = [...new Set(apps.map(a => a.student_id))]

  // Step 2: user names
  const { data: userData } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', studentIds)

  // Step 3: student profiles
  const { data: profileData } = await supabase
    .from('student_profiles')
    .select('user_id, field, university, skills, languages, availability, bio, interests, links')
    .in('user_id', studentIds)

  const userMap    = Object.fromEntries((userData    ?? []).map(u => [u.id,      u]))
  const profileMap = Object.fromEntries((profileData ?? []).map(p => [p.user_id, p]))

  return apps.map(app => {
    const user = userMap[app.student_id]    ?? {}
    const prof = profileMap[app.student_id] ?? {}
    const oppSkills = app.opportunities?.skills ?? []
    const score     = computeMatchScore(prof.skills, oppSkills)
    const matched   = matchedSkillNames(prof.skills, oppSkills)

    const matchReasons = []
    if (matched.length > 0) {
      matchReasons.push(`${matched.slice(0, 2).join(' & ')} align with the role requirements`)
    }
    matchReasons.push(`Applied to "${app.opportunities?.title || 'your opportunity'}"`)

    const languages = (prof.languages ?? []).map(l =>
      typeof l === 'string' ? l : `${l.lang}${l.level ? ` (${l.level})` : ''}`)

    return {
      id:               app.id,
      studentId:        app.student_id,
      name:             user.name    ?? 'Applicant',
      email:            user.email   ?? '',
      field:            prof.field   ?? '',
      uni:              prof.university ?? '',
      skills:           toSkillObjects(prof.skills),
      languages,
      availability:     prof.availability ?? '',
      bio:              prof.bio     ?? '',
      interests:        prof.interests ?? [],
      links:            prof.links   ?? {},
      opportunityTitle: app.opportunities?.title    ?? '',
      opportunityId:    app.opportunity_id,
      status:           app.status,
      statusLabel:      STATUS_LABEL[app.status] ?? app.status,
      submittedAt:      app.submitted_at,
      match:            score,
      matchReasons,
      // legacy fields the modal reads
      year:             '',
      location:         app.opportunities?.location ?? '',
      projects:         [],
    }
  })
}

// Check if a student already applied to an opportunity
export async function hasApplied(studentId, opportunityId) {
  if (!opportunityId) return false
  const { data } = await supabase
    .from('applications')
    .select('id')
    .eq('student_id', studentId)
    .eq('opportunity_id', opportunityId)
    .single()
  return !!data
}
