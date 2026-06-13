import { motion } from 'framer-motion'

export default function RolesList({ roles, selectedRoleId, onSelectRole, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] flex flex-col sticky top-6 overflow-hidden"
      style={{ maxHeight: 'calc(100vh - 120px)', width: '280px' }}>

      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-[rgba(13,24,61,0.08)]">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#4B6382]">Opportunities</p>
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
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-[12px] font-semibold text-[#0D183D] mb-1">No opportunities yet</p>
            <p className="text-[11px] text-[#4B6382]">Create your first opportunity to start receiving applicants.</p>
          </div>
        ) : (
          <div className="px-3 py-3 space-y-2">
            {roles.map((role, i) => {
              const isActive = selectedRoleId === role.id
              return (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectRole(role.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                    isActive
                      ? 'border-[#FFB703] bg-[rgba(255,183,3,0.06)]'
                      : 'border-[rgba(13,24,61,0.08)] hover:bg-[rgba(13,24,61,0.02)]'
                  }`}>
                  <p className={`text-[13px] font-semibold mb-1.5 ${
                    isActive ? 'text-[#FFB703]' : 'text-[#0D183D]'
                  }`}>
                    {role.title}
                  </p>
                  <p className="text-[11px] text-[#4B6382]">
                    {role.stats.total} applicant{role.stats.total !== 1 ? 's' : ''}
                    {role.stats.new > 0 && ` • ${role.stats.new} new`}
                  </p>
                  {role.status && (
                    <p className="text-[10px] text-[#4B6382] mt-2 capitalize">{role.status}</p>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* All applicants option */}
      <div className="shrink-0 px-3 py-3 border-t border-[rgba(13,24,61,0.08)]">
        <button
          onClick={() => onSelectRole(null)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-[12px] font-semibold transition-colors ${
            selectedRoleId === null
              ? 'border-[#0D183D] bg-[#0D183D] text-white'
              : 'border-[rgba(13,24,61,0.08)] text-[#0D183D] hover:bg-[rgba(13,24,61,0.02)]'
          }`}>
          All Applicants
        </button>
      </div>
    </div>
  )
}
