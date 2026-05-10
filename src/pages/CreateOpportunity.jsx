import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, X, Check, CheckCircle2,
  Briefcase, MapPin, Globe, Clock, Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Technology', 'Education', 'Healthcare', 'Environment',
  'Youth Services', 'Accessibility', 'Arts & Culture',
  'Legal Aid', 'Research', 'Community Development',
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
]

// ─── Storage ─────────────────────────────────────────────────────────────────

function saveOppToStorage(data, status) {
  const existing = JSON.parse(localStorage.getItem('hive_ngo_opportunities') || '[]')
  const opp = {
    id: `opp_${Date.now()}`,
    ...data,
    status,
    createdAt: new Date().toISOString(),
    applicants: 0,
    posted: 'Just now',
  }
  localStorage.setItem('hive_ngo_opportunities', JSON.stringify([opp, ...existing]))
  return opp
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldLabel({ children, optional }) {
  return (
    <p className="text-[13px] font-semibold mb-2" style={{ color: '#0D183D' }}>
      {children}
      {optional
        ? <span className="ml-1.5 text-[11px] font-normal" style={{ color: '#4B6382' }}>(optional)</span>
        : <span className="ml-0.5" style={{ color: '#FFB703' }}>*</span>
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
      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all placeholder-[#4B6382]/50"
      style={{ background: 'white', color: '#0D183D',
        border: `1.5px solid ${focused ? '#FFB703' : 'rgba(13,24,61,0.1)'}` }}
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
      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all resize-none placeholder-[#4B6382]/50"
      style={{ background: 'white', color: '#0D183D', lineHeight: 1.65,
        border: `1.5px solid ${focused ? '#FFB703' : 'rgba(13,24,61,0.1)'}` }}
    />
  )
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slide = {
  enter:  dir => ({ x: dir * 36, opacity: 0   }),
  center:       ({ x: 0,         opacity: 1   }),
  exit:   dir => ({ x: dir * -36, opacity: 0  }),
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Static fallback data for edit mode (maps NGO_OPPORTUNITIES IDs)
const STATIC_OPP_DATA = {
  '1': { title:'Web Developer – Community Platform',    orgName:'Majd – Arab Youth Hub', category:'Technology',  field:'Frontend Development', description:'Build and maintain our volunteer coordination platform using React. Work with our product team to design user flows, implement new features, and optimize performance for mobile users.', missionImpact:'Your code will directly serve coordinators managing 500+ youth interactions per month. A faster, more intuitive platform means more kids reached.', skills:['React','TypeScript','Node.js','UX Design'], languages:['Hebrew','English'], weeklyHours:'10–15 hrs/week', duration:'3–6 months', location:'Tel Aviv', workMode:'hybrid', deadline:'' },
  '2': { title:'Content Strategist – Digital Outreach', orgName:'Majd – Arab Youth Hub', category:'Education',   field:'Digital Marketing', description:'Develop and execute a content strategy across our social media channels and newsletter. Create compelling stories about our programs and the youth we serve.', missionImpact:'Every post you write helps us reach 1,000+ families who may not know our services exist. Good content is a direct lifeline for youth in need.', skills:['Content Writing','SEO','Social Media','Canva'], languages:['Hebrew','Arabic','English'], weeklyHours:'8–12 hrs/week', duration:'2–3 months', location:'Jerusalem', workMode:'remote', deadline:'' },
  '3': { title:'Data Analyst – Impact Reports',         orgName:'Majd – Arab Youth Hub', category:'Research',    field:'Data Science', description:'Analyze program data to generate quarterly impact reports for funders and stakeholders. Build dashboards that help our team make evidence-based decisions.', missionImpact:'Our funders decide how much to invest based on your reports. Clean, compelling data analysis directly funds programs that serve at-risk youth.', skills:['Python','Statistics','Data Visualization','Excel'], languages:['Hebrew','English'], weeklyHours:'10–15 hrs/week', duration:'2–3 months', location:'Tel Aviv', workMode:'hybrid', deadline:'' },
  '4': { title:'UI/UX Designer – Youth App',            orgName:'Majd – Arab Youth Hub', category:'Technology',  field:'UX/UI Design', description:'Design a mobile-first app interface for youth to self-refer to our services. Conduct user research with teenagers and translate insights into intuitive designs.', missionImpact:'Young people in crisis need to find help fast and without stigma. Your design choices will determine whether they reach out — or close the app.', skills:['Figma','User Research','Prototyping','Accessibility'], languages:['Hebrew','Arabic'], weeklyHours:'8–12 hrs/week', duration:'3–6 months', location:'Tel Aviv', workMode:'remote', deadline:'' },
}

export default function CreateOpportunity() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  // Resolve edit data: check localStorage first, then static fallback
  const editData = (() => {
    if (!editId) return null
    const stored = JSON.parse(localStorage.getItem('hive_ngo_opportunities') || '[]')
    return stored.find(o => o.id === editId) || STATIC_OPP_DATA[editId] || null
  })()

  const isEdit = !!editData

  const [step, setStep]           = useState(1)
  const [dir, setDir]             = useState(1)
  const [published, setPublished] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [focusedField, setFocused] = useState(null)
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors]       = useState({})

  const [form, setForm] = useState({
    title:         editData?.title         || '',
    orgName:       editData?.orgName       || profile?.name || user?.name || '',
    category:      editData?.category      || '',
    field:         editData?.field         || '',
    description:   editData?.description   || '',
    missionImpact: editData?.missionImpact || '',
    skills:        editData?.skills        || [],
    languages:     editData?.languages     || [],
    weeklyHours:   editData?.weeklyHours   || '',
    duration:      editData?.duration      || '',
    location:      editData?.location      || profile?.location || '',
    workMode:      editData?.workMode      || '',
    deadline:      editData?.deadline      || '',
  })

  // Focus helpers
  const fo = key => ({
    focused:  focusedField === key,
    onFocus: () => setFocused(key),
    onBlur:  () => setFocused(null),
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  // Skills tag input
  function addSkill() {
    const s = skillInput.trim().replace(/,+$/, '')
    if (s && !form.skills.includes(s)) set('skills', [...form.skills, s])
    setSkillInput('')
  }
  function removeSkill(s) { set('skills', form.skills.filter(x => x !== s)) }
  function toggleLang(lang) {
    set('languages', form.languages.includes(lang)
      ? form.languages.filter(l => l !== lang)
      : [...form.languages, lang])
  }

  // Per-step validation
  function validate() {
    const e = {}
    if (step === 1) {
      if (!form.title.trim())   e.title    = 'Role title is required'
      if (!form.orgName.trim()) e.orgName  = 'Organization name is required'
      if (!form.category)       e.category = 'Select a category'
    } else if (step === 2) {
      if (!form.description.trim())   e.description   = 'Role description is required'
      if (!form.missionImpact.trim()) e.missionImpact = 'Describe the impact of this role'
    } else if (step === 3) {
      if (!form.skills.length)  e.skills     = 'Add at least one required skill'
      if (!form.weeklyHours)    e.weeklyHours = 'Select weekly commitment'
      if (!form.duration)       e.duration    = 'Select a duration'
    } else if (step === 4) {
      if (!form.location.trim()) e.location = 'Location is required'
      if (!form.workMode)        e.workMode  = 'Select a work mode'
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

  function saveDraft() {
    saveOppToStorage(form, 'draft')
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2200)
  }

  function publish() {
    if (!validate()) return
    saveOppToStorage(form, 'published')
    setPublished(true)
  }

  function resetForm() {
    setForm({
      title: '', orgName: profile?.name || user?.name || '',
      category: '', field: '', description: '', missionImpact: '',
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F8F9FB]">
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
              <h1 className="text-[1.7rem] font-extrabold mb-2" style={{ color: '#0D183D' }}>
                {isEdit ? 'Changes saved!' : 'Opportunity published!'}
              </h1>
              <p className="text-[0.95rem] font-semibold mb-1" style={{ color: '#4B6382' }}>
                "{form.title}"
              </p>
              <p className="text-[13px]" style={{ color: '#4B6382' }}>
                {form.orgName}
                {form.category ? ` · ${form.category}` : ''}
                {form.location ? ` · ${form.location}` : ''}
              </p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            className="bg-white rounded-3xl p-6 border mb-5" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { v: form.skills.length || '—',                 l: 'Skills listed'  },
                { v: form.weeklyHours?.split('–')[0] || '—',    l: 'Hrs / week'     },
                { v: form.duration || '—',                      l: 'Duration'       },
              ].map(({ v, l }) => (
                <div key={l} className="rounded-2xl p-4 text-center border" style={{ background: '#F8F9FB', borderColor: 'rgba(13,24,61,0.07)' }}>
                  <p className="text-[17px] font-extrabold leading-none mb-1" style={{ color: '#0D183D' }}>{v}</p>
                  <p className="text-[10px]" style={{ color: '#4B6382' }}>{l}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4 border" style={{ background: 'rgba(255,183,3,0.04)', borderColor: 'rgba(255,183,3,0.18)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} style={{ color: '#FFB703' }} />
                <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: '#D99E00' }}>
                  What happens next
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  'Hive AI is scanning student profiles for strong matches',
                  'Matched students will see your opportunity in their feed',
                  'Applications will appear in your Applicants dashboard',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: '#4B6382' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#FFB703' }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            className="flex gap-3">
            <button onClick={resetForm}
              className="flex-1 py-3 rounded-2xl text-[13px] font-semibold border transition-all hover:bg-[rgba(13,24,61,0.03)]"
              style={{ color: '#0D183D', borderColor: 'rgba(13,24,61,0.12)' }}>
              Post another
            </button>
            <button onClick={() => navigate('/opportunities')}
              className="flex-1 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#0D183D', boxShadow: '0 4px 16px rgba(13,24,61,0.2)' }}>
              View opportunities →
            </button>
          </motion.div>

        </motion.div>
      </div>
    )
  }

  // ── Multi-step form ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col">

      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 bg-white"
        style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-5">

          <button onClick={() => navigate('/opportunities')}
            className="flex items-center gap-1 text-[13px] font-medium transition-colors shrink-0 hover:text-[#0D183D]"
            style={{ color: '#4B6382' }}>
            <ChevronLeft size={15} /> Back
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(13,24,61,0.07)' }}>
              <motion.div className="h-full rounded-full" style={{ background: '#FFB703' }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }} />
            </div>
            <span className="text-[11px] font-semibold shrink-0" style={{ color: '#4B6382' }}>
              {step} of 4
            </span>
          </div>

          <button onClick={saveDraft}
            className="shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-xl border transition-all"
            style={{
              color:        draftSaved ? '#059669'                : '#4B6382',
              borderColor:  draftSaved ? 'rgba(5,150,105,0.3)'   : 'rgba(13,24,61,0.1)',
              background:   draftSaved ? 'rgba(5,150,105,0.06)'  : 'transparent',
            }}>
            {draftSaved && <Check size={11} />}
            {draftSaved ? 'Saved!' : 'Save draft'}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-8">

          {/* Step pills */}
          <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-0.5">
            {STEPS.map(({ n, label }) => (
              <div key={n} className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                  style={
                    n < step  ? { background: 'rgba(5,150,105,0.1)', color: '#059669'    } :
                    n === step ? { background: '#0D183D',             color: 'white'      } :
                                { background: 'rgba(13,24,61,0.06)', color: '#4B6382'   }
                  }>
                  {n < step ? <Check size={11} /> : <span className="w-3.5 text-center">{n}</span>}
                  {label}
                </div>
                {n < 4 && <div className="w-5 h-px shrink-0" style={{ background: 'rgba(13,24,61,0.1)' }} />}
              </div>
            ))}
          </div>

          {/* Animated form card */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step}
              custom={dir}
              variants={slide}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="bg-white rounded-3xl p-8 border"
              style={{ borderColor: 'rgba(13,24,61,0.08)', boxShadow: '0 2px 20px rgba(13,24,61,0.05)' }}>

              {/* ── Step 1: Role basics ── */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#0D183D' }}>Role basics</h2>
                    <p className="text-[13px]" style={{ color: '#4B6382' }}>What role are you looking to fill?</p>
                  </div>

                  <div>
                    <FieldLabel>Role title</FieldLabel>
                    <InputEl value={form.title} onChange={e => set('title', e.target.value)}
                      placeholder="e.g. Web Developer, Data Analyst, Content Strategist"
                      {...fo('title')} />
                    <ErrMsg msg={errors.title} />
                  </div>

                  <div>
                    <FieldLabel>Organization name</FieldLabel>
                    <InputEl value={form.orgName} onChange={e => set('orgName', e.target.value)}
                      placeholder="Your NGO name"
                      {...fo('orgName')} />
                    <ErrMsg msg={errors.orgName} />
                  </div>

                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(c => (
                        <button key={c} type="button"
                          onClick={() => set('category', c)}
                          className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all border"
                          style={form.category === c
                            ? { background: '#0D183D', color: 'white',   borderColor: '#0D183D' }
                            : { background: 'white',   color: '#4B6382', borderColor: 'rgba(13,24,61,0.1)' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <ErrMsg msg={errors.category} />
                  </div>

                  <div>
                    <FieldLabel optional>Field / specialization</FieldLabel>
                    <InputEl value={form.field} onChange={e => set('field', e.target.value)}
                      placeholder="e.g. Frontend Development, Public Health, Digital Marketing"
                      {...fo('field')} />
                  </div>
                </div>
              )}

              {/* ── Step 2: Description ── */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#0D183D' }}>Description</h2>
                    <p className="text-[13px]" style={{ color: '#4B6382' }}>Help students understand the role and its purpose.</p>
                  </div>

                  <div>
                    <FieldLabel>Role description</FieldLabel>
                    <p className="text-[11px] mb-2" style={{ color: '#4B6382' }}>
                      What will the volunteer actually do day-to-day?
                    </p>
                    <TextareaEl value={form.description} onChange={e => set('description', e.target.value)}
                      placeholder="Describe key responsibilities, deliverables, and what a typical week looks like in this role…"
                      rows={5} {...fo('description')} />
                    <ErrMsg msg={errors.description} />
                  </div>

                  <div>
                    <FieldLabel>Mission &amp; impact</FieldLabel>
                    <p className="text-[11px] mb-2" style={{ color: '#4B6382' }}>
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
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#0D183D' }}>Requirements</h2>
                    <p className="text-[13px]" style={{ color: '#4B6382' }}>What skills and commitment does this role need?</p>
                  </div>

                  {/* Skills tag input */}
                  <div>
                    <FieldLabel>Required skills</FieldLabel>
                    <p className="text-[11px] mb-2" style={{ color: '#4B6382' }}>Press Enter or comma after each skill.</p>
                    <div
                      className="flex flex-wrap gap-2 p-3 rounded-xl min-h-[52px] transition-all"
                      style={{ background: 'white',
                        border: `1.5px solid ${focusedField === 'skills' ? '#FFB703' : 'rgba(13,24,61,0.1)'}` }}>
                      {form.skills.map(s => (
                        <span key={s}
                          className="flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-lg text-white"
                          style={{ background: '#0D183D' }}>
                          {s}
                          <button type="button" onClick={() => removeSkill(s)}
                            className="opacity-50 hover:opacity-100 transition-opacity ml-0.5">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }
                          else if (e.key === 'Backspace' && !skillInput && form.skills.length)
                            removeSkill(form.skills.at(-1))
                        }}
                        onFocus={() => setFocused('skills')}
                        onBlur={() => { setFocused(null); if (skillInput.trim()) addSkill() }}
                        placeholder={form.skills.length ? '' : 'React, Python, Canva, Research…'}
                        className="flex-1 min-w-[140px] bg-transparent text-[12px] outline-none placeholder-[#4B6382]/40"
                        style={{ color: '#0D183D' }}
                      />
                    </div>
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
                            ? { background: '#FFB703', color: 'white',   borderColor: '#FFB703' }
                            : { background: 'white',   color: '#4B6382', borderColor: 'rgba(13,24,61,0.1)' }}>
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weekly hours */}
                  <div>
                    <FieldLabel>Weekly commitment</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {HOURS_OPTIONS.map(h => (
                        <button key={h} type="button"
                          onClick={() => set('weeklyHours', h)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all border"
                          style={form.weeklyHours === h
                            ? { background: '#0D183D', color: 'white',   borderColor: '#0D183D' }
                            : { background: 'white',   color: '#4B6382', borderColor: 'rgba(13,24,61,0.1)' }}>
                          <Clock size={11} /> {h}
                        </button>
                      ))}
                    </div>
                    <ErrMsg msg={errors.weeklyHours} />
                  </div>

                  {/* Duration */}
                  <div>
                    <FieldLabel>Duration</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map(d => (
                        <button key={d} type="button"
                          onClick={() => set('duration', d)}
                          className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all border"
                          style={form.duration === d
                            ? { background: '#0D183D', color: 'white',   borderColor: '#0D183D' }
                            : { background: 'white',   color: '#4B6382', borderColor: 'rgba(13,24,61,0.1)' }}>
                          {d}
                        </button>
                      ))}
                    </div>
                    <ErrMsg msg={errors.duration} />
                  </div>
                </div>
              )}

              {/* ── Step 4: Logistics ── */}
              {step === 4 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-[1.1rem] font-extrabold mb-1" style={{ color: '#0D183D' }}>Logistics</h2>
                    <p className="text-[13px]" style={{ color: '#4B6382' }}>Where and how will this role be carried out?</p>
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
                              ? { background: 'rgba(13,24,61,0.04)', borderColor: '#0D183D' }
                              : { background: 'white', borderColor: 'rgba(13,24,61,0.1)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: active ? '#0D183D' : 'rgba(13,24,61,0.06)' }}>
                              <m.icon size={16}
                                style={{ color: active ? '#FFB703' : '#4B6382' }} />
                            </div>
                            <div className="text-center">
                              <p className="text-[13px] font-bold leading-snug"
                                style={{ color: active ? '#0D183D' : '#4B6382' }}>{m.label}</p>
                              <p className="text-[10px] mt-0.5 leading-snug" style={{ color: '#4B6382' }}>{m.desc}</p>
                            </div>
                            {active && (
                              <div className="w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ background: '#FFB703' }}>
                                <Check size={9} strokeWidth={3} className="text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <ErrMsg msg={errors.workMode} />
                  </div>

                  {/* Deadline */}
                  <div>
                    <FieldLabel optional>Application deadline</FieldLabel>
                    <InputEl type="date" value={form.deadline}
                      onChange={e => set('deadline', e.target.value)}
                      {...fo('deadline')} />
                  </div>

                  {/* Summary preview card */}
                  <div className="rounded-2xl p-5 border"
                    style={{ background: 'rgba(255,183,3,0.03)', borderColor: 'rgba(255,183,3,0.2)' }}>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest mb-4"
                      style={{ color: '#D99E00' }}>
                      Opportunity summary
                    </p>
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px]">
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
                          <span style={{ color: '#4B6382' }}>{l}: </span>
                          <span className="font-semibold" style={{ color: '#0D183D' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Footer navigation */}
          <div className="flex items-center justify-between mt-6 gap-3">
            <button onClick={back} disabled={step === 1}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all disabled:opacity-30 hover:bg-[rgba(13,24,61,0.03)]"
              style={{ color: '#4B6382', borderColor: 'rgba(13,24,61,0.1)' }}>
              <ChevronLeft size={15} /> Back
            </button>

            {step < 4 ? (
              <button onClick={next}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#0D183D', boxShadow: '0 2px 14px rgba(13,24,61,0.2)' }}>
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={publish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#FFB703', boxShadow: '0 4px 18px rgba(255,183,3,0.32)' }}>
                <Sparkles size={13} /> {isEdit ? 'Save changes' : 'Publish opportunity'}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
