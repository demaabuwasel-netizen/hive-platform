import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera, MoreVertical, ChevronRight, Edit3, X, Check,
  MapPin, Mail, Calendar, Clock, MapPinIcon, Sparkles,
  Users, Leaf, Heart, Code, Home, GraduationCap, Zap,
  PawPrint, Apple, Scale, Palette, Trees, Plus, Trash2,
  Briefcase, Globe, BookOpen, ChevronDown, ExternalLink, Link2,
  BarChart2, TrendingUp, Target, Phone,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AvatarDisplay } from '../components/Avatar'
import { groupSkills } from '../data/skills'
import cardsBackground from '../assets/cards_background.png'

function computeLevel(profile, skills, languages, interests) {
  let score = 0
  if (profile?.bio) score += 15
  if (skills.length >= 3) score += 20
  if (skills.length >= 6) score += 10
  if (languages.length >= 1) score += 10
  if (interests.length >= 2) score += 10
  if (profile?.experience) score += 15
  if (profile?.goals) score += 10
  if (profile?.field) score += 5
  if (profile?.links?.linkedin || profile?.links?.portfolio) score += 5
  return Math.min(score, 100)
}

const LEVELS = [
  { min: 0,  label: 'Explorer',           color: '#6366F1' },
  { min: 25, label: 'Rising Contributor', color: '#0891B2' },
  { min: 50, label: 'Community Builder',  color: '#D99E00' },
  { min: 75, label: 'Impact Maker',       color: '#059669' },
  { min: 92, label: 'Hive Champion',      color: '#FFB703' },
]

function getLevel(score) {
  return [...LEVELS].reverse().find(l => score >= l.min) || LEVELS[0]
}

const SKILL_CATEGORY_COLORS = {
  'Programming': '#6366F1',
  'Data & AI': '#3B82F6',
  'Tools & Platforms': '#0891B2',
  'Soft Skills': '#D99E00',
  'Design': '#EC4899',
  'Marketing': '#F97316',
  'Research': '#10B981',
  'Other': '#6B7280',
}

const SKILL_LEVEL_COLORS = {
  'Beginner': { bg: '#FEE2E2', color: '#B91C1C' },
  'Intermediate': { bg: '#FEF3C7', color: '#92400E' },
  'Advanced': { bg: '#D1FAE5', color: '#065F46' },
  'Expert': { bg: '#EDE9FE', color: '#5B21B6' },
}

