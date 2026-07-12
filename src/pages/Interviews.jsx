import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Sparkles, AlertCircle, Lightbulb, Briefcase, ArrowRight,
  ArrowLeft, ChevronDown, ChevronUp, Send, UserRound,
  Languages, Mic, Keyboard, PlayCircle, StopCircle, Heart,
  FileText, CheckCircle2, Target,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchStudentApplications } from '../services/applications'
import { fetchNgoOpportunities, fetchOpportunity } from '../services/opportunities'
import { withTimeout } from '../utils/withTimeout'

const STUDENT_INTERVIEW_CATEGORIES = [
  {
    id: 'opening',
    label: 'Opening',
    hint: 'Introduce yourself and warm up.',
    icon: Sparkles,
  },
  {
    id: 'motivation',
    label: 'Motivation',
    hint: 'Why this NGO and this role?',
    icon: Heart,
  },
  {
    id: 'skills',
    label: 'Skills fit',
    hint: 'Show examples, tools, and strengths.',
    icon: Briefcase,
  },
  {
    id: 'mission',
    label: 'Mission fit',
    hint: 'Connect your work to impact.',
    icon: Lightbulb,
  },
  {
    id: 'scenario',
    label: 'Scenario',
    hint: 'Practice real situations.',
    icon: AlertCircle,
  },
  {
    id: 'close',
    label: 'Close',
    hint: 'Questions, availability, and next steps.',
    icon: Clock,
  },
]

const NGO_INTERVIEW_STAGES = [
  {
    id: 'opening',
    label: 'Opening',
    prompt: 'Start warm, set the tone, and invite the student to connect their background to this role.',
    lookFor: 'Motivation, communication clarity, and whether they understand the NGO context.',
  },
  {
    id: 'skills',
    label: 'Skills fit',
    prompt: 'Ask for a concrete example using one of the skills listed in the role or student profile.',
    lookFor: 'Specific tools, honest skill level, and how they explain choices without overclaiming.',
  },
  {
    id: 'impact',
    label: 'Mission fit',
    prompt: 'Move from ability to purpose: why this work, this community, and this kind of impact.',
    lookFor: 'Values alignment, curiosity, and respect for the community served.',
  },
  {
    id: 'scenario',
    label: 'Scenario',
    prompt: 'Give a realistic situation from the role and ask how they would handle it step by step.',
    lookFor: 'Judgment, collaboration instincts, and how they respond when details are ambiguous.',
  },
  {
    id: 'close',
    label: 'Close',
    prompt: 'Leave space for their questions and explain what a strong next step would look like.',
    lookFor: 'Prepared questions, enthusiasm, and whether expectations are aligned.',
  },
]

function getSkillNames(skills = []) {
  return skills
    .map(skill => typeof skill === 'string' ? skill : skill?.name)
    .filter(Boolean)
}

function makeMockStudent(role) {
  const roleSkills = getSkillNames(role?.skills)
  const primarySkills = roleSkills.length > 0 ? roleSkills.slice(0, 4) : ['communication', 'research', 'teamwork']
  const roleTitle = role?.title || 'Volunteer role'
  const field = role?.field || role?.category || 'community impact'

  return {
    name: 'Maya Haddad',
    headline: `Second-year student interested in ${field}`,
    about: `Maya is looking for a practical NGO experience where she can use ${primarySkills.slice(0, 2).join(' and ')} while learning how real teams create community impact.`,
    skills: primarySkills,
    interests: [field, 'youth programs', 'inclusive communities'],
    languages: role?.languages?.length ? role.languages : ['English', 'Arabic'],
    projects: [
      `${roleTitle} class project with a small student team`,
      'Campus volunteer campaign with weekly coordination tasks',
    ],
  }
}

function makeFirstQuestion(role, student) {
  const skill = student.skills[0] || 'your strongest skill'
  return `Hi ${student.name.split(' ')[0]}, thanks for joining. To start, can you tell me what interested you in the ${role?.title || 'role'} and share one example where you used ${skill} in a project or volunteer setting?`
}

function makeStageGuidance(role, student, stageId) {
  const title = role?.title || 'this role'
  const skill = student.skills[0] || 'the main skill'
  const field = role?.field || role?.category || 'this impact area'

  const guidance = {
    opening: `Understand why ${student.name.split(' ')[0]} wants ${title}, whether they know what the NGO is trying to do, and if they can connect their interest to ${field}.`,
    skills: `Check if the student can actually use ${skill} in a practical setting, explain what they personally did, and be honest about where they still need support.`,
    impact: `Listen for whether they understand the community impact behind ${title}, not just the task. You want motivation, respect, and curiosity.`,
    scenario: `See how they think through a real ${title} situation: clarifying the goal, choosing a next step, communicating with the team, and handling uncertainty.`,
    close: `Confirm expectations: confidence, support needs, questions, and whether the student understands what success in this role would look like.`,
  }

  return guidance[stageId] || guidance.opening
}

function makeStageQuestions(role, student, stageId) {
  const title = role?.title || 'this role'
  const skill = student.skills[0] || 'your strongest skill'
  const field = role?.field || role?.category || 'this area'

  const questions = {
    opening: [
      `What made you interested in ${title}, and what do you hope to learn from this NGO experience?`,
      `When you read this role, what part felt most connected to your background or interests?`,
      `Can you tell me about yourself and why ${field} matters to you?`,
    ],
    skills: [
      `Can you walk me through a time you used ${skill} and what your specific contribution was?`,
      `If you had to use ${skill} for this role next week, what would you feel confident doing and where would you need guidance?`,
      `Tell me about a project where you had to learn a skill quickly. How did you approach it?`,
    ],
    impact: [
      `How would you make sure your work in ${title} is useful for the people we serve?`,
      `What does meaningful impact look like to you in a role like this?`,
      `How would you learn about the community before making decisions in this work?`,
    ],
    scenario: [
      `Imagine the team gives you an unclear task for ${title}. What would you do first?`,
      `If you were blocked while working on this role, how would you communicate that to the team?`,
      `If a deadline changed suddenly, how would you organize your next steps?`,
    ],
    close: [
      `What support would help you do your best work in this role?`,
      `Do you have any questions about the team, expectations, or next steps?`,
      `After this conversation, what part of the role feels most exciting or challenging?`,
    ],
  }

  return questions[stageId] || questions.opening
}

function makeRolePrepSections(role, roleSkills = []) {
  const title = role?.title || 'this role'
  const field = role?.field || role?.category || 'this impact area'
  const skills = roleSkills.length ? roleSkills.slice(0, 3).join(', ') : 'the role skills'
  const mission = role?.missionImpact || role?.description || `Help the team create real progress in ${field}.`

  return [
    {
      title: 'What to expect from the student',
      text: `A strong student should understand why ${title} matters, explain where they can contribute, and be honest about what they still need to learn.`,
      icon: Target,
    },
    {
      title: 'What to listen for',
      items: [
        `Specific examples using ${skills}.`,
        `Curiosity about the NGO mission and the people served.`,
        'Clear communication when the work gets unclear or collaborative.',
      ],
      icon: CheckCircle2,
    },
    {
      title: 'Role context',
      text: mission,
      icon: FileText,
    },
  ]
}

