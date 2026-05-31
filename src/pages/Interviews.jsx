import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Sparkles, RefreshCw, BookOpen, Mic,
  CheckCircle2, Video, Phone, Users, ChevronDown, ChevronUp,
  MapPin, X, Check,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STUDENT_UPCOMING = []

const NGO_INTERVIEWS = []

const STUDENT_QUESTIONS = [
  { id: 1, q: 'Tell me about a project where you had to learn a new skill quickly. How did you approach it?', cat: 'Adaptability', done: true },
  { id: 2, q: 'Describe a time you worked on a team with conflicting priorities. How did you resolve it?', cat: 'Teamwork', done: true },
  { id: 3, q: 'How would you explain a complex technical concept to a non-technical stakeholder?', cat: 'Communication', done: false },
  { id: 4, q: 'What does meaningful impact mean to you, and how does this role align with that?', cat: 'Motivation', done: false },
  { id: 5, q: 'Walk me through your strongest project. What were the biggest challenges?', cat: 'Technical', done: false },
]

const TIPS = [
  { icon: '📋', title: 'Research the NGO',        desc: 'Read their annual report and recent news before the call.' },
  { icon: '💡', title: 'Prepare STAR stories',     desc: 'Situation, Task, Action, Result for each answer.'        },
  { icon: '❓', title: 'Prepare your own questions', desc: 'Ask about team culture, impact measurement, day-to-day.'  },
  { icon: '⏰', title: 'Join 5 minutes early',     desc: 'Test your camera and mic before the interview starts.'   },
]

