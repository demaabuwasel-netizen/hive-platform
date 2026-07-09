import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  BarChart2,
  Briefcase,
  Lightbulb,
  Sparkles,
  Target,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchNgoApplicants } from '../services/applications'
import { fetchNgoOpportunities, parseSkillString } from '../services/opportunities'
import { withTimeout } from '../utils/withTimeout'

const HEALTH_STYLES = {
  'Strong candidate pool': 'bg-[#E6F4EA] text-[#188038]',
  Healthy: 'bg-[#E8F0FE] text-[#1A73E8]',
  'Needs attention': 'bg-[#FEF7E0] text-[#B06000]',
  'Low activity': 'bg-[#F1F3F4] text-[#5F6368]',
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
  if (applicantCount > 0 && avgMatch >= 80) return 'Strong candidate pool'
  if (applicantCount === 0) return 'Low activity'
  if (applicantCount > 0 && interviews === 0 && accepted === 0) return 'Needs attention'
  if (applicantCount <= 1) return 'Low activity'
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
    <div className="rounded-[32px] border border-[#E5EEFB] bg-white px-8 py-16 text-center shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
        <BarChart2 size={24} />
      </div>
      <p className="text-[1.05rem] font-semibold text-[#202124]">Analytics will appear once roles get activity</p>
      <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-6 text-[#5F6368]">
        Post roles and review applicants to see movement, match quality, and skill trends.
      </p>
      <Link to="/opportunities/new" className="mt-6 inline-flex rounded-full bg-[#1A73E8] px-5 py-2.5 text-[0.82rem] font-semibold text-white shadow-[0_8px_22px_rgba(26,115,232,0.18)]">
        Post a role
      </Link>
    </div>
  )
}

