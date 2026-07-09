import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2, Globe, Heart, Target, Edit2,
  Camera, ExternalLink, X, Check
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

function SectionHeader({ title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
        {title}
      </p>
      {action}
    </div>
  )
}

function EmptyText({ children = 'Not added yet' }) {
  return <p className="text-[0.9rem] text-[#9AA0A6]">{children}</p>
}

export default function NGOProfile() {
  const { user, profile, updateProfile } = useApp()
  const navigate = useNavigate()
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

  const EditButton = ({ field }) => (
    <button
      onClick={() => startEdit(field)}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#5F6368] transition-colors hover:bg-[#F1F5FE] hover:text-[#1A73E8]"
      aria-label={`Edit ${field}`}
    >
      <Edit2 size={14} />
    </button>
  )

  const FieldActions = ({ field }) => (
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => saveEdit(field)}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#1A73E8] px-4 py-2 text-[0.82rem] font-semibold text-white transition-opacity disabled:opacity-50"
      >
        <Check size={13} />
        Save
      </button>
      <button
        onClick={cancelEdit}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EEFB] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#5F6368] transition-colors hover:bg-[#FBFCFE]"
      >
        <X size={13} />
        Cancel
      </button>
    </div>
  )

  const EditableText = ({ field, title, rows = 4 }) => (
    <section className="border-t border-[#E5EEFB] py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
          {title}
        </h3>
        {editingField !== field && <EditButton field={field} />}
      </div>
      {editingField === field ? (
        <>
          <textarea
            value={editValues[field] || ''}
            onChange={(e) => setEditValues({ [field]: e.target.value })}
            className="w-full resize-none rounded-[20px] border border-[#DDE7F7] bg-[#FBFCFE] px-4 py-3 text-[0.92rem] leading-7 text-[#202124] outline-none focus:border-[#1A73E8] focus:ring-4 focus:ring-[#1A73E8]/10"
            rows={rows}
          />
          <FieldActions field={field} />
        </>
      ) : (
        <p className="max-w-4xl whitespace-pre-wrap text-[0.94rem] leading-8 text-[#5F6368]">
          {profile?.[field] || <EmptyText />}
        </p>
      )}
    </section>
  )

  const EditableTopics = ({ field, title, options }) => (
    <section className="border-t border-[#E5EEFB] py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
          {title}
        </h3>
        {editingField !== field && <EditButton field={field} />}
      </div>
      {editingField === field ? (
        <>
          <TopicPicker
            value={editValues[field] || []}
            onChange={(items) => setEditValues({ [field]: items })}
            options={options}
            placeholder={`Search or add ${title.toLowerCase()}...`}
          />
          <FieldActions field={field} />
        </>
      ) : profile?.[field]?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile[field].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-1.5 text-[0.82rem] font-medium text-[#5F6368]"
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
          className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl">
            <h1 className="text-[3.25rem] font-semibold leading-tight text-[#202124]">
              Profile
            </h1>
            <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[#5F6368]">
              Keep your organization story, mission, focus areas, and links in one clear view for students and stronger matches.
            </p>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[34px] border p-7 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
          style={{
            borderColor: 'rgba(26,115,232,0.10)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F6FAFF 48%, #E8F0FE 100%)'
          }}
        >
          <div
            className="absolute inset-x-8 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(26,115,232,0.45), transparent)' }}
          />
          <div
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(26,115,232,0.13), transparent 62%)' }}
          />
          <div
            className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(66,133,244,0.10), transparent 64%)' }}
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_14px_34px_rgba(26,115,232,0.16)]">
                {profile?.imageUrl ? (
                  <img src={profile.imageUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#E8F0FE] text-[1.65rem] font-semibold text-[#1A73E8]">
                    {initials || <Building2 size={30} />}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1A73E8] shadow-[0_4px_14px_rgba(26,115,232,0.18)]"
                  title="Change logo"
                >
                  <Camera size={13} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
              </div>

              <div className="min-w-0">
                <h1 className="text-[2.3rem] font-semibold tracking-[-0.04em] text-[#202124]">
                  {displayName}
                </h1>
                <p className="mt-2 max-w-2xl text-[0.98rem] leading-7 text-[#5F6368]">
                  {profile?.summary || 'Keep your organization profile clear, current, and ready for strong student matches.'}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-7 space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-[30px] border bg-white p-6"
            style={{ borderColor: 'rgba(26,115,232,0.10)' }}
          >
            <SectionHeader title="About" />
            <EditableText field="description" title="About the organization" />
            <EditableText field="mission" title="Mission" />
            <EditableText field="helpNeeded" title="What we need help with" />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-[30px] border bg-white p-6"
            style={{ borderColor: 'rgba(26,115,232,0.10)' }}
          >
            <SectionHeader title="Focus" />
            <EditableTopics field="tags" title="Focus areas" options={FOCUS_OPTIONS} />
            <EditableTopics field="preferred_skills" title="Preferred skills" options={SKILL_OPTIONS} />
            <EditableTopics field="project_types" title="Project types" options={PROJECT_OPTIONS} />
          </motion.section>

          {links.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="rounded-[30px] border bg-white p-6"
              style={{ borderColor: 'rgba(26,115,232,0.10)' }}
            >
              <SectionHeader title="Connect" />
              <div className="space-y-3">
                {links.map(({ icon: Icon, label, value, href }) => {
                  const content = (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1A73E8]">
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">{label}</p>
                        <p className="truncate text-[0.88rem] font-semibold text-[#202124]">{value}</p>
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
                      className="flex items-center gap-3 rounded-[22px] border border-[#E5EEFB] bg-[#FBFCFE] p-3 transition-colors hover:bg-white"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={label} className="flex items-center gap-3 rounded-[22px] border border-[#E5EEFB] bg-[#FBFCFE] p-3">
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
