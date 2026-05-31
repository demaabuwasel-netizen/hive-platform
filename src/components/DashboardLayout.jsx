import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LogOut, LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, Users, BarChart2, TrendingUp,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import HiveLogo from './HiveLogo'
import { AvatarDisplay } from './Avatar'

// ─── Nav definitions ──────────────────────────────────────────────────────────

const STUDENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/dashboard/student'             },
  { icon: Zap,             label: 'Matches',      to: '/matches'                        },
  { icon: Briefcase,       label: 'Opportunities',to: '/opportunities'                  },
  { icon: FileText,        label: 'Applications', to: '/applications'                   },
  { icon: MessageSquare,   label: 'Interviews',   to: '/interviews'                     },
  { icon: Bookmark,        label: 'Saved',        to: '/saved'                          },
  { icon: MessageCircle,   label: 'Messages',     to: '/messages',   badge: '3'         },
  { icon: Settings,        label: 'Settings',     to: '/settings'                       },
]

const NGO_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/dashboard/ngo'                },
  { icon: Briefcase,       label: 'Opportunities', to: '/opportunities'                 },
  { icon: Users,           label: 'Applicants',    to: '/applicants'                    },
  { icon: Zap,             label: 'Matches',       to: '/matches'                       },
  { icon: MessageSquare,   label: 'Interviews',    to: '/interviews'                    },
  { icon: BarChart2,       label: 'Analytics',     to: '/analytics'                     },
  { icon: MessageCircle,   label: 'Messages',      to: '/messages',    badge: '2'       },
  { icon: Settings,        label: 'Settings',      to: '/settings'                      },
]

// ─── Active-state logic ───────────────────────────────────────────────────────
// Dashboard roots match exactly; everything else matches by prefix.
function isActive(itemTo, pathname) {
  if (itemTo === '/dashboard/student' || itemTo === '/dashboard/ngo') {
    return pathname === itemTo
  }
  return pathname === itemTo || pathname.startsWith(itemTo + '/')
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout() {
  const { user, profile, logout } = useApp()
  const navigate   = useNavigate()
  const { pathname } = useLocation()

  const navItems   = user?.role === 'ngo' ? NGO_NAV : STUDENT_NAV
  const displayName = profile?.name || user?.name || 'User'
  const avatarSrc   = profile?.avatar || user?.avatar || null
  const roleLabel   = user?.role === 'ngo' ? 'NGO Account' : 'Student'

  return (
    <div className="flex" style={{ minHeight: '100vh', background: '#F8F9FB' }}>

      {/* ── Sidebar — sticky, always visible ── */}
      <aside
        className="shrink-0 flex flex-col bg-white overflow-hidden"
        style={{
          width: 220,
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid rgba(13,24,61,0.08)',
          zIndex: 30,
        }}>

        {/* Logo */}
        <div className="px-5 py-[14px] shrink-0" style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
          <Link to={user?.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/student'}><HiveLogo size={24} nameSize="text-base" /></Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item.to, pathname)
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-[8px] rounded-xl text-[13px] font-medium transition-colors duration-100 ${
                  active
                    ? 'bg-[#0D183D] text-white'
                    : 'text-[#4B6382] hover:bg-[rgba(13,24,61,0.04)] hover:text-[#0D183D]'
                }`}>
                <item.icon size={14} strokeWidth={active ? 2.5 : 1.8} />
                <span className="flex-1 leading-none">{item.label}</span>
                {item.badge && (
                  <span
                    className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: '#FFB703' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-2.5 shrink-0" style={{ borderTop: '1px solid rgba(13,24,61,0.07)' }}>
          <div className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[rgba(13,24,61,0.04)] transition-colors cursor-default">
            <AvatarDisplay
              src={avatarSrc}
              name={displayName}
              size="xs"
              className="ring-2 ring-[rgba(255,183,3,0.32)] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#0D183D] truncate leading-snug">{displayName}</p>
              <p className="text-[10px] text-[#4B6382]">{roleLabel}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/') }}
              aria-label="Log out"
              className="opacity-0 group-hover:opacity-100 text-[#4B6382] hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-50">
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content area — animated page transitions ── */}
      <div className="flex-1 min-w-0 overflow-hidden" style={{ minHeight: '100vh' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ minHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
