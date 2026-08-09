import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Sparkles, AlertCircle, Lightbulb, Briefcase, ArrowRight,
  ArrowLeft, ChevronDown, ChevronUp, Send, UserRound,
  Languages, Mic, PlayCircle, StopCircle, Bookmark,
  FileText, CheckCircle2, Target, MessageCircle, Info, Layers, Volume2,
  X, Trash2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'
import { fetchStudentApplications, deleteApplication } from '../services/applications'
import { fetchNgoOpportunities, fetchOpportunity } from '../services/opportunities'
import { fetchSavedOpportunities } from '../services/saved'
import { withTimeout } from '../utils/withTimeout'
import { askHiveAI, createHiveSpeech } from '../services/openai'
import ngoInterviewImg from '../assets/ngo interview.PNG'

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

// A skill can arrive as a plain string ("Research"), a real object
// ({ name, level, category }), or — since the skills column stores each one
// as a JSON string — a string that's actually a JSON-encoded object
// ('{"name":"Research","level":"Intermediate","category":"Other"}'). That
// last case used to render as raw JSON text; this unwraps it to just the
// name either way.
function skillDisplayName(skill) {
  if (typeof skill !== 'string') return skill?.name ?? ''
  const trimmed = skill.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed?.name) return parsed.name
    } catch {
      // Not actually JSON — fall through and use the raw string as-is.
    }
  }
  return skill
}

function getSkillNames(skills = []) {
  return skills.map(skillDisplayName).filter(Boolean)
}

function parseAiJson(text, fallback = null) {
  try {
    return JSON.parse(text)
  } catch {
    try {
      return JSON.parse(String(text || '').match(/\{[\s\S]*\}/)?.[0] || '')
    } catch {
      return fallback
    }
  }
}

function roleAiContext(role = {}) {
  return {
    title: role.title || '',
    orgName: role.orgName || '',
    category: role.category || '',
    field: role.field || '',
    description: role.description || '',
    missionImpact: role.missionImpact || '',
    skills: getSkillNames(role.skills || []),
    languages: role.languages || [],
    weeklyHours: role.weeklyHours || '',
    duration: role.duration || '',
    workMode: role.workMode || '',
    location: role.location || '',
  }
}

function compactTranscript(transcript = []) {
  return transcript.slice(-10).map(message => ({
    from: message.from,
    stage: message.stage || message.category || '',
    text: message.text || '',
  }))
}

function latestTranscriptMessage(transcript = [], from, stageId = null) {
  return [...transcript]
    .reverse()
    .find(message => message.from === from && (!stageId || message.stage === stageId || message.category === stageId))
}

function cleanStudentMention(value = '') {
  const cleaned = String(value)
    .replace(/[.!?].*$/, '')
    .replace(/\b(?:and|but|because|where|which|that|so|then|for|to|with|when)\b.*$/i, '')
    .replace(/^(?:about|around|regarding|related to|focused on|based on|for|on|in)\s+/i, '')
    .replace(/\b(?:a|an|the|my|our|project|app|website|platform|initiative|campaign|course)\b/gi, ' ')
    .replace(/^(?:about|around|regarding|related to|focused on|based on|for|on|in)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length < 3) return ''
  return cleaned
    .split(' ')
    .slice(0, 5)
    .map(word => /^[A-Z0-9]{2,}$/.test(word) ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function extractStudentAnswerMention(answer = '') {
  const cleanAnswer = String(answer || '').trim().replace(/\s+/g, ' ')
  if (!cleanAnswer) return ''

  const quotedName = cleanAnswer.match(/["']([^"']{2,60})["']/)?.[1]
  if (quotedName) return cleanStudentMention(quotedName)

  const patterns = [
    /\b(?:called|named|titled)\s+([^,.!?]{2,60})/i,
    /\b(?:project|app|website|platform|initiative|campaign|course)\s+(?:called|named|titled)\s+([^,.!?]{2,60})/i,
    /\b(?:my|our)\s+(?:project|app|website|platform|initiative|campaign|course)\s+(?:was|is)\s+([^,.!?]{2,60})/i,
    /\b(?:built|created|made|developed|designed|launched|worked on)\s+(?:(?:a|an|the|my|our)\s+)?(?:(?:project|app|website|platform|initiative|campaign|course)\s+)?(?:(?:called|named|titled)\s+)?([^,.!?]{2,60})/i,
  ]

  for (const pattern of patterns) {
    const mention = cleanStudentMention(cleanAnswer.match(pattern)?.[1] || '')
    if (mention) return mention
  }

  return ''
}

function analyzeStudentPracticeAnswer(answer = '') {
  const cleanAnswer = String(answer || '').trim().replace(/\s+/g, ' ')
  const lower = cleanAnswer.toLowerCase()
  const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length

  const saysNoExample =
    /\b(?:no|not really|don't|do not|dont|haven't|have not|never)\b.{0,45}\b(?:example|experience|project|done|did)\b/i.test(cleanAnswer) ||
    /\b(?:not really|no example|don't have an example|dont have an example|i have no example)\b/i.test(cleanAnswer)

  const unsure =
    /\b(?:i don't know|i dont know|idk|not sure|no idea|can't think|cant think|lowkey|loki|i'm unsure|im unsure)\b/i.test(lower)

  const hesitant = saysNoExample || unsure || wordCount <= 5

  return {
    saysNoExample,
    unsure,
    hesitant,
    extractedMention: extractStudentAnswerMention(cleanAnswer),
    wordCount,
  }
}

async function askAiJson(messages, fallback) {
  const result = await askHiveAI({ messages, maxOutputTokens: 900 })
  return parseAiJson(result?.text, fallback) || fallback
}

async function generateStudentGuideAi(role, profile, user) {
  return askAiJson([
    { role: 'system', content: 'Generate concise interview prep content for Hive. Return only JSON.' },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'student-interview-guide',
        role: roleAiContext(role),
        student: {
          name: getStudentFirstName(profile, user),
          field: profile?.field || '',
          skills: getStudentProfileSkills(profile),
          projects: profile?.projects || '',
          experience: profile?.experience || '',
        },
        requiredShape: {
          summary: 'string',
          whatToKnow: [{ id: 'opening|skills|mission|scenario|close', purpose: 'string', simpler: 'string', tips: ['string'] }],
          questions: { opening: ['string'], skills: ['string'], mission: ['string'], scenario: ['string'], close: ['string'] },
        },
      }),
    },
  ], null)
}

async function generateNgoGuideAi(role, student) {
  return askAiJson([
    { role: 'system', content: 'Generate concise NGO interviewer prep content for Hive. Return only JSON.' },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'ngo-interview-guide',
        role: roleAiContext(role),
        student,
        requiredShape: {
          summary: 'string',
          whatToKnow: [{ title: 'string', text: 'string', items: ['string'] }],
          questions: { opening: ['string'], skills: ['string'], impact: ['string'], scenario: ['string'], close: ['string'] },
        },
      }),
    },
  ], null)
}

async function generateStudentPracticeQuestionAi({
  role,
  profile,
  user,
  categoryId,
  transcript,
  fallback,
  latestStudentAnswer = '',
  previousQuestion = '',
  previousCategoryId = '',
  categoryCoverage = null,
}) {
  const lastStudentMessage = latestTranscriptMessage(transcript, 'student')
  const lastAiInPreviousCategory = previousCategoryId ? latestTranscriptMessage(transcript, 'ai', previousCategoryId) : null
  const lastAiMessage = latestTranscriptMessage(transcript, 'ai')
  const answerToUse = latestStudentAnswer || lastStudentMessage?.text || ''
  const questionToUse = previousQuestion || lastAiInPreviousCategory?.text || lastAiMessage?.text || ''
  const answerAnalysis = analyzeStudentPracticeAnswer(answerToUse)
  const answerMention = answerAnalysis.extractedMention
  const result = await askHiveAI({
    messages: [
      {
        role: 'system',
        content: [
          'You are a warm, natural NGO interviewer helping a student practice.',
          'Return exactly one interview question only, with no labels.',
          'Always keep the role and job description in mind. The question should feel like it could be asked by this NGO for this exact role, not a generic interview.',
          'Connect follow-ups to at least one relevant role detail when possible: responsibilities, required skills, mission impact, work mode, hours, or support needs.',
          'The student answer is more important than the current interview category.',
          'If the student has just answered, the next question must clearly build on one concrete detail from that answer, even if the detail belongs to a different category.',
          'If the student names a project, organization, tool, course, or initiative, use that exact name in the follow-up instead of vague phrases like "that project".',
          'If the detail is phrased like "about green energy", clean it to "Green Energy"; do not say "About Green Energy".',
          'Avoid repetitive phrases like "You mentioned..."; ask naturally, like "For Green Energy, what was your role?"',
          'If the student says they do not know, do not have an example, or are unsure, do not ask for the same example again. Reframe gently with a smaller question, a hypothetical, or an easy starting point.',
          'For example, if they mention a project, tool, challenge, result, teammate, mistake, or decision, ask a follow-up about that specific thing.',
          'Do not force the category checklist and do not ask a generic scripted question when a student answer is available.',
          'Keep it concise, human, role-specific, and useful for interview practice.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({
          role: roleAiContext(role),
          student: {
            name: getStudentFirstName(profile, user),
            field: profile?.field || '',
            skills: getStudentProfileSkills(profile),
            projects: profile?.projects || '',
            experience: profile?.experience || '',
          },
          jobDescriptionContext: {
            title: role?.title || '',
            organization: role?.orgName || '',
            description: role?.description || '',
            missionImpact: role?.missionImpact || '',
            responsibilities: role?.responsibilities || '',
            requiredSkills: getSkillNames(role?.skills || []),
            workMode: role?.workMode || '',
            weeklyHours: role?.weeklyHours || '',
          },
          currentCategory: categoryId,
          previousCategory: previousCategoryId || categoryId,
          previousQuestion: questionToUse,
          latestStudentAnswer: answerToUse,
          extractedStudentMention: answerMention,
          answerAnalysis,
          categoryCoverage,
          transcript: compactTranscript(transcript),
          priority: answerToUse
            ? 'Follow the latestStudentAnswer first. If extractedStudentMention is present, use that exact phrase in the next question, but phrase the sentence naturally. Use currentCategory only as light context after the answer has been acknowledged.'
            : 'Use currentCategory to choose the first question.',
          instruction: answerToUse
            ? 'Ask the next question as a direct, natural follow-up to the latest student answer. Tie the question back to the jobDescriptionContext wherever natural. If categoryCoverage is incomplete, ask for the missing information in a natural way while still responding to the answer. If answerAnalysis says the student is unsure or has no example, respond supportively and ask an easier alternative, not another demand for an example. If extractedStudentMention is present, name it directly in the question without adding filler words before it. If moving to a new category, bridge from that answer first, then ask one question.'
            : 'Ask a specific first question for this category. Keep it concise and specific to the jobDescriptionContext.',
        }),
      },
    ],
    maxOutputTokens: 220,
  })
  return result?.text?.trim() || fallback
}

async function assessStudentCategoryCoverageAi({
  role,
  profile,
  user,
  categoryId,
  transcript,
  latestStudentAnswer,
  fallback,
}) {
  return askAiJson([
    {
      role: 'system',
      content: [
        'You evaluate a student practice interview section for Hive.',
        'Return only JSON.',
        'Mark complete true only when the student has provided enough useful information for the current section.',
        'Do not mark complete just because two or three questions were asked.',
        'If the student says they do not know, lacks an example, gives a very vague answer, or avoids the question, complete must be false.',
      ].join(' '),
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'student-category-coverage',
        currentCategory: categoryId,
        categoryGoal: getStudentCategoryCoverageGoal(categoryId),
        role: roleAiContext(role),
        jobDescriptionContext: {
          title: role?.title || '',
          organization: role?.orgName || '',
          description: role?.description || '',
          missionImpact: role?.missionImpact || '',
          responsibilities: role?.responsibilities || '',
          requiredSkills: getSkillNames(role?.skills || []),
          workMode: role?.workMode || '',
          weeklyHours: role?.weeklyHours || '',
        },
        student: {
          name: getStudentFirstName(profile, user),
          field: profile?.field || '',
          skills: getStudentProfileSkills(profile),
          projects: profile?.projects || '',
          experience: profile?.experience || '',
        },
        latestStudentAnswer,
        answerAnalysis: analyzeStudentPracticeAnswer(latestStudentAnswer),
        transcript: compactTranscript(transcript),
        requiredShape: {
          complete: 'boolean',
          reason: 'short reason based on the transcript',
          missing: 'what still needs to be asked if incomplete',
        },
      }),
    },
  ], fallback)
}

async function generateStudentNextTurnAi({
  role,
  profile,
  user,
  currentCategory,
  transcript,
  latestStudentAnswer,
  previousQuestion,
  fallback,
}) {
  const nextCategoryIfComplete = getNextStudentCategory(currentCategory)
  const answerAnalysis = analyzeStudentPracticeAnswer(latestStudentAnswer)
  const result = await askHiveAI({
    messages: [
      {
        role: 'system',
        content: [
          'You are a warm, natural NGO interviewer for Hive student interview practice.',
          'Return only valid JSON.',
          'Decide whether the current category has enough useful student information, then write the next interview question.',
          'Do not complete a category just because a certain number of questions were asked.',
          'If the answer is vague, unsure, off-topic, or says there is no example, keep the same category and ask a smaller, supportive follow-up.',
          'If the category is incomplete, nextCategory must stay as currentCategory.',
          'If the category is complete, nextCategory should be nextCategoryIfComplete.',
          'Always keep the exact role, NGO, and job description in mind.',
          'The next question must respond to the student answer first, then connect naturally to the role or category.',
          'If the student names a project, organization, tool, course, or initiative, use the clean exact name directly.',
          'Avoid clunky phrasing like "You said" or quoting the full answer back.',
          'Keep the question concise, human, and realistic.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({
          task: 'student-next-interview-turn',
          currentCategory,
          nextCategoryIfComplete,
          categoryGoal: getStudentCategoryCoverageGoal(currentCategory),
          role: roleAiContext(role),
          student: {
            name: getStudentFirstName(profile, user),
            field: profile?.field || '',
            skills: getStudentProfileSkills(profile),
            projects: profile?.projects || '',
            experience: profile?.experience || '',
          },
          jobDescriptionContext: {
            title: role?.title || '',
            organization: role?.orgName || '',
            description: role?.description || '',
            missionImpact: role?.missionImpact || '',
            responsibilities: role?.responsibilities || '',
            requiredSkills: getSkillNames(role?.skills || []),
            workMode: role?.workMode || '',
            weeklyHours: role?.weeklyHours || '',
          },
          previousQuestion,
          latestStudentAnswer,
          extractedStudentMention: answerAnalysis.extractedMention,
          answerAnalysis,
          transcript: compactTranscript(transcript),
          requiredShape: {
            categoryComplete: 'boolean',
            nextCategory: 'opening|skills|mission|scenario|close',
            reason: 'short reason',
            missing: 'what still needs to be learned if incomplete',
            question: 'one concise next interview question',
          },
        }),
      },
    ],
    maxOutputTokens: 360,
  })

  const parsed = parseAiJson(result?.text, fallback) || fallback
  const categoryComplete = Boolean(parsed?.categoryComplete ?? parsed?.complete)
  const nextCategory = categoryComplete ? nextCategoryIfComplete : currentCategory
  return {
    categoryComplete,
    nextCategory,
    reason: parsed?.reason || fallback.reason,
    missing: parsed?.missing || fallback.missing,
    question: String(parsed?.question || fallback.question || '').trim(),
  }
}

async function generateNgoStudentReplyAi({ role, student, stageId, transcript, interviewerQuestion, fallback }) {
  const result = await askHiveAI({
    messages: [
      {
        role: 'system',
        content: [
          'Simulate a realistic student candidate in an NGO interview.',
          'Return only the student answer. No labels, markdown, or setup.',
          'Answer the exact NGO question directly using the student profile, role, stage, and recent transcript.',
          'Sound natural, specific, and believable, not scripted.',
          'Keep it short: 1 to 2 sentences.',
        ].join(' '),
      },
      {
        role: 'user',
        content: JSON.stringify({
          role: {
            title: role?.title || '',
            orgName: role?.orgName || '',
            description: role?.description || '',
            skills: getSkillNames(role?.skills || []).slice(0, 4),
            languages: role?.languages || [],
          },
          student: {
            name: student?.name || '',
            headline: student?.headline || '',
            skills: (student?.skills || []).slice(0, 4),
            projects: (student?.projects || []).slice(0, 2),
            about: student?.about || '',
          },
          currentStage: stageId,
          interviewerQuestion,
          transcript: compactTranscript(transcript).slice(-4),
          instruction: 'Generate the next student answer now. Be brief, responsive, and connected to this specific role.',
        }),
      },
    ],
    maxOutputTokens: 95,
  })
  return result?.text?.trim() || fallback
}

async function generateStepCoachAi({ role, userType, stageId, question, transcript, fallback }) {
  return askAiJson([
    {
      role: 'system',
      content: [
        'Generate concise, student-friendly interview coaching for an existing Hive explain panel.',
        'Return only JSON.',
        'Make the coaching specific to the exact question, current role, current category, and recent transcript.',
        'Use simple language, like a helpful ChatGPT interview coach.',
        'Keep each text field short and practical.',
      ].join(' '),
    },
    {
      role: 'user',
      content: JSON.stringify({
        role: roleAiContext(role),
        userType,
        currentStage: stageId,
        categoryGoal: getStudentCategoryCoverageGoal(stageId),
        question,
        transcript: compactTranscript(transcript),
        requiredShape: {
          categorySummary: '1 short sentence explaining what this category is trying to get from the student',
          simpleQuestion: 'explain the exact question in simple words',
          whyNgoAsks: 'why the NGO is asking this exact question',
          tips: ['short tip on how to answer', 'short tip on what detail to include', 'short tip on tone or structure'],
          exampleAnswer: 'short realistic example answer from the student perspective, tailored to the role and question',
          purpose: 'same as whyNgoAsks for backward compatibility',
          simpler: 'same as simpleQuestion for backward compatibility',
        },
      }),
    },
  ], fallback)
}

