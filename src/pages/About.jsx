import { Link } from 'react-router-dom'
import {
  ArrowRight, Heart, Users, Zap, Target, Sparkles,
  ShieldCheck, Handshake, CheckCircle2,
} from 'lucide-react'
import { FadeUp, SectionLabel, SiteHeader, SiteFooter, HiveWaves } from '../components/MarketingUI'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'For Students', to: '/for-students' },
  { label: 'For NGOs', to: '/for-ngos' },
  { label: 'About Us', to: '/about' },
]

const NAME_STORY = [
  'A single bee doesn\'t make honey. It takes a whole hive — thousands of individuals, each doing their own small part, trusting that together it adds up to something bigger than any one of them could build alone.',
  'That\'s exactly the gap we kept seeing. A student with a free afternoon and a cause they cared about. An NGO running on the effort of a handful of committed people. Everyone already doing meaningful work — just with no easy way to find each other.',
  'So we built Hive: a place where every small contribution — a skill, a few hours a week, a cause someone believes in — finds exactly where it fits into something bigger. No two bees do the same job. No two people on Hive follow the same path. But together, that\'s how a hive feeds an entire ecosystem.',
]

const VALUES = [
  {
    icon: Heart,
    title: 'Mission-driven',
    desc: 'We believe purpose matters — every match starts with what someone actually cares about.',
    accent: 'blue',
  },
  {
    icon: Users,
    title: 'Community-focused',
    desc: 'We build communities, not just platforms. Students and NGOs grow together, not just transact.',
    accent: 'green',
  },
  {
    icon: Zap,
    title: 'Impact-oriented',
    desc: 'Real change comes from real people doing real work — that\'s what we optimize for.',
    accent: 'amber',
  },
  {
    icon: Target,
    title: 'Values-aligned',
    desc: 'We match what matters to people, not just what\'s on a resume or a job posting.',
    accent: 'navy',
  },
]

const STORY = [
  {
    title: 'The Problem',
    desc: 'Students struggled to find meaningful opportunities aligned with their values, and often had no way to prove the impact of the work they did. Organizations, meanwhile, found it hard to connect with passionate, capable volunteers — and spent hours sorting through applications that didn\'t fit.',
  },
  {
    title: 'The Solution',
    desc: 'We built Hive to create intelligent matching between students and organizations, based on skills, values, and mission alignment — not just keywords. Every application, interview, and completed role happens in one place.',
  },
  {
    title: 'The Impact',
    desc: 'Today, Hive helps students find roles that actually fit who they are, and gives NGOs a faster, more reliable way to find volunteers who genuinely align with their mission — with real recognition for the work that gets done.',
  },
]

const STATS = [
  { value: '1,200+', label: 'Student profiles created' },
  { value: '85+', label: 'Partner NGOs' },
  { value: '3,400+', label: 'Applications matched' },
  { value: '94%', label: 'Avg. reported match quality' },
]

const COMMITMENTS = [
  { icon: ShieldCheck, text: 'Free for students — always. No hidden fees, no premium tier for opportunities.' },
  { icon: Handshake, text: 'Every NGO on Hive is reviewed before their roles go live.' },
  { icon: Sparkles, text: 'Matching gets smarter with every profile, application, and completed role.' },
  { icon: CheckCircle2, text: 'Completed work is recognized with a real certificate, not just a checkbox.' },
]

