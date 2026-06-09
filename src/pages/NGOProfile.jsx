import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, MapPin, Mail, Phone, Globe, Heart, Zap, Target, Edit2, Camera, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext'
import cardsBackground from '../assets/cards_background.png'

export default function NGOProfile() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const displayName = profile?.name || user?.name || 'Organization'

  return (
    <main className="flex-1 overflow-y-auto bg-[#FAFBFC]">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ═══════════════════════════════════════════════════════════
            HERO SECTION - Premium Profile Header
        ═══════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
          className="mb-12">
          <div className="relative bg-gradient-to-br from-white to-[#FAFBFC] rounded-3xl border border-[rgba(13,24,61,0.08)] p-8 overflow-hidden">

            <div className="absolute inset-0 opacity-[0.01] pointer-events-none"
              style={{ backgroundImage: `url(${cardsBackground})`, backgroundSize: 'auto', backgroundRepeat: 'repeat' }}/>

            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.03] blur-3xl pointer-events-none"
              style={{ background: '#FFB703' }}/>

            <div className="relative flex items-start gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFB703]/10 to-[#FFB703]/5 flex items-center justify-center border border-[rgba(255,183,3,0.15)]">
                  {profile?.imageUrl ? (
                    <img src={profile.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={48} className="text-[#FFB703]" />
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-[#FFB703] rounded-lg text-white hover:opacity-90 transition-opacity shadow-lg"
                    title="Change logo">
                    <Camera size={13} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          // This would need updateProfile from useApp
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-4xl font-bold text-[#0D183D] mb-2">{displayName}</h1>
                    {profile?.summary && (
                      <p className="text-[15px] text-[#4B6382] font-medium">{profile.summary}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/profile/ngo/edit')}
                    className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#FFB703] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm">
                    <Edit2 size={14} />
                    Edit
                  </button>
                </div>

                {/* Meta info: location, size */}
                <div className="flex flex-wrap items-center gap-6 mt-4 text-[14px]">
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-[#4B6382]">
                      <MapPin size={16} className="text-[#FFB703]" />
                      {profile.location}
                    </div>
                  )}
                  {profile?.orgSize && (
                    <div className="flex items-center gap-2 text-[#4B6382]">
                      <Building2 size={16} className="text-[#FFB703]" />
                      {profile.orgSize} employees
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex items-center gap-2 text-[#4B6382]">
                      <Mail size={16} className="text-[#FFB703]" />
                      {user.email}
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-[#4B6382]">
                      <Phone size={16} className="text-[#FFB703]" />
                      {profile.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            MAIN CONTENT - Organized Sections
        ═══════════════════════════════════════════════════════════ */}

        {/* SECTION 1: ABOUT & MISSION */}
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B6382] mb-4">About</h2>
          <div className="grid grid-cols-1 gap-5">

            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-7">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#0D183D] mb-3">About the Organization</h3>
              <p className="text-[15px] leading-relaxed text-[#4B6382]">{profile?.description || 'Not added yet'}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-7">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#0D183D] mb-3">Mission</h3>
              <p className="text-[15px] leading-relaxed text-[#4B6382]">{profile?.mission || 'Not added yet'}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-7">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#0D183D] mb-3">Communities Served</h3>
              <p className="text-[15px] leading-relaxed text-[#4B6382]">{profile?.communities || 'Not added yet'}</p>
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: WHAT WE NEED */}
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B6382] mb-4">Opportunities</h2>
          <div className="bg-gradient-to-br from-[#FFF9E6] to-white rounded-2xl border border-[rgba(255,183,3,0.15)] p-7">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#0D183D] mb-3">What We Need Help With</h3>
            <p className="text-[15px] leading-relaxed text-[#4B6382]">{profile?.helpNeeded || 'Not added yet'}</p>
          </div>
        </motion.div>

        {/* SECTION 3: TAGS & SKILLS */}
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B6382] mb-4">Focus & Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-7">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#0D183D] mb-4">Focus Areas</h3>
              {profile?.tags?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFB703]/10 text-[#92610a]">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#4B6382]">Not added yet</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-7">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#0D183D] mb-4">Preferred Skills</h3>
              {profile?.preferred_skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.preferred_skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#3B82F6]/10 text-[#1E40AF]">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#4B6382]">Not added yet</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-7">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#0D183D] mb-4">Project Types</h3>
              {profile?.project_types?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.project_types.map((type, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#10B981]/10 text-[#065F46]">
                      {type}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#4B6382]">Not added yet</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 4: LINKS & SOCIAL */}
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B6382] mb-4">Connect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.website ? (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(13,24,61,0.08)] bg-white hover:bg-[#FAFBFC] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                    <Globe size={18} className="text-[#3B82F6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#4B6382] uppercase">Website</p>
                    <p className="text-[13px] font-semibold text-[#0D183D] truncate">{profile.website.replace(/^https?:\/\/(www\.)?/, '')}</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-[#4B6382] group-hover:text-[#0D183D] opacity-50 flex-shrink-0" />
              </a>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(13,24,61,0.08)] bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                    <Globe size={18} className="text-[#3B82F6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#4B6382] uppercase">Website</p>
                    <p className="text-[13px] text-[#4B6382]">Not added yet</p>
                  </div>
                </div>
              </div>
            )}

            {profile?.instagram ? (
              <a href={profile.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(13,24,61,0.08)] bg-white hover:bg-[#FAFBFC] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center">
                    <Heart size={18} className="text-[#EC4899]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#4B6382] uppercase">Instagram</p>
                    <p className="text-[13px] font-semibold text-[#0D183D] truncate">{profile.instagram.replace(/^https?:\/\/(www\.)?/, '')}</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-[#4B6382] group-hover:text-[#0D183D] opacity-50 flex-shrink-0" />
              </a>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(13,24,61,0.08)] bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center">
                    <Heart size={18} className="text-[#EC4899]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#4B6382] uppercase">Instagram</p>
                    <p className="text-[13px] text-[#4B6382]">Not added yet</p>
                  </div>
                </div>
              </div>
            )}

            {profile?.twitter ? (
              <a href={profile.twitter} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(13,24,61,0.08)] bg-white hover:bg-[#FAFBFC] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0891B2]/10 flex items-center justify-center">
                    <Target size={18} className="text-[#0891B2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#4B6382] uppercase">Twitter / X</p>
                    <p className="text-[13px] font-semibold text-[#0D183D] truncate">{profile.twitter.replace(/^https?:\/\/(www\.)?/, '')}</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-[#4B6382] group-hover:text-[#0D183D] opacity-50 flex-shrink-0" />
              </a>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(13,24,61,0.08)] bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0891B2]/10 flex items-center justify-center">
                    <Target size={18} className="text-[#0891B2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#4B6382] uppercase">Twitter / X</p>
                    <p className="text-[13px] text-[#4B6382]">Not added yet</p>
                  </div>
                </div>
              </div>
            )}

            {profile?.registrationNumber ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-[rgba(13,24,61,0.08)] bg-white">
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-[#6366F1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#4B6382] uppercase">Registration</p>
                  <p className="text-[13px] font-semibold text-[#0D183D]">{profile.registrationNumber}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-[rgba(13,24,61,0.08)] bg-white">
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-[#6366F1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#4B6382] uppercase">Registration</p>
                  <p className="text-[13px] text-[#4B6382]">Not added yet</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer spacing */}
        <div className="h-8" />
      </div>
    </main>
  )
}
