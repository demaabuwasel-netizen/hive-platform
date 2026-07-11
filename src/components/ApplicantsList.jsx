import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import GradientAvatar from './GradientAvatar'

function toUiStatus(dbStatus) {
  if (dbStatus === 'submitted' || dbStatus === 'under_review') return 'new'
  return dbStatus ?? 'new'
}

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-[#1A73E8]', bg: 'bg-[#E8F0FE]' },
  shortlisted: { label: 'Viewed',      color: 'text-[#5F6368]', bg: 'bg-[#F1F3F4]' },
  interview:   { label: 'Interview',   color: 'text-[#188038]', bg: 'bg-[#E6F4EA]' },
  accepted:    { label: 'Accepted',    color: 'text-[#188038]', bg: 'bg-[#E6F4EA]' },
  rejected:    { label: 'Rejected',    color: 'text-[#5F6368]', bg: 'bg-[#F1F3F4]' },
}

export default function ApplicantsList({ applicants, selectedId, onSelectApplicant, statuses, loading, searchQuery, selectedRoleTitle }) {
  const [localQ, setLocalQ] = useState('')
  const [filter, setFilter] = useState('all')

  const q = searchQuery || localQ
  const statusFor = a => statuses?.[a.id] ?? toUiStatus(a.status)
  const activeApplicants = applicants.filter(a => statusFor(a) !== 'rejected')
  const visible = applicants.filter(a => {
    const matchSearch = (a.name || '').toLowerCase().includes(q.toLowerCase()) ||
                       (a.field || '').toLowerCase().includes(q.toLowerCase())
    const currentStatus = statusFor(a)
    const matchFilter = filter === 'all'
      ? currentStatus !== 'rejected'
      : currentStatus === filter
    return matchSearch && matchFilter
  })

  const statusCounts = {
    all:      activeApplicants.length,
    new:      applicants.filter(a => statusFor(a) === 'new').length,
    rejected: applicants.filter(a => statusFor(a) === 'rejected').length,
  }

  return (
    <section className="flex min-w-0 flex-col xl:h-full xl:min-h-0">
      <div className="mb-4 shrink-0 rounded-[28px] bg-[#F8FAFF]/70 p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            {loading ? (
              <>
                <div className="h-8 w-56 animate-pulse rounded-2xl bg-[#EEF4FF]" />
                <div className="mt-2 h-4 w-36 animate-pulse rounded-full bg-[#F1F4F9]" />
              </>
            ) : (
              <>
                <h2 className="truncate text-[1.35rem] font-semibold tracking-[-0.04em] text-[#202124]">
                  {selectedRoleTitle || 'Select a role'}
                </h2>
                <p className="mt-1 text-[0.84rem] text-[#5F6368]">
                  {activeApplicants.length} applicant{activeApplicants.length !== 1 ? 's' : ''} in this role
                </p>
              </>
            )}
          </div>

          <div className="grid h-10 w-full grid-cols-3 gap-1 rounded-[15px] bg-[#EEF3FB] p-1 lg:w-[320px]">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'new', label: 'New', count: statusCounts.new },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`h-8 rounded-[12px] px-2.5 text-[0.73rem] font-semibold transition-colors ${
                  filter === key
                    ? 'bg-white text-[#1A73E8] shadow-[0_1px_4px_rgba(60,64,67,0.12)]'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                {label} <span className="ml-1 text-[0.66rem] opacity-70">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-12 items-center gap-2 rounded-[18px] border border-[#E5EEFB] bg-white px-3 shadow-[0_8px_20px_rgba(60,64,67,0.035)]">
          <Search size={14} className="shrink-0 text-[#5F6368]"/>
          <input value={q} onChange={e => setLocalQ(e.target.value)} placeholder="Search applicants"
            className="min-w-0 flex-1 bg-transparent text-[0.84rem] text-[#202124] outline-none placeholder:text-[#9AA0A6]"/>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 xl:pb-1">
      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0,1,2].map(i => (
            <div key={i} className="flex h-[86px] items-center gap-3 rounded-[24px] border border-[#E5EEFB] bg-white/80 px-4 py-3.5 animate-pulse">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-[#F1F3F4]"/>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded-full bg-[#F1F3F4]"/>
                <div className="h-2.5 w-1/2 rounded-full bg-[#F8FAFC]"/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      <AnimatePresence>
        {!loading && applicants.length === 0 && (
          <motion.div initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D7E6FF] bg-[#FBFCFE] px-6 py-14 text-center">
            <p className="mb-1 text-[0.95rem] font-semibold text-[#202124]">No applicants for this role yet</p>
            <p className="text-[0.82rem] text-[#5F6368]">Students will appear here once they apply.</p>
          </motion.div>
        )}

        {/* No filter results */}
        {!loading && applicants.length > 0 && visible.length === 0 && (
          <motion.div initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D7E6FF] bg-[#FBFCFE] px-6 py-14 text-center">
            <p className="mb-1 text-[0.95rem] font-semibold text-[#202124]">No applicants found</p>
            <p className="text-[0.82rem] text-[#5F6368]">Try adjusting your search or filter.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applicant cards */}
      {!loading && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((a, i) => {
            const currentStatus = statusFor(a)
            const st = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.new
            const isActive = selectedId === a.id
            return (
              <motion.div
                key={a.id}
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
                role="button"
                tabIndex={0}
                onClick={() => onSelectApplicant(a)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectApplicant(a)
                  }
                }}
                className={`group flex min-h-[86px] w-full cursor-pointer items-center gap-4 rounded-[24px] border px-4 py-3.5 text-left transition-all ${
                  currentStatus === 'accepted'
                    ? 'border-[#D9F0E4] bg-[#F1FBF6] shadow-[0_10px_24px_rgba(24,128,56,0.06)] hover:bg-[#ECF9F0]'
                    : isActive
                    ? 'border-[#BFD7FF] bg-[#F8FAFF] shadow-[0_14px_30px_rgba(26,115,232,0.10)]'
                    : 'border-[#E5EEFB] bg-white/80 shadow-[0_8px_20px_rgba(60,64,67,0.03)] hover:-translate-y-0.5 hover:border-[#D7E6FF] hover:bg-white hover:shadow-[0_14px_28px_rgba(60,64,67,0.055)]'
                }`}>
                <GradientAvatar name={a.name} size={44} radius="0.9rem" className="shadow-none"/>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`truncate text-[0.96rem] font-semibold ${
                      currentStatus === 'accepted' ? 'text-[#188038]' : 'text-[#202124]'
                    }`}>{a.name}</span>
                    <span className={`inline-flex h-6 w-[58px] shrink-0 items-center justify-center rounded-full text-[0.62rem] font-semibold ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="mb-3 truncate text-[0.76rem] text-[#5F6368]">
                    {a.field}{a.uni ? ` · ${a.uni}` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex h-8 items-center justify-center rounded-full bg-[#E8F0FE] px-3 text-[0.72rem] font-semibold text-[#1A73E8]">
                    {a.match}% match
                  </span>
                  <p className="mt-2 text-[0.68rem] font-semibold text-[#9AA0A6]">Open profile</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
      </div>
    </section>
  )
}
