import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Sparkles, MessageCircle, Send } from 'lucide-react'
import { useApp } from '../context/AppContext'
import MatchScoreBadge from '../components/MatchScoreBadge'
import EmptyState from '../components/EmptyState'
import GradientAvatar from '../components/GradientAvatar'
import { mockMatches, mockStudents, mockNGOs } from '../data/mockData'

// ─── Expanded NGO pool ────────────────────────────────────────────────────────
// Enough diversity for meaningful matching across different student profiles.

const NGO_POOL = [
  {
    id: 'n4',
    name: 'Tsofen – Tech for Arabs',
    location: 'Nazareth, Israel',
    description: 'We work to integrate Arab engineers and tech professionals into Israel\'s high-tech industry through bootcamps, mentoring, and career placement. Programs run in Nazareth, Haifa, and the Triangle area.',
    helpNeeded: 'We need developers to help build our online learning platform and create interactive coding exercises. Also looking for someone to redesign our website and improve UX for mobile users.',
    tags: ['Technology', 'Arab Community', 'Education', 'Career Development'],
    skills: ['React', 'Node.js', 'UX Design', 'Frontend', 'JavaScript', 'Teaching', 'Web Development'],
    languages: ['Arabic', 'Hebrew', 'English'],
    causes: ['tech', 'arab', 'education', 'digital skills', 'community'],
  },
  {
    id: 'n5',
    name: 'Access Israel',
    location: 'Ramat Gan, Israel',
    description: 'We promote accessibility and equal opportunities for people with disabilities across Israel. We advocate for accessible public spaces, digital services, and employment inclusion.',
    helpNeeded: 'We need a UX researcher or designer to audit our website and partner sites for accessibility. Also looking for someone to create visual content and infographics for our campaigns.',
    tags: ['Accessibility', 'Disability Rights', 'Design', 'Advocacy'],
    skills: ['UX Design', 'Figma', 'Accessibility', 'Research', 'Canva', 'UI Design', 'Content'],
    languages: ['Hebrew', 'English'],
    causes: ['accessibility', 'disability', 'design', 'advocacy', 'inclusion'],
  },
  {
    id: 'n6',
    name: 'GreenFuture Initiative',
    location: 'Tel Aviv, Israel',
    description: 'We educate communities on sustainable living, climate action, and environmental responsibility through digital campaigns, workshops, and school programs across central Israel.',
    helpNeeded: 'We need someone to manage our social media channels and create educational content about sustainability. We\'re also looking for help building a simple data dashboard to track our program impact.',
    tags: ['Environment', 'Climate', 'Education', 'Social Media'],
    skills: ['Social Media', 'Canva', 'Marketing', 'Analytics', 'Python', 'Data Visualization', 'Content'],
    languages: ['Hebrew', 'English'],
    causes: ['environment', 'climate', 'sustainability', 'social media', 'impact'],
  },
  {
    id: 'n7',
    name: 'BINA – The Jewish Renewal Movement',
    location: 'Jerusalem & Tel Aviv, Israel',
    description: 'We connect Jewish pluralism with social action, running volunteer programs, Jewish literacy initiatives, and civic engagement projects across Israel. We bridge religious and secular communities.',
    helpNeeded: 'We\'re looking for a content writer or social media manager to help us tell our story in Hebrew and English. We also need help designing digital materials for our volunteer programs.',
    tags: ['Education', 'Community', 'Social Action', 'Jewish Renewal'],
    skills: ['Writing', 'Content Strategy', 'Social Media', 'Canva', 'Graphic Design', 'Marketing'],
    languages: ['Hebrew', 'English'],
    causes: ['community', 'education', 'social action', 'content', 'cultural'],
  },
  {
    id: 'n8',
    name: 'Arab Jewish Community Center',
    location: 'Jaffa, Israel',
    description: 'We build bridges between Arab and Jewish communities in the Jaffa-Tel Aviv region through cultural programs, shared language courses, and joint community initiatives for youth and adults.',
    helpNeeded: 'We need a bilingual (Arabic–Hebrew) social media coordinator and someone to help us redesign our registration system for shared community events. We also want help creating digital storytelling content.',
    tags: ['Coexistence', 'Arab-Jewish', 'Community', 'Youth', 'Culture'],
    skills: ['Arabic', 'Hebrew', 'Social Media', 'Web Development', 'UX Design', 'Content', 'Video'],
    languages: ['Arabic', 'Hebrew', 'English'],
    causes: ['coexistence', 'arab-jewish', 'bilingual', 'community', 'youth', 'culture'],
  },
  {
    id: 'n9',
    name: 'Hasoub – Technology for Society',
    location: 'Haifa, Israel',
    description: 'We promote digital literacy and technology education in Arab communities in Israel, running coding clubs and digital skills workshops in schools and community centers.',
    helpNeeded: 'We need developers to help build and maintain our online course platform. Looking for someone skilled in React or Vue who can also mentor students in coding basics.',
    tags: ['Technology', 'Education', 'Arab Community', 'Digital Literacy'],
    skills: ['React', 'JavaScript', 'Vue', 'Teaching', 'Web Development', 'Python', 'Frontend'],
    languages: ['Arabic', 'Hebrew', 'English'],
    causes: ['tech', 'arab', 'digital literacy', 'education', 'coding', 'community'],
  },
  {
    id: 'n10',
    name: 'Latet – Israeli Food Bank',
    location: 'Tel Aviv, Israel',
    description: 'We fight hunger and poverty by collecting and distributing food to over 200,000 Israelis in need. We operate a network of distribution centers and work with municipalities, schools, and hospitals.',
    helpNeeded: 'We need help building a logistics management tool that tracks food donations, distribution routes, and recipient families. Also need someone to help with data analysis for our annual impact report.',
    tags: ['Social Services', 'Poverty', 'Data', 'Logistics'],
    skills: ['Python', 'Data Analysis', 'Excel', 'React', 'SQL', 'Logistics', 'Statistics'],
    languages: ['Hebrew', 'English', 'Arabic', 'Russian'],
    causes: ['poverty', 'social services', 'data', 'impact', 'community', 'welfare'],
  },
]

