import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AtSign, BarChart3, Building2, Camera, Check, Code2, DollarSign, Edit2,
  ExternalLink, Globe, GraduationCap, Heart, HeartHandshake, HelpingHand,
  Megaphone, MessageCircle, PenTool, Quote, ShieldCheck, Sparkles, Target, Users2,
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

// Keyword → icon so chips feel identified, not just labeled
function topicIcon(name) {
  const n = name.toLowerCase()
  if (/programming|web|mobile|app|code|technology|cloud|ai\/machine/.test(n)) return Code2
  if (/design|graphic|ux|user experience|branding/.test(n)) return PenTool
  if (/communication|public speaking|social media/.test(n)) return MessageCircle
  if (/marketing|advocacy|pr|public relations/.test(n)) return Megaphone
  if (/leadership|management|hr|volunteer coordination|mentoring|mentorship/.test(n)) return Users2
  if (/data|analysis|analytics|dashboard|research/.test(n)) return BarChart3
  if (/finance|accounting|legal/.test(n)) return DollarSign
  if (/education|curriculum|youth development/.test(n)) return GraduationCap
  if (/fundraising|grant|community/.test(n)) return HeartHandshake
  return Sparkles
}

function EmptyText({ children = 'Not added yet' }) {
  return <p className="text-[0.88rem] italic text-[#9AA0A6]">{children}</p>
}

// Big, bold icon badge — the visual anchor of every tile
function TileIcon({ icon: Icon, tint, accent, size = 46 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{ width: size, height: size, background: tint, color: accent }}
    >
      <Icon size={size * 0.46} strokeWidth={2} />
    </span>
  )
}

function EditButton({ onEdit, label, light = false }) {
  return (
    <button
      onClick={onEdit}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
        light
          ? 'text-white/70 hover:bg-white/15 hover:text-white'
          : 'text-[#9AA0A6] hover:bg-black/[0.04] hover:text-[#1A73E8]'
      }`}
      aria-label={`Edit ${label}`}
    >
      <Edit2 size={14} />
    </button>
  )
}

function FieldActions({ saving, onSave, onCancel, light = false }) {
  return (
    <div className="mt-3 flex justify-end gap-2">
      <button
        onClick={onCancel}
        className={`h-9 rounded-full px-4 text-[0.82rem] font-medium transition-colors ${
          light ? 'text-white/80 hover:bg-white/10' : 'text-[#5F6368] hover:bg-[#F1F3F4]'
        }`}
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full px-5 text-[0.82rem] font-medium shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all disabled:opacity-50 ${
          light ? 'bg-white text-[#1A73E8] hover:bg-white/90' : 'bg-[#1A73E8] text-white hover:bg-[#1765CC]'
        }`}
      >
        <Check size={13} />
        Save
      </button>
    </div>
  )
}

const TONES = {
  blue:   { tint: '#E8F0FE', accent: '#1A73E8', chip: 'border-[#D7E6FF] bg-white text-[#1A73E8]' },
  purple: { tint: '#F3E8FD', accent: '#A142F4', chip: 'border-[#E9DCFB] bg-white text-[#8B3DD8]' },
  green:  { tint: '#E6F4EA', accent: '#188038', chip: 'border-[#CDEBD8] bg-white text-[#188038]' },
  amber:  { tint: '#FEF3DC', accent: '#B36B00', chip: 'border-[#F6DFAF] bg-white text-[#B36B00]' },
  pink:   { tint: '#FCE8F3', accent: '#C2185B', chip: 'border-[#F6D2E5] bg-white text-[#C2185B]' },
  gray:   { tint: '#F1F3F4', accent: '#3C4043', chip: 'border-[#DADCE0] bg-white text-[#3C4043]' },
}

// A bento tile — white surface, big icon, editable body. The unit every box on this page is built from.
function Tile({ icon, tone = 'blue', label, span = '', minH = '', children, editing, editor, onEdit }) {
  const t = TONES[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-[26px] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,0.10),0_2px_6px_2px_rgba(60,64,67,0.05)] ring-1 ring-black/[0.03] ${span} ${minH}`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <TileIcon icon={icon} tint={t.tint} accent={t.accent} />
        {!editing && onEdit && <EditButton onEdit={onEdit} label={label} />}
      </div>
      <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.09em]" style={{ color: t.accent }}>{label}</p>
      {editing ? editor : children}
    </motion.div>
  )
}

function TextTile({ icon, tone, label, rows = 4, value, span, minH, fieldProps }) {
  const { editing, editValue, onChange, onEdit, onSave, onCancel, saving } = fieldProps
  return (
    <Tile
      icon={icon} tone={tone} label={label} span={span} minH={minH}
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
    </Tile>
  )
}

function ChipsTile({ icon, tone, label, options, items, span, minH, fieldProps }) {
  const { editing, editValue, onChange, onEdit, onSave, onCancel, saving } = fieldProps
  const t = TONES[tone]
  return (
    <Tile
      icon={icon} tone={tone} label={label} span={span} minH={minH}
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
          {items.map((item, index) => {
            const Icon = topicIcon(item)
            return (
              <span key={`${item}-${index}`} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.78rem] font-medium ${t.chip}`}>
                <Icon size={11} strokeWidth={2.2} />
                {item}
              </span>
            )
          })}
        </div>
      ) : (
        <EmptyText />
      )}
    </Tile>
  )
}

