import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  FileText,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchStudentApplications } from '../services/applications'
import { computeMatch } from '../services/matching'
import { fetchActiveOpportunities } from '../services/opportunities'

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

export default function StudentDashboard() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
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
      accent: 'bg-[#E8F0FE] text-[#1A73E8]',
    },
    {
      icon: FileText,
      label: 'Applications',
      hint: `${appCount} submitted`,
      to: '/applications',
      accent: 'bg-[#FEF7E0] text-[#B06000]',
    },
    {
      icon: MessageSquare,
      label: 'Interviews',
      hint: `${interviewCount} active`,
      to: '/interviews',
      accent: 'bg-[#F3E8FD] text-[#9334E6]',
    },
  ]

  return (
    <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1480px] px-6 pb-8 pt-12 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
            Welcome {firstName}
          </h1>
          <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
            Manage opportunities, applications, and interviews from one clean workspace.
          </p>
        </motion.div>

        <section className="rounded-[32px] border border-[#D7E6FF] bg-white p-6 shadow-[0_14px_38px_rgba(17,24,39,0.035)]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[1.05rem] font-semibold text-[#202124]">Quick actions</h2>
              <p className="mt-1 text-[0.84rem] leading-6 text-[#5F6368]">
                Move through the student workspace without hunting.
              </p>
            </div>
            <button
              onClick={() => navigate('/profile/student')}
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[0.84rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]"
            >
              Open profile
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05 }}
                  onClick={() => navigate(action.to)}
                  className="group rounded-[24px] border border-[#DCE7F8] bg-[#FBFCFE] p-5 text-left transition-all hover:border-[#C8DCF8] hover:bg-white hover:shadow-[0_14px_30px_rgba(17,24,39,0.05)]"
                >
                  <div className="mb-9 flex items-start justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.accent}`}>
                      <Icon size={20} />
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5EEFB] bg-white text-[#9AA0A6] transition-colors group-hover:text-[#1A73E8]">
                      <ChevronRight size={18} />
                    </span>
                  </div>
                  <p className="text-[1rem] font-semibold text-[#202124]">{action.label}</p>
                  <p className="mt-2 text-[0.84rem] text-[#5F6368]">{action.hint}</p>
                </motion.button>
              )
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[32px] border border-[#D7E6FF] bg-white p-6 shadow-[0_14px_38px_rgba(17,24,39,0.035)]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.78rem] font-semibold text-[#1A73E8]">
                <Sparkles size={14} />
                Top matches
              </div>
              <h2 className="text-[1.35rem] font-semibold text-[#202124]">
                Recommended for you
              </h2>
              <p className="mt-1 text-[0.84rem] leading-6 text-[#5F6368]">
                Scroll sideways to browse opportunities that fit your profile best.
              </p>
            </div>
            <button
              onClick={() => navigate('/opportunities')}
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[0.84rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]"
            >
              Browse all
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="-mx-2 overflow-x-auto overscroll-x-contain px-2 pb-3 [scrollbar-gutter:stable]">
            <div className="flex snap-x snap-mandatory gap-4">
              {loadingMatches ? (
                [0, 1, 2, 3].map(item => (
                  <div
                    key={item}
                    className="h-[270px] w-[300px] shrink-0 snap-start animate-pulse rounded-[28px] border border-[#E5EEFB] bg-[#F8FBFF] sm:w-[340px]"
                  />
                ))
              ) : topMatches.length === 0 ? (
                <div className="flex min-h-[230px] w-full items-center justify-center rounded-[28px] border border-dashed border-[#D7E6FF] bg-[#F8FBFF] px-6 text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                      <Briefcase size={24} />
                    </div>
                    <p className="text-[1rem] font-semibold text-[#202124]">No matches yet</p>
                    <p className="mx-auto mt-2 max-w-md text-[0.84rem] leading-6 text-[#5F6368]">
                      Add more skills and interests to your profile so we can recommend stronger opportunities.
                    </p>
                  </div>
                </div>
              ) : (
                topMatches.map((match, index) => (
                  <motion.button
                    key={match.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.04 }}
                    onClick={() => navigate(`/opportunities?opportunity=${encodeURIComponent(match.id)}`)}
                    className="flex h-[270px] w-[300px] shrink-0 snap-start flex-col rounded-[28px] border border-[#E5EEFB] bg-[#FBFCFE] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#C8DCF8] hover:bg-white hover:shadow-[0_16px_34px_rgba(17,24,39,0.055)] sm:w-[340px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[1.02rem] font-semibold text-[#202124]">
                          {match.title}
                        </p>
                        <p className="mt-1 truncate text-[0.84rem] text-[#5F6368]">
                          {match.orgName}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.72rem] font-bold text-[#1A73E8]">
                        {match.score}% fit
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-[0.82rem] leading-6 text-[#5F6368]">
                      {match.headline || match.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-[0.72rem] font-semibold text-[#5F6368]">
                      <span className="rounded-full bg-white px-2.5 py-1 shadow-[0_4px_12px_rgba(17,24,39,0.025)]">
                        {match.category}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 shadow-[0_4px_12px_rgba(17,24,39,0.025)]">
                        {match.workMode}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 shadow-[0_4px_12px_rgba(17,24,39,0.025)]">
                        {match.hours}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#E5EEFB] pt-4">
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        {match.skills.length > 0 ? match.skills.map(skill => (
                          <span
                            key={skill}
                            className="max-w-[110px] truncate rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[0.68rem] font-semibold text-[#1A73E8]"
                          >
                            {skill}
                          </span>
                        )) : (
                          <span className="rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[0.68rem] font-semibold text-[#1A73E8]">
                            Open role
                          </span>
                        )}
                      </div>
                      <ChevronRight className="shrink-0 text-[#1A73E8]" size={18} />
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
