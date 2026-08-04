import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Bookmark,
  Briefcase,
  ChevronRight,
  MapPin,
  Trash2,
} from 'lucide-react'
import savedIllustration from '../assets/saved.png'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchSavedOpportunities, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'

function savedCountLabel(count) {
  return `${count} saved opportunit${count === 1 ? 'y' : 'ies'}`
}

export default function Saved() {
  const { user, profile } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    fetchSavedOpportunities(user.id)
      .then(saved => {
        if (cancelled) return

        const withScores = saved.map(item => ({
          ...item,
          match: profile ? Math.round(computeMatch(profile, item).score) : null,
        }))

        setItems(withScores)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load saved opportunities. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id, profile, reloadKey])

  function retryLoad() {
    setLoading(true)
    setError(null)
    setReloadKey(key => key + 1)
  }

  async function handleUnsave(item) {
    setRemoving(item.opportunityId)
    try {
      await unsaveOpportunity(user.id, item.opportunityId)
      setItems(prev => prev.filter(i => i.opportunityId !== item.opportunityId))
    } catch {
      // Keep the card visible if the delete fails.
    } finally {
      setRemoving(null)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1480px] px-6 pb-8 pt-12 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
              Saved
            </h1>
            <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
              Keep your favorite roles in one clean workspace and come back when you are ready to apply.
            </p>
          </div>
        </motion.header>

        <section className="rounded-[32px] border border-[#D7E6FF] bg-white p-6 shadow-[0_14px_38px_rgba(17,24,39,0.035)]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[1.05rem] font-semibold text-[#202124]">Your saved list</h2>
              <p className="mt-1 text-[0.84rem] leading-6 text-[#5F6368]">
                {loading ? 'Loading saved opportunities...' : savedCountLabel(items.length)}
              </p>
            </div>
            {items.length > 0 && (
              <Link
                to="/opportunities"
                className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[0.84rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]"
              >
                Find more roles
                <ChevronRight size={15} />
              </Link>
            )}
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
              <button onClick={retryLoad} className="ml-auto font-semibold underline underline-offset-2">
                Retry
              </button>
            </div>
          )}

          {loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map(item => (
                <div
                  key={item}
                  className="h-[255px] animate-pulse rounded-[28px] border border-[#E5EEFB] bg-[#F8FBFF]"
                />
              ))}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex min-h-[380px] items-center justify-center rounded-[28px] border border-dashed border-[#D7E6FF] bg-[#F8FBFF] px-6 text-center"
            >
              <div>
                <img src={savedIllustration} alt="" className="mx-auto w-52 mb-5 select-none" />
                <h2 className="text-xl font-semibold text-[#202124]">Nothing saved yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-7 text-[#5F6368]">
                  Bookmark roles you love and come back when you're ready to apply.
                </p>
                <Link
                  to="/opportunities"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.86rem] font-semibold text-white shadow-[0_8px_22px_rgba(26,115,232,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1558C0]"
                >
                  Browse opportunities
                  <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.article
                    key={item.opportunityId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, scale: 0.97 }}
                    transition={{ delay: index * 0.04, duration: 0.25 }}
                    className="flex min-h-[255px] flex-col rounded-[28px] border border-[#E5EEFB] bg-[#FBFCFE] p-5 transition-all hover:-translate-y-0.5 hover:border-[#C8DCF8] hover:bg-white hover:shadow-[0_16px_34px_rgba(17,24,39,0.055)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <GradientAvatar name={item.orgName || 'Organization'} size={48} radius="0.9rem" />
                        <div className="min-w-0">
                          <p className="truncate text-[1rem] font-semibold text-[#202124]">
                            {item.title || 'Opportunity'}
                          </p>
                          <p className="mt-1 truncate text-[0.84rem] text-[#5F6368]">
                            {item.orgName || 'Organization'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnsave(item)}
                        disabled={removing === item.opportunityId}
                        className="shrink-0 rounded-full p-2 text-[#9AA0A6] transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                        aria-label="Remove from saved"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.74rem] font-semibold">
                      {item.match !== null && item.match !== undefined && (
                        <span className="rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[#1A73E8]">
                          {item.match}% fit
                        </span>
                      )}
                      {item.category && (
                        <span className="rounded-full bg-white px-3 py-1.5 text-[#5F6368] shadow-[0_4px_12px_rgba(17,24,39,0.025)]">
                          {item.category}
                        </span>
                      )}
                      {item.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[#5F6368] shadow-[0_4px_12px_rgba(17,24,39,0.025)]">
                          <MapPin size={12} />
                          {item.location}
                        </span>
                      )}
                    </div>

                    <p className="mt-4 line-clamp-3 flex-1 text-[0.84rem] leading-6 text-[#5F6368]">
                      {item.description || item.missionImpact || 'No description added yet.'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E5EEFB] pt-4">
                      {item.workMode && (
                        <span className="rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[0.72rem] font-semibold text-[#5F6368]">
                          {item.workMode}
                        </span>
                      )}
                      {item.weeklyHours && (
                        <span className="rounded-full border border-[#E5EEFB] bg-white px-2.5 py-1 text-[0.72rem] font-semibold text-[#5F6368]">
                          {item.weeklyHours} hrs/week
                        </span>
                      )}
                      {(item.skills || []).slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="rounded-full border border-[#D9E6FF] bg-white px-2.5 py-1 text-[0.72rem] font-semibold text-[#1A73E8]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/opportunities?opportunity=${encodeURIComponent(item.opportunityId)}`}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#1A73E8] py-2.5 text-[0.82rem] font-semibold text-white shadow-[0_8px_18px_rgba(26,115,232,0.18)] transition-all hover:bg-[#1558C0]"
                    >
                      Open role
                      <Briefcase size={15} />
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
