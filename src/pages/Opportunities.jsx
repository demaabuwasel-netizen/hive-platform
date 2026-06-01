import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { fetchActiveOpportunities } from '../services/opportunities'
import { fetchSavedIds, saveOpportunity, unsaveOpportunity } from '../services/saved'
import { computeMatch } from '../services/matching'

// ─── Data ─────────────────────────────────────────────────────────────────────

const NGO_OPPORTUNITIES = []

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
  const isNGO = user?.role === 'ngo'

  const [q, setQ]           = useState('')
  const [cat, setCat]       = useState('All')
  const [opps, setOpps]     = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [toggling, setToggling] = useState(null) // opportunityId being toggled
  const [loading, setLoading]   = useState(true)
  const [applyingTo, setApplyingTo] = useState(null)

  useEffect(() => {
    if (isNGO) { setLoading(false); return }
    Promise.all([
      fetchActiveOpportunities(),
      user?.id ? fetchSavedIds(user.id) : Promise.resolve(new Set()),
    ]).then(([raw, ids]) => {
      const cards = raw.map(opp => ({
        id:      opp.id,
        ngoId:   opp.ngoId,
        opportunityId: opp.id,
        name:    opp.orgName,
        cat:     opp.category  ?? '',
        loc:     opp.location  ?? '',
        hours:   opp.weeklyHours ? `${opp.weeklyHours} hrs/wk` : 'Flexible',
        workMode: opp.workMode ?? '',
        desc:    opp.description || opp.missionImpact || '',
        skills:  (opp.skills ?? []).slice(0, 4).map(skillName).filter(Boolean),
        match:   profile ? computeMatch(profile, opp).score : null,
        mission: opp.missionImpact || opp.description || '',
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
    (n.name.toLowerCase().includes(q.toLowerCase()) || n.desc.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <>
      <div className="max-w-5xl mx-auto px-8 py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">
              {isNGO ? 'Your Opportunities' : 'Browse Opportunities'}
            </h1>
            <p className="text-[13px] text-[#4B6382] mt-0.5">
              {isNGO ? 'Manage your posted opportunities and track applicants' : 'Discover NGOs looking for your skills'}
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
          /* NGO view */
          <div className="flex flex-col gap-3">
            {NGO_OPPORTUNITIES.map((opp, i) => (
              <motion.div key={opp.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.06, duration:0.3 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-6 py-4 flex items-center gap-5 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-bold text-[14px] text-[#0D183D]">{opp.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      opp.status==='Active' ? 'bg-emerald-100 text-emerald-700' :
                      opp.status==='Paused' ? 'bg-amber-100 text-amber-700' : 'bg-[#F8F9FB] text-[#4B6382]'
                    }`}>{opp.status}</span>
                  </div>
                  <p className="text-[12px] text-[#4B6382]">{opp.posted} · {opp.applicants} applicants · {opp.match} match score</p>
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
                    View applicants
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(13,24,61,0.06)]"/>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-2/3 rounded-full bg-[rgba(13,24,61,0.06)]"/>
                        <div className="h-2.5 w-1/2 rounded-full bg-[rgba(13,24,61,0.04)]"/>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="h-2.5 w-full rounded-full bg-[rgba(13,24,61,0.04)]"/>
                      <div className="h-2.5 w-4/5 rounded-full bg-[rgba(13,24,61,0.04)]"/>
                    </div>
                    <div className="h-8 rounded-xl bg-[rgba(13,24,61,0.04)]"/>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[14px] font-semibold text-[#0D183D] mb-1">No opportunities found</p>
                <p className="text-[13px] text-[#4B6382]">Try a different category or search term</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((ngo, i) => (
                  <motion.div key={ngo.id}
                    initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.05, duration:0.3 }}
                    className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 flex flex-col gap-3 hover:shadow-[0_4px_24px_rgba(13,24,61,0.08)] hover:-translate-y-0.5 transition-all duration-200">

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <GradientAvatar name={ngo.name} size={40} radius="0.65rem"/>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[#0D183D] leading-snug truncate">{ngo.name}</p>
                          <p className="text-[11px] text-[#4B6382]">{ngo.cat}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSave(ngo)}
                        disabled={toggling === ngo.id}
                        className="p-1.5 rounded-lg hover:bg-[#F8F9FB] transition-colors shrink-0 disabled:opacity-40"
                        aria-label={savedIds.has(ngo.id) ? 'Unsave' : 'Save'}>
                        <BookmarkIcon size={14} className={
                          savedIds.has(ngo.id) ? 'fill-[#FFB703] text-[#FFB703]' : 'text-[#4B6382]'
                        }/>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {ngo.match !== null && (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          {ngo.match}% match
                        </span>
                      )}
                      {ngo.loc && <span className="text-[11px] text-[#4B6382] flex items-center gap-1"><MapPin size={10}/>{ngo.loc}</span>}
                      {ngo.hours && <span className="text-[11px] text-[#4B6382] flex items-center gap-1"><Clock size={10}/>{ngo.hours}</span>}
                    </div>

                    <p className="text-[12px] text-[#4B6382] leading-relaxed flex-1 line-clamp-3">{ngo.desc}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {ngo.skills.map(s => (
                        <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[rgba(13,24,61,0.08)]"
                          style={{ background:'#F8F9FB', color:'#4B6382' }}>{s}</span>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setApplyingTo(ngo)}
                        className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-white text-center transition-all hover:opacity-90"
                        style={{ background:'#FFB703' }}>
                        Apply now →
                      </button>
                      <button onClick={() => navigate('/matches')}
                        className="px-3 py-2 rounded-xl border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] transition-colors">
                        <ChevronRight size={14}/>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

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
