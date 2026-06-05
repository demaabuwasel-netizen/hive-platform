import { motion } from 'framer-motion'

export default function Stepper({ steps, currentStep }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-12 flex justify-center"
    >
      <div className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-[#E6E8EF] shadow-sm">
        <div className="flex items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.button
                  type="button"
                  disabled
                  className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-all"
                  animate={{
                    background: index <= currentStep ? '#0B163F' : '#F5F7FB',
                    color: index <= currentStep ? '#FFFFFF' : '#9CA3AF',
                    boxShadow: index <= currentStep
                      ? '0 4px 12px rgba(11, 22, 63, 0.15)'
                      : 'none',
                  }}
                  style={{
                    border: '1.5px solid',
                    borderColor: index <= currentStep ? '#0B163F' : '#E6E8EF',
                  }}
                >
                  {index < currentStep ? (
                    <span className="text-sm">✓</span>
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </motion.button>
                <span className="text-[9px] font-semibold text-[#4E6385] whitespace-nowrap">
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <motion.div
                  className="h-px bg-[#E6E8EF]"
                  animate={{
                    background: index < currentStep ? '#0B163F' : '#E6E8EF',
                    width: index < currentStep ? 32 : 32,
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
