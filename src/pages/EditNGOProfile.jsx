import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X, Check, CheckCircle2, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { saveNgoProfile } from '../services/storage'
import { updateUserRow } from '../services/auth'
import { AvatarPicker } from '../components/Avatar'

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ value = [], onChange, placeholder }) {
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
            <span key={item} className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border font-medium bg-[#FFF7E6] text-[#92610a] border-[rgba(255,183,3,0.25)]">
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

// ─── Field / section helpers ──────────────────────────────────────────────────

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

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8 flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-bold text-[#0D183D] uppercase tracking-widest">{title}</h2>
        {subtitle && <p className="text-[13px] text-[#4B6382] mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function validatePhone(p) {
  const stripped = (p || '').replace(/[\s\-().+]/g, '')
  return stripped === '' || /^\d{7,15}$/.test(stripped)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditNGOProfile() {
  const { user, profile, setProfile } = useApp()
  const navigate = useNavigate()

  const src = profile || {}

  const [form, setForm] = useState({
    avatar:      src.avatar || src.imageUrl || '',
    name:        src.name || user?.name || '',
    phone:       src.phone || '',
    location:    src.location || src.country || '',
    summary:     src.summary || '',
    description: src.description || '',
    helpNeeded:  src.helpNeeded || '',
    tags:        Array.isArray(src.tags) ? src.tags : [],
    website:     src.links?.website   || '',
    instagram:   src.links?.instagram || '',
    twitter:     src.links?.twitter   || '',
  })

  const [focused, setFocused] = useState(null)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(false)

  const fo = k => ({ focused: focused === k, onFocus: () => setFocused(k), onBlur: () => setFocused(null) })
  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})) }

  function validate() {
    const e = {}
    if (!form.name.trim())      e.name  = 'Organization name is required'
    if (!validatePhone(form.phone)) e.phone = 'Enter a valid phone number (7–15 digits)'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function save() {
    if (!validate()) return
    setSaving(true)

    const updated = {
      ...src,
      avatar:      form.avatar,
      imageUrl:    form.avatar,
      name:        form.name.trim(),
      phone:       form.phone.trim(),
      location:    form.location.trim(),
      summary:     form.summary.trim(),
      description: form.description.trim(),
      helpNeeded:  form.helpNeeded.trim(),
      tags:        form.tags,
      links: {
        ...src.links,
        website:   form.website.trim(),
        instagram: form.instagram.trim(),
        twitter:   form.twitter.trim(),
      },
    }

    saveNgoProfile(user.id, updated).catch(console.error)
    setProfile(updated)

    if (form.name.trim() !== user.name) {
      updateUserRow(user.id, { name: form.name.trim() }).catch(console.error)
    }

    setToast(true)
    setTimeout(() => {
      setSaving(false)
      navigate('/profile/ngo')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">

      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-[rgba(13,24,61,0.08)]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-5">
          <button onClick={() => navigate('/profile/ngo')}
            className="flex items-center gap-2 text-[13px] font-semibold text-[#4B6382] hover:text-[#0D183D] transition-colors shrink-0">
            <ChevronLeft size={16}/> Back to profile
          </button>
          <p className="text-[15px] font-bold text-[#0D183D]">Edit Organization Profile</p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/profile/ngo')}
              className="px-4 py-2 rounded-xl text-[12px] font-semibold border text-[#4B6382] hover:bg-[#F0F1F3] transition-colors"
              style={{ borderColor:'rgba(13,24,61,0.1)' }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background:'#FFB703', boxShadow:'0 2px 10px rgba(255,183,3,0.28)' }}>
              {saving ? <><Check size={12}/>Saved!</> : 'Save changes'}
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* 1. ORGANIZATION IDENTITY */}
        <Section title="Organization Identity" subtitle="Logo, name, and basic details">
          <div className="flex flex-col gap-6">
            <Field label="Organization logo">
              <AvatarPicker value={form.avatar} onChange={v => set('avatar', v)} name={form.name}/>
            </Field>

            <div className="h-px bg-[rgba(13,24,61,0.05)]" />

            <Field label="Organization name" required>
              <TextInput value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Your NGO's name" {...fo('name')}/>
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </Field>

            <Field label="Country">
              <TextInput value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. Palestine, Jordan" {...fo('location')}/>
            </Field>

            <Field label="Tagline / Summary" hint="A short sentence that captures your mission.">
              <TextArea value={form.summary} onChange={e => set('summary', e.target.value)}
                placeholder="e.g. Empowering at-risk youth through technology and mentorship."
                rows={2} {...fo('summary')}/>
            </Field>

            <Field label="Phone number" hint="Used for interview coordination. Not shown publicly.">
              <TextInput type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+972 2 000 0000" {...fo('phone')}/>
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </Field>
          </div>
        </Section>

        {/* 2. ABOUT & MISSION */}
        <Section title="About & Mission" subtitle="Tell your story and what drives you">
          <div className="flex flex-col gap-6">
            <Field label="About the organization" hint="Tell students about your work, communities, and what drives you.">
              <TextArea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe your organization's mission, history, and the communities you serve…"
                rows={5} {...fo('description')}/>
            </Field>

            <Field label="What we need help with" hint="This is the most important field for matching. Be specific about skills and responsibilities.">
              <TextArea value={form.helpNeeded} onChange={e => set('helpNeeded', e.target.value)}
                placeholder="e.g. We need a developer to rebuild our volunteer coordination tool in React. The ideal person is comfortable with databases and can work independently…"
                rows={4} {...fo('helpNeeded')}/>
            </Field>
          </div>
        </Section>

        {/* 3. FOCUS & SKILLS */}
        <Section title="Focus Areas & Skills" subtitle="Tags that describe your organization">
          <Field label="Tags / causes" hint="Press Enter or comma after each tag.">
            <TagInput value={form.tags} onChange={v => set('tags', v)}
              placeholder="Youth, Technology, Education, Environment…"/>
          </Field>
        </Section>

        {/* 4. CONNECT & SOCIAL */}
        <Section title="Web & Social Presence" subtitle="Where people can learn more about you">
          <div className="flex flex-col gap-6">
            {[
              { k:'website',   label:'Website',   placeholder:'https://yourorg.org'          },
              { k:'instagram', label:'Instagram', placeholder:'instagram.com/yourorg'        },
              { k:'twitter',   label:'Twitter / X',   placeholder:'twitter.com/yourorg'          },
            ].map(({ k, label, placeholder }) => (
              <Field key={k} label={label}>
                <TextInput value={form[k]} onChange={e => set(k, e.target.value)}
                  placeholder={placeholder} {...fo(k)}/>
              </Field>
            ))}
          </div>
        </Section>

        {/* Bottom actions */}
        <div className="flex gap-3 pb-8 pt-4">
          <button onClick={() => navigate('/profile/ngo')}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold border text-[#4B6382] hover:bg-[#F0F1F3] transition-colors"
            style={{ borderColor:'rgba(13,24,61,0.1)' }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 flex-1"
            style={{ background:'#FFB703', boxShadow:'0 4px 16px rgba(255,183,3,0.28)' }}>
            {saving ? <><Check size={14}/>Saved!</> : 'Save changes'}
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
