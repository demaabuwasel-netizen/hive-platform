import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Sparkles, AlertCircle, Lightbulb, Briefcase, ArrowRight,
  ArrowLeft, ChevronDown, ChevronUp, Send, UserRound,
  Languages, Mic, PlayCircle, StopCircle, Heart,
  FileText, CheckCircle2, Target, MessageCircle, Info, Layers,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchStudentApplications } from '../services/applications'
import { fetchNgoOpportunities, fetchOpportunity } from '../services/opportunities'
import { withTimeout } from '../utils/withTimeout'
import ngoInterviewImg from '../assets/ngo interview.PNG'
import interviewIllustration from '../assets/interview.png'

const STUDENT_INTERVIEW_CATEGORIES = [
  {
    id: 'opening',
    label: 'Opening',
    hint: 'Introduce yourself and warm up.',
    icon: Sparkles,
    tint: '#E8F0FE',
    accent: '#1A73E8',
  },
  {
    id: 'motivation',
    label: 'Motivation',
    hint: 'Why this NGO and this role?',
    icon: Heart,
    tint: '#FBE0E6',
    accent: '#B34C64',
  },
  {
    id: 'skills',
    label: 'Skills fit',
    hint: 'Show examples, tools, and strengths.',
    icon: Briefcase,
    tint: '#F3E8FD',
    accent: '#A142F4',
  },
  {
    id: 'mission',
    label: 'Mission fit',
    hint: 'Connect your work to impact.',
    icon: Lightbulb,
    tint: '#FEF7E0',
    accent: '#F29900',
  },
  {
    id: 'scenario',
    label: 'Scenario',
    hint: 'Practice real situations.',
    icon: AlertCircle,
    tint: '#E6F4EA',
    accent: '#188038',
  },
  {
    id: 'close',
    label: 'Close',
    hint: 'Questions, availability, and next steps.',
    icon: Clock,
    tint: '#D8F0EF',
    accent: '#1F7A76',
  },
]

const NGO_INTERVIEW_STAGES = [
  {
    id: 'opening',
    label: 'Opening',
    prompt: 'Start warm, set the tone, and invite the student to connect their background to this role.',
    lookFor: 'Motivation, communication clarity, and whether they understand the NGO context.',
    icon: Sparkles,
    tint: '#E8F0FE',
    accent: '#1A73E8',
  },
  {
    id: 'skills',
    label: 'Skills fit',
    prompt: 'Ask for a concrete example using one of the skills listed in the role or student profile.',
    lookFor: 'Specific tools, honest skill level, and how they explain choices without overclaiming.',
    icon: Briefcase,
    tint: '#F3E8FD',
    accent: '#A142F4',
  },
  {
    id: 'impact',
    label: 'Mission fit',
    prompt: 'Move from ability to purpose: why this work, this community, and this kind of impact.',
    lookFor: 'Values alignment, curiosity, and respect for the community served.',
    icon: Lightbulb,
    tint: '#FEF7E0',
    accent: '#F29900',
  },
  {
    id: 'scenario',
    label: 'Scenario',
    prompt: 'Give a realistic situation from the role and ask how they would handle it step by step.',
    lookFor: 'Judgment, collaboration instincts, and how they respond when details are ambiguous.',
    icon: Target,
    tint: '#E6F4EA',
    accent: '#188038',
  },
  {
    id: 'close',
    label: 'Close',
    prompt: 'Leave space for their questions and explain what a strong next step would look like.',
    lookFor: 'Prepared questions, enthusiasm, and whether expectations are aligned.',
    icon: MessageCircle,
    tint: '#E8F0FE',
    accent: '#1A73E8',
  },
]

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// Small radial progress ring used on the practice summary to show stage coverage at a glance.
function CompletionRing({ value, total, color }) {
  const size = 46, radius = 18, circumference = 2 * Math.PI * radius
  const pct = total > 0 ? value / total : 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(17,24,39,0.06)" strokeWidth="4" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circumference} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - pct) }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
      />
    </svg>
  )
}

// Walks up from a node to find whichever ancestor actually scrolls, rather than
// assuming a specific element — layout changes shouldn't silently break scrolling.
function getScrollParent(node, includeSelf = false) {
  let el = includeSelf ? node : node?.parentElement
  while (el) {
    const style = window.getComputedStyle(el)
    if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) {
      return el
    }
    el = el.parentElement
  }
  return document.scrollingElement || document.documentElement
}

