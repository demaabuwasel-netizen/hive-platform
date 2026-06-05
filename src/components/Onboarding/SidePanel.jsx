import { motion } from 'framer-motion'

export default function SidePanel({ title, subtitle, trustPoints = [], illustration = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-[#FAF6EA] rounded-2xl p-8 border border-[#E6E8EF] h-fit sticky top-8"
    >
      <h3 className="text-lg font-bold text-[#0B163F] mb-2">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[#4E6385] text-sm mb-8 leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Trust points */}
      <div className="space-y-5 mb-8">
        {trustPoints.map((point, idx) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-[#E6E8EF] flex items-center justify-center text-lg">
              {point.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B163F] mb-0.5">
                {point.title}
              </p>
              <p className="text-xs text-[#4E6385] leading-relaxed">
                {point.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Illustration placeholder */}
      {illustration && (
        <div className="mt-8 pt-8 border-t border-[#E6E8EF]">
          {illustration}
        </div>
      )}
    </motion.div>
  )
}
