import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { submitApplication } from '../services/applications'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  TrendingUp, MessageCircle, Settings, LogOut, ChevronRight, Bell,
  X, Send, Sparkles, RefreshCw, CheckCircle2, Clock,
  MapPin, Globe, Link2, ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import HiveLogo from '../components/HiveLogo'
import { AvatarDisplay } from '../components/Avatar'
import GradientAvatar from '../components/GradientAvatar'
import img3 from '../assets/img3.png'
import img5 from '../assets/img5.png'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOP_MATCHES = []

// AI-generated application message based on student profile + NGO mission
function generateAppMessage(profile, ngo) {
  const name = profile?.name || 'I'
  const first = name.split(' ')[0]
  const field = profile?.field || 'my field'
  const skills = Array.isArray(profile?.skills)
    ? profile.skills.slice(0,2).join(' and ')
    : (profile?.skills?.split(',').slice(0,2).join(' and ').trim() || 'relevant skills')

  return `Hi ${ngo.name} team,

My name is ${first} and I'm studying ${field}. I discovered your opportunity through Hive and I'd love to contribute to your mission.

${ngo.mission}

This resonates deeply with me. My experience in ${skills} means I can contribute meaningfully from day one. I'm especially drawn to the chance to create real impact — not just add a line to a CV, but actually help people through this work.

I'm available ${profile?.availability || 'flexibly'} and excited about the possibility of working together.

Looking forward to hearing from you,
${first}`
}

// Chat intro message from NGO
function generateChatIntro(ngo, profile) {
  const firstName = profile?.name?.split(' ')[0] || 'there'
  return `Hi ${firstName}! 👋 We came across your profile on Hive and were really impressed by what we saw. Your background looks like a strong fit for our team. Would you be open to a quick 20-minute intro call? We'd love to tell you more about the role and learn a bit about you.`
}

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/dashboard/student' },
  { icon: Zap,             label: 'Matches',      to: '/matches'           },
  { icon: TrendingUp,      label: 'Opportunities',to: '/opportunities'     },
  { icon: FileText,        label: 'Applications', to: '/applications'      },
  { icon: MessageSquare,   label: 'Interviews',   to: '/interviews'        },
  { icon: Bookmark,        label: 'Saved',        to: '/saved'             },
  { icon: MessageCircle,   label: 'Messages',     to: '/messages', badge: '3' },
  { icon: Settings,        label: 'Settings',     to: '/settings'          },
]

const BANNER_GRADS = ['#6366F1','#10B981','#EC4899','#F59E0B','#06B6D4','#8B5CF6','#FFB703','#14B8A6']
function seedHash(s) { return s.split('').reduce((a,c) => a + c.charCodeAt(0), 0) }
function seedInitials(seed) { return (seed[0]?.toUpperCase() || '') + (seed.slice(1).match(/[A-Z]/)?.[0] || '') }

function NGOBanner({ grad, avatars, match }) {
  return (
    <div className={`bg-gradient-to-br ${grad} h-[100px] relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='35'%3E%3Cpath d='M10 2l9 5.2v10.4L10 23 1 17.6V7.2z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")` }}/>
      <div className="absolute bottom-3 left-3 flex -space-x-1.5">
        {avatars.map(seed => (
          <div key={seed} className="w-7 h-7 rounded-full border-2 border-white/70 flex items-center justify-center text-white text-[9px] font-bold select-none shrink-0"
            style={{ background: BANNER_GRADS[seedHash(seed) % BANNER_GRADS.length] }}>
            {seedInitials(seed)}
          </div>
        ))}
      </div>
      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur text-[#0D183D] text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm">
        {match}% Match
      </div>
    </div>
  )
}

// ─── Apply Modal ─────────────────────────────────────────────────────────────

