import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Target, Zap, CheckCircle2, Rocket, Shield, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { saveOnboardingDraft, ngoProfileToData } from '../services/storage'
import { COUNTRIES } from '../utils/countries'
import OnboardingLayout from '../components/Onboarding/OnboardingLayout'
import Stepper from '../components/Onboarding/Stepper'
import FormCard from '../components/Onboarding/FormCard'
import SearchableSelect from '../components/Onboarding/SearchableSelect'
import { TextInput, SelectInput, TextArea, ChipSelector, FormField } from '../components/Onboarding/FormInputs'
import PhoneInput from '../components/Onboarding/PhoneInput'
import { PrimaryButton, SecondaryButton } from '../components/Onboarding/Buttons'

const STEPS = [
  { id: 'organization', title: 'Organization', number: 1 },
  { id: 'mission', title: 'Mission', number: 2 },
  { id: 'focus', title: 'Focus Areas', number: 3 },
  { id: 'verification', title: 'Verification', number: 4 },
  { id: 'complete', title: 'Complete', number: 5 },
]

const CAUSES = [
  'Education', 'Youth Empowerment', 'Women Empowerment', 'Health',
  'Environment', 'Technology', 'Refugees / Asylum Seekers', 'Community Development',
  'Mental Health', 'Accessibility', 'Poverty Relief', 'Arts & Culture', 'Other'
]

const ORG_SIZES = [
  { value: '1-5', label: '1-5 people' },
  { value: '6-15', label: '6-15 people' },
  { value: '16-50', label: '16-50 people' },
  { value: '51-200', label: '51-200 people' },
  { value: '200+', label: '200+ people' },
]

const LS_KEY = (uid) => `hive_ob_ngo_${uid}`

function hasDraftData(d) {
  return Object.values(d).some(v => (Array.isArray(v) ? v.length > 0 : !!v))
}

