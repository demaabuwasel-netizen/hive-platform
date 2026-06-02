import { motion } from 'framer-motion'

// Inline SVG honeycomb hexagon — pure Hive brand shape
function Hex({ size = 40, opacity = 0.12, floatDelay = 0, className = '' }) {
  return (
    <motion.svg
      width={size} height={size}
      viewBox="0 0 24 24"
      className={`pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 5 + floatDelay * 0.8, ease: 'easeInOut', delay: floatDelay }}>
      {/* Regular hexagon — flat-top, same proportions as the Hive honeycomb tile */}
      <path
        d="M12 2 L20.7 7 L20.7 17 L12 22 L3.3 17 L3.3 7 Z"
        stroke="#FFB703"
        strokeWidth="1.2"
        fill="rgba(255,183,3,0.18)"
      />
    </motion.svg>
  )
}

// Small connection dot (matches the Hive network-node motif)
function Dot({ size = 6, opacity = 0.25, className = '' }) {
  return (
    <div
      className={`rounded-full pointer-events-none ${className}`}
      style={{ width: size, height: size, background: '#FFB703', opacity }}
      aria-hidden="true"
    />
  )
}

/**
 * BrandIllustration — drops any PNG illustration naturally into the Hive
 * cream background by:
 *   • removing the white image background via mix-blend-mode: multiply
 *   • fading edges with a radial CSS mask (no hard crop)
 *   • layering ambient honey glow + floating hex decorations behind
 *   • gentle float + hover-scale animation on the image itself
 *
 * Works best when the parent section has background #FAF6EF (Hive cream).
 */
export default function BrandIllustration({ src, alt, delay = 0.2, maxWidth = 460 }) {
  return (
    <div className="relative select-none" style={{ minHeight: 380 }} aria-label={alt}>

      {/* ── Layer 1: ambient glows ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Primary honey glow centred behind illustration */}
        <div className="absolute top-[46%] left-[46%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,183,3,0.16) 0%, rgba(255,183,3,0.04) 55%, transparent 72%)' }} />
        {/* Secondary cool accent top-right */}
        <div className="absolute top-[15%] right-[10%] w-24 h-24 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* ── Layer 2: floating hex decorations ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div className="absolute" style={{ top: '8%', left: '4%' }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.35, duration: 0.55 }}>
          <Hex size={44} opacity={0.15} floatDelay={0} />
        </motion.div>

        <motion.div className="absolute" style={{ top: '4%', right: '16%' }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.55, duration: 0.55 }}>
          <Hex size={28} opacity={0.10} floatDelay={1.3} />
        </motion.div>

        <motion.div className="absolute" style={{ bottom: '12%', right: '6%' }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.7, duration: 0.55 }}>
          <Hex size={56} opacity={0.07} floatDelay={0.7} />
        </motion.div>

        <motion.div className="absolute" style={{ bottom: '6%', left: '10%' }}
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.55 }}>
          <Hex size={22} opacity={0.13} floatDelay={2.1} />
        </motion.div>

        {/* Small connection dots */}
        <motion.div className="absolute" style={{ top: '38%', left: '1%' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.9, duration: 0.5 }}>
          <Dot size={7} opacity={0.22} />
        </motion.div>
        <motion.div className="absolute" style={{ top: '22%', right: '5%' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: delay + 1.0, duration: 0.5 }}>
          <Dot size={5} opacity={0.18} />
        </motion.div>
        <motion.div className="absolute" style={{ bottom: '28%', left: '26%' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.8, duration: 0.5 }}>
          <Dot size={4} opacity={0.15} />
        </motion.div>
      </div>

      {/* ── Layer 3: the illustration ───────────────────────────────────── */}
      <motion.div
        className="relative z-10 flex justify-center items-center"
        style={{ paddingTop: 24 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.75, ease: 'easeOut' }}>
        <motion.img
          src={src}
          alt={alt}
          className="object-contain"
          style={{
            maxWidth,
            width: '100%',
            // Multiply blend removes the white illustration background against the cream page
            mixBlendMode: 'multiply',
            // Radial mask fades all edges — no hard crop, no box
            maskImage: 'radial-gradient(ellipse 88% 84% at 50% 52%, black 16%, rgba(0,0,0,0.88) 42%, rgba(0,0,0,0.42) 65%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 88% 84% at 50% 52%, black 16%, rgba(0,0,0,0.88) 42%, rgba(0,0,0,0.42) 65%, transparent 85%)',
          }}
          // Continuous gentle float
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 0.5 }}
          // Subtle scale on hover — feels alive without being distracting
          whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
          draggable={false}
        />
      </motion.div>
    </div>
  )
}