// Mission — the one deep-color hero tile in the grid; everything else is white
function MissionTile({ value, fieldProps }) {
  const { editing, editValue, onChange, onEdit, onSave, onCancel, saving } = fieldProps
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#1A73E8] to-[#1554B0] p-5 text-white shadow-[0_8px_24px_rgba(26,115,232,0.28)] md:row-span-2"
    >
      <Quote className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 text-white/10" strokeWidth={1} />
      <div className="relative mb-4 flex items-start justify-between gap-2">
        <TileIcon icon={Target} tint="rgba(255,255,255,0.16)" accent="#FFFFFF" />
        {!editing && <EditButton onEdit={onEdit} label="Mission" light />}
      </div>
      <p className="relative mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-white/70">Mission</p>
      {editing ? (
        <div className="relative">
          <textarea
            value={editValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none rounded-xl border border-white/25 bg-white/10 px-3.5 py-2.5 text-[0.92rem] leading-6 text-white outline-none transition-colors placeholder:text-white/50 focus:border-white/60"
            rows={5}
            autoFocus
          />
          <FieldActions saving={saving} onSave={onSave} onCancel={onCancel} light />
        </div>
      ) : (
        <p className="relative text-[1.05rem] font-medium leading-8">
          {value || <span className="text-white/60">No mission statement yet</span>}
        </p>
      )}
    </motion.div>
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
    profile?.website && { icon: Globe, tone: 'blue', label: 'Website', value: profile.website.replace(/^https?:\/\/(www\.)?/, ''), href: profile.website },
    profile?.instagram && { icon: Heart, tone: 'pink', label: 'Instagram', value: profile.instagram.replace(/^https?:\/\/(www\.)?/, ''), href: profile.instagram },
    profile?.twitter && { icon: AtSign, tone: 'gray', label: 'Twitter / X', value: profile.twitter.replace(/^https?:\/\/(www\.)?/, ''), href: profile.twitter },
    profile?.registrationNumber && { icon: Building2, tone: 'purple', label: 'Registration', value: profile.registrationNumber },
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

        {/* Identity strip */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-6 overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.10),0_2px_6px_2px_rgba(60,64,67,0.05)] ring-1 ring-black/[0.03]"
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

            <div className="flex w-full shrink-0 items-center gap-4 rounded-[22px] bg-gradient-to-br from-[#F7FAFF] to-[#FBFCFE] px-4 py-4 ring-1 ring-[#EEF1F6] sm:w-[220px]">
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

        {/* Bento grid — varied tile sizes, big icons, one deep-color hero tile */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <TextTile icon={Sparkles} tone="blue" label="About the organization" value={profile?.description} fieldProps={fieldProps('description')} minH="min-h-[176px]" />
          </div>
          <MissionTile value={profile?.mission} fieldProps={fieldProps('mission')} />

          <div className="md:col-span-2">
            <TextTile icon={HelpingHand} tone="amber" label="What we need help with" rows={3} value={profile?.helpNeeded} fieldProps={fieldProps('helpNeeded')} minH="min-h-[150px]" />
          </div>

          <ChipsTile icon={Target} tone="blue" label="Focus areas" options={FOCUS_OPTIONS} items={profile?.tags} fieldProps={fieldProps('tags')} minH="min-h-[170px]" />
          <ChipsTile icon={Sparkles} tone="purple" label="Preferred skills" options={SKILL_OPTIONS} items={profile?.preferred_skills} fieldProps={fieldProps('preferred_skills')} minH="min-h-[170px]" />
          <ChipsTile icon={BarChart3} tone="green" label="Project types" options={PROJECT_OPTIONS} items={profile?.project_types} fieldProps={fieldProps('project_types')} minH="min-h-[170px]" />

          {links.map((link) => {
            const t = TONES[link.tone]
            const content = (
              <>
                <div className="mb-4">
                  <TileIcon icon={link.icon} tint={t.tint} accent={t.accent} size={40} />
                </div>
                <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.09em]" style={{ color: t.accent }}>{link.label}</p>
                <p className="truncate text-[0.92rem] font-medium text-[#202124]">{link.value}</p>
              </>
            )
            return link.href ? (
              <motion.a
                key={link.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-[26px] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,0.10),0_2px_6px_2px_rgba(60,64,67,0.05)] ring-1 ring-black/[0.03] transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(17,24,39,0.1)]"
              >
                {content}
                <ExternalLink size={13} className="absolute right-5 top-5 text-[#C4C7CC] opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.a>
            ) : (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[26px] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,0.10),0_2px_6px_2px_rgba(60,64,67,0.05)] ring-1 ring-black/[0.03]"
              >
                {content}
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