function makeRoleSummary(role, roleSkills = []) {
  const title = role?.title || 'this role'
  const area = role?.field || role?.category || 'community impact'
  const skills = roleSkills.length ? roleSkills.slice(0, 2).join(' and ') : 'relevant skills'
  return `${title} is a ${area} role where the student should show curiosity, clear communication, and a practical ability to use ${skills}. The NGO should expect someone who understands the mission, can explain how they would contribute, and is honest about where they may need guidance.`
}

function makeStudentReply(role, student, stageId) {
  const roleTitle = role?.title || 'this role'
  const skill = student.skills[0] || 'communication'
  const replies = {
    opening: `I applied because ${roleTitle} feels connected to the kind of impact I want to learn from. I have used ${skill} in a student project, and I want to understand how that work happens in an NGO setting.`,
    skills: `One example is a small team project where I handled the ${skill} part. I had to organize the work, explain what I was doing, and ask for feedback when I was unsure.`,
    impact: `The mission matters to me because I want the work to help real people, not just be a class assignment. I would want to learn from the community before assuming what they need.`,
    scenario: `I would first clarify the goal, then check what resources we have, divide the work with the team, and communicate early if something is blocked.`,
    close: `I would like to know what a successful first month looks like, and what kind of support students usually get from the team.`,
  }

  return replies[stageId] || replies.opening
}

function getStudentProfileSkills(profile = {}) {
  const raw = Array.isArray(profile?.skillsWithLevel) && profile.skillsWithLevel.length > 0
    ? profile.skillsWithLevel
    : profile?.skills

  if (Array.isArray(raw)) return getSkillNames(raw)
  if (typeof raw === 'string') return raw.split(',').map(skill => skill.trim()).filter(Boolean)
  return []
}

function buildStudentRole(app, opportunity) {
  return {
    id: app?.id,
    opportunityId: app?.opportunityId,
    title: opportunity?.title || app?.role || app?.role_title || 'Position',
    orgName: opportunity?.orgName || app?.ngoName || app?.ngo_name || 'Organization',
    category: opportunity?.category || app?.category || 'Opportunity',
    field: opportunity?.field || opportunity?.category || app?.category || 'community impact',
    description: opportunity?.description || opportunity?.missionImpact || 'This role is connected to meaningful NGO work and gives you a chance to show your strengths.',
    missionImpact: opportunity?.missionImpact || '',
    skills: getSkillNames(opportunity?.skills || []),
    languages: opportunity?.languages || [],
    weeklyHours: opportunity?.weeklyHours || '',
    duration: opportunity?.duration || '',
    location: opportunity?.location || app?.location || '',
    workMode: opportunity?.workMode || '',
    status: app?.status || 'submitted',
  }
}

function getNextStudentCategory(categoryId) {
  const index = STUDENT_INTERVIEW_CATEGORIES.findIndex(category => category.id === categoryId)
  const next = STUDENT_INTERVIEW_CATEGORIES[Math.min(index + 1, STUDENT_INTERVIEW_CATEGORIES.length - 1)]
  return next?.id || 'opening'
}

function makeStudentInterviewQuestion(role, profile, categoryId, seed = 0) {
  const firstName = profile?.name?.split(' ')[0] || 'there'
  const profileSkills = getStudentProfileSkills(profile)
  const roleSkill = role.skills[seed % Math.max(role.skills.length, 1)] || profileSkills[0] || 'one of your strengths'
  const field = profile?.field || role.field || role.category || 'your field'

  const questions = {
    opening: [
      `Hi ${firstName}, thanks for joining. To start, can you tell me a little about yourself and what drew you to the ${role.title} role at ${role.orgName}?`,
      `Welcome, ${firstName}. Give me the short version of who you are, what you study, and why this opportunity caught your eye.`,
    ],
    motivation: [
      `Why does ${role.orgName}'s work feel meaningful to you, and how does this role connect to what you want to learn?`,
      `When you applied for ${role.title}, what part of the mission or role made you think, "I want to help with this"?`,
    ],
    skills: [
      `Can you walk me through a specific example where you used ${roleSkill}, and what your personal contribution was?`,
      `This role may need ${roleSkill}. What would you feel confident doing right away, and where would you ask for support?`,
    ],
    mission: [
      `How would you make sure your work in ${role.title} is useful for the people ${role.orgName} serves?`,
      `Tell me about a time you had to understand someone else's needs before building or suggesting a solution.`,
    ],
    scenario: [
      `Imagine you are given an unclear task in this role and the deadline is close. What would you do first?`,
      `If you got stuck while working on ${role.title}, how would you communicate that to the NGO team?`,
    ],
    close: [
      `What support would help you do your best work in this role, and what questions would you ask the team before starting?`,
      `Before we finish, what should I remember about you as a ${field} student applying for ${role.title}?`,
    ],
  }

  const categoryQuestions = questions[categoryId] || questions.opening
  return categoryQuestions[seed % categoryQuestions.length]
}

function explainStudentQuestion(question, role, profile, categoryId) {
  const profileSkills = getStudentProfileSkills(profile)
  const strongestSkill = role.skills[0] || profileSkills[0] || 'your strongest relevant skill'
  const firstName = profile?.name?.split(' ')[0] || 'you'

  const explainers = {
    opening: {
      purpose: `They want to see how clearly ${firstName} introduces themselves and whether the role feels intentional, not random.`,
      simpler: `Tell me who you are and why you applied for this role.`,
      tips: [
        'Use a 30-45 second answer.',
        'Mention your field, one relevant skill, and why this NGO caught your attention.',
        'Do not recite your whole profile. Keep it focused.',
      ],
    },
    motivation: {
      purpose: 'They are checking if you understand the NGO mission and whether your interest is real.',
      simpler: `Why do you care about ${role.orgName}'s work?`,
      tips: [
        'Connect the mission to a cause, class, project, or personal value.',
        'Name one thing about the organization or role specifically.',
        'Avoid saying only "I need experience."',
      ],
    },
    skills: {
      purpose: `They want proof that you can use ${strongestSkill} in a real situation, not just list it on your profile.`,
      simpler: `Give me an example of you using ${strongestSkill}.`,
      tips: [
        'Use STAR: situation, task, action, result.',
        'Say exactly what you did, not only what the team did.',
        'Be honest about what you know and what you are still learning.',
      ],
    },
    mission: {
      purpose: 'They want to know if you think about impact and the people served, not only the task.',
      simpler: 'How would your work actually help people?',
      tips: [
        'Talk about listening before acting.',
        'Mention how you would ask for context from the NGO team.',
        'Show humility and curiosity.',
      ],
    },
    scenario: {
      purpose: 'They are testing judgment, communication, and how you handle ambiguity.',
      simpler: 'What would you do if the work was unclear or something went wrong?',
      tips: [
        'Start by clarifying the goal.',
        'Explain your first 2-3 steps calmly.',
        'Show that you would communicate early instead of disappearing.',
      ],
    },
    close: {
      purpose: 'They want to understand expectations, availability, and whether you can ask thoughtful questions.',
      simpler: 'What do you need to succeed, and what do you want to ask us?',
      tips: [
        'Ask about success in the first month.',
        'Mention your availability clearly.',
        'End with enthusiasm and confidence.',
      ],
    },
  }

  return {
    question,
    ...(explainers[categoryId] || explainers.opening),
  }
}

