import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  User, Bell, Lock, Globe, Palette, Camera, Check, Pencil,
  ChevronRight, Sparkles, Shield, Eye, EyeOff, Moon, Sun,
  Smartphone, Mail, Clock, AlertCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'profile',       icon: User,        label: 'Profile',       desc: 'Name, photo & contact info'   },
  { id: 'notifications', icon: Bell,        label: 'Notifications', desc: 'Alerts, digests & reminders'  },
  { id: 'privacy',       icon: Lock,        label: 'Privacy',       desc: 'Visibility & data sharing'    },
  { id: 'language',      icon: Globe,       label: 'Language',      desc: 'Language & region settings'   },
  { id: 'appearance',    icon: Palette,     label: 'Appearance',    desc: 'Theme & display preferences'  },
]

const NOTIF_OPTIONS = [
  { key: 'new_match',   label: 'New match found',          desc: 'When Hive finds a new high-quality match for you',    def: true  },
  { key: 'msg',         label: 'New message',              desc: 'When you receive a message from an NGO or student',   def: true  },
  { key: 'app_update',  label: 'Application status update',desc: 'When your application status changes',                def: true  },
  { key: 'interview',   label: 'Interview reminder',       desc: '24 hours before a scheduled interview',               def: true  },
  { key: 'weekly',      label: 'Weekly digest',            desc: 'A summary of your activity and new opportunities',    def: false },
  { key: 'marketing',   label: 'Tips & platform updates',  desc: 'Feature announcements and productivity tips',         def: false },
]

// ─── Skill / Language data ─────────────────────────────────────────────────────

const PRIVACY_OPTIONS = [
  { key: 'discoverable', label: 'Profile visibility',   desc: 'Allow NGOs to discover your profile in search results', def: true  },
  { key: 'show_score',   label: 'Show match scores',    desc: 'Display your compatibility % to matched organizations',  def: true  },
  { key: 'activity',     label: 'Activity status',      desc: 'Show when you were last active on Hive',                def: false },
]

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ on, onChange }) {
  return (
    <button
      role="switch" aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative inline-flex items-center shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFB703] focus:ring-offset-2"
      style={{ background: on ? '#FFB703' : 'rgba(13,24,61,0.15)' }}>
      <span
        className="inline-block w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? 'translateX(23px)' : 'translateX(4px)' }}
      />
    </button>
  )
}

// ─── Section menu item ────────────────────────────────────────────────────────

