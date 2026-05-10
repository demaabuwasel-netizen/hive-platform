import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AvatarDisplay } from './Avatar'
import HiveLogo from './HiveLogo'

const NAV_LINKS = [
  { label: 'How it works', section: 'how-it-works' },
  { label: 'For Students', section: 'for-students'  },
  { label: 'For NGOs',     section: 'for-ngos'      },
  { label: 'About',        section: 'about'          },
]

export default function Navbar({ minimal = false }) {
  const { user, profile, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const avatarSrc = profile?.avatar || user?.avatar || null

  // Track which section is in view as user scrolls (only on landing page)
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(null)
      return
    }
    function onScroll() {
      const ids = NAV_LINKS.map(l => l.section)
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 100) current = id
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  function scrollToSection(section) {
    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleNavClick(e, section) {
    e.preventDefault()
    setMobileOpen(false)
    if (location.pathname === '/') {
      scrollToSection(section)
    } else {
      navigate('/')
      setTimeout(() => scrollToSection(section), 380)
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <nav className="w-full sticky top-0 z-50"
      style={{ background: 'rgba(255,247,230,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" aria-label="Hive home" className="shrink-0">
          <HiveLogo size={32} nameSize="text-lg" />
        </Link>

        {/* Centre nav — shown when NOT logged in, desktop only */}
        {!minimal && !user && (
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => {
              const isActive = activeSection === link.section
              return (
                <a key={link.label}
                  href={`/#${link.section}`}
                  onClick={e => handleNavClick(e, link.section)}
                  className="text-sm font-medium px-3 py-2 rounded-xl transition-all duration-150 relative"
                  style={{
                    color: isActive ? '#0D183D' : '#4B6382',
                    background: isActive ? 'rgba(13,24,61,0.06)' : 'transparent',
                  }}>
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FFB703]" />
                  )}
                </a>
              )
            })}
          </div>
        )}

        {/* "Matching now" chip — logged-in users, desktop */}
        {!minimal && user && user.onboardingComplete && (
          <div className="hidden md:flex flex-1 justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,183,3,0.1)', color: '#FFB703', border: '1px solid rgba(255,183,3,0.25)' }}>
              <HiveLogo size={14} showName={false} />
              Matching now
            </div>
          </div>
        )}

        {/* Spacer when no centre content */}
        {!minimal && !user && <div className="hidden lg:block" />}

        {/* Right actions — desktop */}
        {!minimal && (
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
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
          style={{ borderTop: '1px solid rgba(13,24,61,0.07)', background: '#FFF7E6' }}>
          {!user && NAV_LINKS.map(link => (
            <a key={link.label}
              href={`/#${link.section}`}
              onClick={e => handleNavClick(e, link.section)}
              className="text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-[#0D183D]/[0.05] transition-colors"
              style={{ color: activeSection === link.section ? '#0D183D' : '#4B6382',
                       fontWeight: activeSection === link.section ? 600 : 500 }}>
              {link.label}
            </a>
          ))}
          {user ? (
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