// ─── Personalized matching engine ─────────────────────────────────────────────

function normalize(str = '') { return str.toLowerCase().replace(/[^a-z0-9 ]/g, '') }

function scoreSkillOverlap(studentSkills = [], ngoSkills = [], ngoText = '') {
  const pool = [...ngoSkills.map(normalize), ...ngoText.split(' ').map(normalize)]
  const matched = studentSkills.filter(s => pool.some(p => p.includes(normalize(s)) || normalize(s).includes(p.split(' ')[0])))
  return { matched, score: Math.min(matched.length * 8, 30) }
}

function scoreCauseAlignment(interests = [], tags = [], ngoText = '') {
  const text = normalize(tags.join(' ') + ' ' + ngoText)
  const matched = interests.filter(i => text.includes(normalize(i).split(' ')[0]))
  return { matched, score: Math.min(matched.length * 7, 21) }
}

function scoreLanguageBonus(studentLangs = [], ngoLangs = [], ngoText = '') {
  const text = normalize(ngoText)
  const ngoLangSet = ngoLangs.map(normalize)
  const bonuses = []
  for (const { lang, level } of studentLangs) {
    const l = normalize(lang)
    if ((l === 'arabic' || l === 'hebrew') && (ngoLangSet.includes(l) || text.includes(l))) {
      const multiplier = level === 'Native' ? 1.5 : level === 'Fluent' ? 1.2 : 0.8
      bonuses.push({ lang, level, bonus: Math.round(6 * multiplier) })
    } else if (ngoLangSet.includes(l)) {
      bonuses.push({ lang, level, bonus: 4 })
    }
  }
  return { bonuses, score: Math.min(bonuses.reduce((a, b) => a + b.bonus, 0), 14) }
}

