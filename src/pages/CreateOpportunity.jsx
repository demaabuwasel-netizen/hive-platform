import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createOpportunity, updateOpportunity, fetchOpportunity, saveDraftOpportunity } from '../services/opportunities'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, X, Check, CheckCircle2,
  Briefcase, MapPin, Globe, Clock, Sparkles, Save, Loader2, AlertCircle,
  Wand2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import SkillPicker from '../components/SkillPicker'

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Technology', 'Education', 'Healthcare', 'Environment',
  'Youth Services', 'Accessibility', 'Arts & Culture',
  'Legal Aid', 'Research', 'Community Development',
  'Mental Health', 'Administrative Support', 'Other',
]

const LANGUAGE_OPTIONS = [
  'Hebrew', 'Arabic', 'English', 'Russian',
  'French', 'Spanish', 'German', 'Amharic',
]

const HOURS_OPTIONS = [
  '1–5 hrs/week', '5–10 hrs/week', '10–15 hrs/week',
  '15–20 hrs/week', '20+ hrs/week',
]

const DURATION_OPTIONS = [
  '1 month', '2–3 months', '3–6 months', '6–12 months', 'Ongoing',
]

const WORK_MODES = [
  { id: 'remote', icon: Globe,     label: 'Remote',  desc: 'Work from anywhere'            },
  { id: 'hybrid', icon: MapPin,    label: 'Hybrid',  desc: 'Remote + on-site mix'          },
  { id: 'onsite', icon: Briefcase, label: 'On-site', desc: 'In person at your location'    },
]

const STEPS = [
  { n: 1, label: 'Role basics'  },
  { n: 2, label: 'Description'  },
  { n: 3, label: 'Requirements' },
  { n: 4, label: 'Logistics'    },
  { n: 5, label: 'Review'       },
]

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldLabel({ children, optional }) {
  return (
    <p className="text-[13px] font-semibold mb-2" style={{ color: '#202124' }}>
      {children}
      {optional
        ? <span className="ml-1.5 text-[11px] font-normal" style={{ color: '#5F6368' }}>(optional)</span>
        : <span className="ml-0.5" style={{ color: '#1A73E8' }}>*</span>
      }
    </p>
  )
}

function ErrMsg({ msg }) {
  if (!msg) return null
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="text-[11px] font-medium mt-1.5" style={{ color: '#EF4444' }}>
      {msg}
    </motion.p>
  )
}

