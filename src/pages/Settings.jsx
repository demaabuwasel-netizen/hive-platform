import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User, Bell, Lock, Globe, Palette, Camera, Check, Pencil,
  ChevronRight, Sparkles, Shield, Eye, EyeOff, Moon, Sun,
  Smartphone, AlertCircle, LogOut, KeyRound, AlertTriangle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../contexts/ThemeContext'
import GradientAvatar from '../components/GradientAvatar'
import { updateUserRow, updatePassword } from '../services/auth'
import { SUPPORTED_LANGS } from '../i18n/index'

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'profile',       icon: User,        label: 'Profile',       desc: 'Name, photo & contact info'   },
  { id: 'security',      icon: KeyRound,    label: 'Security',      desc: 'Password & sign-in options'   },
  { id: 'notifications', icon: Bell,        label: 'Notifications', desc: 'Alerts, digests & reminders'  },
  { id: 'privacy',       icon: Lock,        label: 'Privacy',       desc: 'Visibility & data sharing'    },
  { id: 'language',      icon: Globe,       label: 'Language',      desc: 'Language & region settings'   },
  { id: 'appearance',    icon: Palette,     label: 'Appearance',    desc: 'Theme & display preferences'  },
]

const NOTIF_OPTIONS = [
  { key: 'new_match',   label: 'New match found',           desc: 'When Hive finds a new high-quality match for you',  def: true  },
  { key: 'msg',         label: 'New message',               desc: 'When you receive a message from an NGO or student', def: true  },
  { key: 'app_update',  label: 'Application status update', desc: 'When your application status changes',              def: true  },
  { key: 'interview',   label: 'Interview reminder',        desc: '24 hours before a scheduled interview',             def: true  },
  { key: 'weekly',      label: 'Weekly digest',             desc: 'A summary of your activity and new opportunities',  def: false },
  { key: 'marketing',   label: 'Tips & platform updates',   desc: 'Feature announcements and productivity tips',       def: false },
]

const PRIVACY_OPTIONS = [
  { key: 'discoverable', label: 'Profile visibility',  desc: 'Allow NGOs to discover your profile in search results', def: true  },
  { key: 'show_score',   label: 'Show match scores',   desc: 'Display your compatibility % to matched organizations',  def: true  },
  { key: 'activity',     label: 'Activity status',     desc: 'Show when you were last active on Hive',                def: false },
]

// ─── Reusable helpers ─────────────────────────────────────────────────────────

function validatePhone(phone) {
  if (!phone?.trim()) return null
  const digits = phone.replace(/[\s\-()+.]/g, '')
  if (!/^\d{7,15}$/.test(digits)) return 'Please enter a valid phone number'
  return null
}

function Toggle({ on, onChange }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className="relative inline-flex items-center shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFB703] focus:ring-offset-2"
      style={{ background: on ? '#FFB703' : 'rgba(13,24,61,0.15)' }}>
      <span className="inline-block w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? 'translateX(23px)' : 'translateX(4px)' }}/>
    </button>
  )
}

function MenuItem({ section: s, active, onClick }) {
  return (
    <button onClick={() => onClick(s.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-left group ${
        active ? 'bg-[#0D183D] text-white' : 'text-[#4B6382] hover:bg-[rgba(13,24,61,0.04)] hover:text-[#0D183D]'
      }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        active ? 'bg-white/10' : 'bg-[rgba(13,24,61,0.05)] group-hover:bg-[rgba(13,24,61,0.08)]'
      }`}>
        <s.icon size={15} strokeWidth={active ? 2.2 : 1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold leading-snug ${active ? 'text-white' : 'text-[#0D183D]'}`}>{s.label}</p>
        <p className={`text-[11px] truncate leading-snug mt-0.5 ${active ? 'text-white/50' : 'text-[#4B6382]'}`}>{s.desc}</p>
      </div>
      <ChevronRight size={13} className={`shrink-0 transition-opacity ${active ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`}/>
    </button>
  )
}

