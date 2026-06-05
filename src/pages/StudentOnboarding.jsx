import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Sparkles, Heart, Calendar, CheckCircle2, Target, TrendingUp, Shield, Rocket, Check, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { saveOnboardingDraft, studentProfileToData } from '../services/storage'
import { COUNTRIES } from '../utils/countries'
import OnboardingLayout from '../components/Onboarding/OnboardingLayout'
import Stepper from '../components/Onboarding/Stepper'
import FormCard from '../components/Onboarding/FormCard'
import SearchableSelect from '../components/Onboarding/SearchableSelect'
import { TextInput, SelectInput, TextArea, ChipSelector, FormField } from '../components/Onboarding/FormInputs'
import { PrimaryButton, SecondaryButton } from '../components/Onboarding/Buttons'

const STEPS = [
  { id: 'profile', title: 'Profile', number: 1 },
  { id: 'skills', title: 'Skills', number: 2 },
  { id: 'causes', title: 'Causes', number: 3 },
  { id: 'availability', title: 'Availability', number: 4 },
  { id: 'complete', title: 'Complete', number: 5 },
]

const SKILL_CATEGORIES = [
  'Programming', 'Data & AI', 'Design', 'Marketing', 'Research',
  'Writing', 'Languages', 'Community Work', 'Project Management',
  'Graphic Design', 'Video Production', 'Social Media', 'Other'
]

const CAUSES = [
  'Youth Empowerment', 'Women Empowerment', 'Education', 'Environment',
  'Health', 'Mental Health', 'Refugees', 'Community Development',
  'Technology for Good', 'Human Rights', 'Accessibility', 'Animals', 'Other'
]

const AVAILABILITY_OPTIONS = [
  { value: '5', label: '5 hours/week' },
  { value: '10', label: '10 hours/week' },
  { value: '20', label: '20 hours/week' },
  { value: 'flexible', label: 'Flexible' },
]

const LS_KEY = (uid) => `hive_ob_student_${uid}`

function hasDraftData(d) {
  return Object.values(d).some(v => (Array.isArray(v) ? v.length > 0 : !!v))
}

