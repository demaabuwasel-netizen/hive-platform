import { supabase } from './supabase'
import { computeMatch } from './matching'
import { parseSkillString } from './opportunities'

const STATUS_LABEL = {
  submitted:    'Application sent',
  under_review: 'Under review',
  shortlisted:  'Shortlisted',
  interview:    'Interview scheduled',
  accepted:     'Accepted',
  completed:    'Completed',
  rejected:     'Not selected',
}

export function isCertificateUnlocked(app) {
  return app?.status === 'completed'
    || Boolean(app?.links?.certificateUnlockedAt)
    || Boolean(app?.links?.certificateUnlocked)
    || Boolean(app?.links?.hiveCertificate?.unlockedAt)
}

function dbToApp(row) {
  if (!row) return null
  const certificateUnlocked = isCertificateUnlocked(row)
  return {
    id:            row.id,
    studentId:     row.student_id,
    opportunityId: row.opportunity_id,
    ngoId:         row.ngo_id,
    message:       row.message,
    availability:  row.availability,
    links:         row.links        ?? {},
    status:        certificateUnlocked ? 'completed' : row.status,
    statusLabel:   certificateUnlocked ? STATUS_LABEL.completed : (STATUS_LABEL[row.status] ?? row.status),
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

  return (data ?? [])
    .filter(row => row.opportunity_id)
    // Only hide the specific case where someone else was accepted/started in
    // this role — a plain "not selected" (rejected) application still shows
    // normally, same as before.
    .filter(row => !row.links?.roleFilledByOther)
    .map(row => {
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
  const completedAt = status === 'completed' ? new Date().toISOString() : null
  const { data, error } = await supabase
    .from('applications')
    .update({ status, updated_at: completedAt ?? new Date().toISOString() })
    .eq('id', applicationId)
    .select('id, status, links')
    .maybeSingle()
  if (!error) {
    if (!data) throw new Error('Application status was not updated. Please refresh and try again.')
    return data
  }

  if (status !== 'completed') throw new Error(error.message)

  const { data: existing, error: selectError } = await supabase
    .from('applications')
    .select('id, status, links')
    .eq('id', applicationId)
    .maybeSingle()
  if (selectError) throw new Error(selectError.message)
  if (!existing) throw new Error('Application status was not updated. Please refresh and try again.')

  const { data: fallback, error: fallbackError } = await supabase
    .from('applications')
    .update({
      updated_at: completedAt,
      links: {
        ...(existing.links ?? {}),
        certificateUnlockedAt: completedAt,
        certificateUnlocked: true,
        hiveCertificate: { unlockedAt: completedAt },
      },
    })
    .eq('id', applicationId)
    .select('id, status, links')
    .maybeSingle()
  if (fallbackError) throw new Error(fallbackError.message)
  if (!fallback) throw new Error('Certificate was not unlocked. Please refresh and try again.')
  return fallback
}

// NGO: when one applicant is accepted for a role, everyone else still in the
// running (not already rejected/accepted/completed) is marked "not selected."
// Without this, other applicants' status would stay stuck at whatever it was
// (e.g. "Under review") forever, with no signal the role was filled — this is
// what makes the role disappear from their own Applications/Interviews view.
// Note: this does NOT set status to 'rejected' — that would make it
// indistinguishable from a real "not selected" decision, which should keep
// showing to the student normally. This only flags that the role went to
// someone else, which is the one thing that hides it from their view.
export async function markOtherApplicantsRoleFilled(opportunityId, keepApplicationId) {
  const { data: rows, error: selectError } = await supabase
    .from('applications')
    .select('id, student_id, status, links')
    .eq('opportunity_id', opportunityId)
    .neq('id', keepApplicationId)
    .in('status', ['submitted', 'under_review', 'shortlisted', 'interview'])
  if (selectError) throw new Error(selectError.message)
  if (!rows?.length) return []

  const updated = await Promise.all(rows.map(async row => {
    const { data, error } = await supabase
      .from('applications')
      .update({
        links: { ...(row.links ?? {}), roleFilledByOther: true },
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .select('id, student_id, status, links')
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  }))

  return updated.filter(Boolean)
}

export async function completeAcceptedApplicationsForOpportunity(opportunityId, ngoId) {
  const completedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'completed',
      updated_at: completedAt,
      links: {
        certificateUnlockedAt: completedAt,
        certificateUnlocked: true,
        hiveCertificate: { unlockedAt: completedAt },
      },
    })
    .eq('opportunity_id', opportunityId)
    .eq('ngo_id', ngoId)
    .eq('status', 'accepted')
    .select('id, student_id, status, links')

  if (!error) return data ?? []

  const { data: acceptedRows, error: selectError } = await supabase
    .from('applications')
    .select('id, student_id, status, links')
    .eq('opportunity_id', opportunityId)
    .eq('ngo_id', ngoId)
    .eq('status', 'accepted')

  if (selectError) throw new Error(selectError.message)
  if (!acceptedRows?.length) throw new Error(error.message)

  const updatedRows = await Promise.all(acceptedRows.map(async row => {
    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update({
        updated_at: completedAt,
        links: {
          ...(row.links ?? {}),
          certificateUnlockedAt: completedAt,
          certificateUnlocked: true,
          hiveCertificate: { unlockedAt: completedAt },
        },
      })
      .eq('id', row.id)
      .select('id, student_id, status, links')
      .maybeSingle()
    if (updateError) throw new Error(updateError.message)
    return updated
  }))

  return updatedRows.filter(Boolean)
}

// ── Skill helpers ─────────────────────────────────────────────────────────────

function toSkillObjects(raw) {
  return (raw ?? []).map(parseSkillString)
}

// NGO: rich applicant list — joins applications, users, student_profiles, opportunities
// Loads student profiles for a set of ids. Tries to include country/city/educations
// (newer columns); if a migration hasn't run yet on this environment and a column
// doesn't exist, Supabase rejects the whole select — so retry with narrower column
// sets until one succeeds, so the rest of the profile still loads.
async function fetchStudentProfilesFor(studentIds) {
  const baseColumns = 'user_id, field, university, skills, languages, bio, interests, links, experience, goals'
  const columnSets = [
    `${baseColumns}, country, city, educations, projects`,
    `${baseColumns}, country, city, educations`,
    `${baseColumns}, country, city`,
    baseColumns,
  ]
  for (const columns of columnSets) {
    const { data, error } = await supabase
      .from('student_profiles')
      .select(columns)
      .in('user_id', studentIds)
    if (!error) return data
  }
  return []
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
      educations:       Array.isArray(prof.educations) ? prof.educations : [],
      projects:         Array.isArray(prof.projects) ? prof.projects : [],
      opportunityTitle: app.opportunities?.title ?? '',
      opportunityId:    app.opportunity_id,
      status:           app.status,
      statusLabel:      STATUS_LABEL[app.status] ?? app.status,
      submittedAt:      app.submitted_at,
      match:            matchResult.score,
      matchReasons:     matchResult.strengths.slice(0, 3),
      skillMatches:      matchResult.skillMatches,
      breakdown:        matchResult.breakdown,
      location:         app.opportunities?.location ?? '',
      studentLocation:  [prof.city, prof.country].filter(Boolean).join(', '),
    }
  })
}

