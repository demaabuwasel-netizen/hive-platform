import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Target, Zap, Sparkles, CheckCircle2, Rocket, Shield, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { COUNTRIES } from '../utils/countries'
import OnboardingLayout from '../components/Onboarding/OnboardingLayout'
import FormCard from '../components/Onboarding/FormCard'
import SkillPicker from '../components/SkillPicker'
import SearchableSelect from '../components/Onboarding/SearchableSelect'
import { TextInput, SelectInput, TextArea, ChipSelector, FormField } from '../components/Onboarding/FormInputs'
import { PrimaryButton, SecondaryButton } from '../components/Onboarding/Buttons'

// The stepper only tracks the form steps — the final "Complete" screen is a
// plain review/confirmation screen and isn't counted as a step in it.
const STEPS = [
  { id: 'organization', title: 'Organization' },
  { id: 'mission', title: 'Mission' },
  { id: 'focus', title: 'Focus Areas' },
  { id: 'skills', title: 'Skills & Projects' },
  { id: 'verification', title: 'Verification' },
]
const COMPLETE_STEP = STEPS.length

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
  const { completeOnboarding, markOnboardingDone, user, updateRole, logout } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({})
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
    if (step < COMPLETE_STEP) {
      const nextStep = step + 1
      saveLocal(data, nextStep)
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
          mission: data.mission?.trim() || null,
          communities: data.communities?.trim() || null,
          orgSize: data.orgSize || null,
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

    await updateRole('student')
    navigate('/onboarding/student')
  }

  // Success screen
  if (done) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to Student instead">
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
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to Student instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
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

                <SelectInput
                  label="Organization size"
                  placeholder="How many people work in your organization?"
                  value={data.orgSize || ''}
                  onChange={(val) => update('orgSize', val)}
                  options={ORG_SIZES}
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
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to Student instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
                title="Tell us about your mission"
                subtitle="Help us understand the impact you're creating and the communities you serve."
                icon={Target}
              >
                <TextArea
                  label="About your organization"
                  placeholder="Describe your mission, who you serve, and how your organization operates."
                  value={data.about || ''}
                  onChange={(val) => update('about', val)}
                  rows={3}
                />

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
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to Student instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
                title="What are your focus areas?"
                subtitle="Select the causes and areas your organization impacts."
                icon={Zap}
              >
                <TextArea
                  label="What help do you need?"
                  placeholder="Be specific about the projects, skills, or support you're looking for."
                  value={data.helpNeeded || ''}
                  onChange={(val) => update('helpNeeded', val)}
                  rows={4}
                />

                <ChipSelector
                  label="Causes you support"
                  options={CAUSES}
                  value={data.causes || []}
                  onChange={(val) => update('causes', val)}
                  multi={true}
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

  // Step 3: Skills & Projects
  if (step === 3) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to Student instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
                title="What skills and projects are you looking for?"
                subtitle="Tell us what kind of student support and project work you're hoping to find."
                icon={Sparkles}
              >
                <div>
                  <label className="text-xs font-semibold text-[#202124] block mb-2">Preferred student skills</label>
                  <SkillPicker
                    value={(Array.isArray(data.preferredSkills) ? data.preferredSkills : []).map(s => ({ name: s, level: '' }))}
                    onChange={(v) => update('preferredSkills', v.map(s => s.name))}
                    placeholder="Search skills… (e.g. Web Development, Grant Writing)"
                    withLevel={false}
                    accent="#1A73E8"
                    extraSkills={PREFERRED_SKILLS}
                  />
                </div>

                {/* Project Categories */}
                <div>
                  <label className="text-xs font-semibold text-[#202124] block mb-2">Project categories you offer</label>
                  {Array.isArray(data.projectTypes) && data.projectTypes.length > 0 && (
                    <div className="mb-3 p-3 rounded-2xl bg-[#F8F9FB] border border-[#DADCE0]">
                      <div className="flex flex-wrap gap-2">
                        {data.projectTypes.map((type, idx) => (
                          <div key={idx} className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#DADCE0] hover:border-[#D4D8E0]">
                            <p className="text-xs font-semibold text-[#202124]">{type}</p>
                            <button onClick={() => handleRemoveProjectType(type)} className="p-0.5 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      className="w-full px-4 py-2.5 rounded-2xl text-xs border-2 border-[#DADCE0] outline-none focus:border-[#1A73E8] bg-white text-[#202124] appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239CA3AF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                      <option value="">Select a project type...</option>
                      {PROJECT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                      <option value="other">Other (type custom)</option>
                    </select>
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
                        className="flex-1 px-4 py-2.5 rounded-2xl text-xs border-2 border-[#DADCE0] outline-none focus:border-[#1A73E8] bg-white text-[#202124] placeholder-[#9CA3AF]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newProjectType.trim()) {
                            handleAddProjectType(newProjectType.trim())
                            setNewProjectType('')
                          }
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-[#1A73E8] text-white font-semibold text-xs hover:bg-[#1765CC] transition-all"
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

  // Step 4: Verification
  if (step === 4) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to Student instead">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <FormCard
                steps={STEPS}
                currentStep={step}
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

  // Step 5: Complete
  if (step === 5) {
    return (
      <OnboardingLayout showNavigation onExitOnboarding={handleExitOnboarding} onSwitchRole={handleSwitchRole} switchRoleLabel="Switch to Student instead">
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
                    You'll be able to post projects and start matching with students right away.
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
