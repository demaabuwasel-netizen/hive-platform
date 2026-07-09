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
    <div className="relative mx-auto w-full max-w-[760px] min-h-[610px] lg:min-h-[680px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-10 h-28 w-28 rounded-full bg-blue-200/25 blur-3xl" />
        <div className="absolute right-14 top-20 h-32 w-32 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="absolute bottom-4 left-[24%] h-28 w-28 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      <div className="absolute left-8 top-16 hidden h-24 w-24 rounded-full border border-[#0D183D]/8 bg-white/55 lg:block"
        style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }} />
      <div className="absolute right-4 top-8 hidden h-16 w-16 rounded-full border border-[#0D183D]/8 bg-white/45 lg:block"
        style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }} />
      <div className="absolute bottom-20 right-8 hidden h-20 w-20 rounded-full border border-[#0D183D]/8 bg-white/45 lg:block"
        style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }} />

      <div className="relative h-full w-full">
        <div className="absolute left-[0%] top-[20%] w-[230px] sm:w-[250px] lg:w-[270px]">
          <HexTile className="h-[250px] sm:h-[265px] lg:h-[285px]" tone="blue" image>
            <PlaceholderImage
              label="Students"
              sublabel="Discover opportunities and grow your skills."
              gradient="bg-gradient-to-br from-white/90 to-blue-100/75"
              icon={GraduationCap}
            />
          </HexTile>
        </div>

        <div className="absolute left-[30%] top-[3%] w-[190px] sm:w-[210px] lg:w-[220px]">
          <HexTile className="h-[200px] sm:h-[220px] lg:h-[230px]" tone="slate" image>
            <PlaceholderImage
              label="Student story"
              sublabel="A person, a mission, a match."
              gradient="bg-gradient-to-br from-white to-slate-100"
              icon={Sparkles}
            />
          </HexTile>
        </div>

        <div className="absolute right-[4%] top-[8%] w-[210px] sm:w-[230px] lg:w-[250px]">
          <HexTile className="h-[220px] sm:h-[240px] lg:h-[250px]" tone="green" image>
            <PlaceholderImage
              label="NGOs"
              sublabel="Find passionate and skilled help."
              gradient="bg-gradient-to-br from-white/90 to-emerald-100/80"
              icon={HeartHandshake}
            />
          </HexTile>
        </div>

        <div className="absolute left-[40%] top-[38%] w-[240px] sm:w-[260px] lg:w-[280px]">
          <HexTile className="h-[240px] sm:h-[255px] lg:h-[270px]" tone="amber" image>
            <PlaceholderImage
              label="Opportunities"
              sublabel="Create impact in your community."
              gradient="bg-gradient-to-br from-white/90 to-amber-100/70"
              icon={Star}
            />
          </HexTile>
        </div>

        <div className="absolute left-[14%] top-[58%] w-[220px] sm:w-[240px] lg:w-[250px]">
          <HexTile className="h-[220px] sm:h-[235px] lg:h-[245px]" tone="slate" image>
            <PlaceholderImage
              label="Hands together"
              sublabel="Community and collaboration."
              gradient="bg-gradient-to-br from-white to-slate-100"
              icon={Heart}
            />
          </HexTile>
        </div>

        <div className="absolute right-[10%] top-[46%] w-[200px] sm:w-[220px] lg:w-[230px]">
          <HexTile className="h-[210px] sm:h-[225px] lg:h-[235px]" tone="blue" image>
            <PlaceholderImage
              label="Impact"
              sublabel="Real results, real growth."
              gradient="bg-gradient-to-br from-white/90 to-blue-50"
              icon={Globe2}
            />
          </HexTile>
        </div>

        <div className="absolute left-[44%] top-[15%] hidden rounded-full border border-[#1F6FFF]/15 bg-white/70 px-4 py-2 text-[11px] font-semibold text-[#1F6FFF] shadow-sm lg:block">
          Matching students with impact
        </div>

        <div className="absolute right-[26%] top-[32%] hidden rounded-full border border-[#0D183D]/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-[#4B6382] shadow-sm lg:block">
          NGOs
        </div>

        <div className="absolute left-[20%] bottom-[6%] hidden rounded-full border border-[#0D183D]/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-[#4B6382] shadow-sm lg:block">
          Students
        </div>
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

          <nav className="hidden items-center gap-10 lg:flex">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[15px] font-medium text-[#0D183D]/85 transition-colors hover:text-[#0D183D]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/auth"
              className="rounded-2xl px-4 py-2 text-[15px] font-medium text-[#0D183D] transition-colors hover:bg-black/[0.04]"
            >
              Log in
            </Link>
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1F6FFF] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(31,111,255,0.25)] transition-transform hover:-translate-y-0.5"
            >
              Sign up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,111,255,0.08),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.06),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(255,183,3,0.05),transparent_22%)]" />
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_1.08fr] lg:gap-10">
              <div className="max-w-2xl">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0D183D]/10 bg-white px-4 py-2 text-sm font-medium text-[#4B6382] shadow-[0_10px_30px_rgba(13,24,61,0.04)]">
                  <BadgeCheck className="h-4 w-4 text-[#1F6FFF]" />
                  Connecting students and NGOs
                </p>

                <h1 className="max-w-xl text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-[#0B163F] sm:text-6xl lg:text-[4.75rem]">
                  Make an impact.
                  <br />
                  Build your future.
                  <br />
                  <span className="text-[#1F6FFF]">together.</span>
                </h1>

                <p className="mt-7 max-w-xl text-lg leading-8 text-[#4B6382] sm:text-[1.15rem]">
                  Hive connects students with NGOs and meaningful opportunities to create real change.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/auth?mode=signup&role=student"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#1F6FFF] px-7 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(31,111,255,0.25)] transition-transform hover:-translate-y-0.5"
                  >
                    I&apos;m a Student
                  </Link>
                  <Link
                    to="/auth?mode=signup&role=ngo"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#0D183D]/15 bg-white px-7 py-4 text-base font-semibold text-[#0D183D] shadow-[0_10px_25px_rgba(13,24,61,0.04)] transition-colors hover:bg-black/[0.03]"
                  >
                    I&apos;m an NGO
                  </Link>
                </div>
              </div>

              <HeroVisual />
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#0D183D]/6 bg-white p-5 shadow-[0_20px_70px_rgba(13,24,61,0.05)] sm:p-7">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {FEATURE_CARDS.map(({ icon: Icon, title, desc, accent }) => {
                const styles = {
                  blue: 'bg-blue-50 text-blue-600',
                  green: 'bg-emerald-50 text-emerald-600',
                  amber: 'bg-amber-50 text-amber-600',
                  navy: 'bg-slate-50 text-[#0D183D]',
                }
                return (
                  <div key={title} className="flex gap-4 rounded-[1.5rem] p-4 transition-shadow hover:shadow-[0_10px_26px_rgba(13,24,61,0.06)]">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles[accent]}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-[1.05rem] font-semibold text-[#0B163F]">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#4B6382]">{desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-4 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#0B163F] sm:text-4xl">
                How Hive works
              </h2>
              <p className="mt-3 text-base text-[#4B6382]">
                Simple steps to connect and create impact
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {STEPS.map(step => {
                const Icon = step.icon
                const pill = {
                  blue: 'bg-blue-50 text-blue-600',
                  green: 'bg-emerald-50 text-emerald-600',
                  amber: 'bg-amber-50 text-amber-600',
                }[step.accent]

                return (
                  <div key={step.title} className="rounded-[1.75rem] border border-[#0D183D]/6 bg-white p-6 shadow-[0_16px_40px_rgba(13,24,61,0.04)]">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-[1.4rem] ${pill}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 text-2xl font-bold text-[#1F6FFF]">{step.number}</div>
                        <h3 className="text-lg font-semibold text-[#0B163F]">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#4B6382]">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4B6382]">
              Trusted by NGOs and students
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70">
              {TRUSTED_BY.map(name => (
                <div
                  key={name}
                  className="text-lg font-semibold tracking-[0.18em] text-[#0D183D]/60"
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
