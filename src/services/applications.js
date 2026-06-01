import { supabase } from './supabase'
import { computeMatch } from './matching'

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

// NGO: rich applicant list — joins applications, users, student_profiles, opportunities
export async function fetchNgoApplicants(ngoId) {
  const { data: apps, error } = await supabase
    .from('applications')
    .select('*, opportunities(title, category, skills, location, description, mission_impact, work_mode, weekly_hours, languages, field)')
    .eq('ngo_id', ngoId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  if (!apps?.length) return []

  const studentIds = [...new Set(apps.map(a => a.student_id))]

  const [{ data: userData }, { data: profileData }] = await Promise.all([
    supabase.from('users').select('id, name, email').in('id', studentIds),
    supabase.from('student_profiles')
      .select('user_id, field, university, skills, languages, availability, bio, interests, links, experience, goals')
      .in('user_id', studentIds),
  ])

  const userMap    = Object.fromEntries((userData    ?? []).map(u => [u.id,      u]))
  const profileMap = Object.fromEntries((profileData ?? []).map(p => [p.user_id, p]))

  return apps.map(app => {
    const user = userMap[app.student_id]    ?? {}
    const prof = profileMap[app.student_id] ?? {}

    // Build opportunity shape for the matching engine
    const opp = {
      skills:       app.opportunities?.skills        ?? [],
      category:     app.opportunities?.category      ?? '',
      title:        app.opportunities?.title         ?? '',
      description:  app.opportunities?.description   ?? '',
      missionImpact:app.opportunities?.mission_impact ?? '',
      workMode:     app.opportunities?.work_mode     ?? '',
      weeklyHours:  app.opportunities?.weekly_hours  ?? null,
      languages:    app.opportunities?.languages     ?? [],
      field:        app.opportunities?.field         ?? '',
      location:     app.opportunities?.location      ?? '',
    }

    const matchResult = computeMatch(prof, opp)
    const languages   = (prof.languages ?? []).map(l =>
      typeof l === 'string' ? l : `${l.lang}${l.level ? ` (${l.level})` : ''}`)

    return {
      id:               app.id,
      studentId:        app.student_id,
      name:             user.name       ?? 'Applicant',
      email:            user.email      ?? '',
      field:            prof.field      ?? '',
      uni:              prof.university ?? '',
      skills:           toSkillObjects(prof.skills),
      languages,
      availability:     prof.availability ?? '',
      bio:              prof.bio        ?? '',
      interests:        prof.interests  ?? [],
      links:            prof.links      ?? {},
      opportunityTitle: app.opportunities?.title ?? '',
      opportunityId:    app.opportunity_id,
      status:           app.status,
      statusLabel:      STATUS_LABEL[app.status] ?? app.status,
      submittedAt:      app.submitted_at,
      match:            matchResult.score,
      matchReasons:     matchResult.strengths.slice(0, 3),
      breakdown:        matchResult.breakdown,
      location:         app.opportunities?.location ?? '',
      year:             '',
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
