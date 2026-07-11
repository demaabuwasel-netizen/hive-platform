import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar, MapPin, Globe, XCircle, CheckCircle2, Sparkles, UserRound, MessageSquareText
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

function MatchRing({ score }) {
  const r = 26, circ = 2 * Math.PI * r
  const color = score >= 90 ? '#188038' : '#1A73E8'
  const trackColor = score >= 90 ? '#E6F4EA' : '#E8F0FE'
  return (
    <svg width="62" height="62" viewBox="0 0 62 62" aria-label={`${score}% match`}>
      <circle cx="31" cy="31" r={r} fill="none" stroke={trackColor} strokeWidth="5"/>
      <motion.circle cx="31" cy="31" r={r} fill="none"
        stroke={color} strokeWidth="5" strokeDasharray={circ}
        strokeLinecap="round" transform="rotate(-90 31 31)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}/>
      <text x="31" y="31" textAnchor="middle" dominantBaseline="central"
        fontSize="12" fontWeight="800" fill="#202124">{score}%</text>
    </svg>
  )
}

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-[#1A73E8]', bg: 'bg-[#E8F0FE]' },
  shortlisted: { label: 'Shortlisted', color: 'text-[#3C4043]', bg: 'bg-[#F1F3F4]' },
  interview:   { label: 'Interview',   color: 'text-[#188038]', bg: 'bg-[#E6F4EA]' },
  accepted:    { label: 'Accepted',    color: 'text-[#188038]', bg: 'bg-[#E6F4EA]' },
  rejected:    { label: 'Rejected',    color: 'text-[#5F6368]', bg: 'bg-[#F1F3F4]' },
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E8F0FE] text-[#1A73E8]">
        <Icon size={12} strokeWidth={2.5} />
      </span>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">
        {children}
      </p>
    </div>
  )
}

function PanelTitle() {
  return (
    <div className="flex shrink-0 items-center justify-between border-b px-7 py-4"
      style={{ borderColor: 'rgba(26,115,232,0.10)', background: '#FBFCFE' }}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#E8F0FE] text-[#1A73E8]">
          <UserRound size={15} strokeWidth={2.3} />
        </span>
        <h2 className="text-[1rem] font-semibold tracking-[-0.02em] text-[#202124]">
          Student details
        </h2>
      </div>
      <span className="hidden text-[0.74rem] font-medium text-[#9AA0A6] sm:block">
        Profile, fit &amp; next action
      </span>
    </div>
  )
}

