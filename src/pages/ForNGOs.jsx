import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import BrandIllustration from '../components/BrandIllustration'
import ngoLandingPage from '../assets/ngo_landing_page.png'

const C = { bg: '#FAF6EF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

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
    <div className="flex flex-col min-h-screen" style={{ background: C.bg }}>
      <Navbar />

      {/* Hero - Full Screen */}
      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img
          src={ngoLandingPage}
          alt="NGO team collaborating"
          className="w-full h-full object-cover"
        />
      </section>

      {/* Hero Text - Below Image */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-16 text-center">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.h1 variants={fadeUp}
            className="text-[3rem] font-extrabold leading-[1.08] tracking-tight mb-5"
            style={{ color: C.primary }}>
            Find the talent<br />your mission<br />
            <span style={{ color: C.honey }}>actually needs.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[1.05rem] leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: C.muted }}>
            Hive connects your organisation with skilled, motivated students who understand
            your mission — not just generic volunteers, but people who can genuinely contribute.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
            <Link to="/auth?mode=signup"
              className="px-7 py-3.5 rounded-2xl text-[15px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: C.honey, boxShadow: '0 4px 20px rgba(255,183,3,0.35)' }}>
              Post your first opportunity →
            </Link>
            <Link to="/how-it-works"
              className="px-7 py-3.5 rounded-2xl text-[15px] font-semibold border transition-all hover:bg-[rgba(13,24,61,0.04)]"
              style={{ color: C.primary, borderColor: 'rgba(13,24,61,0.15)' }}>
              How it works
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-[1.9rem] font-extrabold text-center mb-12" style={{ color: C.primary }}>
          Why NGOs trust Hive
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
          From listing to placement in 4 steps
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
          <p className="text-[2rem] font-extrabold text-white mb-3">Ready to find your next volunteer?</p>
          <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Register your NGO and post your first opportunity — it takes less than 10 minutes.
          </p>
          <Link to="/auth?mode=signup"
            className="inline-block px-8 py-3.5 rounded-2xl text-[15px] font-bold transition-all hover:opacity-90"
            style={{ background: C.honey, color: 'white', boxShadow: '0 4px 20px rgba(255,183,3,0.3)' }}>
            Register your NGO →
          </Link>
        </motion.div>
      </section>

      <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
