import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Globe, Loader2, ExternalLink, Heart,
  Share2, AlertCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { loadNgoProfile } from '../services/storage'
import { fetchNgoOpportunities } from '../services/opportunities'
import GradientAvatar from '../components/GradientAvatar'

// Parse skill
function parseSkill(s) {
  if (!s) return { name: '', level: '' }
  if (typeof s === 'string') {
    if (s.startsWith('{')) {
      try {
        const parsed = JSON.parse(s)
        return { name: parsed.name || '', level: parsed.level || '' }
      } catch (e) {
        return { name: s, level: '' }
      }
    }
    return { name: s, level: '' }
  }
  if (typeof s === 'object') {
    if (s.name && typeof s.name === 'string' && s.name.startsWith('{')) {
      try {
        const nested = JSON.parse(s.name)
        return { name: nested.name || s.name, level: s.level || nested.level || '' }
      } catch (e) {
        return { name: s.name || '', level: s.level || '' }
      }
    }
    return { name: s.name || '', level: s.level || '' }
  }
  return { name: '', level: '' }
}

// Skill chip
function SkillChip({ skill, variant = 'default' }) {
  const { name, level } = parseSkill(skill)
  if (!name) return null

  const styles = {
    default: 'bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/20',
    blue: 'bg-[#3B82F6]/10 text-[#1E40AF] border border-[#3B82F6]/20',
    green: 'bg-[#10B981]/10 text-[#065F46] border border-[#10B981]/20',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium ${styles[variant]}`}>
      {level ? `${name} · ${level}` : name}
    </span>
  )
}

// Opportunity card for NGO opportunities
function NGOOpportunityCard({ opp, onViewDetails }) {
  const handleSaveClick = () => {
    // Save functionality can be added here
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 hover:shadow-lg hover:border-[rgba(13,24,61,0.12)] transition-all duration-200 cursor-pointer group"
      onClick={() => onViewDetails(opp)}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-[15px] font-bold text-[#0D183D] leading-tight line-clamp-2 group-hover:text-[#FFB703] transition-colors flex-1">
          {opp.title}
        </h3>
        <button
          onClick={handleSaveClick}
          className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors flex-shrink-0"
        >
          <svg className="w-[18px] h-[18px] text-[#4B6382]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {opp.location && (
          <span className="text-[12px] px-2.5 py-1 rounded-lg bg-[#F8F9FB] text-[#4B6382]">
            {opp.location}
          </span>
        )}
        {opp.workMode && (
          <span className="text-[12px] px-2.5 py-1 rounded-lg bg-[#F8F9FB] text-[#4B6382]">
            {opp.workMode}
          </span>
        )}
        {opp.weeklyHours && (
          <span className="text-[12px] px-2.5 py-1 rounded-lg bg-[#F8F9FB] text-[#4B6382]">
            {opp.weeklyHours} hrs/week
          </span>
        )}
      </div>

      {opp.description && (
        <p className="text-[13px] text-[#4B6382] leading-relaxed line-clamp-2 mb-3">
          {opp.description}
        </p>
      )}

      {opp.skills && opp.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {opp.skills.slice(0, 2).map((s, idx) => (
            <SkillChip key={idx} skill={s} />
          ))}
          {opp.skills.length > 2 && (
            <span className="text-[11px] font-medium text-[#4B6382]">
              +{opp.skills.length - 2} more
            </span>
          )}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          onViewDetails(opp)
        }}
        className="w-full py-2 rounded-xl text-[12px] font-semibold text-white bg-[#FFB703] hover:opacity-90 transition-all"
      >
        View opportunity
      </button>
    </motion.div>
  )
}

export default function PublicNGOProfile() {
  const { ngoId } = useParams()
  const navigate = useNavigate()
  const [ngoProfile, setNgoProfile] = useState(null)
  const [ngoOpps, setNgoOpps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ngoId) return
    setLoading(true)

    Promise.all([
      loadNgoProfile(ngoId),
      fetchNgoOpportunities(ngoId),
    ])
      .then(([profile, opps]) => {
        setNgoProfile(profile)
        const cards = opps.map((opp) => ({
          ...opp,
          id: opp.id,
        }))
        setNgoOpps(cards)
      })
      .catch((err) => {
        console.error('Error loading NGO profile:', err)
      })
      .finally(() => setLoading(false))
  }, [ngoId])


  if (loading) {
    return (
      <main className="flex-1 bg-[#F8F9FB] flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#FFB703]" />
      </main>
    )
  }

  if (!ngoProfile) {
    return (
      <main className="flex-1 bg-[#F8F9FB] flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-amber-50">
            <AlertCircle size={32} className="text-[#FFB703]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0D183D] mb-2">Organization not found</h1>
          <button
            onClick={() => navigate('/opportunities')}
            className="text-[#FFB703] hover:text-[#D99E00] font-semibold mt-4"
          >
            ← Back to opportunities
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[#4B6382] hover:text-[#0D183D] mb-10 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-8 md:p-12 mb-10"
        >
          <div className="flex items-start gap-8 md:gap-10 mb-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#FFB703]/10 to-[#3B82F6]/10 border-2 border-[rgba(13,24,61,0.08)]">
                {ngoProfile?.imageUrl ? (
                  <img
                    src={ngoProfile.imageUrl}
                    alt={ngoProfile.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <GradientAvatar name={ngoProfile.name} size={96} radius="1rem" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-5xl font-bold text-[#0D183D] mb-4 leading-tight">
                {ngoProfile.name}
              </h1>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {ngoProfile.location && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#4B6382] uppercase mb-1">Location</p>
                    <p className="text-[14px] font-semibold text-[#0D183D]">{ngoProfile.location}</p>
                  </div>
                )}
                {ngoProfile.orgSize && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#4B6382] uppercase mb-1">Team Size</p>
                    <p className="text-[14px] font-semibold text-[#0D183D]">{ngoProfile.orgSize}</p>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 flex-wrap">
                {ngoProfile.website && (
                  <a
                    href={ngoProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F8F9FB] hover:bg-white border border-[rgba(13,24,61,0.08)] text-[#0D183D] font-medium transition-all"
                  >
                    <Globe size={16} />
                    Website
                    <ExternalLink size={14} />
                  </a>
                )}
                {ngoProfile.instagram && (
                  <a
                    href={ngoProfile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F8F9FB] hover:bg-white border border-[rgba(13,24,61,0.08)] text-[#0D183D] font-medium transition-all"
                  >
                    <Heart size={16} />
                    Instagram
                  </a>
                )}
                {ngoProfile.twitter && (
                  <a
                    href={ngoProfile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F8F9FB] hover:bg-white border border-[rgba(13,24,61,0.08)] text-[#0D183D] font-medium transition-all"
                  >
                    <Share2 size={16} />
                    Social
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 mb-12"
        >
          {/* About */}
          {ngoProfile.description && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-4">About us</h2>
              <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {ngoProfile.description}
              </p>
            </div>
          )}

          {/* Mission */}
          {ngoProfile.mission && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-4">Our mission</h2>
              <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {ngoProfile.mission}
              </p>
            </div>
          )}

          {/* Communities Served */}
          {ngoProfile.communities && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-4">Communities we serve</h2>
              <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {ngoProfile.communities}
              </p>
            </div>
          )}

          {/* What We Need Help With */}
          {ngoProfile.helpNeeded && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-4">What we need help with</h2>
              <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {ngoProfile.helpNeeded}
              </p>
            </div>
          )}

          {/* Focus Areas */}
          {ngoProfile.tags && ngoProfile.tags.length > 0 && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-4">Focus areas</h2>
              <div className="flex flex-wrap gap-2">
                {ngoProfile.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Skills */}
          {ngoProfile.preferred_skills && ngoProfile.preferred_skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-4">Preferred skills</h2>
              <div className="flex flex-wrap gap-2">
                {ngoProfile.preferred_skills.map((skill, i) => (
                  <SkillChip key={i} skill={skill} variant="blue" />
                ))}
              </div>
            </div>
          )}

          {/* Project Types */}
          {ngoProfile.project_types && ngoProfile.project_types.length > 0 && (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-8">
              <h2 className="text-[20px] font-bold text-[#0D183D] mb-4">Project types</h2>
              <div className="flex flex-wrap gap-2">
                {ngoProfile.project_types.map((type, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#10B981]/10 text-[#065F46] border border-[#10B981]/20"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Opportunities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-[28px] font-bold text-[#0D183D] mb-6">
            Open opportunities
          </h2>

          {ngoOpps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-12 text-center">
              <AlertCircle size={32} className="text-[#FFB703] mx-auto mb-3" />
              <p className="text-[14px] text-[#4B6382]">
                This organization doesn't have any open opportunities right now.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ngoOpps.map((opp) => (
                <NGOOpportunityCard
                  key={opp.id}
                  opp={opp}
                  onViewDetails={(opp) => {
                    navigate(`/opportunities?detail=${opp.id}`)
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
