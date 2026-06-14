import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Sparkles, CheckCircle2, Mic, BookOpen,
  AlertCircle, Lightbulb, Briefcase, ArrowRight, Loader,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchStudentApplications } from '../services/applications'

// Student interview prep categories and content
const PREP_CATEGORIES = {
  prepare: {
    label: 'Prepare',
    icon: Sparkles,
    tips: [
      'Research the NGO thoroughly - read their mission, annual reports, and recent news',
      'Prepare STAR stories (Situation, Task, Action, Result) for 3-5 key accomplishments',
      'Review the job description and align your experience with key responsibilities',
      'Prepare thoughtful questions about team culture, impact measurement, and growth',
      'Practice your elevator pitch - concise summary of who you are and why you\'re interested',
    ],
  },
  expect: {
    label: 'Expect',
    icon: Clock,
    tips: [
      'Expect 30-60 minute interviews with multiple questions about past experiences',
      'They may ask situational questions about how you\'d handle specific scenarios',
      'Be prepared to discuss your technical skills and how they apply to the role',
      'They will likely ask about your motivation for working in the nonprofit sector',
      'You may be given a brief technical challenge or case study to solve',
    ],
  },
  avoid: {
    label: 'Avoid',
    icon: AlertCircle,
    tips: [
      'Don\'t speak negatively about previous employers or team members',
      'Avoid generic answers - be specific with examples and metrics when possible',
      'Don\'t oversell your skills - be honest about what you know and don\'t know',
      'Avoid checking your phone or appearing distracted during the interview',
      'Don\'t ask only about salary/benefits in initial interviews',
    ],
  },
  tips: {
    label: 'Tips',
    icon: Lightbulb,
    tips: [
      'Join 5 minutes early to test your camera, microphone, and internet connection',
      'Dress professionally - even for virtual interviews, first impressions matter',
      'Speak clearly and at a measured pace - interviewers need to understand you',
      'Ask follow-up questions to show genuine interest and engagement',
      'Send a thank-you email within 24 hours referencing specific discussion points',
    ],
  },
}

// Interview prep guides for NGOs
const INTERVIEW_GUIDES = {
  'Web Developer': {
    questions: [
      'Tell me about your most complex web project. What were the main technical challenges?',
      'How do you approach debugging performance issues in web applications?',
      'Describe your experience with responsive design and cross-browser compatibility.',
      'Tell me about a time you had to learn a new framework or technology quickly.',
      'How do you stay updated with web development trends and best practices?',
    ],
    lookFor: [
      'Strong problem-solving approach with clear explanation of technical decisions',
      'Hands-on experience with modern frameworks and development tools',
      'Understanding of web performance, accessibility, and user experience',
      'Ability to communicate technical concepts to non-technical stakeholders',
      'Passion for continuous learning in a rapidly evolving field',
    ],
    redFlags: [
      'Cannot explain their own code decisions or technical choices',
      'Limited awareness of web accessibility standards (WCAG)',
      'No experience with version control or collaborative development',
      'Dismissive of testing, documentation, or code quality',
      'Unable to discuss trade-offs between different technical approaches',
    ],
  },
  'Designer': {
    questions: [
      'Walk me through your design process for a recent project.',
      'How do you approach user research and feedback in your design work?',
      'Tell me about a time you had to simplify a complex interface.',
      'How do you balance aesthetics with functionality and user needs?',
      'Describe your experience with design systems and component libraries.',
    ],
    lookFor: [
      'User-centered design thinking and empathy for end users',
      'Clear communication of design rationale and decision-making',
      'Experience with modern design tools and prototyping',
      'Understanding of accessibility and inclusive design principles',
      'Ability to iterate based on feedback and user testing',
    ],
    redFlags: [
      'Defensive about design choices without solid reasoning',
      'No consideration for accessibility or inclusive design',
      'Inability to explain design decisions to non-designers',
      'No experience with user research or user testing',
      'Treating design as purely aesthetic rather than functional',
    ],
  },
  'Content Lead': {
    questions: [
      'Describe your approach to developing content strategy for an organization.',
      'How do you measure content effectiveness and ROI?',
      'Tell me about a content campaign you led. What made it successful?',
      'How do you stay current with content trends and platform algorithms?',
      'How do you balance creative vision with data-driven decisions?',
    ],
    lookFor: [
      'Strategic thinking about audience, messaging, and goals',
      'Strong writing and communication skills across formats',
      'Experience with content management systems and analytics',
      'Ability to lead and collaborate with creative teams',
      'Understanding of SEO and content optimization',
    ],
    redFlags: [
      'No experience with content analytics or measuring impact',
      'Poor writing quality or communication skills',
      'Unable to articulate content strategy or vision',
      'No experience managing content teams or projects',
      'Resistant to data-driven decision making',
    ],
  },
}

