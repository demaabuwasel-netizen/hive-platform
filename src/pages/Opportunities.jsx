import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { submitApplication } from '../services/applications'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Clock, Bookmark as BookmarkIcon, X, CheckCircle2,
  Globe, Zap, RefreshCw, ExternalLink, ChevronRight, AlertCircle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchActiveOpportunities, fetchNgoOpportunities } from '../services/opportunities'
import { fetchSavedIds, saveOpportunity, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'

const CATEGORIES = ['All', 'Technology', 'Education', 'Environment', 'Healthcare', 'Youth Services', 'Accessibility']

// ─── Skill Parser ──────────────────────────────────────────────────────────
function parseSkill(s) {
  if (!s) return { name: '', level: '' }
  if (typeof s === 'string') {
    if (s.startsWith('{')) {
      try {
        const parsed = JSON.parse(s)
        return { name: parsed.name || '', level: parsed.level || '' }
      } catch (e) {
        return { name: s, level: '' }
      }
    }
    return { name: s, level: '' }
  }
  if (typeof s === 'object') {
    if (s.name && typeof s.name === 'string' && s.name.startsWith('{')) {
      try {
        const nested = JSON.parse(s.name)
        return { name: nested.name || s.name, level: s.level || nested.level || '' }
      } catch (e) {
        return { name: s.name || '', level: s.level || '' }
      }
    }
    return { name: s.name || '', level: s.level || '' }
  }
  return { name: '', level: '' }
}

// ─── Skill Chip Component ──────────────────────────────────────────────────
function SkillChip({ skill }) {
  const { name, level } = parseSkill(skill)
  if (!name) return null
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/20">
      {level ? `${name} · ${level}` : name}
    </span>
  )
}

