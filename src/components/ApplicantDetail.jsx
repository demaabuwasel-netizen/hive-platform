import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar, MapPin, Globe, XCircle, CheckCircle2, Sparkles
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
  const r = 22, circ = 2 * Math.PI * r
  const color = score >= 90 ? '#188038' : '#1A73E8'
  const trackColor = score >= 90 ? '#E6F4EA' : '#E8F0FE'
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-label={`${score}% match`}>
      <circle cx="26" cy="26" r={r} fill="none" stroke={trackColor} strokeWidth="4.5"/>
      <motion.circle cx="26" cy="26" r={r} fill="none"
        stroke={color} strokeWidth="4.5" strokeDasharray={circ}
        strokeLinecap="round" transform="rotate(-90 26 26)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}/>
      <text x="26" y="26" textAnchor="middle" dominantBaseline="central"
        fontSize="10" fontWeight="800" fill="#202124">{score}%</text>
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

export default function ApplicantDetail({ applicant, status, onStatusChange, opportunityId }) {
  const navigate = useNavigate()

  if (!applicant) {
    return (
      <div className="sticky top-6 flex max-h-[calc(100vh-120px)] min-h-[540px] flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
            <Sparkles size={20} />
          </div>
          <p className="mb-1 text-[0.95rem] font-semibold text-[#202124]">Select an applicant</p>
          <p className="max-w-[260px] text-[0.82rem] leading-6 text-[#5F6368]">Choose someone from the queue to review their profile, fit, and next action.</p>
        </div>
      </div>
    )
  }

  const st = STATUS_CONFIG[status] ?? STATUS_CONFIG.new

  return (
    <div className="sticky top-6 flex max-h-[calc(100vh-120px)] min-h-[540px] flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}>

      {/* Header */}
      <div className="shrink-0 border-b px-6 pb-5 pt-5"
        style={{
          background: 'linear-gradient(160deg, #F8FBFF 0%, #EEF5FF 55%, #FFFFFF 100%)',
          borderColor: 'rgba(26,115,232,0.10)',
        }}>
        <div className="flex items-start gap-4">
          <GradientAvatar name={applicant.name} size={52} radius="0.85rem"
            className="ring-[3px] ring-white shadow shrink-0"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <button onClick={() => navigate(`/student-profile/${applicant.studentId}${opportunityId ? `?backTo=applicants&opportunity=${opportunityId}` : ''}`)}
                className="text-left text-[1rem] font-semibold text-[#202124] transition-colors hover:text-[#1A73E8]">
                {applicant.name}
              </button>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold ${st.bg} ${st.color}`}>
                {st.label}
              </span>
            </div>
            <p className="mb-3 text-[0.8rem] text-[#5F6368]">
              {applicant.field}{applicant.uni ? ` · ${applicant.uni}` : ''}
              {applicant.opportunityTitle && (
                <span className="ml-1 font-semibold text-[#1A73E8]">· {applicant.opportunityTitle}</span>
              )}
            </p>
            <div className="flex items-center gap-3 rounded-[20px] border border-[#E5EEFB] bg-white/75 px-3 py-2">
              <MatchRing score={applicant.match}/>
              <div className="flex flex-col gap-1 text-[#5F6368]">
                <span className="text-[0.74rem] font-semibold">
                  Applied {formatDate(applicant.submittedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {/* Bio */}
        {applicant.bio && (
          <p className="rounded-[22px] border border-[#E5EEFB] bg-[#FBFCFE] px-4 py-4 text-[0.82rem] leading-6 text-[#5F6368]">{applicant.bio}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-[0.76rem]">
          {applicant.location && (
            <span className="flex items-center gap-1.5 text-[#5F6368]"><MapPin size={11}/>{applicant.location}</span>
          )}
          {applicant.languages?.length > 0 && (
            <span className="flex items-center gap-1.5 text-[#5F6368]">
              <Globe size={11}/>{applicant.languages.join(', ')}
            </span>
          )}
        </div>

        {/* Skills */}
        {applicant.skills?.length > 0 && (
          <div>
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Skills</p>
            <CategorizedSkillTags skills={applicant.skills} />
          </div>
        )}

        {/* Application message */}
        {applicant.message && (
          <>
            <div className="h-px bg-[#E5EEFB]"/>
            <div>
              <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Application message</p>
              <p className="line-clamp-6 whitespace-pre-line text-[0.82rem] leading-6 text-[#5F6368]">
                {applicant.message}
              </p>
            </div>
          </>
        )}

        <div className="h-px bg-[#E5EEFB]"/>

        {/* AI compatibility */}
        {applicant.matchReasons?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background:'#E8F0FE' }}>
                <Sparkles size={11} strokeWidth={2.5} className="text-[#1A73E8]"/>
              </div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">
                AI compatibility
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {applicant.matchReasons.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: 0.05 + i*0.06 }}
                  className="flex items-start gap-2.5 rounded-[16px] border border-[#E5EEFB] bg-[#FBFCFE] p-3 text-[0.76rem] leading-relaxed text-[#5F6368]">
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-[#1A73E8]"/>
                  <span>{formatMatchReason(r)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t px-6 py-4 flex flex-col gap-3"
        style={{ borderColor:'rgba(26,115,232,0.10)', background:'#FBFCFE' }}>
        {status === 'interview' ? (
          <>
            <button
              onClick={() => onStatusChange('accepted')}
              className="flex items-center justify-center gap-1.5 rounded-[16px] py-2.5 text-[0.78rem] font-semibold text-white transition-all hover:opacity-90"
              style={{ background:'#188038' }}>
              <CheckCircle2 size={13} /> Accept
            </button>
            <button
              onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
              className={`flex items-center justify-center gap-1.5 rounded-[16px] py-2.5 text-[0.78rem] font-semibold transition-colors ${
                status === 'rejected'
                  ? 'border border-[#E5EEFB] text-[#5F6368] hover:bg-white'
                  : 'border border-[#FAD2CF] text-[#C5221F] hover:bg-[#FCE8E6]'
              }`}>
              <XCircle size={12}/> {status === 'rejected' ? 'Undo' : 'Reject'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                onStatusChange('interview')
                setTimeout(() => navigate(`/interview-message/${applicant.studentId}`), 200)
              }}
              className="flex items-center justify-center gap-1.5 rounded-[16px] py-2.5 text-[0.78rem] font-semibold text-white transition-all hover:opacity-90"
              style={{ background:'#1A73E8' }}>
              <Calendar size={13}/> Interview
            </button>
            <button
              onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
              className={`flex items-center justify-center gap-1.5 rounded-[16px] py-2.5 text-[0.78rem] font-semibold transition-colors ${
                status === 'rejected'
                  ? 'border border-[#E5EEFB] text-[#5F6368] hover:bg-white'
                  : 'border border-[#FAD2CF] text-[#C5221F] hover:bg-[#FCE8E6]'
              }`}>
              <XCircle size={12}/> {status === 'rejected' ? 'Undo' : 'Reject'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
