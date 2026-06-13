import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

// Subtle honeycomb SVG for the header band
function HexPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="hex-es" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <path
            d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z"
            fill="#FFB703" fillOpacity="0.18"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex-es)"/>
    </svg>
  )
}

// Three stacked hexagons — decorative accent top-right
function HexStack() {
  return (
    <svg
      width="56" height="60" viewBox="0 0 56 60"
      aria-hidden="true"
      className="absolute top-4 right-5 opacity-40">
      <polygon points="28,0 52,14 52,42 28,56 4,42 4,14" stroke="#FFB703" strokeWidth="1.5" fill="none"/>
      <polygon points="40,6 56,15 56,33 40,42 24,33 24,15" stroke="#FFB703" strokeWidth="1" fill="rgba(255,183,3,0.06)"/>
      <polygon points="16,18 28,25 28,39 16,46 4,39 4,25" stroke="#FFB703" strokeWidth="1" fill="rgba(255,183,3,0.04)"/>
    </svg>
  )
}

/**
 * DashboardEmptyState — polished, product-quality empty screen for dashboard pages.
 *
 * Props
 *   icon        Lucide icon component displayed in the header illustration zone
 *   label       Optional small pill label above the title (e.g. "Coming soon")
 *   title       Bold primary heading (required)
 *   description Paragraph explaining why the page is empty and what to do
 *   cta         { label, href?, onClick? } — primary action button
 *   secondary   { label, href?, onClick? } — optional ghost/link secondary action
 *   tip         Optional small contextual tip line shown below the buttons
 *   compact     Reduces card size for section-level (not full-page) use
 */
export default function DashboardEmptyState({
  icon: Icon,
  label,
  title,
  description,
  cta,
  secondary,
  tip,
  compact = false,
}) {
  const headerH = compact ? 100 : 140

  return (
    <div className={`w-full flex items-start justify-center ${compact ? 'py-4' : 'py-8'}`}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
        className="w-full bg-white rounded-3xl overflow-hidden"
        style={{
          maxWidth: compact ? '100%' : 680,
          minHeight: compact ? 200 : 360,
          border: '1px solid rgba(13,24,61,0.08)',
          boxShadow: '0 4px 32px rgba(13,24,61,0.06), 0 1px 4px rgba(13,24,61,0.04)',
        }}>

        {/* ── Header illustration band ── */}
        <div
          className="relative flex items-center justify-center overflow-hidden shrink-0"
          style={{
            height: headerH,
            background: 'linear-gradient(160deg, rgba(255,247,230,1) 0%, rgba(255,237,180,0.45) 100%)',
          }}>
          <HexPattern />
          <HexStack />

          {/* Icon badge */}
          {Icon && (
            <motion.div
              initial={{ scale: 0.68, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.08 }}
              className="relative z-10 flex items-center justify-center rounded-2xl"
              style={{
                width:  compact ? 48 : 64,
                height: compact ? 48 : 64,
                background: 'white',
                border: '1.5px solid rgba(255,183,3,0.30)',
                boxShadow: '0 4px 20px rgba(255,183,3,0.18), 0 1px 4px rgba(13,24,61,0.08)',
              }}>
              <Icon
                size={compact ? 20 : 26}
                strokeWidth={1.7}
                style={{ color: '#0D183D' }}/>
            </motion.div>
          )}
        </div>

        {/* ── Body ── */}
        <div
          className="flex flex-col items-center text-center"
          style={{ padding: compact ? '20px 24px 24px' : '28px 40px 36px' }}>

          {/* Optional pill label */}
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3"
              style={{ background: 'rgba(255,183,3,0.10)', color: '#B37D00', border: '1px solid rgba(255,183,3,0.22)' }}>
              <span className="w-1 h-1 rounded-full bg-[#FFB703]"/>
              {label}
            </motion.span>
          )}

          <motion.h3
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="font-extrabold text-[#0D183D] mb-2.5 leading-tight"
            style={{ fontSize: compact ? 15 : 18 }}>
            {title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="text-[#4B6382] leading-relaxed"
            style={{
              fontSize: compact ? 12.5 : 13.5,
              maxWidth: compact ? 280 : 420,
              marginBottom: cta ? (compact ? 20 : 28) : 0,
            }}>
            {description}
          </motion.p>

          {cta && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.29 }}
              className="flex items-center gap-3 flex-wrap justify-center">

              {/* Primary CTA */}
              {cta.href ? (
                <Link to={cta.href}
                  className="inline-flex items-center gap-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background: '#0D183D',
                    padding: compact ? '9px 20px' : '11px 26px',
                    fontSize: compact ? 12 : 13,
                    boxShadow: '0 4px 16px rgba(13,24,61,0.18)',
                  }}>
                  {cta.label} →
                </Link>
              ) : (
                <button onClick={cta.onClick}
                  className="inline-flex items-center gap-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background: '#0D183D',
                    padding: compact ? '9px 20px' : '11px 26px',
                    fontSize: compact ? 12 : 13,
                    boxShadow: '0 4px 16px rgba(13,24,61,0.18)',
                  }}>
                  {cta.label} →
                </button>
              )}

              {/* Secondary action */}
              {secondary && (
                secondary.href ? (
                  <Link to={secondary.href}
                    className="inline-flex items-center gap-1.5 rounded-xl font-semibold transition-colors"
                    style={{
                      color: '#4B6382',
                      padding: compact ? '9px 16px' : '11px 20px',
                      fontSize: compact ? 12 : 13,
                      border: '1.5px solid rgba(13,24,61,0.12)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,24,61,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    {secondary.label}
                  </Link>
                ) : (
                  <button onClick={secondary.onClick}
                    className="inline-flex items-center gap-1.5 rounded-xl font-semibold transition-colors"
                    style={{
                      color: '#4B6382',
                      padding: compact ? '9px 16px' : '11px 20px',
                      fontSize: compact ? 12 : 13,
                      border: '1.5px solid rgba(13,24,61,0.12)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,24,61,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    {secondary.label}
                  </button>
                )
              )}
            </motion.div>
          )}

          {/* Contextual tip */}
          {tip && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="flex items-center gap-1.5 mt-5"
              style={{ fontSize: 11.5, color: 'rgba(75,99,130,0.65)' }}>
              <span style={{ color: '#FFB703', fontSize: 12 }}>✦</span>
              {tip}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
