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
    <main className="min-h-screen bg-gradient-to-b from-[#F8F9FB] to-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back Button */}
        <motion.button onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[#4B6382] hover:text-[#0D183D] mb-8 transition-colors font-medium">
          <ArrowLeft size={18} />
          Go back
        </motion.button>

        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl border border-[rgba(13,24,61,0.08)] overflow-hidden mb-12"
          style={{ background: 'linear-gradient(135deg, rgba(255,183,3,0.05) 0%, rgba(59,130,246,0.05) 100%)' }}>

          <div className="p-10 md:p-12">
            <div className="flex items-start gap-8 md:gap-10">
              {/* Logo */}
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
                className="w-28 h-28 rounded-2xl flex-shrink-0 bg-white flex items-center justify-center border-2 border-[rgba(255,183,3,0.2)] shadow-lg">
                {profile?.imageUrl ? (
                  <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <Building2 size={56} className="text-[#FFB703]" />
                )}
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#0D183D] mb-3 leading-tight">{profile.name}</h1>
                {profile.summary && (
                  <p className="text-lg text-[#4B6382] font-medium mb-6 leading-relaxed">{profile.summary}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FFB703]/10 flex items-center justify-center flex-shrink-0">
                        <MapPin size={18} className="text-[#FFB703]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#4B6382] uppercase">Location</p>
                        <p className="text-sm font-bold text-[#0D183D] truncate">{profile.location}</p>
                      </div>
                    </div>
                  )}
                  {profile.orgSize && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-[#3B82F6]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#4B6382] uppercase">Team</p>
                        <p className="text-sm font-bold text-[#0D183D]">{profile.orgSize}</p>
                      </div>
                    </div>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                        <Globe size={18} className="text-[#10B981]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#4B6382] uppercase">Website</p>
                        <p className="text-sm font-bold text-[#0D183D] truncate">Visit</p>
                      </div>
                    </a>
                  )}
                </div>
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
          <div className="bg-gradient-to-r from-[#FFB703]/10 to-transparent rounded-3xl border border-[rgba(255,183,3,0.15)] p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D183D] mb-3">Ready to make an impact?</h2>
            <p className="text-lg text-[#4B6382] mb-8">Explore all opportunities posted by <span className="font-bold">{profile.name}</span></p>
            <button onClick={() => navigate(`/opportunities?ngo=${ngoId}`)}
              className="px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 inline-flex items-center gap-2"
              style={{ background: '#FFB703', boxShadow: '0 12px 40px rgba(255,183,3,0.2)' }}>
              Browse their opportunities →
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