function scoreFieldFit(field = '', ngoText = '') {
  const text = normalize(ngoText)
  const f = normalize(field)
  const fieldKeywords = {
    'computer science': ['web', 'app', 'data', 'tech', 'software', 'digital', 'platform', 'system'],
    'information systems': ['data', 'system', 'digital', 'platform', 'tech', 'web'],
    'applied mathematics': ['data', 'statistics', 'analysis', 'research', 'impact'],
    'digital marketing': ['social media', 'content', 'marketing', 'campaign', 'digital'],
    'graphic design': ['design', 'visual', 'brand', 'content', 'creative'],
    'public health': ['health', 'community', 'research', 'population', 'medical'],
    'social work': ['community', 'youth', 'welfare', 'support', 'services'],
  }
  const keywords = Object.entries(fieldKeywords).find(([k]) => f.includes(k))?.[1] || []
  const hits = keywords.filter(k => text.includes(k)).length
  return Math.min(hits * 4, 12)
}

function scoreExperienceFit(experience = '', goals = '', ngoText = '') {
  const combined = normalize(experience + ' ' + goals)
  const text = normalize(ngoText)
  const expWords = combined.split(' ').filter(w => w.length > 4)
  const hits = expWords.filter(w => text.includes(w)).length
  return Math.min(hits * 2, 8)
}

function buildReasons(profile, ngo, skillResult, causeResult, langResult) {
  const reasons = []
  const ngoText = ngo.description + ' ' + ngo.helpNeeded

  // Skill reasons (high priority)
  if (skillResult.matched.length >= 2) {
    const top = skillResult.matched.slice(0, 3)
    reasons.push({
      label: 'Skill match',
      strength: 'high',
      detail: `Your ${top.join(', ')} skills directly match what ${ngo.name} is looking for in their help request.`,
    })
  } else if (skillResult.matched.length === 1) {
    reasons.push({
      label: 'Skill match',
      strength: 'medium',
      detail: `Your ${skillResult.matched[0]} experience is relevant to ${ngo.name}'s current project needs.`,
    })
  }

  // Language bonus
  if (langResult.bonuses.length > 0) {
    const top = langResult.bonuses[0]
    const isArabicNGO = normalize(ngoText).includes('arab') || normalize(ngo.name).includes('arab')
    if (top.lang === 'Arabic' && isArabicNGO) {
      reasons.push({
        label: 'Bilingual advantage',
        strength: 'high',
        detail: `Your ${top.level.toLowerCase()} Arabic is a significant asset — ${ngo.name} directly serves Arabic-speaking communities.`,
      })
    } else {
      reasons.push({
        label: 'Language match',
        strength: top.level === 'Native' || top.level === 'Fluent' ? 'high' : 'medium',
        detail: `Your ${top.level.toLowerCase()} ${top.lang} is valued by ${ngo.name} for their outreach work.`,
      })
    }
  }

  // Cause/interest alignment
  if (causeResult.matched.length >= 1) {
    const top = causeResult.matched.slice(0, 2).join(' and ')
    reasons.push({
      label: 'Mission alignment',
      strength: causeResult.matched.length >= 2 ? 'high' : 'medium',
      detail: `Your interest in ${top} aligns with ${ngo.name}'s core mission and programs.`,
    })
  }

  // Goals alignment
  if (profile.goals) {
    const goalKeywords = ['impact', 'community', 'social', 'help', 'change', 'meaningful']
    const goalHit = goalKeywords.find(k => normalize(profile.goals).includes(k) && normalize(ngoText).includes(k))
    if (goalHit && reasons.length < 4) {
      reasons.push({
        label: 'Goal alignment',
        strength: 'medium',
        detail: `${ngo.name}'s work directly supports the kind of ${goalHit} you described in your goals.`,
      })
    }
  }

  // Experience fit fallback
  if (reasons.length < 2 && profile.experience) {
    reasons.push({
      label: 'Experience fit',
      strength: 'medium',
      detail: `Your previous project experience provides a relevant foundation for the work ${ngo.name} needs.`,
    })
  }

  return reasons.slice(0, 4)
}

