import { motion } from 'framer-motion'

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-px bg-[#E6E8EF]" />
        <motion.div
          className="absolute top-6 left-0 h-px bg-[#FFB400]"
          initial={{ width: 0 }}
          animate={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - ${(steps.length - 1) * 24}px)` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {/* Step circles */}
        <div className="flex justify-between w-full relative z-10">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <motion.button
                type="button"
                disabled
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm mb-3 transition-all"
                animate={{
                  background: index <= currentStep ? '#0B163F' : '#FFFFFF',
                  color: index <= currentStep ? '#FFFFFF' : '#4E6385',
                  borderColor: index <= currentStep ? '#0B163F' : '#E6E8EF',
                  boxShadow: index <= currentStep
                    ? '0 2px 8px rgba(11, 22, 63, 0.12)'
                    : '0 1px 3px rgba(0, 0, 0, 0.06)',
                }}
                style={{
                  border: '2px solid',
                }}
              >
                {index < currentStep ? (
                  <span className="text-lg">✓</span>
                ) : (
                  index + 1
                )}
              </motion.button>
              <span className="text-[12px] font-medium text-[#4E6385] text-center max-w-[80px]">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
