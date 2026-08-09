import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BookmarkCheck,
  ChevronRight,
  Clock,
  Globe,
  MapPin,
} from 'lucide-react'
import savedIllustration from '../assets/saved.png'
import savedSun from '../assets/saved sun.PNG'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchSavedOpportunities, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'

function savedCountLabel(count) {
  return `${count} saved opportunit${count === 1 ? 'y' : 'ies'}`
}

function previewText(text, limit = 150) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (!clean || clean.length <= limit) return clean
  const slice = clean.slice(0, limit)
  const breakAt = slice.lastIndexOf(' ')
  const end = breakAt > limit * 0.65 ? breakAt : limit
  return `${slice.slice(0, end).trim()}...`
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
    <main className="relative flex-1 overflow-y-auto bg-[#F5F7FB]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[radial-gradient(circle_at_18%_4%,rgba(26,115,232,0.08),transparent_34%),radial-gradient(circle_at_84%_0%,rgba(232,240,254,0.72),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(245,247,251,0))]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1480px] px-6 pb-8 pt-12 lg:px-10">
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

        <div className="relative z-20">
          <img
            src={savedSun}
            alt=""
            className="pointer-events-none absolute bottom-[calc(100%-204px)] right-2 z-0 h-auto w-[225px] max-w-[44vw] select-none sm:right-6 sm:w-[300px] lg:right-10 lg:w-[372px]"
          />
        <section className="relative z-10 rounded-[34px] border border-white/86 bg-white/72 p-6 shadow-[0_24px_70px_rgba(26,115,232,0.085),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
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
                  className="h-[462px] animate-pulse rounded-[32px] border border-white/70 bg-white/62 shadow-[0_12px_30px_rgba(26,115,232,0.05)]"
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
                    className="group relative flex h-[462px] flex-col overflow-hidden rounded-[32px] border border-[#DCE7F7]/72 bg-white/99 p-6 shadow-[0_22px_54px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.92)_inset] ring-1 ring-[#EEF4FF]/50 backdrop-blur-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[#C9DBF4]/82 hover:bg-white hover:shadow-[0_30px_68px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.94)_inset]"
                  >
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[#F6FAFF]/80" />
                    <div className="pointer-events-none absolute inset-0 bg-white/36" />

                    <div className="relative z-10 flex items-start gap-4">
                      <div className="shrink-0 rounded-2xl border border-white/85 bg-white/82 p-1 shadow-[0_12px_26px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.98)_inset]">
                        <GradientAvatar name={item.orgName || 'Organization'} size={50} radius="0.8rem" />
                      </div>
                      <div className="min-w-0 flex-1 pr-11">
                        <h3 className="line-clamp-2 text-[1.06rem] font-semibold leading-snug tracking-[-0.02em] text-[#202124] transition-colors group-hover:text-[#1A73E8]">
                          {item.title || 'Opportunity'}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="min-w-0 truncate text-[0.84rem] font-semibold text-[#5F6368]">
                            {item.orgName || 'Organization'}
                          </p>
                          {item.match !== null && item.match !== undefined && (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-[#D2E3FC] px-2.5 py-1 text-[0.68rem] font-semibold leading-none text-[#174EA6] shadow-[0_7px_14px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.86)_inset]">
                              {item.match}% Match
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnsave(item)}
                        disabled={removing === item.opportunityId}
                        className="absolute right-0 top-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D7E6FF]/70 bg-white/82 text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.055),0_1px_0_rgba(255,255,255,0.98)_inset] transition-colors hover:bg-white disabled:opacity-40"
                        aria-label="Unsave role"
                      >
                        <BookmarkCheck size={16} className="fill-[#1A73E8] text-[#1A73E8]" />
                      </button>
                    </div>

                    <div className="relative z-10 mt-5 rounded-[22px] border border-white/86 bg-white/88 p-3 shadow-[0_10px_24px_rgba(26,115,232,0.03),0_1px_0_rgba(255,255,255,0.98)_inset]">
                      <div className="mb-2 flex min-h-[24px] items-center">
                        {item.category && (
                          <span className="rounded-full bg-white/82 px-2.5 py-1 text-[0.7rem] font-semibold text-[#5F6368]">
                            {item.category}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-2 text-[0.73rem] font-semibold text-[#5F6368]">
                        {item.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                              <MapPin size={12} />
                            </span>
                            {item.location}
                          </span>
                        )}
                        {item.workMode && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                              <Globe size={12} />
                            </span>
                            {item.workMode}
                          </span>
                        )}
                        {item.weeklyHours && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F0FE]/88 text-[#1A73E8]">
                              <Clock size={12} />
                            </span>
                            {item.weeklyHours} hrs/week
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="relative z-10 mt-4 h-[126px] overflow-hidden rounded-[22px] bg-white/72 p-4 text-[0.92rem] leading-7 text-[#5F6368] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
                      {previewText(item.description || item.missionImpact || 'No description added yet.')}
                    </p>

                    <div className="relative z-10 mt-auto border-t border-[#E8F0FE]/70 pt-4">
                      <div className="mb-4 flex h-[34px] items-center gap-2 overflow-hidden">
                        {(item.skills || []).slice(0, 2).map(skill => (
                          <span
                            key={skill}
                            className="max-w-[46%] truncate rounded-full border border-[#D7E6FF]/70 bg-white/68 px-2.5 py-1.5 text-[0.74rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]"
                          >
                            {skill}
                          </span>
                        ))}
                        {(item.skills || []).length > 2 && (
                          <span className="rounded-full border border-[#D7E6FF]/70 bg-white/68 px-2.5 py-1.5 text-[0.74rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset]">
                            +{(item.skills || []).length - 2}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/opportunities?opportunity=${encodeURIComponent(item.opportunityId)}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8AB4F8]/55 bg-[linear-gradient(135deg,rgba(26,115,232,0.94),rgba(26,115,232,0.78))] px-4 py-3 text-[0.88rem] font-semibold text-white shadow-[0_14px_30px_rgba(26,115,232,0.22),0_1px_0_rgba(255,255,255,0.32)_inset] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#1765CC]"
                      >
                        View role
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
        </div>
      </div>
    </main>
  )
}
