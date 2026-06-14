import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Users, Zap, ChevronRight, ExternalLink,
  X, MapPin, GraduationCap, Star, Mail, Sparkles,
  CheckCircle2, Clock, RefreshCw, Send, ArrowLeft, Check, Bell,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchNgoApplicants } from '../services/applications'
import { fetchNgoOpportunities } from '../services/opportunities'
import CategorizedSkillTags from '../components/CategorizedSkillTags'
import { AvatarDisplay } from '../components/Avatar'
import img3 from '../assets/img3.png'

// ─── Gradient avatar ──────────────────────────────────────────────────────────

const GRADIENTS = [
  ['#6366F1','#8B5CF6'], ['#FFB703','#F97316'], ['#06B6D4','#3B82F6'],
  ['#10B981','#059669'], ['#EC4899','#F43F5E'], ['#8B5CF6','#A855F7'],
  ['#F59E0B','#EF4444'], ['#14B8A6','#06B6D4'],
]
function nameHash(str) { return str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) }
function getInitials(name) {
  return name.trim().split(/\s+/).filter(w => /^[\p{L}]/u.test(w))
    .map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
function GradientAvatar({ name, size = 48, radius = '0.75rem', className = '' }) {
  const [c1, c2] = GRADIENTS[nameHash(name) % GRADIENTS.length]
  return (
    <div aria-hidden="true"
      className={`flex items-center justify-center shrink-0 select-none font-bold text-white ${className}`}
      style={{ width: size, height: size, borderRadius: radius,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        fontSize: Math.round(size * 0.34), letterSpacing: '0.03em',
        boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }}>
      {getInitials(name)}
    </div>
  )
}

// ─── NGO profile completion ───────────────────────────────────────────────────

function computeNgoCompletion(profile) {
  const items = [
    { key: 'description', label: 'Organization description', done: !!profile?.description },
    { key: 'helpNeeded',  label: 'Skills / help needed',     done: !!profile?.helpNeeded  },
    { key: 'location',    label: 'Location',                 done: !!profile?.location    },
    { key: 'tags',        label: 'Category tags (add 1+)',   done: (profile?.tags?.length ?? 0) >= 1 },
    { key: 'web',         label: 'Website or social link',   done: !!(profile?.website || profile?.instagram || profile?.twitter) },
    { key: 'imageUrl',    label: 'Organization logo',        done: !!profile?.imageUrl    },
  ]
  const done = items.filter(i => i.done).length
  const pct  = Math.round((done / items.length) * 100)
  return { items, done, total: items.length, pct }
}

// ─── Hex watermark ────────────────────────────────────────────────────────────

function HexBg({ opacity = 0.12 }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      <defs>
        <pattern id="ngo-hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <path d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z"
            fill="#FFB703"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ngo-hex)"/>
    </svg>
  )
}

// ─── Org Readiness card (dark, replaces empty AI Questions slot) ──────────────

