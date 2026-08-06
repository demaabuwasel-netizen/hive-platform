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
  // Once a role is accepted/completed it's no longer 'active', and RLS only
  // lets a non-owner student read an opportunity while it's active — so the
  // joined `opportunities` fields below go null right when they matter most
  // (the accepted student's own view, their certificate). roleSnapshot is a
  // copy of title/category/location taken at accept/complete time (by the
  // NGO, who can always read their own opportunity) and stashed on the
  // application row itself, so it's always available here without needing
  // any Supabase RLS change.
  const roleSnapshot = row.links?.roleSnapshot
  const opportunitySnapshot = toRoleSnapshot(row.opportunities)
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
    // joined fields (when fetched with selects), falling back to the snapshot
    ngoName:       row.opportunities?.org_name ?? row.ngo_profiles?.name ?? null,
    role:          row.opportunities?.title    ?? roleSnapshot?.title    ?? null,
    location:      row.opportunities?.location ?? roleSnapshot?.location ?? row.ngo_profiles?.location ?? null,
    category:      row.opportunities?.category ?? roleSnapshot?.category ?? null,
    opportunity:   opportunitySnapshot,
  }
}

// Full set of opportunity fields the student-facing detail views need —
// shared by every place that builds or reads a roleSnapshot below.
const SNAPSHOT_OPP_COLUMNS = 'title, category, field, location, description, mission_impact, skills, languages, work_mode, weekly_hours, duration, org_name'

// Bump this whenever the fields captured in a roleSnapshot change. Without
// it, an application that already has an *older, narrower* snapshot (e.g.
// just title/category/location, from before description/skills/work_mode
// were added) looks "already snapshotted" and the self-heal below would skip
// it forever, leaving it permanently stuck with incomplete detail.
const ROLE_SNAPSHOT_VERSION = 2

function toRoleSnapshot(opp) {
  if (!opp?.title) return null
  return {
    v:              ROLE_SNAPSHOT_VERSION,
    title:          opp.title,
    category:       opp.category       ?? null,
    field:          opp.field          ?? null,
    location:       opp.location       ?? null,
    description:    opp.description    ?? null,
    mission_impact: opp.mission_impact ?? null,
    skills:         opp.skills         ?? [],
    languages:      opp.languages      ?? [],
    work_mode:      opp.work_mode      ?? null,
    weekly_hours:   opp.weekly_hours   ?? null,
    duration:       opp.duration       ?? null,
    org_name:       opp.org_name       ?? null,
  }
}

function isStaleRoleSnapshot(snapshot) {
  return !snapshot?.title || snapshot.v !== ROLE_SNAPSHOT_VERSION
}

// Best-effort: snapshot an opportunity's full detail fields so they can be
// stashed onto an application's own `links`. Called with the NGO's session,
// which can always read an opportunity it owns (ngo_id = auth.uid()) no
// matter its status — unlike a student, who RLS only lets read it while
// 'active'. Returns null (never throws) so callers can treat this as
// optional polish, not a hard requirement.
async function snapshotOpportunityRole(opportunityId) {
  if (!opportunityId) return null
  const { data, error } = await supabase
    .from('opportunities')
    .select(SNAPSHOT_OPP_COLUMNS)
    .eq('id', opportunityId)
    .maybeSingle()
  if (error) return null
  return toRoleSnapshot(data)
}

// Self-heals applications submitted before roleSnapshot existed, so their
// title/detail view (and certificate, if applicable) don't stay stuck
// missing forever once the opportunity itself is no longer 'active'. Uses
// the opportunity fields already sitting in `row.opportunities` from the
// NGO-side fetch that's calling this — no extra read needed, since the NGO
// can always see their own opportunity regardless of its status.
// Fire-and-forget: runs quietly in the background and never throws into the
// caller, so it can be dropped into any NGO applicant list fetch for free.
function backfillMissingRoleSnapshots(rows) {
  (rows ?? [])
    .filter(row => isStaleRoleSnapshot(row.links?.roleSnapshot))
    .filter(row => Boolean(row.opportunities?.title))
    .forEach(row => {
      const roleSnapshot = toRoleSnapshot(row.opportunities)
      if (!roleSnapshot) return
      supabase
        .from('applications')
        .update({ links: { ...(row.links ?? {}), roleSnapshot } })
        .eq('id', row.id)
        .then(({ error }) => {
          if (error) console.warn('[applications] roleSnapshot backfill failed:', error.message)
        })
    })
}

