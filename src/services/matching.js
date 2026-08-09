// Hive matching engine
// Matching is intentionally based only on stored skills and languages.

// ─── Helpers ──────────────────────────────────────────────────────────────────

function norm(s = '') {
  return String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

function skillName(s) {
  if (typeof s !== 'string') return s?.name ?? ''
  try {
    const parsed = JSON.parse(s)
    if (typeof parsed?.name === 'string' && parsed.name.trim().startsWith('{')) {
      try {
        const nested = JSON.parse(parsed.name)
        return nested?.name || parsed.name || s
      } catch {
        return parsed.name || s
      }
    }
    return parsed?.name || s
  } catch {
    return s
  }
}

function languageName(language) {
  if (typeof language === 'string') return language
  return language?.lang || language?.name || ''
}

function languageLevel(language) {
  return typeof language === 'string' ? '' : language?.level || ''
}

function requirementKey(name) {
  return norm(name)
}

function uniqueByName(items = [], getName = value => value) {
  const seen = new Set()
  return items
    .map(item => {
      const name = getName(item)
      const key = requirementKey(name)
      if (!key || seen.has(key)) return null
      seen.add(key)
      return { raw: item, name, key }
    })
    .filter(Boolean)
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

function languagesMatch(a, b) {
  const na = norm(a), nb = norm(b)
  if (!na || !nb) return false
  return na === nb || na.includes(nb) || nb.includes(na)
}

function scoreSkills(studentSkills, oppSkills) {
  const requiredSkills = uniqueByName(oppSkills, skillName)
  if (!requiredSkills.length) return { ratio: null, matched: [], missing: [], partial: [], total: 0 }

  const matched = [], missing = [], partial = []

  for (const required of requiredSkills) {
    const oName = required.name
    const found = (studentSkills ?? []).find(ss => skillsMatch(skillName(ss), oName))
    if (found) {
      matched.push({ oppSkill: oName, studentSkill: skillName(found), level: found?.level ?? '' })
    } else {
      const oWord = norm(oName).split(' ')[0]
      const related = (studentSkills ?? []).find(ss => norm(skillName(ss)).includes(oWord))
      if (related) {
        partial.push({ oppSkill: oName, relatedSkill: skillName(related) })
      }
      missing.push(oName)
    }
  }

  return {
    ratio: matched.length / requiredSkills.length,
    matched,
    missing,
    partial,
    total: requiredSkills.length,
  }
}

function scoreLanguages(studentLangs, requiredLangs) {
  const required = uniqueByName(requiredLangs, languageName)
  if (!required.length) return { ratio: null, matched: [], missing: [], total: 0 }

  const matched = [], missing = []

  for (const req of required) {
    const found = (studentLangs ?? []).find(sl => languagesMatch(languageName(sl), req.name))
    if (found) {
      matched.push({ lang: languageName(found), level: languageLevel(found) })
    } else {
      missing.push(req.name)
    }
  }

  return {
    ratio: matched.length / required.length,
    matched,
    missing,
    total: required.length,
  }
}

// ─── Narrative builders ───────────────────────────────────────────────────────

function buildReasons(p, o, sk, lang) {
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

  return reasons.slice(0, 4)
}

function buildHeadline(p, o, score, sk, lang) {
  const name    = p.name?.split(' ')[0] || 'You'
  const orgName = o.orgName || o.name   || 'this NGO'
  const possessive = name === 'You' ? 'your' : `${name}'s`
  const verb = name === 'You' ? 'share' : 'shares'

  if (score >= 85) {
    if (sk.matched.length >= 3 && lang.matched.length >= 1) {
      const skills = sk.matched.slice(0, 2).map(m => m.studentSkill).join(' & ')
      return `Strong technical and language fit — ${skills} plus ${lang.matched[0].lang} align with ${orgName}'s needs`
    }
    if (sk.matched.length >= 3) {
      const skills = sk.matched.slice(0, 2).map(m => m.studentSkill).join(' and ')
      return `Exceptional skill alignment — ${possessive} ${skills} expertise fits ${orgName} precisely`
    }
    return `Near-perfect match — ${possessive} skills and languages align strongly with ${orgName}'s needs`
  }
  if (score >= 70) {
    if (sk.matched.length >= 2) {
      return `Good technical fit — ${possessive} ${sk.matched[0].studentSkill} skills match ${orgName}'s needs`
    }
    return `Solid match — ${possessive} languages and skills address key requirements at ${orgName}`
  }
  if (score >= 50) {
    return `Relevant match — ${name} ${verb} some skills or language requirements with ${orgName}`
  }
  return `Exploratory match — limited stored skill or language overlap with ${orgName}`
}

function buildSuggestedQuestions(p, o, sk, lang) {
  const orgName = o.orgName || o.name || 'your organisation'
  const q = []

  if (sk.matched.length > 0) {
    q.push(`Can you walk us through a project where you used ${sk.matched[0].studentSkill} to solve a real problem?`)
  } else {
    q.push(`What skills from your experience are most transferable to this role?`)
  }

  q.push(`Which of your skills would you use first in this role, and why?`)

  if (lang.matched.length > 0 && (o.languages ?? []).length > 0) {
    q.push(`This role requires ${(o.languages ?? []).join(' and ')} — can you describe a time you worked professionally in these languages?`)
  } else {
    q.push(`Are there any additional languages or communication skills you would bring to this role?`)
  }

  q.push(`Which required skill would you want to grow while working with ${orgName}?`)
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
  const lang = scoreLanguages(p.languages, o.languages)
  const hasSkillRequirements = sk.ratio !== null
  const hasLanguageRequirements = lang.ratio !== null
  const totalRequired = (hasSkillRequirements ? sk.total : 0) + (hasLanguageRequirements ? lang.total : 0)
  const totalMatched = sk.matched.length + lang.matched.length
  const score = totalRequired > 0
    ? Math.min(Math.max(Math.round((totalMatched / totalRequired) * 100), 0), 100)
    : 0
  const skillMax = totalRequired > 0 ? Math.round((sk.total / totalRequired) * 100) : 0
  const languageMax = totalRequired > 0 ? 100 - skillMax : 0

  const breakdown = {
    skills:       { score: totalRequired > 0 ? Math.round((sk.matched.length / totalRequired) * 100) : 0, max: skillMax,      label: 'Skills' },
    interests:    { score: 0,                                                max: 0,              label: 'Mission fit' },
    languages:    { score: totalRequired > 0 ? Math.round((lang.matched.length / totalRequired) * 100) : 0, max: languageMax, label: 'Languages' },
    location:     { score: 0,                                                max: 0,              label: 'Work mode' },
    field:        { score: 0,                                                max: 0,              label: 'Field of study' },
    text:         { score: 0,                                                max: 0,              label: 'Experience' },
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

  lang.matched.forEach(l => {
    const lvl = l.level ? ` (${l.level})` : ''
    strengths.push(`${l.lang}${lvl} — required language matched`)
  })
  lang.missing.forEach(l => missingRequirements.push(`Required language not in profile: ${l}`))

  const reasons            = buildReasons(p, o, sk, lang)
  const headline           = buildHeadline(p, o, score, sk, lang)
  const suggestedQuestions = buildSuggestedQuestions(p, o, sk, lang)

  const explanations = [
    hasSkillRequirements && `${sk.matched.length}/${sk.total} required skills matched`,
    hasLanguageRequirements && `${lang.matched.length}/${lang.total} required languages matched`,
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
    languageMatches: {
      matched: lang.matched,
      missing: lang.missing,
      required: o.languages ?? [],
    },
    matchFormula: {
      matchedRequirements: totalMatched,
      totalRequirements: totalRequired,
    },
  }
}
