import { motion } from 'framer-motion'

export default function FormCard({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-8 border border-[#E6E8EF] shadow-sm"
    >
      <h2 className="text-2xl font-bold text-[#0B163F] mb-2">
        {title}
      </h2>
      <p className="text-[#4E6385] text-sm mb-8 leading-relaxed max-w-md">
        {subtitle}
      </p>

      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  )
}