const inputBase = 'w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] outline-none transition-all placeholder-[#4B6382]/40'
const inputStyle = (err, disabled) => ({
  background: disabled ? 'rgba(13,24,61,0.03)' : '#F8F9FB',
  color: disabled ? '#4B6382' : '#0D183D',
  border: `1.5px solid ${err ? '#EF4444' : 'rgba(13,24,61,0.1)'}`,
})
const onFocus = (e, err) => { if (!e.target.disabled) e.target.style.borderColor = err ? '#EF4444' : '#FFB703' }
const onBlur  = (e, err) => { e.target.style.borderColor = err ? '#EF4444' : 'rgba(13,24,61,0.1)' }

function SaveBar({ saving, saved, error, onSave, label = 'Save changes' }) {
  return (
    <div className="flex items-center justify-between pt-5 mt-2" style={{ borderTop: '1px solid rgba(13,24,61,0.07)' }}>
      <div>
        {error && (
          <p className="flex items-center gap-1.5 text-red-500 text-[12px]">
            <AlertCircle size={12}/>{error}
          </p>
        )}
        {!error && <p className="text-[12px] text-[#4B6382]">Changes are saved to your Hive account</p>}
      </div>
      <button onClick={onSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        style={{ background: saved ? '#10B981' : '#0D183D', boxShadow: saved ? '0 4px 14px rgba(16,185,129,0.25)' : '0 4px 14px rgba(13,24,61,0.18)' }}>
        {saving ? (
          <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"/>
            Saving…</>
        ) : saved ? (
          <><Check size={13}/> Saved!</>
        ) : label}
      </button>
    </div>
  )
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({ user, profile, updateProfile, patchUser }) {
  const [name,       setName]       = useState(user?.name || '')
  const [university, setUniversity] = useState(profile?.university || '')
  const [orgName,    setOrgName]    = useState(profile?.name || '')
  const [phone,      setPhone]      = useState(profile?.phone || '')
  const [bio,        setBio]        = useState(
    user?.role === 'ngo' ? (profile?.description || '') : (profile?.bio || '')
  )
  const [phoneErr, setPhoneErr] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  const isNgo = user?.role === 'ngo'

  async function handleSave() {
    const pErr = validatePhone(phone)
    if (pErr) { setPhoneErr(pErr); return }
    setPhoneErr(''); setError('')
    setSaving(true)
    try {
      // Update display name in users table + local state
      const trimmedName = name.trim()
      if (trimmedName && trimmedName !== user?.name) {
        await updateUserRow(user.id, { name: trimmedName })
        patchUser({ name: trimmedName })
      }

      // Update role-specific profile
      const updated = isNgo
        ? { ...profile, name: orgName.trim() || profile?.name, phone: phone.trim() || null, description: bio.trim() || null }
        : { ...profile, university: university.trim(), phone: phone.trim() || null, bio: bio.trim() || null }
      await updateProfile(updated)

      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-extrabold text-[#0D183D]">Profile</h2>
          <p className="text-[13px] text-[#4B6382] mt-0.5">Update your personal information and contact details</p>
        </div>
        <Link to={isNgo ? '/profile/ngo/edit' : '/profile/student/edit'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-[rgba(13,24,61,0.03)] shrink-0"
          style={{ color: '#4B6382', borderColor: 'rgba(13,24,61,0.12)' }}>
          <Pencil size={12}/> Edit full profile
        </Link>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-5 pb-6" style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
        <div className="relative shrink-0">
          <GradientAvatar name={name || user?.name || ''} size={80} radius="1.1rem"/>
          <button
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FFB703] flex items-center justify-center text-white shadow-md hover:bg-[#D99E00] transition-colors"
            title="Photo upload coming soon">
            <Camera size={12}/>
          </button>
        </div>
        <div>
          <p className="text-[16px] font-bold text-[#0D183D] mb-0.5">{user?.name || name}</p>
          <p className="text-[13px] text-[#4B6382] mb-2">{user?.email}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Account active
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700">
              {isNgo ? 'NGO' : 'Student'}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Full name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Your full name" className={inputBase}
            style={inputStyle(false, false)}
            onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)}/>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Email address</label>
          <input value={user?.email || ''} disabled placeholder="your@email.com" type="email"
            className={inputBase} style={inputStyle(false, true)}/>
          <p className="text-[11px] text-[#4B6382] mt-1">Email cannot be changed here</p>
        </div>

        {isNgo ? (
          <div>
            <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Organization name</label>
            <input value={orgName} onChange={e => setOrgName(e.target.value)}
              placeholder="Your organization" className={inputBase}
              style={inputStyle(false, false)}
              onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)}/>
          </div>
        ) : (
          <div>
            <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">University / Institution</label>
            <input value={university} onChange={e => setUniversity(e.target.value)}
              placeholder="Your university" className={inputBase}
              style={inputStyle(false, false)}
              onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)}/>
          </div>
        )}

        <div>
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">
            Phone number <span className="ml-1 text-[11px] font-normal text-[#4B6382]">optional</span>
          </label>
          <input type="tel" inputMode="tel" autoComplete="tel"
            value={phone} onChange={e => { setPhone(e.target.value); setPhoneErr('') }}
            placeholder="e.g. +972 50 123 4567" className={inputBase}
            style={inputStyle(!!phoneErr, false)}
            onFocus={e => onFocus(e, !!phoneErr)} onBlur={e => onBlur(e, !!phoneErr)}/>
          {phoneErr && (
            <p className="flex items-center gap-1 text-red-500 text-[11px] mt-1.5">
              <AlertCircle size={11}/>{phoneErr}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">
            {isNgo ? 'About your organization' : 'Bio'}
          </label>
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            placeholder={isNgo
              ? 'Describe your mission, the communities you serve, and how you operate…'
              : 'Tell us about yourself, your goals, and what kind of work you\'re looking for…'}
            rows={4} className={inputBase + ' resize-none'}
            style={{ ...inputStyle(false, false), lineHeight: 1.65 }}
            onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)}/>
        </div>
      </div>

      {/* Connected account — only for Google/OAuth users */}
      {user?.provider && user.provider !== 'email' && (
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
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">Connected</span>
        </div>
      )}

      <SaveBar saving={saving} saved={saved} error={error} onSave={handleSave}/>
    </div>
  )
}

