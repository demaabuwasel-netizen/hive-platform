import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, CheckCircle2, UserRound,
  X, Send, RotateCcw, Loader,
  GraduationCap, ExternalLink, Briefcase,
  Sparkles, ArrowRight, Award, Layers3,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { sendInterviewMessage } from '../services/messages'
import { groupSkills } from '../data/skills'
import GradientAvatar from './GradientAvatar'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatMatchReason(reason) {
  if (!reason) return ''

  // Try to extract JSON from the string (e.g., "1 skill matched: {...}")
  const jsonMatch = reason.match(/\{[^}]+\}/)
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[0])
      return `Matched: ${obj.name}`
    } catch {
      // If JSON parse fails, just remove the JSON and return the text part
      return reason.replace(/\s*\{[^}]+\}/, '').trim()
    }
  }

  return reason
}

function skillName(skill) {
  return typeof skill === 'string' ? skill : (skill?.name ?? '')
}

const STATUS_CONFIG = {
  new:         { label: 'New' },
  shortlisted: { label: 'Shortlisted' },
  interview:   { label: 'Interview' },
  accepted:    { label: 'Accepted' },
  completed:   { label: 'Completed' },
  rejected:    { label: 'Rejected' },
}

function SectionLabel({ children, eyebrow }) {
  return (
    <div>
      {eyebrow && (
        <p className="mb-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">
          {eyebrow}
        </p>
      )}
      <h3 className="text-[1rem] font-semibold text-[#202124]">{children}</h3>
    </div>
  )
}

function buildInviteMessage(applicant) {
  const firstName = applicant?.name?.split(' ')[0] || 'there'
  const field = applicant?.field || 'development'
  return `Hi ${firstName},

We're excited about your application! Your background in ${field} and demonstrated skills make you a strong fit for our team.

We'd like to move forward with the next step: a brief interview. This will be a great opportunity for us to discuss your experience and learn more about your goals.

Would you be available for a 30-minute interview in the coming week? We're flexible with timing and can accommodate your schedule.

Looking forward to connecting with you!

Best regards`
}

