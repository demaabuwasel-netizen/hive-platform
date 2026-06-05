import { motion } from 'framer-motion'

export default function FormCard({ title, subtitle, icon: IconComponent = null, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl p-8 border border-[#E6E8EF] shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="mb-8">
        {IconComponent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-12 h-12 rounded-xl bg-[#FFB400]/10 flex items-center justify-center mb-4 border border-[#FFB400]/20"
          >
            <IconComponent size={24} className="text-[#FFB400]" strokeWidth={1.5} />
          </motion.div>
        )}
        <h2 className="text-2xl font-bold text-[#0B163F] mb-2">
          {title}
        </h2>
        <p className="text-[#4E6385] text-sm leading-relaxed max-w-lg">
          {subtitle}
        </p>
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  )
}
