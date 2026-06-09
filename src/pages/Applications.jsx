import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Briefcase, Clock, CheckCircle2, XCircle, Calendar, ChevronRight, MapPin, Send,
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
    <div className="w-full px-8 py-7 bg-[#FAFBFC]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0D183D] mb-1">Applications</h1>
          <p className="text-[14px] text-[#4B6382]">Track your applications and interview progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(TAB_COUNTS).map(([label, count]) => (
          <motion.button
            key={label}
            onClick={() => setTab(label)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border px-6 py-5 transition-all text-left ${
              tab === label
                ? 'bg-[#0D183D] border-[#0D183D] shadow-md'
                : 'bg-white border-[rgba(13,24,61,0.08)] hover:border-[rgba(13,24,61,0.12)] hover:shadow-sm'
            }`}>
            <p className={`text-sm font-semibold mb-2 ${tab === label ? 'text-white/70' : 'text-[#4B6382]'}`}>
              {label}
            </p>
            <p className={`text-3xl font-bold ${tab === label ? 'text-white' : 'text-[#0D183D]'}`}>
              {count}
            </p>
          </motion.button>
        ))}
      </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-6 py-5 h-20 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-12">
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FFB703]/10 flex items-center justify-center mx-auto mb-4">
                <Send size={32} className="text-[#FFB703]" />
              </div>
              <h2 className="text-xl font-bold text-[#0D183D] mb-2">No applications yet</h2>
              <p className="text-[14px] text-[#4B6382] mb-6 max-w-xl mx-auto">
                Browse available opportunities and start applying to NGOs that match your skills and interests.
              </p>
              <Link to="/opportunities"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#FFB703' }}>
                Browse opportunities
                <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Applications list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
          {filtered.map((a, i) => {
            const cfg = STATUS_CFG[a.status] || STATUS_CFG.submitted
            const Icon = cfg.icon
            return (
              <motion.div key={a.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 flex items-center gap-5 hover:shadow-[0_4px_24px_rgba(13,24,61,0.08)] hover:border-[rgba(13,24,61,0.12)] transition-all">
                <GradientAvatar name={a.ngoName || 'NGO'} size={52} radius="0.85rem" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-6 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-[#0D183D]">{a.ngoName || 'NGO'}</p>
                      <div className="flex items-center gap-4 mt-2 text-[13px] text-[#4B6382] flex-wrap">
                        <span>{a.role || 'Opportunity'}</span>
                        {a.location && (
                          <>
                            <span className="text-[rgba(13,24,61,0.2)]">•</span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-[#4B6382]" />
                              {a.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-lg shrink-0 whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
                      <Icon size={13} />
                      {a.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(13,24,61,0.06)]">
                    <p className="text-[12px] text-[#4B6382]">
                      Applied {new Date(a.submittedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                    {a.status !== 'rejected' && (
                      <Link to="/messages"
                        className="text-[12px] font-semibold flex items-center gap-1.5 transition-colors hover:text-[#FFB703]"
                        style={{ color: '#FFB703' }}>
                        Message
                        <ChevronRight size={13} />
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
    </div>
  )
}
