import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Globe, Loader2, ExternalLink, Heart,
  Share2, AlertCircle, MapPin, Users, Briefcase, Target
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
    default: 'bg-[#F8FBFF] text-[#1A73E8] border border-[#D7E6FF]',
    blue: 'bg-[#F8FBFF] text-[#1A73E8] border border-[#D7E6FF]',
    green: 'bg-[#F8FAFC] text-[#3C4043] border border-[#E6EAF0]',
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
      className="group relative cursor-pointer overflow-hidden rounded-[20px] border border-[#E1E7F0] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFD7FF] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
      onClick={() => onViewDetails(opp)}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-[#E8F0FE] transition-colors group-hover:bg-[#1A73E8]" />
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="line-clamp-2 flex-1 text-[0.95rem] font-semibold leading-tight text-[#202124] transition-colors group-hover:text-[#1A73E8]">
          {opp.title}
        </h3>
        <button
          onClick={handleSaveClick}
          className="flex-shrink-0 rounded-lg border border-transparent p-2 transition-colors hover:border-[#E6EAF0] hover:bg-[#F8FAFC]"
        >
          <svg className="h-[18px] w-[18px] text-[#5F6368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {opp.location && (
          <span className="rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-2.5 py-1 text-[0.72rem] text-[#5F6368]">
            {opp.location}
          </span>
        )}
        {opp.workMode && (
          <span className="rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-2.5 py-1 text-[0.72rem] text-[#5F6368]">
            {opp.workMode}
          </span>
        )}
        {opp.weeklyHours && (
          <span className="rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-2.5 py-1 text-[0.72rem] text-[#5F6368]">
            {opp.weeklyHours} hrs/week
          </span>
        )}
      </div>

      {opp.description && (
        <p className="mb-3 line-clamp-2 text-[0.8rem] leading-relaxed text-[#5F6368]">
          {opp.description}
        </p>
      )}

      {opp.skills && opp.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {opp.skills.slice(0, 2).map((s, idx) => (
            <SkillChip key={idx} skill={s} />
          ))}
          {opp.skills.length > 2 && (
            <span className="text-[0.7rem] font-medium text-[#5F6368]">
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
        className="w-full rounded-full bg-[#1A73E8] py-2.5 text-[0.76rem] font-semibold text-white shadow-[0_8px_20px_rgba(26,115,232,0.18)] transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(26,115,232,0.24)]"
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
      <main className="flex min-h-screen flex-1 items-center justify-center bg-[#F5F7FB]">
        <Loader2 size={32} className="animate-spin text-[#1A73E8]" />
      </main>
    )
  }

  if (!ngoProfile) {
    return (
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-[#F5F7FB] px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F0FE]">
            <AlertCircle size={32} className="text-[#1A73E8]" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-[#202124]">Organization not found</h1>
          <button
            onClick={() => navigate('/opportunities')}
            className="mt-4 font-semibold text-[#1A73E8] hover:text-[#1558B0]"
          >
            ← Back to opportunities
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#F5F7FB]">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center gap-2 font-semibold text-[#5F6368] transition-colors hover:text-[#202124]"
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-[26px] border border-[#DDE3EC] bg-white shadow-[0_10px_32px_rgba(15,23,42,0.055)]"
        >
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="p-7 md:p-9">
              <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#1A73E8]">
                Organization profile
              </p>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex-shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[22px] border border-[#E6EAF0] bg-[#FAFBFD] p-1">
                    {ngoProfile?.imageUrl ? (
                      <img
                        src={ngoProfile.imageUrl}
                        alt={ngoProfile.name}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <GradientAvatar name={ngoProfile.name} size={88} radius="1rem" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-tight tracking-[-0.05em] text-[#202124]">
                    {ngoProfile.name}
                  </h1>
                  {(ngoProfile.description || ngoProfile.mission) && (
                    <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-[#5F6368]">
                      {(ngoProfile.description || ngoProfile.mission || '').slice(0, 190)}
                      {(ngoProfile.description || ngoProfile.mission || '').length > 190 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {ngoProfile.website && (
                  <a
                    href={ngoProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#D7E6FF] bg-[#F8FBFF] px-4 py-2 text-[0.84rem] font-semibold text-[#1A73E8] transition-colors hover:bg-white"
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
                    className="inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-4 py-2 text-[0.84rem] font-semibold text-[#3C4043] transition-colors hover:bg-white"
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
                    className="inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-4 py-2 text-[0.84rem] font-semibold text-[#3C4043] transition-colors hover:bg-white"
                  >
                    <Share2 size={16} />
                    Social
                  </a>
                )}
              </div>
            </div>

            <aside className="border-t border-[#E6EAF0] bg-[#FAFBFD] p-6 lg:border-l lg:border-t-0">
              <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">At a glance</p>
              <div className="space-y-3">
                {ngoProfile.location && (
                  <div className="flex items-start gap-3 rounded-[16px] border border-[#E6EAF0] bg-white px-4 py-3">
                    <MapPin size={16} className="mt-0.5 text-[#1A73E8]" />
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">Location</p>
                      <p className="mt-0.5 text-[0.88rem] font-semibold text-[#202124]">{ngoProfile.location}</p>
                    </div>
                  </div>
                )}
                {ngoProfile.orgSize && (
                  <div className="flex items-start gap-3 rounded-[16px] border border-[#E6EAF0] bg-white px-4 py-3">
                    <Users size={16} className="mt-0.5 text-[#1A73E8]" />
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">Team size</p>
                      <p className="mt-0.5 text-[0.88rem] font-semibold text-[#202124]">{ngoProfile.orgSize}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-[16px] border border-[#E6EAF0] bg-white px-4 py-3">
                  <Briefcase size={16} className="mt-0.5 text-[#1A73E8]" />
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">Open roles</p>
                    <p className="mt-0.5 text-[0.88rem] font-semibold text-[#202124]">{ngoOpps.length} opportunity{ngoOpps.length !== 1 ? 'ies' : ''}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]"
        >
          <section className="space-y-5">
            {ngoProfile.description && (
              <div className="relative overflow-hidden rounded-[22px] border border-[#E1E7F0] bg-white p-7 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <span className="absolute inset-y-7 left-0 w-1 rounded-r-full bg-[#1A73E8]" />
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Who they are</p>
                <h2 className="mb-4 text-[1.15rem] font-semibold text-[#202124]">About us</h2>
                <p className="whitespace-pre-wrap text-[0.92rem] leading-7 text-[#5F6368]">
                  {ngoProfile.description}
                </p>
              </div>
            )}

            {ngoProfile.mission && (
              <div className="relative overflow-hidden rounded-[22px] border border-[#D7E6FF] bg-[#F8FBFF] p-7 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <Target size={18} className="mb-3 text-[#1A73E8]" />
                <p className="relative mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Purpose</p>
                <h2 className="relative mb-4 text-[1.15rem] font-semibold text-[#202124]">Our mission</h2>
                <p className="whitespace-pre-wrap text-[0.92rem] leading-7 text-[#5F6368]">
                  {ngoProfile.mission}
                </p>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {ngoProfile.communities && (
                <div className="rounded-[22px] border border-[#E1E7F0] bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                  <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Community</p>
                  <h2 className="mb-4 text-[1.05rem] font-semibold text-[#202124]">Communities we serve</h2>
                  <p className="whitespace-pre-wrap text-[0.88rem] leading-7 text-[#5F6368]">
                    {ngoProfile.communities}
                  </p>
                </div>
              )}

              {ngoProfile.helpNeeded && (
                <div className="rounded-[22px] border border-[#E1E7F0] bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                  <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Support needs</p>
                  <h2 className="mb-4 text-[1.05rem] font-semibold text-[#202124]">What we need help with</h2>
                  <p className="whitespace-pre-wrap text-[0.88rem] leading-7 text-[#5F6368]">
                    {ngoProfile.helpNeeded}
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            {ngoProfile.tags && ngoProfile.tags.length > 0 && (
              <div className="rounded-[22px] border border-[#E1E7F0] bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Topics</p>
                <h2 className="mb-4 text-[1.05rem] font-semibold text-[#202124]">Focus areas</h2>
                <div className="flex flex-wrap gap-2">
                  {ngoProfile.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-[#D7E6FF] bg-[#F8FBFF] px-3 py-1.5 text-[0.76rem] font-medium text-[#1A73E8]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {ngoProfile.preferred_skills && ngoProfile.preferred_skills.length > 0 && (
              <div className="rounded-[22px] border border-[#E1E7F0] bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Student fit</p>
                <h2 className="mb-4 text-[1.05rem] font-semibold text-[#202124]">Preferred skills</h2>
                <div className="flex flex-wrap gap-2">
                  {ngoProfile.preferred_skills.map((skill, i) => (
                    <SkillChip key={i} skill={skill} variant="blue" />
                  ))}
                </div>
              </div>
            )}

            {ngoProfile.project_types && ngoProfile.project_types.length > 0 && (
              <div className="rounded-[22px] border border-[#E1E7F0] bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Work style</p>
                <h2 className="mb-4 text-[1.05rem] font-semibold text-[#202124]">Project types</h2>
                <div className="flex flex-wrap gap-2">
                  {ngoProfile.project_types.map((type, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-3 py-1.5 text-[0.76rem] font-medium text-[#3C4043]"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </motion.div>

        {/* Opportunities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-[1.7rem] font-semibold tracking-[-0.03em] text-[#202124]">
            Open opportunities
          </h2>

          {ngoOpps.length === 0 ? (
            <div className="rounded-[22px] border border-[#E6EAF0] bg-white p-12 text-center shadow-[0_6px_22px_rgba(15,23,42,0.04)]">
              <AlertCircle size={32} className="mx-auto mb-3 text-[#1A73E8]" />
              <p className="text-[0.9rem] text-[#5F6368]">
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
