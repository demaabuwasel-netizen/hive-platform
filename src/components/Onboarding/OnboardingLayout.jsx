import { motion } from 'framer-motion'
import HiveLogo from '../HiveLogo'

export default function OnboardingLayout({ children, showLogo = true }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF6EA] to-[#FCF8EF]">
      {/* Header */}
      {showLogo && (
        <div className="border-b border-[#E6E8EF]">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <HiveLogo size={20} nameSize="text-sm" />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {children}
      </div>
    </div>
  )
}
