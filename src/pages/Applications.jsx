import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Briefcase, Clock, CheckCircle2, XCircle, Calendar, ChevronRight, MapPin,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

import { fetchStudentApplications } from '../services/applications'

const STATUS_CFG = {
  interview:    { color: 'text-emerald-700', bg: 'bg-emerald-50',  icon: Calendar    },
  under_review: { color: 'text-[#D99E00]',   bg: 'bg-amber-50',   icon: Clock       },
  submitted:    { color: 'text-indigo-600',  bg: 'bg-indigo-50',  icon: CheckCircle2 },
  shortlisted:  { color: 'text-violet-600',  bg: 'bg-violet-50',  icon: CheckCircle2 },
  accepted:     { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  rejected:     { color: 'text-red-500',     bg: 'bg-red-50',     icon: XCircle     },
}

export default function Applications() {
  const { user } = useApp()
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('All')

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    fetchStudentApplications(user.id)
      .then(setApps)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  const filtered = tab === 'All' ? apps
    : tab === 'Active' ? apps.filter(a => a.status !== 'rejected')
    : apps.filter(a => a.status === 'interview')

  const TAB_COUNTS = {
    All:        apps.length,
    Active:     apps.filter(a => a.status !== 'rejected').length,
    Interviews: apps.filter(a => a.status === 'interview').length,
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-7">
      <div className="mb-6">
        <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">My Applications</h1>
        <p className="text-[13px] text-[#4B6382] mt-0.5">Track all your applications in one place</p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-6">
        {Object.entries(TAB_COUNTS).map(([label, count]) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            className={`rounded-2xl border px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
              tab === label
                ? 'bg-[#0D183D] border-[#0D183D]'
                : 'bg-white border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB]'
            }`}>
            <span className={`text-[18px] font-extrabold ${tab === label ? 'text-white' : 'text-[#0D183D]'}`}>{count}</span>
            <span className={`text-[12px] ${tab === label ? 'text-white/70' : 'text-[#4B6382]'}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-5 py-4 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-8 py-12 text-center">
          <p className="text-2xl mb-3">📄</p>
          <p className="font-extrabold text-[#0D183D] mb-1">No applications yet</p>
          <p className="text-[13px] text-[#4B6382] mb-4">
            Browse opportunities and apply to NGOs that match your skills.
          </p>
          <Link to="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: '#FFB703' }}>
            Browse opportunities →
          </Link>
        </div>
      )}

      {/* Timeline */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((a, i) => {
            const cfg = STATUS_CFG[a.status] || STATUS_CFG.submitted
            const Icon = cfg.icon
            return (
              <motion.div key={a.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-5 py-4 flex items-start gap-4 hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)] transition-all">
                <GradientAvatar name={a.ngoName || 'NGO'} size={44} radius="0.65rem" className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-[13px] font-bold text-[#0D183D] leading-snug">{a.ngoName || 'NGO'}</p>
                      <p className="text-[11px] text-[#4B6382]">
                        {a.role || 'Opportunity'}
                        {a.location ? <span className="inline-flex items-center gap-0.5 ml-1"><MapPin size={9}/>{a.location}</span> : null}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                      <Icon size={10}/> {a.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-[#4B6382]">
                      {new Date(a.submittedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                    </p>
                    {a.status !== 'rejected' && (
                      <Link to="/messages"
                        className="text-[11px] font-semibold flex items-center gap-0.5 transition-opacity hover:opacity-70"
                        style={{ color: '#FFB703' }}>
                        Message <ChevronRight size={11}/>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
