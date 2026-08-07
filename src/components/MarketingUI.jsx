// Shared building blocks for the marketing/landing pages (Landing, ForStudents,
// ForNGOs, About) — keeps their look identical without copy-pasting the same
// footer and section chrome into every file.
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronUp, Mail, ExternalLink } from 'lucide-react'
import HiveLogo from './HiveLogo'

// Soft, low-opacity wave accent for section backgrounds — same blue/green
// palette used everywhere else on the marketing pages, just faded into the
// background instead of being a UI element. `flip` mirrors it vertically so
// it can bookend the top and bottom of a page. Purely decorative.
export function HiveWaves({ className = '', flip = false }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 w-full select-none ${flip ? 'rotate-180' : ''} ${className}`}
      viewBox="0 0 1440 320"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hiveWaveA" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0B84FF" stopOpacity="0" />
          <stop offset="0.35" stopColor="#0B84FF" stopOpacity="0.12" />
          <stop offset="0.7" stopColor="#10B981" stopOpacity="0.09" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hiveWaveB" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0B84FF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#0B84FF" stopOpacity="0.07" />
          <stop offset="1" stopColor="#0B84FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,160 C240,220 480,80 720,120 C960,160 1200,240 1440,140 L1440,320 L0,320 Z" fill="url(#hiveWaveA)" />
      <path d="M0,200 C280,140 520,260 760,190 C1000,120 1240,220 1440,180 L1440,320 L0,320 Z" fill="url(#hiveWaveB)" />
    </svg>
  )
}

export function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SectionLabel({ children }) {
  return (
    <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0B84FF]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#0B84FF]" />
      {children}
    </p>
  )
}

export function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#E6EAF0] last:border-b-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-[#202124]">{q}</span>
        {open
          ? <ChevronUp className="h-5 w-5 shrink-0 text-[#0B84FF]" />
          : <ChevronDown className="h-5 w-5 shrink-0 text-[#8A8F98]" />}
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-7 text-[#5F6368]">{a}</p>
      </motion.div>
    </div>
  )
}

export function FAQAccordion({ items }) {
  return (
    <div className="rounded-[2rem] border border-[#E6EAF0] bg-white px-8 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      {items.map(item => (
        <FAQItem key={item.q} q={item.q} a={item.a} />
      ))}
    </div>
  )
}

// Same header used across every marketing page. Highlights whichever nav
// link matches the current route, so it's obvious at a glance which page
// you're on — not just a row of identical gray links.
export function SiteHeader({ navLinks }) {
  const { pathname } = useLocation()
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link to="/" className="shrink-0" aria-label="Hive home">
          <HiveLogo size={44} />
        </Link>
        <nav className="hidden items-center gap-12 lg:flex">
          {navLinks.map(link => {
            const active = pathname === link.to
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`relative text-sm font-medium transition-colors ${
                  active ? 'text-[#0B84FF]' : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="marketing-nav-active"
                    className="absolute -bottom-[27px] left-0 right-0 h-[2.5px] rounded-full bg-[#0B84FF]"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link to="/auth" className="rounded-2xl px-5 py-2.5 text-sm font-medium text-[#202124] transition-colors hover:bg-black/[0.06]">
            Log in
          </Link>
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0B84FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,132,255,0.2)] transition-all hover:shadow-[0_10px_28px_rgba(11,132,255,0.3)] hover:-translate-y-0.5"
          >
            Sign up <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}

// Same footer used across every marketing page.
export function SiteFooter() {
  return (
    <footer className="border-t border-[#E6EAF0] bg-[#202124] px-5 pt-16 pb-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <HiveLogo size={36} className="brightness-0 invert" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/50">
              Connecting students with NGOs and meaningful opportunities to create real change.
            </p>
            <div className="mt-6 flex gap-4">
              {[ExternalLink, Mail].map((Icon, i) => (
                <button key={i} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Product</p>
            <div className="space-y-3">
              {[
                { label: 'How it works', to: '/' },
                { label: 'For Students', to: '/for-students' },
                { label: 'For NGOs', to: '/for-ngos' },
                { label: 'About Us', to: '/about' },
              ].map(link => (
                <Link key={link.label} to={link.to} className="block text-sm text-white/60 transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Students */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Students</p>
            <div className="space-y-3">
              {['Browse opportunities', 'My applications', 'Interview practice', 'Saved roles', 'My profile'].map(label => (
                <Link key={label} to="/auth" className="block text-sm text-white/60 transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* NGOs */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">NGOs</p>
            <div className="space-y-3">
              {['Post a role', 'View applicants', 'Analytics', 'Matches', 'Contact us'].map(label => (
                <Link key={label} to="/auth" className="block text-sm text-white/60 transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Hive. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map(label => (
              <Link key={label} to="/" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
