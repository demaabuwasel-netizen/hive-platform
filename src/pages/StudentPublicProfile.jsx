import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, GraduationCap, Briefcase, Heart, Target,
  ExternalLink, Calendar, Globe,
} from 'lucide-react'
import { loadStudentProfile } from '../services/storage'
import { groupSkills } from '../data/skills'
import GradientAvatar from '../components/GradientAvatar'

function hasContent(obj) {
  return obj && (typeof obj === 'string' ? obj.trim().length > 0 : Array.isArray(obj) ? obj.length > 0 : false)
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border bg-white p-6"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-[0.95rem] font-semibold text-[#202124]">
        <Icon size={16} className="text-[#1A73E8]" strokeWidth={2}/>
        {title}
      </h2>
      {children}
    </motion.div>
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
      <main className="flex-1 bg-[#F5F7FB] overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-44 rounded-[28px] bg-[#E8F0FE]" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 rounded-[28px] bg-[#F1F3F4]" />
                <div className="h-32 rounded-[28px] bg-[#F1F3F4]" />
              </div>
              <div className="space-y-4">
                <div className="h-32 rounded-[28px] bg-[#F1F3F4]" />
                <div className="h-32 rounded-[28px] bg-[#F1F3F4]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="flex-1 bg-[#F5F7FB] overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10 lg:px-8">
          <button
            onClick={handleBack}
            className="mb-8 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-[#1A73E8] hover:text-[#1765CC]"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
          <div className="rounded-[28px] border bg-white p-10 text-center" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
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

  return (
    <main className="flex-1 bg-[#F5F7FB] overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 lg:px-8">

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
          className="mb-6 rounded-[28px] border bg-white p-7"
          style={{ borderColor: 'rgba(26,115,232,0.10)' }}
        >
          <div className="flex flex-wrap items-start gap-5">
            <GradientAvatar name={profile.name} size={72} radius="1.35rem" className="shrink-0 shadow-sm ring-2 ring-white"/>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.76rem] font-semibold text-[#1A73E8]">
                Student profile
              </div>
              <h1 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.03em] text-[#202124] sm:text-[2.1rem]">
                {profile.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {profile.field && (
                  <span className="inline-flex items-center rounded-full bg-[#F1F3F4] px-3 py-1 text-[0.78rem] font-medium text-[#3C4043]">
                    {profile.field}
                  </span>
                )}
                {profile.university && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F4] px-3 py-1 text-[0.78rem] font-medium text-[#3C4043]">
                    <GraduationCap size={12} strokeWidth={2}/>
                    {profile.university}
                  </span>
                )}
                {profile.city && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F4] px-3 py-1 text-[0.78rem] font-medium text-[#3C4043]">
                    <MapPin size={12} strokeWidth={2}/>
                    {profile.city}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate(`/interview-message/${studentId}`, { state: { fromProfile: true } })}
              className="inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-2.5 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#1765CC]"
            >
              <Calendar size={15} strokeWidth={2}/>
              Interview
            </button>
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            {hasContent(profile.bio) && (
              <SectionCard icon={Heart} title="About">
                <p className="text-[0.9rem] leading-7 text-[#5F6368]">{profile.bio}</p>
              </SectionCard>
            )}

            <SectionCard icon={Globe} title="Skills">
              {profile.skills?.length > 0 ? (
                <div className="overflow-hidden rounded-[24px] bg-white/40 ring-1 ring-white/50 backdrop-blur-md">
                  {groupSkills(profile.skills).map(({ cat, items }) => (
                    <div
                      key={cat.cat}
                      className="grid gap-3 border-b border-white/40 px-4 py-4 last:border-b-0 md:grid-cols-[160px_minmax(0,1fr)] md:items-start"
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

            <SectionCard icon={GraduationCap} title="Education">
              {profile.educations?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {profile.educations.map((edu, i) => (
                    <div key={i} className="flex gap-4 rounded-2xl bg-[#F8F9FA] p-4 transition-colors hover:bg-[#F1F3F4]">
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
                <div className="flex gap-4 rounded-2xl bg-[#F8F9FA] p-4">
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
            <SectionCard icon={Briefcase} title="Projects">
              {profile.projects?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {profile.projects.map((project, i) => (
                    <div key={i} className="flex gap-4 rounded-2xl bg-[#F8F9FA] p-4 transition-colors hover:bg-[#F1F3F4]">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
                        <Briefcase size={18} strokeWidth={2}/>
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
              <SectionCard icon={Briefcase} title="Experience">
                <p className="whitespace-pre-line text-[0.9rem] leading-7 text-[#5F6368]">{profile.experience}</p>
              </SectionCard>
            )}

            {hasContent(profile.goals) && (
              <SectionCard icon={Target} title="Career goals">
                <p className="whitespace-pre-line text-[0.9rem] leading-7 text-[#5F6368]">{profile.goals}</p>
              </SectionCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {formattedLanguages.length > 0 && (
              <SectionCard icon={Globe} title="Languages">
                <div className="flex flex-wrap gap-2">
                  {formattedLanguages.map((lang, i) => (
                    <span key={i} className="inline-flex items-center rounded-full border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-1.5 text-[0.8rem] font-medium text-[#3C4043]">
                      {lang}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}

            {hasLinks && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {profile.links?.linkedin && (
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-[0.85rem] font-semibold text-[#202124] transition-colors hover:bg-[#F8FBFF]"
                    style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                    LinkedIn
                    <ExternalLink size={14} className="text-[#1A73E8]"/>
                  </a>
                )}
                {profile.links?.github && (
                  <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-[0.85rem] font-semibold text-[#202124] transition-colors hover:bg-[#F8FBFF]"
                    style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                    GitHub
                    <ExternalLink size={14} className="text-[#1A73E8]"/>
                  </a>
                )}
                {profile.links?.portfolio && (
                  <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-[0.85rem] font-semibold text-[#202124] transition-colors hover:bg-[#F8FBFF]"
                    style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                    Portfolio
                    <ExternalLink size={14} className="text-[#1A73E8]"/>
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
