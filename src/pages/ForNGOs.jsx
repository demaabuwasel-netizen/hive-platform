import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import BrandIllustration from '../components/BrandIllustration'
import ngoLandingPage from '../assets/ngo_landing_page.png'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

const BENEFITS = [
  { emoji: '🧠', title: 'AI-quality matching', desc: 'Our engine goes beyond keywords — it reads skills, experience, language, and mission alignment to surface candidates who genuinely fit.' },
  { emoji: '⚡', title: 'Save hours of screening', desc: 'No more sifting through unqualified applications. Hive delivers ranked candidates with a full explanation of why each one fits.' },
  { emoji: '🌍', title: 'Diverse talent pool', desc: 'Access motivated students from universities across the country, representing a wide range of backgrounds and skill sets.' },
  { emoji: '💬', title: 'Built-in communication', desc: 'Message candidates, schedule interviews, and manage applications — all in one place, without juggling email threads.' },
]

const STEPS = [
  { n: '01', title: 'Describe your needs', desc: 'Tell us what your organisation does and what kind of help you\'re looking for — in plain language, no job description required.' },
  { n: '02', title: 'Receive ranked matches', desc: 'Hive\'s AI reviews your listing and surfaces the best-fit student profiles, ranked by compatibility.' },
  { n: '03', title: 'Review and connect', desc: 'Browse detailed profiles, read AI-generated match explanations, and reach out directly to candidates.' },
  { n: '04', title: 'Welcome your volunteer', desc: 'Schedule an interview, confirm the placement, and start your collaboration — Hive stays with you throughout.' },
]

export default function ForNGOs() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F9FAFB' }}>
      {/* Hero - Full Screen with Navbar Overlay */}
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img
          src={ngoLandingPage}
          alt="NGO team collaborating"
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
            Find the talent<br />your mission<br />
            <span style={{ color: C.honey }}>actually needs.</span>
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

      {/* Your process */}
      <section className="py-24 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6" style={{ color: C.primary }}>
              From listing to collaboration
            </h2>
            <p className="text-lg" style={{ color: C.muted }}>
              Four straightforward steps to find the right volunteers for your mission.
            </p>
          </motion.div>

          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}
                className="rounded-2xl p-8 flex gap-8 items-start bg-white border transition-all hover:shadow-md"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
                  style={{ background: 'rgba(13,24,61,0.1)', color: C.primary }}>
                  {s.n}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: C.primary }}>
                    {s.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: C.muted }}>
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why NGOs choose Hive */}
      <section className="py-20 px-6" style={{ background: 'rgba(13, 24, 61, 0.02)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-16" style={{ color: C.primary }}>
            Why organizations choose Hive
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {BENEFITS.slice(0, 4).map((b, i) => (
              <motion.div key={b.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}
                className="bg-white rounded-xl p-7 border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-lg font-bold mb-3" style={{ color: C.primary }}>
                  {b.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: C.muted }}>
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-bold mb-4" style={{ color: C.primary }}>
              Ready to find dedicated volunteers?
            </h2>
            <p className="text-lg mb-8" style={{ color: C.muted }}>
              Post your roles and connect with students who share your mission.
            </p>
            <Link to="/auth?mode=signup"
              className="inline-block px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
              style={{ background: C.primary, boxShadow: '0 8px 20px rgba(13,24,61,0.15)' }}>
              Get started →
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