function OrgReadinessCard({ completion, navigate }) {
  const { items, pct } = completion
  const incomplete = items.filter(i => !i.done)

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: '#0D183D' }}>

      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-white uppercase tracking-widest">Org Profile</p>
        <span className="text-sm font-extrabold" style={{ color: pct === 100 ? '#10B981' : '#FFB703' }}>
          {pct}%
        </span>
      </div>

      <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.12)' }}>
        <motion.div className="h-1.5 rounded-full"
          style={{ background: pct === 100 ? '#10B981' : '#FFB703' }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ delay: 0.45, duration: 0.9, ease: 'easeOut' }}/>
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map(item => (
          <div key={item.key} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
              item.done ? 'bg-emerald-500' : 'border border-white/20'
            }`}>
              {item.done && <Check size={8} strokeWidth={3} className="text-white"/>}
            </div>
            <span className={`text-[10px] leading-tight ${
              item.done ? 'text-white/35 line-through' : 'text-white/65'
            }`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {incomplete.length > 0 ? (
        <button onClick={() => navigate('/settings')}
          className="w-full py-2 rounded-xl text-[11px] font-semibold text-[#0D183D] transition-all hover:opacity-90"
          style={{ background: '#FFB703' }}>
          Complete profile →
        </button>
      ) : (
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
          <Check size={10} strokeWidth={2.5}/> Profile complete!
        </div>
      )}
    </motion.div>
  )
}

// ─── Community Impact sidebar card ───────────────────────────────────────────

function CommunityImpactWidget({ profile, oppCount, applicants, navigate }) {
  const { pct }        = computeNgoCompletion(profile)
  const pendingCount   = applicants.filter(a => a.status === 'submitted').length
  const isNew          = oppCount === 0

  const microcopy = pct < 60
    ? 'Organizations with complete profiles receive more applications.'
    : isNew
    ? 'Your first opportunity can unlock meaningful impact.'
    : 'Every application is a student who wants to grow with you.'

  const ctaLabel = pct < 100 ? 'Complete organization profile →'
    : isNew ? 'Post your first opportunity →'
    : 'Review applicants →'
  const ctaDest  = pct < 100 ? '/settings' : isNew ? '/opportunities/new' : '/applicants'

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.28, duration: 0.35 }}
      className="bg-white rounded-2xl p-5 flex flex-col gap-3 border"
      style={{ borderColor: 'rgba(13,24,61,0.08)' }}>

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-extrabold text-[#FFB703] uppercase tracking-widest">Community Impact</p>
        <span className="text-[10px] text-[#4B6382]">
          {isNew ? 'Getting started' : 'Your journey'}
        </span>
      </div>

      {/* Illustration — visual continuity with landing page */}
      <div className="rounded-xl overflow-hidden border"
        style={{ background: 'rgba(255,183,3,0.05)', borderColor: 'rgba(255,183,3,0.15)' }}>
        <img src={img3} alt="Community impact"
          className="w-full object-contain object-top"
          style={{ maxHeight: 96 }} draggable={false}/>
      </div>

      {/* Profile completion bar */}
      <div>
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-[#4B6382] font-semibold">Org profile</span>
          <span className="font-extrabold" style={{ color: pct === 100 ? '#10B981' : '#FFB703' }}>{pct}%</span>
        </div>
        <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(13,24,61,0.07)' }}>
          <motion.div className="h-1.5 rounded-full"
            style={{ background: pct === 100 ? '#10B981' : '#FFB703' }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}/>
        </div>
      </div>

      {/* 4-stat journey grid — all real data */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { value: oppCount,            label: 'Opportunities' },
          { value: applicants.length,   label: 'Applicants'    },
          { value: pendingCount,        label: 'Pending review' },
          { value: `${pct}%`,           label: 'Profile done'  },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-2.5 text-center"
            style={{ background: '#F8F9FB', border: '1px solid rgba(13,24,61,0.07)' }}>
            <p className="text-[18px] font-extrabold text-[#0D183D] leading-none">{s.value}</p>
            <p className="text-[9px] text-[#4B6382] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#4B6382]/70 text-center leading-relaxed italic">
        {microcopy}
      </p>

      <button onClick={() => navigate(ctaDest)}
        className="btn-navy text-xs py-2.5 w-full">
        {ctaLabel}
      </button>
    </motion.div>
  )
}

// ─── Unified sidebar card (new NGOs — merges profile + impact into one) ──────

function UnifiedProgressCard({ completion, navigate }) {
  const { pct } = completion

  const MILESTONES = [
    { label: 'Complete organization profile', done: pct === 100,  },
    { label: 'Post your first opportunity',   done: false         },
    { label: 'Receive your first applicant',  done: false         },
    { label: 'Welcome your first student',    done: false         },
  ]

  const completedCount = MILESTONES.filter(m => m.done).length
  const progressPct    = Math.round((completedCount / MILESTONES.length) * 100)
  const ctaDest        = pct < 100 ? '/settings' : '/opportunities/new'
  const ctaLabel       = pct < 100 ? 'Complete your profile →' : 'Post your first opportunity →'

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="bg-white rounded-2xl p-5 flex flex-col gap-3.5 border"
      style={{ borderColor: 'rgba(13,24,61,0.08)' }}>

      {/* Illustration */}
      <div className="rounded-xl overflow-hidden border"
        style={{ background: 'rgba(255,183,3,0.05)', borderColor: 'rgba(255,183,3,0.14)' }}>
        <img src={img3} alt="Community impact"
          className="w-full object-contain object-top"
          style={{ maxHeight: 80 }} draggable={false}/>
      </div>

      {/* Label + progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0D183D]">Your journey</p>
          <span className="text-[10px] font-extrabold" style={{ color: progressPct === 100 ? '#10B981' : '#FFB703' }}>
            {completedCount}/{MILESTONES.length}
          </span>
        </div>
        <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(13,24,61,0.07)' }}>
          <motion.div className="h-1.5 rounded-full"
            style={{ background: progressPct === 100 ? '#10B981' : '#FFB703' }}
            initial={{ width: 0 }} animate={{ width: `${progressPct || 8}%` }}
            transition={{ delay: 0.45, duration: 0.9, ease: 'easeOut' }}/>
        </div>
      </div>

      {/* Milestones */}
      <div className="flex flex-col gap-1.5">
        {MILESTONES.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
              m.done ? 'bg-emerald-500' : 'border border-[rgba(13,24,61,0.2)]'
            }`}>
              {m.done && <Check size={8} strokeWidth={3} className="text-white"/>}
            </div>
            <span className={`text-[10px] leading-tight ${
              m.done ? 'text-white/35 line-through text-[#4B6382]' : 'text-[#4B6382]'
            }`}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mission note */}
      <p className="text-[10px] text-[#4B6382]/70 leading-relaxed italic">
        Every student on Hive is looking for real impact — not just a line on a CV.
      </p>

      <button onClick={() => navigate(ctaDest)}
        className="btn-navy text-xs py-2.5 w-full">
        {ctaLabel}
      </button>
    </motion.div>
  )
}

