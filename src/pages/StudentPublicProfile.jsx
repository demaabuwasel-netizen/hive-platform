import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, BookOpen, Briefcase, Globe, Code2, Link2Icon, Heart, Target, Mail, Calendar, ExternalLink } from 'lucide-react'
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
    'Programming Languages': ['javascript', 'python', 'typescript', 'java', 'cpp', 'c++', 'c#', 'csharp', 'go', 'rust', 'php', 'ruby', 'kotlin', 'swift', 'objective-c'],
    'Frontend': ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'tailwind', 'bootstrap', 'nextjs', 'gatsby', 'remix'],
    'Backend': ['nodejs', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', 'asp.net', 'laravel', 'gin'],
    'Databases': ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'firebase', 'dynamodb', 'elasticsearch', 'cassandra', 'oracle'],
    'DevOps & Tools': ['docker', 'kubernetes', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'aws', 'azure', 'gcp', 'terraform', 'ansible'],
    'Data & AI': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data analysis', 'tableau', 'power bi'],
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

function formatLanguages(languages) {
  if (!Array.isArray(languages)) return []
  return languages.map(lang => {
    if (typeof lang === 'string') return lang
    if (typeof lang === 'object' && lang.lang) return `${lang.lang}${lang.level ? ` · ${lang.level}` : ''}`
    return ''
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

    console.log('[StudentPublicProfile] Loading student profile:', studentId)

    const timeoutId = setTimeout(() => {
      console.log('[StudentPublicProfile] Timeout after 20s')
      setLoading(false)
      setError('Taking longer than expected. The student profile may be temporarily unavailable.')
    }, 20000)

    loadStudentProfile(studentId)
      .then(p => {
        clearTimeout(timeoutId)
        console.log('[StudentPublicProfile] Loaded successfully:', p)
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
        console.error('[StudentPublicProfile] Error loading student:', err)
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
            className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00] font-semibold mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>
          <div className="text-center py-20 bg-white rounded-2xl p-8">
            <p className="text-[#0D183D] font-semibold mb-2">{error ? 'Unable to load profile' : 'Student profile not found'}</p>
            <p className="text-[#4B6382] mb-6">{error || 'This student profile could not be found.'}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-lg font-semibold text-white" style={{ background: '#FFB703' }}>
              Try again
            </button>
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
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00] font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>

        {/* Main Grid: Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ═══ LEFT COLUMN: Main Content ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Header - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 shadow-sm"
            >
              <div className="flex items-start gap-5">
                <GradientAvatar name={profile.name || 'Student'} size={64} radius="0.85rem" />
                <div className="flex-1">
                  <h1 className="text-[24px] font-bold text-[#0D183D] mb-1">{profile.name}</h1>
                  {profile.field && (
                    <p className="text-[14px] font-semibold text-[#FFB703] mb-3">{profile.field}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {profile.university && (
                      <span className="flex items-center gap-1.5 text-[12px] text-[#4B6382]">
                        <BookOpen size={13} />
                        {profile.university}
                      </span>
                    )}
                    {profile.city && (
                      <span className="flex items-center gap-1.5 text-[12px] text-[#4B6382]">
                        <MapPin size={13} />
                        {profile.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About / Bio */}
            {hasContent(profile.bio) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-4">About</h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
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
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-4 flex items-center gap-2">
                  <Target size={16} className="text-[#FFB703]" />
                  Career Goals
                </h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {profile.goals}
                </p>
              </motion.div>
            )}

            {/* Experience */}
            {hasContent(profile.experience) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-[#FFB703]" />
                  Experience
                </h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {profile.experience}
                </p>
              </motion.div>
            )}

            {/* Skills - Categorized */}
            {profile.skills && profile.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-5 flex items-center gap-2">
                  <Code2 size={16} className="text-[#FFB703]" />
                  Skills & Expertise
                </h2>
                <div className="space-y-6">
                  {Object.entries(grouped).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category}>
                        <h3 className="text-[12px] font-bold text-[#0D183D] uppercase tracking-widest mb-3 text-[#4B6382]">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(({ name, level }, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/25">
                              {level ? `${name} · ${level}` : name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ═══ RIGHT COLUMN: Sidebar ═══ */}
          <div className="space-y-6">

            {/* Profile Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 sticky top-10"
            >
              <h3 className="text-[14px] font-bold text-[#0D183D] mb-4 uppercase tracking-widest text-[#4B6382]">Profile Info</h3>
              <div className="space-y-4 text-[13px]">
                {profile.university && (
                  <div className="flex items-start gap-3">
                    <BookOpen size={14} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[#4B6382] text-[12px] uppercase tracking-widest">University</p>
                      <p className="text-[#0D183D] font-semibold mt-1">{profile.university}</p>
                    </div>
                  </div>
                )}

                {profile.field && (
                  <div className="flex items-start gap-3">
                    <BookOpen size={14} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[#4B6382] text-[12px] uppercase tracking-widest">Field</p>
                      <p className="text-[#0D183D] font-semibold mt-1">{profile.field}</p>
                    </div>
                  </div>
                )}

                {profile.city && (
                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[#4B6382] text-[12px] uppercase tracking-widest">Location</p>
                      <p className="text-[#0D183D] font-semibold mt-1">{profile.city}</p>
                    </div>
                  </div>
                )}

                {profile.availability && (
                  <div className="flex items-start gap-3">
                    <Calendar size={14} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[#4B6382] text-[12px] uppercase tracking-widest">Availability</p>
                      <p className="text-[#0D183D] font-semibold mt-1">{profile.availability}</p>
                    </div>
                  </div>
                )}

                {formattedLanguages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Globe size={14} className="text-[#FFB703] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[#4B6382] text-[12px] uppercase tracking-widest">Languages</p>
                      <div className="mt-2 space-y-1">
                        {formattedLanguages.map((lang, i) => (
                          <p key={i} className="text-[#0D183D] font-semibold">{lang}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h3 className="text-[14px] font-bold text-[#0D183D] mb-4 uppercase tracking-widest text-[#4B6382]">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#3B82F6]/10 text-[#1E40AF] border border-[#3B82F6]/25">
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
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6"
              >
                <h3 className="text-[14px] font-bold text-[#0D183D] mb-4 uppercase tracking-widest text-[#4B6382]">Links</h3>
                <div className="space-y-2">
                  {profile.links?.linkedin && (
                    <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/25 text-[12px] font-semibold hover:bg-[#0A66C2]/20 transition-all">
                      <span>LinkedIn</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {profile.links?.github && (
                    <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0D183D]/10 text-[#0D183D] border border-[#0D183D]/25 text-[12px] font-semibold hover:bg-[#0D183D]/20 transition-all">
                      <span>GitHub</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {profile.links?.portfolio && (
                    <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/25 text-[12px] font-semibold hover:bg-[#FFB703]/20 transition-all">
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
