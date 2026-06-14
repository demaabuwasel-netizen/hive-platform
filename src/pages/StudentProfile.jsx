import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Pencil, Check, ExternalLink, GraduationCap, Sparkles, Zap,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AvatarDisplay } from '../components/Avatar'
import CategorizedSkillTags from '../components/CategorizedSkillTags'

// ─── Hex watermark ────────────────────────────────────────────────────────────

function HexBg({ opacity = 0.11 }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice" style={{ opacity }}>
      <defs>
        <pattern id="sp-hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <path d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z"
            fill="#FFB703"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sp-hex)"/>
    </svg>
  )
}

// ─── Profile completion ───────────────────────────────────────────────────────

function computeCompletion(profile) {
  const items = [
    { key: 'field',      label: 'Add field of study',   done: !!profile?.field },
    { key: 'bio',        label: 'Write a short bio',    done: !!profile?.bio },
    { key: 'skills',     label: 'Add at least 3 skills',done: (profile?.skills?.length ?? 0) >= 3 },
    { key: 'interests',  label: 'Add your interests',   done: (profile?.interests?.length ?? 0) >= 1 },
    { key: 'experience', label: 'Add experience',       done: !!profile?.experience },
    { key: 'links',      label: 'Add a portfolio link', done: !!(profile?.links?.linkedin || profile?.links?.github || profile?.links?.portfolio) },
  ]
  const done = items.filter(i => i.done).length
  return { items, done, total: items.length, pct: Math.round((done / items.length) * 100) }
}

// ─── Match insights ───────────────────────────────────────────────────────────