const TYPE_ICON = { video: Video, phone: Phone, onsite: MapPin }
const STATUS_STYLE = {
  confirmed: { label: 'Confirmed', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  pending:   { label: 'Pending',   color: 'text-[#D99E00]',   bg: 'bg-amber-50'   },
  cancelled: { label: 'Cancelled', color: 'text-red-500',     bg: 'bg-red-50'     },
  completed: { label: 'Completed', color: 'text-[#4B6382]',   bg: 'bg-[#F8F9FB]'  },
}

// ─── Student view ─────────────────────────────────────────────────────────────

function StudentView() {
  const [done, setDone]         = useState(new Set(STUDENT_QUESTIONS.filter(q => q.done).map(q => q.id)))
  const [expanded, setExpanded] = useState(null)
  const progress = Math.round((done.size / STUDENT_QUESTIONS.length) * 100)

  return (
    <>
      {/* Upcoming interviews */}
      <section className="mb-8">
        <h2 className="text-[12px] font-extrabold text-[#0D183D] uppercase tracking-widest mb-3">Upcoming interviews</h2>
        <div className="flex flex-col gap-3">
          {STUDENT_UPCOMING.map((u, i) => {
            const TypeIcon = TYPE_ICON[u.type] || Video
            const st = STATUS_STYLE[u.status]
            return (
              <motion.div key={u.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.07 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-5 py-4 flex items-center gap-5 hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)] transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'rgba(255,183,3,0.1)' }}>
                  <Calendar size={18} style={{ color:'#FFB703' }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-[13px] font-bold text-[#0D183D]">{u.ngo}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="text-[11px] text-[#4B6382]">{u.role}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-[#4B6382]">
                    <span className="flex items-center gap-1"><Calendar size={10}/> {u.date} at {u.time}</span>
                    <span className="flex items-center gap-1"><TypeIcon size={10}/> {u.type}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-[10px] text-[#4B6382] mb-1">Prep score</p>
                  <p className="text-[17px] font-extrabold" style={{ color: u.prep >= 70 ? '#10B981' : '#FFB703' }}>{u.prep}%</p>
                </div>
                <button className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                  style={{ background:'#0D183D' }}>
                  Prepare
                </button>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Practice session */}
      <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[14px] font-extrabold text-[#0D183D]">Practice session</p>
            <p className="text-[12px] text-[#4B6382] mt-0.5">Tailored for your Elem interview</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(255,183,3,0.1)' }}>
              <Sparkles size={16} style={{ color:'#FFB703' }}/>
            </div>
            <span className="text-[20px] font-extrabold text-[#0D183D]">{progress}%</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full mb-2" style={{ background:'rgba(13,24,61,0.07)' }}>
          <motion.div className="h-2 rounded-full" style={{ background:'#FFB703' }}
            initial={{ width:0 }} animate={{ width:`${progress}%` }}
            transition={{ duration:0.8, ease:'easeOut', delay:0.2 }}/>
        </div>
        <p className="text-[11px] text-[#4B6382]">{done.size} of {STUDENT_QUESTIONS.length} questions practiced</p>
      </div>

      {/* Question bank */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] font-extrabold text-[#0D183D] uppercase tracking-widest">Practice questions</h2>
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4B6382] hover:text-[#0D183D] transition-colors">
            <RefreshCw size={12}/> Refresh
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {STUDENT_QUESTIONS.map((q, i) => (
            <motion.div key={q.id}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.06 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#F8F9FB] transition-colors">
                <button
                  onClick={e => { e.stopPropagation(); setDone(s => { const n = new Set(s); n.has(q.id) ? n.delete(q.id) : n.add(q.id); return n }) }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${done.has(q.id) ? 'bg-emerald-500 border-emerald-500' : 'border-[rgba(13,24,61,0.2)]'}`}>
                  {done.has(q.id) && <Check size={11} strokeWidth={3} className="text-white"/>}
                </button>
                <p className="flex-1 text-[13px] font-medium text-[#0D183D] leading-snug">{q.q}</p>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8F9FB] text-[#4B6382]">{q.cat}</span>
                {expanded === q.id ? <ChevronUp size={14} className="text-[#4B6382] shrink-0"/> : <ChevronDown size={14} className="text-[#4B6382] shrink-0"/>}
              </button>
              <AnimatePresence>
                {expanded === q.id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                    transition={{ duration:0.2 }}
                    className="px-5 pb-4 overflow-hidden" style={{ borderTop:'1px solid rgba(13,24,61,0.06)' }}>
                    <div className="flex gap-3 mt-3">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                        style={{ background:'#FFB703' }}>
                        <Mic size={12}/> Practice aloud
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.1)] hover:bg-[#F8F9FB] transition-colors">
                        <BookOpen size={12}/> See tips
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interview tips */}
      <section>
        <h2 className="text-[12px] font-extrabold text-[#0D183D] uppercase tracking-widest mb-3">Interview tips</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {TIPS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.3 + i*0.06 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-4 flex items-start gap-3">
              <span className="text-xl shrink-0">{t.icon}</span>
              <div>
                <p className="text-[13px] font-bold text-[#0D183D] mb-0.5">{t.title}</p>
                <p className="text-[12px] text-[#4B6382] leading-relaxed">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}

// ─── NGO view ─────────────────────────────────────────────────────────────────

function NGOView() {
  const [expanded, setExpanded]   = useState(null)
  const [statuses, setStatuses]   = useState(() => Object.fromEntries(NGO_INTERVIEWS.map(i => [i.id, i.status])))
  const [toast, setToast]         = useState(null)

  function confirm(id) {
    setStatuses(s => ({ ...s, [id]: 'confirmed' }))
    setToast('Interview confirmed')
    setTimeout(() => setToast(null), 2200)
  }
  function cancel(id) {
    setStatuses(s => ({ ...s, [id]: 'cancelled' }))
    setToast('Interview cancelled')
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <>
      {/* Summary chips */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: `${NGO_INTERVIEWS.length} scheduled`, color: '#6366F1' },
          { label: `${Object.values(statuses).filter(s=>s==='confirmed').length} confirmed`, color: '#10B981' },
          { label: `${Object.values(statuses).filter(s=>s==='pending').length} awaiting`, color: '#D99E00' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border"
            style={{ borderColor:`${color}30`, background:`${color}12`, color }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:color }}/>
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {NGO_INTERVIEWS.map((iv, i) => {
          const st = STATUS_STYLE[statuses[iv.id]]
          const isOpen = expanded === iv.id
          const TypeIcon = TYPE_ICON[iv.type] || Video
          return (
            <motion.div key={iv.id}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.07 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)] transition-shadow">

              {/* Card header */}
              <div className="px-5 py-4 flex items-center gap-4">
                <GradientAvatar name={iv.candidate} size={44} radius="0.65rem"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-[13px] font-bold text-[#0D183D]">{iv.candidate}</p>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.color}`}>{st.label}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">{iv.score}%</span>
                  </div>
                  <p className="text-[11px] text-[#4B6382] mb-1 truncate">{iv.field} · {iv.role}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#4B6382]">
                    <span className="flex items-center gap-1"><Calendar size={10}/> {iv.date} at {iv.time}</span>
                    <span className="flex items-center gap-1"><TypeIcon size={10}/> {iv.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statuses[iv.id] === 'pending' && (
                    <button onClick={() => confirm(iv.id)}
                      className="px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                      style={{ background:'#10B981' }}>
                      Confirm
                    </button>
                  )}
                  {statuses[iv.id] === 'confirmed' && (
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                      <CheckCircle2 size={13}/> Confirmed
                    </span>
                  )}
                  <button onClick={() => setExpanded(isOpen ? null : iv.id)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-semibold border text-[#0D183D] hover:bg-[#F8F9FB] transition-colors border-[rgba(13,24,61,0.1)]">
                    {isOpen ? 'Hide' : 'AI Questions'}
                  </button>
                </div>
              </div>

              {/* AI questions panel */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                    transition={{ duration:0.22 }}
                    className="overflow-hidden"
                    style={{ borderTop:'1px solid rgba(13,24,61,0.07)', background:'rgba(255,183,3,0.02)' }}>
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background:'#FFB703' }}>
                          <Sparkles size={11} strokeWidth={2.5} className="text-white"/>
                        </div>
                        <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color:'#D99E00' }}>
                          AI-generated questions for this candidate
                        </p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {iv.questions.map((q, qi) => (
                          <motion.div key={qi}
                            initial={{ opacity:0, x:-4 }} animate={{ opacity:1, x:0 }}
                            transition={{ delay: qi*0.05 }}
                            className="rounded-xl p-3.5 text-[12px] text-[#4B6382] leading-relaxed"
                            style={{ background:'rgba(13,24,61,0.03)', border:'1px solid rgba(13,24,61,0.07)' }}>
                            <span className="font-extrabold mr-1.5" style={{ color:'#FFB703' }}>Q{qi+1}</span>
                            {q}
                          </motion.div>
                        ))}
                      </div>
                      {statuses[iv.id] !== 'cancelled' && (
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => cancel(iv.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors">
                            <X size={12}/> Cancel interview
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-[13px] font-semibold z-50 pointer-events-none"
            style={{ background:'#0D183D', boxShadow:'0 8px 24px rgba(13,24,61,0.3)' }}>
            <CheckCircle2 size={14}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Interviews() {
  const { user } = useApp()
  const isNGO = user?.role === 'ngo'

  return (
    <div className="max-w-4xl mx-auto px-8 py-7">
      <div className="mb-6">
        <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Interviews</h1>
        <p className="text-[13px] text-[#4B6382] mt-0.5">
          {isNGO
            ? 'Manage scheduled interviews and review AI-generated questions per candidate'
            : 'Prepare for upcoming interviews with AI-powered practice questions'}
        </p>
      </div>
      {isNGO ? <NGOView/> : <StudentView/>}
    </div>
  )
}
