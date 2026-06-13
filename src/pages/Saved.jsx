import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Bookmark, MapPin, Trash2, AlertCircle, Search, Zap, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import DashboardEmptyState from '../components/DashboardEmptyState'
import { fetchSavedOpportunities, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'

// ─── Secondary content: how the saved-opportunities flow works ────────────────

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: 'Browse opportunities',
    desc: 'Filter by category, required skills, work mode, or location to find what fits you.',
  },
  {
    icon: Bookmark,
    title: 'Save the ones you like',
    desc: "Tap the bookmark icon on any listing. It's added here instantly, no account step needed.",
  },
  {
    icon: Zap,
    title: "Apply when you're ready",
    desc: 'Come back, compare your collection, and apply to any of them in one click.',
  },
]

function SavedGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.35 }}
      className="mt-5">
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-3 ml-0.5">
        How it works
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {HOW_IT_WORKS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + i * 0.07 }}
            className="bg-white rounded-2xl border border-[rgba(13,24,61,0.07)] p-4 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,183,3,0.09)', border: '1px solid rgba(255,183,3,0.18)' }}>
              <s.icon size={15} strokeWidth={1.8} style={{ color: '#0D183D' }}/>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[#0D183D] mb-0.5">{s.title}</p>
              <p className="text-[11px] text-[#4B6382] leading-relaxed">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick matches prompt */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.42 }}
        className="mt-3 rounded-2xl px-4 py-3 flex items-center justify-between gap-4"
        style={{ background: '#0D183D' }}>
        <div>
          <p className="text-[12px] font-bold text-white mb-0.5">Not sure where to start?</p>
          <p className="text-[11px] text-white/55 leading-relaxed">
            Check your AI matches — opportunities ranked by how well they fit your profile.
          </p>
        </div>
        <Link to="/matches"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-[#0D183D] bg-[#FFB703] hover:opacity-90 transition-all shrink-0 whitespace-nowrap">
          View matches <ChevronRight size={12}/>
        </Link>
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Saved() {
  const { user, profile } = useApp()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [removing, setRemoving] = useState(null)

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const saved = await fetchSavedOpportunities(user.id)
      const withScores = saved.map(item => ({
        ...item,
        match: profile ? computeMatch(profile, item).score : null,
      }))
      setItems(withScores)
    } catch {
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
      // silently keep item on failure
    } finally {
      setRemoving(null)
    }
  }

  const isEmpty = !loading && !error && items.length === 0

  return (
    <div className="max-w-[1100px] mx-auto px-10 py-12">

      {/* ── Page header ── */}
      <div className={isEmpty ? 'mb-4' : 'flex items-center justify-between mb-6'}>
        <div>
          <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Saved</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">
            {loading
              ? 'Loading…'
              : isEmpty
              ? 'Build your opportunity hive — save roles you want to revisit'
              : `${items.length} saved opportunit${items.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>
        {/* Only show Browse button when there is data — empty state has its own CTA */}
        {!isEmpty && !loading && (
          <Link to="/opportunities"
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#FFB703' }}>
            Browse opportunities
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
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(13,24,61,0.06)]"/>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded-full bg-[rgba(13,24,61,0.06)]"/>
                  <div className="h-2.5 w-1/2 rounded-full bg-[rgba(13,24,61,0.04)]"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-full bg-[rgba(13,24,61,0.04)]"/>
                <div className="h-2.5 w-4/5 rounded-full bg-[rgba(13,24,61,0.04)]"/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state + secondary guide ── */}
      {isEmpty && (
        <>
          <DashboardEmptyState
            icon={Bookmark}
            title="Your hive is still empty"
            description="Save opportunities you want to return to later. Build your collection and apply when the timing is right for you."
            cta={{ label: 'Browse opportunities', href: '/opportunities' }}
            tip="Your saved opportunities stay here until you remove them — no time pressure."
          />
          <SavedGuide />
        </>
      )}

      {/* ── Saved cards ── */}
      {!loading && items.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div key={item.opportunityId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16, scale: 0.97 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 flex flex-col gap-3 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] transition-all">

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

                <p className="text-[12px] text-[#4B6382] leading-relaxed flex-1 line-clamp-3">
                  {item.description || item.missionImpact}
                </p>

                {item.skills?.length > 0 && (
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
