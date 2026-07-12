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
  return <p className="text-[0.88rem] italic text-[#9AA0A6]">{children}</p>
}

// Small group label sitting above a set of related boxes — this is what groups them, not a bordering container
function GroupTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <Icon size={15} className="text-[#5F6368]" />
      <h2 className="text-[0.85rem] font-semibold text-[#202124]">{title}</h2>
      {subtitle && <span className="text-[0.8rem] text-[#9AA0A6]">— {subtitle}</span>}
    </div>
  )
}

function EditButton({ onEdit, label }) {
  return (
    <button
      onClick={onEdit}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9AA0A6] transition-colors hover:bg-black/[0.04] hover:text-[#1A73E8]"
      aria-label={`Edit ${label}`}
    >
      <Edit2 size={14} />
    </button>
  )
}

function FieldActions({ saving, onSave, onCancel }) {
  return (
    <div className="relative mt-3 flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="h-9 rounded-full px-4 text-[0.82rem] font-medium text-[#5F6368] transition-colors hover:bg-[#F1F3F4]"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A73E8] px-5 text-[0.82rem] font-medium text-white shadow-[0_4px_14px_rgba(26,115,232,0.22)] transition-all hover:bg-[#1765CC] disabled:opacity-50"
      >
        <Check size={13} />
        Save
      </button>
    </div>
  )
}

// A single box — flat white, blue icon badge for identity, and an accordion-style
// expand into a blue-tinted panel when editing. No decorative shapes.
function Box({ icon: Icon, label, minH = '', children, editing, editor, onEdit }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={`relative rounded-[20px] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,0.08),0_1px_3px_rgba(60,64,67,0.06)] ring-1 transition-shadow duration-200 ${
        editing ? 'ring-2 ring-[#1A73E8]/40 shadow-[0_6px_20px_rgba(26,115,232,0.14)]' : 'ring-black/[0.05] hover:shadow-[0_2px_8px_rgba(60,64,67,0.1)]'
      } ${minH}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
              <Icon size={16} strokeWidth={2.1} />
            </span>
          )}
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-[#5F6368]">{label}</p>
        </div>
        {!editing && onEdit && <EditButton onEdit={onEdit} label={label} />}
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={editing ? 'editor' : 'view'}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          {editing ? (
            <div className="rounded-xl bg-[#EEF3FC] p-3.5">
              {editor}
            </div>
          ) : children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function TextBox({ icon, label, rows = 4, value, minH, fieldProps }) {
  const { editing, editValue, onChange, onEdit, onSave, onCancel, saving } = fieldProps
  return (
    <Box
      icon={icon} label={label} minH={minH}
      editing={editing} onEdit={onEdit}
      editor={
        <>
          <textarea
            value={editValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none rounded-xl border border-[#DADCE0] bg-white px-3.5 py-2.5 text-[0.9rem] leading-6 text-[#3C4043] outline-none transition-colors focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/15"
            rows={rows}
            autoFocus
          />
          <FieldActions saving={saving} onSave={onSave} onCancel={onCancel} />
        </>
      }
    >
      <p className="whitespace-pre-wrap text-[0.9rem] leading-7 text-[#3C4043]">
        {value || <EmptyText />}
      </p>
    </Box>
  )
}

function ChipsBox({ icon, label, options, items, minH, fieldProps }) {
  const { editing, editValue, onChange, onEdit, onSave, onCancel, saving } = fieldProps
  return (
    <Box
      icon={icon} label={label} minH={minH}
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
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className="inline-flex items-center rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[0.78rem] font-medium text-[#1A57C4]">
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

// Radial profile-strength gauge — same technique used for match gauges on Analytics
function StrengthGauge({ percent, size = 84 }) {
  const r = 33, circ = 2 * Math.PI * r
  const color = percent >= 80 ? '#188038' : percent >= 40 ? '#1A73E8' : '#B06000'
  const track = percent >= 80 ? '#E6F4EA' : percent >= 40 ? '#E8F0FE' : '#FEF7E0'
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" aria-label={`Profile strength ${percent}%`}>
      <circle cx="42" cy="42" r={r} fill="none" stroke={track} strokeWidth="7" />
      <motion.circle
        cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 42 42)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - percent / 100) }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
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
    <main className="min-h-screen bg-[#F6F8FC]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
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

        {/* Identity strip */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-8 overflow-hidden rounded-[24px] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.10),0_2px_6px_2px_rgba(60,64,67,0.05)] ring-1 ring-black/[0.03]"
        >
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-7">
            <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 rounded-[22px] bg-[#F1F3F4] p-1 sm:h-28 sm:w-28">
                <div className="h-full w-full overflow-hidden rounded-[18px] bg-[#EEF3FC]">
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
                  <h2 className="text-[2.05rem] font-semibold tracking-[-0.02em] text-[#202124]">
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

            <div className="flex w-full shrink-0 items-center gap-4 rounded-[18px] bg-[#FAFBFC] px-4 py-4 ring-1 ring-black/[0.04] sm:w-[220px]">
              <StrengthGauge percent={completeness} />
              <div className="min-w-0">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#9AA0A6]">Profile strength</p>
                <p className="mt-1 text-[0.76rem] leading-4 text-[#5F6368]">
                  {completeness >= 80 ? 'Ready for strong matches.' : 'Add more to strengthen it.'}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="space-y-9">
          {/* About group */}
          <div>
            <GroupTitle icon={FileText} title="About" subtitle="how students get to know you" />
            <div className="space-y-4">
              <TextBox icon={Sparkles} label="About the organization" value={profile?.description} fieldProps={fieldProps('description')} minH="min-h-[150px]" />
              <TextBox icon={Target} label="Mission" rows={3} value={profile?.mission} fieldProps={fieldProps('mission')} minH="min-h-[130px]" />
              <TextBox icon={HandHeart} label="What we need help with" rows={3} value={profile?.helpNeeded} fieldProps={fieldProps('helpNeeded')} minH="min-h-[130px]" />
            </div>
          </div>

          {/* Focus group */}
          <div>
            <GroupTitle icon={Layers2} title="Focus" subtitle="what you work on and who you're looking for" />
            <div className="space-y-4">
              <ChipsBox icon={Target} label="Focus areas" options={FOCUS_OPTIONS} items={profile?.tags} fieldProps={fieldProps('tags')} minH="min-h-[110px]" />
              <ChipsBox icon={Sparkles} label="Preferred skills" options={SKILL_OPTIONS} items={profile?.preferred_skills} fieldProps={fieldProps('preferred_skills')} minH="min-h-[110px]" />
              <ChipsBox icon={BarChart3} label="Project types" options={PROJECT_OPTIONS} items={profile?.project_types} fieldProps={fieldProps('project_types')} minH="min-h-[110px]" />
            </div>
          </div>

          {/* Connect group */}
          {links.length > 0 && (
            <div>
              <GroupTitle icon={Link2} title="Connect" subtitle="where students can learn more" />
              <div className="space-y-3">
                {links.map(({ icon: Icon, label, value, href }) => {
                  const content = (
                    <>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
                        <Icon size={17} strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#9AA0A6]">{label}</p>
                        <p className="truncate text-[0.9rem] font-medium text-[#202124]">{value}</p>
                      </div>
                      {href && <ExternalLink size={13} className="shrink-0 text-[#9AA0A6] opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-[#1A73E8]" />}
                    </>
                  )
                  return href ? (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2 }}
                      className="group flex items-center gap-3 rounded-[18px] bg-white p-4 shadow-[0_1px_2px_rgba(60,64,67,0.08),0_1px_3px_rgba(60,64,67,0.06)] ring-1 ring-black/[0.05] transition-shadow hover:shadow-[0_4px_14px_rgba(26,115,232,0.14)]"
                    >
                      {content}
                    </motion.a>
                  ) : (
                    <div key={label} className="group flex items-center gap-3 rounded-[18px] bg-white p-4 shadow-[0_1px_2px_rgba(60,64,67,0.08),0_1px_3px_rgba(60,64,67,0.06)] ring-1 ring-black/[0.05]">
                      {content}
                    </div>
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