function animateScrollTop(container, targetTop, duration = 900) {
  if (!container) return
  const startTop = container.scrollTop
  const distance = targetTop - startTop
  if (Math.abs(distance) < 1) return
  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    container.scrollTop = startTop + distance * easeInOutQuad(progress)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function smoothScrollIntoView(el, duration = 900) {
  if (!el) return
  const container = getScrollParent(el)
  const targetTop = container.scrollTop + (el.getBoundingClientRect().top - container.getBoundingClientRect().top)
  animateScrollTop(container, targetTop, duration)
}

function smoothScrollToTop(fromEl, duration = 900) {
  if (!fromEl) return
  animateScrollTop(getScrollParent(fromEl, true), 0, duration)
}

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
    opening: `Understand why the student wants ${title}, whether they know what the NGO is trying to do, and if they can connect their interest to ${field}.`,
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

function StudentView({ onHasContent }) {
  const { user, profile } = useApp()
  const [apps, setApps] = useState([])
  const [roleDetails, setRoleDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [practiceFinished, setPracticeFinished] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [activeCategory, setActiveCategory] = useState('opening')
  const [transcript, setTranscript] = useState([])
  const [draftAnswer, setDraftAnswer] = useState('')
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
        onHasContent?.(nextApps.length > 0)

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
        onHasContent?.(false)
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
  const askedCategories = new Set(transcript.filter(message => message.from === 'ai').map(message => message.category))

  function nextMessageId(prefix) {
    messageIdRef.current += 1
    return `${prefix}-${messageIdRef.current}`
  }

  function selectRole(appId) {
    setSelectedAppId(appId)
    setPracticeStarted(false)
    setPracticeFinished(false)
    setShowSummary(false)
    setActiveCategory('opening')
    setTranscript([])
    setDraftAnswer('')
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
    setPracticeFinished(false)
    setShowSummary(false)
    setActiveCategory('opening')
    setTranscript([{ id: nextMessageId('ai'), from: 'ai', category: 'opening', text: opening }])
    setDraftAnswer('')
    setIsRecording(false)
    setExplainOpen(false)
  }

  // The AI drives category progression — the student answers, it decides what's next.
  // The category list is a read-only progress trail, not something the student can jump around in.
  function sendAnswer() {
    const answer = draftAnswer.trim()
    if (!answer || !selectedRole) return

    const isLastCategory = activeCategory === 'close'
    const answeredCategory = activeCategory

    if (isLastCategory) {
      setTranscript(prev => [...prev, { id: nextMessageId('student'), from: 'student', text: answer, category: answeredCategory }])
      setDraftAnswer('')
      setExplainOpen(false)
      setPracticeFinished(true)
      return
    }

    const nextCategory = getNextStudentCategory(activeCategory)
    const nextQuestion = makeStudentInterviewQuestion(selectedRole, profile, nextCategory, transcript.length + 1)

    setTranscript(prev => [
      ...prev,
      { id: nextMessageId('student'), from: 'student', text: answer, category: answeredCategory },
      { id: nextMessageId('ai'), from: 'ai', category: nextCategory, text: nextQuestion },
    ])
    setActiveCategory(nextCategory)
    setDraftAnswer('')
    setExplainOpen(false)
  }

  // Skips the current question with no answer recorded — the category still advances,
  // it just shows up in the summary as "not answered" instead of covered.
  function skipQuestion() {
    if (!selectedRole) return

    if (activeCategory === 'close') {
      setDraftAnswer('')
      setExplainOpen(false)
      setPracticeFinished(true)
      return
    }

    const nextCategory = getNextStudentCategory(activeCategory)
    const nextQuestion = makeStudentInterviewQuestion(selectedRole, profile, nextCategory, transcript.length + 1)

    setTranscript(prev => [
      ...prev,
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


  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map(item => (
          <div
            key={item}
            className="h-[260px] animate-pulse rounded-[32px] border bg-white"
            style={{ borderColor: 'rgba(26,115,232,0.10)' }} />
        ))}
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <section
        className="rounded-[32px] border bg-white px-6 py-16 text-center shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <img src={interviewIllustration} alt="" className="mx-auto w-52 mb-5 select-none" />
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
        <aside
          className="overflow-y-auto rounded-[32px] border bg-white p-4 shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
          style={{ height: '600px', borderColor: 'rgba(26,115,232,0.10)' }}>
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

        <section
          className="min-h-[560px] rounded-[32px] border bg-white shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
          style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
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
              <div className="relative overflow-hidden rounded-[28px] border bg-white px-6 py-8" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(26,115,232,0.07),transparent_55%),radial-gradient(circle_at_85%_0%,rgba(161,66,244,0.05),transparent_50%)]" />
                <svg
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full"
                  viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z" fill="#E8F0FE" opacity="0.4" />
                  <path d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z" fill="#E8F0FE" opacity="0.6" />
                </svg>
                <div className="relative flex flex-col gap-6 items-center text-center">
                  <div className="min-w-0">
                    <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[0.76rem] font-semibold text-[#1A73E8]">
                      <Sparkles size={13} />
                      Interview prep
                    </div>
                    <h2 className="text-[clamp(1.65rem,3vw,2.45rem)] font-semibold leading-tight text-[#202124]">
                      {selectedRole.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-[0.95rem] leading-7 text-[#5F6368] mx-auto">
                      Get ready for your interview with {selectedRole.orgName}. Review what to expect and practice with our AI interviewer.
                    </p>
                  </div>
                  <button
                    onClick={openPractice}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-[#1A73E8] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(26,115,232,0.28)]">
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

  if (showSummary) {
    const categoriesRecap = STUDENT_INTERVIEW_CATEGORIES.map(category => {
      const qaPairs = []
      transcript.forEach((message, i) => {
        if (message.from === 'ai' && message.category === category.id) {
          const answer = transcript[i + 1]?.from === 'student' ? transcript[i + 1].text : null
          qaPairs.push({ id: message.id, question: message.text, answer })
        }
      })
      const covered = qaPairs.length > 0
      const coach = explainStudentQuestion('', selectedRole, profile, category.id)
      return { ...category, qaPairs, covered, coach }
    })
    const coveredCategories = categoriesRecap.filter(category => category.covered)

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-6xl space-y-6">
        {/* Overview — role, and the headline numbers */}
        <section className="relative overflow-hidden rounded-[32px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04),0_20px_48px_rgba(17,24,39,0.06)] ring-1 ring-black/[0.03]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_12%_0%,rgba(43,108,163,0.12),transparent_55%),radial-gradient(circle_at_88%_0%,rgba(100,73,199,0.10),transparent_50%)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4 px-7 pb-5 pt-7">
            <div className="flex items-center gap-3.5">
              <GradientAvatar name={selectedRole.orgName} size={50} radius="1.1rem" className="shrink-0" />
              <div className="min-w-0">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#9AA0A6]">Practice summary</p>
                <h2 className="mt-0.5 truncate text-[1.2rem] font-semibold tracking-[-0.02em] text-[#202124]">{selectedRole.title}</h2>
                <p className="truncate text-[0.82rem] text-[#5F6368]">{selectedRole.orgName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setPracticeStarted(false)
                setPracticeFinished(false)
                setShowSummary(false)
                setTranscript([])
                setDraftAnswer('')
                setExplainOpen(false)
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5EEFB] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]">
              <ArrowLeft size={14} />
              Interview prep
            </button>
          </div>
          <div className="relative grid grid-cols-1 gap-3 border-t border-[#F1F3F4] px-7 py-6 sm:grid-cols-2">
            <div className="flex items-center gap-3.5 rounded-[22px] px-4 py-4" style={{ background: '#E8F0FE' }}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#1A73E8]">
                <MessageCircle size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[1.55rem] font-bold leading-none tracking-[-0.02em] text-[#1A73E8]">{answeredCount}</p>
                <p className="mt-1.5 text-[0.76rem] font-medium text-[#5F6368]">Answers given</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 rounded-[22px] px-4 py-4" style={{ background: '#F3E8FD' }}>
              <CompletionRing value={coveredCategories.length} total={STUDENT_INTERVIEW_CATEGORIES.length} color="#A142F4" />
              <div className="min-w-0">
                <p className="text-[1.55rem] font-bold leading-none tracking-[-0.02em] text-[#A142F4]">
                  {coveredCategories.length}/{STUDENT_INTERVIEW_CATEGORIES.length}
                </p>
                <p className="mt-1.5 text-[0.76rem] font-medium text-[#5F6368]">Categories covered</p>
              </div>
            </div>
          </div>
        </section>

        {/* One card per interview category, with a coaching tip instead of NGO-style dual insights */}
        {categoriesRecap.map((category, index) => {
          const CategoryIcon = category.icon
          return (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 * index }}
              className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.04),0_16px_40px_rgba(17,24,39,0.05)] ring-1 ring-black/[0.03]">
              <div
                className="flex items-center gap-3 border-b border-[#F1F3F4] px-6 py-4"
                style={{ background: `linear-gradient(180deg, ${category.tint}66 0%, rgba(255,255,255,0) 100%)` }}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: category.tint, color: category.accent }}>
                  <CategoryIcon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em]" style={{ color: category.accent }}>Category {index + 1}</p>
                  <h2 className="text-[0.95rem] font-semibold text-[#202124]">{category.label}</h2>
                </div>
                <p className="shrink-0 text-[0.78rem] font-medium text-[#9AA0A6]">
                  {category.covered ? `${category.qaPairs.length} question${category.qaPairs.length !== 1 ? 's' : ''}` : 'Not reached'}
                </p>
              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                  <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
                    {category.covered ? 'Conversation' : 'Not reached this run'}
                  </p>
                  {category.covered ? (
                    <div className="space-y-4">
                      {category.qaPairs.map((pair, pairIndex) => (
                        <div key={pair.id} className={pairIndex > 0 ? 'border-t border-[#F1F3F4] pt-4' : ''}>
                          <div className="mb-2 inline-block max-w-full rounded-2xl rounded-tl-md px-3.5 py-2" style={{ background: category.tint }}>
                            <p className="text-[0.86rem] font-medium leading-6" style={{ color: category.accent }}>{pair.question}</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <GradientAvatar name={profile?.name || user?.name || 'Student'} size={24} radius="0.65rem" className="mt-0.5 shrink-0" />
                            <p className="flex-1 rounded-2xl rounded-tl-md bg-[#F8F9FA] px-3.5 py-2.5 text-[0.86rem] leading-6 text-[#3C4043]">
                              {pair.answer || <span className="italic text-[#9AA0A6]">No answer recorded</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[0.86rem] leading-6 text-[#9AA0A6]">The practice ended before reaching this category.</p>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Coaching tip</p>
                  <div className="rounded-[18px] border p-4" style={{ borderColor: 'rgba(26,115,232,0.14)', background: '#FBFCFE' }}>
                    <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#202124]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1A73E8] text-white">
                        <Lightbulb size={12} />
                      </span>
                      What this checks for
                    </p>
                    <p className="mt-2.5 text-[0.82rem] leading-6 text-[#5F6368]">{category.coach.purpose}</p>
                    {category.coach.tips?.[0] && (
                      <p className="mt-3 border-t border-[rgba(26,115,232,0.10)] pt-3 text-[0.82rem] leading-6 text-[#5F6368]">
                        <span className="font-semibold text-[#202124]">Tip: </span>{category.coach.tips[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )
        })}

        <div className="flex flex-wrap justify-center gap-3 pb-2 pt-1">
          <button
            onClick={openPractice}
            className="inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-6 py-3 text-[0.88rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(26,115,232,0.28)]">
            <PlayCircle size={17} />
            Practice again
          </button>
          <button
            onClick={() => {
              setPracticeStarted(false)
              setPracticeFinished(false)
              setShowSummary(false)
              setTranscript([])
              setDraftAnswer('')
              setExplainOpen(false)
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#D7E6FF] bg-white px-6 py-3 text-[0.88rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]">
            Back to prep
          </button>
        </div>
      </motion.div>
    )
  }

  const currentCategoryIndex = STUDENT_INTERVIEW_CATEGORIES.findIndex(category => category.id === activeCategory)
  const isLastCategory = currentCategoryIndex === STUDENT_INTERVIEW_CATEGORIES.length - 1
  const nextCategoryInfo = STUDENT_INTERVIEW_CATEGORIES[currentCategoryIndex + 1]
  const questionsAskedInCategory = transcript.filter(message => message.from === 'ai' && message.category === activeCategory).length

  // Only the current category's question is shown — no answer bubble, no transcript log,
  // just the question in front of the student until they answer or skip it.
  const categoryMessages = transcript.filter(message => message.category === activeCategory)
  const lastCategoryMessage = categoryMessages[categoryMessages.length - 1]
  const currentQuestionMsg = lastCategoryMessage?.from === 'ai' ? lastCategoryMessage : categoryMessages[categoryMessages.length - 2]

  return (
    <motion.div
      key={selectedRole.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section
        className="flex h-[calc(100vh-72px)] flex-col overflow-hidden rounded-[24px] border bg-white shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <span className="block h-1 w-full shrink-0 transition-all duration-300" style={{ background: `linear-gradient(90deg, ${activeCategoryInfo.accent}59, ${activeCategoryInfo.tint})` }} />

        {/* Context header — grounds the box: who you're talking to, and how far along you are */}
        <div className="flex items-center justify-between gap-4 border-b border-[#F1F3F4] px-6 py-4">
          <button
            onClick={() => {
              setPracticeStarted(false)
              setPracticeFinished(false)
              setShowSummary(false)
              setTranscript([])
              setDraftAnswer('')
              setExplainOpen(false)
            }}
            className="flex min-w-0 items-center gap-3 rounded-2xl py-1 pr-3 text-left transition-colors hover:bg-black/[0.03]">
            <GradientAvatar name={selectedRole.orgName} size={38} radius="0.85rem" className="shrink-0 shadow-sm ring-2 ring-white" />
            <div className="min-w-0">
              <p className="truncate text-[0.92rem] font-semibold text-[#202124]">{selectedRole.title}</p>
              <p className="truncate text-[0.74rem] text-[#9AA0A6]">Mock interview with {selectedRole.orgName}</p>
            </div>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[0.68rem] font-semibold text-[#188038] sm:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34A853]" />
              </span>
              Live practice
            </span>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.74rem] font-semibold" style={{ background: activeCategoryInfo.tint, color: activeCategoryInfo.accent }}>
              <span>{currentCategoryIndex + 1}</span>
              <span className="opacity-40">/</span>
              <span>{STUDENT_INTERVIEW_CATEGORIES.length}</span>
            </div>
          </div>
        </div>

        {/* Category stepper — a read-only progress trail. The AI decides when to move on, not you. */}
        <div className="flex items-start justify-center gap-0 px-6 pb-7 pt-8">
          {STUDENT_INTERVIEW_CATEGORIES.map((category, index) => {
            const isActive = activeCategory === category.id
            const isDone = askedCategories.has(category.id) && !isActive
            const StepIcon = category.icon
            return (
              <div key={category.id} className="flex items-start">
                {index > 0 && (
                  <div
                    className={`mt-[18px] h-[3px] w-7 shrink-0 rounded-full transition-colors sm:w-14 ${isDone ? 'bg-[#188038]/40' : 'bg-[#E8EAED]'}`}
                    style={isActive ? { background: `${category.accent}4D` } : undefined}
                  />
                )}
                <div className="flex w-14 shrink-0 flex-col items-center gap-2 sm:w-20">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[0.8rem] font-semibold transition-all duration-200 ${
                      isActive ? 'scale-110' : isDone ? 'bg-[#E6F4EA] text-[#188038]' : 'bg-[#F1F3F4] text-[#9AA0A6]'
                    }`}
                    style={isActive ? { background: category.tint, color: category.accent, boxShadow: `0 0 0 2px ${category.accent}40, 0 6px 14px ${category.accent}26` } : undefined}>
                    {isDone ? <CheckCircle2 size={16} /> : <StepIcon size={15} strokeWidth={2.15} />}
                  </span>
                  <span
                    className={`text-center text-[0.7rem] font-medium leading-tight ${isDone ? 'text-[#188038]' : isActive ? '' : 'text-[#9AA0A6]'}`}
                    style={isActive ? { color: category.accent } : undefined}>
                    {category.label}
                  </span>
                  {isActive && (
                    <button
                      onClick={() => setExplainOpen(open => !open)}
                      aria-label={`What this question is checking for`}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold transition-all hover:opacity-85"
                      style={explainOpen
                        ? { background: category.tint, color: category.accent, boxShadow: `inset 0 0 0 1.5px ${category.accent}66` }
                        : { background: category.tint, color: category.accent }}>
                      <Lightbulb size={11} />
                      Tip
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <AnimatePresence initial={false}>
          {explainOpen && questionCoach && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-[#EEF4FF] bg-[#FAFCFF]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="px-6 py-4">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em]" style={{ color: activeCategoryInfo.accent }}>
                    What this question is checking for
                  </p>
                  <p className="mt-1 text-[0.82rem] leading-6 text-[#5F6368]">{questionCoach.purpose}</p>
                  <p className="mt-3 border-t border-[#EEF4FF] pt-3 text-[0.82rem] leading-6 text-[#5F6368]">
                    <span className="font-semibold text-[#202124]">Tip: </span>{questionCoach.tips?.[0]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Current exchange only — the room shows where you are, not a scrolling log */}
          <div className="relative flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto flex h-full min-h-[180px] max-w-2xl flex-col items-center justify-center text-center">
              {!practiceFinished && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeCategory}-${currentQuestionMsg?.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]" style={{ color: activeCategoryInfo.accent }}>
                      {activeCategoryInfo.label}
                    </p>
                    <p className="mt-4 text-[1.55rem] font-semibold leading-snug tracking-[-0.01em] text-[#202124]">
                      {currentQuestionMsg?.text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              )}

              {practiceFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto mt-6 max-w-md rounded-[22px] border px-5 py-5 text-center"
                  style={{ borderColor: 'rgba(24,128,56,0.18)', background: '#F7FCF9' }}>
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#188038]">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-[0.98rem] font-semibold text-[#202124]">Practice complete</p>
                  <p className="mx-auto mt-1.5 max-w-xs text-[0.82rem] leading-6 text-[#5F6368]">
                    You made it through all 6 categories. See how it went.
                  </p>
                  <button
                    onClick={() => setShowSummary(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#188038] px-5 py-2.5 text-[0.84rem] font-semibold text-white shadow-[0_8px_20px_rgba(24,128,56,0.2)] transition-transform hover:-translate-y-0.5">
                    <Sparkles size={14} />
                    See summary
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {!practiceFinished && (
            <div className="bg-[#FBFCFE] px-5 py-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  {questionsAskedInCategory > 0 && (
                    <span className="text-[0.76rem] text-[#9AA0A6]">
                      {questionsAskedInCategory} question{questionsAskedInCategory === 1 ? '' : 's'} asked in {activeCategoryInfo.label.toLowerCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={skipQuestion}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5EEFB] bg-white px-3 py-1.5 text-[0.74rem] font-semibold text-[#5F6368] transition-colors hover:border-[#D7E6FF] hover:text-[#1A73E8]">
                  {isLastCategory ? 'Skip' : `Skip to ${nextCategoryInfo?.label}`}
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Unified composer — mic lives inside the input, matching the NGO practice room */}
              <div className={`flex items-end gap-1 rounded-[24px] bg-white p-2 pl-2.5 shadow-[0_2px_10px_rgba(17,24,39,0.05)] ring-1 transition-all ring-[#EEF1F6] focus-within:shadow-[0_6px_20px_rgba(26,115,232,0.12)] focus-within:ring-[#1A73E8]/40`}>
                <button
                  onClick={handleVoiceToggle}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                  title={isRecording ? 'Stop recording' : 'Start recording'}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isRecording ? 'bg-[#E6F4EA] text-[#188038]' : 'text-[#9AA0A6] hover:bg-[#F1F3F4] hover:text-[#5F6368]'
                  }`}>
                  {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
                </button>
                <textarea
                  value={draftAnswer}
                  onChange={event => setDraftAnswer(event.target.value)}
                  rows={1}
                  placeholder={isRecording ? 'Listening...' : 'Type your answer here...'}
                  className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-[0.88rem] leading-6 text-[#202124] outline-none placeholder:text-[#9AA0A6]"
                />
                <button
                  onClick={sendAnswer}
                  disabled={!draftAnswer.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A73E8] text-white shadow-[0_4px_12px_rgba(26,115,232,0.3)] transition-all hover:scale-105 hover:bg-[#1765CC] disabled:scale-100 disabled:bg-[#DADCE0] disabled:text-white disabled:shadow-none"
                  aria-label="Send answer">
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside
        className="relative overflow-hidden rounded-[24px] border bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] xl:sticky xl:top-6 xl:self-start"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <span className="absolute inset-x-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #A142F459, #F3E8FD)' }} />
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full"
          viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z" fill="#F3E8FD" opacity="0.4" />
          <path d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z" fill="#F3E8FD" opacity="0.6" />
        </svg>
        <div className="relative z-10">
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
          </div>
        </div>
      </aside>
      </div>
    </motion.div>
  )
}

function NGOView({ onPracticeChange, onHasContent }) {
  const { user } = useApp()
  const navigate = useNavigate()
  const recognitionRef = useRef(null)
  const messageIdRef = useRef(0)
  const practiceBoxRef = useRef(null)
  const [ngoOpportunities, setNgoOpportunities] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [openInsightKeys, setOpenInsightKeys] = useState(() => new Set())
  const [activeGuideSection, setActiveGuideSection] = useState('summary')
  const [openQuestionStage, setOpenQuestionStage] = useState(null)
  const [activeStage, setActiveStage] = useState('opening')
  const [openPanel, setOpenPanel] = useState('')
  const [aiGuidanceOpen, setAiGuidanceOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isStudentResponding, setIsStudentResponding] = useState(false)
  const [exampleQuestionIndex, setExampleQuestionIndex] = useState(0)
  const [draftQuestion, setDraftQuestion] = useState('')
  const [transcript, setTranscript] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    withTimeout(fetchNgoOpportunities(user.id), 10000, 'fetchNgoOpportunities')
      .then(opps => {
        setNgoOpportunities(opps || [])
        onHasContent?.((opps || []).length > 0)
      })
      .catch(err => {
        console.error('Failed to load NGO opportunities:', err.message)
        setNgoOpportunities([])
        onHasContent?.(false)
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
    onPracticeChange?.({
      active: practiceStarted,
      title: selectedOpp?.title || '',
      onBack: () => {
        setPracticeStarted(false)
        setShowSummary(false)
      },
    })
  }, [practiceStarted, selectedOpp?.title, onPracticeChange])

  useEffect(() => {
    if (!practiceStarted) return
    smoothScrollIntoView(practiceBoxRef.current)
  }, [practiceStarted])

  const mockStudent = selectedOpp ? makeMockStudent(selectedOpp) : null
  const firstQuestion = selectedOpp && mockStudent ? makeFirstQuestion(selectedOpp, mockStudent) : ''
  const activeStageInfo = NGO_INTERVIEW_STAGES.find(stage => stage.id === activeStage) || NGO_INTERVIEW_STAGES[0]
  const roleSkills = getSkillNames(selectedOpp?.skills)
  const prepSections = selectedOpp ? makeRolePrepSections(selectedOpp, roleSkills) : []
  const roleSummary = selectedOpp ? makeRoleSummary(selectedOpp, roleSkills) : ''
  const guideSections = selectedOpp ? [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'phases', label: 'What to know', icon: Lightbulb },
    { id: 'questions', label: 'Questions to ask', icon: MessageCircle },
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
    setShowSummary(false)
    setActiveGuideSection('summary')
    setActiveStage('opening')
    setOpenPanel('')
    setAiGuidanceOpen(false)
    setIsRecording(false)
    setIsStudentResponding(false)
    setExampleQuestionIndex(0)
    setDraftQuestion('')
    setTranscript([])
  }

  function openPracticeRoom() {
    if (!selectedOpp) return
    setPracticeStarted(true)
    setShowSummary(false)
    setOpenInsightKeys(new Set())
    setActiveStage('opening')
    setOpenPanel('')
    setAiGuidanceOpen(false)
    setIsRecording(false)
    setIsStudentResponding(false)
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
      setShowSummary(true)
    }
  }

  function toggleInsight(key) {
    setOpenInsightKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
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
        <img src={interviewIllustration} alt="" className="mx-auto w-52 mb-5 select-none" />
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
                        {opp.category || 'Flexible role'}
                      </p>
                    </div>
                    <ArrowRight size={16} className={`mt-1 shrink-0 transition-transform ${active ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="relative">
          <img
            src={ngoInterviewImg}
            alt=""
            className="pointer-events-none absolute -top-[187px] right-8 z-10 w-full max-w-md"
          />
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

              <div className="mt-11 flex flex-wrap gap-3">
                {guideSections.map(section => {
                  const Icon = section.icon
                  const active = activeGuideSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveGuideSection(section.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.85rem] font-semibold tracking-[0.01em] transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-b from-[#3B8AF2] to-[#1A73E8] text-white shadow-[0_8px_20px_rgba(26,115,232,0.28)]'
                          : 'border border-[#E5EEFB] bg-white text-[#5F6368] shadow-[0_1px_3px_rgba(16,24,40,0.04)] hover:border-[#BFD7FF] hover:text-[#1A73E8] hover:shadow-[0_4px_14px_rgba(26,115,232,0.12)]'
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
                      <h3 className="text-[1.25rem] font-semibold text-[#202124]">AI role summary</h3>
                      <p className="mt-1.5 text-[0.82rem] text-[#9AA0A6]">A quick AI-generated summary of the role — read this if you only have a minute.</p>
                      <p className="mt-6 max-w-3xl text-[0.95rem] leading-8 text-[#5F6368]">
                        {roleSummary}
                      </p>
                      {prepSections[2]?.text && (
                        <p className="mt-6 max-w-3xl text-[0.95rem] leading-8 text-[#5F6368]">
                          {prepSections[2].text}
                        </p>
                      )}
                    </section>
                  )}

                  {activeGuideSection === 'phases' && (
                    <section className="max-w-3xl">
                      <div className="mb-5 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                          <Lightbulb size={19} />
                        </div>
                        <div>
                          <h3 className="text-[1.25rem] font-semibold text-[#202124]">What to know</h3>
                          <p className="mt-1 text-[0.82rem] text-[#9AA0A6]">What you need to understand from the student in each part of the conversation.</p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {NGO_INTERVIEW_STAGES.map((stage, i) => (
                          <div key={stage.id} className="flex gap-4 rounded-[22px] border border-[#E5EEFB] bg-white p-5 shadow-[0_2px_10px_rgba(17,24,39,0.03)]">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[0.78rem] font-bold text-[#1A73E8]">
                              {String(i + 1).padStart(2, '0')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[1.05rem] font-bold text-[#202124]">{stage.label}</p>
                              <p className="mt-1.5 text-[0.92rem] leading-7 text-[#4B5058]">
                                {mockStudent ? makeStageGuidance(selectedOpp, mockStudent, stage.id) : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeGuideSection === 'questions' && (
                    <section className="max-w-3xl">
                      <div className="mb-5 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                          <MessageCircle size={19} />
                        </div>
                        <div>
                          <h3 className="text-[1.25rem] font-semibold text-[#202124]">Questions to ask</h3>
                          <p className="mt-1 text-[0.82rem] text-[#9AA0A6]">A ready-made script — pick a few from each part, you don&apos;t need to ask all of them.</p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-4">
                        {NGO_INTERVIEW_STAGES.map((stage, i) => {
                          const isOpen = openQuestionStage === stage.id
                          const questions = makeStageQuestions(selectedOpp, mockStudent, stage.id)
                          return (
                            <div key={stage.id} className="overflow-hidden rounded-[22px] border border-[#E5EEFB]">
                              <button
                                onClick={() => setOpenQuestionStage(isOpen ? null : stage.id)}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F8FBFF]">
                                <div className="flex items-center gap-3.5">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[0.78rem] font-bold text-[#1A73E8]">
                                    {i + 1}
                                  </div>
                                  <p className="text-[1.05rem] font-bold text-[#202124]">{stage.label}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[0.76rem] font-medium text-[#9AA0A6]">{questions.length} questions</span>
                                  <ChevronDown size={18} className={`shrink-0 text-[#9AA0A6] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </div>
                              </button>
                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden">
                                    <div className="space-y-3.5 border-t border-[#E5EEFB] bg-[#FBFCFE] px-5 py-4">
                                      {questions.map((question, qi) => (
                                        <div key={qi} className="flex gap-3">
                                          <span className="mt-0.5 text-[0.84rem] font-bold text-[#1A73E8]">{qi + 1}.</span>
                                          <p className="text-[0.94rem] leading-7 text-[#3C4043]">{question}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
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
        </div>
      </motion.div>
    )
  }

  if (showSummary) {
    const stagesRecap = NGO_INTERVIEW_STAGES.map(stage => {
      const questions = transcript.filter(message => message.stage === stage.id && message.from === 'ngo')
      const answers = transcript.filter(message => message.stage === stage.id && message.from === 'student')
      const qaPairs = questions.map((question, index) => ({
        id: question.id,
        question: question.text,
        answer: answers[index]?.text || null,
      }))
      const covered = qaPairs.length > 0
      const askedTexts = new Set(questions.map(question => question.text))
      const suggestedFollowUp = covered
        ? makeStageQuestions(selectedOpp, mockStudent, stage.id).find(question => !askedTexts.has(question))
        : null
      return { ...stage, qaPairs, covered, suggestedFollowUp }
    })
    const coveredStages = stagesRecap.filter(stage => stage.covered)
    const questionsAsked = transcript.filter(message => message.from === 'ngo').length
    const answersGiven = transcript.filter(message => message.from === 'student').length

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-6xl space-y-6">
        {/* Overview — who this was, and the headline numbers */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <GradientAvatar name={mockStudent.name} size={54} radius="1.2rem" className="shrink-0" />
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[0.68rem] font-semibold text-[#188038]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34A853]" />
                </span>
                Practice complete
              </span>
              <h2 className="mt-1.5 text-[1.6rem] font-semibold tracking-[-0.03em] text-[#202124]">Interview summary</h2>
              <p className="truncate text-[0.86rem] text-[#5F6368]">{mockStudent.name} · {selectedOpp.title}</p>
            </div>
          </div>
          <button
            onClick={() => { setPracticeStarted(false); setShowSummary(false) }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5EEFB] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#1A73E8] shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_20px_rgba(17,24,39,0.04)] transition-colors hover:bg-[#F8FBFF]">
            <ArrowLeft size={14} />
            Back to guide
          </button>
        </div>

        {/* Headline numbers — dashboard-style KPI tiles with pastel waves */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Questions asked', value: questionsAsked, icon: MessageCircle, tint: '#E8F0FE', accent: '#1A73E8' },
            { label: 'Answers given', value: answersGiven, icon: UserRound, tint: '#E6F4EA', accent: '#188038' },
          ].map((stat, statIndex) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05 * statIndex }}
              className="group relative overflow-hidden rounded-[24px] border bg-white p-4 shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(17,24,39,0.09)]"
              style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
              <svg
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full"
                viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z" fill={stat.tint} opacity="0.55" />
                <path d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z" fill={stat.tint} opacity="0.85" />
              </svg>
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110" style={{ background: stat.tint, color: stat.accent }}>
                <stat.icon size={18} strokeWidth={2.15} />
              </div>
              <p className="relative z-10 mt-5 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-[#202124]">{stat.value}</p>
              <p className="relative z-10 mt-1.5 text-[0.8rem] font-medium text-[#5F6368]">{stat.label}</p>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1 }}
            className="group relative overflow-hidden rounded-[24px] border bg-white p-4 shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(17,24,39,0.09)]"
            style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
            <svg
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full"
              viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z" fill="#F3E8FD" opacity="0.55" />
              <path d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z" fill="#F3E8FD" opacity="0.85" />
            </svg>
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110" style={{ background: '#F3E8FD', color: '#A142F4' }}>
                <Layers size={18} strokeWidth={2.15} />
              </div>
              <CompletionRing value={coveredStages.length} total={NGO_INTERVIEW_STAGES.length} color="#A142F4" />
            </div>
            <p className="relative z-10 mt-5 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-[#202124]">
              {coveredStages.length}<span className="text-[1.1rem] font-medium text-[#9AA0A6]">/{NGO_INTERVIEW_STAGES.length}</span>
            </p>
            <p className="relative z-10 mt-1.5 text-[0.8rem] font-medium text-[#5F6368]">Stages covered</p>
          </motion.div>
        </div>

        {/* One card per interview stage, with generous space between */}
        {stagesRecap.map((stage, index) => {
          const learnedKey = `${stage.id}-learned`
          const improveKey = `${stage.id}-improve`
          const learnedOpen = openInsightKeys.has(learnedKey)
          const improveOpen = openInsightKeys.has(improveKey)
          const StageIcon = stage.icon
          return (
            <motion.section
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 * index }}
              className="group overflow-hidden rounded-[24px] border bg-white shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] transition-all duration-200 hover:shadow-[0_18px_40px_rgba(17,24,39,0.07)]"
              style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
              <span
                className="block h-1"
                style={{ background: `linear-gradient(90deg, ${stage.accent}, ${stage.tint})`, opacity: stage.covered ? 1 : 0.25 }}
              />
              <div className="flex items-center gap-3 border-b border-[#F1F3F4] px-6 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110" style={{ background: stage.tint, color: stage.accent }}>
                  <StageIcon size={18} strokeWidth={2.15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Stage {index + 1}</p>
                  <h2 className="text-[0.98rem] font-semibold text-[#202124]">{stage.label}</h2>
                </div>
                <p className="hidden max-w-md truncate text-[0.8rem] text-[#9AA0A6] lg:block">{stage.prompt}</p>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
                  style={stage.covered
                    ? { background: stage.tint, color: stage.accent }
                    : { background: '#F1F3F4', color: '#9AA0A6' }}>
                  {stage.covered ? `${stage.qaPairs.length} question${stage.qaPairs.length !== 1 ? 's' : ''}` : 'Not covered'}
                </span>
              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* What happened — rendered as a light chat transcript */}
                <div className="min-w-0">
                  <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
                    {stage.covered ? 'Conversation' : 'Suggested opening'}
                  </p>
                  {stage.covered ? (
                    <div className="space-y-4">
                      {stage.qaPairs.map((pair, pairIndex) => (
                        <div key={pair.id} className={pairIndex > 0 ? 'border-t border-[#F1F3F4] pt-4' : ''}>
                          <div className="flex justify-end">
                            <div className="mb-2 inline-block max-w-[85%] rounded-2xl rounded-tr-md px-3.5 py-2" style={{ background: stage.tint }}>
                              <p className="text-[0.86rem] font-medium leading-6" style={{ color: stage.accent }}>{pair.question}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <GradientAvatar name={mockStudent.name} size={24} radius="0.65rem" className="mt-0.5 shrink-0" />
                            <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#F8F9FA] px-3.5 py-2.5 text-[0.86rem] leading-6 text-[#3C4043]">
                              {pair.answer || <span className="italic text-[#9AA0A6]">No answer recorded</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[#E5EEFB] bg-[#FBFCFE] px-4 py-4">
                      <p className="text-[0.86rem] leading-6 text-[#5F6368]">{stage.prompt}</p>
                      <p className="mt-2 text-[0.78rem] font-medium" style={{ color: stage.accent }}>
                        Try covering this stage in your next practice run.
                      </p>
                    </div>
                  )}
                </div>

                {/* Coaching rail — what you learned / what could improve, stacked */}
                <div className="min-w-0">
                  <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Coaching notes</p>
                  <div className="space-y-3">
                    <div
                      className="overflow-hidden rounded-[18px] border transition-colors"
                      style={{ borderColor: learnedOpen ? 'rgba(24,128,56,0.26)' : 'rgba(24,128,56,0.14)', background: learnedOpen ? '#EEFAF3' : '#F7FCF9' }}>
                      <button
                        onClick={() => toggleInsight(learnedKey)}
                        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
                        <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#202124]">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#188038] text-white">
                            <CheckCircle2 size={12} />
                          </span>
                          What you learned
                        </span>
                        {learnedOpen ? <ChevronUp size={14} className="shrink-0 text-[#5F6368]" /> : <ChevronDown size={14} className="shrink-0 text-[#5F6368]" />}
                      </button>
                      <AnimatePresence initial={false}>
                        {learnedOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden border-t border-[rgba(24,128,56,0.14)]">
                            <p className="px-3.5 py-3 text-[0.82rem] leading-6 text-[#5F6368]">
                              {stage.covered ? stage.lookFor : `Once you ask about this, listen for: ${stage.lookFor}`}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div
                      className="overflow-hidden rounded-[18px] border transition-colors"
                      style={{ borderColor: improveOpen ? 'rgba(242,153,0,0.30)' : 'rgba(242,153,0,0.16)', background: improveOpen ? '#FFF6E4' : '#FFFBF2' }}>
                      <button
                        onClick={() => toggleInsight(improveKey)}
                        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
                        <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#202124]">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F29900] text-white">
                            <AlertCircle size={12} />
                          </span>
                          What could improve
                        </span>
                        {improveOpen ? <ChevronUp size={14} className="shrink-0 text-[#5F6368]" /> : <ChevronDown size={14} className="shrink-0 text-[#5F6368]" />}
                      </button>
                      <AnimatePresence initial={false}>
                        {improveOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden border-t border-[rgba(242,153,0,0.16)]">
                            <p className="px-3.5 py-3 text-[0.82rem] leading-6 text-[#5F6368]">
                              {stage.covered
                                ? (stage.suggestedFollowUp
                                  ? `Consider also asking: "${stage.suggestedFollowUp}"`
                                  : 'You asked a full round of questions here — nice and thorough.')
                                : stage.prompt}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )
        })}

        <div className="flex flex-wrap justify-center gap-3 pb-2 pt-1">
          <button
            onClick={openPracticeRoom}
            className="inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-6 py-3 text-[0.88rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(26,115,232,0.28)]">
            <PlayCircle size={17} />
            Practice again
          </button>
          <button
            onClick={() => { setPracticeStarted(false); setShowSummary(false) }}
            className="inline-flex items-center gap-2 rounded-full border border-[#D7E6FF] bg-white px-6 py-3 text-[0.88rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#F8FBFF]">
            Back to guide
          </button>
        </div>
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
          <div className="flex items-start gap-3 rounded-[22px] bg-gradient-to-br from-[#F6F9FF] to-[#EEF4FF] p-3 ring-1 ring-[#E1ECFF]">
            <GradientAvatar name={mockStudent.name} size={48} radius="0.85rem" className="shrink-0 shadow-sm ring-2 ring-white" />
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
          <div className="rounded-[22px] bg-gradient-to-br from-[#F6F9FF] to-[#EEF4FF] p-3 ring-1 ring-[#E1ECFF]">
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
  const nextStage = NGO_INTERVIEW_STAGES[currentStageIndex + 1]
  const questionsAskedInStage = transcript.filter(message => message.stage === activeStage && message.from === 'ngo').length
  const askedStages = new Set(transcript.map(message => message.stage))
  const stageHasMessages = askedStages.has(activeStage)
  const featuredQuestion = (activeStage === 'opening' && !stageHasMessages) ? firstQuestion : exampleQuestion

  // Only the current stage's latest exchange is shown — each new question replaces the last,
  // and switching categories starts a clean slate so the room reflects where you are, not where you've been
  const stageMessages = transcript.filter(message => message.stage === activeStage)
  const lastStageMessage = stageMessages[stageMessages.length - 1]
  const currentQuestionMsg = lastStageMessage?.from === 'ngo' ? lastStageMessage : stageMessages[stageMessages.length - 2]
  const currentAnswerMsg = lastStageMessage?.from === 'student' ? lastStageMessage : null

  return (
    <motion.div
      ref={practiceBoxRef}
      key={selectedRole}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section
        className="flex h-[calc(100vh-72px)] flex-col overflow-hidden rounded-[24px] border bg-white shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <span className="block h-1 w-full shrink-0 transition-all duration-300" style={{ background: `linear-gradient(90deg, ${activeStageInfo.accent}59, ${activeStageInfo.tint})` }} />

        {/* Context header — grounds the box: who you're talking to, and how far along you are */}
        <div className="flex items-center justify-between gap-4 border-b border-[#F1F3F4] px-6 py-4">
          <button
            onClick={() => setOpenPanel(openPanel === 'profile' ? '' : 'profile')}
            aria-label={`View ${mockStudent.name}'s profile`}
            title={`View ${mockStudent.name}'s profile`}
            className="flex min-w-0 items-center gap-3 rounded-2xl py-1 pr-3 text-left transition-colors hover:bg-black/[0.03]">
            <GradientAvatar name={mockStudent.name} size={38} radius="0.85rem" className="shrink-0 shadow-sm ring-2 ring-white" />
            <div className="min-w-0">
              <p className="truncate text-[0.92rem] font-semibold text-[#202124]">{mockStudent.name}</p>
              <p className="truncate text-[0.74rem] text-[#9AA0A6]">Practicing for {selectedOpp.title}</p>
            </div>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-[0.68rem] font-semibold text-[#188038] sm:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34A853]" />
              </span>
              Live practice
            </span>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.74rem] font-semibold" style={{ background: activeStageInfo.tint, color: activeStageInfo.accent }}>
              <span>{currentStageIndex + 1}</span>
              <span className="opacity-40">/</span>
              <span>{NGO_INTERVIEW_STAGES.length}</span>
            </div>
          </div>
        </div>

        {/* Stage stepper — each stage carries its own icon and pastel color, matching the summary page. The tips trigger lives right next to the active stage's own label, not off in a header, so it's unmistakably about that category. */}
        <div className="flex items-start justify-center gap-0 px-6 pb-7 pt-8">
          {NGO_INTERVIEW_STAGES.map((stage, index) => {
            const isActive = activeStage === stage.id
            const isDone = askedStages.has(stage.id) && !isActive
            const StepIcon = stage.icon
            return (
              <div key={stage.id} className="flex items-start">
                {index > 0 && (
                  <div
                    className={`mt-[18px] h-[3px] w-7 shrink-0 rounded-full transition-colors sm:w-14 ${isDone ? 'bg-[#188038]/40' : 'bg-[#E8EAED]'}`}
                    style={isActive ? { background: `${stage.accent}4D` } : undefined}
                  />
                )}
                <div className="flex w-14 shrink-0 flex-col items-center gap-2 sm:w-20">
                  <button
                    onClick={() => setActiveStage(stage.id)}
                    className="group flex flex-col items-center">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[0.8rem] font-semibold transition-all duration-200 ${
                        isActive ? 'scale-110' : isDone ? 'bg-[#E6F4EA] text-[#188038]' : 'bg-[#F1F3F4] text-[#9AA0A6] group-hover:bg-[#E8EAED]'
                      }`}
                      style={isActive ? { background: stage.tint, color: stage.accent, boxShadow: `0 0 0 2px ${stage.accent}40, 0 6px 14px ${stage.accent}26` } : undefined}>
                      {isDone ? <CheckCircle2 size={16} /> : <StepIcon size={15} strokeWidth={2.15} />}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveStage(stage.id)}
                    className={`text-center text-[0.7rem] font-medium leading-tight transition-colors ${
                      isDone ? 'text-[#188038]' : isActive ? '' : 'text-[#9AA0A6]'
                    }`}
                    style={isActive ? { color: stage.accent } : undefined}>
                    {stage.label}
                  </button>
                  {isActive && (
                    <button
                      onClick={() => setAiGuidanceOpen(open => !open)}
                      aria-label={`What to get out of ${stage.label}`}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold transition-all hover:opacity-85"
                      style={aiGuidanceOpen
                        ? { background: stage.tint, color: stage.accent, boxShadow: `inset 0 0 0 1.5px ${stage.accent}66` }
                        : { background: stage.tint, color: stage.accent }}>
                      <Info size={11} />
                      Goal
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <AnimatePresence initial={false}>
          {aiGuidanceOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-[#EEF4FF] bg-[#FAFCFF]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="px-6 py-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em]" style={{ color: activeStageInfo.accent }}>
                    What to get out of {activeStageInfo.label.toLowerCase()}
                  </p>
                  <p className="mt-1 text-[0.82rem] leading-6 text-[#5F6368]">{stageGuidance}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="flex min-h-0 flex-1 flex-col">
          {/* Transcript — dialogue stage: avatar-led speech blocks instead of a single centered card */}
          <div className="relative flex-1 overflow-y-auto px-6 py-6">
            {transcript.length === 0 ? (
              <>
              <svg
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full"
                viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z" fill={activeStageInfo.tint} opacity="0.55" />
                <path d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z" fill={activeStageInfo.tint} opacity="0.85" />
              </svg>
              <div className="relative mx-auto flex h-full min-h-[180px] max-w-md flex-col items-center justify-center text-center">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(26,115,232,0.08),transparent_62%)]" />
                <div className="relative flex h-[92px] w-[92px] items-center justify-center">
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#1A73E8]/10"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#1A73E8]/10"
                    animate={{ scale: [1, 1.65, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  />
                  <button
                    onClick={handleVoiceToggle}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    title={isRecording ? 'Stop recording' : 'Start recording'}
                    className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#4C9AEF] to-[#1A5FC4] text-white shadow-[0_12px_32px_rgba(26,115,232,0.35)] transition-transform hover:scale-105 ${
                      isRecording ? 'animate-pulse ring-4 ring-[#1A73E8]/25' : ''
                    }`}>
                    {isRecording ? <StopCircle size={24} strokeWidth={1.8} /> : <Mic size={24} strokeWidth={1.8} />}
                  </button>
                </div>
                <p className="relative mt-6 text-[1.2rem] font-semibold tracking-tight text-[#202124]">Start the interview</p>
                <p className="relative mt-2 max-w-xs text-[0.88rem] leading-6 text-[#5F6368]">
                  {isRecording ? 'Listening — tap again to stop.' : 'Type or tap the mic to speak your opening question.'}
                </p>
              </div>
              </>
            ) : stageMessages.length === 0 ? (
              <>
              <svg
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full"
                viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z" fill={activeStageInfo.tint} opacity="0.55" />
                <path d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z" fill={activeStageInfo.tint} opacity="0.85" />
              </svg>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative mx-auto flex h-full min-h-[180px] max-w-md flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: activeStageInfo.tint, color: activeStageInfo.accent }}>
                    <activeStageInfo.icon size={22} strokeWidth={2.15} />
                  </span>
                  <p className="mt-5 text-[1.1rem] font-semibold tracking-tight text-[#202124]">
                    On to {activeStageInfo.label.toLowerCase()}
                  </p>
                  <p className="mt-2 max-w-sm text-[0.86rem] leading-6 text-[#5F6368]">{activeStageInfo.prompt}</p>
                  <button
                    onClick={() => setDraftQuestion(featuredQuestion)}
                    className="mt-5 max-w-sm rounded-[18px] border border-dashed bg-white/70 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:bg-white"
                    style={{ borderColor: `${activeStageInfo.accent}4D` }}>
                    <span className="text-[0.66rem] font-semibold uppercase tracking-[0.16em]" style={{ color: activeStageInfo.accent }}>Suggested question</span>
                    <span className="mt-1 block text-[0.84rem] leading-6 text-[#3C4043]">{featuredQuestion}</span>
                  </button>
                </motion.div>
              </AnimatePresence>
              </>
            ) : (
              <div className="mx-auto flex h-full min-h-[180px] max-w-2xl flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeStage}-${currentQuestionMsg?.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="space-y-4">

                    {/* Question — compact, interviewer voice, tinted by the current stage */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl" style={{ background: activeStageInfo.tint, color: activeStageInfo.accent }}>
                        <MessageCircle size={15} strokeWidth={2.15} />
                      </div>
                      <div className="min-w-0 flex-1 rounded-[20px] rounded-tl-md px-5 py-3.5" style={{ background: `${activeStageInfo.tint}80` }}>
                        <p className="mb-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em]" style={{ color: activeStageInfo.accent }}>You asked</p>
                        <p className="text-[0.9rem] leading-6 text-[#3C4043]">{currentQuestionMsg?.text}</p>
                      </div>
                    </div>

                    {/* Answer — the main event, avatar-led and elevated */}
                    <div className="flex items-start gap-3">
                      <GradientAvatar name={mockStudent.name} size={36} radius="0.7rem" className="mt-1 shrink-0 shadow-sm" />
                      <div className="min-w-0 flex-1 overflow-hidden rounded-[20px] rounded-tl-md border bg-white px-5 pb-5 pt-4 shadow-[0_10px_30px_rgba(17,24,39,0.06)]" style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
                        {currentAnswerMsg ? (
                          <>
                            <p className="mb-2 flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">
                              {mockStudent.name}
                              <span className="rounded-full bg-[#F1F3F4] px-1.5 py-[3px] text-[0.58rem] font-semibold normal-case tracking-normal text-[#9AA0A6]">Simulated</span>
                            </p>
                            <p className="text-[1.05rem] font-medium leading-8 text-[#202124]">{currentAnswerMsg.text}</p>
                          </>
                        ) : (
                          <>
                            <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">{mockStudent.name} is answering</p>
                            <div className="flex gap-1.5 py-1">
                              <span className="h-2 w-2 animate-bounce rounded-full bg-[#1A73E8]/40" style={{ animationDelay: '-0.3s' }} />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-[#1A73E8]/40" style={{ animationDelay: '-0.15s' }} />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-[#1A73E8]/40" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="bg-[#FBFCFE] px-5 py-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                {transcript.length > 0 && !isStudentResponding && (
                  <div className="inline-flex items-center gap-1.5 text-[0.76rem] font-medium text-[#188038]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34A853]" />
                    </span>
                    Your turn to talk
                  </div>
                )}
                {questionsAskedInStage > 0 && (
                  <span className="text-[0.76rem] text-[#9AA0A6]">
                    {questionsAskedInStage} question{questionsAskedInStage === 1 ? '' : 's'} asked in {activeStageInfo.label.toLowerCase()}
                  </span>
                )}
              </div>
              <button
                onClick={goToNextStage}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[0.76rem] font-semibold text-white shadow-[0_6px_16px_rgba(26,115,232,0.25)] transition-all hover:-translate-y-px ${
                  isLastStage
                    ? 'bg-[#188038] shadow-[0_6px_16px_rgba(24,128,56,0.25)] hover:shadow-[0_8px_20px_rgba(24,128,56,0.3)]'
                    : 'bg-[#1A73E8] hover:shadow-[0_8px_20px_rgba(26,115,232,0.3)]'
                }`}>
                {isLastStage ? 'Finish practice' : `Ready for ${nextStage.label}?`}
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Unified composer — mic and suggest live inside the input, not as separate pills */}
            <div className={`flex items-end gap-1 rounded-[24px] bg-white p-2 pl-2.5 shadow-[0_2px_10px_rgba(17,24,39,0.05)] ring-1 transition-all ${
              isStudentResponding ? 'ring-[#EEF1F6] opacity-60' : 'ring-[#EEF1F6] focus-within:shadow-[0_6px_20px_rgba(26,115,232,0.12)] focus-within:ring-[#1A73E8]/40'
            }`}>
              <button
                onClick={handleVoiceToggle}
                disabled={isStudentResponding}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                title={isRecording ? 'Stop recording' : 'Start recording'}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isRecording ? 'bg-[#E6F4EA] text-[#188038]' : 'text-[#9AA0A6] hover:bg-[#F1F3F4] hover:text-[#5F6368]'
                }`}>
                {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={suggestQuestion}
                disabled={isStudentResponding}
                aria-label="Suggest a question"
                title="Suggest a question"
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 text-[0.78rem] font-semibold text-[#1A73E8] transition-colors hover:bg-[#D8E7FE] disabled:opacity-50">
                <Lightbulb size={15} />
                <span className="hidden sm:inline">Suggest</span>
              </button>
              <textarea
                value={draftQuestion}
                onChange={e => setDraftQuestion(e.target.value)}
                rows={1}
                disabled={isStudentResponding}
                placeholder={
                  isStudentResponding
                    ? `${mockStudent.name} is answering...`
                    : isRecording
                    ? 'Listening...'
                    : 'Ask the next interview question...'
                }
                className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-[0.88rem] leading-6 text-[#202124] outline-none placeholder:text-[#9AA0A6] disabled:opacity-60"
              />
              <button
                onClick={sendQuestion}
                disabled={!draftQuestion.trim() || isStudentResponding}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A73E8] text-white shadow-[0_4px_12px_rgba(26,115,232,0.3)] transition-all hover:scale-105 hover:bg-[#1765CC] disabled:scale-100 disabled:bg-[#DADCE0] disabled:text-white disabled:shadow-none"
                aria-label="Send question">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside
        className="relative flex h-[calc(100vh-72px)] flex-col overflow-hidden rounded-[24px] border bg-white shadow-[0_1px_0_rgba(17,24,39,0.02),0_8px_24px_rgba(17,24,39,0.04)] xl:sticky xl:top-6"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <span className="block h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #A142F459, #F3E8FD)' }} />
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full"
          viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,55 C60,80 90,25 150,45 C210,65 240,30 300,50 L300,100 L0,100 Z" fill="#F3E8FD" opacity="0.55" />
          <path d="M0,70 C70,50 110,85 170,65 C220,48 260,78 300,68 L300,100 L0,100 Z" fill="#F3E8FD" opacity="0.85" />
        </svg>
        <div className="flex shrink-0 items-center gap-3 border-b border-[#F1F3F4] px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#F3E8FD] text-[#A142F4]">
            <Layers size={16} strokeWidth={2.15} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Reference</p>
            <p className="text-[0.95rem] font-semibold text-[#202124]">Context</p>
          </div>
        </div>
        <div className="relative z-10 min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
          {panels.map(panel => {
            const Icon = panel.icon
            const isOpen = openPanel === panel.id
            return (
              <div
                key={panel.id}
                className={`rounded-[20px] border transition-colors ${
                  isOpen ? 'border-[#D7E6FF] bg-[#FBFCFE]' : 'border-[#E5EEFB] bg-white'
                }`}>
                <button
                  onClick={() => setOpenPanel(isOpen ? '' : panel.id)}
                  className={`sticky top-0 z-10 flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[#FBFCFE] ${
                    isOpen ? 'rounded-t-[20px] bg-[#FBFCFE]' : 'rounded-[20px] bg-white'
                  }`}>
                  <span className="flex items-center gap-2.5 text-[0.84rem] font-semibold text-[#202124]">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isOpen ? 'bg-[#1A73E8] text-white' : 'bg-[#E8F0FE] text-[#1A73E8]'
                    }`}>
                      <Icon size={14} />
                    </span>
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
                      className="overflow-hidden rounded-b-[20px] border-t border-[#E5EEFB]">
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
  const [hasContent, setHasContent] = useState(false)
  const inPractice = isNGO && practiceInfo.active
  const mainRef = useRef(null)

  useEffect(() => {
    if (!practiceInfo.active) {
      smoothScrollToTop(mainRef.current)
    }
  }, [practiceInfo.active])

  const showHeroIllustration = hasContent && !inPractice

  return (
    <main ref={mainRef} className="relative flex-1 overflow-y-auto bg-[#F5F7FB]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_12%_0%,rgba(26,115,232,0.07),transparent_45%),radial-gradient(circle_at_88%_0%,rgba(52,168,83,0.05),transparent_42%),radial-gradient(circle_at_50%_10%,rgba(161,66,244,0.03),transparent_38%)]" />
      <div className="relative mx-auto max-w-[1520px] px-6 pb-8 pt-10 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mb-8 ${showHeroIllustration ? 'flex items-start justify-between gap-6' : ''}`}
        >
          <div>
            {inPractice && (
              <button
                onClick={() => practiceInfo.onBack?.()}
                className="mb-3 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-[#5F6368] transition-colors hover:text-[#1A73E8]">
                <ArrowLeft size={14} />
                Interview guide
              </button>
            )}
            <h1 className="text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]">
              {inPractice ? `Interview practice: ${practiceInfo.title}` : 'Interviews'}
            </h1>
            <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
              {inPractice
                ? 'A mock interview with a generated student profile.'
                : isNGO
                ? 'Pick a posted role and practice with a generated student profile'
                : 'Practice mock interviews for the roles you applied to, with help from Hive as you answer.'}
            </p>
          </div>
          {showHeroIllustration && (
            <img src={interviewIllustration} alt="" aria-hidden="true" className="hidden lg:block w-[190px] shrink-0 opacity-90 select-none pointer-events-none self-start" />
          )}
        </motion.header>
        {isNGO
          ? <NGOView onPracticeChange={setPracticeInfo} onHasContent={setHasContent} />
          : <StudentView onHasContent={setHasContent} />
        }
      </div>
    </main>
  )
}
