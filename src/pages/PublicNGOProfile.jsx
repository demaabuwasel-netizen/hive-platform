import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Globe, Mail, Phone, Loader2, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { loadNgoProfile } from '../services/storage'
import GradientAvatar from '../components/GradientAvatar'

export default function PublicNGOProfile() {
  const { ngoId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ngoId) return
    setLoading(true)
    loadNgoProfile(ngoId)
      .then(data => setProfile(data))
      .catch(err => console.error('Error loading NGO profile:', err))
      .finally(() => setLoading(false))
  }, [ngoId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <Loader2 size={32} className="animate-spin text-[#FFB703]" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] px-6">
        <h1 className="text-2xl font-bold text-[#0D183D] mb-2">Organization not found</h1>
        <button onClick={() => navigate('/opportunities')}
          className="text-[#FFB703] hover:text-[#D99E00] font-semibold">
          ← Back to opportunities
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Back Button */}
        <motion.button onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[#4B6382] hover:text-[#0D183D] mb-8 transition-colors">
          <ArrowLeft size={18} />
          <span className="font-medium">Go back</span>
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-8 mb-8">

          <div className="flex items-start gap-8 mb-8">
            <div className="w-24 h-24 rounded-2xl flex-shrink-0 bg-gradient-to-br from-[#FFB703]/10 to-[#FFB703]/5 flex items-center justify-center border border-[rgba(255,183,3,0.15)]">
              {profile?.imageUrl ? (
                <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Building2 size={48} className="text-[#FFB703]" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-[#0D183D] mb-2">{profile.name}</h1>
              {profile.summary && (
                <p className="text-lg text-[#4B6382] font-medium mb-4">{profile.summary}</p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-2 text-[#4B6382]">
                    <MapPin size={16} className="text-[#FFB703]" />
                    {profile.location}
                  </div>
                )}
                {profile.orgSize && (
                  <div className="flex items-center gap-2 text-[#4B6382]">
                    <Building2 size={16} className="text-[#FFB703]" />
                    {profile.orgSize} employees
                  </div>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00]">
                    <Globe size={16} />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-8">

          {/* About */}
          {profile.description && (
            <div className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-2xl font-extrabold text-[#0D183D] mb-4">About us</h2>
              <p className="text-base leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {profile.description}
              </p>
            </div>
          )}

          {/* Mission */}
          {profile.mission && (
            <div className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-2xl font-extrabold text-[#0D183D] mb-4">Our mission</h2>
              <p className="text-base leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {profile.mission}
              </p>
            </div>
          )}

          {/* Communities Served */}
          {profile.communities && (
            <div className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-2xl font-extrabold text-[#0D183D] mb-4">Communities we serve</h2>
              <p className="text-base leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {profile.communities}
              </p>
            </div>
          )}

          {/* Focus Areas */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-2xl font-extrabold text-[#0D183D] mb-4">Focus areas</h2>
              <div className="flex flex-wrap gap-3">
                {profile.tags.map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-full text-sm font-medium bg-[#FFB703]/10 text-[#92610a]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-[#FFB703]/10 to-transparent rounded-3xl border border-[rgba(255,183,3,0.15)] p-8 text-center">
            <h2 className="text-2xl font-extrabold text-[#0D183D] mb-3">Ready to make an impact?</h2>
            <p className="text-lg text-[#4B6382] mb-6">Check out opportunities posted by {profile.name}</p>
            <button onClick={() => navigate('/opportunities')}
              className="px-8 py-3 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#FFB703' }}>
              Browse their opportunities →
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
