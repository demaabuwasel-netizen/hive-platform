import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import BrandIllustration from '../components/BrandIllustration'
import studentLandingPage from '../assets/student_landing_page.png'

const C = { bg: '#FAF6EF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

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
    <div className="flex flex-col min-h-screen">
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
          background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, #FAF6EF 100%)',
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


      {/* Gradient transition */}
      <div style={{
        height: '120px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 15%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.5) 65%, rgba(255,255,255,0.85) 85%, white 100%)',
        pointerEvents: 'none'
      }}/>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-0">
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-[1.9rem] font-extrabold text-center mb-12" style={{ color: C.primary }}>
          Why students choose Hive
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border p-6 flex flex-col gap-3"
              style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
              <span className="text-3xl">{b.emoji}</span>
              <p className="text-[14px] font-bold" style={{ color: C.primary }}>{b.title}</p>
              <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-[1.9rem] font-extrabold text-center mb-12" style={{ color: C.primary }}>
          From profile to impact in 4 steps
        </motion.h2>
        <div className="flex flex-col gap-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.42 }}
              className="bg-white rounded-2xl border px-7 py-5 flex items-start gap-6"
              style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
              <span className="text-[1.6rem] font-extrabold shrink-0" style={{ color: 'rgba(255,183,3,0.35)' }}>{s.n}</span>
              <div>
                <p className="text-[14px] font-bold mb-1" style={{ color: C.primary }}>{s.title}</p>
                <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl px-10 py-14 text-center"
          style={{ background: C.primary }}>
          <p className="text-[2rem] font-extrabold text-white mb-3">Ready to get matched?</p>
          <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Create your free profile and let Hive's AI find your best opportunities.
          </p>
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}>
            <Link to="/auth?mode=signup"
              className="inline-block px-8 py-3.5 rounded-2xl text-[15px] font-bold transition-all hover:opacity-90"
              style={{ background: C.honey, color: 'white', boxShadow: '0 4px 20px rgba(255,183,3,0.3)' }}>
              Create free account →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer spacer */}
      <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
