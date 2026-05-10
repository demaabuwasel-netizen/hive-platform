import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { AvatarDisplay } from '../components/Avatar'
import { mockNGOs } from '../data/mockData'

function SectionEmpty({ message }) {
  return (
    <div className="py-5 text-center">
      <p className="text-navy-400 text-sm">{message}</p>
    </div>
  )
}

export default function NGOProfile() {
  const { user, profile } = useApp()
  const navigate = useNavigate()

  const data = profile || mockNGOs[0]
  const orgName = data.name || user?.name || 'Your NGO'
  const avatarSrc = data.imageUrl || data.avatar
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
          <div className="card mb-6 flex flex-col sm:flex-row items-start gap-6">
            <AvatarDisplay src={avatarSrc} name={orgName} size="xl" />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[#0D183D]">{orgName}</h1>
                <span className="bg-navy-100 text-navy-700 text-xs font-semibold px-2.5 py-1 rounded-full">NGO</span>
              </div>

              {data.location && (
                <p className="text-[#4B6382] text-sm mb-1.5 flex items-center gap-1">
                  <span aria-hidden="true">📍</span> {data.location}
                </p>
              )}

              {data.phone && (
                <p className="text-[#4B6382] text-xs mb-2 flex items-center gap-1.5">
                  <span aria-hidden="true">📞</span>
                  <a href={`tel:${data.phone}`} className="hover:text-[#0D183D] transition-colors">
                    {data.phone}
                  </a>
                </p>
              )}

              {data.summary && (
                <p className="text-navy-600 text-sm mt-2 leading-relaxed bg-cream-50 border border-[rgba(13,24,61,0.08)] rounded-xl p-3">
                  {data.summary}
                </p>
              )}

              {(data.links?.website || data.links?.instagram || data.links?.twitter) && (
                <div className="flex gap-4 mt-3 flex-wrap">
                  {data.links?.website && (
                    <a href={data.links.website} target="_blank" rel="noreferrer"
                      className="text-xs text-[#4B6382] hover:text-navy-700 transition-colors">
                      🌐 Website
                    </a>
                  )}
                  {data.links?.instagram && (
                    <a href={data.links.instagram} target="_blank" rel="noreferrer"
                      className="text-xs text-[#4B6382] hover:text-navy-700 transition-colors">
                      📸 Instagram
                    </a>
                  )}
                  {data.links?.twitter && (
                    <a href={data.links.twitter} target="_blank" rel="noreferrer"
                      className="text-xs text-[#4B6382] hover:text-navy-700 transition-colors">
                      🐦 Twitter
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* About */}
            <div className="card md:col-span-2">
              <h2 className="text-sm font-semibold text-[#4B6382] uppercase tracking-wider mb-3">About the organization</h2>
              {data.description ? (
                <p className="text-navy-600 text-sm leading-relaxed">{data.description}</p>
              ) : (
                <SectionEmpty message="No description added yet. Tell students about your mission and the communities you serve." />
              )}
            </div>

            {/* Help needed */}
            <div className="card md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-[#4B6382] uppercase tracking-wider">What we need help with</h2>
                {data.helpNeeded && (
                  <span className="bg-honey-100 text-honey-700 text-xs font-semibold px-2 py-0.5 rounded-full">Active need</span>
                )}
              </div>
              {data.helpNeeded ? (
                <p className="text-navy-600 text-sm leading-relaxed">{data.helpNeeded}</p>
              ) : (
                <SectionEmpty message="No needs described yet. Describing what you need in plain language is the most important part of getting a good match." />
              )}
            </div>

            {/* Tags */}
            {data.tags?.length > 0 && (
              <div className="card">
                <h2 className="text-sm font-semibold text-[#4B6382] uppercase tracking-wider mb-3">Focus areas</h2>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map(tag => (
                    <span key={tag} className="bg-[#FFF7E6] text-navy-700 text-sm px-3 py-1 rounded-full border border-cream-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/matches')}
              className="btn-navy text-base px-8 py-3.5"
            >
              Find matching students →
            </button>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile/ngo/edit')}
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
