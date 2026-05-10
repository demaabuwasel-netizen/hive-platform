import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, Clock, CheckCircle2,
  XCircle, Calendar, ChevronRight, MapPin,
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

const APPS = [
  { id:1, ngo:'Elem – Youth in Distress', role:'Web Developer', loc:'Tel Aviv', match:94, status:'interview', statusLabel:'Interview scheduled', date:'Applied 3 days ago', next:'Interview: Tomorrow 14:00' },
  { id:2, ngo:'BINA – The Jewish Movement', role:'Content Lead', loc:'Jerusalem', match:89, status:'review', statusLabel:'Under review', date:'Applied 5 days ago', next:'Expected response: 3–5 days' },
  { id:3, ngo:'GreenFuture Initiative', role:'Marketing Intern', loc:'Tel Aviv', match:87, status:'applied', statusLabel:'Application sent', date:'Applied 1 week ago', next:'Awaiting response' },
  { id:4, ngo:'Tsofen – Tech for Arabs', role:'Frontend Developer', loc:'Nazareth', match:80, status:'applied', statusLabel:'Application sent', date:'Applied 2 weeks ago', next:'Awaiting response' },
  { id:5, ngo:'PHR – Physicians for Human Rights', role:'Data Analyst', loc:'Jaffa', match:82, status:'rejected', statusLabel:'Not selected', date:'Applied 3 weeks ago', next: '' },
]

const STATUS_CFG = {
  interview: { color:'text-emerald-700', bg:'bg-emerald-50', icon: Calendar },
  review:    { color:'text-[#D99E00]',   bg:'bg-amber-50',  icon: Clock },
  applied:   { color:'text-indigo-600',  bg:'bg-indigo-50', icon: CheckCircle2 },
  rejected:  { color:'text-red-500',     bg:'bg-red-50',    icon: XCircle },
}

const TAB_COUNTS = {
  All: APPS.length,
  Active: APPS.filter(a => a.status !== 'rejected').length,
  Interviews: APPS.filter(a => a.status === 'interview').length,
}

export default function Applications() {
  const { user } = useApp()
  return (
      <div className="max-w-4xl mx-auto px-8 py-7">
        <div className="mb-6">
          <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">My Applications</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">Track all your applications in one place</p>
        </div>

        {/* Summary chips */}
        <div className="flex gap-3 mb-6">
          {Object.entries(TAB_COUNTS).map(([label, count]) => (
            <div key={label} className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-4 py-2.5 flex items-center gap-2.5">
              <span className="text-[18px] font-extrabold text-[#0D183D]">{count}</span>
              <span className="text-[12px] text-[#4B6382]">{label}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-3">
          {APPS.map((a, i) => {
            const cfg = STATUS_CFG[a.status]
            const Icon = cfg.icon
            return (
              <motion.div key={a.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.07 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] px-5 py-4 flex items-start gap-4 hover:shadow-[0_4px_20px_rgba(13,24,61,0.06)] transition-all">
                <GradientAvatar name={a.ngo} size={44} radius="0.65rem" className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-[13px] font-bold text-[#0D183D] leading-snug">{a.ngo}</p>
                      <p className="text-[11px] text-[#4B6382]">{a.role} · <span className="inline-flex items-center gap-0.5"><MapPin size={9}/>{a.loc}</span></p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{a.match}%</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                        <Icon size={10}/> {a.statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-[#4B6382]">{a.date}{a.next ? ` · ${a.next}` : ''}</p>
                    {a.status !== 'rejected' && (
                      <Link to="/messages"
                        className="text-[11px] font-semibold flex items-center gap-0.5 transition-opacity hover:opacity-70"
                        style={{ color:'#FFB703' }}>
                        Message <ChevronRight size={11}/>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
  )
}
