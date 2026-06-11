import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, MapPin, Mail, Phone, Globe, Heart, Zap, Target, Edit2, Camera, ExternalLink, X, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import cardsBackground from '../assets/cards_background.png'

export default function NGOProfile() {
  const { user, profile, updateProfile } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [editingField, setEditingField] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)

  const displayName = profile?.name || user?.name || 'Organization'

  const startEdit = (field) => {
    setEditingField(field)
    setEditValues({ [field]: profile?.[field] || '' })
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValues({})
  }

  const saveEdit = async (field) => {
    if (!user?.id) {
      console.error('No user ID')
      alert('Error: No user ID')
      return
    }
    if (!profile) {
      console.error('No profile loaded')
      alert('Error: No profile loaded')
      return
    }

    setSaving(true)
    try {
      console.log(`[NGOProfile] Saving ${field}:`, editValues[field])
      const updated = { ...profile, [field]: editValues[field] }
      console.log('[NGOProfile] Updated profile:', updated)

      // WAIT for save to complete
      await updateProfile(updated)
      console.log('[NGOProfile] Save successful!')

      // Only close AFTER save succeeds
      setEditingField(null)
      setEditValues({})
    } catch (err) {
      console.error('[NGOProfile] Save failed:', err.message, err)
      alert(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

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
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFB703]/10 to-[#FFB703]/5 flex items-center justify-center border border-[rgba(255,183,3,0.15)]">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B6382]">About</h2>
            <button
              onClick={() => navigate('/profile/ngo/edit')}
              className="text-[11px] font-semibold text-[#FFB703] hover:text-[#0D183D] transition-colors flex items-center gap-1">
              <Edit2 size={13} /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">

            <div className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0D183D]">About the Organization</h3>
                {editingField !== 'description' && (
                  <button
                    onClick={() => startEdit('description')}
                    className="p-1 rounded-lg hover:bg-[#F8F9FB] transition-colors text-[#FFB703]">
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
              {editingField === 'description' ? (
                <div className="space-y-2">
                  <textarea
                    value={editValues.description || ''}
                    onChange={(e) => setEditValues({description: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
                    rows="4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit('description')}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB703] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[rgba(13,24,61,0.1)] text-[#4B6382] text-[12px] font-semibold rounded-lg hover:bg-[#F8F9FB] transition-colors">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile?.description || 'Not added yet'}</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0D183D]">Mission</h3>
                {editingField !== 'mission' && (
                  <button
                    onClick={() => startEdit('mission')}
                    className="p-1 rounded-lg hover:bg-[#F8F9FB] transition-colors text-[#FFB703]">
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
              {editingField === 'mission' ? (
                <div className="space-y-2">
                  <textarea
                    value={editValues.mission || ''}
                    onChange={(e) => setEditValues({mission: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
                    rows="4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit('mission')}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB703] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[rgba(13,24,61,0.1)] text-[#4B6382] text-[12px] font-semibold rounded-lg hover:bg-[#F8F9FB] transition-colors">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile?.mission || 'Not added yet'}</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0D183D]">Communities Served</h3>
                {editingField !== 'communities' && (
                  <button
                    onClick={() => startEdit('communities')}
                    className="p-1 rounded-lg hover:bg-[#F8F9FB] transition-colors text-[#FFB703]">
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
              {editingField === 'communities' ? (
                <div className="space-y-2">
                  <textarea
                    value={editValues.communities || ''}
                    onChange={(e) => setEditValues({communities: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
                    rows="4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit('communities')}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB703] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[rgba(13,24,61,0.1)] text-[#4B6382] text-[12px] font-semibold rounded-lg hover:bg-[#F8F9FB] transition-colors">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile?.communities || 'Not added yet'}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: WHAT WE NEED */}
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B6382] mb-4">Opportunities</h2>
          <div className="bg-gradient-to-br from-[#FFF9E6] to-white rounded-xl border border-[rgba(255,183,3,0.15)] p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0D183D]">What We Need Help With</h3>
              {editingField !== 'helpNeeded' && (
                <button
                  onClick={() => startEdit('helpNeeded')}
                  className="p-1 rounded-lg hover:bg-white/50 transition-colors text-[#FFB703]">
                  <Edit2 size={12} />
                </button>
              )}
            </div>
            {editingField === 'helpNeeded' ? (
              <div className="space-y-2">
                <textarea
                  value={editValues.helpNeeded || ''}
                  onChange={(e) => setEditValues({helpNeeded: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
                  rows="4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit('helpNeeded')}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB703] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                    <Check size={12} /> Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[rgba(13,24,61,0.1)] text-[#4B6382] text-[12px] font-semibold rounded-lg hover:bg-[#F8F9FB] transition-colors">
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-[#4B6382]">{profile?.helpNeeded || 'Not added yet'}</p>
            )}
          </div>
        </motion.div>

        {/* SECTION 3: TAGS & SKILLS */}
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B6382] mb-4">Focus & Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Focus Areas */}
            <div className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0D183D]">Focus Areas</h3>
                {editingField !== 'tags' && (
                  <button
                    onClick={() => startEdit('tags')}
                    className="p-1 rounded-lg hover:bg-[#F8F9FB] transition-colors text-[#FFB703]">
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
              {editingField === 'tags' ? (
                <div className="space-y-2">
                  <select multiple
                    value={editValues.tags || []}
                    onChange={(e) => setEditValues({tags: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FFB703]">
                    <option value="Youth Empowerment">Youth Empowerment</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Environment">Environment</option>
                    <option value="Technology">Technology</option>
                    <option value="Community Development">Community Development</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit('tags')}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB703] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[rgba(13,24,61,0.1)] text-[#4B6382] text-[12px] font-semibold rounded-lg hover:bg-[#F8F9FB] transition-colors">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Preferred Skills */}
            <div className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0D183D]">Preferred Skills</h3>
                {editingField !== 'preferred_skills' && (
                  <button
                    onClick={() => startEdit('preferred_skills')}
                    className="p-1 rounded-lg hover:bg-[#F8F9FB] transition-colors text-[#FFB703]">
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
              {editingField === 'preferred_skills' ? (
                <div className="space-y-2">
                  <select multiple
                    value={editValues.preferred_skills || []}
                    onChange={(e) => setEditValues({preferred_skills: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FFB703]">
                    <option value="Communication">Communication</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Data Analysis">Data Analysis</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Programming">Programming</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit('preferred_skills')}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB703] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[rgba(13,24,61,0.1)] text-[#4B6382] text-[12px] font-semibold rounded-lg hover:bg-[#F8F9FB] transition-colors">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Project Types */}
            <div className="bg-white rounded-xl border border-[rgba(13,24,61,0.08)] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0D183D]">Project Types</h3>
                {editingField !== 'project_types' && (
                  <button
                    onClick={() => startEdit('project_types')}
                    className="p-1 rounded-lg hover:bg-[#F8F9FB] transition-colors text-[#FFB703]">
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
              {editingField === 'project_types' ? (
                <div className="space-y-2">
                  <select multiple
                    value={editValues.project_types || []}
                    onChange={(e) => setEditValues({project_types: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-[rgba(13,24,61,0.1)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FFB703]">
                    <option value="Website">Website</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Research">Research</option>
                    <option value="Content Creation">Content Creation</option>
                    <option value="Event Planning">Event Planning</option>
                    <option value="Fundraising">Fundraising</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit('project_types')}
                      disabled={saving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB703] text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[rgba(13,24,61,0.1)] text-[#4B6382] text-[12px] font-semibold rounded-lg hover:bg-[#F8F9FB] transition-colors">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 4: LINKS & SOCIAL */}
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B6382] mb-4">Connect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile?.website ? (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white hover:bg-[#FAFBFC] transition-colors group">
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
              <div className="flex items-center justify-between p-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white">
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
                className="flex items-center justify-between p-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white hover:bg-[#FAFBFC] transition-colors group">
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
              <div className="flex items-center justify-between p-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white">
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
                className="flex items-center justify-between p-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white hover:bg-[#FAFBFC] transition-colors group">
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
              <div className="flex items-center justify-between p-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white">
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
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white">
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-[#6366F1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#4B6382] uppercase">Registration</p>
                  <p className="text-[13px] font-semibold text-[#0D183D]">{profile.registrationNumber}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(13,24,61,0.08)] bg-white">
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
