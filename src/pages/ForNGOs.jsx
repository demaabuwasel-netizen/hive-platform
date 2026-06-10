import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import ngoLandingPage from '../assets/ngo_landing_page.png'
import { ArrowRight, Target, Users, Zap, Shield, Compass } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function ForNGOs() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-white">
        <img src={ngoLandingPage} alt="NGO team" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, #FFFFFF 100%)', pointerEvents: 'none' }}/>
      </section>

      <div style={{ height: '60px', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', pointerEvents: 'none', marginTop: '-20px' }}/>

      {/* The Problem Section */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-32">
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              The volunteer recruitment challenge
            </h2>
            <p className="text-xl max-w-3xl leading-relaxed mb-12" style={{ color: C.muted }}>
              You know exactly what your organization needs. But finding capable, motivated students who understand your mission? That's the hard part. Hive changes that.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  problem: 'Too many applications, not enough matches',
                  solution: 'Hive surfaces only qualified candidates who align with your mission.'
                },
                {
                  problem: 'Volunteers without understanding of your work',
                  solution: 'Real alignment means students who actually care about your cause.'
                },
                {
                  problem: 'Manual screening takes time away from impact',
                  solution: 'Smart matching reduces screening hours, not quality.'
                },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl p-8 bg-gradient-to-br from-red-50 to-white border"
                  style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <h3 className="font-bold mb-4 text-lg" style={{ color: '#DC2626' }}>
                    {item.problem}
                  </h3>
                  <p className="text-sm" style={{ color: C.primary }}>
                    <strong>Our solution:</strong> {item.solution}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-40 px-6 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-32">
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: C.primary }}>
              How Hive makes hiring easier
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: C.muted }}>
              Six steps from setup to collaboration. Every step designed to save your team time while finding the right fit.
            </p>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              {
                num: '01',
                title: 'Create your organization profile',
                desc: 'Tell us about your mission, who you serve, and why your work matters.',
              },
              {
                num: '02',
                title: 'Post your volunteer roles',
                desc: 'Describe what you need. Real descriptions, not generic job postings.',
              },
              {
                num: '03',
                title: 'Let Hive find candidates',
                desc: 'Our system surfaces students whose skills and values match your needs.',
              },
              {
                num: '04',
                title: 'Review qualified applicants',
                desc: 'See only the candidates who fit. Understand exactly why they match.',
              },
              {
                num: '05',
                title: 'Connect and interview',
                desc: 'Real conversations built on genuine mission alignment. Built-in messaging.',
              },
              {
                num: '06',
                title: 'Onboard and grow',
                desc: 'New volunteers ready to contribute. Your impact grows with every addition.',
              },
            ].map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}
                className="rounded-2xl p-10 bg-white border transition-all hover:shadow-lg"
                style={{ borderColor: 'rgba(13,24,61,0.08)', boxShadow: '0 4px 12px rgba(13,24,61,0.04)' }}>
                <div className="flex gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl"
                      style={{ background: 'rgba(13,24,61,0.08)', color: C.primary }}>
                      {step.num}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: C.primary }}>
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: C.muted }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Organizations Choose Hive */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-24">
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: C.primary }}>
              Why organizations trust Hive
            </h2>
            <p className="text-xl max-w-3xl" style={{ color: C.muted }}>
              Built from the ground up for nonprofits, with the specific challenges of volunteer recruitment in mind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                title: 'Mission-aligned students',
                desc: 'Not just any volunteer. Students who understand and care about your work.'
              },
              {
                icon: Shield,
                title: 'Verified and credible',
                desc: 'Know who you\'re working with. Real students, real commitment, real impact.'
              },
              {
                icon: Zap,
                title: 'Smarter matching',
                desc: 'Our system understands skills, availability, and values. Better fits. Fewer mismatches.'
              },
              {
                icon: Compass,
                title: 'Built for nonprofits',
                desc: 'Created specifically for organizations. Every feature serves your mission.'
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="p-10 rounded-2xl bg-gradient-to-br from-slate-50 to-white border"
                  style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(13,24,61,0.08)' }}>
                    <Icon size={28} style={{ color: C.primary }} strokeWidth={1.5} />
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

      {/* Final CTA */}
      <section className="py-40 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              Your next volunteer is waiting
            </h2>
            <p className="text-xl mb-12" style={{ color: C.muted }}>
              Register your organization and post your first role. Find motivated, capable volunteers who fit your mission.
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
