import { motion } from 'framer-motion'
import { Briefcase, CheckCircle2, Users } from 'lucide-react'

export default function RolesList({ roles, selectedRoleId, onSelectRole, loading }) {
  function isFilled(role) {
    return (role.status || '').toLowerCase() === 'paused' || (role.stats?.accepted ?? 0) > 0
  }

  return (
    <section
      className="mx-auto mb-6 w-full max-w-[1360px] rounded-[30px] border bg-[#F8FAFF]/70 p-3 shadow-[0_14px_34px_rgba(60,64,67,0.04)]"
      style={{ borderColor: 'rgba(26,115,232,0.10)' }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex min-w-[190px] items-center gap-3 px-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
            <Briefcase size={19} strokeWidth={2.3} />
          </div>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Roles</p>
            <p className="text-[0.95rem] font-semibold text-[#202124]">Pick a queue</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex gap-2.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-[88px] min-w-[235px] animate-pulse rounded-[22px] bg-white/80" />
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
            <div className="flex gap-2.5 pb-1">
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
                    className={`min-h-[88px] min-w-[235px] rounded-[22px] border px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'border-[#BFD7FF] bg-white shadow-[0_12px_24px_rgba(26,115,232,0.12)]'
                        : filled
                          ? 'border-[#CDEBD8] bg-white/75 hover:bg-white'
                          : 'border-[#E5EEFB] bg-white/65 hover:border-[#D7E6FF] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`truncate text-[0.92rem] font-semibold ${
                          filled && !isActive ? 'text-[#188038]' : isActive ? 'text-[#1A73E8]' : 'text-[#202124]'
                        }`}>
                          {role.title}
                        </p>
                        <p className="mt-1 truncate text-[0.74rem] text-[#5F6368]">
                          {role.category || role.field || role.workMode || 'General opportunity'}
                        </p>
                      </div>
                      {filled && (
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#188038]" />
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[0.7rem] font-semibold">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                        isActive ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'bg-[#F1F4F9] text-[#5F6368]'
                      }`}>
                        <Users size={11} />
                        {stats.total ?? 0} applicants
                      </span>
                      {(stats.new ?? 0) > 0 && (
                        <span className="text-[#1A73E8]">{stats.new} new</span>
                      )}
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
