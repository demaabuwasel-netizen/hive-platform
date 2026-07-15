import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchStudentApplications } from '../services/applications'
import { computeMatch } from '../services/matching'
import { fetchActiveOpportunities } from '../services/opportunities'
import dashboardIllustration from '../assets/student dashboard.PNG'

function skillName(skill) {
  return typeof skill === 'string' ? skill : (skill?.name ?? '')
}

function toMatchCard(opportunity, matchResult) {
  return {
    id: opportunity.id,
    title: opportunity.title || 'Opportunity',
    orgName: opportunity.orgName || 'Organization',
    category: opportunity.category || 'Volunteer role',
    location: opportunity.location || '',
    description: opportunity.description || opportunity.missionImpact || 'No description added yet.',
    score: Math.round(matchResult.score),
    headline: matchResult.headline || '',
    workMode: opportunity.workMode || 'Flexible',
    hours: opportunity.weeklyHours ? `${opportunity.weeklyHours} hrs/week` : 'Flexible',
    skills: (opportunity.skills || []).slice(0, 3).map(skillName).filter(Boolean),
  }
}

function QuickActionCard({ action, delay = 0, count = null }) {
  const Icon = action.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      onClick={action.onClick}
      className="group relative overflow-hidden rounded-[24px] border bg-white p-4 text-left shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(17,24,39,0.09)]"
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
          <h3 className="text-[0.98rem] font-semibold text-[#202124]">{action.label}</h3>
          {typeof count === 'number' && count > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[0.7rem] font-bold"
              style={{ background: action.tint, color: action.accent }}
            >
              {count}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[0.88rem] text-[#5F6368]">{action.hint}</p>
      </div>
    </motion.button>
  )
}

function MatchCard({ match, index, onOpen }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.06 * index }}
      className="group snap-start shrink-0 w-full lg:w-[calc((100%-2rem)/3)] min-w-[280px] cursor-pointer rounded-[24px] border bg-white p-4 shadow-[0_1px_0_rgba(17,24,39,0.02),0_10px_26px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#BFD7FF] hover:shadow-[0_18px_40px_rgba(26,115,232,0.10)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      aria-label={`Open opportunity ${match.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[#1A73E8] transition-transform duration-200 group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #E8F0FE 0%, #D2E3FC 100%)' }}
          >
            <Briefcase size={18} strokeWidth={2.15} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.92rem] font-semibold text-[#202124] transition-colors group-hover:text-[#1A73E8]">{match.title}</p>
            <p className="mt-0.5 truncate text-[0.76rem] text-[#5F6368]">{match.orgName}</p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[0.7rem] font-bold text-[#1A73E8]">
          {match.score}% fit
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
          {match.headline || match.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[0.68rem] font-semibold">
        <span className="rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[#5F6368]">{match.category}</span>
        <span className="rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[#5F6368]">{match.workMode}</span>
        <span className="rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[#5F6368]">{match.hours}</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#E5EEFB] pt-4">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {match.skills.length > 0 ? match.skills.map(skill => (
            <span
              key={skill}
              className="max-w-[100px] truncate rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[0.68rem] font-semibold text-[#1A73E8]"
            >
              {skill}
            </span>
          )) : (
            <span className="rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[0.68rem] font-semibold text-[#1A73E8]">
              Open role
            </span>
          )}
        </div>
        <span className="shrink-0 text-[0.78rem] font-semibold text-[#1A73E8] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View role →
        </span>
      </div>
    </motion.article>
  )
}