function getMatchInsights(profile) {
  const ins = []
  const skills = Array.isArray(profile?.skills) ? profile.skills : []
  if (skills.length >= 1) {
    const name = typeof skills[0] === 'string' ? skills[0] : skills[0]?.name
    ins.push(`${name} skill`)
  }
  if ((profile?.interests?.length ?? 0) >= 1) ins.push(`Interest in ${profile.interests[0]}`)
  const langs = Array.isArray(profile?.languages) ? profile.languages : []
  if (langs.length >= 1) {
    const l1 = typeof langs[0] === 'string' ? langs[0] : langs[0]?.lang
    const l2 = langs[1] ? (typeof langs[1] === 'string' ? langs[1] : langs[1]?.lang) : null
    ins.push(l2 ? `${l1} + ${l2} speaker` : `${l1} speaker`)
  }
  if (profile?.field) ins.push(`${profile.field} background`)
  return ins.slice(0, 4)
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Section({ title, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-2xl p-5 border border-[rgba(13,24,61,0.08)]">
      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-4">{title}</h3>
      {children}
    </motion.div>
  )
}

function EmptySection({ label, cta, onClick }) {
  return (
    <div className="flex items-center justify-between py-1">
      <p className="text-[12px] italic" style={{ color: 'rgba(75,99,130,0.5)' }}>{label}</p>
      {cta && (
        <button onClick={onClick} className="text-[11px] font-semibold hover:opacity-70 transition-opacity"
          style={{ color: '#FFB703' }}>
          {cta} →
        </button>
      )}
    </div>
  )
}

function PortfolioLink({ href, label, emoji }) {
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

export default function StudentProfile() {
  const { user, profile } = useApp()
  const navigate = useNavigate()

  const displayName  = profile?.name || user?.name || 'Student'
  const completion   = computeCompletion(profile)
  const matchInsights = getMatchInsights(profile)
  const incomplete   = completion.items.filter(i => !i.done)

  const skills = Array.isArray(profile?.skills)
    ? profile.skills
    : (profile?.skills?.split(',').map(s => s.trim()).filter(Boolean) || [])
  const interests = Array.isArray(profile?.interests)
    ? profile.interests
    : (profile?.interests?.split(',').map(s => s.trim()).filter(Boolean) || [])
  const languages = Array.isArray(profile?.languages) ? profile.languages : []

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="max-w-[1060px] mx-auto px-8 py-7">

        {/* ── Hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl overflow-hidden mb-5 border border-[rgba(13,24,61,0.08)]"
          style={{ boxShadow: '0 4px 24px rgba(13,24,61,0.09)' }}>

          {/* Dark band */}
          <div className="relative overflow-hidden px-8 pt-8 pb-6" style={{ background: '#0D183D', minHeight: 160 }}>
            <HexBg />
            {/* Hex cluster decoration */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.15 }}>
              <svg width="110" height="124" viewBox="0 0 110 124" fill="none">
                <polygon points="55,6 98,31 98,81 55,106 12,81 12,31" stroke="#FFB703" strokeWidth="1.5"/>
                <polygon points="55,20 87,39 87,77 55,96 23,77 23,39" fill="#FFB703" fillOpacity="0.22" stroke="#FFB703" strokeWidth="1"/>
                <polygon points="55,35 75,46 75,70 55,81 35,70 35,46" fill="#FFB703" fillOpacity="0.45"/>
              </svg>
            </div>

            <div className="relative z-10 flex items-end gap-6 flex-wrap">
              {/* Avatar */}
              <div className="shrink-0 rounded-2xl overflow-hidden ring-4"
                style={{ width: 84, height: 84, ringColor: 'rgba(255,255,255,0.2)' }}>
                <AvatarDisplay src={profile?.avatar} name={displayName} size="xl"
                  className="w-full h-full"/>
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <h1 className="text-[1.5rem] font-extrabold text-white leading-tight">{displayName}</h1>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,183,3,0.18)', color: '#FFB703', border: '1px solid rgba(255,183,3,0.3)' }}>
                    Student
                  </span>
                </div>
                {(profile?.field || profile?.university) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {profile?.field && (
                      <span className="flex items-center gap-1.5 text-[12px]"
                        style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <GraduationCap size={12}/> {profile.field}
                      </span>
                    )}
                    {profile?.field && profile?.university && (
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                    )}
                    {profile?.university && (
                      <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {profile.university}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Preview mode badge */}
              <div className="shrink-0 rounded-xl px-3.5 py-2.5 text-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-[9px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: '#FFB703' }}>
                  Preview Mode
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  This is how NGOs see you
                </p>
              </div>
            </div>
          </div>

          {/* White footer of hero */}
          <div className="bg-white px-8 py-4 flex items-center justify-between gap-4 flex-wrap"
            style={{ borderTop: '1px solid rgba(13,24,61,0.06)' }}>
            {profile?.bio ? (
              <p className="text-[13px] text-[#4B6382] leading-relaxed flex-1 max-w-2xl">{profile.bio}</p>
            ) : (
              <p className="text-[12px] italic" style={{ color: 'rgba(75,99,130,0.45)' }}>
                No bio yet — add one to help NGOs understand who you are.
              </p>
            )}
            <button onClick={() => navigate('/profile/student/edit')}
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

            {/* Skills */}
            <Section title="Skills" delay={0.05}>
              {skills.length > 0 ? (
                <CategorizedSkillTags skills={skills} showLevel/>
              ) : (
                <EmptySection label="No skills added yet"
                  cta="Add skills" onClick={() => navigate('/profile/student/edit')}/>
              )}
            </Section>

            {/* Interests */}
            <Section title="Interests & Causes" delay={0.09}>
              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((t, i) => (
                    <span key={i} className="text-[12px] font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(255,183,3,0.08)', color: '#B37D00', border: '1px solid rgba(255,183,3,0.2)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptySection label="No interests yet"
                  cta="Add interests" onClick={() => navigate('/profile/student/edit')}/>
              )}
            </Section>

            {/* Languages */}
            {languages.length > 0 && (
              <Section title="Languages" delay={0.13}>
                <div className="flex flex-wrap gap-2">
                  {languages.map((l, i) => {
                    const lang  = typeof l === 'string' ? l : l?.lang
                    const level = typeof l === 'string' ? '' : l?.level
                    const bg    = level === 'Native' ? '#0D183D' : level === 'Fluent' ? '#059669' : level === 'Intermediate' ? '#D99E00' : '#6366F1'
                    return (
                      <span key={i}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full text-white"
                        style={{ background: bg }}>
                        {lang}
                        {level && <span className="opacity-60 text-[10px]">· {level}</span>}
                      </span>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Experience */}
            <Section title="Experience" delay={0.17}>
              {profile?.experience ? (
                <p className="text-[13px] text-[#4B6382] leading-relaxed">{profile.experience}</p>
              ) : (
                <EmptySection label="No experience added yet"
                  cta="Add experience" onClick={() => navigate('/profile/student/edit')}/>
              )}
            </Section>

            {/* Portfolio links */}
            <Section title="Portfolio & Links" delay={0.21}>
              {(profile?.links?.linkedin || profile?.links?.github || profile?.links?.portfolio) ? (
                <div className="flex flex-col gap-2">
                  {profile.links?.linkedin  && <PortfolioLink href={profile.links.linkedin}  label="LinkedIn"  emoji="🔗"/>}
                  {profile.links?.github    && <PortfolioLink href={profile.links.github}    label="GitHub"    emoji="💻"/>}
                  {profile.links?.portfolio && <PortfolioLink href={profile.links.portfolio} label="Portfolio" emoji="🌐"/>}
                </div>
              ) : (
                <EmptySection label="No links added yet"
                  cta="Add links" onClick={() => navigate('/profile/student/edit')}/>
              )}
            </Section>
          </div>

          {/* ── Right: sidebar ── */}
          <aside className="flex flex-col gap-4">

            {/* Profile Strength */}
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
                  {incomplete.length > 3 && (
                    <p className="text-[10px] text-[#4B6382]/60">+{incomplete.length - 3} more</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-semibold">
                  <Check size={13} strokeWidth={2.5}/> Profile is complete!
                </div>
              )}

              <button onClick={() => navigate('/profile/student/edit')}
                className="w-full py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(255,183,3,0.1)', color: '#B37D00' }}>
                Improve profile →
              </button>
            </motion.div>

            {/* Match Insights */}
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.35 }}
              className="rounded-2xl p-5 flex flex-col gap-3.5"
              style={{ background: '#0D183D' }}>

              <div>
                <p className="text-[10px] font-extrabold text-[#FFB703] uppercase tracking-widest mb-1">
                  Match Insights
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Why NGOs will match with you
                </p>
              </div>

              {matchInsights.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {matchInsights.map((insight, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 + i * 0.07 }}
                      className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} className="text-white"/>
                      </div>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {insight}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Complete your profile to see match insights.
                </p>
              )}

              <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }}/>

              <p className="text-[10px] leading-relaxed italic"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Hive's AI surfaces NGOs whose needs align with your skills and interests — not just keywords.
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
              <button onClick={() => navigate('/matches')}
                className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-[#0D183D] transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#FFB703', boxShadow: '0 4px 12px rgba(255,183,3,0.25)' }}>
                See my matches →
              </button>
              <button onClick={() => navigate('/opportunities')}
                className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-[#4B6382] border hover:bg-[rgba(13,24,61,0.03)] transition-colors"
                style={{ borderColor: 'rgba(13,24,61,0.12)' }}>
                Browse opportunities
              </button>
            </motion.div>
          </aside>
        </div>
      </div>
    </main>
  )
}
