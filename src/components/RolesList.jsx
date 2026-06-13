import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RolesList({ roles, selectedRoleId, onSelectRole, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] flex flex-col sticky top-6 overflow-hidden"
      style={{ maxHeight: 'calc(100vh - 120px)', width: '280px', boxShadow: '0 1px 3px rgba(13,24,61,0.06)' }}>

      {/* Header */}
      <div className="shrink-0 px-5 py-5 border-b border-[rgba(13,24,61,0.08)]"
        style={{ background: 'linear-gradient(135deg, rgba(13,24,61,0.02) 0%, rgba(255,183,3,0.02) 100%)' }}>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#4B6382] letter-spacing-0.5">
          📋 Opportunities
        </p>
      </div>

      {/* Roles list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-4 space-y-3">
            {[0,1,2].map(i => (
              <div key={i} className="h-20 rounded-xl bg-[rgba(13,24,61,0.04)] animate-pulse" />
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,183,3,0.08)' }}>
              <span className="text-xl">📂</span>
            </div>
            <p className="text-[12px] font-bold text-[#0D183D] mb-1">No opportunities yet</p>
            <p className="text-[11px] text-[#4B6382] leading-relaxed">Create opportunities in your dashboard to see applicants here.</p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-2">
            {roles.map((role, i) => {
              const isActive = selectedRoleId === role.id
              const total = role.stats.total
              const newCount = role.stats.new
              return (
                <motion.button key={role.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => onSelectRole(role.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#FFB703] border-[#FFB703] shadow-[0_4px_12px_rgba(255,183,3,0.2)]'
                      : 'bg-white border-[rgba(13,24,61,0.08)] hover:border-[rgba(13,24,61,0.12)] hover:shadow-[0_2px_8px_rgba(13,24,61,0.05)]'
                  }`}>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <p className={`text-[13px] font-bold leading-snug truncate ${
                      isActive ? 'text-white' : 'text-[#0D183D]'
                    }`}>
                      {role.title}
                    </p>
                    {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <ChevronDown size={16} className="text-white shrink-0 mt-0.5"/>
                    </motion.div>}
                  </div>

                  {/* Meta info */}
                  {(role.location || role.workMode) && (
                    <p className={`text-[10px] mb-2.5 truncate ${
                      isActive ? 'text-white/70' : 'text-[#4B6382]'
                    }`}>
                      {[role.location, role.workMode].filter(Boolean).join(' • ')}
                    </p>
                  )}

                  {/* Status counts */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/30 text-white'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {total}
                    </span>
                    {newCount > 0 && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        isActive ? 'bg-white/40 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {newCount} new
                      </span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Show all option */}
      <div className="shrink-0 px-4 py-3 border-t border-[rgba(13,24,61,0.08)]"
        style={{ background: 'rgba(13,24,61,0.01)' }}>
        <motion.button onClick={() => onSelectRole(null)}
          whileHover={{ scale: 1.01 }}
          className={`w-full text-left px-4 py-3 rounded-xl border text-[12px] font-bold transition-all ${
            selectedRoleId === null
              ? 'bg-[#0D183D] text-white border-[#0D183D] shadow-[0_4px_12px_rgba(13,24,61,0.15)]'
              : 'text-[#0D183D] border-[rgba(13,24,61,0.1)] hover:bg-[rgba(13,24,61,0.02)] hover:border-[rgba(13,24,61,0.15)]'
          }`}>
          👥 All ({roles.reduce((sum, r) => sum + r.stats.total, 0)})
        </motion.button>
      </div>
    </div>
  )
}
