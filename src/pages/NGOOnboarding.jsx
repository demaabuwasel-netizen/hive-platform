import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Users, Zap, BarChart3 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { saveOnboardingDraft, ngoProfileToData } from '../services/storage'
import OnboardingLayout from '../components/Onboarding/OnboardingLayout'
import Stepper from '../components/Onboarding/Stepper'
import FormCard from '../components/Onboarding/FormCard'
import SidePanel from '../components/Onboarding/SidePanel'
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
  const { completeOnboarding, markOnboardingDone, user, profile } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({})
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [welcomeBack, setWelcomeBack] = useState(false)

  const restoredRef = useRef(false)
  const debounceTimer = useRef(null)

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
    if (!validate()) return
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

  // Success screen
  if (done) {
    return (
      <OnboardingLayout showLogo>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-2xl p-8 border border-[#E6E8EF] text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-[#FFB400]/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-3xl">✓</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-[#0B163F] mb-2">
              Organization profile created!
            </h2>
            <p className="text-[#4E6385] mb-8 max-w-md mx-auto">
              Your profile is ready. Now you can start posting projects and finding talented students.
            </p>
            <div className="flex gap-3 justify-center">
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
      <OnboardingLayout showLogo>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          {welcomeBack && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl bg-[#FFB400]/10 border border-[#FFB400]/30 text-sm text-[#0B163F]"
            >
              👋 Welcome back — your progress has been saved.
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormCard
                title="Tell us about your organization"
                subtitle="This helps Hive understand your work and match you with the right people."
              >
                <TextInput
                  label="Organization name"
                  placeholder="Enter your organization name"
                  value={data.name || ''}
                  onChange={(val) => update('name', val)}
                  required
                  error={errors.name}
                />

                <SelectInput
                  label="Country"
                  placeholder="Select your country"
                  value={data.country || ''}
                  onChange={(val) => update('country', val)}
                  required
                  error={errors.country}
                  options={['Israel', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia', 'Other']}
                />

                <TextInput
                  label="City"
                  placeholder="Enter your city"
                  value={data.city || ''}
                  onChange={(val) => update('city', val)}
                />

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
                  helper="0 / 500"
                />

                <div className="pt-6 border-t border-[#E6E8EF] flex items-center gap-2 text-xs text-[#4E6385]">
                  <Shield size={16} />
                  Your information is secure and used only to improve your experience.
                </div>

                <div className="flex gap-3 pt-6">
                  <PrimaryButton
                    onClick={next}
                    loading={submitting}
                  >
                    Continue
                  </PrimaryButton>
                  <SecondaryButton onClick={() => saveDraftNow(data, step)}>
                    Save draft
                  </SecondaryButton>
                </div>

                {saveStatus !== 'idle' && (
                  <motion.p
                    className="text-xs mt-2"
                    style={{
                      color: saveStatus === 'saved' ? '#059669' : saveStatus === 'error' ? '#FF4D4F' : '#6B7280',
                    }}
                  >
                    {saveStatus === 'saving' && 'Saving…'}
                    {saveStatus === 'saved' && '✓ Saved'}
                    {saveStatus === 'error' && 'Could not save — progress is safe locally'}
                  </motion.p>
                )}
              </FormCard>
            </div>

            <SidePanel
              title="Why this matters"
              subtitle="A complete profile helps us match you with the right people."
              trustPoints={[
                { icon: '👥', title: 'Better visibility', description: 'Get discovered by funders and volunteers.' },
                { icon: '🎯', title: 'Better matches', description: 'We\'ll connect you with the right students.' },
                { icon: '📊', title: 'Easier tracking', description: 'Measure and share your impact.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 1: Mission
  if (step === 1) {
    return (
      <OnboardingLayout showLogo>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormCard
                title="Tell us about your mission"
                subtitle="Help us understand the impact you're creating and the communities you serve."
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
                  <SecondaryButton onClick={back}>← Back</SecondaryButton>
                  <PrimaryButton onClick={next}>Continue</PrimaryButton>
                </div>
              </FormCard>
            </div>

            <SidePanel
              title="Pro tip"
              subtitle="Be specific and authentic about what you need."
              trustPoints={[
                { icon: '✨', title: 'Specificity helps', description: 'Detailed project descriptions attract better fits.' },
                { icon: '🤝', title: 'Build relationships', description: 'Share your story to inspire volunteers.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 2: Focus Areas
  if (step === 2) {
    return (
      <OnboardingLayout showLogo>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormCard
                title="What are your focus areas?"
                subtitle="Select the causes and areas your organization impacts."
              >
                <ChipSelector
                  label="Causes you support"
                  options={CAUSES}
                  value={data.causes || []}
                  onChange={(val) => update('causes', val)}
                  multi={true}
                />

                <TextArea
                  label="Preferred student skills"
                  placeholder="What specific skills do you value in volunteers? (e.g., web development, social media, data analysis, grant writing)"
                  value={data.skills || ''}
                  onChange={(val) => update('skills', val)}
                  rows={3}
                />

                <TextArea
                  label="Project categories you offer"
                  placeholder="What types of projects do you typically have? (e.g., social media management, website development, research, event planning)"
                  value={data.projectTypes || ''}
                  onChange={(val) => update('projectTypes', val)}
                  rows={3}
                />

                <div className="flex gap-3 pt-6">
                  <SecondaryButton onClick={back}>← Back</SecondaryButton>
                  <PrimaryButton onClick={next}>Continue</PrimaryButton>
                </div>
              </FormCard>
            </div>

            <SidePanel
              title="Set yourself up for success"
              subtitle="Clear focus areas help students find the right fit."
              trustPoints={[
                { icon: '🎯', title: 'Better matches', description: 'Students will find projects that align with their values.' },
                { icon: '⚡', title: 'Quick impact', description: 'Clear goals help volunteers contribute faster.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 3: Verification
  if (step === 3) {
    return (
      <OnboardingLayout showLogo>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormCard
                title="Build trust"
                subtitle="Help students and funders learn more about your organization. All fields are optional."
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
                  <SecondaryButton onClick={back}>← Back</SecondaryButton>
                  <PrimaryButton onClick={next}>Continue</PrimaryButton>
                </div>
              </FormCard>
            </div>

            <SidePanel
              title="Trust matters"
              subtitle="Transparent organizations attract better collaborations."
              trustPoints={[
                { icon: '🔐', title: 'Security', description: 'Your data is protected and verified.' },
                { icon: '✓', title: 'Credibility', description: 'Verified organizations get better matches.' },
                { icon: '📱', title: 'Connection', description: 'Easy for students to reach out.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 4: Complete
  if (step === 4) {
    return (
      <OnboardingLayout showLogo>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormCard
                title="You're all set!"
                subtitle="Review your profile and get started."
              >
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAF6EA] rounded-lg border border-[#E6E8EF]">
                    <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-1">Organization</p>
                    <p className="text-base font-semibold text-[#0B163F]">{data.name || 'Your organization'}</p>
                  </div>
                  {data.mission && (
                    <div className="p-4 bg-[#FAF6EA] rounded-lg border border-[#E6E8EF]">
                      <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-1">Mission</p>
                      <p className="text-sm text-[#0B163F]">{data.mission}</p>
                    </div>
                  )}
                  {data.causes?.length > 0 && (
                    <div className="p-4 bg-[#FAF6EA] rounded-lg border border-[#E6E8EF]">
                      <p className="text-xs font-semibold text-[#4E6385] uppercase tracking-wider mb-2">Focus Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {data.causes.map(c => (
                          <span key={c} className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#0B163F] border border-[#E6E8EF]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-[#E6E8EF]">
                  <p className="text-sm text-[#4E6385] mb-4">
                    <strong>What happens next?</strong> You can now post projects, manage applications, and start collaborating with talented students.
                  </p>
                </div>

                <div className="flex gap-3 pt-6">
                  <SecondaryButton onClick={back}>← Back</SecondaryButton>
                  <PrimaryButton
                    onClick={next}
                    loading={submitting}
                  >
                    Create profile
                  </PrimaryButton>
                </div>

                {submitError && (
                  <motion.p className="text-sm text-[#FF4D4F] mt-4 p-3 bg-[#FFF1F0] rounded-lg border border-[#FFCCC7]">
                    {submitError}
                  </motion.p>
                )}
              </FormCard>
            </div>

            <SidePanel
              title="Ready to make impact"
              subtitle="Your profile is complete. Start building."
              trustPoints={[
                { icon: '🚀', title: 'Launch projects', description: 'Post your first opportunity now.' },
                { icon: '🤝', title: 'Find talent', description: 'Connect with passionate students.' },
                { icon: '📈', title: 'Grow together', description: 'Build long-term partnerships.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }
}
