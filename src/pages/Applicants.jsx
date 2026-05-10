import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, Users, BarChart2,
  Search, Filter, ChevronDown, Star, Calendar, X, CheckCircle2, XCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

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

const APPLICANTS = [
  { id:1, name:'Ethan Galvin', field:'Computer Science', uni:'Tel Aviv University', match:90, status:'new', skills:['Python','React','ML','Data Analysis'], availability:'Immediately', bio:'Passionate about data-driven solutions for social good.', applied:'2 days ago' },
  { id:2, name:'Sharon Bloomstein', field:'Digital Marketing', uni:'Hebrew University', match:85, status:'shortlisted', skills:['SEO','Social Media','Canva','Analytics'], availability:'Part-time', bio:'3 years helping nonprofits grow their online presence.', applied:'4 days ago' },
  { id:3, name:'Nour Haddad', field:'Public Health', uni:'Ben-Gurion University', match:80, status:'new', skills:['Research','Statistics','Arabic','Writing'], availability:'Flexible', bio:'Bilingual researcher focused on health equity.', applied:'5 days ago' },
  { id:4, name:'Daniel Reiss', field:'Software Engineering', uni:'Technion', match:78, status:'interview', skills:['Node.js','React','PostgreSQL'], availability:'20 hrs/week', bio:'Full-stack developer with NGO project experience.', applied:'1 week ago' },
  { id:5, name:'Emma Weiss', field:'Graphic Design', uni:'Bezalel Academy', match:74, status:'rejected', skills:['Figma','Illustrator','Brand Design'], availability:'Freelance', bio:'Visual storyteller passionate about social impact.', applied:'1 week ago' },
  { id:6, name:'Maya Cohen', field:'Computer Science', uni:'Tel Aviv University', match:93, status:'shortlisted', skills:['React','TypeScript','UX Design','Figma'], availability:'Immediately', bio:'CS student with strong design sensibility and nonprofit experience.', applied:'1 day ago' },
]

const STATUS_CONFIG = {
  new:         { label:'New',        color:'text-indigo-600',  bg:'bg-indigo-50' },
  shortlisted: { label:'Shortlisted',color:'text-[#D99E00]',   bg:'bg-amber-50'  },
  interview:   { label:'Interview',  color:'text-emerald-700', bg:'bg-emerald-50'},
  rejected:    { label:'Rejected',   color:'text-red-600',     bg:'bg-red-50'    },
}

export default function Applicants() {
  const { user } = useApp()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [statuses, setStatuses] = useState(() => Object.fromEntries(APPLICANTS.map(a => [a.id, a.status])))

  const visible = APPLICANTS.filter(a =>
    (filter === 'all' || statuses[a.id] === filter) &&
    (a.name.toLowerCase().includes(q.toLowerCase()) || a.field.toLowerCase().includes(q.toLowerCase()))
  )

  function setStatus(id, s) { setStatuses(p => ({ ...p, [id]: s })) }

  return (
      <div className="max-w-5xl mx-auto px-8 py-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Applicants</h1>
            <p className="text-[13px] text-[#4B6382] mt-0.5">{APPLICANTS.length} students applied to your opportunities</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[rgba(13,24,61,0.08)] flex-1 max-w-xs">
            <Search size={13} className="text-[#4B6382]"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search applicants…"
              className="flex-1 bg-transparent text-[13px] outline-none text-[#0D183D] placeholder-[#4B6382]/50" />
          </div>
          <div className="flex gap-2">
            {['all','new','shortlisted','interview','rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold capitalize transition-all ${
                  filter===f ? 'text-white bg-[#0D183D]' : 'text-[#4B6382] bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB]'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          {/* List */}
          <div className="flex flex-col gap-2.5">
            {visible.map((a, i) => {
              const st = STATUS_CONFIG[statuses[a.id]]
              return (
                <motion.div key={a.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.05 }}
                  onClick={() => setSelected(a)}
                  className={`bg-white rounded-2xl border px-5 py-4 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] ${selected?.id===a.id ? 'border-[#FFB703]' : 'border-[rgba(13,24,61,0.08)]'}`}>
                  <GradientAvatar name={a.name} size={44} radius="0.65rem" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-bold text-[#0D183D]">{a.name}</p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ml-auto">{a.match}%</span>
                    </div>
                    <p className="text-[11px] text-[#4B6382] truncate">{a.field} · {a.uni}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Detail panel */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 h-fit sticky top-6">
            {selected ? (
              <div>
                <div className="flex items-start gap-4 mb-5">
                  <GradientAvatar name={selected.name} size={56} radius="0.85rem" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-extrabold text-[#0D183D] mb-0.5">{selected.name}</p>
                    <p className="text-[12px] text-[#4B6382] mb-1.5">{selected.field} · {selected.uni}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">{selected.match}% match</span>
                      <span className="text-[11px] text-[#4B6382]">Applied {selected.applied}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-[#4B6382] leading-relaxed mb-5">{selected.bio}</p>

                <div className="mb-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills.map(s => (
                      <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[rgba(13,24,61,0.09)]"
                        style={{ background:'#F8F9FB', color:'#0D183D' }}>{s}</span>
                    ))}
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-2 text-[12px] text-[#4B6382]">
                  <Calendar size={13}/>
                  <span>Availability: <strong className="text-[#0D183D]">{selected.availability}</strong></span>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setStatus(selected.id, 'shortlisted')}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                    style={{ background:'#FFB703' }}>
                    <Star size={13}/> Shortlist
                  </button>
                  <button onClick={() => setStatus(selected.id, 'interview')}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                    style={{ background:'#0D183D' }}>
                    <Calendar size={13}/> Schedule interview
                  </button>
                  <button onClick={() => setStatus(selected.id, 'rejected')}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors">
                    <XCircle size={13}/> Pass
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FB] flex items-center justify-center mb-3">
                  <Users size={20} className="text-[#4B6382]"/>
                </div>
                <p className="text-[13px] font-semibold text-[#0D183D] mb-1">Select an applicant</p>
                <p className="text-[12px] text-[#4B6382]">Click any applicant to review their profile</p>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
