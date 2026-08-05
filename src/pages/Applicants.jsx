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
  updateApplicationStatus,
  markOtherApplicantsRoleFilled
} from '../services/applications'
import { fetchNgoOpportunities, setOpportunityStatus } from '../services/opportunities'
import { withTimeout } from '../utils/withTimeout'
import ngoApplicantsImg from '../assets/ngo applicants.PNG'

function toUiStatus(dbStatus) {
  if (dbStatus === 'submitted' || dbStatus === 'under_review') return 'new'
  return dbStatus ?? 'new'
}

function toDbStatus(uiStatus) {
  if (uiStatus === 'new') return 'under_review'
  return uiStatus
}

function emptyStats() {
  return { total: 0, new: 0, shortlisted: 0, interview: 0, accepted: 0, completed: 0, rejected: 0 }
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
  // Stays false until the FIRST applicants fetch settles, so the page shows one
  // continuous skeleton phase (no flash of empty/unselected states in between).
  const [initialLoadDone, setInitialLoadDone] = useState(false)
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
      setInitialLoadDone(false)
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
        if (mapped.length === 0) {
          setSelectedRoleId(null)
          setInitialLoadDone(true)
        }
      })
      .catch(err => {
        console.error('Error loading opportunities:', err.message)
        setError('Could not load opportunities. Please try again.')
        setInitialLoadDone(true)
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
        // Auto-open the first applicant in the queue
        const first = data.find(a => toUiStatus(a.status) !== 'rejected') ?? null
        setSelected(first)
        setSelectedStatus(first ? toUiStatus(first.status) : null)
      })
      .catch(err => setError('Could not load applicants for this role. ' + err.message))
      .finally(() => {
        setApplicantsLoading(false)
        setInitialLoadDone(true)
      })
  }, [rolesLoading, selectedRoleId, user?.id])

  // ── Status change (persisted) ─────────────────────────────────────────────

  async function updateStatus(id, uiStatus, { silent = false } = {}) {
    const app = applicants.find(a => a.id === id)
    const previousStatus = statuses[id] ?? toUiStatus(app?.status)
    const role = roles.find(r => String(r.id) === String(app?.opportunityId))
    const previousRoleStatus = role?.status ?? null
    const filledAfterChange = applicants.filter(a => {
      const nextStatus = a.id === id ? uiStatus : (statuses[a.id] ?? toUiStatus(a.status))
      return nextStatus === 'accepted' || nextStatus === 'completed'
    }).length > 0
    const nextRoleStatus = filledAfterChange
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
      accepted:    `${name} accepted`,
      completed:   'Role completed. Certificate unlocked.',
      rejected:    `${name} passed`,
      new:         'Status reset',
    }
    if (!silent) showToast(msgs[uiStatus] || '')

    try {
      await updateApplicationStatus(id, toDbStatus(uiStatus))

      // Accepting someone closes the role for everyone else still in the
      // running. Their status/label here doesn't change (they weren't
      // formally rejected) — this only flags the role as filled by someone
      // else, which is what hides it from their own Applications view.
      if (uiStatus === 'accepted' && app?.opportunityId) {
        try {
          await markOtherApplicantsRoleFilled(app.opportunityId, id)
        } catch (err) {
          // Non-fatal — the accepted candidate's status already saved; the
          // others just won't be flagged until next reload.
          console.warn('Could not flag other applicants\' role as filled:', err.message)
        }
      }

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
  // One loading flag for the whole page: skeletons everywhere until the first
  // full roles+applicants load settles, then everything appears in one paint.
  const pageLoading = rolesLoading || applicantsLoading || !initialLoadDone
  return (
    <div className="mx-auto max-w-[1520px] overflow-x-hidden px-6 py-10 lg:px-10">

      {/* Header — locked to the same lg height as the Matches page header */}
      <div className="relative mb-8">
        <div className="flex flex-col gap-4 lg:min-h-[182px] lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[clamp(2.4rem,5vw,4.35rem)] font-semibold leading-none tracking-[-0.055em] text-[#202124]">
              Applicants
            </h1>
            <p className="mt-5 max-w-2xl text-[1rem] leading-7 text-[#5F6368]">
              {pageLoading
                ? 'Loading your applicant queue...'
                : selectedRole
                  ? `Review ${totalApplicants} applicant${totalApplicants !== 1 ? 's' : ''} for ${selectedRole.title}.`
                  : 'Choose a posted role to review its applicants.'}
            </p>
          </div>
          <img
            src={ngoApplicantsImg}
            alt=""
            className="pointer-events-none relative z-0 w-full max-w-sm select-none lg:max-w-md"
          />
        </div>
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

      <div className="relative z-10 -mt-8">
      <RolesList
        roles={roles}
        selectedRoleId={selectedRoleId}
        onSelectRole={handleSelectRole}
        loading={rolesLoading || !initialLoadDone}
      />
      </div>

      {/* Main layout */}
      <div className="mx-auto grid w-full max-w-[1760px] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_780px]">
        <ApplicantsList
          applicants={applicants}
          selectedId={selected?.id}
          onSelectApplicant={handleSelectApplicant}
          statuses={statuses}
          loading={pageLoading}
          searchQuery={applicantSearch}
          selectedRoleTitle={selectedRole?.title ?? null}
        />

        <div className="min-w-0">
          <ApplicantDetail
            applicant={selected}
            loading={pageLoading}
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
