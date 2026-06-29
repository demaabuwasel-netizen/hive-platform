import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase, Users, BarChart2, TrendingUp, ArrowUp, ArrowDown,
  Star, Calendar, Check, Lock, Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

// ─── Real data ────────────────────────────────────────────────────────────────
// Populate these once the analytics service is wired up.
// Empty arrays → onboarding state. Non-empty → active state.

const STATS        = []
const MONTHLY      = []
const MONTHS       = []
const TOP_SKILLS   = []
const RECENT_MATCHES = []

const MAX_VAL = MONTHLY.length > 0 ? Math.max(...MONTHLY) : 1

// ─── Honeycomb watermark ──────────────────────────────────────────────────────

function HexBg({ opacity = 0.13 }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      <defs>
        <pattern id="analytics-hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <path d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z"
            fill="#FFB703"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#analytics-hex)"/>
    </svg>
  )
}

// ─── Empty / onboarding state ─────────────────────────────────────────────────

function AnalyticsEmptyState({ navigate }) {
  const CHECKLIST = [
    { done: true,  current: false, label: 'Organization profile completed' },
    { done: false, current: true,  label: 'First opportunity published'    },
    { done: false, current: false, label: 'First applicant received'       },
    { done: false, current: false, label: 'First interview conducted'      },
    { done: false, current: false, label: 'First volunteer accepted'       },
  ]

  const UNLOCK_ITEMS = [
    'Applicant funnel & conversion rates',
    'Top applicant skills breakdown',
    'Match quality distribution',
    'Interview success rate',
    'Volunteer acceptance rate',
    'Monthly application volume',
  ]

  return (
    <div className="grid lg:grid-cols-[1fr_268px] gap-5">

      {/* ── Main onboarding card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden border border-[rgba(13,24,61,0.08)]"
        style={{ boxShadow: '0 2px 16px rgba(13,24,61,0.07)' }}>

        {/* Dark header with honeycomb + bar-chart illustration */}
        <div className="relative overflow-hidden px-7 py-7" style={{ background: '#0D183D', minHeight: 168 }}>
          <HexBg />

          {/* Decorative hex cluster */}
          <div className="absolute right-24 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.18 }}>
            <svg width="96" height="108" viewBox="0 0 96 108" fill="none">
              <polygon points="48,6 84,27 84,69 48,90 12,69 12,27" stroke="#FFB703" strokeWidth="1.5"/>
              <polygon points="48,20 74,35 74,65 48,80 22,65 22,35" fill="#FFB703" fillOpacity="0.25" stroke="#FFB703" strokeWidth="1"/>
              <polygon points="48,33 63,42 63,60 48,69 33,60 33,42" fill="#FFB703" fillOpacity="0.5"/>
            </svg>
          </div>

          {/* Mini bar-chart illustration */}
          <div className="absolute right-6 bottom-5 pointer-events-none" style={{ opacity: 0.14 }}>
            <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
              <rect x="0"  y="36" width="10" height="16" rx="2" fill="#FFB703"/>
              <rect x="13" y="22" width="10" height="30" rx="2" fill="#FFB703"/>
              <rect x="26" y="10" width="10" height="42" rx="2" fill="#FFB703"/>
              <rect x="39" y="18" width="10" height="34" rx="2" fill="#FFB703"/>
              <rect x="52" y="4"  width="10" height="48" rx="2" fill="#FFB703"/>
            </svg>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2.5" style={{ color: '#FFB703' }}>
              ✦ Analytics
            </p>
            <h2 className="text-[1.22rem] font-extrabold text-white leading-snug mb-2">
              Your analytics hive is waiting for data
            </h2>
            <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Analytics will become available after you publish opportunities and start receiving applications.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-7 py-6">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-4">
            Setup progress:
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

                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  step.done ? 'bg-emerald-500' : step.current ? 'border-2 border-[#FFB703]' : 'border border-[rgba(13,24,61,0.18)]'
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

          <div className="flex flex-col gap-2.5">
            <button onClick={() => navigate('/opportunities/new')}
              className="w-full py-3 rounded-xl text-[13px] font-semibold text-[#0D183D] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#FFB703', boxShadow: '0 4px 14px rgba(255,183,3,0.28)' }}>
              Post your first opportunity →
            </button>
            <button onClick={() => navigate('/how-it-works')}
              className="w-full py-2.5 rounded-xl text-[12px] font-semibold border text-[#4B6382] hover:bg-[rgba(13,24,61,0.03)] transition-colors"
              style={{ borderColor: 'rgba(13,24,61,0.12)' }}>
              Learn what analytics you'll unlock
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Right sidebar ── */}
      <aside className="flex flex-col gap-4">

        {/* What you'll unlock */}
        <motion.div
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: '#0D183D' }}>

          <div>
            <p className="text-[10px] font-extrabold text-[#FFB703] uppercase tracking-widest mb-1">
              What you'll unlock
            </p>
            <p className="text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Available after your first opportunity
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {UNLOCK_ITEMS.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.07 }}
                className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,183,3,0.12)', border: '1px solid rgba(255,183,3,0.2)' }}>
                  <Lock size={7} style={{ color: '#FFB703' }}/>
                </div>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Analytics unlock progress */}
        <motion.div
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="bg-white rounded-2xl p-5 border flex flex-col gap-3"
          style={{ borderColor: 'rgba(13,24,61,0.08)' }}>

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold text-[#0D183D] uppercase tracking-widest">
              Analytics unlock
            </p>
            <span className="text-[11px] font-extrabold" style={{ color: '#FFB703' }}>20%</span>
          </div>

          <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(13,24,61,0.07)' }}>
            <motion.div className="h-1.5 rounded-full" style={{ background: '#FFB703' }}
              initial={{ width: 0 }} animate={{ width: '20%' }}
              transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}/>
          </div>

          <p className="text-[11px] text-[#4B6382] leading-relaxed">
            Post your first opportunity to start generating analytics data.
          </p>
        </motion.div>
      </aside>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const navigate  = useNavigate()
  const hasData   = STATS.length > 0 || MONTHLY.length > 0 || TOP_SKILLS.length > 0

  return (
    <div className="max-w-5xl mx-auto px-8 py-7">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Analytics</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">
            {hasData ? 'Insights into your matching activity and impact' : 'Complete your setup to unlock insights'}
          </p>
        </div>
        {hasData && (
          <select className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#0D183D] bg-white border border-[rgba(13,24,61,0.08)] outline-none cursor-pointer">
            <option>Last 12 months</option>
            <option>Last 6 months</option>
            <option>Last 30 days</option>
          </select>
        )}
      </div>

      {/* ── State 1: No data — onboarding ── */}
      {!hasData && <AnalyticsEmptyState navigate={navigate} />}

      {/* ── State 2: Active NGO — real analytics ── */}
      {hasData && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.05 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-4 py-4 hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)] transition-shadow">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                  <s.icon size={16} className={s.color} strokeWidth={2}/>
                </div>
                <p className="text-[22px] font-extrabold text-[#0D183D] leading-none mb-1">{s.value}</p>
                <p className="text-[11px] text-[#4B6382] mb-1.5">{s.label}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {s.up ? <ArrowUp size={10}/> : <ArrowDown size={10}/>} {s.delta} vs last period
                </span>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-5 mb-5">
            {/* Bar chart */}
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[14px] font-extrabold text-[#0D183D]">Applicant volume</p>
                  <p className="text-[12px] text-[#4B6382]">Monthly student applications</p>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                  <TrendingUp size={13}/> Growing
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-36">
                {MONTHLY.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className="w-full rounded-t-lg"
                      style={{ background: i === MONTHLY.length - 1 ? '#FFB703' : 'rgba(13,24,61,0.08)', minHeight: 4 }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(v / MAX_VAL) * 120}px` }}
                      transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}/>
                    <p className="text-[9px] text-[#4B6382]">{MONTHS[i]?.slice(0, 1)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top skills */}
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
              <p className="text-[14px] font-extrabold text-[#0D183D] mb-5">Top applicant skills</p>
              <div className="flex flex-col gap-3.5">
                {TOP_SKILLS.map((s, i) => (
                  <div key={s.skill}>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="font-medium text-[#0D183D]">{s.skill}</span>
                      <span className="font-bold text-[#4B6382]">{s.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(13,24,61,0.07)' }}>
                      <motion.div className="h-1.5 rounded-full"
                        style={{ background: i === 0 ? '#FFB703' : '#0D183D', opacity: i === 0 ? 1 : 0.5 + (0.5 * (1 - i / 6)) }}
                        initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: 'easeOut' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent quality matches */}
          {RECENT_MATCHES.length > 0 && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 mb-5">
              <p className="text-[14px] font-extrabold text-[#0D183D] mb-5">Recent high-quality matches</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {RECENT_MATCHES.map((m, i) => (
                  <motion.div key={m.name}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(13,24,61,0.07)] hover:bg-[#F8F9FB] transition-colors">
                    <GradientAvatar name={m.name} size={36} radius="0.6rem"/>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-[#0D183D] truncate leading-snug">{m.name}</p>
                      <p className="text-[10px] text-[#4B6382] truncate">{m.field}</p>
                      <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">{m.score}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recruitment funnel — only with real data */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 mb-5">
            <div className="mb-5">
              <p className="text-[14px] font-extrabold text-[#0D183D]">Recruitment funnel</p>
              <p className="text-[12px] text-[#4B6382]">From opportunity view to accepted volunteer</p>
            </div>
            <p className="text-[13px] text-[#4B6382] text-center py-8">Funnel data will appear here once applications arrive.</p>
          </div>

          {/* Engagement metrics */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'Avg. response time',   value: '—', desc: 'From application to first reply'         },
              { label: 'Application rate',     value: '—', desc: 'Of profile views that become applications' },
              { label: 'Interview close rate', value: '—', desc: 'Of interviews that lead to acceptance'   },
            ].map((m, i) => (
              <motion.div key={m.label}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5">
                <p className="text-[24px] font-extrabold text-[#0D183D] leading-none mb-1">{m.value}</p>
                <p className="text-[12px] font-semibold text-[#0D183D] mb-1">{m.label}</p>
                <p className="text-[11px] text-[#4B6382]">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
