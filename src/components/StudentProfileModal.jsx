import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, BookOpen, Briefcase, Globe, Code2, Link2Icon, Award, Zap } from 'lucide-react'
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

// Categorize skills intelligently
function categorizeSkills(skills) {
  const CATEGORIES = {
    'Programming Languages': ['javascript', 'python', 'typescript', 'java', 'cpp', 'c++', 'c#', 'csharp', 'go', 'rust', 'php', 'ruby', 'kotlin', 'swift', 'objective-c'],
    'Frontend': ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind', 'bootstrap', 'nextjs', 'gatsby', 'remix'],
    'Backend': ['nodejs', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', 'asp.net', 'laravel', 'gin'],
    'Databases': ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'firebase', 'dynamodb', 'elasticsearch', 'cassandra', 'oracle'],
    'DevOps & Tools': ['docker', 'kubernetes', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'aws', 'azure', 'gcp', 'terraform', 'ansible'],
    'Data & AI': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data analysis', 'sql', 'tableau', 'power bi'],
    'Design': ['figma', 'adobe', 'photoshop', 'illustrator', 'sketch', 'ui', 'ux', 'design thinking', 'wireframing', 'prototyping'],
    'Mobile': ['ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'xamarin'],
    'Other': [],
  }

  const grouped = {}
  Object.keys(CATEGORIES).forEach(cat => {
    grouped[cat] = []
  })

  if (!skills || !Array.isArray(skills)) return grouped

  skills.forEach(s => {
    const { name, level } = parseSkill(s)
    if (!name) return

    const lowerName = name.toLowerCase()
    let found = false

    for (const [category, keywords] of Object.entries(CATEGORIES)) {
      if (category === 'Other') continue
      if (keywords.some(kw => lowerName.includes(kw))) {
        grouped[category].push({ name, level })
        found = true
        break
      }
    }

    if (!found) {
      grouped['Other'].push({ name, level })
    }
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
          className="bg-white rounded-3xl p-8 w-full max-w-3xl"
          onClick={e => e.stopPropagation()}>
          <div className="animate-pulse">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 mx-auto mb-4" />
            <div className="h-8 w-1/3 bg-gray-200 rounded mx-auto mb-3" />
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
          className="bg-white rounded-3xl p-8 w-full max-w-3xl text-center"
          onClick={e => e.stopPropagation()}>
          <p className="text-[#4B6382]">Could not load student profile.</p>
          <button onClick={onClose} className="mt-6 px-6 py-2 rounded-lg bg-[#0D183D] text-white font-semibold">
            Close
          </button>
        </motion.div>
      </motion.div>
    )
  }

  const grouped = categorizeSkills(profile.skills)
  const hasContent = (obj) => obj && (typeof obj === 'string' ? obj.trim().length > 0 : Array.isArray(obj) ? obj.length > 0 : false)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '95vh' }}
        onClick={e => e.stopPropagation()}>

        {/* ━━━━━━━━ HEADER ━━━━━━━━ */}
        <div className="sticky top-0 bg-gradient-to-br from-[#0D183D] to-[#1a2952] px-8 py-10 border-b border-white/10">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex items-start gap-6">
              <GradientAvatar name={profile.name || 'Student'} size={80} radius="1.25rem" />
              <div className="flex-1 min-w-0">
                <h1 className="text-[32px] font-bold text-white mb-2">{profile.name || 'Student'}</h1>
                {profile.field && (
                  <p className="text-[16px] text-blue-100 font-semibold mb-4">{profile.field}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  {profile.university && (
                    <div className="px-3.5 py-2 rounded-lg bg-white/10 text-white text-[12px] font-semibold border border-white/20 flex items-center gap-2">
                      <BookOpen size={14} />
                      {profile.university}
                    </div>
                  )}
                  {profile.languages?.length > 0 && (
                    <div className="px-3.5 py-2 rounded-lg bg-white/10 text-white text-[12px] font-semibold border border-white/20 flex items-center gap-2">
                      <Globe size={14} />
                      {profile.languages.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white flex-shrink-0">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* ━━━━━━━━ CONTENT ━━━━━━━━ */}
        <div className="flex-1 overflow-y-auto px-8 py-10 bg-[#F8F9FB]">
          <div className="space-y-8 max-w-4xl mx-auto">

            {/* ─── ABOUT ─── */}
            {hasContent(profile.bio) && (
              <div className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[18px] font-bold text-[#0D183D] mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-[#FFB703]" />
                  About
                </h2>
                <p className="text-[15px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* ─── SKILLS (ORGANIZED BY CATEGORY) ─── */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[18px] font-bold text-[#0D183D] mb-6 flex items-center gap-2">
                  <Code2 size={18} className="text-[#FFB703]" />
                  Skills
                </h2>
                <div className="space-y-6">
                  {Object.entries(grouped).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category}>
                        <h3 className="text-[13px] font-bold text-[#0D183D] uppercase tracking-wide mb-3 pb-2 border-b border-[rgba(13,24,61,0.06)]">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {skills.map(({ name }, i) => (
                            <span key={i} className="px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/20">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* ─── EXPERIENCE ─── */}
            {hasContent(profile.experience) && (
              <div className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[18px] font-bold text-[#0D183D] mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-[#FFB703]" />
                  Experience
                </h2>
                <p className="text-[15px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {profile.experience}
                </p>
              </div>
            )}

            {/* ─── COURSES / EDUCATION ─── */}
            {profile.courses && profile.courses.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[18px] font-bold text-[#0D183D] mb-4 flex items-center gap-2">
                  <Award size={18} className="text-[#FFB703]" />
                  Courses & Learning
                </h2>
                <div className="space-y-3">
                  {profile.courses.map((course, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#F8F9FB] border border-[rgba(13,24,61,0.06)]">
                      <p className="text-[14px] font-semibold text-[#0D183D]">{course}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── INTERESTS ─── */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[18px] font-bold text-[#0D183D] mb-4">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, i) => (
                    <span key={i} className="px-4 py-2 rounded-lg text-[13px] font-medium bg-[#3B82F6]/10 text-[#1E40AF] border border-[#3B82F6]/20">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ─── GOALS ─── */}
            {hasContent(profile.goals) && (
              <div className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[18px] font-bold text-[#0D183D] mb-4">Career Goals</h2>
                <p className="text-[15px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {profile.goals}
                </p>
              </div>
            )}

            {/* ─── LINKS ─── */}
            {(profile.links?.linkedin || profile.links?.github || profile.links?.portfolio) && (
              <div className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
                <h2 className="text-[18px] font-bold text-[#0D183D] mb-5">Links & Profiles</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.links?.linkedin && (
                    <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 text-[13px] font-bold flex items-center gap-2 hover:bg-[#0A66C2]/20 transition-all">
                      <Link2Icon size={14} />
                      LinkedIn Profile
                    </a>
                  )}
                  {profile.links?.github && (
                    <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-[#0D183D]/10 text-[#0D183D] border border-[#0D183D]/20 text-[13px] font-bold flex items-center gap-2 hover:bg-[#0D183D]/20 transition-all">
                      <Code2 size={14} />
                      GitHub Profile
                    </a>
                  )}
                  {profile.links?.portfolio && (
                    <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/20 text-[13px] font-bold flex items-center gap-2 hover:bg-[#FFB703]/20 transition-all">
                      <Globe size={14} />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="h-6" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
