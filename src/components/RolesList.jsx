import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight, ChevronsUp, Layers3 } from 'lucide-react'

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
        className={`group min-h-[84px] rounded-[24px] border px-4 py-4 text-left transition-all ${
          expandedCard ? 'w-full' : 'w-[224px] shrink-0'
        } ${
          isActive
            ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_14px_30px_rgba(26,115,232,0.13),0_1px_0_rgba(255,255,255,0.86)_inset]'
            : filled
              ? 'border-[#CDEBD8] bg-white hover:border-[#BFE8CF] hover:bg-[#FBFFFD] hover:shadow-[0_12px_28px_rgba(24,128,56,0.07)]'
              : 'border-white/75 bg-white hover:border-[#BFD7FF] hover:bg-[#FBFCFE] hover:shadow-[0_12px_28px_rgba(26,115,232,0.08)]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`line-clamp-1 text-[0.98rem] font-semibold leading-snug ${isActive ? 'text-[#1A73E8]' : filled ? 'text-[#188038]' : 'text-[#202124]'}`}>
              {role.title}
            </p>
            <p className="mt-1.5 truncate text-[0.78rem] text-[#5F6368]">
              {role.category || role.field || role.workMode || 'General opportunity'}
            </p>
          </div>
          {filled ? (
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#188038]" />
          ) : (
            <ChevronRight size={17} className={`mt-0.5 shrink-0 transition-transform ${isActive ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
          )}
        </div>
      </motion.button>
    )
  }

  return (
    <section
      className={`mx-auto mb-6 w-full max-w-[1360px] min-w-0 overflow-hidden rounded-[30px] border border-white/75 bg-white/68 p-4 shadow-[0_22px_60px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-2xl transition-all duration-300 ${
        expanded ? 'min-h-[300px]' : 'min-h-[128px]'
      }`}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/78 text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_24px_rgba(26,115,232,0.13)]"
                  aria-label="Scroll roles left">
                  <ChevronLeft size={17} />
                </button>
                <button
                  onClick={() => scrollRoles(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/78 text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_24px_rgba(26,115,232,0.13)]"
                  aria-label="Scroll roles right">
                  <ChevronRight size={17} />
                </button>
              </>
            )}
            <button
              onClick={() => setExpanded(open => !open)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/80 bg-white/86 px-4 text-[0.78rem] font-semibold text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_24px_rgba(26,115,232,0.13)]">
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
                    className="grid max-h-[400px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white/80 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white/85 to-transparent" />
                    <div ref={scrollerRef} className="flex max-w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
