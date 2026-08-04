import { motion } from 'framer-motion'

export default function Stepper({ steps, currentStep }) {
  const total = steps.length
  const progress = total > 1 ? (currentStep / (total - 1)) * 100 : 100
  const activeTitle = steps[currentStep]?.title

  return (
    <div className="mb-8">
      <div className="relative h-[3px] w-full rounded-full bg-[#E8EAED]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[#1A73E8]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        />
        <motion.div
          className="absolute top-1/2 h-2.5 w-2.5 rounded-full bg-[#1A73E8] ring-4 ring-[rgba(26,115,232,0.15)]"
          initial={false}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ translateX: '-50%', translateY: '-50%' }}
        />
      </div>
      <div className="mt-3.5 flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-[#9AA0A6]">
          Step {currentStep + 1} of {total}
        </span>
        <span className="text-[12px] font-semibold text-[#202124]">
          {activeTitle}
        </span>
      </div>
    </div>
  )
}
