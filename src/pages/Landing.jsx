import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Search,
  Sparkles,
  Star,
  Users,
  BadgeCheck,
  UserRound,
  BarChart3,
  Heart,
  Globe2,
  Target,
  Zap,
  Brain,
  BookOpen,
  Clock,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  MessageSquare,
  Award,
  Building2,
  Mail,
  ExternalLink,
} from 'lucide-react'
import HiveLogo from '../components/HiveLogo'
import chatgptImage from '../assets/ChatGPT Image Jul 11, 2026, 04_03_41 AM.png'
import studentDashboard from '../assets/student dashboard.PNG'
import ngoDashboard from '../assets/ngo dashboard.PNG'
import student1Img from '../assets/student1.png'
import ngo1Img from '../assets/ngo1.png'

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'For Students', to: '/for-students' },
  { label: 'For NGOs', to: '/for-ngos' },
  { label: 'About Us', to: '/about' },
]

const FEATURE_CARDS = [
  {
    icon: Search,
    title: 'Find the right match',
    desc: 'We match your skills and interests with the right opportunities.',
    accent: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Gain real experience',
    desc: 'Work on meaningful projects and build your portfolio.',
    accent: 'green',
  },
  {
    icon: Users,
    title: 'Create impact',
    desc: 'Contribute to causes you care about and make a difference.',
    accent: 'amber',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted community',
    desc: 'A safe, supportive space for students and organizations.',
    accent: 'navy',
  },
]

const STEPS = [
  {
    number: '1',
    icon: UserRound,
    title: 'Create your profile',
    desc: 'Tell us about your skills, interests, and what you want to achieve.',
    accent: 'blue',
  },
  {
    number: '2',
    icon: Search,
    title: 'Discover & connect',
    desc: 'Browse opportunities or receive matches that fit you best.',
    accent: 'green',
  },
  {
    number: '3',
    icon: Star,
    title: 'Collaborate & grow',
    desc: 'Work together, make an impact, and grow your experience.',
    accent: 'amber',
  },
]

const TRUSTED_BY = ['LATET', 'Teach for Israel', 'Seeds', 'WIZO', 'AChim']

const AI_SIGNALS = [
  { icon: BookOpen, label: 'Skills & expertise', color: '#0B84FF', bg: '#EAF2FF' },
  { icon: Heart, label: 'Values & causes', color: '#E2445C', bg: '#FDEEF1' },
  { icon: Target, label: 'Career goals', color: '#10B981', bg: '#E5F6EA' },
  { icon: Clock, label: 'Availability', color: '#F59E0B', bg: '#FFF4D8' },
  { icon: Lightbulb, label: 'Learning potential', color: '#8B5CF6', bg: '#F3EEFF' },
  { icon: Globe2, label: 'Interests & passions', color: '#0B84FF', bg: '#EAF2FF' },
]

const STUDENT_BENEFITS = [
  { icon: Sparkles, text: 'AI-matched opportunities tailored to your exact skills and goals' },
  { icon: TrendingUp, text: 'Build a portfolio of real-world, meaningful work' },
  { icon: Award, text: 'Get recognized for impact — not just credentials' },
  { icon: MessageSquare, text: 'Direct communication with NGO teams' },
  { icon: CheckCircle2, text: 'Practice interviews for every role before you apply' },
]

const NGO_BENEFITS = [
  { icon: Brain, text: 'AI finds students who genuinely align with your mission' },
  { icon: Users, text: 'Access a pool of motivated, cause-driven volunteers' },
  { icon: BarChart3, text: 'Track applicants, matches, and engagement in one place' },
  { icon: BadgeCheck, text: 'Verified student profiles with real skill data' },
  { icon: Zap, text: 'Post roles and start receiving matches within hours' },
]