async function generateInterviewSummaryAi({ role, userType, transcript, sections }) {
  return askAiJson([
    { role: 'system', content: 'Generate concise interview summary feedback for existing Hive summary cards. Return only JSON.' },
    {
      role: 'user',
      content: JSON.stringify({
        role: roleAiContext(role),
        userType,
        transcript: compactTranscript(transcript),
        sections,
        requiredShape: {
          sections: {
            sectionId: {
              whatHappened: 'specific text based on transcript',
              wentWell: 'specific encouraging text',
              couldImprove: 'specific practical text',
              tips: ['short practical next advice'],
            },
          },
        },
      }),
    },
  ], null)
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

// Builds a dbToOpp-shaped (camelCase) opportunity object out of the snapshot
// saved on this application at apply/accept time — used when the live
// opportunity can't be read (it's no longer 'active', so RLS hides it from
// this student's fetch), so prep details still show the real role instead
// of the generic placeholder copy below.
function oppFromRoleSnapshot(snapshot) {
  if (!snapshot?.title) return null
  return {
    title:         snapshot.title,
    category:      snapshot.category ?? '',
    field:         snapshot.field ?? '',
    location:      snapshot.location ?? '',
    description:   snapshot.description ?? '',
    missionImpact: snapshot.mission_impact ?? '',
    skills:        snapshot.skills ?? [],
    languages:     snapshot.languages ?? [],
    workMode:      snapshot.work_mode ?? '',
    weeklyHours:   snapshot.weekly_hours ?? '',
    duration:      snapshot.duration ?? '',
    orgName:       snapshot.org_name ?? '',
  }
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

function buildSavedStudentRole(saved) {
  return {
    id: saved?.opportunityId || saved?.id,
    opportunityId: saved?.opportunityId,
    title: saved?.title || 'Position',
    orgName: saved?.orgName || 'Organization',
    category: saved?.category || 'Opportunity',
    field: saved?.field || saved?.category || 'community impact',
    description: saved?.description || saved?.missionImpact || 'This saved role is connected to meaningful NGO work and gives you a chance to show your strengths.',
    missionImpact: saved?.missionImpact || '',
    skills: getSkillNames(saved?.skills || []),
    languages: saved?.languages || [],
    weeklyHours: saved?.weeklyHours || '',
    duration: saved?.duration || '',
    location: saved?.location || '',
    workMode: saved?.workMode || '',
    status: 'saved',
  }
}

function getNextStudentCategory(categoryId) {
  const index = STUDENT_INTERVIEW_CATEGORIES.findIndex(category => category.id === categoryId)
  const next = STUDENT_INTERVIEW_CATEGORIES[Math.min(index + 1, STUDENT_INTERVIEW_CATEGORIES.length - 1)]
  return next?.id || 'opening'
}

function getStudentCategoryCoverageGoal(categoryId) {
  const goals = {
    opening: 'The NGO wants to understand who you are, why this role interests you, and what kind of student they are meeting.',
    skills: 'The NGO wants to understand what you can already do, how you have used your skills, and where you may need support.',
    mission: 'The NGO wants to understand whether you care about the mission and how you think about the people the work supports.',
    scenario: 'The NGO wants to understand how you think, communicate, and make decisions when the work is unclear.',
    close: 'The NGO wants to understand your expectations, support needs, availability, and final questions.',
  }

  return goals[categoryId] || goals.opening
}

function assessStudentCategoryCoverageLocal({ categoryId, transcript = [], latestStudentAnswer = '' }) {
  const answerAnalysis = analyzeStudentPracticeAnswer(latestStudentAnswer)
  if (answerAnalysis.saysNoExample || answerAnalysis.unsure) {
    return {
      complete: false,
      reason: 'The student is unsure or does not have an example yet.',
      missing: 'Ask an easier, smaller question before moving on.',
    }
  }

  const categoryAnswers = transcript
    .filter(message => message.from === 'student' && message.category === categoryId)
    .map(message => String(message.text || '').trim())
    .filter(Boolean)

  const combined = categoryAnswers.join(' ').toLowerCase()
  const meaningfulAnswers = categoryAnswers.filter(answer => {
    const analysis = analyzeStudentPracticeAnswer(answer)
    return !analysis.hesitant && answer.split(/\s+/).filter(Boolean).length >= 8
  })

  const enoughDepth = meaningfulAnswers.length >= 1 && combined.split(/\s+/).filter(Boolean).length >= 14
  const hasSkillDetail = /\b(skill|used|built|created|made|worked|project|tool|designed|developed|organized|managed|wrote|researched|helped|learned)\b/i.test(combined)
  const hasMissionDetail = /\b(mission|impact|community|people|help|serve|ngo|goal|meaningful|care|support|change|learn)\b/i.test(combined)
  const hasScenarioDetail = /\b(would|first|then|ask|clarify|communicate|plan|handle|approach|team|deadline|feedback|problem)\b/i.test(combined)
  const hasCloseDetail = /\b(support|available|availability|question|learn|expect|need|schedule|remember|goal)\b/i.test(combined)

  const completeByCategory = {
    opening: enoughDepth,
    skills: enoughDepth && hasSkillDetail,
    mission: enoughDepth && hasMissionDetail,
    scenario: enoughDepth && hasScenarioDetail,
    close: enoughDepth && hasCloseDetail,
  }

  const complete = Boolean(completeByCategory[categoryId])
  return {
    complete,
    reason: complete ? 'The current section has enough useful information.' : 'The current section still needs more useful detail.',
    missing: complete ? '' : getStudentCategoryCoverageGoal(categoryId),
  }
}

function getStudentFirstName(profile, user) {
  const rawName =
    profile?.name ||
    profile?.fullName ||
    profile?.full_name ||
    profile?.displayName ||
    profile?.display_name ||
    user?.name ||
    user?.fullName ||
    user?.full_name ||
    user?.email?.split('@')[0] ||
    ''
  const firstName = String(rawName).trim().split(/\s+/)[0]
  return firstName || 'there'
}

function makeStudentInterviewQuestion(role, profile, categoryId, seed = 0, user = null) {
  const firstName = getStudentFirstName(profile, user)
  const profileSkills = getStudentProfileSkills(profile)
  const roleSkill = role.skills[seed % Math.max(role.skills.length, 1)] || profileSkills[0] || 'one of your strengths'
  const field = profile?.field || role.field || role.category || 'your field'

  const questions = {
    opening: [
      `Hi ${firstName}, thanks for joining. To start, can you tell me a little about yourself and what drew you to the ${role.title} role at ${role.orgName}?`,
      `Welcome, ${firstName}. Give me the short version of who you are, what you study, and why this opportunity caught your eye.`,
      `${firstName}, what is one thing from your background that would help you contribute to ${role.title}?`,
    ],
    motivation: [
      `${firstName}, why does ${role.orgName}'s work feel meaningful to you, and how does this role connect to what you want to learn?`,
      `When you applied for ${role.title}, what part of the mission or role made you think, "I want to help with this"?`,
      `What would make this opportunity feel successful for you personally?`,
    ],
    skills: [
      `Can you walk me through a specific example where you used ${roleSkill}, and what your personal contribution was?`,
      `${firstName}, this role may need ${roleSkill}. What would you feel confident doing right away, and where would you ask for support?`,
      `If the team asked you to use ${roleSkill} next week, how would you approach the task?`,
    ],
    mission: [
      `How would you make sure your work in ${role.title} is useful for the people ${role.orgName} serves?`,
      `${firstName}, tell me about a time you had to understand someone else's needs before building or suggesting a solution.`,
      `How would you check that your work is helping the NGO's actual goals?`,
    ],
    scenario: [
      `${firstName}, imagine you are given an unclear task in this role and the deadline is close. What would you do first?`,
      `If you got stuck while working on ${role.title}, how would you communicate that to the NGO team?`,
      `If feedback changed the direction of your work, how would you respond and adjust?`,
    ],
    close: [
      `What support would help you do your best work in this role, and what questions would you ask the team before starting?`,
      `Before we finish, ${firstName}, what should I remember about you as a ${field} student applying for ${role.title}?`,
      `Is there anything about your availability, goals, or learning needs that you would want the team to know?`,
    ],
  }

  const categoryQuestions = questions[categoryId] || questions.opening
  return categoryQuestions[seed % categoryQuestions.length]
}

function makeStudentAnswerFollowUp(answer, role) {
  const cleanAnswer = String(answer || '').trim().replace(/\s+/g, ' ')
  if (!cleanAnswer) return ''

  const roleTitle = role?.title || 'this role'
  const answerAnalysis = analyzeStudentPracticeAnswer(cleanAnswer)
  const projectName = answerAnalysis.extractedMention
  const projectWords = /\b(project|built|created|made|developed|designed|launched|worked on)\b/i
  const challengeWords = /\b(challenge|problem|difficult|hard|struggle|blocked|mistake|failed)\b/i
  const teamWords = /\b(team|teammate|group|partner|collaborat|worked with)\b/i
  const impactWords = /\b(result|impact|helped|improved|changed|outcome|learned)\b/i

  if (answerAnalysis.saysNoExample || answerAnalysis.unsure) {
    return `That's okay. Let's make it easier: if you had to start ${roleTitle} next week, what is one small task you think you could try first?`
  }

  if (projectWords.test(cleanAnswer)) {
    const projectLabel = projectName ? `${projectName}` : 'that project'
    return projectName
      ? `For ${projectLabel}, what was your specific role, and how would that experience help you in ${roleTitle}?`
      : `What was your specific part in creating that project, and how would that experience help you in ${roleTitle}?`
  }
  if (challengeWords.test(cleanAnswer)) {
    return `You mentioned that there was a challenge. What did you do in that moment, and what did you learn from it?`
  }
  if (teamWords.test(cleanAnswer)) {
    return `You brought up working with others. What role did you play in the team, and how did you handle communication?`
  }
  if (impactWords.test(cleanAnswer)) {
    return `You mentioned the result of your work. How did you know it was successful, and what would you do differently next time?`
  }

  if (answerAnalysis.hesitant) {
    return `No worries. What is one part of ${roleTitle} that feels easiest for you to talk about: your skills, your interest in the NGO, or how you would approach the work?`
  }

  return `What part of that answer would you want the NGO to understand more clearly, and why does it matter for ${roleTitle}?`
}

function explainStudentQuestion(question, role, profile, categoryId) {
  const profileSkills = getStudentProfileSkills(profile)
  const strongestSkill = role.skills[0] || profileSkills[0] || 'your strongest relevant skill'
  const explainers = {
    opening: {
      purpose: 'They want to see how clearly you introduce yourself and whether the role feels intentional, not random.',
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
    categorySummary: getStudentCategoryCoverageGoal(categoryId),
    simpleQuestion: explainers[categoryId]?.simpler || explainers.opening.simpler,
    whyNgoAsks: explainers[categoryId]?.purpose || explainers.opening.purpose,
    ...(explainers[categoryId] || explainers.opening),
    exampleAnswer: makeStudentExampleAnswer(role, profile, categoryId),
  }
}

function makeStudentExampleAnswer(role, profile, categoryId, user = null) {
  const firstName = getStudentFirstName(profile, user)
  const field = profile?.field || role?.field || role?.category || 'my field'
  const skill = role?.skills?.[0] || getStudentProfileSkills(profile)[0] || 'communication'
  const orgName = role?.orgName || 'your organization'
  const title = role?.title || 'this role'

  const examples = {
    opening: `I'm ${firstName === 'I' ? 'a student' : firstName}, and I study ${field}. I was drawn to ${title} because it connects to the kind of practical impact I want to build. I think my ${skill} experience could help me contribute, and I am also excited to learn how ${orgName} works with the community.`,
    skills: `One example is a project where I used ${skill} to move work forward. My role was to understand the goal, handle my part clearly, and ask for feedback when I needed it. I would feel confident applying that here, while being honest about where I may need guidance from the team.`,
    mission: `For me, meaningful impact means the work is useful to the people being served, not just completed as a task. In this role, I would first try to understand ${orgName}'s goals and the community context, then make sure my work supports those needs in a respectful way.`,
    scenario: `If I received an unclear task, I would first clarify the expected outcome and deadline. Then I would break the work into steps, check what information I already have, and communicate early if I am blocked so the team is not surprised later.`,
    close: `The support that would help me most is clear expectations for the first few weeks and feedback on my work. I would also ask what success looks like in this role and how students usually collaborate with the team.`,
  }

  return examples[categoryId] || examples.opening
}

function pickQuestionVoice(voices = []) {
  const englishVoices = voices.filter(voice => /^en[-_]/i.test(voice.lang || ''))
  const candidates = englishVoices.length ? englishVoices : voices
  const preferredNames = [
    'microsoft ava online',
    'microsoft emma online',
    'microsoft aria online',
    'microsoft jenny online',
    'microsoft serena online',
    'microsoft sonia online',
    'google uk english female',
    'google us english',
    'samantha enhanced',
    'samantha',
    'ava enhanced',
    'ava',
    'allison',
    'nicky',
    'susan',
    'victoria',
    'karen',
    'moira',
    'tessa',
    'jenny',
    'aria',
    'sonia',
    'zoe',
    'microsoft zira',
  ]
  const avoidNames = ['alex', 'daniel', 'fred', 'ralph', 'compact', 'legacy']

  return candidates
    .map(voice => {
      const name = voice.name.toLowerCase()
      const preferredIndex = preferredNames.findIndex(preferred => name.includes(preferred))
      const preferredBonus = preferredIndex >= 0 ? 80 - preferredIndex : 0
      const naturalBonus = /(premium|natural|enhanced|neural|online)/i.test(voice.name) ? 30 : 0
      const femaleNameBonus = /(samantha|ava|emma|aria|jenny|serena|sonia|allison|nicky|victoria|karen|moira|tessa|zoe|susan|zira)/i.test(voice.name) ? 14 : 0
      const localBonus = voice.localService ? 8 : 10
      const englishBonus = /^en[-_](us|gb|au|ca)/i.test(voice.lang || '') ? 8 : 0
      const avoidPenalty = avoidNames.some(avoid => name.includes(avoid)) ? -40 : 0

      return { voice, score: preferredBonus + naturalBonus + femaleNameBonus + localBonus + englishBonus + avoidPenalty }
    })
    .sort((a, b) => b.score - a.score)[0]?.voice || null
}

function prepareQuestionSpeech(text) {
  return String(text || '')
    .replace(/\bNGO\b/g, 'N G O')
    .replace(/\bAI\b/g, 'A I')
    .replace(/\bUI\b/g, 'U I')
    .replace(/\bUX\b/g, 'U X')
    .replace(/\bSQL\b/g, 'S Q L')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitSpeechSegments(text) {
  const clean = prepareQuestionSpeech(text)
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean]

  return sentences.flatMap(sentence => {
    const trimmed = sentence.trim()
    if (trimmed.length <= 180) return [trimmed]
    return trimmed
      .split(/,\s+/)
      .map(part => part.trim())
      .filter(Boolean)
  }).filter(Boolean)
}

function StudentView() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const { applicationId, opportunityId } = useParams()
  const isPracticeRoute = Boolean(applicationId || opportunityId)
  const [apps, setApps] = useState([])
  const [savedRoles, setSavedRoles] = useState([])
  const [roleDetails, setRoleDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [roleSource, setRoleSource] = useState('applied')
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [selectedSavedId, setSelectedSavedId] = useState(null)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [practiceFinished, setPracticeFinished] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [activeCategory, setActiveCategory] = useState('opening')
  const [transcript, setTranscript] = useState([])
  const [draftAnswer, setDraftAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isQuestionSpeaking, setIsQuestionSpeaking] = useState(false)
  const [speechVoices, setSpeechVoices] = useState([])
  const [explainOpen, setExplainOpen] = useState(false)
  const [openInsightKeys, setOpenInsightKeys] = useState(() => new Set())
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [activePrepSection, setActivePrepSection] = useState('summary')
  const [openPrepQuestionStage, setOpenPrepQuestionStage] = useState(null)
  const [deletingAppId, setDeletingAppId] = useState(null)
  const [studentGuideAi, setStudentGuideAi] = useState(null)
  const [studentCoachAi, setStudentCoachAi] = useState(null)
  const [studentCoachStatus, setStudentCoachStatus] = useState('idle')
  const [studentSummaryAi, setStudentSummaryAi] = useState(null)
  const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false)
  const [isSkippingSection, setIsSkippingSection] = useState(false)
  const recognitionRef = useRef(null)
  const answerSubmittingRef = useRef(false)
  const skipSectionRef = useRef(false)
  const answerRecordingBaseRef = useRef('')
  const answerFinalTranscriptRef = useRef('')
  const answerSilenceTimerRef = useRef(null)
  const questionAudioRef = useRef(null)
  const questionAudioBlobCacheRef = useRef(new Map())
  const questionAudioRequestRef = useRef(0)
  const questionSpeechTimeoutRef = useRef(null)
  const shouldAutoSpeakNextQuestionRef = useRef(false)
  const autoSpeakDelayMsRef = useRef(0)
  const messageIdRef = useRef(0)
  const questionCardRef = useRef(null)
  const coachPanelRef = useRef(null)
  const answerTextareaRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      withTimeout(fetchStudentApplications(user.id), 10000, 'fetchStudentApplications').catch(err => {
        console.error('Failed to load applications:', err.message)
        return []
      }),
      withTimeout(fetchSavedOpportunities(user.id), 10000, 'fetchSavedOpportunities').catch(err => {
        console.error('Failed to load saved opportunities:', err.message)
        return []
      }),
    ])
      .then(async ([loadedApps, loadedSavedRoles]) => {
        const nextApps = Array.isArray(loadedApps) ? loadedApps : []
        const nextSavedRoles = Array.isArray(loadedSavedRoles) ? loadedSavedRoles : []
        setApps(nextApps)
        setSavedRoles(nextSavedRoles)

        const detailEntries = await Promise.all(
          nextApps.map(async app => {
            if (!app.opportunityId) return [app.id, null]
            const opportunity = await fetchOpportunity(app.opportunityId).catch(() => null)
            return [app.id, opportunity ?? oppFromRoleSnapshot(app.links?.roleSnapshot)]
          })
        )
        setRoleDetails(Object.fromEntries(detailEntries))
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.()
      window.clearTimeout(answerSilenceTimerRef.current)
      questionAudioRef.current?.pause?.()
      window.clearTimeout(questionSpeechTimeoutRef.current)
      window.speechSynthesis?.cancel?.()
    }
  }, [])

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth?.getVoices) return

    function loadVoices() {
      setSpeechVoices(synth.getVoices())
    }

    loadVoices()
    synth.addEventListener?.('voiceschanged', loadVoices)
    const timer = window.setTimeout(loadVoices, 450)

    return () => {
      synth.removeEventListener?.('voiceschanged', loadVoices)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (opportunityId) {
      if (savedRoles.some(role => String(role.opportunityId) === String(opportunityId))) {
        setRoleSource('saved')
        setSelectedSavedId(opportunityId)
      }
      return
    }
    if (applicationId) {
      if (apps.some(app => String(app.id) === String(applicationId))) {
        setRoleSource('applied')
        setSelectedAppId(applicationId)
      }
      return
    }
    if (roleSource === 'applied' && !selectedAppId && apps.length > 0) setSelectedAppId(apps[0].id)
    if (roleSource === 'saved' && !selectedSavedId && savedRoles.length > 0) setSelectedSavedId(savedRoles[0].opportunityId)
    if (apps.length === 0 && savedRoles.length > 0) {
      setRoleSource('saved')
      setSelectedSavedId(savedRoles[0].opportunityId)
    }
  }, [applicationId, opportunityId, apps, savedRoles, roleSource, selectedAppId, selectedSavedId])

  const selectedApp = apps.find(a => String(a.id) === String(selectedAppId))
  const selectedSaved = savedRoles.find(role => String(role.opportunityId) === String(selectedSavedId))
  const selectedRole = roleSource === 'saved'
    ? (selectedSaved ? buildSavedStudentRole(selectedSaved) : null)
    : (selectedApp ? buildStudentRole(selectedApp, roleDetails[selectedApp.id]) : null)
  const currentAiMessage = [...transcript].reverse().find(message => message.from === 'ai' && message.category === activeCategory)
  const currentQuestion = currentAiMessage?.text || (selectedRole ? makeStudentInterviewQuestion(selectedRole, profile, activeCategory, 0, user) : '')
  const activeCategoryInfo = STUDENT_INTERVIEW_CATEGORIES.find(category => category.id === activeCategory) || STUDENT_INTERVIEW_CATEGORIES[0]
  const categoryMessages = transcript.filter(message => message.category === activeCategory)
  const lastCategoryMessage = categoryMessages[categoryMessages.length - 1]
  const currentQuestionMsg = lastCategoryMessage?.from === 'ai' ? lastCategoryMessage : categoryMessages[categoryMessages.length - 2]
  const categoryHasQuestion = Boolean(currentQuestionMsg)
  const questionCoach = selectedRole ? explainStudentQuestion(currentQuestion, selectedRole, profile, activeCategory) : null
  const categoryCoachSummary = studentCoachAi?.categorySummary || questionCoach?.categorySummary || getStudentCategoryCoverageGoal(activeCategory)
  const aiQuestionCoach = studentCoachAi
  const displayQuestionCoach = aiQuestionCoach || questionCoach
  const exampleAnswer = displayQuestionCoach?.exampleAnswer || ''
  const answeredCount = transcript.filter(message => message.from === 'student').length
  const askedCategories = new Set(transcript.filter(message => message.from === 'ai').map(message => message.category))
  const studentGuideSections = selectedRole ? [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'phases', label: 'What to know', icon: Lightbulb },
    { id: 'questions', label: 'Questions to practice', icon: MessageCircle },
  ] : []

  useEffect(() => {
    const textarea = answerTextareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 224)}px`
  }, [draftAnswer, categoryHasQuestion])

  useEffect(() => {
    let cancelled = false
    setStudentGuideAi(null)
    if (!selectedRole) return

    generateStudentGuideAi(selectedRole, profile, user)
      .then(guide => { if (!cancelled) setStudentGuideAi(guide) })
      .catch(() => { if (!cancelled) setStudentGuideAi(null) })

    return () => { cancelled = true }
  }, [selectedRole?.id, selectedRole?.opportunityId, profile, user?.id])

  useEffect(() => {
    let cancelled = false
    setStudentCoachAi(null)
    setStudentCoachStatus('idle')
    if (!explainOpen || !selectedRole || !currentQuestion) return

    setStudentCoachStatus('loading')
    generateStepCoachAi({
      role: selectedRole,
      userType: 'student',
      stageId: activeCategory,
      question: currentQuestion,
      transcript,
      fallback: null,
    })
      .then(coach => {
        if (cancelled) return
        setStudentCoachAi(coach)
        setStudentCoachStatus(coach ? 'ready' : 'error')
      })
      .catch(() => {
        if (!cancelled) setStudentCoachStatus('error')
      })

    return () => { cancelled = true }
  }, [explainOpen, selectedRole?.id, selectedRole?.opportunityId, activeCategory, currentQuestion])

  useEffect(() => {
    let cancelled = false
    setStudentSummaryAi(null)
    if (!showSummary || !selectedRole) return

    generateInterviewSummaryAi({
      role: selectedRole,
      userType: 'student',
      transcript,
      sections: STUDENT_INTERVIEW_CATEGORIES.map(category => ({ id: category.id, label: category.label })),
    })
      .then(summary => { if (!cancelled) setStudentSummaryAi(summary?.sections || null) })
      .catch(() => { if (!cancelled) setStudentSummaryAi(null) })

    return () => { cancelled = true }
  }, [showSummary, selectedRole?.id, selectedRole?.opportunityId])

  function nextMessageId(prefix) {
    messageIdRef.current += 1
    return `${prefix}-${messageIdRef.current}`
  }

  function toggleInsight(key) {
    setOpenInsightKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function selectRole(appId) {
    setRoleSource('applied')
    setSelectedAppId(appId)
    resetStudentPracticeState()
  }

  function selectSavedRole(nextOpportunityId) {
    setRoleSource('saved')
    setSelectedSavedId(nextOpportunityId)
    resetStudentPracticeState()
  }

  function resetStudentPracticeState() {
    stopAnswerRecording()
    stopQuestionAudio()
    shouldAutoSpeakNextQuestionRef.current = false
    autoSpeakDelayMsRef.current = 0
    setPracticeStarted(false)
    setPracticeFinished(false)
    setShowSummary(false)
    setActiveCategory('opening')
    setTranscript([])
    setOpenInsightKeys(new Set())
    setDraftAnswer('')
    setIsRecording(false)
    setExplainOpen(false)
    setActivePrepSection('summary')
    setOpenPrepQuestionStage(null)
    setStudentCoachAi(null)
    setStudentCoachStatus('idle')
    setStudentSummaryAi(null)
  }

  function switchRoleSource(source) {
    setRoleSource(source)
    if (source === 'applied' && !selectedAppId && apps[0]) setSelectedAppId(apps[0].id)
    if (source === 'saved' && !selectedSavedId && savedRoles[0]) setSelectedSavedId(savedRoles[0].opportunityId)
    resetStudentPracticeState()
  }

  async function handleDeleteApp(appId) {
    if (!user?.id || deletingAppId) return
    if (!confirm('Delete this application? This can\'t be undone, and it\'ll remove it from your Applications list too.')) return

    setDeletingAppId(appId)
    try {
      await deleteApplication(appId, user.id)
      const remaining = apps.filter(a => a.id !== appId)
      setApps(remaining)
      setRoleDetails(prev => {
        const next = { ...prev }
        delete next[appId]
        return next
      })
      if (selectedAppId === appId) {
        if (remaining[0]) selectRole(remaining[0].id)
        else setSelectedAppId(null)
      }
    } catch (err) {
      console.error('Failed to delete application:', err.message)
      alert('Could not delete this application. Please try again.')
    } finally {
      setDeletingAppId(null)
    }
  }

  function startPracticeSession(role) {
    stopAnswerRecording()
    stopQuestionAudio()
    shouldAutoSpeakNextQuestionRef.current = true
    autoSpeakDelayMsRef.current = 1000
    const opening = makeStudentInterviewQuestion(role, profile, 'opening', 0, user)
    getQuestionSpeechBlob(opening).catch(() => null)

    setPracticeStarted(true)
    setPracticeFinished(false)
    setShowSummary(false)
    setActiveCategory('opening')
    setTranscript([{ id: nextMessageId('ai'), from: 'ai', category: 'opening', text: opening }])
    setOpenInsightKeys(new Set())
    setDraftAnswer('')
    setIsRecording(false)
    setExplainOpen(false)
    setActivePrepSection('summary')
    setOpenPrepQuestionStage(null)
    setStudentCoachAi(null)
    setStudentCoachStatus('idle')
  }

  function openPractice() {
    if (!selectedRole) return
    if (!isPracticeRoute) {
      if (roleSource === 'saved') navigate(`/interviews/practice/saved/${selectedRole.opportunityId}`)
      else navigate(`/interviews/practice/${selectedAppId}`)
      return
    }
    startPracticeSession(selectedRole)
  }

  function backToInterviewGuide() {
    stopAnswerRecording()
    stopQuestionAudio()
    shouldAutoSpeakNextQuestionRef.current = false
    autoSpeakDelayMsRef.current = 0
    setPracticeStarted(false)
    setPracticeFinished(false)
    setShowSummary(false)
    setTranscript([])
    setDraftAnswer('')
    setExplainOpen(false)
    setStudentCoachAi(null)
    setStudentCoachStatus('idle')
    setOpenInsightKeys(new Set())
    navigate('/interviews')
  }

  useEffect(() => {
    if (!isPracticeRoute || loading || practiceStarted || showSummary || !selectedRole) return
    startPracticeSession(selectedRole)
  }, [isPracticeRoute, loading, practiceStarted, selectedRole, showSummary])

  function openQuestionCoach() {
    setExplainOpen(true)
    window.setTimeout(() => {
      smoothScrollIntoView(coachPanelRef.current, 750)
    }, 80)
  }

  function closeQuestionCoach() {
    setExplainOpen(false)
    setStudentCoachAi(null)
    setStudentCoachStatus('idle')
    window.setTimeout(() => {
      questionCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }

  function getCategoryQuestionCount(categoryId) {
    return transcript.filter(message => message.from === 'ai' && message.category === categoryId).length
  }

  function makeFreshStudentQuestion(categoryId, seed = 0, existingTranscript = transcript) {
    if (!selectedRole) return ''
    const askedInCategory = new Set(
      existingTranscript
        .filter(message => message.from === 'ai' && message.category === categoryId)
        .map(message => message.text)
    )

    for (let offset = 0; offset < 6; offset += 1) {
      const candidate = makeStudentInterviewQuestion(selectedRole, profile, categoryId, seed + offset, user)
      if (!askedInCategory.has(candidate)) return candidate
    }

    return makeStudentInterviewQuestion(selectedRole, profile, categoryId, seed, user)
  }

  async function makeFreshStudentQuestionWithAi(categoryId, seed = 0, existingTranscript = transcript, context = {}) {
    const answerFollowUp = context.latestStudentAnswer
      ? makeStudentAnswerFollowUp(context.latestStudentAnswer, selectedRole)
      : ''
    const fallback = answerFollowUp || makeFreshStudentQuestion(categoryId, seed, existingTranscript)
    try {
      return await generateStudentPracticeQuestionAi({
        role: selectedRole,
        profile,
        user,
        categoryId,
        transcript: existingTranscript,
        fallback,
        ...context,
      })
    } catch (error) {
      console.warn('Student interview AI question fell back to local prompt:', error.message)
      return fallback
    }
  }

  function isCategoryComplete(categoryId) {
    const latestAnswer = latestTranscriptMessage(transcript, 'student', categoryId)?.text || ''
    return assessStudentCategoryCoverageLocal({
      categoryId,
      transcript,
      latestStudentAnswer: latestAnswer,
    }).complete
  }

  async function assessCurrentStudentCategoryCoverage(categoryId, nextTranscript, latestStudentAnswer) {
    const fallback = assessStudentCategoryCoverageLocal({
      categoryId,
      transcript: nextTranscript,
      latestStudentAnswer,
    })

    try {
      const result = await assessStudentCategoryCoverageAi({
        role: selectedRole,
        profile,
        user,
        categoryId,
        transcript: nextTranscript,
        latestStudentAnswer,
        fallback,
      })

      return {
        complete: Boolean(result?.complete),
        reason: result?.reason || fallback.reason,
        missing: result?.missing || fallback.missing,
      }
    } catch (error) {
      console.warn('Student interview category coverage fell back to local check:', error.message)
      return fallback
    }
  }

  async function startCategoryQuestion(categoryId = activeCategory) {
    if (!selectedRole) return
    stopAnswerRecording()
    stopQuestionAudio()
    const seed = getCategoryQuestionCount(categoryId)
    const question = await makeFreshStudentQuestionWithAi(categoryId, seed)

    setTranscript(prev => [
      ...prev,
      { id: nextMessageId('ai'), from: 'ai', category: categoryId, text: question },
    ])
    setActiveCategory(categoryId)
    setDraftAnswer('')
    setExplainOpen(false)
  }

  function selectPracticeCategory(categoryId) {
    stopAnswerRecording()
    stopQuestionAudio()
    setActiveCategory(categoryId)
    setDraftAnswer('')
    setExplainOpen(false)
  }

  async function sendAnswer() {
    if (answerSubmittingRef.current || isAnswerSubmitting) return
    const answer = draftAnswer.trim()
    if (!answer || !selectedRole) return
    answerSubmittingRef.current = true
    setIsAnswerSubmitting(true)
    stopAnswerRecording()
    stopQuestionAudio()

    const answeredCategory = activeCategory
    const studentMessage = { id: nextMessageId('student'), from: 'student', text: answer, category: answeredCategory }
    const nextTranscript = [...transcript, studentMessage]
    setTranscript(prev => [...prev, studentMessage])
    setDraftAnswer('')
    setExplainOpen(false)

    try {
      const localCoverage = assessStudentCategoryCoverageLocal({
        categoryId: answeredCategory,
        transcript: nextTranscript,
        latestStudentAnswer: answer,
      })
      const previousQuestion = latestTranscriptMessage(transcript, 'ai', answeredCategory)?.text || currentQuestion
      const fallbackCategory = localCoverage.complete ? getNextStudentCategory(answeredCategory) : answeredCategory
      const fallbackSeed = nextTranscript.filter(message => message.from === 'ai' && message.category === fallbackCategory).length
      const answerFollowUp = localCoverage.complete ? '' : makeStudentAnswerFollowUp(answer, selectedRole)
      const fallbackQuestion = answerFollowUp || makeFreshStudentQuestion(fallbackCategory, fallbackSeed, nextTranscript)
      const fallbackTurn = {
        categoryComplete: localCoverage.complete,
        nextCategory: fallbackCategory,
        reason: localCoverage.reason,
        missing: localCoverage.missing,
        question: fallbackQuestion,
      }
      let nextTurn = fallbackTurn

      try {
        nextTurn = await generateStudentNextTurnAi({
          role: selectedRole,
          profile,
          user,
          currentCategory: answeredCategory,
          transcript: nextTranscript,
          latestStudentAnswer: answer,
          previousQuestion,
          fallback: fallbackTurn,
        })
      } catch (error) {
        console.warn('Student interview next turn fell back to local prompt:', error.message)
      }

      const isLastCategory = answeredCategory === 'close'
      const coverage = {
        complete: Boolean(nextTurn.categoryComplete),
        reason: nextTurn.reason,
        missing: nextTurn.missing,
      }

      if (isLastCategory && coverage.complete) {
        setPracticeFinished(true)
        setShowSummary(true)
        return
      }

      const nextCategory = coverage.complete ? getNextStudentCategory(answeredCategory) : answeredCategory
      const nextSeed = nextTranscript.filter(message => message.from === 'ai' && message.category === nextCategory).length
      const nextQuestion = nextTurn.question || makeFreshStudentQuestion(nextCategory, nextSeed, nextTranscript)

      shouldAutoSpeakNextQuestionRef.current = true
      autoSpeakDelayMsRef.current = 0
      setTranscript(prev => [
        ...prev,
        { id: nextMessageId('ai'), from: 'ai', category: nextCategory, text: nextQuestion },
      ])
      setActiveCategory(nextCategory)
    } finally {
      answerSubmittingRef.current = false
      setIsAnswerSubmitting(false)
    }
  }

  // Skip leaves the current section entirely. Students answer their way through
  // the mini-round; skipping is the escape hatch to move on.
  async function skipQuestion() {
    if (!selectedRole || skipSectionRef.current) return
    skipSectionRef.current = true
    setIsSkippingSection(true)
    stopAnswerRecording()
    stopQuestionAudio()
    shouldAutoSpeakNextQuestionRef.current = false
    autoSpeakDelayMsRef.current = 0

    try {
      if (activeCategory === 'close') {
        setDraftAnswer('')
        setExplainOpen(false)
        setPracticeFinished(true)
        setShowSummary(true)
        return
      }

      const nextCategory = getNextStudentCategory(activeCategory)
      const nextSeed = getCategoryQuestionCount(nextCategory)
      const nextQuestion = makeFreshStudentQuestion(nextCategory, nextSeed, transcript)

      setActiveCategory(nextCategory)
      setDraftAnswer('')
      setExplainOpen(false)
      setTranscript(prev => [
        ...prev,
        { id: nextMessageId('ai'), from: 'ai', category: nextCategory, text: nextQuestion },
      ])
    } finally {
      skipSectionRef.current = false
      setIsSkippingSection(false)
    }
  }

  function stopAnswerRecording() {
    window.clearTimeout(answerSilenceTimerRef.current)
    answerSilenceTimerRef.current = null
    recognitionRef.current?.stop?.()
    recognitionRef.current = null
    setIsRecording(false)
  }

  function handleVoiceToggle() {
    if (isRecording) {
      stopAnswerRecording()
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
    recognition.continuous = true
    answerRecordingBaseRef.current = draftAnswer.trim()
    answerFinalTranscriptRef.current = ''
    recognition.onresult = event => {
      window.clearTimeout(answerSilenceTimerRef.current)

      let finalText = ''
      let interimText = ''
      Array.from(event.results).forEach(result => {
        const transcript = result[0]?.transcript?.trim()
        if (!transcript) return
        if (result.isFinal) finalText += `${transcript} `
        else interimText += `${transcript} `
      })

      answerFinalTranscriptRef.current = finalText.trim()
      const nextText = [
        answerRecordingBaseRef.current,
        answerFinalTranscriptRef.current,
        interimText.trim(),
      ].filter(Boolean).join(' ')
      setDraftAnswer(nextText)

    }
    recognition.onend = () => {
      window.clearTimeout(answerSilenceTimerRef.current)
      answerSilenceTimerRef.current = null
      setIsRecording(false)
      recognitionRef.current = null
    }
    recognition.onerror = () => stopAnswerRecording()
    recognitionRef.current = recognition
    setIsRecording(true)
    recognition.start()
  }

  function stopQuestionAudio() {
    questionAudioRequestRef.current += 1
    questionAudioRef.current?.pause?.()
    if (questionAudioRef.current?.src) URL.revokeObjectURL(questionAudioRef.current.src)
    questionAudioRef.current = null
    window.clearTimeout(questionSpeechTimeoutRef.current)
    questionSpeechTimeoutRef.current = null
    window.speechSynthesis?.cancel?.()
    setIsQuestionSpeaking(false)
  }

  function speakQuestionWithBrowserSpeech(requestId) {
    if (!window.speechSynthesis || questionAudioRequestRef.current !== requestId) {
      setIsQuestionSpeaking(false)
      return
    }

    const segments = splitSpeechSegments(currentQuestionMsg.text)
    const voice = pickQuestionVoice(speechVoices.length ? speechVoices : window.speechSynthesis.getVoices?.() || [])

    function speakSegment(index = 0) {
      if (questionAudioRequestRef.current !== requestId) return
      if (index >= segments.length) {
        setIsQuestionSpeaking(false)
        return
      }

      const utterance = new SpeechSynthesisUtterance(segments[index])
      if (voice) utterance.voice = voice
      utterance.lang = voice?.lang || 'en-US'
      utterance.rate = index === 0 ? 0.94 : 0.96
      utterance.pitch = 1.02
      utterance.volume = 0.95
      utterance.onend = () => {
        if (questionAudioRequestRef.current !== requestId) return
        questionSpeechTimeoutRef.current = window.setTimeout(() => speakSegment(index + 1), 75)
      }
      utterance.onerror = () => setIsQuestionSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }

    speakSegment()
  }

  async function getQuestionSpeechBlob(text) {
    const cleanText = String(text || '').trim()
    if (!cleanText) return null
    const cachedBlob = questionAudioBlobCacheRef.current.get(cleanText)
    if (cachedBlob) return cachedBlob

    const audioBlob = await createHiveSpeech({ input: cleanText })
    questionAudioBlobCacheRef.current.set(cleanText, audioBlob)
    return audioBlob
  }

  async function speakCurrentQuestion() {
    if (!currentQuestionMsg?.text) return
    if (isQuestionSpeaking) {
      stopQuestionAudio()
      return
    }

    stopQuestionAudio()
    const requestId = questionAudioRequestRef.current + 1
    questionAudioRequestRef.current = requestId
    setIsQuestionSpeaking(true)

    try {
      const text = currentQuestionMsg.text
      const audioBlob = await getQuestionSpeechBlob(text)
      if (questionAudioRequestRef.current !== requestId) {
        setIsQuestionSpeaking(false)
        return
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      questionAudioRef.current = audio
      audio.onended = () => {
        if (questionAudioRequestRef.current === requestId) setIsQuestionSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        if (questionAudioRef.current === audio) questionAudioRef.current = null
      }
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        if (questionAudioRequestRef.current === requestId) speakQuestionWithBrowserSpeech(requestId)
      }
      await audio.play()
    } catch {
      speakQuestionWithBrowserSpeech(requestId)
    }
  }

  useEffect(() => {
    if (!shouldAutoSpeakNextQuestionRef.current || !currentQuestionMsg?.id || practiceFinished) return
    shouldAutoSpeakNextQuestionRef.current = false
    const delay = autoSpeakDelayMsRef.current
    autoSpeakDelayMsRef.current = 0
    const timer = window.setTimeout(() => {
      speakCurrentQuestion()
    }, delay)
    return () => window.clearTimeout(timer)
  }, [currentQuestionMsg?.id, practiceFinished])


  if (loading) {
    return (
      <div className={isPracticeRoute ? 'grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]' : 'grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]'}>
        {isPracticeRoute ? (
          <>
            <div className="h-[620px] animate-pulse rounded-[30px] border border-white/70 bg-white/70 shadow-[0_24px_70px_rgba(26,115,232,0.10)] backdrop-blur-2xl" />
            <div className="h-[620px] animate-pulse rounded-[30px] border border-white/70 bg-white/60 shadow-[0_18px_46px_rgba(26,115,232,0.08)] backdrop-blur-2xl" />
          </>
        ) : (
          <>
            <aside className="h-[600px] rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_46px_rgba(26,115,232,0.08)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between gap-3 px-1">
                <div className="space-y-2">
                  <div className="h-3 w-28 animate-pulse rounded-full bg-[#D7E6FF]" />
                  <div className="h-3 w-20 animate-pulse rounded-full bg-[#E8F0FE]" />
                </div>
                <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#E8F0FE]" />
              </div>
              <div className="space-y-3">
                {[0, 1, 2, 3].map(item => (
                  <div key={item} className="rounded-[22px] border border-white/70 bg-white/58 px-4 py-4 shadow-[0_8px_20px_rgba(26,115,232,0.04)]">
                    <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#E8F0FE]" />
                    <div className="mt-3 h-3 w-2/3 animate-pulse rounded-full bg-[#F1F5F9]" />
                  </div>
                ))}
              </div>
            </aside>

            <section className="min-h-[560px] rounded-[32px] border border-white/70 bg-white/70 p-6 shadow-[0_24px_70px_rgba(26,115,232,0.10)] backdrop-blur-2xl lg:p-8">
              <div className="rounded-[30px] bg-[linear-gradient(135deg,rgba(248,251,255,0.92)_0%,rgba(255,255,255,0.72)_52%,rgba(232,240,254,0.82)_100%)] px-6 py-6 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset]">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 h-3 w-32 animate-pulse rounded-full bg-[#D7E6FF]" />
                    <div className="h-9 w-3/5 animate-pulse rounded-2xl bg-[#E8F0FE]" />
                    <div className="mt-4 h-4 w-4/5 animate-pulse rounded-full bg-[#F1F5F9]" />
                  </div>
                  <div className="h-12 w-44 animate-pulse rounded-full bg-[#D7E6FF]" />
                </div>
              </div>

              <div className="mt-9 grid w-full grid-cols-1 gap-2 rounded-[24px] border border-white/90 bg-white/95 p-2 shadow-[0_14px_34px_rgba(26,115,232,0.045),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl sm:grid-cols-3">
                {[0, 1, 2].map(item => (
                  <div key={item} className="h-11 w-36 animate-pulse rounded-full border border-white/70 bg-white/64 shadow-[0_8px_20px_rgba(26,115,232,0.05)]" />
                ))}
              </div>

              <div className="mt-8 max-w-4xl space-y-4">
                <div className="h-6 w-52 animate-pulse rounded-full bg-[#E8F0FE]" />
                <div className="h-4 w-full animate-pulse rounded-full bg-[#F1F5F9]" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#F1F5F9]" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#F1F5F9]" />
              </div>
            </section>
          </>
        )}
      </div>
    )
  }

  if (apps.length === 0 && savedRoles.length === 0) {
    return (
      <section
        className="rounded-[32px] border bg-white px-6 py-16 text-center shadow-[0_1px_0_rgba(17,24,39,0.02),0_12px_36px_rgba(17,24,39,0.04)]"
        style={{ borderColor: 'rgba(26,115,232,0.10)' }}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F0FE] text-[#1A73E8]">
          <Briefcase size={28} />
        </div>
        <h2 className="text-[1.35rem] font-semibold text-[#202124]">No roles ready yet</h2>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-7 text-[#5F6368]">
          Apply to a role or save one you like, then Hive will turn it into a practice interview room.
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
          className="overflow-y-auto rounded-[30px] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(248,251,255,0.34))] p-4 shadow-[0_24px_64px_rgba(26,115,232,0.085),0_1px_0_rgba(255,255,255,0.96)_inset,0_-1px_0_rgba(26,115,232,0.025)_inset] backdrop-blur-2xl"
          style={{ height: '600px' }}>
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Practice roles</p>
              <p className="mt-1 text-[0.84rem] text-[#5F6368]">
                {roleSource === 'applied'
                  ? `${apps.length} applied role${apps.length !== 1 ? 's' : ''}`
                  : `${savedRoles.length} saved role${savedRoles.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90">
              {roleSource === 'applied' ? <Briefcase size={18} /> : <Bookmark size={18} />}
            </div>
          </div>

          <div className="mb-4 rounded-full border border-white/80 bg-white/58 p-1 shadow-[0_12px_28px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-xl">
            {[
              { id: 'applied', label: 'Applied', count: apps.length, icon: Briefcase },
              { id: 'saved', label: 'Saved', count: savedRoles.length, icon: Bookmark },
            ].map(option => {
              const active = roleSource === option.id
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => switchRoleSource(option.id)}
                  className={`inline-flex h-10 w-1/2 items-center justify-center gap-2 rounded-full text-[0.8rem] font-semibold transition-all ${
                    active
                      ? 'bg-[#E8F0FE] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.13),0_1px_0_rgba(255,255,255,0.9)_inset]'
                      : 'text-[#6B7280] hover:bg-white/72 hover:text-[#1A73E8]'
                  }`}>
                  <Icon size={14} />
                  <span>{option.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[0.68rem] ${active ? 'bg-white/80 text-[#1A73E8]' : 'bg-white/70 text-[#8A94A3]'}`}>
                    {option.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {roleSource === 'applied' && apps.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-[#D7E6FF] bg-white/62 px-5 py-8 text-center shadow-[0_10px_24px_rgba(26,115,232,0.05)]">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                  <Briefcase size={18} />
                </div>
                <p className="text-[0.9rem] font-semibold text-[#202124]">No applied jobs yet</p>
                <p className="mt-1.5 text-[0.78rem] leading-5 text-[#5F6368]">Saved jobs are still ready for interview practice.</p>
              </div>
            )}

            {roleSource === 'saved' && savedRoles.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-[#D7E6FF] bg-white/62 px-5 py-8 text-center shadow-[0_10px_24px_rgba(26,115,232,0.05)]">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                  <Bookmark size={18} />
                </div>
                <p className="text-[0.9rem] font-semibold text-[#202124]">No saved jobs yet</p>
                <p className="mt-1.5 text-[0.78rem] leading-5 text-[#5F6368]">Save a role from Opportunities and practice it here.</p>
              </div>
            )}

            {roleSource === 'applied' && apps.map(app => {
              const role = buildStudentRole(app, roleDetails[app.id])
              const active = String(app.id) === String(selectedAppId)
              return (
                <button
                  key={app.id}
                  onClick={() => selectRole(app.id)}
                  className={`group relative w-full overflow-hidden rounded-[24px] border px-4 py-5 text-left after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.62),transparent_34%)] ring-1 ring-white/55 backdrop-blur-2xl transition-all hover:-translate-y-0.5 ${
                    active
                      ? 'border-transparent bg-[linear-gradient(135deg,rgba(232,240,254,0.98),rgba(210,227,252,0.84))] shadow-[0_14px_32px_rgba(26,115,232,0.16),0_1px_0_rgba(255,255,255,0.92)_inset,0_-1px_0_rgba(26,115,232,0.04)_inset]'
                      : 'border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.66))] shadow-[0_10px_24px_rgba(32,33,36,0.05),0_1px_0_rgba(255,255,255,0.94)_inset] hover:border-white/90 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,255,255,0.78))] hover:shadow-[0_13px_30px_rgba(32,33,36,0.065),0_1px_0_rgba(255,255,255,0.97)_inset]'
                  }`}>
                  <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`line-clamp-1 text-[0.98rem] font-semibold leading-snug ${active ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                        {role.title}
                      </p>
                      <p className="mt-1.5 truncate text-[0.78rem] text-[#5F6368]">
                        {role.orgName || [role.workMode, role.location].filter(Boolean).join(' · ') || role.category || 'Flexible role'}
                      </p>
                    </div>
                    <ArrowRight size={16} className={`mt-1 shrink-0 transition-transform ${active ? 'text-[#1A73E8]' : 'text-[#9AA0A6] group-hover:translate-x-0.5 group-hover:text-[#1A73E8]'}`} />
                  </div>
                </button>
              )
            })}

            {roleSource === 'saved' && savedRoles.map(saved => {
              const role = buildSavedStudentRole(saved)
              const active = String(saved.opportunityId) === String(selectedSavedId)
              return (
                <button
                  key={saved.opportunityId}
                  onClick={() => selectSavedRole(saved.opportunityId)}
                  className={`group relative w-full overflow-hidden rounded-[24px] border px-4 py-5 text-left after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.62),transparent_34%)] ring-1 ring-white/55 backdrop-blur-2xl transition-all hover:-translate-y-0.5 ${
                    active
                      ? 'border-transparent bg-[linear-gradient(135deg,rgba(232,240,254,0.98),rgba(210,227,252,0.84))] shadow-[0_14px_32px_rgba(26,115,232,0.16),0_1px_0_rgba(255,255,255,0.92)_inset,0_-1px_0_rgba(26,115,232,0.04)_inset]'
                      : 'border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.66))] shadow-[0_10px_24px_rgba(32,33,36,0.05),0_1px_0_rgba(255,255,255,0.94)_inset] hover:border-white/90 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,255,255,0.78))] hover:shadow-[0_13px_30px_rgba(32,33,36,0.065),0_1px_0_rgba(255,255,255,0.97)_inset]'
                  }`}>
                  <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`line-clamp-1 text-[0.98rem] font-semibold leading-snug ${active ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                        {role.title}
                      </p>
                      <p className="mt-1.5 truncate text-[0.78rem] text-[#5F6368]">
                        {role.orgName || [role.workMode, role.location].filter(Boolean).join(' · ') || role.category || 'Flexible role'}
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
          <section
            className="min-h-[560px] overflow-hidden rounded-[32px] border border-white/75 bg-white/76 shadow-[0_24px_70px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl">
            {!selectedRole ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                  <Briefcase size={22} />
                </div>
                <p className="text-[1rem] font-semibold text-[#202124]">Choose a role</p>
                  <p className="mt-2 max-w-sm text-[0.86rem] leading-6 text-[#5F6368]">
                  Select an applied or saved role on the left to start practicing interviews.
                </p>
              </div>
            ) : (
              <div className="p-6 lg:p-8">
              <div className="relative overflow-hidden rounded-[30px] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.82)_0%,rgba(248,251,255,0.66)_52%,rgba(232,240,254,0.54)_100%)] px-6 py-6 shadow-[0_18px_48px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#1A73E8]">
                      Interview guide
                    </p>
                    <h2 className="text-[clamp(1.65rem,3vw,2.45rem)] font-semibold leading-tight text-[#202124]">{selectedRole.title}</h2>
                    <p className="mt-3 max-w-3xl text-[0.95rem] leading-7 text-[#5F6368]">
                      A quick prep sheet for what the AI interviewer may ask, how to answer, and when to move into practice.
                    </p>
                  </div>
                  <button
                    onClick={openPractice}
                    className="flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#1A73E8] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_12px_28px_rgba(26,115,232,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#1765CC] hover:shadow-[0_18px_38px_rgba(26,115,232,0.28)]">
                    <PlayCircle size={20} />
                    Practice interview
                  </button>
                </div>
              </div>

              <div className="mt-9 grid w-full grid-cols-1 gap-2 rounded-[24px] border border-white/90 bg-white/95 p-2 shadow-[0_14px_34px_rgba(26,115,232,0.045),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl sm:grid-cols-3">
                {studentGuideSections.map(section => {
                  const Icon = section.icon
                  const active = activePrepSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActivePrepSection(section.id)}
                      className={`inline-flex h-12 items-center justify-center gap-2 rounded-[18px] px-4 text-[0.84rem] font-semibold transition-all duration-300 ${
                        active
                          ? 'bg-[linear-gradient(135deg,rgba(232,240,254,0.98),rgba(210,227,252,0.86))] text-[#1A73E8] shadow-[0_12px_26px_rgba(26,115,232,0.14),0_1px_0_rgba(255,255,255,0.92)_inset]'
                          : 'bg-white/42 text-[#5F6368] ring-1 ring-white/50 hover:bg-white/72 hover:text-[#1A73E8]'
                      }`}>
                      <Icon size={15} />
                      {section.label}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePrepSection}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="min-h-[300px] py-7">
                  {activePrepSection === 'summary' && (
                    <section className="max-w-4xl">
                      <h3 className="text-[1.25rem] font-semibold text-[#202124]">AI interview summary</h3>
                      <p className="mt-1.5 text-[0.82rem] text-[#9AA0A6]">A quick overview of what this role interview is likely to test.</p>
                      <p className="mt-6 max-w-3xl text-[0.95rem] leading-8 text-[#5F6368]">
                        {studentGuideAi?.summary || makeRoleSummary(selectedRole, selectedRole.skills)}
                      </p>
                      <p className="mt-6 max-w-3xl text-[0.95rem] leading-8 text-[#5F6368]">
                        Practice is split into five steps: opening, skills fit, mission fit, scenario, and close. The AI interviewer starts each step with a question, then you answer as the student.
                      </p>
                    </section>
                  )}

                  {activePrepSection === 'phases' && (
                    <section className="max-w-3xl">
                      <div className="mb-5 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                          <Lightbulb size={19} />
                        </div>
                        <div>
                          <h3 className="text-[1.25rem] font-semibold text-[#202124]">What to know</h3>
                          <p className="mt-1 text-[0.82rem] text-[#9AA0A6]">What the interviewer is checking in each part of the conversation.</p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {STUDENT_INTERVIEW_CATEGORIES.map((category, i) => {
                          const coach = studentGuideAi?.whatToKnow?.find(item => item.id === category.id) || explainStudentQuestion('', selectedRole, profile, category.id)
                          return (
                            <div key={category.id} className="flex gap-4 rounded-[22px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] p-5 shadow-[0_12px_28px_rgba(32,33,36,0.05),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[0.78rem] font-bold text-[#1A73E8]">
                                {String(i + 1).padStart(2, '0')}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[1.05rem] font-bold text-[#202124]">{category.label}</p>
                                <p className="mt-1.5 text-[0.92rem] leading-7 text-[#4B5058]">{coach.purpose}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )}

                  {activePrepSection === 'questions' && (
                    <section className="max-w-3xl">
                      <div className="mb-5 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
                          <MessageCircle size={19} />
                        </div>
                        <div>
                          <h3 className="text-[1.25rem] font-semibold text-[#202124]">Questions to practice</h3>
                          <p className="mt-1 text-[0.82rem] text-[#9AA0A6]">Examples of questions the AI interviewer may ask during the practice.</p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-4">
                        {STUDENT_INTERVIEW_CATEGORIES.map((category, i) => {
                          const isOpen = openPrepQuestionStage === category.id
                          const questions = studentGuideAi?.questions?.[category.id] || [
                            makeStudentInterviewQuestion(selectedRole, profile, category.id, 0, user),
                            makeStudentInterviewQuestion(selectedRole, profile, category.id, 1, user),
                          ]
                          return (
                            <div key={category.id} className="overflow-hidden rounded-[22px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] shadow-[0_12px_28px_rgba(32,33,36,0.05),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
                              <button
                                onClick={() => setOpenPrepQuestionStage(isOpen ? null : category.id)}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/70">
                                <div className="flex items-center gap-3.5">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[0.78rem] font-bold text-[#1A73E8]">
                                    {i + 1}
                                  </div>
                                  <p className="text-[1.05rem] font-bold text-[#202124]">{category.label}</p>
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
                                    <div className="space-y-3.5 border-t border-white/70 bg-white/52 backdrop-blur-xl px-5 py-4">
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

                <div className="flex flex-col gap-3 border-t border-white/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  {roleSource === 'applied' && selectedApp ? (
                    <button
                      onClick={() => handleDeleteApp(selectedApp.id)}
                      disabled={deletingAppId === selectedApp.id}
                      className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-[#C5221F] transition-colors hover:underline disabled:opacity-50">
                      <Trash2 size={13} />
                      {deletingAppId === selectedApp.id ? 'Deleting…' : 'Delete this application'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-[#5F6368]">
                      <Bookmark size={13} />
                      Saved role
                    </span>
                  )}
                  <button
                    onClick={openPractice}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.84rem] font-semibold text-white shadow-[0_12px_26px_rgba(26,115,232,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#1765CC] hover:shadow-[0_16px_34px_rgba(26,115,232,0.28)]">
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
    const categoriesRecap = STUDENT_INTERVIEW_CATEGORIES.map(category => {
      const qaPairs = []
      transcript.forEach((message, i) => {
        if (message.from === 'ai' && message.category === category.id) {
          const answer = transcript[i + 1]?.from === 'student' ? transcript[i + 1].text : null
          qaPairs.push({ id: message.id, question: message.text, answer })
        }
      })
      const covered = qaPairs.some(pair => Boolean(pair.answer?.trim()))
      const coach = explainStudentQuestion('', selectedRole, profile, category.id)
      return { ...category, qaPairs, covered, coach }
    })
    const coveredCategories = categoriesRecap.filter(category => category.covered)

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mx-auto max-w-6xl space-y-6">
        <div>
          <div className="min-w-0">
            <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-[#202124]">Interview summary</h2>
            <p className="truncate text-[0.9rem] text-[#5F6368]">{selectedRole.orgName} · {selectedRole.title}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Questions answered', value: answeredCount, hint: 'Student responses recorded', tint: '#E8F0FE', accent: '#1A73E8' },
            { label: 'Steps covered', value: `${coveredCategories.length}/${STUDENT_INTERVIEW_CATEGORIES.length}`, hint: 'Sections with at least one answer', tint: '#F1F5F9', accent: '#4B6382' },
            { label: 'Practice coverage', value: `${Math.round((coveredCategories.length / STUDENT_INTERVIEW_CATEGORIES.length) * 100)}%`, hint: 'Answered section coverage', tint: '#E6F4EA', accent: '#188038' },
          ].map((stat, statIndex) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05 * statIndex }}
              className="group relative min-h-[190px] overflow-hidden rounded-[28px] border border-[#DDE8F8]/65 bg-white/72 p-5 text-left shadow-[0_20px_54px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.72)_inset,0_0_0_1px_rgba(26,115,232,0.025)_inset] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:bg-white/84 hover:shadow-[0_26px_68px_rgba(26,115,232,0.12),0_0_0_1px_rgba(26,115,232,0.035)_inset]">
              <svg
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full transition-transform duration-300 group-hover:translate-y-[-2px]"
                viewBox="0 0 300 100"
                preserveAspectRatio="none"
                aria-hidden="true">
                <path
                  d="M0,30 C62,58 96,8 154,28 C214,48 242,12 300,32 L300,100 L0,100 Z"
                  fill={stat.tint}
                  opacity="0.55"
                />
                <path
                  d="M0,48 C66,26 112,60 172,42 C224,26 258,54 300,46 L300,100 L0,100 Z"
                  fill={stat.tint}
                  opacity="0.82"
                />
              </svg>
              <div className="relative z-10">
                <p className="text-[0.82rem] font-semibold text-[#5F6368]">{stat.label}</p>
                <p className="mt-8 text-[2.45rem] font-semibold leading-none tracking-[-0.03em] text-[#202124]">{stat.value}</p>
                <p className="mt-3 max-w-[13rem] text-[0.82rem] leading-5 text-[#5F6368]">{stat.hint}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {categoriesRecap.map((category, index) => {
          const shownKey = `${category.id}-shown`
          const improveKey = `${category.id}-improve`
          const shownOpen = openInsightKeys.has(shownKey)
          const improveOpen = openInsightKeys.has(improveKey)
          const aiFeedback = studentSummaryAi?.[category.id] || null
          const CategoryIcon = category.icon
          return (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 * index }}
              className="group overflow-hidden rounded-[28px] border border-white/75 bg-white/66 shadow-[0_18px_50px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.82)_inset] backdrop-blur-2xl transition-all hover:-translate-y-0.5 duration-200 hover:bg-white/76 hover:shadow-[0_24px_64px_rgba(26,115,232,0.12)]">
              <span className="block h-px bg-white/70" />
              <div className="flex items-center gap-3 border-b border-white/70 bg-white/42 px-6 py-4 backdrop-blur-xl">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90 transition-transform duration-200 group-hover:scale-110">
                  <CategoryIcon size={18} strokeWidth={2.15} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[0.98rem] font-semibold text-[#202124]">{category.label}</h2>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
                  style={category.covered
                    ? { background: '#EEF4FF', color: '#3F6FB6' }
                    : { background: '#F5F7FA', color: '#8A94A3' }}>
                  {category.covered ? `${category.qaPairs.length} question${category.qaPairs.length !== 1 ? 's' : ''}` : 'Not covered'}
                </span>
              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0">
                  {category.covered && (
                    <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Conversation</p>
                  )}
                  {category.covered ? (
                    <div className="space-y-4">
                      {category.qaPairs.map((pair, pairIndex) => (
                        <div key={pair.id} className={pairIndex > 0 ? 'border-t border-[#F1F3F4] pt-4' : ''}>
                          <div className="mb-2 inline-block max-w-[85%] rounded-2xl rounded-tl-md bg-[#F1F5F9] px-3.5 py-2 ring-1 ring-[#E6EAF0]">
                            <p className="text-[0.86rem] font-medium leading-6 text-[#202124]">{pair.question}</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <GradientAvatar name={profile?.name || user?.name || 'Student'} size={24} radius="0.65rem" className="mt-0.5 shrink-0" />
                            <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#F8F9FA] px-3.5 py-2.5 text-[0.86rem] leading-6 text-[#3C4043]">
                              {pair.answer || <span className="italic text-[#9AA0A6]">No answer recorded</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-[#D7E6FF] bg-white/54 px-4 py-4 shadow-[0_10px_24px_rgba(26,115,232,0.05)]">
                      <p className="text-[0.86rem] leading-6 text-[#5F6368]">{aiFeedback?.whatHappened || category.coach.purpose}</p>
                      <p className="mt-2 text-[0.78rem] font-medium text-[#1A73E8]">
                        Try covering this step in your next practice run.
                      </p>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="space-y-3">
                    <div
                      className="overflow-hidden rounded-[20px] border border-white/75 bg-white/52 shadow-[0_8px_22px_rgba(26,115,232,0.05)] transition-colors">
                      <button
                        onClick={() => toggleInsight(shownKey)}
                        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
                        <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#202124]">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF7EF] text-[#4F9D69] ring-1 ring-[#D7ECDD]">
                            <CheckCircle2 size={12} />
                          </span>
                          What you showed
                        </span>
                        {shownOpen ? <ChevronUp size={14} className="shrink-0 text-[#5F6368]" /> : <ChevronDown size={14} className="shrink-0 text-[#5F6368]" />}
                      </button>
                      <AnimatePresence initial={false}>
                        {shownOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden border-t border-white/70">
                            <p className="px-3.5 py-3 text-[0.82rem] leading-6 text-[#5F6368]">
                              {category.covered
                                ? (aiFeedback?.wentWell || category.coach.purpose)
                                : `When you answer this step, show: ${category.coach.simpler}`}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div
                      className="overflow-hidden rounded-[20px] border border-white/75 bg-white/52 shadow-[0_8px_22px_rgba(26,115,232,0.05)] transition-colors">
                      <button
                        onClick={() => toggleInsight(improveKey)}
                        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
                        <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#202124]">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[#5F8FD8] ring-1 ring-[#DDE9FB]">
                            <AlertCircle size={12} />
                          </span>
                          How to improve
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
                            className="overflow-hidden border-t border-white/70">
                            <div className="space-y-2 px-3.5 py-3">
                              {((aiFeedback?.tips?.length ? aiFeedback.tips : null) || (aiFeedback?.couldImprove ? [aiFeedback.couldImprove] : category.coach.tips) || []).map(tip => (
                                <p key={tip} className="flex gap-2 text-[0.82rem] leading-6 text-[#5F6368]">
                                  <CheckCircle2 size={14} className="mt-1 shrink-0 text-[#1A73E8]" />
                                  <span>{tip}</span>
                                </p>
                              ))}
                            </div>
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
            onClick={openPractice}
            className="inline-flex items-center gap-2 rounded-full bg-[#1A73E8] px-6 py-3 text-[0.88rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(26,115,232,0.28)]">
            <PlayCircle size={17} />
            Practice again
          </button>
          <button
            onClick={backToInterviewGuide}
            className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/64 px-6 py-3 text-[0.88rem] font-semibold text-[#1A73E8] shadow-[0_10px_24px_rgba(26,115,232,0.10)] backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:-translate-y-0.5 hover:bg-white">
            Back to prep
          </button>
        </div>
      </motion.div>
    )
  }

  const currentCategoryIndex = STUDENT_INTERVIEW_CATEGORIES.findIndex(category => category.id === activeCategory)
  const isLastCategory = currentCategoryIndex === STUDENT_INTERVIEW_CATEGORIES.length - 1

  // Only the current category's question is shown — no answer bubble, no transcript log,
  // just the question in front of the student until they answer or skip it.
  const activeCategoryComplete = false

  return (
    <motion.div
      key={selectedRole.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative">
      <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="relative">
      <section
        className="relative flex min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/72 shadow-[0_24px_70px_rgba(26,115,232,0.12),0_1px_0_rgba(255,255,255,0.75)_inset] backdrop-blur-2xl xl:h-[calc(100vh-132px)]">
        <div className="relative border-b border-white/70 bg-white/58 px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.70)_inset] backdrop-blur-xl sm:px-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="grid min-w-0 grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-center rounded-[24px] border border-white/80 bg-white/54 px-1.5 py-1.5 shadow-[0_10px_30px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-xl">
              {STUDENT_INTERVIEW_CATEGORIES.map((category, index) => {
                const isActive = activeCategory === category.id
                const isDone = isCategoryComplete(category.id) && !isActive
                const stepButton = (
                  <button
                    onClick={() => selectPracticeCategory(category.id)}
                    className={`mx-auto inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[0.72rem] font-semibold transition-all lg:gap-2 lg:px-3.5 lg:text-[0.78rem] ${
                      isActive
                        ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(230,244,234,0.94))] text-[#188038] shadow-[0_10px_22px_rgba(24,128,56,0.14),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-[#B7E1C1]'
                        : isDone
                        ? 'text-[#1A73E8] hover:bg-white/70'
                        : 'text-[#6B7280] hover:bg-white/62 hover:text-[#3C4043]'
                    }`}>
                    <span
                      className={`flex h-2 w-2 shrink-0 rounded-full ring-[3px] lg:h-2.5 lg:w-2.5 lg:ring-4 ${
                        isActive
                          ? 'bg-[#188038] ring-[#DFF3E6]'
                          : isDone
                          ? 'bg-[#1A73E8] ring-[#EEF4FF]'
                          : 'bg-[#C4CBD6] ring-[#F3F6FA]'
                      }`}
                    />
                    <span className="truncate">{category.label}</span>
                  </button>
                )
                return index === 0 ? (
                  <div key={category.id} className="min-w-0 text-center">{stepButton}</div>
                ) : (
                  <>
                    <div key={`${category.id}-line`} className="px-1.5">
                      <span
                        className={`block h-px w-full min-w-5 rounded-full ${
                          isActive ? 'bg-[#188038]/24' : isDone ? 'bg-[#1A73E8]/25' : 'bg-white/80'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <div key={category.id} className="min-w-0 text-center">{stepButton}</div>
                  </>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Current exchange only — the room shows where you are, not a scrolling log */}
          <div className="relative flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.84)_46%,rgba(248,251,255,0.92)_100%)] px-4 py-5 sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.98),rgba(255,255,255,0.76)_36%,rgba(232,240,254,0.34)_68%,transparent_88%)]" aria-hidden="true" />
            {categoryHasQuestion && !practiceFinished && (
              <button
                onClick={speakCurrentQuestion}
                aria-label={isQuestionSpeaking ? 'Stop reading question' : 'Read question aloud'}
                title={isQuestionSpeaking ? 'Stop reading' : 'Read question'}
                className={`absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-2xl transition-all hover:-translate-y-0.5 sm:right-6 sm:top-5 ${
                  isQuestionSpeaking
                    ? 'border-[#BFD7FF]/90 bg-[#E8F0FE]/90 text-[#1A73E8] shadow-[0_0_0_7px_rgba(26,115,232,0.10),0_14px_30px_rgba(26,115,232,0.16),0_1px_0_rgba(255,255,255,0.9)_inset]'
                    : 'border-white/90 bg-white/84 text-[#1A73E8] shadow-[0_10px_24px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.9)_inset] hover:bg-white hover:shadow-[0_14px_30px_rgba(26,115,232,0.15)]'
                }`}>
                {isQuestionSpeaking ? <StopCircle size={17} /> : <Volume2 size={17} />}
              </button>
            )}
            <div className="relative mx-auto flex h-full min-h-[180px] max-w-xl flex-col items-center justify-center text-center">
              {!practiceFinished && (
                <AnimatePresence mode="wait">
                  {categoryHasQuestion ? (
                    <motion.div
                      ref={questionCardRef}
                      key={`${activeCategory}-${currentQuestionMsg?.id}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="relative px-4 py-5 text-center">
                      <p className="mx-auto max-w-[34rem] text-[clamp(1.28rem,1.9vw,1.7rem)] font-semibold leading-snug text-[#202124] drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]">
                        {currentQuestionMsg?.text}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      ref={questionCardRef}
                      key={`${activeCategory}-starter`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/70 px-7 py-8 text-center shadow-[0_18px_48px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-2xl">
                      <p className="text-[1.25rem] font-semibold text-[#202124]">{activeCategoryInfo.label}</p>
                      <p className="mx-auto mt-2 max-w-sm text-[0.88rem] leading-6 text-[#5F6368]">
                        The NGO wants to understand your fit for this part of the interview. Start the section when you are ready.
                      </p>
                      <button
                        onClick={() => startCategoryQuestion(activeCategory)}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#4C9AEF,#1A73E8)] px-5 py-2.5 text-[0.84rem] font-semibold text-white shadow-[0_12px_26px_rgba(26,115,232,0.26)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(26,115,232,0.32)]">
                        <PlayCircle size={16} />
                        Start questions
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

            </div>
          </div>

          {!practiceFinished && (
            <div className="border-t border-white/70 bg-white/68 px-4 py-4 shadow-[0_-18px_40px_rgba(26,115,232,0.05)] backdrop-blur-xl sm:px-5">
              {/* Unified composer — mic lives inside the input, matching the NGO practice room */}
              <div className="rounded-[24px] border border-white/80 bg-white/62 p-2 shadow-[0_14px_34px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-[#D7E6FF]/70 backdrop-blur-2xl transition-all hover:-translate-y-0.5 focus-within:bg-white/86 focus-within:shadow-[0_18px_46px_rgba(26,115,232,0.14)] focus-within:ring-[#1A73E8]/35">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleVoiceToggle}
                    disabled={!categoryHasQuestion || activeCategoryComplete || isAnswerSubmitting}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    title={isRecording ? 'Stop recording' : 'Start recording'}
                    className={`inline-flex h-11 shrink-0 self-center items-center justify-center gap-2 rounded-full px-4 text-[0.78rem] font-semibold transition-all ${
                      isRecording
                        ? 'bg-[#E8F0FE] text-[#1A73E8] shadow-[0_0_0_6px_rgba(26,115,232,0.10),0_10px_22px_rgba(26,115,232,0.14)] ring-1 ring-[#BFD7FF]'
                        : 'bg-white/72 text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)] ring-1 ring-white/90 hover:bg-white hover:shadow-[0_12px_26px_rgba(26,115,232,0.14)]'
                    } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-[#7B8492] disabled:hover:shadow-none`}>
                    {isRecording ? <StopCircle size={17} /> : <Mic size={17} />}
                    <span className="hidden sm:inline">{isRecording ? 'Stop' : 'Record'}</span>
                  </button>
                  <textarea
                    ref={answerTextareaRef}
                    value={draftAnswer}
                    onChange={event => setDraftAnswer(event.target.value)}
                    rows={1}
                    disabled={!categoryHasQuestion || activeCategoryComplete || isAnswerSubmitting}
                    placeholder={!categoryHasQuestion ? 'Start this section first...' : isAnswerSubmitting ? 'Sending...' : isRecording ? 'Listening...' : 'Type your answer here...'}
                    className="max-h-56 min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-[0.92rem] leading-6 text-[#202124] outline-none placeholder:text-[#8A94A3] disabled:opacity-50"
                  />
                  <button
                    onClick={sendAnswer}
                    disabled={!draftAnswer.trim() || !categoryHasQuestion || activeCategoryComplete || isAnswerSubmitting}
                    className="flex h-10 w-10 shrink-0 self-center items-center justify-center rounded-full bg-[linear-gradient(135deg,#4C9AEF,#1A73E8)] text-white shadow-[0_10px_24px_rgba(26,115,232,0.28)] transition-all hover:scale-105 hover:shadow-[0_14px_30px_rgba(26,115,232,0.34)] disabled:scale-100 disabled:bg-none disabled:bg-[#DADCE0] disabled:text-white disabled:shadow-none"
                    aria-label="Send answer">
                    <Send size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={explainOpen ? closeQuestionCoach : openQuestionCoach}
                  disabled={!categoryHasQuestion || isAnswerSubmitting}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[0.76rem] font-semibold ring-1 transition-all ${
                    explainOpen
                      ? 'bg-white text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.14)] ring-[#BFD7FF]'
                      : 'bg-white/86 text-[#4B6382] shadow-[0_8px_18px_rgba(26,115,232,0.08)] ring-white/90 hover:bg-white hover:text-[#1A73E8] hover:shadow-[0_10px_22px_rgba(26,115,232,0.13)]'
                  } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white/86 disabled:hover:text-[#4B6382] disabled:hover:shadow-none`}>
                  <Info size={14} />
                  Explain question
                </button>
	                <button
	                  onClick={skipQuestion}
	                  disabled={isAnswerSubmitting || isSkippingSection}
	                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/86 px-4 py-2 text-[0.76rem] font-semibold text-[#4B6382] shadow-[0_8px_18px_rgba(26,115,232,0.08)] ring-1 ring-white/90 transition-all hover:bg-white hover:text-[#1A73E8] hover:shadow-[0_10px_22px_rgba(26,115,232,0.13)]">
	                  {isSkippingSection ? 'Skipping...' : isLastCategory ? 'Finish section' : 'Skip section'}
	                  <ArrowRight size={12} />
	                </button>
              </div>

            </div>
          )}
        </div>
      </section>
      <AnimatePresence initial={false}>
        {explainOpen && questionCoach && (
          <motion.div
            ref={coachPanelRef}
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mt-3 overflow-hidden">
            <div className="rounded-[24px] border border-white/75 bg-white/74 p-4 text-left shadow-[0_18px_46px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1A73E8]">Question coach</p>
                </div>
                <button
                  onClick={closeQuestionCoach}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5F6368] transition hover:bg-white hover:text-[#1A73E8]"
                  aria-label="Close question coach">
                  <X size={15} />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-[0.95rem] font-semibold text-[#1A73E8]">{activeCategoryInfo.label}</p>
                <p className="mt-1.5 max-w-[42rem] text-[0.82rem] leading-6 text-[#4B6382]">{categoryCoachSummary}</p>
              </div>

              {studentCoachStatus === 'loading' && (
                <div className="mt-4 rounded-[18px] bg-white/46 px-4 py-4 text-[0.84rem] font-medium text-[#4B6382] ring-1 ring-white/72">
                  Generating AI coaching for this exact question...
                </div>
              )}

              {displayQuestionCoach && studentCoachStatus !== 'loading' && (
              <div className="mt-4 divide-y divide-[#E6EAF0]/80">
                <div className="py-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#1A73E8]">Simple version</p>
                  <p className="mt-1.5 text-[0.84rem] leading-6 text-[#3C4043]">{displayQuestionCoach.simpleQuestion || displayQuestionCoach.simpler}</p>
                </div>

                <div className="py-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#1A73E8]">Why the NGO asks</p>
                  <p className="mt-1.5 text-[0.84rem] leading-6 text-[#3C4043]">{displayQuestionCoach.whyNgoAsks || displayQuestionCoach.purpose}</p>
                </div>

                <div className="py-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#1A73E8]">Tips to answer</p>
                  <div className="mt-1.5 space-y-1.5">
                    {displayQuestionCoach.tips?.map(tip => (
                      <p key={tip} className="flex gap-2 text-[0.84rem] leading-6 text-[#3C4043]">
                        <CheckCircle2 size={14} className="mt-1 shrink-0 text-[#1A73E8]" />
                        <span>{tip}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="py-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#1A73E8]">Example answer</p>
                  <p className="mt-2 text-[0.84rem] leading-6 text-[#3C4043]">{exampleAnswer}</p>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setDraftAnswer(exampleAnswer)}
                      className="inline-flex items-center rounded-full bg-[#1A73E8] px-3.5 py-1.5 text-[0.72rem] font-semibold text-white shadow-[0_8px_18px_rgba(26,115,232,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(26,115,232,0.22)]">
                      Insert answer
                    </button>
                  </div>
                </div>
              </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <aside
        className="relative flex max-h-none flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/66 shadow-[0_24px_70px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-2xl xl:sticky xl:top-6 xl:h-[calc(100vh-132px)]">
        <div className="relative flex shrink-0 items-center gap-3 border-b border-white/70 bg-white/48 px-4 py-4 backdrop-blur-xl">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90">
            <Layers size={16} strokeWidth={2.15} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5F6368]">Reference</p>
            <p className="text-[1rem] font-semibold text-[#202124]">Practice context</p>
          </div>
        </div>
        <div className="relative z-10 min-h-0 flex-1 space-y-2 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,251,255,0.68),rgba(255,255,255,0.42))] p-3">
          <div
            className={`rounded-2xl border backdrop-blur-xl transition-colors ${
              descriptionOpen
                ? 'border-[#BFD7FF] bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(232,240,254,0.54))] shadow-[0_10px_22px_rgba(26,115,232,0.075),0_1px_0_rgba(255,255,255,0.94)_inset,0_-1px_0_rgba(26,115,232,0.035)_inset]'
                : 'border-[#D7E6FF] bg-[linear-gradient(135deg,rgba(255,255,255,0.66),rgba(232,240,254,0.34))] shadow-[0_7px_18px_rgba(26,115,232,0.045),0_1px_0_rgba(255,255,255,0.84)_inset,0_-1px_0_rgba(26,115,232,0.025)_inset]'
            }`}>
            <button
              onClick={() => setDescriptionOpen(!descriptionOpen)}
              className={`sticky top-0 z-10 flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white ${
                descriptionOpen ? 'rounded-t-2xl bg-white/86' : 'rounded-2xl bg-white/54'
              }`}>
              <span className="flex items-center gap-2.5 text-[0.84rem] font-semibold text-[#202124]">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  descriptionOpen ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'bg-white/74 text-[#4B6382]'
                }`}>
                  <FileText size={14} />
                </span>
                Job description
              </span>
              {descriptionOpen ? <ChevronUp size={15} className="text-[#5F6368]" /> : <ChevronDown size={15} className="text-[#5F6368]" />}
            </button>
            <AnimatePresence initial={false}>
              {descriptionOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden rounded-b-2xl border-t border-[#E6EAF0]">
                  <div className="px-4 py-4">
                    <p className="text-[0.8rem] leading-6 text-[#5F6368]">{selectedRole.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </aside>
      </div>
    </motion.div>
  )
}

function NGOView({ onPracticeChange }) {
  const { user } = useApp()
  const navigate = useNavigate()
  const { ngoOpportunityId } = useParams()
  const isPracticeRoute = Boolean(ngoOpportunityId)
  const recognitionRef = useRef(null)
  const questionRecordingBaseRef = useRef('')
  const questionFinalTranscriptRef = useRef('')
  const questionTextareaRef = useRef(null)
  const messageIdRef = useRef(0)
  const practiceBoxRef = useRef(null)
  const stepCoachRef = useRef(null)
  const stepCoachPanelRef = useRef(null)
  const studentAnswerAudioRef = useRef(null)
  const studentAnswerAudioRequestRef = useRef(0)
  const studentAnswerAudioBlobCacheRef = useRef(new Map())
  const studentAnswerAudioPromiseCacheRef = useRef(new Map())
  const shouldAutoSpeakStudentAnswerRef = useRef(false)
  const [ngoOpportunities, setNgoOpportunities] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [openInsightKeys, setOpenInsightKeys] = useState(() => new Set())
  const [activeGuideSection, setActiveGuideSection] = useState('summary')
  const [openQuestionStage, setOpenQuestionStage] = useState(null)
  const [activeStage, setActiveStage] = useState('opening')
  const [dismissedReadyStages, setDismissedReadyStages] = useState(() => new Set())
  const [openPanel, setOpenPanel] = useState('')
  const [aiGuidanceOpen, setAiGuidanceOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isStudentResponding, setIsStudentResponding] = useState(false)
  const [exampleQuestionIndex, setExampleQuestionIndex] = useState(0)
  const [draftQuestion, setDraftQuestion] = useState('')
  const [transcript, setTranscript] = useState([])
  const [isStudentAnswerSpeaking, setIsStudentAnswerSpeaking] = useState(false)
  const [ngoGuideAi, setNgoGuideAi] = useState(null)
  const [ngoCoachAi, setNgoCoachAi] = useState(null)
  const [ngoSummaryAi, setNgoSummaryAi] = useState(null)
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
    if (ngoOpportunityId) {
      if (ngoOpportunities.some(opp => String(opp.id) === String(ngoOpportunityId))) {
        setSelectedRole(ngoOpportunityId)
      }
      return
    }
    if (selectedRole || ngoOpportunities.length === 0) return
    setSelectedRole(ngoOpportunities[0].id)
  }, [ngoOpportunityId, ngoOpportunities, selectedRole])

  useEffect(() => {
    return () => {
      stopQuestionRecording()
      stopStudentAnswerAudio()
    }
  }, [])

  const selectedOpp = ngoOpportunities.find(o => String(o.id) === String(selectedRole))

  useEffect(() => {
    onPracticeChange?.({
      active: practiceStarted || isPracticeRoute,
      summary: showSummary,
      title: selectedOpp?.title || '',
      onBack: () => {
        if (isPracticeRoute) {
          navigate('/interviews')
          return
        }
        setPracticeStarted(false)
        setShowSummary(false)
      },
    })
  }, [isPracticeRoute, navigate, practiceStarted, selectedOpp?.title, showSummary, onPracticeChange])

  useEffect(() => {
    if (!practiceStarted) return
    smoothScrollIntoView(practiceBoxRef.current)
  }, [practiceStarted])

  useEffect(() => {
    if (!isPracticeRoute || loading || practiceStarted || !selectedOpp) return
    startPracticeRoom()
  }, [isPracticeRoute, loading, practiceStarted, selectedOpp])

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
  const aiStageQuestions = ngoGuideAi?.questions?.[activeStage]
  const exampleQuestion = (aiStageQuestions?.[exampleQuestionIndex % Math.max(aiStageQuestions.length, 1)] || stageQuestions[exampleQuestionIndex % Math.max(stageQuestions.length, 1)] || firstQuestion)
  const effectiveStageGuidance = ngoCoachAi?.purpose || stageGuidance

  useEffect(() => {
    let cancelled = false
    setNgoGuideAi(null)
    if (!selectedOpp || !mockStudent) return

    generateNgoGuideAi(selectedOpp, mockStudent)
      .then(guide => { if (!cancelled) setNgoGuideAi(guide) })
      .catch(() => { if (!cancelled) setNgoGuideAi(null) })

    return () => { cancelled = true }
  }, [selectedOpp?.id])

  useEffect(() => {
    let cancelled = false
    setNgoCoachAi(null)
    if (!aiGuidanceOpen || !selectedOpp) return

    generateStepCoachAi({
      role: selectedOpp,
      userType: 'ngo',
      stageId: activeStage,
      question: exampleQuestion,
      transcript,
      fallback: { purpose: stageGuidance, simpler: `What to get out of ${activeStageInfo.label.toLowerCase()}`, tips: [activeStageInfo.lookFor] },
    })
      .then(coach => { if (!cancelled) setNgoCoachAi(coach) })
      .catch(() => { if (!cancelled) setNgoCoachAi(null) })

    return () => { cancelled = true }
  }, [aiGuidanceOpen, selectedOpp?.id, activeStage, exampleQuestion])

  useEffect(() => {
    let cancelled = false
    setNgoSummaryAi(null)
    if (!showSummary || !selectedOpp) return

    generateInterviewSummaryAi({
      role: selectedOpp,
      userType: 'ngo',
      transcript,
      sections: NGO_INTERVIEW_STAGES.map(stage => ({ id: stage.id, label: stage.label })),
    })
      .then(summary => { if (!cancelled) setNgoSummaryAi(summary?.sections || null) })
      .catch(() => { if (!cancelled) setNgoSummaryAi(null) })

    return () => { cancelled = true }
  }, [showSummary, selectedOpp?.id])

  function nextMessageId(prefix) {
    messageIdRef.current += 1
    return `${prefix}-${messageIdRef.current}`
  }

  function openRole(roleId) {
    stopQuestionRecording()
    stopStudentAnswerAudio()
    setSelectedRole(roleId)
    setPracticeStarted(false)
    setShowSummary(false)
    setActiveGuideSection('summary')
    setActiveStage('opening')
    setDismissedReadyStages(new Set())
    setOpenPanel('')
    setAiGuidanceOpen(false)
    setIsRecording(false)
    setIsStudentResponding(false)
    setExampleQuestionIndex(0)
    setDraftQuestion('')
    setTranscript([])
    setNgoCoachAi(null)
    setNgoSummaryAi(null)
  }

  function startPracticeRoom() {
    if (!selectedOpp) return
    stopQuestionRecording()
    stopStudentAnswerAudio()
    setPracticeStarted(true)
    setShowSummary(false)
    setOpenInsightKeys(new Set())
    setActiveStage('opening')
    setDismissedReadyStages(new Set())
    setOpenPanel('')
    setAiGuidanceOpen(false)
    setIsRecording(false)
    setIsStudentResponding(false)
    setExampleQuestionIndex(0)
    setDraftQuestion('')
    setTranscript([])
    setNgoCoachAi(null)
    setNgoSummaryAi(null)
  }

  function openPracticeRoom() {
    if (!selectedOpp) return
    if (!isPracticeRoute) {
      navigate(`/interviews/ngo/practice/${selectedOpp.id}`)
      return
    }
    startPracticeRoom()
  }

  function backToNgoGuide() {
    stopQuestionRecording()
    stopStudentAnswerAudio()
    setPracticeStarted(false)
    setShowSummary(false)
    if (isPracticeRoute) navigate('/interviews')
  }

  async function sendQuestion() {
    const text = draftQuestion.trim()
    if (!text || isStudentResponding) return
    stopQuestionRecording()
    stopStudentAnswerAudio()
    const stage = activeStage
    const nextTranscript = [...transcript, { id: nextMessageId('q'), from: 'ngo', text, stage }]
    setTranscript(nextTranscript)
    setExampleQuestionIndex(0)
    setDraftQuestion('')
    setIsRecording(false)
    setIsStudentResponding(true)
    try {
      const reply = await generateNgoStudentReplyAi({
        role: selectedOpp,
        student: mockStudent,
        stageId: stage,
        transcript: nextTranscript,
        interviewerQuestion: text,
        fallback: makeStudentReply(selectedOpp, mockStudent, stage),
      })
      shouldAutoSpeakStudentAnswerRef.current = false
      getStudentAnswerSpeechBlob(reply).catch(() => null)
      setTranscript(prev => [
        ...prev,
        { id: nextMessageId('a'), from: 'student', text: reply, stage },
      ])
      window.setTimeout(() => speakStudentAnswer(reply), 0)
    } catch {
      const fallbackReply = makeStudentReply(selectedOpp, mockStudent, stage)
      shouldAutoSpeakStudentAnswerRef.current = false
      getStudentAnswerSpeechBlob(fallbackReply).catch(() => null)
      setTranscript(prev => [
        ...prev,
        { id: nextMessageId('a'), from: 'student', text: fallbackReply, stage },
      ])
      window.setTimeout(() => speakStudentAnswer(fallbackReply), 0)
    } finally {
      setIsStudentResponding(false)
    }
  }

  function goToNextStage() {
    const idx = NGO_INTERVIEW_STAGES.findIndex(stage => stage.id === activeStage)
    const next = NGO_INTERVIEW_STAGES[idx + 1]
    if (next) {
      setActiveStage(next.id)
      setDismissedReadyStages(prev => {
        const nextDismissed = new Set(prev)
        nextDismissed.delete(next.id)
        return nextDismissed
      })
      setExampleQuestionIndex(0)
      setDraftQuestion('')
    } else {
      setShowSummary(true)
    }
    window.setTimeout(() => {
      practiceBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
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

  function keepAskingCurrentStage() {
    setDismissedReadyStages(prev => new Set(prev).add(activeStage))
  }

  function stopQuestionRecording() {
    recognitionRef.current?.stop?.()
    recognitionRef.current = null
    setIsRecording(false)
  }

  function stopStudentAnswerAudio() {
    studentAnswerAudioRequestRef.current += 1
    studentAnswerAudioRef.current?.pause?.()
    if (studentAnswerAudioRef.current?.src) URL.revokeObjectURL(studentAnswerAudioRef.current.src)
    studentAnswerAudioRef.current = null
    window.speechSynthesis?.cancel?.()
    setIsStudentAnswerSpeaking(false)
  }

  async function getStudentAnswerSpeechBlob(text) {
    const cleanText = String(text || '').trim()
    if (!cleanText) return null
    const cachedBlob = studentAnswerAudioBlobCacheRef.current.get(cleanText)
    if (cachedBlob) return cachedBlob
    const cachedPromise = studentAnswerAudioPromiseCacheRef.current.get(cleanText)
    if (cachedPromise) return cachedPromise

    const audioPromise = createHiveSpeech({ input: cleanText })
      .then(audioBlob => {
        studentAnswerAudioBlobCacheRef.current.set(cleanText, audioBlob)
        studentAnswerAudioPromiseCacheRef.current.delete(cleanText)
        return audioBlob
      })
      .catch(error => {
        studentAnswerAudioPromiseCacheRef.current.delete(cleanText)
        throw error
      })
    studentAnswerAudioPromiseCacheRef.current.set(cleanText, audioPromise)
    return audioPromise
  }

  function speakStudentAnswerWithBrowserSpeech(text, requestId) {
    if (!window.speechSynthesis || studentAnswerAudioRequestRef.current !== requestId) {
      setIsStudentAnswerSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(prepareQuestionSpeech(text))
    utterance.lang = 'en-US'
    utterance.rate = 0.97
    utterance.pitch = 1.02
    utterance.volume = 0.95
    utterance.onend = () => {
      if (studentAnswerAudioRequestRef.current === requestId) setIsStudentAnswerSpeaking(false)
    }
    utterance.onerror = () => setIsStudentAnswerSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  async function speakStudentAnswer(text = currentAnswerMsg?.text) {
    const cleanText = String(text || '').trim()
    if (!cleanText) return
    if (isStudentAnswerSpeaking) {
      stopStudentAnswerAudio()
      return
    }

    stopStudentAnswerAudio()
    const requestId = studentAnswerAudioRequestRef.current + 1
    studentAnswerAudioRequestRef.current = requestId
    setIsStudentAnswerSpeaking(true)

    try {
      const audioBlob = await getStudentAnswerSpeechBlob(cleanText)
      if (studentAnswerAudioRequestRef.current !== requestId) {
        setIsStudentAnswerSpeaking(false)
        return
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      studentAnswerAudioRef.current = audio
      audio.onended = () => {
        if (studentAnswerAudioRequestRef.current === requestId) setIsStudentAnswerSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        if (studentAnswerAudioRef.current === audio) studentAnswerAudioRef.current = null
      }
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        if (studentAnswerAudioRequestRef.current === requestId) speakStudentAnswerWithBrowserSpeech(cleanText, requestId)
      }
      await audio.play()
    } catch {
      speakStudentAnswerWithBrowserSpeech(cleanText, requestId)
    }
  }

  function handleVoiceToggle() {
    if (isRecording) {
      stopQuestionRecording()
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
    recognition.continuous = true
    questionRecordingBaseRef.current = draftQuestion.trim()
    questionFinalTranscriptRef.current = ''
    recognition.onresult = event => {
      let finalText = ''
      let interimText = ''
      Array.from(event.results).forEach(result => {
        const transcript = result[0]?.transcript?.trim()
        if (!transcript) return
        if (result.isFinal) finalText += `${transcript} `
        else interimText += `${transcript} `
      })

      questionFinalTranscriptRef.current = finalText.trim()
      const nextText = [
        questionRecordingBaseRef.current,
        questionFinalTranscriptRef.current,
        interimText.trim(),
      ].filter(Boolean).join(' ')
      setDraftQuestion(nextText)
    }
    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null
    }
    recognition.onerror = () => stopQuestionRecording()
    recognitionRef.current = recognition
    setIsRecording(true)
    recognition.start()
  }

  function toggleStepCoach() {
    setAiGuidanceOpen(open => {
      const nextOpen = !open
      window.setTimeout(() => {
        if (nextOpen) {
          stepCoachPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        } else {
          practiceBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, nextOpen ? 260 : 80)
      return nextOpen
    })
  }

  useEffect(() => {
    const textarea = questionTextareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 224)}px`
  }, [draftQuestion, isStudentResponding])

  const latestActiveStudentAnswer = [...transcript]
    .reverse()
    .find(message => message.stage === activeStage && message.from === 'student')

  useEffect(() => {
    if (!shouldAutoSpeakStudentAnswerRef.current || !latestActiveStudentAnswer?.id || isStudentResponding) return
    shouldAutoSpeakStudentAnswerRef.current = false
    speakStudentAnswer(latestActiveStudentAnswer.text)
  }, [latestActiveStudentAnswer?.id, isStudentResponding])

  if (loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="h-[600px] rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_46px_rgba(26,115,232,0.08)] backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between gap-3 px-1">
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded-full bg-[#D7E6FF]" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-[#E8F0FE]" />
            </div>
            <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#E8F0FE]" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-[22px] border border-white/70 bg-white/58 px-4 py-4 shadow-[0_8px_20px_rgba(26,115,232,0.04)]">
                <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#E8F0FE]" />
                <div className="mt-3 h-3 w-2/3 animate-pulse rounded-full bg-[#F1F5F9]" />
              </div>
            ))}
          </div>
        </aside>
        <section className="min-h-[560px] rounded-[34px] border border-white/75 bg-white/76 p-7 shadow-[0_24px_70px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl">
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
      <div className="rounded-[28px] border border-white/75 bg-white/76 px-6 py-16 text-center shadow-[0_24px_70px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl">
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
        <aside
          className="overflow-y-auto rounded-[30px] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(248,251,255,0.34))] p-4 shadow-[0_24px_64px_rgba(26,115,232,0.085),0_1px_0_rgba(255,255,255,0.96)_inset,0_-1px_0_rgba(26,115,232,0.025)_inset] backdrop-blur-2xl"
          style={{ height: '600px' }}>
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#1A73E8]">Posted roles</p>
              <p className="mt-1 text-[0.84rem] text-[#5F6368]">{ngoOpportunities.length} role{ngoOpportunities.length !== 1 ? 's' : ''} ready</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90">
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
                  className={`group relative w-full overflow-hidden rounded-[24px] border px-4 py-5 text-left after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.62),transparent_34%)] ring-1 ring-white/55 backdrop-blur-2xl transition-all hover:-translate-y-0.5 ${
                    active
                      ? 'border-transparent bg-[linear-gradient(135deg,rgba(232,240,254,0.98),rgba(210,227,252,0.84))] shadow-[0_14px_32px_rgba(26,115,232,0.16),0_1px_0_rgba(255,255,255,0.92)_inset,0_-1px_0_rgba(26,115,232,0.04)_inset]'
                      : 'border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.66))] shadow-[0_10px_24px_rgba(32,33,36,0.05),0_1px_0_rgba(255,255,255,0.94)_inset] hover:border-white/90 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,255,255,0.78))] hover:shadow-[0_13px_30px_rgba(32,33,36,0.065),0_1px_0_rgba(255,255,255,0.97)_inset]'
                  }`}>
                  <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`line-clamp-1 text-[0.98rem] font-semibold leading-snug ${active ? 'text-[#1A73E8]' : 'text-[#202124]'}`}>
                        {opp.title}
                      </p>
                      <p className="mt-1.5 truncate text-[0.78rem] text-[#5F6368]">
                        {opp.category || [opp.workMode, opp.location].filter(Boolean).join(' · ') || 'Flexible role'}
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
          <section className="min-h-[560px] overflow-hidden rounded-[34px] border border-white/75 bg-white/76 shadow-[0_24px_70px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl">
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
              <div className="relative overflow-hidden rounded-[30px] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.82)_0%,rgba(248,251,255,0.66)_52%,rgba(232,240,254,0.54)_100%)] px-6 py-6 shadow-[0_18px_48px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
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
                    className="flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#1A73E8] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_12px_28px_rgba(26,115,232,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#1765CC] hover:shadow-[0_18px_38px_rgba(26,115,232,0.28)]">
                    <PlayCircle size={20} />
                    Practice interview
                  </button>
                </div>
              </div>

              <div className="mt-9 grid w-full grid-cols-1 gap-2 rounded-[24px] border border-white/90 bg-white/95 p-2 shadow-[0_14px_34px_rgba(26,115,232,0.045),0_1px_0_rgba(255,255,255,0.98)_inset] backdrop-blur-2xl sm:grid-cols-3">
                {guideSections.map(section => {
                  const Icon = section.icon
                  const active = activeGuideSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveGuideSection(section.id)}
                      className={`inline-flex h-12 items-center justify-center gap-2 rounded-[18px] px-4 text-[0.84rem] font-semibold transition-all duration-300 ${
                        active
                          ? 'bg-[linear-gradient(135deg,rgba(232,240,254,0.98),rgba(210,227,252,0.86))] text-[#1A73E8] shadow-[0_12px_26px_rgba(26,115,232,0.14),0_1px_0_rgba(255,255,255,0.92)_inset]'
                          : 'bg-white/42 text-[#5F6368] ring-1 ring-white/50 hover:bg-white/72 hover:text-[#1A73E8]'
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
                        {ngoGuideAi?.summary || roleSummary}
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
                        {NGO_INTERVIEW_STAGES.map((stage, i) => {
                          const aiPhase = ngoGuideAi?.whatToKnow?.[i]
                          return (
                          <div key={stage.id} className="flex gap-4 rounded-[22px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] p-5 shadow-[0_12px_28px_rgba(32,33,36,0.05),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[0.78rem] font-bold text-[#1A73E8]">
                              {String(i + 1).padStart(2, '0')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[1.05rem] font-bold text-[#202124]">{stage.label}</p>
                              <p className="mt-1.5 text-[0.92rem] leading-7 text-[#4B5058]">
                                {aiPhase?.text || aiPhase?.items?.join(' ') || (mockStudent ? makeStageGuidance(selectedOpp, mockStudent, stage.id) : '')}
                              </p>
                            </div>
                          </div>
                        )})}
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
                          const questions = ngoGuideAi?.questions?.[stage.id] || makeStageQuestions(selectedOpp, mockStudent, stage.id)
                          return (
                            <div key={stage.id} className="overflow-hidden rounded-[22px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62))] shadow-[0_12px_28px_rgba(32,33,36,0.05),0_1px_0_rgba(255,255,255,0.92)_inset] backdrop-blur-2xl">
                              <button
                                onClick={() => setOpenQuestionStage(isOpen ? null : stage.id)}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/70">
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
                                    <div className="space-y-3.5 border-t border-white/70 bg-white/52 backdrop-blur-xl px-5 py-4">
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

              <div className="flex flex-col gap-3 border-t border-white/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => navigate(`/opportunities?opportunity=${encodeURIComponent(selectedOpp.id)}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/75 bg-white/72 px-4 py-2.5 shadow-[0_8px_18px_rgba(32,33,36,0.045),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl text-[0.82rem] font-semibold text-[#1A73E8] transition-colors hover:bg-white/70">
                  View role details
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={openPracticeRoom}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A73E8] px-5 py-3 text-[0.84rem] font-semibold text-white shadow-[0_12px_26px_rgba(26,115,232,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#1765CC] hover:shadow-[0_16px_34px_rgba(26,115,232,0.28)]">
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
	        className="relative mx-auto max-w-6xl space-y-6">
	        <div>
	          <div className="min-w-0">
	            <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-[#202124]">Interview summary</h2>
	            <p className="truncate text-[0.9rem] text-[#5F6368]">{mockStudent.name} · {selectedOpp.title}</p>
	          </div>
	        </div>

        {/* Headline numbers — dashboard-style KPI tiles with pastel waves */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Questions asked', value: questionsAsked, icon: MessageCircle, tint: '#E8F0FE', accent: '#1A73E8' },
            { label: 'Answers given', value: answersGiven, icon: UserRound, tint: '#F1F5F9', accent: '#4B6382' },
          ].map((stat, statIndex) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05 * statIndex }}
	              className="group relative min-h-[190px] overflow-hidden rounded-[28px] border border-[#DDE8F8]/65 bg-white/72 p-5 text-left shadow-[0_20px_54px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.72)_inset,0_0_0_1px_rgba(26,115,232,0.025)_inset] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:bg-white/84 hover:shadow-[0_26px_68px_rgba(26,115,232,0.12),0_0_0_1px_rgba(26,115,232,0.035)_inset]">
	              <svg
	                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full transition-transform duration-300 group-hover:translate-y-[-2px]"
	                viewBox="0 0 300 100"
	                preserveAspectRatio="none"
	                aria-hidden="true">
	                <path d="M0,30 C62,58 96,8 154,28 C214,48 242,12 300,32 L300,100 L0,100 Z" fill={stat.tint} opacity="0.55" />
	                <path d="M0,48 C66,26 112,60 172,42 C224,26 258,54 300,46 L300,100 L0,100 Z" fill={stat.tint} opacity="0.82" />
	              </svg>
	              <div className="relative z-10">
	                <p className="text-[0.82rem] font-semibold text-[#5F6368]">{stat.label}</p>
	                <p className="mt-8 text-[2.45rem] font-semibold leading-none tracking-[-0.03em] text-[#202124]">{stat.value}</p>
	                <p className="mt-3 max-w-[13rem] text-[0.82rem] leading-5 text-[#5F6368]">
	                  {stat.label === 'Questions asked' ? 'Interviewer prompts practiced' : 'Simulated student responses'}
	                </p>
	              </div>
	            </motion.div>
	          ))}
	          <motion.div
	            initial={{ opacity: 0, y: 14 }}
	            animate={{ opacity: 1, y: 0 }}
	            transition={{ duration: 0.28, delay: 0.1 }}
	            className="group relative min-h-[190px] overflow-hidden rounded-[28px] border border-[#DDE8F8]/65 bg-white/72 p-5 text-left shadow-[0_20px_54px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.72)_inset,0_0_0_1px_rgba(26,115,232,0.025)_inset] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:bg-white/84 hover:shadow-[0_26px_68px_rgba(26,115,232,0.12),0_0_0_1px_rgba(26,115,232,0.035)_inset]">
	            <svg
	              className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full transition-transform duration-300 group-hover:translate-y-[-2px]"
	              viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
	              <path d="M0,30 C62,58 96,8 154,28 C214,48 242,12 300,32 L300,100 L0,100 Z" fill="#E6F4EA" opacity="0.55" />
	              <path d="M0,48 C66,26 112,60 172,42 C224,26 258,54 300,46 L300,100 L0,100 Z" fill="#E6F4EA" opacity="0.82" />
	            </svg>
	            <div className="relative z-10">
	              <div className="flex items-start justify-between">
	                <p className="text-[0.82rem] font-semibold text-[#5F6368]">Stages covered</p>
	                <CompletionRing value={coveredStages.length} total={NGO_INTERVIEW_STAGES.length} color="#188038" />
	              </div>
	              <p className="mt-4 text-[2.45rem] font-semibold leading-none tracking-[-0.03em] text-[#202124]">
	                {coveredStages.length}<span className="text-[1.1rem] font-medium text-[#9AA0A6]">/{NGO_INTERVIEW_STAGES.length}</span>
	              </p>
	              <p className="mt-3 max-w-[13rem] text-[0.82rem] leading-5 text-[#5F6368]">Interview stages with at least one question</p>
	            </div>
	          </motion.div>
	        </div>

        {/* One card per interview stage, with generous space between */}
        {stagesRecap.map((stage, index) => {
          const learnedKey = `${stage.id}-learned`
          const improveKey = `${stage.id}-improve`
          const learnedOpen = openInsightKeys.has(learnedKey)
          const improveOpen = openInsightKeys.has(improveKey)
          const aiFeedback = ngoSummaryAi?.[stage.id] || null
          const StageIcon = stage.icon
          return (
	            <motion.section
	              key={stage.id}
	              initial={{ opacity: 0, y: 10 }}
	              animate={{ opacity: 1, y: 0 }}
	              transition={{ duration: 0.25, delay: 0.05 * index }}
	              className="group overflow-hidden rounded-[28px] border border-white/75 bg-white/66 shadow-[0_18px_50px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.82)_inset] backdrop-blur-2xl transition-all hover:-translate-y-0.5 duration-200 hover:bg-white/76 hover:shadow-[0_24px_64px_rgba(26,115,232,0.12)]">
	              <span className="block h-px bg-white/70" />
	              <div className="flex items-center gap-3 border-b border-white/70 bg-white/42 px-6 py-4 backdrop-blur-xl">
	                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90 transition-transform duration-200 group-hover:scale-110">
	                  <StageIcon size={18} strokeWidth={2.15} />
	                </span>
	                <div className="min-w-0 flex-1">
	                  <h2 className="text-[0.98rem] font-semibold text-[#202124]">{stage.label}</h2>
	                </div>
	                <span
	                  className="shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
	                  style={stage.covered
	                    ? { background: '#EEF4FF', color: '#3F6FB6' }
	                    : { background: '#F5F7FA', color: '#8A94A3' }}>
	                  {stage.covered ? `${stage.qaPairs.length} question${stage.qaPairs.length !== 1 ? 's' : ''}` : 'Not covered'}
	                </span>
	              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_340px]">
	                <div className="min-w-0">
	                  {stage.covered && (
	                    <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">Conversation</p>
	                  )}
	                  {stage.covered ? (
	                    <div className="space-y-4">
	                      {stage.qaPairs.map((pair, pairIndex) => (
	                        <div key={pair.id} className={pairIndex > 0 ? 'border-t border-[#F1F3F4] pt-4' : ''}>
	                          <div className="mb-2 inline-block max-w-[85%] rounded-2xl rounded-tl-md bg-[#F1F5F9] px-3.5 py-2 ring-1 ring-[#E6EAF0]">
	                            <p className="text-[0.86rem] font-medium leading-6 text-[#202124]">{pair.question}</p>
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
	                    <div className="rounded-[20px] border border-dashed border-[#D7E6FF] bg-white/54 px-4 py-4 shadow-[0_10px_24px_rgba(26,115,232,0.05)]">
	                      <p className="text-[0.86rem] leading-6 text-[#5F6368]">{aiFeedback?.whatHappened || stage.prompt}</p>
	                      <p className="mt-2 text-[0.78rem] font-medium text-[#1A73E8]">
	                        Try covering this stage in your next practice run.
	                      </p>
	                    </div>
                  )}
                </div>

	                <div className="min-w-0">
	                  <div className="space-y-3">
	                    <div
	                      className="overflow-hidden rounded-[20px] border border-white/75 bg-white/52 shadow-[0_8px_22px_rgba(26,115,232,0.05)] transition-colors">
	                      <button
	                        onClick={() => toggleInsight(learnedKey)}
	                        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
	                        <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#202124]">
	                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF7EF] text-[#4F9D69] ring-1 ring-[#D7ECDD]">
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
	                            className="overflow-hidden border-t border-white/70">
                            <p className="px-3.5 py-3 text-[0.82rem] leading-6 text-[#5F6368]">
                              {stage.covered ? (aiFeedback?.wentWell || stage.lookFor) : `Once you ask about this, listen for: ${stage.lookFor}`}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
	                    </div>

	                    <div
	                      className="overflow-hidden rounded-[20px] border border-white/75 bg-white/52 shadow-[0_8px_22px_rgba(26,115,232,0.05)] transition-colors">
	                      <button
	                        onClick={() => toggleInsight(improveKey)}
	                        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
	                        <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-[#202124]">
	                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[#5F8FD8] ring-1 ring-[#DDE9FB]">
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
	                            className="overflow-hidden border-t border-white/70">
                            <p className="px-3.5 py-3 text-[0.82rem] leading-6 text-[#5F6368]">
                              {stage.covered
                                ? (aiFeedback?.couldImprove || (stage.suggestedFollowUp
                                  ? `Consider also asking: "${stage.suggestedFollowUp}"`
                                  : 'You asked a full round of questions here — nice and thorough.'))
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
	            onClick={backToNgoGuide}
	            className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/64 px-6 py-3 text-[0.88rem] font-semibold text-[#1A73E8] shadow-[0_10px_24px_rgba(26,115,232,0.10)] backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:-translate-y-0.5 hover:bg-white">
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
  const stageReadyToMove = questionsAskedInStage >= 2 && !isStudentResponding && !dismissedReadyStages.has(activeStage)

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
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="relative">
      <section
        className="relative flex min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/72 shadow-[0_24px_70px_rgba(26,115,232,0.12),0_1px_0_rgba(255,255,255,0.75)_inset] backdrop-blur-2xl xl:h-[calc(100vh-132px)]">

        <div className="relative border-b border-white/70 bg-white/58 px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.70)_inset] backdrop-blur-xl sm:px-5">
          <div className="grid min-w-0 grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-center rounded-[24px] border border-white/80 bg-white/54 px-1.5 py-1.5 shadow-[0_10px_30px_rgba(26,115,232,0.07),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-xl">
              {NGO_INTERVIEW_STAGES.map((stage, index) => {
                const isActive = activeStage === stage.id
                const isDone = askedStages.has(stage.id) && !isActive
                const stepButton = (
                  <button
                    onClick={() => setActiveStage(stage.id)}
                    className={`mx-auto inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[0.72rem] font-semibold transition-all lg:gap-2 lg:px-3.5 lg:text-[0.78rem] ${
                      isActive
                        ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(230,244,234,0.94))] text-[#188038] shadow-[0_10px_22px_rgba(24,128,56,0.14),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-[#B7E1C1]'
                        : isDone
                        ? 'text-[#1A73E8] hover:bg-white/70'
                        : 'text-[#6B7280] hover:bg-white/62 hover:text-[#3C4043]'
                    }`}>
                    <span
                      className={`flex h-2 w-2 shrink-0 rounded-full ring-[3px] lg:h-2.5 lg:w-2.5 lg:ring-4 ${
                        isActive
                          ? 'bg-[#188038] ring-[#DFF3E6]'
                          : isDone
                          ? 'bg-[#1A73E8] ring-[#EEF4FF]'
                          : 'bg-[#C4CBD6] ring-[#F3F6FA]'
                      }`}
                    />
                    <span className="truncate">{stage.label}</span>
                  </button>
                )
                return index === 0 ? (
                  <div key={stage.id} className="min-w-0 text-center">
                    {stepButton}
                  </div>
                ) : (
                  <>
                    <div key={`${stage.id}-line`} className="px-1.5">
                      <span
                        className={`block h-px w-full min-w-5 rounded-full ${
                          isActive ? 'bg-[#188038]/24' : isDone ? 'bg-[#1A73E8]/25' : 'bg-white/80'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <div key={stage.id} className="min-w-0 text-center">
                      {stepButton}
                    </div>
                  </>
                )
              })}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.84)_46%,rgba(248,251,255,0.92)_100%)] px-4 py-5 sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.98),rgba(255,255,255,0.76)_36%,rgba(232,240,254,0.34)_68%,transparent_88%)]" aria-hidden="true" />
            {transcript.length === 0 ? (
              <div className="relative mx-auto flex h-full min-h-[300px] max-w-xl flex-col items-center justify-center text-center">
	                <div className="relative flex h-[140px] w-[140px] items-center justify-center">
	                  <motion.span
	                    className="absolute h-[86px] w-[86px] rounded-full border-2 border-[#1A73E8]/28 blur-[1px]"
	                    animate={{ scale: [0.92, 1.62, 0.92], opacity: [0.46, 0.05, 0.46] }}
	                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
	                  />
	                  <motion.span
	                    className="absolute h-[92px] w-[92px] rounded-full border border-[#66A7F4]/30 blur-[2px]"
	                    animate={{ scale: [0.76, 1.38, 0.76], opacity: [0.08, 0.4, 0.08] }}
	                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
	                  />
	                  <motion.span
	                    className="absolute h-[78px] w-[78px] rounded-full bg-[radial-gradient(circle,rgba(26,115,232,0.18)_0%,rgba(102,167,244,0.12)_42%,transparent_72%)] blur-md"
	                    animate={{ scale: [0.85, 1.5, 0.85], opacity: [0.5, 0.14, 0.5] }}
	                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.35 }}
	                  />
                  <motion.button
                    onClick={handleVoiceToggle}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    title={isRecording ? 'Stop recording' : 'Start recording'}
                    animate={{ scale: isRecording ? [1, 1.055, 1] : [1, 1.025, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className={`relative z-10 flex h-[88px] w-[88px] items-center justify-center rounded-full border border-[#A8CCFF]/75 bg-[linear-gradient(135deg,#6EAEFF_0%,#1A73E8_56%,#1558C0_100%)] text-white shadow-[0_18px_42px_rgba(26,115,232,0.42),0_1px_0_rgba(255,255,255,0.45)_inset] transition-shadow hover:shadow-[0_24px_52px_rgba(26,115,232,0.48)] ${
                      isRecording ? 'ring-8 ring-[#1A73E8]/20' : ''
                    }`}>
                    {isRecording ? <StopCircle size={38} strokeWidth={1.8} /> : <Mic size={40} strokeWidth={1.9} />}
                  </motion.button>
		                </div>
		                <p className="relative mt-5 text-[1.45rem] font-semibold tracking-[-0.02em] text-[#202124]">Start the interview</p>
		                <p className="relative mt-1.5 max-w-md text-[0.94rem] leading-7 text-[#5F6368]">
		                  {isRecording ? 'Listening — tap again to stop.' : 'Type or tap the mic to speak your opening question.'}
		                </p>
		              </div>
            ) : stageMessages.length === 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative mx-auto flex h-full min-h-[260px] max-w-lg flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#0D183D] ring-1 ring-[#E6EAF0]">
                    <activeStageInfo.icon size={22} strokeWidth={2.15} />
                  </span>
                  <p className="mt-5 text-[1.16rem] font-semibold tracking-tight text-[#202124]">
                    On to {activeStageInfo.label.toLowerCase()}
                  </p>
                  <p className="mt-2 max-w-sm text-[0.9rem] leading-7 text-[#5F6368]">{activeStageInfo.prompt}</p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="relative mx-auto flex h-full min-h-[260px] max-w-3xl flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeStage}-${currentQuestionMsg?.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="space-y-5 px-4 py-5 sm:px-5">

                    {/* Answer — the main event, avatar-led and elevated */}
                      <div className="flex items-start gap-3">
                        <GradientAvatar name={mockStudent.name} size={36} radius="0.7rem" className="mt-1 shrink-0 shadow-sm" />
                      <div className="relative min-w-0 flex-1 overflow-hidden rounded-[26px] rounded-tl-md border border-white/80 bg-white/86 px-5 pb-5 pt-4 shadow-[0_18px_46px_rgba(26,115,232,0.09),0_1px_0_rgba(255,255,255,0.94)_inset] backdrop-blur-2xl">
                        {currentAnswerMsg ? (
                          <>
                            <button
                              type="button"
                              onClick={() => speakStudentAnswer(currentAnswerMsg.text)}
                              className={`absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full shadow-[0_8px_18px_rgba(26,115,232,0.08)] ring-1 transition-all ${
                                isStudentAnswerSpeaking
                                  ? 'bg-[#E8F0FE] text-[#1A73E8] ring-[#BFD7FF]'
                                  : 'bg-white/86 text-[#1A73E8] ring-white/90 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_22px_rgba(26,115,232,0.13)]'
                              }`}
                              aria-label={isStudentAnswerSpeaking ? 'Stop student answer audio' : 'Listen to student answer'}
                              title={isStudentAnswerSpeaking ? 'Stop audio' : 'Listen'}>
                              {isStudentAnswerSpeaking ? <StopCircle size={16} /> : <Volume2 size={16} />}
                            </button>
                            <div className="mb-3 flex flex-wrap items-center gap-2 pr-12">
                              <p className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#9AA0A6]">
                                {mockStudent.name}
                                <span className="rounded-full bg-[#F1F3F4] px-1.5 py-[3px] text-[0.58rem] font-semibold normal-case tracking-normal text-[#9AA0A6]">Simulated</span>
                              </p>
                              <span className="rounded-full bg-[#F8FBFF] px-3 py-1 text-[0.68rem] font-medium text-[#5F6368]">
                                {activeStageInfo.label}
                              </span>
                            </div>
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

                    <AnimatePresence>
                      {currentAnswerMsg && stageReadyToMove && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          transition={{ duration: 0.24, ease: 'easeOut' }}
                          className="ml-12 rounded-[24px] border border-[#D7E6FF]/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(232,240,254,0.62))] p-4 shadow-[0_16px_38px_rgba(26,115,232,0.11),0_1px_0_rgba(255,255,255,0.94)_inset] backdrop-blur-2xl">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-[0.9rem] font-semibold text-[#202124]">
                                {activeStageInfo.label} is covered
                              </p>
                              <p className="mt-1 text-[0.78rem] leading-5 text-[#5F6368]">
                                Keep going, or move to {isLastStage ? 'summary' : nextStage?.label.toLowerCase()}.
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <button
                                onClick={keepAskingCurrentStage}
                                className="inline-flex items-center rounded-full bg-white/86 px-3.5 py-2 text-[0.74rem] font-semibold text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)] ring-1 ring-white/90 transition-all hover:bg-white hover:shadow-[0_10px_22px_rgba(26,115,232,0.13)]">
                                Keep asking
                              </button>
                              <button
                                onClick={goToNextStage}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#1A73E8] px-3.5 py-2 text-[0.74rem] font-semibold text-white shadow-[0_10px_24px_rgba(26,115,232,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#1765CC]">
                                {isLastStage ? 'Finish' : 'Next section'}
                                <ArrowRight size={13} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="relative border-t border-white/70 bg-white/68 px-4 py-4 shadow-[0_-18px_40px_rgba(26,115,232,0.05)] backdrop-blur-xl sm:px-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                {transcript.length > 0 && !isStudentResponding && (
                  <div className="inline-flex items-center gap-1.5 text-[0.76rem] font-medium text-[#0D183D]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1A73E8] opacity-50" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1A73E8]" />
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
            </div>

            <div className={`rounded-[24px] border border-white/80 bg-white/62 p-2 shadow-[0_14px_34px_rgba(26,115,232,0.08),0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-[#D7E6FF]/70 backdrop-blur-2xl transition-all hover:-translate-y-0.5 ${
              isStudentResponding ? 'opacity-60' : 'focus-within:bg-white/86 focus-within:shadow-[0_18px_46px_rgba(26,115,232,0.14)] focus-within:ring-[#1A73E8]/35'
            }`}>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleVoiceToggle}
                  disabled={isStudentResponding}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                  title={isRecording ? 'Stop recording' : 'Start recording'}
                  className={`inline-flex h-11 shrink-0 self-center items-center justify-center gap-2 rounded-full px-4 text-[0.78rem] font-semibold transition-all ${
                    isRecording
                      ? 'bg-[#E8F0FE] text-[#1A73E8] shadow-[0_0_0_6px_rgba(26,115,232,0.10),0_10px_22px_rgba(26,115,232,0.14)] ring-1 ring-[#BFD7FF]'
                      : 'bg-white/72 text-[#1A73E8] shadow-[0_8px_18px_rgba(26,115,232,0.08)] ring-1 ring-white/90 hover:bg-white hover:shadow-[0_12px_26px_rgba(26,115,232,0.14)]'
                  } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-[#7B8492] disabled:hover:shadow-none`}>
                  {isRecording ? <StopCircle size={17} /> : <Mic size={17} />}
                  <span className="hidden sm:inline">{isRecording ? 'Stop' : 'Record'}</span>
                </button>
                <textarea
                  ref={questionTextareaRef}
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
                  className="max-h-56 min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-[0.92rem] leading-6 text-[#202124] outline-none placeholder:text-[#8A94A3] disabled:opacity-60"
                />
                <button
                  onClick={sendQuestion}
                  disabled={!draftQuestion.trim() || isStudentResponding}
                  className="flex h-10 w-10 shrink-0 self-center items-center justify-center rounded-full bg-[linear-gradient(135deg,#4C9AEF,#1A73E8)] text-white shadow-[0_10px_24px_rgba(26,115,232,0.28)] transition-all hover:scale-105 hover:shadow-[0_14px_30px_rgba(26,115,232,0.34)] disabled:scale-100 disabled:bg-none disabled:bg-[#DADCE0] disabled:text-white disabled:shadow-none"
                  aria-label="Send question">
                  <Send size={16} />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={toggleStepCoach}
                disabled={isStudentResponding}
	                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[0.76rem] font-semibold ring-1 transition-all ${
	                  aiGuidanceOpen
	                    ? 'bg-white text-[#1A73E8] shadow-[0_12px_26px_rgba(26,115,232,0.16)] ring-[#BFD7FF]'
	                    : 'bg-white text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-white/95 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(26,115,232,0.15)]'
	                } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white disabled:hover:text-[#1A73E8] disabled:hover:shadow-none`}>
	                <Info size={14} />
	                Explain step
	              </button>
	              <button
	                onClick={goToNextStage}
	                disabled={isStudentResponding}
	                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/86 px-4 py-2 text-[0.76rem] font-semibold text-[#4B6382] shadow-[0_8px_18px_rgba(26,115,232,0.08)] ring-1 ring-white/90 transition-all hover:bg-white hover:text-[#1A73E8] hover:shadow-[0_10px_22px_rgba(26,115,232,0.13)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white/86 disabled:hover:text-[#4B6382] disabled:hover:shadow-none">
	                {isLastStage ? 'Finish practice' : 'Skip section'}
	                <ArrowRight size={13} />
	              </button>
            </div>
          </div>
        </div>
      </section>
      <AnimatePresence initial={false}>
        {aiGuidanceOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mt-3 overflow-hidden">
            <div ref={stepCoachPanelRef} className="scroll-mb-4 rounded-[24px] border border-white/75 bg-white/74 p-4 text-left shadow-[0_18px_46px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1A73E8]">Step coach</p>
                  <p className="mt-1 text-[0.82rem] leading-6 text-[#5F6368]">What to get out of {activeStageInfo.label.toLowerCase()}</p>
                </div>
                <button
                  onClick={toggleStepCoach}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5F6368] transition hover:bg-white hover:text-[#1A73E8]"
                  aria-label="Close step coach">
                  <X size={15} />
                </button>
              </div>
              <p ref={stepCoachRef} className="mt-4 scroll-mt-6 text-[0.84rem] leading-6 text-[#3C4043]">{effectiveStageGuidance}</p>
              <div className="mt-4 rounded-[18px] border border-[#D7E6FF] bg-white/66 p-3.5 shadow-[0_10px_24px_rgba(26,115,232,0.06)]">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[#9AA0A6]">Suggested question</p>
                <p className="mt-2 text-[0.84rem] leading-6 text-[#3C4043]">{featuredQuestion}</p>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={suggestQuestion}
                    className="inline-flex items-center rounded-full bg-[#1A73E8] px-3 py-1.5 text-[0.7rem] font-semibold text-white shadow-[0_8px_18px_rgba(26,115,232,0.20)] transition-opacity hover:opacity-95">
                    Insert question
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <aside
        className="relative flex max-h-none flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/66 shadow-[0_24px_70px_rgba(26,115,232,0.10),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-2xl xl:sticky xl:top-6 xl:h-[calc(100vh-132px)]">
        <div className="relative flex shrink-0 items-center gap-3 border-b border-white/70 bg-white/48 px-4 py-4 backdrop-blur-xl">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFFFFF,#E8F0FE)] text-[#1A73E8] shadow-[0_10px_22px_rgba(26,115,232,0.10)] ring-1 ring-white/90">
            <Layers size={16} strokeWidth={2.15} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5F6368]">Reference</p>
            <p className="text-[1rem] font-semibold text-[#202124]">Interview context</p>
          </div>
        </div>
        <div className="relative z-10 min-h-0 flex-1 space-y-2 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,251,255,0.68),rgba(255,255,255,0.42))] p-3">
          {panels.map(panel => {
            const Icon = panel.icon
            const isOpen = openPanel === panel.id
            return (
	              <div
	                key={panel.id}
	                className={`rounded-2xl border backdrop-blur-xl transition-colors ${
	                  isOpen
                      ? 'border-[#BFD7FF] bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(232,240,254,0.54))] shadow-[0_10px_22px_rgba(26,115,232,0.075),0_1px_0_rgba(255,255,255,0.94)_inset,0_-1px_0_rgba(26,115,232,0.035)_inset]'
                      : 'border-[#D7E6FF] bg-[linear-gradient(135deg,rgba(255,255,255,0.66),rgba(232,240,254,0.34))] shadow-[0_7px_18px_rgba(26,115,232,0.045),0_1px_0_rgba(255,255,255,0.84)_inset,0_-1px_0_rgba(26,115,232,0.025)_inset]'
	                }`}>
                <button
	                  onClick={() => setOpenPanel(isOpen ? '' : panel.id)}
	                  className={`sticky top-0 z-10 flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white ${
	                    isOpen ? 'rounded-t-2xl bg-white/86' : 'rounded-2xl bg-white/54'
	                  }`}>
	                  <span className="flex items-center gap-2.5 text-[0.84rem] font-semibold text-[#202124]">
	                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
	                      isOpen ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'bg-white/74 text-[#4B6382]'
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
	                            className="overflow-hidden rounded-b-2xl border-t border-[#E6EAF0]">
                      <div className="max-h-[min(58vh,540px)] overflow-y-auto overscroll-contain px-4 py-4">
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
  const navigate = useNavigate()
  const { applicationId, opportunityId, ngoOpportunityId } = useParams()
  const isNGO = user?.role === 'ngo'
  const inStudentPractice = !isNGO && Boolean(applicationId || opportunityId)
  const inNGOPractice = isNGO && Boolean(ngoOpportunityId)
  const [practiceInfo, setPracticeInfo] = useState({ active: false, title: '' })
  const inPractice = (isNGO && (practiceInfo.active || inNGOPractice)) || inStudentPractice
  const mainRef = useRef(null)

  useEffect(() => {
    if (!practiceInfo.active) {
      smoothScrollToTop(mainRef.current)
    }
  }, [practiceInfo.active])

  return (
    <main ref={mainRef} className="relative flex-1 overflow-y-auto bg-[#F5F7FB]">
      {inPractice && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[450px] bg-[radial-gradient(circle_at_78%_2%,rgba(26,115,232,0.17),transparent_34%),radial-gradient(circle_at_58%_6%,rgba(232,240,254,0.62),transparent_38%),radial-gradient(circle_at_92%_18%,rgba(161,66,244,0.06),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(245,247,251,0))]" aria-hidden="true" />
          <svg
            className="pointer-events-none absolute right-0 top-[-34px] h-[330px] w-[820px] max-w-[86vw] text-[#1A73E8] [mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.45)_22%,rgba(0,0,0,0.9)_58%,rgba(0,0,0,0.72)_100%)]"
            viewBox="0 0 820 330"
            fill="none"
            aria-hidden="true"
          >
            <path d="M18 78 C138 18 255 27 360 88 C470 152 595 144 794 54" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" opacity="0.085" />
            <path d="M0 128 C148 49 282 72 405 140 C525 207 642 192 820 98" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" opacity="0.078" />
            <path d="M38 164 C170 92 302 112 430 174 C550 232 674 214 820 132" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" opacity="0.068" />
            <path d="M72 202 C203 132 319 150 442 208 C560 264 672 250 798 176" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.058" />
            <path d="M190 252 C302 203 420 206 528 249 C638 292 726 270 816 215" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.048" />
            <path d="M392 32 C454 52 490 88 553 100 C623 114 684 82 760 42" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.05" />
          </svg>
        </>
      )}
      <div className="relative z-10 mx-auto max-w-[1520px] px-6 pb-8 pt-8 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={inPractice ? 'mb-4' : 'mb-8'}
        >
          {inPractice && (
            <button
              onClick={() => isNGO ? (practiceInfo.onBack?.() || navigate('/interviews')) : navigate('/interviews')}
              className="mb-3 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-[#5F6368] transition-colors hover:text-[#1A73E8]">
              <ArrowLeft size={14} />
              Interview guide
            </button>
          )}
          {!(isNGO && practiceInfo.summary) && (
            <h1 className={inPractice ? 'text-[1.35rem] font-semibold leading-tight text-[#202124]' : 'text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-[1.02] text-[#202124]'}>
              {inPractice ? (isNGO ? `Interview practice: ${practiceInfo.title}` : 'Interview practice') : 'Interviews'}
            </h1>
          )}
          {!inPractice && (
            <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[#5F6368]">
              {isNGO
                ? 'Pick a posted role and practice with a generated student profile'
                : 'Practice mock interviews for the roles you applied to.'}
            </p>
          )}
        </motion.header>
        {isNGO ? <NGOView onPracticeChange={setPracticeInfo} /> : <StudentView />}
      </div>
    </main>
  )
}
