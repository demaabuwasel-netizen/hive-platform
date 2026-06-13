import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { submitApplication, fetchStudentApplications } from '../services/applications'
import { fetchActiveOpportunities } from '../services/opportunities'
import { computeMatch } from '../services/matching'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, FileText, MessageCircle, ChevronRight, Bell,
  X, Send, Sparkles, RefreshCw, CheckCircle2, Clock,
  MapPin, Check, ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AvatarDisplay } from '../components/Avatar'
import GradientAvatar from '../components/GradientAvatar'
import img3 from '../assets/img3.png'

// ─── Data helpers ─────────────────────────────────────────────────────────────

const CARD_GRADIENTS = [
  'from-purple-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-yellow-400 to-amber-500',
  'from-teal-500 to-cyan-600',
]

function timeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 18) return 'Good afternoon'
  return 'Good evening'
}

function skillName(s) { return typeof s === 'string' ? s : (s?.name ?? '') }

function oppToMatchCard(opp, matchResult) {
  const hash = opp.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    id:            opp.id,
    opportunityId: opp.id,
    ngoId:         opp.ngoId,
    name:          opp.orgName,
    category:      opp.category  ?? '',
    location:      opp.location  ?? '',
    desc:          opp.description || opp.missionImpact || '',
    match:         matchResult.score,
    hours:         opp.weeklyHours ? `${opp.weeklyHours} hrs/wk` : 'Flexible',
    workMode:      opp.workMode   ?? 'Hybrid',
    skills:        (opp.skills ?? []).slice(0, 3).map(skillName).filter(Boolean),
    bannerGrad:    CARD_GRADIENTS[hash % CARD_GRADIENTS.length],
    avatars:       [opp.orgName, opp.category, opp.location].filter(Boolean),
    mission:       opp.missionImpact || opp.description || '',
  }
}

function generateAppMessage(profile, ngo) {
  const name  = profile?.name || 'I'
  const first = name.split(' ')[0]
  const field  = profile?.field || 'my field'
  const skills = Array.isArray(profile?.skills)
    ? profile.skills.slice(0, 2).map(skillName).join(' and ')
    : (profile?.skills?.split(',').slice(0, 2).join(' and ').trim() || 'relevant skills')

  return `Hi ${ngo.name} team,

My name is ${first} and I'm studying ${field}. I discovered your opportunity through Hive and I'd love to contribute to your mission.

${ngo.mission}

This resonates deeply with me. My experience in ${skills} means I can contribute meaningfully from day one. I'm especially drawn to the chance to create real impact — not just add a line to a CV, but actually help people through this work.

I'm available ${profile?.availability || 'flexibly'} and excited about the possibility of working together.

Looking forward to hearing from you,
${first}`
}

function generateChatIntro(ngo, profile) {
  const firstName = profile?.name?.split(' ')[0] || 'there'
  return `Hi ${firstName}! 👋 We came across your profile on Hive and were really impressed by what we saw. Your background looks like a strong fit for our team. Would you be open to a quick 20-minute intro call? We'd love to tell you more about the role and learn a bit about you.`
}

const BANNER_GRADS = ['#6366F1','#10B981','#EC4899','#F59E0B','#06B6D4','#8B5CF6','#FFB703','#14B8A6']
function seedHash(s) { return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0) }
function seedInitials(seed) { return (seed[0]?.toUpperCase() || '') + (seed.slice(1).match(/[A-Z]/)?.[0] || '') }

function NGOBanner({ grad, avatars, match }) {
  return (
    <div className={`bg-gradient-to-br ${grad} h-[100px] relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='35'%3E%3Cpath d='M10 2l9 5.2v10.4L10 23 1 17.6V7.2z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")` }}/>
      <div className="absolute bottom-3 left-3 flex -space-x-1.5">
        {avatars.map(seed => (
          <div key={seed} className="w-7 h-7 rounded-full border-2 border-white/70 flex items-center justify-center text-white text-[9px] font-bold select-none shrink-0"
            style={{ background: BANNER_GRADS[seedHash(seed) % BANNER_GRADS.length] }}>
            {seedInitials(seed)}
          </div>
        ))}
      </div>
      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur text-[#0D183D] text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm">
        {match}% Match
      </div>
    </div>
  )
}

