import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Send, MoreHorizontal, Paperclip, Sparkles, RefreshCw, Calendar, X, MessageCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import DashboardEmptyState from '../components/DashboardEmptyState'

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONVERSATIONS = []

const INITIAL_MESSAGES = {}

const SUGGESTED_REPLIES = {}

const INTERVIEW_INVITE_TEMPLATE = (name, date = 'Thursday, May 14 at 10:00 AM', type = 'video') =>
  `Hi ${name},\n\nWe'd love to invite you to an interview for the role.\n\n📅 ${date}\n📹 ${type === 'video' ? 'Video call (link will follow)' : 'Phone call'}\n⏱ ~30 minutes\n\nPlease confirm if this works for you or suggest an alternative time.\n\nLooking forward to speaking with you!\n\nBest regards`

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Messages() {
  const { user } = useApp()
  const [active, setActive]     = useState(1)
  const [input, setInput]       = useState('')
  const [msgState, setMsgState] = useState(INITIAL_MESSAGES)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showInviteForm, setShowInviteForm]   = useState(false)
  const [inviteDate, setInviteDate]           = useState('')
  const [inviteType, setInviteType]           = useState('video')
  const [searchQ, setSearchQ]                 = useState('')
  const bottomRef = useRef(null)

  const msgs = msgState[active] || []
  const conv = CONVERSATIONS.find(c => c.id === active)
  const suggestions = SUGGESTED_REPLIES[active] || []

  const filtered = CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(searchQ.toLowerCase())
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length, active])

  function send(text = input) {
    const t = (text || '').trim()
    if (!t) return
    const newMsg = { id: Date.now(), from: 'me', text: t, time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false }) }
    setMsgState(s => ({ ...s, [active]: [...(s[active] || []), newMsg] }))
    setInput('')
    setShowSuggestions(false)
  }

  function sendInvite() {
    const name = conv?.name || 'there'
    const msg = INTERVIEW_INVITE_TEMPLATE(name, inviteDate || 'a time TBD', inviteType)
    send(msg)
    setShowInviteForm(false)
  }

  function switchConv(id) {
    setActive(id)
    setShowSuggestions(true)
    setShowInviteForm(false)
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden" style={{ background:'#F8F9FB' }}>

      {/* ── Conversation list ── */}
      <div className="w-[280px] shrink-0 bg-white flex flex-col"
        style={{ borderRight:'1px solid rgba(13,24,61,0.08)' }}>

        <div className="px-4 pt-5 pb-3" style={{ borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
          <h2 className="text-[15px] font-extrabold text-[#0D183D] mb-3">Messages</h2>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8F9FB]"
            style={{ border:'1px solid rgba(13,24,61,0.08)' }}>
            <Search size={12} className="text-[#4B6382] shrink-0"/>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Search conversations…"
              className="bg-transparent text-[12px] flex-1 outline-none text-[#0D183D] placeholder-[#4B6382]/50"/>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-8 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(255,183,3,0.10)', border: '1px solid rgba(255,183,3,0.20)' }}>
                <MessageCircle size={18} strokeWidth={1.7} style={{ color: '#0D183D' }}/>
              </div>
              <p className="text-[12px] font-bold text-[#0D183D] mb-1">No conversations yet</p>
              <p className="text-[11px] text-[#4B6382] leading-relaxed max-w-[190px]">
                Conversations appear here after you apply or get matched.
              </p>
            </div>
          )}
          {filtered.map(c => (
            <button key={c.id} onClick={() => switchConv(c.id)}
              className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${
                active === c.id ? 'bg-[#FAF6EF]' : 'hover:bg-[#F8F9FB]'
              }`}
              style={{ borderBottom:'1px solid rgba(13,24,61,0.05)' }}>
              <div className="relative shrink-0">
                <GradientAvatar name={c.name} size={40} radius="0.75rem"/>
                {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[13px] font-bold text-[#0D183D] truncate">{c.name}</p>
                  <span className="text-[10px] text-[#4B6382] shrink-0 ml-2">{c.time}</span>
                </div>
                <p className="text-[11px] text-[#4B6382] truncate">{c.last}</p>
              </div>
              {c.unread > 0 && (
                <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ background:'#FFB703' }}>{c.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat panel ── */}
      {CONVERSATIONS.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-8 py-12" style={{ background: '#F8F9FB' }}>
          <DashboardEmptyState
            icon={MessageCircle}
            title="Your message hive is quiet"
            description="Conversations open the moment you apply to an opportunity or an NGO reaches out after a match. Send your first application to start a conversation."
            cta={{ label: 'Browse opportunities', href: '/opportunities' }}
            tip="NGOs can message you first too — a complete profile makes you more discoverable."
          />
        </div>
      ) : conv ? (
        <div className="flex-1 flex flex-col min-w-0">

          {/* Chat header */}
          <div className="bg-white px-6 py-3.5 flex items-center justify-between shrink-0"
            style={{ borderBottom:'1px solid rgba(13,24,61,0.08)' }}>
            <div className="flex items-center gap-3">
              <GradientAvatar name={conv.name} size={36} radius="0.6rem"/>
              <div>
                <p className="text-[14px] font-bold text-[#0D183D] leading-snug">{conv.name}</p>
                <p className="text-[11px] text-[#4B6382]">
                  {conv.online ? <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/>Online</span> : conv.role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === 'ngo' && (
                <button
                  onClick={() => setShowInviteForm(v => !v)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all border"
                  style={showInviteForm
                    ? { background:'#0D183D', color:'white', borderColor:'#0D183D' }
                    : { color:'#4B6382', borderColor:'rgba(13,24,61,0.1)', background:'white' }}>
                  <Calendar size={12}/> Invite to interview
                </button>
              )}
              <button className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-[#F8F9FB] transition-colors">
                <MoreHorizontal size={15}/>
              </button>
            </div>
          </div>

          {/* Interview invite form */}
          <AnimatePresence>
            {showInviteForm && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                transition={{ duration:0.18 }}
                className="bg-white px-6 py-4 shrink-0"
                style={{ borderBottom:'1px solid rgba(13,24,61,0.08)', background:'rgba(255,183,3,0.03)' }}>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-[12px] font-bold text-[#0D183D]">Interview invitation</p>
                  <input type="datetime-local" value={inviteDate} onChange={e => setInviteDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-[11px] outline-none border"
                    style={{ borderColor:'rgba(13,24,61,0.12)', background:'white', color:'#0D183D' }}/>
                  <div className="flex gap-2">
                    {[{id:'video',label:'📹 Video'},{id:'phone',label:'📞 Phone'},{id:'onsite',label:'🤝 In-person'}].map(t => (
                      <button key={t.id} onClick={() => setInviteType(t.id)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all"
                        style={inviteType === t.id
                          ? { background:'#0D183D', color:'white', borderColor:'#0D183D' }
                          : { background:'white', color:'#4B6382', borderColor:'rgba(13,24,61,0.1)' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={sendInvite}
                    className="px-4 py-1.5 rounded-xl text-[11px] font-semibold text-white transition-all hover:opacity-90"
                    style={{ background:'#FFB703' }}>
                    Send invitation →
                  </button>
                  <button onClick={() => setShowInviteForm(false)}
                    className="ml-auto text-[#4B6382] hover:text-[#0D183D] transition-colors"><X size={14}/></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3.5">
            {msgs.map(m => (
              <motion.div key={m.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className={`flex items-end gap-2.5 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
                {m.from === 'them' && <GradientAvatar name={conv.name} size={26} radius="0.45rem"/>}
                <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  m.from === 'me' ? 'rounded-br-sm text-white' : 'rounded-bl-sm text-[#0D183D]'
                }`} style={{
                  background: m.from === 'me' ? '#0D183D' : 'white',
                  boxShadow: '0 1px 8px rgba(13,24,61,0.08)',
                  whiteSpace: 'pre-line',
                }}>
                  {m.text}
                  <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-white/40' : 'text-[#4B6382]'}`}>{m.time}</p>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* AI suggested replies */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
                transition={{ duration:0.2 }}
                className="px-6 py-3 flex items-center gap-2 shrink-0 flex-wrap"
                style={{ borderTop:'1px solid rgba(13,24,61,0.06)', background:'rgba(255,183,3,0.03)' }}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Sparkles size={11} style={{ color:'#FFB703' }}/>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color:'#D99E00' }}>Suggested</span>
                </div>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => setInput(s)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all hover:shadow-sm hover:-translate-y-px border"
                    style={{ background:'white', color:'#4B6382', borderColor:'rgba(13,24,61,0.09)' }}>
                    {s}
                  </button>
                ))}
                <button onClick={() => setShowSuggestions(false)} className="ml-auto text-[#4B6382] hover:text-[#0D183D] p-0.5"><X size={12}/></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="bg-white px-5 py-4 shrink-0"
            style={{ borderTop:'1px solid rgba(13,24,61,0.08)' }}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background:'#F8F9FB', border:'1.5px solid rgba(13,24,61,0.09)' }}>
              <button className="text-[#4B6382] hover:text-[#0D183D] transition-colors shrink-0"><Paperclip size={14}/></button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Type a message…"
                className="flex-1 bg-transparent text-[13px] text-[#0D183D] placeholder-[#4B6382]/50 outline-none"
              />
              {!showSuggestions && suggestions.length > 0 && (
                <button onClick={() => setShowSuggestions(true)}
                  className="text-[#4B6382] hover:text-[#FFB703] transition-colors shrink-0">
                  <RefreshCw size={13}/>
                </button>
              )}
              <button onClick={() => send()}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 shrink-0"
                style={{ background: input.trim() ? '#FFB703' : 'rgba(13,24,61,0.15)' }}>
                <Send size={13}/>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
