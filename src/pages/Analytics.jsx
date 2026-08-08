import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle, AlertTriangle, BarChart3, Briefcase, Calendar, Camera, CheckCircle2, ChevronDown,
  Code2, Database, DollarSign, FileText, Globe, GraduationCap, HeartHandshake, Layers,
  Lightbulb, MapPin, Megaphone, MessageCircle, MessageSquare, Moon, PenTool, Percent, Search,
  Sparkles, Target, Users, Video,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchNgoApplicants } from '../services/applications'
import { fetchNgoOpportunities, parseSkillString } from '../services/opportunities'
import { withTimeout } from '../utils/withTimeout'
import { WORLD_LAND, COUNTRY_POINTS } from '../data/worldMap'
import analyticsIllustration from '../assets/img2.jpg'

const HEALTH_CONFIG = {
  Healthy: {
    icon: CheckCircle2, className: 'bg-[#E6F4EA] text-[#188038]', tint: '#E6F4EA', accent: '#188038',
    description: 'Applicants are moving — interviews or offers are happening.',
  },
  'Needs attention': {
    icon: AlertTriangle, className: 'bg-[#FEF7E0] text-[#B06000]', tint: '#FEF7E0', accent: '#B06000',
    description: "Applicants aren't advancing yet, or match quality is low.",
  },
  'Low activity': {
    icon: Moon, className: 'bg-[#F1F3F4] text-[#5F6368]', tint: '#F1F3F4', accent: '#5F6368',
    description: 'Too few applicants so far to tell much.',
  },
}

const KPI_STYLES = [
  { icon: Briefcase, tint: '#E8F0FE', accent: '#1A73E8' },
  { icon: Users, tint: '#F3E8FD', accent: '#A142F4' },
  { icon: MessageSquare, tint: '#FEF7E0', accent: '#F29900' },
  { icon: CheckCircle2, tint: '#E6F4EA', accent: '#188038' },
]

// Keyword → icon so skills feel identified, not just listed
function skillIcon(name) {
  const n = name.toLowerCase()
  if (/python|javascript|java|programming|code|coding|developer|software|c\+\+/.test(n)) return Code2
  if (/sql|database/.test(n)) return Database
  if (/excel|spreadsheet|data analysis|data visualization|analytics|statistics|dashboard/.test(n)) return BarChart3
  if (/design|graphic|ux|ui|illustration/.test(n)) return PenTool
  if (/communication|public speaking|presentation|negotiation/.test(n)) return MessageCircle
  if (/writing|content|copywriting/.test(n)) return FileText
  if (/marketing|social media|seo/.test(n)) return Megaphone
  if (/leadership|management|project/.test(n)) return Users
  if (/research/.test(n)) return Search
  if (/finance|accounting/.test(n)) return DollarSign
  if (/photo/.test(n)) return Camera
  if (/video|production/.test(n)) return Video
  if (/web|mobile|app/.test(n)) return Globe
  if (/translation|language/.test(n)) return Globe
  if (/fundrais|grant|customer service|support/.test(n)) return HeartHandshake
  if (/event/.test(n)) return Calendar
  if (/teaching|education|curriculum|mentor/.test(n)) return GraduationCap
  return Sparkles
}

function toUiStatus(status) {
  if (status === 'submitted' || status === 'under_review') return 'new'
  return status || 'new'
}

function pct(value, total) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

function average(values) {
  const usable = values.filter(value => Number.isFinite(value))
  if (!usable.length) return 0
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length)
}

function skillName(skill) {
  return parseSkillString(skill).name || 'Skill'
}

function sameId(a, b) {
  return String(a) === String(b)
}

function getRoleHealth({ applicantCount, avgMatch, interviews, accepted }) {
  if (applicantCount <= 1) return 'Low activity'
  if ((interviews === 0 && accepted === 0) || avgMatch < 50) return 'Needs attention'
  return 'Healthy'
}

function getRoleSuggestion(role) {
  if (role.health === 'Needs attention') {
    return 'Move a strong applicant to interview so the role does not stay stuck.'
  }
  if (role.health === 'Low activity') {
    return 'Share this role again or make the requirements easier to understand.'
  }
  return ''
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/90 bg-white/95 px-8 py-16 text-center shadow-[0_20px_54px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(26,115,232,0.11),transparent_52%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(232,240,254,0.24))]" />
      <img src={analyticsIllustration} alt="" className="relative mx-auto w-52 mb-5 select-none" />
      <p className="relative text-[1.1rem] font-semibold text-[#202124]">Analytics will appear once roles get activity</p>
      <p className="relative mx-auto mt-2 max-w-md text-[0.88rem] leading-6 text-[#5F6368]">
        Post roles and review applicants to see movement, match quality, and skill trends.
      </p>
      <Link to="/opportunities/new" className="relative mt-6 inline-flex rounded-full bg-[#1A73E8] px-6 py-2.5 text-[0.85rem] font-medium text-white shadow-[0_8px_20px_rgba(26,115,232,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#1765CC]">
        Post a role
      </Link>
    </div>
  )
}

function CardHeader({ icon: Icon, title, subtitle, tint = '#E8F0FE', accent = '#1A73E8' }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/80 bg-white/72 px-6 py-4">
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-[0_8px_18px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.88)_inset]" style={{ background: `linear-gradient(135deg, ${tint}, rgba(255,255,255,0.82))`, color: accent }}>
          <Icon size={16} strokeWidth={2.15} />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-[0.95rem] font-semibold text-[#202124]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">{subtitle}</p>}
      </div>
    </div>
  )
}

