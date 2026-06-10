import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AvatarDisplay } from './Avatar'
import logo from '../assets/logo.PNG'

const NAV_LINKS = [
  { label: 'Home',         to: '/'             },
  { label: 'For Students', to: '/for-students' },
  { label: 'For NGOs',     to: '/for-ngos'     },
  { label: 'About',        to: '/about'        },
]

export default function Navbar({ minimal = false }) {
  const { user, profile, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const avatarSrc = profile?.avatar || user?.avatar || null
  const PUBLIC_PAGES = ['/', '/for-students', '/for-ngos', '/how-it-works', '/about']
  const isPublicPage = PUBLIC_PAGES.includes(location.pathname)
  const loggedIn = user && !isPublicPage

  function handleLogout() {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <nav className="w-full sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        borderBottom: 'none',
        boxShadow: 'inset 0 -60px 80px -30px rgba(0,0,0,0.04)',
        WebkitBackdropFilter: 'blur(12px)',
        maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
      }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" aria-label="Hive home" className="shrink-0">
          <img src={logo} alt="Hive logo" style={{ height: '150px', width: 'auto', marginTop: '48px', marginLeft: '-24px' }} />
        </Link>

        {/* Centre nav — shown when NOT logged in, desktop only */}
        {!minimal && !loggedIn && (
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => {
              const isActive = location.pathname === link.to
              return (
                <Link key={link.label} to={link.to}
                  className="text-sm font-medium px-3 py-2 rounded-xl transition-all duration-150 relative"
                  style={{
                    color: isActive ? '#0D183D' : '#4B6382',
                    background: isActive ? 'rgba(13,24,61,0.06)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                  }}>
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FFB703]" />
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* "Matching now" chip — logged-in users, desktop */}
        {!minimal && loggedIn && user.onboardingComplete && (
          <div className="hidden md:flex flex-1 justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,183,3,0.1)', color: '#FFB703', border: '1px solid rgba(255,183,3,0.25)' }}>
              <HiveLogo size={14} showName={false} />
              Matching now
            </div>
          </div>
        )}

        {/* Spacer when no centre content */}
        {!minimal && !loggedIn && <div className="hidden lg:block" />}

        {/* Right actions — desktop */}
        {!minimal && (
          <div className="hidden sm:flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link to="/matches"
                  className="text-sm font-medium px-3 py-2 rounded-xl transition-all hover:bg-[#0D183D]/[0.05]"
                  style={{ color: '#4B6382' }}>
                  Matches
                </Link>

                <Link to={user.role === 'student' ? '/dashboard/student' : '/dashboard/ngo'}
                  className="flex items-center gap-2 rounded-2xl px-3 py-1.5 transition-all hover:bg-[#0D183D]/[0.05]"
                  aria-label="My dashboard">
                  <AvatarDisplay src={avatarSrc} name={user.name || ''} size="xs"
                    className="ring-2" style={{ '--tw-ring-color': 'rgba(255,183,3,0.4)' }} />
                  <span className="text-sm font-semibold" style={{ color: '#0D183D' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>

                <button onClick={handleLogout}
                  className="btn-secondary text-sm"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth"
                  className="text-sm font-medium px-3 py-2 rounded-xl transition-all hover:bg-[#0D183D]/[0.05]"
                  style={{ color: '#4B6382' }}>
                  Log in
                </Link>
                <Link to="/auth?mode=signup" className="btn-honey text-sm"
                  style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
                  Get started
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {!minimal && (
          <button className="sm:hidden p-2 rounded-xl transition-colors hover:bg-[#0D183D]/[0.05]"
            onClick={() => setMobileOpen(o => !o)}
            style={{ color: '#4B6382' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {!minimal && mobileOpen && (
        <div className="sm:hidden px-6 py-4 flex flex-col gap-1"
          style={{ borderTop: '1px solid rgba(13,24,61,0.1)', background: 'rgba(255,247,230,0.95)', backdropFilter: 'blur(12px)' }}>
          {!loggedIn && NAV_LINKS.map(link => (
            <Link key={link.label} to={link.to}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-[#0D183D]/[0.05] transition-colors"
              style={{ color: location.pathname === link.to ? '#0D183D' : '#4B6382',
                       fontWeight: location.pathname === link.to ? 600 : 500 }}>
              {link.label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Link to="/matches" onClick={() => setMobileOpen(false)}
                className="text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-[#0D183D]/[0.05]"
                style={{ color: '#4B6382' }}>
                Matches
              </Link>
              <Link to={user.role === 'student' ? '/dashboard/student' : '/dashboard/ngo'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#0D183D]/[0.05]">
                <AvatarDisplay src={avatarSrc} name={user.name || ''} size="xs" />
                <span className="text-sm font-semibold" style={{ color: '#0D183D' }}>{user.name}</span>
              </Link>
              <button onClick={handleLogout}
                className="text-left text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-[#0D183D]/[0.05] transition-colors"
                style={{ color: '#4B6382' }}>
                Log out
              </button>
            </>
          ) : (
            <div className="flex gap-2 mt-2">
              <Link to="/auth" onClick={() => setMobileOpen(false)}
                className="btn-secondary text-sm flex-1 text-center" style={{ padding: '0.65rem' }}>
                Log in
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)}
                className="btn-honey text-sm flex-1 text-center" style={{ padding: '0.65rem' }}>
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
