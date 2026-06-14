import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase, Clock, CheckCircle2, XCircle, Calendar, ChevronRight, MapPin, Send,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

import { fetchStudentApplications } from '../services/applications'
import { supabase } from '../services/supabase'
import { withTimeout } from '../utils/withTimeout'

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
  const navigate = useNavigate()
  const [apps, setApps]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [oppData, setOppData]     = useState(null)
  const [oppLoading, setOppLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    withTimeout(fetchStudentApplications(user.id), 10000, 'fetchStudentApplications')
      .then(data => {
        setApps(data)
        if (data.length > 0) setSelectedAppId(data[0].id)
      })
      .catch(err => {
        console.error('Failed to load applications:', err.message)
        setApps([])
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  // Fetch opportunity details when application is selected
  useEffect(() => {
    const selectedApp = apps.find(a => a.id === selectedAppId)
    if (!selectedApp?.opportunityId) {
      setOppData(null)
      return
    }

    setOppLoading(true)
    withTimeout(
      supabase
        .from('opportunities')
        .select('*')
        .eq('id', selectedApp.opportunityId)
        .single()
        .then(({ data, error }) => {
          if (error) throw error
          return data
        }),
      10000,
      'fetchOpportunityDetails'
    )
      .then(data => setOppData(data))
      .catch(err => {
        console.error('[Applications] Failed to fetch opportunity:', err.message)
        setOppData(null)
      })
      .finally(() => setOppLoading(false))
  }, [selectedAppId, apps])

  const selectedApp = apps.find(a => a.id === selectedAppId)

  return (
    <div className="w-full px-8 py-7 bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#0D183D] mb-1">Applications</h1>
          <p className="text-[14px] text-[#4B6382]">Track your applications and interview progress</p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8">
        {/* LEFT: Sidebar - List of Applications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden h-fit lg:sticky lg:top-6">

          <div className="p-4 border-b border-[rgba(13,24,61,0.08)]">
            <h3 className="text-[13px] font-bold text-[#0D183D] uppercase tracking-widest">Your Applications</h3>
            <p className="text-[10px] text-[#4B6382] mt-1">{apps.length} applied</p>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-[rgba(13,24,61,0.04)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : apps.length === 0 ? (
              <div className="p-4 text-center text-[12px] text-[#4B6382]">
                No applications yet
              </div>
            ) : (
              apps.map((app, i) => (
                <motion.button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-full text-left px-4 py-3 border-b border-[rgba(13,24,61,0.06)] transition-all flex gap-3 items-center ${
                    selectedAppId === app.id
                      ? 'bg-[#FFB703]/10 border-l-4 border-l-[#FFB703]'
                      : 'hover:bg-[#F8F9FB]'
                  }`}>
                  <GradientAvatar name={app.ngoName || 'NGO'} size={40} radius="0.625rem" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#0D183D] truncate">{app.role || 'Position'}</p>
                    <p className="text-[11px] text-[#7A8BA6] mt-0.5 truncate">{app.ngoName || 'NGO'}</p>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>

        {/* RIGHT: Application Details */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#FFB703]/20 animate-spin mx-auto mb-3" />
              <p className="text-[#4B6382]">Loading your applications...</p>
            </div>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]">
            <Briefcase size={48} className="text-[#FFB703]/30 mx-auto mb-4"/>
            <p className="text-[16px] font-semibold text-[#0D183D] mb-2">No applications yet</p>
            <p className="text-[14px] text-[#4B6382] mb-4">Browse opportunities to start applying to NGOs</p>
            <Link to="/opportunities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#FFB703' }}>
              Browse opportunities
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : selectedApp ? (
          <motion.div
            key={selectedAppId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden">

            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#0D183D] to-[#1a2f5c] px-8 py-8 flex items-start gap-6">
              <GradientAvatar name={selectedApp.ngoName || 'NGO'} size={64} radius="1rem"/>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-[#FFB703] uppercase tracking-widest mb-1">
                  {selectedApp.ngoName || 'Organization'}
                </p>
                <h2 className="text-[28px] font-extrabold text-white mb-3">{selectedApp.role || 'Position'}</h2>
                <div className="flex items-center flex-wrap gap-3 text-[13px] text-white/80">
                  {selectedApp.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {selectedApp.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(selectedApp.submittedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {(() => {
                const cfg = STATUS_CFG[selectedApp.status] || STATUS_CFG.submitted
                const Icon = cfg.icon
                return (
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg ${cfg.bg} ${cfg.color} shrink-0`}>
                    <Icon size={13} />
                    {selectedApp.statusLabel}
                  </span>
                )
              })()}
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6">

              {/* Key Info Grid */}
              {((oppData?.category || selectedApp.category) ||
                (oppData?.work_mode || selectedApp.workMode) ||
                (oppData?.weekly_hours || selectedApp.weeklyHours) ||
                (oppData?.duration || selectedApp.duration)) && (
                <div className="grid grid-cols-2 gap-4">
                  {(oppData?.category || selectedApp.category) && (
                    <div>
                      <p className="text-[11px] font-bold text-[#4B6382] uppercase tracking-wider mb-2">Category</p>
                      <p className="text-[16px] font-bold text-[#0D183D]">{oppData?.category || selectedApp.category}</p>
                    </div>
                  )}
                  {(oppData?.work_mode || selectedApp.workMode) && (
                    <div>
                      <p className="text-[11px] font-bold text-[#4B6382] uppercase tracking-wider mb-2">Work Mode</p>
                      <p className="text-[16px] font-bold text-[#0D183D]">{oppData?.work_mode || selectedApp.workMode}</p>
                    </div>
                  )}
                  {(oppData?.weekly_hours || selectedApp.weeklyHours) && (
                    <div>
                      <p className="text-[11px] font-bold text-[#4B6382] uppercase tracking-wider mb-2">Time Commitment</p>
                      <p className="text-[16px] font-bold text-[#0D183D]">{oppData?.weekly_hours || selectedApp.weeklyHours} hrs/week</p>
                    </div>
                  )}
                  {(oppData?.duration || selectedApp.duration) && (
                    <div>
                      <p className="text-[11px] font-bold text-[#4B6382] uppercase tracking-wider mb-2">Duration</p>
                      <p className="text-[16px] font-bold text-[#0D183D]">{oppData?.duration || selectedApp.duration}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              {(selectedApp.description || (selectedApp.skills && selectedApp.skills.length > 0)) && (
                <div className="h-px bg-[rgba(13,24,61,0.08)]" />
              )}

              {/* Description */}
              {(oppData?.description || oppData?.mission_impact || selectedApp.description) && (
                <div>
                  <p className="text-[11px] font-bold text-[#4B6382] uppercase tracking-wider mb-2">About This Role</p>
                  <p className="text-[13px] text-[#4B6382] leading-relaxed">
                    {oppData?.description || oppData?.mission_impact || selectedApp.description}
                  </p>
                </div>
              )}

              {/* Skills */}
              {((oppData?.skills && oppData.skills.length > 0) || (selectedApp.skills && selectedApp.skills.length > 0)) && (
                <div>
                  <p className="text-[11px] font-bold text-[#4B6382] uppercase tracking-wider mb-3">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(oppData?.skills || selectedApp.skills || []).slice(0, 8).map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#0D183D]" style={{ background: 'rgba(255,183,3,0.1)' }}>
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Action */}
            {selectedApp.opportunityId && (
              <div className="px-8 py-6 bg-[#F8F9FB] border-t border-[rgba(13,24,61,0.08)]">
                <Link to={`/opportunities/${selectedApp.opportunityId}`}
                  className="block w-full px-6 py-3 rounded-xl text-[13px] font-semibold text-white text-center transition-all hover:opacity-90"
                  style={{ background: '#FFB703' }}>
                  View Full Opportunity
                </Link>
              </div>
            )}
          </motion.div>
        ) : null}
        </div>
      </div>
    </div>
  )
}
