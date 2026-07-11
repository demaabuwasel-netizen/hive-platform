import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import RolesList from '../components/RolesList'
import ApplicantsList from '../components/ApplicantsList'
import ApplicantDetail from '../components/ApplicantDetail'
import {
  fetchNgoApplicants,
  fetchOpportunityApplicantsWithMatches,
  updateApplicationStatus
} from '../services/applications'
import { fetchNgoOpportunities, setOpportunityStatus } from '../services/opportunities'
import { withTimeout } from '../utils/withTimeout'

function toUiStatus(dbStatus) {
  if (dbStatus === 'submitted' || dbStatus === 'under_review') return 'new'
  return dbStatus ?? 'new'
}

function toDbStatus(uiStatus) {
  if (uiStatus === 'new') return 'under_review'
  return uiStatus
}

function emptyStats() {
  return { total: 0, new: 0, shortlisted: 0, interview: 0, accepted: 0, rejected: 0 }
}

function applyRoleStatusChange(role, fromStatus, toStatus) {
  const stats = { ...emptyStats(), ...(role.stats ?? {}) }
  const fromCountsInAll = fromStatus !== 'rejected'
  const toCountsInAll = toStatus !== 'rejected'

  if (fromStatus && stats[fromStatus] !== undefined) {
    stats[fromStatus] = Math.max(0, stats[fromStatus] - 1)
  }
  if (toStatus && stats[toStatus] !== undefined) {
    stats[toStatus] += 1
  }
  if (fromCountsInAll && !toCountsInAll) {
    stats.total = Math.max(0, stats.total - 1)
  }
  if (!fromCountsInAll && toCountsInAll) {
    stats.total += 1
  }

  return { ...role, stats }
}

