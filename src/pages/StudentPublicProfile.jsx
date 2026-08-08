import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, GraduationCap, Briefcase, FileText, Target,
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
    <div className="flex items-center gap-3 border-b border-white/70 bg-white/32 px-5 py-4 backdrop-blur-xl sm:px-6">
      {Icon && (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-[0_8px_18px_rgba(26,115,232,0.07)] backdrop-blur-sm ring-1 ring-white/70"
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
      className="overflow-hidden rounded-[30px] border border-white/75 bg-white/72 shadow-[0_22px_60px_rgba(26,115,232,0.075),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl"
    >
      <CardTitle icon={icon} tint={tint} accent={accent} title={title} subtitle={subtitle} />
      <div className="p-6">{children}</div>
    </motion.section>
  )
}

// Decorative wave from the NGO Matches page, reused here so profile review
// feels like part of the same NGO workflow.
function ProfileWaves() {
  return (
    <div className="pointer-events-none absolute right-[-7rem] top-14 hidden h-64 w-[620px] select-none overflow-hidden lg:block" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 620 250" fill="none" preserveAspectRatio="none">
        <path
          d="M40 120 C132 54 208 68 294 112 C384 158 478 148 620 62 L620 250 L40 250 Z"
          fill="url(#studentPublicMatchesWaveFill)"
          opacity="0.86"
        />
        <path
          d="M8 108 C112 38 202 56 292 100 C386 146 478 138 606 48"
          stroke="url(#studentPublicMatchesWaveLine)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.72"
        />
        <path
          d="M112 154 C214 96 284 120 360 154 C444 194 520 182 612 120"
          stroke="#1A73E8"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.12"
        />
        <defs>
          <linearGradient id="studentPublicMatchesWaveFill" x1="82" y1="28" x2="596" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#E8F0FE" stopOpacity="0" />
            <stop offset="0.38" stopColor="#D7E6FF" stopOpacity="0.72" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="studentPublicMatchesWaveLine" x1="0" y1="0" x2="620" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1A73E8" stopOpacity="0" />
            <stop offset="0.45" stopColor="#1A73E8" stopOpacity="0.25" />
            <stop offset="1" stopColor="#1A73E8" stopOpacity="0" />
          </linearGradient>
        </defs>
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[radial-gradient(circle_at_88%_4%,rgba(255,255,255,0.96),transparent_23%),radial-gradient(circle_at_80%_8%,rgba(26,115,232,0.13),transparent_42%),radial-gradient(circle_at_14%_0%,rgba(26,115,232,0.08),transparent_42%)]" />
        <ProfileWaves />
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[radial-gradient(circle_at_88%_4%,rgba(255,255,255,0.96),transparent_23%),radial-gradient(circle_at_80%_8%,rgba(26,115,232,0.13),transparent_42%),radial-gradient(circle_at_14%_0%,rgba(26,115,232,0.08),transparent_42%)]" />
        <ProfileWaves />
        <div className="relative mx-auto max-w-5xl px-6 py-10 lg:px-8">
          <button
            onClick={handleBack}
            className="mb-8 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-[#1A73E8] hover:text-[#1765CC]"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
          <div className="rounded-[30px] border border-white/75 bg-white/78 p-10 text-center shadow-[0_22px_60px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.88)_inset] backdrop-blur-2xl">
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
    <main className="relative flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F7FB]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[radial-gradient(circle_at_88%_4%,rgba(255,255,255,0.96),transparent_23%),radial-gradient(circle_at_80%_8%,rgba(26,115,232,0.13),transparent_42%),radial-gradient(circle_at_14%_0%,rgba(26,115,232,0.08),transparent_42%)]" />
      <ProfileWaves />

      <div className="relative mx-auto max-w-5xl px-6 py-10 lg:px-8">

        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-4 py-2 text-[0.85rem] font-semibold text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl transition-colors hover:bg-white"
        >
          <ArrowLeft size={16} />
          {backLabel}
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mb-6 overflow-hidden rounded-[32px] border border-white/75 bg-white/80 p-6 shadow-[0_24px_70px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl lg:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_86%_0%,rgba(26,115,232,0.13),transparent_42%),linear-gradient(180deg,rgba(232,240,254,0.42),transparent)]" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <GradientAvatar name={profile.name} size={96} radius="1.5rem" className="shrink-0 shadow-[0_14px_32px_rgba(26,115,232,0.14)] ring-4 ring-white/90"/>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-none tracking-[-0.055em] text-[#202124]">
                    {profile.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.72rem] font-semibold text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)]">
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
                <p className="mt-4 max-w-4xl text-[0.96rem] leading-7 text-[#5F6368]">
                  {profile.bio || 'This student hasn\'t added a bio yet.'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-4 lg:w-[320px]">
              <button
                onClick={() => navigate(`/interview-message/${studentId}`, { state: { fromProfile: true } })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.88rem] font-semibold text-white shadow-[0_12px_26px_rgba(26,115,232,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#1765CC] hover:shadow-[0_16px_34px_rgba(26,115,232,0.28)]"
              >
                <Calendar size={15} strokeWidth={2}/>
                Interview
              </button>
              <div className="grid w-full grid-cols-3 gap-2 rounded-[24px] border border-white/80 bg-white/58 p-2.5 shadow-[0_14px_32px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-white/70 backdrop-blur-2xl">
                {profileFacts.map(fact => (
                  <div key={fact.label} className="rounded-2xl bg-white/72 px-2 py-3 text-center ring-1 ring-white/70">
                    <p className="text-[1.1rem] font-semibold text-[#202124]">{fact.value}</p>
                    <p className="mt-0.5 text-[0.66rem] font-semibold text-[#5F6368]">{fact.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="relative z-10 space-y-6">

          <div className="space-y-6">
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

          {(interests.length > 0 || formattedLanguages.length > 0) && (
            <SectionCard icon={Globe} tint="rgba(26,115,232,0.12)" accent="#1A73E8" title="Profile signals" subtitle="Causes and languages" delay={0.19}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#5F6368]">Causes</p>
                  {interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {interests.map(interest => (
                        <span key={interest} className="inline-flex items-center rounded-full border border-white/70 bg-white/72 px-3 py-1.5 text-[0.8rem] font-medium text-[#202124] backdrop-blur-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[0.84rem] text-[#9AA0A6]">No causes added yet.</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#5F6368]">Languages</p>
                  {formattedLanguages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formattedLanguages.map((lang, i) => (
                        <span key={i} className="inline-flex items-center rounded-full border border-white/70 bg-white/72 px-3 py-1.5 text-[0.8rem] font-medium text-[#202124] backdrop-blur-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[0.84rem] text-[#9AA0A6]">No languages added yet.</p>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {hasLinks && (
            <SectionCard icon={Link2} tint="rgba(26,115,232,0.12)" accent="#1A73E8" title="Connect" delay={0.21}>
              <div className="grid gap-2 sm:grid-cols-3">
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
    </main>
  )
}
