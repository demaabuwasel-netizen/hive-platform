import { motion } from 'framer-motion'
import Stepper from './Stepper'

export default function FormCard({ title, subtitle, icon: IconComponent = null, steps = null, currentStep = null, subtitleNoWrap = false, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[28px] p-6 border border-[rgba(26,115,232,0.10)] shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] hover:shadow-[0_18px_40px_rgba(17,24,39,0.09)] transition-all duration-300"
    >
      {steps && currentStep !== null && (
        <Stepper steps={steps} currentStep={currentStep} />
      )}

      {title && (
        <div className="mb-6">
          {IconComponent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#E8F0FE' }}
            >
              <IconComponent size={24} style={{ color: '#1A73E8' }} strokeWidth={1.5} />
            </motion.div>
          )}
          <h2 className="text-xl font-semibold text-[#202124] mb-2">
            {title}
          </h2>
          <p className={`text-[#5F6368] text-xs leading-relaxed ${subtitleNoWrap ? 'whitespace-nowrap' : 'max-w-lg'}`}>
            {subtitle}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  )
}
