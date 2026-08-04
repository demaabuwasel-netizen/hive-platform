import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Sparkles, Heart, CheckCircle2, Shield, Rocket, Check, GraduationCap, Edit3, Trash2, Plus, BookOpen, Building2, Award } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { COUNTRIES } from '../utils/countries'
import OnboardingLayout from '../components/Onboarding/OnboardingLayout'
import FormCard from '../components/Onboarding/FormCard'
import SkillPicker from '../components/SkillPicker'
import SearchableSelect from '../components/Onboarding/SearchableSelect'
import { TextInput, TextArea, ChipSelector } from '../components/Onboarding/FormInputs'
import { PrimaryButton, SecondaryButton } from '../components/Onboarding/Buttons'

// The stepper only tracks the form steps — the final "Complete" screen is a
// plain review/confirmation screen and isn't counted as a step in it.
const STEPS = [
  { id: 'profile', title: 'Profile' },
  { id: 'skills', title: 'Skills' },
  { id: 'education', title: 'Education' },
  { id: 'causes', title: 'Causes' },
  { id: 'links', title: 'Links' },
]
const COMPLETE_STEP = STEPS.length

const EDUCATION_EMPTY = { field: '', university: '', degreeType: '', description: '', isCurrent: false }

const inputClass = 'w-full rounded-2xl border border-[#DADCE0] bg-white px-3.5 py-3 text-[0.88rem] text-[#202124] placeholder:text-[#9AA0A6] outline-none transition focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/15'
const primaryPillClass = 'inline-flex items-center gap-1.5 rounded-full bg-[#1A73E8] px-4 py-2.5 text-[0.82rem] font-semibold text-white shadow-[0_4px_12px_rgba(26,115,232,0.25)] transition hover:bg-[#1765CC]'
const softPillClass = 'inline-flex items-center gap-1.5 rounded-full border border-[#DADCE0] bg-white px-4 py-2.5 text-[0.82rem] font-semibold text-[#1A73E8] transition hover:bg-[#F5F7FB]'

const CAUSES = [
  'Youth Empowerment', 'Women Empowerment', 'Education', 'Environment',
  'Health', 'Mental Health', 'Refugees', 'Community Development',
  'Technology for Good', 'Human Rights', 'Accessibility', 'Animals', 'Other'
]

const LS_KEY = (uid) => `hive_ob_student_${uid}`

function hasDraftData(d) {
  return Object.values(d).some(v => (Array.isArray(v) ? v.length > 0 : !!v))
}

