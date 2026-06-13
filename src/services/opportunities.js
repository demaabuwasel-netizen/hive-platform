import { supabase } from './supabase'

function normalizeSkills(raw) {
  return (raw ?? []).map(s => {
    if (typeof s === 'string') {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(s)
        return {
          name: parsed.name || s,
          level: parsed.level || '',
        }
      } catch (e) {
        // Plain string skill
        return { name: s, level: '' }
      }
    }
    // Already an object
    return { name: s.name || '', level: s.level || '' }
  })
}

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
    skills:         normalizeSkills(row.skills),
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

// Create a new opportunity.
// Avoids .single() — if RLS SELECT policy is restrictive it would throw
// PGRST116 even on a successful insert, silently killing the publish flow.
export async function createOpportunity(ngoId, form, status = 'active') {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(oppToDb(ngoId, form, status))
    .select()
  if (error) throw new Error(error.message)
  return dbToOpp(data?.[0] ?? null)
}

// Update an existing opportunity.
export async function updateOpportunity(id, ngoId, form, status) {
  const updates = oppToDb(ngoId, form, status)
  delete updates.ngo_id  // don't overwrite ownership
  const { data, error } = await supabase
    .from('opportunities')
    .update(updates)
    .eq('id', id)
    .eq('ngo_id', ngoId)
    .select()
  if (error) throw new Error(error.message)
  return dbToOpp(data?.[0] ?? null)
}

// Fetch all active opportunities (student browse view)
export async function fetchActiveOpportunities({ category, search } = {}) {
  let query = supabase
    .from('opportunities')
    .select('*')
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

// Save a partial draft — tolerates missing Step 2-4 fields.
// Uses empty strings instead of null for text columns that may be NOT NULL.
// Returns the saved opportunity ID (creates on first call, updates on subsequent).
export async function saveDraftOpportunity(ngoId, form, existingId = null) {
  const payload = {
    ngo_id:         ngoId,
    title:          form.title?.trim()         || 'Untitled draft',
    org_name:       form.orgName?.trim()        || '',
    category:       form.category              || null,
    field:          form.field                 || null,
    description:    form.description?.trim()   || '',
    mission_impact: form.missionImpact?.trim() || '',
    skills:         form.skills                ?? [],
    languages:      form.languages             ?? [],
    weekly_hours:   form.weeklyHours           || null,
    duration:       form.duration              || null,
    location:       form.location?.trim()      || '',
    work_mode:      form.workMode              || null,
    deadline:       form.deadline              || null,
    status:         'draft',
    updated_at:     new Date().toISOString(),
  }

  if (existingId) {
    const { ngo_id: _drop, ...updates } = payload  // don't overwrite ownership on update
    const { error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', existingId)
      .eq('ngo_id', ngoId)
    if (error) throw new Error(error.message)
    return existingId
  }

  // Insert — avoid .single() so RLS-hidden rows don't cause PGRST116
  const { data, error } = await supabase
    .from('opportunities')
    .insert(payload)
    .select('id')
  if (error) throw new Error(error.message)
  const id = data?.[0]?.id
  if (!id) throw new Error('Draft saved but no ID returned — check RLS SELECT policy')
  return id
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
