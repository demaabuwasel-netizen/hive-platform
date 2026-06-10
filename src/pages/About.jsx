import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import aboutLandingPage from '../assets/about_landing_page.png'
import { Lightbulb, Users, Target, Zap } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero - Full Screen with Navbar Overlay */}
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img
          src={aboutLandingPage}
          alt="About Hive"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, #FFFFFF 100%)',
          pointerEvents: 'none'
        }}/>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-center max-w-3xl px-6"
            style={{ color: C.primary }}>
            We believe talent and<br />mission belong<br />
            <span style={{ color: C.honey }}>together.</span>
          </h1>
        </motion.div>
      </section>

      {/* Smooth transition */}
      <div style={{
        height: '60px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,1) 100%)',
        pointerEvents: 'none',
        marginTop: '-15px'
      }}/>

      {/* Why We Built Hive */}
      <section className="py-32 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-5xl font-bold mb-8" style={{ color: C.primary }}>
              Why we built Hive
            </h2>
            <div className="space-y-6">
              <p className="text-2xl font-bold leading-relaxed" style={{ color: C.honey }}>
                Capable students and mission-driven organizations often fail to find each other.
              </p>
              <p className="text-xl leading-relaxed" style={{ color: C.muted }}>
                Not because the fit doesn't exist. But because discovery is broken.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: C.muted }}>
                A student passionate about education doesn't know about the NGO building schools in rural communities. An organization with an urgent need can't find the right volunteer. A bilingual student could be exactly what a community center needs—but neither knows it.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: C.muted }}>
                We built Hive to fix that. To make the connection between talent and purpose immediate, obvious, and inevitable.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Hive */}
      <section className="py-32 px-6" style={{ background: 'rgba(255, 183, 3, 0.04)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-5xl font-bold mb-8" style={{ color: C.primary }}>
              Why the name Hive?
            </h2>
            <div className="space-y-8">
              <p className="text-xl leading-relaxed" style={{ color: C.muted }}>
                A hive is built by many small actions working together. Every bee plays a role. Every contribution matters. No single bee creates the honey, builds the comb, or raises the young. It's the collective effort that creates something bigger than any individual.
              </p>
              <p className="text-xl leading-relaxed" style={{ color: C.muted }}>
                We named our platform Hive because we believe the same is true for meaningful work.
              </p>
              <div className="rounded-2xl p-8 bg-white border" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <p className="text-2xl font-bold" style={{ color: C.primary }}>
                  A student's skills + an NGO's mission = real impact.
                </p>
                <p className="text-lg mt-4" style={{ color: C.muted }}>
                  One volunteer and one opportunity. Thousands of small connections creating massive change. That's the hive.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }} className="text-center mb-24">
            <h2 className="text-5xl font-bold" style={{ color: C.primary }}>
              What we believe
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                icon: Target,
                title: 'Skills should serve impact',
                desc: 'Every student has something to offer. Their skills should go to work on something that matters.'
              },
              {
                icon: Users,
                title: 'Students deserve real experience',
                desc: 'Internships and volunteer work should mean something. Real projects. Real impact. Real relationships.'
              },
              {
                icon: Lightbulb,
                title: 'Organizations deserve the right fit',
                desc: 'NGOs shouldn\'t sift through unqualified applications. They should get candidates who genuinely fit their mission.'
              },
              {
                icon: Zap,
                title: 'Opportunity should be obvious',
                desc: 'Finding the right role shouldn\'t require endless searching. Match on meaning, not keywords.'
              },
            ].map((belief, i) => {
              const IconComponent = belief.icon
              return (
                <motion.div key={belief.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50 border transition-all hover:shadow-lg hover:border-amber-200"
                  style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,183,3,0.1)', color: C.honey }}>
                      <IconComponent size={24} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold mt-1" style={{ color: C.primary }}>
                      {belief.title}
                    </h3>
                  </div>
                  <p className="text-lg leading-relaxed" style={{ color: C.muted }}>
                    {belief.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-32 px-6" style={{ background: 'rgba(13, 24, 61, 0.02)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            <h2 className="text-5xl font-bold mb-6" style={{ color: C.primary }}>
              Join the Hive
            </h2>
            <p className="text-2xl font-bold mb-4" style={{ color: C.honey }}>
              Be part of something bigger.
            </p>
            <p className="text-xl mb-12 leading-relaxed" style={{ color: C.muted }}>
              Whether you're a student ready to make an impact, or an organization looking for dedicated volunteers—we'd love to have you join us.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup&role=student"
                className="inline-block px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:shadow-xl active:scale-95"
                style={{ background: C.primary, boxShadow: '0 12px 32px rgba(13,24,61,0.2)' }}>
                I'm a student →
              </Link>
              <Link to="/auth?mode=signup&role=ngo"
                className="inline-block px-8 py-4 rounded-2xl text-base font-bold border transition-all hover:bg-slate-50 active:scale-95"
                style={{ color: C.primary, borderColor: 'rgba(13,24,61,0.2)' }}>
                I represent an organization →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="py-12 text-center text-sm bg-white" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
