import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, Users, BarChart2,
  Calendar, Clock, Mic, ChevronRight, CheckCircle2, Play,
  Sparkles, RefreshCw, BookOpen,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

const STUDENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/dashboard/student' },
  { icon: Zap,             label: 'Matches',      to: '/matches'           },
  { icon: Briefcase,       label: 'Opportunities',to: '/opportunities'     },
  { icon: FileText,        label: 'Applications', to: '/applications'      },
  { icon: MessageSquare,   label: 'Interviews',   to: '/interviews'        },
  { icon: Bookmark,        label: 'Saved',        to: '/saved'             },
  { icon: MessageCircle,   label: 'Messages',     to: '/messages', badge:'3' },
  { icon: Settings,        label: 'Settings',     to: '/settings'          },
]
const NGO_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/dashboard/ngo'  },
  { icon: Briefcase,       label: 'Opportunities', to: '/opportunities'  },
  { icon: Users,           label: 'Applicants',    to: '/applicants'     },
  { icon: Zap,             label: 'Matches',       to: '/matches'        },
  { icon: MessageSquare,   label: 'Interviews',    to: '/interviews'     },
  { icon: BarChart2,       label: 'Analytics',     to: '/analytics'      },
  { icon: MessageCircle,   label: 'Messages',      to: '/messages', badge:'2' },
  { icon: Settings,        label: 'Settings',      to: '/settings'       },
]

const UPCOMING = [
  { id:1, ngo:'Elem – Youth in Distress', role:'Web Developer', date:'Tomorrow, 14:00', type:'Video call', prep:92 },
  { id:2, ngo:'BINA',                     role:'Content Lead',  date:'Fri, 10:30',       type:'Phone call', prep:68 },
]

const QUESTIONS = [
  { id:1, q:'Tell me about a project where you had to learn a new skill quickly. How did you approach it?', cat:'Adaptability', done:true },
  { id:2, q:'Describe a time you worked on a team project with conflicting priorities. How did you resolve it?', cat:'Teamwork', done:true },
  { id:3, q:'How would you explain a complex technical concept to a non-technical stakeholder?', cat:'Communication', done:false },
  { id:4, q:'What does meaningful impact mean to you, and how does this role align with that?', cat:'Motivation', done:false },
  { id:5, q:'Walk me through your strongest project. What were the biggest challenges and what did you learn?', cat:'Technical', done:false },
]

const TIPS = [
  { icon:'📋', title:'Research the NGO', desc:'Read their annual report and recent news before the call.' },
  { icon:'💡', title:'Prepare STAR stories', desc:'Situation, Task, Action, Result for each answer.' },
  { icon:'❓', title:'Prepare your own questions', desc:'Ask about team culture, day-to-day work, impact measurement.' },
  { icon:'⏰', title:'Join 5 minutes early', desc:'Test your camera and mic before the interview starts.' },
]