// ─── Next action card (empty applicants state) ────────────────────────────────

function NGONextActionCard({ navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.4 }}
      className="rounded-2xl overflow-hidden border border-[rgba(13,24,61,0.08)]"
      style={{ boxShadow: '0 2px 12px rgba(13,24,61,0.06)' }}>

      {/* Dark header */}
      <div className="relative overflow-hidden px-5 py-5" style={{ background: '#0D183D', minHeight: 80 }}>
        <HexBg />
        <div className="relative z-10">
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: '#FFB703' }}>
            ✦ Your hive is ready
          </p>
          <h3 className="text-[15px] font-extrabold text-white leading-snug">
            Connect your mission with students who care
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-4">
        <p className="text-[12px] text-[#4B6382] leading-relaxed mb-4">
          Students are looking for real-world experience with organizations that matter. Your first opportunity opens that door.
        </p>
        <button onClick={() => navigate('/opportunities/new')}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-[#0D183D] transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#FFB703', boxShadow: '0 4px 14px rgba(255,183,3,0.28)' }}>
          Post your first opportunity →
        </button>
      </div>
    </motion.div>
  )
}

// ─── Match ring ───────────────────────────────────────────────────────────────

function MatchRing({ score, size = 72 }) {
  const r = 28, circ = 2 * Math.PI * r, offset = circ * (1 - score / 100)
  const color = score >= 88 ? '#10B981' : score >= 80 ? '#FFB703' : '#6366F1'
  const track = score >= 88 ? '#D1FAE5' : score >= 80 ? '#FEF3C7' : '#EEF2FF'
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-label={`${score}% match`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke={track} strokeWidth="6"/>
      <motion.circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 36 36)"
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}/>
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central"
        fontSize="13" fontWeight="800" fill="#0D183D">{score}%</text>
    </svg>
  )
}

// ─── AI message generator ─────────────────────────────────────────────────────

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly',     label: 'Friendly'     },
  { id: 'enthusiastic', label: 'Enthusiastic' },
  { id: 'concise',      label: 'Concise'      },
]

