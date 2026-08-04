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
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchStudentApplications } from '../services/applications'
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
  const { user } = useApp()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [detail, setDetail] = useState({ id: null, data: null, error: null })

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
        console.error('[Applications] Failed to fetch opportunity:', err.message)
        if (!cancelled) setDetail({ id: selectedApp.opportunityId, data: null, error: err.message })
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
  const primaryDetails = selectedOpp ? [
    { label: 'Location', value: formatField(selectedOpp.location), tint: '#E8F0FE', accent: '#1A73E8' },
    { label: 'Category', value: formatField(selectedOpp.category || selectedOpp.field), tint: '#E6F4EA', accent: '#188038' },
    { label: 'Work mode', value: formatField(selectedOpp.work_mode), tint: '#FEF7E0', accent: '#F29900' },
    { label: 'Hours/week', value: formatField(selectedOpp.weekly_hours), tint: '#F3E8FD', accent: '#A142F4' },
  ] : []
  const skillLabels = (selectedOpp?.skills || []).map(formatSkill).filter(Boolean)
  const languageLabels = (selectedOpp?.languages || []).map(formatLanguage).filter(Boolean)

  return (
    <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1480px] px-6 pb-8 pt-12 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
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
            className="overflow-y-auto rounded-[28px] border border-[#E5EEFB] bg-white p-4 shadow-[0_12px_34px_rgba(17,24,39,0.04)] md:sticky md:top-6"
            style={{ height: '600px' }}
          >
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Your applications</p>
                <p className="mt-1 text-[0.84rem] text-[#5F6368]">
                  {loading ? 'Loading...' : `${apps.length} application${apps.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="h-[94px] animate-pulse rounded-[22px] border border-[#E5EEFB] bg-[#FBFCFE]"
                    />
                  ))}
                </div>
              ) : apps.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#D7E6FF] bg-[#F8FBFF] px-4 py-10 text-center">
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
                      className={`group w-full rounded-[22px] border p-4 text-left transition-all ${
                        selected
                          ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_12px_28px_rgba(26,115,232,0.12)]'
                          : 'border-[#E5EEFB] bg-white hover:border-[#BFD7FF] hover:bg-[#FBFCFE]'
                      }`}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`line-clamp-1 text-[0.95rem] font-semibold leading-snug ${selected ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                            {app.role || 'Position'}
                          </p>
                          <p className="mt-1.5 truncate text-[0.76rem] text-[#5F6368]">
                            {app.ngoName || 'Organization'}
                          </p>
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
            className="flex flex-col overflow-hidden rounded-[34px] border bg-white shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
            style={{
              borderColor: 'rgba(209,224,255,0.95)',
            }}
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
                <div className="shrink-0 border-b border-[#D7E6FF] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_55%,#EEF4FF_100%)] px-10 py-9">
                  <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-16">
                    <div className="min-w-0">
                      <h2 className="text-[2.25rem] font-semibold leading-tight text-[#202124] sm:text-[2.75rem]">
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

                    <div className="flex shrink-0 items-center gap-4 pt-1">
                      {statusMeta && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.82rem] font-semibold ${statusMeta.bg} ${statusMeta.color}`}>
                          <StatusIcon size={14} />
                          {statusMeta.label}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this application?')) {
                            setSelectedAppId(null)
                          }
                        }}
                        className="rounded-full p-2 text-[#C5221F] transition hover:bg-[#FCE8E6]">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-10 py-10">
                  {!selectedApp.opportunityId ? (
                    <NoticeCard>This application is not linked to a published opportunity yet.</NoticeCard>
                  ) : isDetailLoading ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="h-[92px] animate-pulse rounded-2xl bg-[#F1F5FE]" />
                      ))}
                    </div>
                  ) : selectedError ? (
                    <NoticeCard tone="error">Could not load the opportunity details.</NoticeCard>
                  ) : (
                    <>
                      <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {primaryDetails.map(item => (
                          <MetricCard key={item.label} label={item.label} value={item.value} tint={item.tint} accent={item.accent} />
                        ))}
                      </div>

                      <DetailSection title="Role overview">
                        <p className="max-w-4xl text-[1rem] leading-8 text-[#5F6368]">
                          {selectedOpp?.description || selectedOpp?.mission_impact || 'No role description is available for this opportunity.'}
                        </p>
                      </DetailSection>

                      {selectedOpp?.mission_impact && selectedOpp.mission_impact !== selectedOpp.description && (
                        <DetailSection title="Mission impact">
                          <p className="max-w-4xl text-[1rem] leading-8 text-[#5F6368]">
                            {selectedOpp.mission_impact}
                          </p>
                        </DetailSection>
                      )}

                      {skillLabels.length > 0 && (
                        <DetailSection title="Required skills">
                          <ChipList items={skillLabels} color="blue" />
                        </DetailSection>
                      )}

                      {languageLabels.length > 0 && (
                        <DetailSection title="Required languages">
                          <ChipList items={languageLabels} color="green" />
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
    ? 'border-red-100 bg-red-50 text-red-700'
    : 'border-[#E5EEFB] bg-[#F8FAFD] text-[#5F6368]'

  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${styles}`}>
      {children}
    </div>
  )
}

function MetricCard({ label, value, tint = '#E8F0FE', accent = '#1A73E8' }) {
  return (
    <div
      className="group relative overflow-hidden rounded-[22px] border bg-white p-4 shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_22px_rgba(17,24,39,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(17,24,39,0.08)]"
      style={{ borderColor: `${accent}1F` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, ${accent}, ${tint})` }}
      />
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full transition-transform duration-300 group-hover:translate-y-[-2px]"
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z"
          fill={tint}
          opacity="0.52"
        />
        <path
          d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z"
          fill={tint}
          opacity="0.82"
        />
      </svg>
      <p className="relative z-10 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#202124]">
        {label}
      </p>
      <p className="relative z-10 mt-2 truncate text-[1rem] font-semibold text-[#202124]">
        {value}
      </p>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <section className="mt-7 border-t border-[#E5EEFB] pt-7">
      <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
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
        <span key={`${item}-${index}`} className={`rounded-full border px-3.5 py-2 text-[0.86rem] font-semibold ${colors}`}>
          {item}
        </span>
      ))}
    </div>
  )
}
