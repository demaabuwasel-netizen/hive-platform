import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Sparkles, MessageCircle, Send, Search, Target, Brain } from 'lucide-react'
import { useApp } from '../context/AppContext'
import MatchScoreBadge from '../components/MatchScoreBadge'
import EmptyState from '../components/EmptyState'
import GradientAvatar from '../components/GradientAvatar'
import { fetchActiveOpportunities } from '../services/opportunities'
import { computeMatch } from '../services/matching'

// ─── Opportunity → match card shape ───────────────────────────────────────────

function oppToCard(opp, matchResult, userName, userField) {
  return {
    id:           `match_${opp.id}`,
    opportunityId: opp.id,
    ngoId:         opp.ngoId,
    ngo: {
      name:        opp.orgName    ?? '',
      location:    opp.location   ?? '',
      description: opp.description ?? '',
      helpNeeded:  opp.missionImpact ?? '',
      tags:        opp.category ? [opp.category] : [],
    },
    score:        matchResult.score,
    headline:     matchResult.headline,
    reasons:      matchResult.reasons,
    breakdown:    matchResult.breakdown,
    strengths:    matchResult.strengths,
    partialMatches:      matchResult.partialMatches,
    missingRequirements: matchResult.missingRequirements,
    suggestedQuestions:  matchResult.suggestedQuestions,
    studentName:  userName,
    studentField: userField,
  }
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
  const ngo = match.ngo
  const displayStudent = studentName || 'Student'
  const displayField   = studentField || ''
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


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchResults() {
  const { user, profile } = useApp()
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeMatch, setActiveMatch] = useState(null)

  const userName = profile?.name || user?.name || 'You'
  const userField = profile?.field || ''

  useEffect(() => {
    if (!profile) { setLoading(false); return }
    fetchActiveOpportunities()
      .then(opps => {
        const scored = opps
          .map(opp => ({ opp, result: computeMatch(profile, opp) }))
          .sort((a, b) => b.result.score - a.result.score)
        setMatches(scored.map(({ opp, result }) => oppToCard(opp, result, userName, userField)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [profile])

  if (user && !user.onboardingComplete) {
    return (
      <div className="w-full px-8 py-7 bg-white">
        <div className="max-w-7xl mx-auto">
          <EmptyState icon={Search} title="No matches yet"
            description="Complete your profile so our AI can find NGOs that match your skills and values."
            actionLabel="Complete my profile" actionHref="/" card={false} />
        </div>
      </div>
    )
  }

  const matchesToShow = matches

  return (
    <>
    <div className="w-full px-8 py-7 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#FFB703]/10 flex items-center justify-center">
              <Sparkles size={20} className="text-[#FFB703]" />
            </div>
            <h1 className="text-3xl font-bold text-[#0D183D]">
              {loading ? 'Finding your matches…' : `${matchesToShow.length} match${matchesToShow.length !== 1 ? 'es' : ''} found for you`}
            </h1>
          </div>
          <p className="text-[#4B6382] text-sm">
            Ranked by compatibility — skills, experience, language, and mission alignment.
          </p>
        </motion.div>

        {/* Personalisation notice */}
        {profile && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4 mb-6 flex items-start gap-3"
            style={{ background: 'rgba(13,24,61,0.04)', border: '1px solid rgba(13,24,61,0.08)' }}>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0">
              <Target size={16} className="text-[#10B981]" />
            </div>
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
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
            <Brain size={16} className="text-[#8B5CF6]" />
          </div>
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
        {loading ? (
          <div className="flex flex-col gap-4">
            {[0,1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 animate-pulse">
                <div className="flex gap-5">
                  <div className="w-11 h-11 rounded-xl bg-[rgba(13,24,61,0.06)]"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded-full bg-[rgba(13,24,61,0.06)]"/>
                    <div className="h-2.5 w-1/4 rounded-full bg-[rgba(13,24,61,0.04)]"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : matchesToShow.length === 0 ? (
          <EmptyState compact icon={Search} title="No matches yet"
            description="Add more skills, interests, and experience to your profile for stronger matches."
            actionLabel="Update profile" actionHref="/settings" card={false} />
        ) : (
          <div className="flex flex-col gap-5" role="list" aria-label="Match results">
            {matchesToShow.map((match, i) => (
              <div key={match.id} role="listitem">
                <PersonalizedMatchCard match={match} index={i}
                  userName={userName} userField={userField} onOpen={setActiveMatch} />
              </div>
            ))}
          </div>
        )}
      </div>
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
