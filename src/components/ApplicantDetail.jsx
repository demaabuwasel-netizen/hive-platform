import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin, Globe, Clock, XCircle, CheckCircle2, Sparkles
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
      return `Matched: ${obj.name}${obj.level ? ` (${obj.level})` : ''}`
    } catch {
      // If JSON parse fails, just remove the JSON and return the text part
      return reason.replace(/\s*\{[^}]+\}/, '').trim()
    }
  }

  return reason
}

function MatchRing({ score }) {
  const r = 22, circ = 2 * Math.PI * r
  const color = score >= 90 ? '#10B981' : score >= 80 ? '#FFB703' : '#6366F1'
  const trackColor = score >= 90 ? '#D1FAE5' : score >= 80 ? '#FEF3C7' : '#EEF2FF'
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
        fontSize="10" fontWeight="800" fill="#0D183D">{score}%</text>
    </svg>
  )
}

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-indigo-600',  bg: 'bg-indigo-50'   },
  shortlisted: { label: 'Shortlisted', color: 'text-[#D99E00]',   bg: 'bg-amber-50'    },
  interview:   { label: 'Interview',   color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  accepted:    { label: 'Accepted',    color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  rejected:    { label: 'Rejected',    color: 'text-red-500',     bg: 'bg-red-50'      },
}

export default function ApplicantDetail({ applicant, status, onStatusChange }) {
  const navigate = useNavigate()

  if (!applicant) {
    return (
      <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] flex flex-col sticky top-6 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 120px)', width: '380px' }}>
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
          <p className="text-[14px] font-semibold text-[#0D183D] mb-1">Select a role to see applicants</p>
          <p className="text-[12px] text-[#4B6382]">Click on a role in the left panel and then select an applicant.</p>
        </div>
      </div>
    )
  }

  const st = STATUS_CONFIG[status] ?? STATUS_CONFIG.new

  return (
    <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] flex flex-col sticky top-6 overflow-hidden"
      style={{ maxHeight: 'calc(100vh - 120px)', width: '380px' }}>

      {/* Header */}
      <div className="px-6 pt-5 pb-4 shrink-0 border-b border-[rgba(13,24,61,0.08)]"
        style={{ background: 'linear-gradient(160deg, #FFF7E6 0%, #F0EEFF 100%)' }}>
        <div className="flex items-start gap-4">
          <GradientAvatar name={applicant.name} size={52} radius="0.85rem"
            className="ring-[3px] ring-white shadow shrink-0"/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <button onClick={() => navigate(`/student-profile/${applicant.studentId}`)}
                className="text-[15px] font-bold text-[#FFB703] hover:text-[#D99E00] transition-colors text-left">
                {applicant.name}
              </button>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.color}`}>
                {st.label}
              </span>
            </div>
            <p className="text-[12px] text-[#4B6382] mb-2">
              {applicant.field}{applicant.uni ? ` · ${applicant.uni}` : ''}
              {applicant.opportunityTitle && (
                <span className="ml-1 text-[#FFB703] font-semibold">· {applicant.opportunityTitle}</span>
              )}
            </p>
            <div className="flex items-center gap-3">
              <MatchRing score={applicant.match}/>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-[#4B6382]">
                  Applied {formatDate(applicant.submittedAt)}
                </span>
                {applicant.availability && (
                  <span className="text-[11px] text-[#4B6382] flex items-center gap-1">
                    <Clock size={10}/> {applicant.availability}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {/* Bio */}
        {applicant.bio && (
          <p className="text-[12px] text-[#4B6382] leading-relaxed">{applicant.bio}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-[11px]">
          {applicant.location && (
            <span className="flex items-center gap-1.5 text-[#4B6382]"><MapPin size={11}/>{applicant.location}</span>
          )}
          {applicant.languages?.length > 0 && (
            <span className="flex items-center gap-1.5 text-[#4B6382]">
              <Globe size={11}/>{applicant.languages.join(', ')}
            </span>
          )}
        </div>

        {/* Skills */}
        {applicant.skills?.length > 0 && (
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">Skills</p>
            <CategorizedSkillTags skills={applicant.skills} showLevel />
          </div>
        )}

        {/* Application message */}
        {applicant.message && (
          <>
            <div className="h-px" style={{ background:'rgba(13,24,61,0.07)' }}/>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">Application message</p>
              <p className="text-[12px] text-[#4B6382] leading-relaxed whitespace-pre-line line-clamp-6">
                {applicant.message}
              </p>
            </div>
          </>
        )}

        <div className="h-px" style={{ background:'rgba(13,24,61,0.07)' }}/>

        {/* AI compatibility */}
        {applicant.matchReasons?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background:'#FFB703' }}>
                <Sparkles size={11} strokeWidth={2.5} className="text-white"/>
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0D183D]">
                AI compatibility
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {applicant.matchReasons.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: 0.05 + i*0.06 }}
                  className="flex items-start gap-2.5 rounded-lg p-3 text-[11px] text-[#4B6382] leading-relaxed"
                  style={{ background:'rgba(255,183,3,0.05)', border:'1px solid rgba(255,183,3,0.14)' }}>
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color:'#FFB703' }}/>
                  <span>{formatMatchReason(r)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 px-6 py-4 border-t flex flex-col gap-3"
        style={{ borderColor:'rgba(13,24,61,0.08)', background:'#FAFAFA' }}>
        {status === 'interview' ? (
          <>
            <button
              onClick={() => onStatusChange('accepted')}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background:'#10B981' }}>
              ✓ Accept
            </button>
            <button
              onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-colors ${
                status === 'rejected'
                  ? 'text-[#4B6382] border border-[rgba(13,24,61,0.1)] hover:bg-[rgba(13,24,61,0.03)]'
                  : 'text-red-500 border border-red-100 hover:bg-red-50'
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
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background:'#0D183D' }}>
              📅 Interview
            </button>
            <button
              onClick={() => onStatusChange(status === 'rejected' ? 'new' : 'rejected')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-colors ${
                status === 'rejected'
                  ? 'text-[#4B6382] border border-[rgba(13,24,61,0.1)] hover:bg-[rgba(13,24,61,0.03)]'
                  : 'text-red-500 border border-red-100 hover:bg-red-50'
              }`}>
              <XCircle size={12}/> {status === 'rejected' ? 'Undo' : 'Reject'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