function ApplyModal({ ngo, profile, studentId, onClose, onSuccess }) {
  const [step, setStep]         = useState('form')  // 'form' | 'success'
  const [message, setMessage]   = useState(() => generateAppMessage(profile, ngo))
  const [links, setLinks]       = useState({ linkedin:'', github:'', portfolio:'' })
  const [availability, setAvail] = useState('')
  const [focusKey, setFocus]    = useState(null)
  const [generating, setGen]    = useState(false)

  const AVAIL_OPTIONS = ['Immediately', '1–5 hrs/week', '5–10 hrs/week', '10–15 hrs/week', '15–20 hrs/week', '20+ hrs/week']

  function regenerate() {
    setGen(true)
    setTimeout(() => { setMessage(generateAppMessage(profile, ngo)); setGen(false) }, 600)
  }

  async function submit() {
    try {
      await submitApplication({
        studentId:     profile?.id || studentId,
        opportunityId: ngo.opportunityId ?? null,
        ngoId:         ngo.ngoId ?? ngo.id,
        message,
        availability,
        links,
      })
    } catch (err) {
      console.error('Apply error:', err)
    }
    setStep('success')
    onSuccess?.()
  }

  const iStyle = k => ({
    background:'white', color:'#0D183D',
    border:`1.5px solid ${focusKey===k ? '#FFB703' : 'rgba(13,24,61,0.1)'}`,
  })

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(10,18,48,0.5)', backdropFilter:'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity:0, scale:0.97, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.97, y:12 }} transition={{ type:'spring', stiffness:360, damping:30 }}
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
            <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background:'#0D183D' }}>
              Back to dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Modal header */}
            <div className="px-6 pt-5 pb-4 shrink-0"
              style={{ background:'linear-gradient(160deg,#FFF7E6,#F0EEFF)', borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
              <button onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-black/[0.06]">
                <X size={14}/>
              </button>
              <div className="flex items-center gap-3">
                <GradientAvatar name={ngo.name} size={44} radius="0.75rem"/>
                <div>
                  <p className="text-[15px] font-extrabold text-[#0D183D]">Apply to {ngo.name}</p>
                  <p className="text-[12px] text-[#4B6382]">{ngo.category} · {ngo.location} · {ngo.match}% match</p>
                </div>
              </div>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

              {/* AI motivation message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background:'#FFB703' }}>
                      <Sparkles size={11} className="text-white"/>
                    </div>
                    <p className="text-[12px] font-extrabold text-[#0D183D]">AI-generated application message</p>
                  </div>
                  <button onClick={regenerate}
                    className={`flex items-center gap-1 text-[11px] font-semibold transition-all ${generating ? 'opacity-50' : ''}`}
                    style={{ color:'#FFB703' }}>
                    <RefreshCw size={11} className={generating ? 'animate-spin' : ''}/>
                    Regenerate
                  </button>
                </div>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8}
                  onFocus={() => setFocus('msg')} onBlur={() => setFocus(null)}
                  className="w-full px-4 py-3 rounded-xl text-[12px] outline-none transition-all resize-none"
                  style={{ ...iStyle('msg'), lineHeight:1.65 }}/>
                <p className="text-[10px] text-[#4B6382] mt-1.5">✏️ Feel free to edit before sending.</p>
              </div>

              {/* Availability */}
              <div>
                <p className="text-[12px] font-semibold text-[#0D183D] mb-2">Your availability</p>
                <div className="flex flex-wrap gap-2">
                  {AVAIL_OPTIONS.map(a => (
                    <button key={a} onClick={() => setAvail(a)}
                      className="px-3.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all"
                      style={availability===a
                        ? { background:'#0D183D', color:'white', borderColor:'#0D183D' }
                        : { background:'white', color:'#4B6382', borderColor:'rgba(13,24,61,0.1)' }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-3">
                <p className="text-[12px] font-semibold text-[#0D183D]">Portfolio links <span className="text-[11px] font-normal text-[#4B6382]">(optional)</span></p>
                {[
                  { key:'linkedin', placeholder:'LinkedIn profile URL', label:'🔗 LinkedIn' },
                  { key:'github',   placeholder:'GitHub profile URL',   label:'💻 GitHub'   },
                  { key:'portfolio',placeholder:'Portfolio / website URL',label:'🌐 Portfolio'},
                ].map(({ key, placeholder, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-[#4B6382] w-20 shrink-0">{label}</span>
                    <input value={links[key]} onChange={e => setLinks(l => ({...l,[key]:e.target.value}))}
                      placeholder={placeholder}
                      onFocus={() => setFocus(key)} onBlur={() => setFocus(null)}
                      className="flex-1 px-3 py-2.5 rounded-xl text-[12px] outline-none transition-all placeholder-[#4B6382]/40"
                      style={iStyle(key)}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t flex gap-3"
              style={{ borderColor:'rgba(13,24,61,0.08)', background:'#FAFAFA' }}>
              <button onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-[13px] font-semibold border text-[#4B6382] hover:bg-[rgba(13,24,61,0.03)] transition-colors"
                style={{ borderColor:'rgba(13,24,61,0.12)' }}>
                Cancel
              </button>
              <button onClick={submit}
                className="flex-2 flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
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

// ─── Chat Modal ───────────────────────────────────────────────────────────────

function ChatModal({ ngo, profile, onClose }) {
  const introText = generateChatIntro(ngo, profile)
  const [messages, setMessages] = useState([
    { id: 1, from: 'them', text: introText, time: 'now' },
  ])
  const [input, setInput] = useState('')
  const [focusKey, setFocus] = useState(null)

  const SUGGESTIONS = [
    `Thanks for reaching out! I'd love to learn more about the ${ngo.category} role.`,
    'A 20-minute call sounds great — what time works for you?',
    'Could you share more details about day-to-day responsibilities?',
  ]

  function send(text = input) {
    const t = text.trim()
    if (!t) return
    setMessages(m => [...m, { id: Date.now(), from: 'me', text: t, time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false}) }])
    setInput('')
  }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background:'rgba(10,18,48,0.45)', backdropFilter:'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:40 }} transition={{ type:'spring', stiffness:320, damping:28 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{ boxShadow:'0 24px 80px rgba(10,18,48,0.25)', height:520 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 shrink-0"
          style={{ background:'linear-gradient(160deg,#FFF7E6,#F0EEFF)', borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
          <GradientAvatar name={ngo.name} size={38} radius="0.65rem"/>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#0D183D]">{ngo.name}</p>
            <p className="text-[11px] flex items-center gap-1 text-[#4B6382]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>Online
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-black/[0.06]">
            <X size={14}/>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.map(m => (
            <div key={m.id} className={`flex items-end gap-2 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
              {m.from === 'them' && <GradientAvatar name={ngo.name} size={26} radius="0.45rem"/>}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                m.from === 'me' ? 'rounded-br-sm text-white' : 'rounded-bl-sm text-[#0D183D]'
              }`} style={{ background:m.from==='me'?'#0D183D':'white', boxShadow:'0 1px 8px rgba(13,24,61,0.08)', whiteSpace:'pre-line' }}>
                {m.text}
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] flex items-center gap-1.5">
                <Sparkles size={10} style={{ color:'#FFB703' }}/> Suggested replies
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="text-left px-4 py-2.5 rounded-xl text-[12px] font-medium border hover:shadow-sm transition-all"
                  style={{ background:'white', color:'#4B6382', borderColor:'rgba(13,24,61,0.09)' }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop:'1px solid rgba(13,24,61,0.08)' }}>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.09)' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); send() } }}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-[13px] text-[#0D183D] placeholder-[#4B6382]/50 outline-none"/>
            <button onClick={() => send()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 shrink-0"
              style={{ background: input.trim() ? '#FFB703' : 'rgba(13,24,61,0.15)' }}>
              <Send size={13}/>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const avatarSrc = profile?.avatar || user?.avatar || null

  const [applyingTo, setApplyingTo]   = useState(null)
  const [chattingWith, setChattingWith] = useState(null)
  const [appCount, setAppCount]        = useState(0)

  useEffect(() => {
    if (!user?.id) return
    import('../services/applications').then(({ fetchStudentApplications }) => {
      fetchStudentApplications(user.id).then(apps => setAppCount(apps.length)).catch(() => {})
    })
  }, [user?.id])

  function handleApplySuccess() {
    setAppCount(n => n + 1)
  }

  const STATS = [
    { icon: '✦',  label: 'Matches',      value: '0',             accent: 'text-[#D99E00]'   },
    { icon: '📄', label: 'Applications', value: String(appCount), accent: 'text-blue-600'    },
    { icon: '💬', label: 'Interviews',   value: '0',             accent: 'text-emerald-600' },
  ]

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="px-8 py-7 max-w-[1100px] mx-auto">

        {/* Greeting */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4 }}
          className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D183D] mb-1 flex items-center gap-2">
              Good morning, {firstName}! ☀️
              <motion.span animate={{ rotate:[0,10,-10,0] }} transition={{ repeat:Infinity, duration:2.5, ease:'easeInOut' }}
                className="text-xl select-none">🐝</motion.span>
            </h1>
            <p className="text-[#4B6382] text-sm">Discover opportunities, grow your skills, and make an impact.</p>
          </div>
          <motion.div initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25 }}
            className="hidden md:flex items-center gap-3 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-card px-4 py-2.5 shrink-0">
            <AvatarDisplay src={avatarSrc} name={user?.name||''} size="sm" className="rounded-xl"/>
            <div>
              <p className="text-sm font-bold text-[#0D183D] leading-tight">{user?.name||'Student'}</p>
              <p className="text-[10px] text-navy-400">Student · Hive</p>
            </div>
            <button className="text-navy-400 hover:text-navy-600 ml-1 transition-colors"><Bell size={14}/></button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.1, duration:0.35 }}
          className="flex items-center gap-3 mb-7 flex-wrap">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.12 + i*0.06 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-card px-5 py-3 flex items-center gap-3 hover:shadow-soft transition-shadow cursor-default">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className={`text-2xl font-extrabold leading-none ${s.accent}`}>{s.value}</p>
                <p className="text-[11px] text-navy-400 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-[1fr_260px] gap-6">

          {/* Matches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-[#0D183D]">Top Matches for You</h2>
              <Link to="/matches" className="text-xs text-[#FFB703] font-semibold flex items-center gap-0.5 hover:underline">
                View All <ChevronRight size={12}/>
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {TOP_MATCHES.map((ngo, i) => (
                <motion.div key={ngo.id}
                  initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.18 + i*0.1, duration:0.4 }}
                  className="bg-white rounded-2xl shadow-card border border-[rgba(13,24,61,0.08)] overflow-hidden flex flex-col hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">

                  <NGOBanner grad={ngo.bannerGrad} avatars={ngo.avatars} match={ngo.match}/>

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div>
                      <p className="font-extrabold text-[#0D183D] text-sm">{ngo.name}</p>
                      <p className="text-[10px] text-navy-400">{ngo.category} · {ngo.location}</p>
                    </div>
                    <p className="text-[11px] text-[#4B6382] leading-relaxed line-clamp-2 flex-1">{ngo.desc}</p>

                    <div className="flex items-center gap-2 text-[10px] text-[#4B6382] mt-0.5">
                      <span className="flex items-center gap-1"><Clock size={9}/>{ngo.hours}</span>
                      <span className="flex items-center gap-1"><MapPin size={9}/>{ngo.workMode}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {ngo.skills.map(s => (
                        <span key={s} className="bg-[#FFF7E6] text-navy-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-[rgba(13,24,61,0.08)]">{s}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setApplyingTo(ngo)}
                        className="flex-1 py-2 rounded-xl text-[11px] font-semibold text-white text-center transition-all hover:opacity-90"
                        style={{ background:'#FFB703' }}>
                        Apply now →
                      </button>
                      <button onClick={() => setChattingWith(ngo)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] hover:text-[#0D183D] transition-colors shrink-0">
                        <MessageCircle size={13}/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Impact sidebar */}
          <motion.div initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.28, duration:0.45 }}
            className="bg-white rounded-2xl shadow-card border border-[rgba(13,24,61,0.08)] p-5 h-fit flex flex-col gap-4">

            <div>
              <p className="text-xs font-extrabold text-[#FFB703] uppercase tracking-widest mb-0.5">Your Impact</p>
              <p className="text-[11px] text-navy-400 leading-relaxed">Every step you take helps someone grow.</p>
            </div>

            <div className="w-full rounded-xl overflow-hidden bg-honey-50 border border-honey-100">
              <img src={img3} alt="Students making an impact" className="w-full object-contain object-top" style={{ maxHeight:130 }} draggable={false}/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cream-50 rounded-xl p-3 text-center border border-[rgba(13,24,61,0.08)]">
                <p className="text-2xl font-extrabold text-[#0D183D] leading-none">24</p>
                <p className="text-[10px] text-navy-400 mt-1">Hours contributed</p>
              </div>
              <div className="bg-cream-50 rounded-xl p-3 text-center border border-[rgba(13,24,61,0.08)]">
                <p className="text-2xl font-extrabold text-[#0D183D] leading-none">120+</p>
                <p className="text-[10px] text-navy-400 mt-1">People impacted</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-[#4B6382] font-semibold">Personal growth</span>
                <span className="text-[#FFB703] font-extrabold">68%</span>
              </div>
              <div className="w-full bg-cream-200 rounded-full h-1.5">
                <motion.div className="bg-[#FFB703] h-1.5 rounded-full"
                  initial={{ width:0 }} animate={{ width:'68%' }}
                  transition={{ delay:0.6, duration:0.8, ease:'easeOut' }}/>
              </div>
            </div>

            <button onClick={() => navigate('/matches')} className="btn-navy text-xs py-2.5 w-full">
              See your matches →
            </button>

            <div className="pt-2 border-t border-[rgba(13,24,61,0.07)]">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-navy-400 mb-2 text-center">Partner institutions</p>
              <img src={img5} alt="Partner universities and NGOs" className="w-full object-contain opacity-70" draggable={false}/>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {applyingTo && (
          <ApplyModal
            key="apply"
            ngo={applyingTo}
            profile={profile || user}
            studentId={user?.id}
            onClose={() => setApplyingTo(null)}
            onSuccess={handleApplySuccess}
          />
        )}
        {chattingWith && (
          <ChatModal
            key="chat"
            ngo={chattingWith}
            profile={profile || user}
            onClose={() => setChattingWith(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
