import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Pencil, Check, ExternalLink, MapPin, Briefcase,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AvatarDisplay } from '../components/Avatar'

// ─── Hex watermark ────────────────────────────────────────────────────────────

function HexBg({ opacity = 0.11 }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      <defs>
        <pattern id="np-hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <path d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z"
            fill="#FFB703"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#np-hex)"/>
    </svg>
  )
}

// ─── Org completion ───────────────────────────────────────────────────────────

function computeCompletion(profile) {
  const items = [
    { key: 'description', label: 'Add organization description', done: !!profile?.description },
    { key: 'helpNeeded',  label: 'Describe skills needed',       done: !!profile?.helpNeeded  },
    { key: 'location',    label: 'Add location',                 done: !!profile?.location    },
    { key: 'tags',        label: 'Add category tags',            done: (profile?.tags?.length ?? 0) >= 1 },
    { key: 'links',       label: 'Add website or social link',   done: !!(profile?.website || profile?.instagram || profile?.twitter) },
    { key: 'logo',        label: 'Add organization logo',        done: !!profile?.imageUrl    },
  ]
  const done = items.filter(i => i.done).length
  return { items, done, total: items.length, pct: Math.round((done / items.length) * 100) }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Section({ title, delay = 0, badge, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-2xl p-5 border border-[rgba(13,24,61,0.08)]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382]">{title}</h3>
        {badge && (
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,183,3,0.12)', color: '#B37D00' }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}

function EmptySection({ label, cta, onClick }) {
  return (
    <div className="flex items-center justify-between py-1">
      <p className="text-[12px] italic" style={{ color: 'rgba(75,99,130,0.5)' }}>{label}</p>
      {cta && (
        <button onClick={onClick}
          className="text-[11px] font-semibold hover:opacity-70 transition-opacity"
          style={{ color: '#FFB703' }}>
          {cta} →
        </button>
      )}
    </div>
  )
}

function SocialLink({ href, label, emoji }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border hover:bg-[#F8F9FB] transition-colors group"
      style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-[13px] font-semibold text-[#0D183D] flex-1">{label}</span>
      <ExternalLink size={12} className="text-[#4B6382] opacity-0 group-hover:opacity-60 transition-opacity"/>
    </a>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NGOProfile() {
  const { user, profile } = useApp()
  const navigate = useNavigate()

  const orgName    = profile?.name || user?.name || 'Your Organization'
  const completion = computeCompletion(profile)
  const incomplete = completion.items.filter(i => !i.done)

  const hasLinks = profile?.website || profile?.instagram || profile?.twitter

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="max-w-[1060px] mx-auto px-8 py-7">

        {/* ── Hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl overflow-hidden mb-5 border border-[rgba(13,24,61,0.08)]"
          style={{ boxShadow: '0 4px 24px rgba(13,24,61,0.09)' }}>

          {/* Dark hero band */}
          <div className="relative overflow-hidden px-8 pt-8 pb-6" style={{ background: '#0D183D', minHeight: 160 }}>
            <HexBg />
            <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.15 }}>
              <svg width="110" height="124" viewBox="0 0 110 124" fill="none">
                <polygon points="55,6 98,31 98,81 55,106 12,81 12,31" stroke="#FFB703" strokeWidth="1.5"/>
                <polygon points="55,20 87,39 87,77 55,96 23,77 23,39" fill="#FFB703" fillOpacity="0.22" stroke="#FFB703" strokeWidth="1"/>
                <polygon points="55,35 75,46 75,70 55,81 35,70 35,46" fill="#FFB703" fillOpacity="0.45"/>
              </svg>
            </div>

            <div className="relative z-10 flex items-end gap-6 flex-wrap">
              {/* Logo / avatar */}
              <div className="shrink-0 rounded-2xl overflow-hidden ring-4"
                style={{ width: 84, height: 84, ringColor: 'rgba(255,255,255,0.2)' }}>
                <AvatarDisplay src={profile?.imageUrl || profile?.avatar} name={orgName} size="xl"
                  className="w-full h-full"/>
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <h1 className="text-[1.5rem] font-extrabold text-white leading-tight">{orgName}</h1>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,183,3,0.18)', color: '#FFB703', border: '1px solid rgba(255,183,3,0.3)' }}>
                    NGO
                  </span>
                </div>
                {profile?.location && (
                  <span className="flex items-center gap-1.5 text-[12px]"
                    style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <MapPin size={11}/> {profile.location}
                  </span>
                )}
              </div>

              {/* Preview mode badge */}
              <div className="shrink-0 rounded-xl px-3.5 py-2.5 text-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-[9px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: '#FFB703' }}>
                  Preview Mode
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  This is how students see you
                </p>
              </div>
            </div>
          </div>

          {/* White footer */}
          <div className="bg-white px-8 py-4 flex items-center justify-between gap-4 flex-wrap"
            style={{ borderTop: '1px solid rgba(13,24,61,0.06)' }}>
            {profile?.description ? (
              <p className="text-[13px] text-[#4B6382] leading-relaxed flex-1 max-w-2xl line-clamp-2">
                {profile.description}
              </p>
            ) : (
              <p className="text-[12px] italic" style={{ color: 'rgba(75,99,130,0.45)' }}>
                No description yet — tell students about your mission.
              </p>
            )}
            <button onClick={() => navigate('/profile/ngo/edit')}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border hover:bg-[rgba(13,24,61,0.03)] transition-colors"
              style={{ color: '#4B6382', borderColor: 'rgba(13,24,61,0.12)' }}>
              <Pencil size={11}/> Edit profile
            </button>
          </div>
        </motion.div>

        {/* ── Body ── */}
        <div className="grid lg:grid-cols-[1fr_284px] gap-5">

          {/* ── Left: content sections ── */}
          <div className="flex flex-col gap-4">

            {/* About */}
            <Section title="About the Organization" delay={0.05}>
              {profile?.description ? (
                <p className="text-[13px] text-[#4B6382] leading-relaxed">{profile.description}</p>
              ) : (
                <EmptySection label="No description added yet"
                  cta="Add description" onClick={() => navigate('/profile/ngo/edit')}/>
              )}
            </Section>

            {/* Mission / help needed */}
            <Section title="Skills & Help Needed" delay={0.09}
              badge={profile?.helpNeeded ? 'Active need' : undefined}>
              {profile?.helpNeeded ? (
                <p className="text-[13px] text-[#4B6382] leading-relaxed">{profile.helpNeeded}</p>
              ) : (
                <EmptySection label="Not described yet"
                  cta="Add what you need" onClick={() => navigate('/profile/ngo/edit')}/>
              )}
            </Section>

            {/* Focus areas / tags */}
            <Section title="Focus Areas" delay={0.13}>
              {(profile?.tags?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag, i) => (
                    <span key={i}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(255,183,3,0.08)', color: '#B37D00', border: '1px solid rgba(255,183,3,0.2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptySection label="No categories added yet"
                  cta="Add categories" onClick={() => navigate('/profile/ngo/edit')}/>
              )}
            </Section>

            {/* Open opportunities */}
            <Section title="Open Opportunities" delay={0.17}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-[#4B6382]">
                  Opportunities you post will appear here for students to apply.
                </p>
                <button onClick={() => navigate('/opportunities')}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: '#0D183D', marginLeft: 16 }}>
                  <Briefcase size={11}/> View all
                </button>
              </div>
            </Section>

            {/* Website & Social links */}
            <Section title="Website & Social Links" delay={0.21}>
              {hasLinks ? (
                <div className="flex flex-col gap-2">
                  {profile?.website   && <SocialLink href={profile.website}   label={profile.website.replace(/^https?:\/\//, '')}   emoji="🌐"/>}
                  {profile?.instagram && <SocialLink href={profile.instagram} label="Instagram" emoji="📸"/>}
                  {profile?.twitter   && <SocialLink href={profile.twitter}   label="Twitter / X" emoji="🐦"/>}
                </div>
              ) : (
                <EmptySection label="No links added yet"
                  cta="Add links" onClick={() => navigate('/profile/ngo/edit')}/>
              )}
            </Section>
          </div>

          {/* ── Right: sidebar ── */}
          <aside className="flex flex-col gap-4">

            {/* Org Strength */}
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="bg-white rounded-2xl p-5 border flex flex-col gap-3.5"
              style={{ borderColor: 'rgba(13,24,61,0.08)' }}>

              <div className="flex items-center justify-between">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0D183D]">Profile Strength</p>
                <span className="text-[13px] font-extrabold"
                  style={{ color: completion.pct === 100 ? '#10B981' : '#FFB703' }}>
                  {completion.pct}%
                </span>
              </div>

              <div className="w-full rounded-full h-2" style={{ background: 'rgba(13,24,61,0.07)' }}>
                <motion.div className="h-2 rounded-full"
                  style={{ background: completion.pct === 100 ? '#10B981' : '#FFB703' }}
                  initial={{ width: 0 }} animate={{ width: `${completion.pct || 4}%` }}
                  transition={{ delay: 0.35, duration: 0.9, ease: 'easeOut' }}/>
              </div>

              {incomplete.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#4B6382]">
                    Suggestions
                  </p>
                  {incomplete.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full border border-[rgba(13,24,61,0.18)] shrink-0"/>
                      <span className="text-[11px] text-[#4B6382]">{item.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-semibold">
                  <Check size={13} strokeWidth={2.5}/> Profile is complete!
                </div>
              )}

              <button onClick={() => navigate('/profile/ngo/edit')}
                className="w-full py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(255,183,3,0.1)', color: '#B37D00' }}>
                Improve profile →
              </button>
            </motion.div>

            {/* Visibility card */}
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.35 }}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: '#0D183D' }}>

              <p className="text-[10px] font-extrabold text-[#FFB703] uppercase tracking-widest">
                Attract Students
              </p>

              <div className="flex flex-col gap-2">
                {[
                  { done: !!profile?.description, label: 'Organization description' },
                  { done: !!profile?.helpNeeded,  label: 'Skills & needs described'  },
                  { done: (profile?.tags?.length ?? 0) >= 1, label: 'Focus areas tagged' },
                  { done: !!profile?.imageUrl,    label: 'Logo uploaded'             },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                      item.done ? 'bg-emerald-500' : 'border border-[rgba(255,255,255,0.2)]'
                    }`} style={{ width: 18, height: 18 }}>
                      {item.done && <Check size={9} strokeWidth={3} className="text-white"/>}
                    </div>
                    <span className="text-[11px]"
                      style={{ color: item.done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }}/>
              <p className="text-[10px] leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Complete organizations receive significantly more student applications.
              </p>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              className="bg-white rounded-2xl p-5 border flex flex-col gap-2.5"
              style={{ borderColor: 'rgba(13,24,61,0.08)' }}>

              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0D183D] mb-0.5">
                Quick actions
              </p>
              <button onClick={() => navigate('/opportunities/new')}
                className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-[#0D183D] transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#FFB703', boxShadow: '0 4px 12px rgba(255,183,3,0.25)' }}>
                Post an opportunity →
              </button>
              <button onClick={() => navigate('/matches')}
                className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-[#4B6382] border hover:bg-[rgba(13,24,61,0.03)] transition-colors"
                style={{ borderColor: 'rgba(13,24,61,0.12)' }}>
                Find matching students
              </button>
            </motion.div>
          </aside>
        </div>
      </div>
    </main>
  )
}