// Submit a new application.
// opportunitySnapshot (optional): the opportunity object the student was
// already looking at when they applied (camelCase, from services/opportunities'
// dbToOpp — e.g. { title, category, workMode, weeklyHours, ... }). Captured
// into `links.roleSnapshot` right now, while the opportunity is guaranteed to
// still be 'active' and readable — this is what keeps this application's own
// detail view (title, description, skills, etc.) working later even after
// the opportunity itself goes paused/closed and RLS would otherwise hide it
// from this student's join. No Supabase changes needed.
export async function submitApplication({ studentId, opportunityId, ngoId, message, availability, links, opportunitySnapshot }) {
  const roleSnapshot = opportunitySnapshot ? toRoleSnapshot({
    title:          opportunitySnapshot.title,
    category:       opportunitySnapshot.category,
    field:          opportunitySnapshot.field,
    location:       opportunitySnapshot.location,
    description:    opportunitySnapshot.description,
    mission_impact: opportunitySnapshot.missionImpact,
    skills:         opportunitySnapshot.skills,
    languages:      opportunitySnapshot.languages,
    work_mode:      opportunitySnapshot.workMode,
    weekly_hours:   opportunitySnapshot.weeklyHours,
    duration:       opportunitySnapshot.duration,
    org_name:       opportunitySnapshot.orgName,
  }) : null

  const { data, error } = await supabase
    .from('applications')
    .insert({
      student_id:     studentId,
      opportunity_id: opportunityId ?? null,
      ngo_id:         ngoId,
      message,
      availability,
      links: { ...(links ?? {}), ...(roleSnapshot ? { roleSnapshot } : {}) },
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
      opportunities (id, ngo_id, ${SNAPSHOT_OPP_COLUMNS})
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
    // If the opportunity's title can't be read at all (RLS hides it once it's
    // no longer active, or it's otherwise gone) AND there's no roleSnapshot
    // fallback either, the UI has nothing real to show and would fall back
    // to the literal word "Position" — hide those instead.
    .filter(row => Boolean(row.opportunities?.title) || Boolean(row.links?.roleSnapshot?.title))
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

  // Once a role is accepted/completed, the opportunity itself is usually no
  // longer 'active' — snapshot its title/category/location onto this
  // application's own `links` now, while the NGO can still read it (they own
  // it). This is what keeps the student's own view — and their certificate —
  // working afterward, without needing any Supabase RLS change.
  let linksUpdate = null
  if (status === 'accepted' || status === 'completed') {
    const { data: existingRow } = await supabase
      .from('applications')
      .select('opportunity_id, links')
      .eq('id', applicationId)
      .maybeSingle()
    const roleSnapshot = await snapshotOpportunityRole(existingRow?.opportunity_id)
    if (roleSnapshot) linksUpdate = { ...(existingRow?.links ?? {}), roleSnapshot }
  }

  const { data, error } = await supabase
    .from('applications')
    .update({
      status,
      updated_at: completedAt ?? new Date().toISOString(),
      ...(linksUpdate ? { links: linksUpdate } : {}),
    })
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
        ...(linksUpdate?.roleSnapshot ? { roleSnapshot: linksUpdate.roleSnapshot } : {}),
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
  // Snapshot the role's title/category/location once, up front, while the
  // NGO can still read it — see snapshotOpportunityRole() above for why.
  const roleSnapshot = await snapshotOpportunityRole(opportunityId)

  const { data, error } = await supabase
    .from('applications')
    .update({
      status: 'completed',
      updated_at: completedAt,
      links: {
        certificateUnlockedAt: completedAt,
        certificateUnlocked: true,
        hiveCertificate: { unlockedAt: completedAt },
        ...(roleSnapshot ? { roleSnapshot } : {}),
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
          ...(roleSnapshot ? { roleSnapshot } : {}),
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
    .select('*, opportunities(title, category, skills, location, description, mission_impact, work_mode, weekly_hours, languages, field, duration, org_name)')
    .eq('ngo_id', ngoId)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  if (!apps?.length) return []

  // Quietly repair any accepted/completed application still missing its
  // roleSnapshot (see backfillMissingRoleSnapshots for why) — this list
  // already has everything needed, so it's free.
  backfillMissingRoleSnapshots(apps)

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
      opportunities(title, category, skills, location, description, mission_impact, work_mode, weekly_hours, languages, field, duration, org_name)
    `)
    .eq('opportunity_id', opportunityId)
    .eq('ngo_id', ngoId)
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!apps?.length) return []

  // Same quiet self-heal as fetchNgoApplicants — this is the fetch that runs
  // whenever the NGO opens a specific role's applicant queue, so it's the
  // most likely place to actually catch a stale accepted/completed row.
  backfillMissingRoleSnapshots(apps)

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

  // Quiet self-heal, same as the other NGO fetches — this fetch doesn't join
  // opportunities, so it needs its own small read, but it only runs once for
  // whichever applicant is actually shown on this "Complete role" panel.
  if (isStaleRoleSnapshot(row.links?.roleSnapshot)) {
    snapshotOpportunityRole(opportunityId).then(roleSnapshot => {
      if (!roleSnapshot) return
      supabase
        .from('applications')
        .update({ links: { ...(row.links ?? {}), roleSnapshot } })
        .eq('id', row.id)
        .then(({ error: updateError }) => {
          if (updateError) console.warn('[applications] roleSnapshot backfill failed:', updateError.message)
        })
    })
  }

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
