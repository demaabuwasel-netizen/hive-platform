import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, BookOpen, Briefcase, Heart, Target, CheckCircle2,
  ExternalLink, Calendar, TrendingUp
} from 'lucide-react'
import { loadStudentProfile } from '../services/storage'

function parseSkill(s) {
  if (!s) return { name: '', level: '' }
  if (typeof s === 'string') {
    if (s.includes('{')) {
      try {
        const parsed = JSON.parse(s)
        return { name: parsed.name || s, level: parsed.level || '' }
      } catch {
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

function categorizeSkills(skills) {
  const CATEGORIES = {
    'Frontend': ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind', 'bootstrap', 'nextjs', 'gatsby'],
    'Backend': ['nodejs', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', 'php', 'laravel'],
    'Programming': ['javascript', 'python', 'typescript', 'java', 'cpp', 'c++', 'c#', 'go', 'rust', 'kotlin', 'swift'],
    'Data & AI': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data analysis'],
    'DevOps & Tools': ['docker', 'kubernetes', 'git', 'github', 'aws', 'azure', 'gcp', 'terraform', 'jenkins', 'linux'],
  }

  const grouped = {}
  Object.keys(CATEGORIES).forEach(cat => {
    grouped[cat] = []
  })
  grouped['Other'] = []

  if (!skills || !Array.isArray(skills)) return grouped

  skills.forEach(s => {
    const { name, level } = parseSkill(s)
    if (!name) return

    const lowerName = name.toLowerCase()
    let found = false

    for (const [category, keywords] of Object.entries(CATEGORIES)) {
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

function getLevelColor(level) {
  const lower = level?.toLowerCase() || ''
  if (lower.includes('expert') || lower.includes('advanced')) return 'bg-emerald-100 text-emerald-700'
  if (lower.includes('intermediate')) return 'bg-blue-100 text-blue-700'
  if (lower.includes('beginner') || lower.includes('basic')) return 'bg-slate-100 text-slate-700'
  return 'bg-slate-100 text-slate-700'
}

function AvatarInitials({ name, size = 64 }) {
  if (!name) return null

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const colors = [
    'bg-teal-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
  ]

  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const bgColor = colors[hash % colors.length]

  return (
    <div
      className={`${bgColor} rounded-2xl flex items-center justify-center text-white font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}

export default function StudentPublicProfile() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!studentId) {
      navigate('/opportunities')
      return
    }

    let mounted = true

    ;(async () => {
      setLoading(true)
      setError(null)

      const timeoutId = setTimeout(() => {
        if (mounted) {
          setLoading(false)
          setError('Taking longer than expected. The student profile may be temporarily unavailable.')
        }
      }, 20000)

      try {
        const p = await loadStudentProfile(studentId)
        clearTimeout(timeoutId)
        if (!mounted) return
        if (!p) {
          setLoading(false)
          setError('Student profile not found.')
          return
        }
        setProfile(p)
        document.title = `${p.name} - Hive`
        setLoading(false)
      } catch (err) {
        clearTimeout(timeoutId)
        if (mounted) {
          setLoading(false)
          setError('Could not load student profile: ' + (err?.message || 'Unknown error'))
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [studentId, navigate])

  if (loading) {
    return (
      <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-gray-300 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-gray-300 rounded-2xl" />
                <div className="h-32 bg-gray-300 rounded-2xl" />
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-300 rounded-2xl" />
                <div className="h-32 bg-gray-300 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00] font-semibold mb-8"
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
          <div className="text-center py-20 bg-white rounded-2xl p-8">
            <p className="text-[#0D183D] font-semibold mb-2">{error ? 'Unable to load profile' : 'Student profile not found'}</p>
            <p className="text-[#4B6382] mb-6">{error || 'This student profile could not be found.'}</p>
          </div>
        </div>
      </main>
    )
  }

  const grouped = categorizeSkills(profile.skills)
  const formattedLanguages = profile.languages?.map(l => {
    if (typeof l === 'string') return l
    if (typeof l === 'object' && l.lang) return `${l.lang}${l.level ? ` (${l.level})` : ''}`
    return null
  }).filter(Boolean) || []
  const hasContent = (obj) => obj && (typeof obj === 'string' ? obj.trim().length > 0 : Array.isArray(obj) ? obj.length > 0 : false)

  return (
    <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00] font-semibold mb-8 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Applicants
        </motion.button>

        {/* ═══ HERO HEADER CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0D183D] to-[#1a2a4e] rounded-2xl p-8 mb-8 text-white"
        >
          <div className="flex gap-6 items-start">
            <AvatarInitials name={profile.name} size={88} />

            <div className="flex-1">
              <h1 className="text-[32px] font-bold mb-1">{profile.name}</h1>
              <p className="text-[#FFB703] font-semibold text-[15px] mb-4">{profile.field || 'Student'}</p>

              {/* Key Info Pills */}
              <div className="flex flex-wrap gap-3">
                {profile.university && (
                  <div className="bg-white/15 rounded-full px-4 py-2 text-[13px] font-medium flex items-center gap-2 backdrop-blur-sm border border-white/20">
                    <BookOpen size={14} />
                    {profile.university}
                  </div>
                )}
                {profile.availability && (
                  <div className="bg-white/15 rounded-full px-4 py-2 text-[13px] font-medium flex items-center gap-2 backdrop-blur-sm border border-white/20">
                    <Calendar size={14} />
                    {profile.availability}
                  </div>
                )}
                {profile.city && (
                  <div className="bg-white/15 rounded-full px-4 py-2 text-[13px] font-medium flex items-center gap-2 backdrop-blur-sm border border-white/20">
                    <MapPin size={14} />
                    {profile.city}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ MAIN CONTENT GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* About / Who They Are */}
            {hasContent(profile.bio) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[15px] font-bold text-[#0D183D] mb-3 flex items-center gap-2">
                  <Heart size={16} className="text-[#FFB703]" />
                  About
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile.bio}</p>
              </motion.div>
            )}

            {/* Career Goals */}
            {hasContent(profile.goals) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[15px] font-bold text-[#0D183D] mb-3 flex items-center gap-2">
                  <Target size={16} className="text-[#FFB703]" />
                  Career Goals
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile.goals}</p>
              </motion.div>
            )}

            {/* Skills - Categorized */}
            {profile.skills && profile.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[15px] font-bold text-[#0D183D] mb-5 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#FFB703]" />
                  Skills
                </h2>
                <div className="space-y-5">
                  {Object.entries(grouped).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category}>
                        <p className="text-[11px] font-bold text-[#4B6382] uppercase tracking-widest mb-3">{category}</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(({ name, level }, i) => (
                            <div
                              key={i}
                              className={`px-3 py-1.5 rounded-full text-[12px] font-medium ${getLevelColor(level)}`}
                            >
                              {name}
                              {level && <span className="text-[10px] ml-1 opacity-75">({level})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </motion.div>
            )}

            {/* Experience */}
            {hasContent(profile.experience) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[15px] font-bold text-[#0D183D] mb-3 flex items-center gap-2">
                  <Briefcase size={16} className="text-[#FFB703]" />
                  Experience
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile.experience}</p>
              </motion.div>
            )}

          </div>

          {/* RIGHT COLUMN: Sidebar Info & Actions */}
          <div className="space-y-6">

            {/* Overall Match Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 sticky top-8"
            >
              <h3 className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-3">Overall Match</h3>
              <div className="mb-4">
                <div className="text-[28px] font-bold text-[#10B981] mb-1">–</div>
                <p className="text-[12px] text-[#4B6382] font-medium">Awaiting evaluation</p>
              </div>
              <div className="space-y-2 text-[12px]">
                <p className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-2">Key strengths</p>
                <div className="flex items-start gap-2 text-[#4B6382]">
                  <CheckCircle2 size={13} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                  <span>Motivated candidate</span>
                </div>
                <div className="flex items-start gap-2 text-[#4B6382]">
                  <CheckCircle2 size={13} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                  <span>Relevant background</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-2.5"
            >
              <button className="w-full py-3 px-4 rounded-xl bg-[#FFB703] hover:bg-[#D99E00] text-white font-semibold text-[13px] transition-all">
                ★ Shortlist
              </button>
              <button className="w-full py-3 px-4 rounded-xl bg-[#0D183D] hover:opacity-90 text-white font-semibold text-[13px] transition-all">
                📅 Schedule Interview
              </button>
              <button className="w-full py-3 px-4 rounded-xl border border-[rgba(13,24,61,0.1)] text-[#0D183D] font-semibold text-[13px] hover:bg-[rgba(13,24,61,0.02)] transition-all">
                💬 Message
              </button>
              <button className="w-full py-3 px-4 rounded-xl border border-red-200 text-red-600 font-semibold text-[13px] hover:bg-red-50 transition-all">
                ✕ Reject
              </button>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
            >
              <h3 className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-3">Education</h3>
              {profile.university && (
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-[#0D183D]">{profile.university}</p>
                  {profile.field && <p className="text-[12px] text-[#4B6382]">{profile.field}</p>}
                </div>
              )}
            </motion.div>

            {/* Languages */}
            {formattedLanguages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h3 className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {formattedLanguages.map((lang, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-blue-100 text-blue-700">
                      {lang}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Availability */}
            {profile.availability && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h3 className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-3">Availability</h3>
                <p className="text-[13px] font-semibold text-[#0D183D]">{profile.availability}</p>
              </motion.div>
            )}

            {/* Links */}
            {(profile.links?.linkedin || profile.links?.github || profile.links?.portfolio) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                {profile.links?.linkedin && (
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[rgba(13,24,61,0.02)] text-[13px] font-semibold text-[#0D183D] transition-colors">
                    LinkedIn
                    <ExternalLink size={13} />
                  </a>
                )}
                {profile.links?.github && (
                  <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[rgba(13,24,61,0.02)] text-[13px] font-semibold text-[#0D183D] transition-colors">
                    GitHub
                    <ExternalLink size={13} />
                  </a>
                )}
                {profile.links?.portfolio && (
                  <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[rgba(13,24,61,0.02)] text-[13px] font-semibold text-[#0D183D] transition-colors">
                    Portfolio
                    <ExternalLink size={13} />
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
