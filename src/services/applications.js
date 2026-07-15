import { supabase } from './supabase'
import { computeMatch } from './matching'
import { parseSkillString } from './opportunities'

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
      opportunities (id, title, category, location, ngo_id)
    `)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)

  // Fetch NGO names separately
  const ngoIds = [...new Set((data ?? []).map(a => a.ngo_id).filter(Boolean))]
  let ngoMap = {}
  if (ngoIds.length > 0) {
    const { data: ngos } = await supabase
      .from('ngo_profiles')
      .select('id, user_id, name')
      .in('user_id', ngoIds)
    ngoMap = Object.fromEntries((ngos ?? []).map(n => [n.user_id, n.name]))
  }

  return (data ?? []).map(row => {
    const app = dbToApp(row)
    // Add NGO name from the map if not already there
    if (!app.ngoName && row.ngo_id) {
      app.ngoName = ngoMap[row.ngo_id] || 'NGO'
    }
    return app
  })
}

// NGO: fetch all applications to a specific opportunity
export async function fetchApplicationsForOpportunity(opportunityId) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      student_profiles (field, university, skills, languages, bio, links)
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
      student_profiles (field, university, skills, languages, bio)
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
  return (raw ?? []).map(parseSkillString)
}

// NGO: rich applicant list — joins applications, users, student_profiles, opportunities
// Loads student profiles for a set of ids. Tries to include country/city (used by the
// Analytics map); if the add_student_location.sql migration hasn't run yet, those columns
// don't exist and Supabase rejects the whole select — so retry with the base columns.
async function fetchStudentProfilesFor(studentIds) {
  const baseColumns = 'user_id, field, university, skills, languages, bio, interests, links, experience, goals'
  let { data, error } = await supabase
    .from('student_profiles')
    .select(`${baseColumns}, country, city`)
    .in('user_id', studentIds)
  if (error) {
    ;({ data } = await supabase.from('student_profiles').select(baseColumns).in('user_id', studentIds))
  }
  return data
}

export async function fetchNgoApplicants(ngoId) {
  const { data: apps, error } = await supabase
    .from('applications')
    .select('*, opportunities(title, category, skills, location, description, mission_impact, work_mode, weekly_hours, languages, field)')
    .eq('ngo_id', ngoId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  if (!apps?.length) return []

  const studentIds = [...new Set(apps.map(a => a.student_id))]

  const [{ data: userData }, profileData] = await Promise.all([
    supabase.from('users').select('id, name, email').in('id', studentIds),
    fetchStudentProfilesFor(studentIds),
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
      bio:              prof.bio        ?? '',
      interests:        prof.interests  ?? [],
      links:            prof.links      ?? {},
      experience:       prof.experience ?? '',
      goals:            prof.goals      ?? '',
      opportunityTitle: app.opportunities?.title ?? '',
      opportunityId:    app.opportunity_id,
      status:           app.status,
      statusLabel:      STATUS_LABEL[app.status] ?? app.status,
      submittedAt:      app.submitted_at,
      match:            matchResult.score,
      matchReasons:     matchResult.strengths.slice(0, 3),
      breakdown:        matchResult.breakdown,
      location:         app.opportunities?.location ?? '',
      studentLocation:  [prof.city, prof.country].filter(Boolean).join(', '),
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

// ────────────────────────────────────────────────────────────────────────────────
// PHASE 1 DATA LAYER: Role-based applicant management
// ────────────────────────────────────────────────────────────────────────────────

// NGO: fetch all opportunities posted by this NGO with applicant count summaries
export async function fetchNgoOpportunitiesWithApplicantCounts(ngoId) {
  const { data: opps, error: oppError } = await supabase
    .from('opportunities')
    .select('id, title, location, work_mode, weekly_hours, status')
    .eq('ngo_id', ngoId)
    .order('created_at', { ascending: false })

  if (oppError) {
    console.error('Opportunities fetch error:', oppError)
    throw new Error(oppError.message)
  }
  if (!opps?.length) {
    console.log('No opportunities found for ngoId:', ngoId)
    return []
  }

  // Get applicant counts and statuses for each opportunity
  const { data: appCounts, error: countError } = await supabase
    .from('applications')
    .select('opportunity_id, status')
    .in('opportunity_id', opps.map(o => o.id))

  if (countError) throw new Error(countError.message)

  // Build a map of opportunity_id -> visible totals plus status counts.
  const statMap = {}
  (appCounts ?? []).forEach(app => {
    if (!statMap[app.opportunity_id]) {
      statMap[app.opportunity_id] = { total: 0, new: 0, shortlisted: 0, interview: 0, rejected: 0 }
    }

    const uiStatus = app.status === 'submitted' || app.status === 'under_review' ? 'new' : app.status
    if (uiStatus !== 'rejected') {
      statMap[app.opportunity_id].total++
    }
    if (statMap[app.opportunity_id][uiStatus] !== undefined) {
      statMap[app.opportunity_id][uiStatus]++
    }
  })

  // Merge opportunity data with stats
  return opps.map(opp => ({
    id: opp.id,
    title: opp.title,
    location: opp.location,
    workMode: opp.work_mode,
    weeklyHours: opp.weekly_hours,
    status: opp.status,
    stats: statMap[opp.id] ?? { total: 0, new: 0, shortlisted: 0, interview: 0, rejected: 0 },
  }))
}

// NGO: fetch applicants for a specific opportunity with full profile + match scores
export async function fetchOpportunityApplicantsWithMatches(opportunityId, ngoId) {
  const { data: apps, error } = await supabase
    .from('applications')
    .select(`
      *,
      opportunities(title, category, skills, location, description, mission_impact, work_mode, weekly_hours, languages, field)
    `)
    .eq('opportunity_id', opportunityId)
    .eq('ngo_id', ngoId)
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!apps?.length) return []

  const studentIds = [...new Set(apps.map(a => a.student_id))]

  const [{ data: userData }, profileData] = await Promise.all([
    supabase.from('users').select('id, name, email').in('id', studentIds),
    fetchStudentProfilesFor(studentIds),
  ])

  const userMap    = Object.fromEntries((userData    ?? []).map(u => [u.id,      u]))
  const profileMap = Object.fromEntries((profileData ?? []).map(p => [p.user_id, p]))

  // Same applicant building logic as fetchNgoApplicants but filtered per opportunity
  return apps.map(app => {
    const user = userMap[app.student_id]    ?? {}
    const prof = profileMap[app.student_id] ?? {}

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
      bio:              prof.bio        ?? '',
      interests:        prof.interests  ?? [],
      links:            prof.links      ?? {},
      experience:       prof.experience ?? '',
      goals:            prof.goals      ?? '',
      opportunityTitle: app.opportunities?.title ?? '',
      opportunityId:    app.opportunity_id,
      status:           app.status,
      statusLabel:      STATUS_LABEL[app.status] ?? app.status,
      submittedAt:      app.submitted_at,
      match:            matchResult.score,
      matchReasons:     matchResult.strengths.slice(0, 3),
      breakdown:        matchResult.breakdown,
      location:         app.opportunities?.location ?? '',
    }
  })
}

// Helper: Compute stats from applicants array
export function computeRoleStats(applicants) {
  return {
    total:       applicants.filter(a => a.status !== 'rejected').length,
    new:         applicants.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    interview:   applicants.filter(a => a.status === 'interview').length,
    rejected:    applicants.filter(a => a.status === 'rejected').length,
  }
}
