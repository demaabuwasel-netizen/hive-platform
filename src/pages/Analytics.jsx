import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, BarChart2, Lightbulb } from 'lucide-react'
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
    <div className="rounded-[24px] border border-[#DADCE0] bg-white px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F3F4] text-[#5F6368]">
        <BarChart2 size={24} strokeWidth={1.8} />
      </div>
      <p className="text-[1.05rem] font-medium text-[#202124]">Analytics will appear once roles get activity</p>
      <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-6 text-[#5F6368]">
        Post roles and review applicants to see movement, match quality, and skill trends.
      </p>
      <Link to="/opportunities/new" className="mt-6 inline-flex rounded-full bg-[#1A73E8] px-6 py-2.5 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#1765CC]">
        Post a role
      </Link>
    </div>
  )
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="border-b border-[#E8EAED] px-6 py-4">
      <h2 className="text-[0.95rem] font-medium text-[#202124]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">{subtitle}</p>}
    </div>
  )
}

// Horizontal bar on a shared scale — single hue, rounded data-end, anchored left
function Bar({ percent, color = '#1A73E8', height = 'h-7', delay = 0, label }) {
  return (
    <div className={`${height} w-full overflow-hidden rounded-[4px] bg-[#F1F3F4]`} title={label}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.55, ease: 'easeOut', delay }}
        className="h-full rounded-r-[4px]"
        style={{ background: color }}
      />
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
      funnel: { applied, interview, accepted },
      skillPool,
    }
  }, [applicants, roles, selectedRoleId])

  const hasActivity = roles.length > 0 || applicants.length > 0
  const { applied, interview, accepted } = data.funnel
  const maxSkillCount = Math.max(...data.skillPool.map(skill => skill.count), 1)

  // Funnel stages on a common scale (percent of Applied)
  const funnelStages = [
    { label: 'Applied', count: applied, width: applied ? 100 : 0, note: 'All applications received' },
    { label: 'Interview', count: interview, width: pct(interview, applied), note: `${pct(interview, applied)}% of applied advanced` },
    { label: 'Accepted', count: accepted, width: pct(accepted, applied), note: `${pct(accepted, interview)}% of interviews accepted` },
  ]

  const summaryStats = [
    { label: 'Active roles', value: data.roles.length, hint: selectedRoleId === 'all' ? 'Currently in scope' : 'Selected role' },
    { label: 'Applicants', value: applied, hint: 'Total applications' },
    { label: 'Interviews', value: interview, hint: `${pct(interview, applied)}% of applied` },
    { label: 'Accepted', value: accepted, hint: `${pct(accepted, interview)}% of interviews` },
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
              A clear view of role activity, applicant movement, and candidate fit.
            </p>
          </div>

          {(loading || roles.length > 0) && (
            <label className="w-full max-w-xs rounded-2xl border border-[#DADCE0] bg-white px-4 py-3">
              <span className="mb-1 block text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#5F6368]">Role</span>
              {loading ? (
                <div className="mt-2 h-5 w-32 animate-pulse rounded-full bg-[#F1F3F4]" />
              ) : (
                <select
                  value={selectedRoleId}
                  onChange={event => setSelectedRoleId(event.target.value)}
                  className="w-full bg-transparent text-[0.88rem] font-medium text-[#202124] outline-none">
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
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#FAD2CF] bg-[#FEF7F6] px-4 py-3 text-[0.86rem] font-medium text-[#B3261E]">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map(item => (
                <div key={item} className="h-[130px] animate-pulse rounded-[24px] border border-[#E8EAED] bg-white" />
              ))}
            </section>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <div className="h-[340px] animate-pulse rounded-[24px] border border-[#E8EAED] bg-white" />
              <div className="h-[340px] animate-pulse rounded-[24px] border border-[#E8EAED] bg-white" />
            </div>
            <div className="h-[320px] animate-pulse rounded-[24px] border border-[#E8EAED] bg-white" />
          </div>
        ) : !hasActivity ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* KPI tiles */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-[24px] border border-[#DADCE0] bg-white p-5"
                >
                  <p className="text-[0.78rem] font-medium text-[#5F6368]">{stat.label}</p>
                  <p className="mt-3 text-[2.1rem] font-medium leading-none tracking-[-0.02em] text-[#202124]">{stat.value}</p>
                  <p className="mt-2 text-[0.78rem] text-[#9AA0A6]">{stat.hint}</p>
                </motion.div>
              ))}
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              {/* Hiring funnel — single measure, one hue, common scale */}
              <section className="overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white">
                <CardHeader
                  title="Hiring funnel"
                  subtitle="How applicants move from applying to acceptance"
                />
                <div className="space-y-5 px-6 py-6">
                  {funnelStages.map((stage, index) => (
                    <div key={stage.label}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-4">
                        <p className="text-[0.85rem] font-medium text-[#202124]">{stage.label}</p>
                        <p className="text-[0.85rem] font-medium text-[#202124]">
                          {stage.count}
                          <span className="ml-2 text-[0.76rem] font-normal text-[#9AA0A6]">
                            {index === 0 ? '' : stage.note}
                          </span>
                        </p>
                      </div>
                      <Bar
                        percent={Math.max(stage.width, stage.count > 0 ? 2 : 0)}
                        delay={index * 0.08}
                        label={`${stage.label}: ${stage.count}`}
                      />
                    </div>
                  ))}

                  <p className="pt-1 text-[0.78rem] leading-5 text-[#9AA0A6]">
                    Bars share one scale — each stage is shown as a share of all {applied} application{applied !== 1 ? 's' : ''}.
                  </p>
                </div>
              </section>

              {/* Skill demand — single measure, one hue */}
              <section className="overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white">
                <CardHeader
                  title="Skills in your pool"
                  subtitle="Most common skills across applicants"
                />
                {data.skillPool.length > 0 ? (
                  <div className="space-y-4 px-6 py-6">
                    {data.skillPool.slice(0, 6).map((skill, index) => (
                      <div key={skill.name}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <p className="truncate text-[0.82rem] text-[#3C4043]">{skill.name}</p>
                          <span className="text-[0.8rem] font-medium text-[#202124]">{skill.count}</span>
                        </div>
                        <Bar
                          percent={Math.max((skill.count / maxSkillCount) * 100, 4)}
                          height="h-2.5"
                          delay={index * 0.04}
                          label={`${skill.name}: ${skill.count} applicant${skill.count !== 1 ? 's' : ''}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-[0.9rem] font-medium text-[#202124]">No skill data yet</p>
                    <p className="mt-1 text-[0.8rem] text-[#5F6368]">Applicant skills will appear after students apply.</p>
                  </div>
                )}
              </section>
            </div>

            {/* Role health — table-style rows with inline match bar and status */}
            <section className="overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white">
              <CardHeader
                title="Role health"
                subtitle="Where each role stands, and what to do next"
              />

              {data.roleHealth.length > 0 ? (
                <div className="divide-y divide-[#E8EAED]">
                  {/* Column headers (desktop) */}
                  <div className="hidden grid-cols-[minmax(0,1.4fr)_repeat(3,72px)_minmax(140px,0.8fr)_150px] items-center gap-4 px-6 py-2.5 lg:grid">
                    {['Role', 'Applied', 'Interview', 'Accepted', 'Avg match', 'Status'].map(col => (
                      <p key={col} className={`text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#9AA0A6] ${col !== 'Role' && col !== 'Avg match' && col !== 'Status' ? 'text-center' : ''}`}>
                        {col}
                      </p>
                    ))}
                  </div>

                  {data.roleHealth.map((role, index) => {
                    const suggestion = getRoleSuggestion(role)

                    return (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.035 }}
                        className="px-6 py-4 transition-colors hover:bg-[#F8F9FA]"
                      >
                        <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,72px)_minmax(140px,0.8fr)_150px] lg:gap-4">
                          <p className="truncate text-[0.9rem] font-medium text-[#202124]">{role.title}</p>

                          <div className="flex gap-5 lg:contents">
                            <p className="text-[0.85rem] text-[#3C4043] lg:text-center">
                              <span className="mr-1 text-[0.72rem] text-[#9AA0A6] lg:hidden">Applied</span>
                              {role.applicantCount}
                            </p>
                            <p className="text-[0.85rem] text-[#3C4043] lg:text-center">
                              <span className="mr-1 text-[0.72rem] text-[#9AA0A6] lg:hidden">Interview</span>
                              {role.interviews}
                            </p>
                            <p className="text-[0.85rem] text-[#3C4043] lg:text-center">
                              <span className="mr-1 text-[0.72rem] text-[#9AA0A6] lg:hidden">Accepted</span>
                              {role.accepted}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5" title={`Average match: ${role.avgMatch}%`}>
                            <div className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-[#F1F3F4]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(role.avgMatch, role.applicantCount > 0 ? 3 : 0)}%` }}
                                transition={{ duration: 0.5, delay: index * 0.04 }}
                                className="h-full rounded-r-[4px] bg-[#188038]"
                              />
                            </div>
                            <span className="w-9 shrink-0 text-right text-[0.8rem] font-medium text-[#202124]">
                              {role.applicantCount > 0 ? `${role.avgMatch}%` : '—'}
                            </span>
                          </div>

                          <span className={`w-fit rounded-full px-3 py-1 text-[0.72rem] font-medium ${HEALTH_STYLES[role.health]}`}>
                            {role.health}
                          </span>
                        </div>

                        {suggestion && (
                          <div className="mt-2.5 flex items-start gap-2 text-[0.78rem] leading-5 text-[#5F6368]">
                            <Lightbulb size={13} className="mt-0.5 shrink-0 text-[#B06000]" />
                            {suggestion}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-[0.9rem] font-medium text-[#202124]">No roles match this filter</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