export default function NGOOnboarding() {
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

  const [newPreferredSkill, setNewPreferredSkill] = useState('')
  const [newProjectType, setNewProjectType] = useState('')

  const restoredRef = useRef(false)
  const debounceTimer = useRef(null)

  const PREFERRED_SKILLS = [
    'Web Development',
    'Data Analysis',
    'Social Media Management',
    'Grant Writing',
    'Graphic Design',
    'Content Writing',
    'Project Management',
    'Marketing',
    'Video Production',
    'Research',
  ]

  const PROJECT_TYPES = [
    'Website Development',
    'Social Media Campaign',
    'Data Analysis',
    'Research Project',
    'Event Planning',
    'Content Creation',
    'Grant Writing',
    'Graphic Design',
    'Marketing Strategy',
    'Other',
  ]

  const handleAddPreferredSkill = (skill) => {
    const currentSkills = Array.isArray(data.preferredSkills) ? data.preferredSkills : []
    if (!currentSkills.includes(skill)) {
      update('preferredSkills', [...currentSkills, skill])
    }
  }

  const handleRemovePreferredSkill = (skill) => {
    const currentSkills = Array.isArray(data.preferredSkills) ? data.preferredSkills : []
    update('preferredSkills', currentSkills.filter(s => s !== skill))
  }

  const handleAddProjectType = (type) => {
    const currentTypes = Array.isArray(data.projectTypes) ? data.projectTypes : []
    if (!currentTypes.includes(type)) {
      update('projectTypes', [...currentTypes, type])
    }
  }

  const handleRemoveProjectType = (type) => {
    const currentTypes = Array.isArray(data.projectTypes) ? data.projectTypes : []
    update('projectTypes', currentTypes.filter(t => t !== type))
  }

  const doSave = useCallback(async (d, s) => {
    if (!user?.id) return
    setSaveStatus('saving')
    const ok = await saveOnboardingDraft(user.id, 'ngo', d, s)
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
    const dbData = ngoProfileToData(profile)
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
      if (!data.name?.trim()) newErrors.name = 'Please enter your organization name.'
      if (!data.country?.trim()) newErrors.country = 'Please select a country.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function next() {
    if (!validate()) {
      console.log('Validation failed. Errors:', errors)
      return
    }
    if (step < STEPS.length - 1) {
      const nextStep = step + 1
      await saveDraftNow(data, nextStep)
      setStep(nextStep)
    } else {
      setSubmitting(true)
      setSubmitError('')
      try {
        const profile = {
          name: data.name?.trim() || null,
          location: data.city?.trim() || null,
          phone: data.phone?.trim() || null,
          description: data.about?.trim() || null,
          helpNeeded: data.helpNeeded?.trim() || null,
          imageUrl: data.imageUrl?.trim() || null,
          tags: data.causes || [],
          preferred_skills: Array.isArray(data.preferredSkills) ? data.preferredSkills : [],
          project_types: Array.isArray(data.projectTypes) ? data.projectTypes : [],
          website: data.website?.trim() || null,
          instagram: data.instagram?.trim() || null,
          twitter: data.twitter?.trim() || null,
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
        await saveOnboardingDraft(user.id, 'ngo', {}, 0)
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

    // Log out and navigate away
    await logout()
  }

  // Success screen
  if (done) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
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
              Your organization is ready. Now you can post projects and find talented students.
            </p>
            <div className="flex flex-col gap-3">
              <PrimaryButton onClick={() => { markOnboardingDone(); navigate('/dashboard/ngo') }}>
                Go to dashboard
              </PrimaryButton>
              <SecondaryButton onClick={() => { markOnboardingDone(); navigate('/ngo/create-project') }}>
                Post first project
              </SecondaryButton>
            </div>
          </motion.div>
        </div>
      </OnboardingLayout>
    )
  }

  // Step 0: Organization
  if (step === 0) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          {welcomeBack && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl bg-[#FFB400]/10 border border-[#FFB400]/20 text-sm text-[#0B163F] font-medium"
            >
              Welcome back — your progress has been saved.
            </motion.div>
          )}

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="Tell us about your organization"
                subtitle="This helps Hive understand your work and match you with the right opportunities."
                icon={Building2}
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
                  label="Organization name"
                  placeholder="Enter your organization name"
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
                    placeholder="Enter your city"
                    value={data.city || ''}
                    onChange={(val) => update('city', val)}
                  />
                </div>

                <PhoneInput
                  label="Phone number"
                  value={data.phone || ''}
                  onChange={(val) => update('phone', val)}
                  required
                />

                <TextArea
                  label="About your organization"
                  placeholder="Describe your mission, who you serve, and how your organization operates."
                  value={data.about || ''}
                  onChange={(val) => update('about', val)}
                  rows={4}
                />

                <div className="pt-4 border-t border-[#E6E8EF] flex items-center gap-2 text-xs text-[#4E6385]">
                  <Shield size={16} strokeWidth={1.5} />
                  Your information is secure and used only to improve your experience.
                </div>

                <div className="flex gap-3 pt-6">
                  <PrimaryButton
                    onClick={next}
                    loading={submitting}
                  >
                    Continue
                  </PrimaryButton>
                </div>
              </FormCard>
            </div>
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 1: Mission
  if (step === 1) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="Tell us about your mission"
                subtitle="Help us understand the impact you're creating and the communities you serve."
                icon={Target}
              >
                <TextArea
                  label="Mission statement"
                  placeholder="What is your core mission and why does it matter?"
                  value={data.mission || ''}
                  onChange={(val) => update('mission', val)}
                  rows={3}
                />

                <TextArea
                  label="Communities served"
                  placeholder="Who are the communities or populations you primarily serve?"
                  value={data.communities || ''}
                  onChange={(val) => update('communities', val)}
                  rows={3}
                />

                <SelectInput
                  label="Organization size"
                  placeholder="How many people work in your organization?"
                  value={data.orgSize || ''}
                  onChange={(val) => update('orgSize', val)}
                  options={ORG_SIZES}
                />

                <TextArea
                  label="What help do you need?"
                  placeholder="Be specific about the projects, skills, or support you're looking for."
                  value={data.helpNeeded || ''}
                  onChange={(val) => update('helpNeeded', val)}
                  rows={4}
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

  // Step 2: Focus Areas
  if (step === 2) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="What are your focus areas?"
                subtitle="Select the causes and areas your organization impacts."
                icon={Zap}
              >
                <ChipSelector
                  label="Causes you support"
                  options={CAUSES}
                  value={data.causes || []}
                  onChange={(val) => update('causes', val)}
                  multi={true}
                />

                {/* Preferred Student Skills */}
                <div>
                  <label className="text-xs font-semibold text-[#0B163F] block mb-2">Preferred student skills (select one or more)</label>
                  {/* Display selected skills */}
                  {Array.isArray(data.preferredSkills) && data.preferredSkills.length > 0 && (
                    <div className="mb-3 p-3 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                      <div className="flex flex-wrap gap-2">
                        {data.preferredSkills.map((skill, idx) => (
                          <div key={idx} className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E6E8EF] hover:border-[#D4D8E0]">
                            <p className="text-xs font-semibold text-[#0B163F]">{skill}</p>
                            <button onClick={() => handleRemovePreferredSkill(skill)} className="p-0.5 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Dropdown + custom input */}
                  <div className="space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          if (e.target.value === 'other') {
                            setNewPreferredSkill('')
                          } else {
                            handleAddPreferredSkill(e.target.value)
                          }
                          e.target.value = ''
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-[14px] text-xs border-2 border-[#E6E8EF] outline-none focus:border-[#0B163F] bg-white text-[#0B163F] appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230B163F' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                      <option value="">Select a skill...</option>
                      {PREFERRED_SKILLS.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                      <option value="other">Other (type custom)</option>
                    </select>
                    {/* Custom input for "Other" */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type custom skill..."
                        value={newPreferredSkill}
                        onChange={(e) => setNewPreferredSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newPreferredSkill.trim()) {
                            handleAddPreferredSkill(newPreferredSkill.trim())
                            setNewPreferredSkill('')
                          }
                        }}
                        className="flex-1 px-4 py-2.5 rounded-[14px] text-xs border-2 border-[#E6E8EF] outline-none focus:border-[#0B163F] bg-white text-[#0B163F] placeholder-[#9CA3AF]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPreferredSkill.trim()) {
                            handleAddPreferredSkill(newPreferredSkill.trim())
                            setNewPreferredSkill('')
                          }
                        }}
                        className="px-4 py-2.5 rounded-[14px] bg-[#0B163F] text-white font-semibold text-xs hover:shadow-sm transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Project Categories */}
                <div>
                  <label className="text-xs font-semibold text-[#0B163F] block mb-2">Project categories you offer (select one or more)</label>
                  {/* Display selected project types */}
                  {Array.isArray(data.projectTypes) && data.projectTypes.length > 0 && (
                    <div className="mb-3 p-3 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                      <div className="flex flex-wrap gap-2">
                        {data.projectTypes.map((type, idx) => (
                          <div key={idx} className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E6E8EF] hover:border-[#D4D8E0]">
                            <p className="text-xs font-semibold text-[#0B163F]">{type}</p>
                            <button onClick={() => handleRemoveProjectType(type)} className="p-0.5 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Dropdown + custom input */}
                  <div className="space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          if (e.target.value === 'other') {
                            setNewProjectType('')
                          } else {
                            handleAddProjectType(e.target.value)
                          }
                          e.target.value = ''
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-[14px] text-xs border-2 border-[#E6E8EF] outline-none focus:border-[#0B163F] bg-white text-[#0B163F] appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230B163F' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                      <option value="">Select a project type...</option>
                      {PROJECT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                      <option value="other">Other (type custom)</option>
                    </select>
                    {/* Custom input for "Other" */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type custom project type..."
                        value={newProjectType}
                        onChange={(e) => setNewProjectType(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newProjectType.trim()) {
                            handleAddProjectType(newProjectType.trim())
                            setNewProjectType('')
                          }
                        }}
                        className="flex-1 px-4 py-2.5 rounded-[14px] text-xs border-2 border-[#E6E8EF] outline-none focus:border-[#0B163F] bg-white text-[#0B163F] placeholder-[#9CA3AF]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newProjectType.trim()) {
                            handleAddProjectType(newProjectType.trim())
                            setNewProjectType('')
                          }
                        }}
                        className="px-4 py-2.5 rounded-[14px] bg-[#0B163F] text-white font-semibold text-xs hover:shadow-sm transition-all"
                      >
                        Add
                      </button>
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

  // Step 3: Verification
  if (step === 3) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                title="Build trust"
                subtitle="Help students and funders learn more about your organization. All fields are optional."
                icon={CheckCircle2}
              >
                <TextInput
                  label="Website"
                  placeholder="https://yourorganization.org"
                  value={data.website || ''}
                  onChange={(val) => update('website', val)}
                />

                <TextInput
                  label="Registration number (optional)"
                  placeholder="Your official registration or nonprofit ID"
                  value={data.registrationNumber || ''}
                  onChange={(val) => update('registrationNumber', val)}
                />

                <TextInput
                  label="Official email"
                  placeholder="contact@yourorganization.org"
                  value={data.email || ''}
                  onChange={(val) => update('email', val)}
                  type="email"
                />

                <TextInput
                  label="Contact person"
                  placeholder="Name of primary contact"
                  value={data.contactName || ''}
                  onChange={(val) => update('contactName', val)}
                />

                <TextInput
                  label="Role in organization"
                  placeholder="e.g. Executive Director, Founder, Volunteer Coordinator"
                  value={data.contactRole || ''}
                  onChange={(val) => update('contactRole', val)}
                />

                <TextInput
                  label="Instagram (optional)"
                  placeholder="https://instagram.com/yourorg"
                  value={data.instagram || ''}
                  onChange={(val) => update('instagram', val)}
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
                subtitle="Review your profile and get started."
                icon={Rocket}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                    <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-1">Organization</p>
                    <p className="text-base font-semibold text-[#0B163F]">{data.name || 'Your organization'}</p>
                  </div>
                  {data.mission && (
                    <div className="p-4 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                      <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-1">Mission</p>
                      <p className="text-sm text-[#0B163F] line-clamp-2">{data.mission}</p>
                    </div>
                  )}
                  {data.causes?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FAF6EA] border border-[#E6E8EF]">
                      <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-2">Focus Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {data.causes.slice(0, 3).map(c => (
                          <span key={c} className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#0B163F] border border-[#E6E8EF]">
                            {c}
                          </span>
                        ))}
                        {data.causes.length > 3 && (
                          <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#4E6385] border border-[#E6E8EF]">
                            +{data.causes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-[#E6E8EF]">
                  <p className="text-sm text-[#4E6385]">
                    <strong className="text-[#0B163F]">What happens next?</strong> You can now post projects, manage applications, and start collaborating with talented students.
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
