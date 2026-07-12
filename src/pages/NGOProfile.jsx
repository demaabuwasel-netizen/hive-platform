import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AtSign, BarChart3, Building2, Camera, Check, Edit2, ExternalLink,
  FileText, Globe, HandHeart, Heart, Layers2, Link2, ShieldCheck, Sparkles, Target,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import TopicPicker from '../components/TopicPicker'

const FOCUS_OPTIONS = ['Youth Empowerment', 'Education', 'Healthcare', 'Environment', 'Technology', 'Community Development']

const SKILL_OPTIONS = [
  'Communication', 'Leadership', 'Data Analysis', 'Design', 'Marketing', 'Programming',
  'Project Management', 'Research', 'Writing', 'Graphic Design', 'Video Production',
  'Public Speaking', 'Social Media', 'Fundraising', 'Mentoring', 'Curriculum Development',
  'Data Visualization', 'Web Development', 'Mobile Development', 'Business Analysis',
  'Grant Writing', 'Copywriting', 'SEO', 'Content Strategy', 'User Experience',
  'Strategic Planning', 'Community Engagement', 'Accounting', 'Legal Expertise',
  'HR Management', 'Event Management', 'Public Relations', 'Advocacy',
  'Nonprofit Management', 'Impact Measurement', 'Finance', 'Operations',
  'Volunteer Coordination', 'Education', 'Healthcare', 'Youth Development',
  'Technology Support', 'AI/Machine Learning', 'Cloud Computing'
]

const PROJECT_OPTIONS = [
  'Website', 'Mobile App', 'Research', 'Content Creation', 'Event Planning',
  'Fundraising', 'Training', 'Consulting', 'Marketing Campaign', 'Social Media Strategy',
  'Grant Writing', 'Policy Brief', 'Video Production', 'Newsletter',
  'Database Development', 'Data Analysis', 'Branding', 'Curriculum Design',
  'Workshop', 'Mentorship Program', 'Community Survey', 'Annual Report',
  'Strategic Plan', 'Dashboard/Analytics', 'Outreach Program', 'Partnership Development',
  'Impact Report', 'Technology Infrastructure', 'Process Improvement'
]

function EmptyText({ children = 'Not added yet' }) {
  return <p className="text-[0.92rem] italic text-[#9AA0A6]">{children}</p>
}

// Section heading that groups a cluster of related boxes — a soft accent dot,
// a real heading weight, and a quiet caption. No borders, no boxed container.
function GroupTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB]/12 to-[#7C3AED]/12 text-[#1A73E8]">
        <Icon size={14} strokeWidth={2.4} />
      </span>
      <h2 className="text-[1.25rem] font-semibold tracking-[-0.03em] text-[#202124]">{title}</h2>
      {subtitle && <span className="hidden text-[0.85rem] text-[#9AA0A6] sm:inline">— {subtitle}</span>}
    </div>
  )
}

function EditButton({ onEdit, label }) {
  return (
    <button
      onClick={onEdit}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9AA0A6] opacity-0 transition-all duration-150 hover:bg-[#EEF2FF] hover:text-[#1A73E8] group-hover:opacity-100"
      aria-label={`Edit ${label}`}
    >
      <Edit2 size={14} />
    </button>
  )
}

