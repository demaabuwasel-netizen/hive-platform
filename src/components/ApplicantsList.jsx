import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users } from 'lucide-react'
import GradientAvatar from './GradientAvatar'
import { parseSkillString } from '../services/opportunities'

function skillDisplay(s) {
  const parsed = parseSkillString(s)
  return parsed.level ? `${parsed.name} [${parsed.level}]` : parsed.name
}

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-indigo-600',  bg: 'bg-indigo-50'   },
  shortlisted: { label: 'Shortlisted', color: 'text-[#D99E00]',   bg: 'bg-amber-50'    },
  interview:   { label: 'Interview',   color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  accepted:    { label: 'Accepted',    color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  rejected:    { label: 'Rejected',    color: 'text-red-500',     bg: 'bg-red-50'      },
}

export default function ApplicantsList({ applicants, selectedId, onSelectApplicant, statuses, loading, searchQuery }) {
  const [localQ, setLocalQ] = useState('')

  const q = searchQuery || localQ
  const visible = applicants.filter(a =>
    (a.name.toLowerCase().includes(q.toLowerCase()) ||
     a.field.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-5 flex-1">
      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[rgba(13,24,61,0.08)] hover:border-[rgba(13,24,61,0.12)] transition-colors"
        style={{ boxShadow: '0 1px 3px rgba(13,24,61,0.04)' }}>
        <Search size={14} className="text-[#4B6382] shrink-0"/>
        <input value={q} onChange={e => setLocalQ(e.target.value)} placeholder="Search by name or field…"
          className="flex-1 bg-transparent text-[13px] outline-none text-[#0D183D] placeholder-[#4B6382]/50 font-medium"/>
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
            className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-xl border border-[rgba(13,24,61,0.08)]"
            style={{ boxShadow: '0 1px 3px rgba(13,24,61,0.04)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background:'rgba(255,183,3,0.12)' }}>
              <span className="text-3xl">📭</span>
            </div>
            <p className="text-[14px] font-bold text-[#0D183D] mb-1.5">No applicants yet</p>
            <p className="text-[12px] text-[#4B6382] leading-relaxed">
              Students will appear here once they apply to this opportunity.
            </p>
          </motion.div>
        )}

        {/* No results */}
        {!loading && applicants.length > 0 && visible.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-xl border border-[rgba(13,24,61,0.08)]"
            style={{ boxShadow: '0 1px 3px rgba(13,24,61,0.04)' }}>
            <Search size={32} className="text-[#4B6382] mb-4 opacity-20"/>
            <p className="text-[14px] font-bold text-[#0D183D] mb-1.5">No results found</p>
            <p className="text-[12px] text-[#4B6382] leading-relaxed">Try adjusting your search or filters.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applicant cards */}
      {!loading && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((a, i) => {
            const st = STATUS_CONFIG[statuses[a.id]] ?? STATUS_CONFIG.new
            const scoreColor = a.match >= 90 ? '#059669' : a.match >= 80 ? '#D99E00' : '#6366F1'
            const isActive = selectedId === a.id
            return (
              <motion.button key={a.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.05 }}
                onClick={() => onSelectApplicant(a)}
                className={`w-full text-left bg-white rounded-xl border px-4 py-3.5 flex items-center gap-3.5 cursor-pointer transition-all duration-200 group ${
                  isActive
                    ? 'border-[#FFB703] shadow-[0_4px_16px_rgba(255,183,3,0.12)]'
                    : 'border-[rgba(13,24,61,0.08)] hover:border-[rgba(13,24,61,0.12)] hover:shadow-[0_2px_8px_rgba(13,24,61,0.05)]'
                }`}>
                <GradientAvatar name={a.name} size={44} radius="0.65rem" className={isActive ? 'ring-2 ring-[#FFB703]/30' : ''}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[13px] font-bold truncate transition-colors ${
                      isActive ? 'text-[#FFB703]' : 'text-[#0D183D] group-hover:text-[#0D183D]'
                    }`}>
                      {a.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4B6382] mb-2 truncate">
                    {a.field}{a.uni ? ` · ${a.uni}` : ''}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {a.skills.slice(0,3).map(s => {
                      const display = skillDisplay(s)
                      return (
                        <span key={display} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                          style={{ background:'#F8F9FB', color:'#4B6382', borderColor:'rgba(13,24,61,0.1)' }}>
                          {display}
                        </span>
                      )
                    })}
                    {a.skills.length > 3 && (
                      <span className="text-[10px] font-semibold text-[#4B6382]/70">+{a.skills.length-3}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-all"
                    style={{ background:`${scoreColor}12`, color: scoreColor }}>{a.match}%</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
