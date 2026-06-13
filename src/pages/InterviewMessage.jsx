import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader, RotateCcw, Send } from 'lucide-react'
import { loadStudentProfile } from '../services/storage'

export default function InterviewMessage() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!studentId) return

    ;(async () => {
      try {
        const p = await loadStudentProfile(studentId)
        setProfile(p)
        if (p) await generateMessage(p)
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [studentId])

  async function generateMessage(prof) {
    setGenerating(true)
    try {
      // For now, create a professional template message
      // In the future, this would call an AI endpoint
      const generated = `Hi ${prof.name?.split(' ')[0] || 'there'},

We're excited about your application for our internship program! Your background in ${prof.field || 'development'} and demonstrated skills make you a strong fit for our team.

We'd like to move forward with the next step: a brief interview. This will be a great opportunity for us to discuss your experience and learn more about your career goals.

Would you be available for a 30-minute interview in the coming week? We're flexible with timing and can accommodate your schedule.

Looking forward to connecting with you!

Best regards`

      setMessage(generated)
    } catch (err) {
      console.error('Error generating message:', err)
      setMessage('We are interested in your application. Please let us know your availability for an interview.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSendMessage() {
    if (!message.trim()) {
      alert('Please write a message before sending')
      return
    }

    setSending(true)
    try {
      // TODO: Implement actual message sending via API
      // For now, just show success
      alert('Message sent to ' + (profile?.name || 'applicant'))
      navigate(-1)
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-300 rounded w-1/4" />
            <div className="h-96 bg-gray-300 rounded-2xl" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#FFB703] hover:text-[#D99E00] font-semibold mb-8 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-[28px] font-bold text-[#0D183D] mb-2">
            Interview Invitation Message
          </h1>
          <p className="text-[14px] text-[#4B6382]">
            Send an interview invitation to {profile?.name || 'this applicant'}
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Message Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
              <label className="text-[13px] font-bold text-[#0D183D] mb-3 block">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-64 p-4 border border-[rgba(13,24,61,0.1)] rounded-xl text-[13px] text-[#0D183D] placeholder-[#4B6382]/50 focus:outline-none focus:border-[#FFB703]"
              />
              <p className="text-[11px] text-[#4B6382] mt-2">
                {message.length} characters
              </p>
            </div>

            {/* Regenerate Button */}
            <motion.button
              onClick={() => generateMessage(profile)}
              disabled={generating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(13,24,61,0.1)] text-[#0D183D] font-semibold text-[12px] hover:bg-[rgba(13,24,61,0.02)] transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RotateCcw size={14} />
                  Regenerate Message
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Sidebar - Applicant Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Applicant Card */}
            <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6">
              <h3 className="text-[11px] font-bold text-[#0D183D] uppercase tracking-widest mb-4">
                Applicant
              </h3>
              <p className="text-[15px] font-bold text-[#0D183D] mb-1">{profile?.name}</p>
              <p className="text-[12px] text-[#4B6382] mb-4">{profile?.field || 'Student'}</p>
              <div className="space-y-2 text-[12px]">
                {profile?.university && (
                  <p className="text-[#4B6382]">
                    <span className="font-semibold text-[#0D183D]">University:</span> {profile.university}
                  </p>
                )}
                {profile?.city && (
                  <p className="text-[#4B6382]">
                    <span className="font-semibold text-[#0D183D]">Location:</span> {profile.city}
                  </p>
                )}
                {profile?.availability && (
                  <p className="text-[#4B6382]">
                    <span className="font-semibold text-[#0D183D]">Availability:</span> {profile.availability}
                  </p>
                )}
              </div>
            </div>

            {/* Send Button */}
            <motion.button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-semibold text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Send Message
                </>
              )}
            </motion.button>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mb-2">
                💡 Tips
              </p>
              <ul className="text-[11px] text-blue-800 space-y-1">
                <li>• Keep the tone professional yet friendly</li>
                <li>• Include specific details about the role</li>
                <li>• Make it easy for them to respond</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