// ─── Profile completion ───────────────────────────────────────────────────────

function computeCompletion(profile) {
  const items = [
    { key: 'field',      label: 'Field of study', done: !!profile?.field },
    { key: 'university', label: 'University',      done: !!profile?.university },
    { key: 'skills',     label: 'Skills (add 3+)', done: (profile?.skills?.length ?? 0) >= 3 },
    { key: 'interests',  label: 'Interests',       done: (profile?.interests?.length ?? 0) >= 1 },
    { key: 'bio',        label: 'Bio / About me',  done: !!profile?.bio },
    { key: 'experience', label: 'Experience',      done: !!profile?.experience },
  ]
  const done  = items.filter(i => i.done).length
  const pct   = Math.round((done / items.length) * 100)
  return { items, done, total: items.length, pct }
}

// (ProfileCompletionWidget removed — merged into ImpactWidget below)

// Left-column card shown when there are no matches yet
function NextActionCard({ completion, navigate }) {
  const missing = completion.items.filter(i => !i.done)
  const { pct }  = completion

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-2xl overflow-hidden border border-[rgba(13,24,61,0.08)] shadow-card">

      {/* Dark header with hex watermark */}
      <div className="relative overflow-hidden px-6 py-5" style={{ background: '#0D183D', minHeight: 100 }}>
        <svg aria-hidden="true" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.12 }}>
          <defs>
            <pattern id="next-hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
              <path d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z" fill="#FFB703"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#next-hex)"/>
        </svg>
        <div className="relative z-10">
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: '#FFB703' }}>
            ✦ Your hive is ready
          </p>
          <h3 className="text-[17px] font-extrabold text-white leading-snug mb-0.5">
            {pct < 50 ? "Let's find your first opportunity" : "You're almost there"}
          </h3>
          <p className="text-[12px] text-white/50">
            {missing.length > 0
              ? `${missing.length} more field${missing.length > 1 ? 's' : ''} will unlock stronger matches`
              : 'Your profile is ready — matches are loading'}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-4">

        {/* Missing fields as compact chips */}
        {missing.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">
              Complete {missing.length} more field{missing.length > 1 ? 's' : ''} to unlock stronger matches:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missing.map(item => (
                <span key={item.key}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: '#F8F9FB', color: '#0D183D', border: '1px solid rgba(13,24,61,0.10)' }}>
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: '#FFB703' }}/>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => navigate('/settings')}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#0D183D', boxShadow: '0 4px 14px rgba(13,24,61,0.18)' }}>
          Complete my profile →
        </button>

        <Link to="/opportunities"
          className="flex items-center justify-center gap-1 mt-2.5 text-[11px] text-[#4B6382] hover:text-[#0D183D] transition-colors">
          Or browse all open opportunities <ArrowRight size={11}/>
        </Link>
      </div>
    </motion.div>
  )
}