function buildRoleStats(applicantsForRole) {
  return applicantsForRole.reduce((stats, app) => {
    const status = toUiStatus(app.status)

    if (status !== 'rejected') stats.total += 1
    if (stats[status] !== undefined) stats[status] += 1

    return stats
  }, emptyStats())
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Applicants() {
  const { user } = useApp()
  const [searchParams] = useSearchParams()
  const filterOppId = searchParams.get('opportunity')
  const didAutoSelectRole = useRef(false)

  // Roles sidebar
  const [roles, setRoles]               = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [rolesLoading, setRolesLoading] = useState(true)

  // Applicants list
  const [applicants, setApplicants]     = useState([])
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [statuses, setStatuses]         = useState({})
  const [applicantSearch] = useState('')

  // Detail panel
  const [selected, setSelected]         = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  // Toast
  const [error, setError]               = useState(null)
  const [toast, setToast]               = useState(null)

	  // ── Fetch all opportunities on mount ───────────────────────────────────────

	  useEffect(() => {
	    if (!user?.id) return
	    didAutoSelectRole.current = false
	    setRolesLoading(true)
	    setError(null)
      setSelectedRoleId(null)
    Promise.all([
      withTimeout(fetchNgoOpportunities(user.id), 10000, 'fetchNgoOpportunities'),
      withTimeout(fetchNgoApplicants(user.id), 10000, 'fetchNgoApplicantsForRoleCounts').catch(() => []),
    ])
      .then(([opps, allApplicants]) => {
        const mapped = opps.map(opp => ({
          ...opp,
          stats: buildRoleStats(allApplicants.filter(app => app.opportunityId === opp.id)),
        }))
        setRoles(mapped)
        if (mapped.length === 0) setSelectedRoleId(null)
      })
      .catch(err => {
        console.error('Error loading opportunities:', err.message)
        setError('Could not load opportunities. Please try again.')
      })
      .finally(() => setRolesLoading(false))
  }, [user?.id])

	  // ── Auto-select opportunity from query parameter or select first role on open ──
	  useEffect(() => {
	    if (roles.length === 0) return
	
	    if (didAutoSelectRole.current) return

	    const matching = filterOppId
	      ? roles.find(r => String(r.id) === String(filterOppId))
	      : null
	    setSelectedRoleId(matching?.id ?? roles[0].id)
	    didAutoSelectRole.current = true
	  }, [filterOppId, roles])

  // ── Fetch applicants when role is selected ─────────────────────────────────

  useEffect(() => {
    if (!user?.id) return
    if (rolesLoading) return
    if (selectedRoleId === null) {
      setApplicants([])
      setStatuses({})
      setSelected(null)
      setSelectedStatus(null)
      setApplicantsLoading(false)
      return
    }

    setApplicantsLoading(true)
    withTimeout(fetchOpportunityApplicantsWithMatches(selectedRoleId, user.id), 10000, 'fetchOpportunityApplicantsWithMatches')
      .then(data => {
        setApplicants(data)
        setStatuses(Object.fromEntries(data.map(a => [a.id, toUiStatus(a.status)])))
        setSelected(null)
        setSelectedStatus(null)
      })
      .catch(err => setError('Could not load applicants for this role. ' + err.message))
      .finally(() => setApplicantsLoading(false))
  }, [rolesLoading, selectedRoleId, user?.id])

  // ── Status change (persisted) ─────────────────────────────────────────────

  async function updateStatus(id, uiStatus, { silent = false } = {}) {
    const app = applicants.find(a => a.id === id)
    const previousStatus = statuses[id] ?? toUiStatus(app?.status)
    const role = roles.find(r => String(r.id) === String(app?.opportunityId))
    const previousRoleStatus = role?.status ?? null
    const acceptedAfterChange = applicants.filter(a => {
      const nextStatus = a.id === id ? uiStatus : (statuses[a.id] ?? toUiStatus(a.status))
      return nextStatus === 'accepted'
    }).length > 0
    const nextRoleStatus = acceptedAfterChange
      ? 'paused'
      : (previousRoleStatus === 'paused' ? 'active' : previousRoleStatus)

    // Optimistic update
    setStatuses(prev => ({ ...prev, [id]: uiStatus }))
    if (selected?.id === id) setSelectedStatus(uiStatus)
    if (app?.opportunityId && previousStatus !== uiStatus) {
      setRoles(prev => prev.map(role => (
        role.id === app.opportunityId ? applyRoleStatusChange(role, previousStatus, uiStatus) : role
      )))
    }
    if (role && nextRoleStatus && nextRoleStatus !== previousRoleStatus) {
      setRoles(prev => prev.map(r => (
        String(r.id) === String(role.id) ? { ...r, status: nextRoleStatus } : r
      )))
    }

    const name = app?.name.split(' ')[0] || ''
    const msgs = {
      shortlisted: `${name} shortlisted`,
      interview:   'Interview scheduled',
      rejected:    `${name} passed`,
      new:         'Status reset',
    }
    if (!silent) showToast(msgs[uiStatus] || '')

    try {
      await updateApplicationStatus(id, toDbStatus(uiStatus))
      if (app?.opportunityId && nextRoleStatus && nextRoleStatus !== previousRoleStatus) {
        await setOpportunityStatus(app.opportunityId, user.id, nextRoleStatus)
        try {
          localStorage.removeItem('hive_active_opps')
          const cacheKey = `hive_ngo_opps_${user.id}`
          const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
          const updated = cached.map(opp => (
            String(opp.id) === String(app.opportunityId) ? { ...opp, status: nextRoleStatus } : opp
          ))
          localStorage.setItem(cacheKey, JSON.stringify(updated))
        } catch {
          // Cache freshness is best-effort; the database update above is the source of truth.
        }
      }
    } catch {
      // Revert on failure
      const original = applicants.find(a => a.id === id)?.status
      if (original) {
        const revertStatus = toUiStatus(original)
        setStatuses(prev => ({ ...prev, [id]: revertStatus }))
        if (selected?.id === id) setSelectedStatus(revertStatus)
        if (app?.opportunityId && previousStatus !== uiStatus) {
          setRoles(prev => prev.map(role => (
            role.id === app.opportunityId ? applyRoleStatusChange(role, uiStatus, revertStatus) : role
          )))
        }
        if (role && nextRoleStatus && nextRoleStatus !== previousRoleStatus) {
          setRoles(prev => prev.map(r => (
            String(r.id) === String(role.id) ? { ...r, status: previousRoleStatus } : r
          )))
        }
      }
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSelectApplicant(app) {
    const currentStatus = statuses[app.id] ?? toUiStatus(app.status)

    setSelected(app)
    if (currentStatus === 'new') {
      setSelectedStatus('shortlisted')
      updateStatus(app.id, 'shortlisted', { silent: true })
    } else {
      setSelectedStatus(currentStatus)
    }
  }

  function handleSelectRole(roleId) {
    setSelectedRoleId(roleId)
    setSelected(null)
    setSelectedStatus(null)
  }

  function handleStatusChange(uiStatus) {
    if (selected?.id) {
      updateStatus(selected.id, uiStatus)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const selectedRole = roles.find(r => String(r.id) === String(selectedRoleId))
  const totalApplicants = applicants.filter(a => (statuses[a.id] ?? toUiStatus(a.status)) !== 'rejected').length
  return (
    <div className="mx-auto max-w-[1520px] overflow-x-hidden px-6 py-10 lg:px-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[clamp(2.4rem,5vw,4.35rem)] font-semibold leading-none tracking-[-0.055em] text-[#202124]">
          Applicants
        </h1>
        <p className="mt-5 max-w-2xl text-[1rem] leading-7 text-[#5F6368]">
          {rolesLoading
            ? 'Loading your applicant queue...'
            : selectedRole
              ? `Review ${totalApplicants} applicant${totalApplicants !== 1 ? 's' : ''} for ${selectedRole.title}.`
              : 'Choose a posted role to review its applicants.'}
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

      <RolesList
        roles={roles}
        selectedRoleId={selectedRoleId}
        onSelectRole={handleSelectRole}
        loading={rolesLoading}
      />

      {/* Main layout */}
      <div className="mx-auto grid w-full max-w-[1760px] gap-x-6 gap-y-4 xl:grid-cols-[minmax(0,1fr)_780px] xl:grid-rows-[auto_minmax(0,auto)]">
        <ApplicantsList
          applicants={applicants}
          selectedId={selected?.id}
          onSelectApplicant={handleSelectApplicant}
          statuses={statuses}
          loading={rolesLoading || applicantsLoading}
          searchQuery={applicantSearch}
          selectedRoleTitle={selectedRole?.title ?? null}
        />

        <div className="hidden rounded-[28px] bg-[#F8FAFF]/70 p-4 xl:col-start-2 xl:row-start-1 xl:block">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[#202124]">
            Student details
          </h2>
          <p className="mt-1 text-[0.84rem] text-[#5F6368]">
            Profile, fit, and next action for the selected applicant
          </p>
        </div>

        <div className="min-w-0 self-start xl:col-start-2 xl:row-start-2">
          <ApplicantDetail
            applicant={selected}
            status={selectedStatus}
            onStatusChange={handleStatusChange}
            opportunityId={selectedRoleId}
          />
        </div>
      </div>

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
