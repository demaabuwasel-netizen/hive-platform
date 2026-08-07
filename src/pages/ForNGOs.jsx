import { Link } from 'react-router-dom'
import {
  ArrowRight, Target, Users, Zap, BarChart3,
  Brain, BadgeCheck, MessageSquare, Sparkles,
} from 'lucide-react'
import { FadeUp, SectionLabel, FAQAccordion, SiteHeader, SiteFooter, HiveWaves } from '../components/MarketingUI'
import forNGOImage from '../assets/for ngo.png'

// A slim, text-free strip so the wave never sits behind a heading or copy —
// just a clean divider between sections. Green tone for the NGOs page, to
// tell it apart from the blue used on the Students page.
function WaveDivider() {
  return (
    <div className="relative h-20 overflow-hidden sm:h-28">
      <HiveWaves className="top-0 h-full" tone="green" />
    </div>
  )
}

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'For Students', to: '/for-students' },
  { label: 'For NGOs', to: '/for-ngos' },
  { label: 'About Us', to: '/about' },
]

const FEATURE_CARDS = [
  {
    icon: Target,
    title: 'Mission-aligned matching',
    desc: 'Find volunteers who care about your cause.',
    accent: 'blue',
  },
  {
    icon: Zap,
    title: 'Smart skill matching',
    desc: 'Surface candidates with the skills you need.',
    accent: 'green',
  },
  {
    icon: Users,
    title: 'Verified students',
    desc: 'Work with real, motivated volunteers.',
    accent: 'amber',
  },
]

const STEPS = [
  {
    number: '1',
    icon: Users,
    title: 'Create your profile',
    desc: 'Tell us about your organization and mission.',
    accent: 'blue',
  },
  {
    number: '2',
    icon: BarChart3,
    title: 'Post volunteer roles',
    desc: 'Describe what you need and who you\'re looking for.',
    accent: 'green',
  },
  {
    number: '3',
    icon: Target,
    title: 'Start collaborating',
    desc: 'Connect with matched students and get to work.',
    accent: 'amber',
  },
]

const OLD_WAY = [
  'A pile of resumes with no way to tell who\'s actually aligned with your cause',
  'Slow back-and-forth over email just to schedule a first chat',
  'No real signal on whether someone has the skills they claim',
  'Manually re-posting the same role every time someone falls through',
]

const HIVE_WAY = [
  { icon: Brain, text: 'Applicants arrive pre-ranked by fit to your mission and role' },
  { icon: MessageSquare, text: 'Message and schedule interviews right inside Hive' },
  { icon: BadgeCheck, text: 'Skills come from real profile data, not a claim on a page' },
  { icon: Zap, text: 'One role stays open and matching until you\'ve filled it' },
]

const FAQ_ITEMS = [
  {
    q: 'Is Hive free for NGOs?',
    a: 'Yes. Creating an organization profile and posting roles is completely free — there\'s no cost to start finding volunteers.',
  },
  {
    q: 'How does the AI matching work for us?',
    a: 'When you post a role, Hive scores every student against it using their skills, interests, values, and availability — so the applicants you see are already a strong fit, not just anyone who clicked apply.',
  },
  {
    q: 'Can we message candidates before deciding?',
    a: 'Yes. You can message applicants directly, invite them to an interview, and review their full profile before making any decision.',
  },
  {
    q: 'How do we track everything once roles are posted?',
    a: 'Every applicant, their status, and their match score lives in one dashboard — plus analytics on how your roles are performing over time.',
  },
  {
    q: 'What happens once we accept someone?',
    a: 'You can message them, coordinate the work, and once the role wraps up, mark it complete — that automatically unlocks a certificate for the student, recognizing the work they did with you.',
  },
  {
    q: 'Do we need to be a large organization to join?',
    a: 'Not at all. Hive works just as well for a single one-off project as it does for an NGO running dozens of ongoing roles.',
  },
]

