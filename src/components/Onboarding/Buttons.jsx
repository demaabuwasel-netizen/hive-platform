import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function PrimaryButton({ children, onClick, disabled = false, loading = false, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`px-6 py-3 rounded-2xl bg-[#1A73E8] text-white font-semibold text-xs transition-all flex items-center gap-2 justify-center min-w-[130px] ${
        disabled || loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[rgba(26,115,232,0.25)]'
      } ${className}`}
    >
      {loading ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
          />
          Saving...
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={16} strokeWidth={2} />
        </>
      )}
    </motion.button>
  )
}

export function SecondaryButton({ children, onClick, disabled = false, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`px-6 py-3 rounded-2xl bg-white border border-[#DADCE0] text-[#202124] font-semibold text-xs transition-all ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#F5F7FB] hover:shadow-sm'
      } ${className}`}
    >
      {children}
    </motion.button>
  )
}