// ─── Security section ─────────────────────────────────────────────────────────

function SecuritySection({ user }) {
  const isEmailUser = !user?.provider || user.provider === 'email'
  const [form,    setForm]    = useState({ newPw: '', confirm: '' })
  const [show,    setShow]    = useState({ newPw: false, confirm: false })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.newPw.length < 6)       { setError('Password must be at least 6 characters.'); return }
    if (form.newPw !== form.confirm) { setError('Passwords do not match.'); return }
    setError('')
    setSaving(true)
    try {
      await updatePassword(form.newPw)
      setSaved(true)
      setForm({ newPw: '', confirm: '' })
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setError(err.message || 'Could not update password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const pwInput = (key, placeholder) => (
    <div className="relative">
      <input
        type={show[key] ? 'text' : 'password'}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setError('') }}
        placeholder={placeholder}
        autoComplete={key === 'newPw' ? 'new-password' : 'new-password'}
        className={inputBase + ' pr-11'}
        style={inputStyle(!!error, false)}
        onFocus={e => onFocus(e, !!error)} onBlur={e => onBlur(e, !!error)}/>
      <button type="button"
        onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B6382] hover:text-[#0D183D] transition-colors"
        aria-label={show[key] ? 'Hide password' : 'Show password'}>
        {show[key] ? <EyeOff size={15}/> : <Eye size={15}/>}
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">Security</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">Manage your password and sign-in method</p>
      </div>

      {isEmailUser ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-2xl border p-5 flex flex-col gap-5"
            style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
            <p className="text-[13px] font-extrabold text-[#0D183D]">Change password</p>

            <div>
              <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">New password</label>
              {pwInput('newPw', 'At least 6 characters')}
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">Confirm new password</label>
              {pwInput('confirm', 'Repeat your new password')}
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-red-500 text-[12px]">
                <AlertCircle size={12}/>{error}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving || !form.newPw || !form.confirm}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: saved ? '#10B981' : '#0D183D', boxShadow: saved ? '0 4px 14px rgba(16,185,129,0.25)' : '0 4px 14px rgba(13,24,61,0.18)' }}>
              {saving ? (
                <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"/>Updating…</>
              ) : saved ? (
                <><Check size={13}/> Password updated!</>
              ) : 'Update password'}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border p-5 flex items-start gap-3"
          style={{ borderColor: 'rgba(13,24,61,0.08)', background: 'rgba(13,24,61,0.02)' }}>
          <div className="w-9 h-9 rounded-xl bg-white border border-[rgba(13,24,61,0.1)] flex items-center justify-center shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0D183D] mb-0.5">Signed in with Google</p>
            <p className="text-[12px] text-[#4B6382] leading-relaxed">
              Your account uses Google for sign-in. Password management is handled through your Google account settings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Notifications section ────────────────────────────────────────────────────

