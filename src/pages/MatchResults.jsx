import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, CheckCircle2, Sparkles, MessageCircle, Send, Search, Target, Brain,
  Briefcase, Users, ChevronRight, Mail, GraduationCap, MapPin, Layers,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import MatchScoreBadge from '../components/MatchScoreBadge'
import EmptyState from '../components/EmptyState'
import GradientAvatar from '../components/GradientAvatar'
import { fetchActiveOpportunities, fetchNgoOpportunities, parseSkillString } from '../services/opportunities'
import { computeMatch } from '../services/matching'
import { supabase } from '../services/supabase'
import { withTimeout } from '../utils/withTimeout'

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
      className="sticky top-6 flex max-h-[calc(100vh-120px)] min-h-[600px] flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}
    >
      <div className="shrink-0 border-b px-5 py-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
          <Briefcase size={18} strokeWidth={2.3} />
        </div>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Opportunities</p>
        <p className="mt-1 text-[0.95rem] font-semibold text-[#202124]">Choose a role</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2.5 px-3 py-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-[112px] animate-pulse rounded-[22px] border border-[#E5EEFB] bg-[#FBFCFE] px-4 py-4">
                <div className="h-4 w-2/3 rounded-full bg-[#EEF4FF]" />
                <div className="mt-3 h-3 w-1/2 rounded-full bg-[#F1F4F9]" />
                <div className="mt-4 h-6 w-28 rounded-full bg-[#EEF4FF]" />
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F4F9] text-[#5F6368]">
              <Layers size={22} />
            </div>
            <p className="mb-1 text-[0.95rem] font-semibold text-[#202124]">No roles yet</p>
            <p className="text-[0.8rem] leading-5 text-[#5F6368]">Create an opportunity first, then Hive can rank students for it.</p>
          </div>
        ) : (
          <div className="space-y-2.5 px-3 py-3">
            {roles.map((role, i) => {
              const isActive = String(selectedRoleId) === String(role.id)
              const summary = roleSummaries[String(role.id)] ?? { topScore: 0, count: 0 }
              return (
                <motion.button
                  key={role.id}
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => onSelectRole(role.id)}
                  className={`min-h-[112px] w-full rounded-[22px] border px-4 py-4 text-left transition-all ${
                    isActive
                      ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_10px_24px_rgba(26,115,232,0.12)]'
                      : 'border-[#E5EEFB] bg-white hover:border-[#D7E6FF] hover:bg-[#FBFCFE]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`truncate text-[0.92rem] font-semibold ${isActive ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                        {role.title || 'Untitled role'}
                      </p>
                      <p className="mt-1 truncate text-[0.76rem] text-[#5F6368]">
                        {role.category || role.field || role.workMode || 'General opportunity'}
                      </p>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-[#1A73E8]' : 'text-[#9AA0A6]'} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${
                      isActive ? 'bg-white text-[#1A73E8]' : 'bg-[#F1F4F9] text-[#5F6368]'
                    }`}>
                      {summary.count} top matches
                    </span>
                    {summary.topScore > 0 && (
                      <span className="text-[0.72rem] font-semibold text-[#188038]">
                        Best {summary.topScore}%
                      </span>
                    )}
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

function NgoStudentMatchCard({ match, index, onViewProfile, onReachOut }) {
  const { student, result } = match
  const skills = topSkills(student.skills)
  const reasons = result.reasons?.slice(0, 2) ?? []

  return (
    <motion.article
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      className="min-h-[254px] rounded-[28px] border border-[#E5EEFB] bg-white p-5 shadow-[0_12px_34px_rgba(17,24,39,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#D7E6FF] hover:shadow-[0_18px_40px_rgba(17,24,39,0.065)]"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <GradientAvatar name={student.name} size={56} radius="1rem" />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[1.05rem] font-semibold text-[#202124]">{student.name}</h3>
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
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onViewProfile(student.id)}
            className="rounded-full border border-[#D7E6FF] px-4 py-2 text-[0.8rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#E8F0FE]"
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

      <p className="mt-4 text-[0.9rem] leading-6 text-[#5F6368]">
        {result.headline}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map(skill => (
          <span key={skill} className="rounded-full bg-[#F1F4F9] px-3 py-1.5 text-[0.75rem] font-semibold text-[#3C4043]">
            {skill}
          </span>
        ))}
        {skills.length === 0 && (
          <span className="rounded-full bg-[#F1F4F9] px-3 py-1.5 text-[0.75rem] font-semibold text-[#5F6368]">
            Skills not listed yet
          </span>
        )}
      </div>

      {reasons.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {reasons.map(reason => (
            <div
              key={reason.label}
              className="rounded-2xl border border-[#E5EEFB] bg-[#FBFCFE] px-4 py-3"
            >
              <p className="text-[0.76rem] font-semibold text-[#202124]">{reason.label}</p>
              <p className="mt-1 line-clamp-2 text-[0.75rem] leading-5 text-[#5F6368]">{reason.detail}</p>
            </div>
          ))}
        </div>
      )}
    </motion.article>
  )
}

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
  return (
    <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
      <NgoRoleRail
        roles={roles}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
        roleSummaries={roleSummaries}
        loading={loading}
      />

      <section className="min-w-0 space-y-5">
        {error && (
          <div className="rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-[0.9rem] font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <>
            <div className="rounded-[28px] border border-[#E5EEFB] bg-white p-6 shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
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
                <div key={i} className="min-h-[254px] animate-pulse rounded-[28px] border border-[#E5EEFB] bg-white p-5 shadow-[0_12px_34px_rgba(17,24,39,0.035)]">
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
          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[28px] border border-[#E5EEFB] bg-white px-6 text-center shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F0FE] text-[#1A73E8]">
              <Users size={26} />
            </div>
            <h2 className="text-[1.2rem] font-semibold text-[#202124]">Pick a role to see matches</h2>
            <p className="mt-2 max-w-md text-[0.9rem] leading-6 text-[#5F6368]">
              Hive will rank student profiles by skills, mission fit, field, language, and role details.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-[28px] border border-[#E5EEFB] bg-white p-6 shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-3 inline-flex rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.72rem] font-semibold text-[#1A73E8]">
                    Ranked student matches
                  </p>
                  <h2 className="text-[clamp(1.6rem,3vw,2.35rem)] font-semibold leading-tight tracking-[-0.04em] text-[#202124]">
                    {selectedRole.title || 'Selected role'}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[0.92rem] leading-6 text-[#5F6368]">
                    Top students are sorted by compatibility, so you can quickly find people worth inviting into a conversation.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <div className="rounded-2xl bg-[#F8FAFF] px-4 py-3 text-center">
                    <p className="text-[1.25rem] font-semibold text-[#202124]">{selectedMatches.length}</p>
                    <p className="text-[0.72rem] font-semibold text-[#5F6368]">Top matches</p>
                  </div>
                  <div className="rounded-2xl bg-[#F0FBF4] px-4 py-3 text-center">
                    <p className="text-[1.25rem] font-semibold text-[#188038]">
                      {selectedMatches[0]?.result.score ?? 0}%
                    </p>
                    <p className="text-[0.72rem] font-semibold text-[#5F6368]">Best fit</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedMatches.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-[#E5EEFB] bg-white px-6 text-center shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
                <Search size={28} className="mb-4 text-[#9AA0A6]" />
                <h3 className="text-[1.05rem] font-semibold text-[#202124]">No student profiles to match yet</h3>
                <p className="mt-2 max-w-md text-[0.88rem] leading-6 text-[#5F6368]">
                  Once students complete their profiles, this role will show ranked recommendations here.
                </p>
              </div>
            ) : (
              <div className="space-y-4" role="list" aria-label="Student matches for selected role">
                {selectedMatches.map((match, index) => (
                  <div key={match.student.id} role="listitem">
                    <NgoStudentMatchCard
                      match={match}
                      index={index}
                      onViewProfile={onViewProfile}
                      onReachOut={onReachOut}
                    />
                  </div>
                ))}
              </div>
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
          .slice(0, 10)
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
    const totalRanked = Object.values(roleSummaries).reduce((sum, item) => sum + item.count, 0)

    return (
      <div className="mx-auto max-w-[1520px] px-6 py-10 lg:px-10">
        <div className="mb-8">
          <h1 className="text-[clamp(2.4rem,5vw,4.35rem)] font-semibold leading-none tracking-[-0.055em] text-[#202124]">
            Matches
          </h1>
          <p className="mt-5 max-w-2xl text-[1rem] leading-7 text-[#5F6368]">
            {ngoLoading
              ? 'Finding compatible students for your posted roles...'
              : `Review ${totalRanked} ranked student recommendation${totalRanked !== 1 ? 's' : ''} across your opportunities.`}
          </p>
        </div>

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
    )
  }

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
      <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
        <div className="mx-auto max-w-[1480px] px-6 pb-8 pt-12 lg:px-10">
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
              Matches
            </h1>
            <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
              {loading
                ? 'Finding compatible roles for your profile.'
                : `${matchesToShow.length} match${matchesToShow.length !== 1 ? 'es' : ''} ranked by skills, experience, language, and mission alignment.`}
            </p>
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
