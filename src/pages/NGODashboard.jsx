import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Users,
  Zap,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchNgoApplicants } from '../services/applications'
import { fetchNgoOpportunities } from '../services/opportunities'
import { supabase } from '../services/supabase'
import { computeMatch } from '../services/matching'
import dashboardIllustration from '../assets/ngo dashboard.PNG'

const QUICK_ACTIONS = [
  {
    icon: Users,
    title: 'Applicants',
    description: 'Review queue',
    to: '/applicants',
    tint: '#E8F0FE',
    accent: '#1A73E8',
  },
  {
    icon: Zap,
    title: 'Matches',
    description: 'Find fit',
    to: '/matches',
    tint: '#E6F4EA',
    accent: '#188038',
  },
  {
    icon: MessageSquare,
    title: 'Interviews',
    description: 'Schedule calls',
    to: '/interviews',
    tint: '#FEF7E0',
    accent: '#F29900',
  },
  {
    icon: BarChart2,
    title: 'Analytics',
    description: 'View trends',
    to: '/analytics',
    tint: '#F3E8FD',
    accent: '#A142F4',
  },
]

function QuickActionCard({ action, delay = 0, count = null }) {
  const Icon = action.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className="group relative overflow-hidden rounded-[24px] border bg-white p-4 shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(17,24,39,0.09)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}
    >
      {/* Accent strip revealed on hover */}
      <span
        className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, ${action.accent}, ${action.tint})` }}
      />

      {/* Faded pastel waves in the card's own tint */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full transition-transform duration-300 group-hover:translate-y-[-2px]"
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z"
          fill={action.tint}
          opacity="0.55"
        />
        <path
          d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z"
          fill={action.tint}
          opacity="0.85"
        />
      </svg>

      <Link to={action.to} className="absolute inset-0" aria-label={action.title} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
          style={{ background: action.tint, color: action.accent }}
        >
          <Icon size={18} strokeWidth={2.15} />
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC] text-[#9CA3AF] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#1A73E8]"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(17,24,39,0.05)' }}
        >
          <ChevronRight size={16} />
        </div>
      </div>

      <div className="relative z-10 mt-10">
        <div className="flex items-center gap-2">
          <h3 className="text-[0.98rem] font-semibold text-[#202124]">{action.title}</h3>
          {typeof count === 'number' && count > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[0.7rem] font-bold"
              style={{ background: action.tint, color: action.accent }}
            >
              {count}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[0.88rem] text-[#5F6368]">{action.description}</p>
      </div>
    </motion.div>
  )
}

function RoleCard({ opportunity, applicantCount, index, onOpen }) {
  const title = opportunity?.title || 'Opportunity'
  const tag = opportunity?.workMode || opportunity?.category || opportunity?.field || 'Open role'
  const summary = opportunity?.description || opportunity?.missionImpact || opportunity?.summary || ''

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.06 * index }}
      className="group snap-start shrink-0 w-full lg:w-[calc((100%-2rem)/3)] min-w-[260px] min-h-[190px] cursor-pointer rounded-[24px] border bg-white p-4 shadow-[0_1px_0_rgba(17,24,39,0.02),0_10px_26px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#BFD7FF] hover:shadow-[0_18px_40px_rgba(26,115,232,0.10)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(opportunity)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.(opportunity)
        }
      }}
      aria-label={`Open role ${title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#1A73E8] transition-transform duration-200 group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #E8F0FE 0%, #D2E3FC 100%)' }}
          >
            <Briefcase size={18} strokeWidth={2.15} />
          </div>
          <div>
            <p className="text-[0.92rem] font-semibold text-[#202124] transition-colors group-hover:text-[#1A73E8]">{title}</p>
            <p className="mt-0.5 text-[0.76rem] text-[#5F6368]">{tag}</p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[0.68rem] font-semibold text-[#188038]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34A853]" />
          </span>
          Open
        </span>
      </div>

      <div className="mt-4 rounded-[18px] border border-dashed border-[#E5EEFB] bg-[#FBFCFE] px-3 py-3 transition-colors group-hover:border-[#D7E6FF] group-hover:bg-[#F8FBFF]">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
          Overview
        </p>
        <p
          className="mt-2 text-[0.83rem] leading-6 text-[#5F6368]"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {summary || 'Role details available in the opportunity page.'}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
            Applicants
          </p>
          <p className="mt-1 inline-flex items-center gap-2 text-[1.05rem] font-semibold text-[#202124]">
            <Users size={15} className="text-[#1A73E8]" />
            {applicantCount}
          </p>
        </div>

        <span className="text-[0.78rem] font-semibold text-[#1A73E8] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View role →
        </span>
      </div>
    </motion.article>
  )
}

