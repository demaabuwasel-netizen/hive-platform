import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  TrendingUp, MessageCircle, Settings as SettingsIcon, Briefcase, Users, BarChart2,
  User, Bell, Lock, Globe, Palette, LogOut, ChevronRight, Camera, Check,
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

  function handleSave() {
    const err = validatePhone(phone)
    if (err) { setPhoneErr(err); return }
    setPhoneErr('')
    if (setProfile) setProfile(p => ({ ...p, phone: phone.trim() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
      <div className="max-w-4xl mx-auto px-8 py-8">
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
          <motion.div key={section} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.2 }}
            className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-7">

            {section === 'profile' && (
              <div>
                <h2 className="text-[15px] font-extrabold text-[#0D183D] mb-6">Profile</h2>

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
                    <p className="text-[12px] text-[#4B6382] mb-2">{user?.email}</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                      Account active
                    </span>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid gap-5">
                  {[
                    { label: 'Full name', val: displayName, ph: 'Your name' },
                    { label: 'Email', val: user?.email || '', ph: 'your@email.com' },
                    { label: user?.role === 'ngo' ? 'Organization name' : 'University', val: profile?.university || (user?.role !== 'ngo' ? '' : profile?.name) || '', ph: '' },
                    { label: 'Bio', val: profile?.description || profile?.bio || '', ph: 'Tell us about yourself…', multi: true },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">{f.label}</label>
                      {f.multi ? (
                        <textarea defaultValue={f.val} placeholder={f.ph} rows={3}
                          className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] resize-none outline-none transition-all"
                          style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)', lineHeight:1.6 }}
                          onFocus={e => e.target.style.borderColor='#FFB703'}
                          onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'} />
                      ) : (
                        <input defaultValue={f.val} placeholder={f.ph}
                          className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] outline-none transition-all"
                          style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.1)' }}
                          onFocus={e => e.target.style.borderColor='#FFB703'}
                          onBlur={e => e.target.style.borderColor='rgba(13,24,61,0.1)'} />
                      )}
                    </div>
                  ))}

                  {/* Phone number — separate controlled field with validation */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0D183D] mb-1.5">
                      Phone number
                      <span className="ml-2 text-[11px] font-normal text-[#4B6382]">optional</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setPhoneErr('') }}
                      placeholder="e.g. +972 50 123 4567"
                      className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] outline-none transition-all"
                      style={{
                        background: '#F8F9FB',
                        border: `1.5px solid ${phoneErr ? '#EF4444' : 'rgba(13,24,61,0.1)'}`,
                      }}
                      onFocus={e => e.target.style.borderColor = phoneErr ? '#EF4444' : '#FFB703'}
                      onBlur={e => e.target.style.borderColor = phoneErr ? '#EF4444' : 'rgba(13,24,61,0.1)'}
                    />
                    {phoneErr && (
                      <p className="text-red-500 text-[11px] mt-1.5">{phoneErr}</p>
                    )}
                  </div>
                </div>

                {/* Connected account */}
                <div className="mt-7 pt-6 flex items-center justify-between" style={{ borderTop:'1px solid rgba(13,24,61,0.07)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[rgba(13,24,61,0.1)] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#0D183D]">Google Account</p>
                      <p className="text-[11px] text-[#4B6382]">{user?.email} · Connected</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Connected</span>
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
                {[
                  { label: 'Profile visibility', desc: 'Allow NGOs to discover your profile in search', def: true },
                  { label: 'Show match scores', desc: 'Display your compatibility % to matched NGOs', def: true },
                  { label: 'Activity status', desc: 'Show when you were last active on Hive', def: false },
                ].map(o => (
                  <div key={o.label} className="flex items-start justify-between py-4"
                    style={{ borderBottom: '1px solid rgba(13,24,61,0.06)' }}>
                    <div className="flex-1 pr-8">
                      <p className="text-[13px] font-semibold text-[#0D183D] mb-0.5">{o.label}</p>
                      <p className="text-[12px] text-[#4B6382]">{o.desc}</p>
                    </div>
                    <Toggle on={o.def} onChange={() => {}} />
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