function FieldActions({ saving, onSave, onCancel }) {
  return (
    <div className="mt-3.5 flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="h-9 rounded-full px-4 text-[0.85rem] font-semibold text-[#667085] transition-colors hover:bg-black/[0.04]"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 text-[0.85rem] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(37,99,235,0.5)] transition-transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50"
      >
        <Check size={13} strokeWidth={2.5} />
        Save
      </button>
    </div>
  )
}

// The base box: soft diffused shadow instead of a hairline border, a gradient
// squircle icon for identity, and an accordion expand into a tinted panel
// when editing — the "alive" moment lives in the motion, not in ornament.
function Box({ icon: Icon, label, minH = '', children, editing, editor, onEdit, delay = 0 }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={`group relative rounded-[26px] bg-white p-6 transition-shadow duration-300 ${
        editing
          ? 'shadow-[0_20px_40px_-16px_rgba(37,99,235,0.28)] ring-1 ring-[#2563EB]/25'
          : 'shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-14px_rgba(16,24,40,0.14)] ring-1 ring-black/[0.03] hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_36px_-14px_rgba(16,24,40,0.18)]'
      } ${minH}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#2563EB] to-[#6D28D9] text-white shadow-[0_8px_18px_-4px_rgba(37,99,235,0.42)]">
              <Icon size={19} strokeWidth={2.1} />
            </span>
          )}
          <p className="text-[1rem] font-semibold tracking-[-0.01em] text-[#202124]">{label}</p>
        </div>
        {!editing && onEdit && <EditButton onEdit={onEdit} label={label} />}
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={editing ? 'editor' : 'view'}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          {editing ? (
            <div className="rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] p-4">
              {editor}
            </div>
          ) : children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function TextBox({ icon, label, rows = 4, value, minH, fieldProps, delay }) {
  const { editing, editValue, onChange, onEdit, onSave, onCancel, saving } = fieldProps
  return (
    <Box
      icon={icon} label={label} minH={minH} delay={delay}
      editing={editing} onEdit={onEdit}
      editor={
        <>
          <textarea
            value={editValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none rounded-xl border border-[#DCE2F0] bg-white px-3.5 py-2.5 text-[0.92rem] leading-6 text-[#1E2530] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            rows={rows}
            autoFocus
          />
          <FieldActions saving={saving} onSave={onSave} onCancel={onCancel} />
        </>
      }
    >
      <p className="whitespace-pre-wrap text-[0.95rem] leading-7 text-[#5F6368]">
        {value || <EmptyText />}
      </p>
    </Box>
  )
}

function ChipsBox({ icon, label, options, items, minH, fieldProps, delay }) {
  const { editing, editValue, onChange, onEdit, onSave, onCancel, saving } = fieldProps
  return (
    <Box
      icon={icon} label={label} minH={minH} delay={delay}
      editing={editing} onEdit={onEdit}
      editor={
        <>
          <TopicPicker
            value={editValue || []}
            onChange={onChange}
            options={options}
            placeholder={`Search or add ${label.toLowerCase()}...`}
          />
          <FieldActions saving={saving} onSave={onSave} onCancel={onCancel} />
        </>
      }
    >
      {items?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className="inline-flex items-center rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] px-3 py-1.5 text-[0.82rem] font-semibold text-[#1A73E8] ring-1 ring-[#2563EB]/10">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <EmptyText />
      )}
    </Box>
  )
}

// Radial profile-strength gauge — gradient stroke instead of a flat tone
function StrengthGauge({ percent, size = 88 }) {
  const r = 33, circ = 2 * Math.PI * r
  const gradId = 'strengthGaugeGradient'
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" aria-label={`Profile strength ${percent}%`}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#EEF2FF" strokeWidth="7" />
      <motion.circle
        cx="42" cy="42" r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth="7"
        strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 42 42)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - percent / 100) }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
      <text x="42" y="47" textAnchor="middle" fontSize="16" fontWeight="700" fill="#202124">{percent}%</text>
    </svg>
  )
}

export default function NGOProfile() {
  const { user, profile, updateProfile } = useApp()
  const fileInputRef = useRef(null)

  const [editingField, setEditingField] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)

  const displayName = profile?.name || user?.name || 'Organization'
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const completenessFields = [
    profile?.description,
    profile?.mission,
    profile?.helpNeeded,
    profile?.tags?.length,
    profile?.preferred_skills?.length,
    profile?.project_types?.length,
    profile?.website,
  ]
  const completeness = Math.round(
    (completenessFields.filter(Boolean).length / completenessFields.length) * 100
  )

  const startEdit = (field) => {
    setEditingField(field)
    setEditValues({ [field]: profile?.[field] || '' })
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValues({})
  }

  const saveEdit = async (field) => {
    if (!user?.id || !profile) {
      alert('Profile is still loading. Please try again.')
      return
    }

    setSaving(true)
    try {
      await updateProfile({ ...profile, [field]: editValues[field] })
      setEditingField(null)
      setEditValues({})
    } catch (err) {
      console.error('[NGOProfile] Save failed:', err)
      alert(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const fieldProps = (field) => ({
    editing: editingField === field,
    editValue: editValues[field],
    onChange: (value) => setEditValues({ [field]: value }),
    onEdit: () => startEdit(field),
    onSave: () => saveEdit(field),
    onCancel: cancelEdit,
    saving,
  })

  const links = [
    profile?.website && { icon: Globe, label: 'Website', value: profile.website.replace(/^https?:\/\/(www\.)?/, ''), href: profile.website },
    profile?.instagram && { icon: Heart, label: 'Instagram', value: profile.instagram.replace(/^https?:\/\/(www\.)?/, ''), href: profile.instagram },
    profile?.twitter && { icon: AtSign, label: 'Twitter / X', value: profile.twitter.replace(/^https?:\/\/(www\.)?/, ''), href: profile.twitter },
    profile?.registrationNumber && { icon: Building2, label: 'Registration', value: profile.registrationNumber },
  ].filter(Boolean)

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FD]">
      <div aria-hidden className="pointer-events-none absolute -top-32 right-[-8%] h-[540px] w-[540px] rounded-full bg-gradient-to-br from-[#DCE7FF] to-transparent opacity-70 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-[520px] left-[-12%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#EDE4FF] to-transparent opacity-50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-9"
        >
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#202124] sm:text-5xl">
            Profile
          </h1>
          <p className="mt-4 max-w-xl text-[0.96rem] leading-7 text-[#5F6368]">
            Keep your organization story, mission, focus areas, and links in one clear view for students and stronger matches.
          </p>
        </motion.header>

        {/* Identity strip */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-10 overflow-hidden rounded-[32px] bg-white p-1 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_48px_-20px_rgba(16,24,40,0.18)] ring-1 ring-black/[0.03]"
        >
          <div className="rounded-[28px] bg-gradient-to-br from-[#FBFCFF] to-[#F3F6FF] p-6 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 shrink-0 rounded-[26px] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] p-[3px] shadow-[0_10px_24px_-8px_rgba(37,99,235,0.45)] sm:h-28 sm:w-28">
                  <div className="h-full w-full overflow-hidden rounded-[23px] bg-white">
                    {profile?.imageUrl ? (
                      <img src={profile.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-[1.95rem] font-semibold text-[#1A73E8]">
                        {initials || <Building2 size={30} />}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#5F6368] shadow-[0_6px_16px_-2px_rgba(16,24,40,0.25)] ring-1 ring-black/[0.04] transition-all hover:-translate-y-0.5 hover:text-[#1A73E8]"
                    title="Change logo"
                  >
                    <Camera size={13} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#202124]">
                      {displayName}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[0.72rem] font-semibold text-[#188038]">
                      <ShieldCheck size={12} strokeWidth={2.4} />
                      Verified organization
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-[0.92rem] leading-7 text-[#5F6368]">
                    {profile?.summary || 'Keep your organization profile clear, current, and ready for strong student matches.'}
                  </p>
                </div>
              </div>

              <div className="flex w-full shrink-0 items-center gap-4 rounded-[20px] bg-white/80 px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-black/[0.04] sm:w-[230px]">
                <StrengthGauge percent={completeness} />
                <div className="min-w-0">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#9AA0A6]">Profile strength</p>
                  <p className="mt-1 text-[0.8rem] leading-4 text-[#5F6368]">
                    {completeness >= 80 ? 'Ready for strong matches.' : 'Add more to strengthen it.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="space-y-11">
          {/* About group */}
          <div>
            <GroupTitle icon={FileText} title="About" subtitle="how students get to know you" />
            <div className="space-y-4">
              <TextBox icon={Sparkles} label="About the organization" value={profile?.description} fieldProps={fieldProps('description')} minH="min-h-[150px]" delay={0} />
              <TextBox icon={Target} label="Mission" rows={3} value={profile?.mission} fieldProps={fieldProps('mission')} minH="min-h-[130px]" delay={0.05} />
              <TextBox icon={HandHeart} label="What we need help with" rows={3} value={profile?.helpNeeded} fieldProps={fieldProps('helpNeeded')} minH="min-h-[130px]" delay={0.1} />
            </div>
          </div>

          {/* Focus group */}
          <div>
            <GroupTitle icon={Layers2} title="Focus" subtitle="what you work on and who you're looking for" />
            <div className="space-y-4">
              <ChipsBox icon={Target} label="Focus areas" options={FOCUS_OPTIONS} items={profile?.tags} fieldProps={fieldProps('tags')} minH="min-h-[110px]" delay={0} />
              <ChipsBox icon={Sparkles} label="Preferred skills" options={SKILL_OPTIONS} items={profile?.preferred_skills} fieldProps={fieldProps('preferred_skills')} minH="min-h-[110px]" delay={0.05} />
              <ChipsBox icon={BarChart3} label="Project types" options={PROJECT_OPTIONS} items={profile?.project_types} fieldProps={fieldProps('project_types')} minH="min-h-[110px]" delay={0.1} />
            </div>
          </div>

          {/* Connect group */}
          {links.length > 0 && (
            <div>
              <GroupTitle icon={Link2} title="Connect" subtitle="where students can learn more" />
              <div className="space-y-3">
                {links.map(({ icon: Icon, label, value, href }, index) => {
                  const content = (
                    <>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#2563EB] to-[#6D28D9] text-white shadow-[0_8px_18px_-4px_rgba(37,99,235,0.42)]">
                        <Icon size={18} strokeWidth={2.1} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#9AA0A6]">{label}</p>
                        <p className="truncate text-[0.95rem] font-semibold text-[#202124]">{value}</p>
                      </div>
                      {href && (
                        <ExternalLink
                          size={15}
                          className="shrink-0 text-[#9AA0A6] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#1A73E8]"
                        />
                      )}
                    </>
                  )
                  return href ? (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -3 }}
                      className="group flex items-center gap-3.5 rounded-[22px] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-14px_rgba(16,24,40,0.14)] ring-1 ring-black/[0.03] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_36px_-14px_rgba(16,24,40,0.18)]"
                    >
                      {content}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="group flex items-center gap-3.5 rounded-[22px] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-14px_rgba(16,24,40,0.14)] ring-1 ring-black/[0.03]"
                    >
                      {content}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
