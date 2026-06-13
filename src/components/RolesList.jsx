import { Search, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RolesList({ roles, selectedRoleId, onSelectRole, loading, q, onSearchChange }) {
  const filtered = roles.filter(r => r.title.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] flex flex-col sticky top-6 overflow-hidden"
      style={{ maxHeight: 'calc(100vh - 120px)', width: '280px' }}>

      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-[rgba(13,24,61,0.08)]">
        <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-3">Opportunities</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#F8F9FB] border border-[rgba(13,24,61,0.08)]">
          <Search size={13} className="text-[#4B6382] shrink-0"/>
          <input value={q} onChange={e => onSearchChange(e.target.value)} placeholder="Search roles…"
            className="flex-1 bg-transparent text-[12px] outline-none text-[#0D183D] placeholder-[#4B6382]/50"/>
        </div>
      </div>

      {/* Roles list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-3 space-y-2">
            {[0,1,2].map(i => (
              <div key={i} className="px-3 py-3 rounded-lg bg-[rgba(13,24,61,0.04)] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Search size={24} className="text-[#4B6382] mb-2 opacity-30"/>
            <p className="text-[12px] font-semibold text-[#0D183D]">No roles found</p>
          </div>
        ) : (
          <div className="px-3 py-3 space-y-2">
            {filtered.map((role, i) => {
              const isActive = selectedRoleId === role.id
              const total = role.stats.total
              const newCount = role.stats.new
              return (
                <motion.button key={role.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectRole(role.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FFB703] border-[#FFB703] shadow-[0_0_0_3px_rgba(255,183,3,0.2)]'
                      : 'bg-white border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB]'
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-[13px] font-bold truncate ${
                      isActive ? 'text-white' : 'text-[#0D183D]'
                    }`}>
                      {role.title}
                    </p>
                    {isActive && <ChevronDown size={14} className="text-white shrink-0 mt-0.5"/>}
                  </div>

                  {/* Status counts */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/30 text-white'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {total} applicant{total !== 1 ? 's' : ''}
                    </span>
                    {newCount > 0 && (
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${
                        isActive ? 'bg-white/50 text-white' : 'bg-amber-50 text-amber-700'
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
      <div className="shrink-0 px-3 py-2 border-t border-[rgba(13,24,61,0.08)]">
        <button onClick={() => onSelectRole(null)}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-[12px] font-semibold transition-all ${
            selectedRoleId === null
              ? 'bg-[#0D183D] text-white border-[#0D183D]'
              : 'text-[#4B6382] border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB]'
          }`}>
          All applicants ({roles.reduce((sum, r) => sum + r.stats.total, 0)})
        </button>
      </div>
    </div>
  )
}