function GlassDropdown({ value, onChange, options, className = '', buttonClassName = '', menuClassName = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(option => option.value === value) || options[0]

  useEffect(() => {
    if (!open) return
    function closeOnOutside(event) {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative ${open ? 'z-[120]' : 'z-10'} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className={`flex items-center justify-between gap-3 rounded-full border border-white/85 bg-white/88 text-left font-semibold text-[#202124] shadow-[0_7px_18px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.98)_inset] outline-none transition-all hover:bg-white/95 focus:border-[#1A73E8] focus:shadow-[0_9px_22px_rgba(26,115,232,0.10),0_0_0_3px_rgba(26,115,232,0.10)] ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <ChevronDown size={15} className={`shrink-0 text-[#1A73E8] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute right-0 top-[calc(100%+8px)] z-[140] max-h-64 w-full overflow-y-auto overscroll-contain rounded-[18px] border border-white/85 bg-white/95 p-1.5 shadow-[0_18px_46px_rgba(26,115,232,0.14),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl ${menuClassName || 'min-w-48'}`}
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
                className={`flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2 text-left text-[0.82rem] font-semibold transition-colors ${
                  active
                    ? 'bg-[#E8F0FE] text-[#1A73E8]'
                    : 'text-[#3C4043] hover:bg-[#F8FBFF] hover:text-[#1A73E8]'
                }`}
                role="option"
                aria-selected={active}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {active && <CheckCircle2 size={14} className="shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// World bubble map — a dotted land grid with one bubble per country, sized by applicant count
const COUNTRY_ALIASES = {
  'united states': 'United States', 'usa': 'United States', 'us': 'United States', 'america': 'United States',
  'united kingdom': 'United Kingdom', 'uk': 'United Kingdom', 'england': 'United Kingdom', 'britain': 'United Kingdom',
  'uae': 'United Arab Emirates', 'south korea': 'South Korea', 'korea': 'South Korea',
  'palestine': 'Palestine', 'palestinian territories': 'Palestine',
}

// Longest names first so "United Arab Emirates" wins over partial matches
const COUNTRY_MATCHERS = Object.keys(COUNTRY_POINTS)
  .map(name => ({ name, needle: name.toLowerCase() }))
  .sort((a, b) => b.needle.length - a.needle.length)

function matchCountry(raw) {
  const key = String(raw || '').trim().toLowerCase()
  if (!key) return null
  for (const [alias, name] of Object.entries(COUNTRY_ALIASES)) {
    if (key === alias || key.endsWith(`, ${alias}`) || key.includes(alias)) return name
  }
  const exact = COUNTRY_MATCHERS.find(entry => entry.needle === key)
  if (exact) return exact.name
  const partial = COUNTRY_MATCHERS.find(entry => key.includes(entry.needle))
  return partial ? partial.name : null
}

// Groups applicant location strings into country bubbles + an "elsewhere" list
function groupLocations(locations) {
  const bubbles = new Map()
  const other = new Map()

  locations.forEach(raw => {
    const loc = String(raw || '').trim()
    if (!loc) return
    const country = matchCountry(loc)
    if (country) {
      const [x, y] = COUNTRY_POINTS[country]
      const entry = bubbles.get(country) || { label: country, x, y, count: 0 }
      entry.count += 1
      bubbles.set(country, entry)
    } else {
      const label = loc.split(',')[0].trim()
      other.set(label, (other.get(label) || 0) + 1)
    }
  })

  return {
    bubbles: [...bubbles.values()].sort((a, b) => b.count - a.count),
    other: [...other.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
  }
}

export function ApplicantMap({ locations }) {
  const { bubbles, other } = groupLocations(locations)
  const totalMapped = bubbles.reduce((sum, b) => sum + b.count, 0)
  const listTop = bubbles.slice(0, 6)
  const maxCount = Math.max(...bubbles.map(b => b.count), 1)

  // Neighbouring countries (e.g. Israel/Jordan/Egypt) can land almost on top of each
  // other — relax overlapping bubbles apart a little so every count stays readable.
  const placed = bubbles.map(bubble => ({
    ...bubble,
    r: Math.min(6 + Math.sqrt(bubble.count / maxCount) * 6, 12),
  }))
  for (let pass = 0; pass < 24; pass += 1) {
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i], b = placed[j]
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.max(Math.hypot(dx, dy), 0.01)
        const minDist = a.r + b.r + 1.5
        if (dist < minDist) {
          const push = (minDist - dist) / 2
          const ux = dx / dist, uy = dy / dist
          a.x -= ux * push; a.y -= uy * push
          b.x += ux * push; b.y += uy * push
        }
      }
    }
  }

  return (
    <div className="px-6 py-6">
      <svg viewBox="0 4 360 146" className="w-full overflow-visible" aria-label="World map of applicant locations">
        <defs>
          <linearGradient id="mapBubble" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4C9AEF" />
            <stop offset="100%" stopColor="#1A5FC4" />
          </linearGradient>
          <linearGradient id="mapLand" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DCE8FA" />
            <stop offset="100%" stopColor="#CFDFF7" />
          </linearGradient>
        </defs>
        <path d={WORLD_LAND} fill="url(#mapLand)" stroke="#B9D2F3" strokeWidth="0.35" strokeLinejoin="round" />

        {placed.map((bubble, index) => {
          const r = bubble.r
          return (
            <motion.g
              key={bubble.label}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.15 + index * 0.06, ease: 'easeOut' }}
              style={{ transformOrigin: `${bubble.x}px ${bubble.y}px` }}
            >
              <circle cx={bubble.x} cy={bubble.y} r={r + 3.5} fill="#1A73E8" opacity="0.15" />
              <circle cx={bubble.x} cy={bubble.y} r={r} fill="url(#mapBubble)" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x={bubble.x} y={bubble.y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={r > 9 ? 9 : 7.5} fontWeight="700" fill="#FFFFFF">
                {bubble.count}
              </text>
            </motion.g>
          )
        })}
      </svg>

      <div className="mt-6 border-t border-white/70 pt-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Top countries</p>
        {listTop.length > 0 ? (
          <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {listTop.map((bubble, index) => (
              <div key={bubble.label} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/70 text-[#1A73E8] shadow-[0_5px_12px_rgba(26,115,232,0.08)]">
                  <MapPin size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="truncate text-[0.8rem] text-[#3C4043]">{bubble.label}</p>
                    <span className="shrink-0 text-[0.78rem] font-medium text-[#202124]">{bubble.count}</span>
                  </div>
                  <Bar
                    percent={Math.max((bubble.count / maxCount) * 100, 6)}
                    height="h-2"
                    delay={index * 0.04}
                    label={`${bubble.label}: ${bubble.count} applicant${bubble.count !== 1 ? 's' : ''}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[0.82rem] leading-6 text-[#5F6368]">
            Countries light up on the map once students with a saved country apply.
          </p>
        )}

        {other.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {other.slice(0, 6).map(item => (
              <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/62 px-3 py-1.5 text-[0.72rem] font-medium text-[#5F6368] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
                {item.label} · {item.count}
              </span>
            ))}
          </div>
        )}

        {totalMapped > 0 && (
          <p className="mt-4 text-[0.78rem] leading-5 text-[#9AA0A6]">
            Bubble size follows applicant count — {totalMapped} applicant{totalMapped !== 1 ? 's' : ''} placed on the map.
          </p>
        )}
      </div>
    </div>
  )
}

// Horizontal bar on a shared scale — single hue with a light→dark gradient, rounded data-end
function Bar({ percent, color = '#1A73E8', colorDark = '#1765CC', height = 'h-7', delay = 0, label }) {
  return (
    <div className={`${height} w-full overflow-hidden rounded-full bg-white/72 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-white/65`} title={label}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: 'easeOut', delay }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${colorDark})` }}
      />
    </div>
  )
}

// Standing column — a real bar anchored to a shared baseline, on a soft full-height track
function VerticalBar({ percent, color = '#8AB4F8', colorDark = '#1A73E8', width = 'w-14', delay = 0, label }) {
  return (
    <div className={`relative flex h-full ${width} items-end justify-center overflow-hidden rounded-t-[10px] bg-white/70 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset] ring-1 ring-white/70`}>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${Math.max(percent, 2)}%` }}
        transition={{ duration: 0.6, ease: 'easeOut', delay }}
        className="w-full rounded-t-[10px]"
        style={{ background: `linear-gradient(180deg, ${color}, ${colorDark})` }}
        title={label}
      />
    </div>
  )
}

// Radial gauge — a single magnitude (average match score), same visual language as MatchRing elsewhere in the app
function MatchGauge({ score, size = 148 }) {
  const r = 58, circ = 2 * Math.PI * r
  const color = score >= 80 ? '#188038' : score >= 60 ? '#1A73E8' : '#B06000'
  const track = score >= 80 ? '#E6F4EA' : score >= 60 ? '#E8F0FE' : '#FEF7E0'
  return (
    <svg width={size} height={size} viewBox="0 0 148 148" aria-label={`${score}% average match`}>
      <circle cx="74" cy="74" r={r} fill="none" stroke={track} strokeWidth="12" />
      <motion.circle
        cx="74" cy="74" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 74 74)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
      />
      <text x="74" y="70" textAnchor="middle" fontSize="27" fontWeight="700" fill="#202124">{score}%</text>
      <text x="74" y="90" textAnchor="middle" fontSize="11" fontWeight="500" fill="#9AA0A6">avg match</text>
    </svg>
  )
}

// Small-multiple donut — an applicant pipeline mix (disjoint status buckets, so shares are honest).
// Rejected applicants are excluded from the ring, matching how "total" is treated elsewhere in the app.
// Each segment is a soft light→deeper pastel gradient (same technique as <Bar>), not a flat fill.
function MiniDonut({ segments, size = 52, strokeWidth = 7 }) {
  const gradientId = useId()
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const center = size / 2
  const total = segments.reduce((sum, seg) => sum + seg.value, 0)
  const gap = total > 1 ? 2.5 : 0
  let cumulative = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 overflow-visible">
      <defs>
        {segments.map((seg, i) => (
          <linearGradient key={seg.label} id={`${gradientId}-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={seg.color} />
            <stop offset="100%" stopColor={seg.colorDark || seg.color} />
          </linearGradient>
        ))}
        {segments.map((seg, i) => (
          <filter key={seg.label} id={`${gradientId}-glow-${i}`} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation={strokeWidth * 0.35} floodColor={seg.colorDark || seg.color} floodOpacity="0.55" />
          </filter>
        ))}
      </defs>
      <circle cx={center} cy={center} r={r} fill="none" stroke="#F1F3F4" strokeWidth={strokeWidth} />
      {total > 0 && segments.map((seg, i) => {
        if (seg.value <= 0) return null
        const rawLen = (seg.value / total) * circ
        const segLen = Math.max(rawLen - gap, 1)
        const dashoffset = -cumulative
        cumulative += rawLen
        return (
          <motion.circle
            key={seg.label}
            cx={center} cy={center} r={r} fill="none"
            stroke={`url(#${gradientId}-${i})`} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={`${segLen} ${circ - segLen}`}
            transform={`rotate(-90 ${center} ${center})`}
            style={{ filter: `url(#${gradientId}-glow-${i})` }}
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            animate={{ strokeDashoffset: dashoffset, opacity: 1 }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: 'easeOut' }}
          />
        )
      })}
    </svg>
  )
}

function SectionGroup({ icon: Icon, title, description, children }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/75 bg-white/72 text-[#1A73E8] shadow-[0_12px_28px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[1.35rem] font-semibold leading-tight text-[#202124]">{title}</h2>
          <p className="mt-0.5 text-[0.85rem] text-[#5F6368]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function Analytics() {
  const { user } = useApp()
  const [roles, setRoles] = useState([])
  const [applicants, setApplicants] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState('all')
  const [applicantView, setApplicantView] = useState('skills')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    async function loadAnalytics() {
      try {
        const [nextRoles, nextApplicants] = await Promise.all([
          withTimeout(fetchNgoOpportunities(user.id), 10000, 'fetchNgoOpportunities').catch(() => []),
          withTimeout(fetchNgoApplicants(user.id), 10000, 'fetchNgoApplicants').catch(() => []),
        ])

        if (cancelled) return
        setRoles(Array.isArray(nextRoles) ? nextRoles : [])
        setApplicants(Array.isArray(nextApplicants) ? nextApplicants : [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load analytics.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const data = useMemo(() => {
    const scopedRoles = selectedRoleId === 'all'
      ? roles
      : roles.filter(role => sameId(role.id, selectedRoleId))
    const scopedApplicants = selectedRoleId === 'all'
      ? applicants
      : applicants.filter(applicant => sameId(applicant.opportunityId, selectedRoleId))

    const roleHealth = scopedRoles.map(role => {
      const roleApplicants = applicants.filter(applicant => sameId(applicant.opportunityId, role.id))
      const interviews = roleApplicants.filter(applicant => toUiStatus(applicant.status) === 'interview').length
      const accepted = roleApplicants.filter(applicant => toUiStatus(applicant.status) === 'accepted').length
      const reviewing = roleApplicants.filter(applicant => {
        const status = toUiStatus(applicant.status)
        return status === 'new' || status === 'shortlisted'
      }).length
      const avgMatch = average(roleApplicants.map(applicant => applicant.match))
      const applicantCount = roleApplicants.length

      return {
        id: role.id,
        title: role.title || 'Untitled role',
        applicantCount,
        avgMatch,
        interviews,
        accepted,
        reviewing,
        health: getRoleHealth({ applicantCount, avgMatch, interviews, accepted }),
      }
    })

    const applied = scopedApplicants.length
    const interview = scopedApplicants.filter(applicant => {
      const status = toUiStatus(applicant.status)
      return status === 'interview' || status === 'accepted'
    }).length
    const accepted = scopedApplicants.filter(applicant => toUiStatus(applicant.status) === 'accepted').length

    const skills = new Map()
    scopedApplicants.forEach(applicant => {
      ;(applicant.skills || []).forEach(skill => {
        const name = skillName(skill)
        skills.set(name, (skills.get(name) || 0) + 1)
      })
    })
    const skillPool = [...skills.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 8)

    const fields = new Map()
    scopedApplicants.forEach(applicant => {
      const name = (applicant.field || '').trim()
      if (!name) return
      fields.set(name, (fields.get(name) || 0) + 1)
    })
    const fieldPool = [...fields.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 8)

    const languages = new Map()
    scopedApplicants.forEach(applicant => {
      ;(applicant.languages || []).forEach(entry => {
        const name = String(entry).split('(')[0].trim()
        if (!name) return
        languages.set(name, (languages.get(name) || 0) + 1)
      })
    })
    const languagePool = [...languages.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 8)

    const matchScores = scopedApplicants.map(applicant => applicant.match).filter(Number.isFinite)
    const avgMatchScore = average(matchScores)
    const matchBands = [
      { label: 'Strong fit', range: '80–100%', color: '#188038', count: matchScores.filter(m => m >= 80).length },
      { label: 'Good fit', range: '60–79%', color: '#1A73E8', count: matchScores.filter(m => m >= 60 && m < 80).length },
      { label: 'Needs review', range: 'Below 60%', color: '#B06000', count: matchScores.filter(m => m < 60).length },
    ]

    return {
      roles: scopedRoles,
      applicants: scopedApplicants,
      roleHealth,
      funnel: { applied, interview, accepted },
      skillPool,
      fieldPool,
      languagePool,
      avgMatchScore,
      matchBands,
    }
  }, [applicants, roles, selectedRoleId])

  // NGO's own posting patterns — always across all roles, independent of the role filter above
  const orgInsights = useMemo(() => {
    const categories = new Map()
    roles.forEach(role => {
      const name = (role.category || role.field || 'General').trim() || 'General'
      categories.set(name, (categories.get(name) || 0) + 1)
    })
    const categoryPool = [...categories.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    const workModes = { Remote: 0, Hybrid: 0, 'In-person': 0 }
    roles.forEach(role => {
      const mode = (role.workMode || '').toLowerCase()
      if (mode.includes('remote')) workModes.Remote += 1
      else if (mode.includes('hybrid')) workModes.Hybrid += 1
      else if (mode) workModes['In-person'] += 1
    })

    return { categoryPool, workModes }
  }, [roles])

  const hasActivity = roles.length > 0 || applicants.length > 0
  const { applied, interview, accepted } = data.funnel

  const APPLICANT_VIEWS = {
    skills: { label: 'Skills', heroLabel: 'Most in-demand', unit: 'skill', pool: data.skillPool, icon: null },
    fields: { label: 'Fields of study', heroLabel: 'Most common field', unit: 'field', pool: data.fieldPool, icon: GraduationCap },
    languages: { label: 'Languages', heroLabel: 'Most common language', unit: 'language', pool: data.languagePool, icon: Globe },
  }
  const activeView = APPLICANT_VIEWS[applicantView]
  const activeTop = activeView.pool[0]
  const activeRest = activeView.pool.slice(1, 5)
  const maxActiveRest = Math.max(...activeRest.map(item => item.count), 1)
  const rowIcon = name => (activeView.icon ? activeView.icon : skillIcon(name))
  const roleOptions = [
    { value: 'all', label: 'All roles' },
    ...roles.map(role => ({ value: role.id, label: role.title || 'Untitled role' })),
  ]
  const applicantViewOptions = Object.entries(APPLICANT_VIEWS).map(([key, view]) => ({
    value: key,
    label: view.label,
  }))

  const maxCategoryCount = Math.max(...orgInsights.categoryPool.map(cat => cat.count), 1)

  const roleHealthTotals = data.roleHealth.reduce((acc, role) => {
    acc.reviewing += role.reviewing
    acc.interviews += role.interviews
    acc.accepted += role.accepted
    return acc
  }, { reviewing: 0, interviews: 0, accepted: 0 })
  const totalActiveApplicants = roleHealthTotals.reviewing + roleHealthTotals.interviews + roleHealthTotals.accepted
  const singleRole = selectedRoleId !== 'all' && data.roleHealth.length === 1 ? data.roleHealth[0] : null
  const overallHealth = singleRole
    ? singleRole.health
    : getRoleHealth({
        applicantCount: totalActiveApplicants,
        avgMatch: data.avgMatchScore,
        interviews: roleHealthTotals.interviews,
        accepted: roleHealthTotals.accepted,
      })
  const overallSuggestion = getRoleSuggestion({ health: overallHealth })

  const funnelStages = [
    { label: 'Applied', icon: Users, count: applied, width: applied ? 100 : 0, note: 'All applications received' },
    { label: 'Interview', icon: MessageSquare, count: interview, width: pct(interview, applied), note: `${pct(interview, applied)}% of applied advanced` },
    { label: 'Accepted', icon: CheckCircle2, count: accepted, width: pct(accepted, interview), note: `${pct(accepted, interview)}% of interviews accepted` },
  ]

  const summaryStats = [
    { label: 'Active roles', value: data.roles.length, hint: selectedRoleId === 'all' ? 'Currently in scope' : 'Selected role' },
    { label: 'Applicants', value: applied, hint: 'Total applications' },
    { label: 'Interviews', value: interview, hint: `${pct(interview, applied)}% of applied` },
    { label: 'Accepted', value: accepted, hint: `${pct(accepted, interview)}% of interviews` },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F5F7FB]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.11),transparent_43%),radial-gradient(circle_at_88%_4%,rgba(255,255,255,0.96),transparent_22%),radial-gradient(circle_at_82%_8%,rgba(26,115,232,0.10),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.68),rgba(245,247,251,0))]" />

      <div className="relative mx-auto max-w-[1520px] px-6 py-10 lg:px-10">
        <div className="relative z-[300] mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[clamp(2.35rem,5vw,4.1rem)] font-semibold leading-none tracking-[-0.055em] text-[#202124]">
              Analytics
            </h1>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-7 text-[#5F6368]">
              A clear view of role activity, applicant movement, and candidate fit.
            </p>
          </div>

          {(loading || roles.length > 0) && (
            <div className="w-full max-w-xs rounded-2xl border border-white/90 bg-white/95 px-4 py-3 shadow-[0_14px_32px_rgba(26,115,232,0.06),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl">
              <span className="mb-1 block text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#5F6368]">Role</span>
              {loading ? (
                <div className="mt-2 h-5 w-32 animate-pulse rounded-full bg-[#F1F3F4]" />
              ) : (
                <GlassDropdown
                  value={selectedRoleId}
                  onChange={setSelectedRoleId}
                  options={roleOptions}
                  buttonClassName="h-10 w-full px-4 text-[0.88rem]"
                />
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#FAD2CF]/80 bg-white/78 px-4 py-3 text-[0.86rem] font-medium text-[#B3261E] shadow-[0_12px_30px_rgba(179,38,30,0.06),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="relative z-0 space-y-10">
            <section className="relative z-0 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map(item => (
                <div key={item} className="h-[140px] animate-pulse rounded-[24px] border border-white/90 bg-white/95 shadow-[0_16px_38px_rgba(26,115,232,0.05)] backdrop-blur-2xl" />
              ))}
            </section>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <div className="h-[360px] animate-pulse rounded-[24px] border border-white/90 bg-white/95 shadow-[0_16px_38px_rgba(26,115,232,0.05)] backdrop-blur-2xl" />
              <div className="h-[360px] animate-pulse rounded-[24px] border border-white/90 bg-white/95 shadow-[0_16px_38px_rgba(26,115,232,0.05)] backdrop-blur-2xl" />
            </div>
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
                <div className="h-[300px] animate-pulse rounded-[24px] border border-white/90 bg-white/95 shadow-[0_16px_38px_rgba(26,115,232,0.05)] backdrop-blur-2xl" />
                <div className="h-[300px] animate-pulse rounded-[24px] border border-white/90 bg-white/95 shadow-[0_16px_38px_rgba(26,115,232,0.05)] backdrop-blur-2xl" />
              </div>
              <div className="h-[260px] animate-pulse rounded-[24px] border border-white/90 bg-white/95 shadow-[0_16px_38px_rgba(26,115,232,0.05)] backdrop-blur-2xl" />
            </div>
          </div>
        ) : !hasActivity ? (
          <EmptyState />
        ) : (
          <div className="space-y-10">
            {/* KPI tiles — dashboard language: tinted icon badge, pastel waves, hover lift */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryStats.map((stat, index) => {
                const style = KPI_STYLES[index]
                const Icon = style.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: index * 0.05 }}
                    className="group relative overflow-hidden rounded-[24px] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,255,255,0.86))] p-5 shadow-[0_16px_42px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.98)_inset,0_-1px_0_rgba(26,115,232,0.025)_inset] ring-1 ring-white/55 backdrop-blur-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.018] hover:border-white hover:bg-white hover:shadow-[0_26px_62px_rgba(26,115,232,0.105),0_1px_0_rgba(255,255,255,1)_inset,0_-1px_0_rgba(26,115,232,0.02)_inset]"
                  >
                    <svg
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full transition-transform duration-300 group-hover:translate-y-[-2px]"
                      viewBox="0 0 300 100"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z" fill={style.tint} opacity="0.36" />
                      <path d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z" fill={style.tint} opacity="0.58" />
                    </svg>
                    <div className="relative z-10 flex items-start justify-between">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-[0_9px_20px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] transition-transform duration-200 group-hover:scale-110"
                        style={{ background: `linear-gradient(135deg, ${style.tint}, rgba(255,255,255,0.84))`, color: style.accent }}
                      >
                        <Icon size={18} strokeWidth={2.15} />
                      </span>
                      <p className="text-[0.78rem] font-medium text-[#5F6368]">{stat.label}</p>
                    </div>
                    <p className="relative z-10 mt-5 text-[2.15rem] font-semibold leading-none tracking-[-0.02em] text-[#202124]">{stat.value}</p>
                    <p className="relative z-10 mt-2 text-[0.78rem] text-[#5F6368]">{stat.hint}</p>
                  </motion.div>
                )
              })}
            </section>

            <SectionGroup icon={Layers} title="Your roles" description="How your own postings are performing">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
                {/* Role health — glassy applicant-mix donut, inline match bar, status chips */}
                <section className="overflow-visible rounded-[24px] border border-white/90 bg-white/95 shadow-[0_18px_48px_rgba(26,115,232,0.06),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl">
                  <CardHeader icon={Target} title="Role health" subtitle="See how each role is doing" tint="#E8F0FE" accent="#1A73E8" />

                  <div className="flex items-center gap-3 border-b border-white/80 bg-white/72 px-6 py-3">
                    <span className="shrink-0 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[#9AA0A6]">Role</span>
                    <GlassDropdown
                      value={selectedRoleId}
                      onChange={setSelectedRoleId}
                      options={roleOptions}
                      className="min-w-0 flex-1"
                      buttonClassName="h-9 w-full px-3.5 text-[0.82rem]"
                    />
                  </div>

                  {data.roleHealth.length > 0 ? (
                    <div className="px-6 py-6">
                      <div className="flex flex-wrap items-center justify-center gap-14">
                        <div className="flex items-center gap-9">
                          <MiniDonut
                            segments={[
                              { label: 'Applied', value: roleHealthTotals.reviewing, color: '#CBBFEF', colorDark: '#9B87D6' },
                              { label: 'Interview', value: roleHealthTotals.interviews, color: '#F9D3A8', colorDark: '#F0AE68' },
                              { label: 'Accepted', value: roleHealthTotals.accepted, color: '#B4E3C9', colorDark: '#7BC29A' },
                            ]}
                            size={172}
                            strokeWidth={20}
                          />
                          <div className="space-y-3">
                            <p className="flex items-center gap-2.5 text-[0.86rem] text-[#3C4043]">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: 'linear-gradient(135deg, #CBBFEF, #9B87D6)', boxShadow: '0 0 8px 2px rgba(155,135,214,0.5)' }} />
                              <span className="font-semibold text-[#202124]">{roleHealthTotals.reviewing}</span> Applied
                            </p>
                            <p className="flex items-center gap-2.5 text-[0.86rem] text-[#3C4043]">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: 'linear-gradient(135deg, #F9D3A8, #F0AE68)', boxShadow: '0 0 8px 2px rgba(240,174,104,0.5)' }} />
                              <span className="font-semibold text-[#202124]">{roleHealthTotals.interviews}</span> Interview
                            </p>
                            <p className="flex items-center gap-2.5 text-[0.86rem] text-[#3C4043]">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: 'linear-gradient(135deg, #B4E3C9, #7BC29A)', boxShadow: '0 0 8px 2px rgba(123,194,154,0.5)' }} />
                              <span className="font-semibold text-[#202124]">{roleHealthTotals.accepted}</span> Accepted
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center gap-3">
                          <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/68 text-[#7C6BC4] shadow-[0_5px_14px_rgba(124,107,196,0.08)]">
                              <Users size={14} />
                            </span>
                            <div>
                              <p className="text-[1.15rem] font-semibold leading-none tracking-[-0.02em] text-[#202124]">{totalActiveApplicants}</p>
                              <p className="mt-1 text-[0.7rem] text-[#9AA0A6]">{selectedRoleId === 'all' ? 'Applicants across roles' : 'Applicants'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/68 text-[#3C9C6C] shadow-[0_5px_14px_rgba(60,156,108,0.08)]">
                              <Percent size={14} />
                            </span>
                            <div>
                              <p className="text-[1.15rem] font-semibold leading-none tracking-[-0.02em] text-[#202124]">{data.avgMatchScore}%</p>
                              <p className="mt-1 text-[0.7rem] text-[#9AA0A6]">Average match</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const cfg = HEALTH_CONFIG[overallHealth]
                        const Icon = cfg.icon
                        return (
                          <div className="mt-7 border-t border-white/70 pt-6">
                            {selectedRoleId === 'all' && (
                              <p className="mb-2 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#9AA0A6]">Average status across all your roles</p>
                            )}
                            <div className="flex items-start gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/70 shadow-[0_6px_14px_rgba(26,115,232,0.08)]" style={{ background: `linear-gradient(135deg, ${cfg.tint}, rgba(255,255,255,0.82))`, color: cfg.accent }}>
                                <Icon size={16} />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[0.9rem] font-semibold" style={{ color: cfg.accent }}>{overallHealth}</p>
                                <p className="mt-0.5 text-[0.82rem] leading-snug text-[#5F6368]">{cfg.description}</p>
                                {overallSuggestion && (
                                  <p className="mt-2.5 flex items-start gap-1.5 text-[0.82rem] leading-5 text-[#5F6368]">
                                    <Lightbulb size={14} className="mt-0.5 shrink-0 text-[#B06000]" />
                                    {overallSuggestion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-[0.9rem] font-medium text-[#202124]">No roles match this filter</p>
                    </div>
                  )}
                </section>

                {/* Role focus — the NGO's own posting patterns, independent of the role filter */}
                <section className="overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_18px_48px_rgba(26,115,232,0.06),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl">
                  <CardHeader icon={Layers} title="Role focus" subtitle="What kind of roles you post most" tint="#F3E8FD" accent="#A142F4" />
                  {orgInsights.categoryPool.length > 0 ? (
                    <div className="px-6 py-5">
                      <div className="space-y-3.5">
                        {orgInsights.categoryPool.map((cat, index) => {
                          const CatIcon = skillIcon(cat.name)
                          return (
                            <div key={cat.name} className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/68 text-[#A142F4] shadow-[0_5px_14px_rgba(161,66,244,0.08)]">
                                <CatIcon size={14} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <p className="truncate text-[0.8rem] text-[#3C4043]">{cat.name}</p>
                                  <span className="shrink-0 rounded-full border border-white/70 bg-white/64 px-2 py-0.5 text-[0.72rem] font-bold text-[#A142F4] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">{cat.count}</span>
                                </div>
                                <Bar
                                  percent={Math.max((cat.count / maxCategoryCount) * 100, 4)}
                                  color="#C58AF9" colorDark="#A142F4"
                                  height="h-2"
                                  delay={index * 0.04}
                                  label={`${cat.name}: ${cat.count} role${cat.count !== 1 ? 's' : ''}`}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/70 pt-4">
                        {Object.entries(orgInsights.workModes).filter(([, count]) => count > 0).map(([mode, count]) => (
                          <span key={mode} className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/62 px-3 py-1.5 text-[0.72rem] font-medium text-[#A142F4] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
                            <MapPin size={11} />
                            {mode} · {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-[0.9rem] font-medium text-[#202124]">No roles posted yet</p>
                      <p className="mt-1 text-[0.8rem] text-[#5F6368]">Post a role to see your organization's focus areas.</p>
                    </div>
                  )}
                </section>
              </div>
            </SectionGroup>

            <SectionGroup icon={Users} title="Your applicants" description="What you're learning from the students applying">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              {/* Where applicants live — bubble map, size follows count */}
              <section className="overflow-visible rounded-[24px] border border-white/90 bg-white/95 shadow-[0_18px_48px_rgba(26,115,232,0.06),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl">
                <CardHeader icon={MapPin} title="Where applicants live" subtitle="Locations across your candidate pool" tint="#FEF7E0" accent="#F29900" />
                <ApplicantMap locations={data.applicants.map(applicant => applicant.studentLocation)} />
              </section>

                {/* Match quality — radial gauge + score bands, gives instant read on candidate fit */}
                <section className="overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_18px_48px_rgba(26,115,232,0.06),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl">
                  <CardHeader icon={Percent} title="Match quality" subtitle="Candidate fit across your pool" tint="#E6F4EA" accent="#188038" />
                  {data.applicants.length > 0 ? (
                    <div className="flex flex-col items-center px-6 py-6">
                      <MatchGauge score={data.avgMatchScore} />
                      <div className="mt-6 w-full space-y-3.5">
                        {(() => {
                          const maxBand = Math.max(...data.matchBands.map(b => b.count), 1)
                          return data.matchBands.map((band, index) => (
                            <div key={band.label} className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: band.color, boxShadow: `0 0 6px 1.5px ${band.color}55` }} />
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <p className="truncate text-[0.8rem] text-[#3C4043]">
                                    {band.label}
                                    <span className="ml-1.5 text-[0.7rem] text-[#9AA0A6]">{band.range}</span>
                                  </p>
                                  <span className="shrink-0 text-[0.82rem] font-semibold text-[#202124]">{band.count}</span>
                                </div>
                                <Bar
                                  percent={Math.max((band.count / maxBand) * 100, band.count > 0 ? 6 : 0)}
                                  color={band.color} colorDark={band.color}
                                  height="h-2"
                                  delay={index * 0.06}
                                  label={`${band.label}: ${band.count} applicant${band.count !== 1 ? 's' : ''}`}
                                />
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-[0.9rem] font-medium text-[#202124]">No match scores yet</p>
                      <p className="mt-1 text-[0.8rem] text-[#5F6368]">Scores appear once students apply.</p>
                    </div>
                  )}
                </section>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(340px,1.1fr)]">
                {/* Hiring funnel — icon per stage, gradient fill, common scale */}
                <section className="overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_18px_48px_rgba(26,115,232,0.06),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl">
                  <CardHeader
                    icon={BarChart3}
                    title="Hiring funnel"
                    subtitle="How applicants move from applying to acceptance"
                    tint="#E8F0FE" accent="#1A73E8"
                  />
                  <div className="px-6 py-6">
                    <div className="relative flex h-[190px] items-end justify-center gap-8 sm:gap-12">
                      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0">
                        {[0, 0.25, 0.5, 0.75].map(f => (
                          <div
                            key={f}
                            className={`absolute inset-x-0 ${f === 0 ? 'border-t border-[#DADCE0]' : 'border-t border-[#F1F3F4]'}`}
                            style={{ bottom: `${f * 100}%` }}
                          />
                        ))}
                      </div>
                      {funnelStages.map((stage, index) => {
                        return (
                          <div key={stage.label} className="relative z-10 flex h-full flex-col items-center justify-end">
                            <p className="mb-2 text-[1.3rem] font-semibold leading-none text-[#202124]">{stage.count}</p>
                            <VerticalBar
                              percent={Math.max(stage.width, stage.count > 0 ? 4 : 0)}
                              delay={index * 0.08}
                              label={`${stage.label}: ${stage.count}`}
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 flex justify-center gap-8 sm:gap-12">
                      {funnelStages.map((stage, index) => {
                        const StageIcon = stage.icon
                        return (
                          <div key={stage.label} className="flex w-16 flex-col items-center text-center">
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/70 bg-white/68 text-[#1A73E8] shadow-[0_4px_10px_rgba(26,115,232,0.08)]">
                                <StageIcon size={11} />
                              </span>
                              <p className="text-[0.8rem] font-medium text-[#202124]">{stage.label}</p>
                            </div>
                            {index > 0 && (
                              <p className="mt-1 text-[0.68rem] leading-tight text-[#9AA0A6]">{stage.note}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <p className="mt-5 text-center text-[0.78rem] leading-5 text-[#9AA0A6]">
                      Bars share one scale — each stage is shown as a share of all {applied} application{applied !== 1 ? 's' : ''}.
                    </p>
                  </div>
                </section>

              {/* About your applicants — switch between skills / fields of study / languages */}
              <section className="overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_18px_48px_rgba(26,115,232,0.06),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/80 bg-white/72 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-[linear-gradient(135deg,#F3E8FD,rgba(255,255,255,0.84))] text-[#A142F4] shadow-[0_8px_18px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.88)_inset]">
                      <Sparkles size={16} strokeWidth={2.15} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[0.95rem] font-semibold text-[#202124]">About your applicants</h2>
                      <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">What your candidate pool looks like</p>
                    </div>
                  </div>
                  <GlassDropdown
                    value={applicantView}
                    onChange={setApplicantView}
                    options={applicantViewOptions}
                    buttonClassName="h-9 min-w-40 px-3.5 text-[0.78rem]"
                    menuClassName="min-w-40"
                  />
                </div>
                {activeTop ? (
                  <div className="px-6 py-5">
                    <motion.div
                      key={applicantView}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 flex items-center gap-4 rounded-[22px] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(232,240,254,0.48))] p-4 shadow-[0_14px_34px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.94)_inset] backdrop-blur-2xl"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/75 bg-white/78 text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.11),0_1px_0_rgba(255,255,255,0.92)_inset]">
                        {(() => { const TopIcon = rowIcon(activeTop.name); return <TopIcon size={22} strokeWidth={1.9} /> })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#1A73E8]">{activeView.heroLabel}</p>
                        <p className="truncate text-[1.02rem] font-semibold text-[#202124]">{activeTop.name}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[1.3rem] font-semibold leading-none text-[#202124]">{activeTop.count}</p>
                        <p className="mt-1 text-[0.66rem] text-[#5F6368]">applicant{activeTop.count !== 1 ? 's' : ''}</p>
                      </div>
                    </motion.div>

                    {activeRest.length > 0 && (
                      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                        {activeRest.map((item, index) => {
                          const Icon = rowIcon(item.name)
                          return (
                            <div key={item.name} className="flex items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/62 text-[#5F6368] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
                                <Icon size={13} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <p className="truncate text-[0.8rem] text-[#3C4043]">{item.name}</p>
                                  <span className="shrink-0 text-[0.78rem] font-medium text-[#202124]">{item.count}</span>
                                </div>
                                <Bar
                                  percent={Math.max((item.count / maxActiveRest) * 100, 4)}
                                  height="h-2"
                                  delay={index * 0.04}
                                  label={`${item.name}: ${item.count} applicant${item.count !== 1 ? 's' : ''}`}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-[0.9rem] font-medium text-[#202124]">No {activeView.unit} data yet</p>
                    <p className="mt-1 text-[0.8rem] text-[#5F6368]">This fills in once students apply.</p>
                  </div>
                )}
              </section>
              </div>
            </SectionGroup>
          </div>
        )}
      </div>
    </main>
  )
}
