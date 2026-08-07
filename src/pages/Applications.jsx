import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import applicationEmptyIllustration from '../assets/img1.jpg'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchStudentApplications, deleteApplication } from '../services/applications'
import { computeMatch } from '../services/matching'
import { supabase } from '../services/supabase'
import { withTimeout } from '../utils/withTimeout'

const STATUS_CFG = {
  interview:    { label: 'Interview',    color: 'text-emerald-700', bg: 'bg-emerald-50', icon: Calendar },
  under_review: { label: 'Under review', color: 'text-amber-700',   bg: 'bg-amber-50',   icon: Clock },
  submitted:    { label: 'Open',         color: 'text-[#1A73E8]',   bg: 'bg-[#E8F0FE]',  icon: CheckCircle2 },
  shortlisted:  { label: 'Shortlisted',  color: 'text-violet-700',  bg: 'bg-violet-50',  icon: CheckCircle2 },
  accepted:     { label: 'Accepted',     color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  completed:    { label: 'Completed',    color: 'text-[#1A73E8]',   bg: 'bg-[#E8F0FE]',  icon: CheckCircle2 },
  rejected:     { label: 'Not selected', color: 'text-red-600',     bg: 'bg-red-50',     icon: XCircle },
}

function getStatusMeta(status) {
  return STATUS_CFG[status] || STATUS_CFG.submitted
}

function formatField(value, fallback = 'Not specified') {
  if (value === null || value === undefined || value === '') return fallback
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback
  return String(value)
}

// Builds an opportunity-shaped object (matching a raw `opportunities` row)
// out of the snapshot saved on this application at apply/accept time. Used
// when the live opportunity can't be read anymore — e.g. it's no longer
// active and RLS hides it from this student's join — so the detail panel
// still has something real to show instead of an error.
function oppFromRoleSnapshot(snapshot) {
  if (!snapshot?.title) return null
  return {
    id:             snapshot.id             ?? null,
    ngo_id:         snapshot.ngo_id         ?? null,
    title:          snapshot.title,
    category:       snapshot.category       ?? null,
    field:          snapshot.field          ?? null,
    location:       snapshot.location       ?? null,
    description:    snapshot.description    ?? null,
    mission_impact: snapshot.mission_impact ?? null,
    skills:         snapshot.skills         ?? [],
    languages:      snapshot.languages      ?? [],
    work_mode:      snapshot.work_mode      ?? null,
    weekly_hours:   snapshot.weekly_hours   ?? null,
    duration:       snapshot.duration       ?? null,
    org_name:       snapshot.org_name       ?? null,
  }
}

function formatSkill(skill) {
  if (!skill) return ''
  if (typeof skill === 'string') {
    try {
      const parsed = JSON.parse(skill)
      return [parsed.name, parsed.level].filter(Boolean).join(' - ') || skill
    } catch {
      return skill
    }
  }
  return [skill.name, skill.level].filter(Boolean).join(' - ') || ''
}

function formatLanguage(language) {
  if (!language) return ''
  if (typeof language === 'string') return language
  return [language.lang || language.name, language.level].filter(Boolean).join(' - ')
}

export default function Applications() {
  const { user, profile } = useApp()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [detail, setDetail] = useState({ id: null, data: null, error: null })
  const [deletingId, setDeletingId] = useState(null)

  async function handleDeleteApplication(appId) {
    if (!user?.id || deletingId) return
    if (!confirm('Are you sure you want to delete this application? This can\'t be undone.')) return

    setDeletingId(appId)
    try {
      await deleteApplication(appId, user.id)
      setApps(prev => {
        const next = prev.filter(a => a.id !== appId)
        setSelectedAppId(current => (current === appId ? (next[0]?.id ?? null) : current))
        return next
      })
    } catch (err) {
      console.error('Failed to delete application:', err.message)
      alert('Could not delete this application. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    if (!user?.id) return

    withTimeout(fetchStudentApplications(user.id), 10000, 'fetchStudentApplications')
      .then(data => {
        const nextApps = Array.isArray(data) ? data : []
        setApps(nextApps)
        setSelectedAppId(nextApps[0]?.id ?? null)
      })
      .catch(err => {
        console.error('Failed to load applications:', err.message)
        setApps([])
        setSelectedAppId(null)
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  useEffect(() => {
    const selectedApp = apps.find(a => a.id === selectedAppId)
    if (!selectedApp?.opportunityId) return

    let cancelled = false
    const appOpportunity = oppFromRoleSnapshot(selectedApp.opportunity)
    if (appOpportunity) {
      setDetail({ id: selectedApp.opportunityId, data: appOpportunity, error: null })
    }

    withTimeout(
      supabase
        .from('opportunities')
        .select('*')
        .eq('id', selectedApp.opportunityId)
        .single()
        .then(({ data, error }) => {
          if (error) throw error
          return data
        }),
      10000,
      'fetchOpportunityDetails'
    )
      .then(data => {
        if (!cancelled) setDetail({ id: selectedApp.opportunityId, data, error: null })
      })
      .catch(err => {
        // The live opportunity can be unreadable for a legitimate reason —
        // it's no longer 'active' and RLS only lets a non-owner student read
        // active ones. Fall back to the snapshot taken when this application
        // was submitted/accepted instead of showing an error for something
        // that isn't actually broken.
        const fallback = appOpportunity || oppFromRoleSnapshot(selectedApp.links?.roleSnapshot)
        if (cancelled) return
        if (fallback) {
          setDetail({ id: selectedApp.opportunityId, data: fallback, error: null })
        } else {
          console.error('[Applications] Failed to fetch opportunity:', err.message)
          setDetail({ id: selectedApp.opportunityId, data: null, error: err.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedAppId, apps])

  const selectedApp = apps.find(a => a.id === selectedAppId) || null
  const selectedOpp = selectedApp && detail.id === selectedApp.opportunityId ? detail.data : null
  const selectedError = selectedApp && detail.id === selectedApp.opportunityId ? detail.error : null
  const isDetailLoading = Boolean(selectedApp?.opportunityId) && !selectedOpp && !selectedError
  const statusMeta = selectedApp ? getStatusMeta(selectedApp.status) : null
  const StatusIcon = statusMeta?.icon
  const selectedNgoId = selectedOpp?.ngo_id || selectedOpp?.ngoId || selectedApp?.ngoId
  const selectedNgoName = selectedOpp?.org_name || selectedOpp?.orgName || selectedApp?.ngoName || 'Organization'
  const selectedCategory = selectedOpp?.category || selectedOpp?.field || selectedApp?.category
  const matchScore = selectedOpp ? computeMatch(profile, {
    skills:        selectedOpp.skills        ?? [],
    category:      selectedCategory          ?? '',
    title:         selectedOpp.title         ?? '',
    description:   selectedOpp.description   ?? '',
    missionImpact: selectedOpp.mission_impact ?? '',
    workMode:      selectedOpp.work_mode     ?? '',
    weeklyHours:   selectedOpp.weekly_hours  ?? null,
    languages:     selectedOpp.languages     ?? [],
    field:         selectedOpp.field         ?? '',
    location:      selectedOpp.location      ?? selectedApp?.location ?? '',
  }).score : null
  const overviewText = selectedApp && selectedOpp
    ? (selectedOpp.description || selectedOpp.mission_impact || 'No role description is available for this opportunity.')
    : ''
  const primaryDetails = selectedOpp ? [
    { label: 'Match', value: matchScore != null ? `${matchScore}%` : '—', icon: Sparkles, tint: '#E8F0FE', accent: '#1A73E8' },
    { label: 'Category', value: formatField(selectedCategory), icon: Briefcase, tint: '#E6F4EA', accent: '#188038' },
    { label: 'Work mode', value: formatField(selectedOpp.work_mode), icon: Globe, tint: '#FEF7E0', accent: '#F29900' },
    { label: 'Hours/week', value: formatField(selectedOpp.weekly_hours), icon: Clock, tint: '#F3E8FD', accent: '#A142F4' },
  ] : []
  const skillLabels = (selectedOpp?.skills || []).map(formatSkill).filter(Boolean)

  return (
    <main className="relative flex-1 overflow-y-auto bg-[#F5F7FB]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_12%_8%,rgba(26,115,232,0.08),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(232,240,254,0.64),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.62),rgba(245,247,251,0))]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1480px] px-6 pb-8 pt-10 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="mb-7"
        >
          <div>
            <h1 className="text-[clamp(2.1rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#202124]">
              Applications
            </h1>
            <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-[#5F6368]">
              Manage the roles you have applied to and review the full opportunity on the right.
            </p>
          </div>
        </motion.header>

        <section className="grid items-start gap-6 md:grid-cols-[330px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-y-auto rounded-[30px] border border-white/75 bg-white/68 p-4 shadow-[0_22px_60px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-2xl md:sticky md:top-6"
            style={{ height: '600px' }}
          >
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Your applications</p>
                <p className="mt-1 text-[0.84rem] text-[#5F6368]">
                  {loading ? 'Loading...' : `${apps.length} application${apps.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90">
                <Briefcase size={17} />
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="h-[94px] animate-pulse rounded-[24px] border border-white/70 bg-white/58 shadow-[0_8px_22px_rgba(26,115,232,0.05)]"
                    />
                  ))}
                </div>
              ) : apps.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#D7E6FF] bg-white/58 px-4 py-10 text-center shadow-[0_10px_24px_rgba(26,115,232,0.06)]">
                  <img src={applicationEmptyIllustration} alt="" className="mx-auto w-44 mb-4 select-none" />
                  <h3 className="text-sm font-semibold text-[#202124]">No applications yet</h3>
                  <p className="mx-auto mt-1.5 max-w-xs text-[0.75rem] leading-5 text-[#5F6368]">
                    Start applying to opportunities to track them here.
                  </p>
                  <Link to="/opportunities" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1A73E8] px-4 py-2 text-[0.75rem] font-semibold text-white hover:bg-[#1558C0] transition-colors">
                    Browse opportunities <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                apps.map((app, index) => {
                  const cfg = getStatusMeta(app.status)
                  const selected = selectedAppId === app.id

                  return (
                    <motion.button
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`group w-full rounded-[24px] border px-4 py-5 text-left transition-all ${
                        selected
                          ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_14px_30px_rgba(26,115,232,0.13),0_1px_0_rgba(255,255,255,0.86)_inset]'
                          : 'border-white/75 bg-white hover:border-[#BFD7FF] hover:bg-[#FBFCFE] hover:shadow-[0_12px_28px_rgba(26,115,232,0.08)]'
                      }`}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <GradientAvatar name={app.ngoName || app.role || 'Application'} size={44} radius="0.95rem" className="shrink-0 shadow-sm ring-2 ring-white/80" />
                          <div className="min-w-0">
                          <p className={`line-clamp-1 text-[0.98rem] font-semibold leading-snug ${selected ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                            {app.role || 'Position'}
                          </p>
                          <p className="mt-1.5 truncate text-[0.78rem] text-[#5F6368]">
                            {app.ngoName || 'Organization'}
                          </p>
                          </div>
                        </div>
                        <ArrowRight size={16} className={`mt-1 shrink-0 transition-transform ${selected ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
                      </div>
                    </motion.button>
                  )
                })
              )}
            </div>
          </motion.aside>

          <motion.section
            key={selectedAppId || 'empty'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col overflow-hidden rounded-[34px] border border-white/75 bg-white/68 shadow-[0_26px_72px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-2xl"
          >
            {!selectedApp ? (
              <div className="flex min-h-[360px] items-center justify-center px-8 py-16">
                <div className="max-w-lg text-center">
                  <h2 className="text-xl font-semibold text-[#202124]">Select an application</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5F6368]">
                    Choose a role from the list to review its full details here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="relative shrink-0 overflow-hidden border-b border-[#D7E6FF] bg-[#F8FBFF] px-10 py-9">
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(232,240,254,0.62))]" aria-hidden="true" />
                  <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-16">
                    <div className="relative flex min-w-0 items-start gap-4">
                      <GradientAvatar name={selectedNgoName} size={58} radius="1.15rem" className="mt-1 shrink-0 shadow-sm ring-4 ring-white/90" />
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#D7E6FF] bg-white/78 px-3 py-1.5 text-[0.72rem] font-semibold text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)] backdrop-blur-xl">
                            Applied role
                          </span>
                          {selectedCategory && (
                            <span className="rounded-full border border-white/80 bg-white/58 px-3 py-1.5 text-[0.72rem] font-semibold text-[#5F6368] shadow-[0_8px_18px_rgba(26,115,232,0.06)] backdrop-blur-xl">
                              {selectedCategory}
                            </span>
                          )}
                        </div>
                        <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-semibold leading-tight tracking-[-0.035em] text-[#202124]">
                          {selectedApp.role || 'Position'}
                        </h2>
                        {selectedNgoId ? (
                          <Link
                            to={`/ngo-profile/${selectedNgoId}`}
                            className="mt-2 inline-flex text-[0.98rem] font-medium text-[#5F6368] transition-colors hover:text-[#1A73E8]"
                          >
                            {selectedNgoName}
                          </Link>
                        ) : (
                          <p className="mt-2 text-[0.98rem] text-[#5F6368]">
                            {selectedNgoName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="relative flex shrink-0 items-center gap-4 pt-1">
                      {statusMeta && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/75 px-3 py-1.5 text-[0.82rem] font-semibold shadow-[0_8px_18px_rgba(26,115,232,0.08)] ${statusMeta.bg} ${statusMeta.color}`}>
                          <StatusIcon size={14} />
                          {statusMeta.label}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteApplication(selectedApp.id)}
                        disabled={deletingId === selectedApp.id}
                        className="rounded-full border border-white/75 bg-white/58 p-2 text-[#C5221F] shadow-[0_8px_18px_rgba(197,34,31,0.06)] transition hover:bg-[#FCE8E6] disabled:opacity-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-10 py-9">
                  {!selectedApp.opportunityId ? (
                    <NoticeCard>This application is not linked to a published opportunity yet.</NoticeCard>
                  ) : isDetailLoading ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="h-[104px] animate-pulse rounded-[24px] border border-white/70 bg-white/58" />
                      ))}
                    </div>
                  ) : selectedError ? (
                    <NoticeCard tone="error">Could not load the opportunity details.</NoticeCard>
                  ) : (
                    <>
                      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {primaryDetails.map(item => (
                          <MetricCard key={item.label} label={item.label} value={item.value} icon={item.icon} tint={item.tint} accent={item.accent} />
                        ))}
                      </div>

                      <DetailSection title="Role overview">
                        <p className="max-w-4xl text-[1rem] leading-8 text-[#5F6368]">
                          {overviewText}
                        </p>
                      </DetailSection>

                      {skillLabels.length > 0 && (
                        <DetailSection title="Required skills">
                          <ChipList items={skillLabels} color="blue" />
                        </DetailSection>
                      )}

                    </>
                  )}
                </div>
              </div>
            )}
          </motion.section>
        </section>
      </div>
    </main>
  )
}

function NoticeCard({ children, tone = 'default' }) {
  const styles = tone === 'error'
    ? 'border-red-100 bg-red-50/80 text-red-700'
    : 'border-white/75 bg-white/58 text-[#5F6368]'

  return (
    <div className={`rounded-[22px] border px-5 py-4 text-sm shadow-[0_10px_24px_rgba(26,115,232,0.06)] backdrop-blur-xl ${styles}`}>
      {children}
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, tint = '#E8F0FE', accent = '#1A73E8' }) {
  return (
    <div
      className="group relative flex min-h-[132px] flex-col overflow-hidden rounded-[24px] border bg-white p-4 text-left shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(17,24,39,0.09)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, ${accent}, ${tint})` }}
      />
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full transition-transform duration-300 group-hover:translate-y-[-2px]"
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z"
          fill={tint}
          opacity="0.55"
        />
        <path
          d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z"
          fill={tint}
          opacity="0.85"
        />
      </svg>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
          style={{ background: tint, color: accent }}
        >
          {Icon && <Icon size={18} />}
        </span>
      </div>
      <div className="relative z-10 mt-auto">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#5F6368]">
          {label}
        </p>
        <p className="mt-2 max-w-full truncate text-[1.08rem] font-semibold tracking-[-0.02em] text-[#202124]">
          {value}
        </p>
      </div>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <section className="mt-7 border-t border-white/70 pt-7">
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8A94A3]">
        {title}
      </h3>
      <div className="mt-4">
        {children}
      </div>
    </section>
  )
}

function ChipList({ items, color }) {
  const colors = color === 'green'
    ? 'border-[#D7F2E4] bg-[#F2FBF6] text-[#188038]'
    : 'border-[#D9E6FF] bg-[#F7FAFF] text-[#1A73E8]'

  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={`rounded-full border bg-white/58 px-3.5 py-2 text-[0.86rem] font-semibold shadow-[0_8px_18px_rgba(26,115,232,0.05)] backdrop-blur-xl ${colors}`}>
          {item}
        </span>
      ))}
    </div>
  )
}
