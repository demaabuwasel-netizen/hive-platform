import { Link } from 'react-router-dom'
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
} from 'lucide-react'
import HiveLogo from '../components/HiveLogo'
import chatgptImage from '../assets/ChatGPT Image Jul 11, 2026, 04_03_41 AM.png'

const NAV_LINKS = [
  { label: 'For Students', to: '/for-students' },
  { label: 'For NGOs', to: '/for-ngos' },
  { label: 'How It Works', to: '/how-it-works' },
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

const TRUSTED_BY = [
  'LATET',
  'Teach for Israel',
  'Seeds',
  'WIZO',
  'AChim',
]

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
      style={{
        clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
      }}
    >
      <div
        className={`h-full w-full rounded-[28px] bg-gradient-to-br ${tones[tone]} shadow-[0_18px_50px_rgba(13,24,61,0.08)] ring-1 ${image ? 'overflow-hidden' : ''}`}
      >
        {children}
      </div>
    </div>
  )
}

function PlaceholderImage({ label, sublabel, gradient, icon: Icon }) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 px-5 text-center ${gradient}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/75 shadow-sm ring-1 ring-white/60">
        <Icon className="h-7 w-7 text-[#0D183D]" strokeWidth={1.9} />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-[#0D183D]">{label}</p>
        {sublabel && <p className="mt-1 text-[12px] leading-snug text-[#4B6382]">{sublabel}</p>}
      </div>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="relative w-full h-[480px] flex items-center justify-center">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-green-100 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-amber-100 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full h-full perspective" style={{ perspective: '1000px' }}>
        {/* Large hexagon - top center with image */}
        <HexTile className="absolute top-0 right-1/3 w-32 h-32 lg:w-40 lg:h-40" tone="slate" image>
          <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center overflow-hidden">
            <div className="text-4xl">👩‍💼</div>
          </div>
        </HexTile>

        {/* Right side hexagon - team image */}
        <HexTile className="absolute top-1/4 right-0 w-28 h-28 lg:w-36 lg:h-36" tone="blue" image>
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center overflow-hidden">
            <div className="text-3xl">🤝</div>
          </div>
        </HexTile>

        {/* Bottom left - Students card */}
        <HexTile className="absolute bottom-16 left-0 w-32 h-24" tone="blue">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <GraduationCap size={24} />
            <p className="text-xs font-semibold text-center">Students</p>
            <p className="text-[10px] text-center leading-tight">Discover opportunities</p>
          </div>
        </HexTile>

        {/* Center card - Opportunities */}
        <HexTile className="absolute bottom-2 left-1/3 w-36 h-28" tone="amber">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Heart size={24} />
            <p className="text-xs font-semibold">Opportunities</p>
            <p className="text-[10px] text-center leading-tight">Create impact</p>
          </div>
        </HexTile>

        {/* Right side - NGOs card */}
        <HexTile className="absolute bottom-20 right-0 w-28 h-28" tone="green">
          <div className="flex flex-col items-center justify-center h-full gap-1.5">
            <HeartHandshake size={20} />
            <p className="text-xs font-semibold">NGOs</p>
            <p className="text-[9px] text-center leading-tight">Find help</p>
          </div>
        </HexTile>

        {/* Bottom right landscape image */}
        <HexTile className="absolute bottom-0 right-1/4 w-40 h-24" tone="slate" image>
          <div className="w-full h-full bg-gradient-to-br from-green-200 to-teal-200 flex items-center justify-center overflow-hidden">
            <div className="text-3xl">🌍</div>
          </div>
        </HexTile>
      </div>
    </div>
  )
}

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0D183D]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <Link to="/" className="shrink-0" aria-label="Hive home">
            <HiveLogo size={44} />
          </Link>

          <nav className="hidden items-center gap-12 lg:flex">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-[#5F6368] transition-colors hover:text-[#202124]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/auth"
              className="rounded-2xl px-5 py-2.5 text-sm font-medium text-[#202124] transition-colors hover:bg-black/[0.06]"
            >
              Log in
            </Link>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0B84FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,132,255,0.2)] transition-all hover:shadow-[0_10px_28px_rgba(11,132,255,0.3)] hover:-translate-y-0.5"
            >
              Sign up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(11,132,255,0.06),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.04),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(11,132,255,0.03),transparent_26%)]" />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_1.08fr] lg:gap-10">
              <div className="max-w-2xl">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0B84FF]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0B84FF]" />
                  Connecting students and NGOs
                </p>

                <h1 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-5xl lg:text-[3.5rem]">
                  Make an impact.
                  <br />
                  Build your future.
                  <br />
                  <span className="text-[#0B84FF]">together.</span>
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

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">
                How Hive works
              </h2>
              <p className="mt-3 text-base text-[#5F6368]">
                Simple steps to connect and create impact
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

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A8F98]">
              Trusted by NGOs and students worldwide
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60">
              {TRUSTED_BY.map(name => (
                <div
                  key={name}
                  className="text-base font-semibold tracking-[0.15em] text-[#202124]"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Landing
