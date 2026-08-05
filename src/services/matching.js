// Hive matching engine
// Weights confirmed: skills 40, interests 25, languages 15,
// location 10, field 5, text (experience+goals) 5

const W = {
  skills:       40,
  interests:    25,
  languages:    15,
  location:     10,
  field:         5,
  text:          5,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function norm(s = '') {
  return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

function skillName(s) {
  return typeof s === 'string' ? s : (s?.name ?? '')
}

function skillLevel(s) {
  return typeof s === 'string' ? '' : ((s?.level ?? '')).toLowerCase()
}

// True if two skill strings refer to the same skill
function skillsMatch(a, b) {
  const na = norm(a), nb = norm(b)
  if (!na || !nb) return false
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  // first-word check: "react.js" ↔ "react", "node.js" ↔ "node"
  const wa = na.split(' ')[0], wb = nb.split(' ')[0]
  if (wa.length >= 3 && wb.length >= 3 && (na.includes(wb) || nb.includes(wa))) return true
  return false
}

const STOPWORDS = new Set([
  'the','and','for','this','that','with','have','from','they','will','your',
  'been','more','their','about','which','when','also','into','over','other',
  'some','like','what','make','just','than','only','such','very','both','much',
  'take','even','most','back','well','still','need','work','help','real','good',
  'time','people','were','then','these','there','where','after','those','year',
  'each','many','want','used','doing','being','can','get','has','its','are',
  'was','had','not','but','our','who','all','one','would','could','should',
])

function tokens(text = '') {
  return norm(text).split(' ').filter(w => w.length >= 4 && !STOPWORDS.has(w))
}

// ─── Dimension 1: Skills (35 pts) ────────────────────────────────────────────

const PROFICIENCY = {
  expert: 1.5, native: 1.5, advanced: 1.3, fluent: 1.3,
  intermediate: 1.0, '': 0.9, unknown: 0.9,
  basic: 0.7, beginner: 0.6,
}

function scoreSkills(studentSkills, oppSkills) {
  const oSkills = (oppSkills ?? [])
  if (!oSkills.length) {
    return { score: W.skills * 0.7, matched: [], missing: [], partial: [] }
  }

  const matched = [], missing = [], partial = []
  let totalRaw = 0
  const perSkill = W.skills / oSkills.length

  for (const os of oSkills) {
    const oName = skillName(os)
    const found = (studentSkills ?? []).find(ss => skillsMatch(skillName(ss), oName))
    if (found) {
      const lvl = skillLevel(found)
      const mult = PROFICIENCY[lvl] ?? 0.9
      totalRaw += perSkill * mult
      matched.push({ oppSkill: oName, studentSkill: skillName(found), level: found?.level ?? '' })
    } else {
      // partial: student has a related skill (first word of opp skill appears in any student skill)
      const oWord = norm(oName).split(' ')[0]
      const related = (studentSkills ?? []).find(ss => norm(skillName(ss)).includes(oWord))
      if (related) {
        totalRaw += perSkill * 0.4
        partial.push({ oppSkill: oName, relatedSkill: skillName(related) })
      } else {
        missing.push(oName)
      }
    }
  }

  return { score: Math.min(totalRaw, W.skills), matched, missing, partial }
}

// ─── Dimension 2: Interests / mission fit (20 pts) ───────────────────────────

function scoreInterests(studentInterests, category, missionImpact, description) {
  const interests = studentInterests ?? []
  if (!interests.length) return { score: 0, matched: [] }

  const missionText = norm([category, missionImpact, description].filter(Boolean).join(' '))
  const matched = []
  let score = 0

  for (const interest of interests) {
    const ni = norm(interest)
    const words = ni.split(' ').filter(w => w.length >= 4)

    // Category exact / close match (8 pts each, but capped at full weight)
    if (category && (norm(category) === ni || norm(category).includes(ni.split(' ')[0]) || ni.includes(norm(category).split(' ')[0]))) {
      score += 8
      matched.push(interest)
      continue
    }

    // Keyword overlap with mission text (up to 4 pts per interest)
    const hits = words.filter(w => missionText.includes(w)).length
    if (hits >= 2) { score += 4; matched.push(interest) }
    else if (hits === 1) { score += 2; matched.push(interest) }

    if (score >= W.interests) break
  }

  return { score: Math.min(score, W.interests), matched }
}

// ─── Dimension 3: Languages (15 pts) ─────────────────────────────────────────

const LANG_W = { native: 1.0, fluent: 0.9, intermediate: 0.5, basic: 0.2, '': 0.7 }

function scoreLanguages(studentLangs, requiredLangs) {
  const required = requiredLangs ?? []
  if (!required.length) return { score: W.languages, matched: [], missing: [] }

  const matched = [], missing = []
  let totalWeight = 0, matchedWeight = 0

  for (const req of required) {
    const reqName = norm(typeof req === 'string' ? req : req.lang ?? req)
    totalWeight += 1
    const found = (studentLangs ?? []).find(sl => {
      const name = norm(typeof sl === 'string' ? sl : sl.lang ?? '')
      return name === reqName || name.includes(reqName) || reqName.includes(name)
    })
    if (found) {
      const lvl = (typeof found === 'string' ? '' : found.level ?? '').toLowerCase()
      matchedWeight += LANG_W[lvl] ?? 0.7
      matched.push({ lang: typeof found === 'string' ? found : found.lang, level: typeof found === 'string' ? '' : found.level })
    } else {
      missing.push(typeof req === 'string' ? req : req.lang ?? req)
    }
  }

  const ratio = totalWeight > 0 ? matchedWeight / totalWeight : 1
  return { score: Math.round(ratio * W.languages * 10) / 10, matched, missing }
}

// ─── Dimension 4: Location / work mode (10 pts) ───────────────────────────────

function scoreLocation(workMode, location) {
  const m = norm(workMode ?? '')
  if (m.includes('remote')) return { score: W.location, note: 'Remote — works from anywhere' }
  if (m.includes('hybrid')) return { score: Math.round(W.location * 0.7), note: `Hybrid in ${location || 'office'}` }
  return { score: Math.round(W.location * 0.4), note: `On-site in ${location || 'office'}` }
}

// ─── Dimension 5: Field of study (5 pts) ─────────────────────────────────────

// Maps normalised field fragments → mission keywords that indicate relevance
const FIELD_KEYWORDS = {
  'computer science':     ['tech','digital','software','data','platform','system','coding','web','app'],
  'software':             ['tech','digital','software','web','app','development','platform'],
  'information systems':  ['data','system','digital','platform','tech','database'],
  'data science':         ['data','statistics','analysis','research','impact','machine'],
  'artificial intelligence': ['ai','machine','data','research','technology'],
  'cybersecurity':        ['security','tech','digital','data','system'],
  'graphic design':       ['design','visual','brand','content','creative','ui','ux','canva'],
  'ux':                   ['design','user','product','interface','accessibility','research'],
  'marketing':            ['social','content','marketing','campaign','digital','brand','media'],
  'communications':       ['content','social','writing','brand','outreach','media','pr'],
  'journalism':           ['writing','content','media','research','communication','story'],
  'social work':          ['community','youth','welfare','support','services','social'],
  'psychology':           ['mental','counseling','community','support','wellbeing','health'],
  'public health':        ['health','community','research','population','medical','wellbeing'],
  'nursing':              ['health','medical','care','hospital','wellbeing','community'],
  'education':            ['teaching','learning','curriculum','school','literacy','training','youth'],
  'economics':            ['finance','research','analysis','data','impact','policy','budget'],
  'law':                  ['advocacy','rights','policy','legal','justice','governance'],
  'political science':    ['policy','advocacy','governance','civic','rights','government'],
  'environmental':        ['environment','climate','sustainability','conservation','green'],
  'business':             ['management','operations','finance','strategy','entrepreneurship'],
  'accounting':           ['finance','budget','audit','data','management','impact'],
  'statistics':           ['data','research','analysis','statistics','impact','math'],
  'applied mathematics':  ['data','statistics','analysis','research','impact','math'],
}

function scoreField(studentField, oppField, category, missionImpact) {
  if (!studentField) return { score: 0, match: null }
  const sf = norm(studentField)

  // Exact match with opp's required field
  if (oppField) {
    const of_ = norm(oppField)
    if (sf === of_ || sf.includes(of_) || of_.includes(sf.split(' ')[0])) {
      return { score: W.field, match: 'exact' }
    }
  }

  // Keyword hit in mission text
  const missionNorm = norm([category, missionImpact].filter(Boolean).join(' '))
  const entry = Object.entries(FIELD_KEYWORDS).find(([k]) => sf.includes(k) || k.includes(sf.split(' ')[0]))
  const keywords = entry?.[1] ?? []
  const hits = keywords.filter(k => missionNorm.includes(k)).length

  if (hits >= 4) return { score: W.field, match: 'strong' }
  if (hits >= 2) return { score: Math.round(W.field * 0.6), match: 'moderate' }
  if (hits >= 1) return { score: Math.round(W.field * 0.3), match: 'partial' }
  return { score: 0, match: null }
}

// ─── Dimension 6: Experience + goals text (5 pts) ────────────────────────────

function scoreText(experience, goals, description, missionImpact, title) {
  const studentToks = new Set([...tokens(experience), ...tokens(goals)])
  const oppToks     = new Set([...tokens(description), ...tokens(missionImpact), ...tokens(title)])
  if (!studentToks.size || !oppToks.size) return { score: Math.round(W.text * 0.4), overlap: [] }

  const overlap = [...studentToks].filter(t => oppToks.has(t))
  return { score: Math.min(Math.round(overlap.length * 1.25 * 10) / 10, W.text), overlap }
}

// ─── Narrative builders ───────────────────────────────────────────────────────

function buildReasons(p, o, sk, int, lang, field) {
  const orgName = o.orgName || o.name || 'this organisation'
  const reasons = []

  // Skills
  if (sk.matched.length >= 3) {
    const top = sk.matched.slice(0, 3).map(m => m.studentSkill).join(', ')
    reasons.push({ label: 'Skill match', strength: 'high',
      detail: `Your ${top} skills directly match what ${orgName} is looking for.` })
  } else if (sk.matched.length >= 1) {
    const top = sk.matched.slice(0, 2).map(m => m.studentSkill).join(' and ')
    reasons.push({ label: 'Skill match', strength: 'medium',
      detail: `Your ${top} skills are relevant to this role.` })
  } else if (sk.partial.length >= 1) {
    reasons.push({ label: 'Related skills', strength: 'low',
      detail: `You have related skills — close but not an exact match for ${sk.partial[0].oppSkill}.` })
  } else if (sk.missing.length > 0) {
    reasons.push({ label: 'Skill gap', strength: 'low',
      detail: `This role lists ${sk.missing.slice(0, 2).join(', ')} — worth building these.` })
  }

  // Languages
  if (lang.matched.length > 0) {
    const top = lang.matched[0]
    const lvlStr = top.level ? top.level.toLowerCase() + ' ' : ''
    reasons.push({
      label: (top.level === 'Native' || top.level === 'Fluent') ? 'Language match' : 'Language — partial',
      strength: (top.level === 'Native' || top.level === 'Fluent') ? 'high' : 'medium',
      detail: `Your ${lvlStr}${top.lang} matches the language requirements for this role.`,
    })
  } else if (lang.missing.length > 0) {
    reasons.push({ label: 'Language gap', strength: 'low',
      detail: `${lang.missing.join(', ')} required — not listed in your profile.` })
  }

  // Mission alignment
  if (int.matched.length >= 2) {
    reasons.push({ label: 'Mission alignment', strength: 'high',
      detail: `Your interest in ${int.matched.slice(0, 2).join(' and ')} aligns with ${orgName}'s mission.` })
  } else if (int.matched.length === 1) {
    reasons.push({ label: 'Mission alignment', strength: 'medium',
      detail: `Your interest in ${int.matched[0]} connects with ${orgName}'s work.` })
  }

  // Field of study
  if (field.match === 'exact' || field.match === 'strong') {
    reasons.push({ label: 'Field of study', strength: 'high',
      detail: `Your ${p.field} background is a strong fit for this role.` })
  } else if (field.match === 'moderate') {
    reasons.push({ label: 'Field relevance', strength: 'medium',
      detail: `Your ${p.field} background is partially relevant to this work.` })
  }

  return reasons.slice(0, 4)
}

function buildHeadline(p, o, score, sk, int, lang) {
  const name    = p.name?.split(' ')[0] || 'You'
  const orgName = o.orgName || o.name   || 'this NGO'

  if (score >= 85) {
    if (sk.matched.length >= 3 && lang.matched.length >= 1) {
      const skills = sk.matched.slice(0, 2).map(m => m.studentSkill).join(' & ')
      return `Strong technical and language fit — ${skills} plus ${lang.matched[0].lang} align with ${orgName}'s needs`
    }
    if (sk.matched.length >= 3) {
      const skills = sk.matched.slice(0, 2).map(m => m.studentSkill).join(' and ')
      return `Exceptional skill alignment — ${name}'s ${skills} expertise fits ${orgName} precisely`
    }
    return `Near-perfect match — ${name}'s profile aligns strongly with ${orgName}'s mission`
  }
  if (score >= 70) {
    if (int.matched.length >= 2) {
      return `Strong values alignment — shared focus on ${int.matched.slice(0, 2).join(' and ')} connects ${name} with ${orgName}`
    }
    if (sk.matched.length >= 2) {
      return `Good technical fit — ${name}'s ${sk.matched[0].studentSkill} skills match ${orgName}'s needs`
    }
    return `Solid match — ${name}'s background addresses key priorities at ${orgName}`
  }
  if (score >= 50) {
    return `Relevant match — ${name}'s experience overlaps meaningfully with ${orgName}'s work`
  }
  return `Exploratory match — some alignment with ${orgName}'s mission worth exploring`
}

function buildSuggestedQuestions(p, o, sk, int, lang) {
  const orgName = o.orgName || o.name || 'your organisation'
  const q = []

  if (sk.matched.length > 0) {
    q.push(`Can you walk us through a project where you used ${sk.matched[0].studentSkill} to solve a real problem?`)
  } else {
    q.push(`What skills from your experience are most transferable to this role?`)
  }

  if (int.matched.length > 0) {
    q.push(`What first sparked your interest in ${int.matched[0]}, and how has it shaped your work so far?`)
  } else {
    q.push(`What draws you to ${orgName}'s mission specifically?`)
  }

  if (lang.matched.length > 0 && (o.languages ?? []).length > 0) {
    q.push(`This role requires ${(o.languages ?? []).join(' and ')} — can you describe a time you worked professionally in these languages?`)
  } else {
    q.push(`How do you approach collaboration with communities different from your own background?`)
  }

  q.push(`Where do you see your volunteer work with ${orgName} fitting into your longer-term goals?`)
  return q
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Compute a rich match result between a student profile and an opportunity.
 *
 * @param {object} studentProfile  - from student_profiles (skills, field, interests, languages, experience, goals, name)
 * @param {object} opportunity     - from opportunities service (skills, category, missionImpact, description, languages, weeklyHours, workMode, location, field, title, orgName)
 * @returns {{ score, breakdown, strengths, partialMatches, missingRequirements, reasons, headline, suggestedQuestions, explanations }}
 */
export function computeMatch(studentProfile, opportunity) {
  const p = studentProfile ?? {}
  const o = opportunity    ?? {}

  const sk   = scoreSkills(p.skills, o.skills)
  const int  = scoreInterests(p.interests, o.category, o.missionImpact, o.description)
  const lang = scoreLanguages(p.languages, o.languages)
  const loc  = scoreLocation(o.workMode, o.location)
  const fld  = scoreField(p.field, o.field, o.category, o.missionImpact)
  const txt  = scoreText(p.experience, p.goals, o.description, o.missionImpact, o.title)

  const rawScore = sk.score + int.score + lang.score + loc.score + fld.score + txt.score
  const score    = Math.min(Math.max(Math.round(rawScore), 0), 100)

  const breakdown = {
    skills:       { score: Math.round(sk.score),    max: W.skills,       label: 'Skills' },
    interests:    { score: Math.round(int.score),   max: W.interests,    label: 'Mission fit' },
    languages:    { score: Math.round(lang.score),  max: W.languages,    label: 'Languages' },
    location:     { score: Math.round(loc.score),   max: W.location,     label: 'Work mode' },
    field:        { score: Math.round(fld.score),   max: W.field,        label: 'Field of study' },
    text:         { score: Math.round(txt.score),   max: W.text,         label: 'Experience' },
  }

  const strengths = []
  const partialMatches = []
  const missingRequirements = []

  if (sk.matched.length > 0) {
    const top = sk.matched.slice(0, 3).map(m => m.studentSkill).join(', ')
    strengths.push(`${sk.matched.length} skill${sk.matched.length > 1 ? 's' : ''} matched: ${top}`)
  }
  sk.partial.slice(0, 2).forEach(({ oppSkill, relatedSkill }) =>
    partialMatches.push(`${relatedSkill} is related to required skill: ${oppSkill}`))
  sk.missing.slice(0, 3).forEach(s => missingRequirements.push(`Skill not found in your profile: ${s}`))

  int.matched.slice(0, 2).forEach(i => strengths.push(`Interest in "${i}" aligns with the mission`))

  lang.matched.forEach(l => {
    const lvl = l.level ? ` (${l.level})` : ''
    strengths.push(`${l.lang}${lvl} — required language matched`)
  })
  lang.missing.forEach(l => missingRequirements.push(`Required language not in profile: ${l}`))

  if (loc.note) {
    if (loc.score === W.location) strengths.push(loc.note)
    else partialMatches.push(loc.note)
  }

  if (fld.match === 'exact' || fld.match === 'strong') strengths.push(`${p.field} aligns with this role`)
  else if (fld.match === 'moderate') partialMatches.push(`${p.field} is partially relevant to this role`)

  const reasons            = buildReasons(p, o, sk, int, lang, fld)
  const headline           = buildHeadline(p, o, score, sk, int, lang)
  const suggestedQuestions = buildSuggestedQuestions(p, o, sk, int, lang)

  const explanations = [
    sk.matched.length > 0 && `✦ ${sk.matched.length}/${(o.skills ?? []).length || '?'} skills matched`,
    int.matched.length > 0 && `❤️ "${int.matched[0]}" aligns with mission`,
    lang.matched.length > 0 && `🌐 ${lang.matched.map(l => l.lang).join(', ')} — language fit`,
    fld.match && `🎓 ${p.field} relevant to this role`,
  ].filter(Boolean)

  return {
    score,
    breakdown,
    strengths,
    partialMatches,
    missingRequirements,
    reasons,
    headline,
    suggestedQuestions,
    explanations,
    skillMatches: {
      matched: sk.matched,
      partial: sk.partial,
      missing: sk.missing,
      required: o.skills ?? [],
    },
  }
}
