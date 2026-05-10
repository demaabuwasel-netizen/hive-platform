import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { AvatarDisplay } from '../components/Avatar'
import { mockStudents } from '../data/mockData'

function SectionEmpty({ message, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <p className="text-navy-400 text-sm">{message}</p>
      {actionLabel && actionHref && (
        <a href={actionHref} className="text-xs text-honey-600 font-medium hover:underline">{actionLabel}</a>
      )}
    </div>
  )
}

export default function StudentProfile() {
  const { user, profile } = useApp()
  const navigate = useNavigate()

  const data = profile?.field ? profile : mockStudents[0]
  const displayName = user?.name || mockStudents[0].name
  const avatarSrc = data.avatar || null

  const skills = Array.isArray(data.skills)
    ? data.skills
    : (data.skills?.split(',').map(s => s.trim()).filter(Boolean) || [])

  const interests = Array.isArray(data.interests)
    ? data.interests
    : (data.interests?.split(',').map(s => s.trim()).filter(Boolean) || [])

  const isOwnProfile = !!(user && user.onboardingComplete)

  return (
    <div className="min-h-screen bg-[#FFF7E6]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Profile header */}
          <div className="card mb-6 flex flex-col sm:flex-row items-start gap-6 relative">
            <AvatarDisplay src={avatarSrc} name={displayName} size="xl" />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[#0D183D]">{displayName}</h1>
                <span className="bg-honey-100 text-honey-700 text-xs font-semibold px-2.5 py-1 rounded-full">Student</span>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/profile/student/edit')}
                    className="flex items-center gap-1.5 ml-1 px-3 py-1 rounded-xl text-xs font-semibold border transition-all hover:bg-[rgba(13,24,61,0.04)]"
                    style={{ color:'#4B6382', borderColor:'rgba(13,24,61,0.12)' }}>
                    <Pencil size={11}/> Edit profile
                  </button>
                )}
              </div>

              <p className="text-[#4B6382] text-sm mb-1">
                {data.field || 'Student'}
                {data.university ? ` · ${data.university}` : ''}
              </p>

              {data.summary && (
                <p className="text-navy-600 text-sm mt-3 leading-relaxed bg-cream-50 border border-[rgba(13,24,61,0.08)] rounded-xl p-3">
                  {data.summary}
                </p>
              )}

              {data.phone && (
                <p className="text-xs text-[#4B6382] mt-2 flex items-center gap-1.5">
                  <span aria-hidden="true">📞</span>
                  <a href={`tel:${data.phone}`} className="hover:text-[#0D183D] transition-colors">
                    {data.phone}
                  </a>
                </p>
              )}

              {(data.links?.linkedin || data.links?.github || data.links?.portfolio) && (
                <div className="flex gap-4 mt-3 flex-wrap">
                  {data.links?.linkedin && (
                    <a href={data.links.linkedin} target="_blank" rel="noreferrer"
                      className="text-xs text-[#4B6382] hover:text-navy-700 flex items-center gap-1 transition-colors">
                      🔗 LinkedIn
                    </a>
                  )}
                  {data.links?.github && (
                    <a href={data.links.github} target="_blank" rel="noreferrer"
                      className="text-xs text-[#4B6382] hover:text-navy-700 flex items-center gap-1 transition-colors">
                      💻 GitHub
                    </a>
                  )}
                  {data.links?.portfolio && (
                    <a href={data.links.portfolio} target="_blank" rel="noreferrer"
                      className="text-xs text-[#4B6382] hover:text-navy-700 flex items-center gap-1 transition-colors">
                      🌐 Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          {Array.isArray(data.languages) && data.languages.length > 0 && (
            <div className="card mb-6">
              <h2 className="text-sm font-semibold text-[#4B6382] uppercase tracking-wider mb-3">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {data.languages.map(({ lang, level }) => (
                  <span key={lang}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-semibold text-white"
                    style={{ background: level === 'Native' ? '#0D183D' : level === 'Fluent' ? '#059669' : level === 'Intermediate' ? '#D99E00' : '#6366F1' }}>
                    {lang} <span className="opacity-65 text-xs">· {level}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="card">
              <h2 className="text-sm font-semibold text-[#4B6382] uppercase tracking-wider mb-3">Skills</h2>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span key={skill} className="bg-navy-50 text-navy-700 text-sm px-3 py-1 rounded-full border border-navy-100">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <SectionEmpty
                  message="No skills added yet. Adding skills helps the AI find better matches for you."
                  actionLabel={isOwnProfile ? 'Edit your profile' : null}
                />
              )}
            </div>

            {/* Interests */}
            <div className="card">
              <h2 className="text-sm font-semibold text-[#4B6382] uppercase tracking-wider mb-3">Interests & Causes</h2>
              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map(i => (
                    <span key={i} className="bg-honey-50 text-honey-700 text-sm px-3 py-1 rounded-full border border-honey-200">
                      {i}
                    </span>
                  ))}
                </div>
              ) : (
                <SectionEmpty
                  message="No interests added yet. Causes you care about help surface NGOs that share your values."
                />
              )}
            </div>

            {/* Experience */}
            <div className="card">
              <h2 className="text-sm font-semibold text-[#4B6382] uppercase tracking-wider mb-3">Experience</h2>
              {data.experience ? (
                <p className="text-navy-600 text-sm leading-relaxed">{data.experience}</p>
              ) : (
                <SectionEmpty
                  message="No experience added yet. Even class projects and volunteer work count — don't leave this empty."
                />
              )}
            </div>

            {/* Goals */}
            <div className="card">
              <h2 className="text-sm font-semibold text-[#4B6382] uppercase tracking-wider mb-3">Goals</h2>
              {data.goals ? (
                <p className="text-navy-600 text-sm leading-relaxed">{data.goals}</p>
              ) : (
                <SectionEmpty
                  message="No goals added yet. Describing your ambitions helps NGOs understand if you're the right fit."
                />
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/matches')}
              className="btn-honey text-base px-8 py-3.5"
            >
              See my matches →
            </button>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile/student/edit')}
                className="flex items-center gap-2 text-base px-8 py-3.5 rounded-2xl font-semibold border-2 transition-all hover:bg-[rgba(13,24,61,0.04)]"
                style={{ color: '#0D183D', borderColor: 'rgba(13,24,61,0.18)' }}
              >
                <Pencil size={16} /> Edit profile
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
