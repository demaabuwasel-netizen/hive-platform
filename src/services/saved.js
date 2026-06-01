import { supabase } from './supabase'

function skillName(s) { return typeof s === 'string' ? s : (s?.name ?? '') }

function dbToSaved(row) {
  const opp = row.opportunities
  return {
    savedId:       row.id,
    opportunityId: row.opportunity_id,
    savedAt:       row.created_at,
    orgName:       opp?.org_name    ?? '',
    title:         opp?.title       ?? '',
    category:      opp?.category    ?? '',
    description:   opp?.description ?? '',
    missionImpact: opp?.mission_impact ?? '',
    skills:        (opp?.skills ?? []).map(skillName).filter(Boolean).slice(0, 4),
    location:      opp?.location    ?? '',
    workMode:      opp?.work_mode   ?? '',
    weeklyHours:   opp?.weekly_hours ?? null,
    status:        opp?.status      ?? 'active',
  }
}

export async function fetchSavedOpportunities(userId) {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .select(`
      id,
      opportunity_id,
      saved_at,
      opportunities (
        id, title, org_name, category, description, mission_impact,
        skills, location, work_mode, weekly_hours, status
      )
    `)
    .eq('student_id', userId)
    .order('saved_at', { ascending: false })
  if (error) {
    console.error('[saved] fetchSavedOpportunities error:', error)
    throw new Error(error.message)
  }
  return (data ?? [])
    .filter(row => row.opportunities)
    .map(dbToSaved)
}

// Returns a Set of opportunity_id strings the user has saved
export async function fetchSavedIds(userId) {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('opportunity_id')
    .eq('student_id', userId)
  if (error) {
    console.error('[saved] fetchSavedIds error:', error)
    return new Set()
  }
  return new Set((data ?? []).map(r => r.opportunity_id))
}

export async function saveOpportunity(userId, opportunityId) {
  const { error } = await supabase
    .from('saved_opportunities')
    .insert({ student_id: userId, opportunity_id: opportunityId })
  // 23505 = unique_violation: already saved — treat as success
  if (error && error.code !== '23505') {
    console.error('[saved] saveOpportunity error:', error)
    throw new Error(error.message)
  }
}

export async function unsaveOpportunity(userId, opportunityId) {
  const { error } = await supabase
    .from('saved_opportunities')
    .delete()
    .eq('student_id', userId)
    .eq('opportunity_id', opportunityId)
  if (error) {
    console.error('[saved] unsaveOpportunity error:', error)
    throw new Error(error.message)
  }
}

export async function isOpportunitySaved(userId, opportunityId) {
  const { data } = await supabase
    .from('saved_opportunities')
    .select('id')
    .eq('student_id', userId)
    .eq('opportunity_id', opportunityId)
    .maybeSingle()
  return !!data
}
