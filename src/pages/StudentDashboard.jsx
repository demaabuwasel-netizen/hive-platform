import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchStudentApplications } from '../services/applications'
import { computeMatch } from '../services/matching'
import { fetchActiveOpportunities } from '../services/opportunities'
import dashboardIllustration from '../assets/student dashboard.PNG'
import certificateBackground from '../assets/certificate background.png'

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

function cleanFileName(value) {
  return String(value || 'certificate')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function imageUrlToDataUrl(src) {
  try {
    const response = await fetch(src)
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return src
  }
}

function buildCertificateHtml({ roleName, ngoName, backgroundSrc }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Hive Certificate - ${escapeHtml(roleName)}</title>
    <style>
      @page { size: landscape; margin: 0; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f5f7fb; font-family: 'Avenir Next', 'Helvetica Neue', Arial, sans-serif; color: #202124; }
      .certificate { position: relative; width: min(1000px, calc(100vw - 40px)); aspect-ratio: 1448 / 1086; overflow: hidden; border-radius: 30px; background-image: url("${backgroundSrc}"); background-size: cover; background-position: center; box-shadow: 0 24px 70px rgba(60,64,67,0.14); }
      .center { position: absolute; left: 50%; top: 53%; width: min(620px, 64%); transform: translate(-50%, -50%); text-align: center; }
      .label { margin: 0 0 14px; color: #7f8b9d; font-size: 12px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
      .role { margin: 0; color: #1f2937; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(34px, 5vw, 58px); line-height: 1.04; letter-spacing: -0.055em; }
      .company { margin: 16px 0 0; color: #5f6368; font-size: clamp(16px, 2vw, 23px); font-weight: 600; letter-spacing: -0.02em; }
      .company span { color: #1a73e8; }
      @media print {
        body { background: white; }
        .certificate { width: 100vw; height: 100vh; border-radius: 0; box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <main class="certificate">
      <div class="center">
        <p class="label">Completed role</p>
        <h1 class="role">${escapeHtml(roleName)}</h1>
        <p class="company">with <span>${escapeHtml(ngoName)}</span></p>
      </div>
    </main>
  </body>
</html>`
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

function CertificateModal({ certificates, studentName, onClose, onDownload, onView }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/20 px-4 py-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl overflow-hidden rounded-[34px] border border-[#E5EEFB] bg-white shadow-[0_28px_80px_rgba(60,64,67,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EDF2FA] px-6 py-5">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Certificates</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#202124]">Completed roles</h2>
            <p className="mt-1.5 text-[0.9rem] leading-6 text-[#5F6368]">
              View or download certificates for roles you finished.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#5F6368] transition-colors hover:bg-[#EEF3FB]"
            aria-label="Close certificates"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-6">
          {certificates.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#D7E6FF] bg-[#FBFCFE] px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.035em] text-[#202124]">No certificates yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#5F6368]">
                When an NGO marks a role complete, your certificate will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map(certificate => (
                <article
                  key={certificate.id}
                  className="rounded-[26px] border border-[#E5EEFB] bg-[#FBFCFE] p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-3 py-1 text-[0.72rem] font-semibold text-[#1A73E8]">
                        <Award size={13} />
                        Certificate ready
                      </div>
                      <h3 className="truncate text-[1.05rem] font-semibold tracking-[-0.035em] text-[#202124]">
                        {certificate.role || 'Volunteer role'}
                      </h3>
                      <p className="mt-1 text-[0.86rem] text-[#5F6368]">
                        {studentName} completed this role with {certificate.ngoName || 'Hive partner'}.
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => onView(certificate)}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-[#D7E6FF] bg-white px-4 text-[0.82rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]"
                      >
                        <Eye size={15} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownload(certificate)}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1A73E8] px-4 text-[0.82rem] font-semibold text-white transition-colors hover:bg-[#1765CC]"
                      >
                        <Download size={15} />
                        Download
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
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
  const [applications, setApplications] = useState([])
  const [certificateOpen, setCertificateOpen] = useState(false)
  const [topMatches, setTopMatches] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    fetchStudentApplications(user.id)
      .then(apps => {
        setApplications(apps)
        setAppCount(apps.length)
        setInterviewCount(apps.filter(a => a.status === 'interview').length)
      })
      .catch(() => {
        setApplications([])
      })
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
    {
      icon: Award,
      label: 'Certificates',
      hint: `${applications.filter(app => app.status === 'completed').length} ready`,
      tint: '#E6F4EA',
      accent: '#188038',
      onClick: () => setCertificateOpen(true),
    },
  ].map(action => ({ ...action, onClick: action.onClick ?? (() => navigate(action.to)) }))

  const completedApplications = applications.filter(app => app.status === 'completed')
  const studentName = profile?.name || user?.name || 'Student'

  async function getCertificateHtml(app) {
    const roleName = app?.role || 'Volunteer role'
    const ngoName = app?.ngoName || 'Hive partner'
    const backgroundSrc = await imageUrlToDataUrl(certificateBackground)
    return buildCertificateHtml({ roleName, ngoName, backgroundSrc })
  }

  async function downloadCertificate(app) {
    const html = await getCertificateHtml(app)
    const roleName = app?.role || 'Volunteer role'
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${cleanFileName(roleName)}-hive-certificate.html`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function viewCertificate(app) {
    const html = await getCertificateHtml(app)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  }

  return (
    <main className="relative min-h-screen bg-[#F5F7FB]">
      {/* Soft ambient gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />

      <div className="relative mx-auto max-w-[1520px] px-6 pb-10 pt-6 lg:px-10 lg:pt-8">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="relative z-0 mb-2 flex flex-col gap-4 lg:mb-0 lg:flex-row lg:items-start lg:justify-between"
        >
          <div className="max-w-3xl lg:mt-0 lg:translate-x-2 lg:translate-y-10">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#202124] sm:text-5xl">
              Welcome {firstName}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.96rem] leading-7 text-[#5F6368]">
              Manage opportunities, applications, and interviews
              <br />
              from one clean workspace.
            </p>
          </div>

          <div className="self-start lg:mt-0 lg:-translate-y-2">
            <motion.img
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              src={dashboardIllustration}
              alt=""
              className="w-[560px] max-w-full lg:mb-[-54px] lg:mr-8"
            />
          </div>
        </motion.header>

        <section
          className="relative z-10 rounded-[36px] border bg-white px-5 py-6 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
          style={{ borderColor: 'rgba(26,115,232,0.10)' }}
        >
          <div className="mb-6">
            <div>
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#202124]">Quick actions</h2>
              <p className="mt-1.5 text-[0.9rem] text-[#5F6368]">Move through the workspace without hunting.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.label}
                action={action}
                delay={index * 0.05}
                count={action.label === 'Applications' ? appCount : action.label === 'Certificates' ? completedApplications.length : action.label === 'Interviews' ? interviewCount : null}
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

      {certificateOpen && (
        <CertificateModal
          certificates={completedApplications}
          studentName={studentName}
          onClose={() => setCertificateOpen(false)}
          onDownload={downloadCertificate}
          onView={viewCertificate}
        />
      )}
    </main>
  )
}
