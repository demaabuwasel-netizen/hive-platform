import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, ChevronRight, Edit3, X, Check,
  MapPin, Mail, Calendar, Clock,
  Users, Leaf, Heart, Code, Home, GraduationCap, Zap,
  PawPrint, Apple, Scale, Palette, Trees, Plus, Trash2,
  Briefcase, Globe, BookOpen, ChevronDown,
  Phone,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AvatarDisplay } from '../components/Avatar'
import { groupSkills } from '../data/skills'
import cardsBackground from '../assets/cards_background.png'

const SKILL_COLORS = {
  'Programming': '#3B82F6',
  'Data & AI': '#8B5CF6',
  'Design': '#EC4899',
  'Marketing': '#F59E0B',
  'Business': '#10B981',
  'Other': '#6B7280',
}

function getSkillCategory(skillName) {
  const skillLower = skillName.toLowerCase()
  if (['python', 'javascript', 'react', 'node', 'java', 'cpp', 'rust', 'golang', 'typescript'].some(s => skillLower.includes(s))) return 'Programming'
  if (['data', 'machine learning', 'ai', 'analytics', 'sql', 'tableau'].some(s => skillLower.includes(s))) return 'Data & AI'
  if (['figma', 'design', 'ui', 'ux', 'photoshop', 'sketch'].some(s => skillLower.includes(s))) return 'Design'
  if (['marketing', 'seo', 'social media', 'content'].some(s => skillLower.includes(s))) return 'Marketing'
  if (['sales', 'business', 'strategy', 'leadership'].some(s => skillLower.includes(s))) return 'Business'
  return 'Other'
}