export default function ApplicantDetail({ applicant, status, onStatusChange, opportunityId }) {
  const navigate = useNavigate()

  if (!applicant) {
    return (
      <div className="flex min-h-[620px] flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <PanelTitle />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
          style={{ background: 'linear-gradient(165deg, #F8FBFF 0%, #FFFFFF 60%)' }}>
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E8F0FE] text-[#1A73E8] shadow-[0_10px_26px_rgba(26,115,232,0.14)]">
            <UserRound size={26} />
          </div>
          <p className="mb-1.5 text-[1.05rem] font-semibold text-[#202124]">Select an applicant</p>
          <p className="max-w-[280px] text-[0.84rem] leading-6 text-[#5F6368]">
            Choose someone from the queue to review their profile, fit, and next action.
          </p>
        </div>
      </div>
    )
  }

  const st = STATUS_CONFIG[status] ?? STATUS_CONFIG.new

  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}>

      <PanelTitle />

      {/* Header */}
      <div className="shrink-0 border-b px-7 pb-6 pt-6"
        style={{
          background: 'linear-gradient(150deg, #F5F9FF 0%, #EEF5FF 45%, #FFFFFF 100%)',
          borderColor: 'rgba(26,115,232,0.10)',
        }}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 items-start gap-4">
            <GradientAvatar name={applicant.name} size={64} radius="1.1rem"
              className="shrink-0 shadow-md ring-4 ring-white"/>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2.5">
                <button onClick={() => navigate(`/student-profile/${applicant.studentId}${opportunityId ? `?backTo=applicants&opportunity=${opportunityId}` : ''}`)}
                  className="text-left text-[1.2rem] font-semibold tracking-[-0.02em] text-[#202124] transition-colors hover:text-[#1A73E8]">
                  {applicant.name}
                </button>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold ${st.bg} ${st.color}`}>
                  {st.label}
                </span>
              </div>
              <p className="mb-3 text-[0.86rem] text-[#5F6368]">
                {applicant.field}{applicant.uni ? ` · ${applicant.uni}` : ''}
                {applicant.opportunityTitle && (
                  <span className="ml-1 font-semibold text-[#1A73E8]">· {applicant.opportunityTitle}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EEFB] bg-white/85 px-3 py-1.5 text-[0.74rem] font-semibold text-[#5F6368]">
                  <Calendar size={12} className="text-[#1A73E8]"/>
                  Applied {formatDate(applicant.submittedAt) || '—'}
                </span>
                {applicant.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EEFB] bg-white/85 px-3 py-1.5 text-[0.74rem] font-semibold text-[#5F6368]">
                    <MapPin size={12} className="text-[#1A73E8]"/>
                    {applicant.location}
                  </span>
                )}
                {applicant.languages?.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EEFB] bg-white/85 px-3 py-1.5 text-[0.74rem] font-semibold text-[#5F6368]">
                    <Globe size={12} className="text-[#1A73E8]"/>
                    {applicant.languages.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1 rounded-[22px] border border-[#E5EEFB] bg-white/85 px-4 py-3 shadow-[0_8px_20px_rgba(26,115,232,0.06)]">
            <MatchRing score={applicant.match}/>
            <span className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">Match</span>
          </div>
        </div>
      </div>

      {/* Body — shown in full, no internal scrolling */}
      <div className="flex flex-col gap-6 px-7 py-6">
        {/* About */}
        {applicant.bio && (
          <div>
            <SectionLabel icon={UserRound}>About</SectionLabel>
            <p className="rounded-[20px] border border-[#E5EEFB] bg-[#FBFCFE] px-4 py-4 text-[0.84rem] leading-6 text-[#5F6368]">
              {applicant.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {applicant.skills?.length > 0 && (
          <div>
            <SectionLabel icon={Sparkles}>Skills</SectionLabel>
            <CategorizedSkillTags skills={applicant.skills} />
          </div>
        )}

        {/* Application message */}
        {applicant.message && (
          <div>
            <SectionLabel icon={MessageSquareText}>Application message</SectionLabel>
            <p className="whitespace-pre-line rounded-[20px] border border-[#E5EEFB] bg-white px-4 py-4 text-[0.84rem] leading-6 text-[#5F6368] shadow-[0_1px_0_rgba(17,24,39,0.02)]">
              {applicant.message}
            </p>
          </div>
        )}

        {/* AI compatibility */}
        {applicant.matchReasons?.length > 0 && (
          <div>
            <SectionLabel icon={Sparkles}>Why they match</SectionLabel>
            <div className="flex flex-col gap-2">
              {applicant.matchReasons.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: 0.05 + i*0.06 }}
                  className="flex items-start gap-2.5 rounded-[16px] border border-[#E5EEFB] bg-[#FBFCFE] p-3.5 text-[0.78rem] leading-relaxed text-[#5F6368]">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#1A73E8]"/>
                  <span>{formatMatchReason(r)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t px-7 py-4 flex flex-row gap-3"
        style={{ borderColor:'rgba(26,115,232,0.10)', background:'#FBFCFE' }}>
        {status === 'interview' ? (
          <>
            <button
              onClick={() => onStatusChange('accepted')}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[0.8rem] font-semibold text-white shadow-[0_8px_20px_rgba(24,128,56,0.18)] transition-all hover:-translate-y-0.5 hover:opacity-95"
              style={{ background:'#188038' }}>
              <CheckCircle2 size={13} /> Accept
            </button>
            <button
              onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[0.8rem] font-semibold transition-colors ${
                status === 'rejected'
                  ? 'border border-[#E5EEFB] bg-white text-[#5F6368] hover:bg-[#F8FAFD]'
                  : 'border border-[#FAD2CF] bg-white text-[#C5221F] hover:bg-[#FCE8E6]'
              }`}>
              <XCircle size={13}/> {status === 'rejected' ? 'Undo' : 'Reject'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                onStatusChange('interview')
                setTimeout(() => navigate(`/interview-message/${applicant.studentId}`), 200)
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[0.8rem] font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.2)] transition-all hover:-translate-y-0.5 hover:opacity-95"
              style={{ background:'#1A73E8' }}>
              <Calendar size={13}/> Interview
            </button>
            <button
              onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[0.8rem] font-semibold transition-colors ${
                status === 'rejected'
                  ? 'border border-[#E5EEFB] bg-white text-[#5F6368] hover:bg-[#F8FAFD]'
                  : 'border border-[#FAD2CF] bg-white text-[#C5221F] hover:bg-[#FCE8E6]'
              }`}>
              <XCircle size={13}/> {status === 'rejected' ? 'Undo' : 'Reject'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
