import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { updateUserRow } from '../services/auth'
import HiveLogo from '../components/HiveLogo'

export default function FixAccount() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleFixAccount() {
    if (!selectedRole || !user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Reset account: set correct role and clear onboarding
      await updateUserRow(user.id, {
        role: selectedRole,
        onboarding_complete: false,
        onboarding_step: 0,
      })

      // Clear session storage
      sessionStorage.removeItem(`hive_user_role_${user.id}`)

      // Redirect to correct onboarding
      navigate(`/onboarding/${selectedRole}`, { replace: true })
    } catch (err) {
      console.error('Fix account error:', err)
      setError('Failed to fix account. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7E6] via-[#FFFBF5] to-[#FCF8EF] flex flex-col items-center justify-center px-6 py-10">
      <div className="absolute top-8 left-8">
        <HiveLogo size={28} nameSize="text-lg" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-[#0D183D] mb-3">
            Fix Your Account
          </h1>
          <p className="text-[16px] text-[#4B6382]">
            It looks like your account is set to the wrong role. Let's fix that!
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-4 mb-8">
          {/* Student Option */}
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setSelectedRole('student')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'student'
                ? 'border-[#FFB703] bg-[#FFF7E6]'
                : 'border-[#E5E7EB] bg-white hover:border-[#FFB703]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🎓</div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-[#0D183D] mb-1">
                  I'm a Student
                </h3>
                <p className="text-[13px] text-[#4B6382]">
                  Build experience with real projects
                </p>
              </div>
              {selectedRole === 'student' && (
                <div className="w-5 h-5 rounded-full bg-[#FFB703]" />
              )}
            </div>
          </motion.button>

          {/* NGO Option */}
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setSelectedRole('ngo')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'ngo'
                ? 'border-[#0D183D] bg-[#F5F7FA]'
                : 'border-[#E5E7EB] bg-white hover:border-[#0D183D]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🌍</div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-[#0D183D] mb-1">
                  I represent an NGO
                </h3>
                <p className="text-[13px] text-[#4B6382]">
                  Find skilled student volunteers
                </p>
              </div>
              {selectedRole === 'ngo' && (
                <div className="w-5 h-5 rounded-full bg-[#0D183D]" />
              )}
            </div>
          </motion.button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200"
          >
            <p className="text-[13px] text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Fix Button */}
        <motion.button
          onClick={handleFixAccount}
          disabled={!selectedRole || loading}
          className="w-full py-4 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: '#0D183D' }}
        >
          {loading ? 'Fixing your account...' : 'Fix My Account'}
        </motion.button>

        <p className="text-center text-[12px] text-[#4B6382] mt-6">
          Your account will be reset so you can complete the correct onboarding
        </p>
      </motion.div>
    </div>
  )
}
