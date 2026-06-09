import { motion } from 'framer-motion'

const STATUS_COLORS = {
  draft: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', label: 'Draft' },
  open: { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE', label: 'Open' },
  applied: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D', label: 'Applied' },
  active: { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7', label: 'Active' },
}

const MOCK_ROLES = [
  { id: 1, title: 'Graphic Designer', status: 'applied' },
  { id: 2, title: 'Social Media Manager', status: 'open' },
  { id: 3, title: 'Event Coordinator', status: 'active' },
  { id: 4, title: 'Content Writer', status: 'draft' },
  { id: 5, title: 'Fundraising Lead', status: 'applied' },
  { id: 6, title: 'Tutor (Math)', status: 'active' },
  { id: 7, title: 'Web Developer', status: 'draft' },
  { id: 8, title: 'Community Outreach', status: 'open' },
  { id: 9, title: 'Data Analyst', status: 'applied' },
]

function HexagonRole({ role, index }) {
  const color = STATUS_COLORS[role.status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.4, type: 'spring', stiffness: 300 }}
      whileHover={{ scale: 1.08 }}
      className="flex flex-col items-center"
      style={{ width: '120px', height: '140px' }}
    >
      <div
        className="relative w-24 h-28 flex items-center justify-center transition-all duration-300"
        style={{
          background: color.bg,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          border: `1.5px solid ${color.border}`,
        }}
      >
        <div className="text-center px-2 flex flex-col items-center justify-center h-full">
          <p className="text-[11px] font-bold text-[#0D183D] leading-tight line-clamp-2">
            {role.title}
          </p>
          <div className="mt-1 px-2 py-0.5 text-[9px] font-semibold" style={{ color: color.text }}>
            {color.label}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function YourHiveMinimal({ roles = MOCK_ROLES }) {
  const counts = {
    draft: roles.filter(r => r.status === 'draft').length,
    open: roles.filter(r => r.status === 'open').length,
    applied: roles.filter(r => r.status === 'applied').length,
    active: roles.filter(r => r.status === 'active').length,
  }

  return (
    <div className="bg-white rounded-lg border border-[rgba(13,24,61,0.06)] p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#0D183D]">Your Hive</h2>
        <p className="text-[12px] text-[#6B7280] mt-0.5">Role postings by status</p>
      </div>

      <div className="flex gap-8 lg:gap-12">
        {/* Hive Grid */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-4 justify-start">
            {/* Row 1 */}
            <div className="flex gap-4">
              {roles.slice(0, 3).map((role, idx) => (
                <HexagonRole key={role.id} role={role} index={idx} />
              ))}
            </div>

            {/* Row 2 - offset */}
            <div className="flex gap-4" style={{ marginLeft: '40px' }}>
              {roles.slice(3, 6).map((role, idx) => (
                <HexagonRole key={role.id} role={role} index={idx + 3} />
              ))}
            </div>

            {/* Row 3 */}
            <div className="flex gap-4">
              {roles.slice(6, 9).map((role, idx) => (
                <HexagonRole key={role.id} role={role} index={idx + 6} />
              ))}
            </div>
          </div>
        </div>

        {/* Compact Legend */}
        <div className="lg:w-40 space-y-3">
          {Object.entries(counts).map(([status, count]) => {
            const color = STATUS_COLORS[status]
            return (
              <div key={status} className="flex items-center gap-2 text-[12px]">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color.bg, border: `1px solid ${color.border}` }}
                />
                <span className="font-medium text-[#0D183D]">{count}</span>
                <span className="text-[#6B7280]">{color.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
