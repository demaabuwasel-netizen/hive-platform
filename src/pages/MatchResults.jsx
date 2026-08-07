import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, CheckCircle2, Sparkles, MessageCircle, Send, Search, Target, Brain,
  Briefcase, Users, ChevronRight, ChevronDown, ChevronLeft, Mail, GraduationCap, MapPin, Layers,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import MatchScoreBadge from '../components/MatchScoreBadge'
import EmptyState from '../components/EmptyState'
import GradientAvatar from '../components/GradientAvatar'
import { fetchActiveOpportunities, fetchNgoOpportunities, parseSkillString } from '../services/opportunities'
import { computeMatch } from '../services/matching'
import { supabase } from '../services/supabase'
import { withTimeout } from '../utils/withTimeout'
import matchesIllustration from '../assets/matches.png'

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

function normalizeStudentProfile(row) {
  const userRecord = Array.isArray(row.users) ? row.users[0] : row.users
  const skills = (row.skills ?? [])
    .map(skill => (skill ? parseSkillString(skill) : { name: '', level: '' }))
    .filter(skill => skill.name)

  return {
    id: row.user_id,
    name: userRecord?.name || row.name || 'Student',
    field: row.field || '',
    university: row.university || '',
    bio: row.bio || '',
    skills,
    languages: row.languages ?? [],
    interests: row.interests ?? [],
    experience: row.experience || '',
    goals: row.goals || '',
    links: row.links ?? {},
  }
}