// Student: delete (withdraw) their own application. RLS already restricts
// this to the student's own rows, but the studentId check here means a
// caller mistake fails loudly instead of silently deleting nothing.
export async function deleteApplication(applicationId, studentId) {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('student_id', studentId)
  if (error) throw new Error(error.message)
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
  const statMap = {};
  (appCounts ?? []).forEach(app => {
    if (!statMap[app.opportunity_id]) {
      statMap[app.opportunity_id] = { total: 0, new: 0, shortlisted: 0, interview: 0, accepted: 0, completed: 0, rejected: 0 }
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
      educations:       Array.isArray(prof.educations) ? prof.educations : [],
      projects:         Array.isArray(prof.projects) ? prof.projects : [],
      opportunityTitle: app.opportunities?.title ?? '',
      opportunityId:    app.opportunity_id,
      status:           app.status,
      statusLabel:      STATUS_LABEL[app.status] ?? app.status,
      submittedAt:      app.submitted_at,
      match:            matchResult.score,
      matchReasons:     matchResult.strengths.slice(0, 3),
      skillMatches:      matchResult.skillMatches,
      breakdown:        matchResult.breakdown,
      location:         app.opportunities?.location ?? '',
    }
  })
}

// NGO: fetch the accepted (or already-completed) applicant for a filled opportunity —
// used by the Opportunities page's "Complete role" action, which only needs to know
// who to mark complete, not the full applicant/match profile.
export async function fetchAcceptedApplicantForOpportunity(opportunityId) {
  const { data, error } = await supabase
    .from('applications')
    .select('id, student_id, status, links, updated_at')
    .eq('opportunity_id', opportunityId)
    .in('status', ['accepted', 'completed'])
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  if (!data?.length) return null

  const row = data.find(isCertificateUnlocked) ?? data.find(app => app.status === 'completed') ?? data.find(app => app.status === 'accepted') ?? data[0]
  const { data: userRow } = await supabase
    .from('users')
    .select('id, name')
    .eq('id', row.student_id)
    .maybeSingle()

  return {
    id: row.id,
    studentId: row.student_id,
    name: userRow?.name ?? 'Applicant',
    status: isCertificateUnlocked(row) ? 'completed' : row.status,
  }
}

// Helper: Compute stats from applicants array
export function computeRoleStats(applicants) {
  return {
    total:       applicants.filter(a => a.status !== 'rejected').length,
    new:         applicants.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    interview:   applicants.filter(a => a.status === 'interview').length,
    accepted:    applicants.filter(a => a.status === 'accepted').length,
    completed:   applicants.filter(a => a.status === 'completed').length,
    rejected:    applicants.filter(a => a.status === 'rejected').length,
  }
}
