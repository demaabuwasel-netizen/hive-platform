import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Globe, Briefcase, CheckCircle2, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fetchOpportunity } from '../services/opportunities'
import GradientAvatar from '../components/GradientAvatar'

export default function OpportunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const [opp, setOpp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchOpportunity(id)
      .then(data => setOpp(data))
      .catch(err => console.error('Error loading opportunity:', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <Loader2 size={32} className="animate-spin text-[#1A73E8]" />
      </div>
    )
  }

  if (!opp) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FB] px-6">
        <h1 className="mb-2 text-2xl font-semibold text-[#202124]">Opportunity not found</h1>
        <button onClick={() => navigate('/opportunities')}
          className="font-semibold text-[#1A73E8] hover:text-[#1558B0]">
          ← Back to opportunities
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <button onClick={() => navigate('/opportunities')}
            className="mb-6 flex items-center gap-2 text-[#5F6368] transition-colors hover:text-[#202124]">
            <ArrowLeft size={18} />
            <span className="font-semibold">Back to opportunities</span>
          </button>

          <div className="mb-8 overflow-hidden rounded-[24px] border border-[#DDE3EC] bg-white p-7 shadow-[0_10px_32px_rgba(15,23,42,0.055)] sm:p-9">
            <div className="mb-7 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#1A73E8]">
                  Opportunity details
                </p>
                <h1 className="mb-4 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-tight tracking-[-0.05em] text-[#202124]">{opp.title}</h1>
                <div className="inline-flex items-center gap-3 rounded-[16px] border border-[#E6EAF0] bg-[#FAFBFD] px-3 py-2">
                  <GradientAvatar name={opp.orgName} size={48} radius="0.75rem" />
                  <div>
                    <p className="text-[1rem] font-semibold text-[#202124]">{opp.orgName}</p>
                    {opp.category && <p className="text-[0.84rem] text-[#5F6368]">{opp.category}</p>}
                  </div>
                </div>
              </div>
              <Link to={`/ngo-profile/${opp.ngoId}`}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#D7E6FF] bg-white px-5 py-3 text-[0.86rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]">
                View NGO Profile
              </Link>
            </div>

            {/* Key Details Grid */}
            <div className="grid gap-3 border-t border-[#E8EBF0] pt-6 md:grid-cols-4">
              {opp.location && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-[#FAFBFD] p-4">
                  <p className="mb-2 flex items-center gap-1 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">
                    <MapPin size={14} /> Location
                  </p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.location}</p>
                </div>
              )}
              {opp.workMode && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-[#FAFBFD] p-4">
                  <p className="mb-2 flex items-center gap-1 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">
                    <Globe size={14} /> Work Mode
                  </p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.workMode}</p>
                </div>
              )}
              {opp.weeklyHours && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-[#FAFBFD] p-4">
                  <p className="mb-2 flex items-center gap-1 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">
                    <Clock size={14} /> Hours/Week
                  </p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.weeklyHours}</p>
                </div>
              )}
              {opp.duration && (
                <div className="rounded-[16px] border border-[#E6EAF0] bg-[#FAFBFD] p-4">
                  <p className="mb-2 flex items-center gap-1 text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#9AA0A6]">
                    <Briefcase size={14} /> Duration
                  </p>
                  <p className="text-[0.88rem] font-semibold text-[#202124]">{opp.duration}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5 rounded-[24px] border border-[#DDE3EC] bg-white p-7 shadow-[0_10px_32px_rgba(15,23,42,0.055)] sm:p-8">

          {/* Description */}
          {opp.description && (
            <div className="relative overflow-hidden rounded-[20px] border border-[#E1E7F0] bg-[#FAFBFD] p-7">
              <span className="absolute inset-y-7 left-0 w-1 rounded-r-full bg-[#1A73E8]" />
              <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Role overview</p>
              <h2 className="mb-4 text-[1.15rem] font-semibold text-[#202124]">About this role</h2>
              <p className="whitespace-pre-wrap text-[0.94rem] leading-7 text-[#5F6368]">
                {opp.description}
              </p>
            </div>
          )}

          {/* Mission Impact */}
          {opp.missionImpact && (
            <div className="relative overflow-hidden rounded-[20px] border border-[#D7E6FF] bg-[#F8FBFF] p-7">
              <p className="relative mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Impact</p>
              <h2 className="relative mb-4 text-[1.15rem] font-semibold text-[#202124]">Mission Impact</h2>
              <p className="whitespace-pre-wrap text-[0.94rem] leading-7 text-[#5F6368]">
                {opp.missionImpact}
              </p>
            </div>
          )}

          {/* Skills */}
          {opp.skills && opp.skills.length > 0 && (
            <div className="rounded-[20px] border border-[#E1E7F0] bg-[#FAFBFD] p-7">
              <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">What helps here</p>
              <h2 className="mb-5 text-[1.15rem] font-semibold text-[#202124]">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {opp.skills.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-full border border-[#D7E6FF] bg-white px-4 py-2">
                    <span className="text-[0.82rem] font-semibold text-[#1A73E8]">{s.name}</span>
                    {s.level && (
                      <span className="rounded-full bg-[#E8F0FE] px-2 py-0.5 text-xs font-medium text-[#1A73E8]">
                        {s.level}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {opp.languages && opp.languages.length > 0 && (
            <div className="rounded-[20px] border border-[#E1E7F0] bg-[#FAFBFD] p-7">
              <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Communication</p>
              <h2 className="mb-4 text-[1.15rem] font-semibold text-[#202124]">Languages</h2>
              <p className="text-[0.94rem] text-[#5F6368]">{opp.languages.join(', ')}</p>
            </div>
          )}

          {/* CTA */}
          <div className="border-t border-[#E8EBF0] pt-6">
            <button onClick={() => setApplying(true)}
              className="w-full rounded-full bg-[#1A73E8] px-8 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-opacity hover:opacity-95 md:w-auto">
              Apply for this opportunity →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Apply Modal */}
      {applying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#E3E7EE] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <h2 className="mb-4 text-2xl font-semibold text-[#202124]">Coming soon!</h2>
            <p className="mb-6 text-[#5F6368]">Application form will be here soon.</p>
            <button onClick={() => setApplying(false)}
              className="w-full rounded-full bg-[#1A73E8] px-6 py-3 font-semibold text-white">
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
