import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { submitApplication } from '../services/applications'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, Users, BarChart2, Search,
  MapPin, Bookmark as BookmarkIcon, Plus, Send, Sparkles, RefreshCw,
  X, CheckCircle2, Clock, ChevronRight, Check, TrendingUp,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchActiveOpportunities, fetchNgoOpportunities } from '../services/opportunities'
import { fetchSavedIds, saveOpportunity, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'
import img3 from '../assets/img3.png'

const CATEGORIES = ['All','Technology','Education','Environment','Healthcare','Youth Services','Accessibility']

// ─── Honeycomb watermark ──────────────────────────────────────────────────────

function HexBg({ opacity = 0.13 }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      <defs>
        <pattern id="opp-hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <path d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z"
            fill="#FFB703"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#opp-hex)"/>
    </svg>
  )
}

// ─── NGO empty-state onboarding ───────────────────────────────────────────────

function NGOOnboardingEmptyState({ navigate }) {
  const CHECKLIST = [
    { done: true,  current: false, label: 'Organization profile completed' },
    { done: false, current: true,  label: 'Create first opportunity'       },
    { done: false, current: false, label: 'Receive first application'      },
    { done: false, current: false, label: 'Schedule first interview'       },
    { done: false, current: false, label: 'Welcome your first student'     },
  ]

  const STATS = [
    { value: '4×',     label: 'More profile visits',  Icon: TrendingUp },
    { value: 'More',   label: 'Student matches',      Icon: Users      },
    { value: 'Faster', label: 'Student onboarding',   Icon: Zap        },
  ]

  return (
    <div className="grid lg:grid-cols-[1fr_268px] gap-5">

      {/* ── Main onboarding card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden border border-[rgba(13,24,61,0.08)]"
        style={{ boxShadow: '0 2px 16px rgba(13,24,61,0.07)' }}>

        {/* Dark header with honeycomb pattern */}
        <div className="relative overflow-hidden px-7 py-7" style={{ background: '#0D183D', minHeight: 152 }}>
          <HexBg />
          {/* Decorative hex cluster */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.18 }}>
            <svg width="96" height="108" viewBox="0 0 96 108" fill="none">
              <polygon points="48,6 84,27 84,69 48,90 12,69 12,27" stroke="#FFB703" strokeWidth="1.5"/>
              <polygon points="48,20 74,35 74,65 48,80 22,65 22,35" fill="#FFB703" fillOpacity="0.25" stroke="#FFB703" strokeWidth="1"/>
              <polygon points="48,33 63,42 63,60 48,69 33,60 33,42" fill="#FFB703" fillOpacity="0.5"/>
            </svg>
          </div>
          <div className="relative z-10 max-w-md">
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: '#FFB703' }}>
              ✦ Your hive is ready
            </p>
            <h2 className="text-[1.22rem] font-extrabold text-white leading-snug mb-2">
              Your organization is ready to create its first opportunity
            </h2>
            <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Posting an opportunity is the first step to connecting with talented students who can support your mission.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-7 py-6">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-4">
            Before receiving applicants:
          </p>

          <div className="flex flex-col gap-2 mb-6">
            {CHECKLIST.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={step.current
                  ? { border: '2px solid #FFB703', background: 'rgba(255,183,3,0.05)' }
                  : { border: '1px solid rgba(13,24,61,0.08)', background: step.done ? 'transparent' : '#FAFAFA' }}>

                {/* Indicator */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  step.done
                    ? 'bg-emerald-500'
                    : step.current
                    ? 'border-2 border-[#FFB703]'
                    : 'border border-[rgba(13,24,61,0.18)]'
                }`}>
                  {step.done    && <Check size={10} strokeWidth={3} className="text-white"/>}
                  {step.current && <div className="w-2 h-2 rounded-full" style={{ background: '#FFB703' }}/>}
                </div>

                <span className={`text-[12px] font-semibold leading-snug flex-1 ${
                  step.done ? 'text-[#4B6382] line-through' : step.current ? 'text-[#0D183D]' : 'text-[#4B6382]'
                }`}>
                  {step.label}
                </span>

                {step.current && (
                  <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full text-[#0D183D]"
                    style={{ background: '#FFB703' }}>
                    Next
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <button onClick={() => navigate('/opportunities/new')}
              className="w-full py-3 rounded-xl text-[13px] font-semibold text-[#0D183D] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#FFB703', boxShadow: '0 4px 14px rgba(255,183,3,0.28)' }}>
              Post your first opportunity →
            </button>
            <button onClick={() => navigate('/how-it-works')}
              className="w-full py-2.5 rounded-xl text-[12px] font-semibold border text-[#4B6382] hover:bg-[rgba(13,24,61,0.03)] transition-colors"
              style={{ borderColor: 'rgba(13,24,61,0.12)' }}>
              Learn how Hive works
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats sidebar ── */}
      <aside className="flex flex-col gap-4">

        {/* Impact stats — dark card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: '#0D183D' }}>

          <div>
            <p className="text-[10px] font-extrabold text-[#FFB703] uppercase tracking-widest mb-1">
              Hive Impact
            </p>
            <p className="text-[12px] leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Organizations with opportunities receive:
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {STATS.map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.08 }}
                className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,183,3,0.15)' }}>
                  <stat.Icon size={15} style={{ color: '#FFB703' }}/>
                </div>
                <div>
                  <p className="text-[17px] font-extrabold text-white leading-none">{stat.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl p-3.5"
            style={{ background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.15)' }}>
            <p className="text-[11px] leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
              "Our first opportunity brought in 12 applications within a week."
            </p>
            <p className="text-[10px] font-semibold mt-1.5" style={{ color: '#FFB703' }}>
              — Hive NGO partner
            </p>
          </div>
        </motion.div>

        {/* Quick tips — light card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.32, duration: 0.35 }}
          className="bg-white rounded-2xl p-5 border flex flex-col gap-3"
          style={{ borderColor: 'rgba(13,24,61,0.08)' }}>

          <p className="text-[10px] font-extrabold text-[#0D183D] uppercase tracking-widest">
            Writing tips
          </p>
          {[
            'Be specific about the skills you need',
            'Clearly state weekly time commitment',
            'Describe the impact students will create',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-[11px] text-[#4B6382] leading-snug">
              <span className="mt-[4px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#FFB703' }}/>
              {tip}
            </div>
          ))}
        </motion.div>
      </aside>
    </div>
  )
}

// ─── Student profile completion ───────────────────────────────────────────────

function computeStudentCompletion(profile) {
  const items = [
    { key: 'field',     done: !!profile?.field                              },
    { key: 'skills',    done: (profile?.skills?.length    ?? 0) >= 3        },
    { key: 'interests', done: (profile?.interests?.length ?? 0) >= 1        },
    { key: 'bio',       done: !!profile?.bio                                },
  ]
  const done = items.filter(i => i.done).length
  return { done, total: items.length, pct: Math.round((done / items.length) * 100) }
}

// ─── Student opportunities empty state ────────────────────────────────────────

function StudentOpportunitiesEmptyState({ profile, navigate }) {
  const { pct } = computeStudentCompletion(profile)

  const HOW_STEPS = [
    {
      Icon: Check,
      title: 'Complete your profile',
      desc: 'Add your field, university, and experience so NGOs know who you are.',
    },
    {
      Icon: Sparkles,
      title: 'Add skills & interests',
      desc: 'The more specific you are, the better our AI can match you with the right cause.',
    },
    {
      Icon: Zap,
      title: 'Get matched with NGOs',
      desc: "Hive surfaces opportunities that fit your background and goals — not just any listing.",
    },
  ]

  return (
    <div className="flex flex-col gap-5">

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden border border-[rgba(13,24,61,0.08)]"
        style={{ boxShadow: '0 2px 16px rgba(13,24,61,0.07)' }}>

        {/* Dark header with honeycomb */}
        <div className="relative overflow-hidden px-8 py-8" style={{ background: '#0D183D', minHeight: 152 }}>
          <HexBg opacity={0.14}/>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.18 }}>
            <svg width="96" height="108" viewBox="0 0 96 108" fill="none">
              <polygon points="48,6 84,27 84,69 48,90 12,69 12,27" stroke="#FFB703" strokeWidth="1.5"/>
              <polygon points="48,20 74,35 74,65 48,80 22,65 22,35" fill="#FFB703" fillOpacity="0.25" stroke="#FFB703" strokeWidth="1"/>
              <polygon points="48,33 63,42 63,60 48,69 33,60 33,42" fill="#FFB703" fillOpacity="0.5"/>
            </svg>
          </div>
          <div className="relative z-10 max-w-xl">
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: '#FFB703' }}>
              ✦ Hive is matching for you
            </p>
            <h2 className="text-[1.35rem] font-extrabold text-white leading-snug mb-2">
              No opportunities yet
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              We're preparing opportunities that match your profile and interests.
            </p>
          </div>
        </div>

        {/* White body */}
        <div className="bg-white px-8 py-6 flex items-start gap-8">
          <div className="flex-1">
            {pct < 100 && (
              <div className="mb-5">
                <div className="flex justify-between text-[12px] mb-2">
                  <span className="font-semibold text-[#0D183D]">Profile completion</span>
                  <span className="font-extrabold" style={{ color: '#FFB703' }}>{pct}%</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(13,24,61,0.07)' }}>
                  <motion.div className="h-1.5 rounded-full" style={{ background: '#FFB703' }}
                    initial={{ width: 0 }} animate={{ width: `${pct || 4}%` }}
                    transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}/>
                </div>
                <p className="text-[11px] text-[#4B6382] mt-2 leading-relaxed">
                  A complete profile helps Hive surface better matches for you.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => navigate('/settings')}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-[#0D183D] transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#FFB703', boxShadow: '0 4px 14px rgba(255,183,3,0.28)' }}>
                Complete my profile →
              </button>
              <button onClick={() => navigate('/profile/student/edit')}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold border text-[#4B6382] hover:bg-[rgba(13,24,61,0.03)] transition-colors"
                style={{ borderColor: 'rgba(13,24,61,0.12)' }}>
                Update my skills
              </button>
            </div>
          </div>

          {/* Illustration */}
          <div className="hidden sm:block shrink-0 rounded-xl overflow-hidden border"
            style={{ width: 118, background: 'rgba(255,183,3,0.05)', borderColor: 'rgba(255,183,3,0.14)' }}>
            <img src={img3} alt="" className="w-full object-contain object-top"
              style={{ maxHeight: 110 }} draggable={false}/>
          </div>
        </div>
      </motion.div>

      {/* How matching works */}
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-3">
          How matching works
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {HOW_STEPS.map((step, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.09 }}
              className="bg-white rounded-2xl p-5 border border-[rgba(13,24,61,0.08)] flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,183,3,0.1)' }}>
                <step.Icon size={15} style={{ color: '#FFB703' }}/>
              </div>
              <p className="text-[12px] font-extrabold text-[#0D183D]">{step.title}</p>
              <p className="text-[11px] text-[#4B6382] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Filter empty state (search / category with no results) ───────────────────

function FilterEmptyState({ onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] flex flex-col items-center text-center px-8 py-14">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(13,24,61,0.05)' }}>
        <Search size={20} className="text-[#4B6382] opacity-60"/>
      </div>
      <p className="text-[14px] font-bold text-[#0D183D] mb-1.5">No matches for this filter</p>
      <p className="text-[12px] text-[#4B6382] mb-5 max-w-xs leading-relaxed">
        Try a different category or clear your search to see all available opportunities.
      </p>
      <button onClick={onClear}
        className="px-6 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
        style={{ background: '#0D183D' }}>
        Clear filters
      </button>
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

// ─── Apply Modal ──────────────────────────────────────────────────────────────

function ApplyModal({ ngo, user, studentId, onClose }) {
  const [step, setStep]     = useState('form')
  const [message, setMsg]   = useState(() => generateAppMessage(user, ngo))
  const [links, setLinks]   = useState({ linkedin:'', github:'', portfolio:'' })
  const [avail, setAvail]   = useState('')
  const [gen, setGen]       = useState(false)
  const [focusKey, setFocus] = useState(null)

  const AVAIL_OPTIONS = ['Immediately','1–5 hrs/week','5–10 hrs/week','10–15 hrs/week','15–20 hrs/week','20+ hrs/week']

  function regen() {
    setGen(true)
    setTimeout(() => { setMsg(generateAppMessage(user, ngo)); setGen(false) }, 600)
  }

  async function submit() {
    try {
      await submitApplication({
        studentId:     studentId,
        opportunityId: ngo.opportunityId ?? null,
        ngoId:         ngo.ngoId ?? String(ngo.id),
        message,
        availability:  avail,
        links,
      })
    } catch (err) {
      console.error('Apply error:', err)
    }
    setStep('success')
  }

  const iStyle = k => ({ background:'white', color:'#0D183D', border:`1.5px solid ${focusKey===k?'#FFB703':'rgba(13,24,61,0.1)'}` })

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
              style={{ background:'rgba(255,183,3,0.08)', border:'1px solid rgba(255,183,3,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"/>
              <span className="text-[12px] font-semibold" style={{ color:'#D99E00' }}>Status: Under Review</span>
            </div>
            <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[13px] font-semibold text-white hover:opacity-90"
              style={{ background:'#0D183D' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-5 pb-4 shrink-0"
              style={{ background:'linear-gradient(160deg,#FFF7E6,#F0EEFF)', borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
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
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background:'#FFB703' }}>
                      <Sparkles size={11} className="text-white"/>
                    </div>
                    <p className="text-[12px] font-extrabold text-[#0D183D]">AI-generated message</p>
                  </div>
                  <button onClick={regen} className={`flex items-center gap-1 text-[11px] font-semibold ${gen?'opacity-50':''}`} style={{ color:'#FFB703' }}>
                    <RefreshCw size={11} className={gen?'animate-spin':''}/> Regenerate
                  </button>
                </div>
                <textarea value={message} onChange={e => setMsg(e.target.value)} rows={7}
                  onFocus={()=>setFocus('msg')} onBlur={()=>setFocus(null)}
                  className="w-full px-4 py-3 rounded-xl text-[12px] outline-none resize-none"
                  style={{ ...iStyle('msg'), lineHeight:1.65 }}/>
                <p className="text-[10px] text-[#4B6382] mt-1">✏️ Edit freely before sending.</p>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[#0D183D] mb-2">Availability</p>
                <div className="flex flex-wrap gap-2">
                  {AVAIL_OPTIONS.map(a => (
                    <button key={a} onClick={() => setAvail(a)}
                      className="px-3.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all"
                      style={avail===a?{background:'#0D183D',color:'white',borderColor:'#0D183D'}:{background:'white',color:'#4B6382',borderColor:'rgba(13,24,61,0.1)'}}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="text-[12px] font-semibold text-[#0D183D]">Links <span className="text-[11px] font-normal text-[#4B6382]">(optional)</span></p>
                {[{k:'linkedin',lbl:'LinkedIn'},{k:'github',lbl:'GitHub'},{k:'portfolio',lbl:'Portfolio'}].map(({k,lbl}) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="text-[11px] text-[#4B6382] w-16 shrink-0">{lbl}</span>
                    <input value={links[k]} onChange={e=>setLinks(l=>({...l,[k]:e.target.value}))}
                      placeholder={`${lbl} URL`}
                      onFocus={()=>setFocus(k)} onBlur={()=>setFocus(null)}
                      className="flex-1 px-3 py-2.5 rounded-xl text-[12px] outline-none placeholder-[#4B6382]/40"
                      style={iStyle(k)}/>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 px-6 py-4 border-t flex gap-3"
              style={{ borderColor:'rgba(13,24,61,0.08)', background:'#FAFAFA' }}>
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-[13px] font-semibold border text-[#4B6382] hover:bg-[rgba(13,24,61,0.03)] transition-colors" style={{ borderColor:'rgba(13,24,61,0.12)' }}>Cancel</button>
              <button onClick={submit} className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background:'#FFB703', boxShadow:'0 4px 16px rgba(255,183,3,0.3)', flex:2 }}>
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

export default function Opportunities() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const isNGO = user?.role === 'ngo'

  const [q, setQ]           = useState('')
  const [cat, setCat]       = useState('All')
  const [opps, setOpps]     = useState([])
  const [ngoOpps, setNgoOpps]   = useState([])
  const [ngoError, setNgoError] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [toggling, setToggling] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [applyingTo, setApplyingTo] = useState(null)

  // Fetch NGO's own opportunities
  useEffect(() => {
    if (!isNGO || !user?.id) return
    setLoading(true)
    setNgoError(null)
    fetchNgoOpportunities(user.id)
      .then(data => setNgoOpps(data ?? []))
      .catch(err => {
        console.error('[Opportunities] fetchNgoOpportunities error:', err.message)
        setNgoError(err.message)
      })
      .finally(() => setLoading(false))
  }, [isNGO, user?.id])

  // Fetch active opportunities for students
  useEffect(() => {
    if (isNGO) return
    setLoading(true)
    Promise.all([
      fetchActiveOpportunities(),
      user?.id ? fetchSavedIds(user.id) : Promise.resolve(new Set()),
    ]).then(([raw, ids]) => {
      const cards = raw.map(opp => ({
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
      setSavedIds(ids)
    }).catch(() => {}).finally(() => setLoading(false))
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

  const filtered = opps.filter(n =>
    (cat === 'All' || n.cat === cat) &&
    (n.name.toLowerCase().includes(q.toLowerCase()) || n.desc.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <>
      <div className="max-w-5xl mx-auto px-8 py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">
              {isNGO ? 'Your Opportunities' : 'Browse Opportunities'}
            </h1>
            <p className="text-[13px] text-[#4B6382] mt-0.5">
              {isNGO ? 'Manage your posted opportunities and track applicants' : 'Discover NGOs looking for your skills'}
            </p>
          </div>
          {isNGO && (
            <button onClick={() => navigate('/opportunities/new')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background:'#FFB703', boxShadow:'0 4px 14px rgba(255,183,3,0.28)' }}>
              <Plus size={14}/> Post opportunity
            </button>
          )}
        </div>

        {isNGO ? (
          /* NGO view — real data from Supabase */
          loading ? (
            <div className="flex flex-col gap-3">
              {[0,1,2].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-6 py-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/3 rounded-full bg-[rgba(13,24,61,0.07)]"/>
                      <div className="h-2.5 w-1/4 rounded-full bg-[rgba(13,24,61,0.05)]"/>
                    </div>
                    <div className="h-8 w-24 rounded-xl bg-[rgba(13,24,61,0.05)]"/>
                  </div>
                </div>
              ))}
            </div>
          ) : ngoError ? (
            <div className="text-center py-16">
              <p className="text-[14px] font-semibold text-[#0D183D] mb-1">Could not load opportunities</p>
              <p className="text-[12px] text-[#EF4444] mb-4 max-w-sm mx-auto">{ngoError}</p>
              <button onClick={() => { setNgoError(null); setLoading(true); fetchNgoOpportunities(user.id).then(d => setNgoOpps(d ?? [])).catch(e => setNgoError(e.message)).finally(() => setLoading(false)) }}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: '#0D183D' }}>Retry</button>
            </div>
          ) : ngoOpps.length === 0 ? (
            <NGOOnboardingEmptyState navigate={navigate} />
          ) : (
            <div className="flex flex-col gap-3">
              {ngoOpps.map((opp, i) => (
                <motion.div key={opp.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.05, duration:0.28 }}
                  className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-6 py-4 flex items-center gap-5 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-bold text-[14px] text-[#0D183D] truncate">{opp.title}</p>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        opp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        opp.status === 'draft'  ? 'bg-[#F8F9FB] text-[#4B6382] border border-[rgba(13,24,61,0.1)]' :
                        opp.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                        'bg-[#F8F9FB] text-[#4B6382]'
                      }`}>{opp.status ?? 'draft'}</span>
                    </div>
                    <p className="text-[12px] text-[#4B6382]">
                      {opp.category ? `${opp.category} · ` : ''}
                      {opp.location ? `${opp.location} · ` : ''}
                      {opp.applicantCount ?? 0} applicant{(opp.applicantCount ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/opportunities/new?edit=${opp.id}`)}
                      className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.1)] hover:bg-[#F8F9FB] transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() => navigate('/applicants')}
                      className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                      style={{ background:'#0D183D' }}>
                      Applicants
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* Student view */
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-2xl bg-white border border-[rgba(13,24,61,0.08)]">
                <Search size={14} className="text-[#4B6382] shrink-0"/>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search NGOs by name or skill…"
                  className="flex-1 bg-transparent text-[13px] text-[#0D183D] outline-none placeholder-[#4B6382]/50"/>
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                      cat===c ? 'text-white' : 'text-[#4B6382] bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB]'
                    }`}
                    style={cat===c ? { background:'#0D183D' } : {}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(13,24,61,0.06)]"/>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-2/3 rounded-full bg-[rgba(13,24,61,0.06)]"/>
                        <div className="h-2.5 w-1/2 rounded-full bg-[rgba(13,24,61,0.04)]"/>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="h-2.5 w-full rounded-full bg-[rgba(13,24,61,0.04)]"/>
                      <div className="h-2.5 w-4/5 rounded-full bg-[rgba(13,24,61,0.04)]"/>
                    </div>
                    <div className="h-8 rounded-xl bg-[rgba(13,24,61,0.04)]"/>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              (q === '' && cat === 'All')
                ? <StudentOpportunitiesEmptyState profile={profile} navigate={navigate}/>
                : <FilterEmptyState onClear={() => { setQ(''); setCat('All') }}/>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((ngo, i) => (
                  <motion.div key={ngo.id}
                    initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.05, duration:0.3 }}
                    className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 flex flex-col gap-3 hover:shadow-[0_4px_24px_rgba(13,24,61,0.08)] hover:-translate-y-0.5 transition-all duration-200">

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <GradientAvatar name={ngo.name} size={40} radius="0.65rem"/>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[#0D183D] leading-snug truncate">{ngo.name}</p>
                          <p className="text-[11px] text-[#4B6382]">{ngo.cat}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSave(ngo)}
                        disabled={toggling === ngo.id}
                        className="p-1.5 rounded-lg hover:bg-[#F8F9FB] transition-colors shrink-0 disabled:opacity-40"
                        aria-label={savedIds.has(ngo.id) ? 'Unsave' : 'Save'}>
                        <BookmarkIcon size={14} className={
                          savedIds.has(ngo.id) ? 'fill-[#FFB703] text-[#FFB703]' : 'text-[#4B6382]'
                        }/>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {ngo.match !== null && (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          {ngo.match}% match
                        </span>
                      )}
                      {ngo.loc && <span className="text-[11px] text-[#4B6382] flex items-center gap-1"><MapPin size={10}/>{ngo.loc}</span>}
                      {ngo.hours && <span className="text-[11px] text-[#4B6382] flex items-center gap-1"><Clock size={10}/>{ngo.hours}</span>}
                    </div>

                    <p className="text-[12px] text-[#4B6382] leading-relaxed flex-1 line-clamp-3">{ngo.desc}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {ngo.skills.map(s => (
                        <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[rgba(13,24,61,0.08)]"
                          style={{ background:'#F8F9FB', color:'#4B6382' }}>{s}</span>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setApplyingTo(ngo)}
                        className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-white text-center transition-all hover:opacity-90"
                        style={{ background:'#FFB703' }}>
                        Apply now →
                      </button>
                      <button onClick={() => navigate('/matches')}
                        className="px-3 py-2 rounded-xl border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] transition-colors">
                        <ChevronRight size={14}/>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

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
