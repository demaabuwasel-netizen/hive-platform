import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Menu, X } from 'lucide-react'
import HiveLogo from '../HiveLogo'

export default function OnboardingLayout({ children, showNavigation = true, onExitOnboarding = null, onSwitchRole = null, switchRoleLabel = 'Switch role instead' }) {
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

  const handleSwitchRoleClick = async () => {
    setShowConfirm(false)
    if (onSwitchRole) await onSwitchRole()
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      {/* Subtle ambient wash — matches dashboard hero background */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]"
      />

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
              className="bg-white rounded-[28px] p-6 max-w-sm border border-[rgba(26,115,232,0.10)] shadow-xl"
            >
              <h3 className="text-lg font-bold text-[#202124] mb-2">Leave onboarding?</h3>
              <p className="text-sm text-[#5F6368] mb-6">
                Your progress here won't be saved. What would you like to do?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#DADCE0] text-[#202124] font-semibold text-xs transition-all hover:bg-[#F5F7FB]"
                >
                  No, continue
                </button>
                {onSwitchRole && (
                  <button
                    onClick={handleSwitchRoleClick}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#E8F0FE] text-[#1A73E8] font-semibold text-xs transition-all hover:bg-[#DCEAFD]"
                  >
                    {switchRoleLabel}
                  </button>
                )}
                <button
                  onClick={handleConfirmExit}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FF4D4F] text-white font-semibold text-xs transition-all hover:shadow-lg"
                >
                  Log out and leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {showNavigation && (
        <div className="sticky top-0 z-50 backdrop-blur-sm bg-[#F5F7FB]/80 border-b border-[rgba(26,115,232,0.08)]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <button
              onClick={handleLogoClick}
              className="hover:opacity-80 transition-opacity"
              type="button"
            >
              <HiveLogo size={20} nameSize="text-[1.3rem]" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <User size={20} className="text-[#202124]" />
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
