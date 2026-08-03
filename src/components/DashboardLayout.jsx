import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  LogOut, LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, Users, BarChart2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import HiveLogo from './HiveLogo'
import { AvatarDisplay } from './Avatar'

// ─── Nav definitions ──────────────────────────────────────────────────────────

const STUDENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/dashboard/student'             },
  { icon: Users,           label: 'Profile',      to: '/profile/student'                },
  { icon: Briefcase,       label: 'Opportunities',to: '/opportunities'                  },
  { icon: FileText,        label: 'Applications', to: '/applications'                   },
  { icon: MessageSquare,   label: 'Interviews',   to: '/interviews'                     },
  { icon: Bookmark,        label: 'Saved',        to: '/saved'                          },
  { icon: MessageCircle,   label: 'Messages',     to: '/messages'                       },
]

const STUDENT_SETTINGS = [
  { icon: Settings,        label: 'Settings',     to: '/settings'                       },
]

const NGO_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     to: '/dashboard/ngo'                },
  { icon: Users,           label: 'Profile',       to: '/profile/ngo'                   },
  { icon: Briefcase,       label: 'Opportunities', to: '/opportunities'                 },
  { icon: Users,           label: 'Applicants',    to: '/applicants'                    },
  { icon: Zap,             label: 'Matches',       to: '/matches'                       },
  { icon: MessageSquare,   label: 'Interviews',    to: '/interviews'                    },
  { icon: BarChart2,       label: 'Analytics',     to: '/analytics'                     },
  { icon: MessageCircle,   label: 'Messages',      to: '/messages'                      },
]

const NGO_SETTINGS = [
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
  const { t } = useTranslation()
  const navigate    = useNavigate()
  const { pathname } = useLocation()
  const isNgo = user?.role === 'ngo'
  const sidebarTheme = isNgo
    ? {
        activeBg: '#E8F0FE',
        activeText: '#1A73E8',
        activeShadow: '0 10px 22px rgba(26,115,232,0.12)',
        hoverBg: 'rgba(26,115,232,0.08)',
        border: 'rgba(26,115,232,0.10)',
        text: '#5F6368',
        footerRing: 'rgba(26,115,232,0.22)',
      }
    : {
        activeBg: '#E8F0FE',
        activeText: '#1A73E8',
        activeShadow: '0 10px 22px rgba(26,115,232,0.12)',
        hoverBg: 'rgba(26,115,232,0.08)',
        border: 'rgba(26,115,232,0.10)',
        text: '#5F6368',
        footerRing: 'rgba(26,115,232,0.22)',
      }

  const navItems    = isNgo ? NGO_NAV : STUDENT_NAV
  const settingsItems = isNgo ? NGO_SETTINGS : STUDENT_SETTINGS
  const displayName = profile?.name || user?.name || 'User'
  const avatarSrc   = profile?.avatar || user?.avatar || null
  const roleLabel   = isNgo ? 'NGO Account' : 'Student'

  // i18n key map for nav items
  const NAV_KEYS = {
    'Dashboard':     'nav.dashboard',
    'Matches':       'nav.matches',
    'Opportunities': 'nav.opportunities',
    'Applications':  'nav.applications',
    'Interviews':    'nav.interviews',
    'Saved':         'nav.saved',
    'Messages':      'nav.messages',
    'Profile':       'nav.profile',
    'Settings':      'nav.settings',
    'Applicants':    'nav.applicants',
    'Analytics':     'nav.analytics',
  }

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--hive-bg-surface)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="shrink-0 flex flex-col overflow-hidden transition-colors duration-200"
        style={{
          width: 220,
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: 'var(--sidebar-bg)',
          borderRight: `1px solid ${sidebarTheme.border}`,
          zIndex: 30,
        }}>

        {/* Logo */}
        <div
          className="px-5 py-[14px] shrink-0"
          style={{
            borderBottom: `1px solid ${sidebarTheme.border}`,
            background: 'linear-gradient(180deg, rgba(26,115,232,0.08), rgba(26,115,232,0.02))',
          }}
        >
          <Link to={user?.role === 'ngo' ? '/dashboard/ngo' : '/dashboard/student'}>
            <HiveLogo size={24} nameSize="text-[1.45rem]" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item.to, pathname)
            return (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-2.5 px-3.5 py-[10px] rounded-full text-[13px] font-medium transition-colors duration-100"
                style={active
                  ? { background: sidebarTheme.activeBg, color: sidebarTheme.activeText, boxShadow: sidebarTheme.activeShadow }
                  : { color: sidebarTheme.text }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = sidebarTheme.hoverBg }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <item.icon size={14} strokeWidth={active ? 2.5 : 1.8} />
                <span className="flex-1 leading-none">{t(NAV_KEYS[item.label] || item.label, item.label)}</span>
                {item.badge && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: '#FFB703' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Settings section at bottom */}
        <nav className="p-2.5 shrink-0 border-t" style={{ borderColor: sidebarTheme.border }}>
          {settingsItems.map(item => {
            const active = isActive(item.to, pathname)
            return (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-2.5 px-3.5 py-[10px] rounded-full text-[13px] font-medium transition-colors duration-100"
                style={active
                  ? { background: sidebarTheme.activeBg, color: sidebarTheme.activeText, boxShadow: sidebarTheme.activeShadow }
                  : { color: sidebarTheme.text }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = sidebarTheme.hoverBg }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <item.icon size={14} strokeWidth={active ? 2.5 : 1.8} />
                <span className="flex-1 leading-none">{t(NAV_KEYS[item.label] || item.label, item.label)}</span>
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="p-2.5 shrink-0" style={{ borderTop: `1px solid ${sidebarTheme.border}` }}>
          <div className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-default transition-colors"
            onMouseEnter={e => e.currentTarget.style.background = sidebarTheme.hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="shrink-0 rounded-full" style={{ boxShadow: `0 0 0 2px ${sidebarTheme.footerRing}` }}>
              <AvatarDisplay src={avatarSrc} name={displayName} size="xs" className="shrink-0"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold truncate leading-snug"
                style={{ color: 'var(--hive-text-primary)' }}>{displayName}</p>
              <p className="text-[10px]" style={{ color: 'var(--hive-text-muted)' }}>
                {roleLabel}
              </p>
            </div>
            <button onClick={() => { logout(); navigate('/') }}
              aria-label={t('nav.signOut')}
              className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg"
              style={{ color: 'var(--hive-text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1A73E8'; e.currentTarget.style.background = 'rgba(26,115,232,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--hive-text-muted)'; e.currentTarget.style.background = 'transparent' }}>
              <LogOut size={12}/>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content area ── */}
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
