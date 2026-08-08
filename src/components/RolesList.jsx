import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsUp, Layers3, UserCheck } from 'lucide-react'

export default function RolesList({ roles, selectedRoleId, onSelectRole, loading }) {
  const scrollerRef = useRef(null)
  const [expanded, setExpanded] = useState(false)

  function isFilled(role) {
    return (role.status || '').toLowerCase() === 'paused' || (role.stats?.accepted ?? 0) > 0 || (role.stats?.completed ?? 0) > 0
  }

  function scrollRoles(direction) {
    scrollerRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' })
  }

  function selectRole(roleId) {
    onSelectRole(roleId)
    setExpanded(false)
    window.setTimeout(() => {
      const activeCard = scrollerRef.current?.querySelector(`[data-role-id="${roleId}"]`)
      activeCard?.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }, 80)
  }

  function RoleCard({ role, index, expandedCard = false }) {
    const isActive = String(selectedRoleId) === String(role.id)
    const filled = isFilled(role)
    return (
      <motion.button
        key={role.id}
        data-role-id={role.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: Math.min(index * 0.025, 0.14) }}
        onClick={() => selectRole(role.id)}
        className={`group relative h-[92px] overflow-hidden rounded-[24px] border px-4 py-4 text-left transition-all hover:-translate-y-0.5 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.62),transparent_34%)] ring-1 ring-white/55 backdrop-blur-2xl ${
          expandedCard ? 'w-full' : 'w-[268px] shrink-0'
        } ${
          isActive
            ? 'border-transparent bg-[linear-gradient(135deg,rgba(232,240,254,0.98),rgba(210,227,252,0.84))] shadow-[0_14px_32px_rgba(26,115,232,0.16),0_1px_0_rgba(255,255,255,0.92)_inset,0_-1px_0_rgba(26,115,232,0.04)_inset]'
            : 'border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.66))] shadow-[0_10px_24px_rgba(32,33,36,0.05),0_1px_0_rgba(255,255,255,0.94)_inset] hover:border-white/90 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,255,255,0.78))] hover:shadow-[0_13px_30px_rgba(32,33,36,0.065),0_1px_0_rgba(255,255,255,0.97)_inset]'
        }`}
      >
        <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`line-clamp-1 text-[0.98rem] font-semibold leading-snug ${isActive ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
              {role.title}
            </p>
            <p className="mt-2 flex min-w-0 items-center gap-1.5 truncate text-[0.78rem] text-[#5F6368]">
              {filled && <UserCheck size={12} className="shrink-0 text-[#1A73E8]" />}
              <span className="truncate">{filled ? 'Someone works here' : 'Open role'}</span>
            </p>
          </div>
          <ChevronRight size={16} className={`mt-1 shrink-0 transition-transform ${isActive ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
        </div>
      </motion.button>
    )
  }

  return (
    <section
      className={`mx-auto mb-6 w-full max-w-[1360px] min-w-0 rounded-[30px] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(248,251,255,0.34))] p-4 shadow-[0_24px_64px_rgba(26,115,232,0.085),0_1px_0_rgba(255,255,255,0.96)_inset,0_-1px_0_rgba(26,115,232,0.025)_inset] backdrop-blur-2xl transition-all duration-300 ${
        expanded ? 'min-h-[300px]' : 'min-h-[128px]'
      }`}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_12px_26px_rgba(26,115,232,0.12),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-white/80">
            <Layers3 size={18} />
          </span>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Pick a role</p>
            <p className="mt-1 text-[0.84rem] text-[#5F6368]">
              {loading ? 'Loading roles...' : `${roles.length} role${roles.length !== 1 ? 's' : ''} in your workspace`}
            </p>
          </div>
        </div>

        {roles.length > 0 && !loading && (
          <div className="flex items-center gap-2">
            {!expanded && (
              <>
                <button
                  onClick={() => scrollRoles(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/78 text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_28px_rgba(26,115,232,0.14)]"
                  aria-label="Scroll roles left">
                  <ChevronLeft size={17} />
                </button>
                <button
                  onClick={() => scrollRoles(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/78 text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_28px_rgba(26,115,232,0.14)]"
                  aria-label="Scroll roles right">
                  <ChevronRight size={17} />
                </button>
              </>
            )}
            <button
              onClick={() => setExpanded(open => !open)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/80 bg-white/82 px-4 text-[0.78rem] font-semibold text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_28px_rgba(26,115,232,0.14)]">
              {expanded ? <ChevronsUp size={15} /> : <Layers3 size={15} />}
              {expanded ? 'Show less' : 'Show all'}
            </button>
          </div>
        )}
      </div>

      <div>
        {roles.length === 0 && !loading ? (
          <div className="flex min-h-[110px] w-full items-center justify-center rounded-[26px] border border-dashed border-[#D7E6FF] bg-white/60 px-5 text-center shadow-[0_10px_24px_rgba(26,115,232,0.05)]">
            <div>
              <p className="text-[0.9rem] font-semibold text-[#202124]">No opportunities yet</p>
              <p className="mt-1 text-[0.78rem] text-[#5F6368]">Create a role to start receiving applicants.</p>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center gap-3 pb-1">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="h-[92px] w-[252px] shrink-0 animate-pulse rounded-[24px] border border-white/70 bg-white/58 shadow-[0_8px_20px_rgba(26,115,232,0.04)]" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {expanded ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="grid max-h-[400px] gap-3 overflow-y-auto px-2 pb-4 pt-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {roles.map((role, i) => (
                      <RoleCard key={role.id} role={role} index={i} expandedCard />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white/58 to-transparent" />
                    <div ref={scrollerRef} className="flex max-w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-8 pl-16 pr-12 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {roles.map((role, i) => (
                        <div key={role.id} className="snap-start">
                          <RoleCard role={role} index={i} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </section>
  )
}
