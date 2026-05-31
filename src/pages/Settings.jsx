import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SKILL_CATS as _SKILL_CATS, ALL_SKILLS as _ALL_SKILLS, groupSkills } from '../data/skills'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  TrendingUp, MessageCircle, Settings as SettingsIcon, Briefcase, Users, BarChart2,
  User, Bell, Lock, Globe, Palette, LogOut, ChevronRight, Camera, Check, Pencil,
  X, Plus, Link as LinkIcon, Search,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

const STUDENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/dashboard/student' },
  { icon: Zap,             label: 'Matches',      to: '/matches'           },
  { icon: Briefcase,       label: 'Opportunities',to: '/opportunities'     },
  { icon: FileText,        label: 'Applications', to: '/applications'      },
  { icon: MessageSquare,   label: 'Interviews',   to: '/interviews'        },
  { icon: Bookmark,        label: 'Saved',        to: '/saved'             },
  { icon: MessageCircle,   label: 'Messages',     to: '/messages', badge: '3' },
  { icon: SettingsIcon,    label: 'Settings',     to: '/settings'          },
]
const NGO_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/dashboard/ngo'  },
  { icon: Briefcase,       label: 'Opportunities', to: '/opportunities'  },
  { icon: Users,           label: 'Applicants',    to: '/applicants'     },
  { icon: Zap,             label: 'Matches',       to: '/matches'        },
  { icon: MessageSquare,   label: 'Interviews',    to: '/interviews'     },
  { icon: BarChart2,       label: 'Analytics',     to: '/analytics'      },
  { icon: MessageCircle,   label: 'Messages',      to: '/messages', badge: '2' },
  { icon: SettingsIcon,    label: 'Settings',      to: '/settings'       },
]

const SECTIONS = [
  { id: 'profile',       icon: User,   label: 'Profile'        },
  { id: 'notifications', icon: Bell,   label: 'Notifications'  },
  { id: 'privacy',       icon: Lock,   label: 'Privacy'        },
  { id: 'language',      icon: Globe,  label: 'Language'       },
  { id: 'appearance',    icon: Palette,label: 'Appearance'     },
]

const NOTIF_OPTIONS = [
  { key: 'new_match',     label: 'New match found',            def: true  },
  { key: 'msg',          label: 'New message received',        def: true  },
  { key: 'app_update',   label: 'Application status update',   def: true  },
  { key: 'interview',    label: 'Interview reminder',          def: true  },
  { key: 'weekly',       label: 'Weekly digest',               def: false },
  { key: 'marketing',    label: 'Tips and platform updates',   def: false },
]

// ─── Skill / Language data ─────────────────────────────────────────────────────

const SKILL_CATS = _SKILL_CATS
const ALL_SKILLS = _ALL_SKILLS

const LANG_OPTIONS = [
  {label:'Amharic',native:'አማርኛ'},{label:'Arabic',native:'العربية'},
  {label:'Azerbaijani',native:'Azərbaycan dili'},{label:'Bengali',native:'বাংলা'},
  {label:'Burmese',native:'ဗမာစာ'},{label:'Chinese',native:'中文'},
  {label:'Czech',native:'Čeština'},{label:'Dutch',native:'Nederlands'},
  {label:'English',native:'English'},{label:'French',native:'Français'},
  {label:'German',native:'Deutsch'},{label:'Greek',native:'Ελληνικά'},
  {label:'Gujarati',native:'ગુજરાતી'},{label:'Hausa',native:'Hausa'},
  {label:'Hebrew',native:'עברית'},{label:'Hindi',native:'हिन्दी'},
  {label:'Hungarian',native:'Magyar'},
  {label:'Igbo',native:'Igbo'},{label:'Indonesian',native:'Bahasa Indonesia'},
  {label:'Italian',native:'Italiano'},{label:'Japanese',native:'日本語'},
  {label:'Javanese',native:'Basa Jawa'},{label:'Kannada',native:'ಕನ್ನಡ'},
  {label:'Korean',native:'한국어'},{label:'Kurdish',native:'Kurdî'},
  {label:'Malay',native:'Bahasa Melayu'},{label:'Malayalam',native:'മലയാളം'},
  {label:'Marathi',native:'मराठी'},{label:'Nepali',native:'नेपाली'},
  {label:'Oriya',native:'ଓଡ଼ିଆ'},{label:'Persian',native:'فارسی'},
  {label:'Polish',native:'Polski'},{label:'Portuguese',native:'Português'},
  {label:'Punjabi',native:'ਪੰਜਾਬੀ'},{label:'Romanian',native:'Română'},
  {label:'Russian',native:'Русский'},{label:'Serbian',native:'Српски'},
  {label:'Sinhala',native:'සිංහල'},{label:'Spanish',native:'Español'},
  {label:'Sundanese',native:'Basa Sunda'},{label:'Swahili',native:'Kiswahili'},
  {label:'Tagalog',native:'Tagalog'},{label:'Tamil',native:'தமிழ்'},
  {label:'Telugu',native:'తెలుగు'},{label:'Thai',native:'ไทย'},
  {label:'Turkish',native:'Türkçe'},{label:'Ukrainian',native:'Українська'},
  {label:'Urdu',native:'اردو'},{label:'Uzbek',native:"Oʻzbekcha"},
  {label:'Vietnamese',native:'Tiếng Việt'},{label:'Yoruba',native:'Yorùbá'},
].sort((a,b) => a.label.localeCompare(b.label))


