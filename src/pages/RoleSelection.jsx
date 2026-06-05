import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import HiveLogo from '../components/HiveLogo'
import cardsBackground from '../assets/cards_background.png'
import { AlertCircle, X } from 'lucide-react'

function HexBg() {
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url(${cardsBackground})`, backgroundSize: 'auto', backgroundRepeat: 'repeat', opacity: 0.1 }}
      aria-hidden="true" />
  )
}

const STUDENT_PERKS = ['Describe your skills & goals in your own words', 'Get AI-matched with NGOs that need you', 'Build a real portfolio doing work that matters']
const NGO_PERKS     = ['Describe your mission in plain language', 'Get matched with students whose skills fit your needs', 'Every match comes with a clear explanation']

export default function RoleSelection() {
  const { user, updateRole } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showConfirmExit, setShowConfirmExit] = useState(false)

  async function select(role) {
    setLoading(true)
    try {
      await updateRole(role)
      navigate(role === 'student' ? '/onboarding/student' : '/onboarding/ngo')
    } finally {
      setLoading(false)
    }
  }

  function handleConfirmExit() {
    // Clear any draft data from localStorage
    try {
      const studentDraftKey = `onboarding_draft_student_${user?.id}`
      const ngoDraftKey = `onboarding_draft_ngo_${user?.id}`
      localStorage.removeItem(studentDraftKey)
      localStorage.removeItem(ngoDraftKey)
    } catch {}
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#FFF7E6] flex flex-col relative overflow-hidden">
      <HexBg />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-honey-300 opacity-10 blur-3xl pointer-events-none" aria-hidden="true"/>

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
            <h1 className="text-3xl font-extrabold text-[#0D183D] mb-2">
              Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-[#4B6382] text-base">
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
              className={`card text-left group border-2 border-transparent hover:border-honey-300 hover:shadow-glow-honey transition-all duration-200 relative overflow-hidden ${
                loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {/* Hex watermark */}
              <div className="absolute -top-4 -right-4 opacity-[0.07]" aria-hidden="true">
                <svg width="80" height="91" viewBox="0 0 28 32" fill="none">
                  <polygon points="14,0 28,8 28,24 14,32 0,24 0,8" stroke="#F59E0B" strokeWidth="1.5"/>
                </svg>
              </div>

              <div className="w-14 h-14 bg-honey-100 rounded-2xl flex items-center justify-center text-3xl mb-5">
                🎓
              </div>
              <h2 className="text-xl font-extrabold text-[#0D183D] mb-2 group-hover:text-honey-600 transition-colors">
                I'm a Student
              </h2>
              <p className="text-[#4B6382] text-sm leading-relaxed mb-5">
                I want to build real-world experience by contributing to meaningful projects.
              </p>
              <ul className="space-y-2 mb-6">
                {STUDENT_PERKS.map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-navy-600">
                    <span className="text-honey-500 font-bold mt-0.5 shrink-0">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              <span className="btn-honey text-sm py-2.5 px-5 inline-block">
                {loading ? 'Loading...' : 'Continue as Student →'}
              </span>
            </motion.button>

            {/* NGO card */}
            <motion.button
              whileHover={!loading ? { y: -4, transition: { duration: 0.2 } } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              onClick={() => select('ngo')}
              disabled={loading}
              className={`card text-left group border-2 border-transparent hover:border-navy-300 transition-all duration-200 relative overflow-hidden ${
                loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {/* Hex watermark */}
              <div className="absolute -top-4 -right-4 opacity-[0.06]" aria-hidden="true">
                <svg width="80" height="91" viewBox="0 0 28 32" fill="none">
                  <polygon points="14,0 28,8 28,24 14,32 0,24 0,8" stroke="#2d5a9e" strokeWidth="1.5"/>
                </svg>
              </div>

              <div className="w-14 h-14 bg-navy-100 rounded-2xl flex items-center justify-center text-3xl mb-5">
                🌍
              </div>
              <h2 className="text-xl font-extrabold text-[#0D183D] mb-2 group-hover:text-navy-600 transition-colors">
                I represent an NGO
              </h2>
              <p className="text-[#4B6382] text-sm leading-relaxed mb-5">
                We need skilled student volunteers to help our organisation grow and deliver impact.
              </p>
              <ul className="space-y-2 mb-6">
                {NGO_PERKS.map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-navy-600">
                    <span className="text-navy-400 font-bold mt-0.5 shrink-0">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              <span className="btn-navy text-sm py-2.5 px-5 inline-block">
                {loading ? 'Loading...' : 'Continue as NGO →'}
              </span>
            </motion.button>
          </div>

          <p className="text-center text-xs text-navy-400 mt-8">
            Not sure yet?{' '}
            <Link to="/" className="text-navy-600 font-medium hover:underline">Go back to the homepage</Link>
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
            className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFECEB' }}>
                <AlertCircle size={20} style={{ color: '#FF4D4F' }} />
              </div>
              <h3 className="text-lg font-extrabold text-[#0D183D]">Leave onboarding?</h3>
            </div>

            <p className="text-[13px] text-[#4B6382] mb-6">
              Are you sure you want to go back? Any unsaved progress will be cleared.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-[12px] border-2 border-[#0D183D] text-[#0D183D] hover:bg-[#F8F9FB] transition-colors"
              >
                No, continue
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-[12px] text-white transition-colors"
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
