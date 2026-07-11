import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Users, Zap, Target } from 'lucide-react'
import HiveLogo from '../components/HiveLogo'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'For Students', to: '/for-students' },
  { label: 'For NGOs', to: '/for-ngos' },
  { label: 'About Us', to: '/about' },
]

export default function About() {
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
                Hive is on a mission to bridge the gap between students seeking meaningful impact and organizations creating real change.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#E6EAF0] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: Heart,
                  title: 'Mission-driven',
                  desc: 'We believe purpose matters.',
                  accent: 'blue',
                },
                {
                  icon: Users,
                  title: 'Community-focused',
                  desc: 'We build communities, not just platforms.',
                  accent: 'green',
                },
                {
                  icon: Zap,
                  title: 'Impact-oriented',
                  desc: 'Real change comes from real people.',
                  accent: 'amber',
                },
                {
                  icon: Target,
                  title: 'Values-aligned',
                  desc: 'We match what matters to people.',
                  accent: 'navy',
                },
              ].map(({ icon: Icon, title, desc, accent }) => {
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
                Our Story
              </h2>
              <p className="mt-3 text-base text-[#5F6368]">
                How it all started
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'The Problem',
                  desc: 'Students struggled to find meaningful opportunities aligned with their values. Organizations found it hard to connect with passionate, capable volunteers.',
                },
                {
                  title: 'The Solution',
                  desc: 'We built Hive to create intelligent matching between students and organizations, based on skills, values, and mission alignment.',
                },
                {
                  title: 'The Impact',
                  desc: 'Today, Hive connects thousands of students with organizations creating real change in their communities.',
                },
              ].map((item, i) => (
                <div key={item.title} className="rounded-[2rem] border border-[#E6EAF0] bg-white p-7 shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_16px_48px_rgba(11,132,255,0.1)]">
                  <div className="mb-1 text-2xl font-bold text-[#0B84FF]">{i + 1}</div>
                  <h3 className="text-lg font-semibold text-[#202124]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5F6368]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10 bg-slate-50">
          <div className="mx-auto max-w-5xl text-center">
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
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
