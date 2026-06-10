import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import aboutLandingPage from '../assets/about_landing_page.png'

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

      {/* The Story */}
      <section className="py-32 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-bold mb-10 leading-tight" style={{ color: C.primary }}>
              Why we built Hive
            </h2>

            <div className="space-y-8">
              <p className="text-xl leading-relaxed" style={{ color: C.muted }}>
                Capable students and mission-driven organizations often fail to find each other. Not because the fit doesn't exist, but because discovery is broken.
              </p>

              <p className="text-lg leading-relaxed" style={{ color: C.muted }}>
                A student passionate about education doesn't know about the NGO building schools in rural areas. An organization with urgent needs can't find the right volunteer. Both want to help, but the connection never happens.
              </p>

              <div className="rounded-2xl p-8 border bg-gradient-to-br from-white to-slate-50" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <p className="text-2xl font-bold" style={{ color: C.honey }}>
                  We built Hive to fix that.
                </p>
                <p className="text-lg mt-4 leading-relaxed" style={{ color: C.muted }}>
                  To make the connection between talent and purpose inevitable.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Concept */}
      <section className="py-28 px-6" style={{ background: 'rgba(255, 183, 3, 0.04)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-bold mb-10" style={{ color: C.primary }}>
              Why Hive
            </h2>
            <p className="text-xl leading-relaxed mb-8" style={{ color: C.muted }}>
              A hive is built by many working together. Every bee contributes. No single bee creates the honey—it's collective effort that creates something bigger than any individual.
            </p>
            <p className="text-xl leading-relaxed" style={{ color: C.muted }}>
              That's how meaningful work should be. A student's skills + an organization's mission = real impact. Thousands of small connections creating massive change.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Believe - Minimal */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-20" style={{ color: C.primary }}>
            What we believe
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Skills should create impact',
              'Students deserve real experience',
              'Organizations deserve the right fit',
              'Opportunity should be obvious',
            ].map((belief, i) => (
              <motion.div key={belief}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                className="p-8 bg-gradient-to-br from-white to-slate-50 rounded-xl border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-xl font-bold" style={{ color: C.primary }}>
                  {belief}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join */}
      <section className="py-28 px-6" style={{ background: 'rgba(13, 24, 61, 0.02)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-bold mb-6" style={{ color: C.primary }}>
              Join us
            </h2>
            <p className="text-xl mb-10 leading-relaxed" style={{ color: C.muted }}>
              Help us connect talent with purpose.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup&role=student"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg"
                style={{ background: C.primary }}>
                I'm a student
              </Link>
              <Link to="/auth?mode=signup&role=ngo"
                className="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-slate-50"
                style={{ color: C.primary, borderColor: 'rgba(13,24,61,0.2)' }}>
                I'm an organization
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <div className="py-8 text-center text-xs bg-white" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive
      </div>
    </div>
  )
}