export default function NGODashboard() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const rolesRef = useRef(null)

  const [applicants, setApplicants] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [topMatches, setTopMatches] = useState([])

  const orgName = profile?.name || user?.name || 'Organization'

  const interviewCount = applicants.filter(app => app?.status === 'interview').length

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    async function loadData() {
      setLoading(true)

      try {
        const [apps, opps] = await Promise.all([
          fetchNgoApplicants(user.id).catch(() => []),
          fetchNgoOpportunities(user.id).catch(() => []),
        ])

        if (cancelled) return
        setApplicants(Array.isArray(apps) ? apps : [])
        setOpportunities(Array.isArray(opps) ? opps : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!opportunities.length) {
      setTopMatches([])
      return
    }

    let cancelled = false

    async function computeTopMatches() {
      try {
        const { data: students, error } = await supabase
          .from('student_profiles')
          .select('user_id, field, skills, languages, interests, experience, goals, users(id, name)')

        if (error || !students?.length || cancelled) {
          setTopMatches([])
          return
        }

        const palettes = [
          ['#1A73E8', '#8AB4F8'],
          ['#188038', '#81C995'],
          ['#F29900', '#FBC02D'],
          ['#A142F4', '#C58AF9'],
        ]

        const matches = opportunities
          .map((opportunity, index) => {
            let best = null
            let bestScore = -1

            students.forEach(student => {
              try {
                const result = computeMatch(student, opportunity)
                const score = typeof result === 'object' && result !== null ? (result.score ?? 0) : 0
                if (score > bestScore) {
                  bestScore = score
                  best = student
                }
              } catch (err) {
                console.error('Match computation failed:', err)
              }
            })

            if (!best) return null

            return {
              opportunity,
              student: {
                ...best,
                id: best.user_id,
                name: best.users?.name || 'Unknown',
                match: Math.round(bestScore),
              },
              score: Math.round(bestScore),
              colors: palettes[index % palettes.length],
            }
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score)

        if (!cancelled) setTopMatches(matches)
      } catch (err) {
        console.error('Unable to compute matches:', err)
        if (!cancelled) setTopMatches([])
      }
    }

    computeTopMatches()

    return () => {
      cancelled = true
    }
  }, [opportunities])

  const applicantsByOpportunity = opportunities.map(opportunity => {
    const count = applicants.filter(app => {
      const appOppId = app?.opportunityId ?? app?.opportunity_id ?? app?.opportunity?.id
      return String(appOppId) === String(opportunity.id)
    }).length
    return {
      opportunity,
      applicantCount: count,
      match: topMatches.find(m => String(m.opportunity?.id) === String(opportunity.id)),
    }
  })

  return (
    <main className="relative min-h-screen bg-[#F5F7FB]">
      {/* Soft ambient gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />

      <div className="relative mx-auto max-w-[1520px] px-6 pb-10 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="relative z-0 mb-2 flex flex-col gap-4 lg:mb-0 lg:flex-row lg:items-start lg:justify-between"
        >
          <div className="max-w-3xl lg:mt-0 lg:translate-x-2 lg:translate-y-16">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#202124] sm:text-5xl">
              {orgName}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-[#5F6368]">
              Manage connections, roles, and hiring momentum
              <br />
              from one clean workspace.
            </p>
          </div>

          <div className="self-start lg:mt-0 lg:translate-y-6">
            <motion.img
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              src={dashboardIllustration}
              alt=""
              className="w-[600px] max-w-full lg:mb-[-54px] lg:mr-8"
            />
          </div>
        </motion.header>

        <section className="relative z-10 rounded-[36px] border bg-white px-5 py-6 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
          style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#202124]">Quick actions</h2>
              <p className="mt-1.5 text-[0.9rem] text-[#5F6368]">Move through the workspace without hunting.</p>
            </div>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A73E8] transition-opacity hover:opacity-75"
            >
              Manage roles
              <ExternalLink size={14} />
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            {QUICK_ACTIONS.map((action, index) => {
              const liveCounts = {
                Applicants: applicants.length,
                Matches: topMatches.length,
                Interviews: interviewCount,
              }
              return (
                <QuickActionCard
                  key={action.title}
                  action={action}
                  delay={index * 0.04}
                  count={loading ? null : liveCounts[action.title] ?? null}
                />
              )
            })}
          </div>
        </section>

        <section
          className="mt-10 rounded-[36px] border bg-white px-5 py-6 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
          style={{ borderColor: 'rgba(26,115,232,0.10)' }}
        >
            <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#202124]">Open roles</h2>
                <span className="rounded-full border border-[#C6DAFC] bg-[#F7FAFF] px-3 py-1 text-[0.82rem] font-semibold text-[#1A73E8]">
                  {loading ? '...' : opportunities.length}
                </span>
              </div>
              <p className="mt-1.5 text-[0.9rem] text-[#5F6368]">
                A quick view of the roles your team is actively managing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => rolesRef.current?.scrollBy({ left: -420, behavior: 'smooth' })}
                className="flex h-11 w-11 items-center justify-center rounded-full border text-[#5F6368] transition-colors hover:bg-[#F8FAFC]"
                style={{ borderColor: 'rgba(17,24,39,0.08)' }}
                aria-label="Scroll roles left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => rolesRef.current?.scrollBy({ left: 420, behavior: 'smooth' })}
                className="flex h-11 w-11 items-center justify-center rounded-full border text-[#5F6368] transition-colors hover:bg-[#F8FAFC]"
                style={{ borderColor: 'rgba(17,24,39,0.08)' }}
                aria-label="Scroll roles right"
              >
                <ChevronRight size={20} />
              </button>
              <Link
                to="/opportunities"
                className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-[#1A73E8] transition-opacity hover:opacity-75"
              >
                Manage
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 xl:grid-cols-3">
              {[0, 1, 2].map(index => (
                <div
                  key={index}
                  className="h-[220px] animate-pulse rounded-[28px] border bg-[#FBFCFE]"
                  style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                />
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div
              className="rounded-[28px] border bg-[#FBFCFE] px-6 py-10 text-center"
              style={{ borderColor: 'rgba(26,115,232,0.08)' }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                <Briefcase size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#202124]">No open roles yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5F6368]">
                Add your first opportunity and it will appear here in the dashboard.
              </p>
              <Link
                to="/opportunities/new"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.18)] transition-transform hover:-translate-y-0.5"
              >
                Create role
                <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <div ref={rolesRef} className="flex gap-4 overflow-x-auto pb-2 pr-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {applicantsByOpportunity.map((item, index) => (
                <RoleCard
                  key={item.opportunity.id}
                  opportunity={item.opportunity}
                  applicantCount={item.applicantCount}
                  index={index}
                  onOpen={(opp) => navigate(`/opportunities?opportunity=${opp.id}`)}
                />
              ))}
            </div>
          )}
        </section>

      </div>

    </main>
  )
}