export default function ForNGOs() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0D183D]">
      <SiteHeader navLinks={NAV_LINKS} />

      <main>
        <section className="relative">
          {/* Green/amber glow, kept to the left where the text sits — not behind the image. */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.07),transparent_30%),radial-gradient(circle_at_25%_90%,rgba(245,158,11,0.05),transparent_26%)]" />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_1.08fr] lg:gap-10">
              <div className="max-w-2xl">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0B84FF]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0B84FF]" />
                  Solutions for NGOs
                </p>

                <h1 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-5xl lg:text-[3.5rem]">
                  Find volunteers
                  <br />
                  who actually fit
                  <br />
                  <span className="text-[#0B84FF]">your mission.</span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-[#5F6368] sm:text-lg">
                  Connect with motivated students who understand your cause and have the skills you need — matched by AI, not by luck.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/auth?mode=signup&role=ngo"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#0B84FF] px-8 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(11,132,255,0.25)] transition-all hover:shadow-[0_16px_40px_rgba(11,132,255,0.3)] hover:-translate-y-0.5"
                  >
                    Get started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#E6EAF0] bg-white px-8 py-4 text-base font-semibold text-[#202124] shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:border-[#D5DCE6] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                  >
                    Log in
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto w-full">
                <img
                  src={forNGOImage}
                  alt="For NGOs"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#E6EAF0] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {FEATURE_CARDS.map(({ icon: Icon, title, desc, accent }) => {
                const styles = {
                  blue: 'bg-[#EAF2FF] text-[#0B84FF]',
                  green: 'bg-[#E5F6EA] text-[#10B981]',
                  amber: 'bg-[#FFF4D8] text-[#F59E0B]',
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

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">
                How it works
              </h2>
              <p className="mt-3 text-base text-[#5F6368]">
                From setup to your first volunteer in simple steps
              </p>
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

        {/* ── The old way vs. the Hive way ─────────────────────────────────── */}
        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <FadeUp className="mb-14 text-center">
              <SectionLabel>Why NGOs choose Hive</SectionLabel>
              <h2 className="text-3xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-4xl">
                Stop sorting through resumes.<br />
                <span className="text-[#0B84FF]">Start with people who fit.</span>
              </h2>
            </FadeUp>

            <div className="relative grid gap-6 md:grid-cols-2">
              <span className="absolute left-1/2 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6EAF0] bg-white text-xs font-bold text-[#8A8F98] shadow-[0_8px_20px_rgba(0,0,0,0.08)] md:flex">
                VS
              </span>

              <FadeUp>
                <div className="h-full rounded-[2rem] border border-[#E6EAF0] bg-[#F8F9FA] p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8F98]">The old way</p>
                  <div className="mt-6 space-y-5">
                    {OLD_WAY.map(text => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B0B6BE]" />
                        <p className="text-sm leading-6 text-[#8A8F98]">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.08}>
                <div className="h-full rounded-[2rem] border-2 border-[#0B84FF] bg-white p-8 shadow-[0_20px_50px_rgba(11,132,255,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0B84FF]">The Hive way</p>
                  <div className="mt-6 space-y-5">
                    {HIVE_WAY.map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[#0B84FF]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-sm font-medium leading-6 text-[#202124]">{text}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/auth?mode=signup&role=ngo"
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-[#0B84FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,132,255,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(11,132,255,0.28)]"
                  >
                    Join as an NGO <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* ── Feature strip ─────────────────────────────────────────────────── */}
        <section className="px-5 py-8 sm:px-8 lg:px-10">
          <FadeUp className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-center gap-1 rounded-[1.5rem] border border-[#E6EAF0] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              {[
                { icon: Sparkles, label: 'AI Matching' },
                { icon: BadgeCheck, label: 'Applications' },
                { icon: Brain, label: 'Analytics' },
                { icon: MessageSquare, label: 'Messages' },
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
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <FadeUp className="mb-14 text-center">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">Questions NGOs ask</h2>
              <p className="mt-3 text-base text-[#5F6368]">Everything you need to know before posting your first role.</p>
            </FadeUp>
            <FadeUp>
              <FAQAccordion items={FAQ_ITEMS} />
            </FadeUp>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A8F98]">
              Ready to find your volunteers?
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">
              Connect with mission-aligned students today
            </h2>
            <p className="mt-4 text-base text-[#5F6368]">
              Set up your organization profile and start finding the volunteers your mission deserves
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth?mode=signup&role=ngo"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0B84FF] px-8 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(11,132,255,0.2)] transition-all hover:shadow-[0_10px_28px_rgba(11,132,255,0.3)]"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <WaveDivider />
      </main>

      <SiteFooter />
    </div>
  )
}