function buildHeadline(profile, ngo, score, skillResult, langResult, causeResult) {
  const name = profile.name?.split(' ')[0] || 'You'
  if (score >= 90) {
    if (langResult.bonuses.some(b => b.lang === 'Arabic') && normalize(ngo.description).includes('arab')) {
      return `Strong bilingual + technical match — ${name}'s skills and Arabic are exactly what ${ngo.name} needs`
    }
    if (skillResult.matched.length >= 3) {
      return `Exceptional skill alignment — ${name}'s ${skillResult.matched.slice(0,2).join(' and ')} expertise fits ${ngo.name} precisely`
    }
    return `Near-perfect match — ${name}'s profile aligns strongly with ${ngo.name}'s mission and current needs`
  }
  if (score >= 80) {
    if (causeResult.matched.length >= 2) {
      return `Strong values alignment between ${name} and ${ngo.name} — shared focus on ${causeResult.matched.slice(0,2).join(' and ')}`
    }
    if (skillResult.matched.length >= 2) {
      return `Good technical fit — ${name}'s ${skillResult.matched[0]} skills match ${ngo.name}'s help request`
    }
    return `Solid match — ${name}'s background addresses key priorities at ${ngo.name}`
  }
  return `Relevant match — ${name}'s experience overlaps meaningfully with ${ngo.name}'s work`
}

function computePersonalizedMatches(profile, user) {
  const name = profile?.name || user?.name || 'You'

  const matches = NGO_POOL.map((ngo, i) => {
    const ngoText = ngo.description + ' ' + (ngo.helpNeeded || '')
    const skillResult = scoreSkillOverlap(profile?.skills || [], ngo.skills || [], ngoText)
    const causeResult = scoreCauseAlignment(profile?.interests || [], ngo.tags || [], ngoText)
    const langResult = scoreLanguageBonus(profile?.languages || [], ngo.languages || [], ngoText)
    const fieldScore = scoreFieldFit(profile?.field || '', ngoText)
    const expScore = scoreExperienceFit(profile?.experience || '', profile?.goals || '', ngoText)

    const raw = 52 + skillResult.score + causeResult.score + langResult.score + fieldScore + expScore
    const score = Math.min(Math.max(raw, 55), 98)

    const reasons = buildReasons(profile, ngo, skillResult, causeResult, langResult)
    const headline = buildHeadline(profile, ngo, score, skillResult, langResult, causeResult)

    return {
      id: `pm_${ngo.id}`,
      studentName: name,
      studentField: profile?.field || user?.role === 'student' ? (profile?.field || 'Student') : '',
      ngo,
      score,
      headline,
      reasons,
    }
  })

  // Sort by score, take top matches that have at least 1 reason
  return matches
    .filter(m => m.reasons.length >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

// ─── Match ring ───────────────────────────────────────────────────────────────

function MatchRing({ score, size = 80 }) {
  const r = 32, circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 90 ? '#10B981' : score >= 80 ? '#FFB703' : '#6366F1'
  const track = score >= 90 ? '#D1FAE5' : score >= 80 ? '#FEF3C7' : '#EEF2FF'
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-label={`${score}% match`}>
      <circle cx="40" cy="40" r={r} fill="none" stroke={track} strokeWidth="6"/>
      <motion.circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 40 40)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}/>
      <text x="40" y="40" textAnchor="middle" dominantBaseline="central"
        fontSize="14" fontWeight="800" fill="#0D183D">{score}%</text>
    </svg>
  )
}

// ─── Explanation modal ────────────────────────────────────────────────────────

