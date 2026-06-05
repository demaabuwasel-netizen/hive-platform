import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Mail, Phone, Globe, Heart, Zap, Target, Edit3, Check, X, Camera } from 'lucide-react'
import { useApp } from '../context/AppContext'
import cardsBackground from '../assets/cards_background.png'

export default function NGOProfile() {
  const { user, profile, updateProfile } = useApp()
  const fileInputRef = useRef(null)

  const displayName = profile?.name || user?.name || 'Organization'

  // Edit states for each section
  const [editingAbout, setEditingAbout] = useState(false)
  const [aboutDraft, setAboutDraft] = useState(profile?.description || '')

  const [editingMission, setEditingMission] = useState(false)
  const [missionDraft, setMissionDraft] = useState(profile?.mission || '')

  const [editingCommunities, setEditingCommunities] = useState(false)
  const [communitiesDraft, setCommunitiesDraft] = useState(profile?.communities || '')

  const handleSaveAbout = async () => {
    await updateProfile({ ...profile, description: aboutDraft })
    setEditingAbout(false)
  }

  const handleSaveMission = async () => {
    await updateProfile({ ...profile, mission: missionDraft })
    setEditingMission(false)
  }

  const handleSaveCommunities = async () => {
    await updateProfile({ ...profile, communities: communitiesDraft })
    setEditingCommunities(false)
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result
        updateProfile({ ...profile, imageUrl: imageData })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="px-8 py-7 max-w-6xl mx-auto">

        {/* ══════════════════════════════════════════════════════
            HERO PROFILE CARD
        ══════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
          className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 mb-6 shadow-sm relative overflow-hidden">

          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: `url(${cardsBackground})`, backgroundSize: 'auto', backgroundRepeat: 'repeat' }}/>

          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
            style={{ background: '#FFB703', transform: 'translate(40%, -40%)' }}/>

          <div className="relative flex items-start gap-10">
            {/* LEFT - Profile Info */}
            <div className="flex-1">
              {/* Photo Upload */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden ring-4 ring-[#FFB703]/20 shadow-lg flex items-center justify-center bg-[#FFB703]/10 mb-4">
                {profile?.imageUrl ? (
                  <img src={profile.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={40} className="text-[#0D183D]" />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-[#FFB703] rounded-full text-white hover:opacity-90 transition-opacity shadow-lg">
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <h1 className="text-[32px] font-extrabold text-[#0D183D] mb-2">{displayName}</h1>
              {profile?.location && (
                <div className="flex items-center gap-2 text-[#4B6382] mb-4">
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}
              <p className="text-sm text-[#4B6382] mb-4 max-w-lg leading-relaxed">
                {profile?.description || 'No description yet'}
              </p>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-6 text-sm">
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-[#4B6382]">
                    <Phone size={16} />
                    {profile.phone}
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-2 text-[#4B6382]">
                    <Mail size={16} />
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            CONTENT GRID - 2 COLUMNS
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-5">

          {/* ABOUT */}
          <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#6366F115' }}>
                  <Building2 size={14} style={{ color: '#6366F1' }}/>
                </span>
                About
              </h2>
              {!editingAbout && (
                <button onClick={() => setEditingAbout(true)}
                  className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                  Edit <Edit3 size={12}/>
                </button>
              )}
            </div>

            {editingAbout ? (
              <div className="space-y-3">
                <textarea value={aboutDraft} onChange={e => setAboutDraft(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] border border-[rgba(13,24,61,0.1)] outline-none transition-all placeholder-[#4B6382]/40 resize-none"
                  placeholder="Write about your organization..."
                  rows={3}
                  style={{ background: '#F8F9FB' }}
                  onFocus={e => e.target.style.borderColor = '#FFB703'}
                  onBlur={e => e.target.style.borderColor = 'rgba(13,24,61,0.1)'}/>
                <div className="flex gap-2">
                  <button onClick={handleSaveAbout}
                    className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                    style={{ background: '#0D183D', color: 'white' }}>Save</button>
                  <button onClick={() => {
                    setAboutDraft(profile?.description || '')
                    setEditingAbout(false)
                  }}
                    className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-[#0D183D]">
                {profile?.description || 'Add a description'}
              </p>
            )}
          </motion.div>

          {/* MISSION STATEMENT */}
          {profile?.mission && (
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#F97316' }}>
                    <Target size={14} style={{ color: '#EA580C' }}/>
                  </span>
                  Mission
                </h2>
                {!editingMission && (
                  <button onClick={() => setEditingMission(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    Edit <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingMission ? (
                <div className="space-y-3">
                  <textarea value={missionDraft} onChange={e => setMissionDraft(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] border border-[rgba(13,24,61,0.1)] outline-none transition-all placeholder-[#4B6382]/40 resize-none"
                    placeholder="Write your mission..."
                    rows={3}
                    style={{ background: '#F8F9FB' }}
                    onFocus={e => e.target.style.borderColor = '#FFB703'}
                    onBlur={e => e.target.style.borderColor = 'rgba(13,24,61,0.1)'}/>
                  <div className="flex gap-2">
                    <button onClick={handleSaveMission}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>Save</button>
                    <button onClick={() => {
                      setMissionDraft(profile?.mission || '')
                      setEditingMission(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed text-[#0D183D]">
                  {profile.mission}
                </p>
              )}
            </motion.div>
          )}

          {/* COMMUNITIES SERVED */}
          {profile?.communities && (
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#8B5CF6' }}>
                    <Heart size={14} style={{ color: '#7C3AED' }}/>
                  </span>
                  Communities
                </h2>
                {!editingCommunities && (
                  <button onClick={() => setEditingCommunities(true)}
                    className="text-[12px] font-semibold text-[#6B7280] flex items-center gap-1 hover:opacity-70">
                    Edit <Edit3 size={12}/>
                  </button>
                )}
              </div>

              {editingCommunities ? (
                <div className="space-y-3">
                  <textarea value={communitiesDraft} onChange={e => setCommunitiesDraft(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-[13px] text-[#0D183D] border border-[rgba(13,24,61,0.1)] outline-none transition-all placeholder-[#4B6382]/40 resize-none"
                    placeholder="Who do you serve..."
                    rows={3}
                    style={{ background: '#F8F9FB' }}
                    onFocus={e => e.target.style.borderColor = '#FFB703'}
                    onBlur={e => e.target.style.borderColor = 'rgba(13,24,61,0.1)'}/>
                  <div className="flex gap-2">
                    <button onClick={handleSaveCommunities}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: '#0D183D', color: 'white' }}>Save</button>
                    <button onClick={() => {
                      setCommunitiesDraft(profile?.communities || '')
                      setEditingCommunities(false)
                    }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#4B6382] hover:bg-[#F8F9FB]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed text-[#0D183D]">
                  {profile.communities}
                </p>
              )}
            </motion.div>
          )}

          {/* ORGANIZATION SIZE */}
          {profile?.orgSize && (
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#06B6D420' }}>
                  <Building2 size={14} style={{ color: '#0891B2' }}/>
                </span>
                Organization Size
              </h2>
              <p className="text-[13px] font-semibold text-[#0D183D]">
                {profile.orgSize}
              </p>
            </motion.div>
          )}

          {/* FOCUS AREAS */}
          {profile?.tags && profile.tags.length > 0 && (
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2 mb-4">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#EC489320' }}>
                  <Heart size={14} style={{ color: '#EC4899' }}/>
                </span>
                Focus Areas
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: '#EC489320', color: '#EC4899' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* PREFERRED SKILLS */}
          {profile?.preferred_skills && profile.preferred_skills.length > 0 && (
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2 mb-4">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#3B82F620' }}>
                  <Zap size={14} style={{ color: '#3B82F6' }}/>
                </span>
                Preferred Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: '#3B82F620', color: '#3B82F6' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* PROJECT TYPES */}
          {profile?.project_types && profile.project_types.length > 0 && (
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <h2 className="text-[14px] font-extrabold text-[#0D183D] flex items-center gap-2 mb-4">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]" style={{ background: '#10B98120' }}>
                  <Target size={14} style={{ color: '#10B981' }}/>
                </span>
                Project Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.project_types.map((type, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background: '#10B98120', color: '#10B981' }}>
                    {type}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* HELP NEEDED */}
          {profile?.helpNeeded && (
            <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
              <h2 className="text-[14px] font-extrabold text-[#0D183D] mb-3">What We Need Help With</h2>
              <p className="text-[13px] leading-relaxed text-[#0D183D]">
                {profile.helpNeeded}
              </p>
            </motion.div>
          )}

          {/* LINKS & SOCIAL */}
          <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            className="bg-white rounded-xl border border-[rgba(13,24,61,0.07)] p-5 shadow-sm">
            <h3 className="text-[14px] font-extrabold text-[#3B82F6] flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#3B82F620' }}>
                <Globe size={14} style={{ color: '#3B82F6' }}/>
              </span>
              Links
            </h3>

            <div className="space-y-2">
              {profile?.website && (
                <div>
                  <p className="text-[11px] font-semibold text-[#0D183D] mb-1">Website</p>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] text-[#3B82F6] hover:underline break-all">
                    {profile.website}
                  </a>
                </div>
              )}
              {profile?.instagram && (
                <div>
                  <p className="text-[11px] font-semibold text-[#0D183D] mb-1">Instagram</p>
                  <a href={profile.instagram} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] text-[#3B82F6] hover:underline break-all">
                    {profile.instagram}
                  </a>
                </div>
              )}
              {profile?.twitter && (
                <div>
                  <p className="text-[11px] font-semibold text-[#0D183D] mb-1">Twitter / X</p>
                  <a href={profile.twitter} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] text-[#3B82F6] hover:underline break-all">
                    {profile.twitter}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
