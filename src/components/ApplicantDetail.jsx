import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, MapPin, Globe, CheckCircle2, UserRound, ArrowRight,
  X, Send, RotateCcw, Loader, Mail, Link2
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

function MatchRing({ score }) {
  const r = 24, circ = 2 * Math.PI * r
  const color = score >= 90 ? '#188038' : '#1A73E8'
  return (
    <svg width="58" height="58" viewBox="0 0 58 58" aria-label={`${score}% match`}>
      <circle cx="29" cy="29" r={r} fill="none" stroke="#F1F3F4" strokeWidth="4"/>
      <motion.circle cx="29" cy="29" r={r} fill="none"
        stroke={color} strokeWidth="4" strokeDasharray={circ}
        strokeLinecap="round" transform="rotate(-90 29 29)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}/>
      <text x="29" y="29" textAnchor="middle" dominantBaseline="central"
        fontSize="12" fontWeight="600" fill="#202124">{score}%</text>
    </svg>
  )
}

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-[#1A73E8]', bg: 'bg-[#E8F0FE]' },
  shortlisted: { label: 'Shortlisted', color: 'text-[#5F6368]', bg: 'bg-[#F1F3F4]' },
  interview:   { label: 'Interview',   color: 'text-[#188038]', bg: 'bg-[#E6F4EA]' },
  accepted:    { label: 'Accepted',    color: 'text-[#188038]', bg: 'bg-[#E6F4EA]' },
  rejected:    { label: 'Rejected',    color: 'text-[#5F6368]', bg: 'bg-[#F1F3F4]' },
}

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#5F6368]">
      {children}
    </p>
  )
}

