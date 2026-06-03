import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * Reusable empty-state for dashboard pages.
 *
 * Props:
 *   emoji        – large icon character (e.g. '📄')
 *   title        – bold heading
 *   description  – short muted line
 *   actionLabel  – CTA button text
 *   actionHref   – Link destination (use instead of onAction)
 *   onAction     – onClick handler (use instead of actionHref)
 *   secondary    – { label, href } optional plain-text link below CTA
 *   compact      – smaller padding (for inline use inside content areas)
 *   card         – wrap in white card (default true for standalone dashboard use)
 */
export default function EmptyState({
  emoji,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondary,
  compact = false,
  card = true,
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex flex-col items-center justify-center text-center w-full ${compact ? 'py-10 px-6' : 'py-16 px-8'}`}>

      {emoji && (
        <motion.div
          initial={{ scale: 0.65, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
          className={`${compact ? 'text-4xl mb-3' : 'text-5xl mb-5'} select-none`}
          aria-hidden="true">
          {emoji}
        </motion.div>
      )}

      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`font-extrabold text-[#0D183D] mb-2 ${compact ? 'text-[14px]' : 'text-[16px]'}`}>
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22 }}
        className="text-[#4B6382] text-[13px] leading-relaxed mb-6 max-w-[280px]">
        {description}
      </motion.p>

      {actionLabel && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3">
          {actionHref ? (
            <Link to={actionHref}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: '#FFB703', boxShadow: '0 4px 14px rgba(255,183,3,0.25)' }}>
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: '#FFB703', boxShadow: '0 4px 14px rgba(255,183,3,0.25)' }}>
              {actionLabel}
            </button>
          )}
          {secondary && (
            <Link to={secondary.href}
              className="text-[12px] text-[#4B6382] hover:text-[#0D183D] transition-colors">
              {secondary.label}
            </Link>
          )}
        </motion.div>
      )}
    </motion.div>
  )

  if (!card) return inner

  return (
    <div className="w-full bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]"
      style={{ boxShadow: '0 2px 12px rgba(13,24,61,0.05)' }}>
      {inner}
    </div>
  )
}