const SKILL_LEVELS = [
  { label:'Beginner',     desc:'Still learning',          color:'#6B7280', bg:'rgba(107,114,128,0.09)' },
  { label:'Intermediate', desc:'Can work independently',  color:'#3B82F6', bg:'rgba(59,130,246,0.09)'  },
  { label:'Advanced',     desc:'Strong & reliable',       color:'#D99E00', bg:'rgba(255,183,3,0.09)'   },
  { label:'Expert',       desc:'Can mentor others',       color:'#059669', bg:'rgba(16,185,129,0.09)'  },
]

const LANG_LEVELS = [
  { label:'Basic',  desc:'Simple conversations',          color:'#6B7280', bg:'rgba(107,114,128,0.09)' },
  { label:'Fluent', desc:'Comfortable in most situations',color:'#D99E00', bg:'rgba(255,183,3,0.09)'   },
  { label:'Native', desc:'Mother tongue',                 color:'#059669', bg:'rgba(16,185,129,0.09)'  },
]

// ─── TagLevelPicker ───────────────────────────────────────────────────────────

function TagLevelPicker({ label, items, setItems, levels, placeholder, skillCats, langOptions }) {
  const [query, setQuery]       = useState('')
  const [open, setOpen]         = useState(false)
  const [pending, setPending]   = useState(null)
  const [customMode, setCustomMode] = useState(false)
  const [customVal, setCustomVal]   = useState('')
  const inputRef    = useRef(null)
  const customRef   = useRef(null)
  const wrapRef     = useRef(null)
  const isLang      = !!langOptions

  useEffect(() => {
    function onDown(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setCustomMode(false) } }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => { if (customMode) customRef.current?.focus() }, [customMode])

  const added = new Set(items.map(i => i.name))
  function pick(name) { setPending({ name }); setQuery(''); setOpen(false); setCustomMode(false); setCustomVal('') }
  function confirmLevel(level) { setItems(p => [...p, { name: pending.name, level }]); setPending(null) }
  function remove(name) { setItems(p => p.filter(i => i.name !== name)) }

  // ── Build dropdown rows ──
  let rows = []
  if (isLang) {
    rows = langOptions
      .filter(l => {
        const q = query.toLowerCase()
        return (l.label.toLowerCase().includes(q) || l.native.toLowerCase().includes(q)) && !added.has(l.label)
      })
      .slice(0, 60)
      .map(l => (
        <button key={l.label} onClick={() => pick(l.label)}
          className="w-full text-left px-4 py-2.5 text-[12px] text-[#0D183D] hover:bg-[#F8F9FB] transition-colors">
          {l.label}
        </button>
      ))
  } else if (query) {
    const matches = ALL_SKILLS.filter(s => s.toLowerCase().includes(query.toLowerCase()) && !added.has(s)).slice(0, 14)
    rows = [
      ...matches.map(s => (
        <button key={s} onClick={() => pick(s)}
          className="w-full text-left px-4 py-2.5 text-[12px] text-[#0D183D] hover:bg-[#F8F9FB] transition-colors">
          {s}
        </button>
      )),
      <button key="_custom" onClick={() => pick(query.trim())}
        className="w-full text-left px-4 py-2.5 text-[12px] flex items-center gap-2 hover:bg-[#FFFBEA] transition-colors border-t border-[rgba(13,24,61,0.06)]"
        style={{ color:'#D99E00' }}>
        <Plus size={11}/> Add &ldquo;{query.trim()}&rdquo; as custom skill
      </button>,
    ]
  } else {
    rows = [
      ...skillCats.map(cat => {
        const catItems = cat.items.filter(s => !added.has(s))
        if (!catItems.length) return null
        return (
          <div key={cat.cat}>
            <p className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest"
              style={{ color: cat.color, background: cat.bg }}>
              {cat.cat}
            </p>
            {catItems.map(s => (
              <button key={s} onClick={() => pick(s)}
                className="w-full text-left px-4 py-2 text-[12px] text-[#0D183D] hover:bg-[#F8F9FB] transition-colors">
                {s}
              </button>
            ))}
          </div>
        )
      }).filter(Boolean),
      <div key="_other" className="border-t border-[rgba(13,24,61,0.06)]">
        {customMode ? (
          <div className="px-4 py-3 flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-[#0D183D]">Type your custom skill:</p>
            <div className="flex gap-2">
              <input ref={customRef} value={customVal}
                onChange={e => setCustomVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customVal.trim()) pick(customVal.trim())
                  if (e.key === 'Escape') { setCustomMode(false); setCustomVal('') }
                }}
                placeholder="e.g. Sign Language, Woodworking…"
                className="flex-1 px-3 py-2 rounded-lg text-[12px] outline-none border"
                style={{ borderColor:'rgba(13,24,61,0.15)' }}
              />
              <button onClick={() => customVal.trim() && pick(customVal.trim())}
                disabled={!customVal.trim()}
                className="px-3 py-2 rounded-lg text-[12px] font-bold text-white disabled:opacity-40 transition-opacity"
                style={{ background:'#FFB703' }}>
                Add
              </button>
            </div>
            <button onClick={() => { setCustomMode(false); setCustomVal('') }}
              className="text-[11px] text-[#9CA3AF] hover:text-[#4B6382] transition-colors text-left">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setCustomMode(true)}
            className="w-full text-left px-4 py-2.5 text-[12px] flex items-center gap-1.5 hover:bg-[#FFFBEA] transition-colors"
            style={{ color:'#D99E00' }}>
            <Plus size={11}/> Other – add a custom skill
          </button>
        )}
      </div>,
    ]
  }

  return (
    <div>
      <label className="block text-[12px] font-extrabold text-[#0D183D] mb-3">{label}</label>

      {/* Tags — skills grouped by category, languages flat */}
      {items.length > 0 && (
        <div className="mb-3">
          {isLang ? (
            <div className="flex flex-wrap gap-2">
              {items.map(item => {
                const lv = levels.find(l => l.label === item.level)
                return (
                  <span key={item.name}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-xl text-[11px] font-semibold border bg-white shadow-sm"
                    style={{ borderColor: lv ? `${lv.color}40` : 'rgba(13,24,61,0.1)', color: '#0D183D' }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: lv?.color || '#CBD5E1' }}/>
                    {item.name}
                    {lv && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ background: lv.bg, color: lv.color }}>{lv.label}</span>
                    )}
                    <button onClick={() => remove(item.name)}
                      className="ml-0.5 opacity-50 hover:opacity-100 hover:text-red-400 transition-all">
                      <X size={10}/>
                    </button>
                  </span>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {groupSkills(items).map(({ cat, items: catItems }) => (
                <div key={cat.cat}>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1.5"
                    style={{ color: cat.color }}>
                    {cat.cat}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {catItems.map(item => {
                      const lv = levels.find(l => l.label === item.level)
                      return (
                        <span key={item.name}
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-xl text-[11px] font-semibold border shadow-sm"
                          style={{ background: cat.bg, borderColor: `${cat.color}40`, color: cat.color }}>
                          {item.name}
                          {lv && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                              style={{ background: lv.bg, color: lv.color }}>{lv.label}</span>
                          )}
                          <button onClick={() => remove(item.name)}
                            className="ml-0.5 opacity-50 hover:opacity-100 hover:text-red-400 transition-all">
                            <X size={10}/>
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Level picker */}
      {pending && (
        <div className="rounded-2xl border mb-3 overflow-hidden"
          style={{ borderColor:'rgba(13,24,61,0.09)', background:'#FAFAFA' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor:'rgba(13,24,61,0.06)' }}>
            <p className="text-[12px] text-[#4B6382]">
              {isLang ? 'Your level in' : 'Your proficiency in'}{' '}
              <span className="font-bold text-[#0D183D]">{pending.name}</span>
            </p>
          </div>
          <div className="grid p-3 gap-2" style={{ gridTemplateColumns:`repeat(${levels.length}, 1fr)` }}>
            {levels.map(l => (
              <button key={l.label} onClick={() => confirmLevel(l.label)}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all hover:scale-[1.03] active:scale-95"
                style={{ borderColor:`${l.color}40`, background: l.bg }}>
                <span className="text-[12px] font-extrabold" style={{ color: l.color }}>{l.label}</span>
                <span className="text-[9px] leading-tight" style={{ color:`${l.color}99` }}>{l.desc}</span>
              </button>
            ))}
          </div>
          <div className="px-4 pb-3">
            <button onClick={() => setPending(null)}
              className="text-[11px] text-[#9CA3AF] hover:text-[#4B6382] transition-colors">
              ← Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search input + dropdown */}
      {!pending && (
        <div ref={wrapRef} className="relative">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-text"
            style={{ background:'white', borderColor: open ? '#FFB703' : 'rgba(13,24,61,0.1)' }}
            onClick={() => { setOpen(true); inputRef.current?.focus() }}>
            <Search size={13} className="text-[#9CA3AF] shrink-0"/>
            <input ref={inputRef} value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-[12px] text-[#0D183D] outline-none placeholder-[#9CA3AF]"
            />
            {query && (
              <button onClick={e => { e.stopPropagation(); setQuery('') }}
                className="text-[#9CA3AF] hover:text-[#4B6382] transition-colors shrink-0">
                <X size={12}/>
              </button>
            )}
          </div>

          {open && rows.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-20 bg-white rounded-2xl border border-[rgba(13,24,61,0.09)] shadow-[0_12px_40px_rgba(13,24,61,0.13)] overflow-hidden max-h-56 overflow-y-auto">
              {rows}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      role="switch" aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative inline-flex items-center w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ background: on ? '#FFB703' : 'rgba(13,24,61,0.15)' }}>
      <span className="inline-block w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(4px)' }} />
    </button>
  )
}

function validatePhone(phone) {
  if (!phone || !phone.trim()) return null
  const digits = phone.replace(/[\s\-().+]/g, '')
  if (!/^\d{7,15}$/.test(digits)) return 'Please enter a valid phone number'
  return null
}

export default function Settings() {
  const { user, profile, setProfile } = useApp()
  const navItems = user?.role === 'ngo' ? NGO_NAV : STUDENT_NAV
  const [section, setSection] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [phoneErr, setPhoneErr] = useState('')
  const [phone, setPhone] = useState(profile?.phone || '')
  const displayName = profile?.name || user?.name || ''
  const [notifs, setNotifs] = useState(() =>
    Object.fromEntries(NOTIF_OPTIONS.map(o => [o.key, o.def]))
  )
  const isStudent = user?.role !== 'ngo'
  const [skills, setSkills] = useState(() =>
    (profile?.skills || []).map(s => typeof s === 'string' ? { name: s, level: '' } : s)
  )
  const [languages, setLanguages] = useState(() =>
    (profile?.languages || []).map(l => typeof l === 'string' ? { name: l, level: '' } : { name: l.lang || l.name, level: l.level || '' })
  )
  const [linkedin, setLinkedin] = useState(profile?.links?.linkedin || profile?.linkedin || '')
  const [portfolio, setPortfolio] = useState(profile?.links?.portfolio || profile?.portfolio || '')
  const [github, setGithub]       = useState(profile?.links?.github || profile?.github || '')
  const [country, setCountry]     = useState(profile?.country || '')
  const [field, setField]         = useState(profile?.field || '')
  const [experience, setExperience] = useState(profile?.experience || '')
  const [goals, setGoals]         = useState(profile?.goals || '')
  const [interests, setInterests] = useState(() => {
    const v = profile?.interests
    if (Array.isArray(v)) return v
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
    return []
  })
  const [interestInput, setInterestInput] = useState('')
  const [sharing, setSharing] = useState({
    bio: true, skills: true, languages: true, links: true, phone: false, country: true,
  })

  function handleSave() {
    const err = validatePhone(phone)
    if (err) { setPhoneErr(err); return }
    setPhoneErr('')
    if (setProfile) setProfile(p => ({ ...p, phone: phone.trim() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
      <div className="px-8 py-8">
        <div className="mb-7">
          <h1 className="text-[1.2rem] font-extrabold text-[#0D183D]">Settings</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">Manage your account preferences</p>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-5">
          {/* Left nav */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-2 h-fit">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  section === s.id ? 'bg-[#0D183D] text-white' : 'text-[#4B6382] hover:bg-[#F8F9FB] hover:text-[#0D183D]'
                }`}>
                <s.icon size={14} strokeWidth={section === s.id ? 2.5 : 1.8} />
                {s.label}
                <ChevronRight size={12} className="ml-auto opacity-40" />
              </button>
            ))}
          </div>

          {/* Content */}
          <motion.div key={section} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.15 }}
            className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-7 min-h-[540px]">

            {section === 'profile' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-[15px] font-extrabold text-[#0D183D]">Profile</h2>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8 pb-7" style={{ borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
                  <div className="relative">
                    <GradientAvatar name={displayName} size={72} radius="1rem" />
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FFB703] flex items-center justify-center text-white shadow-sm hover:bg-[#D99E00] transition-colors">
                      <Camera size={12}/>
                    </button>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0D183D]">{displayName}</p>
                    <p className="text-[12px] text-[#4B6382]">{user?.email}</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Full name</label>
                    <input defaultValue={displayName} placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] outline-none transition-all"
                      style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)' }}
                      onFocus={e => e.target.style.borderColor='#FFB703'}
                      onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'} />
                  </div>

                  {/* Email — read only */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Email</label>
                    <input value={user?.email || ''} readOnly
                      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none cursor-default"
                      style={{ background:'rgba(13,24,61,0.03)', border:'1.5px solid rgba(13,24,61,0.07)', color:'#4B6382' }}
                    />
                  </div>

                  {/* Skills — student only */}
                  {isStudent && (
                    <TagLevelPicker
                      label="Skills"
                      items={skills}
                      setItems={setSkills}
                      skillCats={SKILL_CATS}
                      levels={SKILL_LEVELS}
                      placeholder="Search skills…"
                    />
                  )}

                  {/* Languages — student only */}
                  {isStudent && (
                    <TagLevelPicker
                      label="Languages"
                      items={languages}
                      setItems={setLanguages}
                      langOptions={LANG_OPTIONS}
                      levels={LANG_LEVELS}
                      placeholder="Search languages…"
                    />
                  )}

                  {/* Interests — student only */}
                  {isStudent && (
                    <div>
                      <label className="block text-[12px] font-semibold text-[#0D183D] mb-2">Interests & Causes</label>
                      {interests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {interests.map(i => (
                            <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border"
                              style={{ background:'rgba(255,183,3,0.08)', borderColor:'rgba(255,183,3,0.25)', color:'#92610a' }}>
                              {i}
                              <button onClick={() => setInterests(p => p.filter(x => x !== i))}
                                className="opacity-50 hover:opacity-100 hover:text-red-400 transition-all">
                                <X size={10}/>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input value={interestInput} onChange={e => setInterestInput(e.target.value)}
                          onKeyDown={e => {
                            if ((e.key === 'Enter' || e.key === ',') && interestInput.trim()) {
                              e.preventDefault()
                              const v = interestInput.trim().replace(/,$/, '')
                              if (!interests.includes(v)) setInterests(p => [...p, v])
                              setInterestInput('')
                            }
                          }}
                          placeholder="e.g. Education, Climate, Youth…"
                          className="flex-1 px-4 py-2.5 rounded-xl text-[12px] text-[#0D183D] outline-none transition-all"
                          style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)' }}
                          onFocus={e => e.target.style.borderColor='#FFB703'}
                          onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'}
                        />
                      </div>
                      <p className="text-[10px] text-[#4B6382] mt-1">Press Enter or comma to add</p>
                    </div>
                  )}

                  {/* Experience — student only */}
                  {isStudent && (
                    <div>
                      <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Experience</label>
                      <textarea value={experience} onChange={e => setExperience(e.target.value)}
                        placeholder="Projects, internships, volunteer work — everything counts…" rows={4}
                        className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] resize-none outline-none transition-all"
                        style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)', lineHeight:1.6 }}
                        onFocus={e => e.target.style.borderColor='#FFB703'}
                        onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'} />
                    </div>
                  )}

                  {/* Goals — student only */}
                  {isStudent && (
                    <div>
                      <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Goals</label>
                      <textarea value={goals} onChange={e => setGoals(e.target.value)}
                        placeholder="What do you want to achieve through this experience?" rows={3}
                        className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] resize-none outline-none transition-all"
                        style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)', lineHeight:1.6 }}
                        onFocus={e => e.target.style.borderColor='#FFB703'}
                        onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'} />
                    </div>
                  )}

                  {/* Links — student only */}
                  {isStudent && (
                    <div className="flex flex-col gap-3">
                      <label className="block text-[12px] font-semibold text-[#0D183D]">
                        Links <span className="text-[11px] font-normal text-[#4B6382]">optional</span>
                      </label>
                      {[
                        { key: 'linkedin',  label: 'LinkedIn',  val: linkedin,  set: setLinkedin,  ph: 'https://linkedin.com/in/yourname' },
                        { key: 'github',    label: 'GitHub',    val: github,    set: setGithub,    ph: 'https://github.com/yourname'     },
                        { key: 'portfolio', label: 'Portfolio', val: portfolio, set: setPortfolio, ph: 'https://yourportfolio.com'        },
                      ].map(({ key, label, val, set, ph }) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-[#4B6382] w-16 shrink-0">{label}</span>
                          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                            style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)' }}>
                            <LinkIcon size={12} className="text-[#4B6382] shrink-0"/>
                            <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                              className="flex-1 bg-transparent text-[12px] text-[#0D183D] outline-none placeholder-[#4B6382]/40"
                              onFocus={e => e.target.parentElement.style.borderColor='#FFB703'}
                              onBlur={e => e.target.parentElement.style.borderColor='rgba(13,24,61,0.1)'}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Phone */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Phone number</label>
                    <input type="tel" inputMode="tel" autoComplete="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setPhoneErr('') }}
                      placeholder="e.g. +972 50 123 4567"
                      className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] outline-none transition-all"
                      style={{ background:'#F8F9FB', border:`1.5px solid ${phoneErr ? '#EF4444' : 'rgba(13,24,61,0.1)'}` }}
                      onFocus={e => e.target.style.borderColor = phoneErr ? '#EF4444' : '#FFB703'}
                      onBlur={e => e.target.style.borderColor = phoneErr ? '#EF4444' : 'rgba(13,24,61,0.1)'}
                    />
                    {phoneErr && <p className="text-red-500 text-[11px] mt-1.5">{phoneErr}</p>}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Country</label>
                    <input value={country} onChange={e => setCountry(e.target.value)}
                      placeholder="e.g. Israel, United States…"
                      className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] outline-none transition-all"
                      style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)' }}
                      onFocus={e => e.target.style.borderColor='#FFB703'}
                      onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Bio</label>
                    <textarea defaultValue={profile?.description || profile?.bio || ''} placeholder="A sentence or two about you…" rows={3}
                      className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] resize-none outline-none transition-all"
                      style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)', lineHeight:1.6 }}
                      onFocus={e => e.target.style.borderColor='#FFB703'}
                      onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'} />
                  </div>

                  {/* Field of study — students only */}
                  {isStudent && (
                    <div>
                      <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Field of study</label>
                      <input value={field} onChange={e => setField(e.target.value)} placeholder="e.g. Computer Science"
                        className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] outline-none transition-all"
                        style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)' }}
                        onFocus={e => e.target.style.borderColor='#FFB703'}
                        onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'} />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: saved ? '#10B981' : '#0D183D' }}>
                    {saved ? <><Check size={13}/> Saved</> : 'Save changes'}
                  </button>
                </div>
              </div>
            )}

            {section === 'notifications' && (
              <div>
                <h2 className="text-[15px] font-extrabold text-[#0D183D] mb-6">Notifications</h2>
                <div className="flex flex-col gap-4">
                  {NOTIF_OPTIONS.map(o => (
                    <div key={o.key} className="flex items-center justify-between py-3"
                      style={{ borderBottom: '1px solid rgba(13,24,61,0.06)' }}>
                      <div>
                        <p className="text-[13px] font-semibold text-[#0D183D]">{o.label}</p>
                      </div>
                      <Toggle on={notifs[o.key]} onChange={v => setNotifs(p => ({ ...p, [o.key]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'privacy' && (
              <div>
                <h2 className="text-[15px] font-extrabold text-[#0D183D] mb-6">Privacy</h2>

                {/* General */}
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-3">General</p>
                {[
                  { key: 'visibility',    label: 'Profile visibility',  desc: 'Allow NGOs to discover your profile in search',   def: true  },
                  { key: 'matchScores',   label: 'Show match scores',   desc: 'Display your compatibility % to matched NGOs',    def: true  },
                  { key: 'activityStatus',label: 'Activity status',     desc: 'Show when you were last active on Hive',          def: false },
                ].map(o => (
                  <div key={o.key} className="flex items-start justify-between py-4"
                    style={{ borderBottom: '1px solid rgba(13,24,61,0.06)' }}>
                    <div className="flex-1 pr-8">
                      <p className="text-[13px] font-semibold text-[#0D183D] mb-0.5">{o.label}</p>
                      <p className="text-[12px] text-[#4B6382]">{o.desc}</p>
                    </div>
                    <Toggle on={o.def} onChange={() => {}} />
                  </div>
                ))}

                {/* What to share on profile */}
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#4B6382] mt-7 mb-3">What to show on your profile</p>
                <p className="text-[12px] text-[#4B6382] mb-4">Choose which sections are visible to NGOs when they view your profile.</p>
                {[
                  { key: 'bio',       label: 'Bio',              desc: 'Your personal summary and goals'      },
                  { key: 'skills',    label: 'Skills',           desc: 'Your skill set and proficiency levels' },
                  { key: 'languages', label: 'Languages',        desc: 'Languages you speak and your levels'  },
                  { key: 'links',     label: 'LinkedIn & Portfolio', desc: 'Your external profile links'      },
                  { key: 'country',   label: 'Country',          desc: 'Your location / country'              },
                  { key: 'phone',     label: 'Phone number',     desc: 'Your contact phone number'            },
                ].map(o => (
                  <div key={o.key} className="flex items-start justify-between py-3.5"
                    style={{ borderBottom: '1px solid rgba(13,24,61,0.06)' }}>
                    <div className="flex-1 pr-8">
                      <p className="text-[13px] font-semibold text-[#0D183D] mb-0.5">{o.label}</p>
                      <p className="text-[12px] text-[#4B6382]">{o.desc}</p>
                    </div>
                    <Toggle on={sharing[o.key]} onChange={v => setSharing(p => ({ ...p, [o.key]: v }))} />
                  </div>
                ))}
              </div>
            )}

            {(section === 'language' || section === 'appearance') && (
              <div>
                <h2 className="text-[15px] font-extrabold text-[#0D183D] mb-6">
                  {section === 'language' ? 'Language' : 'Appearance'}
                </h2>
                <p className="text-[13px] text-[#4B6382]">More options coming soon.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
  )
}
