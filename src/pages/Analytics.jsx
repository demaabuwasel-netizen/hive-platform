import { motion } from 'framer-motion'
import {
  LayoutDashboard, Zap, MessageSquare, MessageCircle, Settings,
  Briefcase, Users, BarChart2, TrendingUp, ArrowUp, ArrowDown,
  Star, Globe, Calendar,
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

const STATS = [
  { label:'Total applicants', value:'46', delta:'+12%', up:true,  icon:Users,    color:'text-indigo-500', bg:'bg-indigo-50' },
  { label:'Avg match score',  value:'87%',delta:'+4%',  up:true,  icon:Star,     color:'text-[#D99E00]',  bg:'bg-amber-50'  },
  { label:'Active volunteers',value:'8',  delta:'+2',   up:true,  icon:Globe,    color:'text-emerald-500',bg:'bg-emerald-50'},
  { label:'Interviews held',  value:'12', delta:'-3%',  up:false, icon:Calendar, color:'text-violet-500', bg:'bg-violet-50' },
]

const MONTHLY = [28, 35, 31, 42, 38, 46, 51, 44, 58, 62, 55, 70]
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MAX_VAL = Math.max(...MONTHLY)

const TOP_SKILLS = [
  { skill:'React / Frontend', pct:82 }, { skill:'Data Analysis', pct:67 },
  { skill:'Content Writing',  pct:58 }, { skill:'UX Design',     pct:51 },
  { skill:'Python / ML',      pct:44 }, { skill:'Marketing',     pct:38 },
]

const RECENT_MATCHES = [
  { name:'Ethan Galvin',    field:'Computer Science',  score:90 },
  { name:'Maya Cohen',      field:'Computer Science',  score:93 },
  { name:'Sharon Bloomstein',field:'Digital Marketing',score:85 },
  { name:'Nour Haddad',     field:'Public Health',     score:80 },
]

export default function Analytics() {
  return (
      <div className="max-w-5xl mx-auto px-8 py-7">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Analytics</h1>
            <p className="text-[13px] text-[#4B6382] mt-0.5">Insights into your matching activity and impact</p>
          </div>
          <select className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#0D183D] bg-white border border-[rgba(13,24,61,0.08)] outline-none cursor-pointer">
            <option>Last 12 months</option>
            <option>Last 6 months</option>
            <option>Last 30 days</option>
          </select>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.05 }}
              className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-4 py-4 hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)] transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                <s.icon size={16} className={s.color} strokeWidth={2}/>
              </div>
              <p className="text-[22px] font-extrabold text-[#0D183D] leading-none mb-1">{s.value}</p>
              <p className="text-[11px] text-[#4B6382] mb-1.5">{s.label}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {s.up ? <ArrowUp size={10}/> : <ArrowDown size={10}/>} {s.delta} vs last period
              </span>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-5 mb-5">
          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[14px] font-extrabold text-[#0D183D]">Applicant volume</p>
                <p className="text-[12px] text-[#4B6382]">Monthly student applications</p>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                <TrendingUp size={13}/> +32% YoY
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-36">
              {MONTHLY.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t-lg"
                    style={{ background: i === 11 ? '#FFB703' : 'rgba(13,24,61,0.08)', minHeight:4 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / MAX_VAL) * 120}px` }}
                    transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
                  />
                  <p className="text-[9px] text-[#4B6382]">{MONTHS[i].slice(0,1)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top skills */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
            <p className="text-[14px] font-extrabold text-[#0D183D] mb-5">Top applicant skills</p>
            <div className="flex flex-col gap-3.5">
              {TOP_SKILLS.map((s, i) => (
                <div key={s.skill}>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="font-medium text-[#0D183D]">{s.skill}</span>
                    <span className="font-bold text-[#4B6382]">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background:'rgba(13,24,61,0.07)' }}>
                    <motion.div className="h-1.5 rounded-full"
                      style={{ background: i === 0 ? '#FFB703' : '#0D183D', opacity: i === 0 ? 1 : 0.5 + (0.5 * (1 - i/6)) }}
                      initial={{ width:0 }} animate={{ width:`${s.pct}%` }}
                      transition={{ delay: 0.3 + i*0.07, duration:0.7, ease:'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent quality matches */}
        <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
          <p className="text-[14px] font-extrabold text-[#0D183D] mb-5">Recent high-quality matches</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RECENT_MATCHES.map((m, i) => (
              <motion.div key={m.name}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.4 + i*0.07 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(13,24,61,0.07)] hover:bg-[#F8F9FB] transition-colors">
                <GradientAvatar name={m.name} size={36} radius="0.6rem" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#0D183D] truncate leading-snug">{m.name}</p>
                  <p className="text-[10px] text-[#4B6382] truncate">{m.field}</p>
                  <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">{m.score}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
  )
}
