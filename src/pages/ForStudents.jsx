import { Link } from 'react-router-dom'
import {
  ArrowRight, Sparkles, Users, Award, BarChart3, Search,
  BookOpen, Heart, Lightbulb,
} from 'lucide-react'
import { FadeUp, SectionLabel, FAQAccordion, SiteHeader, SiteFooter, HiveWaves } from '../components/MarketingUI'
import forStudentImage from '../assets/for student.png'

// A slim, text-free strip so the wave never sits behind a heading or copy —
// just a clean divider between sections. Blue tone for the Students page.
function WaveDivider() {
  return (
    <div className="relative h-20 overflow-hidden sm:h-28">
      <HiveWaves className="top-0 h-full" tone="blue" />
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
    icon: Sparkles,
    title: 'Meaningful opportunities',
    desc: 'Work with organizations aligned with your values.',
    accent: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Build real portfolio',
    desc: 'Create projects you can show employers.',
    accent: 'green',
  },
  {
    icon: Users,
    title: 'Professional mentoring',
    desc: 'Learn from experienced professionals.',
    accent: 'amber',
  },
]

const STEPS = [
  {
    number: '1',
    icon: Users,
    title: 'Build your profile',
    desc: 'Share your skills, interests, and values with us.',
    accent: 'blue',
  },
  {
    number: '2',
    icon: Search,
    title: 'Discover opportunities',
    desc: 'Browse or get matched with perfect roles.',
    accent: 'green',
  },
  {
    number: '3',
    icon: Award,
    title: 'Apply & connect',
    desc: 'Apply to roles that excite you.',
    accent: 'amber',
  },
  {
    number: '4',
    icon: Sparkles,
    title: 'Start making impact',
    desc: 'Work on meaningful projects.',
    accent: 'blue',
  },
]

const STUDENT_TILES = [
  {
    icon: BookOpen,
    title: 'Real portfolio, not busywork',
    desc: 'Every role is a project you can actually point to later — not another line that says "volunteer."',
    color: '#0B84FF',
    bg: '#EAF2FF',
  },
  {
    icon: Award,
    title: 'A certificate when you\'re done',
    desc: 'Finish a role and it\'s unlocked automatically on your dashboard.',
    color: '#10B981',
    bg: '#E5F6EA',
  },
  {
    icon: Heart,
    title: 'No cold-email guessing',
    desc: 'Message the NGO directly — no chasing replies through a form.',
    color: '#E2445C',
    bg: '#FDEEF1',
  },
  {
    icon: Lightbulb,
    title: 'Walk in ready',
    desc: 'Practice the interview for a role before you ever have to actually give it.',
    color: '#8B5CF6',
    bg: '#F3EEFF',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is Hive free for students?',
    a: 'Yes. Hive is completely free for students. Create your profile, browse opportunities, and get matched — no fees, ever.',
  },
  {
    q: 'Do I need experience to apply?',
    a: 'No. Many roles on Hive are designed for students just starting out — what matters most is your interests and willingness to learn. Our AI looks at your whole profile, not just your resume.',
  },
  {
    q: 'How does the matching actually work?',
    a: 'When you build your profile, Hive looks at your skills, interests, availability, and goals, then scores every opportunity for how well it fits you. The higher the match, the more likely you are to thrive in that role.',
  },
  {
    q: 'Can I apply to more than one opportunity?',
    a: 'Absolutely. Save as many roles as you like, apply to as many as you want, and track every application from one dashboard.',
  },
  {
    q: 'Can I prepare before an interview?',
    a: 'Yes — Hive includes an interview practice tool tailored to each specific role, so you can rehearse answers and feel ready before you talk to an NGO.',
  },
  {
    q: 'What happens when I finish a role?',
    a: 'Once the NGO marks your role as complete, a certificate is unlocked on your dashboard that you can view or download — real proof of the impact you made.',
  },
]

export default function ForStudents() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0D183D]">
      <SiteHeader navLinks={NAV_LINKS} />

      <main>
        <section className="relative">
          {/* Blue glow, kept to the left where the text sits — not behind the image. */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(11,132,255,0.07),transparent_30%),radial-gradient(circle_at_25%_90%,rgba(16,185,129,0.05),transparent_26%)]" />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_1.08fr] lg:gap-10">
              <div className="max-w-2xl">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0B84FF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0B84FF]" />
                  Opportunities for students
                </p>

                <h1 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-5xl lg:text-[3.5rem]">
                  Build your career
                  <br />
                  while making a
                  <br />
                  <span className="text-[#0B84FF]">real difference.</span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-[#5F6368] sm:text-lg">
                  Find meaningful opportunities that match your skills and values. Work on real projects that matter — and walk away with proof of the impact you made.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/auth?mode=signup&role=student"
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
                  src={forStudentImage}
                  alt="For students"
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
                How to get started
              </h2>
              <p className="mt-3 text-base text-[#5F6368]">
                Four simple steps to find your next opportunity
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-4">
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

        {/* ── Why students choose Hive — bento grid ────────────────────────── */}
        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <FadeUp className="mb-12 max-w-2xl">
              <SectionLabel>Why students choose Hive</SectionLabel>
              <h2 className="text-3xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-4xl">
                Not a listings board.<br />
                <span className="text-[#0B84FF]">Something built around you.</span>
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
              <FadeUp className="lg:col-span-2 lg:row-span-2">
                <div className="flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-[#0B84FF] p-8 text-white shadow-[0_20px_50px_rgba(11,132,255,0.28)]">
                  <div>
                    <Sparkles className="h-9 w-9 text-white/90" />
                    <h3 className="mt-6 text-2xl font-bold leading-snug">
                      Matched on who you are — not a keyword scan of your resume.
                    </h3>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
                      Hive weighs your skills, causes you care about, and where you want to grow — the same picture an NGO would build over a first coffee, done automatically.
                    </p>
                  </div>
                  <Link
                    to="/auth?mode=signup&role=student"
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0B84FF] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                  >
                    Join as a student <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeUp>

              {STUDENT_TILES.map(({ icon: Icon, title, desc, color, bg }, i) => (
                <FadeUp key={title} delay={0.05 * (i + 1)}>
                  <div className="flex h-full flex-col rounded-[2rem] border border-[#E6EAF0] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(11,132,255,0.1)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: bg }}>
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-[#202124]">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#5F6368]">{desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        <WaveDivider />

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <FadeUp className="mb-14 text-center">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">Questions students ask</h2>
              <p className="mt-3 text-base text-[#5F6368]">Everything you need to know before you apply.</p>
            </FadeUp>
            <FadeUp>
              <FAQAccordion items={FAQ_ITEMS} />
            </FadeUp>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A8F98]">
              Ready to start your impact?
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">
              Join thousands of students building meaningful experience
            </h2>
            <p className="mt-4 text-base text-[#5F6368]">
              Create your profile today and discover opportunities that matter
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth?mode=signup&role=student"
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