const TESTIMONIALS = [
  {
    quote: 'Hive matched me with a sustainability NGO that perfectly aligned with my environmental engineering background. The process took less than a week.',
    name: 'Maya Cohen',
    role: 'Environmental Engineering Student',
    avatar: 'MC',
    color: '#0B84FF',
  },
  {
    quote: 'We used to spend weeks reviewing applications. With Hive\'s AI matching, we receive candidates who already understand our mission and have the skills we need.',
    name: 'Amir Shapiro',
    role: 'Programs Director, Teach for Israel',
    avatar: 'AS',
    color: '#10B981',
  },
  {
    quote: 'I wasn\'t just matched based on my degree. Hive looked at what I actually care about. I ended up in a role that feels like it was designed for me.',
    name: 'Noa Levi',
    role: 'Social Work Student',
    avatar: 'NL',
    color: '#8B5CF6',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is Hive free for students?',
    a: 'Yes. Hive is completely free for students. Create your profile, browse opportunities, and get matched — no fees, ever.',
  },
  {
    q: 'How does the AI matching work?',
    a: 'Our AI analyzes your skills, interests, values, availability, and career goals — then surfaces opportunities where you are most likely to thrive and create genuine impact. Unlike simple keyword matching, we look at the whole picture.',
  },
  {
    q: 'What types of organizations are on Hive?',
    a: 'We work with NGOs across education, environment, healthcare, youth services, accessibility, and social welfare — primarily in Israel, with plans to expand globally.',
  },
  {
    q: 'Can students apply to multiple opportunities at once?',
    a: 'Absolutely. You can save opportunities, apply to as many as you want, and track all your applications in one dashboard.',
  },
  {
    q: 'How long does it take to get matched?',
    a: 'Most students receive their first matches within minutes of completing their profile. The more detail you add, the better your matches become.',
  },
  {
    q: 'I\'m an NGO — how do I get started?',
    a: 'Create a free account, complete your organization profile, and post your first role. Our AI will immediately begin surfacing qualified, mission-aligned candidates.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0B84FF]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#0B84FF]" />
      {children}
    </p>
  )
}

