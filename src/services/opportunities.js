import { supabase } from './supabase'

function dbToOpp(row) {
  if (!row) return null
  return {
    id:             row.id,
    ngoId:          row.ngo_id,
    title:          row.title,
    orgName:        row.org_name,
    category:       row.category,
    field:          row.field,
    description:    row.description,
    missionImpact:  row.mission_impact,
    skills:         row.skills        ?? [],
    languages:      row.languages     ?? [],
    weeklyHours:    row.weekly_hours,
    duration:       row.duration,
    location:       row.location,
    workMode:       row.work_mode,
    deadline:       row.deadline,
    status:         row.status,
    applicantCount: row.applicant_count ?? 0,
    createdAt:      row.created_at,
  }
}

function oppToDb(ngoId, form, status = 'active') {
  return {
    ngo_id:         ngoId,
    title:          form.title,
    org_name:       form.orgName,
    category:       form.category    ?? null,
    field:          form.field       ?? null,
    description:    form.description ?? null,
    mission_impact: form.missionImpact ?? null,
    skills:         form.skills      ?? [],
    languages:      form.languages   ?? [],
    weekly_hours:   form.weeklyHours ?? null,
    duration:       form.duration    ?? null,
    location:       form.location    ?? null,
    work_mode:      form.workMode    ?? null,
    deadline:       form.deadline    || null,
    status,
    updated_at:     new Date().toISOString(),
  }
}

// Create a new opportunity
export async function createOpportunity(ngoId, form, status = 'active') {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(oppToDb(ngoId, form, status))
    .select()
    .single()
  if (error) throw new Error(error.message)
  return dbToOpp(data)
}

// Update an existing opportunity
export async function updateOpportunity(id, ngoId, form, status) {
  const updates = oppToDb(ngoId, form, status)
  delete updates.ngo_id  // don't overwrite ownership
  const { data, error } = await supabase
    .from('opportunities')
    .update(updates)
    .eq('id', id)
    .eq('ngo_id', ngoId)  // RLS extra safety
    .select()
    .single()
  if (error) throw new Error(error.message)
  return dbToOpp(data)
}

// Fetch all active opportunities (student browse view)
export async function fetchActiveOpportunities({ category, search } = {}) {
  let query = supabase
    .from('opportunities')
    .select('*, ngo_profiles(name, image_url, location)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (category && category !== 'All') query = query.eq('category', category)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToOpp)
}

// Fetch opportunities posted by a specific NGO
export async function fetchNgoOpportunities(ngoId) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('ngo_id', ngoId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToOpp)
}

// Fetch a single opportunity by ID
export async function fetchOpportunity(id) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return dbToOpp(data)
}

// Update opportunity status (active/paused/closed)
export async function setOpportunityStatus(id, ngoId, status) {
  const { error } = await supabase
    .from('opportunities')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('ngo_id', ngoId)
  if (error) throw new Error(error.message)
}
