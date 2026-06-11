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
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <Loader2 size={32} className="animate-spin text-[#FFB703]" />
      </div>
    )
  }

  if (!opp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] px-6">
        <h1 className="text-2xl font-bold text-[#0D183D] mb-2">Opportunity not found</h1>
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

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <button onClick={() => navigate('/opportunities')}
            className="flex items-center gap-2 text-[#4B6382] hover:text-[#0D183D] mb-6 transition-colors">
            <ArrowLeft size={18} />
            <span className="font-medium">Back to opportunities</span>
          </button>

          <div className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-8 mb-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-extrabold text-[#0D183D] mb-3">{opp.title}</h1>
                <div className="flex items-center gap-4">
                  <GradientAvatar name={opp.orgName} size={48} radius="0.75rem" />
                  <div>
                    <p className="text-lg font-bold text-[#0D183D]">{opp.orgName}</p>
                    {opp.category && <p className="text-sm text-[#4B6382]">{opp.category}</p>}
                  </div>
                </div>
              </div>
              <Link to={`/ngo-profile/${opp.ngoId}`}
                className="px-6 py-3 rounded-xl text-sm font-semibold border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-white transition-colors">
                View NGO Profile
              </Link>
            </div>

            {/* Key Details Grid */}
            <div className="grid md:grid-cols-4 gap-6 pt-6 border-t border-[rgba(13,24,61,0.08)]">
              {opp.location && (
                <div>
                  <p className="text-xs font-bold uppercase text-[#4B6382] mb-2 flex items-center gap-1">
                    <MapPin size={14} /> Location
                  </p>
                  <p className="text-sm font-semibold text-[#0D183D]">{opp.location}</p>
                </div>
              )}
              {opp.workMode && (
                <div>
                  <p className="text-xs font-bold uppercase text-[#4B6382] mb-2 flex items-center gap-1">
                    <Globe size={14} /> Work Mode
                  </p>
                  <p className="text-sm font-semibold text-[#0D183D]">{opp.workMode}</p>
                </div>
              )}
              {opp.weeklyHours && (
                <div>
                  <p className="text-xs font-bold uppercase text-[#4B6382] mb-2 flex items-center gap-1">
                    <Clock size={14} /> Hours/Week
                  </p>
                  <p className="text-sm font-semibold text-[#0D183D]">{opp.weeklyHours}</p>
                </div>
              )}
              {opp.duration && (
                <div>
                  <p className="text-xs font-bold uppercase text-[#4B6382] mb-2 flex items-center gap-1">
                    <Briefcase size={14} /> Duration
                  </p>
                  <p className="text-sm font-semibold text-[#0D183D]">{opp.duration}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-[rgba(13,24,61,0.08)] p-8 space-y-10">

          {/* Description */}
          {opp.description && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#0D183D] mb-4">About this role</h2>
              <p className="text-base leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {opp.description}
              </p>
            </div>
          )}

          {/* Mission Impact */}
          {opp.missionImpact && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#0D183D] mb-4">Mission Impact</h2>
              <p className="text-base leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                {opp.missionImpact}
              </p>
            </div>
          )}

          {/* Skills */}
          {opp.skills && opp.skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#0D183D] mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {opp.skills.map((s, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl text-sm font-medium bg-[#FFB703]/10 text-[#92610a]">
                    {typeof s === 'string' ? s : s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {opp.languages && opp.languages.length > 0 && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#0D183D] mb-4">Languages</h2>
              <p className="text-base text-[#4B6382]">{opp.languages.join(', ')}</p>
            </div>
          )}

          {/* CTA */}
          <div className="pt-6 border-t border-[rgba(13,24,61,0.08)]">
            <button onClick={() => setApplying(true)}
              className="w-full md:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#FFB703' }}>
              Apply for this opportunity →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Apply Modal */}
      {applying && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#0D183D] mb-4">Coming soon!</h2>
            <p className="text-[#4B6382] mb-6">Application form will be here soon.</p>
            <button onClick={() => setApplying(false)}
              className="w-full px-6 py-3 rounded-xl bg-[#FFB703] text-white font-semibold">
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
