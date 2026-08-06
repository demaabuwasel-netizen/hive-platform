import { motion } from 'framer-motion'
import { CheckCircle2, Users } from 'lucide-react'

export default function RolesList({ roles, selectedRoleId, onSelectRole, loading }) {
  function isFilled(role) {
    return (role.status || '').toLowerCase() === 'paused' || (role.stats?.accepted ?? 0) > 0 || (role.stats?.completed ?? 0) > 0
  }

  return (
    <section
      className="mx-auto mb-6 w-full max-w-[1360px] -translate-y-2 rounded-[30px] border bg-white/90 p-3 shadow-[0_14px_34px_rgba(60,64,67,0.04)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Wraps to new lines instead of scrolling sideways — every role stays
            visible without needing a left/right scroll on the page. */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="shrink-0 pl-2 pr-1 text-[0.82rem] font-semibold text-[#5F6368]">Pick a role</p>
              {[0, 1, 2].map(i => (
                <div key={i} className="h-[64px] w-[168px] animate-pulse rounded-[18px] border border-[#E5EEFB] bg-white/80" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="flex min-h-[76px] items-center justify-center rounded-[22px] border border-dashed border-[#D7E6FF] bg-white/70 px-5 text-center">
              <div>
                <p className="text-[0.9rem] font-semibold text-[#202124]">No opportunities yet</p>
                <p className="mt-1 text-[0.78rem] text-[#5F6368]">Create a role to start receiving applicants.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p className="shrink-0 pl-2 pr-1 text-[0.82rem] font-semibold text-[#5F6368]">Pick a role</p>
              {roles.map((role, i) => {
                const isActive = String(selectedRoleId) === String(role.id)
                const filled = isFilled(role)
                const stats = role.stats ?? {}

                return (
                  <motion.button
                    key={role.id}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => onSelectRole(role.id)}
                    className={`w-[168px] shrink-0 rounded-[18px] border px-3.5 py-2.5 text-left transition-all ${
                      isActive
                        ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_12px_24px_rgba(26,115,232,0.12)]'
                        : filled
                          ? 'border-[#CDEBD8] bg-white/75 hover:bg-white'
                          : 'border-[#E5EEFB] bg-white/65 hover:border-[#D7E6FF] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <p className={`truncate text-[0.82rem] font-semibold ${
                        filled && !isActive ? 'text-[#188038]' : 'text-[#202124]'
                      }`}>
                        {role.title}
                      </p>
                      {filled && (
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#188038]" />
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      <p className="min-w-0 flex-1 truncate text-[0.68rem] text-[#5F6368]">
                        {role.category || role.field || role.workMode || 'General opportunity'}
                      </p>
                      <span className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-1.5 text-[0.62rem] font-semibold ${
                        isActive ? 'bg-white text-[#1A73E8]' : 'bg-[#F1F4F9] text-[#5F6368]'
                      }`}>
                        <Users size={9} />
                        {stats.total ?? 0}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
