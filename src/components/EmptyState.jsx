import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'


export default function EmptyState({
  emoji,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondary,
  compact = false,
  showIllustration = false, // show the hero illustration asset by default
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-12 px-8'}`}
    >
      {/* Illustration asset — primary visual */}
      {showIllustration && !compact && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="mb-6"
        >
          <img
            src=""
            alt=""
            className="w-48 object-contain"
            aria-hidden="true"
            draggable={false}
          />
        </motion.div>
      )}

      {/* Emoji fallback for compact mode */}
      {(compact || !showIllustration) && emoji && (
        <motion.div
          initial={{ scale: 0.6, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="text-5xl mb-4 select-none"
          aria-hidden="true"
        >
          {emoji}
        </motion.div>
      )}

      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`font-bold text-[#0D183D] mb-2 ${compact ? 'text-base' : 'text-lg'}`}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.28 }}
        className="text-[#4B6382] text-sm leading-relaxed mb-6 max-w-xs"
      >
        {description}
      </motion.p>

      {actionLabel && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="flex flex-col items-center gap-3"
        >
          {actionHref ? (
            <Link to={actionHref} className="btn-honey text-sm px-6 py-2.5">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-honey text-sm px-6 py-2.5">
              {actionLabel}
            </button>
          )}

          {secondary && (
            <Link to={secondary.href} className="text-sm text-navy-400 hover:text-navy-600 transition-colors">
              {secondary.label}
            </Link>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