export default function About() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0D183D]">
      <SiteHeader navLinks={NAV_LINKS} />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(11,132,255,0.06),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.04),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(11,132,255,0.03),transparent_26%)]" />
          {/* Sits at the bottom edge only, as a divider into the next section
              — kept well clear of the heading/paragraph above it. */}
          <HiveWaves className="bottom-0 z-0 h-28 sm:h-36" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
            <div className="max-w-3xl">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E6EAF0] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0B84FF]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#0B84FF]" />
                About Hive
              </p>

              <h1 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-5xl lg:text-[3.5rem]">
                Connecting purpose
                <br />
                with passion.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#5F6368] sm:text-lg">
                Hive is on a mission to bridge the gap between students seeking meaningful impact and organizations creating real change — with AI that looks at who you are, not just what's on paper.
              </p>
            </div>
          </div>
        </section>

        {/* ── Why the name "Hive"? ─────────────────────────────────────────── */}
        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <FadeUp>
              <SectionLabel>Why &quot;Hive&quot;?</SectionLabel>
              <h2 className="text-3xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-4xl">
                Every bee has a job.<br />
                <span className="text-[#0B84FF]">So does everyone here.</span>
              </h2>
            </FadeUp>
            <FadeUp delay={0.06} className="mt-8 space-y-5">
              {NAME_STORY.map(paragraph => (
                <p key={paragraph} className="text-base leading-7 text-[#5F6368]">{paragraph}</p>
              ))}
            </FadeUp>
            <FadeUp delay={0.12}>
              <div className="mt-8 rounded-[1.75rem] border-l-4 border-[#0B84FF] bg-[#F8FAFF] px-6 py-5">
                <p className="text-base font-semibold italic leading-7 text-[#202124]">
                  &ldquo;Every bee matters. So does every hour you give.&rdquo;
                </p>
              </div>
            </FadeUp>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#E6EAF0] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {VALUES.map(({ icon: Icon, title, desc, accent }) => {
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

        {/* ── By the numbers ───────────────────────────────────────────────── */}
        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <FadeUp className="mx-auto max-w-5xl">
            <div className="rounded-[2.5rem] border border-[#E6EAF0] bg-[#F8FAFF] px-6 py-10 sm:px-10">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {STATS.map(stat => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold tracking-[-0.01em] text-[#0B84FF] sm:text-4xl">{stat.value}</p>
                    <p className="mt-2 text-sm leading-5 text-[#5F6368]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">
                Our Story
              </h2>
              <p className="mt-3 text-base text-[#5F6368]">
                How it all started
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {STORY.map((item, i) => (
                <div key={item.title} className="rounded-[2rem] border border-[#E6EAF0] bg-white p-7 shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_16px_48px_rgba(11,132,255,0.1)]">
                  <div className="mb-1 text-2xl font-bold text-[#0B84FF]">{i + 1}</div>
                  <h3 className="text-lg font-semibold text-[#202124]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5F6368]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What we commit to ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#F8FAFF] px-5 py-24 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,rgba(11,132,255,0.05),transparent_55%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <FadeUp>
              <SectionLabel>What we commit to</SectionLabel>
              <h2 className="text-3xl font-bold leading-[1.15] tracking-[-0.01em] text-[#202124] sm:text-4xl">
                A platform built to be trusted,<br />
                <span className="text-[#0B84FF]">by both sides.</span>
              </h2>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="mt-12 grid gap-5 sm:grid-cols-2">
                {COMMITMENTS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-4 rounded-[1.75rem] border border-[#E6EAF0] bg-white p-6 text-left shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#0B84FF]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm leading-6 text-[#5F6368]">{text}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        <section className="relative overflow-hidden px-5 py-20 sm:px-8 lg:px-10">
          <HiveWaves className="bottom-0 z-0 h-24 opacity-50 sm:h-32" flip />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A8F98]">
              Join the movement
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.01em] text-[#202124] sm:text-4xl">
              Be part of something bigger
            </h2>
            <p className="mt-4 text-base text-[#5F6368]">
              Whether you're a student looking to make an impact or an organization seeking passionate volunteers, Hive is where purpose meets action.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth?mode=signup&role=student"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0B84FF] px-8 py-3 text-base font-semibold text-white shadow-[0_8px_20px_rgba(11,132,255,0.2)] transition-all hover:shadow-[0_10px_28px_rgba(11,132,255,0.3)]"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth?mode=signup&role=ngo"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#E6EAF0] bg-white px-8 py-3 text-base font-semibold text-[#202124] shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:border-[#D5DCE6] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
              >
                I&apos;m an NGO
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