export default function StudentOnboarding() {
  const { completeOnboarding, markOnboardingDone, user, updateRole, logout } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({})
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [educationDraft, setEducationDraft] = useState(EDUCATION_EMPTY)
  const [editingEducation, setEditingEducation] = useState(false)
  const [editingEducationIndex, setEditingEducationIndex] = useState(null)

  const restoredRef = useRef(false)
  const debounceTimer = useRef(null)

  const handleSaveEducation = () => {
    const hasContent = educationDraft.field || educationDraft.university || educationDraft.degreeType
    if (!hasContent) { setEditingEducation(false); return }
    const existing = Array.isArray(data.educations) ? data.educations : []
    const updated = editingEducationIndex !== null
      ? existing.map((e, i) => i === editingEducationIndex ? educationDraft : e)
      : [...existing, educationDraft]
    update('educations', updated)
    setEducationDraft(EDUCATION_EMPTY)
    setEditingEducationIndex(null)
    setEditingEducation(false)
  }

  const handleDeleteEducation = (index) => {
    const existing = Array.isArray(data.educations) ? data.educations : []
    update('educations', existing.filter((_, i) => i !== index))
  }

  const startEducationEdit = (education = EDUCATION_EMPTY, index = null) => {
    setEducationDraft(education)
    setEditingEducationIndex(index)
    setEditingEducation(true)
  }

  // Progress is kept in this browser only (localStorage) so a refresh doesn't
  // lose it — nothing is written to Supabase until the final "Create profile"
  // step. That way, if someone abandons onboarding partway through, no
  // partial profile is ever created.
  const saveLocal = useCallback((d, s) => {
    if (!user?.id) return
    try { localStorage.setItem(LS_KEY(user.id), JSON.stringify({ data: d, step: s, ts: Date.now() })) } catch {}
  }, [user?.id])

  const saveDraft = useCallback((d, s) => {
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => saveLocal(d, s), 400)
  }, [saveLocal])

  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = localStorage.getItem(LS_KEY(user.id))
      if (raw) {
        const backup = JSON.parse(raw)
        if (backup.data && typeof backup.step === 'number' && hasDraftData(backup.data)) {
          setData(backup.data)
          setStep(Math.min(backup.step, COMPLETE_STEP))
        }
      }
    } catch {}
    restoredRef.current = true
  }, [user?.id])

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
    if (step < COMPLETE_STEP) {
      const nextStep = step + 1
      saveLocal(data, nextStep)
      setStep(nextStep)
    } else {
      setSubmitting(true)
      setSubmitError('')
      try {
        const skillsWithLevel = Array.isArray(data.skillsWithLevel) ? data.skillsWithLevel : []
        const skillNames = skillsWithLevel.map(s => s.name)

        const profile = {
          name: data.name?.trim() || null,
          field: data.field?.trim() || null,
          university: data.university?.trim() || null,
          country: data.country?.trim() || null,
          graduation_year: data.graduationYear || null,
          bio: data.bio?.trim() || null,
          skills: skillNames,
          skillsWithLevel: skillsWithLevel,
          educations: Array.isArray(data.educations) ? data.educations : [],
          interests: data.causes || [],
          languages: data.languages || [],
          motivation: data.motivation?.trim() || null,
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
    // Nothing has been saved to Supabase yet at this point — progress only
    // lives in localStorage — so leaving just means discarding it locally.
    clearTimeout(debounceTimer.current)
    try { localStorage.removeItem(LS_KEY(user.id)) } catch {}

    setData({})
    setStep(0)
    setErrors({})
    setDone(false)
    setSubmitting(false)
    setSubmitError('')

    // Log out and navigate away
    await logout()
  }

  async function handleSwitchRole() {
    // Switching roles discards whatever was filled in for this role and
    // starts the other role's onboarding fresh — nothing was saved yet.
    clearTimeout(debounceTimer.current)
    try { localStorage.removeItem(LS_KEY(user.id)) } catch {}

    setData({})
    setStep(0)
    setErrors({})

    await updateRole('ngo')
    navigate('/onboarding/ngo')
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
            className="w-full max-w-md bg-white rounded-[28px] p-8 border border-[rgba(26,115,232,0.10)] text-center shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-[#E8F0FE] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[rgba(26,115,232,0.20)]"
            >
              <CheckCircle2 size={32} className="text-[#1A73E8]" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-2xl font-bold text-[#202124] mb-2">
              Profile created!
            </h2>
            <p className="text-[#5F6368] text-sm mb-8">
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
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to NGO instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
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

                <TextArea
                  label="Short bio"
                  placeholder="Tell us a bit about yourself. What drives you?"
                  value={data.bio || ''}
                  onChange={(val) => update('bio', val)}
                  rows={3}
                />

                <div className="pt-4 border-t border-[#DADCE0] flex items-center gap-2 text-xs text-[#5F6368]">
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
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to NGO instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
                title="What are your skills?"
                subtitle="Tell us what you're good at. These help organizations find the right fit for their projects."
                icon={Sparkles}
              >
                <div className="space-y-4">
                  {/* Skills */}
                  <div>
                    <label className="text-xs font-semibold text-[#202124] block mb-2">Your skills</label>
                    <SkillPicker
                      value={Array.isArray(data.skillsWithLevel) ? data.skillsWithLevel : []}
                      onChange={(v) => update('skillsWithLevel', v)}
                      placeholder="Search skills… (e.g. Python, Design, Leadership)"
                      withLevel={false}
                      accent="#1A73E8"
                    />
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

  // Step 2: Education
  if (step === 2) {
    const educations = Array.isArray(data.educations) ? data.educations : []
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to NGO instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
                title="Your education"
                subtitle="Add your field of study, school, and degree so organizations understand your background."
                subtitleNoWrap
                icon={GraduationCap}
              >
                <div className="space-y-4">
                  {educations.length > 0 && (
                    <div className="overflow-hidden rounded-[24px] bg-[#F8F9FB] ring-1 ring-[#DADCE0]">
                      {educations.map((education, index) => (
                        <div key={`${education.field}-${index}`} className="flex gap-4 border-b border-[#DADCE0] p-4 last:border-b-0">
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
                                <button type="button" className="rounded-full p-2 text-[#5F6368] transition hover:bg-[#E8F0FE] hover:text-[#1A73E8]" onClick={() => startEducationEdit(education, index)}>
                                  <Edit3 size={14} />
                                </button>
                                <button type="button" className="rounded-full p-2 text-[#C5221F] transition hover:bg-[#FCE8E6]" onClick={() => handleDeleteEducation(index)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            {education.description && <p className="mt-3 text-[0.84rem] leading-6 text-[#5F6368]">{education.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!editingEducation && educations.length === 0 && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => startEducationEdit()}
                        className={softPillClass}
                      >
                        <Plus size={14} />
                        Add your education
                      </button>
                    </div>
                  )}

                  {!editingEducation && educations.length > 0 && (
                    <button type="button" onClick={() => startEducationEdit()} className={softPillClass}>
                      <Plus size={14} />
                      Add another
                    </button>
                  )}

                  {editingEducation && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-[24px] bg-white p-5 border border-[rgba(26,115,232,0.14)] shadow-[0_8px_28px_rgba(26,115,232,0.10)]"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[#9AA0A6]">
                            <BookOpen size={12} /> Field of study
                          </label>
                          <input className={inputClass} value={educationDraft.field} onChange={(e) => setEducationDraft(prev => ({ ...prev, field: e.target.value }))} placeholder="Computer Science" />
                        </div>
                        <div>
                          <label className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[#9AA0A6]">
                            <Building2 size={12} /> University / school
                          </label>
                          <input className={inputClass} value={educationDraft.university} onChange={(e) => setEducationDraft(prev => ({ ...prev, university: e.target.value }))} placeholder="Tel Aviv University" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[#9AA0A6]">
                          <Award size={12} /> Degree type
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Bachelor's", "Master's", 'Certificate', 'Diploma'].map(type => {
                            const selected = educationDraft.degreeType === type
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setEducationDraft(prev => ({ ...prev, degreeType: prev.degreeType === type ? '' : type }))}
                                className={`rounded-full px-3.5 py-2 text-[0.78rem] font-semibold transition ${
                                  selected
                                    ? 'bg-[#1A73E8] text-white shadow-[0_4px_10px_rgba(26,115,232,0.25)]'
                                    : 'border border-[#DADCE0] bg-white text-[#5F6368] hover:border-[#1A73E8] hover:text-[#1A73E8]'
                                }`}
                              >
                                {type}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <label className="mt-4 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[#DADCE0] bg-white px-4 py-2 text-[0.8rem] font-semibold text-[#202124] transition hover:bg-[#F5F7FB]">
                        <input type="checkbox" className="accent-[#1A73E8]" checked={educationDraft.isCurrent || false} onChange={(e) => setEducationDraft(prev => ({ ...prev, isCurrent: e.target.checked }))} />
                        Currently studying
                      </label>

                      <div className="mt-4">
                        <label className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-wide text-[#9AA0A6]">Description (optional)</label>
                        <textarea
                          className={`${inputClass} resize-none`}
                          rows={3}
                          value={educationDraft.description}
                          onChange={(e) => setEducationDraft(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Relevant courses, projects, or achievements"
                        />
                      </div>

                      <div className="mt-5 flex items-center gap-4">
                        <button type="button" onClick={handleSaveEducation} className={primaryPillClass}>
                          <Check size={14} />
                          Save education
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingEducation(false); setEditingEducationIndex(null); setEducationDraft(EDUCATION_EMPTY) }}
                          className="text-[0.82rem] font-semibold text-[#5F6368] transition hover:text-[#202124]"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
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

  // Step 3: Causes
  if (step === 3) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to NGO instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
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

  // Step 4: Links
  if (step === 4) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to NGO instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
                title="Where can organizations learn more?"
                subtitle="Add optional links that help organizations understand your work."
                icon={Shield}
              >
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

  // Step 5: Complete
  if (step === 5) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to NGO instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <FormCard>
                <div className="flex flex-col items-center py-6 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: '#E8F0FE' }}
                  >
                    <Rocket size={34} className="text-[#1A73E8]" strokeWidth={1.5} />
                  </motion.div>

                  <h2 className="text-2xl font-semibold text-[#202124] mb-2">
                    You're all set!
                  </h2>
                  <p className="max-w-sm text-sm leading-relaxed text-[#5F6368]">
                    We'll match you with opportunities that fit your skills and values.
                  </p>

                  <div className="mt-8 flex gap-3">
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
                </div>
              </FormCard>
            </div>
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }
}
