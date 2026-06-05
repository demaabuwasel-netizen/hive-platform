import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Sparkles, Heart, Calendar, CheckCircle2, Eye, Target, TrendingUp, Shield, Rocket } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { saveOnboardingDraft, studentProfileToData } from '../services/storage'
import OnboardingLayout from '../components/Onboarding/OnboardingLayout'
import Stepper from '../components/Onboarding/Stepper'
import FormCard from '../components/Onboarding/FormCard'
import SidePanel from '../components/Onboarding/SidePanel'
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
        const profile = {
          name: data.name?.trim() || null,
          field: data.field?.trim() || null,
          university: data.university?.trim() || null,
          skills: data.skills || [],
          interests: data.causes || [],
          languages: data.languages || [],
          availability: data.availability || null,
          phone: data.phone?.trim() || null,
          linkedin: data.linkedin?.trim() || null,
          github: data.github?.trim() || null,
          portfolio: data.portfolio?.trim() || null,
          bio: data.bio?.trim() || null,
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
      <OnboardingLayout showNavigation>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormCard
                title="Let's start with your profile"
                subtitle="This helps organizations understand who you are and what you're passionate about."
                icon={User}
              >
                <TextInput
                  label="Full name"
                  placeholder="Your first and last name"
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
                  label="City (optional)"
                  placeholder="Your city"
                  value={data.city || ''}
                  onChange={(val) => update('city', val)}
                />

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
                  <SecondaryButton onClick={() => saveDraftNow(data, step)}>
                    Save draft
                  </SecondaryButton>
                </div>

                {saveStatus !== 'idle' && (
                  <motion.p
                    className="text-xs font-medium mt-2"
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
              title="Start here"
              subtitle="A complete profile helps us match you with the right opportunities."
              trustPoints={[
                { icon: Target, title: 'Better matches', description: 'Find opportunities that fit your goals.' },
                { icon: TrendingUp, title: 'Show your potential', description: 'Organizations see your strengths.' },
                { icon: Rocket, title: 'Get discovered', description: 'Build opportunities together.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 1: Skills
  if (step === 1) {
    return (
      <OnboardingLayout showNavigation>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormCard
                title="What are your skills?"
                subtitle="Tell us what you're good at. These help organizations find the right fit for their projects."
                icon={Sparkles}
              >
                <ChipSelector
                  label="Select skill categories"
                  options={SKILL_CATEGORIES}
                  value={data.skills || []}
                  onChange={(val) => update('skills', val)}
                  multi={true}
                />

                <TextArea
                  label="Other skills or interests"
                  placeholder="Add any custom skills not listed above. (e.g., 'Video editing', 'Grant writing', 'Budget management')"
                  value={data.otherSkills || ''}
                  onChange={(val) => update('otherSkills', val)}
                  rows={3}
                />

                <TextArea
                  label="Tell us about your experience"
                  placeholder="Share any relevant projects, work, or volunteer experience. Be specific about what you've accomplished."
                  value={data.goals || ''}
                  onChange={(val) => update('goals', val)}
                  rows={3}
                  helper="This helps organizations understand what you can contribute."
                />

                <div className="flex gap-3 pt-6">
                  <SecondaryButton onClick={back}>Back</SecondaryButton>
                  <PrimaryButton onClick={next}>Continue</PrimaryButton>
                </div>
              </FormCard>
            </div>

            <SidePanel
              title="Show what you can do"
              subtitle="Your skills are what organizations are looking for."
              trustPoints={[
                { icon: Sparkles, title: 'Specificity matters', description: 'Detailed skills attract better matches.' },
                { icon: TrendingUp, title: 'Be honest', description: 'Organizations appreciate authentic profiles.' },
                { icon: Target, title: 'Grow together', description: 'Learn new skills through real projects.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 2: Causes
  if (step === 2) {
    return (
      <OnboardingLayout showNavigation>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
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

            <SidePanel
              title="Make the impact you want"
              subtitle="Aligned values create better collaborations."
              trustPoints={[
                { icon: Heart, title: 'Purpose-driven', description: 'Work on causes you believe in.' },
                { icon: Sparkles, title: 'Find allies', description: 'Connect with like-minded people.' },
                { icon: TrendingUp, title: 'Real change', description: 'Contribute to meaningful projects.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }

  // Step 3: Availability
  if (step === 3) {
    return (
      <OnboardingLayout showNavigation>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
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
                  <input
                    type="date"
                    value={data.startDate || ''}
                    onChange={(e) => update('startDate', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-[16px] border-2 border-[#E6E8EF] bg-white font-medium text-[#0B163F] focus:outline-none focus:border-[#0B163F] focus:shadow-sm transition-all"
                  />
                </FormField>

                <TextArea
                  label="Types of projects you're interested in"
                  placeholder="What kind of work excites you? (e.g., website redesign, social media strategy, data analysis, research, event planning)"
                  value={data.projectInterests || ''}
                  onChange={(val) => update('projectInterests', val)}
                  rows={3}
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

            <SidePanel
              title="Set your expectations"
              subtitle="Clear availability helps both you and organizations."
              trustPoints={[
                { icon: Calendar, title: 'Right fit', description: 'Match projects to your schedule.' },
                { icon: Target, title: 'Clear expectations', description: 'Everyone knows what to expect.' },
                { icon: Sparkles, title: 'Sustainable impact', description: 'Work at a pace that suits you.' },
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
      <OnboardingLayout showNavigation>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Stepper steps={STEPS} currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
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

            <SidePanel
              title="Ready to make a difference"
              subtitle="Your profile is ready. Find opportunities now."
              trustPoints={[
                { icon: Eye, title: 'Discover projects', description: 'Browse opportunities that match you.' },
                { icon: Target, title: 'Apply now', description: 'Find the right fit for your goals.' },
                { icon: Rocket, title: 'Start contributing', description: 'Make real impact from day one.' },
              ]}
            />
          </div>
        </motion.div>
      </OnboardingLayout>
    )
  }
}