function MenuItem({ section: s, active, onClick }) {
  return (
    <button
      key={s.id}
      onClick={() => onClick(s.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-left group ${
        active ? 'bg-[#0D183D] text-white' : 'text-[#4B6382] hover:bg-[rgba(13,24,61,0.04)] hover:text-[#0D183D]'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        active ? 'bg-white/10' : 'bg-[rgba(13,24,61,0.05)] group-hover:bg-[rgba(13,24,61,0.08)]'
      }`}>
        <s.icon size={15} strokeWidth={active ? 2.2 : 1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold leading-snug ${active ? 'text-white' : 'text-[#0D183D]'}`}>{s.label}</p>
        <p className={`text-[11px] truncate leading-snug mt-0.5 ${active ? 'text-white/50' : 'text-[#4B6382]'}`}>{s.desc}</p>
      </div>
      <ChevronRight size={13} className={`shrink-0 transition-opacity ${active ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`} />
    </button>
  )
}

// ─── Phone validation ─────────────────────────────────────────────────────────

function validatePhone(phone) {
  if (!phone?.trim()) return null
  const digits = phone.replace(/[\s\-()+.]/g, '')
  if (!/^\d{7,15}$/.test(digits)) return 'Please enter a valid phone number'
  return null
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({ user, profile, setProfile }) {
  const [saved, setSaved]     = useState(false)
  const [phoneErr, setPhoneErr] = useState('')
  const [phone, setPhone]     = useState(profile?.phone || '')
  const displayName = profile?.name || user?.name || ''

  function handleSave() {
    const err = validatePhone(phone)
    if (err) { setPhoneErr(err); return }
    setPhoneErr('')
    setProfile?.(p => ({ ...p, phone: phone.trim() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] outline-none transition-all placeholder-[#4B6382]/40'
  const inputStyle = (err) => ({
    background: '#F8F9FB',
    border: `1.5px solid ${err ? '#EF4444' : 'rgba(13,24,61,0.1)'}`,
  })
  const onFocus = (e, err) => { e.target.style.borderColor = err ? '#EF4444' : '#FFB703' }
  const onBlur  = (e, err) => { e.target.style.borderColor = err ? '#EF4444' : 'rgba(13,24,61,0.1)' }

  return (
    <div className="flex flex-col gap-8">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#0D183D]">Profile</h2>
          <p className="text-[13px] text-[#4B6382] mt-0.5">Update your personal information and contact details</p>
        </div>
        <Link
          to={user?.role === 'ngo' ? '/profile/ngo/edit' : '/profile/student/edit'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-[rgba(13,24,61,0.03)] shrink-0"
          style={{ color: '#4B6382', borderColor: 'rgba(13,24,61,0.12)' }}>
          <Pencil size={12} /> Edit full profile
        </Link>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-5 pb-7" style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
        <div className="relative shrink-0">
          <GradientAvatar name={displayName} size={80} radius="1.1rem" />
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FFB703] flex items-center justify-center text-white shadow-md hover:bg-[#D99E00] transition-colors">
            <Camera size={12} />
          </button>
        </div>
        <div>
          <p className="text-[16px] font-bold text-[#0D183D] mb-0.5">{displayName}</p>
          <p className="text-[13px] text-[#4B6382] mb-2">{user?.email}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Account active
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 capitalize">
              {user?.role === 'ngo' ? 'NGO' : 'Student'}
            </span>
          </div>
        </div>
      </div>

      {/* Form fields — 2-col grid on desktop */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Full name</label>
          <input
            defaultValue={displayName}
            placeholder="Your full name"
            className={inputCls}
            style={inputStyle(false)}
            onFocus={e => onFocus(e, false)}
            onBlur={e => onBlur(e, false)}
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Email address</label>
          <input
            defaultValue={user?.email || ''}
            placeholder="your@email.com"
            type="email"
            className={inputCls}
            style={{ ...inputStyle(false), background: 'rgba(13,24,61,0.03)', color: '#4B6382' }}
            disabled
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">
            {user?.role === 'ngo' ? 'Organization name' : 'University / Institution'}
          </label>
          <input
            defaultValue={
              user?.role === 'ngo'
                ? profile?.name || ''
                : profile?.university || ''
            }
            placeholder={user?.role === 'ngo' ? 'Your organization' : 'Your university'}
            className={inputCls}
            style={inputStyle(false)}
            onFocus={e => onFocus(e, false)}
            onBlur={e => onBlur(e, false)}
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">
            Phone number
            <span className="ml-1.5 text-[11px] font-normal text-[#4B6382]">optional</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); setPhoneErr('') }}
            placeholder="e.g. +972 50 123 4567"
            className={inputCls}
            style={inputStyle(!!phoneErr)}
            onFocus={e => onFocus(e, !!phoneErr)}
            onBlur={e => onBlur(e, !!phoneErr)}
          />
          {phoneErr && (
            <p className="flex items-center gap-1 text-red-500 text-[11px] mt-1.5">
              <AlertCircle size={11} />{phoneErr}
            </p>
          )}
        </div>

        {/* Bio spans full width */}
        <div className="sm:col-span-2">
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Bio</label>
          <textarea
            defaultValue={profile?.description || profile?.bio || ''}
            placeholder="Tell us about yourself, your goals, and what kind of work you're looking for…"
            rows={4}
            className={inputCls + ' resize-none'}
            style={{ ...inputStyle(false), lineHeight: 1.65 }}
            onFocus={e => onFocus(e, false)}
            onBlur={e => onBlur(e, false)}
          />
        </div>
      </div>

      {/* Connected account */}
      <div className="rounded-2xl border p-4 flex items-center gap-4"
        style={{ borderColor: 'rgba(13,24,61,0.08)', background: 'rgba(13,24,61,0.02)' }}>
        <div className="w-9 h-9 rounded-xl bg-white border border-[rgba(13,24,61,0.1)] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#0D183D]">Google Account</p>
          <p className="text-[11px] text-[#4B6382] truncate">{user?.email}</p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
          Connected
        </span>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(13,24,61,0.07)' }}>
        <p className="text-[12px] text-[#4B6382]">Changes are saved to your Hive account</p>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: saved ? '#10B981' : '#0D183D', boxShadow: saved ? '0 4px 14px rgba(16,185,129,0.25)' : '0 4px 14px rgba(13,24,61,0.18)' }}>
          {saved ? <><Check size={13} /> Saved!</> : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

// ─── Notifications section ────────────────────────────────────────────────────

function NotificationsSection() {
  const [notifs, setNotifs] = useState(() =>
    Object.fromEntries(NOTIF_OPTIONS.map(o => [o.key, o.def]))
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">Notifications</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">Choose which notifications you receive from Hive</p>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
        {NOTIF_OPTIONS.map((o, i) => (
          <div
            key={o.key}
            className="flex items-center justify-between px-5 py-4 gap-4 transition-colors hover:bg-[rgba(13,24,61,0.015)]"
            style={{ borderBottom: i < NOTIF_OPTIONS.length - 1 ? '1px solid rgba(13,24,61,0.06)' : 'none' }}>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0D183D] mb-0.5">{o.label}</p>
              <p className="text-[12px] text-[#4B6382] leading-snug">{o.desc}</p>
            </div>
            <Toggle on={notifs[o.key]} onChange={v => setNotifs(p => ({ ...p, [o.key]: v }))} />
          </div>
        ))}
      </div>

      <div className="rounded-xl px-4 py-3.5 flex items-start gap-3"
        style={{ background: 'rgba(255,183,3,0.06)', border: '1px solid rgba(255,183,3,0.15)' }}>
        <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: '#FFB703' }} />
        <p className="text-[12px] text-[#4B6382] leading-relaxed">
          Email notifications are sent to <strong className="text-[#0D183D]">your registered email</strong>. You can unsubscribe from any email at any time.
        </p>
      </div>
    </div>
  )
}

// ─── Privacy section ──────────────────────────────────────────────────────────

function PrivacySection() {
  const [priv, setPriv] = useState(() =>
    Object.fromEntries(PRIVACY_OPTIONS.map(o => [o.key, o.def]))
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">Privacy</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">Control who can see your profile and how your data is used</p>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
        {PRIVACY_OPTIONS.map((o, i) => (
          <div
            key={o.key}
            className="flex items-center justify-between px-5 py-4 gap-4 transition-colors hover:bg-[rgba(13,24,61,0.015)]"
            style={{ borderBottom: i < PRIVACY_OPTIONS.length - 1 ? '1px solid rgba(13,24,61,0.06)' : 'none' }}>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0D183D] mb-0.5">{o.label}</p>
              <p className="text-[12px] text-[#4B6382] leading-snug">{o.desc}</p>
            </div>
            <Toggle on={priv[o.key]} onChange={v => setPriv(p => ({ ...p, [o.key]: v }))} />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-[#4B6382]" />
          <p className="text-[13px] font-extrabold text-[#0D183D]">Data & account</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <button className="flex items-center gap-2 text-[12px] font-semibold text-[#4B6382] hover:text-[#0D183D] transition-colors w-fit">
            <ChevronRight size={12} /> Download my data
          </button>
          <button className="flex items-center gap-2 text-[12px] font-semibold text-red-400 hover:text-red-600 transition-colors w-fit">
            <ChevronRight size={12} /> Delete account
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Language section ─────────────────────────────────────────────────────────

function LanguageSection() {
  const LANGS = ['English', 'Hebrew (עברית)', 'Arabic (العربية)', 'Russian (Русский)']
  const [selected, setSelected] = useState('English')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">Language & Region</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">Choose your preferred display language</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {LANGS.map(l => (
          <button key={l} onClick={() => setSelected(l)}
            className="flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all"
            style={selected === l
              ? { borderColor: '#FFB703', background: 'rgba(255,183,3,0.05)' }
              : { borderColor: 'rgba(13,24,61,0.1)', background: '#FAFAFA' }}>
            <span className={`text-[13px] font-semibold ${selected === l ? 'text-[#0D183D]' : 'text-[#4B6382]'}`}>{l}</span>
            {selected === l && <Check size={13} style={{ color: '#FFB703' }} />}
          </button>
        ))}
      </div>

      <p className="text-[12px] text-[#4B6382]">More languages coming soon. Want to help translate Hive? <a href="#" className="text-[#FFB703] font-semibold hover:underline">Get in touch</a></p>
    </div>
  )
}

// ─── Appearance section ───────────────────────────────────────────────────────

function AppearanceSection() {
  const [theme, setTheme] = useState('light')
  const THEMES = [
    { id: 'light', icon: Sun,  label: 'Light',  desc: 'Clean white interface' },
    { id: 'dark',  icon: Moon, label: 'Dark',   desc: 'Easy on the eyes'      },
    { id: 'auto',  icon: Smartphone, label: 'System', desc: 'Follow device setting' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">Appearance</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">Customize how Hive looks for you</p>
      </div>

      <div>
        <p className="text-[12px] font-semibold text-[#0D183D] mb-3">Color theme</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all"
              style={theme === t.id
                ? { borderColor: '#FFB703', background: 'rgba(255,183,3,0.05)', boxShadow: '0 0 0 3px rgba(255,183,3,0.12)' }
                : { borderColor: 'rgba(13,24,61,0.1)', background: '#FAFAFA' }}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === t.id ? 'bg-[#FFB703]' : 'bg-[rgba(13,24,61,0.06)]'}`}>
                <t.icon size={16} className={theme === t.id ? 'text-white' : 'text-[#4B6382]'} />
              </div>
              <div>
                <p className={`text-[13px] font-bold ${theme === t.id ? 'text-[#0D183D]' : 'text-[#4B6382]'}`}>{t.label}</p>
                <p className="text-[11px] text-[#4B6382]">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl px-4 py-3.5" style={{ background: 'rgba(13,24,61,0.03)', border: '1px solid rgba(13,24,61,0.07)' }}>
        <p className="text-[12px] text-[#4B6382]">Dark mode is coming soon. Your preference is saved and will apply automatically when it launches.</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const { user, profile, setProfile } = useApp()
  const [section, setSection] = useState('profile')

  const sectionComponents = {
    profile:       <ProfileSection user={user} profile={profile} setProfile={setProfile} />,
    notifications: <NotificationsSection />,
    privacy:       <PrivacySection />,
    language:      <LanguageSection />,
    appearance:    <AppearanceSection />,
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FB]">
      <div className="max-w-[1180px] mx-auto px-8 py-8">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-[1.3rem] font-extrabold text-[#0D183D]">Settings</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">Manage your account, notifications, and preferences</p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left menu ── */}
          <aside className="w-full lg:w-[300px] lg:shrink-0 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-[0_2px_12px_rgba(13,24,61,0.05)] p-2 lg:sticky lg:top-6">
            <div className="px-2 pt-2 pb-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] px-2 pb-2">Account settings</p>
            </div>
            <div className="flex flex-col gap-0.5">
              {SECTIONS.map(s => (
                <MenuItem key={s.id} section={s} active={section === s.id} onClick={setSection} />
              ))}
            </div>
          </aside>

          {/* ── Right content ── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-[0_2px_12px_rgba(13,24,61,0.05)] p-8">
                {sectionComponents[section]}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
