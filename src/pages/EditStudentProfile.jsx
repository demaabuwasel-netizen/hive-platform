import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X, Check, CheckCircle2, Plus } from 'lucide-react'
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
import { useApp } from '../context/AppContext'
import { saveStudentProfile } from '../services/storage'
import { updateUserRow } from '../services/auth'
import { AvatarPicker } from '../components/Avatar'

// ─── Language picker ─────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = ['Hebrew','Arabic','English','Russian','French','Spanish','German','Other']
const PROFICIENCY_LEVELS = ['Native','Fluent','Intermediate','Basic']
const LEVEL_COLORS = { Native:'#0D183D', Fluent:'#059669', Intermediate:'#D99E00', Basic:'#6366F1' }

function LanguagePicker({ value = [], onChange }) {
  const [picking, setPicking] = useState(null)

  function toggleLang(lang) {
    if (value.find(l => l.lang === lang)) {
      onChange(value.filter(l => l.lang !== lang))
      if (picking === lang) setPicking(null)
    } else {
      setPicking(lang)
    }
  }

  function pickLevel(lang, level) {
    const exists = value.find(l => l.lang === lang)
    if (exists) {
      onChange(value.map(l => l.lang === lang ? { lang, level } : l))
    } else {
      onChange([...value, { lang, level }])
    }
    setPicking(null)
  }

  function removeLevel(lang) {
    onChange(value.filter(l => l.lang !== lang))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(({ lang, level }) => (
            <span key={lang} className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-semibold text-white"
              style={{ background: LEVEL_COLORS[level] || '#6366F1' }}>
              {lang}
              <span className="opacity-65 text-xs">· {level}</span>
              <button type="button" onClick={() => removeLevel(lang)}
                className="opacity-60 hover:opacity-100 ml-0.5 transition-opacity">
                <X size={11}/>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Language selection grid */}
      <div className="flex flex-wrap gap-2">
        {LANGUAGE_OPTIONS.map(lang => {
          const selected = value.find(l => l.lang === lang)
          const isPickingThis = picking === lang
          return (
            <div key={lang} className="relative">
              <button type="button"
                onClick={() => selected ? removeLevel(lang) : toggleLang(lang)}
                className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border transition-all"
                style={selected
                  ? { background: LEVEL_COLORS[selected.level] || '#0D183D', color:'white', borderColor:'transparent' }
                  : isPickingThis
                  ? { background:'rgba(255,183,3,0.1)', color:'#D99E00', borderColor:'rgba(255,183,3,0.3)' }
                  : { background:'white', color:'#4B6382', borderColor:'rgba(13,24,61,0.1)' }}>
                {lang}
              </button>
              {/* Proficiency popup */}
              <AnimatePresence>
                {isPickingThis && (
                  <motion.div initial={{ opacity:0, y:6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:4 }}
                    transition={{ duration:0.15 }}
                    className="absolute top-full left-0 mt-1.5 z-20 bg-white rounded-xl shadow-xl border flex flex-col overflow-hidden"
                    style={{ borderColor:'rgba(13,24,61,0.1)', minWidth:130 }}>
                    {PROFICIENCY_LEVELS.map(level => (
                      <button key={level} type="button"
                        onClick={() => pickLevel(lang, level)}
                        className="px-4 py-2 text-[12px] font-semibold text-left hover:bg-[#F8F9FB] transition-colors flex items-center gap-2"
                        style={{ color: LEVEL_COLORS[level] || '#0D183D' }}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LEVEL_COLORS[level] || '#0D183D' }}/>
                        {level}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ value = [], onChange, placeholder, colorClass = 'bg-navy-50 text-navy-700 border-navy-100' }) {
  const [input, setInput] = useState('')

  function add() {
    const s = input.trim().replace(/,+$/, '')
    if (s && !value.includes(s)) onChange([...value, s])
    setInput('')
  }

  function remove(item) { onChange(value.filter(v => v !== item)) }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(item => (
            <span key={item} className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border font-medium ${colorClass}`}>
              {item}
              <button type="button" onClick={() => remove(item)} className="opacity-50 hover:opacity-100 transition-opacity ml-0.5">
                <X size={11}/>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter'||e.key===',') { e.preventDefault(); add() } }}
          onBlur={() => { if (input.trim()) add() }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-xl text-[13px] outline-none transition-all placeholder-[#4B6382]/50"
          style={{ background:'white', color:'#0D183D', border:'1.5px solid rgba(13,24,61,0.1)' }}
        />
        <button type="button" onClick={add}
          className="px-3.5 py-2.5 rounded-xl text-[12px] font-semibold border transition-all hover:bg-[#F8F9FB]"
          style={{ color:'#4B6382', borderColor:'rgba(13,24,61,0.1)' }}>
          <Plus size={14}/>
        </button>
      </div>
    </div>
  )
}

// ─── Field block ──────────────────────────────────────────────────────────────

function Field({ label, hint, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-[13px] font-semibold text-[#0D183D]">
          {label}{required && <span className="ml-0.5 text-[#FFB703]">*</span>}
        </p>
        {hint && <p className="text-[11px] text-[#4B6382] mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type='text', focused, onFocus, onBlur }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={onFocus} onBlur={onBlur}
      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all placeholder-[#4B6382]/50"
      style={{ background:'white', color:'#0D183D', border:`1.5px solid ${focused?'#FFB703':'rgba(13,24,61,0.1)'}` }}/>
  )
}

function TextArea({ value, onChange, placeholder, rows=4, focused, onFocus, onBlur }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      onFocus={onFocus} onBlur={onBlur}
      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all resize-none placeholder-[#4B6382]/50"
      style={{ background:'white', color:'#0D183D', lineHeight:1.65, border:`1.5px solid ${focused?'#FFB703':'rgba(13,24,61,0.1)'}` }}/>
  )
}

function validatePhone(p) {
  const stripped = (p || '').replace(/[\s\-().+]/g, '')
  return stripped === '' || /^\d{7,15}$/.test(stripped)
}

// ─── Section divider ─────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-6 flex flex-col gap-5">
      <h2 className="text-[13px] font-extrabold text-[#0D183D] uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditStudentProfile() {
  const { user, profile, setProfile } = useApp()
  const navigate = useNavigate()

  const src = profile || {}

  // Normalize arrays that might be stored as comma-separated strings
  function toArray(v) {
    if (Array.isArray(v)) return v
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
    return []
  }

  const [form, setForm] = useState({
    avatar:      src.avatar || '',
    name:        user?.name || src.name || '',
    phone:       src.phone || '',
    university:  src.university || '',
    field:       src.field || '',
    summary:     src.summary || '',
    skills:      (Array.isArray(src.skills) ? src.skills : []).map(s => typeof s === 'string' ? { name: s, level: '' } : s),
    interests:   toArray(src.interests),
    languages:   Array.isArray(src.languages) ? src.languages : [],
    experience:  src.experience || '',
    goals:       src.goals || '',
    linkedin:    src.links?.linkedin || '',
    github:      src.links?.github || '',
    portfolio:   src.links?.portfolio || '',
  })

  const [focused, setFocused]   = useState(null)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(false)

  const fo = k => ({ focused: focused === k, onFocus: () => setFocused(k), onBlur: () => setFocused(null) })
  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})) }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!validatePhone(form.phone)) e.phone = 'Enter a valid phone number (7–15 digits)'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function save() {
    if (!validate()) return
    setSaving(true)

    const updated = {
      ...src,
      avatar:     form.avatar,
      name:       form.name.trim(),
      phone:      form.phone.trim(),
      university: form.university.trim(),
      field:      form.field.trim(),
      summary:    form.summary.trim(),
      skills:     form.skills,
      interests:  form.interests,
      languages:  form.languages,
      experience: form.experience.trim(),
      goals:      form.goals.trim(),
      links: {
        ...src.links,
        linkedin:  form.linkedin.trim(),
        github:    form.github.trim(),
        portfolio: form.portfolio.trim(),
      },
    }

    saveStudentProfile(user.id, updated).catch(console.error)
    setProfile(updated)

    if (form.name.trim() !== user.name) {
      updateUserRow(user.id, { name: form.name.trim() }).catch(console.error)
    }

    setToast(true)
    setTimeout(() => {
      setSaving(false)
      navigate('/profile/student')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">

      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 bg-white" style={{ borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between gap-5">
          <button onClick={() => navigate('/profile/student')}
            className="flex items-center gap-1 text-[13px] font-medium text-[#4B6382] hover:text-[#0D183D] transition-colors shrink-0">
            <ChevronLeft size={15}/> Profile
          </button>
          <p className="text-[14px] font-extrabold text-[#0D183D]">Edit profile</p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/profile/student')}
              className="px-4 py-1.5 rounded-xl text-[12px] font-semibold border text-[#4B6382] hover:bg-[#F8F9FB] transition-colors"
              style={{ borderColor:'rgba(13,24,61,0.1)' }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background:'#FFB703', boxShadow:'0 2px 10px rgba(255,183,3,0.28)' }}>
              {saving ? <><Check size={11}/>Saved!</> : 'Save changes'}
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">

        {/* Photo */}
        <Section title="Profile photo">
          <AvatarPicker value={form.avatar} onChange={v => set('avatar', v)} name={form.name}/>
        </Section>

        {/* Basic info */}
        <Section title="Basic info">
          <Field label="Full name" required>
            <TextInput value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" {...fo('name')}/>
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </Field>
          <Field label="Phone number" hint="Used for interview coordination. Not shown publicly.">
            <TextInput type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+972 50 000 0000" {...fo('phone')}/>
            {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
          </Field>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="University / College">
              <AutocompleteInput
                value={form.university}
                onChange={val => set('university', val)}
                options={UNIVERSITIES}
                placeholder="e.g. Tel Aviv University"
              />
            </Field>
            <Field label="Field of study">
              <AutocompleteInput
                value={form.field}
                onChange={val => set('field', val)}
                options={FIELDS_OF_STUDY}
                placeholder="e.g. Computer Science"
              />
            </Field>
          </div>
          <Field label="Short bio" hint="A sentence or two about you — shown at the top of your profile.">
            <TextArea value={form.summary} onChange={e => set('summary', e.target.value)}
              placeholder="e.g. CS student passionate about using tech for social impact…"
              rows={3} {...fo('summary')}/>
          </Field>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <Field label="Your skills" hint="Search or type a skill, then choose your proficiency level.">
            <SkillPicker value={form.skills} onChange={v => set('skills', v)} />
          </Field>
        </Section>

        {/* Interests */}
        <Section title="Interests &amp; Causes">
          <Field label="Causes you care about" hint="Helps match you with NGOs that share your values.">
            <TopicPicker
              value={form.interests}
              onChange={v => set('interests', v)}
              options={CAUSES}
            />
          </Field>
        </Section>

        {/* Languages */}
        <Section title="Languages">
          <Field label="Languages you speak" hint="Click a language, then select your proficiency level.">
            <LanguagePicker value={form.languages} onChange={v => set('languages', v)}/>
          </Field>
        </Section>

        {/* Experience & Goals */}
        <Section title="Experience &amp; Goals">
          <Field label="Experience" hint="Class projects, internships, volunteer work — everything counts.">
            <TextArea value={form.experience} onChange={e => set('experience', e.target.value)}
              placeholder="Describe your background and key projects…"
              rows={4} {...fo('experience')}/>
          </Field>
          <Field label="Goals" hint="What do you want to achieve through this experience?">
            <TextArea value={form.goals} onChange={e => set('goals', e.target.value)}
              placeholder="e.g. Build a portfolio, contribute to causes I care about, develop leadership skills…"
              rows={3} {...fo('goals')}/>
          </Field>
        </Section>

        {/* Links */}
        <Section title="Links">
          {[
            { k:'linkedin',  label:'LinkedIn',  placeholder:'linkedin.com/in/yourname' },
            { k:'github',    label:'GitHub',    placeholder:'github.com/yourname'      },
            { k:'portfolio', label:'Portfolio', placeholder:'yoursite.com'             },
          ].map(({ k, label, placeholder }) => (
            <Field key={k} label={label}>
              <TextInput value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} {...fo(k)}/>
            </Field>
          ))}
        </Section>

        {/* Bottom save */}
        <div className="flex gap-3 pb-6">
          <button onClick={() => navigate('/profile/student')}
            className="flex-1 py-3 rounded-2xl text-[13px] font-semibold border text-[#4B6382] hover:bg-white transition-colors"
            style={{ borderColor:'rgba(13,24,61,0.1)' }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background:'#FFB703', boxShadow:'0 4px 16px rgba(255,183,3,0.28)', flex:2 }}>
            {saving ? <><Check size={14}/>Saving…</> : 'Save changes →'}
          </button>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-[13px] font-semibold z-50 pointer-events-none"
            style={{ background:'#0D183D', boxShadow:'0 8px 24px rgba(13,24,61,0.25)' }}>
            <CheckCircle2 size={14}/> Profile updated!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
