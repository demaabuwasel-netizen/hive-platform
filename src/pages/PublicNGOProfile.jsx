import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Globe, Loader2, ExternalLink, Heart,
  Share2, AlertCircle, MapPin, Users, Briefcase, Target
} from 'lucide-react'
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
      className="group flex h-full cursor-pointer flex-col rounded-[24px] border border-[#E1E7F0] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFD7FF] hover:shadow-[0_18px_42px_rgba(60,64,67,0.08)]"
      onClick={() => onViewDetails(opp)}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h3 className="line-clamp-2 text-[1.12rem] font-semibold leading-snug tracking-[-0.03em] text-[#202124] transition-colors group-hover:text-[#1A73E8]">
          {opp.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSaveClick()
          }}
          className="flex-shrink-0 rounded-full border border-transparent p-2 transition-colors hover:border-[#E6EAF0] hover:bg-[#F8FAFC]"
          aria-label="Save opportunity"
        >
          <svg className="h-[18px] w-[18px] text-[#5F6368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
          </svg>
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {opp.location && (
          <span className="rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-3 py-1.5 text-[0.76rem] font-medium text-[#5F6368]">
            {opp.location}
          </span>
        )}
        {opp.workMode && (
          <span className="rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-3 py-1.5 text-[0.76rem] font-medium text-[#5F6368]">
            {opp.workMode}
          </span>
        )}
        {opp.weeklyHours && (
          <span className="rounded-full border border-[#E6EAF0] bg-[#F8FAFC] px-3 py-1.5 text-[0.76rem] font-medium text-[#5F6368]">
            {opp.weeklyHours} hrs/week
          </span>
        )}
      </div>

      {opp.description && (
        <p className="mb-5 line-clamp-3 text-[0.9rem] leading-7 text-[#5F6368]">
          {opp.description}
        </p>
      )}

      <div className="mt-auto">
        {opp.skills && opp.skills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {opp.skills.slice(0, 2).map((s, idx) => (
              <SkillChip key={idx} skill={s} />
            ))}
            {opp.skills.length > 2 && (
              <span className="rounded-full bg-[#F1F3F4] px-3 py-1.5 text-[0.72rem] font-semibold text-[#5F6368]">
                +{opp.skills.length - 2}
              </span>
            )}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(opp)
          }}
          className="w-full rounded-full bg-[#1A73E8] px-5 py-3 text-[0.84rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.18)] transition-all hover:-translate-y-px hover:bg-[#1558B0] hover:shadow-[0_14px_30px_rgba(26,115,232,0.24)]"
        >
          View opportunity
        </button>
      </div>
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
    <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-7 sm:px-8 lg:px-10">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 inline-flex items-center gap-2 text-[0.86rem] font-semibold text-[#5F6368] transition-colors hover:text-[#202124]"
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>

        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-[24px] border border-[#DDE3EC] bg-white p-1.5 shadow-[0_12px_30px_rgba(60,64,67,0.07)]">
                {ngoProfile?.imageUrl ? (
                  <img
                    src={ngoProfile.imageUrl}
                    alt={ngoProfile.name}
                    className="h-full w-full rounded-[18px] object-cover"
                  />
                ) : (
                  <GradientAvatar name={ngoProfile.name} size={74} radius="1rem" />
                )}
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#1A73E8]">
                  Organization profile
                </p>
                <h1 className="text-[clamp(2.7rem,6vw,5.6rem)] font-normal leading-[0.96] tracking-[-0.075em] text-[#202124]">
                  {ngoProfile.name}
                </h1>
              </div>
            </div>

            {(ngoProfile.website || ngoProfile.instagram || ngoProfile.twitter) && (
              <div className="flex flex-wrap gap-2.5 lg:pt-4">
                {ngoProfile.website && (
                  <a
                    href={ngoProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-4 py-2.5 text-[0.86rem] font-semibold text-white shadow-[0_10px_26px_rgba(26,115,232,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1558B0]"
                  >
                    <Globe size={16} />
                    Website
                    <ExternalLink size={13} />
                  </a>
                )}
                {ngoProfile.instagram && (
                  <a
                    href={ngoProfile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#DADCE0] bg-white px-4 py-2.5 text-[0.84rem] font-semibold text-[#3C4043] transition-all hover:-translate-y-0.5 hover:border-[#C8D2E0]"
                  >
                    <Heart size={15} />
                    Instagram
                  </a>
                )}
                {ngoProfile.twitter && (
                  <a
                    href={ngoProfile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#DADCE0] bg-white px-4 py-2.5 text-[0.84rem] font-semibold text-[#3C4043] transition-all hover:-translate-y-0.5 hover:border-[#C8D2E0]"
                  >
                    <Share2 size={15} />
                    Social
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="mt-9 grid gap-4 border-y border-[#E1E7F0] py-5 sm:grid-cols-2 xl:grid-cols-4">
            {ngoProfile.location && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#80868B]">
                  <MapPin size={15} />
                  Location
                </p>
                <p className="text-[0.98rem] font-semibold text-[#202124]">{ngoProfile.location}</p>
              </div>
            )}
            {ngoProfile.orgSize && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#80868B]">
                  <Users size={15} />
                  Team size
                </p>
                <p className="text-[0.98rem] font-semibold text-[#202124]">{ngoProfile.orgSize}</p>
              </div>
            )}
            <div>
              <p className="mb-2 flex items-center gap-2 text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#80868B]">
                <Briefcase size={15} />
                Open roles
              </p>
              <p className="text-[0.98rem] font-semibold text-[#202124]">{ngoOpps.length} role{ngoOpps.length !== 1 ? 's' : ''}</p>
            </div>
            {ngoProfile.tags && ngoProfile.tags.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#80868B]">
                  <Target size={15} />
                  Focus
                </p>
                <div className="flex flex-wrap gap-2">
                  {ngoProfile.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.76rem] font-semibold text-[#1A73E8]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-5"
        >
          {ngoProfile.description && (
            <section className="grid gap-7 rounded-[30px] border border-[#E1E7F0] bg-white p-7 shadow-[0_18px_50px_rgba(60,64,67,0.055)] sm:p-9 lg:grid-cols-[210px_minmax(0,1fr)]">
              <div className="lg:border-r lg:border-[#EEF2F7] lg:pr-8">
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#5F6368]">About</p>
                <h2 className="mt-3 text-[1.55rem] font-normal tracking-[-0.04em] text-[#202124]">Who they are</h2>
              </div>
              <p className="max-w-3xl whitespace-pre-wrap text-[1.02rem] leading-9 text-[#3C4043]">
                {ngoProfile.description}
              </p>
            </section>
          )}

          {ngoProfile.mission && (
            <section className="grid gap-7 rounded-[30px] border border-[#D7E6FF] bg-white p-7 shadow-[0_18px_50px_rgba(26,115,232,0.05)] sm:p-9 lg:grid-cols-[210px_minmax(0,1fr)]">
              <div className="lg:border-r lg:border-[#E8F0FE] lg:pr-8">
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#1A73E8]">Mission</p>
                <h2 className="mt-3 text-[1.55rem] font-normal tracking-[-0.04em] text-[#202124]">Where they are going</h2>
              </div>
              <p className="max-w-3xl whitespace-pre-wrap text-[1.02rem] leading-9 text-[#3C4043]">
                {ngoProfile.mission}
              </p>
            </section>
          )}

          {(ngoProfile.communities || ngoProfile.helpNeeded) && (
            <section className="grid gap-8 rounded-[30px] border border-[#E1E7F0] bg-white p-7 shadow-[0_18px_50px_rgba(60,64,67,0.055)] sm:p-9 lg:grid-cols-[210px_minmax(0,1fr)]">
              <div className="lg:border-r lg:border-[#EEF2F7] lg:pr-8">
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#5F6368]">Impact</p>
                <h2 className="mt-3 text-[1.55rem] font-normal tracking-[-0.04em] text-[#202124]">How students fit in</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {ngoProfile.communities && (
                  <div className="rounded-[24px] bg-[#F8FAFD] p-5">
                    <h3 className="mb-3 text-[1.08rem] font-semibold tracking-[-0.025em] text-[#202124]">Communities served</h3>
                    <p className="whitespace-pre-wrap text-[0.98rem] leading-8 text-[#3C4043]">
                      {ngoProfile.communities}
                    </p>
                  </div>
                )}
                {ngoProfile.helpNeeded && (
                  <div className="rounded-[24px] bg-[#F8FAFD] p-5">
                    <h3 className="mb-3 text-[1.08rem] font-semibold tracking-[-0.025em] text-[#202124]">Support needed</h3>
                    <p className="whitespace-pre-wrap text-[0.98rem] leading-8 text-[#3C4043]">
                      {ngoProfile.helpNeeded}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {((ngoProfile.preferred_skills && ngoProfile.preferred_skills.length > 0) || (ngoProfile.project_types && ngoProfile.project_types.length > 0)) && (
            <section className="grid gap-8 rounded-[30px] border border-[#E1E7F0] bg-white p-7 shadow-[0_18px_50px_rgba(60,64,67,0.055)] sm:p-9 lg:grid-cols-[210px_minmax(0,1fr)]">
              <div className="lg:border-r lg:border-[#EEF2F7] lg:pr-8">
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#5F6368]">Student fit</p>
                <h2 className="mt-3 text-[1.55rem] font-normal tracking-[-0.04em] text-[#202124]">Good to know</h2>
              </div>
              <div className="grid gap-7 md:grid-cols-2">
                {ngoProfile.preferred_skills && ngoProfile.preferred_skills.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-[1.05rem] font-semibold tracking-[-0.025em] text-[#202124]">Preferred skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {ngoProfile.preferred_skills.map((skill, i) => (
                        <SkillChip key={i} skill={skill} variant="blue" />
                      ))}
                    </div>
                  </div>
                )}
                {ngoProfile.project_types && ngoProfile.project_types.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-[1.05rem] font-semibold tracking-[-0.025em] text-[#202124]">Project types</h3>
                    <div className="flex flex-wrap gap-2">
                      {ngoProfile.project_types.map((type, i) => (
                        <span key={i} className="rounded-full border border-[#DADCE0] bg-[#F8FAFD] px-3.5 py-2 text-[0.78rem] font-medium text-[#3C4043]">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-10"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[0.76rem] font-semibold uppercase tracking-[0.2em] text-[#1A73E8]">Student roles</p>
              <h2 className="text-[2.35rem] font-normal tracking-[-0.06em] text-[#202124]">
                Open opportunities
              </h2>
            </div>
            <p className="text-[0.92rem] font-medium text-[#5F6368]">
              {ngoOpps.length} role{ngoOpps.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {ngoOpps.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#DADCE0] bg-white p-12 text-center">
              <AlertCircle size={32} className="mx-auto mb-3 text-[#1A73E8]" />
              <p className="text-[0.9rem] text-[#5F6368]">
                This organization doesn't have any open opportunities right now.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
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
        </motion.section>
      </div>
    </main>
  )
}
