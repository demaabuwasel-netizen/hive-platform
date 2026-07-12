import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle, AlertTriangle, BarChart3, Briefcase, Calendar, Camera, CheckCircle2,
  Code2, Database, DollarSign, FileText, Globe, GraduationCap, HeartHandshake, Layers,
  Lightbulb, MapPin, Megaphone, MessageCircle, MessageSquare, Moon, PenTool, Percent, Search,
  Sparkles, Target, TrendingUp, Users, Video,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchNgoApplicants } from '../services/applications'
import { fetchNgoOpportunities, parseSkillString } from '../services/opportunities'
import { withTimeout } from '../utils/withTimeout'

const HEALTH_CONFIG = {
  'Strong candidate pool': { icon: TrendingUp, className: 'bg-[#E6F4EA] text-[#188038]' },
  Healthy: { icon: CheckCircle2, className: 'bg-[#E8F0FE] text-[#1A73E8]' },
  'Needs attention': { icon: AlertTriangle, className: 'bg-[#FEF7E0] text-[#B06000]' },
  'Low activity': { icon: Moon, className: 'bg-[#F1F3F4] text-[#5F6368]' },
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
    <div className="relative overflow-hidden rounded-[32px] bg-white px-8 py-16 text-center shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.06)] ring-1 ring-black/[0.03]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(26,115,232,0.06),transparent_55%)]" />
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8F0FE] to-[#DCE9FE] text-[#1A73E8] shadow-[0_8px_20px_rgba(26,115,232,0.15)]">
        <BarChart3 size={26} strokeWidth={1.8} />
      </div>
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

function CardHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#F1F3F4] px-6 py-4">
      {Icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F1F3F4] text-[#5F6368]">
          <Icon size={15} />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-[0.95rem] font-semibold text-[#202124]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">{subtitle}</p>}
      </div>
    </div>
  )
}

// Horizontal bar on a shared scale — single hue with a light→dark gradient, rounded data-end
function Bar({ percent, color = '#1A73E8', colorDark = '#1765CC', height = 'h-7', delay = 0, label }) {
  return (
    <div className={`${height} w-full overflow-hidden rounded-full bg-[#F1F3F4]`} title={label}>
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

function SectionGroup({ label, description, children }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">{label}</p>
        <p className="mt-1 text-[0.88rem] text-[#5F6368]">{description}</p>
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
  const activeRest = activeView.pool.slice(1, 6)
  const maxActiveRest = Math.max(...activeRest.map(item => item.count), 1)
  const rowIcon = name => (activeView.icon ? activeView.icon : skillIcon(name))

  const maxCategoryCount = Math.max(...orgInsights.categoryPool.map(cat => cat.count), 1)

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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_10%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_90%_5%,rgba(161,66,244,0.05),transparent_42%),radial-gradient(circle_at_50%_15%,rgba(52,168,83,0.04),transparent_38%)]" />

      <div className="relative mx-auto max-w-[1480px] px-6 py-10 lg:px-10">
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
            <label className="w-full max-w-xs rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(17,24,39,0.04)] ring-1 ring-black/[0.04]">
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
          <div className="space-y-10">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map(item => (
                <div key={item} className="h-[140px] animate-pulse rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)]" />
              ))}
            </section>
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
                <div className="h-[360px] animate-pulse rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)]" />
                <div className="h-[360px] animate-pulse rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)]" />
              </div>
              <div className="h-[300px] animate-pulse rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)]" />
            </div>
            <div className="space-y-6">
              <div className="h-[260px] animate-pulse rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)]" />
              <div className="h-[320px] animate-pulse rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)]" />
            </div>
          </div>
        ) : !hasActivity ? (
          <EmptyState />
        ) : (
          <div className="space-y-10">
            {/* KPI tiles — icon badge, tinted wash, hover lift */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryStats.map((stat, index) => {
                const style = KPI_STYLES[index]
                const Icon = style.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="group relative overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.05)] ring-1 ring-black/[0.03] transition-shadow hover:shadow-[0_4px_14px_rgba(17,24,39,0.06),0_20px_44px_rgba(17,24,39,0.09)]"
                  >
                    <div
                      className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-90"
                      style={{ background: style.tint }}
                    />
                    <div className="relative flex items-start justify-between">
                      <p className="text-[0.78rem] font-medium text-[#5F6368]">{stat.label}</p>
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                        style={{ background: style.tint, color: style.accent }}
                      >
                        <Icon size={16} strokeWidth={2.1} />
                      </span>
                    </div>
                    <p className="relative mt-4 text-[2.15rem] font-semibold leading-none tracking-[-0.02em] text-[#202124]">{stat.value}</p>
                    <p className="relative mt-2 text-[0.78rem] text-[#9AA0A6]">{stat.hint}</p>
                  </motion.div>
                )
              })}
            </section>

            <SectionGroup label="Your applicants" description="What you're learning from the students applying to your roles">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              {/* Hiring funnel — icon per stage, gradient fill, common scale */}
              <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.05)] ring-1 ring-black/[0.03]">
                <CardHeader
                  icon={BarChart3}
                  title="Hiring funnel"
                  subtitle="How applicants move from applying to acceptance"
                />
                <div className="space-y-5 px-6 py-6">
                  {funnelStages.map((stage, index) => {
                    const StageIcon = stage.icon
                    return (
                      <div key={stage.label}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E8F0FE] text-[#1A73E8]">
                              <StageIcon size={13} />
                            </span>
                            <p className="text-[0.85rem] font-medium text-[#202124]">{stage.label}</p>
                          </div>
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
                    )
                  })}

                  <p className="pt-1 text-[0.78rem] leading-5 text-[#9AA0A6]">
                    Bars share one scale — each stage is shown as a share of all {applied} application{applied !== 1 ? 's' : ''}.
                  </p>
                </div>
              </section>

              {/* Match quality — radial gauge + score bands, gives instant read on candidate fit */}
              <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.05)] ring-1 ring-black/[0.03]">
                <CardHeader icon={Percent} title="Match quality" subtitle="Candidate fit across your pool" />
                {data.applicants.length > 0 ? (
                  <div className="flex flex-col items-center px-6 py-7">
                    <MatchGauge score={data.avgMatchScore} />
                    <div className="mt-6 w-full space-y-3">
                      {data.matchBands.map(band => (
                        <div key={band.label} className="flex items-center gap-2.5">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: band.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[0.8rem] text-[#3C4043]">{band.label}</p>
                          </div>
                          <span className="shrink-0 text-[0.72rem] text-[#9AA0A6]">{band.range}</span>
                          <span className="w-5 shrink-0 text-right text-[0.82rem] font-semibold text-[#202124]">{band.count}</span>
                        </div>
                      ))}
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

            {/* About your applicants — switch between skills / fields of study / languages */}
              <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.05)] ring-1 ring-black/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F3F4] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F1F3F4] text-[#5F6368]">
                      <Sparkles size={15} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[0.95rem] font-semibold text-[#202124]">About your applicants</h2>
                      <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">What your candidate pool looks like</p>
                    </div>
                  </div>
                  <select
                    value={applicantView}
                    onChange={event => setApplicantView(event.target.value)}
                    className="rounded-full border border-[#DADCE0] bg-white px-3.5 py-1.5 text-[0.78rem] font-medium text-[#202124] outline-none transition-colors hover:border-[#BFD7FF] focus:border-[#1A73E8]"
                  >
                    {Object.entries(APPLICANT_VIEWS).map(([key, view]) => (
                      <option key={key} value={key}>{view.label}</option>
                    ))}
                  </select>
                </div>
                {activeTop ? (
                  <div className="px-6 py-6">
                    <motion.div
                      key={applicantView}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 flex items-center gap-4 rounded-[22px] bg-gradient-to-br from-[#EEF4FF] to-[#F8FBFF] p-4 ring-1 ring-[#E1ECFF]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1A73E8] shadow-[0_4px_12px_rgba(26,115,232,0.15)]">
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
                      <div className="space-y-3.5">
                        {activeRest.map((item, index) => {
                          const Icon = rowIcon(item.name)
                          return (
                            <div key={item.name} className="flex items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F1F3F4] text-[#5F6368]">
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
            </SectionGroup>

            <SectionGroup label="Your roles" description="How your own postings are shaping the pool">
              {/* Role focus — the NGO's own posting patterns, independent of the role filter */}
              <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.05)] ring-1 ring-black/[0.03]">
                <CardHeader icon={Layers} title="Role focus" subtitle="What kind of roles you post most" />
                {orgInsights.categoryPool.length > 0 ? (
                  <div className="px-6 py-6">
                    <div className="space-y-3.5">
                      {orgInsights.categoryPool.map((cat, index) => (
                        <div key={cat.name} className="flex items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F3E8FD] text-[#A142F4]">
                            <Briefcase size={13} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center justify-between gap-3">
                              <p className="truncate text-[0.8rem] text-[#3C4043]">{cat.name}</p>
                              <span className="shrink-0 text-[0.78rem] font-medium text-[#202124]">{cat.count}</span>
                            </div>
                            <Bar
                              percent={Math.max((cat.count / maxCategoryCount) * 100, 4)}
                              color="#A142F4" colorDark="#8E24E0"
                              height="h-2"
                              delay={index * 0.04}
                              label={`${cat.name}: ${cat.count} role${cat.count !== 1 ? 's' : ''}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F1F3F4] pt-5">
                      {Object.entries(orgInsights.workModes).filter(([, count]) => count > 0).map(([mode, count]) => (
                        <span key={mode} className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F4] px-3 py-1.5 text-[0.72rem] font-medium text-[#5F6368]">
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

              {/* Role health — icon+label status chips, inline match bar */}
              <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.05)] ring-1 ring-black/[0.03]">
                <CardHeader icon={Target} title="Role health" subtitle="Where each role stands, and what to do next" />

              {data.roleHealth.length > 0 ? (
                <div className="divide-y divide-[#F1F3F4]">
                  <div className="hidden grid-cols-[minmax(0,1.4fr)_repeat(3,72px)_minmax(140px,0.8fr)_170px] items-center gap-4 px-6 py-2.5 lg:grid">
                    {['Role', 'Applied', 'Interview', 'Accepted', 'Avg match', 'Status'].map(col => (
                      <p key={col} className={`text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#9AA0A6] ${col !== 'Role' && col !== 'Avg match' && col !== 'Status' ? 'text-center' : ''}`}>
                        {col}
                      </p>
                    ))}
                  </div>

                  {data.roleHealth.map((role, index) => {
                    const suggestion = getRoleSuggestion(role)
                    const healthCfg = HEALTH_CONFIG[role.health]
                    const HealthIcon = healthCfg.icon

                    return (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.035 }}
                        className="px-6 py-4 transition-colors hover:bg-[#FAFBFF]"
                      >
                        <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,72px)_minmax(140px,0.8fr)_170px] lg:gap-4">
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
                            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F1F3F4]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(role.avgMatch, role.applicantCount > 0 ? 3 : 0)}%` }}
                                transition={{ duration: 0.5, delay: index * 0.04 }}
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg, #34A853, #188038)' }}
                              />
                            </div>
                            <span className="w-9 shrink-0 text-right text-[0.8rem] font-medium text-[#202124]">
                              {role.applicantCount > 0 ? `${role.avgMatch}%` : '—'}
                            </span>
                          </div>

                          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-medium ${healthCfg.className}`}>
                            <HealthIcon size={12} />
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
            </SectionGroup>
          </div>
        )}
      </div>
    </main>
  )
}
