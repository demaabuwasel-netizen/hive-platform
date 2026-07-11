import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar, MapPin, Globe, CheckCircle2, UserRound
} from 'lucide-react'
import GradientAvatar from './GradientAvatar'
import CategorizedSkillTags from './CategorizedSkillTags'

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

export default function ApplicantDetail({ applicant, status, onStatusChange, opportunityId }) {
  const navigate = useNavigate()

  if (!applicant) {
    return (
      <div className="flex min-h-[620px] flex-col overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white">
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

  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white">

      {/* Panel title */}
      <div className="border-b border-[#E8EAED] px-6 py-4">
        <h2 className="text-[0.95rem] font-medium text-[#202124]">Student details</h2>
      </div>

      {/* Identity header */}
      <div className="flex items-start justify-between gap-6 px-6 pb-5 pt-6">
        <div className="flex min-w-0 items-start gap-4">
          <GradientAvatar name={applicant.name} size={56} radius="9999px" className="shrink-0"/>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <button onClick={() => navigate(`/student-profile/${applicant.studentId}${opportunityId ? `?backTo=applicants&opportunity=${opportunityId}` : ''}`)}
                className="text-left text-[1.25rem] font-medium tracking-[-0.01em] text-[#202124] transition-colors hover:text-[#1A73E8]">
                {applicant.name}
              </button>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium ${st.bg} ${st.color}`}>
                {st.label}
              </span>
            </div>
            <p className="mt-0.5 text-[0.85rem] text-[#5F6368]">
              {applicant.field}{applicant.uni ? ` · ${applicant.uni}` : ''}
              {applicant.opportunityTitle ? ` · ${applicant.opportunityTitle}` : ''}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8rem] text-[#5F6368]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={1.8}/>
                Applied {formatDate(applicant.submittedAt) || '—'}
              </span>
              {applicant.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} strokeWidth={1.8}/>
                  {applicant.location}
                </span>
              )}
              {applicant.languages?.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe size={13} strokeWidth={1.8}/>
                  {applicant.languages.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center">
          <MatchRing score={applicant.match}/>
          <span className="mt-1 text-[0.68rem] font-medium text-[#5F6368]">Match</span>
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

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <SectionLabel>Skills</SectionLabel>
            <CategorizedSkillTags skills={applicant.skills} />
          </div>
        )}

        {/* Application message */}
        {applicant.message && (
          <div>
            <SectionLabel>Application message</SectionLabel>
            <p className="whitespace-pre-line border-l-2 border-[#E8EAED] pl-4 text-[0.88rem] leading-7 text-[#3C4043]">
              {applicant.message}
            </p>
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

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 border-t border-[#E8EAED] px-6 py-4">
        {status === 'interview' ? (
          <>
            <button
              onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
              className="h-10 rounded-full px-5 text-[0.85rem] font-medium text-[#D93025] transition-colors hover:bg-[#FCE8E6]">
              {status === 'rejected' ? 'Undo' : 'Reject'}
            </button>
            <button
              onClick={() => onStatusChange('accepted')}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#188038] px-6 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#137333]">
              <CheckCircle2 size={15} strokeWidth={2}/> Accept
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
              className={`h-10 rounded-full px-5 text-[0.85rem] font-medium transition-colors ${
                status === 'rejected'
                  ? 'text-[#5F6368] hover:bg-[#F1F3F4]'
                  : 'text-[#D93025] hover:bg-[#FCE8E6]'
              }`}>
              {status === 'rejected' ? 'Undo' : 'Reject'}
            </button>
            <button
              onClick={() => {
                onStatusChange('interview')
                setTimeout(() => navigate(`/interview-message/${applicant.studentId}`), 200)
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1A73E8] px-6 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#1765CC]">
              <Calendar size={15} strokeWidth={2}/> Interview
            </button>
          </>
        )}
      </div>
    </div>
  )
}
