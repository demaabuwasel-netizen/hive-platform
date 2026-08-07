import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, GraduationCap, Briefcase, FileText, Heart, Target,
  ExternalLink, Calendar, Globe, Award, Layers, Link2,
} from 'lucide-react'
import { loadStudentProfile } from '../services/storage'
import { groupSkills } from '../data/skills'
import GradientAvatar from '../components/GradientAvatar'

function hasContent(obj) {
  return obj && (typeof obj === 'string' ? obj.trim().length > 0 : Array.isArray(obj) ? obj.length > 0 : false)
}

// Same glassy card treatment used on the student's and NGO's own profile
// pages — icon chip + title/subtitle header, translucent blurred body.
function CardTitle({ icon: Icon, tint = 'rgba(26,115,232,0.12)', accent = '#1A73E8', title, subtitle }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/40 px-6 py-4">
      {Icon && (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm ring-1 ring-black/[0.04]"
          style={{ background: tint, color: accent }}
        >
          <Icon size={16} strokeWidth={2} />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-[0.95rem] font-semibold text-[#202124]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">{subtitle}</p>}
      </div>
    </div>
  )
}

function SectionCard({ icon, tint, accent, title, subtitle, delay = 0, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="overflow-hidden rounded-[32px] border border-white/50 bg-white/40 shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.06)] backdrop-blur-xl"
    >
      <CardTitle icon={icon} tint={tint} accent={accent} title={title} subtitle={subtitle} />
      <div className="p-6">{children}</div>
    </motion.section>
  )
}

// Decorative wave for the page background — same technique used on the NGO
// profile page: radial glows (no straight edges to look "cut off") plus two
// flowing lines that fade in/out via their own gradients. Sits behind the
// header card and extends down past it.
function ProfileWaves() {
  return (
    <div className="pointer-events-none absolute -top-10 right-[-60px] z-0 h-[26rem] w-[38rem] select-none" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 640 420" fill="none">
        <defs>
          <linearGradient id="studentPublicWaveLine1" x1="60" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1A73E8" stopOpacity="0" />
            <stop offset="0.22" stopColor="#1A73E8" stopOpacity="0.3" />
            <stop offset="0.6" stopColor="#34A853" stopOpacity="0.24" />
            <stop offset="1" stopColor="#34A853" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="studentPublicWaveLine2" x1="40" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1A73E8" stopOpacity="0" />
            <stop offset="0.28" stopColor="#A142F4" stopOpacity="0.18" />
            <stop offset="0.68" stopColor="#1A73E8" stopOpacity="0.14" />
            <stop offset="1" stopColor="#1A73E8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="studentPublicWaveGlowA" cx="65%" cy="30%" r="60%">
            <stop offset="0" stopColor="#1A73E8" stopOpacity="0.12" />
            <stop offset="0.55" stopColor="#1A73E8" stopOpacity="0.05" />
            <stop offset="1" stopColor="#1A73E8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="studentPublicWaveGlowB" cx="45%" cy="58%" r="55%">
            <stop offset="0" stopColor="#34A853" stopOpacity="0.09" />
            <stop offset="0.55" stopColor="#34A853" stopOpacity="0.04" />
            <stop offset="1" stopColor="#34A853" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="640" height="420" fill="url(#studentPublicWaveGlowA)" />
        <rect x="0" y="0" width="640" height="420" fill="url(#studentPublicWaveGlowB)" />
        <path
          d="M70,120 C160,65 250,170 340,115 C420,68 490,98 600,50"
          stroke="url(#studentPublicWaveLine1)" strokeWidth="6" strokeLinecap="round" fill="none"
        />
        <path
          d="M50,200 C150,135 240,240 330,180 C410,130 480,162 600,130"
          stroke="url(#studentPublicWaveLine2)" strokeWidth="4" strokeLinecap="round" fill="none"
        />
      </svg>
    </div>
  )
}

export default function StudentPublicProfile() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const backTo = searchParams.get('backTo')
  const opportunityId = searchParams.get('opportunity')
  const backLabel = backTo === 'applicants' ? 'Back to applicants' : backTo === 'matches' ? 'Back to matches' : 'Back'

  const handleBack = () => {
    if (backTo === 'applicants' && opportunityId) {
      navigate(`/applicants?opportunity=${opportunityId}`)
    } else {
      navigate(-1)
    }
  }

  useEffect(() => {
    if (!studentId) {
      navigate('/opportunities')
      return
    }

    let mounted = true

    ;(async () => {
      setLoading(true)
      setError(null)

      const timeoutId = setTimeout(() => {
        if (mounted) {
          setLoading(false)
          setError('Taking longer than expected. The student profile may be temporarily unavailable.')
        }
      }, 20000)

      try {
        const p = await loadStudentProfile(studentId)
        clearTimeout(timeoutId)
        if (!mounted) return
        if (!p) {
          setLoading(false)
          setError('Student profile not found.')
          return
        }
        setProfile(p)
        document.title = `${p.name} - Hive`
        setLoading(false)
      } catch (err) {
        clearTimeout(timeoutId)
        if (mounted) {
          setLoading(false)
          setError('Could not load student profile: ' + (err?.message || 'Unknown error'))
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [studentId, navigate])

  if (loading) {
    return (
      <main className="relative flex-1 overflow-y-auto bg-[#F5F7FB]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-10 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-44 rounded-[32px] bg-white/50" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 rounded-[32px] bg-white/40" />
                <div className="h-32 rounded-[32px] bg-white/40" />
              </div>
              <div className="space-y-4">
                <div className="h-32 rounded-[32px] bg-white/40" />
                <div className="h-32 rounded-[32px] bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="relative flex-1 overflow-y-auto bg-[#F5F7FB]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-10 lg:px-8">
          <button
            onClick={handleBack}
            className="mb-8 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-[#1A73E8] hover:text-[#1765CC]"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
          <div className="rounded-[32px] border border-white/50 bg-white/40 p-10 text-center shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.06)] backdrop-blur-xl">
            <p className="mb-2 font-semibold text-[#202124]">{error ? 'Unable to load profile' : 'Student profile not found'}</p>
            <p className="text-[#5F6368]">{error || 'This student profile could not be found.'}</p>
          </div>
        </div>
      </main>
    )
  }

  const formattedLanguages = (profile.languages || []).map(l => {
    if (typeof l === 'string') return l
    if (typeof l === 'object' && l.lang) return `${l.lang}${l.level ? ` (${l.level})` : ''}`
    return null
  }).filter(Boolean)

  const hasLinks = profile.links?.linkedin || profile.links?.github || profile.links?.portfolio
  const interests = Array.isArray(profile.interests) ? profile.interests.filter(Boolean) : []

  const profileFacts = [
    { label: 'Skills', value: `${profile.skills?.length || 0}` },
    { label: 'Education', value: `${profile.educations?.length || 0}` },
    { label: 'Languages', value: `${formattedLanguages.length}` },
  ]

  const links = [
    profile.links?.linkedin && { label: 'LinkedIn', href: profile.links.linkedin, tint: 'rgba(26,115,232,0.12)', accent: '#1A73E8' },
    profile.links?.github && { label: 'GitHub', href: profile.links.github, tint: 'rgba(32,33,36,0.08)', accent: '#202124' },
    profile.links?.portfolio && { label: 'Portfolio', href: profile.links.portfolio, tint: 'rgba(24,128,56,0.12)', accent: '#188038' },
  ].filter(Boolean)

  return (
    <main className="relative flex-1 overflow-y-auto bg-[#F5F7FB]">
      {/* Soft ambient gradients — same treatment as the student/NGO's own profile pages */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />
      <ProfileWaves />

      <div className="relative mx-auto max-w-5xl px-6 py-8 lg:px-8">

        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-[#1A73E8] hover:text-[#1765CC]"
        >
          <ArrowLeft size={16} />
          {backLabel}
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mb-6 overflow-hidden rounded-[32px] border border-white/50 bg-white/40 p-7 shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.06)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <GradientAvatar name={profile.name} size={88} radius="1.5rem" className="shrink-0 shadow-[0_8px_24px_rgba(26,115,232,0.14)] ring-4 ring-white"/>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[1.9rem] font-semibold tracking-[-0.015em] text-[#202124]">
                    {profile.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[0.7rem] font-medium text-[#1A73E8]">
                    <GraduationCap size={12} />
                    Student profile
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.94rem] font-semibold text-[#5F6368]">
                  {profile.field && <span>{profile.field}</span>}
                  {profile.university && (
                    <>
                      {profile.field && <span className="text-[#9AA0A6]">·</span>}
                      <span>{profile.university}</span>
                    </>
                  )}
                  {profile.city && (
                    <>
                      <span className="text-[#9AA0A6]">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} />
                        {profile.city}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-3 max-w-2xl text-[0.92rem] leading-7 text-[#5F6368]">
                  {profile.bio || 'This student hasn\'t added a bio yet.'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-4 sm:items-end">
              <button
                onClick={() => navigate(`/interview-message/${studentId}`, { state: { fromProfile: true } })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-5 py-2.5 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#1765CC]"
              >
                <Calendar size={15} strokeWidth={2}/>
                Interview
              </button>
              <div className="grid w-full grid-cols-3 gap-2 rounded-[22px] bg-white/40 p-2.5 ring-1 ring-white/50 backdrop-blur-md sm:w-[230px]">
                {profileFacts.map(fact => (
                  <div key={fact.label} className="rounded-2xl bg-white/45 px-2 py-2.5 text-center ring-1 ring-white/60">
                    <p className="text-[1.1rem] font-semibold text-[#202124]">{fact.value}</p>
                    <p className="mt-0.5 text-[0.66rem] font-semibold text-[#5F6368]">{fact.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            {hasContent(profile.bio) && (
              <SectionCard icon={FileText} tint="rgba(26,115,232,0.12)" accent="#1A73E8" title="About">
                <p className="text-[0.9rem] leading-7 text-[#5F6368]">{profile.bio}</p>
              </SectionCard>
            )}

            <SectionCard icon={Award} tint="rgba(163,109,0,0.12)" accent="#B06000" title="Skills" delay={0.03}>
              {profile.skills?.length > 0 ? (
                <div className="-m-6 overflow-hidden rounded-b-[32px]">
                  {groupSkills(profile.skills).map(({ cat, items }) => (
                    <div
                      key={cat.cat}
                      className="grid gap-3 border-t border-white/40 px-6 py-4 first:border-t-0 md:grid-cols-[160px_minmax(0,1fr)] md:items-start"
                    >
                      <div>
                        <span className="inline-flex rounded-full bg-[#E8F0FE] px-3 py-1 text-[0.7rem] font-semibold uppercase text-[#1A73E8]">{cat.cat}</span>
                        <p className="mt-2 text-[0.74rem] font-semibold text-[#9AA0A6]">{items.length} added</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {items.map(item => (
                          <span
                            key={item.name}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[0.76rem] font-medium text-[#202124] shadow-[0_1px_2px_rgba(17,24,39,0.03)] backdrop-blur-sm"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[0.86rem] text-[#9AA0A6]">No skills added yet.</p>
              )}
            </SectionCard>

            <SectionCard icon={GraduationCap} tint="rgba(26,115,232,0.12)" accent="#1A73E8" title="Education" delay={0.05}>
              {profile.educations?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {profile.educations.map((edu, i) => (
                    <div key={i} className="flex gap-4 rounded-2xl bg-white/40 p-4 ring-1 ring-white/50 transition-colors hover:bg-white/60">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
                        <GraduationCap size={18} strokeWidth={2}/>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.92rem] font-semibold text-[#202124]">{edu.field || 'Education'}</p>
                        <p className="mt-0.5 text-[0.84rem] text-[#5F6368]">{edu.university || 'School not set'}</p>
                        {(edu.degreeType || edu.isCurrent) && (
                          <p className="mt-1.5 text-[0.78rem] font-medium text-[#1A73E8]">
                            {[edu.degreeType, edu.isCurrent ? 'Current' : ''].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {edu.description && <p className="mt-2 text-[0.82rem] leading-6 text-[#5F6368]">{edu.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : profile.university ? (
                <div className="flex gap-4 rounded-2xl bg-white/40 p-4 ring-1 ring-white/50">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
                    <GraduationCap size={18} strokeWidth={2}/>
                  </span>
                  <div>
                    <p className="text-[0.92rem] font-semibold text-[#202124]">{profile.field || 'Field not set'}</p>
                    <p className="mt-0.5 text-[0.84rem] text-[#5F6368]">{profile.university}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[0.86rem] text-[#9AA0A6]">No education added yet.</p>
              )}
            </SectionCard>

            {/* Projects don't persist to the database anywhere in the app yet
                (a pre-existing gap, not specific to this page), so this shows
                empty until that's fixed. */}
            <SectionCard icon={Layers} tint="rgba(161,66,244,0.12)" accent="#A142F4" title="Projects" delay={0.09}>
              {profile.projects?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {profile.projects.map((project, i) => (
                    <div key={i} className="flex gap-4 rounded-2xl bg-white/40 p-4 ring-1 ring-white/50 transition-colors hover:bg-white/60">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E8FD] text-[#A142F4]">
                        <Layers size={18} strokeWidth={2}/>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.92rem] font-semibold text-[#202124]">{project.title || 'Project'}</p>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-[0.84rem] text-[#1A73E8] hover:underline">
                            View project →
                          </a>
                        )}
                        {project.description && <p className="mt-2 text-[0.82rem] leading-6 text-[#5F6368]">{project.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[0.86rem] text-[#9AA0A6]">No projects added yet.</p>
              )}
            </SectionCard>

            {(interests.length > 0 || formattedLanguages.length > 0) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {interests.length > 0 && (
                  <SectionCard icon={Heart} tint="rgba(226,68,92,0.12)" accent="#E2445C" title="Causes" subtitle="What this student cares about" delay={0.11}>
                    <div className="flex flex-wrap gap-2">
                      {interests.map(interest => (
                        <span key={interest} className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[0.8rem] font-medium text-[#202124] backdrop-blur-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {formattedLanguages.length > 0 && (
                  <SectionCard icon={Globe} tint="rgba(24,128,56,0.12)" accent="#188038" title="Languages" delay={0.13}>
                    <div className="flex flex-wrap gap-2">
                      {formattedLanguages.map((lang, i) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[0.8rem] font-medium text-[#202124] backdrop-blur-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>
            )}

            {hasContent(profile.experience) && (
              <SectionCard icon={Briefcase} tint="rgba(24,128,56,0.12)" accent="#188038" title="Experience" delay={0.15}>
                <p className="whitespace-pre-line text-[0.9rem] leading-7 text-[#5F6368]">{profile.experience}</p>
              </SectionCard>
            )}

            {hasContent(profile.goals) && (
              <SectionCard icon={Target} tint="rgba(242,153,0,0.12)" accent="#F29900" title="Career goals" delay={0.17}>
                <p className="whitespace-pre-line text-[0.9rem] leading-7 text-[#5F6368]">{profile.goals}</p>
              </SectionCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {hasLinks && (
              <SectionCard icon={Link2} tint="rgba(26,115,232,0.12)" accent="#1A73E8" title="Connect" delay={0.08}>
                <div className="space-y-2">
                  {links.map(({ label, href, tint, accent }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-2xl bg-white/40 px-4 py-3 text-[0.85rem] font-semibold text-[#202124] ring-1 ring-white/50 transition-colors hover:bg-white/60"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: tint, color: accent }}
                        >
                          <ExternalLink size={13} />
                        </span>
                        {label}
                      </span>
                      <ExternalLink size={14} className="text-[#9AA0A6] transition-colors group-hover:text-[#1A73E8]"/>
                    </a>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