function generateMessage(student, tone, orgName) {
  const firstName = student.name.split(' ')[0]
  const skill1 = student.skills[0]?.name ?? student.skills[0] ?? ''
  const skill2 = (student.skills[1]?.name ?? student.skills[1]) || skill1
  const reason = student.matchReasons?.[0] || `your ${skill1} experience aligns with our mission`

  const msgs = {
    professional: `Dear ${firstName},\n\nI came across your Hive profile and was genuinely impressed by your background in ${student.field} and your expertise in ${skill1} and ${skill2}. Your experience — particularly that ${reason.toLowerCase()} — caught our attention.\n\nAt ${orgName}, we are currently looking for a motivated collaborator to support our programs, and we believe your profile is a strong match for what we need. I'd love to schedule a brief call to explore how we might work together.\n\nLooking forward to hearing from you.\n\nWarm regards,\n${orgName}`,
    friendly: `Hi ${firstName}! 👋\n\nI was browsing Hive and your profile immediately stood out. Your work in ${student.field} and your skills in ${skill1} are exactly what we're looking for at ${orgName}.\n\nI especially loved that ${reason.toLowerCase()} — it really resonates with our mission. I'd love to grab a quick chat and see if we'd be a good fit to work together!\n\nHope to hear from you soon 😊`,
    enthusiastic: `Hi ${firstName}! ✨\n\nWOW — your profile is a fantastic match for what we're building at ${orgName}! Your ${skill1} skills and experience in ${student.field} are exactly the kind of energy and talent we're looking for.\n\nHive's AI gave you a ${student.match}% match with us, and honestly, I can see why. Your work — ${reason.toLowerCase()} — is precisely the kind of impact we want to create together.\n\nWould love to connect ASAP and explore the possibilities! 🚀`,
    concise: `Hi ${firstName},\n\nI'm reaching out from ${orgName}. Your ${skill1} skills and ${student.field} background caught our attention — you're a ${student.match}% match for our current opening.\n\nWould you be open to a 20-minute call this week?\n\nBest,\n${orgName}`,
  }
  return msgs[tone] || msgs.professional
}

// ─── Student profile modal ────────────────────────────────────────────────────

