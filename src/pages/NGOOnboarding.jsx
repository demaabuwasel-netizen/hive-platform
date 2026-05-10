import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import ProgressBar from '../components/ProgressBar'
import { AvatarPicker } from '../components/Avatar'
import HiveLogo from '../components/HiveLogo'
import img3 from '../assets/img3.png'  // woman w/ laptop — success context

const STEPS = [
  {
    id: 'about',
    emoji: '🌍',
    title: 'Tell us about your organization',
    subtitle: 'Describe who you are, what you do, and the communities you serve. Write naturally — this is your voice.',
    fields: [
      { name: 'name', label: 'Organization name', placeholder: 'e.g. Elem, Majd, Leket Israel, Beit Issie Shapiro, Sikkuy…', type: 'input', required: true },
      { name: 'location', label: 'Location', placeholder: 'e.g. Tel Aviv, Haifa, Nazareth, Jerusalem, Beer-Sheva, Jaffa…', type: 'input' },
      { name: 'phone', label: 'Phone number', placeholder: 'e.g. +972 50 123 4567', type: 'tel' },
      { name: 'description', label: 'About your organization', placeholder: 'Describe your mission, the communities you serve (e.g. Arab youth, asylum seekers, Bedouin villages, mixed cities), and how you operate…', type: 'textarea', rows: 4 },
    ],
  },
  {
    id: 'help',
    emoji: '🤝',
    title: 'What kind of help do you need?',
    subtitle: 'Be as specific as you can. "We need a website where parents can register their children" is more useful than "web development".',
    fields: [
      { name: 'helpNeeded', label: "Describe the help or skills you're looking for", placeholder: 'e.g. We need someone to revamp our social media in Arabic and Hebrew, or build a registration page for our youth program in Nazareth, or help us visualize our impact data for funders…', type: 'textarea', rows: 5 },
    ],
  },
  {
    id: 'image',
    emoji: '🖼️',
    title: 'Add a profile image',
    subtitle: 'A logo or photo makes your profile more trustworthy. You can skip this for now.',
    fields: [
      { name: 'imageUrl', label: 'Image URL (or leave blank to use a placeholder)', placeholder: 'https://your-image.com/logo.png', type: 'input' },
    ],
  },
  {
    id: 'links',
    emoji: '🔗',
    title: 'Online presence (optional)',
    subtitle: 'Website and social links help students learn more about your work before applying.',
    fields: [
      { name: 'website', label: 'Website', placeholder: 'https://yourorg.org', type: 'input' },
      { name: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourorg', type: 'input' },
      { name: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/yourorg', type: 'input' },
    ],
  },
]

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

function validatePhone(phone) {
  if (!phone || !phone.trim()) return null
  const digits = phone.replace(/[\s\-().+]/g, '')
  if (!/^\d{7,15}$/.test(digits)) return 'Please enter a valid phone number (digits, spaces, +, - allowed)'
  return null
}

function generateSummary(data) {
  const name = data.name || 'Your organization'
  const location = data.location ? ` based in ${data.location}` : ''
  const help = data.helpNeeded
    ? ` Currently seeking help with: ${data.helpNeeded.slice(0, 120)}${data.helpNeeded.length > 120 ? '…' : ''}`
    : ''
  return `${name}${location} — ${data.description?.slice(0, 140) || 'a mission-driven organization'}${data.description?.length > 140 ? '…' : ''}${help}`
}

export default function NGOOnboarding() {
  const { completeOnboarding } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({})
  const [direction, setDirection] = useState(1)
  const [showAISummary, setShowAISummary] = useState(false)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const current = STEPS[step]

  function update(name, value) {
    setData(d => ({ ...d, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }))
  }

  function validate() {
    const newErrors = {}
    current.fields.forEach(field => {
      if (field.required && !data[field.name]?.trim()) {
        newErrors[field.name] = 'This field is required.'
      }
      if (field.type === 'tel') {
        const phoneErr = validatePhone(data[field.name])
        if (phoneErr) newErrors[field.name] = phoneErr
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function next() {
    if (!validate()) return
    if (step === 1 && !showAISummary) {
      setShowAISummary(true)
      return
    }
    setShowAISummary(false)
    setDirection(1)
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      const profile = {
        ...data,
        summary: generateSummary(data),
        links: { website: data.website, instagram: data.instagram, twitter: data.twitter },
        tags: [],
      }
      completeOnboarding(profile)
      setDone(true)
    }
  }

  function back() {
    if (showAISummary) { setShowAISummary(false); return }
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
      setErrors({})
    }
  }

  const progressStep = showAISummary ? 2 : step + 1
  const progressTotal = STEPS.length + 1

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
              src={img3}
              alt="Your NGO is ready to connect with students"
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
              NGO profile created! 🌱
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-[#4B6382] text-sm mb-8 max-w-xs mx-auto leading-relaxed"
            >
              Students with matching skills will now be able to find your organization.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.35 }}
              onClick={() => navigate('/dashboard/ngo')}
              className="btn-navy text-base px-8 py-3.5"
            >
              View my profile →
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
          <ProgressBar
            current={progressStep}
            total={progressTotal}
            label="Setting up your NGO profile"
          />
        </div>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {showAISummary ? (
            <motion.div
              key="ai-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="card mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-navy-100 rounded-xl flex items-center justify-center">
                  <span className="text-navy-600">✦</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D183D]">AI Profile Summary</p>
                  <p className="text-xs text-navy-400">Organized from your description — not rewritten</p>
                </div>
              </div>

              <div className="bg-cream-50 border border-cream-300 rounded-2xl p-4 mb-4">
                <p className="text-navy-700 text-sm leading-relaxed italic">
                  "{generateSummary(data)}"
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">ℹ</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                  This summary is derived directly from what you wrote. We don't add claims or embellish — NGOs are trusted as-is.
                </p>
              </div>
            </motion.div>
          ) : (
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

              {/* Image step: replace text input with full AvatarPicker */}
              {current.id === 'image' ? (
                <AvatarPicker
                  value={data.imageUrl || ''}
                  onChange={val => update('imageUrl', val)}
                  name={data.name || ''}
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {current.fields.map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-honey-500 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
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
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center">
          <button
            onClick={back}
            disabled={step === 0 && !showAISummary}
            className="btn-secondary text-sm py-2.5 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button onClick={next} className="btn-navy text-sm py-2.5 px-6">
            {step === STEPS.length - 1 && !showAISummary
              ? 'Create profile →'
              : showAISummary
              ? 'Looks good, continue →'
              : 'Continue →'}
          </button>
        </div>

        <p className="text-center text-xs text-navy-400 mt-4">
          {showAISummary
            ? 'Review the summary above before continuing'
            : `Step ${step + 1} of ${STEPS.length} — you can always update this later`}
        </p>
      </div>
    </div>
  )
}
