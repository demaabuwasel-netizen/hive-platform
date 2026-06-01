import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import MatchScoreBadge from '../components/MatchScoreBadge'
import EmptyState from '../components/EmptyState'
import { AvatarDisplay } from '../components/Avatar'
import { useApp } from '../context/AppContext'
import { fetchOpportunity } from '../services/opportunities'
import { computeMatch } from '../services/matching'

function StrengthBar({ strength }) {
  const widths = { high: 'w-full', medium: 'w-2/3', low: 'w-1/3' }
  const colors = { high: 'bg-emerald-400', medium: 'bg-blue-400', low: 'bg-orange-400' }
  const labels = { high: 'Strong', medium: 'Moderate', low: 'Partial' }

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${widths[strength]} ${colors[strength]}`} />
      </div>
      <span className={`text-xs font-medium ${
        strength === 'high' ? 'text-emerald-600' :
        strength === 'medium' ? 'text-blue-600' : 'text-orange-600'
      }`}>
        {labels[strength]}
      </span>
    </div>
  )
}

export default function MatchExplanation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useApp()
  const [interested, setInterested] = useState(false)
  const [opp, setOpp]       = useState(null)
  const [match, setMatch]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchOpportunity(id)
      .then(o => {
        if (!o) { setLoading(false); return }
        setOpp(o)
        if (profile) {
          setMatch(computeMatch(profile, o))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7E6]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white rounded-2xl"/>
            <div className="h-48 bg-white rounded-2xl"/>
          </div>
        </div>
      </div>
    )
  }

  if (!opp) {
    return (
      <div className="min-h-screen bg-[#FFF7E6]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10">
          <EmptyState emoji="🔎" title="Match not found"
            description="This opportunity doesn't exist or may have been removed."
            actionLabel="Back to matches" onAction={() => navigate('/matches')} />
        </div>
      </div>
    )
  }

  const score    = match?.score ?? null
  const reasons  = match?.reasons ?? []
  const headline = match?.headline ?? `${opp.orgName} — ${opp.title}`
  const questions = match?.suggestedQuestions ?? []
  const studentName = profile?.name || user?.name || 'You'
  const studentField = profile?.field || ''

  return (
    <div className="min-h-screen bg-[#FFF7E6]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/matches')}
          className="text-[#4B6382] text-sm flex items-center gap-1 mb-6 hover:text-navy-700 transition-colors">
          ← Back to matches
        </button>

        {/* Match header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
              <AvatarDisplay src={null} name={studentName} size="lg" />
              <div>
                <p className="font-bold text-[#0D183D]">{studentName}</p>
                <p className="text-sm text-[#4B6382]">{studentField}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 shrink-0">
              {score !== null ? <MatchScoreBadge score={score} /> : <span className="text-2xl">⟷</span>}
              <p className="text-xs text-navy-400">Compatibility score</p>
            </div>

            <div className="flex flex-col sm:flex-row-reverse items-center gap-3 flex-1">
              <AvatarDisplay src={null} name={opp.orgName} size="lg" />
              <div className="sm:text-right">
                <p className="font-bold text-[#0D183D]">{opp.orgName}</p>
                <p className="text-sm text-[#4B6382]">{opp.location}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-[rgba(13,24,61,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-honey-500">✦</span>
              <p className="font-semibold text-[#0D183D] text-sm">AI Match Summary</p>
            </div>
            <p className="text-navy-600 text-sm leading-relaxed">{headline}</p>
          </div>
        </motion.div>

        {/* Why this match */}
        {reasons.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="card mb-6">
            <h2 className="font-bold text-[#0D183D] mb-1">Why this match works</h2>
            <p className="text-xs text-navy-400 mb-5">
              Each factor reflects how the AI interpreted both profiles — not just surface-level keywords.
            </p>
            <div className="flex flex-col gap-5">
              {reasons.map((reason, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }} className="flex gap-4">
                  <div className={`w-1 rounded-full shrink-0 mt-1 ${
                    reason.strength === 'high' ? 'bg-emerald-400' :
                    reason.strength === 'medium' ? 'bg-blue-400' : 'bg-orange-400'
                  }`} />
                  <div className="flex-1">
                    <p className="font-semibold text-[#0D183D] text-sm mb-0.5">{reason.label}</p>
                    <StrengthBar strength={reason.strength} />
                    <p className="text-[#4B6382] text-sm mt-2 leading-relaxed">{reason.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggested interview questions */}
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }} className="card">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💬</span>
              <h2 className="font-bold text-[#0D183D]">Suggested interview questions</h2>
            </div>
            <p className="text-xs text-navy-400 mb-5">
              Tailored to this specific pairing to help the NGO verify the match.
            </p>
            <div className="flex flex-col gap-3">
              {questions.map((q, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="bg-cream-50 border border-[rgba(13,24,61,0.08)] rounded-2xl p-4 flex gap-3">
                  <span className="text-navy-300 font-bold text-sm shrink-0 mt-0.5">Q{i + 1}</span>
                  <p className="text-navy-700 text-sm leading-relaxed">{q}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 bg-honey-50 border border-honey-200 rounded-2xl p-4">
              <p className="text-xs text-honey-700 leading-relaxed">
                <strong>Note for NGOs:</strong> These questions are designed to verify the match — not to create extra pressure.
              </p>
            </div>
          </motion.div>
        )}

        {/* Express interest CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }} className="mt-6 text-center">
          {interested ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6">
              <p className="text-2xl mb-2">✓</p>
              <p className="font-semibold text-emerald-700 mb-1">Interest sent to {opp.orgName}</p>
              <p className="text-emerald-600 text-sm">They'll be in touch if there's a mutual fit.</p>
            </motion.div>
          ) : (
            <button onClick={() => setInterested(true)} className="btn-honey text-base px-8 py-3.5 w-full sm:w-auto">
              Express interest in this match →
            </button>
          )}
        </motion.div>

        {/* Profile snapshots */}
        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="card">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3">Student Summary</p>
            <p className="text-navy-600 text-sm leading-relaxed">
              {profile?.bio || profile?.goals || `${studentName} is studying ${studentField}.`}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(profile?.skills ?? []).slice(0, 4).map(s => {
                const name = typeof s === 'string' ? s : s.name
                return <span key={name} className="bg-navy-50 text-navy-700 text-xs px-2.5 py-1 rounded-full">{name}</span>
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="card">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3">Opportunity Summary</p>
            <p className="text-navy-600 text-sm leading-relaxed">
              {(opp.description || opp.missionImpact || '').slice(0, 200)}
              {(opp.description || opp.missionImpact || '').length > 200 ? '…' : ''}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {opp.category && (
                <span className="bg-[#FFF7E6] text-navy-600 text-xs px-2.5 py-1 rounded-full border border-cream-300">
                  {opp.category}
                </span>
              )}
              {(opp.skills ?? []).slice(0, 3).map(s => {
                const name = typeof s === 'string' ? s : s.name
                return <span key={name} className="bg-[#FFF7E6] text-navy-600 text-xs px-2.5 py-1 rounded-full border border-cream-300">{name}</span>
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
