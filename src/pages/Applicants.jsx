import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import RolesList from '../components/RolesList'
import ApplicantsList from '../components/ApplicantsList'
import ApplicantDetail from '../components/ApplicantDetail'
import {
  fetchNgoApplicants, fetchOpportunityApplicantsWithMatches, updateApplicationStatus
} from '../services/applications'
import { fetchNgoOpportunities } from '../services/opportunities'
import { withTimeout } from '../utils/withTimeout'

function toUiStatus(dbStatus) {
  if (dbStatus === 'submitted' || dbStatus === 'under_review') return 'new'
  return dbStatus ?? 'new'
}

function toDbStatus(uiStatus) {
  if (uiStatus === 'new') return 'under_review'
  return uiStatus
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Applicants() {
  const { user } = useApp()
  const [searchParams] = useSearchParams()
  const filterOppId = searchParams.get('opportunity')

  // Roles sidebar
  const [roles, setRoles]               = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [rolesLoading, setRolesLoading] = useState(true)

  // Applicants list
  const [applicants, setApplicants]     = useState([])
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [statuses, setStatuses]         = useState({})
  const [applicantSearch, setApplicantSearch] = useState('')

  // Detail panel
  const [selected, setSelected]         = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  // Toast
  const [error, setError]               = useState(null)
  const [toast, setToast]               = useState(null)

  // ── Fetch all opportunities on mount ───────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return
    setRolesLoading(true)
    setError(null)
    withTimeout(fetchNgoOpportunities(user.id), 10000, 'fetchNgoOpportunities')
      .then(opps => {
        // Map to match the expected format with stats
        const mapped = opps.map(opp => ({
          ...opp,
          stats: { total: 0, new: 0, shortlisted: 0, interview: 0, rejected: 0 }
        }))
        setRoles(mapped)
      })
      .catch(err => {
        console.error('Error loading opportunities:', err.message)
        setError('Could not load opportunities. Please try again.')
      })
      .finally(() => setRolesLoading(false))
  }, [user?.id])

  // ── Auto-select opportunity from query parameter ────────────────────────────
  useEffect(() => {
    if (filterOppId && roles.length > 0) {
      const matching = roles.find(r => r.id === filterOppId)
      if (matching) {
        setSelectedRoleId(filterOppId)
      }
    }
  }, [filterOppId, roles])

  // ── Fetch applicants when role is selected ─────────────────────────────────

  useEffect(() => {
    if (!user?.id) return
    if (selectedRoleId === null) {
      // Load all applicants
      setApplicantsLoading(true)
      withTimeout(fetchNgoApplicants(user.id), 10000, 'fetchNgoApplicants')
        .then(data => {
          setApplicants(data)
          setStatuses(Object.fromEntries(data.map(a => [a.id, toUiStatus(a.status)])))
          setSelected(null)
        })
        .catch(err => setError('Could not load applicants. ' + err.message))
        .finally(() => setApplicantsLoading(false))
    } else {
      // Load applicants for specific role
      setApplicantsLoading(true)
      withTimeout(fetchOpportunityApplicantsWithMatches(selectedRoleId, user.id), 10000, 'fetchOpportunityApplicantsWithMatches')
        .then(data => {
          setApplicants(data)
          setStatuses(Object.fromEntries(data.map(a => [a.id, toUiStatus(a.status)])))
          setSelected(null)
        })
        .catch(err => setError('Could not load applicants for this role. ' + err.message))
        .finally(() => setApplicantsLoading(false))
    }
  }, [selectedRoleId, user?.id])

  // ── Status change (persisted) ─────────────────────────────────────────────

  async function updateStatus(id, uiStatus) {
    // Optimistic update
    setStatuses(prev => ({ ...prev, [id]: uiStatus }))
    if (selected?.id === id) setSelectedStatus(uiStatus)

    const name = applicants.find(a => a.id === id)?.name.split(' ')[0] || ''
    const msgs = {
      shortlisted: `${name} shortlisted`,
      interview:   'Interview scheduled',
      rejected:    `${name} passed`,
      new:         'Status reset',
    }
    showToast(msgs[uiStatus] || '')

    try {
      await updateApplicationStatus(id, toDbStatus(uiStatus))
    } catch {
      // Revert on failure
      const original = applicants.find(a => a.id === id)?.status
      if (original) {
        const revertStatus = toUiStatus(original)
        setStatuses(prev => ({ ...prev, [id]: revertStatus }))
        if (selected?.id === id) setSelectedStatus(revertStatus)
      }
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSelectApplicant(app) {
    setSelected(app)
    setSelectedStatus(toUiStatus(app.status))
  }

  function handleStatusChange(uiStatus) {
    if (selected?.id) {
      updateStatus(selected.id, uiStatus)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const totalApplicants = roles.reduce((sum, r) => sum + r.stats.total, 0)

  return (
    <div className="max-w-7xl mx-auto px-8 py-7">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[1.15rem] font-bold text-[#0D183D]">Applicants</h1>
        <p className="text-[13px] text-[#4B6382] mt-0.5">
          {rolesLoading ? 'Loading…' : `${totalApplicants} student${totalApplicants !== 1 ? 's' : ''} applied to your opportunities`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm text-red-600 bg-red-50 border border-red-200">
          <AlertCircle size={15} className="shrink-0"/>
          {error}
          <button onClick={() => setError(null)}
            className="ml-auto font-semibold underline underline-offset-2">Dismiss</button>
        </div>
      )}

      {/* Main layout */}
      {rolesLoading ? (
        <div className="space-y-3">
          {[0,1,2].map(i => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: '280px 1fr 380px' }}>
          {/* Left: Roles sidebar */}
          <RolesList
            roles={roles}
            selectedRoleId={selectedRoleId}
            onSelectRole={setSelectedRoleId}
            loading={rolesLoading}
          />

          {/* Center: Applicants list */}
          <ApplicantsList
            applicants={applicants}
            selectedId={selected?.id}
            onSelectApplicant={handleSelectApplicant}
            statuses={statuses}
            loading={applicantsLoading}
            searchQuery={applicantSearch}
            selectedRoleTitle={selectedRoleId ? roles.find(r => r.id === selectedRoleId)?.title : null}
          />

          {/* Right: Detail panel */}
          <ApplicantDetail
            applicant={selected}
            status={selectedStatus}
            onStatusChange={handleStatusChange}
            opportunityId={filterOppId}
          />
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:16, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:16, scale:0.96 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-[13px] font-semibold z-50 pointer-events-none"
            style={{ background:'#0D183D', boxShadow:'0 8px 24px rgba(13,24,61,0.3)' }}>
            <CheckCircle2 size={14}/>{toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