function StudentView() {
  const { user, profile } = useApp()
  const [apps, setApps] = useState([])
  const [roleDetails, setRoleDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [activeCategory, setActiveCategory] = useState('opening')
  const [transcript, setTranscript] = useState([])
  const [draftAnswer, setDraftAnswer] = useState('')
  const [inputMode, setInputMode] = useState('type')
  const [isRecording, setIsRecording] = useState(false)
  const [explainOpen, setExplainOpen] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const recognitionRef = useRef(null)
  const messageIdRef = useRef(0)

  useEffect(() => {
    if (!user?.id) return
    withTimeout(fetchStudentApplications(user.id), 10000, 'fetchStudentApplications')
      .then(async loadedApps => {
        const nextApps = Array.isArray(loadedApps) ? loadedApps : []
        setApps(nextApps)

        const detailEntries = await Promise.all(
          nextApps.map(async app => {
            if (!app.opportunityId) return [app.id, null]
            const opportunity = await fetchOpportunity(app.opportunityId).catch(() => null)
            return [app.id, opportunity]
          })
        )
        setRoleDetails(Object.fromEntries(detailEntries))
      })
      .catch(err => {
        console.error('Failed to load applications:', err.message)
        setApps([])
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  useEffect(() => {
    return () => recognitionRef.current?.stop?.()
  }, [])

  const selectedApp = apps.find(a => a.id === selectedAppId)
  const selectedRole = selectedApp ? buildStudentRole(selectedApp, roleDetails[selectedApp.id]) : null
  const currentAiMessage = [...transcript].reverse().find(message => message.from === 'ai')
  const currentQuestion = currentAiMessage?.text || (selectedRole ? makeStudentInterviewQuestion(selectedRole, profile, activeCategory) : '')
  const activeCategoryInfo = STUDENT_INTERVIEW_CATEGORIES.find(category => category.id === activeCategory) || STUDENT_INTERVIEW_CATEGORIES[0]
  const questionCoach = selectedRole ? explainStudentQuestion(currentQuestion, selectedRole, profile, activeCategory) : null
  const answeredCount = transcript.filter(message => message.from === 'student').length

  function nextMessageId(prefix) {
    messageIdRef.current += 1
    return `${prefix}-${messageIdRef.current}`
  }

  function selectRole(appId) {
    setSelectedAppId(appId)
    setPracticeStarted(false)
    setActiveCategory('opening')
    setTranscript([])
    setDraftAnswer('')
    setInputMode('type')
    setIsRecording(false)
    setExplainOpen(false)
  }

  function openPractice() {
    if (!selectedAppId) return
    const app = apps.find(item => item.id === selectedAppId)
    if (!app) return
    const role = buildStudentRole(app, roleDetails[app.id])
    const opening = makeStudentInterviewQuestion(role, profile, 'opening', 0)

    setPracticeStarted(true)
    setActiveCategory('opening')
    setTranscript([{ id: nextMessageId('ai'), from: 'ai', category: 'opening', text: opening }])
    setDraftAnswer('')
    setInputMode('type')
    setIsRecording(false)
    setExplainOpen(false)
  }

  function askFromCategory(categoryId) {
    if (!selectedRole) return
    const question = makeStudentInterviewQuestion(selectedRole, profile, categoryId, transcript.length)
    setActiveCategory(categoryId)
    setExplainOpen(false)
    setTranscript(prev => [
      ...prev,
      { id: nextMessageId('ai'), from: 'ai', category: categoryId, text: question },
    ])
  }

  function sendAnswer() {
    const answer = draftAnswer.trim()
    if (!answer || !selectedRole) return

    const nextCategory = getNextStudentCategory(activeCategory)
    const nextQuestion = makeStudentInterviewQuestion(selectedRole, profile, nextCategory, transcript.length + 1)

    setTranscript(prev => [
      ...prev,
      { id: nextMessageId('student'), from: 'student', text: answer },
      { id: nextMessageId('ai'), from: 'ai', category: nextCategory, text: nextQuestion },
    ])
    setActiveCategory(nextCategory)
    setDraftAnswer('')
    setExplainOpen(false)
  }

  function handleVoiceToggle() {
    if (isRecording) {
      recognitionRef.current?.stop?.()
      setIsRecording(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setInputMode('voice')

    if (!SpeechRecognition) {
      setIsRecording(true)
      setDraftAnswer(prev => prev || 'Voice answer recorded. You can edit this before sending.')
      window.setTimeout(() => setIsRecording(false), 900)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.onresult = event => {
      const spokenText = Array.from(event.results)
        .map(result => result[0]?.transcript)
        .filter(Boolean)
        .join(' ')
      setDraftAnswer(spokenText)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)
    recognitionRef.current = recognition
    setIsRecording(true)
    recognition.start()
  }

  function speakCurrentQuestion() {
    if (!currentQuestion || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(currentQuestion))
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map(item => (
          <div key={item} className="h-[260px] animate-pulse rounded-[32px] border border-[#D7E6FF] bg-white" />
        ))}
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <section className="rounded-[32px] border border-[#D7E6FF] bg-white px-6 py-16 text-center shadow-[0_14px_38px_rgba(17,24,39,0.035)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F0FE] text-[#1A73E8]">
          <Briefcase size={28} />
        </div>
        <h2 className="text-[1.35rem] font-semibold text-[#202124]">No applications yet</h2>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-7 text-[#5F6368]">
          Apply to a role first, then Hive will turn that role into a practice interview room.
        </p>
      </section>
    )
  }

  if (!practiceStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[30px] border border-[#E5EEFB] bg-white p-4 shadow-[0_12px_34px_rgba(17,24,39,0.04)] overflow-y-auto" style={{ height: '600px' }}>
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Applied roles</p>
              <p className="mt-1 text-[0.84rem] text-[#5F6368]">{apps.length} role{apps.length !== 1 ? 's' : ''} available</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
              <Briefcase size={18} />
            </div>
          </div>

          <div className="space-y-3">
            {apps.map(app => {
              const role = buildStudentRole(app, roleDetails[app.id])
              const active = String(app.id) === String(selectedAppId)
              const skills = getSkillNames(role.skills).slice(0, 2)
              return (
                <button
                  key={app.id}
                  onClick={() => selectRole(app.id)}
                  className={`group w-full rounded-[24px] border p-4 text-left transition-all ${
                    active
                      ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_12px_28px_rgba(26,115,232,0.12)]'
                      : 'border-[#E5EEFB] bg-white hover:border-[#BFD7FF] hover:bg-[#FBFCFE]'
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`line-clamp-2 text-[0.95rem] font-semibold leading-snug ${active ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                        {role.title}
                      </p>
                      <p className="mt-1.5 text-[0.76rem] text-[#5F6368]">
                        {[role.workMode, role.location].filter(Boolean).join(' · ') || role.category || 'Flexible role'}
                      </p>
                    </div>
                    <ArrowRight size={16} className={`mt-1 shrink-0 transition-transform ${active ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(skills.length ? skills : ['Interview']).map(skill => (
                      <span key={skill} className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${active ? 'bg-white text-[#1A73E8]' : 'bg-[#F1F3F4] text-[#5F6368]'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="min-h-[560px] rounded-[34px] border border-[#E5EEFB] bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
          {!selectedRole ? (
            <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                <Briefcase size={22} />
              </div>
              <p className="text-[1rem] font-semibold text-[#202124]">Choose a role</p>
              <p className="mt-2 max-w-sm text-[0.86rem] leading-6 text-[#5F6368]">
                Select an applied role on the left to start practicing interviews.
              </p>
            </div>
          ) : (
            <div className="p-6 lg:p-8">
              <div className="rounded-[30px] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_52%,#EEF4FF_100%)] px-6 py-8">
                <div className="flex flex-col gap-6 items-center text-center">
                  <div className="min-w-0">
                    <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#1A73E8]">
                      Interview prep
                    </p>
                    <h2 className="text-[clamp(1.65rem,3vw,2.45rem)] font-semibold leading-tight text-[#202124]">
                      {selectedRole.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-[0.95rem] leading-7 text-[#5F6368] mx-auto">
                      Get ready for your interview with {selectedRole.orgName}. Review what to expect and practice with our AI interviewer.
                    </p>
                  </div>
                  <button
                    onClick={openPractice}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-[#1A73E8] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-opacity hover:opacity-95">
                    <PlayCircle size={20} />
                    Practice interview
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <section className="max-w-4xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                    <Sparkles size={19} />
                  </div>
                  <h3 className="text-[1.25rem] font-semibold text-[#202124]">What to expect</h3>
                  <p className="mt-3 max-w-3xl text-[0.95rem] leading-8 text-[#5F6368]">
                    The interview will cover 6 key areas: opening to warm up, motivation to understand why you applied, skills to show your abilities, mission fit to connect your values, real scenarios to test your judgment, and closing questions to clarify next steps.
                  </p>
                </section>

                <section className="max-w-3xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                    <Target size={19} />
                  </div>
                  <h3 className="text-[1.25rem] font-semibold text-[#202124]">Interview focus areas</h3>
                  <div className="mt-5 divide-y divide-[#E5EEFB]">
                    {[
                      'Introduction and understanding of the opportunity',
                      'Your relevant skills and past experience',
                      "Alignment with the organization's mission",
                      'How you handle ambiguity and challenges',
                      'Questions and enthusiasm for the role',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-3 py-4">
                        <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#188038]" />
                        <p className="text-[0.9rem] leading-7 text-[#5F6368]">{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex flex-col gap-3 border-t border-[#E5EEFB] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => setSelectedAppId(null)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D7E6FF] bg-white px-4 py-2.5 text-[0.82rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]">
                    Go back
                    <ArrowLeft size={15} />
                  </button>
                  <button
                    onClick={openPractice}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.84rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-opacity hover:opacity-95">
                    Start practice
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={selectedRole.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5">
      <section className="overflow-hidden rounded-[34px] border border-[#D7E6FF] bg-white shadow-[0_14px_38px_rgba(17,24,39,0.035)]">
        <div className="relative overflow-hidden px-6 py-6 sm:px-7">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#E8F0FE]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                onClick={() => {
                  setPracticeStarted(false)
                  setTranscript([])
                  setDraftAnswer('')
                  setExplainOpen(false)
                }}
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F1F5FE] px-3 py-2 text-[0.8rem] font-semibold text-[#5F6368] transition-colors hover:text-[#1A73E8]">
                <ArrowLeft size={14} />
                Interview prep
              </button>
              <div className="flex min-w-0 items-center gap-4">
                <GradientAvatar name={selectedRole.orgName} size={62} radius="1.15rem" className="shrink-0 shadow-[0_12px_28px_rgba(26,115,232,0.12)]" />
                <div className="min-w-0">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">
                    Mock interview with {selectedRole.orgName}
                  </p>
                  <h2 className="mt-1 truncate text-[clamp(1.8rem,3vw,2.65rem)] font-semibold leading-tight tracking-[-0.045em] text-[#202124]">
                    {selectedRole.title}
                  </h2>
                  <p className="mt-2 text-[0.92rem] text-[#5F6368]">
                    {answeredCount} answers practiced · {activeCategoryInfo.label}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={speakCurrentQuestion}
              className="relative inline-flex w-fit items-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.86rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.18)] transition hover:-translate-y-0.5">
              <PlayCircle size={16} />
              Listen to question
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <aside className="rounded-[32px] border border-[#D7E6FF] bg-white p-4 shadow-[0_14px_38px_rgba(17,24,39,0.035)] xl:sticky xl:top-6 xl:self-start">
          <div className="mb-4 px-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Interview categories</p>
            <p className="mt-1 text-[0.9rem] font-semibold text-[#202124]">What the AI will ask</p>
          </div>
          <div className="space-y-2">
            {STUDENT_INTERVIEW_CATEGORIES.map((category, index) => {
              const Icon = category.icon
              const selected = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => askFromCategory(category.id)}
                  className={`w-full rounded-[22px] border p-3 text-left transition-colors ${
                    selected
                      ? 'border-[#BFD7FF] bg-[#E8F0FE]'
                      : 'border-[#E5EEFB] bg-[#FBFCFE] hover:bg-white'
                  }`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                      selected ? 'bg-white text-[#1A73E8]' : 'bg-[#E8F0FE] text-[#1A73E8]'
                    }`}>
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-[0.86rem] font-semibold text-[#202124]">{index + 1}. {category.label}</p>
                      <p className="mt-1 text-[0.74rem] leading-5 text-[#5F6368]">{category.hint}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="flex min-h-[720px] flex-col overflow-hidden rounded-[32px] border border-[#D7E6FF] bg-white shadow-[0_14px_38px_rgba(17,24,39,0.035)]">
          <div className="border-b border-[#E5EEFB] bg-[#FBFCFE] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Practice room</p>
                <p className="mt-1 text-[0.94rem] font-semibold text-[#202124]">Fake AI interviewer</p>
              </div>
              <span className="rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.76rem] font-semibold text-[#1A73E8]">
                Live practice
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 [scrollbar-gutter:stable]">
            <div className="space-y-4">
              {transcript.map(message => (
                <div key={message.id} className={`flex items-start gap-3 ${message.from === 'student' ? 'justify-end' : ''}`}>
                  {message.from === 'ai' && <GradientAvatar name="AI interviewer" size={38} radius="0.8rem" className="shrink-0" />}
                  <div className={`max-w-[82%] rounded-[24px] px-4 py-3 text-[0.9rem] leading-7 ${
                    message.from === 'ai'
                      ? 'rounded-tl-md bg-[#E8F0FE] text-[#202124]'
                      : 'rounded-tr-md bg-[#F1F3F4] text-[#202124]'
                  }`}>
                    {message.from === 'ai' && (
                      <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#1A73E8]">
                        Interviewer · {STUDENT_INTERVIEW_CATEGORIES.find(category => category.id === message.category)?.label || 'Question'}
                      </p>
                    )}
                    {message.text}
                  </div>
                  {message.from === 'student' && <GradientAvatar name={profile?.name || user?.name || 'Student'} size={38} radius="0.8rem" className="shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E5EEFB] bg-white px-5 py-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setInputMode('type')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.76rem] font-semibold transition-colors ${
                  inputMode === 'type' ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'bg-[#F1F3F4] text-[#5F6368]'
                }`}>
                <Keyboard size={13} />
                Type
              </button>
              <button
                onClick={handleVoiceToggle}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.76rem] font-semibold transition-colors ${
                  inputMode === 'voice' ? 'bg-[#E6F4EA] text-[#188038]' : 'bg-[#F1F3F4] text-[#5F6368]'
                }`}>
                {isRecording ? <StopCircle size={13} /> : <Mic size={13} />}
                {isRecording ? 'Listening' : 'Speak'}
              </button>
              <button
                onClick={() => setExplainOpen(open => !open)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.76rem] font-semibold transition-colors ${
                  explainOpen ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'bg-[#F1F3F4] text-[#5F6368]'
                }`}>
                <Lightbulb size={13} />
                Explain question
              </button>
            </div>
            <div className="flex gap-3">
              <textarea
                value={draftAnswer}
                onChange={event => setDraftAnswer(event.target.value)}
                rows={2}
                placeholder={isRecording ? 'Listening to your answer...' : 'Type your answer here...'}
                className="min-h-[56px] flex-1 resize-none rounded-[20px] border border-[#E5EEFB] bg-[#FBFCFE] px-4 py-3 text-[0.9rem] leading-6 text-[#202124] outline-none transition-colors placeholder:text-[#9AA0A6] focus:border-[#1A73E8] focus:bg-white"
              />
              <button
                onClick={sendAnswer}
                disabled={!draftAnswer.trim()}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1A73E8] text-white shadow-[0_8px_22px_rgba(26,115,232,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-[#AECBFA]"
                aria-label="Send answer">
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-[32px] border border-[#D7E6FF] bg-white p-5 shadow-[0_14px_38px_rgba(17,24,39,0.035)] xl:sticky xl:top-6 xl:self-start">
          {explainOpen && questionCoach ? (
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.78rem] font-semibold text-[#1A73E8]">
                <Lightbulb size={14} />
                Question coach
              </div>
              <div className="space-y-4">
                <div className="rounded-[22px] border border-[#E5EEFB] bg-[#FBFCFE] p-4">
                  <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">What they want to know</p>
                  <p className="text-[0.84rem] leading-6 text-[#5F6368]">{questionCoach.purpose}</p>
                </div>
                <div className="rounded-[22px] border border-[#E5EEFB] bg-white p-4">
                  <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Simpler way to ask it</p>
                  <p className="text-[0.9rem] font-semibold leading-6 text-[#202124]">{questionCoach.simpler}</p>
                </div>
                <div>
                  <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Tips for your answer</p>
                  <div className="space-y-2">
                    {questionCoach.tips.map(tip => (
                      <p key={tip} className="rounded-[18px] bg-[#F8FAFD] px-3 py-2 text-[0.8rem] leading-5 text-[#5F6368]">
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.78rem] font-semibold text-[#1A73E8]">
                <Sparkles size={14} />
                Practice context
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[1rem] font-semibold text-[#202124]">{selectedRole.title}</p>
                  <p className="mt-1 text-[0.84rem] text-[#5F6368]">{selectedRole.orgName}</p>
                </div>
                <button
                  onClick={() => setDescriptionOpen(!descriptionOpen)}
                  className="flex w-full items-start justify-between gap-3 rounded-[20px] border border-[#E5EEFB] bg-[#FBFCFE] px-3.5 py-3 text-left transition hover:border-[#D7E6FF] hover:bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Job description</p>
                  </div>
                  <ChevronDown size={16} className={`shrink-0 text-[#5F6368] transition-transform ${descriptionOpen ? 'rotate-180' : ''}`} />
                </button>
                {descriptionOpen && (
                  <p className="text-[0.84rem] leading-6 text-[#5F6368] rounded-[20px] border border-[#E5EEFB] bg-white px-4 py-3">{selectedRole.description}</p>
                )}
                <div className="grid gap-2 text-[0.8rem] text-[#5F6368]">
                  <div className="rounded-[18px] border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-2">
                    <span className="font-semibold text-[#202124]">Work mode:</span> {selectedRole.workMode || 'Flexible'}
                  </div>
                  <div className="rounded-[18px] border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-2">
                    <span className="font-semibold text-[#202124]">Hours:</span> {selectedRole.weeklyHours || 'Not specified'}
                  </div>
                  <div className="rounded-[18px] border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-2">
                    <span className="font-semibold text-[#202124]">Your field:</span> {profile?.field || 'Not set yet'}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Role skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedRole.skills.length ? selectedRole.skills : getStudentProfileSkills(profile).slice(0, 4)).map(skill => (
                      <span key={skill} className="rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[0.74rem] font-semibold text-[#1A73E8]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setExplainOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D7E6FF] bg-white px-4 py-3 text-[0.84rem] font-semibold text-[#1A73E8] transition hover:bg-[#F8FBFF]">
                  <Lightbulb size={15} />
                  Explain current question
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </motion.div>
  )
}

function NGOView({ onPracticeChange }) {
  const { user } = useApp()
  const navigate = useNavigate()
  const recognitionRef = useRef(null)
  const messageIdRef = useRef(0)
  const [ngoOpportunities, setNgoOpportunities] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [activeGuideSection, setActiveGuideSection] = useState('summary')
  const [activeStage, setActiveStage] = useState('opening')
  const [openPanel, setOpenPanel] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isStudentResponding, setIsStudentResponding] = useState(false)
  const [aiGuidanceOpen, setAiGuidanceOpen] = useState(false)
  const [exampleQuestionIndex, setExampleQuestionIndex] = useState(0)
  const [draftQuestion, setDraftQuestion] = useState('')
  const [transcript, setTranscript] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    withTimeout(fetchNgoOpportunities(user.id), 10000, 'fetchNgoOpportunities')
      .then(opps => setNgoOpportunities(opps || []))
      .catch(err => {
        console.error('Failed to load NGO opportunities:', err.message)
        setNgoOpportunities([])
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  useEffect(() => {
    if (selectedRole || ngoOpportunities.length === 0) return
    setSelectedRole(ngoOpportunities[0].id)
  }, [ngoOpportunities, selectedRole])

  useEffect(() => {
    return () => recognitionRef.current?.stop?.()
  }, [])

  const selectedOpp = ngoOpportunities.find(o => String(o.id) === String(selectedRole))

  useEffect(() => {
    onPracticeChange?.({ active: practiceStarted, title: selectedOpp?.title || '' })
  }, [practiceStarted, selectedOpp?.title, onPracticeChange])

  const mockStudent = selectedOpp ? makeMockStudent(selectedOpp) : null
  const firstQuestion = selectedOpp && mockStudent ? makeFirstQuestion(selectedOpp, mockStudent) : ''
  const activeStageInfo = NGO_INTERVIEW_STAGES.find(stage => stage.id === activeStage) || NGO_INTERVIEW_STAGES[0]
  const roleSkills = getSkillNames(selectedOpp?.skills)
  const prepSections = selectedOpp ? makeRolePrepSections(selectedOpp, roleSkills) : []
  const roleSummary = selectedOpp ? makeRoleSummary(selectedOpp, roleSkills) : ''
  const guideSections = selectedOpp ? [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'goals', label: 'What to learn', icon: Target },
    { id: 'signals', label: 'Signals', icon: CheckCircle2 },
  ] : []
  const stageGuidance = selectedOpp && mockStudent ? makeStageGuidance(selectedOpp, mockStudent, activeStage) : ''
  const stageQuestions = selectedOpp && mockStudent ? makeStageQuestions(selectedOpp, mockStudent, activeStage) : []
  const exampleQuestion = stageQuestions[exampleQuestionIndex % Math.max(stageQuestions.length, 1)] || firstQuestion

  function nextMessageId(prefix) {
    messageIdRef.current += 1
    return `${prefix}-${messageIdRef.current}`
  }

  function openRole(roleId) {
    setSelectedRole(roleId)
    setPracticeStarted(false)
    setActiveGuideSection('summary')
    setActiveStage('opening')
    setOpenPanel('')
    setIsRecording(false)
    setIsStudentResponding(false)
    setAiGuidanceOpen(false)
    setExampleQuestionIndex(0)
    setDraftQuestion('')
    setTranscript([])
  }

  function openPracticeRoom() {
    if (!selectedOpp) return
    setPracticeStarted(true)
    setActiveStage('opening')
    setOpenPanel('')
    setIsRecording(false)
    setIsStudentResponding(false)
    setAiGuidanceOpen(false)
    setExampleQuestionIndex(0)
    setDraftQuestion('')
    setTranscript([])
  }

  function sendQuestion() {
    const text = draftQuestion.trim()
    if (!text || isStudentResponding) return
    const stage = activeStage
    setTranscript(prev => [...prev, { id: nextMessageId('q'), from: 'ngo', text, stage }])
    setExampleQuestionIndex(0)
    setDraftQuestion('')
    setIsRecording(false)
    setIsStudentResponding(true)
    window.setTimeout(() => {
      setTranscript(prev => [
        ...prev,
        { id: nextMessageId('a'), from: 'student', text: makeStudentReply(selectedOpp, mockStudent, stage), stage },
      ])
      setIsStudentResponding(false)
    }, 700)
  }

  function goToNextStage() {
    const idx = NGO_INTERVIEW_STAGES.findIndex(stage => stage.id === activeStage)
    const next = NGO_INTERVIEW_STAGES[idx + 1]
    if (next) {
      setActiveStage(next.id)
      setExampleQuestionIndex(0)
      setDraftQuestion('')
    } else {
      setPracticeStarted(false)
    }
  }

  function generateExampleQuestion() {
    setExampleQuestionIndex(prev => prev + 1)
  }

  function suggestQuestion() {
    setDraftQuestion(featuredQuestion)
    generateExampleQuestion()
  }

  function handleVoiceToggle() {
    if (isRecording) {
      recognitionRef.current?.stop?.()
      setIsRecording(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsRecording(true)
      setDraftQuestion(prev => prev || 'Voice question recorded for the student.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.onresult = event => {
      const spokenText = Array.from(event.results)
        .map(result => result[0]?.transcript)
        .filter(Boolean)
        .join(' ')
      setDraftQuestion(spokenText)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)
    recognitionRef.current = recognition
    setIsRecording(true)
    recognition.start()
  }

  if (loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[30px] border border-[#E5EEFB] bg-white p-4 shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
          <div className="mb-4 h-5 w-24 animate-pulse rounded-full bg-[#EEF4FF]" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-[24px] bg-[#F6F8FC]" />
            ))}
          </div>
        </aside>
        <section className="min-h-[560px] rounded-[34px] border border-[#E5EEFB] bg-white p-7 shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
          <div className="mb-4 h-8 w-2/5 animate-pulse rounded-full bg-[#EEF4FF]" />
          <div className="mb-8 h-4 w-3/5 animate-pulse rounded-full bg-[#F1F4F9]" />
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-36 animate-pulse rounded-[26px] bg-[#F6F8FC]" />
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <div className="h-12 w-32 animate-pulse rounded-full bg-[#E8F0FE]" />
            <div className="h-12 w-40 animate-pulse rounded-full bg-[#F1F4F9]" />
          </div>
        </section>
      </div>
    )
  }

  if (ngoOpportunities.length === 0) {
    return (
      <div className="rounded-[28px] border border-[#E5EEFB] bg-white px-6 py-16 text-center shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
          <Briefcase size={22}/>
        </div>
        <p className="mb-1 text-[0.95rem] font-semibold text-[#202124]">No roles posted yet</p>
        <p className="text-[0.82rem] leading-6 text-[#5F6368]">Create opportunities to practice interviews for each role.</p>
      </div>
    )
  }

  if (!practiceStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[30px] border border-[#E5EEFB] bg-white p-4 shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Posted roles</p>
              <p className="mt-1 text-[0.84rem] text-[#5F6368]">{ngoOpportunities.length} role{ngoOpportunities.length !== 1 ? 's' : ''} ready</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
              <Briefcase size={18} />
            </div>
          </div>

          <div className="space-y-3">
            {ngoOpportunities.map(opp => {
              const active = String(opp.id) === String(selectedRole)
              const skills = getSkillNames(opp.skills).slice(0, 2)
              return (
                <button
                  key={opp.id}
                  onClick={() => openRole(opp.id)}
                  className={`group w-full rounded-[24px] border p-4 text-left transition-all ${
                    active
                      ? 'border-[#BFD7FF] bg-[#E8F0FE] shadow-[0_12px_28px_rgba(26,115,232,0.12)]'
                      : 'border-[#E5EEFB] bg-white hover:border-[#BFD7FF] hover:bg-[#FBFCFE]'
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`line-clamp-2 text-[0.95rem] font-semibold leading-snug ${active ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                        {opp.title}
                      </p>
                      <p className="mt-1.5 text-[0.76rem] text-[#5F6368]">
                        {[opp.workMode, opp.location].filter(Boolean).join(' · ') || opp.category || 'Flexible role'}
                      </p>
                    </div>
                    <ArrowRight size={16} className={`mt-1 shrink-0 transition-transform ${active ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(skills.length ? skills : ['Interview']).map(skill => (
                      <span key={skill} className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${active ? 'bg-white text-[#1A73E8]' : 'bg-[#F1F3F4] text-[#5F6368]'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="min-h-[560px] rounded-[34px] border border-[#E5EEFB] bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
          {!selectedOpp ? (
            <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                <Briefcase size={22} />
              </div>
              <p className="text-[1rem] font-semibold text-[#202124]">Choose a role</p>
              <p className="mt-2 max-w-sm text-[0.86rem] leading-6 text-[#5F6368]">
                Select a posted role on the left to build the interview guide.
              </p>
            </div>
          ) : (
            <div className="p-6 lg:p-8">
              <div className="rounded-[30px] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_52%,#EEF4FF_100%)] px-6 py-6">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#1A73E8]">
                      Interview guide
                    </p>
                    <h2 className="text-[clamp(1.65rem,3vw,2.45rem)] font-semibold leading-tight text-[#202124]">
                      {selectedOpp.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-[0.95rem] leading-7 text-[#5F6368]">
                      A quick prep sheet for deciding what to ask, what to listen for, and when to move into practice.
                    </p>
                  </div>
                  <button
                    onClick={openPracticeRoom}
                    className="flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#1A73E8] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-opacity hover:opacity-95">
                    <PlayCircle size={20} />
                    Practice interview
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-2 overflow-x-auto border-b border-[#E5EEFB] pb-3">
                {guideSections.map(section => {
                  const Icon = section.icon
                  const active = activeGuideSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveGuideSection(section.id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-colors ${
                        active
                          ? 'bg-[#1A73E8] text-white shadow-[0_8px_18px_rgba(26,115,232,0.16)]'
                          : 'bg-[#F1F3F4] text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#1A73E8]'
                      }`}>
                      <Icon size={15} />
                      {section.label}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeGuideSection}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="min-h-[300px] py-7">
                  {activeGuideSection === 'summary' && (
                    <section className="max-w-4xl">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                        <Sparkles size={19} />
                      </div>
                      <h3 className="text-[1.25rem] font-semibold text-[#202124]">Role summary</h3>
                      <p className="mt-3 max-w-3xl text-[0.95rem] leading-8 text-[#5F6368]">
                        {roleSummary}
                      </p>
                      <div className="mt-6 rounded-[26px] bg-[#F8FAFD] p-5">
                        <p className="text-[0.9rem] font-semibold text-[#202124]">Interview direction</p>
                        <p className="mt-2 text-[0.86rem] leading-7 text-[#5F6368]">
                          Keep the conversation simple: understand the student&apos;s motivation, check one or two relevant skills, then use a real scenario from the role before moving to questions and next steps.
                        </p>
                      </div>
                    </section>
                  )}

                  {activeGuideSection === 'goals' && (
                    <section className="max-w-3xl">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                        <Target size={19} />
                      </div>
                      <h3 className="text-[1.25rem] font-semibold text-[#202124]">What you are trying to learn</h3>
                      <p className="mt-3 border-l-2 border-[#1A73E8] pl-4 text-[0.95rem] leading-8 text-[#5F6368]">
                        {prepSections[0]?.text}
                      </p>
                    </section>
                  )}

                  {activeGuideSection === 'signals' && (
                    <section className="max-w-3xl">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#188038]">
                        <CheckCircle2 size={19} />
                      </div>
                      <h3 className="text-[1.25rem] font-semibold text-[#202124]">Signals to listen for</h3>
                      <p className="mt-2 text-[0.86rem] leading-7 text-[#5F6368]">
                        Use these as quiet anchors during the conversation, not as a checklist you need to force.
                      </p>
                      <div className="mt-5 divide-y divide-[#E5EEFB]">
                        {(prepSections[1]?.items || []).map(item => (
                          <div key={item} className="flex items-start gap-3 py-4">
                            <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#188038]" />
                            <p className="text-[0.9rem] leading-7 text-[#5F6368]">{item}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col gap-3 border-t border-[#E5EEFB] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => navigate(`/opportunities?opportunity=${encodeURIComponent(selectedOpp.id)}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D7E6FF] bg-white px-4 py-2.5 text-[0.82rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]">
                  View role details
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={openPracticeRoom}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.84rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-opacity hover:opacity-95">
                  Start practice
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>
      </motion.div>
    )
  }

  const panels = [
    {
      id: 'profile',
      title: 'Student profile',
      icon: UserRound,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-[22px] bg-[#F8FAFD] p-3">
            <GradientAvatar name={mockStudent.name} size={48} radius="0.85rem" className="ring-[3px] ring-white shadow shrink-0" />
            <div className="min-w-0">
              <p className="text-[0.95rem] font-semibold text-[#202124]">{mockStudent.name}</p>
              <p className="mt-1 text-[0.8rem] leading-5 text-[#5F6368]">{mockStudent.headline}</p>
            </div>
          </div>
          <p className="text-[0.82rem] leading-6 text-[#5F6368]">{mockStudent.about}</p>
          <div className="grid gap-2 text-[0.78rem] text-[#5F6368]">
            <div className="rounded-[16px] border border-[#E5EEFB] bg-white px-3 py-2">
              <span className="font-semibold text-[#202124]">Interests:</span> {mockStudent.interests.join(', ')}
            </div>
            <div className="flex gap-2 rounded-[16px] border border-[#E5EEFB] bg-white px-3 py-2">
              <Languages size={13} className="mt-0.5 text-[#1A73E8]" />
              <span>{mockStudent.languages.join(', ')}</span>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Skills</p>
            <div className="flex flex-wrap gap-2">
              {mockStudent.skills.map(skill => (
                <span key={skill} className="rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[0.72rem] font-semibold text-[#1A73E8]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Projects</p>
            <div className="space-y-2">
              {mockStudent.projects.map(project => (
                <p key={project} className="rounded-[18px] border border-[#E5EEFB] bg-[#FBFCFE] px-3 py-2 text-[0.78rem] leading-5 text-[#5F6368]">
                  {project}
                </p>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'requirements',
      title: 'Job requirements',
      icon: Briefcase,
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-[0.94rem] font-semibold text-[#202124]">{selectedOpp.title}</p>
            <p className="mt-1 text-[0.78rem] leading-5 text-[#5F6368]">
              {[selectedOpp.category, selectedOpp.field].filter(Boolean).join(' · ') || 'Posted role'}
            </p>
          </div>
          {selectedOpp.description && (
            <div>
              <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Description</p>
              <p className="text-[0.8rem] leading-6 text-[#5F6368]">{selectedOpp.description}</p>
            </div>
          )}
          {selectedOpp.missionImpact && (
            <div>
              <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Mission impact</p>
              <p className="text-[0.8rem] leading-6 text-[#5F6368]">{selectedOpp.missionImpact}</p>
            </div>
          )}
          <div className="grid gap-2 text-[0.78rem] text-[#5F6368]">
            <div className="rounded-[16px] border border-[#E5EEFB] bg-white px-3 py-2">
              <span className="font-semibold text-[#202124]">Hours:</span> {selectedOpp.weeklyHours || 'Not specified'}
            </div>
            <div className="rounded-[16px] border border-[#E5EEFB] bg-white px-3 py-2">
              <span className="font-semibold text-[#202124]">Duration:</span> {selectedOpp.duration || 'Not specified'}
            </div>
            <div className="rounded-[16px] border border-[#E5EEFB] bg-white px-3 py-2">
              <span className="font-semibold text-[#202124]">Location:</span> {[selectedOpp.workMode, selectedOpp.location].filter(Boolean).join(' · ') || 'Flexible'}
            </div>
            <div className="rounded-[16px] border border-[#E5EEFB] bg-white px-3 py-2">
              <span className="font-semibold text-[#202124]">Deadline:</span> {selectedOpp.deadline || 'Open'}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Required skills</p>
            <div className="flex flex-wrap gap-2">
              {(roleSkills.length > 0 ? roleSkills : ['Not specified']).map(skill => (
                <span key={skill} className="rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[0.72rem] font-semibold text-[#1A73E8]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          {selectedOpp.languages?.length > 0 && (
            <div>
              <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Languages</p>
              <p className="text-[0.8rem] leading-6 text-[#5F6368]">{selectedOpp.languages.join(', ')}</p>
            </div>
          )}
        </div>
      ),
    },
  ]

  const currentStageIndex = NGO_INTERVIEW_STAGES.findIndex(stage => stage.id === activeStage)
  const isLastStage = currentStageIndex === NGO_INTERVIEW_STAGES.length - 1
  const askedStages = new Set(transcript.map(message => message.stage))
  const stageHasMessages = askedStages.has(activeStage)
  const featuredQuestion = (activeStage === 'opening' && !stageHasMessages) ? firstQuestion : exampleQuestion

  return (
    <motion.div
      key={selectedRole}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}>
      <button
        onClick={() => setPracticeStarted(false)}
        className="mb-3 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-[#5F6368] transition-colors hover:text-[#1A73E8]">
        <ArrowLeft size={14} />
        Interview guide
      </button>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-h-[620px] overflow-hidden rounded-[28px] border border-[#E5EEFB] bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)]">
        {/* Stage stepper — pills connected by arrows to read as a sequence, centered */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto border-b border-[#E5EEFB] bg-white px-5 py-3">
          {NGO_INTERVIEW_STAGES.map((stage, index) => {
            const isActive = activeStage === stage.id
            const isDone = askedStages.has(stage.id) && !isActive
            return (
              <div key={stage.id} className="flex shrink-0 items-center gap-2">
                {index > 0 && <ArrowRight size={13} className="shrink-0 text-[#D7DCE3]" />}
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.76rem] font-semibold transition-colors ${
                    isActive
                      ? 'border-[#1A73E8] bg-[#1A73E8] text-white shadow-[0_8px_18px_rgba(26,115,232,0.16)]'
                      : isDone
                      ? 'border-[#BFE5CC] bg-[#F1FBF6] text-[#188038]'
                      : 'border-[#E5EEFB] bg-white text-[#5F6368] hover:bg-[#FBFCFE]'
                  }`}>
                  {isDone && <CheckCircle2 size={13} />}
                  {stage.label}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex min-h-[480px] flex-col">
          {/* Transcript — editorial reading style, not chat bubbles */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {transcript.length === 0 ? (
              <div className="mx-auto flex min-h-[300px] max-w-md flex-col items-center justify-center text-center">
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#F1FBF6] px-3 py-1 text-[0.72rem] font-semibold text-[#188038]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34A853]" />
                  </span>
                  Your turn to talk
                </div>
                <p className="text-[0.95rem] leading-7 text-[#5F6368]">
                  Nothing&apos;s been said yet — go ahead and open the conversation.
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-6">
                {transcript.map(message => (
                  message.from === 'ngo' ? (
                    <div key={message.id}>
                      <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">You asked</p>
                      <p className="text-[0.92rem] leading-7 text-[#202124]">{message.text}</p>
                    </div>
                  ) : (
                    <div key={message.id} className="rounded-r-xl border-l-2 border-[#1A73E8]/30 bg-[#F8F9FA] px-4 py-3.5">
                      <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">{mockStudent.name} answered</p>
                      <p className="text-[0.9rem] leading-7 text-[#3C4043]">{message.text}</p>
                    </div>
                  )
                ))}
                {isStudentResponding && (
                  <div className="rounded-r-xl border-l-2 border-[#1A73E8]/30 bg-[#F8F9FA] px-4 py-3.5">
                    <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">{mockStudent.name} is answering</p>
                    <div className="flex gap-1.5 py-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9AA0A6]" style={{ animationDelay: '-0.3s' }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9AA0A6]" style={{ animationDelay: '-0.15s' }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9AA0A6]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-[#E5EEFB] bg-white px-5 py-4">
            {transcript.length > 0 && !isStudentResponding && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#F1FBF6] px-3 py-1 text-[0.72rem] font-semibold text-[#188038]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34A853]" />
                </span>
                Your turn to talk
              </div>
            )}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleVoiceToggle}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.76rem] font-semibold transition-colors ${
                    isRecording ? 'bg-[#E6F4EA] text-[#188038]' : 'bg-[#F1F3F4] text-[#5F6368] hover:bg-[#E8EAED]'
                  }`}>
                  {isRecording ? <StopCircle size={13} /> : <Mic size={13} />}
                  {isRecording ? 'Recording...' : 'Start recording'}
                </button>
                <button
                  onClick={suggestQuestion}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F3F4] px-3.5 py-2 text-[0.76rem] font-semibold text-[#5F6368] transition-colors hover:bg-[#E8EAED]">
                  <Lightbulb size={13} />
                  Suggest a question
                </button>
                <button
                  onClick={() => setAiGuidanceOpen(open => !open)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.76rem] font-semibold transition-colors ${
                    aiGuidanceOpen ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'bg-[#F1F3F4] text-[#5F6368] hover:bg-[#E8EAED]'
                  }`}>
                  <Sparkles size={13} />
                  AI assistant
                  {aiGuidanceOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
              <button
                onClick={goToNextStage}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#188038] px-3.5 py-2 text-[0.76rem] font-semibold text-white transition-opacity hover:opacity-90">
                {isLastStage ? 'Finish practice' : "I'm ready for the next step"}
                <ArrowRight size={13} />
              </button>
            </div>
            <AnimatePresence initial={false}>
              {aiGuidanceOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: 4 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden">
                  <div className="mb-3 flex items-start gap-2.5 rounded-[20px] border border-[#D7E6FF] bg-[#F8FBFF] p-4">
                    <Target size={14} className="mt-0.5 shrink-0 text-[#1A73E8]" />
                    <div className="min-w-0">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">
                        What to get out of {activeStageInfo.label.toLowerCase()}
                      </p>
                      <p className="mt-1 text-[0.82rem] leading-6 text-[#5F6368]">{stageGuidance}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-3">
              <textarea
                value={draftQuestion}
                onChange={e => setDraftQuestion(e.target.value)}
                rows={2}
                disabled={isStudentResponding}
                placeholder={
                  isStudentResponding
                    ? `${mockStudent.name} is answering...`
                    : isRecording
                    ? 'Listening...'
                    : 'Ask the next interview question...'
                }
                className="min-h-[48px] flex-1 resize-none rounded-[18px] border border-[#E5EEFB] bg-[#FBFCFE] px-4 py-3 text-[0.84rem] leading-5 text-[#202124] outline-none transition-colors placeholder:text-[#9AA0A6] focus:border-[#1A73E8] focus:bg-white disabled:opacity-60"
              />
              <button
                onClick={sendQuestion}
                disabled={!draftQuestion.trim() || isStudentResponding}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A73E8] text-white shadow-[0_8px_22px_rgba(26,115,232,0.18)] transition-opacity hover:opacity-95 disabled:opacity-40"
                aria-label="Send question">
                <Send size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className="max-h-[calc(100vh-126px)] overflow-y-auto rounded-[28px] border border-[#E5EEFB] bg-white shadow-[0_12px_34px_rgba(17,24,39,0.04)] xl:sticky xl:top-6">
        <div className="border-b border-[#E5EEFB] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9AA0A6]">Context</p>
          <p className="mt-1 text-[0.92rem] font-semibold text-[#202124]">Only open what you need</p>
        </div>
        <div className="space-y-2.5 p-3">
          {panels.map(panel => {
            const Icon = panel.icon
            const isOpen = openPanel === panel.id
            return (
              <div key={panel.id} className="overflow-hidden rounded-[20px] border border-[#E5EEFB] bg-white">
                <button
                  onClick={() => setOpenPanel(isOpen ? '' : panel.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FBFCFE]">
                  <span className="flex items-center gap-2.5 text-[0.84rem] font-semibold text-[#202124]">
                    <Icon size={15} className="text-[#1A73E8]" />
                    {panel.title}
                  </span>
                  {isOpen ? <ChevronUp size={15} className="text-[#5F6368]" /> : <ChevronDown size={15} className="text-[#5F6368]" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="border-t border-[#E5EEFB]">
                      <div className="px-4 py-4">
                        {panel.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </aside>
      </div>
    </motion.div>
  )
}

export default function Interviews() {
  const { user } = useApp()
  const isNGO = user?.role === 'ngo'
  const [practiceInfo, setPracticeInfo] = useState({ active: false, title: '' })
  const inPractice = isNGO && practiceInfo.active

  return (
    <main className="flex-1 overflow-y-auto bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1480px] px-6 pb-8 pt-12 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
            {inPractice ? `Practice ${practiceInfo.title}` : 'Interviews'}
          </h1>
          <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
            {inPractice
              ? 'A mock interview with a generated student profile — ask questions, get guidance, and move through each phase.'
              : isNGO
              ? 'Pick a posted role and practice with a generated student profile'
              : 'Practice mock interviews for the roles you applied to, with help from Hive as you answer.'}
          </p>
        </motion.header>
        {isNGO ? <NGOView onPracticeChange={setPracticeInfo} /> : <StudentView />}
      </div>
    </main>
  )
}