// ─── Info Pill Component ────────────────────────────────────────────────────
function InfoPill({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-[#FFB703] flex-shrink-0" />
      <span className="text-[13px] text-[#4B6382]">{value}</span>
    </div>
  )
}

// ─── Opportunity Card (Redesigned) ────────────────────────────────────────
function OpportunityCard({ opp, isSaved, onToggleSave, onViewDetails, toggling }) {
  const handleSaveClick = (e) => {
    e.stopPropagation()
    onToggleSave(opp)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 hover:shadow-lg hover:border-[rgba(13,24,61,0.12)] transition-all duration-200 cursor-pointer group"
      onClick={() => onViewDetails(opp)}
    >
      {/* Top Row: Logo + Title + Save */}
      <div className="flex gap-4 mb-4">
        <div className="flex-shrink-0">
          <GradientAvatar name={opp.name} size={48} radius="0.75rem" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-[#0D183D] leading-tight line-clamp-2 group-hover:text-[#FFB703] transition-colors">
            {opp.title}
          </h3>
          <p className="text-[13px] font-medium text-[#FFB703] mt-1">{opp.name}</p>
        </div>
        <button
          onClick={handleSaveClick}
          disabled={toggling === opp.id}
          className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors flex-shrink-0 disabled:opacity-50"
        >
          <BookmarkIcon
            size={18}
            className={isSaved ? 'fill-[#FFB703] text-[#FFB703]' : 'text-[#4B6382]'}
          />
        </button>
      </div>

      {/* Match Badge + Meta Row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {opp.match !== null && (
          <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">
            {opp.match}% match
          </span>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <InfoPill icon={MapPin} value={opp.loc} />
          <InfoPill icon={Globe} value={opp.workMode} />
          <InfoPill icon={Clock} value={opp.hours} />
        </div>
      </div>

      {/* Description Preview */}
      {opp.desc && (
        <p className="text-[13px] text-[#4B6382] leading-relaxed line-clamp-2 mb-4">
          {opp.desc}
        </p>
      )}

      {/* Skills */}
      {opp.skills && opp.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {opp.skills.slice(0, 3).map((s, idx) => (
            <SkillChip key={idx} skill={s} />
          ))}
          {opp.skills.length > 3 && (
            <span className="text-[11px] font-medium text-[#4B6382] px-2.5 py-1.5">
              +{opp.skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* View Details Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onViewDetails(opp)
        }}
        className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 bg-[#FFB703]"
      >
        View opportunity
      </button>
    </motion.div>
  )
}

// ─── Opportunity Details Modal (Redesigned) ──────────────────────────────
function OpportunityDetailModal({ opp, onClose, onApply, navigate }) {
  const infoItems = [
    { icon: MapPin, label: 'Location', value: opp.location },
    { icon: Globe, label: 'Work Mode', value: opp.workMode },
    { icon: Clock, label: 'Hours/Week', value: opp.weeklyHours },
    { icon: Zap, label: 'Duration', value: opp.duration },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[rgba(13,24,61,0.08)] px-8 py-6">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#FFB703] uppercase tracking-wider mb-2">
                {opp.orgName || opp.name}
              </p>
              <h1 className="text-[32px] font-bold text-[#0D183D] leading-tight mb-4">
                {opp.title}
              </h1>
              <div className="flex items-center gap-3">
                <GradientAvatar name={opp.orgName || opp.name} size={40} radius="0.625rem" />
                <div>
                  <p className="text-[14px] font-semibold text-[#0D183D]">
                    {opp.orgName || opp.name}
                  </p>
                  {opp.category && (
                    <p className="text-[12px] text-[#4B6382]">{opp.category}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to={`/ngo-profile/${opp.ngoId}`}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold bg-[#FFB703] text-white hover:opacity-90 transition-all whitespace-nowrap"
              >
                View NGO Profile
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors text-[#4B6382]"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {infoItems.map((item, idx) => (
              item.value && (
                <div
                  key={idx}
                  className="flex flex-col gap-1 px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[rgba(13,24,61,0.06)]"
                >
                  <p className="text-[10px] font-semibold text-[#4B6382] uppercase">
                    {item.label}
                  </p>
                  <p className="text-[13px] font-bold text-[#0D183D]">{item.value}</p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="space-y-8 max-w-2xl">
            {/* Description */}
            {opp.description && (
              <div>
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">About this role</h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {opp.description}
                </p>
              </div>
            )}

            {/* Mission Impact */}
            {opp.missionImpact && (
              <div>
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">Mission & impact</h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">
                  {opp.missionImpact}
                </p>
              </div>
            )}

            {/* Required Skills */}
            {opp.skills?.length > 0 && (
              <div>
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">Required skills</h2>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.map((s, i) => (
                    <SkillChip key={i} skill={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {opp.languages?.length > 0 && (
              <div>
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {opp.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="px-3 py-2 rounded-lg text-[13px] font-medium bg-[#3B82F6]/10 text-[#1E40AF] border border-[#3B82F6]/20"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-[rgba(13,24,61,0.08)] bg-white px-8 py-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl text-[14px] font-semibold border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-95 bg-[#FFB703]"
          >
            Apply now
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Apply Modal (Keep existing) ────────────────────────────────────────
function ApplyModal({ ngo, user, studentId, onClose }) {
  const [step, setStep] = useState('form')
  const [message, setMsg] = useState('')
  const [links, setLinks] = useState({ linkedin: '', github: '', portfolio: '' })
  const [avail, setAvail] = useState('')
  const [gen, setGen] = useState(false)

  const AVAIL_OPTIONS = ['Immediately', '1–5 hrs/week', '5–10 hrs/week', '10–15 hrs/week', '15–20 hrs/week', '20+ hrs/week']

  async function submit() {
    try {
      await submitApplication({
        studentId: studentId,
        opportunityId: ngo.opportunityId ?? null,
        ngoId: ngo.ngoId ?? String(ngo.id),
        message,
        availability: avail,
        links,
      })
    } catch (err) {
      console.error('Apply error:', err)
    }
    setStep('success')
  }

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 bg-emerald-50"
          >
            <CheckCircle2 size={32} className="text-emerald-500" />
          </motion.div>
          <h2 className="text-[24px] font-bold text-[#0D183D] mb-2">Application sent!</h2>
          <p className="text-[14px] text-[#4B6382] mb-6">
            Your application to <strong>{ngo.name}</strong> has been submitted.
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl text-[14px] font-semibold text-white bg-[#0D183D] hover:opacity-90 transition-all"
          >
            Done
          </button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 px-6 pt-5 pb-4 bg-gradient-to-br from-[#FFF7E6] to-[#F0EEFF] border-b border-[rgba(13,24,61,0.07)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/5 transition-colors text-[#4B6382]"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <GradientAvatar name={ngo.name} size={40} radius="0.75rem" />
            <div>
              <p className="text-[14px] font-bold text-[#0D183D]">Apply to {ngo.name}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-[12px] font-semibold text-[#0D183D] uppercase mb-2">Your message</p>
            <textarea
              value={message}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Tell them why you're interested..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-[rgba(13,24,61,0.1)] text-[13px] outline-none resize-none focus:ring-2 focus:ring-[#FFB703]/50 focus:border-[#FFB703]"
            />
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[#0D183D] uppercase mb-2">Availability</p>
            <div className="flex flex-wrap gap-2">
              {AVAIL_OPTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvail(a)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    avail === a
                      ? 'bg-[#0D183D] text-white'
                      : 'bg-white border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:border-[#FFB703]'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-[rgba(13,24,61,0.08)] bg-white px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-semibold border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!message.trim() || !avail}
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold text-white bg-[#FFB703] hover:opacity-90 disabled:opacity-50 transition-all"
          >
            Send application
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function Opportunities() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingOpp, setViewingOpp] = useState(null)
  const [applyingTo, setApplyingTo] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [toggling, setToggling] = useState(null)

  const filterNgoId = searchParams.get('ngo')

  // Fetch opportunities
  useEffect(() => {
    setLoading(true)

    Promise.all([
      fetchActiveOpportunities(),
      user?.id ? fetchSavedIds(user.id) : Promise.resolve(new Set()),
    ])
      .then(([raw, ids]) => {
        const cards = raw.map((opp) => ({
          id: opp.id,
          ngoId: opp.ngoId,
          opportunityId: opp.id,
          name: opp.orgName,
          title: opp.title,
          cat: opp.category ?? '',
          loc: opp.location ?? '',
          hours: opp.weeklyHours ? `${opp.weeklyHours} hrs/week` : '',
          workMode: opp.workMode ?? '',
          desc: opp.description || opp.missionImpact || '',
          skills: opp.skills ?? [],
          match: profile ? computeMatch(profile, opp).score : null,
          ...opp,
        }))
        setOpps(cards)
        setSavedIds(ids)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id, profile])

  const filtered = opps.filter(
    (n) =>
      (cat === 'All' || n.cat === cat) &&
      (n.title.toLowerCase().includes(q.toLowerCase()) ||
        n.name.toLowerCase().includes(q.toLowerCase()) ||
        n.desc.toLowerCase().includes(q.toLowerCase())) &&
      (!filterNgoId || n.ngoId === filterNgoId)
  )

  async function toggleSave(opp) {
    if (!user?.id) return
    setToggling(opp.id)
    try {
      if (savedIds.has(opp.id)) {
        await unsaveOpportunity(user.id, opp.id)
        setSavedIds((s) => new Set([...s].filter((id) => id !== opp.id)))
      } else {
        await saveOpportunity(user.id, opp.id)
        setSavedIds((s) => new Set([...s, opp.id]))
      }
    } catch (err) {
      console.error('Save toggle error:', err)
    }
    setToggling(null)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#0D183D] mb-2">Browse Opportunities</h1>
          <p className="text-[16px] text-[#4B6382]">
            Discover NGOs looking for your skills
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[rgba(13,24,61,0.08)] focus-within:ring-2 focus-within:ring-[#FFB703]/50">
            <Search size={18} className="text-[#4B6382] flex-shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by role, NGO, or skills…"
              className="flex-1 bg-transparent text-[14px] text-[#0D183D] outline-none placeholder-[#4B6382]/50"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all ${
                  cat === c
                    ? 'text-white bg-[#0D183D]'
                    : 'text-[#4B6382] bg-white border border-[rgba(13,24,61,0.08)] hover:border-[#FFB703]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 animate-pulse"
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[rgba(13,24,61,0.06)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-[rgba(13,24,61,0.06)]" />
                    <div className="h-3 w-1/2 rounded-lg bg-[rgba(13,24,61,0.04)]" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full rounded-lg bg-[rgba(13,24,61,0.04)]" />
                  <div className="h-3 w-5/6 rounded-lg bg-[rgba(13,24,61,0.04)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(255,183,3,0.1)' }}
            >
              <AlertCircle size={32} className="text-[#FFB703]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#0D183D] mb-2">No opportunities found</h3>
            <p className="text-[14px] text-[#4B6382] mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setQ('')
                setCat('All')
              }}
              className="px-6 py-3 rounded-xl text-[13px] font-semibold text-white bg-[#0D183D] hover:opacity-90 transition-all"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                isSaved={savedIds.has(opp.id)}
                onToggleSave={toggleSave}
                onViewDetails={setViewingOpp}
                toggling={toggling}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingOpp && (
          <OpportunityDetailModal
            key="detail"
            opp={viewingOpp}
            onClose={() => setViewingOpp(null)}
            onApply={() => {
              setViewingOpp(null)
              setApplyingTo(viewingOpp)
            }}
            navigate={navigate}
          />
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyingTo && (
          <ApplyModal
            key="apply"
            ngo={applyingTo}
            user={user}
            studentId={user?.id}
            onClose={() => setApplyingTo(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
