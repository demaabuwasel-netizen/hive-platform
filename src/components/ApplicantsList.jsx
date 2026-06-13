import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users } from 'lucide-react'
import GradientAvatar from './GradientAvatar'
import { parseSkillString } from '../services/opportunities'

function skillDisplay(s) {
  const parsed = parseSkillString(s)
  return parsed.level ? `${parsed.name} [${parsed.level}]` : parsed.name
}

function toUiStatus(dbStatus) {
  if (dbStatus === 'submitted' || dbStatus === 'under_review') return 'new'
  return dbStatus ?? 'new'
}

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-indigo-600',  bg: 'bg-indigo-50'   },
  shortlisted: { label: 'Shortlisted', color: 'text-[#D99E00]',   bg: 'bg-amber-50'    },
  interview:   { label: 'Interview',   color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  accepted:    { label: 'Accepted',    color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  rejected:    { label: 'Rejected',    color: 'text-red-500',     bg: 'bg-red-50'      },
}

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-indigo-600',  bg: 'bg-indigo-50'   },
  shortlisted: { label: 'Shortlisted', color: 'text-[#D99E00]',   bg: 'bg-amber-50'    },
  interview:   { label: 'Interview',   color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  accepted:    { label: 'Accepted',    color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  rejected:    { label: 'Rejected',    color: 'text-red-500',     bg: 'bg-red-50'      },
}

export default function ApplicantsList({ applicants, selectedId, onSelectApplicant, statuses, loading, searchQuery, selectedRoleTitle }) {
  const [localQ, setLocalQ] = useState('')
  const [filter, setFilter] = useState('all')

  const q = searchQuery || localQ
  const visible = applicants.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(q.toLowerCase()) ||
                       a.field.toLowerCase().includes(q.toLowerCase())
    const matchFilter = filter === 'all' || toUiStatus(a.status) === filter
    return matchSearch && matchFilter
  })

  const statusCounts = {
    all:         applicants.length,
    new:         applicants.filter(a => toUiStatus(a.status) === 'new').length,
    shortlisted: applicants.filter(a => toUiStatus(a.status) === 'shortlisted').length,
    interview:   applicants.filter(a => toUiStatus(a.status) === 'interview').length,
    rejected:    applicants.filter(a => toUiStatus(a.status) === 'rejected').length,
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Role heading */}
      {selectedRoleTitle && (
        <h2 className="text-[15px] font-semibold text-[#0D183D] px-1">
          Applicants for {selectedRoleTitle}
        </h2>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[rgba(13,24,61,0.08)]">
        <Search size={13} className="text-[#4B6382] shrink-0"/>
        <input value={q} onChange={e => setLocalQ(e.target.value)} placeholder="Search applicants…"
          className="flex-1 bg-transparent text-[13px] outline-none text-[#0D183D] placeholder-[#4B6382]/50"/>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'new', label: 'New', count: statusCounts.new },
          { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
          { key: 'interview', label: 'Interview', count: statusCounts.interview },
          { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              filter === key
                ? 'bg-[#0D183D] text-white'
                : 'text-[#4B6382] bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[rgba(13,24,61,0.02)]'
            }`}>
            {label} {count > 0 && <span className="text-[11px] ml-1">({count})</span>}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[0,1,2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-[rgba(13,24,61,0.06)] shrink-0"/>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded-full bg-[rgba(13,24,61,0.06)]"/>
                <div className="h-2.5 w-1/2 rounded-full bg-[rgba(13,24,61,0.04)]"/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      <AnimatePresence>
        {!loading && applicants.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]">
            <p className="text-[14px] font-bold text-[#0D183D] mb-1">No applicants for this role yet</p>
            <p className="text-[12px] text-[#4B6382]">Students will appear here once they apply.</p>
          </motion.div>
        )}

        {/* No filter results */}
        {!loading && applicants.length > 0 && visible.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]">
            <p className="text-[14px] font-bold text-[#0D183D] mb-1">No applicants found</p>
            <p className="text-[12px] text-[#4B6382]">Try adjusting your search or filter.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applicant cards */}
      {!loading && visible.length > 0 && (
        <div className="space-y-2.5">
          {visible.map((a, i) => {
            const st = STATUS_CONFIG[toUiStatus(a.status)] ?? STATUS_CONFIG.new
            const scoreColor = a.match >= 90 ? '#059669' : a.match >= 80 ? '#D99E00' : '#6366F1'
            const isActive = selectedId === a.id
            return (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectApplicant(a)}
                className={`w-full text-left bg-white rounded-2xl border px-5 py-4 flex items-center gap-4 cursor-pointer transition-all ${
                  isActive
                    ? 'border-[#FFB703] shadow-[0_0_0_3px_rgba(255,183,3,0.1)]'
                    : 'border-[rgba(13,24,61,0.08)] hover:shadow-[0_2px_8px_rgba(13,24,61,0.06)]'
                }`}>
                <GradientAvatar name={a.name} size={44} radius="0.65rem"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-bold text-[#0D183D] truncate">{a.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4B6382] mb-2 truncate">
                    {a.field}{a.uni ? ` · ${a.uni}` : ''}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {a.skills.slice(0, 2).map(s => {
                      const display = skillDisplay(s)
                      return (
                        <span key={display} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                          style={{ background: '#F8F9FB', color: '#4B6382', borderColor: 'rgba(13,24,61,0.08)' }}>
                          {display}
                        </span>
                      )
                    })}
                    {a.skills.length > 2 && (
                      <span className="text-[10px] text-[#4B6382]/60">+{a.skills.length - 2}</span>
                    )}
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${scoreColor}15`, color: scoreColor }}>
                      {a.match}%
                    </span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