const NOTIF_LS = 'hive_notif_prefs'

function NotificationsSection({ user }) {
  const [notifs, setNotifs] = useState(() => {
    try { return { ...Object.fromEntries(NOTIF_OPTIONS.map(o => [o.key, o.def])), ...JSON.parse(localStorage.getItem(NOTIF_LS) ?? '{}') } }
    catch { return Object.fromEntries(NOTIF_OPTIONS.map(o => [o.key, o.def])) }
  })
  const [saved, setSaved] = useState(false)

  function handleToggle(key, val) {
    const next = { ...notifs, [key]: val }
    setNotifs(next)
    try { localStorage.setItem(NOTIF_LS, JSON.stringify(next)) } catch {}
  }

  function handleSaveAll() {
    try { localStorage.setItem(NOTIF_LS, JSON.stringify(notifs)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">Notifications</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">Choose which notifications you receive from Hive</p>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
        {NOTIF_OPTIONS.map((o, i) => (
          <div key={o.key}
            className="flex items-center justify-between px-5 py-4 gap-4 transition-colors hover:bg-[rgba(13,24,61,0.015)]"
            style={{ borderBottom: i < NOTIF_OPTIONS.length - 1 ? '1px solid rgba(13,24,61,0.06)' : 'none' }}>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0D183D] mb-0.5">{o.label}</p>
              <p className="text-[12px] text-[#4B6382] leading-snug">{o.desc}</p>
            </div>
            <Toggle on={notifs[o.key]} onChange={v => handleToggle(o.key, v)}/>
          </div>
        ))}
      </div>

      <div className="rounded-xl px-4 py-3.5 flex items-start gap-3"
        style={{ background: 'rgba(255,183,3,0.06)', border: '1px solid rgba(255,183,3,0.15)' }}>
        <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: '#FFB703' }}/>
        <p className="text-[12px] text-[#4B6382] leading-relaxed">
          Email notifications are sent to <strong className="text-[#0D183D]">{user?.email || 'your registered email'}</strong>.
          You can unsubscribe at any time.
        </p>
      </div>

      <SaveBar saving={false} saved={saved} error="" onSave={handleSaveAll} label="Save preferences"/>
    </div>
  )
}

// ─── Privacy section ──────────────────────────────────────────────────────────

const PRIVACY_LS = 'hive_privacy_prefs'