function HexTile({ className = '', children, tone = 'blue', image = false }) {
  const tones = {
    blue: 'from-blue-50 to-blue-100 text-blue-700 ring-blue-100',
    green: 'from-emerald-50 to-emerald-100 text-emerald-700 ring-emerald-100',
    amber: 'from-amber-50 to-amber-100 text-amber-700 ring-amber-100',
    slate: 'from-slate-50 to-slate-100 text-slate-700 ring-slate-200',
  }
  return (
    <div
      className={`relative ${className}`}
      style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }}
    >
      <div className={`h-full w-full rounded-[28px] bg-gradient-to-br ${tones[tone]} shadow-[0_18px_50px_rgba(13,24,61,0.08)] ring-1 ${image ? 'overflow-hidden' : ''}`}>
        {children}
      </div>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full">
      <img src={chatgptImage} alt="Hive platform hero" className="w-full h-auto" />
    </div>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#E6EAF0]">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-[#202124]">{q}</span>
        {open
          ? <ChevronUp className="h-5 w-5 shrink-0 text-[#0B84FF]" />
          : <ChevronDown className="h-5 w-5 shrink-0 text-[#8A8F98]" />}
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-7 text-[#5F6368]">{a}</p>
      </motion.div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0D183D]">

      {/* ── Nav (unchanged) ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <Link to="/" className="shrink-0" aria-label="Hive home">
            <HiveLogo size={44} />
          </Link>
          <nav className="hidden items-center gap-12 lg:flex">
            {NAV_LINKS.map(link => (
              <Link key={link.label} to={link.to} className="text-sm font-medium text-[#5F6368] transition-colors hover:text-[#202124]">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <Link to="/auth" className="rounded-2xl px-5 py-2.5 text-sm font-medium text-[#202124] transition-colors hover:bg-black/[0.06]">
              Log in
            </Link>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0B84FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,132,255,0.2)] transition-all hover:shadow-[0_10px_28px_rgba(11,132,255,0.3)] hover:-translate-y-0.5"
            >
              Sign up <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ── Hero (unchanged) ────────────────────────────────────────────────── */}
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(11,132,255,0.06),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.04),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(11,132,255,0.03),transparent_26%)]" />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_1.08fr] lg:gap-10">
              <div className="max-w-2xl">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0B84FF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0B84FF]" />
                  Connecting students and NGOs
                </p>
                <h1 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-5xl lg:text-[3.5rem]">
                  Make an impact.
                  <br />Build your future.
                  <br /><span className="text-[#0B84FF]">together.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#5F6368] sm:text-lg">
                  Hive connects students with NGOs and meaningful opportunities to create real change.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/auth?mode=signup&role=student"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#0B84FF] px-8 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(11,132,255,0.25)] transition-all hover:shadow-[0_16px_40px_rgba(11,132,255,0.3)] hover:-translate-y-0.5"
                  >
                    I&apos;m a Student
                  </Link>
                  <Link
                    to="/auth?mode=signup&role=ngo"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#E6EAF0] bg-white px-8 py-4 text-base font-semibold text-[#202124] shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:border-[#D5DCE6] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                  >
                    I&apos;m an NGO
                  </Link>
                </div>
              </div>
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* ── Feature cards (unchanged) ─────────────────────────────────────── */}
        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#E6EAF0] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {FEATURE_CARDS.map(({ icon: Icon, title, desc, accent }) => {
                const styles = {
                  blue: 'bg-[#EAF2FF] text-[#0B84FF]',
                  green: 'bg-[#E5F6EA] text-[#10B981]',
                  amber: 'bg-[#FFF4D8] text-[#F59E0B]',
                  navy: 'bg-[#F0F3F8] text-[#202124]',
                }
                return (
                  <div key={title} className="flex gap-4 rounded-[1.75rem] p-5 transition-all hover:shadow-[0_12px_32px_rgba(11,132,255,0.08)]">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${styles[accent]}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#202124]">{title}</h3>
                      <p className="mt-1.5 text-sm leading-5 text-[#5F6368]">{desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── How Hive works (unchanged) ────────────────────────────────────── */}
        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">How Hive works</h2>
              <p className="mt-3 text-base text-[#5F6368]">Simple steps to connect and create impact</p>
            </div>
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {STEPS.map(step => {
                const Icon = step.icon
                const pill = {
                  blue: 'bg-[#EAF2FF] text-[#0B84FF]',
                  green: 'bg-[#E5F6EA] text-[#10B981]',
                  amber: 'bg-[#FFF4D8] text-[#F59E0B]',
                }[step.accent]
                return (
                  <div key={step.title} className="rounded-[2rem] border border-[#E6EAF0] bg-white p-7 shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_16px_48px_rgba(11,132,255,0.1)]">
                    <div className="flex items-start gap-5">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-xl shrink-0 ${pill}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 text-2xl font-bold text-[#0B84FF]">{step.number}</div>
                        <h3 className="text-lg font-semibold text-[#202124]">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#5F6368]">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Trusted by (unchanged) ────────────────────────────────────────── */}
        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A8F98]">
              Trusted by NGOs and students worldwide
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60">
              {TRUSTED_BY.map(name => (
                <div key={name} className="text-base font-semibold tracking-[0.15em] text-[#202124]">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Matching ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#F8FAFF] px-5 py-24 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,rgba(11,132,255,0.05),transparent_55%)]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <FadeUp>
                <SectionLabel>AI-Powered Matching</SectionLabel>
                <h2 className="text-3xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-4xl">
                  We see the whole you,<br />
                  <span className="text-[#0B84FF]">not just your CV.</span>
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-[#5F6368]">
                  Traditional platforms match by title and years of experience. Hive's AI goes deeper — understanding who you are, what you care about, and where you can grow most.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  {['No experience required to find a meaningful role', 'Matches improve the more you use the platform', 'Updated in real time as new opportunities are posted'].map(point => (
                    <div key={point} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0B84FF]" />
                      <span className="text-sm font-medium text-[#5F6368]">{point}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>

              <FadeUp delay={0.1}>
                <div className="relative rounded-[2.5rem] border border-[#E6EAF0] bg-white p-8 shadow-[0_20px_60px_rgba(11,132,255,0.08)]">
                  <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8F98]">What Hive considers</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {AI_SIGNALS.map(({ icon: Icon, label, color, bg }) => (
                      <motion.div
                        key={label}
                        whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(11,132,255,0.10)' }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center gap-2.5 rounded-2xl border border-[#E6EAF0] bg-white p-4 text-center"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: bg }}>
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <span className="text-xs font-semibold leading-snug text-[#202124]">{label}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#EAF2FF] px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B84FF]">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0B84FF]">Perfect match found</p>
                      <p className="mt-0.5 text-xs text-[#5F6368]">94% compatibility · 3 shared causes</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── Built for students and NGOs ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#F8FAFF] px-5 py-28 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_60%,rgba(11,132,255,0.05),transparent),radial-gradient(ellipse_70%_50%_at_90%_40%,rgba(13,148,136,0.05),transparent)]" />
          <div className="relative mx-auto max-w-6xl">

            {/* Header */}
            <FadeUp className="mb-14 text-center">
              <SectionLabel>Platform</SectionLabel>
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">
                Built for students and NGOs
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#5F6368]">
                Two different journeys. One beautiful platform — with every tool shaped for who you are.
              </p>
            </FadeUp>

            {/* Persona cards — full-width, horizontal layout */}
            <div className="flex flex-col gap-5">

              {/* Student card */}
              <FadeUp delay={0.05}>
                <div className="relative flex min-h-[340px] overflow-hidden rounded-[2rem] border border-[#E6EAF0] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.055)]">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-[#0B84FF]" />
                  <div className="flex flex-1 flex-col justify-between p-9 lg:max-w-[62%]">
                    <div>
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2FF]">
                          <GraduationCap className="h-6 w-6 text-[#0B84FF]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B84FF]">For Students</p>
                          <h3 className="text-xl font-bold text-[#202124]">Launch your impact career</h3>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {STUDENT_BENEFITS.map(({ text }) => (
                          <div key={text} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 text-[#0B84FF]" />
                            <p className="text-sm leading-6 text-[#5F6368]">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link
                      to="/auth?mode=signup&role=student"
                      className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-[#0B84FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,132,255,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(11,132,255,0.28)]"
                    >
                      Join as a student <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="relative hidden w-[40%] shrink-0 lg:block">
                    <img
                      src={student1Img}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-y-0 right-[-16px] h-full w-auto max-w-none select-none pointer-events-none"
                      style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 32%, black 58%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 32%, black 58%)',
                      }}
                    />
                  </div>
                </div>
              </FadeUp>

              {/* NGO card */}
              <FadeUp delay={0.1}>
                <div className="relative flex min-h-[340px] overflow-hidden rounded-[2rem] border border-[#E6EAF0] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.055)]">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-[#0D9488]" />
                  <div className="flex flex-1 flex-col justify-between p-9 lg:max-w-[62%]">
                    <div>
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0FDFA]">
                          <HeartHandshake className="h-6 w-6 text-[#0D9488]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0D9488]">For NGOs</p>
                          <h3 className="text-xl font-bold text-[#202124]">Find your perfect volunteer</h3>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {NGO_BENEFITS.map(({ text }) => (
                          <div key={text} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 text-[#0D9488]" />
                            <p className="text-sm leading-6 text-[#5F6368]">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link
                      to="/auth?mode=signup&role=ngo"
                      className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-[#0D9488] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(13,148,136,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(13,148,136,0.28)]"
                    >
                      Join as an NGO <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="relative hidden w-[40%] shrink-0 lg:block">
                    <img
                      src={ngo1Img}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-y-0 right-[-16px] h-full w-auto max-w-none select-none pointer-events-none"
                      style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 32%, black 58%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 32%, black 58%)',
                      }}
                    />
                  </div>
                </div>
              </FadeUp>

            </div>

            {/* Feature strip */}
            <FadeUp delay={0.15} className="mt-6">
              <div className="flex flex-wrap items-center justify-center gap-1 rounded-[1.5rem] border border-[#E6EAF0] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                {[
                  { icon: Sparkles, label: 'AI Matching' },
                  { icon: BadgeCheck, label: 'Applications' },
                  { icon: Clock, label: 'Interviews' },
                  { icon: MessageSquare, label: 'Messages' },
                  { icon: BarChart3, label: 'Analytics' },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={label} className="flex items-center">
                    {i > 0 && <span className="mx-1 hidden h-4 w-px bg-[#E6EAF0] sm:block" />}
                    <div className="flex items-center gap-2 rounded-xl px-4 py-2 transition-colors hover:bg-[#F8FAFF]">
                      <Icon className="h-4 w-4 text-[#8A8F98]" />
                      <span className="text-sm font-medium text-[#5F6368]">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>


          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────────────── */}
        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <FadeUp className="mb-14 text-center">
              <SectionLabel>Testimonials</SectionLabel>
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">Real people. Real impact.</h2>
              <p className="mt-3 text-base text-[#5F6368]">Hear from students and NGOs who found their match on Hive.</p>
            </FadeUp>

            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <FadeUp key={t.name} delay={i * 0.07}>
                  <div className="flex h-full flex-col rounded-[2rem] border border-[#E6EAF0] bg-white p-7 shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(11,132,255,0.09)]">
                    <div className="mb-5 flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                    </div>
                    <p className="flex-1 text-sm leading-7 text-[#5F6368]">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: t.color }}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#202124]">{t.name}</p>
                        <p className="text-xs text-[#8A8F98]">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="bg-[#F8FAFF] px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <FadeUp className="mb-14 text-center">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">Common questions</h2>
              <p className="mt-3 text-base text-[#5F6368]">Everything you need to know before getting started.</p>
            </FadeUp>
            <FadeUp>
              <div className="rounded-[2rem] border border-[#E6EAF0] bg-white px-8 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                {FAQ_ITEMS.map(item => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-5 py-28 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,132,255,0.07),transparent_55%)]" />
          <FadeUp className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF]">
              <Sparkles className="h-8 w-8 text-[#0B84FF]" />
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl lg:text-5xl">
              Ready to find your match?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#5F6368] sm:text-lg">
              Join thousands of students and NGOs already creating real impact through meaningful collaboration.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/auth?mode=signup&role=student"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0B84FF] px-8 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(11,132,255,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(11,132,255,0.3)]"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#E6EAF0] bg-white px-8 py-4 text-base font-semibold text-[#202124] shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:border-[#D5DCE6] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
              >
                Learn about us
              </Link>
            </div>
            <p className="mt-6 text-sm text-[#8A8F98]">Free to use · No credit card required · Set up in minutes</p>
          </FadeUp>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E6EAF0] bg-[#202124] px-5 pt-16 pb-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <HiveLogo size={36} className="brightness-0 invert" />
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/50">
                Connecting students with NGOs and meaningful opportunities to create real change.
              </p>
              <div className="mt-6 flex gap-4">
                {[ExternalLink, Mail].map((Icon, i) => (
                  <button key={i} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Product</p>
              <div className="space-y-3">
                {['How it works', 'For Students', 'For NGOs', 'About Us'].map(label => (
                  <Link key={label} to="/" className="block text-sm text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Students */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Students</p>
              <div className="space-y-3">
                {['Browse opportunities', 'My applications', 'Interview practice', 'Saved roles', 'My profile'].map(label => (
                  <Link key={label} to="/auth" className="block text-sm text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* NGOs */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">NGOs</p>
              <div className="space-y-3">
                {['Post a role', 'View applicants', 'Analytics', 'Matches', 'Contact us'].map(label => (
                  <Link key={label} to="/auth" className="block text-sm text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-white/30">© {new Date().getFullYear()} Hive. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service'].map(label => (
                <Link key={label} to="/" className="text-xs text-white/30 transition-colors hover:text-white/60">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Landing
