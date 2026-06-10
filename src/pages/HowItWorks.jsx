import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

const STUDENT_STEPS = [
  { n: '01', title: 'Build your profile', desc: 'Add your field of study, skills, languages, interests, and what kind of impact you want to make. The more detail, the better your matches.' },
  { n: '02', title: 'AI analyses your profile', desc: 'Hive reads the meaning behind your words — not just keywords. "Volunteer app for a food bank" signals React, nonprofit experience, and initiative all at once.' },
  { n: '03', title: 'Receive ranked matches', desc: 'You see a ranked list of NGOs, each with a full explanation of why Hive thinks it\'s a fit — skill overlap, mission alignment, language match, and more.' },
  { n: '04', title: 'Apply with AI assistance', desc: 'A personalised application message is drafted for you based on your profile and the NGO\'s needs. Edit it, then send in one click.' },
  { n: '05', title: 'Interview and start', desc: 'Coordinate interviews directly on Hive. Once confirmed, you\'re matched — and you can start contributing to something that matters.' },
]

const NGO_STEPS = [
  { n: '01', title: 'Describe your needs', desc: 'Write what your organisation does and what kind of help you need — in plain language. No formal job description required.' },
  { n: '02', title: 'AI finds your candidates', desc: 'Hive scans student profiles and ranks candidates by how well their skills, experience, and mission alignment fit your specific needs.' },
  { n: '03', title: 'Review match explanations', desc: 'For each candidate, you see exactly why Hive matched them — specific skills, relevant projects, language ability, and shared values.' },
  { n: '04', title: 'Connect and interview', desc: 'Message candidates directly, schedule interviews from Hive, and use AI-generated interview questions tailored to each match.' },
  { n: '05', title: 'Welcome your volunteer', desc: 'Confirm the placement and start collaborating. Hive tracks the relationship and helps you manage multiple volunteers over time.' },
]

const PRINCIPLES = [
  { emoji: '📖', title: 'Semantic, not keyword', desc: 'We read meaning, not just words. Your experience building a food bank app tells us more than a list of technologies.' },
  { emoji: '🔍', title: 'Transparent reasoning', desc: 'Every match comes with a full explanation. You always know exactly why Hive connected these two people.' },
  { emoji: '⚖️', title: 'Bidirectional fit', desc: 'We optimise for both sides. A 94% match means both the student and the NGO have high compatibility — not just one direction.' },
  { emoji: '🌐', title: 'Language-aware', desc: 'We factor in language skills, especially Arabic and Hebrew — critical for organisations serving bilingual communities.' },
]

export default function HowItWorks() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F9FAFB' }}>
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-10 text-center">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.h1 variants={fadeUp}
            className="text-[3rem] font-extrabold leading-[1.08] tracking-tight mb-5"
            style={{ color: C.primary }}>
            Matching that reads<br />
            <span style={{ color: C.honey }}>meaning, not keywords.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[1.05rem] leading-relaxed max-w-2xl mx-auto" style={{ color: C.muted }}>
            Hive uses semantic AI to understand the real story behind a profile — experience, skills,
            values, and language — then connects students and NGOs whose needs genuinely align.
          </motion.p>
        </motion.div>
      </section>

      {/* AI Principles */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRINCIPLES.map((p, i) => (
            <motion.div key={p.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border p-6 flex flex-col gap-3"
              style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
              <span className="text-3xl">{p.emoji}</span>
              <p className="text-[14px] font-bold" style={{ color: C.primary }}>{p.title}</p>
              <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Student flow */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.45 }} className="mb-10">
          <h2 className="text-[1.9rem] font-extrabold" style={{ color: C.primary }}>Your path to a meaningful project</h2>
        </motion.div>
        <div className="flex flex-col gap-4">
          {STUDENT_STEPS.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
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

      {/* NGO flow */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.45 }} className="mb-10">
          <h2 className="text-[1.9rem] font-extrabold" style={{ color: C.primary }}>From listing to the right person</h2>
        </motion.div>
        <div className="flex flex-col gap-4">
          {NGO_STEPS.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border px-7 py-5 flex items-start gap-6"
              style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
              <span className="text-[1.6rem] font-extrabold shrink-0" style={{ color: 'rgba(13,24,61,0.15)' }}>{s.n}</span>
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
          className="rounded-3xl px-10 py-14 grid sm:grid-cols-2 gap-6 items-center"
          style={{ background: C.primary }}>
          <div>
            <p className="text-[2rem] font-extrabold text-white mb-2">See it for yourself.</p>
            <p className="text-[15px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Create a free account and get your first matches in minutes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Link to="/auth?mode=signup&role=student"
              className="px-6 py-3 rounded-2xl text-[14px] font-bold text-center transition-all hover:opacity-90"
              style={{ background: C.honey, color: 'white' }}>
              I'm a student →
            </Link>
            <Link to="/auth?mode=signup&role=ngo"
              className="px-6 py-3 rounded-2xl text-[14px] font-bold text-center border transition-all hover:bg-white/10"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.25)' }}>
              I represent an NGO →
            </Link>
          </div>
        </motion.div>
      </section>

      <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
