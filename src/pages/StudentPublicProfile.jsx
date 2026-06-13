import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, BookOpen, Briefcase, Globe, Code2, Link2Icon, Heart, Target, CheckCircle2, ExternalLink, Star, Zap } from 'lucide-react'
import GradientAvatar from '../components/GradientAvatar'
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

function categorizeSkills(skills) {
  const CATEGORIES = {
    'Frontend': ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind', 'bootstrap', 'nextjs', 'gatsby'],
    'Backend': ['nodejs', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', 'php', 'laravel'],
    'Programming': ['javascript', 'python', 'typescript', 'java', 'cpp', 'c++', 'c#', 'go', 'rust', 'kotlin'],
    'Data & AI': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data analysis'],
    'DevOps & Tools': ['docker', 'kubernetes', 'git', 'github', 'aws', 'azure', 'gcp', 'terraform', 'jenkins'],
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

    setLoading(true)
    setError(null)

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Taking longer than expected. The student profile may be temporarily unavailable.')
    }, 20000)

    loadStudentProfile(studentId)
      .then(p => {
        clearTimeout(timeoutId)
        if (!p) {
          setLoading(false)
          setError('Student profile not found.')
          return
        }
        setProfile(p)
        setLoading(false)
      })
      .catch(err => {
        clearTimeout(timeoutId)
        setLoading(false)
        setError('Could not load student profile: ' + (err?.message || 'Unknown error'))
      })

    return () => clearTimeout(timeoutId)
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══ LEFT COLUMN: Main Content ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* HERO HEADER - Navy Background */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0D183D] rounded-2xl p-6 text-white"
            >
              <div className="flex items-start gap-5 mb-5">
                <div className="w-16 h-16 rounded-xl bg-[#4B9E9E] flex items-center justify-center flex-shrink-0 text-white text-xl font-bold">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-[28px] font-bold mb-1">{profile.name}</h1>
                  <p className="text-[14px] text-white/80 mb-3">{profile.field || 'Student'}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.year && (
                      <span className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-[11px] font-semibold border border-white/25">
                        {profile.year}
                      </span>
                    )}
                    {profile.availability && (
                      <span className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-[11px] font-semibold border border-white/25">
                        Available: {profile.availability}
                      </span>
                    )}
                    {profile.city && (
                      <span className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-[11px] font-semibold border border-white/25 flex items-center gap-1">
                        <MapPin size={10} />
                        {profile.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-semibold border border-white/20">
                  Open to Remote
                </span>
                {profile.city && (
                  <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-semibold border border-white/20">
                    Willing to Relocate
                  </span>
                )}
              </div>
            </motion.div>

            {/* Who They Are */}
            {hasContent(profile.bio) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[15px] font-bold text-[#0D183D] mb-4 flex items-center gap-2">
                  <Heart size={16} className="text-[#FFB703]" />
                  Who They Are
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">
                  {profile.bio}
                </p>
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
                <h2 className="text-[15px] font-bold text-[#0D183D] mb-4 flex items-center gap-2">
                  <Target size={16} className="text-[#FFB703]" />
                  Career Goals
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">
                  {profile.goals}
                </p>
              </motion.div>
            )}

            {/* Skills - Grouped */}
            {profile.skills && profile.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[15px] font-bold text-[#0D183D] mb-5 flex items-center gap-2">
                  <Code2 size={16} className="text-[#FFB703]" />
                  Skills
                </h2>
                <div className="space-y-5">
                  {Object.entries(grouped).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category}>
                        <h3 className="text-[12px] font-bold text-[#0D183D] uppercase tracking-widest mb-3">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(({ name, level }, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#E8F4F8] text-[#0D183D] border border-[rgba(13,24,61,0.1)]">
                              {name} {level && <span className="text-[#4B6382]">· {level}</span>}
                            </span>
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
                <h2 className="text-[15px] font-bold text-[#0D183D] mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-[#FFB703]" />
                  Experience
                </h2>
                <p className="text-[13px] leading-relaxed text-[#4B6382]">
                  {profile.experience}
                </p>
              </motion.div>
            )}
          </div>

          {/* ═══ RIGHT COLUMN: Sidebar ═══ */}
          <div className="space-y-5">

            {/* Education Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
            >
              <h3 className="text-[12px] font-bold text-[#0D183D] uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-[#FFB703]" />
                Education
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#0D183D]">{profile.university || 'Not specified'}</p>
                  <p className="text-[12px] text-[#4B6382] mt-1">{profile.field || ''}</p>
                  {profile.graduation_year && (
                    <p className="text-[11px] text-[#4B6382] mt-1">2022 - Present</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Languages */}
            {formattedLanguages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h3 className="text-[12px] font-bold text-[#0D183D] uppercase tracking-widest mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {formattedLanguages.map((lang, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#E8F4F8] text-[#0D183D] border border-[rgba(13,24,61,0.1)]">
                      {typeof lang === 'string' ? lang : `${lang.name} ${lang.level ? `· ${lang.level}` : ''}`}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Availability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
            >
              <h3 className="text-[12px] font-bold text-[#0D183D] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={14} className="text-[#FFB703]" />
                Availability
              </h3>
              <div className="space-y-3 text-[13px]">
                <div>
                  <p className="text-[#4B6382] text-[11px] uppercase tracking-widest mb-1">Available For</p>
                  <p className="text-[#0D183D] font-semibold">{profile.availability || 'Not specified'}</p>
                </div>
              </div>
            </motion.div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h3 className="text-[12px] font-bold text-[#0D183D] uppercase tracking-widest mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#E8F4F8] text-[#0D183D] border border-[rgba(13,24,61,0.1)]">
                      {interest}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Links */}
            {(profile.links?.linkedin || profile.links?.github || profile.links?.portfolio) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h3 className="text-[12px] font-bold text-[#0D183D] uppercase tracking-widest mb-4">Links</h3>
                <div className="space-y-2">
                  {profile.links?.linkedin && (
                    <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F0F5F9] hover:bg-[#E8F1F7] text-[12px] font-semibold text-[#0D183D] transition-colors">
                      <span>LinkedIn</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {profile.links?.github && (
                    <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F0F5F9] hover:bg-[#E8F1F7] text-[12px] font-semibold text-[#0D183D] transition-colors">
                      <span>GitHub</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {profile.links?.portfolio && (
                    <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F0F5F9] hover:bg-[#E8F1F7] text-[12px] font-semibold text-[#0D183D] transition-colors">
                      <span>Portfolio</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