function PrivacySection() {
  const [priv, setPriv] = useState(() => {
    try { return { ...Object.fromEntries(PRIVACY_OPTIONS.map(o => [o.key, o.def])), ...JSON.parse(localStorage.getItem(PRIVACY_LS) ?? '{}') } }
    catch { return Object.fromEntries(PRIVACY_OPTIONS.map(o => [o.key, o.def])) }
  })
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  function handleToggle(key, val) {
    const next = { ...priv, [key]: val }
    setPriv(next)
    try { localStorage.setItem(PRIVACY_LS, JSON.stringify(next)) } catch {}
  }

  function handleSaveAll() {
    try { localStorage.setItem(PRIVACY_LS, JSON.stringify(priv)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">Privacy</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">Control who can see your profile and how your data is used</p>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
        {PRIVACY_OPTIONS.map((o, i) => (
          <div key={o.key}
            className="flex items-center justify-between px-5 py-4 gap-4 transition-colors hover:bg-[rgba(13,24,61,0.015)]"
            style={{ borderBottom: i < PRIVACY_OPTIONS.length - 1 ? '1px solid rgba(13,24,61,0.06)' : 'none' }}>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0D183D] mb-0.5">{o.label}</p>
              <p className="text-[12px] text-[#4B6382] leading-snug">{o.desc}</p>
            </div>
            <Toggle on={priv[o.key]} onChange={v => handleToggle(o.key, v)}/>
          </div>
        ))}
      </div>

      <SaveBar saving={false} saved={saved} error="" onSave={handleSaveAll} label="Save preferences"/>

      {/* Danger zone */}
      <div className="rounded-2xl border p-5 flex flex-col gap-3"
        style={{ borderColor: 'rgba(239,68,68,0.18)', background: 'rgba(239,68,68,0.02)' }}>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-red-400"/>
          <p className="text-[13px] font-extrabold text-[#0D183D]">Danger zone</p>
        </div>
        <button className="flex items-center gap-2 text-[12px] font-semibold text-[#4B6382] hover:text-[#0D183D] transition-colors w-fit">
          <ChevronRight size={12}/> Download my data
        </button>
        {showDeleteConfirm ? (
          <div className="rounded-xl p-4 bg-red-50 border border-red-200 flex flex-col gap-3">
            <p className="text-[12px] font-semibold text-red-700">Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-[rgba(13,24,61,0.12)] text-[#4B6382] hover:bg-white transition-colors">
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg text-[12px] font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors">
                Yes, delete my account
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-[12px] font-semibold text-red-400 hover:text-red-600 transition-colors w-fit">
            <ChevronRight size={12}/> Delete account
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Language section ─────────────────────────────────────────────────────────

function LanguageSection({ user }) {
  const { t } = useTranslation()
  const { lang, setLang } = useTheme()
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  async function handleSelect(code) {
    setLang(code)           // applies immediately (i18n + localStorage + direction)
    if (!user?.id) return
    setSaving(true)
    try {
      await updateUserRow(user.id, { preferred_language: code })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.warn('Could not save language preference:', e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">{t('settings.language.title')}</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">{t('settings.language.subtitle')}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {SUPPORTED_LANGS.map(l => (
          <button key={l.code} onClick={() => handleSelect(l.code)}
            className="flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all"
            style={lang === l.code
              ? { borderColor: '#FFB703', background: 'rgba(255,183,3,0.05)' }
              : { borderColor: 'rgba(13,24,61,0.1)', background: '#FAFAFA' }}>
            <div>
              <p className={`text-[13px] font-semibold ${lang === l.code ? 'text-[#0D183D]' : 'text-[#4B6382]'}`}>{l.nativeLabel}</p>
              <p className="text-[11px] text-[#4B6382]">{l.label}</p>
            </div>
            {lang === l.code && <Check size={13} style={{ color: '#FFB703' }}/>}
          </button>
        ))}
      </div>

      {saved && (
        <p className="text-[12px] text-emerald-600 flex items-center gap-1.5">
          <Check size={12}/> {t('common.saved')}
        </p>
      )}

      <p className="text-[12px] text-[#4B6382]">
        {t('settings.language.moreLanguages')}{' '}
        <a href="mailto:hello@hive.app" className="text-[#FFB703] font-semibold hover:underline">
          {t('settings.language.getInTouch')}
        </a>
      </p>
    </div>
  )
}

// ─── Appearance section ───────────────────────────────────────────────────────

function AppearanceSection({ user }) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const THEMES = [
    { id: 'light',  icon: Sun,        label: t('settings.appearance.light'),  desc: t('settings.appearance.lightDesc')  },
    { id: 'dark',   icon: Moon,       label: t('settings.appearance.dark'),   desc: t('settings.appearance.darkDesc')   },
    { id: 'system', icon: Smartphone, label: t('settings.appearance.system'), desc: t('settings.appearance.systemDesc') },
  ]

  async function handleSelect(id) {
    setTheme(id)             // applies immediately via ThemeContext
    if (!user?.id) return
    setSaving(true)
    try {
      await updateUserRow(user.id, { preferred_theme: id })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.warn('Could not save theme preference:', e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[16px] font-extrabold text-[#0D183D]">{t('settings.appearance.title')}</h2>
        <p className="text-[13px] text-[#4B6382] mt-0.5">{t('settings.appearance.subtitle')}</p>
      </div>
      <div>
        <p className="text-[12px] font-semibold text-[#0D183D] mb-3">{t('settings.appearance.colorTheme')}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {THEMES.map(th => (
            <button key={th.id} onClick={() => handleSelect(th.id)}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all"
              style={theme === th.id
                ? { borderColor: '#FFB703', background: 'rgba(255,183,3,0.05)', boxShadow: '0 0 0 3px rgba(255,183,3,0.12)' }
                : { borderColor: 'rgba(13,24,61,0.1)', background: '#FAFAFA' }}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === th.id ? 'bg-[#FFB703]' : 'bg-[rgba(13,24,61,0.06)]'}`}>
                <th.icon size={16} className={theme === th.id ? 'text-white' : 'text-[#4B6382]'}/>
              </div>
              <div>
                <p className={`text-[13px] font-bold ${theme === th.id ? 'text-[#0D183D]' : 'text-[#4B6382]'}`}>{th.label}</p>
                <p className="text-[11px] text-[#4B6382]">{th.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      {saved && (
        <p className="text-[12px] text-emerald-600 flex items-center gap-1.5">
          <Check size={12}/> {t('common.saved')}
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const { user, profile, setProfile, patchUser, updateProfile, logout } = useApp()
  const navigate = useNavigate()
  const [section, setSection] = useState('profile')

  async function handleLogout() {
    await logout()
    navigate('/auth', { replace: true })
  }

  const sectionComponents = {
    profile:       <ProfileSection user={user} profile={profile} updateProfile={updateProfile} patchUser={patchUser}/>,
    security:      <SecuritySection user={user}/>,
    notifications: <NotificationsSection user={user}/>,
    privacy:       <PrivacySection/>,
    language:      <LanguageSection user={user}/>,
    appearance:    <AppearanceSection user={user}/>,
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FB]">
      <div className="max-w-[1180px] mx-auto px-8 py-8">

        <div className="mb-7">
          <h1 className="text-[1.3rem] font-extrabold text-[#0D183D]">Settings</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">Manage your account, notifications, and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left menu ── */}
          <aside className="w-full lg:w-[300px] lg:shrink-0 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-[0_2px_12px_rgba(13,24,61,0.05)] p-2 lg:sticky lg:top-6">
            <div className="px-2 pt-2 pb-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] px-2 pb-2">Account settings</p>
            </div>
            <div className="flex flex-col gap-0.5">
              {SECTIONS.map(s => (
                <MenuItem key={s.id} section={s} active={section === s.id} onClick={setSection}/>
              ))}
            </div>

            {/* Sign out at bottom of sidebar */}
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(13,24,61,0.07)' }}>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-50 hover:text-red-600 transition-all group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 group-hover:bg-red-100 transition-colors shrink-0">
                  <LogOut size={14}/>
                </div>
                <span className="text-[13px] font-semibold">Sign out</span>
              </button>
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
