import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Menu, X } from 'lucide-react'
import HiveLogo from '../HiveLogo'

export default function OnboardingLayout({ children, showNavigation = true }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF6EA] via-[#FFFBF5] to-[#FCF8EF]">
      {/* Subtle radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#FFB400] rounded-full opacity-5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B163F] rounded-full opacity-3 blur-3xl" />
      </div>

      {/* Header */}
      {showNavigation && (
        <div className="sticky top-0 z-50 backdrop-blur-sm bg-[#FFFBF5]/80 border-b border-[#E6E8EF]/40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <HiveLogo size={20} nameSize="text-sm" />
            <button
              className="p-2 rounded-lg hover:bg-[#F5F7FB] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <User size={20} className="text-[#0B163F]" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
