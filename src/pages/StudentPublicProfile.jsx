import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, BookOpen, Briefcase, Globe, Code2, Link2Icon, Award, Zap, Heart, Target } from 'lucide-react'
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
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="w-20 h-6 bg-gray-300 rounded" />
            <div className="w-32 h-10 bg-gray-300 rounded" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00] font-semibold mb-8">
            <ArrowLeft size={18} />
            Back
          </button>
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
  const hasContent = (obj) => obj && (typeof obj === 'string' ? obj.trim().length > 0 : Array.isArray(obj) ? obj.length > 0 : false)

  return (
    <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00] font-semibold mb-10 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>

        {/* ━━━━━━━━ HERO HEADER ━━━━━━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0D183D] to-[#1a2952] rounded-3xl px-8 py-12 mb-12 text-white"
        >
          <div className="flex items-start gap-8 mb-8">
            <GradientAvatar name={profile.name || 'Student'} size={100} radius="1.5rem" />
            <div className="flex-1">
              <h1 className="text-[40px] font-bold mb-2">{profile.name}</h1>
              {profile.field && (
                <p className="text-[18px] text-blue-100 font-semibold mb-6">{profile.field}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {profile.university && (
                  <div className="px-4 py-2.5 rounded-lg bg-white/15 text-white text-[13px] font-semibold border border-white/25 flex items-center gap-2">
                    <BookOpen size={15} />
                    {profile.university}
                  </div>
                )}
                {profile.availability && (
                  <div className="px-4 py-2.5 rounded-lg bg-emerald-500/25 text-emerald-100 text-[13px] font-semibold border border-emerald-400/40">
                    Available: {profile.availability}
                  </div>
                )}
                {profile.languages?.length > 0 && (
                  <div className="px-4 py-2.5 rounded-lg bg-white/15 text-white text-[13px] font-semibold border border-white/25 flex items-center gap-2">
                    <Globe size={15} />
                    {profile.languages.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ━━━━━━━━ CONTENT GRID ━━━━━━━━ */}
        <div className="space-y-8">

          {/* ─── WHO THEY ARE ─── */}
          {hasContent(profile.bio) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-5 flex items-center gap-3">
                <Heart size={20} className="text-[#FFB703]" />
                Who They Are
              </h2>
              <p className="text-[15px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {profile.bio}
              </p>
            </motion.div>
          )}

          {/* ─── CAREER GOALS ─── */}
          {hasContent(profile.goals) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-5 flex items-center gap-3">
                <Target size={20} className="text-[#FFB703]" />
                Career Goals
              </h2>
              <p className="text-[15px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {profile.goals}
              </p>
            </motion.div>
          )}

          {/* ─── BEST EXPERIENCE / ACCOMPLISHMENTS ─── */}
          {hasContent(profile.experience) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-5 flex items-center gap-3">
                <Briefcase size={20} className="text-[#FFB703]" />
                Experience & Accomplishments
              </h2>
              <p className="text-[15px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {profile.experience}
              </p>
            </motion.div>
          )}

          {/* ─── ALL SKILLS (CATEGORIZED) ─── */}
          {profile.skills && profile.skills.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-6 flex items-center gap-3">
                <Code2 size={20} className="text-[#FFB703]" />
                Skills & Expertise ({profile.skills.length} total)
              </h2>
              <div className="space-y-8">
                {Object.entries(grouped).map(([category, skills]) => (
                  skills.length > 0 && (
                    <div key={category}>
                      <h3 className="text-[14px] font-bold text-[#0D183D] uppercase tracking-widest mb-4 pb-3 border-b-2 border-[#FFB703]">
                        {category} ({skills.length})
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {skills.map(({ name, level }, i) => (
                          <span key={i} className="px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/25">
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

          {/* ─── COURSES & LEARNING ─── */}
          {profile.courses && profile.courses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-6 flex items-center gap-3">
                <Award size={20} className="text-[#FFB703]" />
                Courses & Learning ({profile.courses.length})
              </h2>
              <div className="space-y-3">
                {profile.courses.map((course, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#F8F9FB] border border-[rgba(13,24,61,0.06)] hover:border-[#FFB703]/30 transition-colors">
                    <p className="text-[14px] font-semibold text-[#0D183D]">{course}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── INTERESTS ─── */}
          {profile.interests && profile.interests.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-5 flex items-center gap-3">
                Interests & Passions
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, i) => (
                  <span key={i} className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#3B82F6]/10 text-[#1E40AF] border border-[#3B82F6]/25">
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── LINKS & PROFILES ─── */}
          {(profile.links?.linkedin || profile.links?.github || profile.links?.portfolio) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-8 border border-[rgba(13,24,61,0.08)]">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-6 flex items-center gap-3">
                Links & Profiles
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.links?.linkedin && (
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/25 text-[13px] font-bold flex items-center gap-2 hover:bg-[#0A66C2]/20 transition-all">
                    <Link2Icon size={15} />
                    LinkedIn Profile →
                  </a>
                )}
                {profile.links?.github && (
                  <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-[#0D183D]/10 text-[#0D183D] border border-[#0D183D]/25 text-[13px] font-bold flex items-center gap-2 hover:bg-[#0D183D]/20 transition-all">
                    <Code2 size={15} />
                    GitHub Profile →
                  </a>
                )}
                {profile.links?.portfolio && (
                  <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/25 text-[13px] font-bold flex items-center gap-2 hover:bg-[#FFB703]/20 transition-all">
                    <Globe size={15} />
                    Portfolio →
                  </a>
                )}
              </div>
            </motion.div>
          )}

          <div className="h-12" />
        </div>
      </div>
    </main>
  )
}
