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
import cardsBackground from '../assets/cards_background.png'

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

function CardTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 border-b border-[rgba(13,24,61,0.07)] px-6 py-4">
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3C4] text-[#B07E00]">
          <Icon size={16} strokeWidth={2} />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-[0.95rem] font-semibold text-[#0D183D]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[0.8rem] text-[#4B6382]">{subtitle}</p>}
      </div>
    </div>
  )
}

function EditButton({ onEdit, label }) {
  return (
    <button
      onClick={onEdit}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9AA6BC] transition-colors hover:bg-[#FFF3C4] hover:text-[#B07E00]"
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
        className="h-9 rounded-full px-4 text-[0.82rem] font-medium text-[#4B6382] transition-colors hover:bg-[rgba(13,24,61,0.05)]"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0D183D] px-5 text-[0.82rem] font-medium text-white shadow-[0_4px_14px_rgba(13,24,61,0.25)] transition-all hover:bg-[#16204d] disabled:opacity-50"
      >
        <Check size={13} />
        Save
      </button>
    </div>
  )
}

function EditableText({ title, rows = 4, value, editing, editValue, onChange, onEdit, onSave, onCancel, saving }) {
  return (
    <section className="border-t border-[rgba(13,24,61,0.06)] px-6 py-5 first:border-t-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#4B6382]">
          {title}
        </h3>
        {!editing && <EditButton onEdit={onEdit} label={title} />}
      </div>
      {editing ? (
        <>
          <textarea
            value={editValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none rounded-2xl border border-[rgba(13,24,61,0.14)] bg-white px-4 py-3 text-[0.9rem] leading-7 text-[#1E2A44] outline-none transition-colors focus:border-[#FFB703] focus:ring-2 focus:ring-[#FFB703]/20"
            rows={rows}
          />
          <FieldActions saving={saving} onSave={onSave} onCancel={onCancel} />
        </>
      ) : (
        <p className="max-w-4xl whitespace-pre-wrap text-[0.9rem] leading-7 text-[#334066]">
          {value || <EmptyText />}
        </p>
      )}
    </section>
  )
}

// Three warm, on-brand tones — honey (focus), navy (skills), terracotta (projects) — instead of a generic blue/purple/green triad
const TOPIC_TINTS = {
  'Focus areas': {
    box: 'bg-[#FFFBF0] ring-[rgba(255,183,3,0.28)]',
    label: 'text-[#B07E00]',
    chip: 'border-[rgba(255,183,3,0.35)] bg-white text-[#8A5A00]',
  },
  'Preferred skills': {
    box: 'bg-[#F4F6FB] ring-[rgba(13,24,61,0.10)]',
    label: 'text-[#0D183D]',
    chip: 'border-[rgba(13,24,61,0.14)] bg-white text-[#1E2A44]',
  },
  'Project types': {
    box: 'bg-[#FFF4ED] ring-[rgba(234,108,10,0.22)]',
    label: 'text-[#C2540A]',
    chip: 'border-[rgba(234,108,10,0.3)] bg-white text-[#B84D0A]',
  },
}

// A standalone selectable box — these are pick-from-a-list fields, not free text,
// so each one reads as its own card sitting next to its siblings.
function EditableTopics({ title, options, items, editing, editValue, onChange, onEdit, onSave, onCancel, saving }) {
  const tint = TOPIC_TINTS[title] || { box: 'bg-[#FAFBFC] ring-[rgba(13,24,61,0.08)]', label: 'text-[#4B6382]', chip: 'border-[rgba(13,24,61,0.12)] bg-white text-[#334066]' }
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
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8rem] font-medium shadow-[0_1px_2px_rgba(13,24,61,0.04)] ${tint.chip}`}
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

// Radial profile-strength gauge — same technique as the student profile's score ring, in the brand's honey gold
function StrengthGauge({ percent, size = 92 }) {
  const r = 36, circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox="0 0 92 92" aria-label={`Profile strength ${percent}%`}>
      <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(13,24,61,0.08)" strokeWidth="7" />
      <motion.circle
        cx="46" cy="46" r={r} fill="none" stroke="#FFB703" strokeWidth="7"
        strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 46 46)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - percent / 100) }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
      />
      <text x="46" y="51" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0D183D">{percent}%</text>
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
    profile?.website && { icon: Globe, tint: 'bg-[rgba(13,24,61,0.06)]', accent: '#0D183D', label: 'Website', value: profile.website.replace(/^https?:\/\/(www\.)?/, ''), href: profile.website },
    profile?.instagram && { icon: Heart, tint: 'bg-[#FFF1E8]', accent: '#EA6C0A', label: 'Instagram', value: profile.instagram.replace(/^https?:\/\/(www\.)?/, ''), href: profile.instagram },
    profile?.twitter && { icon: AtSign, tint: 'bg-[#F3F5FA]', accent: '#4B6382', label: 'Twitter / X', value: profile.twitter.replace(/^https?:\/\/(www\.)?/, ''), href: profile.twitter },
    profile?.registrationNumber && { icon: Building2, tint: 'bg-[#FFF8E8]', accent: '#B07E00', label: 'Registration', value: profile.registrationNumber },
  ].filter(Boolean)

  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-7"
        >
          <h1 className="text-[3.25rem] font-semibold leading-tight text-[#0D183D]">
            Profile
          </h1>
          <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[#4B6382]">
            Keep your organization story, mission, focus areas, and links in one clear view for students and stronger matches.
          </p>
        </motion.header>

        {/* Identity card — the hive hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_12px_rgba(13,24,61,0.06),0_20px_48px_rgba(13,24,61,0.08)] ring-1 ring-[rgba(13,24,61,0.06)]"
        >
          <div
            className="relative h-[170px] w-full sm:h-[190px]"
            style={{ backgroundImage: `url(${cardsBackground})`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }}
          >
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="relative px-6 pb-6 sm:px-7 sm:pb-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="-mt-12 flex flex-col items-start gap-4 sm:-mt-14 sm:flex-row sm:items-end">
                <div className="relative h-24 w-24 shrink-0 rounded-[24px] bg-white p-1 shadow-[0_10px_28px_rgba(13,24,61,0.22)] sm:h-28 sm:w-28">
                  <div className="h-full w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFE680] to-[#FFB703]">
                    {profile?.imageUrl ? (
                      <img src={profile.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[1.9rem] font-bold text-[#0D183D]">
                        {initials || <Building2 size={30} />}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#0D183D] text-white shadow-[0_4px_12px_rgba(13,24,61,0.35)] ring-2 ring-white transition-transform hover:-translate-y-0.5"
                    title="Change logo"
                  >
                    <Camera size={13} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                </div>

                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-[1.85rem] font-bold tracking-[-0.015em] text-[#0D183D]">
                      {displayName}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[0.7rem] font-semibold text-[#188038]">
                      <ShieldCheck size={12} />
                      Verified organization
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-[0.92rem] leading-7 text-[#4B6382]">
                    {profile?.summary || 'Keep your organization profile clear, current, and ready for strong student matches.'}
                  </p>
                </div>
              </div>

              {/* Completeness — honey radial gauge */}
              <div className="flex w-full shrink-0 items-center gap-4 rounded-[22px] bg-gradient-to-br from-[#FFFBF0] to-white px-4 py-4 ring-1 ring-[rgba(255,183,3,0.22)] sm:w-[230px]">
                <StrengthGauge percent={completeness} />
                <div className="min-w-0">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#B07E00]">Profile strength</p>
                  <p className="mt-1 text-[0.76rem] leading-4 text-[#4B6382]">
                    {completeness >= 80
                      ? 'Looking great — ready for strong matches.'
                      : 'Complete more sections for stronger matches.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(13,24,61,0.04)] ring-1 ring-[rgba(13,24,61,0.06)]"
          >
            <CardTitle icon={FileText} title="About" subtitle="How students get to know your organization" />
            <EditableText title="About the organization" value={profile?.description} {...fieldProps('description')} />
            <EditableText title="Mission" value={profile?.mission} {...fieldProps('mission')} />
            <EditableText title="What we need help with" value={profile?.helpNeeded} {...fieldProps('helpNeeded')} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(13,24,61,0.04)] ring-1 ring-[rgba(13,24,61,0.06)]"
          >
            <CardTitle icon={Layers} title="Focus" subtitle="What you work on and the skills you look for" />
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
              className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(13,24,61,0.04)] ring-1 ring-[rgba(13,24,61,0.06)]"
            >
              <CardTitle icon={Link2} title="Connect" subtitle="Where students can learn more" />
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
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#9AA6BC]">{label}</p>
                        <p className="truncate text-[0.9rem] font-medium text-[#0D183D]">{value}</p>
                      </div>
                      {href && (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#9AA6BC] transition-colors group-hover:bg-white group-hover:text-[#B07E00]">
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
                      className="group flex items-center gap-3 rounded-[20px] bg-[#FAFBFC] p-4 ring-1 ring-[rgba(13,24,61,0.06)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(13,24,61,0.08)] hover:ring-[rgba(255,183,3,0.35)]"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={label} className="group flex items-center gap-3 rounded-[20px] bg-[#FAFBFC] p-4 ring-1 ring-[rgba(13,24,61,0.06)]">
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
