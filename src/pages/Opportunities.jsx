import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { submitApplication } from '../services/applications'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, Users, BarChart2, Search,
  MapPin, Bookmark as BookmarkIcon, Plus, Send, Sparkles, RefreshCw,
  X, CheckCircle2, Clock, ChevronRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchActiveOpportunities, fetchNgoOpportunities } from '../services/opportunities'
import { fetchSavedIds, saveOpportunity, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'

const CATEGORIES = ['All','Technology','Education','Environment','Healthcare','Youth Services','Accessibility']

function generateAppMessage(user, ngo) {
  const name = user?.name || 'I'
  const first = name.split(' ')[0]
  const profile = user
  const field = profile?.field || 'my field'
  const skills = Array.isArray(profile?.skills)
    ? profile.skills.slice(0,2).join(' and ')
    : 'relevant skills'
  return `Hi ${ngo.name} team,\n\nMy name is ${first} and I'm studying ${field}. I came across your opportunity through Hive and I'd love to contribute to your mission.\n\n${ngo.mission}\n\nMy background in ${skills} means I can contribute meaningfully from day one. I'm drawn to the chance to create real impact — not just build a portfolio, but genuinely help people.\n\nI'm available flexibly and excited about the possibility of working together.\n\nLooking forward to hearing from you,\n${first}`
}

// ─── Opportunity Detail Modal ────────────────────────────────────────────────

function OpportunityDetailModal({ opp, onClose, onApply }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(10,18,48,0.7)', backdropFilter:'blur(12px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity:0, scale:0.95, y:30 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95 }} transition={{ type:'spring', stiffness:360, damping:30 }}
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight:'90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header Section */}
        <div className="sticky top-0 bg-white border-b border-[rgba(13,24,61,0.08)] px-8 py-7 flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-[#0D183D] mb-2 leading-tight">{opp.title}</h1>
            <div className="flex items-center gap-4">
              <GradientAvatar name={opp.orgName} size={40} radius="0.625rem"/>
              <div>
                <p className="text-[14px] font-semibold text-[#0D183D]">{opp.orgName}</p>
                {opp.category && <p className="text-[12px] text-[#4B6382]">{opp.category}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 flex-shrink-0">
            <Link to={`/ngo-profile/${opp.ngoId}`}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] transition-colors whitespace-nowrap">
              View NGO
            </Link>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors text-[#4B6382]">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="space-y-8">

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {opp.workMode && (
                <div className="bg-[#F8F9FB] rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase text-[#4B6382] mb-1.5">Work Mode</p>
                  <p className="text-[14px] font-semibold text-[#0D183D]">{opp.workMode}</p>
                </div>
              )}
              {opp.location && (
                <div className="bg-[#F8F9FB] rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase text-[#4B6382] mb-1.5">Location</p>
                  <p className="text-[14px] font-semibold text-[#0D183D]">{opp.location}</p>
                </div>
              )}
              {opp.weeklyHours && (
                <div className="bg-[#F8F9FB] rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase text-[#4B6382] mb-1.5">Hours/Week</p>
                  <p className="text-[14px] font-semibold text-[#0D183D]">{opp.weeklyHours}</p>
                </div>
              )}
              {opp.duration && (
                <div className="bg-[#F8F9FB] rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase text-[#4B6382] mb-1.5">Duration</p>
                  <p className="text-[14px] font-semibold text-[#0D183D]">{opp.duration}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {opp.description && (
              <div>
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">About this opportunity</h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">{opp.description}</p>
              </div>
            )}

            {/* Mission Impact */}
            {opp.missionImpact && (
              <div>
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">Mission & impact</h2>
                <p className="text-[14px] leading-relaxed text-[#4B6382] whitespace-pre-wrap">{opp.missionImpact}</p>
              </div>
            )}

            {/* Skills */}
            {opp.skills?.length > 0 && (
              <div>
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">Required skills</h2>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.map((s, i) => {
                    const skillName = typeof s === 'string' ? s : s.name
                    const skillLevel = typeof s === 'object' && s.level ? s.level : ''
                    return (
                      <span key={i} className="px-3 py-2 rounded-lg text-[13px] font-medium bg-[#FFB703]/10 text-[#92610a] border border-[#FFB703]/20">
                        {skillLevel ? `${skillName} · ${skillLevel}` : skillName}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Languages */}
            {opp.languages?.length > 0 && (
              <div>
                <h2 className="text-[16px] font-bold text-[#0D183D] mb-3">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {opp.languages.map((lang, i) => (
                    <span key={i} className="px-3 py-2 rounded-lg text-[13px] font-medium bg-[#3B82F6]/10 text-[#1E40AF] border border-[#3B82F6]/20">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 border-t border-[rgba(13,24,61,0.08)] bg-white px-8 py-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl text-[14px] font-semibold border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] transition-colors">
            Cancel
          </button>
          <button onClick={onApply}
            className="flex-1 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background:'#FFB703', boxShadow: '0 4px 16px rgba(255,183,3,0.25)' }}>
            Apply now
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────

function ApplyModal({ ngo, user, studentId, onClose }) {
  const [step, setStep]     = useState('form')
  const [message, setMsg]   = useState(() => generateAppMessage(user, ngo))
  const [links, setLinks]   = useState({ linkedin:'', github:'', portfolio:'' })
  const [avail, setAvail]   = useState('')
  const [gen, setGen]       = useState(false)
  const [focusKey, setFocus] = useState(null)

  const AVAIL_OPTIONS = ['Immediately','1–5 hrs/week','5–10 hrs/week','10–15 hrs/week','15–20 hrs/week','20+ hrs/week']

  function regen() {
    setGen(true)
    setTimeout(() => { setMsg(generateAppMessage(user, ngo)); setGen(false) }, 600)
  }

  async function submit() {
    try {
      await submitApplication({
        studentId:     studentId,
        opportunityId: ngo.opportunityId ?? null,
        ngoId:         ngo.ngoId ?? String(ngo.id),
        message,
        availability:  avail,
        links,
      })
    } catch (err) {
      console.error('Apply error:', err)
    }
    setStep('success')
  }

  const iStyle = k => ({ background:'white', color:'#0D183D', border:`1.5px solid ${focusKey===k?'#FFB703':'rgba(13,24,61,0.1)'}` })

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(10,18,48,0.5)', backdropFilter:'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity:0, scale:0.97, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.97 }} transition={{ type:'spring', stiffness:360, damping:30 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow:'0 24px 80px rgba(10,18,48,0.25)', maxHeight:'90vh' }}
        onClick={e => e.stopPropagation()}>

        {step === 'success' ? (
          <div className="flex flex-col items-center text-center px-8 py-10">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:'spring', stiffness:280, damping:18, delay:0.1 }}
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
              style={{ background:'rgba(16,185,129,0.1)' }}>
              <CheckCircle2 size={32} className="text-emerald-500"/>
            </motion.div>
            <h2 className="text-[1.3rem] font-extrabold text-[#0D183D] mb-2">Application sent!</h2>
            <p className="text-[13px] text-[#4B6382] mb-2">Your application to <strong>{ngo.name}</strong> is on its way.</p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background:'rgba(255,183,3,0.08)', border:'1px solid rgba(255,183,3,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"/>
              <span className="text-[12px] font-semibold" style={{ color:'#D99E00' }}>Status: Under Review</span>
            </div>
            <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[13px] font-semibold text-white hover:opacity-90"
              style={{ background:'#0D183D' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-5 pb-4 shrink-0"
              style={{ background:'linear-gradient(160deg,#FFF7E6,#F0EEFF)', borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-black/[0.06]">
                <X size={14}/>
              </button>
              <div className="flex items-center gap-3">
                <GradientAvatar name={ngo.name} size={44} radius="0.75rem"/>
                <div>
                  <p className="text-[15px] font-extrabold text-[#0D183D]">Apply to {ngo.name}</p>
                  <p className="text-[12px] text-[#4B6382]">{ngo.cat} · {ngo.loc} · {ngo.match}% match</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background:'#FFB703' }}>
                      <Sparkles size={11} className="text-white"/>
                    </div>
                    <p className="text-[12px] font-extrabold text-[#0D183D]">AI-generated message</p>
                  </div>
                  <button onClick={regen} className={`flex items-center gap-1 text-[11px] font-semibold ${gen?'opacity-50':''}`} style={{ color:'#FFB703' }}>
                    <RefreshCw size={11} className={gen?'animate-spin':''}/> Regenerate
                  </button>
                </div>
                <textarea value={message} onChange={e => setMsg(e.target.value)} rows={7}
                  onFocus={()=>setFocus('msg')} onBlur={()=>setFocus(null)}
                  className="w-full px-4 py-3 rounded-xl text-[12px] outline-none resize-none"
                  style={{ ...iStyle('msg'), lineHeight:1.65 }}/>
                <p className="text-[10px] text-[#4B6382] mt-1">✏️ Edit freely before sending.</p>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[#0D183D] mb-2">Availability</p>
                <div className="flex flex-wrap gap-2">
                  {AVAIL_OPTIONS.map(a => (
                    <button key={a} onClick={() => setAvail(a)}
                      className="px-3.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all"
                      style={avail===a?{background:'#0D183D',color:'white',borderColor:'#0D183D'}:{background:'white',color:'#4B6382',borderColor:'rgba(13,24,61,0.1)'}}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="text-[12px] font-semibold text-[#0D183D]">Links <span className="text-[11px] font-normal text-[#4B6382]">(optional)</span></p>
                {[{k:'linkedin',lbl:'LinkedIn'},{k:'github',lbl:'GitHub'},{k:'portfolio',lbl:'Portfolio'}].map(({k,lbl}) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="text-[11px] text-[#4B6382] w-16 shrink-0">{lbl}</span>
                    <input value={links[k]} onChange={e=>setLinks(l=>({...l,[k]:e.target.value}))}
                      placeholder={`${lbl} URL`}
                      onFocus={()=>setFocus(k)} onBlur={()=>setFocus(null)}
                      className="flex-1 px-3 py-2.5 rounded-xl text-[12px] outline-none placeholder-[#4B6382]/40"
                      style={iStyle(k)}/>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 px-6 py-4 border-t flex gap-3"
              style={{ borderColor:'rgba(13,24,61,0.08)', background:'#FAFAFA' }}>
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-[13px] font-semibold border text-[#4B6382] hover:bg-[rgba(13,24,61,0.03)] transition-colors" style={{ borderColor:'rgba(13,24,61,0.12)' }}>Cancel</button>
              <button onClick={submit} className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background:'#FFB703', boxShadow:'0 4px 16px rgba(255,183,3,0.3)', flex:2 }}>
                <Send size={13}/> Submit application →
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function skillName(s) { return typeof s === 'string' ? s : (s?.name ?? '') }

export default function Opportunities() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const filterNgoId = searchParams.get('ngo')
  const isNGO = user?.role === 'ngo'

  const [q, setQ]           = useState('')
  const [cat, setCat]       = useState('All')
  const [opps, setOpps]     = useState([])
  const [ngoOpps, setNgoOpps]   = useState([])
  const [ngoError, setNgoError] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [toggling, setToggling] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [viewingOpp, setViewingOpp] = useState(null)
  const [applyingTo, setApplyingTo] = useState(null)

  // Fetch NGO's own opportunities
  useEffect(() => {
    if (!isNGO || !user?.id) return
    setLoading(true)
    setNgoError(null)
    fetchNgoOpportunities(user.id)
      .then(data => setNgoOpps(data ?? []))
      .catch(err => {
        console.error('[Opportunities] fetchNgoOpportunities error:', err.message)
        setNgoError(err.message)
      })
      .finally(() => setLoading(false))
  }, [isNGO, user?.id])

  // Fetch active opportunities for students
  useEffect(() => {
    if (isNGO) return
    setLoading(true)
    Promise.all([
      fetchActiveOpportunities(),
      user?.id ? fetchSavedIds(user.id) : Promise.resolve(new Set()),
    ]).then(([raw, ids]) => {
      const cards = raw.map(opp => ({
        id:            opp.id,
        ngoId:         opp.ngoId,
        opportunityId: opp.id,
        name:          opp.orgName,
        cat:           opp.category  ?? '',
        loc:           opp.location  ?? '',
        hours:         opp.weeklyHours ? `${opp.weeklyHours} hrs/wk` : 'Flexible',
        workMode:      opp.workMode ?? '',
        desc:          opp.description || opp.missionImpact || '',
        skills:        (opp.skills ?? []).slice(0, 4).map(skillName).filter(Boolean),
        match:         profile ? computeMatch(profile, opp).score : null,
        mission:       opp.missionImpact || opp.description || '',
      }))
      setOpps(cards)
      setSavedIds(ids)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [isNGO, user?.id, profile])

  async function toggleSave(opp) {
    if (!user?.id || toggling) return
    setToggling(opp.id)
    const isSaved = savedIds.has(opp.id)
    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev)
      isSaved ? next.delete(opp.id) : next.add(opp.id)
      return next
    })
    try {
      if (isSaved) await unsaveOpportunity(user.id, opp.id)
      else         await saveOpportunity(user.id, opp.id)
    } catch {
      // Revert on error
      setSavedIds(prev => {
        const next = new Set(prev)
        isSaved ? next.add(opp.id) : next.delete(opp.id)
        return next
      })
    } finally {
      setToggling(null)
    }
  }

  const filtered = opps.filter(n =>
    (cat === 'All' || n.cat === cat) &&
    (n.name.toLowerCase().includes(q.toLowerCase()) || n.desc.toLowerCase().includes(q.toLowerCase())) &&
    (!filterNgoId || n.ngoId === filterNgoId)
  )

  return (
    <>
      <div className="max-w-5xl mx-auto px-8 py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#0D183D] mb-2">
              {isNGO ? 'Your Opportunities' : 'Browse Opportunities'}
            </h1>
            <p className="text-[15px] text-[#4B6382]">
              {isNGO ? 'Manage your posted opportunities and track applicants' : 'Discover volunteer roles that match your skills'}
            </p>
          </div>
          {isNGO && (
            <button onClick={() => navigate('/opportunities/new')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background:'#FFB703', boxShadow:'0 4px 14px rgba(255,183,3,0.28)' }}>
              <Plus size={14}/> Post opportunity
            </button>
          )}
        </div>

        {isNGO ? (
          /* NGO view — real data from Supabase */
          loading ? (
            <div className="flex flex-col gap-3">
              {[0,1,2].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-6 py-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/3 rounded-full bg-[rgba(13,24,61,0.07)]"/>
                      <div className="h-2.5 w-1/4 rounded-full bg-[rgba(13,24,61,0.05)]"/>
                    </div>
                    <div className="h-8 w-24 rounded-xl bg-[rgba(13,24,61,0.05)]"/>
                  </div>
                </div>
              ))}
            </div>
          ) : ngoError ? (
            <div className="text-center py-16">
              <p className="text-[14px] font-semibold text-[#0D183D] mb-1">Could not load opportunities</p>
              <p className="text-[12px] text-[#EF4444] mb-4 max-w-sm mx-auto">{ngoError}</p>
              <button onClick={() => { setNgoError(null); setLoading(true); fetchNgoOpportunities(user.id).then(d => setNgoOpps(d ?? [])).catch(e => setNgoError(e.message)).finally(() => setLoading(false)) }}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: '#0D183D' }}>Retry</button>
            </div>
          ) : ngoOpps.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(255,183,3,0.1)' }}>
                <Briefcase size={24} style={{ color: '#FFB703' }}/>
              </div>
              <p className="text-[15px] font-extrabold text-[#0D183D] mb-1">No opportunities yet</p>
              <p className="text-[13px] text-[#4B6382] mb-5">Post your first opportunity to start receiving applications from students.</p>
              <button onClick={() => navigate('/opportunities/new')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white mx-auto transition-all hover:opacity-90"
                style={{ background:'#FFB703', boxShadow:'0 4px 14px rgba(255,183,3,0.28)' }}>
                <Plus size={14}/> Post your first opportunity
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ngoOpps.map((opp, i) => (
                <motion.div key={opp.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.05, duration:0.28 }}
                  className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-6 py-4 flex items-center gap-5 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-bold text-[14px] text-[#0D183D] truncate">{opp.title}</p>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        opp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        opp.status === 'draft'  ? 'bg-[#F8F9FB] text-[#4B6382] border border-[rgba(13,24,61,0.1)]' :
                        opp.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                        'bg-[#F8F9FB] text-[#4B6382]'
                      }`}>{opp.status ?? 'draft'}</span>
                    </div>
                    <p className="text-[12px] text-[#4B6382]">
                      {opp.category ? `${opp.category} · ` : ''}
                      {opp.location ? `${opp.location} · ` : ''}
                      {opp.applicantCount ?? 0} applicant{(opp.applicantCount ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/opportunities/new?edit=${opp.id}`)}
                      className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.1)] hover:bg-[#F8F9FB] transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={() => navigate('/applicants')}
                      className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                      style={{ background:'#0D183D' }}>
                      Applicants
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* Student view */
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-2xl bg-white border border-[rgba(13,24,61,0.08)]">
                <Search size={14} className="text-[#4B6382] shrink-0"/>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search NGOs by name or skill…"
                  className="flex-1 bg-transparent text-[13px] text-[#0D183D] outline-none placeholder-[#4B6382]/50"/>
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                      cat===c ? 'text-white' : 'text-[#4B6382] bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB]'
                    }`}
                    style={cat===c ? { background:'#0D183D' } : {}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 animate-pulse">
                    <div className="flex gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-[rgba(13,24,61,0.06)]"/>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded-lg bg-[rgba(13,24,61,0.06)]"/>
                        <div className="h-3 w-1/2 rounded-lg bg-[rgba(13,24,61,0.04)]"/>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 w-1/3 rounded-lg bg-[rgba(13,24,61,0.04)]"/>
                      <div className="h-3 w-full rounded-lg bg-[rgba(13,24,61,0.04)]"/>
                      <div className="h-3 w-5/6 rounded-lg bg-[rgba(13,24,61,0.04)]"/>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 rounded-lg bg-[rgba(13,24,61,0.04)]"/>
                      <div className="h-6 w-20 rounded-lg bg-[rgba(13,24,61,0.04)]"/>
                    </div>
                    <div className="h-10 rounded-lg bg-[rgba(13,24,61,0.04)]"/>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(255,183,3,0.1)' }}>
                  <Briefcase size={32} className="text-[#FFB703]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#0D183D] mb-2">No opportunities found</h3>
                <p className="text-[14px] text-[#4B6382] mb-8">Try adjusting your filters or search terms to find more opportunities</p>
                <button onClick={() => { setQ(''); setCat('All') }}
                  className="px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: '#0D183D' }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((ngo, i) => (
                  <motion.div key={ngo.id}
                    initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.05, duration:0.3 }}
                    onClick={() => setViewingOpp(ngo)}
                    className="bg-white rounded-2xl border border-[rgba(13,24,61,0.1)] p-6 flex flex-col gap-4 hover:shadow-[0_12px_40px_rgba(13,24,61,0.1)] hover:border-[rgba(13,24,61,0.15)] transition-all duration-200 cursor-pointer group">

                    {/* Top: Logo + Title + Save */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <GradientAvatar name={ngo.name} size={56} radius="0.875rem"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold text-[#0D183D] leading-tight mb-1 line-clamp-2 group-hover:text-[#FFB703] transition-colors">
                          {ngo.title}
                        </h3>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/ngo-profile/${ngo.ngoId}`) }}
                          className="text-[12px] font-semibold text-[#FFB703] hover:text-[#D99E00] transition-colors">
                          {ngo.name}
                        </button>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSave(ngo) }}
                        disabled={toggling === ngo.id}
                        className="p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors shrink-0 disabled:opacity-40">
                        <BookmarkIcon size={18} className={
                          savedIds.has(ngo.id) ? 'fill-[#FFB703] text-[#FFB703]' : 'text-[#4B6382]'
                        }/>
                      </button>
                    </div>

                    {/* Match + Meta info row */}
                    <div className="flex items-center flex-wrap gap-2.5">
                      {ngo.match !== null && (
                        <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">
                          {ngo.match}% match
                        </span>
                      )}
                      <div className="flex items-center gap-3 flex-wrap text-[12px] text-[#4B6382]">
                        {ngo.loc && (
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <MapPin size={13} className="text-[#FFB703]" />
                            {ngo.loc}
                          </span>
                        )}
                        {ngo.hours && (
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Clock size={13} className="text-[#FFB703]" />
                            {ngo.hours}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {ngo.desc && (
                      <p className="text-[13px] text-[#4B6382] leading-relaxed line-clamp-2 flex-1">
                        {ngo.desc}
                      </p>
                    )}

                    {/* Skills - Formatted properly */}
                    {ngo.skills && ngo.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {ngo.skills.slice(0, 3).map((s, idx) => {
                          const skillName = typeof s === 'string' ? s : s.name
                          const skillLevel = typeof s === 'object' && s.level ? s.level : ''
                          return (
                            <span key={idx} className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] text-[#4B6382] border border-[rgba(13,24,61,0.06)]">
                              {skillLevel ? `${skillName} · ${skillLevel}` : skillName}
                            </span>
                          )
                        })}
                        {ngo.skills.length > 3 && (
                          <span className="text-[11px] font-medium px-2.5 py-1.5 text-[#4B6382]">
                            +{ngo.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Details Button */}
                    <button onClick={(e) => { e.stopPropagation(); setViewingOpp(ngo) }}
                      className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 mt-2"
                      style={{ background:'#FFB703', boxShadow: '0 4px 16px rgba(255,183,3,0.25)' }}>
                      View details
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {viewingOpp && (
          <OpportunityDetailModal
            key="detail"
            opp={viewingOpp}
            onClose={() => setViewingOpp(null)}
            onApply={() => { setViewingOpp(null); setApplyingTo(viewingOpp) }}
          />
        )}
      </AnimatePresence>

      {/* Apply modal */}
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
    </>
  )
}
