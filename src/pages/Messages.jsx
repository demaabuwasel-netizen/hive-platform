import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Send, MoreHorizontal, Phone, Video, Paperclip, Smile } from 'lucide-react'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  TrendingUp, MessageCircle, Settings, Briefcase, Users, BarChart2,
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
  { icon: MessageCircle,   label: 'Messages',     to: '/messages', badge: '3' },
  { icon: Settings,        label: 'Settings',     to: '/settings'          },
]

const NGO_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/dashboard/ngo'  },
  { icon: Briefcase,       label: 'Opportunities', to: '/opportunities'  },
  { icon: Users,           label: 'Applicants',    to: '/applicants'     },
  { icon: Zap,             label: 'Matches',       to: '/matches'        },
  { icon: MessageSquare,   label: 'Interviews',    to: '/interviews'     },
  { icon: BarChart2,       label: 'Analytics',     to: '/analytics'      },
  { icon: MessageCircle,   label: 'Messages',      to: '/messages', badge: '2' },
  { icon: Settings,        label: 'Settings',      to: '/settings'       },
]

const CONVERSATIONS = [
  {
    id: 1, name: 'Elem – Youth in Distress', role: 'NGO · Tel Aviv',
    last: "Looking forward to our call tomorrow! We'll discuss the project scope.",
    time: '10:42', unread: 2, online: true,
  },
  {
    id: 2, name: 'Amir Cohen', role: 'Program Manager · BINA',
    last: 'Thanks for your application. We reviewed your profile and...',
    time: '09:18', unread: 1, online: false,
  },
  {
    id: 3, name: 'GreenFuture Initiative', role: 'NGO · Jerusalem',
    last: 'Your match score is 89%. Would you like to schedule a chat?',
    time: 'Yesterday', unread: 0, online: true,
  },
  {
    id: 4, name: 'Hive Support', role: 'Hive Team',
    last: 'Welcome to Hive! Let us know if you need anything.',
    time: 'Mon', unread: 0, online: true,
  },
]

const MESSAGES = {
  1: [
    { id: 1, from: 'them', text: "Hi! We reviewed your Hive profile and think you'd be a great fit for our digital outreach project.", time: '10:20' },
    { id: 2, from: 'me',   text: "Thanks so much! I'd love to learn more about the role. What skills are most important?", time: '10:25' },
    { id: 3, from: 'them', text: 'We mainly need someone with React and basic data visualization. Your GitHub projects look perfect.', time: '10:31' },
    { id: 4, from: 'me',   text: "That's exactly what I've been working on. I built a dashboard for a food bank project last semester.", time: '10:35' },
    { id: 5, from: 'them', text: "Looking forward to our call tomorrow! We'll discuss the project scope.", time: '10:42' },
  ],
}

export default function Messages() {
  const { user } = useApp()
  const [active, setActive] = useState(1)
  const [input, setInput] = useState('')
  const navItems = user?.role === 'ngo' ? NGO_NAV : STUDENT_NAV
  const msgs = MESSAGES[active] || []
  const conv = CONVERSATIONS.find(c => c.id === active)

  function send() {
    if (!input.trim()) return
    setInput('')
  }

  return (
      <div className="flex h-screen" style={{ background: '#F8F9FB' }}>

        {/* ── Conversation list ── */}
        <div className="w-[300px] shrink-0 bg-white flex flex-col"
          style={{ borderRight: '1px solid rgba(13,24,61,0.08)' }}>

          <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
            <h2 className="text-[15px] font-extrabold text-[#0D183D] mb-3">Messages</h2>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8F9FB]"
              style={{ border: '1px solid rgba(13,24,61,0.08)' }}>
              <Search size={13} className="text-[#4B6382] shrink-0" />
              <input placeholder="Search conversations…" className="bg-transparent text-[12px] flex-1 outline-none text-[#0D183D] placeholder-[#4B6382]/50" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${active === c.id ? 'bg-[#FAF6EF]' : 'hover:bg-[#F8F9FB]'}`}
                style={{ borderBottom: '1px solid rgba(13,24,61,0.05)' }}>
                <div className="relative shrink-0">
                  <GradientAvatar name={c.name} size={40} radius="0.75rem" />
                  {c.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[13px] font-bold text-[#0D183D] truncate">{c.name}</p>
                    <span className="text-[10px] text-[#4B6382] shrink-0 ml-2">{c.time}</span>
                  </div>
                  <p className="text-[11px] text-[#4B6382] truncate leading-snug">{c.last}</p>
                </div>
                {c.unread > 0 && (
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                    style={{ background: '#FFB703' }}>{c.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat panel ── */}
        {conv ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between shrink-0"
              style={{ borderBottom: '1px solid rgba(13,24,61,0.08)' }}>
              <div className="flex items-center gap-3">
                <GradientAvatar name={conv.name} size={38} radius="0.65rem" />
                <div>
                  <p className="text-[14px] font-bold text-[#0D183D]">{conv.name}</p>
                  <p className="text-[11px] text-[#4B6382]">{conv.online ? '🟢 Online' : conv.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-[#F8F9FB] transition-colors"><Phone size={14}/></button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-[#F8F9FB] transition-colors"><Video size={14}/></button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4B6382] hover:bg-[#F8F9FB] transition-colors"><MoreHorizontal size={14}/></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {msgs.map(m => (
                <div key={m.id} className={`flex items-end gap-2.5 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
                  {m.from === 'them' && <GradientAvatar name={conv.name} size={28} radius="0.5rem" />}
                  <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    m.from === 'me'
                      ? 'text-white rounded-br-sm'
                      : 'text-[#0D183D] rounded-bl-sm'
                  }`} style={{
                    background: m.from === 'me' ? '#0D183D' : 'white',
                    boxShadow: '0 1px 8px rgba(13,24,61,0.08)',
                  }}>
                    {m.text}
                    <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-white/40' : 'text-[#4B6382]'}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="bg-white px-6 py-4 shrink-0"
              style={{ borderTop: '1px solid rgba(13,24,61,0.08)' }}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: '#F8F9FB', border: '1.5px solid rgba(13,24,61,0.1)' }}>
                <button className="text-[#4B6382] hover:text-[#0D183D] transition-colors"><Paperclip size={15}/></button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent text-[13px] text-[#0D183D] placeholder-[#4B6382]/50 outline-none"
                />
                <button className="text-[#4B6382] hover:text-[#0D183D] transition-colors"><Smile size={15}/></button>
                <button onClick={send}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#FFB703' }}>
                  <Send size={13}/>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#4B6382] text-sm">Select a conversation</p>
          </div>
        )}
      </div>
  )
}
