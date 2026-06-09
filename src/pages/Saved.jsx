import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Bookmark, MapPin, Trash2, AlertCircle, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchSavedOpportunities, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'

export default function Saved() {
  const { user, profile } = useApp()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [removing, setRemoving] = useState(null) // opportunityId being removed

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const saved = await fetchSavedOpportunities(user.id)
      // Attach match score if profile is available
      const withScores = saved.map(item => ({
        ...item,
        match: profile ? computeMatch(profile, item).score : null,
      }))
      setItems(withScores)
    } catch (err) {
      setError('Could not load saved opportunities. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile])

  useEffect(() => { load() }, [load])

  async function handleUnsave(item) {
    setRemoving(item.opportunityId)
    try {
      await unsaveOpportunity(user.id, item.opportunityId)
      setItems(prev => prev.filter(i => i.opportunityId !== item.opportunityId))
    } catch {
      // silently keep item in list if delete failed
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-7">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0D183D]">Saved</h1>
          <p className="text-[14px] text-[#4B6382] mt-1">
            {loading ? 'Loading…' : `${items.length} saved opportunit${items.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>
        {items.length > 0 && (
          <Link to="/opportunities"
            className="px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap"
            style={{ background: '#FFB703' }}>
            Browse more
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm text-red-600 bg-red-50 border border-red-200">
          <AlertCircle size={15} className="shrink-0"/>
          {error}
          <button onClick={load} className="ml-auto font-semibold underline underline-offset-2">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(13,24,61,0.06)]"/>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded-full bg-[rgba(13,24,61,0.06)]"/>
                  <div className="h-2.5 w-1/2 rounded-full bg-[rgba(13,24,61,0.04)]"/>
                </div>
              </div>
              <div className="h-2.5 w-1/4 rounded-full bg-[rgba(13,24,61,0.04)] mb-3"/>
              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-full bg-[rgba(13,24,61,0.04)]"/>
                <div className="h-2.5 w-4/5 rounded-full bg-[rgba(13,24,61,0.04)]"/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#FFB703]/10 flex items-center justify-center mb-4">
              <Bookmark size={28} className="text-[#FFB703]" />
            </div>
            <h2 className="text-lg font-bold text-[#0D183D] mb-2">No saved opportunities yet</h2>
            <p className="text-[14px] text-[#4B6382] text-center mb-6 max-w-sm">
              Browse opportunities and tap the bookmark icon to save them here.
            </p>
            <Link to="/opportunities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#FFB703' }}>
              Browse opportunities
              <ChevronRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Cards */}
      {!loading && items.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div key={item.opportunityId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16, scale: 0.97 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 flex flex-col gap-3 hover:shadow-[0_4px_24px_rgba(13,24,61,0.08)] hover:border-[rgba(13,24,61,0.12)] transition-all">

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <GradientAvatar name={item.orgName} size={40} radius="0.65rem"/>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#0D183D] leading-snug truncate">{item.orgName}</p>
                      <p className="text-[11px] text-[#4B6382] flex items-center gap-1 mt-0.5">
                        {item.category}
                        {item.location && <><span>·</span><MapPin size={9}/>{item.location}</>}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsave(item)}
                    disabled={removing === item.opportunityId}
                    className="p-1.5 rounded-lg text-[#4B6382] hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-40 shrink-0"
                    aria-label="Remove from saved">
                    <Trash2 size={13}/>
                  </button>
                </div>

                {/* Match + work mode */}
                <div className="flex items-center gap-2 flex-wrap">
                  {item.match !== null && (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      {item.match}% match
                    </span>
                  )}
                  {item.workMode && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F8F9FB] text-[#4B6382] border border-[rgba(13,24,61,0.08)]">
                      {item.workMode}
                    </span>
                  )}
                  {item.weeklyHours && (
                    <span className="text-[10px] text-[#4B6382]">{item.weeklyHours} hrs/wk</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-[12px] text-[#4B6382] leading-relaxed flex-1 line-clamp-3">
                  {item.description || item.missionImpact}
                </p>

                {/* Skills */}
                {item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map(s => (
                      <span key={s}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[rgba(13,24,61,0.08)]"
                        style={{ background: '#F8F9FB', color: '#4B6382' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Apply CTA */}
                <Link to="/opportunities"
                  className="flex items-center justify-center py-2 rounded-xl text-[12px] font-semibold text-white mt-1 transition-all hover:opacity-90"
                  style={{ background: '#0D183D' }}>
                  Apply now
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
