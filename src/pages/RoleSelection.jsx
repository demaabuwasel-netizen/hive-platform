import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import HiveLogo from '../components/HiveLogo'

function HexBg() {
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z' fill='%23F59E0B' fill-opacity='0.06'/%3E%3C/svg%3E")` }}
      aria-hidden="true" />
  )
}

const STUDENT_PERKS = ['Describe your skills & goals in your own words', 'Get AI-matched with NGOs that need you', 'Build a real portfolio doing work that matters']
const NGO_PERKS     = ['Describe your mission in plain language', 'Get matched with students whose skills fit your needs', 'Every match comes with a clear explanation']

export default function RoleSelection() {
  const { user, updateRole } = useApp()
  const navigate = useNavigate()

  function select(role) {
    updateRole(role)
    navigate(role === 'student' ? '/onboarding/student' : '/onboarding/ngo')
  }

  return (
    <div className="min-h-screen bg-[#FFF7E6] flex flex-col relative overflow-hidden">
      <HexBg />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-honey-300 opacity-10 blur-3xl pointer-events-none" aria-hidden="true"/>

      {/* Top bar */}
      <div className="p-6 relative">
        <Link to="/" aria-label="Back to home">
          <HiveLogo size={28} nameSize="text-lg" />
        </Link>
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
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => select('student')}
              className="card text-left group border-2 border-transparent hover:border-honey-300 hover:shadow-glow-honey transition-all duration-200 cursor-pointer relative overflow-hidden"
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
                Continue as Student →
              </span>
            </motion.button>

            {/* NGO card */}
            <motion.button
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => select('ngo')}
              className="card text-left group border-2 border-transparent hover:border-navy-300 transition-all duration-200 cursor-pointer relative overflow-hidden"
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
                Continue as NGO →
              </span>
            </motion.button>
          </div>

          <p className="text-center text-xs text-navy-400 mt-8">
            Not sure yet?{' '}
            <Link to="/" className="text-navy-600 font-medium hover:underline">Go back to the homepage</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
