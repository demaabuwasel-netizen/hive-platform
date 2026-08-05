import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  submitApplication,
  fetchAcceptedApplicantForOpportunity,
  updateApplicationStatus,
  completeAcceptedApplicationsForOpportunity,
} from '../services/applications'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Users, Search,
  MapPin, Bookmark as BookmarkIcon, Plus, Send, Sparkles, RefreshCw,
  X, CheckCircle2, Clock, ChevronRight, ArrowRight, Globe, Trash2, PencilLine,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchActiveOpportunities, fetchNgoOpportunities, deleteOpportunity } from '../services/opportunities'
import { fetchSavedIds, saveOpportunity, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'
import { withTimeout } from '../utils/withTimeout'
import ngoOpportunityImg from '../assets/ngo opportunities2.PNG'

const CATEGORIES = ['All','Technology','Education','Environment','Healthcare','Youth Services','Accessibility']

function OpportunityCardSkeleton({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="min-h-[330px] animate-pulse rounded-[32px] border border-[#D7E6FF] bg-white p-6 shadow-[0_14px_38px_rgba(17,24,39,0.035)]"
    >
      <div className="flex items-start gap-4">
        <div className="h-[58px] w-[58px] shrink-0 rounded-2xl bg-[#E8F0FE]" />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex gap-2">
            <div className="h-7 w-24 rounded-full bg-[#E8F0FE]" />
            <div className="h-7 w-20 rounded-full bg-[#F1F4F9]" />
          </div>
          <div className="h-5 w-11/12 rounded-full bg-[#EEF4FF]" />
          <div className="mt-2 h-4 w-2/5 rounded-full bg-[#F1F4F9]" />
        </div>
        <div className="h-10 w-10 shrink-0 rounded-full border border-[#E5EEFB] bg-[#FBFCFE]" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <div className="h-8 w-28 rounded-full bg-[#F1F4F9]" />
        <div className="h-8 w-24 rounded-full bg-[#F1F4F9]" />
        <div className="h-8 w-32 rounded-full bg-[#F1F4F9]" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-3.5 w-full rounded-full bg-[#F1F4F9]" />
        <div className="h-3.5 w-11/12 rounded-full bg-[#F1F4F9]" />
        <div className="h-3.5 w-2/3 rounded-full bg-[#F1F4F9]" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <div className="h-7 w-20 rounded-full bg-[#E8F0FE]" />
        <div className="h-7 w-24 rounded-full bg-[#E8F0FE]" />
        <div className="h-7 w-16 rounded-full bg-[#E8F0FE]" />
      </div>

      <div className="mt-6 h-px bg-[#E5EEFB]" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-28 rounded-full bg-[#F1F4F9]" />
        <div className="h-9 w-28 rounded-full bg-[#E8F0FE]" />
      </div>
    </motion.div>
  )
}

function generateAppMessage(user, ngo) {
  const name = user?.name || 'I'
  const first = name.split(' ')[0]
  const profile = user
  const field = profile?.field || 'my field'
  const skills = Array.isArray(profile?.skills)
    ? profile.skills.slice(0,2).join(' and ')
    : 'relevant skills'
  return `Hi ${ngo.name} team,\n\nMy name is ${first} and I'm studying ${field}. I came across your opportunity through Hive and I'd love to contribute to your mission.\n\n${ngo.mission}\n\nMy background in ${skills} means I can contribute meaningfully from day one. I'm drawn to the chance to create real impact — not just build a portfolio, but genuinely help people.\n\nI'm available flexibly and excited about the possibility of working together.\n\nLooking forward to hearing from you,\n${first}`
}

// ─── Opportunity Detail Modal ────────────────────────────────────────────────

function OpportunityDetailModal({ opp, onClose, onApply }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(15,23,42,0.42)', backdropFilter:'blur(14px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity:0, scale:0.95, y:30 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95 }} transition={{ type:'spring', stiffness:360, damping:30 }}
        className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-[#DDE3EC] bg-white"
        style={{ boxShadow:'0 24px 80px rgba(15,23,42,0.22)', maxHeight:'92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header Section */}
        <div className="sticky top-0 z-10 border-b border-[#E6EAF0] bg-white px-5 py-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
              <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#1A73E8]">
                Student opportunity
              </p>
              <h1 className="max-w-3xl text-[clamp(1.35rem,2.4vw,1.95rem)] font-semibold leading-tight tracking-[-0.04em] text-[#202124]">{opp.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.78rem] text-[#5F6368]">
                <span className="inline-flex items-center gap-2">
                  <GradientAvatar name={opp.orgName || opp.name} size={28} radius="0.55rem" />
                  <span className="font-semibold text-[#202124]">{opp.orgName || opp.name}</span>
                </span>
                {opp.category && (
                  <>
                    <span className="hidden h-1 w-1 rounded-full bg-[#C9D2E1] sm:inline-block" />
                    <span>{opp.category}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Link to={`/ngo-profile/${opp.ngoId}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D7E6FF] bg-white px-3.5 py-2 text-[0.72rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF] whitespace-nowrap">
                View NGO Profile
                <ArrowRight size={13} />
              </Link>
              <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6EAF0] bg-white text-[#5F6368] transition-colors hover:bg-[#F8FAFC]">
                <X size={17}/>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#F1F3F6] pt-3 text-[0.72rem] font-medium text-[#5F6368]">
            {opp.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-[#9AA0A6]" />
                {opp.location}
              </span>
            )}
            {opp.workMode && (
              <span className="inline-flex items-center gap-1.5">
                <Globe size={13} className="text-[#9AA0A6]" />
                {opp.workMode}
              </span>
            )}
            {opp.weeklyHours && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} className="text-[#9AA0A6]" />
                {opp.weeklyHours}
              </span>
            )}
            {opp.duration && (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase size={13} className="text-[#9AA0A6]" />
                {opp.duration}
              </span>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-[#FAFBFD]">
          <div className="mx-auto max-w-4xl space-y-5 px-6 py-8 sm:px-8">

            {/* ━━━━━━━━━━━━━━━━━━ ABOUT THIS ROLE ━━━━━━━━━━━━━━━━━━ */}
            {(opp.description || opp.missionImpact) && (
              <div className="relative overflow-hidden rounded-[20px] border border-[#E1E7F0] bg-white p-7 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <span className="absolute inset-y-7 left-0 w-1 rounded-r-full bg-[#1A73E8]" />
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Role overview</p>
                <h2 className="mb-4 text-[1.15rem] font-semibold text-[#202124]">About this role</h2>
                <p className="whitespace-pre-wrap text-[0.92rem] leading-7 text-[#5F6368]">
                  {opp.description || opp.missionImpact}
                </p>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━ MISSION & IMPACT ━━━━━━━━━━━━━━━━━━ */}
            {opp.missionImpact && opp.description && (
              <div className="relative overflow-hidden rounded-[20px] border border-[#D7E6FF] bg-[#F8FBFF] p-7 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <p className="relative mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Impact</p>
                <h2 className="relative mb-4 text-[1.15rem] font-semibold text-[#202124]">Why this matters</h2>
                <p className="whitespace-pre-wrap text-[0.92rem] leading-7 text-[#5F6368]">{opp.missionImpact}</p>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━ QUICK INFO CARDS ━━━━━━━━━━━━━━━━━━ */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {opp.location && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-white p-4">
                  <MapPin size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Location</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.location}</p>
                </div>
              )}
              {opp.workMode && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-white p-4">
                  <Globe size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Work Mode</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.workMode}</p>
                </div>
              )}
              {opp.weeklyHours && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-white p-4">
                  <Clock size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Hours/Week</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.weeklyHours}</p>
                </div>
              )}
              {opp.duration && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-white p-4">
                  <Briefcase size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Duration</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.duration}</p>
                </div>
              )}
              {opp.deadline && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-white p-4">
                  <Clock size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Deadline</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">
                    {new Date(opp.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              {(opp.category || opp.field) && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-white p-4">
                  <Briefcase size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Category</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.category || opp.field || 'Not specified'}</p>
                </div>
              )}
            </div>

            {/* ━━━━━━━━━━━━━━━━━━ REQUIRED SKILLS ━━━━━━━━━━━━━━━━━━ */}
            {opp.skills && opp.skills.length > 0 && (
              <div className="rounded-[20px] border border-[#E1E7F0] bg-white p-7 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">What helps here</p>
                <h2 className="mb-5 text-[1.15rem] font-semibold text-[#202124]">Required skills</h2>
                <div className="flex flex-wrap gap-3">
                  {opp.skills.map((s, i) => {
                    let skillName = '', skillLevel = ''

                    if (typeof s === 'string') {
                      if (s.includes('{')) {
                        try {
                          const parsed = JSON.parse(s)
                          skillName = parsed.name || s
                          skillLevel = parsed.level || ''
                        } catch {
                          skillName = s
                        }
                      } else {
                        skillName = s
                      }
                    } else if (s && typeof s === 'object') {
                      skillName = s.name || ''
                      skillLevel = s.level || ''
                    }

                    if (!skillName) return null
                    return (
                      <span key={i} className="rounded-full border border-[#D7E6FF] bg-[#F8FBFF] px-4 py-2 text-[0.78rem] font-semibold text-[#1A73E8]">
                        {skillLevel ? `${skillName} · ${skillLevel}` : skillName}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━ LANGUAGES ━━━━━━━━━━━━━━━━━━ */}
            {opp.languages && opp.languages.length > 0 && (
              <div className="rounded-[20px] border border-[#E1E7F0] bg-white p-7 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Communication</p>
                <h2 className="mb-5 text-[1.15rem] font-semibold text-[#202124]">Required languages</h2>
                <div className="flex flex-wrap gap-3">
                  {opp.languages.map((lang, i) => (
                    <span key={i} className="rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-4 py-2 text-[0.78rem] font-semibold text-[#3C4043]">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>
        </div>

        {/* Footer - Sticky with gradient */}
        <div className="sticky bottom-0 flex gap-3 border-t border-[#E8EBF0] bg-white px-8 py-5 shadow-[0_-10px_28px_rgba(15,23,42,0.05)]">
          <button onClick={onClose}
            className="flex-1 rounded-full border border-[#E6EAF0] px-6 py-3.5 text-[0.86rem] font-semibold text-[#5F6368] transition-colors hover:bg-[#F8FAFC]">
            Cancel
          </button>
          <button onClick={onApply}
            className="flex-1 rounded-full bg-[#1A73E8] px-6 py-3.5 text-[0.86rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-opacity hover:opacity-95 active:scale-95">
            Apply now
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────

function ApplyModal({ ngo, user, studentId, onClose }) {
  const [step, setStep]     = useState('form')
  const [message, setMsg]   = useState('')
  const [gen, setGen]       = useState(false)
  const [focusKey, setFocus] = useState(null)

  function regen() {
    setGen(true)
    setTimeout(() => { setMsg(generateAppMessage(user, ngo)); setGen(false) }, 600)
  }

  async function submit() {
    try {
      await submitApplication({
        studentId:     studentId,
        opportunityId: ngo.id,
        ngoId:         ngo.ngoId ?? String(ngo.id),
        message,
        availability:  null,
        links:         {},
      })
    } catch (err) {
      console.error('Apply error:', err)
    }
    setStep('success')
  }

  const iStyle = k => ({ background:'white', color:'#202124', border:`1.5px solid ${focusKey===k?'#1A73E8':'#E6EAF0'}` })

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(10,18,48,0.5)', backdropFilter:'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity:0, scale:0.97, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.97 }} transition={{ type:'spring', stiffness:360, damping:30 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow:'0 24px 80px rgba(10,18,48,0.25)', maxHeight:'90vh' }}
        onClick={e => e.stopPropagation()}>

        {step === 'success' ? (
          <div className="flex flex-col items-center text-center px-8 py-10">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:'spring', stiffness:280, damping:18, delay:0.1 }}
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
              style={{ background:'rgba(16,185,129,0.1)' }}>
              <CheckCircle2 size={32} className="text-emerald-500"/>
            </motion.div>
            <h2 className="text-[1.3rem] font-extrabold text-[#0D183D] mb-2">Application sent!</h2>
            <p className="text-[13px] text-[#4B6382] mb-2">Your application to <strong>{ngo.name}</strong> is on its way.</p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background:'#E8F0FE', border:'1px solid #D7E6FF' }}>
              <span className="w-2 h-2 rounded-full bg-[#1A73E8] shrink-0"/>
              <span className="text-[12px] font-semibold text-[#1A73E8]">Status: Under Review</span>
            </div>
            <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[13px] font-semibold text-white hover:opacity-90"
              style={{ background:'#0D183D' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-5 pb-4 shrink-0"
              style={{ background:'#FFFFFF', borderBottom:'1px solid #E8EBF0' }}>
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-black/[0.06]">
                <X size={14}/>
              </button>
              <div className="flex items-center gap-3">
                <GradientAvatar name={ngo.name} size={44} radius="0.75rem"/>
                <div>
                  <p className="text-[15px] font-extrabold text-[#0D183D]">Apply to {ngo.name}</p>
                  <p className="text-[12px] text-[#4B6382]">{ngo.cat} · {ngo.loc} · {ngo.match}% match</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] font-extrabold text-[#0D183D]">Your message</p>
                  <button onClick={regen} className={`flex items-center gap-1 text-[11px] font-semibold ${gen?'opacity-50':''}`} style={{ color:'#1A73E8' }}>
                    {gen ? (
                      <RefreshCw size={11} className="animate-spin"/>
                    ) : (
                      <Sparkles size={11}/>
                    )}
                    {message.trim() ? 'Regenerate with AI' : 'Write with AI'}
                  </button>
                </div>
                <textarea value={message} onChange={e => setMsg(e.target.value)} rows={7}
                  onFocus={()=>setFocus('msg')} onBlur={()=>setFocus(null)}
                  placeholder="Write a short note to the NGO, or press “Write with AI” to generate one."
                  className="w-full px-4 py-3 rounded-xl text-[12px] outline-none resize-none placeholder-[#4B6382]/50"
                  style={{ ...iStyle('msg'), lineHeight:1.65 }}/>
                {message.trim() && (
                  <p className="text-[10px] text-[#4B6382] mt-1">✏️ Edit freely before sending.</p>
                )}
              </div>
            </div>

            <div className="shrink-0 px-6 py-4 border-t flex gap-3"
              style={{ borderColor:'rgba(13,24,61,0.08)', background:'#FAFAFA' }}>
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-[13px] font-semibold border text-[#4B6382] hover:bg-[rgba(13,24,61,0.03)] transition-colors" style={{ borderColor:'rgba(13,24,61,0.12)' }}>Cancel</button>
              <button onClick={submit} className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background:'#1A73E8', boxShadow:'0 8px 20px rgba(26,115,232,0.22)', flex:2 }}>
                <Send size={13}/> Submit application →
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function skillName(s) { return typeof s === 'string' ? s : (s?.name ?? '') }

function normalizeNgoOpportunity(opp = {}) {
  return {
    ...opp,
    title: opp.title || 'Opportunity',
    status: opp.status || 'draft',
    category: opp.category || opp.field || '',
    location: opp.location || '',
    workMode: opp.workMode || opp.work_mode || '',
    weeklyHours: opp.weeklyHours || opp.weekly_hours || '',
    description: opp.description || opp.missionImpact || '',
    missionImpact: opp.missionImpact || opp.description || '',
    applicantCount: opp.applicantCount ?? 0,
    deadline: opp.deadline || '',
  }
}

function statusMeta(status) {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return { label: 'Open', bg: 'rgba(52,168,83,0.12)', text: '#1E8E3E' }
    case 'paused':
      return { label: 'Filled', bg: 'rgba(24,128,56,0.10)', text: '#188038' }
    case 'draft':
    default:
      return { label: 'Draft', bg: 'rgba(95,99,104,0.10)', text: '#5F6368' }
  }
}

function isOpenOpportunity(opp) {
  return (opp?.status || 'active').toLowerCase() === 'active'
}

export default function Opportunities() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filterNgoId = searchParams.get('ngo')
  const opportunityParam = searchParams.get('opportunity')
  const isNGO = user?.role === 'ngo'

  const [q, setQ]           = useState('')
  const [cat, setCat]       = useState('All')
  const [sortBy, setSortBy] = useState('match')
  const [opps, setOpps]     = useState([])
  const [ngoOpps, setNgoOpps]   = useState([])
  const [selectedOppId, setSelectedOppId] = useState(null)
  const [, setNgoError] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [toggling, setToggling] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [viewingOpp, setViewingOpp] = useState(null)
  const [applyingTo, setApplyingTo] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [acceptedApplicant, setAcceptedApplicant] = useState(null)
  const [acceptedApplicantLoading, setAcceptedApplicantLoading] = useState(false)
  const [completingRole, setCompletingRole] = useState(false)

  const selectedOpp = isNGO && ngoOpps.length > 0
    ? normalizeNgoOpportunity(ngoOpps.find(o => String(o.id) === String(selectedOppId)) || ngoOpps[0])
    : null
  const selectedOppFilled = (selectedOpp?.status || '').toLowerCase() === 'paused'
  const selectedOppStatus = selectedOpp ? statusMeta(selectedOpp.status) : null

  // Once a role is filled, find out who was accepted so "Complete role" knows
  // which application to mark complete. (Rendering already guards on
  // selectedOppFilled, so a stale value here just never gets shown.)
  useEffect(() => {
    if (!isNGO || !selectedOpp?.id || !selectedOppFilled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAcceptedApplicant(null)
      setAcceptedApplicantLoading(false)
      return
    }
    let cancelled = false
    setAcceptedApplicantLoading(true)
    setAcceptedApplicant(null)
    fetchAcceptedApplicantForOpportunity(selectedOpp.id)
      .then(applicant => { if (!cancelled) setAcceptedApplicant(applicant) })
      .catch(() => { if (!cancelled) setAcceptedApplicant(null) })
      .finally(() => { if (!cancelled) setAcceptedApplicantLoading(false) })
    return () => { cancelled = true }
  }, [isNGO, selectedOpp?.id, selectedOppFilled])

  async function handleCompleteRole() {
    if (!selectedOpp?.id || !user?.id || !acceptedApplicant?.id || completingRole) return
    const previousApplicant = acceptedApplicant
    setCompletingRole(true)
    setAcceptedApplicant(prev => (prev ? { ...prev, status: 'completed' } : prev))
    try {
      const completedRows = await completeAcceptedApplicationsForOpportunity(selectedOpp.id, user.id)
      if (completedRows.length === 0 && previousApplicant.status !== 'completed') {
        await updateApplicationStatus(previousApplicant.id, 'completed')
      }
      const refreshedApplicant = await fetchAcceptedApplicantForOpportunity(selectedOpp.id)
      setAcceptedApplicant(refreshedApplicant ?? { ...previousApplicant, status: 'completed' })
    } catch (err) {
      setAcceptedApplicant(previousApplicant)
      console.error('Error completing role:', err)
      setNgoError('Failed to complete role: ' + err.message)
    } finally {
      setCompletingRole(false)
    }
  }
  const handleDeleteOpportunity = async (oppId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity? Students will no longer see this role in their applications.')) {
      return
    }

    setDeleting(oppId)
    try {
      await deleteOpportunity(oppId, user.id)
      setNgoOpps(prev => prev.filter(o => o.id !== oppId))
      if (selectedOppId === oppId) {
        setSelectedOppId(null)
      }
      // Update cache
      const remaining = ngoOpps.filter(o => o.id !== oppId)
      try {
        localStorage.setItem(`hive_ngo_opps_${user.id}`, JSON.stringify(remaining))
      } catch {
        console.warn('Failed to update cache')
      }
    } catch (err) {
      console.error('Error deleting opportunity:', err)
      setNgoError('Failed to delete opportunity: ' + err.message)
    } finally {
      setDeleting(null)
    }
  }

  // Fetch NGO's own opportunities
  useEffect(() => {
    if (!isNGO || !user?.id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setNgoError(null)

    // Try to load from cache first
    const cached = localStorage.getItem(`hive_ngo_opps_${user.id}`)
    if (cached) {
      try {
        setNgoOpps(JSON.parse(cached))
      } catch {
        console.warn('Failed to parse cached NGO opportunities')
      }
    }

    // Fetch fresh data
    withTimeout(fetchNgoOpportunities(user.id), 10000, 'fetchNgoOpportunities')
      .then(data => {
        setNgoOpps(data ?? [])
        // Cache it
        try {
          localStorage.setItem(`hive_ngo_opps_${user.id}`, JSON.stringify(data ?? []))
        } catch {
          console.warn('Failed to cache NGO opportunities')
        }
      })
      .catch(err => {
        console.error('[Opportunities] fetchNgoOpportunities error:', err.message)
        // If we have cache, don't show error - just use cache silently
        if (!cached) {
          setNgoError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [isNGO, user?.id])

  // Select first NGO opportunity by default
  useEffect(() => {
    if (!isNGO || ngoOpps.length === 0) return

    if (opportunityParam) {
      const matched = ngoOpps.find(opp => String(opp.id) === String(opportunityParam))
      if (matched && selectedOppId !== matched.id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedOppId(matched.id)
        return
      }
    }

    if (!selectedOppId) {
      setSelectedOppId(ngoOpps[0].id)
    }
  }, [ngoOpps, isNGO, selectedOppId, opportunityParam])

  // Fetch active opportunities for students
  useEffect(() => {
    if (isNGO) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    // Try to load from cache first
    const cached = localStorage.getItem('hive_active_opps')
    if (cached) {
      try {
        const cachedData = JSON.parse(cached)
        const cards = cachedData.filter(isOpenOpportunity).map(opp => ({
          id:            opp.id,
          ngoId:         opp.ngoId,
          opportunityId: opp.id,
          name:          opp.orgName,
          cat:           opp.category  ?? '',
          loc:           opp.location  ?? '',
          hours:         opp.weeklyHours ? `${opp.weeklyHours} hrs/wk` : 'Flexible',
          workMode:      opp.workMode ?? '',
          desc:          opp.description || opp.missionImpact || '',
          skills:        (opp.skills ?? []).slice(0, 4).map(skillName).filter(Boolean),
          match:         profile ? computeMatch(profile, opp).score : null,
          mission:       opp.missionImpact || opp.description || '',
        }))
        setOpps(cards)
      } catch {
        console.warn('Failed to parse cached active opportunities')
      }
    }

    Promise.all([
      withTimeout(fetchActiveOpportunities(), 10000, 'fetchActiveOpportunities'),
      user?.id ? withTimeout(fetchSavedIds(user.id), 10000, 'fetchSavedIds') : Promise.resolve(new Set()),
    ]).then(([raw, ids]) => {
      console.log('[Opportunities] fetchActiveOpportunities returned:', raw.length, 'opportunities')
      const activeRaw = raw.filter(isOpenOpportunity)
      const cards = activeRaw.map(opp => ({
        // ── All original fields for modal ──
        ...opp,
        // ── Computed fields for card display ──
        match: profile ? computeMatch(profile, opp).score : null,
      }))
      setOpps(cards)
      setSavedIds(ids)
      // Cache fresh data
      try {
        localStorage.setItem('hive_active_opps', JSON.stringify(activeRaw))
      } catch {
        console.warn('Failed to cache active opportunities')
      }
    }).catch((err) => { console.error('[Opportunities] Fetch error:', err) }).finally(() => setLoading(false))
  }, [isNGO, user?.id, profile])

  async function toggleSave(opp) {
    if (!user?.id || toggling) return
    setToggling(opp.id)
    const isSaved = savedIds.has(opp.id)
    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev)
      isSaved ? next.delete(opp.id) : next.add(opp.id)
      return next
    })
    try {
      if (isSaved) await unsaveOpportunity(user.id, opp.id)
      else         await saveOpportunity(user.id, opp.id)
    } catch {
      // Revert on error
      setSavedIds(prev => {
        const next = new Set(prev)
        isSaved ? next.add(opp.id) : next.delete(opp.id)
        return next
      })
    } finally {
      setToggling(null)
    }
  }

  useEffect(() => {
    if (isNGO || loading || !opportunityParam || opps.length === 0) return

    const matched = opps.find(opp => String(opp.id) === String(opportunityParam))
    if (matched && String(viewingOpp?.id) !== String(matched.id)) {
      queueMicrotask(() => setViewingOpp(matched))
    }
  }, [isNGO, loading, opportunityParam, opps, viewingOpp?.id])

  const filtered = opps.filter(n => {
    const category = n.category || n.cat || ''
    const query = q.trim().toLowerCase()
    return (
      (cat === 'All' || category === cat) &&
      (!query ||
        n.title?.toLowerCase().includes(query) ||
        n.orgName?.toLowerCase().includes(query) ||
        n.name?.toLowerCase().includes(query) ||
        n.description?.toLowerCase().includes(query) ||
        n.missionImpact?.toLowerCase().includes(query) ||
        (n.skills || []).some(skill => skillName(skill).toLowerCase().includes(query))) &&
      (!filterNgoId || n.ngoId === filterNgoId)
    )
  })

  const sortedOpportunities = [...filtered].sort((a, b) => {
    if (sortBy === 'match') return (b.match ?? -1) - (a.match ?? -1)
    if (sortBy === 'newest') {
      const bTime = new Date(b.createdAt || b.created_at || b.updatedAt || b.updated_at || 0).getTime()
      const aTime = new Date(a.createdAt || a.created_at || a.updatedAt || a.updated_at || 0).getTime()
      return bTime - aTime
    }
    if (sortBy === 'hours') {
      const getHours = value => Number.parseFloat(String(value?.weeklyHours || value?.hours || '').replace(/[^\d.]/g, '')) || 0
      return getHours(a) - getHours(b)
    }
    return String(a.title || '').localeCompare(String(b.title || ''))
  })

  return (
    <>
      <div className="relative min-h-screen bg-[#F5F7FB]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />
      <div className="relative mx-auto max-w-[1520px] px-6 pb-8 pt-10 lg:px-10">

        {isNGO ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl translate-x-2 translate-y-3">
                <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#202124] sm:text-5xl">
                  Opportunities
                </h1>
                <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-[#5F6368]">
                  Manage your posted roles and keep track of applicants from one clean workspace.
                </p>
              </div>
            </div>

            <div className="grid translate-x-2 translate-y-8 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <motion.aside
                initial={false}
                animate={{ opacity: 1 }}
                className="sticky top-6 h-fit rounded-[32px] border bg-white p-6 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
                style={{ borderColor: 'rgba(26,115,232,0.10)' }}
              >
                <div className="flex items-start justify-between gap-3 pb-4">
                  <div>
                    <h3 className="text-[1rem] font-semibold tracking-[-0.02em] text-[#202124]">Posted roles</h3>
                    <p className="mt-1 text-[0.86rem] text-[#5F6368]">{ngoOpps.length} total</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/opportunities/new')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8] transition-transform hover:-translate-y-0.5"
                    aria-label="Create opportunity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="max-h-[calc(100vh-232px)] space-y-2 overflow-y-auto pr-1">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="h-24 animate-pulse rounded-[24px] border bg-[#FBFCFE]"
                        style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                      />
                    ))
                  ) : ngoOpps.length === 0 ? (
                    <div
                      className="rounded-[22px] border border-dashed bg-[#FBFCFE] px-4 py-6 text-center text-[0.86rem] text-[#5F6368]"
                      style={{ borderColor: 'rgba(26,115,232,0.16)' }}
                    >
                      No opportunities yet
                    </div>
                  ) : (
                    ngoOpps.map((opp) => {
                      const normalized = normalizeNgoOpportunity(opp)
                      const active = String(selectedOppId) === String(opp.id)
                      const status = statusMeta(normalized.status)
                      const filled = (normalized.status || '').toLowerCase() === 'paused'
                      const isDraft = (normalized.status || '').toLowerCase() === 'draft'
                      return (
                        <button
                          key={opp.id}
                          onClick={() => setSelectedOppId(opp.id)}
                          className={`group w-full rounded-[24px] border p-4 text-left transition-all ${
                            filled
                              ? 'border-[rgba(24,128,56,0.20)] bg-[#F2FBF6] hover:bg-[#EDFAF2]'
                              : active
                              ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_12px_28px_rgba(26,115,232,0.12)]'
                              : 'border-[#E5EEFB] bg-white hover:border-[#BFD7FF] hover:bg-[#FBFCFE]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={`line-clamp-2 text-[0.95rem] font-semibold leading-snug ${
                                filled ? 'text-[#188038]' : 'text-[#202124]'
                              }`}>
                                {normalized.title}
                              </p>
                              <p className={`mt-1.5 flex items-center gap-2 text-[0.76rem] ${filled ? 'text-[#188038]' : 'text-[#5F6368]'}`}>
                                {filled ? 'Someone works there' : (normalized.category || normalized.location || 'Open role')}
                                {isDraft && (
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[0.66rem] font-semibold"
                                    style={{ background: status.bg, color: status.text }}
                                  >
                                    {status.label}
                                  </span>
                                )}
                              </p>
                            </div>
                            <ArrowRight size={16} className={`mt-1 shrink-0 transition-transform ${
                              filled
                                ? 'text-[#188038]'
                                : active
                                ? 'text-[#1A73E8]'
                                : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'
                            }`} />
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </motion.aside>

              <section className="space-y-6">
                {loading ? (
                  <div
                    className="rounded-[36px] border bg-white p-8 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
                    style={{ borderColor: 'rgba(26,115,232,0.10)' }}
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="max-w-4xl flex-1">
                        <div className="h-[30px] w-40 animate-pulse rounded-full bg-[#E8F0FE]" />
                        <div className="mt-4 h-[46px] w-3/5 animate-pulse rounded-2xl bg-[#EEF4FF]" />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 self-start">
                        <div className="h-[33px] w-20 animate-pulse rounded-full bg-[#E8F0FE]" />
                        <div className="h-[33px] w-36 animate-pulse rounded-full border border-[#E5EEFB] bg-white" />
                        <div className="h-[33px] w-20 animate-pulse rounded-full border border-[#E5EEFB] bg-white" />
                      </div>
                    </div>

                    <div className="mt-7 rounded-[28px] border bg-white p-6" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                      <div className="grid gap-6">
                        <div>
                          <div className="h-4 w-28 animate-pulse rounded-full bg-[#EEF4FF]" />
                          <div className="mt-3 grid gap-3 xl:grid-cols-4">
                            {[0, 1, 2, 3].map(i => (
                              <div
                                key={i}
                                className="h-[98px] animate-pulse rounded-[20px] border bg-[#FBFCFE]"
                                style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                          <div className="h-4 w-28 animate-pulse rounded-full bg-[#EEF4FF]" />
                          <div className="mt-4 space-y-3">
                            <div className="h-3.5 w-full animate-pulse rounded-full bg-[#F1F4F9]" />
                            <div className="h-3.5 w-5/6 animate-pulse rounded-full bg-[#F1F4F9]" />
                            <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-[#F1F4F9]" />
                          </div>
                        </div>

                        <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                          <div className="h-4 w-16 animate-pulse rounded-full bg-[#EEF4FF]" />
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[0, 1, 2, 3].map(i => (
                              <div key={i} className="h-[32px] w-24 animate-pulse rounded-full border border-[#E5EEFB] bg-[#FBFCFE]" />
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                          <div className="h-4 w-24 animate-pulse rounded-full bg-[#EEF4FF]" />
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="h-[32px] w-24 animate-pulse rounded-full border border-[#E5EEFB] bg-[#FBFCFE]" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                      <div className="h-[42px] w-32 animate-pulse rounded-full border border-[#FAD2CF] bg-white" />
                    </div>
                  </div>
                ) : !selectedOpp ? (
                  <div className="rounded-[32px] border bg-white p-8 text-center shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                      <Briefcase size={24} />
                    </div>
                    <h3 className="text-[1.05rem] font-semibold text-[#202124]">No opportunity selected</h3>
                    <p className="mx-auto mt-2 max-w-lg text-[0.92rem] leading-7 text-[#5F6368]">
                      Choose a role on the left to view details, applicants, and quick actions.
                    </p>
                    <button
                      onClick={() => navigate('/opportunities/new')}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.9rem] font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.18)]"
                    >
                      <Plus size={14} />
                      Create role
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={ngoOpportunityImg}
                      alt=""
                      className="pointer-events-none absolute -top-[9.5rem] left-[65%] z-0 w-full max-w-sm -translate-x-1/2 select-none"
                    />
                    <motion.div
                    key={selectedOpp.id}
                    initial={false}
	                    animate={{ opacity: 1 }}
	                    transition={{ duration: 0.12 }}
	                    className="relative z-10 rounded-[36px] border bg-white p-8 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
	                    style={{
                        background: selectedOppFilled ? 'linear-gradient(180deg, #F4FBF7 0%, #FFFFFF 38%)' : '#FFFFFF',
                        borderColor: selectedOppFilled ? 'rgba(24,128,56,0.18)' : 'rgba(26,115,232,0.10)',
                      }}
	                  >
	                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
	                      <div className="max-w-4xl">
	                        <div
	                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.76rem] font-semibold"
	                            style={{
	                              background: selectedOppFilled ? 'rgba(24,128,56,0.10)' : '#E8F0FE',
	                              color: selectedOppFilled ? '#188038' : '#1A73E8',
	                            }}
	                          >
		                          <Sparkles size={13} />
		                          {selectedOppFilled ? 'Filled role' : 'Opportunity details'}
		                        </div>
		                        <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-[#202124] sm:text-[2.4rem]">
		                          {selectedOpp.title}
		                        </h2>
                            {selectedOppFilled && (
                              <p className="mt-3 max-w-2xl text-[0.9rem] leading-6 text-[#188038]">
                                Someone works in this role, so it is no longer open for new student applications.
                              </p>
                            )}
		                      </div>
	
	                      <div className="flex flex-wrap items-center gap-3 self-start">
		                        {!selectedOppFilled && (
		                          <span
	                              className="inline-flex items-center rounded-full px-3 py-1.5 text-[0.78rem] font-semibold"
	                              style={{
	                                background: selectedOppStatus.bg,
	                                color: selectedOppStatus.text,
	                              }}
	                            >
		                            {selectedOppStatus.label}
		                          </span>
		                        )}
	                        <button
	                          onClick={() => navigate(`/applicants?opportunity=${selectedOpp.id}`)}
	                          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 transition-colors hover:bg-[#FBFCFE]"
	                          style={{ borderColor: selectedOppFilled ? 'rgba(24,128,56,0.16)' : 'rgba(26,115,232,0.10)' }}
	                        >
	                          <Users size={14} className={selectedOppFilled ? 'text-[#188038]' : 'text-[#1A73E8]'} />
		                          <span className="text-[0.78rem] font-semibold text-[#202124]">
		                            {selectedOppFilled ? 'View placement' : 'View applicants'}
		                          </span>
	                          <ChevronRight size={14} className={selectedOppFilled ? 'text-[#188038]' : 'text-[#1A73E8]'} />
	                        </button>
                        <button
                          onClick={() => navigate(`/opportunities/new?edit=${selectedOpp.id}`)}
                          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 transition-colors hover:bg-[#FBFCFE]"
                          style={{ borderColor: selectedOppFilled ? 'rgba(24,128,56,0.16)' : 'rgba(26,115,232,0.10)' }}
                        >
                          <PencilLine size={14} className={selectedOppFilled ? 'text-[#188038]' : 'text-[#1A73E8]'} />
                          <span className="text-[0.78rem] font-semibold text-[#202124]">
                            Edit role
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-7 rounded-[28px] border bg-white p-6" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                      <div className="grid gap-6">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
                            Role details
                          </p>
                          <div className="mt-3 grid gap-3 xl:grid-cols-4">
                            {[
                              { label: 'Location', value: selectedOpp.location || 'Not set', icon: MapPin, tint: '#E8F0FE', accent: '#1A73E8' },
                              { label: 'Category', value: selectedOpp.category || 'Not set', icon: Briefcase, tint: '#F3E8FD', accent: '#A142F4' },
                              { label: 'Work mode', value: selectedOpp.workMode || 'Not set', icon: Globe, tint: '#FEF7E0', accent: '#F29900' },
                              { label: 'Hours/week', value: selectedOpp.weeklyHours ? `${selectedOpp.weeklyHours}` : 'Not set', icon: Clock, tint: '#E6F4EA', accent: '#188038' },
                            ].map(item => (
                              <div
                                key={item.label}
                                className="relative overflow-hidden rounded-[20px] border bg-[#FBFCFE] px-4 py-4 shadow-[0_1px_0_rgba(17,24,39,0.02)]"
                                style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                              >
                                <svg
                                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full"
                                  viewBox="0 0 300 100"
                                  preserveAspectRatio="none"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z"
                                    fill={item.tint}
                                    opacity="0.55"
                                  />
                                  <path
                                    d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z"
                                    fill={item.tint}
                                    opacity="0.85"
                                  />
                                </svg>

                                <div className="relative z-10 flex items-center gap-2">
                                  <span
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                    style={{ background: item.tint, color: item.accent }}
                                  >
                                    <item.icon size={13} />
                                  </span>
                                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
                                    {item.label}
                                  </p>
                                </div>
                                <p className="relative z-10 mt-2 text-[0.92rem] font-semibold text-[#202124]">
                                  {item.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
                            Role overview
                          </p>
                          <p className="mt-3 max-w-4xl text-[0.94rem] leading-8 text-[#5F6368] whitespace-pre-wrap">
                            {selectedOpp.description || selectedOpp.missionImpact || 'No description added yet.'}
                          </p>
                        </div>

                        <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Skills</p>
                          <div className="mt-3 flex min-h-[32px] flex-wrap gap-2">
                            {selectedOpp.skills?.length > 0 ? (
                              selectedOpp.skills.map((s, i) => {
                                const parsed = typeof s === 'string' ? s : (s?.name ?? '')
                                if (!parsed) return null
                                return (
                                  <span key={i} className="rounded-full border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-1.5 text-[0.8rem] text-[#5F6368]">
                                    {parsed}
                                  </span>
                                )
                              })
                            ) : (
                              <span className="text-[0.86rem] text-[#9AA0A6]">Not set</span>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Languages</p>
                          <div className="mt-3 flex min-h-[32px] flex-wrap gap-2">
                            {selectedOpp.languages?.length > 0 ? (
                              selectedOpp.languages.map((lang, i) => (
                                  <span key={i} className="rounded-full border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-1.5 text-[0.8rem] text-[#5F6368]">
                                    {lang}
                                  </span>
                              ))
                            ) : (
                              <span className="text-[0.86rem] text-[#9AA0A6]">Not set</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                      {selectedOppFilled && (
                        <div className="w-full sm:mr-auto sm:max-w-xl">
                          {acceptedApplicantLoading ? (
                            <div className="flex items-center gap-3 rounded-[18px] border border-[#E5EEFB] bg-[#FBFCFE] px-4 py-3 text-[0.84rem] font-semibold text-[#5F6368]">
                              <RefreshCw size={15} className="animate-spin text-[#1A73E8]" />
                              Loading selected student...
                            </div>
                          ) : acceptedApplicant?.status === 'completed' ? (
                            <div className="flex items-start gap-3 rounded-[18px] border border-[#D7E6FF] bg-[#F8FBFF] px-4 py-3">
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
                                <CheckCircle2 size={16} />
                              </span>
                              <div>
                                <p className="text-[0.9rem] font-semibold text-[#202124]">Role completed for {acceptedApplicant.name.split(' ')[0]}</p>
                                <p className="mt-0.5 text-[0.78rem] text-[#5F6368]">
                                  Their certificate is now available in the student dashboard.
                                </p>
                              </div>
                            </div>
                          ) : acceptedApplicant ? (
                            <div className="rounded-[18px] border border-[#D7E6FF] bg-[#F8FBFF] p-3">
                              <div className="mb-3">
                                <p className="text-[0.9rem] font-semibold text-[#202124]">Finish this placement</p>
                                <p className="mt-0.5 text-[0.78rem] text-[#5F6368]">
                                  Mark {acceptedApplicant.name.split(' ')[0]} as completed and unlock their certificate.
                                </p>
                              </div>
                              <button
                                onClick={handleCompleteRole}
                                disabled={completingRole}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-[#1A73E8] px-4 text-[0.84rem] font-semibold text-white transition-colors hover:bg-[#1765CC] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                              >
                                {completingRole ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                {completingRole ? 'Completing role...' : `Complete role for ${acceptedApplicant.name.split(' ')[0]}`}
                              </button>
                            </div>
                          ) : (
                            <div className="rounded-[18px] border border-dashed border-[#D7E6FF] bg-[#FBFCFE] px-4 py-3">
                              <p className="text-[0.88rem] font-semibold text-[#202124]">No accepted student found</p>
                              <p className="mt-0.5 text-[0.78rem] text-[#5F6368]">
                                Accept a student from Applicants before completing this role.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteOpportunity(selectedOpp.id)}
                        disabled={deleting === selectedOpp.id}
                        className="inline-flex items-center justify-center gap-2 rounded-full border bg-white px-4 py-2.5 text-[0.84rem] font-semibold text-[#B42318] transition-colors hover:bg-[#FFF9F9] disabled:opacity-50"
                        style={{ borderColor: 'rgba(244,63,94,0.18)' }}
                      >
                        <Trash2 size={15} />
                        {deleting === selectedOpp.id ? 'Deleting...' : 'Delete role'}
                      </button>
                      </div>
                  </motion.div>
                  </div>
                )}
              </section>
            </div>
          </div>
        ) : (
          /* Student view */
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
            >
              <div>
                <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
                  Opportunities
                </h1>
                <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
                  Browse roles that fit your skills, interests, and goals.
                </p>
              </div>
              <div className="flex w-fit items-center gap-2 rounded-full border border-[#D7E6FF] bg-white px-3 py-2 text-[0.84rem] font-semibold text-[#1A73E8] shadow-[0_10px_24px_rgba(17,24,39,0.035)]">
                {loading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {loading
                  ? 'Loading roles'
                  : `${sortedOpportunities.length} role${sortedOpportunities.length === 1 ? '' : 's'}`}
              </div>
            </motion.div>

            <section className="rounded-[32px] border border-[#D7E6FF] bg-white p-5 shadow-[0_14px_38px_rgba(17,24,39,0.035)] sm:p-6">
              <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_220px]">
                <label className="flex items-center gap-3 rounded-[22px] border border-[#E5EEFB] bg-[#FAFBFC] px-4 py-3 transition focus-within:border-[#1A73E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1A73E8]/10">
                  <Search size={17} className="shrink-0 text-[#1A73E8]"/>
                  <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Search by role, NGO, or skill"
                    className="min-w-0 flex-1 bg-transparent text-[0.92rem] font-medium text-[#202124] outline-none placeholder:text-[#8A8F98]"
                  />
                </label>

                <label className="rounded-[22px] border border-[#E5EEFB] bg-[#FAFBFC] px-4 py-2.5">
                  <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[#8A8F98]">
                    Category
                  </span>
                  <select
                    value={cat}
                    onChange={e => setCat(e.target.value)}
                    className="mt-1 w-full bg-transparent text-[0.9rem] font-semibold text-[#202124] outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label className="rounded-[22px] border border-[#E5EEFB] bg-[#FAFBFC] px-4 py-2.5">
                  <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[#8A8F98]">
                    Sort
                  </span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="mt-1 w-full bg-transparent text-[0.9rem] font-semibold text-[#202124] outline-none"
                  >
                    <option value="match">Best match first</option>
                    <option value="newest">Newest first</option>
                    <option value="hours">Lowest hours first</option>
                    <option value="title">A to Z</option>
                  </select>
                </label>
              </div>
            </section>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[0,1,2,3,4,5].map(i => <OpportunityCardSkeleton key={i} index={i} />)}
              </div>
            ) : sortedOpportunities.length === 0 ? (
              <div className="rounded-[32px] border border-[#D7E6FF] bg-white px-6 py-20 text-center shadow-[0_14px_38px_rgba(17,24,39,0.035)]">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#E8F0FE] text-[#1A73E8]">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-[1.1rem] font-semibold text-[#202124]">No opportunities found</h3>
                <p className="mx-auto mt-2 max-w-md text-[0.92rem] leading-7 text-[#5F6368]">
                  Try a different search, category, or sorting option.
                </p>
                <button
                  onClick={() => { setQ(''); setCat('All'); setSortBy('match') }}
                  className="mt-6 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.86rem] font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.18)] transition hover:-translate-y-0.5"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {sortedOpportunities.map((ngo, i) => {
                  const orgName = ngo.orgName || ngo.name || 'Organization'
                  const category = ngo.category || ngo.cat || 'Opportunity'
                  const description = ngo.description || ngo.missionImpact || ngo.desc || ''
                  const skills = (ngo.skills || []).map(skillName).filter(Boolean).slice(0, 3)
                  return (
                  <motion.div key={ngo.id}
                    initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.05, duration:0.3 }}
                    onClick={() => setViewingOpp(ngo)}
                    className="group flex min-h-[330px] cursor-pointer flex-col rounded-[32px] border border-[#D7E6FF] bg-white p-6 shadow-[0_14px_38px_rgba(17,24,39,0.035)] transition-all duration-200 hover:-translate-y-1 hover:border-[#BBD4FF] hover:shadow-[0_18px_44px_rgba(26,115,232,0.09)]">

                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-2xl bg-[#E8F0FE] p-1">
                        <GradientAvatar name={orgName} size={50} radius="0.8rem"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {ngo.match !== null && ngo.match !== undefined && (
                            <span className="rounded-full bg-[#E8F0FE] px-3 py-1 text-[0.76rem] font-semibold text-[#1A73E8]">
                              {ngo.match}% match
                            </span>
                          )}
                          <span className="rounded-full bg-[#FAFBFC] px-3 py-1 text-[0.74rem] font-semibold text-[#5F6368]">
                            {category}
                          </span>
                        </div>
                        <h3 className="line-clamp-2 text-[1.06rem] font-semibold leading-snug tracking-[-0.02em] text-[#202124] transition-colors group-hover:text-[#1A73E8]">
                          {ngo.title || category}
                        </h3>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/ngo-profile/${ngo.ngoId}`) }}
                          className="mt-1 text-[0.84rem] font-semibold text-[#5F6368] transition-colors hover:text-[#1A73E8]">
                          {orgName}
                        </button>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSave(ngo) }}
                        disabled={toggling === ngo.id}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5EEFB] bg-white text-[#5F6368] transition-colors hover:bg-[#F8FBFF] disabled:opacity-40">
                        <BookmarkIcon size={18} className={
                          savedIds.has(ngo.id) ? 'fill-[#1A73E8] text-[#1A73E8]' : ''
                        }/>
                      </button>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 text-[0.78rem] font-medium text-[#5F6368]">
                        {ngo.location && (
                          <span className="flex items-center gap-1.5 rounded-full bg-[#FAFBFC] px-3 py-1.5">
                            <MapPin size={13} className="text-[#1A73E8]" />
                            {ngo.location}
                          </span>
                        )}
                        {ngo.workMode && (
                          <span className="flex items-center gap-1.5 rounded-full bg-[#FAFBFC] px-3 py-1.5">
                            <Globe size={13} className="text-[#1A73E8]" />
                            {ngo.workMode}
                          </span>
                        )}
                        {ngo.weeklyHours && (
                          <span className="flex items-center gap-1.5 rounded-full bg-[#FAFBFC] px-3 py-1.5">
                            <Clock size={13} className="text-[#1A73E8]" />
                            {ngo.weeklyHours} hrs/week
                          </span>
                        )}
                    </div>

                    {description && (
                      <p className="mt-5 line-clamp-3 flex-1 text-[0.92rem] leading-7 text-[#5F6368]">
                        {description}
                      </p>
                    )}

                    <div className="mt-5 border-t border-[#EEF3FB] pt-4">
                      {skills.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {skills.map(skill => (
                            <span key={skill} className="rounded-full border border-[#D7E6FF] bg-white px-3 py-1.5 text-[0.78rem] font-semibold text-[#1A73E8]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setViewingOpp(ngo) }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-4 py-3 text-[0.88rem] font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.18)] transition hover:-translate-y-0.5"
                      >
                        View role
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )})}
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {viewingOpp && (
          <OpportunityDetailModal
            key="detail"
            opp={viewingOpp}
            onClose={() => setViewingOpp(null)}
            onApply={() => { setViewingOpp(null); setApplyingTo(viewingOpp) }}
          />
        )}
      </AnimatePresence>

      {/* Apply modal */}
      <AnimatePresence>
        {applyingTo && (
          <ApplyModal
            key="apply"
            ngo={applyingTo}
            user={user}
            studentId={user?.id}
            onClose={() => setApplyingTo(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
