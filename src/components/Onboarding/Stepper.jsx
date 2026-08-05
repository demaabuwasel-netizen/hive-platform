import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="mb-8 flex items-start justify-center">
      {steps.map((step, index) => {
        const done = index < currentStep
        const active = index === currentStep
        const filled = done || active
        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <motion.span
                className="relative flex shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                animate={{
                  width: active ? 28 : 24,
                  height: active ? 28 : 24,
                  background: filled ? '#1A73E8' : '#FFFFFF',
                  borderColor: filled ? '#1A73E8' : '#DADCE0',
                  color: filled ? '#FFFFFF' : '#9AA0A6',
                  boxShadow: active ? '0 0 0 4px rgba(26,115,232,0.15)' : '0 0 0 0 rgba(26,115,232,0)',
                }}
                transition={{ duration: 0.25 }}
              >
                {done ? <Check size={13} strokeWidth={3} /> : index + 1}
              </motion.span>
              <span
                className="text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap"
                style={{ color: filled ? '#1A73E8' : '#9AA0A6' }}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <motion.span
                className="mt-3 block h-[2px] rounded-full"
                animate={{ width: 24, background: done ? '#1A73E8' : '#DADCE0' }}
                transition={{ duration: 0.25 }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
