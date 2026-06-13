import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Briefcase, Clock, CheckCircle2, XCircle, Calendar, ChevronRight, MapPin,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import DashboardEmptyState from '../components/DashboardEmptyState'
import { fetchStudentApplications } from '../services/applications'

const STATUS_CFG = {
  interview:    { color: 'text-emerald-700', bg: 'bg-emerald-50',  icon: Calendar    },
  under_review: { color: 'text-[#D99E00]',   bg: 'bg-amber-50',   icon: Clock       },
  submitted:    { color: 'text-indigo-600',  bg: 'bg-indigo-50',  icon: CheckCircle2 },
  shortlisted:  { color: 'text-violet-600',  bg: 'bg-violet-50',  icon: CheckCircle2 },
  accepted:     { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  rejected:     { color: 'text-red-500',     bg: 'bg-red-50',     icon: XCircle     },
}

// ─── Application journey steps ────────────────────────────────────────────────

const JOURNEY = [
  {
    num: '01',
    title: 'You apply',
    desc: 'Your profile is attached automatically. The NGO receives your skills, goals, and match score.',
    color: '#6366F1',
  },
  {
    num: '02',
    title: 'Under review',
    desc: "The NGO reviews candidates. This typically takes 1-2 weeks. You'll see the status update here.",
    color: '#D99E00',
  },
  {
    num: '03',
    title: 'Interview',
    desc: "If shortlisted, you'll be invited to interview directly through Hive. Prep questions are generated for you.",
    color: '#059669',
  },
  {
    num: '04',
    title: 'Start your work',
    desc: 'Once accepted, you and the NGO coordinate the start date, hours, and deliverables together.',
    color: '#FFB703',
  },
]

function ApplicationJourney() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.35 }}
      className="mt-5">
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-3 ml-0.5">
        How applications work on Hive
      </p>

      <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.07)] overflow-hidden">
        <div className="grid sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(13,24,61,0.07)]">
          {JOURNEY.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 + i * 0.07 }}
              className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                  style={{ background: `${step.color}18`, color: step.color }}>
                  {step.num}
                </span>
                {i < JOURNEY.length - 1 && (
                  <ChevronRight size={10} className="text-[#4B6382]/30 hidden sm:block ml-auto"/>
                )}
              </div>
              <p className="text-[12px] font-bold text-[#0D183D]">{step.title}</p>
              <p className="text-[11px] text-[#4B6382] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom tip row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.52 }}
          className="px-4 py-3 flex items-center gap-3 border-t border-[rgba(13,24,61,0.06)]"
          style={{ background: 'rgba(13,24,61,0.02)' }}>
          <span className="text-[#FFB703] text-sm shrink-0">✦</span>
          <p className="text-[11px] text-[#4B6382] leading-relaxed">
            <strong className="text-[#0D183D]">Tip:</strong> Apply to 3–5 opportunities to increase your chances.
            Your AI match score is shown to NGOs — a higher score means a stronger fit.
          </p>
          <Link to="/matches"
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#0D183D' }}>
            View matches
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Applications() {
  const { user } = useApp()
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('All')

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    fetchStudentApplications(user.id)
      .then(setApps)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  const filtered = tab === 'All' ? apps
    : tab === 'Active' ? apps.filter(a => a.status !== 'rejected')
    : apps.filter(a => a.status === 'interview')

  const TAB_COUNTS = {
    All:        apps.length,
    Active:     apps.filter(a => a.status !== 'rejected').length,
    Interviews: apps.filter(a => a.status === 'interview').length,
  }

  const isEmpty = !loading && filtered.length === 0

  return (
    <div className="max-w-[1100px] mx-auto px-10 py-12">

      {/* ── Page header ── */}
      <div className="mb-4">
        <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">My Applications</h1>
        <p className="text-[13px] text-[#4B6382] mt-0.5">
          {loading
            ? 'Loading…'
            : apps.length === 0
            ? 'Apply to NGOs and track every stage of your journey here'
            : 'Track all your applications in one place'}
        </p>
      </div>

      {/* Summary chips — only when there's data */}
      {!loading && apps.length > 0 && (
        <div className="flex gap-3 mb-6">
          {Object.entries(TAB_COUNTS).map(([label, count]) => (
            <button
              key={label}
              onClick={() => setTab(label)}
              className={`rounded-2xl border px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                tab === label
                  ? 'bg-[#0D183D] border-[#0D183D]'
                  : 'bg-white border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB]'
              }`}>
              <span className={`text-[18px] font-extrabold ${tab === label ? 'text-white' : 'text-[#0D183D]'}`}>
                {count}
              </span>
              <span className={`text-[12px] ${tab === label ? 'text-white/70' : 'text-[#4B6382]'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-5 py-4 h-20 animate-pulse"/>
          ))}
        </div>
      )}

      {/* ── Empty state + journey guide ── */}
      {isEmpty && (
        <>
          <DashboardEmptyState
            icon={Briefcase}
            title="Your application hive is empty"
            description="Find an NGO that needs your skills and send your first application. Every stage — from submitted to accepted — is tracked here."
            cta={{ label: 'Browse opportunities', href: '/opportunities' }}
            tip="Applications are tracked in real time. You'll see status updates the moment an NGO acts."
          />
          <ApplicationJourney />
        </>
      )}

      {/* ── Application list ── */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((a, i) => {
            const cfg = STATUS_CFG[a.status] || STATUS_CFG.submitted
            const Icon = cfg.icon
            return (
              <motion.div key={a.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-5 py-4 flex items-start gap-4 hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)] transition-all">
                <GradientAvatar name={a.ngoName || 'NGO'} size={44} radius="0.65rem" className="mt-0.5 shrink-0"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-[13px] font-bold text-[#0D183D] leading-snug">{a.ngoName || 'NGO'}</p>
                      <p className="text-[11px] text-[#4B6382]">
                        {a.role || 'Opportunity'}
                        {a.location
                          ? <span className="inline-flex items-center gap-0.5 ml-1"><MapPin size={9}/>{a.location}</span>
                          : null}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                      <Icon size={10}/> {a.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-[#4B6382]">
                      {new Date(a.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    {a.status !== 'rejected' && (
                      <Link to="/messages"
                        className="text-[11px] font-semibold flex items-center gap-0.5 transition-opacity hover:opacity-70"
                        style={{ color: '#FFB703' }}>
                        Message <ChevronRight size={11}/>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