function MatchExplanationModal({ match, studentName, studentField, onClose }) {
  const ngo = match.ngo || mockNGOs.find(n => n.id === match.ngoId)
  const student = match.studentProfile || mockStudents.find(s => s.id === match.studentId)
  const displayStudent = studentName || student?.name || 'Student'
  const displayField   = studentField || student?.field || ''
  if (!ngo) return null

  const score      = match.score
  const reasons    = match.reasons || []
  const headline   = match.headline || ''

  // Build contribution suggestions from reasons + ngo help text
  const contributions = []
  if (reasons.some(r => r.label === 'Skill match' || r.label === 'Strong skill match')) {
    const ngoText = (ngo.helpNeeded || ngo.description || '').slice(0, 120)
    contributions.push(ngoText + (ngoText.length >= 120 ? '…' : ''))
  }
  if (reasons.some(r => r.label === 'Bilingual advantage' || r.label === 'Language match')) {
    contributions.push(`Bilingual outreach and community-facing communication.`)
  }
  if (reasons.some(r => r.label === 'Mission alignment')) {
    contributions.push(`Contributing to programs aligned with your stated interests and values.`)
  }
  if (contributions.length === 0) {
    contributions.push(`Supporting ${ngo.name}'s programs with your skills and experience.`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,18,48,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className="bg-white w-full max-w-[520px] rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh', boxShadow: '0 28px 80px rgba(10,18,48,0.24)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-7 pt-6 pb-5 shrink-0"
          style={{ background: 'linear-gradient(160deg, #FFF7E6 0%, #EEF2FF 100%)' }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-black/[0.07] transition-colors active:scale-95">
            <X size={14} strokeWidth={2.5}/>
          </button>

          {/* Score + names row */}
          <div className="flex items-center gap-5">
            <MatchRing score={score} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <GradientAvatar name={displayStudent} size={28} radius="0.45rem" />
                <span className="text-[12px] font-bold text-[#0D183D]">{displayStudent}</span>
                <span className="text-[#4B6382] text-[11px]">⟷</span>
                <GradientAvatar name={ngo.name} size={28} radius="0.45rem" />
                <span className="text-[12px] font-bold text-[#0D183D] truncate">{ngo.name}</span>
              </div>
              <p className="text-[12px] text-[#4B6382] leading-snug line-clamp-2">{headline}</p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-5 flex flex-col gap-5">

          {/* Why Hive matched */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background: '#FFB703' }}>
                <Sparkles size={11} strokeWidth={2.5} className="text-white"/>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#0D183D]">
                Why Hive matched you
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {reasons.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  className="flex items-start gap-2.5 rounded-xl p-3 text-[12px] text-[#4B6382] leading-relaxed"
                  style={{
                    background: r.strength === 'high' ? 'rgba(16,185,129,0.05)' : 'rgba(99,102,241,0.04)',
                    border: r.strength === 'high' ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(99,102,241,0.12)',
                  }}>
                  <CheckCircle2 size={13} strokeWidth={2} className="mt-0.5 shrink-0"
                    style={{ color: r.strength === 'high' ? '#10B981' : '#6366F1' }}/>
                  <div>
                    <span className="font-bold text-[#0D183D] mr-1.5">{r.label}.</span>
                    {r.detail}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="h-px" style={{ background: 'rgba(13,24,61,0.07)' }}/>

          {/* NGO mission */}
          <section>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">About {ngo.name}</p>
            <p className="text-[13px] text-[#4B6382] leading-relaxed">
              {(ngo.description || '').slice(0, 220)}{(ngo.description || '').length > 220 ? '…' : ''}
            </p>
            <p className="text-[11px] text-[#4B6382] mt-1.5 flex items-center gap-1">
              <span>📍</span> {ngo.location}
            </p>
          </section>

          {/* Suggested contribution */}
          {contributions.length > 0 && (
            <section>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2.5">
                Where you could contribute
              </p>
              <ul className="flex flex-col gap-2">
                {contributions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#4B6382] leading-snug">
                    <span className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#FFB703' }}/>
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 flex gap-2.5 shrink-0 border-t"
          style={{ borderColor: 'rgba(13,24,61,0.08)', background: '#FAFAFA' }}>
          <a href="/applications"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#0D183D', boxShadow: '0 2px 12px rgba(13,24,61,0.2)' }}>
            <Send size={13}/> Apply to {ngo.name.split('–')[0].trim()}
          </a>
          <a href="/messages"
            className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all hover:bg-[rgba(13,24,61,0.04)] active:scale-95"
            style={{ color: '#4B6382', borderColor: 'rgba(13,24,61,0.14)' }}
            aria-label="Message NGO">
            <MessageCircle size={15} strokeWidth={2}/>
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Match card ───────────────────────────────────────────────────────────────

function PersonalizedMatchCard({ match, index, userName, userField, onOpen }) {
  const ngo = match.ngo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 cursor-pointer group transition-all duration-200 hover:shadow-[0_4px_24px_rgba(13,24,61,0.09)] hover:-translate-y-0.5"
      onClick={() => onOpen(match)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(match)}
      aria-label={`View match: ${userName} and ${ngo.name}, ${match.score}% compatibility`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Student */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GradientAvatar name={userName} size={44} radius="0.65rem" />
          <div className="min-w-0">
            <p className="font-bold text-[#0D183D] truncate">{userName}</p>
            <p className="text-xs text-[#4B6382] truncate">{userField}</p>
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1 sm:px-4 shrink-0">
          <span className="text-[#4B6382] text-lg" aria-hidden="true">⟷</span>
          <MatchScoreBadge score={match.score} />
        </div>

        {/* NGO */}
        <div className="flex items-center gap-3 flex-1 min-w-0 sm:flex-row-reverse">
          <GradientAvatar name={ngo.name} size={44} radius="0.65rem" />
          <div className="min-w-0 sm:text-right">
            <p className="font-bold text-[#0D183D] truncate">{ngo.name}</p>
            <p className="text-xs text-[#4B6382] truncate">{ngo.location}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[rgba(13,24,61,0.08)]">
        <p className="text-sm text-[#4B6382] leading-relaxed mb-3">{match.headline}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {match.reasons.slice(0, 2).map(r => (
              <span key={r.label}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  r.strength === 'high' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                }`}>
                {r.label}
              </span>
            ))}
          </div>
          <span className="text-xs text-[#4B6382] font-medium shrink-0 group-hover:text-[#0D183D] transition-colors">
            View explanation →
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Example match card (guest / preview) ─────────────────────────────────────

function ExampleMatchCard({ match, index, onOpen }) {
  const student = mockStudents.find(s => s.id === match.studentId)
  const ngo     = mockNGOs.find(n => n.id === match.ngoId)
  if (!student || !ngo) return null

  // Attach ngo object so modal can read it
  const enriched = { ...match, ngo }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 cursor-pointer group transition-all duration-200 hover:shadow-[0_4px_24px_rgba(13,24,61,0.09)] hover:-translate-y-0.5"
      onClick={() => onOpen(enriched)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(enriched)}
    >
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GradientAvatar name={student.name} size={44} radius="0.65rem" />
          <div className="min-w-0">
            <p className="font-bold text-[#0D183D] truncate">{student.name}</p>
            <p className="text-xs text-[#4B6382] truncate">{student.field}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 sm:px-4 shrink-0">
          <span className="text-[#4B6382] text-lg" aria-hidden="true">⟷</span>
          <MatchScoreBadge score={match.score} />
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0 sm:flex-row-reverse">
          <GradientAvatar name={ngo.name} size={44} radius="0.65rem" />
          <div className="min-w-0 sm:text-right">
            <p className="font-bold text-[#0D183D] truncate">{ngo.name}</p>
            <p className="text-xs text-[#4B6382] truncate">{ngo.location}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[rgba(13,24,61,0.08)]">
        <p className="text-sm text-[#4B6382] leading-relaxed">{match.headline}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {match.reasons.slice(0, 2).map(r => (
              <span key={r.label}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  r.strength === 'high' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                }`}>
                {r.label}
              </span>
            ))}
          </div>
          <span className="text-xs text-[#4B6382] font-medium shrink-0 group-hover:text-[#0D183D] transition-colors">
            View explanation →
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchResults() {
  const { user, profile } = useApp()

  // Incomplete onboarding
  if (user && !user.onboardingComplete) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-10">
        <EmptyState
          emoji="🔍"
          title="No matches yet"
          description="Complete your profile so our AI can find NGOs that match your skills and values. It only takes a few minutes."
          actionLabel="Complete my profile"
          actionHref="/role-selection"
        />
      </div>
    )
  }

  const isGuest = !user
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const preview = isGuest || params.get('preview') === '1'

  // Compute personalized matches for logged-in students with profiles
  const personalizedMatches = useMemo(() => {
    if (preview || !profile) return []
    return computePersonalizedMatches(profile, user)
  }, [preview, profile, user])

  const matchesToShow = preview ? mockMatches : personalizedMatches
  const userName = profile?.name || user?.name || 'You'
  const userField = profile?.field || ''
  const [activeMatch, setActiveMatch] = useState(null)

  return (
    <>
    <div className="max-w-4xl mx-auto px-8 py-7">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-2xl" aria-hidden="true">✦</span>
            <h1 className="text-2xl font-bold text-[#0D183D]">
              {preview
                ? 'Example matches'
                : `${matchesToShow.length} match${matchesToShow.length !== 1 ? 'es' : ''} found for you`}
            </h1>
          </div>
          <p className="text-[#4B6382] text-sm">
            {preview
              ? 'Sign up and complete your profile to get matches tailored to your skills and interests.'
              : 'Ranked by semantic compatibility — skills, experience, language, and mission alignment.'}
          </p>
        </motion.div>

        {/* Guest banner */}
        {preview && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            style={{ background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.2)' }}>
            <span className="text-2xl shrink-0" aria-hidden="true">✨</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0D183D] mb-0.5">These are example matches</p>
              <p className="text-xs text-[#4B6382]">Your real matches are based on your actual skills, languages, and goals — not a generic list.</p>
            </div>
            <a href="/auth?mode=signup"
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#FFB703' }}>
              Get your matches →
            </a>
          </motion.div>
        )}

        {/* Personalisation notice for logged-in users */}
        {!preview && profile && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4 mb-6 flex items-start gap-3"
            style={{ background: 'rgba(13,24,61,0.04)', border: '1px solid rgba(13,24,61,0.08)' }}>
            <span className="text-xl shrink-0" aria-hidden="true">🎯</span>
            <div>
              <p className="text-sm font-semibold text-[#0D183D] mb-0.5">
                Matched to your profile
              </p>
              <p className="text-xs text-[#4B6382] leading-relaxed">
                These NGOs were selected based on your{' '}
                {[
                  profile.skills?.length ? `skills (${profile.skills.slice(0, 2).join(', ')})` : null,
                  profile.field ? `field (${profile.field})` : null,
                  profile.languages?.length ? `languages (${profile.languages.map(l => l.lang).join(', ')})` : null,
                  profile.interests?.length ? `interests` : null,
                ].filter(Boolean).join(', ')}.
              </p>
            </div>
          </motion.div>
        )}

        {/* How it works */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="rounded-2xl p-5 mb-8 flex gap-4 items-start text-white"
          style={{ background: '#0D183D' }}>
          <span className="text-xl shrink-0" aria-hidden="true">🧠</span>
          <div>
            <p className="font-semibold text-sm mb-1">How semantic matching works</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Instead of comparing keyword lists, our AI reads the meaning behind profiles.
              "I built a volunteer scheduling app" signals frontend development, project ownership, and nonprofit experience simultaneously.
              Click any match to see exactly why the system connected these two people.
            </p>
          </div>
        </motion.div>

        {/* Match cards */}
        {matchesToShow.length === 0 ? (
          <EmptyState
            compact
            emoji="🔍"
            title="Building your matches"
            description="Add more skills, interests, and experience to your profile for stronger matches."
            actionLabel="Update profile"
            actionHref="/settings"
          />
        ) : (
          <div className="flex flex-col gap-5" role="list" aria-label="Match results">
            {preview
              ? matchesToShow.map((match, i) => (
                  <div key={match.id} role="listitem">
                    <ExampleMatchCard match={match} index={i} onOpen={setActiveMatch} />
                  </div>
                ))
              : matchesToShow.map((match, i) => (
                  <div key={match.id} role="listitem">
                    <PersonalizedMatchCard
                      match={match}
                      index={i}
                      userName={userName}
                      userField={userField}
                      onOpen={setActiveMatch}
                    />
                  </div>
                ))
            }
          </div>
        )}
      </div>

      {/* Inline explanation modal */}
      <AnimatePresence>
        {activeMatch && (
          <MatchExplanationModal
            match={activeMatch}
            studentName={userName}
            studentField={userField}
            onClose={() => setActiveMatch(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