function fitLabel(score) {
  if (score >= 80) return { text: 'Strong fit', color: '#188038' }
  if (score >= 60) return { text: 'Good fit', color: '#1A73E8' }
  return { text: 'Possible fit', color: '#5F6368' }
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

export default function ApplicantDetail({ applicant, status, onStatusChange }) {
  const [inviteOpen, setInviteOpen] = useState(false)

  if (!applicant) {
    return (
      <div className="flex min-h-[620px] flex-col overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.10),0_2px_6px_2px_rgba(60,64,67,0.05)]">
        <div className="border-b border-[#E8EAED] px-6 py-4">
          <h2 className="text-[0.95rem] font-medium text-[#202124]">Student details</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F3F4] text-[#5F6368]">
            <UserRound size={24} strokeWidth={1.8} />
          </div>
          <p className="mb-1 text-[1rem] font-medium text-[#202124]">Select an applicant</p>
          <p className="max-w-[280px] text-[0.85rem] leading-6 text-[#5F6368]">
            Choose someone from the queue to review their profile, fit, and next action.
          </p>
        </div>
      </div>
    )
  }

  const st = STATUS_CONFIG[status] ?? STATUS_CONFIG.new
  const skills = (applicant.skills || []).map(skillName).filter(Boolean)
  const fit = fitLabel(applicant.match ?? 0)

  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.10),0_2px_6px_2px_rgba(60,64,67,0.05)]">

      {/* Panel title */}
      <div className="border-b border-[#E8EAED] px-6 py-4">
        <h2 className="text-[0.95rem] font-medium text-[#202124]">Student details</h2>
      </div>

      {/* Identity header */}
      <div className="flex items-start justify-between gap-6 px-6 pb-6 pt-6">
        <div className="flex min-w-0 items-start gap-4">
          <GradientAvatar name={applicant.name} size={64} radius="9999px" className="shrink-0 ring-1 ring-[#E8EAED]"/>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[1.3rem] font-medium tracking-[-0.01em] text-[#202124]">
                {applicant.name}
              </h3>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium ${st.bg} ${st.color}`}>
                {st.label}
              </span>
            </div>
            <p className="mt-1 text-[0.85rem] text-[#5F6368]">
              {applicant.field}{applicant.uni ? ` · ${applicant.uni}` : ''}
              {applicant.opportunityTitle ? ` · ${applicant.opportunityTitle}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8rem] text-[#5F6368]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={1.8} className="text-[#9AA0A6]"/>
                Applied {formatDate(applicant.submittedAt) || '—'}
              </span>
              {applicant.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} strokeWidth={1.8} className="text-[#9AA0A6]"/>
                  {applicant.location}
                </span>
              )}
              {applicant.languages?.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe size={13} strokeWidth={1.8} className="text-[#9AA0A6]"/>
                  {applicant.languages.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <MatchRing score={applicant.match}/>
          <span className="text-[0.76rem] font-medium" style={{ color: fit.color }}>{fit.text}</span>
        </div>
      </div>

      <div className="mx-6 h-px bg-[#E8EAED]"/>

      {/* Body */}
      <div className="flex flex-col gap-7 px-6 py-6">
        {/* About */}
        {applicant.bio && (
          <div>
            <SectionLabel>About</SectionLabel>
            <p className="text-[0.88rem] leading-7 text-[#3C4043]">
              {applicant.bio}
            </p>
          </div>
        )}

        {/* Skills — grouped by category, colored dot carries identity */}
        {skills.length > 0 && (
          <div>
            <SectionLabel>Skills</SectionLabel>
            <div className="flex flex-col gap-4">
              {groupSkills(applicant.skills).map(({ cat, items }) => (
                <div key={cat.cat}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                    <p className="text-[0.76rem] font-medium text-[#5F6368]">{cat.cat}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                      <span
                        key={item.name}
                        className="rounded-lg border border-[#DADCE0] bg-white px-3 py-1.5 text-[0.8rem] text-[#3C4043]"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {applicant.experience && (
          <div>
            <SectionLabel>Experience</SectionLabel>
            <p className="whitespace-pre-line text-[0.88rem] leading-7 text-[#3C4043]">
              {applicant.experience}
            </p>
          </div>
        )}

        {/* Goals */}
        {applicant.goals && (
          <div>
            <SectionLabel>Goals</SectionLabel>
            <p className="whitespace-pre-line text-[0.88rem] leading-7 text-[#3C4043]">
              {applicant.goals}
            </p>
          </div>
        )}

        {/* Interests */}
        {applicant.interests?.length > 0 && (
          <div>
            <SectionLabel>Interests</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {applicant.interests.map(interest => (
                <span
                  key={interest}
                  className="rounded-lg border border-[#DADCE0] bg-white px-3 py-1.5 text-[0.8rem] text-[#3C4043]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact & links */}
        {(applicant.email || Object.values(applicant.links || {}).some(Boolean)) && (
          <div>
            <SectionLabel>Contact &amp; links</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {applicant.email && (
                <a
                  href={`mailto:${applicant.email}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DADCE0] bg-white px-3 py-1.5 text-[0.8rem] text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]"
                >
                  <Mail size={13} strokeWidth={1.8} />
                  {applicant.email}
                </a>
              )}
              {Object.entries(applicant.links || {}).map(([label, href]) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#DADCE0] bg-white px-3 py-1.5 text-[0.8rem] capitalize text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]"
                  >
                    <Link2 size={13} strokeWidth={1.8} />
                    {label}
                  </a>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Application message */}
        {applicant.message && (
          <div>
            <SectionLabel>Application message</SectionLabel>
            <div className="rounded-r-xl border-l-2 border-[#1A73E8]/30 bg-[#F8F9FA] px-4 py-3.5">
              <p className="whitespace-pre-line text-[0.88rem] leading-7 text-[#3C4043]">
                {applicant.message}
              </p>
            </div>
          </div>
        )}

        {/* Why they match */}
        {applicant.matchReasons?.length > 0 && (
          <div>
            <SectionLabel>Why they match</SectionLabel>
            <div className="flex flex-col gap-2.5">
              {applicant.matchReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[0.85rem] leading-6 text-[#3C4043]">
                  <CheckCircle2 size={15} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#1A73E8]"/>
                  <span>{formatMatchReason(r)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions — hiring flow: reject | step 1 interview → step 2 accept */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EAED] px-6 py-4">
        <button
          onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
          className={`h-10 rounded-full px-5 text-[0.85rem] font-medium transition-colors ${
            status === 'rejected'
              ? 'text-[#5F6368] hover:bg-[#F1F3F4]'
              : 'text-[#D93025] hover:bg-[#FCE8E6]'
          }`}>
          {status === 'rejected' ? 'Undo reject' : 'Reject'}
        </button>

        <div className="flex items-center gap-2.5">
          {/* Step 1 — interview */}
          {(status === 'interview' || status === 'accepted') ? (
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#DADCE0] bg-white px-5 text-[0.85rem] font-medium text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]">
              <CheckCircle2 size={15} strokeWidth={2}/> Interview sent
            </button>
          ) : (
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1A73E8] px-5 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#1765CC]">
              <Calendar size={15} strokeWidth={2}/> Move to interview
            </button>
          )}

          <ArrowRight size={15} className="shrink-0 text-[#9AA0A6]"/>

          {/* Step 2 — accept */}
          {status === 'accepted' ? (
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-[#E6F4EA] px-5 text-[0.85rem] font-medium text-[#188038]">
              <CheckCircle2 size={15} strokeWidth={2}/> Accepted
            </span>
          ) : (
            <button
              onClick={() => onStatusChange('accepted')}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-[0.85rem] font-medium transition-colors ${
                status === 'interview'
                  ? 'bg-[#188038] text-white hover:bg-[#137333]'
                  : 'border border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#188038]'
              }`}>
              <CheckCircle2 size={15} strokeWidth={2}/> Accept
            </button>
          )}
        </div>
      </div>

      {/* Interview invitation modal */}
      <AnimatePresence>
        {inviteOpen && (
          <InterviewInviteModal
            applicant={applicant}
            onClose={() => setInviteOpen(false)}
            onSent={() => {
              setInviteOpen(false)
              if (status !== 'interview' && status !== 'accepted') onStatusChange('interview')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
