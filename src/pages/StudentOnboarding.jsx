import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import ProgressBar from '../components/ProgressBar'
import TagInput from '../components/TagInput'
import SkillPicker from '../components/SkillPicker'
import AutocompleteInput from '../components/AutocompleteInput'
import TopicPicker from '../components/TopicPicker'

const CAUSES = [
  'Education', 'Youth Empowerment', 'Arab-Jewish Coexistence',
  'Mental Health', 'Environment', 'Climate Action',
  'Community Building', 'Women Empowerment', 'Accessibility',
  'Public Health', 'Food Security', 'Refugee Support',
  'Elderly Support', 'Digital Literacy', 'Social Equality',
  'Human Rights', 'Animal Welfare', 'Arts and Culture',
  'Technology for Good', 'Economic Opportunity',
  'Civic Engagement', 'Minority Rights', 'Housing',
  'Child Welfare', 'Violence Prevention', 'Immigration',
]

const FIELDS_OF_STUDY = [
  'Computer Science', 'Software Engineering', 'Information Systems',
  'Data Science', 'Artificial Intelligence', 'Cybersecurity',
  'Electrical Engineering', 'Mechanical Engineering', 'Industrial Engineering',
  'Business Administration', 'Economics', 'Accounting & Finance',
  'Marketing', 'Management', 'Entrepreneurship',
  'Psychology', 'Social Work', 'Sociology', 'Political Science',
  'Communication', 'Journalism', 'Media Studies',
  'Graphic Design', 'UX / UI Design', 'Architecture',
  'Education', 'Special Education', 'Curriculum & Teaching',
  'Public Health', 'Nursing', 'Medicine', 'Pharmacy',
  'Law', 'Criminology', 'International Relations',
  'Statistics', 'Applied Mathematics', 'Physics',
  'Environmental Science', 'Life Sciences', 'Biology',
]

const UNIVERSITIES = [
  'Hebrew University of Jerusalem',
  'Tel Aviv University',
  'Ben-Gurion University of the Negev',
  'University of Haifa',
  'Technion – Israel Institute of Technology',
  'Bar-Ilan University',
  'Weizmann Institute of Science',
  'Reichman University (IDC Herzliya)',
  'Open University of Israel',
  'Sapir College',
  'Hadassah Academic College',
  'Bezalel Academy of Arts and Design',
  'Shenkar – Engineering, Design, Art',
  'HIT – Holon Institute of Technology',
  'Ruppin Academic Center',
  'Ono Academic College',
  'Jerusalem College of Technology',
  'Tel Hai Academic College',
  'WIZO Haifa Academy',
  'Netanya Academic College',
]
import { AvatarPicker } from '../components/Avatar'
import HiveLogo from '../components/HiveLogo'
import img2 from '../assets/img2.png'  // student w/ phone — success context

