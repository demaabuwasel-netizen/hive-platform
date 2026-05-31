import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Users, Zap, MessageSquare, BarChart2,
  MessageCircle, Settings, LogOut, ChevronRight, ExternalLink,
  X, MapPin, GraduationCap, Star, Globe, Mail, Sparkles,
  CheckCircle2, Clock, Languages, RefreshCw, Send, ArrowLeft,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import HiveLogo from '../components/HiveLogo'
import CategorizedSkillTags from '../components/CategorizedSkillTags'
import { AvatarDisplay } from '../components/Avatar'
import img3 from '../assets/img3.png'  // woman w/ laptop — community impact

// ─── Gradient avatar ──────────────────────────────────────────────────────────

const GRADIENTS = [
  ['#6366F1', '#8B5CF6'],
  ['#FFB703', '#F97316'],
  ['#06B6D4', '#3B82F6'],
  ['#10B981', '#059669'],
  ['#EC4899', '#F43F5E'],
  ['#8B5CF6', '#A855F7'],
  ['#F59E0B', '#EF4444'],
  ['#14B8A6', '#06B6D4'],
]

function nameHash(str) {
  return str.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(w => /^[\p{L}]/u.test(w))
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function GradientAvatar({ name, size = 48, radius = '0.75rem', className = '' }) {
  const [c1, c2] = GRADIENTS[nameHash(name) % GRADIENTS.length]
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center shrink-0 select-none font-bold text-white ${className}`}
      style={{
        width: size, height: size, borderRadius: radius,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        fontSize: Math.round(size * 0.34),
        letterSpacing: '0.03em',
        boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
      }}
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NGO_STATS = []

const STUDENT_MATCHES = []

const AI_QUESTIONS = []

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/dashboard/ngo'  },
  { icon: Briefcase,       label: 'Opportunities', to: '/opportunities'  },
  { icon: Users,           label: 'Applicants',    to: '/applicants'     },
  { icon: Zap,             label: 'Matches',       to: '/matches'        },
  { icon: MessageSquare,   label: 'Interviews',    to: '/interviews'     },
  { icon: BarChart2,       label: 'Analytics',     to: '/analytics'      },
  { icon: MessageCircle,   label: 'Messages',      to: '/messages', badge: '2' },
  { icon: Settings,        label: 'Settings',      to: '/settings'       },
]

// ─── Match ring ───────────────────────────────────────────────────────────────

function MatchRing({ score, size = 72 }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 88 ? '#10B981' : score >= 80 ? '#FFB703' : '#6366F1'
  const trackColor = score >= 88 ? '#D1FAE5' : score >= 80 ? '#FEF3C7' : '#EEF2FF'
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-label={`${score}% match score`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke={trackColor} strokeWidth="6"/>
      <motion.circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
      />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central"
        fontSize="13" fontWeight="800" fill="#0D183D">{score}%</text>
    </svg>
  )
}

// ─── AI message generator ────────────────────────────────────────────────────

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly',     label: 'Friendly'     },
  { id: 'enthusiastic', label: 'Enthusiastic' },
  { id: 'concise',      label: 'Concise'      },
]

function generateMessage(student, tone, orgName) {
  const firstName = student.name.split(' ')[0]
  const skill1 = student.skills[0]
  const skill2 = student.skills[1] || student.skills[0]
  const reason = student.matchReasons?.[0] || `your ${skill1} experience aligns with our mission`

  const messages = {
    professional: `Dear ${firstName},\n\nI came across your Hive profile and was genuinely impressed by your background in ${student.field} and your expertise in ${skill1} and ${skill2}. Your experience — particularly that ${reason.toLowerCase()} — caught our attention.\n\nAt ${orgName}, we are currently looking for a motivated collaborator to support our programs, and we believe your profile is a strong match for what we need. I'd love to schedule a brief call to explore how we might work together.\n\nLooking forward to hearing from you.\n\nWarm regards,\n${orgName}`,

    friendly: `Hi ${firstName}! 👋\n\nI was browsing Hive and your profile immediately stood out. Your work in ${student.field} and your skills in ${skill1} are exactly what we're looking for at ${orgName}.\n\nI especially loved that ${reason.toLowerCase()} — it really resonates with our mission. I'd love to grab a quick chat and see if we'd be a good fit to work together!\n\nHope to hear from you soon 😊`,

    enthusiastic: `Hi ${firstName}! ✨\n\nWOW — your profile is a fantastic match for what we're building at ${orgName}! Your ${skill1} skills and experience in ${student.field} are exactly the kind of energy and talent we're looking for.\n\nHive's AI gave you a ${student.match}% match with us, and honestly, I can see why. Your work — ${reason.toLowerCase()} — is precisely the kind of impact we want to create together.\n\nWould love to connect ASAP and explore the possibilities! 🚀`,

    concise: `Hi ${firstName},\n\nI'm reaching out from ${orgName}. Your ${skill1} skills and ${student.field} background caught our attention — you're a ${student.match}% match for our current opening.\n\nWould you be open to a 20-minute call this week?\n\nBest,\n${orgName}`,
  }
  return messages[tone] || messages.professional
}