export default function StudentDashboard() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const matchesRef = useRef(null)
  const firstName = user?.name?.split(' ')[0] || 'there'

  const [appCount, setAppCount] = useState(0)
  const [interviewCount, setInterviewCount] = useState(0)
  const [topMatches, setTopMatches] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    fetchStudentApplications(user.id)
      .then(apps => {
        setAppCount(apps.length)
        setInterviewCount(apps.filter(a => a.status === 'interview').length)
      })
      .catch(() => {})
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    fetchActiveOpportunities()
      .then(opportunities => {
        const studentProfile = profile || user || {}
        const matches = opportunities
          .map(opportunity => ({
            opportunity,
            result: computeMatch(studentProfile, opportunity),
          }))
          .sort((a, b) => b.result.score - a.result.score)
          .slice(0, 10)
          .map(({ opportunity, result }) => toMatchCard(opportunity, result))

        setTopMatches(matches)
      })
      .catch(() => setTopMatches([]))
      .finally(() => setLoadingMatches(false))
  }, [user?.id, profile, user])

  const quickActions = [
    {
      icon: TrendingUp,
      label: 'Opportunities',
      hint: 'Explore roles',
      to: '/opportunities',
      tint: '#E8F0FE',
      accent: '#1A73E8',
    },
    {
      icon: FileText,
      label: 'Applications',
      hint: `${appCount} submitted`,
      to: '/applications',
      tint: '#FEF7E0',
      accent: '#F29900',
    },
    {
      icon: MessageSquare,
      label: 'Interviews',
      hint: `${interviewCount} active`,
      to: '/interviews',
      tint: '#F3E8FD',
      accent: '#A142F4',
    },
  ].map(action => ({ ...action, onClick: () => navigate(action.to) }))

  return (
    <main className="relative min-h-screen bg-[#F5F7FB]">
      {/* Soft ambient gradients — same treatment as the NGO dashboard */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />

      <div className="relative mx-auto max-w-[1440px] px-6 pb-10 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="relative z-0 mb-2 flex flex-col gap-4 lg:mb-0 lg:flex-row lg:items-start lg:justify-between"
        >
          <div className="max-w-3xl lg:mt-0 lg:translate-x-2 lg:translate-y-16">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#202124] sm:text-5xl">
              Welcome {firstName}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-[#5F6368]">
              Manage opportunities, applications, and interviews
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

        <section
          className="relative z-10 rounded-[36px] border bg-white px-5 py-6 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
          style={{ borderColor: 'rgba(26,115,232,0.10)' }}
        >
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#202124]">Quick actions</h2>
              <p className="mt-1.5 text-[0.9rem] text-[#5F6368]">Move through the workspace without hunting.</p>
            </div>
            <Link
              to="/profile/student"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#1A73E8] transition-opacity hover:opacity-75"
            >
              Open profile
              <ExternalLink size={14} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.label}
                action={action}
                delay={index * 0.05}
                count={action.label === 'Applications' ? appCount : action.label === 'Interviews' ? interviewCount : null}
              />
            ))}
          </div>
        </section>

        <section
          className="mt-10 rounded-[36px] border bg-white px-5 py-6 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
          style={{ borderColor: 'rgba(26,115,232,0.10)' }}
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.78rem] font-semibold text-[#1A73E8]">
                <Sparkles size={14} />
                Top matches
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#202124]">Recommended for you</h2>
                <span className="rounded-full border border-[#C6DAFC] bg-[#F7FAFF] px-3 py-1 text-[0.82rem] font-semibold text-[#1A73E8]">
                  {loadingMatches ? '...' : topMatches.length}
                </span>
              </div>
              <p className="mt-1.5 text-[0.9rem] text-[#5F6368]">
                Opportunities that fit your profile best.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => matchesRef.current?.scrollBy({ left: -420, behavior: 'smooth' })}
                className="flex h-11 w-11 items-center justify-center rounded-full border text-[#5F6368] transition-colors hover:bg-[#F8FAFC]"
                style={{ borderColor: 'rgba(17,24,39,0.08)' }}
                aria-label="Scroll matches left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => matchesRef.current?.scrollBy({ left: 420, behavior: 'smooth' })}
                className="flex h-11 w-11 items-center justify-center rounded-full border text-[#5F6368] transition-colors hover:bg-[#F8FAFC]"
                style={{ borderColor: 'rgba(17,24,39,0.08)' }}
                aria-label="Scroll matches right"
              >
                <ChevronRight size={20} />
              </button>
              <Link
                to="/opportunities"
                className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-[#1A73E8] transition-opacity hover:opacity-75"
              >
                Browse all
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {loadingMatches ? (
            <div className="grid gap-4 xl:grid-cols-3">
              {[0, 1, 2].map(index => (
                <div
                  key={index}
                  className="h-[270px] animate-pulse rounded-[24px] border bg-[#FBFCFE]"
                  style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                />
              ))}
            </div>
          ) : topMatches.length === 0 ? (
            <div
              className="rounded-[28px] border bg-[#FBFCFE] px-6 py-10 text-center"
              style={{ borderColor: 'rgba(26,115,232,0.08)' }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                <Briefcase size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#202124]">No matches yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5F6368]">
                Add more skills and interests to your profile so we can recommend stronger opportunities.
              </p>
            </div>
          ) : (
            <div ref={matchesRef} className="flex gap-4 overflow-x-auto pb-2 pr-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {topMatches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={index}
                  onOpen={() => navigate(`/opportunities?opportunity=${encodeURIComponent(match.id)}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
