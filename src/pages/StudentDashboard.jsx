import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  TrendingUp, MessageCircle, Settings, LogOut, ChevronRight, Bell,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import HiveLogo from '../components/HiveLogo'
import { AvatarDisplay } from '../components/Avatar'
import img3 from '../assets/img3.png'  // woman w/ laptop — impact context
import img5 from '../assets/img5.png'   // partner logos strip

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: '✦',  label: 'Matches',      value: '24', accent: 'text-honey-600'   },
  { icon: '📄', label: 'Applications', value: '5',  accent: 'text-blue-600'    },
  { icon: '💬', label: 'Interviews',   value: '8',  accent: 'text-emerald-600' },
]

const TOP_MATCHES = [
  {
    id: 'gf',
    name: 'GreenFuture',
    category: 'Environmental Education',
    location: 'Tel Aviv',
    bannerGrad: 'from-emerald-300 via-teal-400 to-emerald-600',
    avatars: ['NoorA', 'LinaM', 'AhmadS'],
    skills: ['Canva', 'Marketing', 'Accessibility'],
    match: 89,
    desc: 'Create content to educate communities on sustainable living and climate action.',
  },
  {
    id: 'om',
    name: 'OpenMind',
    category: 'Mental Health Support',
    location: 'Jerusalem',
    bannerGrad: 'from-violet-300 via-purple-400 to-indigo-500',
    avatars: ['MayaC', 'OmarK', 'YasminB'],
    skills: ['Psychology', 'Writing', 'Design'],
    match: 87,
    desc: 'Design digital resources helping young people access mental health support.',
  },
  {
    id: 'cfg',
    name: 'Code for Good',
    category: 'Education Technology',
    location: 'Haifa',
    bannerGrad: 'from-sky-400 via-blue-500 to-navy-700',
    avatars: ['DanielR', 'EmmaW', 'SarahK'],
    skills: ['React', 'Python', 'UX Design'],
    match: 85,
    desc: 'Build ed-tech tools that increase digital literacy in underserved communities.',
  },
]

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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ user, profile, onLogout }) {
  const { pathname } = { pathname: window.location.pathname }
  return (
    <aside className="w-[220px] shrink-0 bg-white flex flex-col h-screen sticky top-0 z-10"
      style={{ borderRight: '1px solid rgba(13,24,61,0.08)' }}>
      <div className="px-5 py-[14px]" style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
        <Link to="/"><HiveLogo size={24} nameSize="text-base" /></Link>
      </div>

      <nav className="flex-1 p-2.5 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = window.location.pathname === item.to
          return (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-100 ${
                active ? 'bg-[#0D183D] text-white' : 'text-[#4B6382] hover:bg-[rgba(13,24,61,0.04)] hover:text-[#0D183D]'
              }`}>
              <item.icon size={14} strokeWidth={active ? 2.5 : 1.8} />
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full text-white" style={{ background:'#FFB703' }}>{item.badge}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-2.5" style={{ borderTop: '1px solid rgba(13,24,61,0.07)' }}>
        <div className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[rgba(13,24,61,0.04)] transition-colors cursor-default">
          <AvatarDisplay src={profile?.avatar || user?.avatar} name={user?.name || ''} size="xs" className="ring-2 ring-[rgba(255,183,3,0.3)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-[#0D183D] truncate leading-snug">{user?.name}</p>
            <p className="text-[10px] text-[#4B6382]">Student</p>
          </div>
          <button onClick={onLogout} aria-label="Log out"
            className="opacity-0 group-hover:opacity-100 text-[#4B6382] hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-50">
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── NGO banner with gradient-initial team avatars ────────────────────────────

const BANNER_GRADS = ['#6366F1','#10B981','#EC4899','#F59E0B','#06B6D4','#8B5CF6','#FFB703','#14B8A6']
function seedHash(s) { return s.split('').reduce((a,c)=>a+c.charCodeAt(0),0) }
function seedInitials(seed) {
  const first = seed[0]?.toUpperCase() || '?'
  const second = seed.slice(1).match(/[A-Z]/)?.[0] || ''
  return first + second
}

function NGOBanner({ grad, avatars, match }) {
  return (
    <div className={`bg-gradient-to-br ${grad} h-[110px] relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='35'%3E%3Cpath d='M10 2l9 5.2v10.4L10 23 1 17.6V7.2z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")` }}
        aria-hidden="true" />
      {/* Team avatars — gradient initials, no cartoons */}
      <div className="absolute bottom-3 left-3 flex -space-x-1.5">
        {avatars.map(seed => (
          <div key={seed}
            className="w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center text-white text-[9px] font-bold select-none shrink-0"
            style={{ background: BANNER_GRADS[seedHash(seed) % BANNER_GRADS.length] }}
            title={seed}>
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

// ─── Impact illustration ──────────────────────────────────────────────────────

function ImpactIllustration() {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-honey-50 border border-honey-100">
      <img src={img3} alt="Students making an impact"
        className="w-full object-contain object-top"
        style={{ maxHeight: 140 }}
        draggable={false} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user, profile, logout } = useApp()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const avatarSrc = profile?.avatar || user?.avatar || null

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="px-8 py-7 max-w-[1100px]">

          {/* ── Top row: greeting + user card ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start justify-between mb-6">

            <div>
              <h1 className="text-2xl font-extrabold text-[#0D183D] mb-1 flex items-center gap-2">
                Good morning, {firstName}! ☀️
                {/* Bee decoration */}
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="text-xl select-none" aria-hidden="true">🐝</motion.span>
              </h1>
              <p className="text-[#4B6382] text-sm">Discover opportunities, grow your skills, and make an impact.</p>
            </div>

            {/* User profile card */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="hidden md:flex items-center gap-3 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-card px-4 py-2.5 shrink-0">
              <AvatarDisplay src={avatarSrc} name={user?.name || ''} size="sm" className="rounded-xl" />
              <div>
                <p className="text-sm font-bold text-[#0D183D] leading-tight">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-navy-400">Student · Hive</p>
              </div>
              <button className="text-navy-400 hover:text-navy-600 ml-1 transition-colors">
                <Bell size={14} />
              </button>
            </motion.div>
          </motion.div>

          {/* ── Compact stats ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="flex items-center gap-3 mb-7">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] shadow-card px-5 py-3 flex items-center gap-3 hover:shadow-soft transition-shadow cursor-default">
                <span className="text-xl" aria-hidden="true">{s.icon}</span>
                <div>
                  <p className={`text-2xl font-extrabold leading-none ${s.accent}`}>{s.value}</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Main two-column layout ── */}
          <div className="grid lg:grid-cols-[1fr_260px] gap-6">

            {/* Left: Top Matches */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-[#0D183D]">Top Matches for You</h2>
                <Link to="/matches"
                  className="text-xs text-honey-600 font-semibold flex items-center gap-0.5 hover:underline">
                  View All <ChevronRight size={12} />
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {TOP_MATCHES.map((ngo, i) => (
                  <motion.div key={ngo.id}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.1, duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-card border border-[rgba(13,24,61,0.08)] overflow-hidden flex flex-col hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">

                    <NGOBanner grad={ngo.bannerGrad} avatars={ngo.avatars} match={ngo.match} />

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div>
                        <p className="font-extrabold text-[#0D183D] text-sm">{ngo.name}</p>
                        <p className="text-[10px] text-navy-400">{ngo.category} · {ngo.location}</p>
                      </div>
                      <p className="text-[11px] text-[#4B6382] leading-relaxed line-clamp-2 flex-1">
                        {ngo.desc}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ngo.skills.map(s => (
                          <span key={s} className="bg-[#FFF7E6] text-navy-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-[rgba(13,24,61,0.08)]">
                            {s}
                          </span>
                        ))}
                      </div>
                      <Link to="/matches"
                        className="btn-honey text-xs py-2 text-center mt-1 block">
                        Learn More →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Your Impact (light card) */}
            <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28, duration: 0.45 }}
              className="bg-white rounded-2xl shadow-card border border-[rgba(13,24,61,0.08)] p-5 h-fit flex flex-col gap-4">

              <div>
                <p className="text-xs font-extrabold text-honey-600 uppercase tracking-widest mb-0.5">Your Impact</p>
                <p className="text-[11px] text-navy-400 leading-relaxed">Every step you take helps someone grow.</p>
              </div>

              <ImpactIllustration />

              {/* Stats */}
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

              {/* Progress */}
              <div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="text-[#4B6382] font-semibold">Personal growth</span>
                  <span className="text-honey-600 font-extrabold">68%</span>
                </div>
                <div className="w-full bg-cream-200 rounded-full h-1.5">
                  <motion.div
                    className="bg-honey-500 h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate('/matches')}
                className="btn-navy text-xs py-2.5 w-full">
                See your impact →
              </button>

              {/* img5 — partner logos strip — once, subtly here */}
              <div className="pt-2 border-t border-[rgba(13,24,61,0.07)]">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-navy-400 mb-2 text-center">
                  Partner institutions
                </p>
                <img src={img5} alt="Partner universities and NGOs"
                  className="w-full object-contain opacity-70"
                  draggable={false} />
              </div>
            </motion.div>

          </div>
        </div>
    </main>
  )
}