function InterviewInviteModal({ applicant, onClose, onSent }) {
  const { user } = useApp()
  const [message, setMessage] = useState(() => buildInviteMessage(applicant))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  async function handleSend() {
    if (!message.trim() || !user?.id || sending) return
    setSending(true)
    setError(null)
    try {
      await sendInterviewMessage(applicant.studentId, user.id, message)
      onSent()
    } catch (err) {
      // Message storage table may not be set up yet — treat as sent
      if (err?.message?.includes('table') || err?.message?.includes('not set up')) {
        onSent()
      } else {
        setError('Failed to send: ' + (err?.message || 'Unknown error'))
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(32,33,36,0.45)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_rgba(32,33,36,0.3)]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-4 pt-6">
          <div className="flex items-start gap-3.5">
            <GradientAvatar name={applicant.name} size={40} radius="9999px" className="shrink-0"/>
            <div>
              <h2 className="text-[1.05rem] font-medium text-[#202124]">Interview invitation</h2>
              <p className="mt-0.5 text-[0.82rem] text-[#5F6368]">
                Invite {applicant.name?.split(' ')[0]} to the next step
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#5F6368] transition-colors hover:bg-[#F1F3F4]">
            <X size={17}/>
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={10}
            className="w-full resize-none rounded-2xl border border-[#DADCE0] px-4 py-3.5 text-[0.87rem] leading-6 text-[#3C4043] outline-none transition-colors placeholder:text-[#9AA0A6] focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/15"
            placeholder="Write your invitation..."
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[0.74rem] text-[#5F6368]">{message.length} characters</span>
            <button
              onClick={() => setMessage(buildInviteMessage(applicant))}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] font-medium text-[#1A73E8] transition-colors hover:bg-[#E8F0FE]">
              <RotateCcw size={12}/> Regenerate
            </button>
          </div>
          {error && (
            <p className="mt-2 text-[0.78rem] text-[#D93025]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-4">
          <button onClick={onClose}
            className="h-10 rounded-full px-5 text-[0.85rem] font-medium text-[#5F6368] transition-colors hover:bg-[#F1F3F4]">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1A73E8] px-6 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#1765CC] disabled:cursor-not-allowed disabled:opacity-50">
            {sending ? <Loader size={15} className="animate-spin"/> : <Send size={15} strokeWidth={2}/>}
            {sending ? 'Sending…' : 'Send invitation'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EmptyBlock({ icon: Icon, title }) {
  return (
    <div className="flex min-h-[92px] items-center gap-3 rounded-[18px] border border-dashed border-[#D7E6FF] bg-[#FBFCFE] px-4 py-3 text-[#5F6368]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#9AA0A6] shadow-[0_1px_4px_rgba(60,64,67,0.06)]">
        <Icon size={16} strokeWidth={2}/>
      </span>
      <p className="text-[0.84rem] font-medium">{title}</p>
    </div>
  )
}

function PreviewSection({ icon: Icon, title, eyebrow, children }) {
  return (
    <section className="rounded-[22px] border border-[#E8EAED] bg-white p-5 shadow-[0_8px_20px_rgba(60,64,67,0.035)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#F1F3F4] text-[#5F6368]">
          <Icon size={18} strokeWidth={2}/>
        </span>
        <SectionLabel eyebrow={eyebrow}>{title}</SectionLabel>
      </div>
      {children}
    </section>
  )
}

function SkillChip({ children, tone = 'default' }) {
  const tones = {
    matched: 'border-[#AECBFA] bg-[#E8F0FE] text-[#174EA6]',
    default: 'border-[#E8EAED] bg-white text-[#3C4043]',
  }
  return (
    <span className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-[0.78rem] font-medium ${tones[tone] || tones.default}`}>
      {children}
    </span>
  )
}

function SkillCloud({ groups, matchedSet }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#EEF3FB]">
      {groups.map(({ cat, items }) => (
        <div
          key={cat.cat}
          className="grid gap-3 border-b border-[#EEF3FB] bg-white px-4 py-4 last:border-b-0 sm:grid-cols-[132px_minmax(0,1fr)]"
        >
          <div>
            <p className="text-[0.82rem] font-semibold text-[#202124]">{cat.cat}</p>
            <p className="mt-1 text-[0.7rem] font-medium text-[#9AA0A6]">{items.length} added</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map(item => (
              <SkillChip key={item.name} tone={matchedSet.has(item.name.toLowerCase()) ? 'matched' : 'default'}>
                {item.name}
              </SkillChip>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MatchInsight({ score, reasons }) {
  const clampedScore = Math.min(Math.max(Number(score) || 0, 0), 100)

  return (
    <section className="rounded-[22px] border border-[#D7E6FF] bg-white p-5 shadow-[0_8px_20px_rgba(60,64,67,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Role alignment</p>
          <h3 className="text-[1rem] font-semibold text-[#202124]">Match insight</h3>
        </div>
        <span className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#E8F0FE] px-3 text-[0.82rem] font-semibold text-[#174EA6]">
          {clampedScore}% match
        </span>
      </div>

      {reasons.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-3 border-t border-[#EEF3FB] pt-2.5 text-[0.84rem] leading-6 text-[#3C4043] first:border-t-0 first:pt-0">
              <CheckCircle2 size={15} strokeWidth={2.1} className="mt-1 shrink-0 text-[#1A73E8]" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-[16px] bg-[#F8FBFF] px-3.5 py-3 text-[0.84rem] text-[#5F6368]">
          Hive does not have enough profile detail to explain this match yet.
        </p>
      )}
    </section>
  )
}

function DecisionPanel({ status, statusLabel, onStatusChange, onInvite }) {
  if (status === 'accepted' || status === 'completed') {
    return (
      <div className="border-t border-[#E5EEFB] bg-white px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3 rounded-[20px] bg-[#F8FBFF] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
            <CheckCircle2 size={18} strokeWidth={2.2}/>
          </span>
          <div>
            <p className="text-[0.92rem] font-semibold text-[#202124]">
              {status === 'completed' ? 'Role completed' : 'Student accepted'}
            </p>
            <p className="mt-0.5 text-[0.78rem] text-[#5F6368]">
              {status === 'completed'
                ? 'This applicant has finished the role.'
                : 'This applicant has been selected for the role.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="border-t border-[#E5EEFB] bg-white px-5 py-5 sm:px-6">
        <button
          onClick={() => onStatusChange('new')}
          className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#DADCE0] bg-white px-4 text-[0.84rem] font-semibold text-[#3C4043] transition-colors hover:bg-[#F8F9FA]">
          Reopen applicant
        </button>
      </div>
    )
  }

  const isInterview = status === 'interview'

  return (
    <div className="border-t border-[#E5EEFB] bg-white px-5 py-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.92rem] font-semibold text-[#202124]">Decision</p>
          <p className="mt-0.5 text-[0.78rem] text-[#5F6368]">
            {isInterview ? 'Interview is the next checkpoint.' : 'Start with an interview invitation.'}
          </p>
        </div>
        <span className="inline-flex h-9 items-center rounded-full bg-[#F8F9FA] px-3 text-[0.76rem] font-semibold text-[#5F6368]">
          {statusLabel}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <button
          onClick={isInterview ? () => onStatusChange('accepted') : onInvite}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#1A73E8] px-4 text-[0.84rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.20)] transition-colors hover:bg-[#1765CC]">
          {isInterview ? <CheckCircle2 size={15} strokeWidth={2}/> : <Calendar size={15} strokeWidth={2}/>}
          {isInterview ? 'Accept student' : 'Invite to interview'}
        </button>
        <button
          onClick={() => onStatusChange('rejected')}
          className="inline-flex h-11 items-center justify-center rounded-2xl px-4 text-[0.82rem] font-semibold text-[#5F6368] transition-colors hover:bg-[#F1F3F4]">
          Pass
        </button>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, title, subtitle, tag, link, description }) {
  return (
    <div className="flex gap-3 rounded-[18px] bg-[#F8F9FA] p-4">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5F6368] shadow-[0_1px_4px_rgba(60,64,67,0.06)]">
        <Icon size={16} strokeWidth={2}/>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.92rem] font-semibold leading-5 text-[#202124]">{title}</p>
        {subtitle && <p className="mt-0.5 text-[0.82rem] text-[#5F6368]">{subtitle}</p>}
        {tag && <p className="mt-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#1A73E8]">{tag}</p>}
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[0.82rem] font-semibold text-[#1A73E8] hover:underline">
            View project
            <ExternalLink size={12} strokeWidth={2}/>
          </a>
        )}
        {description && <p className="mt-1.5 text-[0.8rem] leading-6 text-[#5F6368]">{description}</p>}
      </div>
    </div>
  )
}

export default function ApplicantDetail({ applicant, loading, status, onStatusChange }) {
  const [inviteOpen, setInviteOpen] = useState(false)

  if (loading) {
    return (
      <div
        className="min-h-[620px] rounded-[36px] border bg-white p-8 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-[#F1F3F4]" />
          <div className="min-w-0 flex-1">
            <div className="h-7 w-48 animate-pulse rounded-full bg-[#F1F3F4]" />
            <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded-full bg-[#F1F4F9]" />
          </div>
        </div>
        <div className="mt-7 min-h-[380px] animate-pulse rounded-[24px] bg-[#FBFCFE]" />
      </div>
    )
  }

  if (!applicant) {
    return (
      <div
        className="flex min-h-[620px] flex-col items-center justify-center rounded-[36px] border bg-white p-8 text-center shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F3F4] text-[#5F6368]">
          <UserRound size={24} strokeWidth={1.8} />
        </div>
        <h3 className="text-[1.05rem] font-semibold text-[#202124]">Select an applicant</h3>
        <p className="mx-auto mt-2 max-w-lg text-[0.92rem] leading-6 text-[#5F6368]">
          Choose someone from the queue to review their profile, fit, and next action.
        </p>
      </div>
    )
  }

  const st = STATUS_CONFIG[status] ?? STATUS_CONFIG.new
  const skills = (applicant.skills || []).map(skillName).filter(Boolean)
  const skillGroups = groupSkills(applicant.skills).filter(group => group.items?.length)
  const matchedSkills = (applicant.skillMatches?.matched || [])
    .map(match => match.studentSkill || match.oppSkill)
    .filter(Boolean)
  const partialSkills = (applicant.skillMatches?.partial || [])
    .map(match => match.relatedSkill)
    .filter(Boolean)
  const matchedSet = new Set([...matchedSkills, ...partialSkills].map(s => s.toLowerCase()))
  const educationItems = applicant.educations?.length ? applicant.educations : []
  const projects = Array.isArray(applicant.projects) ? applicant.projects : []
  const topReasons = (applicant.matchReasons || []).map(formatMatchReason).filter(Boolean).slice(0, 4)

  return (
    <div
      className="overflow-hidden rounded-[28px] border bg-[#FBFCFE] shadow-[0_1px_0_rgba(17,24,39,0.02),0_16px_36px_rgba(17,24,39,0.055)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}>

      <div className="bg-white p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_210px]">
          <div className="flex min-w-0 items-start gap-4">
            <GradientAvatar name={applicant.name} size={52} radius="1rem" className="shrink-0 shadow-sm"/>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">
                  Applicant preview
                </p>
                <span className="h-1 w-1 rounded-full bg-[#DADCE0]" />
                <span className="rounded-full bg-[#F1F3F4] px-2.5 py-1 text-[0.72rem] font-semibold text-[#3C4043]">
                  {st.label}
                </span>
              </div>
              <h2 className="mt-2 truncate text-[1.8rem] font-semibold leading-tight text-[#202124]">
                {applicant.name}
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex h-9 items-center gap-2 rounded-full bg-[#E8F0FE] px-3.5 text-[0.84rem] font-semibold text-[#174EA6]">
                  <Sparkles size={14} strokeWidth={2}/>
                  {applicant.match}% match
                </span>
                <span className="inline-flex h-9 items-center gap-2 rounded-full bg-[#F8F9FA] px-3.5 text-[0.82rem] font-medium text-[#5F6368]">
                  <Calendar size={14} strokeWidth={2}/>
                  Applied {formatDate(applicant.submittedAt) || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-start lg:justify-end">
            <Link
              to={`/student-profile/${applicant.studentId}?backTo=applicants&opportunity=${applicant.opportunityId}`}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#D7E6FF] bg-[#F8FBFF] px-4 text-[0.82rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#E8F0FE]">
              View full profile
              <ArrowRight size={14} strokeWidth={2}/>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <PreviewSection icon={Award} title="Skills" eyebrow="Matched to this role">
          {skills.length > 0 ? (
            <div>
              <SkillCloud groups={skillGroups} matchedSet={matchedSet} />
              {matchedSet.size > 0 && (
                <p className="mt-3 text-[0.76rem] text-[#5F6368]">
                  Blue skills match or relate to the skills requested for this role.
                </p>
              )}
            </div>
          ) : (
            <EmptyBlock icon={Award} title="No skills added yet." />
          )}
        </PreviewSection>

        {educationItems.length > 0 && (
          <PreviewSection icon={GraduationCap} title="Education" eyebrow="Academic signal">
            <div className="space-y-3">
              {educationItems.map((edu, i) => (
                <InfoRow
                  key={i}
                  icon={GraduationCap}
                  title={edu.field || 'Education'}
                  subtitle={edu.university || 'School not set'}
                  tag={(edu.degreeType || edu.isCurrent) && [edu.degreeType, edu.isCurrent ? 'Current' : ''].filter(Boolean).join(' · ')}
                  description={edu.description}
                />
              ))}
            </div>
          </PreviewSection>
        )}

        {projects.length > 0 && (
          <PreviewSection icon={Layers3} title="Projects" eyebrow="Proof of work">
            <div className="space-y-3">
              {projects.map((project, i) => (
                <InfoRow
                  key={i}
                  icon={Briefcase}
                  title={project.title || 'Project'}
                  link={project.link}
                  description={project.description}
                />
              ))}
            </div>
          </PreviewSection>
        )}

        <MatchInsight score={applicant.match} reasons={topReasons} />
      </div>

      <DecisionPanel
        status={status}
        statusLabel={st.label}
        onStatusChange={onStatusChange}
        onInvite={() => setInviteOpen(true)}
      />

      {/* Interview invitation modal */}
      <AnimatePresence>
        {inviteOpen && (
          <InterviewInviteModal
            applicant={applicant}
            onClose={() => setInviteOpen(false)}
            onSent={() => {
              setInviteOpen(false)
              if (status !== 'interview' && status !== 'accepted' && status !== 'completed') onStatusChange('interview')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
