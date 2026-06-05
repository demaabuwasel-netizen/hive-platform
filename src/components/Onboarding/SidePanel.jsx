import { motion } from 'framer-motion'

export default function SidePanel({ title, subtitle, trustPoints = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-3xl p-8 border border-[#E6E8EF] shadow-sm h-fit sticky top-24"
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
      <div className="space-y-6">
        {trustPoints.map((point, idx) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.08 }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-[14px] bg-[#FFB400]/10 border border-[#FFB400]/20 flex items-center justify-center">
              {point.icon && (
                <div className="text-[#FFB400]">
                  <point.icon size={22} strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0B163F] mb-1">
                {point.title}
              </p>
              <p className="text-xs text-[#4E6385] leading-relaxed">
                {point.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