function StudentView() {
  const { user } = useApp()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [selectedTab, setSelectedTab] = useState('prepare')

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    fetchStudentApplications(user.id)
      .then(apps => {
        setApps(apps)
        if (apps.length > 0) setSelectedAppId(apps[0].id)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  const selectedApp = apps.find(a => a.id === selectedAppId)
  const tabCategory = PREP_CATEGORIES[selectedTab]
  const TabIcon = tabCategory?.icon || Sparkles

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* LEFT: Sidebar - List of Opportunities */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden h-fit lg:sticky lg:top-6">

        <div className="p-4 border-b border-[rgba(13,24,61,0.08)]">
          <h3 className="text-[13px] font-bold text-[#0D183D] uppercase tracking-widest">Your Applications</h3>
          <p className="text-[10px] text-[#4B6382] mt-1">{apps.length} applied</p>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {apps.map((app, i) => (
            <motion.button
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`w-full text-left px-4 py-3 border-b border-[rgba(13,24,61,0.06)] transition-all ${
                selectedAppId === app.id
                  ? 'bg-[#FFB703]/10 border-l-4 border-l-[#FFB703]'
                  : 'hover:bg-[#F8F9FB]'
              }`}>
              <p className="text-[13px] font-semibold text-[#0D183D] truncate">{app.ngo_name || app.opportunity_title}</p>
              <p className="text-[11px] text-[#4B6382] mt-0.5 truncate">{app.role_title || 'Position'}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* RIGHT: Interview Prep Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader size={32} className="text-[#FFB703] animate-spin mx-auto mb-3"/>
            <p className="text-[#4B6382]">Loading your applications...</p>
          </div>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]">
          <Briefcase size={48} className="text-[#FFB703]/30 mx-auto mb-4"/>
          <p className="text-[16px] font-semibold text-[#0D183D] mb-2">No applications yet</p>
          <p className="text-[14px] text-[#4B6382] mb-4">Apply to opportunities to see interview prep guides</p>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#0D183D' }}>
            Browse opportunities <ArrowRight size={14}/>
          </button>
        </div>
      ) : selectedApp ? (
        <motion.div
          key={selectedAppId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}>

          {/* Header */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[14px] font-extrabold text-[#0D183D]">{selectedApp.ngo_name || selectedApp.opportunity_title}</p>
                <p className="text-[12px] text-[#4B6382] mt-1">{selectedApp.role_title || 'Position'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(255,183,3,0.1)' }}>
                <Sparkles size={16} style={{ color:'#FFB703' }}/>
              </div>
            </div>
            <p className="text-[12px] text-[#4B6382]">Interview preparation guide</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden">
            <div className="flex gap-0 border-b border-[rgba(13,24,61,0.08)]">
              {Object.entries(PREP_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key)}
                  className={`flex-1 px-4 py-3 text-center text-[12px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                    selectedTab === key
                      ? 'text-[#FFB703] border-b-[#FFB703]'
                      : 'text-[#4B6382] border-b-transparent hover:text-[#0D183D]'
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ background:'#FFB703' }}>
                  <TabIcon size={14} className="text-white"/>
                </div>
                <p className="text-[13px] font-bold text-[#0D183D]">{tabCategory.label}</p>
              </div>

              <div className="space-y-3">
                {tabCategory.tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(13,24,61,0.03)' }}>
                    <div className="text-[#FFB703] font-bold flex-shrink-0 pt-0.5">•</div>
                    <p className="text-[12px] text-[#4B6382] leading-relaxed">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  )
}

function NGOView() {
  const { profile } = useApp()
  const [ngoOpportunities, setNgoOpportunities] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedTab, setSelectedTab] = useState('prepare')

  useEffect(() => {
    if (profile?.opportunities) {
      const opps = Array.isArray(profile.opportunities) ? profile.opportunities : []
      setNgoOpportunities(opps)
      if (opps.length > 0 && !selectedRole) {
        setSelectedRole(opps[0].title)
      }
    }
  }, [profile])

  const selectedOpp = ngoOpportunities.find(o => o.title === selectedRole)
  const guide = selectedOpp ? INTERVIEW_GUIDES[selectedRole] : null
  const tabCategory = PREP_CATEGORIES[selectedTab]
  const TabIcon = tabCategory?.icon || Sparkles

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* LEFT: Sidebar - List of Opportunities Posted */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden h-fit lg:sticky lg:top-6">

        <div className="p-4 border-b border-[rgba(13,24,61,0.08)]">
          <h3 className="text-[13px] font-bold text-[#0D183D] uppercase tracking-widest">Your Roles</h3>
          <p className="text-[10px] text-[#4B6382] mt-1">{ngoOpportunities.length} posted</p>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {ngoOpportunities.map((opp, i) => (
            <motion.button
              key={opp.id}
              onClick={() => setSelectedRole(opp.title)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`w-full text-left px-4 py-3 border-b border-[rgba(13,24,61,0.06)] transition-all ${
                selectedRole === opp.title
                  ? 'bg-[#FFB703]/10 border-l-4 border-l-[#FFB703]'
                  : 'hover:bg-[#F8F9FB]'
              }`}>
              <p className="text-[13px] font-semibold text-[#0D183D] truncate">{opp.title}</p>
              <p className="text-[11px] text-[#4B6382] mt-0.5 truncate">{opp.location || 'Remote'}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* RIGHT: Interview Prep Content */}
      {ngoOpportunities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]">
          <Briefcase size={48} className="text-[#FFB703]/30 mx-auto mb-4"/>
          <p className="text-[16px] font-semibold text-[#0D183D] mb-2">No roles posted yet</p>
          <p className="text-[14px] text-[#4B6382]">Create opportunities to see interview prep guides</p>
        </div>
      ) : selectedOpp && guide ? (
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}>

          {/* Header */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[14px] font-extrabold text-[#0D183D]">{selectedOpp.title}</p>
                <p className="text-[12px] text-[#4B6382] mt-1">Interview preparation guide</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(255,183,3,0.1)' }}>
                <Mic size={16} style={{ color:'#FFB703' }}/>
              </div>
            </div>
            <p className="text-[12px] text-[#4B6382]">Tips for interviewing candidates for this role</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] overflow-hidden mb-6">
            <div className="flex gap-0 border-b border-[rgba(13,24,61,0.08)]">
              <button
                onClick={() => setSelectedTab('questions')}
                className={`flex-1 px-4 py-3 text-center text-[12px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                  selectedTab === 'questions'
                    ? 'text-[#FFB703] border-b-[#FFB703]'
                    : 'text-[#4B6382] border-b-transparent hover:text-[#0D183D]'
                }`}>
                Questions
              </button>
              <button
                onClick={() => setSelectedTab('lookfor')}
                className={`flex-1 px-4 py-3 text-center text-[12px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                  selectedTab === 'lookfor'
                    ? 'text-[#FFB703] border-b-[#FFB703]'
                    : 'text-[#4B6382] border-b-transparent hover:text-[#0D183D]'
                }`}>
                Look For
              </button>
              <button
                onClick={() => setSelectedTab('redflags')}
                className={`flex-1 px-4 py-3 text-center text-[12px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                  selectedTab === 'redflags'
                    ? 'text-[#FFB703] border-b-[#FFB703]'
                    : 'text-[#4B6382] border-b-transparent hover:text-[#0D183D]'
                }`}>
                Red Flags
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {selectedTab === 'questions' && (
                  <motion.div
                    key="questions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ background:'#FFB703' }}>
                        <Mic size={14} className="text-white"/>
                      </div>
                      <p className="text-[13px] font-bold text-[#0D183D]">Questions to Ask</p>
                    </div>
                    <div className="space-y-3">
                      {guide.questions.map((q, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(13,24,61,0.03)' }}>
                          <div className="text-[#FFB703] font-bold flex-shrink-0 pt-0.5 text-[12px]">Q{i+1}</div>
                          <p className="text-[12px] text-[#4B6382] leading-relaxed">{q}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {selectedTab === 'lookfor' && (
                  <motion.div
                    key="lookfor"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ background:'#10B981' }}>
                        <Lightbulb size={14} className="text-white"/>
                      </div>
                      <p className="text-[13px] font-bold text-[#0D183D]">What to Look For</p>
                    </div>
                    <div className="space-y-3">
                      {guide.lookFor.map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(13,24,61,0.03)' }}>
                          <div className="text-[#10B981] font-bold flex-shrink-0 pt-0.5">✓</div>
                          <p className="text-[12px] text-[#4B6382] leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {selectedTab === 'redflags' && (
                  <motion.div
                    key="redflags"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ background:'#EF4444' }}>
                        <AlertCircle size={14} className="text-white"/>
                      </div>
                      <p className="text-[13px] font-bold text-[#0D183D]">Red Flags</p>
                    </div>
                    <div className="space-y-3">
                      {guide.redFlags.map((flag, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(13,24,61,0.03)' }}>
                          <div className="text-[#EF4444] font-bold flex-shrink-0 pt-0.5">⚠</div>
                          <p className="text-[12px] text-[#4B6382] leading-relaxed">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  )
}

export default function Interviews() {
  const { user } = useApp()
  const isNGO = user?.role === 'ngo'

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FB]">
      <div className="px-8 py-7 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Interviews</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">
            {isNGO
              ? 'Interview guides for each role you posted'
              : 'Interview prep guides for your applications'}
          </p>
        </div>
        {isNGO ? <NGOView /> : <StudentView />}
      </div>
    </main>
  )
}
