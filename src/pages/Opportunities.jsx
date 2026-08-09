import { useState, useEffect, useRef } from 'react'
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
  X, CheckCircle2, Clock, ChevronRight, ChevronDown, ArrowRight, Globe, Trash2, PencilLine,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchActiveOpportunities, fetchNgoOpportunities, deleteOpportunity } from '../services/opportunities'
import { fetchSavedIds, saveOpportunity, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'
import { withTimeout } from '../utils/withTimeout'
import opportunitiesStudentSun from '../assets/opportunities student sun.PNG'
import applicationsSun from '../assets/applications sun.PNG'

const CATEGORIES = ['All','Technology','Education','Environment','Healthcare','Youth Services','Accessibility']

function previewText(text, limit = 210) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (!clean || clean.length <= limit) return { text: clean, hasMore: false }
  const slice = clean.slice(0, limit)
  const breakAt = slice.lastIndexOf(' ')
  const end = breakAt > limit * 0.65 ? breakAt : limit
  return { text: `${slice.slice(0, end).trim()}...`, hasMore: true }
}

function GlassDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(option => option.value === value) || options[0]

  useEffect(() => {
    if (!open) return
    function closeOnOutside(event) {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    return () => document.removeEventListener('pointerdown', closeOnOutside)
  }, [open])

  return (
    <div ref={ref} className={`relative ${open ? 'z-[90]' : 'z-10'}`}>
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
      className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-[#DCE7F7]/72 bg-white/88 px-3.5 py-2 text-left shadow-[0_10px_24px_rgba(26,115,232,0.045),0_1px_0_rgba(255,255,255,0.88)_inset] outline-none backdrop-blur-2xl transition-all hover:border-[#C9DBF4]/82 hover:bg-white/96 focus:border-[#1A73E8] focus:shadow-[0_12px_28px_rgba(26,115,232,0.10),0_0_0_3px_rgba(26,115,232,0.10)]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[#8A8F98]">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-[0.86rem] font-semibold text-[#202124]">
            {selected?.label}
          </span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-[#1A73E8] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[120] max-h-64 w-full min-w-52 overflow-y-auto overscroll-contain rounded-[20px] border border-white/85 bg-white/95 p-1.5 shadow-[0_18px_46px_rgba(26,115,232,0.14),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl"
          role="listbox"
        >
          {options.map(option => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-[15px] px-3 py-2 text-left text-[0.82rem] font-semibold transition-colors ${
                  active
                    ? 'bg-[#E8F0FE] text-[#1A73E8]'
                    : 'text-[#3C4043] hover:bg-[#F8FBFF] hover:text-[#1A73E8]'
                }`}
                role="option"
                aria-selected={active}
              >
                <span className="truncate">{option.label}</span>
                {active && <CheckCircle2 size={14} className="shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
      style={{ background:'rgba(232,240,254,0.36)', backdropFilter:'blur(10px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity:0, scale:0.95, y:30 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95 }} transition={{ type:'spring', stiffness:360, damping:30 }}
        className="flex w-full max-w-[56rem] flex-col overflow-hidden rounded-[32px] border border-[#DCE7F7]/72 bg-white/95 shadow-[0_30px_90px_rgba(26,115,232,0.14),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-[#EEF4FF]/60 backdrop-blur-2xl"
        style={{ maxHeight:'92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header Section */}
        <div className="sticky top-0 z-10 border-b border-[#DCE7F7]/70 bg-white/94 px-5 py-5 shadow-[0_1px_0_rgba(255,255,255,0.86)_inset] backdrop-blur-2xl sm:px-6">
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
                className="inline-flex items-center rounded-full border border-[#8AB4F8]/55 bg-[linear-gradient(135deg,rgba(26,115,232,0.94),rgba(26,115,232,0.78))] px-4 py-2 text-[0.74rem] font-semibold text-white shadow-[0_12px_24px_rgba(26,115,232,0.20),0_1px_0_rgba(255,255,255,0.28)_inset] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-[#1765CC] hover:shadow-[0_15px_30px_rgba(26,115,232,0.24),0_1px_0_rgba(255,255,255,0.32)_inset] whitespace-nowrap">
                View NGO Profile
              </Link>
              <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D7E6FF]/75 bg-white/82 text-[#5F6368] shadow-[0_8px_18px_rgba(26,115,232,0.06)] transition-colors hover:bg-white hover:text-[#1A73E8]">
                <X size={17}/>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E8F0FE]/78 pt-3 text-[0.72rem] font-medium text-[#5F6368]">
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
        <div className="flex-1 overflow-y-auto bg-white/88">
          <div className="mx-auto max-w-[50rem] space-y-4 px-5 py-6 sm:px-7">

            {/* ━━━━━━━━━━━━━━━━━━ ABOUT THIS ROLE ━━━━━━━━━━━━━━━━━━ */}
            {(opp.description || opp.missionImpact) && (
              <div className="relative overflow-hidden rounded-[24px] border border-[#DCE7F7]/68 bg-white/92 p-6 shadow-[0_14px_34px_rgba(26,115,232,0.04),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl sm:p-7">
                <span className="absolute inset-y-6 left-0 w-1 rounded-r-full bg-[#1A73E8]/35" />
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Role overview</p>
                <h2 className="mb-4 text-[1.15rem] font-semibold text-[#202124]">About this role</h2>
                <p className="whitespace-pre-wrap text-[0.92rem] leading-7 text-[#5F6368]">
                  {opp.description || opp.missionImpact}
                </p>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━ MISSION & IMPACT ━━━━━━━━━━━━━━━━━━ */}
            {opp.missionImpact && opp.description && (
              <div className="relative overflow-hidden rounded-[24px] border border-[#DCE7F7]/68 bg-white/92 p-6 shadow-[0_14px_34px_rgba(26,115,232,0.04),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl sm:p-7">
                <p className="relative mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Impact</p>
                <h2 className="relative mb-4 text-[1.15rem] font-semibold text-[#202124]">Why this matters</h2>
                <p className="whitespace-pre-wrap text-[0.92rem] leading-7 text-[#5F6368]">{opp.missionImpact}</p>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━ QUICK INFO CARDS ━━━━━━━━━━━━━━━━━━ */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {opp.location && (
                <div className="rounded-[18px] border border-[#DCE7F7]/62 bg-white/90 p-4 shadow-[0_10px_24px_rgba(26,115,232,0.03),0_1px_0_rgba(255,255,255,0.86)_inset] backdrop-blur-2xl">
                  <MapPin size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Location</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.location}</p>
                </div>
              )}
              {opp.workMode && (
                <div className="rounded-[18px] border border-[#DCE7F7]/62 bg-white/90 p-4 shadow-[0_10px_24px_rgba(26,115,232,0.03),0_1px_0_rgba(255,255,255,0.86)_inset] backdrop-blur-2xl">
                  <Globe size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Work Mode</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.workMode}</p>
                </div>
              )}
              {opp.weeklyHours && (
                <div className="rounded-[18px] border border-[#DCE7F7]/62 bg-white/90 p-4 shadow-[0_10px_24px_rgba(26,115,232,0.03),0_1px_0_rgba(255,255,255,0.86)_inset] backdrop-blur-2xl">
                  <Clock size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Hours/Week</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.weeklyHours}</p>
                </div>
              )}
              {opp.duration && (
                <div className="rounded-[18px] border border-[#DCE7F7]/62 bg-white/90 p-4 shadow-[0_10px_24px_rgba(26,115,232,0.03),0_1px_0_rgba(255,255,255,0.86)_inset] backdrop-blur-2xl">
                  <Briefcase size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Duration</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.duration}</p>
                </div>
              )}
              {opp.deadline && (
                <div className="rounded-[18px] border border-[#DCE7F7]/62 bg-white/90 p-4 shadow-[0_10px_24px_rgba(26,115,232,0.03),0_1px_0_rgba(255,255,255,0.86)_inset] backdrop-blur-2xl">
                  <Clock size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Deadline</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">
                    {new Date(opp.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              {(opp.category || opp.field) && (
                <div className="rounded-[18px] border border-[#DCE7F7]/62 bg-white/90 p-4 shadow-[0_10px_24px_rgba(26,115,232,0.03),0_1px_0_rgba(255,255,255,0.86)_inset] backdrop-blur-2xl">
                  <Briefcase size={15} className="mb-3 text-[#1A73E8]" />
                  <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">Category</p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.category || opp.field || 'Not specified'}</p>
                </div>
              )}
            </div>

            {/* ━━━━━━━━━━━━━━━━━━ REQUIRED SKILLS ━━━━━━━━━━━━━━━━━━ */}
            {opp.skills && opp.skills.length > 0 && (
              <div className="rounded-[24px] border border-[#DCE7F7]/68 bg-white/92 p-6 shadow-[0_14px_34px_rgba(26,115,232,0.035),0_1px_0_rgba(255,255,255,0.88)_inset] backdrop-blur-2xl sm:p-7">
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
                      <span key={i} className="rounded-full border border-[#D7E6FF]/80 bg-white/76 px-4 py-2 text-[0.78rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
                        {skillLevel ? `${skillName} · ${skillLevel}` : skillName}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━ LANGUAGES ━━━━━━━━━━━━━━━━━━ */}
            {opp.languages && opp.languages.length > 0 && (
              <div className="rounded-[24px] border border-[#DCE7F7]/68 bg-white/92 p-6 shadow-[0_14px_34px_rgba(26,115,232,0.035),0_1px_0_rgba(255,255,255,0.88)_inset] backdrop-blur-2xl sm:p-7">
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Communication</p>
                <h2 className="mb-5 text-[1.15rem] font-semibold text-[#202124]">Required languages</h2>
                <div className="flex flex-wrap gap-3">
                  {opp.languages.map((lang, i) => (
                    <span key={i} className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[0.78rem] font-semibold text-[#3C4043] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
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
        <div className="sticky bottom-0 flex justify-center border-t border-[#DCE7F7]/70 bg-white/94 px-6 py-5 shadow-[0_-14px_34px_rgba(26,115,232,0.05),0_1px_0_rgba(255,255,255,0.88)_inset] backdrop-blur-2xl sm:px-8">
          <button onClick={onApply}
            className="min-w-[280px] rounded-full bg-[#1A73E8] px-14 py-3.5 text-[0.9rem] font-semibold text-white shadow-[0_14px_30px_rgba(26,115,232,0.22)] transition hover:-translate-y-0.5 hover:bg-[#1765CC] active:scale-95">
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
        // Snapshot the role's details now, while it's guaranteed active and
        // readable — keeps this application's detail view working later even
        // if the role goes paused/closed.
        opportunitySnapshot: ngo,
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
    title: opp.title || 'Role',
    orgName: opp.orgName || opp.org_name || opp.name || '',
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
    if (!window.confirm('Are you sure you want to delete this role? Students will no longer see it in their applications.')) {
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
      setNgoError('Failed to delete role: ' + err.message)
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(255,255,255,0.72),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />
      <div className="relative mx-auto max-w-[1520px] px-6 pb-8 pt-10 lg:px-10">

        {isNGO ? (
          <div className="relative space-y-6">
            <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl translate-x-2 translate-y-3">
                <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#202124] sm:text-5xl">
                  Roles
                </h1>
                <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-[#5F6368]">
                  Manage your posted roles and keep track of applicants from one clean workspace.
                </p>
              </div>
            </div>

            <div className="relative z-10 grid translate-x-2 translate-y-8 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <motion.aside
                initial={false}
                animate={{ opacity: 1 }}
                className="sticky top-6 h-fit rounded-[30px] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(248,251,255,0.34))] p-4 shadow-[0_24px_64px_rgba(26,115,232,0.085),0_1px_0_rgba(255,255,255,0.96)_inset,0_-1px_0_rgba(26,115,232,0.025)_inset] backdrop-blur-2xl"
              >
                <div className="flex items-start justify-between gap-3 pb-4">
                  <div>
                    <h3 className="text-[1rem] font-semibold tracking-[-0.02em] text-[#202124]">Posted roles</h3>
                    <p className="mt-1 text-[0.86rem] text-[#5F6368]">{ngoOpps.length} total</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/opportunities/new')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A73E8] shadow-[0_10px_24px_rgba(26,115,232,0.10)] transition-transform hover:-translate-y-0.5"
                    aria-label="Create role"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/opportunities/new')}
                  className="mb-4 flex w-full items-center gap-3 rounded-[24px] border border-[#AECBFA] bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(232,240,254,0.64))] px-4 py-4 text-left shadow-[0_12px_28px_rgba(26,115,232,0.12),0_1px_0_rgba(255,255,255,0.95)_inset,0_-1px_0_rgba(26,115,232,0.04)_inset] transition-all hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(232,240,254,0.72))] hover:shadow-[0_16px_34px_rgba(26,115,232,0.15),0_1px_0_rgba(255,255,255,0.97)_inset]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1A73E8] text-white shadow-[0_10px_22px_rgba(26,115,232,0.18)]">
                    <Plus size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.92rem] font-semibold text-[#202124]">Add a role</span>
                    <span className="mt-0.5 block text-[0.78rem] leading-5 text-[#5F6368]">Create a new student role.</span>
                  </span>
                  <ArrowRight size={16} className="ml-auto shrink-0 text-[#1A73E8]" />
                </button>

                <div className="-mx-1 max-h-[calc(100vh-306px)] space-y-2 overflow-y-auto px-1 pr-2">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="h-24 animate-pulse rounded-[24px] border bg-[#FBFCFE]"
                        style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                      />
                    ))
                  ) : ngoOpps.length === 0 ? (
	                    <div className="rounded-[22px] border border-dashed border-[#D7E6FF] bg-white px-4 py-6 text-center text-[0.86rem] text-[#5F6368]">
	                      No roles yet
	                    </div>
                  ) : (
                    ngoOpps.map((opp) => {
                      const normalized = normalizeNgoOpportunity(opp)
                      const active = String(selectedOppId) === String(opp.id)
	                      const filled = (normalized.status || '').toLowerCase() === 'paused'
	                      const isDraft = (normalized.status || '').toLowerCase() === 'draft'
	                      const subtitle = normalized.category || normalized.location || normalized.workMode || `${normalized.applicantCount ?? 0} applicants`
	                      return (
	                        <button
	                          key={opp.id}
	                          onClick={() => setSelectedOppId(opp.id)}
	                          className={`group relative w-full overflow-hidden rounded-[24px] border px-4 py-5 text-left after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.24),transparent_44%)] ring-1 ring-white/55 backdrop-blur-2xl transition-all hover:-translate-y-0.5 ${
	                            active
	                              ? 'border-transparent bg-[linear-gradient(135deg,rgba(232,240,254,0.86),rgba(220,234,255,0.62))] shadow-[0_10px_24px_rgba(26,115,232,0.075),0_1px_0_rgba(255,255,255,0.9)_inset]'
	                              : 'border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.62))] shadow-[0_7px_18px_rgba(32,33,36,0.032),0_1px_0_rgba(255,255,255,0.9)_inset] hover:border-white/90 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,255,255,0.72))] hover:shadow-[0_9px_22px_rgba(32,33,36,0.045),0_1px_0_rgba(255,255,255,0.94)_inset]'
	                          }`}
	                        >
	                          <div className="relative z-10 flex items-start justify-between gap-3">
	                            <div className="min-w-0">
	                              <p className={`line-clamp-2 text-[0.95rem] font-semibold leading-snug ${active ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
	                                {normalized.title}
	                              </p>
	                              <p className="mt-1.5 flex items-center gap-2 text-[0.76rem] text-[#5F6368]">
	                                <span className="truncate">{subtitle}</span>
	                                {filled && (
	                                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
	                                    <CheckCircle2 size={12} />
	                                  </span>
	                                )}
	                                {isDraft && (
	                                  <span className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[0.66rem] font-semibold text-[#1A73E8]">
	                                    Draft
	                                  </span>
	                                )}
	                              </p>
	                            </div>
	                            <ArrowRight size={16} className={`mt-2 shrink-0 transition-transform ${active ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
	                          </div>
	                        </button>
                      )
                    })
                  )}
                </div>
              </motion.aside>

              <section className="relative -translate-y-6 space-y-6">
                <img
                  src={applicationsSun}
                  alt=""
                  className="pointer-events-none absolute right-[-34px] top-[-218px] z-[5] h-auto w-[350px] max-w-[64vw] select-none sm:right-[-20px] sm:w-[465px] lg:right-[-10px] lg:w-[585px]"
                />
                {loading ? (
                  <div
                    className="relative z-10 rounded-[36px] border bg-white p-8 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
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
	                  <div className="relative z-10 rounded-[32px] border border-white/75 bg-white/80 p-8 text-center shadow-[0_22px_60px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl">
	                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8] shadow-[0_14px_32px_rgba(26,115,232,0.14)]">
	                      <Briefcase size={24} />
	                    </div>
	                    <h3 className="text-[1.05rem] font-semibold text-[#202124]">No role selected</h3>
                    <p className="mx-auto mt-2 max-w-lg text-[0.92rem] leading-7 text-[#5F6368]">
                      Choose a role on the left to view details, applicants, and quick actions.
                    </p>
                    <button
                      onClick={() => navigate('/opportunities/new')}
	                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.9rem] font-semibold text-white shadow-[0_14px_30px_rgba(26,115,232,0.20)] transition-transform hover:-translate-y-0.5"
                    >
                      <Plus size={14} />
                      Create role
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <motion.div
                    key={selectedOpp.id}
                    initial={false}
	                    animate={{ opacity: 1 }}
	                    transition={{ duration: 0.12 }}
		                    className="relative z-10 overflow-hidden rounded-[36px] border border-white/80 bg-white/80 p-8 shadow-[0_28px_80px_rgba(26,115,232,0.11),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl"
		                    style={{
	                        background: selectedOppFilled
	                          ? 'linear-gradient(180deg, rgba(244,251,247,0.92) 0%, rgba(255,255,255,0.86) 42%, rgba(255,255,255,0.76) 100%)'
	                          : 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,251,255,0.76) 100%)',
	                        borderColor: selectedOppFilled ? 'rgba(24,128,56,0.18)' : 'rgba(26,115,232,0.10)',
	                      }}
		                  >
		                    <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_82%_0%,rgba(26,115,232,0.12),transparent_42%),linear-gradient(180deg,rgba(232,240,254,0.44),transparent)]" />
		                    <div className="relative">
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
			                          {selectedOppFilled ? 'Filled role' : 'Role details'}
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
		                          className="inline-flex items-center gap-2 rounded-full border bg-white/90 px-3 py-1.5 shadow-[0_10px_22px_rgba(26,115,232,0.08)] backdrop-blur-xl transition-colors hover:bg-white"
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
	                          className="inline-flex items-center gap-2 rounded-full border bg-white/90 px-3 py-1.5 shadow-[0_10px_22px_rgba(26,115,232,0.08)] backdrop-blur-xl transition-colors hover:bg-white"
                          style={{ borderColor: selectedOppFilled ? 'rgba(24,128,56,0.16)' : 'rgba(26,115,232,0.10)' }}
                        >
                          <PencilLine size={14} className={selectedOppFilled ? 'text-[#188038]' : 'text-[#1A73E8]'} />
                          <span className="text-[0.78rem] font-semibold text-[#202124]">
                            Edit role
                          </span>
                        </button>
                      </div>
                    </div>

	                    <div className="mt-7 rounded-[30px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_52px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-xl">
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
	                                className="relative overflow-hidden rounded-[22px] border border-white/75 bg-white px-4 py-4 shadow-[0_14px_30px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.9)_inset]"
	                                style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                              >
                                <svg
	                                  className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full"
                                  viewBox="0 0 300 100"
                                  preserveAspectRatio="none"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z"
                                    fill={item.tint}
	                                    opacity="0.42"
                                  />
                                  <path
                                    d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z"
                                    fill={item.tint}
	                                    opacity="0.58"
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
	                                  <span key={i} className="rounded-full border border-[#D7E6FF] bg-white/80 px-3 py-1.5 text-[0.8rem] text-[#5F6368] shadow-[0_8px_18px_rgba(26,115,232,0.05)]">
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
	                                  <span key={i} className="rounded-full border border-[#D7E6FF] bg-white/80 px-3 py-1.5 text-[0.8rem] text-[#5F6368] shadow-[0_8px_18px_rgba(26,115,232,0.05)]">
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
	                        className="inline-flex items-center justify-center gap-2 rounded-full border bg-white/90 px-4 py-2.5 text-[0.84rem] font-semibold text-[#B42318] shadow-[0_10px_24px_rgba(180,35,24,0.06)] transition-colors hover:bg-white disabled:opacity-50"
                        style={{ borderColor: 'rgba(244,63,94,0.18)' }}
                      >
                        <Trash2 size={15} />
                        {deleting === selectedOpp.id ? 'Deleting...' : 'Delete role'}
                      </button>
	                      </div>
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
            </motion.div>

            <div className="relative z-30">
              <img
                src={opportunitiesStudentSun}
                alt=""
                className="pointer-events-none absolute bottom-[calc(100%-112px)] right-2 z-0 h-auto w-[315px] max-w-[66vw] sm:right-4 sm:w-[420px] lg:w-[525px]"
              />
              <section className="relative z-10 rounded-[30px] border border-[#DCE7F7]/72 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,251,255,0.72))] p-4 shadow-[0_22px_58px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_220px]">
                <label className="flex items-center gap-3 rounded-[20px] border border-[#DCE7F7]/72 bg-white/88 px-3.5 py-2.5 shadow-[0_10px_24px_rgba(26,115,232,0.045),0_1px_0_rgba(255,255,255,0.88)_inset] backdrop-blur-2xl transition focus-within:border-[#1A73E8] focus-within:bg-white/98 focus-within:ring-4 focus-within:ring-[#1A73E8]/10">
                  <Search size={17} className="shrink-0 text-[#1A73E8]"/>
                  <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Search by role, NGO, or skill"
                    className="min-w-0 flex-1 bg-transparent text-[0.92rem] font-medium text-[#202124] outline-none placeholder:text-[#8A8F98]"
                  />
                </label>

                <GlassDropdown
                  label="Category"
                  value={cat}
                  onChange={setCat}
                  options={CATEGORIES.map(c => ({ value: c, label: c }))}
                />

                <GlassDropdown
                  label="Sort"
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'match', label: 'Best match first' },
                    { value: 'newest', label: 'Newest first' },
                    { value: 'hours', label: 'Lowest hours first' },
                    { value: 'title', label: 'A to Z' },
                  ]}
                />
              </div>
              </section>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[0,1,2,3,4,5].map(i => <OpportunityCardSkeleton key={i} index={i} />)}
              </div>
            ) : sortedOpportunities.length === 0 ? (
              <div className="rounded-[32px] border border-white/85 bg-white/88 px-6 py-20 text-center shadow-[0_22px_58px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.96)_inset] backdrop-blur-2xl">
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
                  const descriptionPreview = previewText(description, 150)
                  const skills = (ngo.skills || []).map(skillName).filter(Boolean).slice(0, 3)
                  const visibleSkills = skills.slice(0, 2)
                  const extraSkillCount = Math.max(skills.length - visibleSkills.length, 0)
                  return (
                  <motion.div key={ngo.id}
                    initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.05, duration:0.3 }}
                    onClick={() => setViewingOpp(ngo)}
                    className="group relative flex h-[462px] cursor-pointer flex-col overflow-hidden rounded-[32px] border border-[#DCE7F7]/72 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,251,255,0.72))] p-6 shadow-[0_22px_54px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.92)_inset] ring-1 ring-[#EEF4FF]/50 backdrop-blur-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[#C9DBF4]/82 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,251,255,0.78))] hover:shadow-[0_30px_68px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.94)_inset]">
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[#F6FAFF]/80" />
                    <div className="pointer-events-none absolute inset-0 bg-white/36" />

                    <div className="relative z-10 flex items-start gap-4">
                      <div className="shrink-0 rounded-2xl border border-white/85 bg-white/82 p-1 shadow-[0_12px_26px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.98)_inset]">
                        <GradientAvatar name={orgName} size={50} radius="0.8rem"/>
                      </div>
                      <div className="min-w-0 flex-1 pr-11">
                        <h3 className="line-clamp-2 text-[1.06rem] font-semibold leading-snug tracking-[-0.02em] text-[#202124] transition-colors group-hover:text-[#1A73E8]">
                          {ngo.title || category}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/ngo-profile/${ngo.ngoId}`) }}
                            className="min-w-0 truncate text-[0.84rem] font-semibold text-[#5F6368] transition-colors hover:text-[#1A73E8]">
                            {orgName}
                          </button>
                          {ngo.match !== null && ngo.match !== undefined && (
                            <span
                              className="inline-flex shrink-0 items-center rounded-full bg-[#D2E3FC] px-2.5 py-1 text-[0.68rem] font-semibold leading-none text-[#174EA6] shadow-[0_7px_14px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.86)_inset]"
                              aria-label={`${ngo.match}% match`}
                            >
                              {ngo.match}% Match
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSave(ngo) }}
                        disabled={toggling === ngo.id}
                        className="absolute right-0 top-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D7E6FF]/70 bg-white/82 text-[#5F6368] shadow-[0_8px_18px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.98)_inset] transition-colors hover:bg-white hover:text-[#1A73E8] disabled:opacity-40"
                        aria-label={savedIds.has(ngo.id) ? 'Unsave role' : 'Save role'}
                      >
                        <BookmarkIcon size={16} className={
                          savedIds.has(ngo.id) ? 'fill-[#1A73E8] text-[#1A73E8]' : ''
                        }/>
                        </button>
                    </div>

                    <div className="relative z-10 mt-5 rounded-[22px] border border-white/86 bg-white/88 p-3 shadow-[0_10px_24px_rgba(26,115,232,0.03),0_1px_0_rgba(255,255,255,0.98)_inset]">
                      <div className="mb-2 flex min-h-[24px] items-center">
                        <span className="rounded-full bg-white/82 px-2.5 py-1 text-[0.7rem] font-semibold text-[#5F6368]">
                          {category}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-2 text-[0.73rem] font-semibold text-[#5F6368]">
                          {ngo.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                                <MapPin size={12} />
                              </span>
                              {ngo.location}
                            </span>
                          )}
                          {ngo.workMode && (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                                <Globe size={12} />
                              </span>
                              {ngo.workMode}
                            </span>
                          )}
                          {ngo.weeklyHours && (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                                <Clock size={12} />
                              </span>
                              {ngo.weeklyHours} hrs/week
                            </span>
                          )}
                      </div>
                    </div>

                    {description && (
                      <p className="relative z-10 mt-4 h-[126px] overflow-hidden rounded-[22px] bg-white/72 p-4 text-[0.92rem] leading-7 text-[#5F6368] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
                        {descriptionPreview.text}
                      </p>
                    )}

                    <div className="relative z-10 mt-auto border-t border-[#E8F0FE]/70 pt-4">
                      <div className="mb-4 flex h-[34px] items-center gap-2 overflow-hidden">
                        {skills.length > 0 && (
                          <>
                          {visibleSkills.map(skill => (
                            <span key={skill} className="max-w-[46%] truncate rounded-full border border-[#D7E6FF]/70 bg-white/68 px-2.5 py-1.5 text-[0.74rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
                              {skill}
                            </span>
                          ))}
                          {extraSkillCount > 0 && (
                            <span className="rounded-full border border-[#D7E6FF]/70 bg-white/68 px-2.5 py-1.5 text-[0.74rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
                              +{extraSkillCount}
                            </span>
                          )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setViewingOpp(ngo) }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8AB4F8]/55 bg-[linear-gradient(135deg,rgba(26,115,232,0.94),rgba(26,115,232,0.78))] px-4 py-3 text-[0.88rem] font-semibold text-white shadow-[0_14px_30px_rgba(26,115,232,0.22),0_1px_0_rgba(255,255,255,0.32)_inset] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#1765CC]"
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
