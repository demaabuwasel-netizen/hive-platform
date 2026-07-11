import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Globe, Heart, Target, Edit2,
  Camera, ExternalLink, Check, ShieldCheck,
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
  return <p className="text-[0.9rem] text-[#9AA0A6]">{children}</p>
}

function CardTitle({ title, subtitle }) {
  return (
    <div className="border-b border-[#E8EAED] px-6 py-4">
      <h2 className="text-[0.95rem] font-medium text-[#202124]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[0.8rem] text-[#5F6368]">{subtitle}</p>}
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
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A73E8] px-5 text-[0.82rem] font-medium text-white transition-colors hover:bg-[#1765CC] disabled:opacity-50"
      >
        <Check size={13} />
        Save
      </button>
    </div>
  )
}

function EditableText({ title, rows = 4, value, editing, editValue, onChange, onEdit, onSave, onCancel, saving }) {
  return (
    <section className="border-t border-[#E8EAED] px-6 py-5 first:border-t-0">
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

function EditableTopics({ title, options, items, editing, editValue, onChange, onEdit, onSave, onCancel, saving }) {
  return (
    <section className="border-t border-[#E8EAED] px-6 py-5 first:border-t-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#5F6368]">
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
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-lg border border-[#DADCE0] bg-white px-3 py-1.5 text-[0.8rem] text-[#3C4043]"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <EmptyText />
      )}
    </section>
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
    profile?.website && { icon: Globe, label: 'Website', value: profile.website.replace(/^https?:\/\/(www\.)?/, ''), href: profile.website },
    profile?.instagram && { icon: Heart, label: 'Instagram', value: profile.instagram.replace(/^https?:\/\/(www\.)?/, ''), href: profile.instagram },
    profile?.twitter && { icon: Target, label: 'Twitter / X', value: profile.twitter.replace(/^https?:\/\/(www\.)?/, ''), href: profile.twitter },
    profile?.registrationNumber && { icon: Building2, label: 'Registration', value: profile.registrationNumber },
  ].filter(Boolean)

  return (
    <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
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

        {/* Identity card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white"
        >
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0">
                <div className="h-full w-full overflow-hidden rounded-full border border-[#E8EAED] bg-white">
                  {profile?.imageUrl ? (
                    <img src={profile.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#E8F0FE] text-[1.65rem] font-medium text-[#1A73E8]">
                      {initials || <Building2 size={30} />}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#E8EAED] bg-white text-[#5F6368] shadow-sm transition-colors hover:bg-[#F8F9FA] hover:text-[#1A73E8]"
                  title="Change logo"
                >
                  <Camera size={13} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[1.8rem] font-medium tracking-[-0.01em] text-[#202124]">
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

            {/* Completeness */}
            <div className="w-full shrink-0 rounded-2xl border border-[#E8EAED] bg-[#F8F9FA] px-4 py-3.5 sm:w-[210px]">
              <div className="flex items-center justify-between">
                <p className="text-[0.72rem] font-medium text-[#5F6368]">Profile strength</p>
                <p className="text-[0.8rem] font-medium text-[#202124]">{completeness}%</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8EAED]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: completeness >= 80 ? '#188038' : '#1A73E8' }}
                />
              </div>
              <p className="mt-2 text-[0.7rem] leading-4 text-[#9AA0A6]">
                {completeness >= 80
                  ? 'Looking great — students see a complete profile.'
                  : 'Complete more sections for stronger matches.'}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="mt-6 space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white"
          >
            <CardTitle title="About" subtitle="How students get to know your organization" />
            <EditableText title="About the organization" value={profile?.description} {...fieldProps('description')} />
            <EditableText title="Mission" value={profile?.mission} {...fieldProps('mission')} />
            <EditableText title="What we need help with" value={profile?.helpNeeded} {...fieldProps('helpNeeded')} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white"
          >
            <CardTitle title="Focus" subtitle="What you work on and the skills you look for" />
            <EditableTopics title="Focus areas" options={FOCUS_OPTIONS} items={profile?.tags} {...fieldProps('tags')} />
            <EditableTopics title="Preferred skills" options={SKILL_OPTIONS} items={profile?.preferred_skills} {...fieldProps('preferred_skills')} />
            <EditableTopics title="Project types" options={PROJECT_OPTIONS} items={profile?.project_types} {...fieldProps('project_types')} />
          </motion.section>

          {links.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="overflow-hidden rounded-[24px] border border-[#DADCE0] bg-white"
            >
              <CardTitle title="Connect" subtitle="Where students can learn more" />
              <div className="divide-y divide-[#E8EAED]">
                {links.map(({ icon: Icon, label, value, href }) => {
                  const content = (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F3F4] text-[#5F6368]">
                        <Icon size={17} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#9AA0A6]">{label}</p>
                        <p className="truncate text-[0.88rem] font-medium text-[#202124]">{value}</p>
                      </div>
                      {href && <ExternalLink size={14} className="text-[#9AA0A6]" />}
                    </>
                  )

                  return href ? (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-[#F8F9FA]"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={label} className="flex items-center gap-3 px-6 py-4">
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