export default function StudentProfile() {
  const { user, profile, updateProfile } = useApp()
  const navigate = useNavigate()

  const displayName = user?.name || 'Student'
  const avatarSrc = profile?.avatar || user?.avatar || null

  const rawSkills = Array.isArray(profile?.skills)
    ? profile.skills
    : (profile?.skills?.split(',').map(s => s.trim()).filter(Boolean) || [])

  const languages = Array.isArray(profile?.languages) ? profile.languages : []

  const interests = Array.isArray(profile?.interests)
    ? profile.interests
    : (profile?.interests?.split(',').map(s => s.trim()).filter(Boolean) || [])

  const score = computeLevel(profile, rawSkills, languages, interests)
  const level = getLevel(score)
  const skillGroups = groupSkills(rawSkills)

  const [showMore, setShowMore] = useState(false)
  const [globalEditMode, setGlobalEditMode] = useState(false)
  const [editingAbout, setEditingAbout] = useState(false)
  const [aboutDraft, setAboutDraft] = useState(profile?.bio || '')
  const [editingSkills, setEditingSkills] = useState(false)
  const [newSkillId, setNewSkillId] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate')
  const [displayedSkills, setDisplayedSkills] = useState(
    Array.isArray(profile?.skillsWithLevel) ? profile.skillsWithLevel : []
  )
  const [savingSkills, setSavingSkills] = useState(false)

  const SKILLS_LIST = {
    'Programming': [
      { name: 'Python', level: 'Intermediate' },
      { name: 'JavaScript', level: 'Advanced' },
      { name: 'React', level: 'Advanced' },
      { name: 'Java', level: 'Intermediate' },
      { name: 'SQL', level: 'Intermediate' },
      { name: 'Node.js', level: 'Advanced' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'C++', level: 'Beginner' },
    ],
    'Data & AI': [
      { name: 'Machine Learning', level: 'Advanced' },
      { name: 'Data Analysis', level: 'Advanced' },
      { name: 'TensorFlow', level: 'Intermediate' },
      { name: 'Pandas', level: 'Advanced' },
      { name: 'Statistics', level: 'Intermediate' },
      { name: 'Deep Learning', level: 'Advanced' },
    ],
    'Tools & Platforms': [
      { name: 'Git', level: 'Advanced' },
      { name: 'Docker', level: 'Intermediate' },
      { name: 'AWS', level: 'Intermediate' },
      { name: 'Google Cloud', level: 'Beginner' },
      { name: 'Figma', level: 'Advanced' },
      { name: 'Linux', level: 'Intermediate' },
    ],
    'Soft Skills': [
      { name: 'Communication', level: 'Advanced' },
      { name: 'Leadership', level: 'Advanced' },
      { name: 'Project Management', level: 'Intermediate' },
      { name: 'Problem Solving', level: 'Advanced' },
      { name: 'Teamwork', level: 'Advanced' },
    ],
    'Design': [
      { name: 'UI Design', level: 'Advanced' },
      { name: 'UX Design', level: 'Advanced' },
      { name: 'Graphic Design', level: 'Intermediate' },
      { name: 'Web Design', level: 'Advanced' },
      { name: 'Prototyping', level: 'Intermediate' },
    ],
    'Marketing': [
      { name: 'Digital Marketing', level: 'Advanced' },
      { name: 'Content Writing', level: 'Advanced' },
      { name: 'Social Media', level: 'Advanced' },
      { name: 'SEO', level: 'Intermediate' },
      { name: 'Email Marketing', level: 'Intermediate' },
    ],
  }
  const [expandedCategories, setExpandedCategories] = useState({})
  const [editingLinks, setEditingLinks] = useState(false)
  const [linksDraft, setLinksDraft] = useState({
    github: profile?.links?.github || '',
    linkedin: profile?.links?.linkedin || '',
    portfolio: profile?.links?.portfolio || '',
  })
  const [editingAvailability, setEditingAvailability] = useState(false)
  const [availabilityDraft, setAvailabilityDraft] = useState({
    availability: profile?.availability || '',
    workMode: profile?.workMode || '',
    startDate: profile?.startDate || '',
    startMonth: profile?.startMonth || '',
    startYear: profile?.startYear || '',
    startImmediately: profile?.startImmediately || false,
    preferredRoles: profile?.preferredRoles || '',
  })

  const [editingLanguages, setEditingLanguages] = useState(false)
  const [languagesDraft, setLanguagesDraft] = useState(Array.isArray(profile?.languages) ? profile.languages : [])
  const [newLanguage, setNewLanguage] = useState('')
  const [newLanguageLevel, setNewLanguageLevel] = useState('Fluent')

  const [editingCauses, setEditingCauses] = useState(false)
  const [causesDraft, setCausesDraft] = useState(
    Array.isArray(profile?.interests)
      ? profile.interests
      : (profile?.interests?.split(',').map(s => s.trim()).filter(Boolean) || [])
  )
  const [newCause, setNewCause] = useState('')

  const [editingMotivation, setEditingMotivation] = useState(false)
  const [motivationDraft, setMotivationDraft] = useState(profile?.motivation || '')

  const [editingEducation, setEditingEducation] = useState(false)
  const [educations, setEducations] = useState(
    Array.isArray(profile?.educations) ? profile.educations :
    (profile?.field || profile?.university) ? [{ field: profile?.field || '', university: profile?.university || '', degreeType: profile?.graduation_year || '', description: '' }] : []
  )
  const [newEducation, setNewEducation] = useState({ field: '', university: '', degreeType: '', description: '' })
  const [editingEduIndex, setEditingEduIndex] = useState(null)

  const [editingContact, setEditingContact] = useState(false)
  const [contactDraft, setContactDraft] = useState({
    phone: profile?.phone || '',
    city: profile?.city || '',
  })

  const [editingGoals, setEditingGoals] = useState(false)
  const [goalsDraft, setGoalsDraft] = useState(profile?.goals || '')

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  useEffect(() => {
    if (Array.isArray(profile?.skillsWithLevel)) {
      setDisplayedSkills(profile.skillsWithLevel)
    }
  }, [profile?.skillsWithLevel])

  const CATEGORY_ICONS = {
    'Programming': Code,
    'Data & AI': BarChart2,
    'Tools & Platforms': Zap,
    'Soft Skills': Users,
    'Design': Palette,
    'Marketing': TrendingUp,
    'Research': BookOpen,
    'Other': Sparkles,
  }

  const handleSaveLinks = () => {
    setEditingLinks(false)
  }

  const handleSaveAvailability = () => {
    setEditingAvailability(false)
  }

  const handleSaveMotivation = async () => {
    await updateProfile({ ...profile, motivation: motivationDraft })
    setEditingMotivation(false)
  }

  const handleSaveEducation = async () => {
    let updatedEducations
    if (editingEduIndex !== null) {
      updatedEducations = [...educations]
      updatedEducations[editingEduIndex] = newEducation
      setEditingEduIndex(null)
    } else if (newEducation.field || newEducation.university) {
      updatedEducations = [...educations, newEducation]
    } else {
      setEditingEducation(false)
      return
    }
    setEducations(updatedEducations)
    setNewEducation({ field: '', university: '', degreeType: '', description: '' })
    await updateProfile({
      ...profile,
      educations: updatedEducations,
      field: updatedEducations[0]?.field || profile?.field,
      university: updatedEducations[0]?.university || profile?.university,
      graduation_year: updatedEducations[0]?.degreeType || profile?.graduation_year
    })
    setEditingEducation(false)
  }

  const handleDeleteEducation = async (index) => {
    const updated = educations.filter((_, i) => i !== index)
    setEducations(updated)
    await updateProfile({ ...profile, educations: updated })
  }

  const handleSaveContact = async () => {
    await updateProfile({ ...profile, phone: contactDraft.phone, city: contactDraft.city })
    setEditingContact(false)
  }

  const handleSaveGoals = async () => {
    await updateProfile({ ...profile, goals: goalsDraft })
    setEditingGoals(false)
  }

  const handleSaveLanguages = () => {
    setEditingLanguages(false)
  }

  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return
    const langObj = { lang: newLanguage.trim(), level: newLanguageLevel }
    setLanguagesDraft([...languagesDraft, langObj])
    setNewLanguage('')
    setNewLanguageLevel('Fluent')
  }

  const handleRemoveLanguage = (index) => {
    setLanguagesDraft(languagesDraft.filter((_, i) => i !== index))
  }

  const handleSaveCauses = () => {
    setEditingCauses(false)
  }

  const handleAddCause = (cause) => {
    if (!cause.trim()) return
    if (causesDraft.includes(cause)) return
    setCausesDraft([...causesDraft, cause.trim()])
    setNewCause('')
  }

  const handleRemoveCause = (index) => {
    setCausesDraft(causesDraft.filter((_, i) => i !== index))
  }

  const [editingExperience, setEditingExperience] = useState(false)
  const [experiences, setExperiences] = useState(
    Array.isArray(profile?.experiences) ? profile.experiences : profile?.experience ? [{ description: profile.experience }] : []
  )
  const [newExp, setNewExp] = useState({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
  const [editingExpIndex, setEditingExpIndex] = useState(null)

  const handleSaveAbout = async () => {
    setEditingAbout(false)
  }

  const handleAddSkill = async () => {
    if (!newSkillId.trim()) return
    const [category, skillName] = newSkillId.split('||')
    if (!skillName || !category) return

    if (displayedSkills.some(s => s.name === skillName)) {
      alert('This skill is already added!')
      return
    }

    const newSkill = { name: skillName, level: newSkillLevel, category }
    const updated = [...displayedSkills, newSkill]

    setDisplayedSkills(updated)
    setNewSkillId('')
    setNewSkillLevel('Intermediate')

    setSavingSkills(true)
    console.log('[handleAddSkill] Starting save...')

    try {
      const savePromise = updateProfile({ ...profile, skillsWithLevel: updated, skills: updated.map(s => s.name) })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Save timeout - took too long')), 10000)
      )

      await Promise.race([savePromise, timeoutPromise])
      console.log('[handleAddSkill] Save completed successfully')
    } catch (err) {
      console.error('[handleAddSkill] Error:', err.message)
      setDisplayedSkills(displayedSkills)
      alert('Failed to save skill: ' + (err.message || 'Unknown error'))
    } finally {
      setSavingSkills(false)
    }
  }

  const handleRemoveSkill = async (index) => {
    const updated = displayedSkills.filter((_, i) => i !== index)
    setDisplayedSkills(updated)
    setSavingSkills(true)
    console.log('[handleRemoveSkill] Starting save...')

    try {
      const savePromise = updateProfile({ ...profile, skillsWithLevel: updated, skills: updated.map(s => s.name) })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Save timeout - took too long')), 10000)
      )

      await Promise.race([savePromise, timeoutPromise])
      console.log('[handleRemoveSkill] Save completed successfully')
    } catch (err) {
      console.error('[handleRemoveSkill] Error:', err.message)
      setDisplayedSkills(displayedSkills)
      alert('Failed to remove skill: ' + (err.message || 'Unknown error'))
    } finally {
      setSavingSkills(false)
    }
  }

  const handleDeleteExperience = async (index) => {
    const updated = experiences.filter((_, i) => i !== index)
    setExperiences(updated)
    await updateProfile({ ...profile, experiences: updated })
  }

  const handleSaveExperience = async () => {
    if (editingExpIndex !== null) {
      const updated = [...experiences]
      updated[editingExpIndex] = newExp
      setExperiences(updated)
      setEditingExpIndex(null)
    } else if (newExp.title || newExp.description) {
      setExperiences([...experiences, newExp])
    }
    setNewExp({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
    await updateProfile({ ...profile, experiences })
    setEditingExperience(false)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="px-8 py-7 max-w-6xl mx-auto">

        {/* ══════════════════════════════════════════════════════
            HERO PROFILE CARD
        ══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
          className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 mb-6 shadow-sm relative overflow-hidden">

          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: `url(${cardsBackground})`, backgroundSize: 'auto', backgroundRepeat: 'repeat' }}/>

          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
            style={{ background: '#FFB703', transform: 'translate(40%, -40%)' }}/>

          <div className="relative flex items-start justify-between gap-10">
            {/* LEFT - Profile Info */}
            <div className="flex gap-5 flex-1">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-xl overflow-hidden ring-4 ring-[#FFB703]/20 shadow-lg">
                  <AvatarDisplay src={avatarSrc} name={displayName} size="xl" className="w-full h-full"/>
                </div>
                <button className="absolute bottom-3 right-3 p-3 bg-[#FFB703] rounded-full text-white hover:opacity-90 transition-opacity shadow-lg">
                  <Camera size={18}/>
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-[1.8rem] font-extrabold text-[#0D183D] leading-tight mb-1">
                  {displayName}
                </h1>

                <p className="text-[14px] font-semibold text-[#0D183D] mb-0.5">
                  {profile?.field || 'Student'}
                </p>

                <div className="flex items-center gap-2 text-[12px] text-[#4B6382] mb-3">
                  {profile?.university && (
                    <>
                      <span className="flex items-center gap-1">
                        <Home size={13}/>
                        {profile.university}
                      </span>
                      {profile?.field?.includes('Final') && <span>•</span>}
                      {profile?.field?.includes('Final') && <span>Final Year</span>}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {user?.email && (
                    <span className="flex items-center gap-1.5 text-[11px] text-[#4B6382]">
                      <Mail size={12}/>
                      {user.email}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
                        ✓ Verified
                      </span>
                    </span>
                  )}
                </div>

                {editingAbout ? (
                  <div className="space-y-2">
                    <textarea value={aboutDraft} onChange={e => setAboutDraft(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-[13px] border border-[#FFB703] outline-none resize-none"
                      rows={3}/>
                    <div className="flex gap-2">
                      <button onClick={handleSaveAbout} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold" style={{ background: '#0D183D', color: 'white' }}>
                        <Check size={13} className="inline mr-1"/>Save
                      </button>
                      <button onClick={() => setEditingAbout(false)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] leading-relaxed text-[#0D183D] mb-2">
                      {profile?.bio || 'No bio added yet.'}
                    </p>
                    {profile?.bio && !showMore && (
                      <button onClick={() => setShowMore(true)} className="text-[12px] font-semibold text-[#4B6382] flex items-center gap-1 hover:text-[#0D183D]">
                        Show more <ChevronDown size={12}/>
                      </button>
                    )}
                  </>
                )}

                {showMore && (
                  <div className="mt-3 pt-3 border-t border-[rgba(13,24,61,0.06)]">
                    <div className="flex flex-wrap gap-3 text-[12px]">
                      {profile?.country && (
                        <span className="flex items-center gap-1 text-[#4B6382]">
                          <MapPin size={13}/>
                          {profile.country}
                        </span>
                      )}
                      {languages.length > 0 && (
                        <span className="flex items-center gap-1 text-[#4B6382]">
                          <Globe size={13}/>
                          {languages.map(l => typeof l === 'string' ? l : l.lang).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT - Profile Strength */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="transform -rotate-90 w-28 h-28" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(13,24,61,0.08)" strokeWidth="5"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#FFB703" strokeWidth="5"
                    strokeDasharray={`${(score / 100) * 264} 264`} strokeLinecap="round"/>
                </svg>
                <div className="absolute text-center">
                  <p className="text-[1.5rem] font-extrabold text-[#FFB703] leading-none">{score}%</p>
                  <p className="text-[10px] font-semibold text-[#4B6382]">Complete</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[11px] font-semibold text-[#FFB703] mb-2">
                  {score >= 75 ? 'Strong' : score >= 50 ? 'Good' : 'Getting there'}
                </p>
                <p className="text-[10px] text-[#4B6382]">Keep going! Complete a few more sections.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            STAT CARDS ROW
        ══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: Code, value: displayedSkills.length > 0 ? displayedSkills.length : rawSkills.length, label: 'Key skills', color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
            { icon: Globe, value: languages.length, label: 'Languages', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
            { icon: Heart, value: interests.length, label: 'Top causes', color: '#FFB703', bg: 'rgba(255,183,3,0.1)' },
            { icon: Briefcase, value: experiences.length, label: 'Experiences', color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: stat.bg }}>
                  <stat.icon size={18} style={{ color: stat.color }}/>
                </div>
                <p className="text-[20px] font-extrabold text-[#0D183D] leading-none">{stat.value}</p>
              </div>
              <p className="text-[11px] font-semibold text-[#4B6382]">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            MAIN GRID
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-5">

          {/* LEFT COLUMN */}
          <div className="col-span-2 space-y-5">

            {/* ABOUT */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#6366F115' }}>
                    <Users size={14} style={{ color: '#6366F1' }}/>
                  </span>
                  About
                </h2>
                {!editingAbout && (
                  <button onClick={() => setEditingAbout(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    {profile?.bio ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingAbout ? (
                <div className="space-y-3">
                  <textarea value={aboutDraft} onChange={e => setAboutDraft(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] border border-[rgba(13,24,61,0.1)] outline-none transition-all placeholder-[#4B6382]/40 resize-none"
                    placeholder="Write a bio to help NGOs understand who you are..."
                    rows={4}
                    style={{ background: '#F8F9FB' }}
                    onFocus={e => e.target.style.borderColor = '#FFB703'}
                    onBlur={e => e.target.style.borderColor = 'rgba(13,24,61,0.1)'}/>
                  <div className="flex gap-2">
                    <button onClick={handleSaveAbout}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Save
                    </button>
                    <button onClick={() => {
                      setAboutDraft(profile?.bio || '')
                      setEditingAbout(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[13px] leading-relaxed text-[#0D183D] mb-4">
                    {profile?.bio || 'Add a bio to help NGOs understand who you are.'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-[12px]">
                    {profile?.country && (
                      <span className="flex items-center gap-1.5 text-[#4B6382]">
                        <MapPin size={13}/>
                        {profile.country}
                      </span>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* SKILLS */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-extrabold text-[#6366F1] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#6366F115' }}>
                    <Sparkles size={14} style={{ color: '#6366F1' }}/>
                  </span>
                  Skills
                </h2>
                {!editingSkills && (
                  <button onClick={() => setEditingSkills(true)}
                    className="text-[12px] font-semibold text-[#6366F1] flex items-center gap-1 hover:opacity-70">
                    Edit <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingSkills ? (
                <div className="space-y-3">
                  {displayedSkills.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-[rgba(13,24,61,0.06)]">
                      <div className="space-y-3">
                        {(() => {
                          const skillsByCategory = {}
                          displayedSkills.forEach(skill => {
                            const category = skill.category || 'Other'
                            if (!skillsByCategory[category]) skillsByCategory[category] = []
                            skillsByCategory[category].push(skill)
                          })
                          return Object.entries(skillsByCategory).map(([cat, skills]) => {
                            const catColor = SKILL_CATEGORY_COLORS[cat] || SKILL_CATEGORY_COLORS['Other']
                            return (
                              <div key={cat}>
                                <div className="flex items-center gap-2 mb-2">
                                  {(() => {
                                    const IconComponent = CATEGORY_ICONS[cat]
                                    return (
                                      <span className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5"
                                        style={{ background: `${catColor}20`, color: catColor }}>
                                        {IconComponent && <IconComponent size={14} strokeWidth={2}/>}
                                        {cat}
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold" style={{ background: catColor, color: 'white' }}>
                                          {skills.length}
                                        </span>
                                      </span>
                                    )
                                  })()}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {skills.map((skill, idx) => {
                                    const levelColors = SKILL_LEVEL_COLORS[skill.level] || SKILL_LEVEL_COLORS['Intermediate']
                                    return (
                                      <div key={`${cat}-${skill.name}-${idx}`} className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(13,24,61,0.1)] hover:border-[rgba(13,24,61,0.2)] transition-colors">
                                        <p className="text-[12px] font-semibold text-[#0D183D]">{skill.name}</p>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: levelColors.bg, color: levelColors.color }}>
                                          {skill.level}
                                        </span>
                                        <button onClick={() => handleRemoveSkill(profile.skillsWithLevel.indexOf(skill))}
                                          className="p-0.5 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                          title="Delete skill">
                                          <X size={12}/>
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Select a skill to add</label>
                      <select value={newSkillId} onChange={e => setNewSkillId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] bg-white text-[#0D183D] appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem', height: '38px' }}>
                        <option value="">Choose a skill...</option>
                        {Object.entries(SKILLS_LIST).map(([category, skills]) => (
                          <optgroup key={category} label={category}>
                            {skills.map(skill => (
                              <option key={skill.name} value={`${category}||${skill.name}`}>
                                {skill.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Your expertise level</label>
                      <select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] bg-white text-[#0D183D] appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem', height: '38px' }}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Expert</option>
                      </select>
                    </div>

                    <button onClick={handleAddSkill}
                      className="w-full px-3 py-2.5 rounded-lg text-[12px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.1)]"
                      style={{ background: 'rgba(13,24,61,0.02)' }}>
                      Add the skill
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setEditingSkills(false)}
                      disabled={savingSkills}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: '#0D183D', color: 'white' }}>
                      {savingSkills ? 'Saving...' : 'Done'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {displayedSkills.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const skillsByCategory = {}
                        displayedSkills.forEach(skill => {
                          const category = skill.category || 'Other'
                          if (!skillsByCategory[category]) skillsByCategory[category] = []
                          skillsByCategory[category].push(skill)
                        })
                        return Object.entries(skillsByCategory).map(([cat, skills]) => {
                          const catColor = SKILL_CATEGORY_COLORS[cat] || SKILL_CATEGORY_COLORS['Other']
                          return (
                            <div key={cat}>
                              <div className="flex items-center gap-2 mb-2">
                                {(() => {
                                  const IconComponent = CATEGORY_ICONS[cat]
                                  return (
                                    <span className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5"
                                      style={{ background: `${catColor}20`, color: catColor }}>
                                      {IconComponent && <IconComponent size={14} strokeWidth={2}/>}
                                      {cat}
                                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold" style={{ background: catColor, color: 'white' }}>
                                        {skills.length}
                                      </span>
                                    </span>
                                  )
                                })()}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill, idx) => {
                                  const levelColors = SKILL_LEVEL_COLORS[skill.level] || SKILL_LEVEL_COLORS['Intermediate']
                                  return (
                                    <div key={`${cat}-${skill.name}-${idx}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(13,24,61,0.1)]">
                                      <p className="text-[12px] font-semibold text-[#0D183D]">{skill.name}</p>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: levelColors.bg, color: levelColors.color }}>
                                        {skill.level}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Code size={32} className="mx-auto mb-3 text-[#6366F1]" style={{ opacity: 0.5 }}/>
                      <p className="text-[13px] font-semibold text-[#0D183D] mb-1">No skills added yet</p>
                      <p className="text-[12px] text-[#4B6382] mb-4">Share your skills and expertise</p>
                      <button onClick={() => setEditingSkills(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-semibold"
                        style={{ background: '#6366F1', color: 'white' }}>
                        <Plus size={14}/>
                        Add Skills
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* EXPERIENCE */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-extrabold text-[#EC4893] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#EC489315' }}>
                    <Briefcase size={14} style={{ color: '#EC4893' }}/>
                  </span>
                  Experience
                </h2>
                {!editingExperience && (
                  <button onClick={() => setEditingExperience(true)}
                    className="text-[12px] font-semibold text-[#EC4893] flex items-center gap-1 hover:opacity-70">
                    {experiences.length > 0 ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingExperience ? (
                <div className="space-y-3">
                  {editingExpIndex !== null && (
                    <div className="p-2 rounded-lg bg-blue-50 text-[11px] text-blue-600 mb-2">
                      Editing: {experiences[editingExpIndex]?.title || 'Experience'}
                    </div>
                  )}

                  <input type="text" value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                    placeholder="Job title or role (e.g., Data Analytics Intern)"/>

                  <input type="text" value={newExp.organization} onChange={e => setNewExp({...newExp, organization: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                    placeholder="Organization/Company name"/>

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={newExp.startDate} onChange={e => setNewExp({...newExp, startDate: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                      placeholder="Start date (e.g., May 2024)"/>
                    <input type="text" value={newExp.endDate} onChange={e => setNewExp({...newExp, endDate: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                      placeholder="End date or Present"/>
                  </div>

                  <input type="text" value={newExp.location} onChange={e => setNewExp({...newExp, location: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                    placeholder="Location (e.g., Mumbai, India)"/>

                  <textarea value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] resize-none"
                    placeholder="What did you do? Describe your accomplishments..."
                    rows={3}/>

                  <div className="flex gap-2">
                    <button onClick={handleSaveExperience}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Save
                    </button>
                    <button onClick={() => {
                      setNewExp({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
                      setEditingExpIndex(null)
                      setEditingExperience(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {experiences.length > 0 ? (
                    <div className="space-y-3">
                      {experiences.map((exp, idx) => (
                        <div key={idx} className="border border-[rgba(13,24,61,0.07)] rounded-lg p-4 hover:shadow-md transition-shadow group">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="text-[13px] font-bold text-[#0D183D]">{exp.title}</h4>
                              <p className="text-[12px] font-semibold text-[#4B6382]">{exp.organization}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => {
                                setNewExp(exp)
                                setEditingExpIndex(idx)
                                setEditingExperience(true)
                              }} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"
                                title="Edit">
                                <Edit3 size={14}/>
                              </button>
                              <button onClick={() => handleDeleteExperience(idx)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                                title="Delete">
                                <X size={14}/>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-[11px] text-[#4B6382] mb-2">
                            {exp.startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12}/>
                                {exp.startDate} {exp.endDate ? ` - ${exp.endDate}` : ''}
                              </span>
                            )}
                            {exp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12}/>
                                {exp.location}
                              </span>
                            )}
                          </div>

                          {exp.description && (
                            <p className="text-[12px] leading-relaxed text-[#0D183D]">{exp.description}</p>
                          )}
                        </div>
                      ))}
                      <button onClick={() => {
                        setNewExp({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
                        setEditingExpIndex(null)
                        setEditingExperience(true)
                      }} className="w-full mt-2 py-2 rounded-lg text-[12px] font-semibold border border-dashed border-[#FFB703]"
                        style={{ color: '#FFB703' }}>
                        Add Experience
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Briefcase size={32} className="mx-auto mb-3 text-[#EC4893]" style={{ opacity: 0.5 }}/>
                      <p className="text-[13px] font-semibold text-[#0D183D] mb-1">No experiences yet</p>
                      <p className="text-[12px] text-[#4B6382] mb-4">Share your work experience and projects</p>
                      <button onClick={() => {
                        setNewExp({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
                        setEditingExpIndex(null)
                        setEditingExperience(true)
                      }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-semibold"
                        style={{ background: '#EC4893', color: 'white' }}>
                        <Plus size={14}/>
                        Add Experience
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* EDUCATION */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#6366F115' }}>
                    <GraduationCap size={14} style={{ color: '#6366F1' }}/>
                  </span>
                  Education
                </h2>
                {!editingEducation && (
                  <button onClick={() => { setNewEducation({ field: '', university: '', degreeType: '', description: '' }); setEditingEduIndex(null); setEditingEducation(true) }}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    {educations.length > 0 ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingEducation ? (
                <div className="space-y-3">
                  {editingEduIndex !== null && (
                    <div className="p-2 rounded-lg bg-blue-50 text-[11px] text-blue-600 mb-2">
                      Editing: {educations[editingEduIndex]?.field || 'Education'}
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Field of Study</label>
                    <input type="text" value={newEducation.field} onChange={e => setNewEducation({...newEducation, field: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                      placeholder="e.g., Computer Science"/>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">University / School</label>
                    <input type="text" value={newEducation.university} onChange={e => setNewEducation({...newEducation, university: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                      placeholder="e.g., Stanford University"/>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Degree Type</label>
                    <select value={newEducation.degreeType} onChange={e => setNewEducation({...newEducation, degreeType: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2rem' }}>
                      <option value="">Select degree type</option>
                      <option value="High School">High School</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Bachelor's">Bachelor's</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Description (optional)</label>
                    <textarea value={newEducation.description} onChange={e => setNewEducation({...newEducation, description: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] resize-none"
                      placeholder="e.g., Major achievements, relevant coursework, or details about this education..."
                      rows={3}/>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveEducation}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Save
                    </button>
                    <button onClick={() => {
                      setNewEducation({ field: '', university: '', degreeType: '', description: '' })
                      setEditingEduIndex(null)
                      setEditingEducation(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {educations.length > 0 ? (
                    <div className="space-y-3">
                      {educations.map((edu, idx) => (
                        <div key={idx} className="border border-[rgba(13,24,61,0.07)] rounded-lg p-4 hover:shadow-md transition-shadow group">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="text-[13px] font-bold text-[#0D183D]">{edu.field}</h4>
                              <p className="text-[12px] font-semibold text-[#4B6382]">{edu.university}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => {
                                setNewEducation(edu)
                                setEditingEduIndex(idx)
                                setEditingEducation(true)
                              }} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"
                                title="Edit">
                                <Edit3 size={14}/>
                              </button>
                              <button onClick={() => handleDeleteEducation(idx)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                                title="Delete">
                                <X size={14}/>
                              </button>
                            </div>
                          </div>
                          {edu.degreeType && (
                            <p className="text-[11px] text-[#4B6382] flex items-center gap-1 mb-2">
                              <GraduationCap size={12}/>
                              {edu.degreeType}
                            </p>
                          )}
                          {edu.description && (
                            <p className="text-[12px] text-[#0D183D] leading-relaxed whitespace-pre-wrap">{edu.description}</p>
                          )}
                        </div>
                      ))}
                      <button onClick={() => {
                        setNewEducation({ field: '', university: '', degreeType: '', description: '' })
                        setEditingEduIndex(null)
                        setEditingEducation(true)
                      }} className="w-full mt-2 py-2 rounded-lg text-[12px] font-semibold border border-dashed border-[#6366F1]"
                        style={{ color: '#6366F1' }}>
                        Add Education
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <GraduationCap size={32} className="mx-auto mb-3 text-[#6366F1]" style={{ opacity: 0.5 }}/>
                      <p className="text-[13px] font-semibold text-[#0D183D] mb-1">No education added yet</p>
                      <p className="text-[12px] text-[#4B6382] mb-4">Add your degrees and educational background</p>
                      <button onClick={() => { setNewEducation({ field: '', university: '', degreeType: '', description: '' }); setEditingEduIndex(null); setEditingEducation(true) }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-semibold"
                        style={{ background: '#6366F1', color: 'white' }}>
                        <Plus size={14}/>
                        Add Education
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* MOTIVATION */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#EC489320' }}>
                    <Heart size={14} style={{ color: '#EC4899' }}/>
                  </span>
                  Why These Causes Matter
                </h2>
                {!editingMotivation && (
                  <button onClick={() => setEditingMotivation(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    {motivationDraft ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingMotivation ? (
                <div className="space-y-3">
                  <textarea value={motivationDraft} onChange={e => setMotivationDraft(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] resize-none"
                    placeholder="Why do these causes matter to you?"
                    rows={3}
                  />
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveMotivation}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Save
                    </button>
                    <button onClick={() => {
                      setMotivationDraft(profile?.motivation || '')
                      setEditingMotivation(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] leading-relaxed text-[#0D183D]">
                  {motivationDraft || 'Share your motivation for these causes.'}
                </p>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* LANGUAGES */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-extrabold text-[#10B981] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10B98115' }}>
                    <Globe size={14} style={{ color: '#10B981' }}/>
                  </span>
                  Languages
                </h3>
                {!globalEditMode && !editingLanguages && (
                  <button onClick={() => setEditingLanguages(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    {languagesDraft.length > 0 ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingLanguages ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {languagesDraft.map((lang, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-[#F8F9FB] border border-[rgba(13,24,61,0.08)]">
                        <div className="flex-1">
                          <p className="text-[12px] font-semibold text-[#0D183D]">{typeof lang === 'string' ? lang : lang?.lang}</p>
                          {typeof lang === 'object' && lang?.level && (
                            <p className="text-[11px] text-[#6B7280]">{lang.level}</p>
                          )}
                        </div>
                        <button onClick={() => handleRemoveLanguage(i)}
                          className="p-1 hover:bg-[#FFB70320] rounded transition-colors">
                          <Trash2 size={14} className="text-red-500"/>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-[rgba(13,24,61,0.1)]">
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Add Language</label>
                    <div className="flex gap-2 mb-2">
                      <select value={newLanguage} onChange={e => setNewLanguage(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2rem' }}>
                        <option value="">Select language</option>
                        <option>English</option>
                        <option>Arabic</option>
                        <option>Hebrew</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Italian</option>
                        <option>Portuguese</option>
                        <option>Russian</option>
                        <option>Chinese (Mandarin)</option>
                        <option>Chinese (Cantonese)</option>
                        <option>Japanese</option>
                        <option>Korean</option>
                        <option>Hindi</option>
                        <option>Urdu</option>
                        <option>Turkish</option>
                        <option>Dutch</option>
                        <option>Swedish</option>
                        <option>Norwegian</option>
                        <option>Danish</option>
                        <option>Polish</option>
                        <option>Vietnamese</option>
                        <option>Thai</option>
                      </select>
                      <select value={newLanguageLevel} onChange={e => setNewLanguageLevel(e.target.value)}
                        className="px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2rem' }}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Native">Native</option>
                      </select>
                    </div>
                    <button onClick={handleAddLanguage}
                      className="w-full px-3 py-2 rounded-lg text-[11px] font-semibold text-[#10B981] border border-[#10B98120] hover:bg-[#10B98110]">
                      Add Language
                    </button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveLanguages}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Save
                    </button>
                    <button onClick={() => {
                      setLanguagesDraft(Array.isArray(profile?.languages) ? profile.languages : [])
                      setEditingLanguages(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {languagesDraft.length > 0 ? (
                    languagesDraft.map((lang, i) => {
                      const langName = typeof lang === 'string' ? lang : lang?.lang
                      const langLevel = typeof lang === 'object' ? lang?.level : null
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(13,24,61,0.08)] bg-[#F8F9FB]">
                          <span className="text-[12px] font-semibold text-[#0D183D]">
                            {langName}
                          </span>
                          {langLevel && (
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#10B981]"
                              style={{ background: '#10B98120' }}>
                              {langLevel}
                            </span>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-[12px] text-[#4B6382]">No languages added</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* CAUSES */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-extrabold text-[#FFB703] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#FFB70320' }}>
                    <Heart size={14} style={{ color: '#FFB703' }}/>
                  </span>
                  Causes & Interests
                </h3>
                {!globalEditMode && !editingCauses && (
                  <button onClick={() => setEditingCauses(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    {causesDraft.length > 0 ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingCauses ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {causesDraft.map((cause, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-[#F8F9FB] border border-[rgba(13,24,61,0.08)]">
                        <div className="flex-1">
                          <p className="text-[12px] font-semibold text-[#0D183D]">{cause}</p>
                        </div>
                        <button onClick={() => handleRemoveCause(i)}
                          className="p-1 hover:bg-[#FFB70320] rounded transition-colors">
                          <Trash2 size={14} className="text-red-500"/>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-[rgba(13,24,61,0.1)]">
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Add Interest</label>
                    <select value={newCause} onChange={e => {
                      if (e.target.value) handleAddCause(e.target.value)
                    }}
                      className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703] appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2rem' }}>
                      <option value="">Select interest</option>
                      <option>Education</option>
                      <option>Youth Empowerment</option>
                      <option>Women Empowerment</option>
                      <option>Environment</option>
                      <option>Mental Health</option>
                      <option>Digital Inclusion</option>
                      <option>Animal Welfare</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <button onClick={handleSaveCauses}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Done
                    </button>
                    <button onClick={() => {
                      setCausesDraft(
                        Array.isArray(profile?.interests)
                          ? profile.interests
                          : (profile?.interests?.split(',').map(s => s.trim()).filter(Boolean) || [])
                      )
                      setEditingCauses(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {causesDraft.length > 0 ? (
                    causesDraft.map((interest, i) => {
                      const causeColors = {
                        'Education': { bg: '#F0F4FF', color: '#6366F1' },
                        'Youth Empowerment': { bg: '#FFE8E8', color: '#DC2626' },
                        'Women Empowerment': { bg: '#FFF0F7', color: '#DB2777' },
                        'Environment': { bg: '#E8F9F1', color: '#10B981' },
                        'Mental Health': { bg: '#FFE8F1', color: '#EC4899' },
                        'Digital Inclusion': { bg: '#F0F4FF', color: '#7C3AED' },
                        'Animal Welfare': { bg: '#FFFAEB', color: '#D97706' },
                      }
                      const colors = causeColors[interest] || { bg: '#F8F9FB', color: '#6B7280' }
                      return (
                        <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                          style={{ background: colors.bg, color: colors.color }}>
                          {interest}
                        </span>
                      )
                    })
                  ) : (
                    <p className="text-[12px] text-[#4B6382]">No causes added</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* LINKS */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-extrabold text-[#3B82F6] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#3B82F620' }}>
                    <ExternalLink size={14} style={{ color: '#3B82F6' }}/>
                  </span>
                  Links & Social
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">GitHub</label>
                  <input type="text" value={linksDraft.github} onChange={e => setLinksDraft({...linksDraft, github: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                    placeholder="https://github.com/username"/>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">LinkedIn</label>
                  <input type="text" value={linksDraft.linkedin} onChange={e => setLinksDraft({...linksDraft, linkedin: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                    placeholder="https://linkedin.com/in/username"/>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Portfolio / Website</label>
                  <input type="text" value={linksDraft.portfolio} onChange={e => setLinksDraft({...linksDraft, portfolio: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg text-[12px] border border-[rgba(13,24,61,0.1)] outline-none focus:border-[#FFB703]"
                    placeholder="https://yourportfolio.com"/>
                </div>
                {(linksDraft.github !== (profile?.links?.github || '') ||
                  linksDraft.linkedin !== (profile?.links?.linkedin || '') ||
                  linksDraft.portfolio !== (profile?.links?.portfolio || '')) && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveLinks}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Save
                    </button>
                    <button onClick={() => {
                      setLinksDraft({ github: profile?.links?.github || '', linkedin: profile?.links?.linkedin || '', portfolio: profile?.links?.portfolio || '' })
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* CONTACT INFO */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-extrabold text-[#0D183D] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#EC489320' }}>
                    <Phone size={14} style={{ color: '#EC4899' }}/>
                  </span>
                  Contact Info
                </h3>
                {!editingContact && (
                  <button onClick={() => setEditingContact(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    {contactDraft.phone || contactDraft.city ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingContact ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Phone</label>
                    <input type="tel" value={contactDraft.phone} onChange={e => setContactDraft({...contactDraft, phone: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl text-[12px] border-2 border-[#0D183D] outline-none bg-white text-[#0D183D] focus:border-[#FFB703] focus:shadow-lg transition-all"
                      placeholder="e.g., +1 (555) 123-4567"/>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">City</label>
                    <input type="text" value={contactDraft.city} onChange={e => setContactDraft({...contactDraft, city: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl text-[12px] border-2 border-[#0D183D] outline-none bg-white text-[#0D183D] focus:border-[#FFB703] focus:shadow-lg transition-all"
                      placeholder="e.g., San Francisco, CA"/>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveContact}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Save
                    </button>
                    <button onClick={() => {
                      setContactDraft({ phone: profile?.phone || '', city: profile?.city || '' })
                      setEditingContact(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-[13px] text-[#0D183D]">
                  {contactDraft.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} style={{ color: '#EC4899' }}/>
                      <a href={`tel:${contactDraft.phone}`} className="hover:underline">{contactDraft.phone}</a>
                    </div>
                  )}
                  {contactDraft.city && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} style={{ color: '#EC4899' }}/>
                      {contactDraft.city}
                    </div>
                  )}
                  {!contactDraft.phone && !contactDraft.city && (
                    <p className="text-[#4B6382] text-center py-2">Add your contact information</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* GOALS */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-extrabold text-[#0D183D] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10B98120' }}>
                    <Target size={14} style={{ color: '#10B981' }}/>
                  </span>
                  Goals & Aspirations
                </h3>
                {!editingGoals && (
                  <button onClick={() => setEditingGoals(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    {goalsDraft ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingGoals ? (
                <div className="space-y-3">
                  <textarea value={goalsDraft} onChange={e => setGoalsDraft(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] border border-[rgba(13,24,61,0.1)] outline-none transition-all placeholder-[#4B6382]/40 resize-none"
                    placeholder="What are your professional goals? What do you want to achieve?"
                    rows={4}
                    style={{ background: '#F8F9FB' }}
                    onFocus={e => e.target.style.borderColor = '#FFB703'}
                    onBlur={e => e.target.style.borderColor = 'rgba(13,24,61,0.1)'}/>
                  <div className="flex gap-2">
                    <button onClick={handleSaveGoals}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>
                      <Check size={12} className="inline mr-1"/>Save
                    </button>
                    <button onClick={() => {
                      setGoalsDraft(profile?.goals || '')
                      setEditingGoals(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed text-[#0D183D]">
                  {goalsDraft || 'No goals added yet. Share your aspirations and what you want to achieve.'}
                </p>
              )}
            </motion.div>

            {/* AVAILABILITY */}
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-extrabold text-[#0D183D] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#6B72801F' }}>
                    <Clock size={14} style={{ color: '#6B7280' }}/>
                  </span>
                  Availability / Preferences
                </h3>
                {!globalEditMode && !editingAvailability && (
                  <button onClick={() => setEditingAvailability(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    {(availabilityDraft.availability || availabilityDraft.workMode || availabilityDraft.startMonth || availabilityDraft.startYear || availabilityDraft.startImmediately || availabilityDraft.preferredRoles) ? 'Edit' : 'Add'} <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {globalEditMode || editingAvailability ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Availability</label>
                    <select value={availabilityDraft.availability} onChange={e => setAvailabilityDraft({...availabilityDraft, availability: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl text-[12px] border-2 border-[#0D183D] outline-none bg-white text-[#0D183D] focus:border-[#FFB703] focus:shadow-lg transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                      <option value="">Select availability</option>
                      <option>1-2 weeks</option>
                      <option>1 month</option>
                      <option>2-3 months</option>
                      <option>Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Work Mode</label>
                    <select value={availabilityDraft.workMode} onChange={e => setAvailabilityDraft({...availabilityDraft, workMode: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl text-[12px] border-2 border-[#0D183D] outline-none bg-white text-[#0D183D] focus:border-[#FFB703] focus:shadow-lg transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                      <option value="">Select work mode</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Project-based</option>
                      <option>Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Start Date</label>
                    <button onClick={() => setAvailabilityDraft({...availabilityDraft, startImmediately: !availabilityDraft.startImmediately, startMonth: '', startYear: ''})}
                      className="w-full mb-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold border-2"
                      style={{ borderColor: availabilityDraft.startImmediately ? '#10B981' : '#0D183D', background: availabilityDraft.startImmediately ? '#10B98120' : 'white', color: availabilityDraft.startImmediately ? '#065F46' : '#0D183D' }}>
                      <Zap size={12} className="inline mr-1"/>Start Immediately
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={availabilityDraft.startMonth} onChange={e => setAvailabilityDraft({...availabilityDraft, startMonth: e.target.value, availability: ''})}
                        className="w-full px-4 py-2.5 rounded-xl text-[12px] border-2 border-[#0D183D] outline-none bg-white text-[#0D183D] focus:border-[#FFB703] focus:shadow-lg transition-all appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                        <option value="">Month</option>
                        <option>January</option>
                        <option>February</option>
                        <option>March</option>
                        <option>April</option>
                        <option>May</option>
                        <option>June</option>
                        <option>July</option>
                        <option>August</option>
                        <option>September</option>
                        <option>October</option>
                        <option>November</option>
                        <option>December</option>
                      </select>
                      <input type="text" value={availabilityDraft.startYear} onChange={e => setAvailabilityDraft({...availabilityDraft, startYear: e.target.value, availability: ''})}
                        className="w-full px-4 py-2.5 rounded-xl text-[12px] border-2 border-[#0D183D] outline-none bg-white text-[#0D183D] focus:border-[#FFB703] focus:shadow-lg transition-all"
                        placeholder="Year"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0D183D] block mb-1.5">Preferred Roles</label>
                    <select value={availabilityDraft.preferredRoles} onChange={e => setAvailabilityDraft({...availabilityDraft, preferredRoles: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl text-[12px] border-2 border-[#0D183D] outline-none bg-white text-[#0D183D] focus:border-[#FFB703] focus:shadow-lg transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230D183D' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                      <option value="">Select preferred role</option>
                      <option>Designer</option>
                      <option>Data Analyst</option>
                      <option>Marketing Specialist</option>
                      <option>Content Writer</option>
                      <option>Frontend Developer</option>
                      <option>Backend Developer</option>
                      <option>Full Stack Developer</option>
                      <option>Project Manager</option>
                      <option>Business Analyst</option>
                      <option>Social Media Manager</option>
                      <option>Event Coordinator</option>
                      <option>Research Analyst</option>
                      <option>Fundraising Specialist</option>
                    </select>
                  </div>
                  {!globalEditMode && (
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSaveAvailability}
                        className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                        style={{ background: '#0D183D', color: 'white' }}>
                        <Check size={12} className="inline mr-1"/>Save
                      </button>
                      <button onClick={() => {
                        setAvailabilityDraft({
                          availability: profile?.availability || '',
                          workMode: profile?.workMode || '',
                          startDate: profile?.startDate || '',
                          startMonth: profile?.startMonth || '',
                          startYear: profile?.startYear || '',
                          startImmediately: profile?.startImmediately || false,
                          preferredRoles: profile?.preferredRoles || '',
                        })
                        setEditingAvailability(false)
                      }}
                        className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : !globalEditMode ? (
                <div className="space-y-3">
                  {availabilityDraft.availability && (
                    <div className="px-4 py-3 rounded-lg border border-[rgba(13,24,61,0.08)] bg-[#DBEAFE]">
                      <p className="text-[10px] font-semibold text-[#1E40AF] mb-1.5">Availability</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: '#1E40AF' }}/>
                        <p className="text-[13px] font-semibold text-[#0D183D]">{availabilityDraft.availability}</p>
                      </div>
                    </div>
                  )}
                  {availabilityDraft.startImmediately && (
                    <div className="px-4 py-3 rounded-lg border border-[rgba(13,24,61,0.08)] bg-[#10B98120]">
                      <p className="text-[10px] font-semibold text-[#065F46] mb-1.5">Start Date</p>
                      <div className="flex items-center gap-2">
                        <Zap size={14} style={{ color: '#065F46' }}/>
                        <p className="text-[13px] font-semibold text-[#0D183D]">Start Immediately</p>
                      </div>
                    </div>
                  )}
                  {!availabilityDraft.startImmediately && (availabilityDraft.startMonth || availabilityDraft.startYear || availabilityDraft.startDate) && (
                    <div className="px-4 py-3 rounded-lg border border-[rgba(13,24,61,0.08)] bg-[#FEF3C7]">
                      <p className="text-[10px] font-semibold text-[#92400E] mb-1.5">Start Date</p>
                      <div className="flex items-center gap-2">
                        <Clock size={14} style={{ color: '#92400E' }}/>
                        <p className="text-[13px] font-semibold text-[#0D183D]">{availabilityDraft.startMonth && availabilityDraft.startYear ? `${availabilityDraft.startMonth} ${availabilityDraft.startYear}` : availabilityDraft.startDate}</p>
                      </div>
                    </div>
                  )}
                  {availabilityDraft.workMode && (
                    <div className="px-4 py-3 rounded-lg border border-[rgba(13,24,61,0.08)] bg-[#E0E7FF]">
                      <p className="text-[10px] font-semibold text-[#3730A3] mb-1.5">Work Mode</p>
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} style={{ color: '#3730A3' }}/>
                        <p className="text-[13px] font-semibold text-[#0D183D]">{availabilityDraft.workMode}</p>
                      </div>
                    </div>
                  )}
                  {availabilityDraft.preferredRoles && (
                    <div className="px-4 py-3 rounded-lg border border-[rgba(13,24,61,0.08)] bg-[#FCE7F3]">
                      <p className="text-[10px] font-semibold text-[#9D174D] mb-1.5">Preferred Roles</p>
                      <div className="flex items-center gap-2">
                        <Users size={14} style={{ color: '#9D174D' }}/>
                        <p className="text-[13px] font-semibold text-[#0D183D]">{availabilityDraft.preferredRoles}</p>
                      </div>
                    </div>
                  )}
                  {!availabilityDraft.availability && !availabilityDraft.workMode && !availabilityDraft.startDate && !availabilityDraft.startMonth && !availabilityDraft.startYear && !availabilityDraft.startImmediately && !availabilityDraft.preferredRoles && (
                    <div className="text-center py-6">
                      <Clock size={32} className="mx-auto mb-3 text-[#6B7280]" style={{ opacity: 0.5 }}/>
                      <p className="text-[13px] font-semibold text-[#0D183D] mb-1">No preferences set</p>
                      <p className="text-[12px] text-[#4B6382]">Tell NGOs about your availability and preferences</p>
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>

      </div>
    </main>
  )
}