export default function Interviews() {
  const { user } = useApp()
  const isNGO = user?.role === 'ngo'
  const navItems = isNGO ? NGO_NAV : STUDENT_NAV
  const [done, setDone] = useState(new Set(QUESTIONS.filter(q=>q.done).map(q=>q.id)))
  const [expanded, setExpanded] = useState(null)

  const progress = Math.round((done.size / QUESTIONS.length) * 100)

  return (
      <div className="max-w-4xl mx-auto px-8 py-7">

        <div className="mb-6">
          <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Interviews</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">
            {isNGO ? 'Manage candidate interviews and track progress' : 'Prepare for upcoming interviews with AI-powered practice'}
          </p>
        </div>

        {/* Upcoming */}
        <div className="mb-8">
          <h2 className="text-[13px] font-extrabold text-[#0D183D] uppercase tracking-widest mb-3">Upcoming</h2>
          <div className="flex flex-col gap-3">
            {UPCOMING.map((u, i) => (
              <motion.div key={u.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.07 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-5 py-4 flex items-center gap-5 hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)] transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(255,183,3,0.1)' }}>
                  <Calendar size={16} style={{ color:'#FFB703' }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-bold text-[#0D183D]">{isNGO ? `Interview: ${u.role}` : u.ngo}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F8F9FB] text-[#4B6382]">{u.type}</span>
                  </div>
                  <p className="text-[11px] text-[#4B6382]">{u.date} · {isNGO ? 'Candidate: Ethan Galvin' : `Role: ${u.role}`}</p>
                </div>
                {!isNGO && (
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-[#4B6382] mb-1">Prep score</p>
                    <p className="text-[15px] font-extrabold" style={{ color: u.prep >= 80 ? '#10B981' : '#FFB703' }}>{u.prep}%</p>
                  </div>
                )}
                <button className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                  style={{ background:'#0D183D' }}>
                  {isNGO ? 'View profile' : 'Prepare'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {!isNGO && (
          <>
            {/* Practice progress */}
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[14px] font-extrabold text-[#0D183D]">Practice session</p>
                  <p className="text-[12px] text-[#4B6382] mt-0.5">Tailored for your Elem interview</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(255,183,3,0.1)' }}>
                    <Sparkles size={16} style={{ color:'#FFB703' }}/>
                  </div>
                  <span className="text-[18px] font-extrabold text-[#0D183D]">{progress}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full mb-2" style={{ background:'rgba(13,24,61,0.07)' }}>
                <motion.div className="h-2 rounded-full" style={{ background:'#FFB703' }}
                  initial={{ width:0 }} animate={{ width:`${progress}%` }}
                  transition={{ duration:0.8, ease:'easeOut', delay:0.2 }}/>
              </div>
              <p className="text-[11px] text-[#4B6382]">{done.size} of {QUESTIONS.length} questions practiced</p>
            </div>

            {/* Question bank */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-extrabold text-[#0D183D] uppercase tracking-widest">Practice Questions</h2>
                <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4B6382] hover:text-[#0D183D] transition-colors">
                  <RefreshCw size={12}/> Refresh
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {QUESTIONS.map((q, i) => (
                  <motion.div key={q.id}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.06 }}
                    className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded===q.id ? null : q.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#F8F9FB] transition-colors">
                      <button
                        onClick={e => { e.stopPropagation(); setDone(s => { const n=new Set(s); n.has(q.id)?n.delete(q.id):n.add(q.id); return n }) }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${done.has(q.id) ? 'bg-emerald-500 border-emerald-500' : 'border-[rgba(13,24,61,0.2)]'}`}>
                        {done.has(q.id) && <CheckCircle2 size={12} className="text-white"/>}
                      </button>
                      <p className="flex-1 text-[13px] font-medium text-[#0D183D] leading-snug">{q.q}</p>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8F9FB] text-[#4B6382]">{q.cat}</span>
                    </button>
                    {expanded === q.id && (
                      <div className="px-5 pb-4 flex gap-3" style={{ borderTop:'1px solid rgba(13,24,61,0.06)' }}>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white mt-3 transition-all hover:opacity-90"
                          style={{ background:'#FFB703' }}>
                          <Mic size={12}/> Practice aloud
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.1)] mt-3 hover:bg-[#F8F9FB] transition-colors">
                          <BookOpen size={12}/> See tips
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h2 className="text-[13px] font-extrabold text-[#0D183D] uppercase tracking-widest mb-3">Interview tips</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {TIPS.map((t, i) => (
                  <motion.div key={i}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:0.3 + i*0.06 }}
                    className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-4 flex items-start gap-3">
                    <span className="text-xl shrink-0" aria-hidden="true">{t.icon}</span>
                    <div>
                      <p className="text-[13px] font-bold text-[#0D183D] mb-0.5">{t.title}</p>
                      <p className="text-[12px] text-[#4B6382] leading-relaxed">{t.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
  )
}
