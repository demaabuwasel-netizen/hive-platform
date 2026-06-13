import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, BookOpen, Briefcase, Globe, Heart, Target, CheckCircle2, ExternalLink, Calendar } from 'lucide-react'
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

function formatLanguages(languages) {
  if (!Array.isArray(languages)) return []
  return languages.map(lang => {
    if (typeof lang === 'string') return lang
    if (typeof lang === 'object' && lang.lang) return { name: lang.lang, level: lang.level }
    return null
  }).filter(Boolean)
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
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="animate-pulse space-y-4">
            <div className="w-20 h-6 bg-gray-300 rounded" />
            <div className="h-48 bg-gray-300 rounded-lg" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">
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
  const formattedLanguages = formatLanguages(profile.languages)
  const hasContent = (obj) => obj && (typeof obj === 'string' ? obj.trim().length > 0 : Array.isArray(obj) ? obj.length > 0 : false)

  return (
    <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00] font-semibold mb-6 text-[13px]"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {/* NAME - TOP AND PROMINENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-[36px] font-bold text-[#0D183D] mb-2">{profile.name}</h1>
          <p className="text-[15px] text-[#FFB703] font-semibold">{profile.field || 'Student'}</p>
        </motion.div>

        {/* Quick Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-5 mb-8 flex flex-wrap gap-6"
        >
          {profile.university && (
            <div className="flex items-center gap-2 text-[13px]">
              <BookOpen size={14} className="text-[#FFB703]" />
              <span className="text-[#4B6382]">{profile.university}</span>
            </div>
          )}
          {profile.city && (
            <div className="flex items-center gap-2 text-[13px]">
              <MapPin size={14} className="text-[#FFB703]" />
              <span className="text-[#4B6382]">{profile.city}</span>
            </div>
          )}
          {profile.availability && (
            <div className="flex items-center gap-2 text-[13px]">
              <Calendar size={14} className="text-[#FFB703]" />
              <span className="text-[#4B6382]">{profile.availability}</span>
            </div>
          )}
          {formattedLanguages.length > 0 && (
            <div className="flex items-center gap-2 text-[13px]">
              <Globe size={14} className="text-[#FFB703]" />
              <span className="text-[#4B6382]">
                {formattedLanguages.map(l => typeof l === 'string' ? l : `${l.name}`).join(', ')}
              </span>
            </div>
          )}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ═══ LEFT COLUMN: Student's Story ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* About the Student */}
            {hasContent(profile.bio) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[14px] font-bold text-[#0D183D] mb-3 flex items-center gap-2">
                  <Heart size={15} className="text-[#FFB703]" />
                  About
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile.bio}</p>
              </motion.div>
            )}

            {/* Application Message */}
            {hasContent(profile.motivation) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl border border-[#FFB703]/30 p-6 bg-[#FFF9F0]/40"
              >
                <h2 className="text-[14px] font-bold text-[#0D183D] mb-3">Why They Applied</h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile.motivation}</p>
              </motion.div>
            )}

            {/* Career Goals */}
            {hasContent(profile.goals) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[14px] font-bold text-[#0D183D] mb-3 flex items-center gap-2">
                  <Target size={15} className="text-[#FFB703]" />
                  Career Goals
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile.goals}</p>
              </motion.div>
            )}

            {/* Experience */}
            {hasContent(profile.experience) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[14px] font-bold text-[#0D183D] mb-3 flex items-center gap-2">
                  <Briefcase size={15} className="text-[#FFB703]" />
                  Experience
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile.experience}</p>
              </motion.div>
            )}
          </div>

          {/* ═══ RIGHT COLUMN: Compact Review Panel ═══ */}
          <div className="space-y-6">

            {/* Match Summary - Sticky */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#FFB703]/10 to-[#FFB703]/5 rounded-xl border border-[#FFB703]/30 p-6 sticky top-8"
            >
              <p className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-3">Match Summary</p>
              <p className="text-[24px] font-bold text-[#FFB703] mb-4">–</p>
              <div className="space-y-2 text-[12px]">
                <div className="flex items-start gap-2 text-[#4B6382]">
                  <CheckCircle2 size={13} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                  Motivated applicant
                </div>
                <div className="flex items-start gap-2 text-[#4B6382]">
                  <CheckCircle2 size={13} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                  Relevant skills
                </div>
                <div className="flex items-start gap-2 text-[#4B6382]">
                  <CheckCircle2 size={13} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                  Good availability
                </div>
              </div>
            </motion.div>

            {/* Actions - Two Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2.5 px-3 rounded-lg bg-[#FFB703] text-white text-[12px] font-semibold hover:opacity-90 transition-opacity">
                  Shortlist
                </button>
                <button className="py-2.5 px-3 rounded-lg bg-[#0D183D] text-white text-[12px] font-semibold hover:opacity-90 transition-opacity">
                  Schedule
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2.5 px-3 rounded-lg border border-[rgba(13,24,61,0.1)] text-[#0D183D] text-[12px] font-semibold hover:bg-[rgba(13,24,61,0.02)] transition-colors">
                  Message
                </button>
                <button className="py-2.5 px-3 rounded-lg border border-red-200 text-red-600 text-[12px] font-semibold hover:bg-red-50 transition-colors">
                  Pass
                </button>
              </div>
            </motion.div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <p className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-4">Skills</p>
                <div className="space-y-3">
                  {Object.entries(grouped).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category}>
                        <p className="text-[10px] font-semibold text-[#4B6382] uppercase tracking-widest mb-2">{category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.slice(0, 3).map(({ name, level }, i) => (
                            <span key={i} className="px-2 py-1 rounded text-[10px] font-medium bg-[#E8F4F8] text-[#0D183D] border border-[rgba(13,24,61,0.1)]">
                              {level ? `${name}` : name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </motion.div>
            )}

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-6"
            >
              <p className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-3">Education</p>
              {profile.university && (
                <div className="space-y-1.5">
                  <p className="text-[13px] font-semibold text-[#0D183D]">{profile.university}</p>
                  {profile.field && (
                    <p className="text-[12px] text-[#4B6382]">{profile.field}</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Links - Horizontal */}
            {(profile.links?.linkedin || profile.links?.github || profile.links?.portfolio) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                {profile.links?.linkedin && (
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB] text-[12px] font-semibold text-[#0D183D] transition-colors">
                    <span>LinkedIn</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {profile.links?.github && (
                  <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB] text-[12px] font-semibold text-[#0D183D] transition-colors">
                    <span>GitHub</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {profile.links?.portfolio && (
                  <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB] text-[12px] font-semibold text-[#0D183D] transition-colors">
                    <span>Portfolio</span>
                    <ExternalLink size={11} />
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