export default function StudentOnboarding() {
  const { completeOnboarding, markOnboardingDone, user, profile, logout } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({})
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [welcomeBack, setWelcomeBack] = useState(false)
  const [newSkillId, setNewSkillId] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate')
  const [newExp, setNewExp] = useState({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
  const [editingExpIndex, setEditingExpIndex] = useState(null)

  const restoredRef = useRef(false)
  const debounceTimer = useRef(null)

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

  const SKILL_LEVEL_COLORS = {
    'Beginner': { bg: '#FEE2E2', color: '#B91C1C' },
    'Intermediate': { bg: '#FEF3C7', color: '#92400E' },
    'Advanced': { bg: '#D1FAE5', color: '#065F46' },
    'Expert': { bg: '#EDE9FE', color: '#5B21B6' },
  }

  const handleAddSkill = () => {
    if (!newSkillId.trim()) return
    const [category, skillName] = newSkillId.split('||')
    if (!skillName || !category) return

    // Check if skill already exists
    const existingSkills = Array.isArray(data.skillsWithLevel) ? data.skillsWithLevel : []
    if (existingSkills.some(s => s.name === skillName)) return

    const updatedSkills = [...existingSkills, { name: skillName, level: newSkillLevel, category }]
    update('skillsWithLevel', updatedSkills)
    setNewSkillId('')
    setNewSkillLevel('Intermediate')
  }

  const handleRemoveSkill = (index) => {
    const skillsWithLevel = Array.isArray(data.skillsWithLevel) ? data.skillsWithLevel : []
    const updated = skillsWithLevel.filter((_, i) => i !== index)
    update('skillsWithLevel', updated)
  }

  const handleSaveExperience = () => {
    const experiences = Array.isArray(data.experiences) ? data.experiences : []
    if (editingExpIndex !== null) {
      const updated = [...experiences]
      updated[editingExpIndex] = newExp
      update('experiences', updated)
      setEditingExpIndex(null)
    } else if (newExp.title || newExp.description) {
      update('experiences', [...experiences, newExp])
    }
    setNewExp({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
  }

  const handleRemoveExperience = (index) => {
    const experiences = Array.isArray(data.experiences) ? data.experiences : []
    const updated = experiences.filter((_, i) => i !== index)
    update('experiences', updated)
  }

  const doSave = useCallback(async (d, s) => {
    if (!user?.id) return
    setSaveStatus('saving')
    const ok = await saveOnboardingDraft(user.id, 'student', d, s)
    try { localStorage.setItem(LS_KEY(user.id), JSON.stringify({ data: d, step: s, ts: Date.now() })) } catch {}
    if (ok) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(st => st === 'saved' ? 'idle' : st), 2500)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(st => st === 'error' ? 'idle' : st), 3000)
    }
  }, [user?.id])

  const saveDraft = useCallback((d, s) => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => doSave(d, s), 750)
  }, [doSave])

  const saveDraftNow = useCallback((d, s) => {
    clearTimeout(debounceTimer.current)
    return doSave(d, s)
  }, [doSave])

  useEffect(() => {
    if (!user?.id) return
    const dbStep = user.onboardingStep ?? 0
    const dbData = studentProfileToData(profile)
    let localStep = dbStep
    let localData = dbData
    try {
      const raw = localStorage.getItem(LS_KEY(user.id))
      if (raw) {
        const backup = JSON.parse(raw)
        if (typeof backup.step === 'number' && backup.step > dbStep) {
          localStep = backup.step
          localData = { ...dbData, ...backup.data }
        }
      }
    } catch {}
    const hasAny = localStep > 0 || hasDraftData(localData)
    if (hasAny) {
      setData(localData)
      setStep(Math.min(localStep, STEPS.length - 1))
      setWelcomeBack(true)
    }
    restoredRef.current = true
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!restoredRef.current) return
    if (!user?.id || !hasDraftData(data)) return
    saveDraft(data, step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => () => clearTimeout(debounceTimer.current), [])

  function update(name, value) {
    setData(d => ({ ...d, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }))
  }

  function validate() {
    const newErrors = {}
    if (step === 0) {
      if (!data.name?.trim()) newErrors.name = 'Please enter your full name.'
      if (!data.country?.trim()) newErrors.country = 'Please select a country.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function next() {
    if (!validate()) return
    if (step < STEPS.length - 1) {
      const nextStep = step + 1
      await saveDraftNow(data, nextStep)
      setStep(nextStep)
    } else {
      setSubmitting(true)
      setSubmitError('')
      try {
        // Parse start date for profile compatibility
        let startImmediately = false
        let startMonth = ''
        let startYear = ''
        let startDate = ''

        if (data.startDate === 'immediate') {
          startImmediately = true
        } else if (data.startDate) {
          startDate = data.startDate
          // Parse date string (YYYY-MM-DD) to month/year
          const [year, month] = data.startDate.split('-')
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
          if (month && year) {
            const monthIndex = parseInt(month) - 1
            if (monthIndex >= 0 && monthIndex < 12) {
              startMonth = monthNames[monthIndex]
              startYear = year
            }
          }
        }

        const skillsWithLevel = Array.isArray(data.skillsWithLevel) ? data.skillsWithLevel : []
        const skillNames = skillsWithLevel.map(s => s.name)

        const profile = {
          name: data.name?.trim() || null,
          field: data.field?.trim() || null,
          university: data.university?.trim() || null,
          country: data.country?.trim() || null,
          city: data.city?.trim() || null,
          graduation_year: data.graduationYear || null,
          bio: data.bio?.trim() || null,
          skills: skillNames,
          skillsWithLevel: skillsWithLevel,
          experiences: Array.isArray(data.experiences) ? data.experiences : [],
          interests: data.causes || [],
          languages: data.languages || [],
          work_mode: data.workMode || null,
          work_preference: data.workMode || null,
          motivation: data.motivation?.trim() || null,
          availability: data.availability || null,
          project_length: data.projectLength || null,
          preferred_roles: data.preferredRoles || null,
          start_date: startDate || null,
          start_immediately: startImmediately,
          start_month: startMonth || null,
          start_year: startYear || null,
          // Camel case versions for profile object
          workMode: data.workMode || null,
          projectLength: data.projectLength || null,
          preferredRoles: data.preferredRoles || null,
          startDate: startDate || null,
          startImmediately: startImmediately,
          startMonth: startMonth || null,
          startYear: startYear || null,
          phone: data.phone?.trim() || null,
          linkedin: data.linkedin?.trim() || null,
          github: data.github?.trim() || null,
          portfolio: data.portfolio?.trim() || null,
          goals: data.goals?.trim() || null,
          links: {
            linkedin: data.linkedin?.trim() || null,
            github: data.github?.trim() || null,
            portfolio: data.portfolio?.trim() || null,
          },
        }
        await completeOnboarding(profile)
        try { localStorage.removeItem(LS_KEY(user.id)) } catch {}
        setDone(true)
      } catch (err) {
        setSubmitError(err.message || 'Something went wrong. Please try again.')
        setSubmitting(false)
      }
    }
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  async function handleExitOnboarding() {
    // Cancel any pending saves immediately
    clearTimeout(debounceTimer.current)

    // Clear save status so no "saved" message shows
    setSaveStatus('idle')

    // Clear localStorage completely
    try { localStorage.removeItem(LS_KEY(user.id)) } catch {}

    // Clear database draft by saving empty data
    if (user?.id) {
      try {
        await saveOnboardingDraft(user.id, 'student', {}, 0)
      } catch {}
    }

    // Clear all local state
    setData({})
    setStep(0)
    setErrors({})
    setDone(false)
    setSubmitting(false)
    setSubmitError('')
    setWelcomeBack(false)
    setNewSkillId('')
    setNewSkillLevel('Intermediate')

    // Log out and navigate away
    await logout()
  }

  // Success screen
  if (done) {
    return (
      <OnboardingLayout showNavigation>
        <div className="flex justify-center items-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E6E8EF] text-center shadow-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-[#FFB400]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#FFB400]/20"
            >
              <CheckCircle2 size={32} className="text-[#FFB400]" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-2xl font-bold text-[#0B163F] mb-2">
              Profile created!
            </h2>
            <p className="text-[#4E6385] text-sm mb-8">
              You're ready to be matched with amazing opportunities that align with your skills and values.
            </p>
            <div className="flex flex-col gap-3">
              <PrimaryButton onClick={() => { markOnboardingDone(); navigate('/dashboard/student') }}>
                Explore opportunities
              </PrimaryButton>
              <SecondaryButton onClick={() => { markOnboardingDone(); navigate('/dashboard/student') }}>
                Go to dashboard
              </SecondaryButton>
            </div>
          </motion.div>
        </div>
      </OnboardingLayout>
    )
  }

  // Step 0: Profile
  if (step === 0) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="Let's start with your profile"
                subtitle="This helps organizations understand who you are and what you're passionate about."
                icon={User}
              >
                {Object.keys(errors).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-[#FFF1F0] border border-[#FFCCC7] text-xs text-[#FF4D4F] font-medium"
                  >
                    Please fill in all required fields
                  </motion.div>
                )}
                <TextInput
                  label="Full name"
                  placeholder="Your first and last name"
                  value={data.name || ''}
                  onChange={(val) => update('name', val)}
                  required
                  error={errors.name}
                />

                <div className="grid grid-cols-2 gap-4">
                  <SearchableSelect
                    label="Country"
                    placeholder="Select your country"
                    value={data.country || ''}
                    onChange={(val) => update('country', val)}
                    required
                    error={errors.country}
                    options={COUNTRIES.map(c => ({ ...c, value: c.name }))}
                    formatOption={(opt) => opt.name}
                    searchFields={['name']}
                  />

                  <TextInput
                    label="City (optional)"
                    placeholder="Your city"
                    value={data.city || ''}
                    onChange={(val) => update('city', val)}
                  />
                </div>

                <TextInput
                  label="University or school"
                  placeholder="Where do you study?"
                  value={data.university || ''}
                  onChange={(val) => update('university', val)}
                />

                <TextInput
                  label="Field of study"
                  placeholder="Your major or field"
                  value={data.field || ''}
                  onChange={(val) => update('field', val)}
                />

                <SelectInput
                  label="Year of study"
                  placeholder="Select your year"
                  value={data.graduationYear || ''}
                  onChange={(val) => update('graduationYear', val)}
                  options={['1st year', '2nd year', '3rd year', '4th year', '5th year', 'Graduate']}
                />

                <TextArea
                  label="Short bio"
                  placeholder="Tell us a bit about yourself. What drives you?"
                  value={data.bio || ''}
                  onChange={(val) => update('bio', val)}
                  rows={3}
                />

                <div className="pt-4 border-t border-[#E6E8EF] flex items-center gap-2 text-xs text-[#4E6385]">
                  <Shield size={16} strokeWidth={1.5} />
                  Your information is secure and used only to improve your experience.
                </div>

                <div className="flex gap-3 pt-6">
                  <PrimaryButton onClick={next}>Continue</PrimaryButton>
                </div>
              </FormCard>
            </div>
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 1: Skills
  if (step === 1) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="What are your skills?"
                subtitle="Tell us what you're good at. These help organizations find the right fit for their projects."
                icon={Sparkles}
              >
                <div className="space-y-4">
                  {/* Display added skills by category */}
                  {Array.isArray(data.skillsWithLevel) && data.skillsWithLevel.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                      <p className="text-xs font-semibold text-[#4E6385] mb-4 uppercase tracking-wider">Selected Skills ({data.skillsWithLevel.length})</p>
                      <div className="space-y-4">
                        {(() => {
                          const skillsByCategory = {}
                          data.skillsWithLevel.forEach(skill => {
                            const category = skill.category || 'Other'
                            if (!skillsByCategory[category]) skillsByCategory[category] = []
                            skillsByCategory[category].push(skill)
                          })
                          return Object.entries(skillsByCategory).map(([cat, skills]) => (
                            <div key={cat}>
                              <p className="text-xs font-semibold text-[#0B163F] mb-2">{cat}</p>
                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill, idx) => {
                                  const levelColors = SKILL_LEVEL_COLORS[skill.level] || SKILL_LEVEL_COLORS['Intermediate']
                                  return (
                                    <div key={`skill-${cat}-${idx}`} className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E6E8EF] hover:border-[#D4D8E0]">
                                      <p className="text-xs font-semibold text-[#0B163F]">{skill.name}</p>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: levelColors.bg, color: levelColors.color }}>
                                        {skill.level}
                                      </span>
                                      <button onClick={() => handleRemoveSkill(data.skillsWithLevel.indexOf(skill))} className="p-0.5 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                        <X size={12} />
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Add skill section */}
                  <div className="p-4 rounded-2xl border-2 border-[#E6E8EF] bg-white space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[#0B163F] block mb-2">Select a skill to add</label>
                      <select value={newSkillId} onChange={e => setNewSkillId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-[14px] text-xs border-2 border-[#E6E8EF] outline-none focus:border-[#0B163F] bg-white text-[#0B163F] appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230B163F' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
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
                      <label className="text-xs font-semibold text-[#0B163F] block mb-2">Your expertise level</label>
                      <select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-[14px] text-xs border-2 border-[#E6E8EF] outline-none focus:border-[#0B163F] bg-white text-[#0B163F] appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230B163F' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Expert</option>
                      </select>
                    </div>

                    <PrimaryButton onClick={handleAddSkill} className="w-full">
                      Add the skill
                    </PrimaryButton>
                  </div>

                  {/* EXPERIENCE SECTION */}
                  <div className="pt-4 border-t border-[#E6E8EF]">
                    <p className="text-xs font-semibold text-[#0B163F] mb-3 uppercase tracking-wider">Work Experience</p>

                    {/* Display added experiences */}
                    {Array.isArray(data.experiences) && data.experiences.length > 0 && (
                      <div className="mb-4 space-y-3">
                        {data.experiences.map((exp, idx) => (
                          <div key={idx} className="group p-3 rounded-lg bg-[#FAF6EA] border border-[#E6E8EF] hover:border-[#D4D8E0]">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-semibold text-[#0B163F]">{exp.title}</p>
                                {exp.organization && <p className="text-[10px] text-[#4E6385]">{exp.organization}</p>}
                                {exp.location && <p className="text-[10px] text-[#4E6385]">{exp.location}</p>}
                              </div>
                              <button
                                onClick={() => handleRemoveExperience(idx)}
                                className="p-0.5 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add experience form */}
                    <div className="p-4 rounded-2xl border-2 border-[#E6E8EF] bg-white space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-[#0B163F] block mb-2">Job title</label>
                        <TextInput
                          placeholder="e.g., Marketing Manager"
                          value={newExp.title || ''}
                          onChange={(val) => setNewExp({...newExp, title: val})}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#0B163F] block mb-2">Organization</label>
                        <TextInput
                          placeholder="e.g., Company name"
                          value={newExp.organization || ''}
                          onChange={(val) => setNewExp({...newExp, organization: val})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-[#0B163F] block mb-2">Start date</label>
                          <input
                            type="date"
                            value={newExp.startDate || ''}
                            onChange={(e) => setNewExp({...newExp, startDate: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg text-xs border border-[#E6E8EF] outline-none focus:border-[#0B163F]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#0B163F] block mb-2">End date</label>
                          <input
                            type="date"
                            value={newExp.endDate || ''}
                            onChange={(e) => setNewExp({...newExp, endDate: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg text-xs border border-[#E6E8EF] outline-none focus:border-[#0B163F]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#0B163F] block mb-2">Location (optional)</label>
                        <TextInput
                          placeholder="e.g., New York, NY"
                          value={newExp.location || ''}
                          onChange={(val) => setNewExp({...newExp, location: val})}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#0B163F] block mb-2">Description (optional)</label>
                        <TextArea
                          placeholder="Describe your role and accomplishments"
                          value={newExp.description || ''}
                          onChange={(val) => setNewExp({...newExp, description: val})}
                          rows={2}
                        />
                      </div>

                      <PrimaryButton onClick={handleSaveExperience} className="w-full">
                        Add experience
                      </PrimaryButton>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <SecondaryButton onClick={back}>Back</SecondaryButton>
                  <PrimaryButton onClick={next}>Continue</PrimaryButton>
                </div>
              </FormCard>
            </div>
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 2: Causes
  if (step === 2) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="What causes matter to you?"
                subtitle="Select the causes and issues you're passionate about helping."
                icon={Heart}
              >
                <ChipSelector
                  label="Select causes you care about"
                  options={CAUSES}
                  value={data.causes || []}
                  onChange={(val) => update('causes', val)}
                  multi={true}
                />

                <TextArea
                  label="Why these causes matter to you"
                  placeholder="Share your motivation. What impact do you want to create?"
                  value={data.motivation || ''}
                  onChange={(val) => update('motivation', val)}
                  rows={3}
                />

                <FormField label="Work preference">
                  <div className="space-y-3">
                    {['Remote', 'In-person', 'Hybrid'].map(opt => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="workMode"
                          value={opt}
                          checked={data.workMode === opt}
                          onChange={(e) => update('workMode', e.target.value)}
                          className="w-4 h-4 accent-[#FFB400]"
                        />
                        <span className="font-medium text-[#0B163F]">{opt}</span>
                      </label>
                    ))}
                  </div>
                </FormField>

                <div className="flex gap-3 pt-6">
                  <SecondaryButton onClick={back}>Back</SecondaryButton>
                  <PrimaryButton onClick={next}>Continue</PrimaryButton>
                </div>
              </FormCard>
            </div>
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 3: Availability
  if (step === 3) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="When can you contribute?"
                subtitle="Help organizations understand your availability and preferences."
                icon={Calendar}
              >
                <SelectInput
                  label="Hours per week"
                  placeholder="How much time can you dedicate?"
                  value={data.availability || ''}
                  onChange={(val) => update('availability', val)}
                  options={AVAILABILITY_OPTIONS}
                />

                <SelectInput
                  label="Preferred project length"
                  placeholder="How long are you willing to commit?"
                  value={data.projectLength || ''}
                  onChange={(val) => update('projectLength', val)}
                  options={[
                    { value: 'short', label: 'Short-term (1-2 weeks)' },
                    { value: 'medium', label: 'Medium-term (1-3 months)' },
                    { value: 'long', label: 'Long-term (3+ months)' },
                    { value: 'flexible', label: 'Flexible' },
                  ]}
                />

                <FormField label="When can you start?">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => update('startDate', 'immediate')}
                      className={`p-4 rounded-[16px] border-2 transition-all font-semibold text-sm flex items-center justify-center gap-2 ${
                        data.startDate === 'immediate'
                          ? 'border-[#0B163F] bg-[#0B163F] text-white'
                          : 'border-[#E6E8EF] bg-white text-[#0B163F] hover:bg-[#FAF6EA]'
                      }`}
                    >
                      <span>Immediately</span>
                    </button>
                    <input
                      type="date"
                      value={data.startDate && data.startDate !== 'immediate' ? data.startDate : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          update('startDate', e.target.value)
                        }
                      }}
                      className={`px-4 py-3 rounded-[16px] border-2 font-medium text-[#0B163F] placeholder-[#9CA3AF] focus:outline-none focus:shadow-sm transition-all ${
                        data.startDate && data.startDate !== 'immediate'
                          ? 'border-[#0B163F] bg-white'
                          : 'border-[#E6E8EF] bg-white focus:border-[#0B163F]'
                      }`}
                      placeholder="Pick a date"
                    />
                  </div>
                </FormField>

                <SelectInput
                  label="Your preferred role"
                  placeholder="Select a preferred role"
                  value={data.preferredRoles || ''}
                  onChange={(val) => update('preferredRoles', val)}
                  options={[
                    { value: 'Designer', label: 'Designer' },
                    { value: 'Data Analyst', label: 'Data Analyst' },
                    { value: 'Marketing Specialist', label: 'Marketing Specialist' },
                    { value: 'Content Writer', label: 'Content Writer' },
                    { value: 'Frontend Developer', label: 'Frontend Developer' },
                    { value: 'Backend Developer', label: 'Backend Developer' },
                    { value: 'Full Stack Developer', label: 'Full Stack Developer' },
                    { value: 'Project Manager', label: 'Project Manager' },
                    { value: 'Business Analyst', label: 'Business Analyst' },
                    { value: 'Social Media Manager', label: 'Social Media Manager' },
                    { value: 'Event Coordinator', label: 'Event Coordinator' },
                    { value: 'Research Analyst', label: 'Research Analyst' },
                    { value: 'Fundraising Specialist', label: 'Fundraising Specialist' },
                  ]}
                />

                <TextInput
                  label="LinkedIn (optional)"
                  placeholder="https://linkedin.com/in/yourname"
                  value={data.linkedin || ''}
                  onChange={(val) => update('linkedin', val)}
                />

                <TextInput
                  label="GitHub (optional)"
                  placeholder="https://github.com/yourprofile"
                  value={data.github || ''}
                  onChange={(val) => update('github', val)}
                />

                <TextInput
                  label="Portfolio (optional)"
                  placeholder="https://yourportfolio.com"
                  value={data.portfolio || ''}
                  onChange={(val) => update('portfolio', val)}
                />

                <div className="flex gap-3 pt-6">
                  <SecondaryButton onClick={back}>Back</SecondaryButton>
                  <PrimaryButton onClick={next}>Continue</PrimaryButton>
                </div>
              </FormCard>
            </div>
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 4: Complete
  if (step === 4) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="You're all set!"
                subtitle="Review your profile and get started finding opportunities."
                icon={Rocket}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                    <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-1">Profile</p>
                    <p className="text-base font-semibold text-[#0B163F]">{data.name || 'Your profile'}</p>
                    {data.field && <p className="text-sm text-[#4E6385]">{data.field} at {data.university || 'your university'}</p>}
                  </div>

                  {data.skills?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                      <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.slice(0, 4).map(s => (
                          <span key={s} className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#0B163F] border border-[#E6E8EF]">
                            {s}
                          </span>
                        ))}
                        {data.skills.length > 4 && (
                          <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#4E6385] border border-[#E6E8EF]">
                            +{data.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {data.causes?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                      <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-2">Causes You Care About</p>
                      <div className="flex flex-wrap gap-2">
                        {data.causes.slice(0, 4).map(c => (
                          <span key={c} className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#0B163F] border border-[#E6E8EF]">
                            {c}
                          </span>
                        ))}
                        {data.causes.length > 4 && (
                          <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#4E6385] border border-[#E6E8EF]">
                            +{data.causes.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-[#E6E8EF]">
                  <p className="text-sm text-[#4E6385]">
                    <strong className="text-[#0B163F]">What happens next?</strong> We'll match you with opportunities that align with your skills, availability, and values. You can browse opportunities, apply to projects, and start making an impact.
                  </p>
                </div>

                <div className="flex gap-3 pt-6">
                  <SecondaryButton onClick={back}>Back</SecondaryButton>
                  <PrimaryButton
                    onClick={next}
                    loading={submitting}
                  >
                    Create profile
                  </PrimaryButton>
                </div>

                {submitError && (
                  <motion.p className="text-sm text-[#FF4D4F] mt-4 p-3 bg-[#FFF1F0] rounded-2xl border border-[#FFCCC7] font-medium">
                    {submitError}
                  </motion.p>
                )}
              </FormCard>
            </div>
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }
}