function StudentProfileModal({ student, onClose, orgName }) {
  const score      = student.match
  const scoreColor = score >= 88 ? '#059669' : score >= 80 ? '#D99E00' : '#6366F1'
  const scoreBg    = score >= 88 ? 'rgba(16,185,129,0.1)' : score >= 80 ? 'rgba(255,183,3,0.1)' : 'rgba(99,102,241,0.1)'
  const [mode, setMode] = useState('profile')
  const [tone, setTone] = useState('professional')
  const [msg, setMsg]   = useState(() => generateMessage(student, 'professional', orgName))

  function switchTone(t) { setTone(t); setMsg(generateMessage(student, t, orgName)) }
  function regenerate()   { setMsg(generateMessage(student, tone, orgName)) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,18,48,0.52)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.article
        initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="relative bg-white w-full max-w-[500px] rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 24px 80px rgba(10,18,48,0.25)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        <div className="px-7 pt-6 pb-5 shrink-0"
          style={{ background: 'linear-gradient(160deg, #FFF7E6 0%, #F0EEFF 100%)' }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-black/[0.06] active:scale-95">
            <X size={14} strokeWidth={2.5}/>
          </button>
          <div className="flex items-start gap-4">
            <GradientAvatar name={student.name} size={64} radius="1rem"
              className="ring-[3px] ring-white shadow-lg shrink-0"/>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-extrabold text-[1.05rem] text-[#0D183D] leading-snug">{student.name}</h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0"
                  style={{ background: scoreBg, color: scoreColor }}>
                  {score}% Match
                </span>
              </div>
              <p className="text-[13px] font-semibold text-[#0D183D]/70 mb-1.5 leading-snug">
                {student.field} · {student.year}
              </p>
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#4B6382]">
                  <GraduationCap size={10} strokeWidth={2}/> {student.uni}
                </span>
                {student.location && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#4B6382]">
                    <MapPin size={10} strokeWidth={2}/> {student.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-5 flex flex-col gap-5">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: '#FFB703' }}>
                <Sparkles size={11} strokeWidth={2.5} className="text-white"/>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#0D183D]">
                Why Hive matched this student
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {student.matchReasons.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex items-start gap-2.5 rounded-xl p-3 text-[12px] text-[#4B6382] leading-relaxed"
                  style={{ background: 'rgba(255,183,3,0.06)', border: '1px solid rgba(255,183,3,0.14)' }}>
                  <CheckCircle2 size={13} strokeWidth={2} className="mt-0.5 shrink-0" style={{ color: '#FFB703' }}/>
                  {r}
                </motion.div>
              ))}
            </div>
          </section>

          <div className="h-px" style={{ background: 'rgba(13,24,61,0.07)' }}/>

          <section className="flex items-center gap-5">
            <MatchRing score={score}/>
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-1">Availability</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>
                  {student.availability}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-1">Languages</p>
                <p className="text-[12px] font-semibold text-[#0D183D]">{student.languages.join(' · ')}</p>
              </div>
            </div>
          </section>

          <div className="h-px" style={{ background: 'rgba(13,24,61,0.07)' }}/>

          <section>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">About</p>
            <p className="text-[13px] text-[#4B6382] leading-[1.65]">{student.bio}</p>
          </section>

          <section>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2.5">Skills</p>
            <CategorizedSkillTags skills={student.skills} showLevel/>
          </section>

          {student.interests?.length > 0 && (
            <section>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2.5">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {student.interests.map(t => (
                  <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(255,183,3,0.08)', color: '#D99E00', border: '1px solid rgba(255,183,3,0.18)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {student.projects?.length > 0 && (
            <section>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2.5">Notable Work</p>
              <ul className="flex flex-col gap-2">
                {student.projects.map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#4B6382] leading-snug">
                    <span className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#FFB703' }}/>
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {mode === 'profile' && (
          <div className="shrink-0 px-7 py-4 flex gap-2.5 border-t"
            style={{ borderColor: 'rgba(13,24,61,0.08)', background: '#FAFAFA' }}>
            <button onClick={() => setMode('connect')}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: '#0D183D', boxShadow: '0 2px 12px rgba(13,24,61,0.2)' }}>
              <Sparkles size={13}/> Connect with {student.name.split(' ')[0]}
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center border hover:bg-[rgba(13,24,61,0.04)] active:scale-95"
              style={{ color: '#4B6382', borderColor: 'rgba(13,24,61,0.14)' }} aria-label="Send email">
              <Mail size={14} strokeWidth={2}/>
            </button>
          </div>
        )}

        {mode === 'connect' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="shrink-0 flex flex-col border-t"
            style={{ borderColor: 'rgba(13,24,61,0.08)', background: '#FAFAFA' }}>

            <div className="px-7 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(13,24,61,0.07)' }}>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setMode('profile')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4B6382] hover:bg-[rgba(13,24,61,0.06)]">
                  <ArrowLeft size={14}/>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#FFB703' }}>
                    <Sparkles size={11} className="text-white"/>
                  </div>
                  <p className="text-[13px] font-extrabold text-[#0D183D]">AI Connection Composer</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <GradientAvatar name={student.name} size={36} radius="0.55rem"/>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#0D183D]">{student.name}</p>
                  <p className="text-[11px] text-[#4B6382]">{student.field}</p>
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{ background: scoreBg, color: scoreColor }}>{score}% match</span>
              </div>

              <div className="rounded-xl p-3.5 mb-4"
                style={{ background: 'rgba(255,183,3,0.06)', border: '1px solid rgba(255,183,3,0.14)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#D99E00] mb-2">
                  Why this match works
                </p>
                <ul className="flex flex-col gap-1.5">
                  {(student.matchReasons || []).slice(0, 2).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-[#4B6382]">
                      <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-[#FFB703]"/> {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">Tone</p>
                <div className="flex gap-1.5">
                  {TONES.map(t => (
                    <button key={t.id} onClick={() => switchTone(t.id)}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                      style={tone === t.id
                        ? { background: '#0D183D', color: 'white' }
                        : { background: 'rgba(13,24,61,0.06)', color: '#4B6382' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-7 pt-4 pb-3 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382]">Message</p>
                <button onClick={regenerate}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#FFB703] hover:opacity-70">
                  <RefreshCw size={11}/> Regenerate
                </button>
              </div>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={6}
                className="w-full px-4 py-3 rounded-xl text-[12px] text-[#0D183D] leading-relaxed resize-none outline-none transition-all"
                style={{ background: 'white', border: '1.5px solid rgba(13,24,61,0.1)', lineHeight: 1.65 }}
                onFocus={e => e.target.style.borderColor = '#FFB703'}
                onBlur={e => e.target.style.borderColor = 'rgba(13,24,61,0.1)'}/>
              <button onClick={() => setMode('sent')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#FFB703', boxShadow: '0 4px 16px rgba(255,183,3,0.28)' }}>
                <Send size={13}/> Send introduction
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'sent' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="shrink-0 px-7 py-8 flex flex-col items-center text-center border-t"
            style={{ borderColor: 'rgba(13,24,61,0.08)', background: '#FAFAFA' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle2 size={28} className="text-emerald-500"/>
            </motion.div>
            <p className="text-[15px] font-extrabold text-[#0D183D] mb-1">Message sent!</p>
            <p className="text-[12px] text-[#4B6382] mb-5 leading-relaxed">
              Your introduction to <strong>{student.name.split(' ')[0]}</strong> is on its way.
            </p>
            <div className="flex gap-2.5 w-full">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.12)] hover:bg-[rgba(13,24,61,0.04)]">
                Close
              </button>
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90"
                style={{ background: '#0D183D' }}>
                View in Messages
              </button>
            </div>
          </motion.div>
        )}
      </motion.article>
    </motion.div>
  )
}

// ─── Student card ─────────────────────────────────────────────────────────────

function StudentCard({ student, onOpen, index }) {
  const sc       = student.match
  const scoreColor = sc >= 88 ? '#059669' : sc >= 80 ? '#D99E00' : '#6366F1'
  const scoreBg  = sc >= 88 ? 'rgba(16,185,129,0.1)' : sc >= 80 ? 'rgba(255,183,3,0.1)' : 'rgba(99,102,241,0.1)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.3 }}
      className="group bg-white rounded-2xl border px-5 py-4 flex items-center gap-4 transition-all duration-200 hover:shadow-[0_4px_24px_rgba(13,24,61,0.08)]"
      style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
      <GradientAvatar name={student.name} size={44} radius="0.65rem"/>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-bold text-[#0D183D] truncate">{student.name}</p>
          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
            style={{ background: scoreBg, color: scoreColor }}>{sc}%</span>
        </div>
        <p className="text-[11px] text-[#4B6382] mb-2 truncate">{student.field} · {student.uni}</p>
        <div className="flex items-center gap-1 flex-wrap">
          {student.skills.slice(0, 3).map(s => {
            const name = s?.name ?? s
            return (
              <span key={name} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                style={{ background: '#F8F9FB', color: '#4B6382', borderColor: 'rgba(13,24,61,0.09)' }}>
                {name}
              </span>
            )
          })}
          {student.skills.length > 3 && (
            <span className="text-[10px] text-[#4B6382] opacity-60 font-medium px-0.5">
              +{student.skills.length - 3}
            </span>
          )}
        </div>
      </div>
      <button onClick={() => onOpen(student)}
        className="shrink-0 text-[11px] font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 hover:-translate-y-px active:scale-[0.97]"
        style={{ background: '#0D183D', boxShadow: '0 2px 8px rgba(13,24,61,0.2)' }}>
        View profile
      </button>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NGODashboard() {
  const { user, profile, logout } = useApp()
  const navigate = useNavigate()

  const [activeStudent, setActiveStudent] = useState(null)
  const [applicants,    setApplicants]    = useState([])
  const [oppCount,      setOppCount]      = useState(0)
  const [loadingData,   setLoadingData]   = useState(true)

  const orgName    = profile?.name || user?.name || 'Your NGO'
  const avatarSrc  = profile?.imageUrl || profile?.avatar || user?.avatar || null
  const completion = computeNgoCompletion(profile)
  const isNew      = !loadingData && oppCount === 0 && applicants.length === 0

  useEffect(() => {
    if (!user?.id) return
    setLoadingData(true)
    Promise.all([
      fetchNgoApplicants(user.id).catch(() => []),
      fetchNgoOpportunities(user.id).catch(() => []),
    ]).then(([apps, opps]) => {
      setApplicants(apps)
      setOppCount(opps.length)
    }).finally(() => setLoadingData(false))
  }, [user?.id])

  const STATS = [
    { icon: Briefcase,   label: 'Opportunities',  value: oppCount,
      color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { icon: Users,       label: 'Total applicants', value: applicants.length,
      color: 'text-[#FFB703]',  bg: 'bg-amber-50'  },
    { icon: Clock,       label: 'Pending review',   value: applicants.filter(a => a.status === 'submitted').length,
      color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: CheckCircle2, label: 'Accepted',        value: applicants.filter(a => a.status === 'accepted').length,
      color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ]

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
        <div className="max-w-[1100px] mx-auto px-8 py-7">

          {/* ── Greeting header ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 mb-6">
            <GradientAvatar name={orgName} size={52} radius="1rem"
              className="ring-[3px] ring-white shadow-sm shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
                <h1 className="text-[1.15rem] font-extrabold text-[#0D183D] leading-tight truncate">{orgName}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13px] text-[#4B6382] leading-snug">
                  {completion.pct < 60
                    ? 'Complete your profile to attract better matches.'
                    : completion.pct < 100
                    ? 'Your hive is growing — a few more details will strengthen your visibility.'
                    : 'Your hive is ready to welcome students.'}
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
              <AvatarDisplay src={avatarSrc} name={orgName} size="sm" className="rounded-xl"/>
              <div>
                <p className="text-sm font-bold text-[#0D183D] leading-tight truncate max-w-[100px]">{orgName}</p>
                <p className="text-[10px] text-[#4B6382]">NGO · Hive</p>
              </div>
              <button className="text-[#4B6382] hover:text-[#0D183D] ml-1 transition-colors">
                <Bell size={14}/>
              </button>
            </motion.div>
          </motion.div>

          {/* ── Stats / Milestone strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {isNew ? (
              // Milestone steps — more meaningful than four zeros
              [
                { num: '1', label: 'Complete profile',  done: completion.pct === 100, active: completion.pct < 100 },
                { num: '2', label: 'Post opportunity',  done: oppCount > 0,           active: completion.pct === 100 },
                { num: '3', label: 'First applicant',   done: applicants.length > 0,  active: false },
                { num: '4', label: 'Welcome student',   done: false,                  active: false },
              ].map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.28 }}
                  className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border transition-shadow"
                  style={{ borderColor: step.active ? '#FFB703' : 'rgba(13,24,61,0.08)',
                    boxShadow: step.active ? '0 0 0 3px rgba(255,183,3,0.1)' : 'none' }}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-emerald-50' : step.active ? 'bg-amber-50' : 'bg-[#F8F9FB]'
                  }`}>
                    {step.done
                      ? <Check size={15} className="text-emerald-500" strokeWidth={2.5}/>
                      : <span className="text-[13px] font-extrabold"
                          style={{ color: step.active ? '#D99E00' : '#4B6382' }}>{step.num}</span>
                    }
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#0D183D] leading-tight">{step.label}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: step.done ? '#10B981' : step.active ? '#D99E00' : '#4B6382' }}>
                      {step.done ? 'Done ✓' : step.active ? 'Up next' : 'Upcoming'}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              // Real stat cards once data exists
              STATS.map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.28 }}
                  className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border transition-shadow hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)]"
                  style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                    <s.icon size={15} className={s.color} strokeWidth={2}/>
                  </div>
                  <div>
                    <p className="text-[20px] font-extrabold text-[#0D183D] leading-none tracking-tight">
                      {loadingData ? '—' : s.value}
                    </p>
                    <p className="text-[10px] text-[#4B6382] mt-0.5 leading-snug">{s.label}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* ── Body ── */}
          <div className="grid lg:grid-cols-[1fr_264px] gap-5">

            {/* ── Left: Applicants ── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-[13px] font-extrabold text-[#0D183D]">
                    {applicants.length === 0 ? 'Getting Started' : 'Recent Applicants'}
                  </h2>
                  <p className="text-[11px] text-[#4B6382] mt-0.5">
                    {applicants.length === 0
                      ? 'Your first steps toward connecting with students'
                      : 'Students who applied to your opportunities'}
                  </p>
                </div>
                {applicants.length > 0 && (
                  <Link to="/applicants"
                    className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-70"
                    style={{ color: '#FFB703' }}>
                    See all <ChevronRight size={11} strokeWidth={2.5}/>
                  </Link>
                )}
              </div>

              {loadingData ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl border px-5 py-4 h-[76px] animate-pulse"
                      style={{ borderColor: 'rgba(13,24,61,0.08)' }}/>
                  ))}
                </div>
              ) : applicants.length === 0 ? (
                <NGONextActionCard navigate={navigate}/>
              ) : (
                <div className="flex flex-col gap-2">
                  {applicants.slice(0, 5).map((s, i) => (
                    <StudentCard key={s.id} student={s} onOpen={setActiveStudent} index={i}/>
                  ))}
                </div>
              )}
            </section>

            {/* ── Right: Sidebar ── */}
            <aside className="flex flex-col gap-4">
              {isNew ? (
                <UnifiedProgressCard completion={completion} navigate={navigate}/>
              ) : (
                <>
                  <OrgReadinessCard completion={completion} navigate={navigate}/>
                  <CommunityImpactWidget
                    profile={profile}
                    oppCount={oppCount}
                    applicants={applicants}
                    navigate={navigate}
                  />
                </>
              )}
            </aside>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {activeStudent && (
          <StudentProfileModal
            student={activeStudent}
            onClose={() => setActiveStudent(null)}
            orgName={orgName}
          />
        )}
      </AnimatePresence>
    </>
  )
}
