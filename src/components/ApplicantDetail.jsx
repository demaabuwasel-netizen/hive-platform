import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, CheckCircle2, UserRound,
  X, Send, RotateCcw, Loader, MapPin,
  GraduationCap, ExternalLink, Briefcase,
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

// Status carries the one deliberate accent color in the header — everything
// else in this component is neutral gray/white/blue-link, on purpose.
const STATUS_CONFIG = {
  new:         { label: 'New',         hex: '#1A73E8' },
  shortlisted: { label: 'Shortlisted', hex: '#5F6368' },
  interview:   { label: 'Interview',   hex: '#188038' },
  accepted:    { label: 'Accepted',    hex: '#188038' },
  completed:   { label: 'Completed',   hex: '#1A73E8' },
  rejected:    { label: 'Rejected',    hex: '#5F6368' },
}

// Plain uppercase section label — matches the Opportunity details box's "Role overview" / "Skills" style
function SectionLabel({ children }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
      {children}
    </p>
  )
}

function fitText(score) {
  if (score >= 80) return 'Strong fit'
  if (score >= 60) return 'Good fit'
  return 'Possible fit'
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

// A row: small muted label to the left, chips flowing freely to the right —
// used identically for Skills and Languages so the two read as one system.
function ChipRow({ label, items }) {
  return (
    <div>
      <p className="text-[0.76rem] font-medium text-[#9AA0A6]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map(item => (
          <span
            key={item}
            className="rounded-full border border-[#E8EAED] px-3 py-1 text-[0.8rem] text-[#3C4043]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// A single Education / Project row — icon, title, subtitle, no card chrome.
function InfoRow({ icon: Icon, title, subtitle, tag, link, description }) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F3F4] text-[#5F6368]">
        <Icon size={16} strokeWidth={2}/>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9rem] font-semibold text-[#202124]">{title}</p>
        {subtitle && <p className="mt-0.5 text-[0.82rem] text-[#5F6368]">{subtitle}</p>}
        {tag && <p className="mt-1 text-[0.78rem] font-medium text-[#1A73E8]">{tag}</p>}
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-[0.82rem] text-[#1A73E8] hover:underline">
            View project →
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
  const divider = { borderColor: 'rgba(0,0,0,0.06)' }

  return (
    <div
      className="rounded-[36px] border bg-white p-8 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}>

      {/* Header — name + one quiet metadata line, one deliberate accent color */}
      <div className="flex items-start gap-4">
        <GradientAvatar name={applicant.name} size={56} radius="1.2rem" className="shrink-0"/>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[#202124]">
              {applicant.name}
            </h2>
            <Link
              to={`/student-profile/${applicant.studentId}?backTo=applicants&opportunity=${applicant.opportunityId}`}
              className="inline-flex shrink-0 items-center gap-1 text-[0.8rem] font-medium text-[#1A73E8] hover:underline">
              View full profile
              <ExternalLink size={12} strokeWidth={2}/>
            </Link>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[0.84rem] font-semibold" style={{ color: st.hex }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.hex }} />
              {st.label}
            </span>
            <span className="text-[0.84rem] text-[#5F6368]">
              {applicant.match}% match · {fitText(applicant.match ?? 0)}
            </span>
            {applicant.field && (
              <span className="text-[0.84rem] text-[#5F6368]">{applicant.field}</span>
            )}
            {applicant.uni && (
              <span className="inline-flex items-center gap-1 text-[0.84rem] text-[#5F6368]">
                <GraduationCap size={13} strokeWidth={2}/>
                {applicant.uni}
              </span>
            )}
            {applicant.studentLocation && (
              <span className="inline-flex items-center gap-1 text-[0.84rem] text-[#5F6368]">
                <MapPin size={13} strokeWidth={2}/>
                {applicant.studentLocation}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[0.84rem] text-[#5F6368]">
              <Calendar size={13} strokeWidth={2}/>
              Applied {formatDate(applicant.submittedAt) || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Skills & Languages */}
      <div className="mt-8 flex flex-col gap-5 border-t pt-6" style={divider}>
        <SectionLabel>Skills</SectionLabel>
        {skills.length > 0 ? (
          <div className="-mt-2 flex flex-col gap-5">
            {groupSkills(applicant.skills).map(({ cat, items }) => (
              <ChipRow key={cat.cat} label={cat.cat} items={items.map(i => i.name)} />
            ))}
            {applicant.languages?.length > 0 && (
              <ChipRow label="Languages" items={applicant.languages} />
            )}
          </div>
        ) : (
          <p className="-mt-2 text-[0.86rem] text-[#9AA0A6]">No skills added yet.</p>
        )}
      </div>

      {/* Education */}
      <div className="mt-7 border-t pt-6" style={divider}>
        <SectionLabel>Education</SectionLabel>
        {applicant.educations?.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {applicant.educations.map((edu, i) => (
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
        ) : (
          <p className="mt-3 text-[0.86rem] text-[#9AA0A6]">No education added yet.</p>
        )}
      </div>

      {/* Projects — don't persist to the database anywhere in the app yet
          (a pre-existing gap, not specific to this page), so this shows
          empty until that's fixed. */}
      <div className="mt-7 border-t pt-6" style={divider}>
        <SectionLabel>Projects</SectionLabel>
        {applicant.projects?.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {applicant.projects.map((project, i) => (
              <InfoRow
                key={i}
                icon={Briefcase}
                title={project.title || 'Project'}
                link={project.link}
                description={project.description}
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[0.86rem] text-[#9AA0A6]">No projects added yet.</p>
        )}
      </div>

      {/* Why they match — text and a single accent icon, no colored fill */}
      {applicant.matchReasons?.length > 0 && (
        <div className="mt-7 border-t pt-6" style={divider}>
          <SectionLabel>Why they match</SectionLabel>
          <div className="mt-3 flex flex-col gap-2.5">
            {applicant.matchReasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[0.86rem] leading-6 text-[#3C4043]">
                <CheckCircle2 size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-[#188038]"/>
                <span>{formatMatchReason(r)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions — hiring flow: reject | step 1 interview → step 2 accept */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6" style={divider}>
        <button
          onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
          className={`h-9 rounded-full px-4 text-[0.82rem] font-medium transition-colors ${
            status === 'rejected'
              ? 'text-[#5F6368] hover:bg-[#F1F3F4]'
              : 'text-[#D93025] hover:bg-[#FCE8E6]'
          }`}>
          {status === 'rejected' ? 'Undo reject' : 'Reject'}
        </button>

        <div className="flex items-center gap-2">
          {/* Step 1 — interview */}
          {(status === 'interview' || status === 'accepted' || status === 'completed') ? (
            <button
              onClick={() => setInviteOpen(true)}
              className="h-9 rounded-full border border-[#DADCE0] px-4 text-[0.82rem] font-medium text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]">
              Interview sent
            </button>
          ) : (
            <button
              onClick={() => setInviteOpen(true)}
              className="h-9 rounded-full bg-[#1A73E8] px-4 text-[0.82rem] font-medium text-white transition-colors hover:bg-[#1765CC]">
              Move to interview
            </button>
          )}

          {/* Step 2 — accept */}
          {(status === 'accepted' || status === 'completed') ? (
            <span className="inline-flex h-9 items-center rounded-full bg-[#E6F4EA] px-4 text-[0.82rem] font-medium text-[#188038]">
              Accepted
            </span>
          ) : (
            <button
              onClick={() => onStatusChange('accepted')}
              className={`h-9 rounded-full px-4 text-[0.82rem] font-medium transition-colors ${
                status === 'interview'
                  ? 'bg-[#188038] text-white hover:bg-[#137333]'
                  : 'border border-[#DADCE0] text-[#5F6368] hover:bg-[#F8F9FA]'
              }`}>
              Accept
            </button>
          )}

          {status === 'completed' && (
            <span className="inline-flex h-9 items-center rounded-full bg-[#E8F0FE] px-4 text-[0.82rem] font-medium text-[#1A73E8]">
              Completed
            </span>
          )}
        </div>
      </div>

      {status === 'accepted' && (
        <p className="mt-3 text-[0.78rem] text-[#9AA0A6]">
          Once the role wraps up, mark it complete from the Opportunities page — that unlocks their certificate.
        </p>
      )}

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
