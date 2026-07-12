import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AtSign, BarChart3, Building2, Calendar, Camera, Check, Code2, DollarSign, Edit2,
  ExternalLink, FileText, Globe, GraduationCap, Heart, HeartHandshake,
  Layers, Link2, Megaphone, MessageCircle, PenTool, ShieldCheck, Sparkles,
  Users2,
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

// Keyword → icon so topic chips feel identified, not just labeled
function topicIcon(name) {
  const n = name.toLowerCase()
  if (/programming|web|mobile|app|code|technology|cloud|ai\/machine/.test(n)) return Code2
  if (/design|graphic|ux|user experience|branding/.test(n)) return PenTool
  if (/communication|public speaking|social media/.test(n)) return MessageCircle
  if (/writing|content|copywriting|newsletter|policy brief|report/.test(n)) return FileText
  if (/marketing|advocacy|pr|public relations/.test(n)) return Megaphone
  if (/leadership|management|hr|volunteer coordination|mentoring|mentorship/.test(n)) return Users2
  if (/data|analysis|analytics|dashboard|research/.test(n)) return BarChart3
  if (/finance|accounting|legal/.test(n)) return DollarSign
  if (/event|training|workshop/.test(n)) return Calendar
  if (/education|curriculum|youth development/.test(n)) return GraduationCap
  if (/fundraising|grant|community/.test(n)) return HeartHandshake
  return Sparkles
}

function EmptyText({ children = 'Not added yet' }) {
  return <p className="text-[0.9rem] text-[#9AA0A6]">{children}</p>
}

function CardTitle({ icon: Icon, tint = '#E8F0FE', accent = '#1A73E8', title, subtitle }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#F1F3F4] px-6 py-4">
      {Icon && (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: tint, color: accent }}
        >
          <Icon size={16} strokeWidth={2} />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-[0.95rem] font-semibold text-[#202124]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">{subtitle}</p>}
      </div>
    </div>
  )
}

function EditButton({ onEdit, label }) {
  return (
    <button
      onClick={onEdit}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1A73E8]"
      aria-label={`Edit ${label}`}
    >
      <Edit2 size={14} />
    </button>
  )
}

