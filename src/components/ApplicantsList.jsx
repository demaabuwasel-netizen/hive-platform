import { useState } from 'react'
import { motion } from 'framer-motion'
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
    <div className="flex flex-col gap-4 flex-1">
      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[rgba(13,24,61,0.08)]">
        <Search size={13} className="text-[#4B6382] shrink-0"/>
        <input value={q} onChange={e => setLocalQ(e.target.value)} placeholder="Search applicants…"
          className="flex-1 bg-transparent text-[13px] outline-none text-[#0D183D] placeholder-[#4B6382]/50"/>
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
      {!loading && applicants.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background:'rgba(255,183,3,0.08)' }}>
            <Users size={22} style={{ color:'#FFB703' }}/>
          </div>
          <p className="text-[14px] font-bold text-[#0D183D] mb-1">No applicants</p>
          <p className="text-[12px] text-[#4B6382] max-w-xs leading-relaxed">
            Students will appear here once they apply to this opportunity.
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && applicants.length > 0 && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]">
          <Search size={28} className="text-[#4B6382] mb-3 opacity-30"/>
          <p className="text-[13px] font-semibold text-[#0D183D] mb-1">No applicants found</p>
          <p className="text-[12px] text-[#4B6382]">Try adjusting your search term.</p>
        </div>
      )}

      {/* Applicant cards */}
      {!loading && visible.length > 0 && (
        <div className="space-y-2">
          {visible.map((a, i) => {
            const st = STATUS_CONFIG[statuses[a.id]] ?? STATUS_CONFIG.new
            const scoreColor = a.match >= 90 ? '#059669' : a.match >= 80 ? '#D99E00' : '#6366F1'
            const isActive = selectedId === a.id
            return (
              <motion.button key={a.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.05 }}
                onClick={() => onSelectApplicant(a)}
                className={`w-full text-left bg-white rounded-2xl border px-5 py-4 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] ${
                  isActive ? 'border-[#FFB703] shadow-[0_0_0_3px_rgba(255,183,3,0.1)]' : 'border-[rgba(13,24,61,0.08)]'
                }`}>
                <GradientAvatar name={a.name} size={44} radius="0.65rem"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-bold text-[#0D183D] truncate">
                      {a.name}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.color}`}>
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
                          style={{ background:'#F8F9FB', color:'#4B6382', borderColor:'rgba(13,24,61,0.08)' }}>
                          {display}
                        </span>
                      )
                    })}
                    {a.skills.length > 3 && (
                      <span className="text-[10px] text-[#4B6382]/60 font-medium">+{a.skills.length-3}</span>
                    )}
                    <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background:`${scoreColor}15`, color: scoreColor }}>{a.match}%</span>
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
