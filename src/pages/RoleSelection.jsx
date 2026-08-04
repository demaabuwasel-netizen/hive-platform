import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import HiveLogo from '../components/HiveLogo'
import { AlertCircle, X } from 'lucide-react'

const STUDENT_PERKS = ['Describe your skills & goals in your own words', 'Get AI-matched with NGOs that need you', 'Build a real portfolio doing work that matters']
const NGO_PERKS     = ['Describe your mission in plain language', 'Get matched with students whose skills fit your needs', 'Every match comes with a clear explanation']

export default function RoleSelection() {
  const { user, updateRole, logout } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showConfirmExit, setShowConfirmExit] = useState(false)

  async function select(role) {
    setLoading(true)
    try {
      // Clear any old drafts before selecting a new role
      try {
        const studentDraftKey = `hive_ob_student_${user?.id}`
        const ngoDraftKey = `hive_ob_ngo_${user?.id}`
        localStorage.removeItem(studentDraftKey)
        localStorage.removeItem(ngoDraftKey)
      } catch {}

      await updateRole(role)
      navigate(role === 'student' ? '/onboarding/student' : '/onboarding/ngo')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmExit() {
    // Clear any draft data from localStorage
    try {
      const studentDraftKey = `hive_ob_student_${user?.id}`
      const ngoDraftKey = `hive_ob_ngo_${user?.id}`
      localStorage.removeItem(studentDraftKey)
      localStorage.removeItem(ngoDraftKey)
    } catch {}
    // Logout so they can start fresh
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col relative overflow-hidden">
      {/* Ambient gradient wash — matches dashboard hero background */}
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]"
        aria-hidden="true"
      />

      {/* Top bar */}
      <div className="p-6 relative">
        <button onClick={() => setShowConfirmExit(true)} aria-label="Back to home" className="hover:opacity-80 transition-opacity">
          <HiveLogo size={28} nameSize="text-lg" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
              className="flex justify-center mb-5"
            >
              <HiveLogo size={48} showName={false} />
            </motion.div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#202124] mb-2">
              Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-[#5F6368] text-base">
              Who are you joining as? We'll personalise your experience.
            </p>
          </div>

          {/* Role cards */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Student card */}
            <motion.button
              whileHover={!loading ? { y: -4, transition: { duration: 0.2 } } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              onClick={() => select('student')}
              disabled={loading}
              className={`text-left group bg-white rounded-[28px] p-6 border border-[rgba(26,115,232,0.10)] shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] hover:shadow-[0_18px_40px_rgba(17,24,39,0.09)] hover:border-[rgba(26,115,232,0.35)] transition-all duration-200 ${
                loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5" style={{ background: '#E8F0FE' }}>
                🎓
              </div>
              <h2 className="text-xl font-semibold text-[#202124] mb-2 group-hover:text-[#1A73E8] transition-colors">
                I'm a Student
              </h2>
              <p className="text-[#5F6368] text-sm leading-relaxed mb-5">
                I want to build real-world experience by contributing to meaningful projects.
              </p>
              <ul className="space-y-2 mb-6">
                {STUDENT_PERKS.map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-[#3C4043]">
                    <span className="font-bold mt-0.5 shrink-0" style={{ color: '#1A73E8' }}>✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              <span
                className="text-sm font-semibold py-2.5 px-5 inline-block rounded-2xl text-white transition-colors"
                style={{ background: '#1A73E8' }}
              >
                {loading ? 'Loading...' : 'Continue as Student →'}
              </span>
            </motion.button>

            {/* NGO card */}
            <motion.button
              whileHover={!loading ? { y: -4, transition: { duration: 0.2 } } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              onClick={() => select('ngo')}
              disabled={loading}
              className={`text-left group bg-white rounded-[28px] p-6 border border-[rgba(52,168,83,0.10)] shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] hover:shadow-[0_18px_40px_rgba(17,24,39,0.09)] hover:border-[rgba(52,168,83,0.35)] transition-all duration-200 ${
                loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5" style={{ background: '#E6F4EA' }}>
                🌍
              </div>
              <h2 className="text-xl font-semibold text-[#202124] mb-2 group-hover:text-[#188038] transition-colors">
                I represent an NGO
              </h2>
              <p className="text-[#5F6368] text-sm leading-relaxed mb-5">
                We need skilled student volunteers to help our organisation grow and deliver impact.
              </p>
              <ul className="space-y-2 mb-6">
                {NGO_PERKS.map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-[#3C4043]">
                    <span className="font-bold mt-0.5 shrink-0" style={{ color: '#188038' }}>✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              <span
                className="text-sm font-semibold py-2.5 px-5 inline-block rounded-2xl text-white transition-colors"
                style={{ background: '#188038' }}
              >
                {loading ? 'Loading...' : 'Continue as NGO →'}
              </span>
            </motion.button>
          </div>

          <p className="text-center text-xs text-[#5F6368] mt-8">
            Not sure yet?{' '}
            <Link to="/" className="text-[#1A73E8] font-medium hover:underline">Go back to the homepage</Link>
          </p>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmExit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setShowConfirmExit(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[28px] shadow-xl p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFECEB' }}>
                <AlertCircle size={20} style={{ color: '#FF4D4F' }} />
              </div>
              <h3 className="text-lg font-semibold text-[#202124]">Leave onboarding?</h3>
            </div>

            <p className="text-[13px] text-[#5F6368] mb-6">
              Are you sure you want to go back? Any unsaved progress will be cleared.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="flex-1 px-4 py-3 rounded-2xl font-semibold text-[12px] border border-[#DADCE0] text-[#202124] hover:bg-[#F5F7FB] transition-colors"
              >
                No, continue
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 px-4 py-3 rounded-2xl font-semibold text-[12px] text-white transition-colors"
                style={{ background: '#FF4D4F' }}
              >
                Yes, leave
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