function InputEl({ value, onChange, placeholder, type = 'text', focused, onFocus, onBlur, ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all placeholder-[#9AA0A6]"
      style={{ background: 'white', color: '#202124',
        border: `1.5px solid ${focused ? '#1A73E8' : 'rgba(26,115,232,0.12)'}` }}
      {...rest}
    />
  )
}

function TextareaEl({ value, onChange, placeholder, rows = 4, focused, onFocus, onBlur }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all resize-none placeholder-[#9AA0A6]"
      style={{ background: 'white', color: '#202124', lineHeight: 1.65,
        border: `1.5px solid ${focused ? '#1A73E8' : 'rgba(26,115,232,0.12)'}` }}
    />
  )
}

function inferCategory(text) {
  const lower = text.toLowerCase()
  if (/(web|app|data|dashboard|software|developer|tech|ai|automation)/.test(lower)) return 'Technology'
  if (/(teach|school|student|curriculum|education|mentor)/.test(lower)) return 'Education'
  if (/(health|clinic|medical|mental|wellness)/.test(lower)) return 'Healthcare'
  if (/(environment|climate|sustainability|recycle|green)/.test(lower)) return 'Environment'
  if (/(youth|children|teen|young)/.test(lower)) return 'Youth Services'
  if (/(accessibility|disability|assistive)/.test(lower)) return 'Accessibility'
  if (/(legal|rights|policy)/.test(lower)) return 'Legal Aid'
  if (/(research|survey|analysis)/.test(lower)) return 'Research'
  return 'Community Development'
}

function inferSkills(text) {
  const lower = text.toLowerCase()
  const skills = []
  const add = (name) => skills.push({ name, level: '' })

  if (/(web|website|frontend|react|developer|app)/.test(lower)) add('Web Development')
  if (/(data|dashboard|analytics|analysis)/.test(lower)) add('Data Analysis')
  if (/(design|ux|ui|brand|visual)/.test(lower)) add('Design')
  if (/(social|instagram|content|marketing)/.test(lower)) add('Social Media')
  if (/(write|copy|blog|newsletter|content)/.test(lower)) add('Writing')
  if (/(research|survey|interview)/.test(lower)) add('Research')
  if (/(fundraising|donor|grant)/.test(lower)) add('Fundraising')
  if (/(mentor|teach|workshop|training)/.test(lower)) add('Mentoring')
  if (!skills.length) {
    add('Communication')
    add('Project Management')
  }
  return skills.slice(0, 4)
}

function buildAiDraft(prompt, profile, user) {
  const text = prompt.trim()
  const category = inferCategory(text)
  const title =
    text.match(/(?:need|looking for|hire|find|want)\s+(?:a|an)?\s*([^,.]+)/i)?.[1]?.trim()
    || text.split(/[,.]/)[0]?.trim()
    || 'Volunteer Specialist'

  const cleanTitle = title
    .replace(/^(someone to|student to|volunteer to)\s+/i, '')
    .replace(/\s+/g, ' ')
    .slice(0, 72)

  const lower = text.toLowerCase()
  const workMode = lower.includes('remote') ? 'remote' : lower.includes('onsite') || lower.includes('in person') ? 'onsite' : 'hybrid'
  const weeklyHours = lower.includes('20') ? '20+ hrs/week' : lower.includes('15') ? '15–20 hrs/week' : lower.includes('10') ? '10–15 hrs/week' : '5–10 hrs/week'

  return {
    title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
    orgName: profile?.name || user?.name || '',
    category,
    field: category,
    description: `We are looking for a motivated student volunteer to help with ${text}. This role is ideal for someone who is organized, curious, and excited to turn ideas into practical work that supports our team.`,
    missionImpact: `This work will help ${profile?.name || 'our organization'} move faster, serve the community more effectively, and create clearer systems for the people we support.`,
    skills: inferSkills(text),
    languages: [],
    weeklyHours,
    duration: lower.includes('ongoing') ? 'Ongoing' : '2–3 months',
    location: profile?.location || '',
    workMode,
    deadline: '',
  }
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slide = {
  enter:  dir => ({ x: dir * 36, opacity: 0   }),
  center:       ({ x: 0,         opacity: 1   }),
  exit:   dir => ({ x: dir * -36, opacity: 0  }),
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateOpportunity() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const isEdit = !!editId

  const [step, setStep]           = useState(1)
  const [dir, setDir]             = useState(1)
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const [draftSaved, setDraftSaved]   = useState(false)   // brief "Saved ✓" flash
  const [draftError, setDraftError]   = useState(null)    // null or the real error string
  const [lastSavedAt, setLastSavedAt] = useState(null)    // Date of last successful save
  const [focusedField, setFocused] = useState(null)
  const [errors, setErrors]       = useState({})
  const [loadingEdit, setLoadingEdit] = useState(!!editId)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiDrafting, setAiDrafting] = useState(false)
  const [canScroll, setCanScroll] = useState(false)

  // Track the ID of a draft that was created mid-session (so repeated saves update it)
  const draftIdRef    = useRef(editId || null)
  const autoSaveRef   = useRef(null)
  const hasUserEdited = useRef(false)
  const scrollRef     = useRef(null)

  const [form, setForm] = useState({
    title: '', orgName: profile?.name || user?.name || '',
    category: '', categoryChoice: '', field: '', description: '', missionImpact: '',
    skills: [], languages: [], weeklyHours: '', duration: '',
    location: profile?.location || '', workMode: '', deadline: '',
  })

  // Fetch existing opportunity when editing
  useEffect(() => {
    if (!editId) return
    fetchOpportunity(editId).then(opp => {
      if (!opp) { setLoadingEdit(false); return }
      setForm({
        title:         opp.title         || '',
        orgName:       opp.orgName       || profile?.name || user?.name || '',
        category:      opp.category      || '',
        categoryChoice:CATEGORIES.includes(opp.category) ? opp.category : (opp.category ? 'Other' : ''),
        field:         opp.field         || '',
        description:   opp.description   || '',
        missionImpact: opp.missionImpact || '',
        skills:        (opp.skills || []).map(s => typeof s === 'string' ? { name: s, level: '' } : { name: s?.name || '', level: '' }).filter(s => s.name),
        languages:     opp.languages     || [],
        weeklyHours:   opp.weeklyHours   || '',
        duration:      opp.duration      || '',
        location:      opp.location      || profile?.location || '',
        workMode:      opp.workMode      || '',
        deadline:      opp.deadline      || '',
      })
      setLoadingEdit(false)
      draftIdRef.current = editId
    }).catch(() => setLoadingEdit(false))
  }, [editId]) // eslint-disable-line

  // Autosave: debounce 2 s after any form change, only after user has actually edited
  useEffect(() => {
    if (!hasUserEdited.current || !user?.id || !form.title.trim()) return
    clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => saveDraft(), 2000)
    return () => clearTimeout(autoSaveRef.current)
  }, [form]) // eslint-disable-line

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => setCanScroll(el.scrollHeight > el.clientHeight + 8)
    const raf = requestAnimationFrame(update)
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
    }
  }, [step, form, aiOpen])

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
            className="text-3xl mb-3">✏️</motion.div>
          <p className="text-[13px] text-[#5F6368]">Loading opportunity…</p>
        </div>
      </div>
    )
  }

  // Focus helpers
  const fo = key => ({
    focused:  focusedField === key,
    onFocus: () => setFocused(key),
    onBlur:  () => setFocused(null),
  })

  function set(key, val) {
    hasUserEdited.current = true
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function chooseCategory(choice) {
    hasUserEdited.current = true
    setForm(current => ({
      ...current,
      categoryChoice: choice,
      category: choice === 'Other' ? '' : choice,
    }))
    setErrors(e => ({ ...e, category: undefined }))
  }

  function applyAiDraft() {
    if (!aiPrompt.trim()) return
    setAiDrafting(true)
    window.setTimeout(() => {
      const draft = buildAiDraft(aiPrompt, profile, user)
      hasUserEdited.current = true
      setForm(current => ({
        ...current,
        ...draft,
        orgName: current.orgName || draft.orgName,
        location: current.location || draft.location,
      }))
      setErrors({})
      setAiDrafting(false)
    }, 650)
  }

  function toggleLang(lang) {
    hasUserEdited.current = true
    set('languages', form.languages.includes(lang)
      ? form.languages.filter(l => l !== lang)
      : [...form.languages, lang])
  }

  // Per-step validation
  function validate() {
    const e = {}
    if (step === 1) {
      if (!form.title.trim())   e.title    = 'Role title is required'
      if (!form.category.trim()) e.category = form.categoryChoice === 'Other'
        ? 'Type a category name'
        : 'Select a category'
    } else if (step === 2) {
      if (!form.description.trim())   e.description   = 'Role description is required'
      if (!form.missionImpact.trim()) e.missionImpact = 'Describe the impact of this role'
    } else if (step === 3) {
      if (!form.skills.length)  e.skills     = 'Add at least one required skill'
    } else if (step === 4) {
      if (!form.location.trim()) e.location = 'Location is required'
      if (!form.workMode)        e.workMode  = 'Select a work mode'
      if (!form.weeklyHours)     e.weeklyHours = 'Select weekly commitment'
      if (!form.duration)        e.duration    = 'Select a duration'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  function next() {
    if (!validate()) return
    setDir(1)
    setStep(s => s + 1)
  }
  function back() {
    setDir(-1)
    setStep(s => Math.max(1, s - 1))
  }

  async function saveDraft() {
    if (!user?.id || draftSaving) return
    setDraftSaving(true); setDraftSaved(false); setDraftError(null)
    try {
      const savedId = await saveDraftOpportunity(user.id, form, draftIdRef.current)
      draftIdRef.current = savedId
      setLastSavedAt(new Date())
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 3000)
    } catch (err) {
      console.error('[saveDraft]', err.message)
      setDraftError(err.message)
      setTimeout(() => setDraftError(null), 8000)
    } finally {
      setDraftSaving(false)
    }
  }

  async function publish() {
    if (!validate()) return
    if (!user?.id) return
    setPublishing(true)
    try {
      const targetId = draftIdRef.current
      if (targetId) {
        await updateOpportunity(targetId, user.id, form, 'active')
      } else {
        await createOpportunity(user.id, form, 'active')
      }
      setPublished(true)
      // Navigate to opportunities list so the new card is immediately visible
      setTimeout(() => navigate('/opportunities'), 2500)
    } catch (err) {
      console.error('Publish error:', err)
      setPublishing(false)
    }
  }

  function resetForm() {
    setForm({
      title: '', orgName: profile?.name || user?.name || '',
      category: '', categoryChoice: '', field: '', description: '', missionImpact: '',
      skills: [], languages: [], weeklyHours: '', duration: '',
      location: profile?.location || '', workMode: '', deadline: '',
    })
    setStep(1)
    setErrors({})
    setPublished(false)
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (published) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F8FAFD]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="w-full max-w-md">

          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.12 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle2 size={40} className="text-emerald-500" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              <h1 className="text-[1.7rem] font-extrabold mb-2" style={{ color: '#202124' }}>
                {isEdit ? 'Changes saved!' : 'Opportunity published!'}
              </h1>
              <p className="text-[0.95rem] font-semibold mb-1" style={{ color: '#5F6368' }}>
                "{form.title}"
              </p>
              <p className="text-[13px]" style={{ color: '#5F6368' }}>
                {form.orgName}
                {form.category ? ` · ${form.category}` : ''}
                {form.location ? ` · ${form.location}` : ''}
              </p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            className="bg-white rounded-3xl p-6 border mb-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { v: form.skills.length || '—',                 l: 'Skills listed'  },
                { v: form.weeklyHours?.split('–')[0] || '—',    l: 'Hrs / week'     },
                { v: form.duration || '—',                      l: 'Duration'       },
              ].map(({ v, l }) => (
                <div key={l} className="rounded-2xl p-4 text-center border" style={{ background: '#F8FAFD', borderColor: 'rgba(26,115,232,0.10)' }}>
                  <p className="text-[17px] font-extrabold leading-none mb-1" style={{ color: '#202124' }}>{v}</p>
                  <p className="text-[10px]" style={{ color: '#5F6368' }}>{l}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4 border" style={{ background: 'rgba(26,115,232,0.04)', borderColor: 'rgba(26,115,232,0.18)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} style={{ color: '#1A73E8' }} />
                <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: '#1A73E8' }}>
                  What happens next
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  'Hive AI is scanning student profiles for strong matches',
                  'Matched students will see your opportunity in their feed',
                  'Applications will appear in your Applicants dashboard',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: '#5F6368' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#1A73E8' }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            className="flex gap-3">
            <button onClick={resetForm}
              className="flex-1 py-3 rounded-2xl text-[13px] font-semibold border transition-all hover:bg-[rgba(26,115,232,0.04)]"
              style={{ color: '#202124', borderColor: 'rgba(26,115,232,0.12)' }}>
              Post another
            </button>
            <button onClick={() => navigate('/opportunities')}
              className="flex-1 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#202124', boxShadow: '0 4px 16px rgba(32,33,36,0.18)' }}>
              View opportunities →
            </button>
          </motion.div>

        </motion.div>
      </div>
    )
  }

  // ── Multi-step form ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col">

      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 bg-white"
        style={{ borderBottom: '1px solid rgba(26,115,232,0.10)' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-5">

          <button onClick={() => navigate('/opportunities')}
            className="flex items-center gap-1 text-[13px] font-medium transition-colors shrink-0 hover:text-[#202124]"
            style={{ color: '#5F6368' }}>
            <ChevronLeft size={15} /> Back
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(26,115,232,0.10)' }}>
              <motion.div className="h-full rounded-full" style={{ background: '#1A73E8' }}
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }} />
            </div>
            <span className="text-[11px] font-semibold shrink-0" style={{ color: '#5F6368' }}>
              {step} of 5
            </span>
          </div>

          {lastSavedAt && (
            <span className="shrink-0 text-[11px] font-medium" style={{ color: '#9BAAC0' }}>
              Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Step pills */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {STEPS.map(({ n, label }) => (
                <div key={n} className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                    style={
                      n < step  ? { background: 'rgba(52,168,83,0.12)', color: '#188038' } :
                      n === step ? { background: '#1A73E8',             color: 'white'   } :
                                  { background: 'rgba(26,115,232,0.08)', color: '#5F6368' }
                    }>
                    {n < step ? <Check size={11} /> : <span className="w-3.5 text-center">{n}</span>}
                    {label}
                  </div>
                  {n < 5 && <div className="w-5 h-px shrink-0" style={{ background: 'rgba(26,115,232,0.12)' }} />}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-0 flex-col items-center transition-all duration-300 ease-out">
          <div className={`w-full max-w-[760px] min-h-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            aiOpen ? 'lg:-translate-x-24' : ''
          }`}>

          {/* Animated form card */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step}
              custom={dir}
              variants={slide}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="bg-white rounded-3xl border flex min-h-0 flex-col overflow-hidden"
              style={{
                borderColor: 'rgba(26,115,232,0.10)',
                boxShadow: '0 2px 20px rgba(26,115,232,0.05)',
                minHeight: 'min(760px, calc(100vh - 210px))',
              }}>
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto p-8 pr-6"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#C8D6EA transparent',
                }}>

              {/* ── Step 1: Role basics ── */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#202124' }}>Role basics</h2>
                    <p className="text-[13px]" style={{ color: '#5F6368' }}>What role are you looking to fill?</p>
                  </div>

                  <div>
                    <FieldLabel>Role title</FieldLabel>
                    <InputEl value={form.title} onChange={e => set('title', e.target.value)}
                      placeholder="e.g. Web Developer, Data Analyst, Content Strategist"
                      {...fo('title')} />
                    <ErrMsg msg={errors.title} />
                  </div>

                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(c => (
                        <button key={c} type="button"
                          onClick={() => chooseCategory(c)}
                          className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all border"
                          style={(form.categoryChoice === c || (c !== 'Other' && form.category === c))
                            ? { background: '#202124', color: 'white',   borderColor: '#202124' }
                            : { background: 'white',   color: '#5F6368', borderColor: 'rgba(26,115,232,0.12)' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <ErrMsg msg={errors.category} />
                  </div>

                  {form.categoryChoice === 'Other' && (
                    <div>
                      <FieldLabel>Type your category</FieldLabel>
                      <InputEl value={form.category} onChange={e => set('category', e.target.value)}
                        placeholder="e.g. Refugee Support, Water Access, Music Education"
                        {...fo('category')} />
                      <ErrMsg msg={errors.category} />
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 2: Description ── */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#202124' }}>Description</h2>
                    <p className="text-[13px]" style={{ color: '#5F6368' }}>Help students understand the role and its purpose.</p>
                  </div>

                  <div>
                    <FieldLabel>Role description</FieldLabel>
                    <p className="text-[11px] mb-2" style={{ color: '#5F6368' }}>
                      What will the volunteer actually do day-to-day?
                    </p>
                    <TextareaEl value={form.description} onChange={e => set('description', e.target.value)}
                      placeholder="Describe key responsibilities, deliverables, and what a typical week looks like in this role…"
                      rows={5} {...fo('description')} />
                    <ErrMsg msg={errors.description} />
                  </div>

                  <div>
                    <FieldLabel>Mission &amp; impact</FieldLabel>
                    <p className="text-[11px] mb-2" style={{ color: '#5F6368' }}>
                      What real-world difference will this work create?
                    </p>
                    <TextareaEl value={form.missionImpact} onChange={e => set('missionImpact', e.target.value)}
                      placeholder="e.g. Your work will directly reach 300+ at-risk youth in Tel Aviv. The platform you build will help our coordinators serve twice as many families…"
                      rows={4} {...fo('missionImpact')} />
                    <ErrMsg msg={errors.missionImpact} />
                  </div>
                </div>
              )}

              {/* ── Step 3: Requirements ── */}
              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#202124' }}>Requirements</h2>
                    <p className="text-[13px]" style={{ color: '#5F6368' }}>What skills and commitment does this role need?</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <FieldLabel>Required skills</FieldLabel>
                    <p className="text-[11px] mb-2" style={{ color: '#5F6368' }}>
                      Search for a skill and add it to the role.
                    </p>
                    <SkillPicker
                      value={form.skills}
                      onChange={v => set('skills', v)}
                      withLevel={false}
                      accent="#1A73E8"
                    />
                    <ErrMsg msg={errors.skills} />
                  </div>

                  {/* Languages */}
                  <div>
                    <FieldLabel optional>Languages needed</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map(lang => (
                        <button key={lang} type="button" onClick={() => toggleLang(lang)}
                          className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all border"
                          style={form.languages.includes(lang)
                            ? { background: '#1A73E8', color: 'white',   borderColor: '#1A73E8' }
                            : { background: 'white',   color: '#5F6368', borderColor: 'rgba(26,115,232,0.12)' }}>
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: Logistics ── */}
              {step === 4 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#202124' }}>Logistics</h2>
                    <p className="text-[13px]" style={{ color: '#5F6368' }}>Where and how will this role be carried out?</p>
                  </div>

                  <div>
                    <FieldLabel>Location</FieldLabel>
                    <InputEl value={form.location} onChange={e => set('location', e.target.value)}
                      placeholder="e.g. Tel Aviv, Jerusalem, Haifa"
                      {...fo('location')} />
                    <ErrMsg msg={errors.location} />
                  </div>

                  {/* Work mode cards */}
                  <div>
                    <FieldLabel>Work mode</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {WORK_MODES.map(m => {
                        const active = form.workMode === m.id
                        return (
                          <button key={m.id} type="button"
                            onClick={() => set('workMode', m.id)}
                            className="flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-150"
                            style={active
                              ? { background: 'rgba(26,115,232,0.08)', borderColor: '#1A73E8' }
                              : { background: 'white', borderColor: 'rgba(26,115,232,0.12)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: active ? '#E8F0FE' : 'rgba(26,115,232,0.08)' }}>
                              <m.icon size={16}
                                style={{ color: '#1A73E8' }} />
                            </div>
                            <div className="text-center">
                              <p className="text-[13px] font-bold leading-snug"
                                style={{ color: active ? '#202124' : '#5F6368' }}>{m.label}</p>
                              <p className="text-[10px] mt-0.5 leading-snug" style={{ color: '#5F6368' }}>{m.desc}</p>
                            </div>
                            {active && (
                              <div className="w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ background: '#1A73E8' }}>
                                <Check size={9} strokeWidth={3} className="text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <ErrMsg msg={errors.workMode} />
                  </div>

                  <div>
                    <FieldLabel>Weekly commitment</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {HOURS_OPTIONS.map(h => (
                        <button key={h} type="button"
                          onClick={() => set('weeklyHours', h)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all border"
                          style={form.weeklyHours === h
                            ? { background: '#202124', color: 'white',   borderColor: '#202124' }
                            : { background: 'white',   color: '#5F6368', borderColor: 'rgba(26,115,232,0.12)' }}>
                          <Clock size={11} /> {h}
                        </button>
                      ))}
                    </div>
                    <ErrMsg msg={errors.weeklyHours} />
                  </div>

                  <div>
                    <FieldLabel>Duration</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map(d => (
                        <button key={d} type="button"
                          onClick={() => set('duration', d)}
                          className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all border"
                          style={form.duration === d
                            ? { background: '#202124', color: 'white',   borderColor: '#202124' }
                            : { background: 'white',   color: '#5F6368', borderColor: 'rgba(26,115,232,0.12)' }}>
                          {d}
                        </button>
                      ))}
                    </div>
                    <ErrMsg msg={errors.duration} />
                  </div>

                  {/* Deadline */}
                  <div>
                    <FieldLabel optional>Application deadline</FieldLabel>
                    <InputEl type="date" value={form.deadline}
                      onChange={e => set('deadline', e.target.value)}
                      {...fo('deadline')} />
                  </div>
                </div>
              )}

              {/* ── Step 5: Review ── */}
              {step === 5 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#202124' }}>Review &amp; publish</h2>
                    <p className="text-[13px]" style={{ color: '#5F6368' }}>
                      Scroll through the summary below before you publish this role.
                    </p>
                  </div>

                  <div className="rounded-2xl p-5 border"
                    style={{ background: 'rgba(26,115,232,0.03)', borderColor: 'rgba(26,115,232,0.2)' }}>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest mb-4"
                      style={{ color: '#1A73E8' }}>
                      Opportunity summary
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
                      {[
                        { l: 'Role',         v: form.title    || '—'                                                          },
                        { l: 'Organization', v: form.orgName  || '—'                                                          },
                        { l: 'Category',     v: form.category || '—'                                                          },
                        { l: 'Work mode',    v: WORK_MODES.find(m => m.id === form.workMode)?.label || '—'                    },
                        { l: 'Hours/week',   v: form.weeklyHours || '—'                                                       },
                        { l: 'Duration',     v: form.duration || '—'                                                          },
                        { l: 'Location',     v: form.location || '—'                                                          },
                        { l: 'Skills',       v: form.skills.length ? `${form.skills.length} required` : '—'                   },
                        { l: 'Languages',    v: form.languages.length ? form.languages.join(', ') : 'Any'                     },
                        { l: 'Deadline',     v: form.deadline ? new Date(form.deadline).toLocaleDateString() : 'Open-ended'   },
                      ].map(({ l, v }) => (
                        <div key={l}>
                          <span style={{ color: '#5F6368' }}>{l}: </span>
                          <span className="font-semibold" style={{ color: '#202124' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4 sm:p-5"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,253,0.98))', borderColor: 'rgba(26,115,232,0.14)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={13} style={{ color: '#1A73E8' }} />
                      <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: '#1A73E8' }}>
                        Final check
                      </p>
                    </div>
                    <div className="grid gap-2 text-[12px]" style={{ color: '#5F6368' }}>
                      {[
                        'The title is clear and easy to scan.',
                        'The role description explains the work well.',
                        'The requirements and logistics are complete.',
                      ].map((t, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#1A73E8' }} />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {canScroll && (
                    <div className="sticky bottom-0 -mb-2 flex justify-center pt-4 pb-1 pointer-events-none">
                      <div className="flex items-center gap-2 rounded-full border bg-white/95 px-3 py-1.5 shadow-sm"
                        style={{ borderColor: 'rgba(26,115,232,0.12)' }}>
                        <ChevronRight size={12} className="rotate-90 text-[#5F6368]" />
                        <span className="text-[10px] font-semibold tracking-wide text-[#5F6368] uppercase">
                          Scroll for more
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer navigation */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <button onClick={back} disabled={step === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all disabled:opacity-30 hover:bg-[rgba(26,115,232,0.04)]"
                style={{ color: '#5F6368', borderColor: 'rgba(26,115,232,0.12)' }}>
                <ChevronLeft size={15} /> Back
              </button>

              {/* Save draft — centre of footer, always visible */}
              <button onClick={saveDraft} disabled={draftSaving}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all disabled:opacity-60"
                style={{
                  color:       draftError ? '#EF4444' : draftSaved ? '#059669' : '#5F6368',
                  borderColor: draftError ? 'rgba(239,68,68,0.3)' : draftSaved ? 'rgba(5,150,105,0.3)' : 'rgba(26,115,232,0.12)',
                  background:  draftError ? 'rgba(239,68,68,0.04)' : draftSaved ? 'rgba(5,150,105,0.06)' : 'transparent',
                }}>
                {draftSaving
                  ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                  : draftSaved
                  ? <><Check size={11} /> Saved</>
                  : draftError
                  ? <><AlertCircle size={11} /> Save failed</>
                  : <><Save size={12} /> Save draft</>
                }
              </button>

              {step < 5 ? (
                <button onClick={next}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#202124', boxShadow: '0 2px 14px rgba(32,33,36,0.18)' }}>
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={publish} disabled={publishing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: '#1A73E8', boxShadow: '0 4px 18px rgba(26,115,232,0.32)' }}>
                  {publishing
                    ? <><Loader2 size={12} className="animate-spin" /> Publishing…</>
                    : <><Sparkles size={13} /> {isEdit ? 'Save changes' : 'Publish'}</>
                  }
                </button>
              )}
            </div>

            {/* Status line — autosave time or real error message */}
            {draftError ? (
              <p className="text-center text-[11px] mt-2 leading-snug" style={{ color: '#EF4444' }}>
                {draftError}
              </p>
            ) : lastSavedAt ? (
              <p className="text-center text-[11px] mt-2" style={{ color: '#9BAAC0' }}>
                Autosaved · {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            ) : null}
          </div>

          </div>

          <aside className={`transition-all duration-300 ease-out ${
            aiOpen
              ? 'mt-6 w-full max-w-[340px] lg:absolute lg:right-[-10px] lg:top-8 lg:mt-0 lg:w-[320px]'
              : 'fixed bottom-6 right-6 z-30 w-[190px] lg:absolute lg:bottom-auto lg:right-[-10px] lg:top-8 lg:w-[198px]'
          }`}>
            <div
              className={`overflow-hidden border bg-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                aiOpen
                  ? 'rounded-[30px] shadow-[0_1px_0_rgba(17,24,39,0.02),0_18px_48px_rgba(26,115,232,0.10)]'
                  : 'rounded-full shadow-[0_10px_26px_rgba(26,115,232,0.15)]'
              }`}
              style={{ borderColor: 'rgba(26,115,232,0.10)' }}
            >
              <button
                type="button"
                onClick={() => setAiOpen(open => !open)}
                className={`flex w-full items-center transition-colors hover:bg-[#FBFCFE] ${
                  aiOpen ? 'justify-between gap-4 px-4 py-3 text-left' : 'justify-start gap-2.5 px-3 py-2.5 text-left'
                }`}
                aria-label={aiOpen ? 'Close AI role helper' : 'Open AI role helper'}
              >
                <span className={`flex items-center ${aiOpen ? 'gap-3' : 'gap-2.5'}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
                    <Wand2 size={16} />
                  </span>
                  <span>
                    <span className="block text-[0.9rem] font-semibold leading-tight text-[#202124]">
                      {aiOpen ? 'AI role helper' : 'Help me write this'}
                    </span>
                    {aiOpen && (
                      <span className="mt-0.5 block text-[0.76rem] text-[#5F6368]">
                        Describe the role and fill the form faster.
                      </span>
                    )}
                  </span>
                </span>
                {aiOpen && (
                  <span className="flex items-center gap-2">
                  <ChevronRight
                    size={17}
                    className={`shrink-0 text-[#5F6368] transition-transform ${aiOpen ? 'rotate-90' : ''}`}
                  />
                  </span>
                )}
              </button>

              <AnimatePresence initial={false}>
                {aiOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, scale: 0.985 }}
                    animate={{ height: 'auto', opacity: 1, scale: 1 }}
                    exit={{ height: 0, opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="border-t px-5 py-5" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                      <motion.div
                        className="mx-auto flex max-w-[280px] flex-col items-stretch"
                        initial={{ y: 6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.05, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <label className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6] text-center">
                          What are you looking for?
                        </label>
                        <textarea
                          value={aiPrompt}
                          onChange={(event) => setAiPrompt(event.target.value)}
                          rows={aiOpen ? 7 : 6}
                          placeholder="Example: We need a student who can build a simple website for our youth program, write content, and help us organize applications. Remote or hybrid, around 10 hours a week."
                          className="mt-3 w-full resize-none rounded-[24px] border bg-[#FBFCFE] px-4 py-3 text-[0.88rem] leading-7 text-[#202124] outline-none placeholder:text-[#9AA0A6] focus:border-[#1A73E8] focus:ring-4 focus:ring-[#1A73E8]/10"
                          style={{
                            borderColor: 'rgba(26,115,232,0.12)',
                            minHeight: '180px',
                          }}
                        />

                        <button
                          type="button"
                          onClick={applyAiDraft}
                          disabled={!aiPrompt.trim() || aiDrafting}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-4 py-3 text-[0.9rem] font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.18)] transition-opacity disabled:opacity-50"
                        >
                          {aiDrafting ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Drafting role
                            </>
                          ) : (
                            <>
                              <Sparkles size={15} />
                              Fill form
                            </>
                          )}
                        </button>

                        <div className="mt-4 rounded-[22px] bg-[#F8FAFD] p-4 text-[0.78rem] leading-6 text-[#5F6368] text-center">
                          It drafts the main fields for you. You can still edit everything before saving or publishing.
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
