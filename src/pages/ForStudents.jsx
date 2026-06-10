import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import BrandIllustration from '../components/BrandIllustration'
import studentLandingPage from '../assets/student_landing_page.png'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

const BENEFITS = [
  { emoji: '🎯', title: 'AI-matched to your skills', desc: 'Our engine reads your profile — skills, field, interests, languages — and surfaces NGOs that actually need what you bring.' },
  { emoji: '🌱', title: 'Real-world experience', desc: 'Work on live projects with real impact, not fictional case studies. Build something you can point to.' },
  { emoji: '🤝', title: 'Meaningful connections', desc: 'Meet professionals who care about the same things you do. These relationships last beyond the project.' },
  { emoji: '📁', title: 'Build your portfolio', desc: 'Every project you complete is a concrete outcome you can show in interviews and on your CV.' },
]

const STEPS = [
  { n: '01', title: 'Create your profile', desc: 'Tell us your field, skills, languages, and what kind of impact you want to make.' },
  { n: '02', title: 'Get matched', desc: 'Hive\'s AI reads your profile and surfaces NGOs whose needs align with your strengths.' },
  { n: '03', title: 'Apply in one click', desc: 'An AI-drafted application is ready for you to personalise and send — no blank-page anxiety.' },
  { n: '04', title: 'Start contributing', desc: 'Land the role, do meaningful work, and walk away with real experience and real impact.' },
]

export default function ForStudents() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F9FAFB' }}>
      {/* Hero - Full Screen with Navbar Overlay */}
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img
          src={studentLandingPage}
          alt="Student working on NGO project"
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
            Build your career<br />while making a<br />
            <span style={{ color: C.honey }}>real difference.</span>
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

      {/* Your journey */}
      <section className="py-24 px-6 bg-white" style={{ marginTop: '-15px' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6" style={{ color: C.primary }}>
              Your journey starts here
            </h2>
            <p className="text-lg" style={{ color: C.muted }}>
              Four simple steps from discovery to real impact.
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
                  style={{ background: 'rgba(255,183,3,0.1)', color: C.honey }}>
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

      {/* Why students trust Hive */}
      <section className="py-20 px-6" style={{ background: 'rgba(255, 183, 3, 0.03)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-16" style={{ color: C.primary }}>
            Why students trust Hive
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
              Ready to find your next opportunity?
            </h2>
            <p className="text-lg mb-8" style={{ color: C.muted }}>
              Join hundreds of students building real experience that matters.
            </p>
            <Link to="/auth?mode=signup"
              className="inline-block px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
              style={{ background: C.primary, boxShadow: '0 8px 20px rgba(13,24,61,0.15)' }}>
              Start your profile →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
