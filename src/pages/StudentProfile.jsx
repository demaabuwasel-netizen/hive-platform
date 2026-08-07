import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Check,
  ChevronDown,
  Code,
  Edit3,
  ExternalLink,
  Globe,
  GraduationCap,
  Heart,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AvatarDisplay } from '../components/Avatar'

const SKILLS_LIST = {
  Programming: ['Python', 'JavaScript', 'React', 'Java', 'SQL', 'Node.js', 'TypeScript', 'C++'],
  'Data & AI': ['Machine Learning', 'Data Analysis', 'TensorFlow', 'Pandas', 'Statistics', 'Deep Learning'],
  'Tools & Platforms': ['Git', 'Docker', 'AWS', 'Google Cloud', 'Figma', 'Linux'],
  'Soft Skills': ['Communication', 'Leadership', 'Project Management', 'Problem Solving', 'Teamwork'],
  Design: ['UI Design', 'UX Design', 'Graphic Design', 'Web Design', 'Prototyping', 'Canva'],
  Marketing: ['Digital Marketing', 'Content Writing', 'Social Media', 'SEO', 'Email Marketing'],
}

const LANGUAGES = ['English', 'Arabic', 'Hebrew', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese (Mandarin)', 'Japanese', 'Korean', 'Hindi', 'Turkish']
const INTERESTS = ['Education', 'Youth Empowerment', 'Women Empowerment', 'Environment', 'Mental Health', 'Digital Inclusion', 'Animal Welfare', 'Community Development']

const inputClass = 'w-full rounded-2xl border border-[#DADCE0] bg-white px-3.5 py-3 text-[0.88rem] text-[#202124] outline-none transition placeholder:text-[#9AA0A6] focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/15'
const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-4 py-2.5 text-[0.82rem] font-medium text-white shadow-[0_4px_12px_rgba(26,115,232,0.25)] transition hover:bg-[#1765CC] disabled:cursor-not-allowed disabled:opacity-45'
const softButtonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2.5 text-[0.82rem] font-medium text-[#1A73E8] backdrop-blur-sm transition hover:bg-white hover:shadow-[0_6px_16px_rgba(17,24,39,0.06)]'

function getSkillCategory(name) {
  const match = Object.entries(SKILLS_LIST).find(([, categorySkills]) =>
    categorySkills.some(skill => skill.toLowerCase() === String(name).toLowerCase())
  )
  return match?.[0] || 'Other'
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean)
  return []
}

function normalizeSkills(profile) {
  if (Array.isArray(profile?.skillsWithLevel) && profile.skillsWithLevel.length > 0) {
    return profile.skillsWithLevel
      .map(skill => ({
        name: skill?.name || skill,
        category: skill?.category || getSkillCategory(skill?.name || skill),
      }))
      .filter(skill => skill.name)
  }

  return toArray(profile?.skills).map(name => ({ name, category: getSkillCategory(name) }))
}

function Card({ children, className = '' }) {
  return (
    <section
      className={`overflow-hidden rounded-[32px] border border-white/50 bg-white/40 shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.06)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  )
}

function SectionHeader({ icon: Icon, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-white/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1A73E8] ring-1 ring-black/[0.04]">
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-[0.95rem] font-semibold text-[#202124]">{title}</h2>
          {description && <p className="mt-0.5 max-w-3xl text-[0.82rem] leading-6 text-[#5F6368]">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function FieldLabel({ children }) {
  return <label className="mb-1.5 block text-[0.68rem] font-semibold uppercase text-[#9AA0A6]">{children}</label>
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[22px] border border-dashed border-white/70 bg-white/45 px-4 py-4 text-center backdrop-blur-sm">
      <span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
        <Plus size={15} />
      </span>
      <p className="text-[0.88rem] font-semibold text-[#202124]">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[0.8rem] leading-6 text-[#5F6368]">{description}</p>
    </div>
  )
}

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[0.76rem] font-medium text-[#202124] shadow-[0_1px_2px_rgba(17,24,39,0.03)] backdrop-blur-sm">
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} className="rounded-full p-0.5 text-[#9AA0A6] transition hover:bg-[#FCE8E6] hover:text-[#C5221F]">
          <X size={12} />
        </button>
      )}
    </span>
  )
}

function SmallProfileCard({ icon: Icon, title, summary, children, action, defaultOpen = false, forceOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const isOpen = forceOpen || open
  const sectionRef = useRef(null)

  const handleToggle = (value) => {
    setOpen(value)
    if (value && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }

  return (
    <section ref={sectionRef} className="rounded-[28px] border border-white/50 bg-white/40 p-4 shadow-[0_2px_8px_rgba(17,24,39,0.04),0_12px_30px_rgba(17,24,39,0.05)] backdrop-blur-xl transition hover:bg-white/55 sm:p-5">
      <div className={`${isOpen ? 'mb-4 border-b border-white/40 pb-3' : ''} flex items-start justify-between gap-3`}>
        <div className="flex min-w-0 gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1A73E8] ring-1 ring-black/[0.04]">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[1rem] font-semibold text-[#202124]">{title}</h3>
            <p className="mt-1 text-[0.8rem] leading-5 text-[#5F6368]">{summary}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <button
            type="button"
            onClick={() => handleToggle(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#5F6368] ring-1 ring-white/70 transition hover:bg-white hover:text-[#1A73E8]"
            aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
          >
            <ChevronDown size={17} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {isOpen && children}
    </section>
  )
}

export default function StudentProfile() {
  const { user, profile, updateProfile } = useApp()

  const displayName = user?.name || profile?.name || 'Student'
  const avatarSrc = profile?.avatar || user?.avatar || null

  const skillOptions = useMemo(() => {
    return Object.entries(SKILLS_LIST).flatMap(([category, skills]) => skills.map(name => ({ name, category })))
  }, [])

  const [skills, setSkills] = useState(() => normalizeSkills(profile))
  const [skillsDraft, setSkillsDraft] = useState(() => normalizeSkills(profile))
  const [editingSkills, setEditingSkills] = useState(false)
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false)
  const [customSkillDraft, setCustomSkillDraft] = useState('')
  const [savingSkills, setSavingSkills] = useState(false)

  const [editingAbout, setEditingAbout] = useState(false)
  const [aboutDraft, setAboutDraft] = useState(profile?.bio || '')

  const [educations, setEducations] = useState(
    Array.isArray(profile?.educations) && profile.educations.length > 0
      ? profile.educations
      : (profile?.field || profile?.university)
        ? [{ field: profile?.field || '', university: profile?.university || '', degreeType: profile?.graduation_year || '', description: '', isCurrent: false }]
        : []
  )
  const [educationDraft, setEducationDraft] = useState({ field: '', university: '', degreeType: '', description: '', isCurrent: false })
  const [editingEducation, setEditingEducation] = useState(false)
  const [editingEducationIndex, setEditingEducationIndex] = useState(null)

  const [projects, setProjects] = useState(
    Array.isArray(profile?.projects) ? profile.projects : []
  )
  const [projectDraft, setProjectDraft] = useState({ title: '', description: '', link: '' })
  const [editingProjects, setEditingProjects] = useState(false)
  const [editingProjectIndex, setEditingProjectIndex] = useState(null)

  const [languagesDraft, setLanguagesDraft] = useState(() => toArray(profile?.languages))
  const [languageDraft, setLanguageDraft] = useState({ lang: '', level: 'Fluent' })
  const [editingLanguages, setEditingLanguages] = useState(false)

  const [interestsDraft, setInterestsDraft] = useState(() => toArray(profile?.interests))
  const [newInterest, setNewInterest] = useState('')
  const [editingInterests, setEditingInterests] = useState(false)

  const [linksDraft, setLinksDraft] = useState({
    github: profile?.links?.github || '',
    linkedin: profile?.links?.linkedin || '',
    portfolio: profile?.links?.portfolio || '',
  })
  const [editingLinks, setEditingLinks] = useState(false)

  // Refs for auto-scroll
  const skillsCardRef = useRef(null)
  const projectsCardRef = useRef(null)
  const educationCardRef = useRef(null)
  const languagesCardRef = useRef(null)
  const causesCardRef = useRef(null)
  const linksCardRef = useRef(null)
  const skillDropdownRef = useRef(null)

  useEffect(() => {
    queueMicrotask(() => {
      const normalizedSkills = normalizeSkills(profile)
      setSkills(normalizedSkills)
      setSkillsDraft(normalizedSkills)
      setAboutDraft(profile?.bio || '')
      setLanguagesDraft(toArray(profile?.languages))
      setInterestsDraft(toArray(profile?.interests))
      setLinksDraft({
        github: profile?.links?.github || '',
        linkedin: profile?.links?.linkedin || '',
        portfolio: profile?.links?.portfolio || '',
      })
      if (Array.isArray(profile?.educations)) setEducations(profile.educations)
    })
  }, [profile])

  useEffect(() => {
    if (editingSkills && skillsCardRef.current) {
      setTimeout(() => {
        skillsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [editingSkills])

  useEffect(() => {
    if (editingEducation && educationCardRef.current) {
      setTimeout(() => {
        educationCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [editingEducation])

  useEffect(() => {
    if (editingProjects && projectsCardRef.current) {
      setTimeout(() => {
        projectsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [editingProjects])

  useEffect(() => {
    if (editingLanguages && languagesCardRef.current) {
      setTimeout(() => {
        languagesCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [editingLanguages])

  useEffect(() => {
    if (editingInterests && causesCardRef.current) {
      setTimeout(() => {
        causesCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [editingInterests])

  useEffect(() => {
    if (editingLinks && linksCardRef.current) {
      setTimeout(() => {
        linksCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [editingLinks])

  const visibleSkills = editingSkills ? skillsDraft : skills

  const selectedSkillNames = useMemo(() => {
    return new Set(visibleSkills.map(skill => skill.name.toLowerCase()))
  }, [visibleSkills])

  const skillDropdownGroups = useMemo(() => {
    return Object.entries(SKILLS_LIST)
      .map(([category, categorySkills]) => ({
        category,
        skills: categorySkills.filter(skill => !selectedSkillNames.has(skill.toLowerCase())),
      }))
      .filter(group => group.skills.length > 0)
  }, [selectedSkillNames])

  const skillsByCategory = useMemo(() => {
    return visibleSkills.reduce((groups, skill) => {
      const category = skill.category || getSkillCategory(skill.name)
      if (!groups[category]) groups[category] = []
      groups[category].push(skill)
      return groups
    }, {})
  }, [visibleSkills])

  const primaryEducation = educations[0]
  const profileTitle = profile?.field || primaryEducation?.field || 'Student profile'
  const universitySummary = profile?.university || primaryEducation?.university || ''
  const profileFacts = [
    { label: 'Skills', value: `${visibleSkills.length}` },
    { label: 'Education', value: educations.length ? `${educations.length}` : '0' },
    { label: 'Languages', value: `${languagesDraft.length}` },
  ]
  const saveSkills = async updated => {
    setSkills(updated)
    setSavingSkills(true)
    try {
      await updateProfile({ ...profile, skillsWithLevel: updated, skills: updated.map(skill => skill.name) })
    } catch (err) {
      setSkills(normalizeSkills(profile))
      alert('Failed to save skills: ' + (err.message || 'Unknown error'))
    } finally {
      setSavingSkills(false)
    }
  }

  const addSkillToDraft = rawName => {
    const name = rawName.trim()
    if (!name) return false
    if (skillsDraft.some(skill => skill.name.toLowerCase() === name.toLowerCase())) {
      return false
    }

    const knownSkill = skillOptions.find(option => option.name.toLowerCase() === name.toLowerCase())
    setSkillsDraft([...skillsDraft, { name, category: knownSkill?.category || 'Other' }])
    return true
  }

  const handleCustomSkillSubmit = event => {
    event.preventDefault()
    const added = addSkillToDraft(customSkillDraft)
    if (added) setCustomSkillDraft('')
  }

  const handleRemoveSkillDraft = index => {
    setSkillsDraft(skillsDraft.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleStartSkillsEdit = () => {
    setSkillsDraft(skills)
    setCustomSkillDraft('')
    setSkillDropdownOpen(false)
    setEditingSkills(true)
  }

  const handleCancelSkillsEdit = () => {
    setSkillsDraft(skills)
    setCustomSkillDraft('')
    setSkillDropdownOpen(false)
    setEditingSkills(false)
  }

  const handleSaveSkills = async () => {
    await saveSkills(skillsDraft)
    setSkillDropdownOpen(false)
    setCustomSkillDraft('')
    setEditingSkills(false)
  }

  const handleSaveAbout = async () => {
    await updateProfile({ ...profile, bio: aboutDraft })
    setEditingAbout(false)
  }

  const handleSaveEducation = async () => {
    const hasContent = educationDraft.field || educationDraft.university || educationDraft.degreeType
    if (!hasContent) {
      setEditingEducation(false)
      return
    }

    const updated = editingEducationIndex !== null
      ? educations.map((education, index) => index === editingEducationIndex ? educationDraft : education)
      : [...educations, educationDraft]

    setEducations(updated)
    await updateProfile({
      ...profile,
      educations: updated,
      field: updated[0]?.field || profile?.field,
      university: updated[0]?.university || profile?.university,
      graduation_year: updated[0]?.degreeType || profile?.graduation_year,
    })
    setEducationDraft({ field: '', university: '', degreeType: '', description: '', isCurrent: false })
    setEditingEducationIndex(null)
    setEditingEducation(false)
  }

  const handleDeleteEducation = async index => {
    const updated = educations.filter((_, itemIndex) => itemIndex !== index)
    setEducations(updated)
    await updateProfile({ ...profile, educations: updated })
  }

  const handleSaveProjects = async () => {
    const hasContent = projectDraft.title || projectDraft.description
    if (!hasContent) {
      setEditingProjects(false)
      return
    }

    const updated = editingProjectIndex !== null
      ? projects.map((project, index) => index === editingProjectIndex ? projectDraft : project)
      : [...projects, projectDraft]

    setProjects(updated)
    await updateProfile({ ...profile, projects: updated })
    setProjectDraft({ title: '', description: '', link: '' })
    setEditingProjectIndex(null)
    setEditingProjects(false)
  }

  const handleDeleteProject = async index => {
    const updated = projects.filter((_, itemIndex) => itemIndex !== index)
    setProjects(updated)
    await updateProfile({ ...profile, projects: updated })
  }

  const startProjectEdit = (project = { title: '', description: '', link: '' }, index = null) => {
    setProjectDraft(project)
    setEditingProjectIndex(index)
    setEditingProjects(true)
  }

  const handleSaveLanguages = async () => {
    await updateProfile({ ...profile, languages: languagesDraft })
    setEditingLanguages(false)
  }

  const handleAddLanguage = () => {
    if (!languageDraft.lang) return
    if (languagesDraft.some(item => (typeof item === 'string' ? item : item?.lang) === languageDraft.lang)) return
    setLanguagesDraft([...languagesDraft, languageDraft])
    setLanguageDraft({ lang: '', level: 'Fluent' })
  }

  const handleSaveInterests = async () => {
    await updateProfile({ ...profile, interests: interestsDraft })
    setEditingInterests(false)
  }

  const handleAddInterest = value => {
    if (!value || interestsDraft.includes(value)) return
    setInterestsDraft([...interestsDraft, value])
    setNewInterest('')
  }

  const handleSaveLinks = async () => {
    await updateProfile({ ...profile, links: linksDraft })
    setEditingLinks(false)
  }

  const startEducationEdit = (education = { field: '', university: '', degreeType: '', description: '', isCurrent: false }, index = null) => {
    setEducationDraft(education)
    setEditingEducationIndex(index)
    setEditingEducation(true)
  }

  return (
    <main className="relative flex-1 overflow-y-auto bg-[#EEF4FF]">
      <div className="pointer-events-none absolute inset-0 min-h-full bg-[linear-gradient(180deg,#EEF4FF_0%,#F3F7FF_46%,#EEF4FF_100%),radial-gradient(circle_at_18%_4%,rgba(26,115,232,0.10),transparent_46%),radial-gradient(circle_at_86%_0%,rgba(255,255,255,0.68),transparent_48%)]" />
      <svg
        className="pointer-events-none absolute right-[-9rem] top-6 h-80 w-[72rem] opacity-100"
        viewBox="0 0 760 230"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 56%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 56%, transparent 100%)',
        }}
      >
        <path
          d="M78 108 C178 48 246 66 338 112 C444 166 538 148 760 42 L760 230 L78 230 Z"
          fill="#E8F0FE"
          opacity="0.62"
        />
        <path
          d="M150 146 C250 90 326 112 420 154 C522 200 606 184 760 112 L760 230 L150 230 Z"
          fill="#D7E6FF"
          opacity="0.38"
        />
        <path d="M54 104 C154 42 236 64 334 110 C444 162 538 144 744 46" stroke="#1A73E8" strokeWidth="3.2" strokeLinecap="round" opacity="0.18" />
        <path d="M146 148 C244 92 324 114 416 154 C520 198 600 182 748 112" stroke="#4C9AEF" strokeWidth="2.5" strokeLinecap="round" opacity="0.13" />
        <path d="M292 182 C386 138 460 158 542 188 C622 216 684 198 752 160" stroke="#34A853" strokeWidth="2.2" strokeLinecap="round" opacity="0.075" />
      </svg>
      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-10 lg:px-8">
        <div className="h-5" aria-hidden="true" />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[32px] border border-white/50 bg-white/40 shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.06)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(26,115,232,0.14)] ring-4 ring-white">
                <AvatarDisplay src={avatarSrc} name={displayName} size="xl" className="h-full w-full" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[1.9rem] font-semibold tracking-[-0.015em] text-[#202124]">
                    {displayName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[0.7rem] font-medium text-[#1A73E8]">
                    <GraduationCap size={12} />
                    Student profile
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.94rem] font-semibold text-[#5F6368]">
                  <span>{profileTitle}</span>
                  {universitySummary && (
                    <>
                      <span className="text-[#9AA0A6]">·</span>
                      <span>{universitySummary}</span>
                    </>
                  )}
                  {profile?.country && (
                    <>
                      <span className="text-[#9AA0A6]">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} />
                        {profile.country}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[#5F6368]">
                  {profile?.bio || 'Shape how NGOs see your skills, education, links, and the causes you care about.'}
                </p>
              </div>
            </div>

            <div className="grid w-full shrink-0 grid-cols-3 gap-3 rounded-[22px] bg-white/40 p-3 ring-1 ring-white/50 backdrop-blur-md sm:w-[280px]">
              {profileFacts.map(fact => (
                <div key={fact.label} className="rounded-2xl bg-white/45 px-3 py-3 text-center ring-1 ring-white/60">
                  <p className="text-[1.25rem] font-semibold text-[#202124]">{fact.value}</p>
                  <p className="mt-1 text-[0.72rem] font-semibold text-[#5F6368]">{fact.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="mt-6">
          <div className="space-y-6">

          <Card className="p-5 sm:p-6">
            <SectionHeader
              icon={Heart}
              title="Bio"
              description="A short intro that explains what motivates you and what kind of work you want to do."
              action={!editingAbout && (
                <button className={softButtonClass} onClick={() => setEditingAbout(true)}>
                  <Edit3 size={14} />
                  {profile?.bio ? 'Edit bio' : 'Add bio'}
                </button>
              )}
            />

            {editingAbout ? (
              <div className="space-y-3">
                <textarea
                  value={aboutDraft}
                  onChange={event => setAboutDraft(event.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Example: I'm a computer science student interested in data, education, and building useful tools for communities."
                />
                <div className="flex flex-wrap gap-2">
                  <button className={primaryButtonClass} onClick={handleSaveAbout}><Check size={14} />Save bio</button>
                  <button className={softButtonClass} onClick={() => { setAboutDraft(profile?.bio || ''); setEditingAbout(false) }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[1rem] leading-8 text-[#202124]">
                  {profile?.bio || 'Add a short bio so NGOs can understand who you are beyond your skills.'}
                </p>
              </div>
            )}
          </Card>

          <div ref={skillsCardRef}>
            <Card className="p-5 sm:p-6">
              <SectionHeader
                icon={Code}
                title="Skills"
              description={editingSkills ? 'Add or remove skills, then save when everything looks right.' : 'Saved skills are organized by category so NGOs can scan them quickly.'}
              action={editingSkills ? (
                <div className="flex flex-wrap gap-2">
                  <button className={primaryButtonClass} onClick={handleSaveSkills} disabled={savingSkills}>
                    <Check size={14} />
                    Save
                  </button>
                  <button className={softButtonClass} onClick={handleCancelSkillsEdit} disabled={savingSkills}>Cancel</button>
                </div>
              ) : (
                <button className={softButtonClass} onClick={handleStartSkillsEdit}>
                  <Edit3 size={14} />
                  Edit skills
                </button>
              )}
            />

            <div className="mb-3 overflow-hidden rounded-[24px] bg-white/40 ring-1 ring-white/50 backdrop-blur-md">
              {visibleSkills.length > 0 ? (
                Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div
                    key={category}
                    className="grid gap-3 border-b border-white/40 px-4 py-4 last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)] md:items-start"
                  >
                    <div>
                      <span className="inline-flex rounded-full bg-[#E8F0FE] px-3 py-1 text-[0.72rem] font-semibold uppercase text-[#1A73E8]">{category}</span>
                      <p className="mt-2 text-[0.76rem] font-semibold text-[#9AA0A6]">{categorySkills.length} added</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map(skill => {
                        const originalIndex = visibleSkills.findIndex(item => item.name.toLowerCase() === skill.name.toLowerCase())
                        if (originalIndex < 0) return null
                        return (
                          <Chip key={`${category}-${skill.name}`} onRemove={editingSkills ? () => handleRemoveSkillDraft(originalIndex) : undefined}>
                            {skill.name}
                          </Chip>
                        )
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <EmptyState title="No skills yet" description="Add a few skills so Hive can recommend better opportunities." />
                </div>
              )}
            </div>

            {editingSkills && (
            <div className="mx-auto max-w-2xl rounded-[24px] bg-white/40 p-3 ring-1 ring-white/50 backdrop-blur-md">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSkillDropdownOpen(open => !open)}
                  className="flex w-full items-center justify-between gap-3 rounded-[20px] bg-white/55 px-4 py-3 text-left ring-1 ring-white/60 transition hover:bg-white"
                >
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase text-[#9AA0A6]">Add skill</p>
                    <p className="mt-0.5 text-[0.9rem] font-semibold text-[#202124]">Choose from categories</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
                    <ChevronDown size={18} className={`transition-transform ${skillDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {skillDropdownOpen && (
                  <div className="mt-2 overflow-hidden rounded-[20px] bg-white shadow-[0_14px_32px_rgba(17,24,39,0.08)] ring-1 ring-white/70">
                    <div className="max-h-[260px] overflow-y-auto px-3 py-2 [scrollbar-color:#9DBCF5_transparent] [scrollbar-width:thin]">
                      {skillDropdownGroups.length > 0 ? (
                        skillDropdownGroups.map(group => (
                          <div key={group.category} className="border-b border-[#F1F3F4] py-2.5 last:border-b-0">
                            <div className="mb-2">
                              <p className="text-[0.7rem] font-semibold uppercase text-[#1A73E8]">
                                {group.category}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {group.skills.map(skill => (
                                <button
                                  type="button"
                                  key={`${group.category}-${skill}`}
                                  onClick={() => addSkillToDraft(skill)}
                                  disabled={savingSkills}
                                  className="rounded-full border border-[#F1F3F4] bg-white px-2.5 py-1 text-[0.76rem] font-medium text-[#202124] transition hover:border-[#1A73E8] hover:bg-[#E8F0FE] hover:text-[#1A73E8] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[#D7E6FF] bg-[#F8FBFF] p-4 text-center">
                          <p className="text-[0.86rem] font-semibold text-[#202124]">All listed skills are added</p>
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleCustomSkillSubmit} className="border-t border-[#F1F3F4] px-3 py-2.5">
                      <p className="mb-2 text-[0.7rem] font-semibold uppercase text-[#1A73E8]">Other</p>
                      <div className="flex gap-2">
                        <input
                          value={customSkillDraft}
                          onChange={event => setCustomSkillDraft(event.target.value)}
                          className="min-w-0 flex-1 rounded-full border border-[#DADCE0] bg-white px-3 py-1.5 text-[0.78rem] font-medium text-[#202124] outline-none transition placeholder:font-medium placeholder:text-[#9AA0A6] focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10"
                          placeholder="Type a skill"
                        />
                        <button
                          type="submit"
                          disabled={savingSkills || !customSkillDraft.trim()}
                          className="rounded-full bg-[#1A73E8] px-3.5 py-1.5 text-[0.76rem] font-semibold text-white transition hover:bg-[#1558C0] disabled:cursor-not-allowed disabled:bg-[#AECBFA]"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
            )}
            </Card>
          </div>

          <div ref={projectsCardRef}>
            <Card className="p-5 sm:p-6">
              <SectionHeader
                icon={Briefcase}
                title="Projects"
                description="Showcase projects you've worked on to demonstrate your skills."
                action={!editingProjects && (
                  <button className={softButtonClass} onClick={() => startProjectEdit()}>
                    <Plus size={14} />
                    Add project
                  </button>
                )}
              />

              {projects.length > 0 ? (
                <div className="mb-4 overflow-hidden rounded-[24px] bg-white/40 ring-1 ring-white/50 backdrop-blur-md">
                  {projects.map((project, index) => (
                    <div key={`${project.title}-${index}`} className="flex gap-4 border-b border-white/40 p-4 last:border-b-0">
                      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                        <Briefcase size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[1rem] font-semibold text-[#202124]">{project.title || 'Project'}</p>
                            {project.link && (
                              <a href={project.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-[0.84rem] text-[#1A73E8] hover:underline">
                                View project →
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button className="rounded-full p-2 text-[#5F6368] transition hover:bg-[#E8F0FE] hover:text-[#1A73E8]" onClick={() => startProjectEdit(project, index)}><Edit3 size={14} /></button>
                            <button className="rounded-full p-2 text-[#C5221F] transition hover:bg-[#FCE8E6]" onClick={() => handleDeleteProject(index)}><Trash2 size={14} /></button>
                          </div>
                        </div>
                        {project.description && <p className="mt-3 text-[0.84rem] leading-6 text-[#5F6368]">{project.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !editingProjects ? (
                <div className="mb-4">
                  <EmptyState title="No projects yet" description="Add projects to showcase what you've built." />
                </div>
              ) : null}

              {editingProjects && (
                <div className="rounded-[24px] bg-white/40 p-4 ring-1 ring-white/50 backdrop-blur-md">
                  <div className="space-y-3">
                    <div>
                      <FieldLabel>Project title</FieldLabel>
                      <input className={inputClass} value={projectDraft.title} onChange={event => setProjectDraft(prev => ({ ...prev, title: event.target.value }))} placeholder="e.g., Mobile App for Community" />
                    </div>
                    <div>
                      <FieldLabel>Description</FieldLabel>
                      <textarea className={`${inputClass} resize-none`} rows={3} value={projectDraft.description} onChange={event => setProjectDraft(prev => ({ ...prev, description: event.target.value }))} placeholder="What did you build and what was your role?" />
                    </div>
                    <div>
                      <FieldLabel>Project link (optional)</FieldLabel>
                      <input className={inputClass} value={projectDraft.link} onChange={event => setProjectDraft(prev => ({ ...prev, link: event.target.value }))} placeholder="https://example.com/project" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className={primaryButtonClass} onClick={handleSaveProjects}><Check size={14} />Save project</button>
                      <button className={softButtonClass} onClick={() => { setEditingProjects(false); setEditingProjectIndex(null); setProjectDraft({ title: '', description: '', link: '' }) }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div ref={educationCardRef}>
            <Card className="p-5 sm:p-6">
              <SectionHeader
                icon={GraduationCap}
                title="Education"
              description="Add your field of study, school, and degree information."
              action={!editingEducation && (
                <button className={softButtonClass} onClick={() => startEducationEdit()}>
                  <Plus size={14} />
                  Add education
                </button>
              )}
            />

            {educations.length > 0 ? (
              <div className="mb-4 overflow-hidden rounded-[24px] bg-white/40 ring-1 ring-white/50 backdrop-blur-md">
                {educations.map((education, index) => (
                  <div key={`${education.field}-${index}`} className="flex gap-4 border-b border-white/40 p-4 last:border-b-0">
                    <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                      <GraduationCap size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[1rem] font-semibold text-[#202124]">{education.field || 'Education'}</p>
                          <p className="mt-1 text-[0.84rem] text-[#5F6368]">{education.university || 'School not set'}</p>
                          {(education.degreeType || education.isCurrent) && (
                            <p className="mt-2 inline-flex rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[0.74rem] font-semibold text-[#1A73E8]">
                              {[education.degreeType, education.isCurrent ? 'Current' : ''].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button className="rounded-full p-2 text-[#5F6368] transition hover:bg-[#E8F0FE] hover:text-[#1A73E8]" onClick={() => startEducationEdit(education, index)}><Edit3 size={14} /></button>
                          <button className="rounded-full p-2 text-[#C5221F] transition hover:bg-[#FCE8E6]" onClick={() => handleDeleteEducation(index)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                      {education.description && <p className="mt-3 text-[0.84rem] leading-6 text-[#5F6368]">{education.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : !editingEducation ? (
              <div className="mb-4">
                <EmptyState title="No education added" description="Add your field of study so NGOs understand your background." />
              </div>
            ) : null}

            {editingEducation && (
              <div className="rounded-[24px] bg-white/40 p-4 ring-1 ring-white/50 backdrop-blur-md">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <FieldLabel>Field of study</FieldLabel>
                    <input className={inputClass} value={educationDraft.field} onChange={event => setEducationDraft(prev => ({ ...prev, field: event.target.value }))} placeholder="Computer Science" />
                  </div>
                  <div>
                    <FieldLabel>University / school</FieldLabel>
                    <input className={inputClass} value={educationDraft.university} onChange={event => setEducationDraft(prev => ({ ...prev, university: event.target.value }))} placeholder="Tel Aviv University" />
                  </div>
                  <div>
                    <FieldLabel>Degree type</FieldLabel>
                    <select className={inputClass} value={educationDraft.degreeType} onChange={event => setEducationDraft(prev => ({ ...prev, degreeType: event.target.value }))}>
                      <option value="">Select type</option>
                      <option>Bachelor's</option>
                      <option>Master's</option>
                      <option>Certificate</option>
                      <option>Diploma</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 self-end rounded-2xl bg-white/70 px-4 py-3 text-[0.82rem] font-semibold text-[#202124] ring-1 ring-white/70">
                    <input type="checkbox" checked={educationDraft.isCurrent || false} onChange={event => setEducationDraft(prev => ({ ...prev, isCurrent: event.target.checked }))} />
                    Currently studying
                  </label>
                </div>
                <textarea className={`${inputClass} mt-3 resize-none`} rows={3} value={educationDraft.description} onChange={event => setEducationDraft(prev => ({ ...prev, description: event.target.value }))} placeholder="Relevant courses, projects, or achievements" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className={primaryButtonClass} onClick={handleSaveEducation}><Check size={14} />Save education</button>
                  <button className={softButtonClass} onClick={() => { setEditingEducation(false); setEditingEducationIndex(null); setEducationDraft({ field: '', university: '', degreeType: '', description: '', isCurrent: false }) }}>Cancel</button>
                </div>
              </div>
            )}
            </Card>
          </div>

          </div>
        </div>

        <section className="mt-6">
          <div className="mb-4">
            <p className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase text-[#9AA0A6]">
              <Briefcase size={14} className="text-[#1A73E8]" />
              Profile details
            </p>
            <p className="mt-2 text-[0.88rem] leading-6 text-[#5F6368]">
              Quick details NGOs use when they scan for fit.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div ref={languagesCardRef}>
              <SmallProfileCard
                icon={Globe}
                title="Languages"
              summary={languagesDraft.length ? `${languagesDraft.length} added` : 'Languages you can work in'}
              action={!editingLanguages && <button className={softButtonClass} onClick={() => setEditingLanguages(true)}>{languagesDraft.length ? 'Edit' : 'Add'}</button>}
              forceOpen={editingLanguages}
            >
              {editingLanguages ? (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
                    <select className={inputClass} value={languageDraft.lang} onChange={event => setLanguageDraft(prev => ({ ...prev, lang: event.target.value }))}>
                      <option value="">Language</option>
                      {LANGUAGES.map(language => <option key={language}>{language}</option>)}
                    </select>
                    <select className={inputClass} value={languageDraft.level} onChange={event => setLanguageDraft(prev => ({ ...prev, level: event.target.value }))}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Fluent</option>
                      <option>Native</option>
                    </select>
                    <button className={softButtonClass} onClick={handleAddLanguage}><Plus size={14} />Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {languagesDraft.map((language, index) => {
                      const name = typeof language === 'string' ? language : language?.lang
                      const level = typeof language === 'object' ? language?.level : ''
                      return <Chip key={`${name}-${index}`} onRemove={() => setLanguagesDraft(languagesDraft.filter((_, itemIndex) => itemIndex !== index))}>{name}{level ? ` · ${level}` : ''}</Chip>
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className={primaryButtonClass} onClick={handleSaveLanguages}><Check size={14} />Save</button>
                    <button className={softButtonClass} onClick={() => { setLanguagesDraft(toArray(profile?.languages)); setEditingLanguages(false) }}>Cancel</button>
                  </div>
                </div>
              ) : languagesDraft.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {languagesDraft.map((language, index) => {
                    const name = typeof language === 'string' ? language : language?.lang
                    const level = typeof language === 'object' ? language?.level : ''
                    return <Chip key={`${name}-${index}`}>{name}{level ? ` · ${level}` : ''}</Chip>
                  })}
                </div>
              ) : (
                <EmptyState title="No languages yet" description="Add the languages you can work in." />
              )}
              </SmallProfileCard>
            </div>

            <div ref={causesCardRef}>
              <SmallProfileCard
                icon={Heart}
                title="Causes"
              summary={interestsDraft.length ? `${interestsDraft.length} interests` : 'Causes you care about'}
              action={!editingInterests && <button className={softButtonClass} onClick={() => setEditingInterests(true)}>{interestsDraft.length ? 'Edit' : 'Add'}</button>}
              forceOpen={editingInterests}
            >
              {editingInterests ? (
                <div className="space-y-3">
                  <select className={inputClass} value={newInterest} onChange={event => { setNewInterest(event.target.value); handleAddInterest(event.target.value) }}>
                    <option value="">Add cause</option>
                    {INTERESTS.map(interest => <option key={interest}>{interest}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {interestsDraft.map((interest, index) => (
                      <Chip key={interest} onRemove={() => setInterestsDraft(interestsDraft.filter((_, itemIndex) => itemIndex !== index))}>{interest}</Chip>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className={primaryButtonClass} onClick={handleSaveInterests}><Check size={14} />Save</button>
                    <button className={softButtonClass} onClick={() => { setInterestsDraft(toArray(profile?.interests)); setEditingInterests(false) }}>Cancel</button>
                  </div>
                </div>
              ) : interestsDraft.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interestsDraft.map(interest => <Chip key={interest}>{interest}</Chip>)}
                </div>
              ) : (
                <EmptyState title="No causes yet" description="Pick causes that match the kind of impact you want." />
              )}
              </SmallProfileCard>
            </div>

            <div ref={linksCardRef}>
              <SmallProfileCard
                icon={ExternalLink}
                title="Links"
              summary={[linksDraft.linkedin && 'LinkedIn', linksDraft.github && 'GitHub', linksDraft.portfolio && 'Portfolio'].filter(Boolean).join(' · ') || 'Optional public links'}
              action={!editingLinks && <button className={softButtonClass} onClick={() => setEditingLinks(true)}>{linksDraft.linkedin || linksDraft.github || linksDraft.portfolio ? 'Edit' : 'Add'}</button>}
              forceOpen={editingLinks}
            >
              {editingLinks ? (
                <div className="space-y-3">
                  <input className={inputClass} value={linksDraft.linkedin} onChange={event => setLinksDraft(prev => ({ ...prev, linkedin: event.target.value }))} placeholder="LinkedIn URL" />
                  <input className={inputClass} value={linksDraft.github} onChange={event => setLinksDraft(prev => ({ ...prev, github: event.target.value }))} placeholder="GitHub URL" />
                  <input className={inputClass} value={linksDraft.portfolio} onChange={event => setLinksDraft(prev => ({ ...prev, portfolio: event.target.value }))} placeholder="Portfolio URL" />
                  <div className="flex flex-wrap gap-2">
                    <button className={primaryButtonClass} onClick={handleSaveLinks}><Check size={14} />Save</button>
                    <button className={softButtonClass} onClick={() => setEditingLinks(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(linksDraft).filter(([, value]) => value).map(([key, value]) => (
                    <a key={key} href={value} target="_blank" rel="noreferrer" className="block truncate rounded-2xl bg-white/55 px-3.5 py-2.5 text-[0.8rem] font-semibold text-[#1A73E8] ring-1 ring-white/60 transition hover:bg-white">
                      {key}: {value}
                    </a>
                  ))}
                  {!linksDraft.linkedin && !linksDraft.github && !linksDraft.portfolio && <EmptyState title="No links yet" description="Add only links that help NGOs trust your work." />}
                </div>
              )}
              </SmallProfileCard>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
