import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, MapPin, BookOpen, Briefcase, Globe, Code2, Link2Icon } from 'lucide-react'
import GradientAvatar from './GradientAvatar'
import { loadStudentProfile } from '../services/storage'

function parseSkill(s) {
  if (!s) return { name: '', level: '' }
  if (typeof s === 'string') {
    if (s.includes('{')) {
      try {
        const parsed = JSON.parse(s)
        return { name: parsed.name || s, level: parsed.level || '' }
      } catch (e) {
        return { name: s, level: '' }
      }
    }
    return { name: s, level: '' }
  }
  if (typeof s === 'object') {
    return { name: s.name || '', level: s.level || '' }
  }
  return { name: '', level: '' }
}

// Group skills by category or "Other"
function groupSkillsByCategory(skills) {
  const grouped = {}

  if (!skills || !Array.isArray(skills)) return grouped

  skills.forEach(s => {
    const { name, level } = parseSkill(s)
    if (!name) return

    const category = 'Other'
    if (!grouped[category]) grouped[category] = []
    grouped[category].push({ name, level })
  })

  return grouped
}

export default function StudentProfileModal({ studentId, student, onClose }) {
  const [profile, setProfile] = useState(student || null)
  const [loading, setLoading] = useState(!student)

  useEffect(() => {
    if (student) return
    if (!studentId) return

    setLoading(true)
    loadStudentProfile(studentId)
      .then(p => setProfile(p))
      .catch(err => console.error('Error loading student:', err))
      .finally(() => setLoading(false))
  }, [studentId, student])

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 w-full max-w-2xl"
          onClick={e => e.stopPropagation()}>
          <div className="animate-pulse">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 mx-auto mb-4" />
            <div className="h-6 w-1/3 bg-gray-200 rounded mx-auto mb-2" />
            <div className="h-4 w-1/2 bg-gray-100 rounded mx-auto" />
          </div>
        </motion.div>
      </motion.div>
    )
  }

  if (!profile) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 w-full max-w-2xl text-center"
          onClick={e => e.stopPropagation()}>
          <p className="text-[#4B6382]">Could not load student profile.</p>
          <button onClick={onClose} className="mt-6 px-6 py-2 rounded-lg bg-[#0D183D] text-white font-semibold">
            Close
          </button>
        </motion.div>
      </motion.div>
    )
  }

  const grouped = groupSkillsByCategory(profile.skills)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-[#0D183D] to-[#1a2952] px-8 py-8 border-b border-white/10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <GradientAvatar name={profile.name || 'Student'} size={64} radius="1rem" />
              <div className="flex-1 min-w-0">
                <h1 className="text-[28px] font-bold text-white mb-1">{profile.name || 'Student'}</h1>
                {profile.field && (
                  <p className="text-[14px] text-blue-100 mb-3">{profile.field}</p>
                )}
                {profile.university && (
                  <p className="text-[13px] text-white/70 flex items-center gap-2">
                    <BookOpen size={14} />
                    {profile.university}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white flex-shrink-0">
              <X size={20} />
            </button>
          </div>

          {/* Quick Info Pills */}
          <div className="flex flex-wrap gap-3">
            {profile.availability && (
              <div className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white/10 text-white border border-white/20">
                {profile.availability}
              </div>
            )}
            {profile.languages?.length > 0 && (
              <div className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white/10 text-white border border-white/20">
                {profile.languages.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-[#F8F9FB]">
          <div className="space-y-8 max-w-2xl mx-auto">

            {/* Bio / About */}
            {profile.bio && (
              <div className="bg-white rounded-2xl p-6 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">About</h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382]">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-5">Skills</h2>
                <div className="space-y-4">
                  {Object.entries(grouped).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="text-[12px] font-bold text-[#4B6382] uppercase mb-3">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(({ name, level }, i) => (
                          <span key={i} className="px-3 py-2 rounded-lg text-[13px] font-semibold bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/20">
                            {level ? `${name} · ${level}` : name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience && (
              <div className="bg-white rounded-2xl p-6 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3 flex items-center gap-2">
                  <Briefcase size={16} />
                  Experience
                </h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {profile.experience}
                </p>
              </div>
            )}

            {/* Goals */}
            {profile.goals && (
              <div className="bg-white rounded-2xl p-6 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">Goals</h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {profile.goals}
                </p>
              </div>
            )}

            {/* Links */}
            {(profile.links?.linkedin || profile.links?.github || profile.links?.portfolio) && (
              <div className="bg-white rounded-2xl p-6 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-4">Links</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.links?.linkedin && (
                    <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 text-[13px] font-semibold flex items-center gap-2 hover:bg-[#0A66C2]/20 transition-all">
                      <Link2Icon size={14} />
                      LinkedIn
                    </a>
                  )}
                  {profile.links?.github && (
                    <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-[#0D183D]/10 text-[#0D183D] border border-[#0D183D]/20 text-[13px] font-semibold flex items-center gap-2 hover:bg-[#0D183D]/20 transition-all">
                      <Code2 size={14} />
                      GitHub
                    </a>
                  )}
                  {profile.links?.portfolio && (
                    <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/20 text-[13px] font-semibold flex items-center gap-2 hover:bg-[#FFB703]/20 transition-all">
                      <Globe size={14} />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
