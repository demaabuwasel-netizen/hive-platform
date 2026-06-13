import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

// Dense honeycomb tile — same pattern as Landing hero
function HexPattern() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="hive-hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <path
            d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z"
            fill="#FFB703" fillOpacity="0.20"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hive-hex)"/>
    </svg>
  )
}

// Large wireframe hex cluster — top-right watermark
function HexWatermark() {
  return (
    <svg width="120" height="104" viewBox="0 0 120 104" aria-hidden="true"
      className="absolute -top-2 -right-2 opacity-30">
      <polygon points="60,2 112,32 112,92 60,122 8,92 8,32"
        stroke="#FFB703" strokeWidth="1.5" fill="none"/>
      <polygon points="90,18 120,35 120,69 90,86 60,69 60,35"
        stroke="#FFB703" strokeWidth="1" fill="rgba(255,183,3,0.07)"/>
      <polygon points="30,18 60,35 60,69 30,86 0,69 0,35"
        stroke="#FFB703" strokeWidth="1" fill="rgba(255,183,3,0.05)"/>
    </svg>
  )
}

/**
 * DashboardEmptyState — product-quality empty screen for dashboard pages.
 *
 * Props
 *   icon        Lucide icon component shown in the header badge
 *   label       Optional pill label above the title
 *   title       Bold primary heading (required)
 *   description Muted paragraph (required)
 *   cta         { label, href?, onClick? } — single primary action
 *   tip         Optional ✦ contextual tip below the CTA
 *   compact     Smaller card for section-level use (Interviews upcoming section)
 */
export default function DashboardEmptyState({
  icon: Icon,
  label,
  title,
  description,
  cta,
  tip,
  compact = false,
}) {
  return (
    <div className={compact ? 'py-3' : 'pt-2 pb-3'}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full bg-white rounded-3xl overflow-hidden mx-auto"
        style={{
          maxWidth: compact ? '100%' : 840,
          minHeight: compact ? 210 : 380,
          border: '1px solid rgba(13,24,61,0.08)',
          boxShadow: '0 4px 32px rgba(13,24,61,0.05), 0 1px 4px rgba(13,24,61,0.04)',
        }}>

        {/* ── Branded header band ── */}
        <div
          className="relative flex items-center justify-center overflow-hidden shrink-0"
          style={{
            height: compact ? 110 : 164,
            background: 'linear-gradient(145deg, #FFF7E6 0%, rgba(255,230,130,0.38) 100%)',
          }}>
          <HexPattern />
          <HexWatermark />

          {/* Hive icon badge */}
          {Icon && (
            <motion.div
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.07 }}
              className="relative z-10 flex items-center justify-center rounded-[18px]"
              style={{
                width:  compact ? 52 : 72,
                height: compact ? 52 : 72,
                background: 'white',
                border: '1.5px solid rgba(255,183,3,0.32)',
                boxShadow: '0 6px 24px rgba(255,183,3,0.20), 0 2px 6px rgba(13,24,61,0.08)',
              }}>
              <Icon size={compact ? 22 : 30} strokeWidth={1.6} style={{ color: '#0D183D' }}/>
            </motion.div>
          )}
        </div>

        {/* ── Content body ── */}
        <div
          className="flex flex-col items-center text-center"
          style={{ padding: compact ? '22px 28px 28px' : '32px 56px 40px' }}>

          {label && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.10 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3"
              style={{ background: 'rgba(255,183,3,0.10)', color: '#B37D00', border: '1px solid rgba(255,183,3,0.22)' }}>
              <span className="w-1 h-1 rounded-full bg-[#FFB703]"/>
              {label}
            </motion.span>
          )}

          <motion.h3
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="font-extrabold text-[#0D183D] leading-tight mb-3"
            style={{ fontSize: compact ? 15 : 20 }}>
            {title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.19 }}
            className="text-[#4B6382] leading-relaxed"
            style={{
              fontSize: compact ? 12.5 : 14,
              maxWidth: compact ? 300 : 460,
              marginBottom: cta ? (compact ? 20 : 28) : 0,
            }}>
            {description}
          </motion.p>

          {cta && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}>
              {cta.href ? (
                <Link to={cta.href}
                  className="inline-flex items-center gap-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background: '#0D183D',
                    padding: compact ? '10px 22px' : '12px 30px',
                    fontSize: compact ? 12 : 13.5,
                    boxShadow: '0 4px 16px rgba(13,24,61,0.18)',
                  }}>
                  {cta.label} →
                </Link>
              ) : (
                <button onClick={cta.onClick}
                  className="inline-flex items-center gap-2 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background: '#0D183D',
                    padding: compact ? '10px 22px' : '12px 30px',
                    fontSize: compact ? 12 : 13.5,
                    boxShadow: '0 4px 16px rgba(13,24,61,0.18)',
                  }}>
                  {cta.label} →
                </button>
              )}
            </motion.div>
          )}

          {tip && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              className="flex items-center gap-1.5 mt-5"
              style={{ fontSize: 11.5, color: 'rgba(75,99,130,0.60)' }}>
              <span style={{ color: '#FFB703' }}>✦</span>
              {tip}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
