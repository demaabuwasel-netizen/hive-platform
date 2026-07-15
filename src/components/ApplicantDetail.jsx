import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, CheckCircle2, UserRound, ArrowRight,
  X, Send, RotateCcw, Loader, Link2, Sparkles, MapPin,
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

// Plain uppercase section label — matches the Opportunity details box's "Role overview" / "Skills" style
function SectionLabel({ children }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
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
      <div
        className="flex min-h-[620px] flex-col items-center justify-center rounded-[36px] border bg-white p-8 text-center shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
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
  const fit = fitLabel(applicant.match ?? 0)
  const isAccepted = status === 'accepted'

  return (
    <div
      className="rounded-[36px] border p-8 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
      style={{
        background: isAccepted ? 'linear-gradient(180deg, #F4FBF7 0%, #FFFFFF 38%)' : '#FFFFFF',
        borderColor: isAccepted ? 'rgba(24,128,56,0.18)' : 'rgba(26,115,232,0.10)',
      }}>

      {/* Identity header — pill badge, big name, status + match ring */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 max-w-4xl items-start gap-4">
          <GradientAvatar name={applicant.name} size={64} radius="1.35rem" className="shrink-0 shadow-sm ring-2 ring-white"/>
          <div className="min-w-0">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.76rem] font-semibold"
              style={{
                background: isAccepted ? 'rgba(24,128,56,0.10)' : '#E8F0FE',
                color: isAccepted ? '#188038' : '#1A73E8',
              }}>
              <Sparkles size={13} />
              {isAccepted ? 'Accepted applicant' : 'Student details'}
            </div>
            <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-[#202124] sm:text-[2.4rem]">
              {applicant.name}
            </h2>
            <p className="mt-2 max-w-2xl text-[0.9rem] leading-6 text-[#5F6368]">
              {applicant.field}{applicant.uni ? ` · ${applicant.uni}` : ''}
              {applicant.opportunityTitle ? ` · ${applicant.opportunityTitle}` : ''}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-[#9AA0A6]">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} strokeWidth={2}/>
                Applied {formatDate(applicant.submittedAt) || '—'}
              </span>
              {applicant.studentLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} strokeWidth={2}/>
                  {applicant.studentLocation}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 self-start">
          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[0.78rem] font-semibold ${st.bg} ${st.color}`}>
            {st.label}
          </span>
          <div className="flex shrink-0 flex-col items-center gap-1">
            <MatchRing score={applicant.match}/>
            <span className="text-[0.76rem] font-semibold" style={{ color: fit.color }}>{fit.text}</span>
          </div>
        </div>
      </div>

      {/* Details card — tile grid + sectioned content, same shell as Opportunity details */}
      <div className="mt-7 rounded-[28px] border bg-white p-6" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <div className="grid gap-6">
          {/* About */}
          {applicant.bio && (
            <div>
              <SectionLabel>About</SectionLabel>
              <p className="mt-3 text-[0.94rem] leading-8 text-[#5F6368]">
                {applicant.bio}
              </p>
            </div>
          )}

          {/* Skills & languages — plain flowing text, same quiet register as About; a divider separates the two */}
          {(skills.length > 0 || applicant.languages?.length > 0) && (
            <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
              <SectionLabel>Skills</SectionLabel>
              <div className="mt-3 flex flex-col gap-3.5">
                {groupSkills(applicant.skills).map(({ cat, items }) => (
                  <div key={cat.cat}>
                    <p className="text-[0.85rem] font-semibold text-[#202124]">{cat.cat}</p>
                    <p className="mt-1 text-[0.94rem] leading-7 text-[#5F6368]">
                      {items.map(item => item.name).join(', ')}
                    </p>
                  </div>
                ))}
              </div>

              {applicant.languages?.length > 0 && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                  <p className="text-[0.85rem] font-semibold text-[#202124]">Languages</p>
                  <p className="mt-1 text-[0.94rem] leading-7 text-[#5F6368]">
                    {applicant.languages.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Experience & Goals — side by side */}
          {(applicant.experience || applicant.goals) && (
            <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
              <div className="grid gap-5 sm:grid-cols-2">
                {applicant.experience && (
                  <div>
                    <SectionLabel>Experience</SectionLabel>
                    <p className="mt-3 whitespace-pre-line text-[0.88rem] leading-7 text-[#5F6368]">
                      {applicant.experience}
                    </p>
                  </div>
                )}
                {applicant.goals && (
                  <div>
                    <SectionLabel>Goals</SectionLabel>
                    <p className="mt-3 whitespace-pre-line text-[0.88rem] leading-7 text-[#5F6368]">
                      {applicant.goals}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interests */}
          {applicant.interests?.length > 0 && (
            <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
              <SectionLabel>Interests</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {applicant.interests.map(interest => (
                  <span
                    key={interest}
                    className="rounded-full border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-1.5 text-[0.8rem] text-[#5F6368]"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links — email intentionally omitted; NGOs reach students through the platform, not directly */}
          {Object.values(applicant.links || {}).some(Boolean) && (
            <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
              <SectionLabel>Links</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(applicant.links || {}).map(([label, href]) =>
                  href ? (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3.5 py-1.5 text-[0.8rem] font-medium capitalize text-[#1A73E8] transition-all hover:-translate-y-0.5 hover:bg-[#D8E7FE]"
                    >
                      <Link2 size={13} strokeWidth={2} />
                      {label}
                    </a>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Application message — in the student's voice, chat-style */}
          {applicant.message && (
            <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
              <SectionLabel>Application message</SectionLabel>
              <div className="mt-3 flex items-start gap-2.5">
                <GradientAvatar name={applicant.name} size={28} radius="0.7rem" className="mt-0.5 shrink-0"/>
                <div className="flex-1 rounded-2xl rounded-tl-md bg-[#F8F9FA] px-4 py-3.5">
                  <p className="whitespace-pre-line text-[0.88rem] leading-7 text-[#3C4043]">
                    {applicant.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Why they match — green callout, the positive signal */}
          {applicant.matchReasons?.length > 0 && (
            <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
              <div className="rounded-[18px] border px-4 py-4" style={{ borderColor: 'rgba(24,128,56,0.16)', background: '#F7FCF9' }}>
                <SectionLabel>Why they match</SectionLabel>
                <div className="mt-3 flex flex-col gap-2.5">
                  {applicant.matchReasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[0.85rem] leading-6 text-[#3C4043]">
                      <CheckCircle2 size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-[#188038]"/>
                      <span>{formatMatchReason(r)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions — hiring flow: reject | step 1 interview → step 2 accept */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-6" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
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
