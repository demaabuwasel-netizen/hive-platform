import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import HiveLogo from './HiveLogo'
import GradientAvatar from './GradientAvatar'

export default function DashboardShell({ navItems, children }) {
  const { user, profile, logout } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const displayName = profile?.name || user?.name || 'User'
  const role = user?.role === 'ngo' ? 'NGO Account' : 'Student'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8F9FB' }}>

      {/* ── Sidebar ── */}
      <aside className="w-[220px] shrink-0 flex flex-col h-screen sticky top-0 z-10 bg-white"
        style={{ borderRight: '1px solid rgba(13,24,61,0.08)' }}>

        <div className="px-5 py-[14px]" style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
          <Link to="/"><HiveLogo size={24} nameSize="text-base" /></Link>
        </div>

        <nav className="flex-1 p-2.5 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to) && item.to.length > 1)
            return (
              <Link key={item.label} to={item.to}
                className={`flex items-center gap-2.5 px-3 py-[8px] rounded-xl text-[13px] font-medium transition-all duration-100 ${
                  active
                    ? 'bg-[#0D183D] text-white'
                    : 'text-[#4B6382] hover:bg-[rgba(13,24,61,0.04)] hover:text-[#0D183D]'
                }`}>
                <item.icon size={14} strokeWidth={active ? 2.5 : 1.8} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: '#FFB703' }}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="p-2.5" style={{ borderTop: '1px solid rgba(13,24,61,0.07)' }}>
          <div className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[rgba(13,24,61,0.04)] transition-colors cursor-default">
            <GradientAvatar name={displayName} size={30} radius="0.5rem" className="shrink-0 ring-2 ring-[rgba(255,183,3,0.3)]" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#0D183D] truncate leading-snug">{displayName}</p>
              <p className="text-[10px] text-[#4B6382]">{role}</p>
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

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}>
          {children}
        </motion.div>
      </main>
    </div>
  )
}