// ─── Student profile modal ────────────────────────────────────────────────────

function StudentProfileModal({ student, onClose, orgName = 'Majd – Arab Youth Hub' }) {
  const score = student.match
  const scoreColor = score >= 88 ? '#059669' : score >= 80 ? '#D99E00' : '#6366F1'
  const scoreBg   = score >= 88 ? 'rgba(16,185,129,0.1)' : score >= 80 ? 'rgba(255,183,3,0.1)' : 'rgba(99,102,241,0.1)'
  const [mode, setMode] = useState('profile') // 'profile' | 'connect' | 'sent'
  const [tone, setTone] = useState('professional')
  const [msg, setMsg] = useState(() => generateMessage(student, 'professional', orgName))

  function switchTone(t) {
    setTone(t)
    setMsg(generateMessage(student, t, orgName))
  }

  function regenerate() {
    setMsg(generateMessage(student, tone, orgName))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,18,48,0.52)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.article
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="relative bg-white w-full max-w-[500px] rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 24px 80px rgba(10,18,48,0.25)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-7 pt-6 pb-5 shrink-0"
          style={{ background: 'linear-gradient(160deg, #FFF7E6 0%, #F0EEFF 100%)' }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] transition-all hover:bg-black/[0.06] active:scale-95"
            aria-label="Close">
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

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-7 py-5 flex flex-col gap-5">

          {/* Why Hive matched */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background: '#FFB703' }}>
                <Sparkles size={11} strokeWidth={2.5} className="text-white"/>
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#0D183D]">
                Why Hive matched this student
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {student.matchReasons.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
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

          {/* Match + availability */}
          <section className="flex items-center gap-5">
            <MatchRing score={score} />
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

          {/* Bio */}
          <section>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">About</p>
            <p className="text-[13px] text-[#4B6382] leading-[1.65]">{student.bio}</p>
          </section>

          {/* Skills */}
          <section>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2.5">Skills</p>
            <CategorizedSkillTags skills={student.skills} showLevel />
          </section>

          {/* Interests */}
          {student.interests?.length > 0 && (
            <section>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2.5">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {student.interests.map(t => (
                  <span key={t}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(255,183,3,0.08)', color: '#D99E00', border: '1px solid rgba(255,183,3,0.18)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Notable work */}
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

        {/* ── Footer — profile mode ── */}
        {mode === 'profile' && (
          <div className="shrink-0 px-7 py-4 flex gap-2.5 border-t" style={{ borderColor: 'rgba(13,24,61,0.08)', background: '#FAFAFA' }}>
            <button
              onClick={() => setMode('connect')}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: '#0D183D', boxShadow: '0 2px 12px rgba(13,24,61,0.2)' }}>
              <Sparkles size={13}/> Connect with {student.name.split(' ')[0]}
            </button>
            <button
              className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 hover:bg-[rgba(13,24,61,0.04)] active:scale-95"
              style={{ color: '#4B6382', borderColor: 'rgba(13,24,61,0.14)' }}
              aria-label="Send email">
              <Mail size={14} strokeWidth={2}/>
            </button>
          </div>
        )}

        {/* ── Connect composer — AI message ── */}
        {mode === 'connect' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="shrink-0 flex flex-col border-t"
            style={{ borderColor: 'rgba(13,24,61,0.08)', background: '#FAFAFA' }}>

            {/* Connect header */}
            <div className="px-7 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(13,24,61,0.07)' }}>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => setMode('profile')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4B6382] hover:bg-[rgba(13,24,61,0.06)] transition-colors">
                  <ArrowLeft size={14}/>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#FFB703' }}>
                    <Sparkles size={11} className="text-white"/>
                  </div>
                  <p className="text-[13px] font-extrabold text-[#0D183D]">AI Connection Composer</p>
                </div>
              </div>

              {/* Mini profile + match */}
              <div className="flex items-center gap-3 mb-4">
                <GradientAvatar name={student.name} size={36} radius="0.55rem" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#0D183D]">{student.name}</p>
                  <p className="text-[11px] text-[#4B6382]">{student.field}</p>
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{ background: scoreBg, color: scoreColor }}>{score}% match</span>
              </div>

              {/* Why this works */}
              <div className="rounded-xl p-3.5 mb-4" style={{ background: 'rgba(255,183,3,0.06)', border: '1px solid rgba(255,183,3,0.14)' }}>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#D99E00] mb-2">Why this match works</p>
                <ul className="flex flex-col gap-1.5">
                  {(student.matchReasons || []).slice(0,2).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-[#4B6382]">
                      <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-[#FFB703]"/>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tone selector */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">Tone</p>
                <div className="flex gap-1.5">
                  {TONES.map(t => (
                    <button key={t.id} onClick={() => switchTone(t.id)}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
                      style={tone === t.id
                        ? { background: '#0D183D', color: 'white' }
                        : { background: 'rgba(13,24,61,0.06)', color: '#4B6382' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message editor */}
            <div className="px-7 pt-4 pb-3 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382]">Message</p>
                <button onClick={regenerate}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#FFB703] hover:opacity-70 transition-opacity">
                  <RefreshCw size={11}/> Regenerate
                </button>
              </div>
              <textarea
                value={msg} onChange={e => setMsg(e.target.value)} rows={6}
                className="w-full px-4 py-3 rounded-xl text-[12px] text-[#0D183D] leading-relaxed resize-none outline-none transition-all"
                style={{ background: 'white', border: '1.5px solid rgba(13,24,61,0.1)', lineHeight: 1.65 }}
                onFocus={e => e.target.style.borderColor = '#FFB703'}
                onBlur={e => e.target.style.borderColor = 'rgba(13,24,61,0.1)'}
              />
              <button
                onClick={() => setMode('sent')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#FFB703', boxShadow: '0 4px 16px rgba(255,183,3,0.28)' }}>
                <Send size={13}/> Send introduction
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Sent success state ── */}
        {mode === 'sent' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="shrink-0 px-7 py-8 flex flex-col items-center text-center border-t"
            style={{ borderColor: 'rgba(13,24,61,0.08)', background: '#FAFAFA' }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle2 size={28} className="text-emerald-500"/>
            </motion.div>
            <p className="text-[15px] font-extrabold text-[#0D183D] mb-1">Message sent!</p>
            <p className="text-[12px] text-[#4B6382] mb-5 leading-relaxed">
              Your introduction to <strong>{student.name.split(' ')[0]}</strong> is on its way. You'll be notified when they respond.
            </p>
            <div className="flex gap-2.5 w-full">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.12)] hover:bg-[rgba(13,24,61,0.04)] transition-colors">
                Close
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#0D183D' }}
                onClick={onClose}>
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
  const sc = student.match
  const scoreColor = sc >= 88 ? '#059669' : sc >= 80 ? '#D99E00' : '#6366F1'
  const scoreBg   = sc >= 88 ? 'rgba(16,185,129,0.1)' : sc >= 80 ? 'rgba(255,183,3,0.1)' : 'rgba(99,102,241,0.1)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.3 }}
      className="group bg-white rounded-2xl border px-5 py-4 flex items-center gap-4 transition-all duration-200 hover:shadow-[0_4px_24px_rgba(13,24,61,0.08)] cursor-default"
      style={{ borderColor: 'rgba(13,24,61,0.08)' }}
    >
      <GradientAvatar name={student.name} size={44} radius="0.65rem" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-bold text-[#0D183D] truncate leading-snug">{student.name}</p>
          <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
            style={{ background: scoreBg, color: scoreColor }}>
            {sc}%
          </span>
        </div>
        <p className="text-[11px] text-[#4B6382] mb-2 truncate">{student.field} · {student.uni}</p>
        <div className="flex items-center gap-1 flex-wrap">
          {student.skills.slice(0, 3).map(s => (
            <span key={s}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
              style={{ background: '#F8F9FB', color: '#4B6382', borderColor: 'rgba(13,24,61,0.09)' }}>
              {s}
            </span>
          ))}
          {student.skills.length > 3 && (
            <span className="text-[10px] text-[#4B6382] opacity-60 font-medium px-0.5">
              +{student.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onOpen(student)}
        className="shrink-0 cursor-pointer text-[11px] font-semibold text-white px-4 py-2 rounded-xl transition-all duration-150 hover:opacity-90 hover:-translate-y-px active:scale-[0.97] active:translate-y-0 select-none"
        style={{ background: '#0D183D', boxShadow: '0 2px 8px rgba(13,24,61,0.2)' }}>
        View profile
      </button>
    </motion.div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ user, profile, onLogout }) {
  const orgName = profile?.name || user?.name || 'Your NGO'
  const src = profile?.imageUrl || profile?.avatar || user?.avatar || null

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-screen sticky top-0 z-10 bg-white"
      style={{ borderRight: '1px solid rgba(13,24,61,0.08)' }}>

      {/* Logo */}
      <div className="px-5 py-[14px]" style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
        <Link to="/"><HiveLogo size={24} nameSize="text-base" /></Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = window.location.pathname === item.to
          return (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-100 ${
                active ? 'bg-[#0D183D] text-white' : 'text-[#4B6382] hover:bg-[rgba(13,24,61,0.04)] hover:text-[#0D183D]'
              }`}>
              <item.icon size={14} strokeWidth={active ? 2.5 : 1.8}/>
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full text-white" style={{ background:'#FFB703' }}>{item.badge}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-2.5" style={{ borderTop: '1px solid rgba(13,24,61,0.07)' }}>
        <div className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[rgba(13,24,61,0.04)] transition-colors cursor-default">
          <AvatarDisplay src={src} name={orgName} size="xs"
            className="ring-[2px] ring-[rgba(255,183,3,0.35)] shrink-0"/>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-[#0D183D] truncate leading-snug">{orgName}</p>
            <p className="text-[10px] text-[#4B6382]">NGO Account</p>
          </div>
          <button onClick={onLogout} aria-label="Log out"
            className="opacity-0 group-hover:opacity-100 text-[#4B6382] hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-50">
            <LogOut size={12}/>
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function NGODashboardContent({ user, profile, setActiveStudent, orgName }) {
  const avatarSrc = profile?.imageUrl || profile?.avatar || user?.avatar || null

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="max-w-[960px] mx-auto px-8 py-7">

          {/* ── Org header ── */}
          <motion.header
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 mb-6">
            <GradientAvatar name={orgName} size={52} radius="1rem"
              className="ring-[3px] ring-white shadow-sm"/>
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-[1.15rem] font-extrabold text-[#0D183D] leading-tight">{orgName}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Active
                </span>
              </div>
              <p className="text-[13px] text-[#4B6382] leading-snug">
                {profile?.location ? `${profile.location} · ` : ''}
                {profile?.description?.slice(0, 70) || 'Dashboard overview'}
                {(profile?.description?.length || 0) > 70 ? '…' : ''}
              </p>
            </div>
          </motion.header>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {NGO_STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.28 }}
                className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)]"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                  <s.icon size={15} className={s.color} strokeWidth={2}/>
                </div>
                <div>
                  <p className="text-[20px] font-extrabold text-[#0D183D] leading-none tracking-tight">{s.value}</p>
                  <p className="text-[10px] text-[#4B6382] mt-0.5 leading-snug">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Body ── */}
          <div className="grid lg:grid-cols-[1fr_264px] gap-5">

            {/* Student matches */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-[13px] font-extrabold text-[#0D183D]">Suggested Matches</h2>
                  <p className="text-[11px] text-[#4B6382] mt-0.5">AI-matched to your open opportunities</p>
                </div>
                <Link to="/matches"
                  className="text-[11px] font-semibold flex items-center gap-0.5 transition-opacity hover:opacity-70"
                  style={{ color: '#FFB703' }}>
                  See all <ChevronRight size={11} strokeWidth={2.5}/>
                </Link>
              </div>

              <div className="flex flex-col gap-2">
                {STUDENT_MATCHES.map((s, i) => (
                  <StudentCard key={s.id} student={s} onOpen={setActiveStudent} index={i}/>
                ))}
              </div>
            </section>

            {/* Right column */}
            <aside className="flex flex-col gap-4">

              {/* AI Interview Questions */}
              <motion.div
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ background: '#0D183D' }}>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFB703' }}>
                    <Sparkles size={12} strokeWidth={2.5} className="text-white"/>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white leading-snug">AI Interview Questions</p>
                    <p className="text-[10px] text-white/40">Tailored for your top match</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {AI_QUESTIONS.map((q, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      className="rounded-xl p-3 flex gap-2.5"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <span className="text-[10px] font-extrabold shrink-0 mt-0.5" style={{ color: '#FFB703' }}>Q{i + 1}</span>
                      <p className="text-[11px] leading-relaxed text-white/55">{q}</p>
                    </motion.div>
                  ))}
                </div>

                <Link to="/matches"
                  className="flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80"
                  style={{ color: '#FFB703' }}>
                  <ExternalLink size={10}/> Full match explanation
                </Link>
              </motion.div>

              {/* Community Impact */}
              <motion.div
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28, duration: 0.35 }}
                className="bg-white rounded-2xl p-5 flex flex-col gap-4 border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>

                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-extrabold text-[#0D183D]">Community Impact</h3>
                  <span className="text-[10px] font-semibold text-[#4B6382]">This quarter</span>
                </div>

                <div className="rounded-xl overflow-hidden border"
                  style={{ background: 'rgba(255,183,3,0.05)', borderColor: 'rgba(255,183,3,0.15)' }}>
                  <img src={img3} alt="Community impact"
                    className="w-full object-contain object-top"
                    style={{ maxHeight: 96 }} draggable={false}/>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 text-center border"
                    style={{ background: 'rgba(255,183,3,0.05)', borderColor: 'rgba(255,183,3,0.14)' }}>
                    <p className="text-[18px] font-extrabold leading-none" style={{ color: '#D99E00' }}>4</p>
                    <p className="text-[10px] text-[#4B6382] mt-1">Active projects</p>
                  </div>
                  <div className="rounded-xl p-3 text-center bg-indigo-50 border border-indigo-100">
                    <p className="text-[18px] font-extrabold leading-none text-indigo-600">46</p>
                    <p className="text-[10px] text-[#4B6382] mt-1">Students helped</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-semibold text-[#4B6382]">Annual impact goal</span>
                    <span className="text-[10px] font-extrabold" style={{ color: '#D99E00' }}>72%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(13,24,61,0.07)' }}>
                    <motion.div className="h-1.5 rounded-full" style={{ background: '#FFB703' }}
                      initial={{ width: 0 }}
                      animate={{ width: '72%' }}
                      transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}/>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
    </main>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function NGODashboard() {
  const { user, profile } = useApp()
  const [activeStudent, setActiveStudent] = useState(null)
  const orgName = profile?.name || user?.name || 'Your NGO'

  return (
    <>
      <NGODashboardContent
        user={user}
        profile={profile}
        setActiveStudent={setActiveStudent}
        orgName={orgName}
      />
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