function topSkills(skills, limit = 4) {
  return (skills ?? [])
    .map(skill => (typeof skill === 'string' ? skill : skill?.name))
    .filter(Boolean)
    .slice(0, limit)
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

function NgoRoleRail({ roles, selectedRoleId, onSelectRole, roleSummaries, loading = false }) {
  return (
    <aside
      className="overflow-y-auto rounded-[30px] border border-white/75 bg-white/68 p-4 shadow-[0_22px_60px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-2xl"
      style={{ height: '600px' }}
    >
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Posted roles</p>
          <p className="mt-1 text-[0.84rem] text-[#5F6368]">{roles.length} role{roles.length !== 1 ? 's' : ''} ready</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90">
          <Briefcase size={18} />
        </div>
      </div>

      <div>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-[92px] animate-pulse rounded-[24px] border border-white/75 bg-white px-4 py-5">
                <div className="h-4 w-2/3 rounded-full bg-[#EEF4FF]" />
                <div className="mt-3 h-3 w-1/2 rounded-full bg-[#F1F4F9]" />
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#D7E6FF] bg-white/62 px-5 py-8 text-center shadow-[0_10px_24px_rgba(26,115,232,0.05)]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
              <Layers size={22} />
            </div>
            <p className="mb-1 text-[0.95rem] font-semibold text-[#202124]">No roles yet</p>
            <p className="text-[0.8rem] leading-5 text-[#5F6368]">Create a role first, then Hive can rank students for it.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map((role, i) => {
              const isActive = String(selectedRoleId) === String(role.id)
              return (
                <motion.button
                  key={role.id}
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => onSelectRole(role.id)}
                  className={`group w-full rounded-[24px] border px-4 py-5 text-left transition-all ${
                    isActive
                      ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_14px_30px_rgba(26,115,232,0.13),0_1px_0_rgba(255,255,255,0.86)_inset]'
                      : 'border-white/75 bg-white hover:border-[#BFD7FF] hover:bg-[#FBFCFE] hover:shadow-[0_12px_28px_rgba(26,115,232,0.08)]'
                  }`}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <GradientAvatar name={role.orgName || role.title || 'Role'} size={44} radius="0.95rem" className="shrink-0 shadow-sm ring-2 ring-white/80" />
                      <div className="min-w-0">
                        <p className={`line-clamp-1 text-[0.98rem] font-semibold leading-snug ${isActive ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                          {role.title || 'Untitled role'}
                        </p>
                        <p className="mt-1.5 truncate text-[0.78rem] text-[#5F6368]">
                          {role.category || [role.workMode, role.location].filter(Boolean).join(' · ') || 'Flexible role'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className={`mt-1 shrink-0 transition-transform ${isActive ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

function NgoStudentMatchCard({ match, onViewProfile, onReachOut }) {
  const [expanded, setExpanded] = useState(false)
  const { student, result } = match
  const skills = topSkills(student.skills)
  const reasons = result.reasons?.slice(0, 2) ?? []

  return (
    <motion.article
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      className={`overflow-hidden rounded-[30px] border bg-white/82 backdrop-blur-xl transition-all ${
        expanded
          ? 'border-[#BFD7FF] shadow-[0_22px_58px_rgba(26,115,232,0.13),0_1px_0_rgba(255,255,255,0.88)_inset]'
          : 'border-white/75 shadow-[0_16px_42px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.86)_inset] hover:-translate-y-0.5 hover:border-[#D7E6FF] hover:bg-white hover:shadow-[0_22px_58px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.9)_inset]'
      }`}
    >
      {/* Clickable summary row */}
      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <GradientAvatar name={student.name} size={52} radius="1rem" className="shrink-0 shadow-[0_12px_26px_rgba(26,115,232,0.10)] ring-2 ring-white/80" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[1rem] font-semibold text-[#202124]">{student.name}</h3>
            <MatchScoreBadge score={result.score} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] text-[#5F6368]">
            {student.field && (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap size={14} className="text-[#1A73E8]" />
                {student.field}
              </span>
            )}
            {student.university && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-[#188038]" />
                {student.university}
              </span>
            )}
          </div>
        </div>
        <span className="hidden shrink-0 text-[0.78rem] font-semibold text-[#1A73E8] sm:block">
          {expanded ? 'Hide details' : 'View details'}
        </span>
        {!expanded && (
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8FBFF] text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)] sm:flex">
            <ChevronRight size={15} />
          </span>
        )}
        <ChevronDown
          size={17}
          className={`shrink-0 text-[#5F6368] transition-transform ${expanded ? 'rotate-180 text-[#1A73E8]' : ''}`}
        />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/70 bg-white/58 px-5 pb-5 backdrop-blur-xl">
          <p className="mt-4 text-[0.9rem] leading-6 text-[#5F6368]">
            {result.headline}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="rounded-full border border-[#D7E6FF] bg-white/80 px-3 py-1.5 text-[0.75rem] font-semibold text-[#3C4043] shadow-[0_8px_18px_rgba(26,115,232,0.05)]">
                {skill}
              </span>
            ))}
            {skills.length === 0 && (
              <span className="rounded-full border border-[#D7E6FF] bg-white/80 px-3 py-1.5 text-[0.75rem] font-semibold text-[#5F6368]">
                Skills not listed yet
              </span>
            )}
          </div>

          {reasons.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {reasons.map(reason => (
	                <div
	                  key={reason.label}
	                  className="rounded-2xl border border-white/80 bg-white/78 px-4 py-3 shadow-[0_10px_24px_rgba(26,115,232,0.06)]"
	                >
                  <p className="text-[0.76rem] font-semibold text-[#202124]">{reason.label}</p>
                  <p className="mt-1 line-clamp-2 text-[0.75rem] leading-5 text-[#5F6368]">{reason.detail}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
	            <button
	              onClick={() => onViewProfile(student.id)}
	              className="rounded-full border border-[#D7E6FF] bg-white/88 px-4 py-2 text-[0.8rem] font-semibold text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.06)] transition-colors hover:bg-white"
	            >
	              View profile
	            </button>
            <button
              onClick={() => onReachOut(student.id)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-4 py-2 text-[0.8rem] font-semibold text-white shadow-[0_10px_22px_rgba(26,115,232,0.22)] transition-all hover:bg-[#1765CC]"
            >
              <Mail size={14} />
              Reach out
            </button>
          </div>
        </div>
      )}
    </motion.article>
  )
}

const MATCHES_PER_PAGE = 5

function NgoMatchesView({
  roles,
  loading,
  error,
  selectedRoleId,
  onSelectRole,
  selectedRole,
  selectedMatches,
  roleSummaries,
  onViewProfile,
  onReachOut,
}) {
  const [page, setPage] = useState(0)
  const [lastRoleId, setLastRoleId] = useState(selectedRoleId)
  const listTopRef = useRef(null)

  // Jump back to the first page whenever a different role is selected
  if (lastRoleId !== selectedRoleId) {
    setLastRoleId(selectedRoleId)
    setPage(0)
  }

  const pageCount = Math.ceil(selectedMatches.length / MATCHES_PER_PAGE)
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0))
  const visibleMatches = selectedMatches.slice(currentPage * MATCHES_PER_PAGE, (currentPage + 1) * MATCHES_PER_PAGE)

  function goToPage(nextPage) {
    setPage(nextPage)
    setTimeout(() => {
      listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <NgoRoleRail
        roles={roles}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
        roleSummaries={roleSummaries}
        loading={loading}
      />

      <section className="min-w-0 space-y-5">
        {error && (
          <div className="rounded-[22px] border border-red-200 bg-red-50/90 px-5 py-4 text-[0.9rem] font-medium text-red-700 shadow-[0_12px_30px_rgba(180,35,24,0.06)]">
            {error}
          </div>
        )}

        {loading ? (
          <>
	            <div className="rounded-[30px] border border-white/75 bg-white/78 p-6 shadow-[0_22px_60px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.88)_inset] backdrop-blur-2xl">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="h-7 w-40 animate-pulse rounded-full bg-[#E8F0FE]" />
                  <div className="mt-4 h-10 w-3/5 animate-pulse rounded-2xl bg-[#EEF4FF]" />
                  <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-[#F1F4F9]" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:flex">
                  {[0, 1].map(i => (
                    <div key={i} className="h-[74px] w-[108px] animate-pulse rounded-2xl bg-[#F8FAFF]" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[0, 1, 2].map(i => (
	                <div key={i} className="min-h-[254px] animate-pulse rounded-[30px] border border-white/75 bg-white/80 p-5 shadow-[0_16px_42px_rgba(26,115,232,0.07)]">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#E8F0FE]" />
                    <div className="flex-1">
                      <div className="h-5 w-1/3 rounded-full bg-[#EEF4FF]" />
                      <div className="mt-3 h-4 w-1/2 rounded-full bg-[#F1F4F9]" />
                    </div>
                    <div className="h-9 w-28 rounded-full bg-[#E8F0FE]" />
                  </div>
                  <div className="mt-5 h-4 w-full rounded-full bg-[#F1F4F9]" />
                  <div className="mt-3 h-4 w-4/5 rounded-full bg-[#F1F4F9]" />
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <div className="h-16 rounded-2xl bg-[#FBFCFE]" />
                    <div className="h-16 rounded-2xl bg-[#FBFCFE]" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : !selectedRole ? (
	          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[30px] border border-white/75 bg-white/78 px-6 text-center shadow-[0_22px_60px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.88)_inset] backdrop-blur-2xl">
	            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F0FE] text-[#1A73E8] shadow-[0_14px_32px_rgba(26,115,232,0.14)]">
              <Users size={26} />
            </div>
            <h2 className="text-[1.2rem] font-semibold text-[#202124]">Pick a role to see matches</h2>
            <p className="mt-2 max-w-md text-[0.9rem] leading-6 text-[#5F6368]">
              Hive will rank student profiles by skills, mission fit, field, language, and role details.
            </p>
          </div>
        ) : (
          <>
	            <div className="relative overflow-hidden rounded-[32px] border border-white/75 bg-white/80 p-6 shadow-[0_24px_70px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl">
	              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_86%_0%,rgba(26,115,232,0.13),transparent_42%),linear-gradient(180deg,rgba(232,240,254,0.42),transparent)]" />
	              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
	                <div>
	                  <p className="mb-3 inline-flex rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.72rem] font-semibold text-[#1A73E8]">
	                    Ranked student matches
                  </p>
                  <h2 className="text-[clamp(1.6rem,3vw,2.35rem)] font-semibold leading-tight tracking-[-0.04em] text-[#202124]">
                    {selectedRole.title || 'Selected role'}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[0.92rem] leading-6 text-[#5F6368]">
                    Top students sorted by how closely their skills and languages match this role.
                  </p>
                </div>
                <div className="flex gap-3">
	                  <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-center shadow-[0_14px_30px_rgba(24,128,56,0.08)] backdrop-blur-xl">
                    <p className="text-[1.25rem] font-semibold text-[#188038]">
                      {selectedMatches[0]?.result.score ?? 0}%
                    </p>
                    <p className="text-[0.72rem] font-semibold text-[#5F6368]">Best fit</p>
	              </div>
	            </div>
              </div>
            </div>

            {selectedMatches.length === 0 ? (
	              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[30px] border border-white/75 bg-white/78 px-6 text-center shadow-[0_22px_60px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.88)_inset] backdrop-blur-2xl">
	                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F4F9] text-[#9AA0A6]">
	                  <Search size={24} />
	                </div>
                <h3 className="text-[1.05rem] font-semibold text-[#202124]">No student profiles to match yet</h3>
                <p className="mt-2 max-w-md text-[0.88rem] leading-6 text-[#5F6368]">
                  Once students complete their profiles, this role will show ranked recommendations here.
                </p>
              </div>
            ) : (
              <>
                <div ref={listTopRef} className="scroll-mt-6 space-y-4" role="list" aria-label="Student matches for selected role">
                  {visibleMatches.map(match => (
                    <div key={match.student.id} role="listitem">
                      <NgoStudentMatchCard
                        match={match}
                        onViewProfile={onViewProfile}
                        onReachOut={onReachOut}
                      />
                    </div>
                  ))}
                </div>

                {pageCount > 1 && (
                  <nav className="flex items-center justify-center gap-2 pt-1" aria-label="Match pages">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 0}
                      aria-label="Previous page"
	                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E6FF] bg-white/88 text-[#5F6368] shadow-[0_8px_18px_rgba(26,115,232,0.06)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: pageCount }, (_, pageIndex) => (
                      <button
                        key={pageIndex}
                        onClick={() => goToPage(pageIndex)}
                        aria-label={`Page ${pageIndex + 1}`}
                        aria-current={pageIndex === currentPage ? 'page' : undefined}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-[0.85rem] font-semibold transition-all ${
                          pageIndex === currentPage
                            ? 'bg-[#1A73E8] text-white shadow-[0_6px_16px_rgba(26,115,232,0.25)]'
	                            : 'border border-[#D7E6FF] bg-white/88 text-[#5F6368] hover:bg-white hover:text-[#1A73E8]'
                        }`}
                      >
                        {pageIndex + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= pageCount - 1}
                      aria-label="Next page"
	                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E6FF] bg-white/88 text-[#5F6368] shadow-[0_8px_18px_rgba(26,115,232,0.06)] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchResults() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeMatch, setActiveMatch] = useState(null)
  const [ngoRoles, setNgoRoles] = useState([])
  const [ngoStudents, setNgoStudents] = useState([])
  const [ngoLoading, setNgoLoading] = useState(true)
  const [ngoError, setNgoError] = useState(null)
  const [selectedNgoRoleId, setSelectedNgoRoleId] = useState(null)

  const isNgo = user?.role === 'ngo'

  const userName = profile?.name || user?.name || 'You'
  const userField = profile?.field || ''

  useEffect(() => {
    if (isNgo) return
    if (!profile) { setLoading(false); return }
    withTimeout(fetchActiveOpportunities(), 10000, 'fetchActiveOpportunities')
      .then(opps => {
        const scored = opps
          .map(opp => ({ opp, result: computeMatch(profile, opp) }))
          .sort((a, b) => b.result.score - a.result.score)
        setMatches(scored.map(({ opp, result }) => oppToCard(opp, result, userName, userField)))
      })
      .catch(err => console.error('Failed to fetch matches:', err.message))
      .finally(() => setLoading(false))
  }, [isNgo, profile, user?.id, userField, userName])

  useEffect(() => {
    if (!isNgo || !user?.id) {
      setNgoLoading(false)
      return
    }

    let cancelled = false
    setNgoLoading(true)
    setNgoError(null)

    Promise.all([
      withTimeout(fetchNgoOpportunities(user.id), 10000, 'fetchNgoOpportunitiesForMatches'),
      withTimeout(
        supabase
          .from('student_profiles')
          .select('user_id, field, university, skills, languages, bio, interests, links, experience, goals, users(id, name)')
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return data ?? []
          }),
        10000,
        'fetchStudentProfilesForNgoMatches'
      ),
    ])
      .then(([roles, studentRows]) => {
        if (cancelled) return
        setNgoRoles(roles)
        setNgoStudents(studentRows.map(normalizeStudentProfile))
        setSelectedNgoRoleId(current => {
          if (current && roles.some(role => String(role.id) === String(current))) return current
          return roles[0]?.id ?? null
        })
      })
      .catch(err => {
        if (!cancelled) setNgoError('Could not load matches. ' + err.message)
      })
      .finally(() => {
        if (!cancelled) setNgoLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isNgo, user?.id])

  const roleMatches = useMemo(() => {
    if (!isNgo) return {}

    return Object.fromEntries(
      ngoRoles.map(role => {
        const ranked = ngoStudents
          .map(student => ({ student, result: computeMatch(student, role) }))
          .sort((a, b) => b.result.score - a.result.score)
        return [String(role.id), ranked]
      })
    )
  }, [isNgo, ngoRoles, ngoStudents])

  const selectedNgoRole = useMemo(
    () => ngoRoles.find(role => String(role.id) === String(selectedNgoRoleId)) ?? null,
    [ngoRoles, selectedNgoRoleId]
  )

  const selectedNgoMatches = selectedNgoRole ? (roleMatches[String(selectedNgoRole.id)] ?? []) : []

  const roleSummaries = useMemo(() => (
    Object.fromEntries(
      ngoRoles.map(role => {
        const ranked = roleMatches[String(role.id)] ?? []
        return [
          String(role.id),
          {
            count: ranked.length,
            topScore: ranked[0]?.result.score ?? 0,
          },
        ]
      })
    )
  ), [ngoRoles, roleMatches])

  function handleViewStudentProfile(studentId) {
    navigate(`/student-profile/${studentId}?backTo=matches`)
  }

  function handleReachOut(studentId) {
    navigate(`/interview-message/${studentId}`, {
      state: {
        fromMatches: true,
        roleId: selectedNgoRole?.id,
        roleTitle: selectedNgoRole?.title,
      },
    })
  }

  if (isNgo) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[#F5F7FB]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[radial-gradient(circle_at_88%_4%,rgba(255,255,255,0.96),transparent_23%),radial-gradient(circle_at_80%_8%,rgba(26,115,232,0.13),transparent_42%),radial-gradient(circle_at_14%_0%,rgba(26,115,232,0.08),transparent_42%)]" />
        <div className="pointer-events-none absolute right-[-7rem] top-14 hidden h-64 w-[620px] select-none overflow-hidden lg:block" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 620 250" fill="none" preserveAspectRatio="none">
            <path
              d="M40 120 C132 54 208 68 294 112 C384 158 478 148 620 62 L620 250 L40 250 Z"
              fill="url(#ngoMatchesWaveFill)"
              opacity="0.86"
            />
            <path
              d="M8 108 C112 38 202 56 292 100 C386 146 478 138 606 48"
              stroke="url(#ngoMatchesWaveLine)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.72"
            />
            <path
              d="M112 154 C214 96 284 120 360 154 C444 194 520 182 612 120"
              stroke="#1A73E8"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.12"
            />
            <defs>
              <linearGradient id="ngoMatchesWaveFill" x1="82" y1="28" x2="596" y2="210" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#E8F0FE" stopOpacity="0" />
                <stop offset="0.38" stopColor="#D7E6FF" stopOpacity="0.72" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="ngoMatchesWaveLine" x1="0" y1="0" x2="620" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#1A73E8" stopOpacity="0" />
                <stop offset="0.45" stopColor="#1A73E8" stopOpacity="0.25" />
                <stop offset="1" stopColor="#1A73E8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative mx-auto max-w-[1520px] px-6 py-10 lg:px-10">
          <div className="relative mb-8">
            <div className="flex flex-col gap-4 lg:min-h-[172px] lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-[clamp(2.4rem,5vw,4.35rem)] font-semibold leading-none tracking-[-0.055em] text-[#202124]">
                  Matches
                </h1>
                <p className="mt-5 max-w-2xl text-[1rem] leading-7 text-[#5F6368]">
                  {ngoLoading
                    ? 'Finding compatible students for your posted roles...'
                    : 'Top students for each role, ranked by matching skills and languages.'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 -mt-8">
            <NgoMatchesView
              roles={ngoRoles}
              loading={ngoLoading}
              error={ngoError}
              selectedRoleId={selectedNgoRoleId}
              onSelectRole={setSelectedNgoRoleId}
              selectedRole={selectedNgoRole}
              selectedMatches={selectedNgoMatches}
              roleSummaries={roleSummaries}
              onViewProfile={handleViewStudentProfile}
              onReachOut={handleReachOut}
            />
          </div>
        </div>
      </div>
    )
  }

  if (user && !user.onboardingComplete) {
    return (
      <div className="w-full px-8 py-7 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold text-[#202124]">Complete your profile to see matches</h2>
          <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-7 text-[#5F6368]">
            Our AI needs your skills and interests to find NGOs that are a strong fit.
          </p>
          <a href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.86rem] font-semibold text-white shadow-[0_8px_22px_rgba(26,115,232,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1558C0]">
            Complete my profile
          </a>
        </div>
      </div>
    )
  }

  const matchesToShow = matches

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
        <div className="mx-auto max-w-[1480px] px-6 pb-8 pt-12 lg:px-10">
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`mb-8 ${!loading && matchesToShow.length > 0 ? 'flex items-start justify-between gap-6' : ''}`}
          >
            <div>
              <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
                Matches
              </h1>
              <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
                {loading
                  ? 'Finding compatible roles for your profile.'
                  : `${matchesToShow.length} match${matchesToShow.length !== 1 ? 'es' : ''} ranked by skills, experience, language, and mission alignment.`}
              </p>
            </div>
            {!loading && matchesToShow.length > 0 && (
              <img src={matchesIllustration} alt="" aria-hidden="true" className="hidden lg:block w-[190px] shrink-0 opacity-90 select-none pointer-events-none self-start" />
            )}
          </motion.header>

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
          <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D7E6FF] bg-[#F8FBFF] px-6 py-16 text-center">
            <img src={matchesIllustration} alt="" className="mx-auto w-52 mb-5 select-none" />
            <h2 className="text-xl font-semibold text-[#202124]">No matches yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-7 text-[#5F6368]">
              Add more skills, interests, and experience to your profile for stronger matches.
            </p>
            <a href="/settings" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.86rem] font-semibold text-white shadow-[0_8px_22px_rgba(26,115,232,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1558C0]">
              Update profile
            </a>
          </div>
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
      </main>

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