const STEPS = [
  {
    id: 'field',
    emoji: '📚',
    title: 'What are you studying?',
    subtitle: 'Your field and university help NGOs understand your academic background.',
    fields: [
      { name: 'field', label: 'Field of study', placeholder: 'e.g. Computer Science, Psychology, Graphic Design…', type: 'autocomplete', options: FIELDS_OF_STUDY, required: true },
      { name: 'university', label: 'University / Institution', placeholder: 'e.g. Tel Aviv University, Technion…', type: 'autocomplete', options: UNIVERSITIES },
    ],
  },
  {
    id: 'skills',
    emoji: '🛠️',
    title: 'What are your skills and interests?',
    subtitle: 'Type each one and press Enter or comma. "Figma", "Python", "grant writing" tells more than "tech stuff".',
    fields: [
      { name: 'skills', label: 'Skills', type: 'skills' },
      { name: 'courses', label: 'Relevant courses', placeholder: 'e.g. Data Ethics, UX Design, Nonprofit Communications…', type: 'tags' },
      { name: 'interests', label: 'Topics or causes you care about', type: 'topics', options: CAUSES },
    ],
  },
  {
    id: 'experience',
    emoji: '💼',
    title: 'Tell us about your experience',
    subtitle: 'This can include class projects, personal work, part-time jobs, or volunteer work. Be honest — NGOs appreciate authenticity.',
    fields: [
      { name: 'experience', label: 'Previous experience or projects', placeholder: "e.g. Redesigned a community center website in Haifa. Ran social media for a student org at the University of Haifa. Helped a women's NGO in Beer-Sheva with data collection…", type: 'textarea', rows: 4 },
    ],
  },
  {
    id: 'goals',
    emoji: '🎯',
    title: 'What are your goals?',
    subtitle: 'What kind of work are you hoping to do? What impact do you want to have?',
    fields: [
      { name: 'goals', label: 'Career goals and motivations', placeholder: 'e.g. "I want to help Arab and Jewish NGOs improve their digital presence and reach more people…" or "I want to use data to support health organizations serving underrepresented communities…"', type: 'textarea', rows: 3 },
    ],
  },
  {
    id: 'languages',
    emoji: '🌐',
    title: 'What languages do you speak?',
    subtitle: 'NGOs in Israel often need bilingual or multilingual volunteers. Add as many as you like — this is optional.',
    fields: [
      { name: 'languages', type: 'languages' },
    ],
  },
  {
    id: 'links',
    emoji: '🔗',
    title: 'Any links to share? (optional)',
    subtitle: 'A GitHub, LinkedIn, or portfolio helps NGOs verify your work. All fields below are optional.',
    fields: [
      { name: 'phone', label: 'Phone number', placeholder: 'e.g. +972 50 123 4567', type: 'tel' },
      { name: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourname', type: 'input' },
      { name: 'github', label: 'GitHub URL', placeholder: 'https://github.com/yourhandle', type: 'input' },
      { name: 'portfolio', label: 'Portfolio or website', placeholder: 'https://yoursite.com', type: 'input' },
    ],
  },
]

function validatePhone(phone) {
  if (!phone || !phone.trim()) return null
  const digits = phone.replace(/[\s\-().+]/g, '')
  if (!/^\d{7,15}$/.test(digits)) return 'Please enter a valid phone number (digits, spaces, +, - allowed)'
  return null
}

// ─── Language picker ──────────────────────────────────────────────────────────
const LANGUAGE_OPTIONS = ['Hebrew', 'Arabic', 'English', 'Russian', 'French', 'Spanish', 'German', 'Other']
const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Intermediate', 'Basic']
const LEVEL_COLORS = { Native: '#0D183D', Fluent: '#059669', Intermediate: '#D99E00', Basic: '#6366F1' }

function LanguagePicker({ value = [], onChange }) {
  const [pending, setPending] = useState(null)
  const added = value.map(l => l.lang)

  function handleLangClick(lang) {
    if (added.includes(lang)) {
      onChange(value.filter(l => l.lang !== lang))
      if (pending === lang) setPending(null)
    } else {
      setPending(lang)
    }
  }

  function confirmLevel(level) {
    onChange([...value, { lang: pending, level }])
    setPending(null)
  }

  return (
    <div>
      {/* Language chips */}
      <p className="text-[12px] font-semibold text-[#4B6382] mb-2.5">Select languages you speak:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {LANGUAGE_OPTIONS.map(lang => {
          const isAdded = added.includes(lang)
          const isPending = pending === lang
          return (
            <button key={lang} type="button"
              onClick={() => handleLangClick(lang)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150 active:scale-[0.97] ${
                isAdded
                  ? 'text-white'
                  : isPending
                  ? 'text-white'
                  : 'bg-white text-[#4B6382] hover:border-[#FFB703] hover:text-[#0D183D]'
              }`}
              style={
                isAdded ? { background: '#0D183D', border: '1.5px solid #0D183D' } :
                isPending ? { background: '#FFB703', border: '1.5px solid #FFB703' } :
                { border: '1.5px solid rgba(13,24,61,0.13)' }
              }>
              {lang}
            </button>
          )
        })}
      </div>

      {/* Proficiency selector for pending language */}
      <AnimatePresence>
        {pending && (
          <motion.div
            key={pending}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 overflow-hidden">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,183,3,0.06)', border: '1.5px solid rgba(255,183,3,0.22)' }}>
              <p className="text-[12px] font-bold text-[#0D183D] mb-3">
                Your proficiency in <strong>{pending}</strong>:
              </p>
              <div className="flex flex-wrap gap-2">
                {PROFICIENCY_LEVELS.map(level => (
                  <button key={level} type="button"
                    onClick={() => confirmLevel(level)}
                    className="px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150 hover:scale-[1.03] active:scale-95"
                    style={{ background: 'white', borderColor: 'rgba(13,24,61,0.12)', color: '#0D183D' }}
                    onMouseEnter={e => { e.currentTarget.style.background = LEVEL_COLORS[level]; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = LEVEL_COLORS[level] }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0D183D'; e.currentTarget.style.borderColor = 'rgba(13,24,61,0.12)' }}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected languages display */}
      {value.length > 0 && (
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">
            Your languages
          </p>
          <div className="flex flex-wrap gap-2">
            {value.map(({ lang, level }) => (
              <motion.span
                key={lang}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full text-[12px] font-semibold text-white"
                style={{ background: LEVEL_COLORS[level] || '#0D183D' }}>
                <span>{lang}</span>
                <span className="opacity-50">·</span>
                <span className="opacity-80 text-[11px]">{level}</span>
                <button type="button"
                  onClick={() => onChange(value.filter(l => l.lang !== lang))}
                  className="w-5 h-5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-white/20 transition-all ml-0.5"
                  aria-label={`Remove ${lang}`}>
                  ×
                </button>
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {value.length === 0 && !pending && (
        <p className="text-[12px] text-[#4B6382]/60 italic">No languages added yet — you can skip this step.</p>
      )}
    </div>
  )
}

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export default function StudentOnboarding() {
  const { completeOnboarding, markOnboardingDone, user } = useApp()
  const navigate = useNavigate()
  const [step, setStep]         = useState(0)
  const [data, setData]         = useState({})
  const [direction, setDirection] = useState(1)
  const [errors, setErrors]     = useState({})
  const [done, setDone]         = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const current = STEPS[step]

  function update(name, value) {
    setData(d => ({ ...d, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }))
  }

  function validate() {
    const newErrors = {}
    current.fields.forEach(field => {
      if (field.required) {
        const val = data[field.name]
        const empty = !val || (Array.isArray(val) && val.length === 0) || (typeof val === 'string' && !val.trim())
        if (empty) newErrors[field.name] = 'This field is required.'
      }
      if (field.type === 'tel') {
        const phoneErr = validatePhone(data[field.name])
        if (phoneErr) newErrors[field.name] = phoneErr
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function next() {
    if (!validate()) return
    setDirection(1)
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      setSubmitting(true)
      setSubmitError('')
      try {
        const skills    = Array.isArray(data.skills)    ? data.skills    : []
        const courses   = Array.isArray(data.courses)   ? data.courses   : (data.courses?.split(',').map(s => s.trim()).filter(Boolean) || [])
        const interests = Array.isArray(data.interests) ? data.interests : (data.interests?.split(',').map(s => s.trim()).filter(Boolean) || [])
        const skillNames = skills.map(s => s.name).filter(Boolean)
        const profile = {
          ...data,
          skills,
          courses,
          interests,
          // optional link fields — keep as null if empty so DB stores NULL not ''
          phone:     data.phone?.trim()     || null,
          linkedin:  data.linkedin?.trim()  || null,
          github:    data.github?.trim()    || null,
          portfolio: data.portfolio?.trim() || null,
          links: {
            linkedin:  data.linkedin?.trim()  || null,
            github:    data.github?.trim()    || null,
            portfolio: data.portfolio?.trim() || null,
          },
          summary: `${data.field} student passionate about ${interests.join(', ') || 'social impact'}. Experienced in ${skillNames.join(', ') || 'various areas'}. ${data.goals || ''}`.trim(),
        }

        // 30-second safety net — long enough for a Supabase cold start.
        // completeOnboarding now throws with the real step-specific error message,
        // so the catch block below will show it before this timeout fires in most cases.
        let realError = null
        const timeout = new Promise((_, reject) =>
          setTimeout(() => {
            const msg = realError
              ? `Timed out — last error: ${realError}`
              : 'Request timed out — the server is taking too long. Check the browser console for details (look for [onboarding] logs).'
            reject(new Error(msg))
          }, 30000)
        )
        await Promise.race([
          completeOnboarding(profile).catch(err => { realError = err.message; throw err }),
          timeout,
        ])
        setDone(true)
      } catch (err) {
        setSubmitError(err.message || 'Something went wrong. Please try again.')
        setSubmitting(false)
      }
    }
  }

  function back() {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
      setErrors({})
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#FFF7E6] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="card text-center py-8 px-8">
            <motion.img
              src={img2}
              alt="You're ready to make an impact"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-48 mx-auto mb-4 object-contain"
              draggable={false}
            />
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-2xl font-bold text-[#0D183D] mb-2"
            >
              Profile created! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-[#4B6382] text-sm mb-8 max-w-xs mx-auto leading-relaxed"
            >
              You're ready to be matched with NGOs that need exactly your skills and values.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.35 }}
              onClick={() => { markOnboardingDone(); navigate('/dashboard/student') }}
              className="btn-honey text-base px-8 py-3.5"
            >
              Go to my dashboard →
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF7E6] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <HiveLogo size={24} nameSize="text-base" className="mb-6" />
          <ProgressBar current={step + 1} total={STEPS.length} label="Setting up your profile" />
        </div>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="card mb-6"
          >
            <div className="text-4xl mb-4">{current.emoji}</div>
            <h2 className="text-xl font-bold text-[#0D183D] mb-1">{current.title}</h2>
            <p className="text-[#4B6382] text-sm mb-6 leading-relaxed">{current.subtitle}</p>

            {/* Photo upload — only on first step, above the form fields */}
            {step === 0 && (
              <div className="mb-6 pb-6" style={{ borderBottom: '1px solid rgba(13,24,61,0.08)' }}>
                <AvatarPicker
                  value={data.avatar || ''}
                  onChange={val => update('avatar', val)}
                  name={user?.name || ''}
                />
              </div>
            )}

            <div className="flex flex-col gap-4">
              {current.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-honey-500 ml-1">*</span>}
                  </label>
                  {field.type === 'languages' ? (
                    <LanguagePicker
                      value={data.languages || []}
                      onChange={val => update('languages', val)}
                    />
                  ) : field.type === 'autocomplete' ? (
                    <AutocompleteInput
                      value={data[field.name] || ''}
                      onChange={val => update(field.name, val)}
                      options={field.options || []}
                      placeholder={field.placeholder}
                      error={!!errors[field.name]}
                    />
                  ) : field.type === 'skills' ? (
                    <SkillPicker
                      value={data.skills || []}
                      onChange={val => update('skills', val)}
                    />
                  ) : field.type === 'topics' ? (
                    <TopicPicker
                      value={data[field.name] || []}
                      onChange={val => update(field.name, val)}
                      options={field.options || []}
                    />
                  ) : field.type === 'tags' ? (
                    <TagInput
                      value={data[field.name] || []}
                      onChange={val => update(field.name, val)}
                      placeholder={field.placeholder}
                      color={field.color}
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={field.rows || 3}
                      value={data[field.name] || ''}
                      onChange={e => update(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="textarea-field"
                    />
                  ) : (
                    <input
                      type={field.type === 'tel' ? 'tel' : 'text'}
                      inputMode={field.type === 'tel' ? 'tel' : undefined}
                      autoComplete={field.type === 'tel' ? 'tel' : undefined}
                      value={data[field.name] || ''}
                      onChange={e => update(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={`input-field ${errors[field.name] ? 'ring-2 ring-red-300 border-red-300' : ''}`}
                    />
                  )}
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1.5">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2"
          >
            {submitError}
          </motion.p>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={back}
            disabled={step === 0 || submitting}
            className="btn-secondary text-sm py-2.5 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={next}
            disabled={submitting}
            className="btn-honey text-sm py-2.5 px-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                />
                Saving…
              </span>
            ) : step === STEPS.length - 1 ? 'Create my profile →' : 'Continue →'}
          </button>
        </div>

        <p className="text-center text-xs text-navy-400 mt-4">
          Step {step + 1} of {STEPS.length} — you can always edit your profile later
        </p>
      </div>
    </div>
  )
}