function CardTitle({ icon: Icon, title, action }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
          <Icon size={18} />
        </span>
        <h2 className="truncate text-[0.98rem] font-semibold text-[#202124]">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export default function Analytics() {
  const { user } = useApp()
  const [roles, setRoles] = useState([])
  const [applicants, setApplicants] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState('all')
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
      const avgMatch = average(roleApplicants.map(applicant => applicant.match))
      const applicantCount = roleApplicants.length

      return {
        id: role.id,
        title: role.title || 'Untitled role',
        applicantCount,
        avgMatch,
        interviews,
        accepted,
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

    return {
      roles: scopedRoles,
      applicants: scopedApplicants,
      roleHealth,
      funnel: [
        { label: 'Applied', count: applied, percent: applied ? 100 : 0 },
        { label: 'Interview', count: interview, percent: pct(interview, applied) },
        { label: 'Accepted', count: accepted, percent: pct(accepted, interview) },
      ],
      skillPool,
    }
  }, [applicants, roles, selectedRoleId])

  const hasActivity = roles.length > 0 || applicants.length > 0
  const matchRoles = data.roleHealth
    .filter(role => role.applicantCount > 0)
    .sort((a, b) => b.avgMatch - a.avgMatch)
    .slice(0, 5)
  const topSkill = data.skillPool[0]
  const maxSkillCount = Math.max(...data.skillPool.map(skill => skill.count), 1)
  const summaryStats = [
    { label: 'Active roles', value: data.roles.length, hint: selectedRoleId === 'all' ? 'Currently in scope' : 'Selected role' },
    { label: 'Applicants', value: data.applicants.length, hint: 'Total applications' },
    { label: 'Interviews', value: data.funnel[1]?.count || 0, hint: `${data.funnel[1]?.percent || 0}% from applied` },
    { label: 'Accepted', value: data.funnel[2]?.count || 0, hint: `${data.funnel[2]?.percent || 0}% from interviews` },
  ]

  return (
    <main className="min-h-screen bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1480px] px-6 py-10 lg:px-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[clamp(2.35rem,5vw,4.1rem)] font-semibold leading-none tracking-[-0.055em] text-[#202124]">
            Analytics
          </h1>
          <p className="mt-5 max-w-2xl text-[0.98rem] leading-7 text-[#5F6368]">
            A cleaner view of role activity, applicant movement, and candidate fit.
          </p>
        </div>

        {(loading || roles.length > 0) && (
          <label className="w-full max-w-xs rounded-[18px] border border-[#E5EEFB] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(17,24,39,0.035)]">
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Role</span>
            {loading ? (
              <div className="mt-2 h-5 w-32 animate-pulse rounded-full bg-[#EEF4FF]" />
            ) : (
              <select
                value={selectedRoleId}
                onChange={event => setSelectedRoleId(event.target.value)}
                className="w-full bg-transparent text-[0.86rem] font-semibold text-[#202124] outline-none">
                <option value="all">All roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.title}</option>
                ))}
              </select>
            )}
          </label>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-[18px] border border-[#FAD2CF] bg-[#FEF7F6] px-4 py-3 text-[0.86rem] font-semibold text-[#B3261E]">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map(item => (
              <div key={item} className="h-[160px] animate-pulse rounded-[30px] border border-[#E5EEFB] bg-white" />
            ))}
          </section>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <div className="h-[360px] animate-pulse rounded-[34px] border border-[#E5EEFB] bg-white" />
            <div className="h-[360px] animate-pulse rounded-[34px] border border-[#E5EEFB] bg-white" />
          </div>
          <div className="h-[320px] animate-pulse rounded-[34px] border border-[#E5EEFB] bg-white" />
        </div>
      ) : !hasActivity ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[30px] border border-[#E5EEFB] bg-white p-5 shadow-[0_14px_34px_rgba(17,24,39,0.035)]"
              >
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">{stat.label}</p>
                <p className="mt-4 text-[2.35rem] font-semibold leading-none tracking-[-0.065em] text-[#202124]">{stat.value}</p>
                <p className="mt-2 text-[0.82rem] font-semibold text-[#5F6368]">{stat.hint}</p>
              </motion.div>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <section className="rounded-[34px] border border-[#E5EEFB] bg-white p-6 shadow-[0_18px_48px_rgba(17,24,39,0.045)]">
              <CardTitle icon={BarChart2} title="Hiring funnel" />
              <div className="mt-2 grid gap-4 md:grid-cols-3">
                {data.funnel.map((stage, index) => (
                  <div key={stage.label} className="rounded-[26px] bg-[#FBFCFE] p-5 ring-1 ring-[#EDF2FA]">
                    <p className="text-[0.84rem] font-semibold text-[#5F6368]">{stage.label}</p>
                    <p className="mt-3 text-[2.2rem] font-semibold leading-none tracking-[-0.065em] text-[#202124]">{stage.count}</p>
                    <p className="mt-2 text-[0.76rem] font-semibold text-[#9AA0A6]">
                      {index === 0 ? 'Starting point' : `${stage.percent}% from previous`}
                    </p>
                    <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#EEF3FB]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(stage.percent, stage.count > 0 ? 8 : 0)}%` }}
                        transition={{ duration: 0.55, delay: index * 0.08 }}
                        className="h-full rounded-full"
                        style={{
                          background: index === 0 ? '#1A73E8' : index === 1 ? '#34A853' : '#F9AB00',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-[#D7E6FF] bg-[#F8FBFF] p-6 shadow-[0_18px_48px_rgba(26,115,232,0.06)]">
              <CardTitle icon={Sparkles} title="Skill insight" />
              {data.skillPool.length > 0 ? (
                <div>
                  <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_30px_rgba(17,24,39,0.035)]">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#1A73E8]">Top skill</p>
                    <p className="mt-3 truncate text-[2rem] font-semibold leading-none tracking-[-0.07em] text-[#202124]">{topSkill.name}</p>
                    <p className="mt-2 text-[0.82rem] font-semibold text-[#5F6368]">{topSkill.count} applicant{topSkill.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {data.skillPool.slice(0, 5).map((skill, index) => (
                      <div key={skill.name}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <p className="truncate text-[0.8rem] font-semibold text-[#202124]">{skill.name}</p>
                          <span className="text-[0.76rem] font-semibold text-[#1A73E8]">{skill.count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max((skill.count / maxSkillCount) * 100, 8)}%` }}
                            transition={{ duration: 0.45, delay: index * 0.04 }}
                            className="h-full rounded-full bg-[#1A73E8]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[26px] bg-white px-5 py-10 text-center">
                  <p className="text-[0.9rem] font-semibold text-[#202124]">No skill data yet</p>
                  <p className="mt-1 text-[0.8rem] text-[#5F6368]">Applicant skills will appear after students apply.</p>
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <section className="rounded-[34px] border border-[#E5EEFB] bg-white p-6 shadow-[0_18px_48px_rgba(17,24,39,0.045)]">
              <CardTitle
                icon={Briefcase}
                title="Role health"
              />

              {data.roleHealth.length > 0 ? (
                <div className="space-y-3">
                  {data.roleHealth.map((role, index) => {
                    const suggestion = getRoleSuggestion(role)

                    return (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.035 }}
                        className="rounded-[24px] border border-[#EDF2FA] bg-[#FBFCFE] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-[0.92rem] font-semibold text-[#202124]">{role.title}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[0.72rem] font-semibold text-[#5F6368]">
                              <span>{role.applicantCount} applicants</span>
                              <span>{role.interviews} interviews</span>
                              <span>{role.accepted} accepted</span>
                              <span>{role.avgMatch}% avg match</span>
                            </div>
                          </div>
                          <span className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold ${HEALTH_STYLES[role.health]}`}>
                            {role.health}
                          </span>
                        </div>

                        {suggestion && (
                          <div className="mt-3 flex gap-2 rounded-[18px] bg-white px-3 py-2 text-[0.76rem] font-semibold leading-5 text-[#5F6368] shadow-[0_6px_16px_rgba(17,24,39,0.035)]">
                            <Lightbulb size={14} className="mt-0.5 shrink-0 text-[#B06000]" />
                            {suggestion}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-[24px] bg-[#FBFCFE] px-5 py-10 text-center">
                  <p className="text-[0.9rem] font-semibold text-[#202124]">No roles match this filter</p>
                </div>
              )}
            </section>

            <section className="rounded-[34px] border border-[#E5EEFB] bg-white p-6 shadow-[0_18px_48px_rgba(17,24,39,0.045)]">
              <CardTitle icon={Target} title="Average match by role" />

              {matchRoles.length > 0 ? (
                <div className="space-y-4">
                  {matchRoles.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="rounded-[22px] bg-[#FBFCFE] p-4 ring-1 ring-[#EDF2FA]">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <p className="truncate text-[0.86rem] font-semibold text-[#202124]">{role.title}</p>
                        <span className="text-[0.84rem] font-semibold text-[#1A73E8]">{role.avgMatch}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-[#EEF3FB]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(role.avgMatch, 6)}%` }}
                          transition={{ duration: 0.45, delay: index * 0.05 }}
                          className="h-full rounded-full bg-[#34A853]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] bg-[#FBFCFE] px-5 py-10 text-center">
                  <p className="text-[0.9rem] font-semibold text-[#202124]">No match scores yet</p>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