// Sidebar: unified Impact + Journey card — illustration kept, completion merged in
function ImpactWidget({ profile, appCount, interviewCount, matchCount, navigate }) {
  const { pct } = computeCompletion(profile)
  const isNew   = appCount === 0

  const microcopy = pct < 60
    ? 'Every profile improvement helps us find better opportunities.'
    : appCount === 0
    ? 'Your hive is ready. Send your first application.'
    : 'Every step you take helps someone grow.'

  const ctaLabel = pct < 100
    ? 'Complete my profile →'
    : isNew
    ? 'Find your first opportunity →'
    : 'See all your matches →'

  const ctaDest = pct < 100 ? '/settings' : isNew ? '/opportunities' : '/matches'

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.22, duration: 0.4 }}
      className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-card p-5 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-extrabold text-[#FFB703] uppercase tracking-widest">Your Impact</p>
        <span className="text-[10px] text-[#4B6382]">
          {isNew ? 'Start your journey' : 'Keep growing'}
        </span>
      </div>

      {/* Illustration — kept for Hive visual continuity */}
      <div className="rounded-xl overflow-hidden bg-honey-50 border border-honey-100">
        <img src={img3} alt="Students making an impact"
          className="w-full object-contain object-top" style={{ maxHeight: 100 }}
          draggable={false}/>
      </div>

      {/* Profile completion bar */}
      <div>
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-[#4B6382] font-semibold">Profile</span>
          <span className="font-extrabold" style={{ color: pct === 100 ? '#10B981' : '#FFB703' }}>{pct}%</span>
        </div>
        <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(13,24,61,0.07)' }}>
          <motion.div
            className="h-1.5 rounded-full"
            style={{ background: pct === 100 ? '#10B981' : '#FFB703' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}/>
        </div>
      </div>

      {/* 4-stat journey grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { value: matchCount,      label: 'Matches'      },
          { value: appCount,        label: 'Applications' },
          { value: interviewCount,  label: 'Interviews'   },
          { value: `${pct}%`,       label: 'Profile done' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-2.5 text-center"
            style={{ background: '#F8F9FB', border: '1px solid rgba(13,24,61,0.07)' }}>
            <p className="text-[18px] font-extrabold text-[#0D183D] leading-none">{s.value}</p>
            <p className="text-[9px] text-[#4B6382] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Contextual microcopy */}
      <p className="text-[10px] text-[#4B6382]/70 text-center leading-relaxed italic">
        {microcopy}
      </p>

      {/* CTA */}
      <button onClick={() => navigate(ctaDest)}
        className="btn-navy text-xs py-2.5 w-full">
        {ctaLabel}
      </button>
    </motion.div>
  )
}

// ─── Apply Modal ─────────────────────────────────────────────────────────────

function ApplyModal({ ngo, profile, studentId, onClose, onSuccess }) {
  const [step, setStep]          = useState('form')
  const [message, setMessage]    = useState(() => generateAppMessage(profile, ngo))
  const [links, setLinks]        = useState({ linkedin: '', github: '', portfolio: '' })
  const [availability, setAvail] = useState('')
  const [focusKey, setFocus]     = useState(null)
  const [generating, setGen]     = useState(false)

  const AVAIL_OPTIONS = ['Immediately', '1–5 hrs/week', '5–10 hrs/week', '10–15 hrs/week', '15–20 hrs/week', '20+ hrs/week']

  function regenerate() {
    setGen(true)
    setTimeout(() => { setMessage(generateAppMessage(profile, ngo)); setGen(false) }, 600)
  }

  async function submit() {
    try {
      await submitApplication({
        studentId:     profile?.id || studentId,
        opportunityId: ngo.opportunityId ?? null,
        ngoId:         ngo.ngoId ?? ngo.id,
        message,
        availability,
        links,
      })
    } catch (err) {
      console.error('Apply error:', err)
    }
    setStep('success')
    onSuccess?.()
  }

  const iStyle = k => ({
    background: 'white', color: '#0D183D',
    border: `1.5px solid ${focusKey === k ? '#FFB703' : 'rgba(13,24,61,0.1)'}`,
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,18,48,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }} transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 24px 80px rgba(10,18,48,0.25)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {step === 'success' ? (
          <div className="flex flex-col items-center text-center px-8 py-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle2 size={32} className="text-emerald-500"/>
            </motion.div>
            <h2 className="text-[1.3rem] font-extrabold text-[#0D183D] mb-2">Application sent!</h2>
            <p className="text-[13px] text-[#4B6382] mb-2">Your application to <strong>{ngo.name}</strong> is on its way.</p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"/>
              <span className="text-[12px] font-semibold" style={{ color: '#D99E00' }}>Status: Under Review</span>
            </div>
            <button onClick={onClose}
              className="px-8 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#0D183D' }}>
              Back to dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-5 pb-4 shrink-0"
              style={{ background: 'linear-gradient(160deg,#FFF7E6,#F0EEFF)', borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
              <button onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-black/[0.06]">
                <X size={14}/>
              </button>
              <div className="flex items-center gap-3">
                <GradientAvatar name={ngo.name} size={44} radius="0.75rem"/>
                <div>
                  <p className="text-[15px] font-extrabold text-[#0D183D]">Apply to {ngo.name}</p>
                  <p className="text-[12px] text-[#4B6382]">{ngo.category} · {ngo.location} · {ngo.match}% match</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: '#FFB703' }}>
                      <Sparkles size={11} className="text-white"/>
                    </div>
                    <p className="text-[12px] font-extrabold text-[#0D183D]">AI-generated application message</p>
                  </div>
                  <button onClick={regenerate}
                    className={`flex items-center gap-1 text-[11px] font-semibold transition-all ${generating ? 'opacity-50' : ''}`}
                    style={{ color: '#FFB703' }}>
                    <RefreshCw size={11} className={generating ? 'animate-spin' : ''}/>
                    Regenerate
                  </button>
                </div>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8}
                  onFocus={() => setFocus('msg')} onBlur={() => setFocus(null)}
                  className="w-full px-4 py-3 rounded-xl text-[12px] outline-none transition-all resize-none"
                  style={{ ...iStyle('msg'), lineHeight: 1.65 }}/>
                <p className="text-[10px] text-[#4B6382] mt-1.5">✏️ Feel free to edit before sending.</p>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[#0D183D] mb-2">Your availability</p>
                <div className="flex flex-wrap gap-2">
                  {AVAIL_OPTIONS.map(a => (
                    <button key={a} onClick={() => setAvail(a)}
                      className="px-3.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all"
                      style={availability === a
                        ? { background: '#0D183D', color: 'white', borderColor: '#0D183D' }
                        : { background: 'white', color: '#4B6382', borderColor: 'rgba(13,24,61,0.1)' }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[12px] font-semibold text-[#0D183D]">
                  Portfolio links <span className="text-[11px] font-normal text-[#4B6382]">(optional)</span>
                </p>
                {[
                  { key: 'linkedin',  placeholder: 'LinkedIn profile URL',    label: '🔗 LinkedIn'  },
                  { key: 'github',    placeholder: 'GitHub profile URL',      label: '💻 GitHub'    },
                  { key: 'portfolio', placeholder: 'Portfolio / website URL', label: '🌐 Portfolio' },
                ].map(({ key, placeholder, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-[#4B6382] w-20 shrink-0">{label}</span>
                    <input value={links[key]} onChange={e => setLinks(l => ({ ...l, [key]: e.target.value }))}
                      placeholder={placeholder}
                      onFocus={() => setFocus(key)} onBlur={() => setFocus(null)}
                      className="flex-1 px-3 py-2.5 rounded-xl text-[12px] outline-none transition-all placeholder-[#4B6382]/40"
                      style={iStyle(key)}/>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 px-6 py-4 border-t flex gap-3"
              style={{ borderColor: 'rgba(13,24,61,0.08)', background: '#FAFAFA' }}>
              <button onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-[13px] font-semibold border text-[#4B6382] hover:bg-[rgba(13,24,61,0.03)] transition-colors"
                style={{ borderColor: 'rgba(13,24,61,0.12)' }}>
                Cancel
              </button>
              <button onClick={submit}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#FFB703', boxShadow: '0 4px 16px rgba(255,183,3,0.3)', flex: 2 }}>
                <Send size={13}/> Submit application →
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Chat Modal ───────────────────────────────────────────────────────────────

function ChatModal({ ngo, profile, onClose }) {
  const introText = generateChatIntro(ngo, profile)
  const [messages, setMessages] = useState([
    { id: 1, from: 'them', text: introText, time: 'now' },
  ])
  const [input, setInput] = useState('')

  const SUGGESTIONS = [
    `Thanks for reaching out! I'd love to learn more about the ${ngo.category} role.`,
    'A 20-minute call sounds great — what time works for you?',
    'Could you share more details about day-to-day responsibilities?',
  ]

  function send(text = input) {
    const t = text.trim()
    if (!t) return
    setMessages(m => [...m, {
      id: Date.now(), from: 'me', text: t,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }])
    setInput('')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(10,18,48,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{ boxShadow: '0 24px 80px rgba(10,18,48,0.25)', height: 520 }}
        onClick={e => e.stopPropagation()}>

        <div className="px-5 py-4 flex items-center gap-3 shrink-0"
          style={{ background: 'linear-gradient(160deg,#FFF7E6,#F0EEFF)', borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
          <GradientAvatar name={ngo.name} size={38} radius="0.65rem"/>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#0D183D]">{ngo.name}</p>
            <p className="text-[11px] flex items-center gap-1 text-[#4B6382]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>Online
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-black/[0.06]">
            <X size={14}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.map(m => (
            <div key={m.id} className={`flex items-end gap-2 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
              {m.from === 'them' && <GradientAvatar name={ngo.name} size={26} radius="0.45rem"/>}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                m.from === 'me' ? 'rounded-br-sm text-white' : 'rounded-bl-sm text-[#0D183D]'
              }`} style={{ background: m.from === 'me' ? '#0D183D' : 'white', boxShadow: '0 1px 8px rgba(13,24,61,0.08)', whiteSpace: 'pre-line' }}>
                {m.text}
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] flex items-center gap-1.5">
                <Sparkles size={10} style={{ color: '#FFB703' }}/> Suggested replies
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="text-left px-4 py-2.5 rounded-xl text-[12px] font-medium border hover:shadow-sm transition-all"
                  style={{ background: 'white', color: '#4B6382', borderColor: 'rgba(13,24,61,0.09)' }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid rgba(13,24,61,0.08)' }}>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{ background: '#F8F9FB', border: '1.5px solid rgba(13,24,61,0.09)' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-[13px] text-[#0D183D] placeholder-[#4B6382]/50 outline-none"/>
            <button onClick={() => send()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 shrink-0"
              style={{ background: input.trim() ? '#FFB703' : 'rgba(13,24,61,0.15)' }}>
              <Send size={13}/>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user, profile } = useApp()
  const navigate  = useNavigate()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const avatarSrc = profile?.avatar || user?.avatar || null

  const [applyingTo, setApplyingTo]         = useState(null)
  const [chattingWith, setChattingWith]     = useState(null)
  const [topMatches, setTopMatches]         = useState([])
  const [matchCount, setMatchCount]         = useState(0)
  const [appCount, setAppCount]             = useState(0)
  const [interviewCount, setInterviewCount] = useState(0)
  const [loadingMatches, setLoadingMatches] = useState(true)

  const completion = computeCompletion(profile)

  useEffect(() => {
    if (!user?.id) return

    fetchActiveOpportunities()
      .then(opps => {
        const scored = opps
          .map(opp => ({ opp, result: computeMatch(profile, opp) }))
          .sort((a, b) => b.result.score - a.result.score)
        const good = scored.filter(({ result }) => result.score >= 45)
        setMatchCount(good.length)
        setTopMatches(good.slice(0, 3).map(({ opp, result }) => oppToMatchCard(opp, result)))
      })
      .catch(() => {})
      .finally(() => setLoadingMatches(false))

    fetchStudentApplications(user.id)
      .then(apps => {
        setAppCount(apps.length)
        setInterviewCount(apps.filter(a => a.status === 'interview').length)
      })
      .catch(() => {})
  }, [user?.id, profile])

  const STATS = [
    { icon: <Zap size={15} strokeWidth={2}/>,      label: 'Matches',      value: matchCount,      accent: '#D99E00'   },
    { icon: <FileText size={15} strokeWidth={2}/>,  label: 'Applications', value: appCount,        accent: '#6366F1'   },
    { icon: <MessageCircle size={15} strokeWidth={2}/>, label: 'Interviews', value: interviewCount, accent: '#10B981'  },
  ]

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="px-8 py-7 max-w-[1100px] mx-auto">

        {/* ── Greeting ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D183D] mb-1 flex items-center gap-2">
              {timeGreeting()}, {firstName}!
              <motion.span animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="text-xl select-none">🐝</motion.span>
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[#4B6382] text-sm">
                {completion.pct < 60
                  ? 'Complete your profile to unlock your first matches.'
                  : completion.pct < 100
                  ? 'Your hive is growing — a few more details will strengthen your matches.'
                  : 'Your hive is ready. Discover opportunities and make an impact.'}
              </p>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background: completion.pct === 100 ? 'rgba(16,185,129,0.10)' : 'rgba(255,183,3,0.12)',
                  color:      completion.pct === 100 ? '#059669' : '#B37D00',
                }}>
                {completion.pct}% complete
              </span>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="hidden md:flex items-center gap-3 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-card px-4 py-2.5 shrink-0">
            <AvatarDisplay src={avatarSrc} name={user?.name || ''} size="sm" className="rounded-xl"/>
            <div>
              <p className="text-sm font-bold text-[#0D183D] leading-tight">{user?.name || 'Student'}</p>
              <p className="text-[10px] text-[#4B6382]">Student · Hive</p>
            </div>
            <button className="text-[#4B6382] hover:text-[#0D183D] ml-1 transition-colors"><Bell size={14}/></button>
          </motion.div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-7 flex-wrap">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-card px-5 py-3 flex items-center gap-3 hover:shadow-soft transition-shadow cursor-default">
              <span style={{ color: s.accent }}>{s.icon}</span>
              <div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: s.accent }}>{s.value}</p>
                <p className="text-[11px] text-[#4B6382] mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main layout ── */}
        <div className="grid lg:grid-cols-[1fr_260px] gap-6">

          {/* ── Left: Matches ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-[#0D183D]">Top Matches for You</h2>
              {topMatches.length > 0 && (
                <Link to="/matches" className="text-xs text-[#FFB703] font-semibold flex items-center gap-0.5 hover:underline">
                  View All <ChevronRight size={12}/>
                </Link>
              )}
            </div>

            {loadingMatches ? (
              <div className="grid sm:grid-cols-3 gap-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="bg-white rounded-2xl shadow-card border border-[rgba(13,24,61,0.08)] overflow-hidden animate-pulse">
                    <div className="h-[100px] bg-[rgba(13,24,61,0.06)]"/>
                    <div className="p-4 flex flex-col gap-2.5">
                      <div className="h-3 w-3/4 rounded-full bg-[rgba(13,24,61,0.06)]"/>
                      <div className="h-2.5 w-1/2 rounded-full bg-[rgba(13,24,61,0.04)]"/>
                      <div className="h-8 w-full rounded-lg bg-[rgba(13,24,61,0.04)]"/>
                      <div className="h-7 w-full rounded-xl bg-[rgba(13,24,61,0.06)] mt-1"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : topMatches.length === 0 ? (
              <NextActionCard completion={completion} navigate={navigate}/>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {topMatches.map((ngo, i) => (
                  <motion.div key={ngo.id}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.1, duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-card border border-[rgba(13,24,61,0.08)] overflow-hidden flex flex-col hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">

                    <NGOBanner grad={ngo.bannerGrad} avatars={ngo.avatars} match={ngo.match}/>

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div>
                        <p className="font-extrabold text-[#0D183D] text-sm">{ngo.name}</p>
                        <p className="text-[10px] text-[#4B6382]">{ngo.category} · {ngo.location}</p>
                      </div>
                      <p className="text-[11px] text-[#4B6382] leading-relaxed line-clamp-2 flex-1">{ngo.desc}</p>

                      <div className="flex items-center gap-2 text-[10px] text-[#4B6382] mt-0.5">
                        <span className="flex items-center gap-1"><Clock size={9}/>{ngo.hours}</span>
                        <span className="flex items-center gap-1"><MapPin size={9}/>{ngo.workMode}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {ngo.skills.map(s => (
                          <span key={s} className="bg-[#FFF7E6] text-[#4B6382] text-[9px] font-semibold px-2 py-0.5 rounded-full border border-[rgba(13,24,61,0.08)]">{s}</span>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-1">
                        <button onClick={() => setApplyingTo(ngo)}
                          className="flex-1 py-2 rounded-xl text-[11px] font-semibold text-white text-center transition-all hover:opacity-90"
                          style={{ background: '#FFB703' }}>
                          Apply now →
                        </button>
                        <button onClick={() => setChattingWith(ngo)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] hover:text-[#0D183D] transition-colors shrink-0">
                          <MessageCircle size={13}/>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Sidebar ── */}
          <div>
            <ImpactWidget
              profile={profile}
              appCount={appCount}
              interviewCount={interviewCount}
              matchCount={matchCount}
              navigate={navigate}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {applyingTo && (
          <ApplyModal key="apply" ngo={applyingTo} profile={profile || user}
            studentId={user?.id} onClose={() => setApplyingTo(null)}
            onSuccess={() => setAppCount(n => n + 1)}/>
        )}
        {chattingWith && (
          <ChatModal key="chat" ngo={chattingWith} profile={profile || user}
            onClose={() => setChattingWith(null)}/>
        )}
      </AnimatePresence>
    </main>
  )
}
