import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
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
  const primaryDetails = selectedOpp ? [
    { label: 'Location', value: formatField(selectedOpp.location) },
    { label: 'Category', value: formatField(selectedOpp.category || selectedOpp.field) },
    { label: 'Work mode', value: formatField(selectedOpp.work_mode) },
    { label: 'Hours/week', value: formatField(selectedOpp.weekly_hours) },
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
          <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
            Applications
          </h1>
          <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-[#5F6368]">
            Manage the roles you have applied to and review the full opportunity on the right.
          </p>
        </motion.header>

        <section className="grid items-start gap-6 md:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col overflow-hidden rounded-[34px] border bg-white shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)] md:sticky md:top-6"
            style={{
              borderColor: 'rgba(209,224,255,0.95)',
              height: '1000px',
            }}
          >
            <div className="flex items-start justify-between gap-4 px-7 py-7">
              <div>
                <h2 className="text-[1.5rem] font-semibold text-[#202124]">
                  Your applications
                </h2>
                <p className="mt-2 text-[0.92rem] text-[#5F6368]">
                  {loading ? 'Loading your applications...' : `${apps.length} total`}
                </p>
              </div>

              <Link
                to="/opportunities"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8] transition-transform hover:-translate-y-0.5"
                aria-label="Browse opportunities"
              >
                <ChevronRight size={22} />
              </Link>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-[26px] border bg-[#FBFCFE]"
                      style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                    />
                  ))}
                </div>
              ) : apps.length === 0 ? (
                <div
                  className="rounded-[28px] border bg-[#FBFCFE] px-5 py-10 text-center"
                  style={{ borderColor: 'rgba(26,115,232,0.08)' }}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                    <Briefcase size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#202124]">No applications yet</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#5F6368]">
                    Apply to opportunities and they will appear in this list.
                  </p>
                  <Link
                    to="/opportunities"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.18)] transition-transform hover:-translate-y-0.5"
                  >
                    Browse opportunities
                  </Link>
                </div>
              ) : (
                apps.map((app, index) => {
                  const cfg = getStatusMeta(app.status)
                  const Icon = cfg.icon
                  const selected = selectedAppId === app.id

                  return (
                    <motion.button
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="mb-4 w-full rounded-[28px] border p-4 text-left transition-colors"
                      style={
                        selected
                          ? {
                              background: '#EAF1FF',
                              borderColor: '#C8D9FF',
                              boxShadow: '0 10px 28px rgba(26,115,232,0.08)',
                            }
                          : {
                              background: '#FFFFFF',
                              borderColor: 'rgba(209,224,255,0.95)',
                            }
                      }
                    >
                      <div className="flex items-start gap-3">
                        <GradientAvatar name={app.ngoName || 'Organization'} size={52} radius="1rem" className="shrink-0" />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                            <p className="truncate text-[1.05rem] font-semibold text-[#202124]">
                              {app.role || 'Position'}
                            </p>
                              <p className="mt-1 truncate text-[0.9rem] text-[#5F6368]">
                                {app.ngoName || 'Organization'}
                              </p>
                            </div>

                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${cfg.bg} ${cfg.color}`}>
                              <Icon size={11} />
                              {cfg.label}
                            </span>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <span className="inline-flex items-center gap-1 text-[0.88rem] font-semibold text-[#1A73E8]">
                              View
                              <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
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
              height: '1000px',
            }}
          >
            {!selectedApp ? (
              <div className="flex min-h-[360px] items-center justify-center px-8 py-16">
                <div className="max-w-lg text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F0FE] text-[#1A73E8]">
                    <Briefcase size={28} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#202124]">
                    Select an application
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5F6368]">
                    Choose a role from the list on the left to open the full opportunity details here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="shrink-0 border-b border-[#E5EEFB] px-8 py-6">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF1FF] px-3.5 py-2 text-[0.82rem] font-semibold text-[#1A73E8]">
                      <Sparkles size={14} />
                      Opportunity details
                    </div>

                    {statusMeta && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.82rem] font-semibold ${statusMeta.bg} ${statusMeta.color}`}>
                        <StatusIcon size={14} />
                        {statusMeta.label}
                      </span>
                    )}
                  </div>

                  <h2 className="text-[2.25rem] font-semibold leading-tight text-[#202124] sm:text-[2.75rem]">
                    {selectedApp.role || 'Position'}
                  </h2>
                  <p className="mt-2 text-[0.98rem] text-[#5F6368]">
                    {selectedOpp?.org_name || selectedOpp?.orgName || selectedApp.ngoName || 'Organization'}
                  </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 py-6 [scrollbar-gutter:stable]">
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
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {primaryDetails.map(item => (
                          <MetricCard key={item.label} label={item.label} value={item.value} />
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

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F8FAFD] p-4">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">
        {label}
      </p>
      <p className="mt-2 truncate text-[1rem] font-semibold text-[#202124]">
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
