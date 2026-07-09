import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Menu, X } from 'lucide-react'
import HiveLogo from '../HiveLogo'

export default function OnboardingLayout({ children, showNavigation = true, onExitOnboarding = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  const handleLogoClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmExit = async () => {
    // Clear localStorage and logout
    if (onExitOnboarding) {
      await onExitOnboarding()
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF6EA] via-[#FFFBF5] to-[#FCF8EF]">
      {/* Subtle radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#FFB400] rounded-full opacity-5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B163F] rounded-full opacity-3 blur-3xl" />
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm border border-[#E6E8EF] shadow-lg"
            >
              <h3 className="text-lg font-bold text-[#0B163F] mb-2">Leave onboarding?</h3>
              <p className="text-sm text-[#4E6385] mb-6">
                Your progress will not be saved. Are you sure you want to leave?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-[14px] bg-white border-2 border-[#E6E8EF] text-[#0B163F] font-semibold text-xs transition-all hover:border-[#D4D8E0]"
                >
                  No, continue
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="flex-1 px-4 py-2.5 rounded-[14px] bg-[#FF4D4F] text-white font-semibold text-xs transition-all hover:shadow-lg"
                >
                  Yes, leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {showNavigation && (
        <div className="sticky top-0 z-50 backdrop-blur-sm bg-[#FFFBF5]/80 border-b border-[#E6E8EF]/40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <button
              onClick={handleLogoClick}
              className="hover:opacity-80 transition-opacity"
              type="button"
            >
              <HiveLogo size={20} nameSize="text-[1.3rem]" />
            </button>
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