export default function StudentProfile() {
  const { user, profile, updateProfile } = useApp()
  const displayName = profile?.name || user?.name || 'Student'
  const [globalEditMode, setGlobalEditMode] = useState(false)

  // Skills
  const skillsWithLevel = (profile?.skills || []).map(s => typeof s === 'string' ? { name: s, level: '' } : s)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('')
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return
    const updated = [...skillsWithLevel, { name: newSkillName, level: newSkillLevel }]
    setNewSkillName('')
    setNewSkillLevel('')
    await updateProfile({ ...profile, skills: updated })
  }
  const handleRemoveSkill = async (idx) => {
    await updateProfile({ ...profile, skills: skillsWithLevel.filter((_, i) => i !== idx) })
  }

  // Languages
  const languages = profile?.languages || []
  const [newLanguage, setNewLanguage] = useState('')
  const handleAddLanguage = async () => {
    if (!newLanguage.trim() || languages.includes(newLanguage)) return
    await updateProfile({ ...profile, languages: [...languages, newLanguage] })
    setNewLanguage('')
  }
  const handleRemoveLanguage = async (lang) => {
    await updateProfile({ ...profile, languages: languages.filter(l => l !== lang) })
  }

  // Causes
  const causes = profile?.causes || []
  const [newCause, setNewCause] = useState('')
  const handleAddCause = async () => {
    if (!newCause.trim() || causes.includes(newCause)) return
    await updateProfile({ ...profile, causes: [...causes, newCause] })
    setNewCause('')
  }
  const handleRemoveCause = async (cause) => {
    await updateProfile({ ...profile, causes: causes.filter(c => c !== cause) })
  }

  // Bio
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState(profile?.bio || '')
  const handleSaveBio = async () => {
    await updateProfile({ ...profile, bio: bioDraft })
    setEditingBio(false)
  }

  // Experience
  const experiences = profile?.experiences || []
  const [editingExpIdx, setEditingExpIdx] = useState(null)
  const [newExp, setNewExp] = useState({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
  const handleSaveExperience = async () => {
    if (editingExpIdx !== null) {
      const updated = [...experiences]
      updated[editingExpIdx] = newExp
      await updateProfile({ ...profile, experiences: updated })
    } else if (newExp.title || newExp.description) {
      await updateProfile({ ...profile, experiences: [...experiences, newExp] })
    }
    setEditingExpIdx(null)
    setNewExp({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' })
  }
  const handleDeleteExperience = async (idx) => {
    await updateProfile({ ...profile, experiences: experiences.filter((_, i) => i !== idx) })
  }

  // Profile score
  const calculateScore = () => {
    let score = 0
    if (profile?.name) score += 10
    if (profile?.bio) score += 15
    if (profile?.university) score += 10
    if (profile?.field) score += 10
    if (skillsWithLevel.length >= 3) score += 20
    if (languages.length >= 2) score += 10
    if (causes.length >= 2) score += 10
    if (experiences.length > 0) score += 15
    return Math.min(score, 100)
  }
  const score = calculateScore()

  const skillsByCategory = skillsWithLevel.reduce((acc, skill) => {
    const cat = getSkillCategory(skill.name)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  return (
    <main className="flex-1 overflow-y-auto bg-[#FAFBFC]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="relative bg-gradient-to-br from-white to-[#FAFBFC] rounded-3xl border border-[rgba(13,24,61,0.08)] p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: `url(${cardsBackground})`, backgroundSize: 'auto', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.03] blur-3xl pointer-events-none" style={{ background: '#FFB703' }} />

            <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFB703]/10 to-[#FFB703]/5 flex items-center justify-center border border-[rgba(255,183,3,0.15)]">
                  <AvatarDisplay src={profile?.imageUrl} name={displayName} size="xl" className="w-full h-full" />
                  <button className="absolute bottom-1 right-1 p-2 bg-[#FFB703] rounded-lg text-white hover:opacity-90 transition-opacity shadow-lg">
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div>
                <h1 className="text-4xl font-bold text-[#0D183D] mb-2">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4 text-[14px]">
                  {profile?.field && <span className="text-[#4B6382] font-medium">{profile.field}</span>}
                  {profile?.university && (
                    <div className="flex items-center gap-1.5 text-[#4B6382]">
                      <Home size={14} />
                      {profile.university}
                    </div>
                  )}
                </div>

                {editingBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={bioDraft}
                      onChange={e => setBioDraft(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#FFB703] outline-none text-[15px]"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveBio} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#0D183D] text-white">
                        <Check size={13} className="inline mr-1" /> Save
                      </button>
                      <button onClick={() => setEditingBio(false)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#4B6382] hover:bg-[#F0F1F3]">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[15px] leading-relaxed text-[#4B6382] mb-2">
                      {profile?.bio || <span className="italic text-[#9CA3AF]">Add a bio to let NGOs know who you are</span>}
                    </p>
                    {globalEditMode && (
                      <button onClick={() => { setEditingBio(true); setBioDraft(profile?.bio || ''); }} className="text-[12px] font-semibold text-[#FFB703] flex items-center gap-1 hover:opacity-80">
                        <Edit3 size={12} /> Edit bio
                      </button>
                    )}
                  </>
                )}

                {user?.email && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[rgba(13,24,61,0.06)]">
                    <Mail size={14} className="text-[#4B6382]" />
                    <span className="text-[13px] text-[#4B6382]">{user.email}</span>
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>✓ Verified</span>
                  </div>
                )}
              </div>

              {/* Profile Strength */}
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-[#FFB703]/5 to-transparent border border-[rgba(255,183,3,0.1)]">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="transform -rotate-90 w-24 h-24" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(13,24,61,0.08)" strokeWidth="4" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#FFB703" strokeWidth="4" strokeDasharray={`${(score / 100) * 251} 251`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-2xl font-bold text-[#FFB703]">{score}%</p>
                    <p className="text-[10px] font-semibold text-[#4B6382]">Complete</p>
                  </div>
                </div>
                <div className="text-center w-full">
                  <p className="text-[12px] font-semibold text-[#FFB703] mb-3">{score >= 75 ? '🔥 Strong' : score >= 50 ? '✨ Good' : '🚀 Getting There'}</p>
                  <button
                    onClick={() => setGlobalEditMode(!globalEditMode)}
                    className="w-full px-3 py-2 rounded-lg font-semibold text-[12px] transition-all"
                    style={{ background: globalEditMode ? '#FFB703' : '#0D183D', color: globalEditMode ? '#0D183D' : 'white' }}
                  >
                    {globalEditMode ? 'Done' : 'Edit Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SKILLS */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#4B6382]">Skills</h2>
          </div>

          {skillsWithLevel.length > 0 ? (
            <div className="space-y-4 mb-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#4B6382] mb-4">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: SKILL_COLORS[category] }}></span>
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white hover:bg-[#FAFBFC] transition-colors group">
                        <span className="text-[14px] font-medium text-[#0D183D]">{skill.name}</span>
                        {skill.level && (
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: `${SKILL_COLORS[category]}15`, color: SKILL_COLORS[category] }}>
                            {skill.level}
                          </span>
                        )}
                        {globalEditMode && (
                          <button onClick={() => handleRemoveSkill(idx)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} className="text-[#9CA3AF]" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8 text-center mb-4">
              <Zap size={32} className="mx-auto mb-3 text-[#FFB703]" />
              <p className="text-[14px] font-medium text-[#0D183D] mb-1">No skills yet</p>
              <p className="text-[13px] text-[#4B6382]">Add skills to help NGOs find you</p>
            </div>
          )}

          {globalEditMode && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#4B6382] mb-3">Add a skill</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  placeholder="Skill name..."
                  className="flex-1 px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] outline-none focus:border-[#FFB703]"
                />
                <input
                  type="text"
                  value={newSkillLevel}
                  onChange={e => setNewSkillLevel(e.target.value)}
                  placeholder="Level (optional)"
                  className="px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] outline-none focus:border-[#FFB703] w-[120px]"
                />
                <button onClick={handleAddSkill} className="px-4 py-2 rounded-lg bg-[#FFB703] text-[#0D183D] font-semibold text-[12px] hover:opacity-90 flex items-center gap-1">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* LANGUAGES & CAUSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Languages */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#4B6382] mb-3">Languages</h3>
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {languages.map(lang => (
                    <div key={lang} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B82F6]/10 text-[#1E40AF] text-[13px] font-medium group">
                      <Globe size={12} />
                      {lang}
                      {globalEditMode && (
                        <button onClick={() => handleRemoveLanguage(lang)} className="opacity-0 group-hover:opacity-100">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#9CA3AF] italic mb-4">No languages added yet</p>
              )}
              {globalEditMode && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={e => setNewLanguage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddLanguage()}
                    placeholder="Add language..."
                    className="flex-1 px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[12px] outline-none focus:border-[#FFB703]"
                  />
                  <button onClick={handleAddLanguage} className="px-3 py-2 rounded-lg bg-[#FFB703] text-[#0D183D] font-semibold text-[12px] hover:opacity-90">
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Causes */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#4B6382] mb-3">Causes</h3>
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
              {causes.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {causes.map(cause => (
                    <div key={cause} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EC4899]/10 text-[#BE185D] text-[13px] font-medium group">
                      <Heart size={12} />
                      {cause}
                      {globalEditMode && (
                        <button onClick={() => handleRemoveCause(cause)} className="opacity-0 group-hover:opacity-100">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#9CA3AF] italic mb-4">No causes added yet</p>
              )}
              {globalEditMode && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCause}
                    onChange={e => setNewCause(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCause()}
                    placeholder="Add cause..."
                    className="flex-1 px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[12px] outline-none focus:border-[#FFB703]"
                  />
                  <button onClick={handleAddCause} className="px-3 py-2 rounded-lg bg-[#FFB703] text-[#0D183D] font-semibold text-[12px] hover:opacity-90">
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* EXPERIENCE */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#4B6382]">Experience</h2>
          </div>

          {experiences.length > 0 && (
            <div className="space-y-4 mb-4">
              {experiences.map((exp, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-[15px] font-semibold text-[#0D183D]">{exp.title}</h3>
                    {globalEditMode && (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingExpIdx(idx); setNewExp(exp); }} className="text-[#FFB703] hover:opacity-80">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteExperience(idx)} className="text-[#EF4444]">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  {exp.organization && <p className="text-[13px] text-[#4B6382] mb-2">{exp.organization}</p>}
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-[12px] text-[#9CA3AF] mb-2 flex items-center gap-1">
                      <Calendar size={12} /> {exp.startDate} {exp.endDate && `- ${exp.endDate}`}
                    </p>
                  )}
                  {exp.description && <p className="text-[13px] text-[#4B6382]">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {editingExpIdx !== null ? (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 space-y-3 mb-4">
              <input type="text" value={newExp.title} onChange={e => setNewExp({ ...newExp, title: e.target.value })} placeholder="Job title..." className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] outline-none focus:border-[#FFB703]" />
              <input type="text" value={newExp.organization} onChange={e => setNewExp({ ...newExp, organization: e.target.value })} placeholder="Organization..." className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] outline-none focus:border-[#FFB703]" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={newExp.startDate} onChange={e => setNewExp({ ...newExp, startDate: e.target.value })} placeholder="Start date..." className="px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] outline-none focus:border-[#FFB703]" />
                <input type="text" value={newExp.endDate} onChange={e => setNewExp({ ...newExp, endDate: e.target.value })} placeholder="End date..." className="px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] outline-none focus:border-[#FFB703]" />
              </div>
              <input type="text" value={newExp.location} onChange={e => setNewExp({ ...newExp, location: e.target.value })} placeholder="Location..." className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] outline-none focus:border-[#FFB703]" />
              <textarea value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} placeholder="Description..." rows={3} className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] outline-none focus:border-[#FFB703]" />
              <div className="flex gap-2">
                <button onClick={handleSaveExperience} className="flex-1 px-3 py-2 rounded-lg bg-[#0D183D] text-white font-semibold text-[12px]">
                  <Check size={13} className="inline mr-1" /> Save
                </button>
                <button onClick={() => { setEditingExpIdx(null); setNewExp({ title: '', organization: '', startDate: '', endDate: '', location: '', description: '' }); }} className="flex-1 px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[#4B6382] font-semibold text-[12px] hover:bg-[#F0F1F3]">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8 text-center">
              <Briefcase size={32} className="mx-auto mb-3 text-[#FFB703]" />
              <p className="text-[14px] font-medium text-[#0D183D] mb-1">No experience yet</p>
              <p className="text-[13px] text-[#4B6382]">Add projects or work experience to strengthen your profile</p>
              {globalEditMode && (
                <button onClick={() => { setEditingExpIdx(0); }} className="mt-3 px-4 py-2 rounded-lg bg-[#FFB703] text-[#0D183D] font-semibold text-[12px] hover:opacity-90 flex items-center gap-1 mx-auto">
                  <Plus size={14} /> Add experience
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* EDUCATION */}
        {(profile?.university || profile?.field) && (
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#4B6382] mb-4">Education</h2>
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 space-y-3">
              {profile?.university && (
                <div className="flex items-center gap-3">
                  <GraduationCap size={18} className="text-[#FFB703]" />
                  <div>
                    <p className="text-[13px] font-medium text-[#4B6382]">University</p>
                    <p className="text-[14px] font-semibold text-[#0D183D]">{profile.university}</p>
                  </div>
                </div>
              )}
              {profile?.field && (
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-[#FFB703]" />
                  <div>
                    <p className="text-[13px] font-medium text-[#4B6382]">Field of Study</p>
                    <p className="text-[14px] font-semibold text-[#0D183D]">{profile.field}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