function FieldActions({ saving, onSave, onCancel }) {
  return (
    <div className="mt-3 flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="h-9 rounded-full px-4 text-[0.82rem] font-medium text-[#5F6368] transition-colors hover:bg-[#F1F3F4]"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A73E8] px-5 text-[0.82rem] font-medium text-white shadow-[0_4px_14px_rgba(26,115,232,0.25)] transition-all hover:bg-[#1765CC] disabled:opacity-50"
      >
        <Check size={13} />
        Save
      </button>
    </div>
  )
}

function EditableText({ title, rows = 4, value, editing, editValue, onChange, onEdit, onSave, onCancel, saving }) {
  return (
    <section className="border-t border-[#F1F3F4] px-6 py-5 first:border-t-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#5F6368]">
          {title}
        </h3>
        {!editing && <EditButton onEdit={onEdit} label={title} />}
      </div>
      {editing ? (
        <>
          <textarea
            value={editValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none rounded-2xl border border-[#DADCE0] bg-white px-4 py-3 text-[0.9rem] leading-7 text-[#3C4043] outline-none transition-colors focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/15"
            rows={rows}
          />
          <FieldActions saving={saving} onSave={onSave} onCancel={onCancel} />
        </>
      ) : (
        <p className="max-w-4xl whitespace-pre-wrap text-[0.9rem] leading-7 text-[#3C4043]">
          {value || <EmptyText />}
        </p>
      )}
    </section>
  )
}

// Same three-tone treatment as the KPI tiles on the dashboard/analytics pages — blue, purple, green
const TOPIC_TINTS = {
  'Focus areas': {
    box: 'bg-[#F5F9FF] ring-[#DCE9FE]',
    label: 'text-[#1A73E8]',
    chip: 'border-[#D7E6FF] bg-white text-[#1A73E8]',
  },
  'Preferred skills': {
    box: 'bg-[#FAF6FE] ring-[#E9DCFB]',
    label: 'text-[#8B3DD8]',
    chip: 'border-[#E5D4FB] bg-white text-[#8B3DD8]',
  },
  'Project types': {
    box: 'bg-[#F3FBF6] ring-[#D3EEDD]',
    label: 'text-[#188038]',
    chip: 'border-[#C8E8D0] bg-white text-[#188038]',
  },
}

// A standalone selectable box — these are pick-from-a-list fields, not free text,
// so each one reads as its own card sitting next to its siblings.
function EditableTopics({ title, options, items, editing, editValue, onChange, onEdit, onSave, onCancel, saving }) {
  const tint = TOPIC_TINTS[title] || { box: 'bg-[#FAFBFC] ring-[#E8EAED]', label: 'text-[#5F6368]', chip: 'border-[#DADCE0] bg-white text-[#3C4043]' }
  return (
    <div className={`rounded-[22px] p-4 ring-1 ${tint.box}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className={`text-[0.7rem] font-semibold uppercase tracking-[0.1em] ${tint.label}`}>
          {title}
        </h3>
        {!editing && <EditButton onEdit={onEdit} label={title} />}
      </div>
      {editing ? (
        <>
          <TopicPicker
            value={editValue || []}
            onChange={onChange}
            options={options}
            placeholder={`Search or add ${title.toLowerCase()}...`}
          />
          <FieldActions saving={saving} onSave={onSave} onCancel={onCancel} />
        </>
      ) : items?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => {
            const Icon = topicIcon(item)
            return (
              <span
                key={`${item}-${index}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8rem] font-medium shadow-[0_1px_2px_rgba(17,24,39,0.03)] ${tint.chip}`}
              >
                <Icon size={12} strokeWidth={2.2} />
                {item}
              </span>
            )
          })}
        </div>
      ) : (
        <EmptyText />
      )}
    </div>
  )
}

// Radial profile-strength gauge — same technique used for match gauges on Analytics
function StrengthGauge({ percent, size = 92 }) {
  const r = 36, circ = 2 * Math.PI * r
  const color = percent >= 80 ? '#188038' : percent >= 40 ? '#1A73E8' : '#B06000'
  const track = percent >= 80 ? '#E6F4EA' : percent >= 40 ? '#E8F0FE' : '#FEF7E0'
  return (
    <svg width={size} height={size} viewBox="0 0 92 92" aria-label={`Profile strength ${percent}%`}>
      <circle cx="46" cy="46" r={r} fill="none" stroke={track} strokeWidth="7" />
      <motion.circle
        cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 46 46)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - percent / 100) }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
      />
      <text x="46" y="51" textAnchor="middle" fontSize="18" fontWeight="700" fill="#202124">{percent}%</text>
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

  // Profile completeness — a simple trust/progress signal
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

  // Shared wiring for the hoisted editable field components
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
    profile?.website && { icon: Globe, tint: 'bg-[#E8F0FE]', accent: '#1A73E8', label: 'Website', value: profile.website.replace(/^https?:\/\/(www\.)?/, ''), href: profile.website },
    profile?.instagram && { icon: Heart, tint: 'bg-[#FCE8F3]', accent: '#C2185B', label: 'Instagram', value: profile.instagram.replace(/^https?:\/\/(www\.)?/, ''), href: profile.instagram },
    profile?.twitter && { icon: AtSign, tint: 'bg-[#F1F3F4]', accent: '#3C4043', label: 'Twitter / X', value: profile.twitter.replace(/^https?:\/\/(www\.)?/, ''), href: profile.twitter },
    profile?.registrationNumber && { icon: Building2, tint: 'bg-[#F3E8FD]', accent: '#A142F4', label: 'Registration', value: profile.registrationNumber },
  ].filter(Boolean)

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6F8FC]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_10%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_90%_5%,rgba(161,66,244,0.05),transparent_42%),radial-gradient(circle_at_50%_15%,rgba(52,168,83,0.04),transparent_38%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-7"
        >
          <h1 className="text-[3.25rem] font-semibold leading-tight text-[#202124]">
            Profile
          </h1>
          <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[#5F6368]">
            Keep your organization story, mission, focus areas, and links in one clear view for students and stronger matches.
          </p>
        </motion.header>

        {/* Identity card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05),0_20px_48px_rgba(17,24,39,0.07)] ring-1 ring-black/[0.03]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[150px] bg-[radial-gradient(circle_at_15%_0%,rgba(26,115,232,0.10),transparent_55%),radial-gradient(circle_at_85%_10%,rgba(161,66,244,0.08),transparent_45%)]" />

          <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-7">
            <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 rounded-[24px] bg-white p-1 shadow-[0_10px_28px_rgba(26,115,232,0.16)] sm:h-28 sm:w-28">
                <div className="h-full w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#E8F0FE] to-[#DCE9FE]">
                  {profile?.imageUrl ? (
                    <img src={profile.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[1.9rem] font-semibold text-[#1A73E8]">
                      {initials || <Building2 size={30} />}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#5F6368] shadow-[0_4px_12px_rgba(17,24,39,0.15)] ring-1 ring-black/[0.04] transition-all hover:-translate-y-0.5 hover:text-[#1A73E8]"
                  title="Change logo"
                >
                  <Camera size={13} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[1.85rem] font-semibold tracking-[-0.015em] text-[#202124]">
                    {displayName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[0.7rem] font-medium text-[#188038]">
                    <ShieldCheck size={12} />
                    Verified organization
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-[0.92rem] leading-7 text-[#5F6368]">
                  {profile?.summary || 'Keep your organization profile clear, current, and ready for strong student matches.'}
                </p>
              </div>
            </div>

            {/* Completeness gauge */}
            <div className="flex w-full shrink-0 items-center gap-4 rounded-[22px] bg-gradient-to-br from-[#F7FAFF] to-[#FBFCFE] px-4 py-4 ring-1 ring-[#EEF1F6] sm:w-[230px]">
              <StrengthGauge percent={completeness} />
              <div className="min-w-0">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#9AA0A6]">Profile strength</p>
                <p className="mt-1 text-[0.76rem] leading-4 text-[#5F6368]">
                  {completeness >= 80
                    ? 'Looking great — ready for strong matches.'
                    : 'Complete more sections for stronger matches.'}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)] ring-1 ring-black/[0.03]"
          >
            <CardTitle icon={FileText} tint="#E8F0FE" accent="#1A73E8" title="About" subtitle="How students get to know your organization" />
            <EditableText title="About the organization" value={profile?.description} {...fieldProps('description')} />
            <EditableText title="Mission" value={profile?.mission} {...fieldProps('mission')} />
            <EditableText title="What we need help with" value={profile?.helpNeeded} {...fieldProps('helpNeeded')} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)] ring-1 ring-black/[0.03]"
          >
            <CardTitle icon={Layers} tint="#F3E8FD" accent="#A142F4" title="Focus" subtitle="What you work on and the skills you look for" />
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              <EditableTopics title="Focus areas" options={FOCUS_OPTIONS} items={profile?.tags} {...fieldProps('tags')} />
              <EditableTopics title="Preferred skills" options={SKILL_OPTIONS} items={profile?.preferred_skills} {...fieldProps('preferred_skills')} />
              <EditableTopics title="Project types" options={PROJECT_OPTIONS} items={profile?.project_types} {...fieldProps('project_types')} />
            </div>
          </motion.section>

          {links.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04)] ring-1 ring-black/[0.03]"
            >
              <CardTitle icon={Link2} tint="#E6F4EA" accent="#188038" title="Connect" subtitle="Where students can learn more" />
              <div className="grid gap-3 p-6 sm:grid-cols-2">
                {links.map(({ icon: Icon, tint, accent, label, value, href }) => {
                  const content = (
                    <>
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 ${tint}`}
                        style={{ color: accent }}
                      >
                        <Icon size={18} strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#9AA0A6]">{label}</p>
                        <p className="truncate text-[0.9rem] font-medium text-[#202124]">{value}</p>
                      </div>
                      {href && (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#9AA0A6] transition-colors group-hover:bg-white group-hover:text-[#1A73E8]">
                          <ExternalLink size={13} />
                        </span>
                      )}
                    </>
                  )

                  return href ? (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-[20px] bg-[#FAFBFC] p-4 ring-1 ring-[#F1F3F4] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(17,24,39,0.08)] hover:ring-[#DCE9FE]"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={label} className="group flex items-center gap-3 rounded-[20px] bg-[#FAFBFC] p-4 ring-1 ring-[#F1F3F4]">
                      {content}
                    </div>
                  )
                })}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </main>
  )
}
