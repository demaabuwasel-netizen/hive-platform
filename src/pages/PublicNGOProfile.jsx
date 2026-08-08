import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Globe, Loader2, ExternalLink, Heart,
  Share2, AlertCircle, MapPin, Users, Briefcase, Target
} from 'lucide-react'
import { loadNgoProfile } from '../services/storage'
import { fetchNgoOpportunities } from '../services/opportunities'
import { computeMatch } from '../services/matching'
import { useApp } from '../context/AppContext'
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
    default: 'bg-white/72 text-[#1A73E8] border border-[#D7E6FF]/80 shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]',
    blue: 'bg-white/72 text-[#1A73E8] border border-[#D7E6FF]/80 shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]',
    green: 'bg-white/68 text-[#3C4043] border border-white/80 shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium ${styles[variant]}`}>
      {level ? `${name} · ${level}` : name}
    </span>
  )
}

function rolePreview(text, limit = 150) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (!clean || clean.length <= limit) return clean
  const slice = clean.slice(0, limit)
  const breakAt = slice.lastIndexOf(' ')
  const end = breakAt > limit * 0.65 ? breakAt : limit
  return `${slice.slice(0, end).trim()}...`
}

// Opportunity card for NGO opportunities
function NGOOpportunityCard({ opp, onViewDetails }) {
  const handleSaveClick = () => {
    // Save functionality can be added here
  }
  const skills = Array.isArray(opp.skills) ? opp.skills : []
  const visibleSkills = skills.slice(0, 2)
  const extraSkillCount = Math.max(skills.length - visibleSkills.length, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex h-[462px] cursor-pointer flex-col overflow-hidden rounded-[32px] border border-[#DCE7F7]/72 bg-white/98 p-6 shadow-[0_22px_54px_rgba(26,115,232,0.065),0_1px_0_rgba(255,255,255,0.88)_inset] ring-1 ring-[#EEF4FF]/55 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[#C9DBF4]/82 hover:bg-white hover:shadow-[0_30px_68px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.92)_inset]"
      onClick={() => onViewDetails(opp)}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[#F6FAFF]/80" />
      <div className="pointer-events-none absolute inset-0 bg-white/18" />

      <div className="relative z-10 flex items-start">
        <div className="min-w-0 flex-1 pr-11">
          <h3 className="line-clamp-2 text-[1.06rem] font-semibold leading-snug tracking-[-0.02em] text-[#202124] transition-colors group-hover:text-[#1A73E8]">
            {opp.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-[0.84rem] font-semibold text-[#5F6368]">
              {opp.category || opp.field || 'Open role'}
            </p>
            {opp.match !== null && opp.match !== undefined && (
              <span
                className="inline-flex shrink-0 items-center rounded-full bg-[#D2E3FC] px-2.5 py-1 text-[0.68rem] font-semibold leading-none text-[#174EA6] shadow-[0_7px_14px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.86)_inset]"
                aria-label={`${opp.match}% match`}
              >
                {opp.match}% Match
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSaveClick()
          }}
          className="absolute right-0 top-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D7E6FF]/70 bg-white/82 text-[#5F6368] shadow-[0_8px_18px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.98)_inset] transition-colors hover:bg-white hover:text-[#1A73E8]"
          aria-label="Save opportunity"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
          </svg>
        </button>
      </div>

      <div className="relative z-10 mt-5 rounded-[22px] border border-white/80 bg-white/48 p-3 shadow-[0_10px_24px_rgba(26,115,232,0.04),0_1px_0_rgba(255,255,255,0.95)_inset]">
        <div className="mb-2 flex min-h-[24px] items-center">
          <span className="rounded-full bg-white/58 px-2.5 py-1 text-[0.7rem] font-semibold text-[#5F6368]">
            {opp.category || opp.field || 'Student role'}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-2 text-[0.73rem] font-semibold text-[#5F6368]">
          {opp.location && (
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                <MapPin size={12} />
              </span>
              {opp.location}
            </span>
          )}
          {opp.workMode && (
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                <Globe size={12} />
              </span>
              {opp.workMode}
            </span>
          )}
          {opp.weeklyHours && (
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                <Briefcase size={12} />
              </span>
              {opp.weeklyHours} hrs/week
            </span>
          )}
        </div>
      </div>

      {opp.description && (
        <p className="relative z-10 mt-4 h-[126px] overflow-hidden rounded-[22px] bg-white/34 p-4 text-[0.92rem] leading-7 text-[#5F6368] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
          {rolePreview(opp.description)}
        </p>
      )}

      <div className="relative z-10 mt-auto border-t border-[#E8F0FE]/70 pt-4">
        <div className="mb-4 flex h-[34px] items-center gap-2 overflow-hidden">
          {visibleSkills.map((s, idx) => (
            <span key={idx} className="max-w-[46%] truncate rounded-full border border-[#D7E6FF]/70 bg-white/68 px-2.5 py-1.5 text-[0.74rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
              {parseSkill(s).level ? `${parseSkill(s).name} · ${parseSkill(s).level}` : parseSkill(s).name}
            </span>
          ))}
          {extraSkillCount > 0 && (
              <span className="rounded-full border border-[#D7E6FF]/70 bg-white/68 px-2.5 py-1.5 text-[0.74rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
                +{extraSkillCount}
              </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(opp)
          }}
          className="w-full rounded-full border border-[#8AB4F8]/55 bg-[linear-gradient(135deg,rgba(26,115,232,0.94),rgba(26,115,232,0.78))] px-5 py-3 text-[0.84rem] font-semibold text-white shadow-[0_14px_30px_rgba(26,115,232,0.22),0_1px_0_rgba(255,255,255,0.32)_inset] backdrop-blur-xl transition-all hover:-translate-y-px hover:bg-[#1558B0] hover:shadow-[0_16px_34px_rgba(26,115,232,0.25),0_1px_0_rgba(255,255,255,0.34)_inset]"
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
  const { profile: studentProfile } = useApp()
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
      .then(([loadedNgoProfile, opps]) => {
        setNgoProfile(loadedNgoProfile)
        const cards = opps.map((opp) => ({
          ...opp,
          id: opp.id,
          match: studentProfile ? computeMatch(studentProfile, opp).score : null,
        }))
        setNgoOpps(cards)
      })
      .catch((err) => {
        console.error('Error loading NGO profile:', err)
      })
      .finally(() => setLoading(false))
  }, [ngoId, studentProfile])


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
    <main className="relative flex-1 overflow-y-auto bg-[#F5F7FB]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.11),transparent_43%),radial-gradient(circle_at_88%_4%,rgba(255,255,255,0.96),transparent_22%),radial-gradient(circle_at_82%_8%,rgba(26,115,232,0.10),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.68),rgba(245,247,251,0))]" />
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
          className="relative mb-10 overflow-hidden rounded-[36px] border border-white/85 bg-white/84 p-6 shadow-[0_24px_70px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.96)_inset] backdrop-blur-2xl sm:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_82%_0%,rgba(26,115,232,0.12),transparent_42%),linear-gradient(180deg,rgba(232,240,254,0.42),transparent)]" />
          <div className="relative">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-[24px] border border-white/85 bg-white/76 p-1.5 shadow-[0_14px_34px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.94)_inset] backdrop-blur-2xl">
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/76 px-4 py-2.5 text-[0.84rem] font-semibold text-[#3C4043] shadow-[0_8px_18px_rgba(26,115,232,0.06)] transition-all hover:-translate-y-0.5 hover:bg-white"
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/76 px-4 py-2.5 text-[0.84rem] font-semibold text-[#3C4043] shadow-[0_8px_18px_rgba(26,115,232,0.06)] transition-all hover:-translate-y-0.5 hover:bg-white"
                  >
                    <Share2 size={15} />
                    Social
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="mt-9 grid gap-4 border-y border-white/75 py-5 sm:grid-cols-2 xl:grid-cols-4">
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
                    <span key={i} className="rounded-full border border-[#D7E6FF]/80 bg-white/72 px-3 py-1.5 text-[0.76rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-5"
        >
          {ngoProfile.description && (
            <section className="grid gap-7 rounded-[30px] border border-white/85 bg-white/86 p-7 shadow-[0_18px_50px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.96)_inset] backdrop-blur-2xl sm:p-9 lg:grid-cols-[210px_minmax(0,1fr)]">
              <div className="lg:border-r lg:border-white/75 lg:pr-8">
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#5F6368]">About</p>
                <h2 className="mt-3 text-[1.55rem] font-normal tracking-[-0.04em] text-[#202124]">Who they are</h2>
              </div>
              <p className="max-w-3xl whitespace-pre-wrap text-[1.02rem] leading-9 text-[#3C4043]">
                {ngoProfile.description}
              </p>
            </section>
          )}

          {ngoProfile.mission && (
            <section className="grid gap-7 rounded-[30px] border border-white/85 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(232,240,254,0.48))] p-7 shadow-[0_18px_50px_rgba(26,115,232,0.075),0_1px_0_rgba(255,255,255,0.96)_inset] backdrop-blur-2xl sm:p-9 lg:grid-cols-[210px_minmax(0,1fr)]">
              <div className="lg:border-r lg:border-white/75 lg:pr-8">
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#1A73E8]">Mission</p>
                <h2 className="mt-3 text-[1.55rem] font-normal tracking-[-0.04em] text-[#202124]">Where they are going</h2>
              </div>
              <p className="max-w-3xl whitespace-pre-wrap text-[1.02rem] leading-9 text-[#3C4043]">
                {ngoProfile.mission}
              </p>
            </section>
          )}

          {(ngoProfile.communities || ngoProfile.helpNeeded) && (
            <section className="grid gap-8 rounded-[30px] border border-white/85 bg-white/86 p-7 shadow-[0_18px_50px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.96)_inset] backdrop-blur-2xl sm:p-9 lg:grid-cols-[210px_minmax(0,1fr)]">
              <div className="lg:border-r lg:border-white/75 lg:pr-8">
                <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#5F6368]">Impact</p>
                <h2 className="mt-3 text-[1.55rem] font-normal tracking-[-0.04em] text-[#202124]">How students fit in</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {ngoProfile.communities && (
                  <div className="rounded-[24px] border border-white/80 bg-white/68 p-5 shadow-[0_10px_24px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.92)_inset]">
                    <h3 className="mb-3 text-[1.08rem] font-semibold tracking-[-0.025em] text-[#202124]">Communities served</h3>
                    <p className="whitespace-pre-wrap text-[0.98rem] leading-8 text-[#3C4043]">
                      {ngoProfile.communities}
                    </p>
                  </div>
                )}
                {ngoProfile.helpNeeded && (
                  <div className="rounded-[24px] border border-white/80 bg-white/68 p-5 shadow-[0_10px_24px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.92)_inset]">
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
            <section className="grid gap-8 rounded-[30px] border border-white/85 bg-white/86 p-7 shadow-[0_18px_50px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.96)_inset] backdrop-blur-2xl sm:p-9 lg:grid-cols-[210px_minmax(0,1fr)]">
              <div className="lg:border-r lg:border-white/75 lg:pr-8">
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
                        <span key={i} className="rounded-full border border-white/80 bg-white/68 px-3.5 py-2 text-[0.78rem] font-medium text-[#3C4043] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
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
            <div className="rounded-[24px] border border-dashed border-white/85 bg-white/82 p-12 text-center shadow-[0_14px_34px_rgba(26,115,232,0.06),0_1px_0_rgba(255,255,255,0.96)_inset] backdrop-blur-2xl">
              <AlertCircle size={32} className="mx-auto mb-3 text-[#1A73E8]" />
              <p className="text-[0.9rem] text-[#5F6368]">
                This organization doesn't have any open opportunities right now.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
