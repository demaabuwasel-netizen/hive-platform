import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, Users, BarChart2, Search,
  MapPin, Clock, Bookmark as BookmarkIcon, ExternalLink, Filter, Plus,
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

const NGOS = [
  { id:1, name:'Elem – Youth in Distress', cat:'Youth Services', loc:'Tel Aviv', match:94, skills:['React','UX Design','Data Analysis'], desc:'Support at-risk youth through digital programs. We need a developer to help build our community platform.', openings:2, saved:false },
  { id:2, name:'BINA – The Jewish Movement', cat:'Education', loc:'Jerusalem', match:89, skills:['Content Writing','Marketing','SEO'], desc:'Create educational content that bridges different communities across Israel.', openings:1, saved:true },
  { id:3, name:'GreenFuture Initiative', cat:'Environment', loc:'Tel Aviv', match:87, skills:['Canva','Social Media','Analytics'], desc:'Build digital tools and campaigns to promote sustainable living.', openings:3, saved:false },
  { id:4, name:'PHR – Physicians for Human Rights', cat:'Healthcare', loc:'Jaffa', match:82, skills:['Python','Statistics','Research'], desc:'Analyze health data to support advocacy work for underserved populations.', openings:1, saved:false },
  { id:5, name:'Tsofen – Tech for Arabs', cat:'Technology', loc:'Nazareth', match:80, skills:['React','Node.js','Teaching'], desc:'Help bridge the tech employment gap for Arab citizens through coding bootcamps.', openings:2, saved:false },
  { id:6, name:'Access Israel', cat:'Accessibility', loc:'Ramat Gan', match:76, skills:['UX Research','Figma','Accessibility'], desc:'Design accessible digital experiences for people with disabilities.', openings:1, saved:true },
]

const NGO_OPPORTUNITIES = [
  { id:1, title:'Web Developer – Community Platform', status:'Active', applicants:12, match:'94% avg', posted:'3 days ago' },
  { id:2, title:'Content Strategist – Digital Outreach', status:'Active', applicants:8, match:'87% avg', posted:'1 week ago' },
  { id:3, title:'Data Analyst – Impact Reports', status:'Paused', applicants:5, match:'82% avg', posted:'2 weeks ago' },
  { id:4, title:'UI/UX Designer – Youth App', status:'Draft', applicants:0, match:'—', posted:'Not posted' },
]

const CATEGORIES = ['All', 'Technology', 'Education', 'Environment', 'Healthcare', 'Youth Services', 'Accessibility']

export default function Opportunities() {
  const { user } = useApp()
  const isNGO = user?.role === 'ngo'
  const navItems = isNGO ? NGO_NAV : STUDENT_NAV
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [saved, setSaved] = useState(new Set(NGOS.filter(n => n.saved).map(n => n.id)))

  const filtered = NGOS.filter(n =>
    (cat === 'All' || n.cat === cat) &&
    (n.name.toLowerCase().includes(q.toLowerCase()) || n.desc.toLowerCase().includes(q.toLowerCase()))
  )

  return (
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
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background:'#FFB703' }}>
              <Plus size={14}/> Post opportunity
            </button>
          )}
        </div>

        {isNGO ? (
          /* NGO view: manage opportunities */
          <div className="flex flex-col gap-3">
            {NGO_OPPORTUNITIES.map((opp, i) => (
              <motion.div key={opp.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.06, duration:0.3 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-6 py-4 flex items-center gap-5 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-[14px] text-[#0D183D]">{opp.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      opp.status==='Active' ? 'bg-emerald-100 text-emerald-700' :
                      opp.status==='Paused' ? 'bg-amber-100 text-amber-700' : 'bg-[#F8F9FB] text-[#4B6382]'
                    }`}>{opp.status}</span>
                  </div>
                  <p className="text-[12px] text-[#4B6382]">{opp.posted} · {opp.applicants} applicants · {opp.match} match score</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.1)] hover:bg-[#F8F9FB] transition-colors">Edit</button>
                  <Link to="/applicants" className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                    style={{ background:'#0D183D' }}>View applicants</Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Student view: browse NGOs */
          <>
            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-2xl bg-white border border-[rgba(13,24,61,0.08)]">
                <Search size={14} className="text-[#4B6382] shrink-0"/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search NGOs by name or skill…"
                  className="flex-1 bg-transparent text-[13px] text-[#0D183D] outline-none placeholder-[#4B6382]/50" />
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

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((ngo, i) => (
                <motion.div key={ngo.id}
                  initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.06, duration:0.3 }}
                  className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 flex flex-col gap-3 hover:shadow-[0_4px_24px_rgba(13,24,61,0.08)] hover:-translate-y-0.5 transition-all duration-200">

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <GradientAvatar name={ngo.name} size={40} radius="0.65rem" />
                      <div>
                        <p className="text-[13px] font-bold text-[#0D183D] leading-snug">{ngo.name}</p>
                        <p className="text-[11px] text-[#4B6382]">{ngo.cat}</p>
                      </div>
                    </div>
                    <button onClick={() => setSaved(s => { const n=new Set(s); n.has(ngo.id)?n.delete(ngo.id):n.add(ngo.id); return n })}
                      className="p-1.5 rounded-lg hover:bg-[#F8F9FB] transition-colors">
                      <BookmarkIcon size={14} className={saved.has(ngo.id) ? 'fill-[#FFB703] text-[#FFB703]' : 'text-[#4B6382]'}/>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">{ngo.match}% match</span>
                    <span className="text-[11px] text-[#4B6382] flex items-center gap-1"><MapPin size={10}/>{ngo.loc}</span>
                    <span className="text-[11px] text-[#4B6382]">{ngo.openings} opening{ngo.openings>1?'s':''}</span>
                  </div>

                  <p className="text-[12px] text-[#4B6382] leading-relaxed flex-1">{ngo.desc}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {ngo.skills.map(s => (
                      <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[rgba(13,24,61,0.08)]"
                        style={{ background:'#F8F9FB', color:'#4B6382' }}>{s}</span>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-1">
                    <Link to="/matches"
                      className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-white text-center transition-all hover:opacity-90"
                      style={{ background:'#FFB703' }}>
                      Apply now
                    </Link>
                    <button className="px-3 py-2 rounded-xl border border-[rgba(13,24,61,0.1)] text-[#4B6382] hover:bg-[#F8F9FB] transition-colors">
                      <ExternalLink size={13}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
  )
}
