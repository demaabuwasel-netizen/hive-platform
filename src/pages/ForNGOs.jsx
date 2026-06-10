import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import ngoLandingPage from '../assets/ngo_landing_page.png'
import { ArrowRight, Target, Users, Zap, Shield, Compass, CheckCircle2 } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', accent: '#3B82F6', muted: '#4B6382' }

export default function ForNGOs() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-white">
        <img src={ngoLandingPage} alt="NGO team" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, rgba(255,255,255,0.95) 100%)', pointerEvents: 'none' }}/>
        <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-center max-w-3xl px-6" style={{ color: C.primary }}>
            Find volunteers<br />who actually fit<br />
            <span style={{ color: C.accent }}>your mission.</span>
          </h1>
        </motion.div>
      </section>

      <div style={{ height: '60px', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', pointerEvents: 'none', marginTop: '-20px' }}/>

      {/* Why Hive is Different for NGOs */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-32">
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              Why Hive is different for organizations
            </h2>
            <p className="text-xl max-w-3xl leading-relaxed" style={{ color: C.muted }}>
              Finding capable, mission-aligned volunteers shouldn't be complicated. Hive makes it easy to connect with students who genuinely care about your cause and have the skills you need.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Target,
                title: 'Mission-aligned matching',
                desc: 'Find volunteers who understand and care about your cause, not just anyone looking for experience.'
              },
              {
                icon: Zap,
                title: 'Smart skill matching',
                desc: 'Surface candidates with the exact skills you need, every time. No more sifting through unqualified applicants.'
              },
              {
                icon: Users,
                title: 'Verified, capable students',
                desc: 'Work with real, motivated students who take their commitments seriously. Build trust from day one.'
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border"
                  style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(59,130,246,0.15)' }}>
                    <Icon size={28} style={{ color: C.accent }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: C.primary }}>
                    {item.title}
                  </h3>
                  <p style={{ color: C.muted, lineHeight: '1.6' }}>
                    {item.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Your Process */}
      <section className="py-40 px-6 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-32">
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: C.primary }}>
              Your journey to finding<br />
              <span style={{ color: C.accent }}>the right volunteers</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: C.muted }}>
              From setup to your first volunteer. Six straightforward steps.
            </p>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto mb-20">
            {[
              {
                num: '01',
                title: 'Create your profile',
                desc: 'Tell us about your organization, mission, and the impact you create.',
                details: ['Your mission & values', 'Who you serve', 'Your team size', 'Work you do']
              },
              {
                num: '02',
                title: 'Post volunteer roles',
                desc: 'Describe what you need. Be specific about skills, time, and impact.',
                details: ['Role title & description', 'Required skills', 'Time commitment', 'Mission fit']
              },
              {
                num: '03',
                title: 'Get matched candidates',
                desc: 'Hive surfaces students whose skills and values align with your needs.',
                details: ['Skill-based matches', 'Mission-aligned students', 'Availability fit', 'Quality candidates']
              },
              {
                num: '04',
                title: 'Review & interview',
                desc: 'See exactly why each student matches. Real conversations, real fit.',
                details: ['See match reasoning', 'View student profiles', 'Built-in messaging', 'Confidence in fit']
              },
              {
                num: '05',
                title: 'Onboard & collaborate',
                desc: 'Get your volunteers started. Tools to stay connected and coordinate.',
                details: ['Easy onboarding', 'Track projects', 'Built-in updates', 'Organized workflow']
              },
              {
                num: '06',
                title: 'Grow your impact',
                desc: 'Build a volunteer community. Scale your mission with capable, committed people.',
                details: ['Sustainable volunteers', 'Repeat collaborations', 'Grow your team', 'Bigger impact']
              },
            ].map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl p-10 bg-white border transition-all hover:shadow-lg"
                style={{ borderColor: 'rgba(13,24,61,0.08)', boxShadow: '0 4px 12px rgba(13,24,61,0.04)' }}>
                <div className="flex gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl"
                      style={{ background: 'rgba(59,130,246,0.15)', color: C.accent }}>
                      {step.num}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: C.primary }}>
                      {step.title}
                    </h3>
                    <p className="text-base mb-6 leading-relaxed" style={{ color: C.muted }}>
                      {step.desc}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {step.details.map((detail, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: C.honey }}/>
                          <span className="text-sm" style={{ color: C.primary }}>
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-20">
            <h2 className="text-4xl font-bold mb-6" style={{ color: C.primary }}>
              Built for organizations. Built for real impact.
            </h2>
            <p className="text-lg max-w-3xl" style={{ color: C.muted }}>
              Every feature is designed specifically for nonprofits. From mission-focused matching to easy volunteer management, everything prioritizes your success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Verified students', desc: 'Only real, committed students. No spam or casual browsers.' },
              { title: 'Mission-first matching', desc: 'Find volunteers who care about your cause, not just any student.' },
              { title: 'Transparent process', desc: 'See why each student matches. Understand fit before you interview.' },
              { title: 'Community trust', desc: 'Join thousands of organizations finding their perfect volunteers on Hive.' },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-lg font-bold mb-3" style={{ color: C.primary }}>
                  {item.title}
                </h3>
                <p style={{ color: C.muted }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              Your next volunteer is waiting
            </h2>
            <p className="text-xl mb-12" style={{ color: C.muted }}>
              Create your organization profile in minutes. Start connecting with mission-aligned volunteers today.
            </p>
            <Link to="/auth?mode=signup&role=ngo"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-xl text-lg font-bold text-white transition-all hover:shadow-xl active:scale-95"
              style={{ background: C.primary, boxShadow: '0 12px 40px rgba(13,24,61,0.2)' }}>
              Create organization profile <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-white text-center text-sm" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. Connecting talent with purpose.
      </footer>
    </div>
  )
}
