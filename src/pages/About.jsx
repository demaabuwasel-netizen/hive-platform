import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import HiveLogo from '../components/HiveLogo'
import BrandIllustration from '../components/BrandIllustration'
import aboutLandingPage from '../assets/about_landing_page.png'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

const VALUES = [
  { emoji: '🎯', title: 'Precision over volume', desc: 'One well-matched placement beats ten random ones. We optimise for quality and genuine fit.' },
  { emoji: '🔍', title: 'Transparency', desc: 'Every match comes with a full explanation. No black boxes — you always know why.' },
  { emoji: '🌍', title: 'Inclusion', desc: 'We build for diverse communities. Language, background, and geography are features, not obstacles.' },
  { emoji: '🤝', title: 'Mutual benefit', desc: 'A good match works for both sides. Students grow. NGOs move their mission forward.' },
]

export default function About() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F9FAFB' }}>
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
        marginTop: '-30px'
      }}/>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-6 py-0" style={{ marginTop: '-30px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-10"
          style={{ background: C.primary }}>
          <p className="text-[1.5rem] font-extrabold text-white leading-snug">
            "Make every student's skills accessible to every NGO that needs them —
            and make every NGO's mission accessible to every student who cares."
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-2xl border p-10"
          style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
          <h2 className="text-[1.6rem] font-extrabold mb-5" style={{ color: C.primary }}>The problem we're solving</h2>
          <div className="flex flex-col gap-4 text-[14px] leading-relaxed" style={{ color: C.muted }}>
            <p>
              Every year, thousands of students graduate with strong technical and creative skills,
              desperate for real-world experience that matters. At the same time, NGOs across the country
              struggle to find volunteers who can actually help — not just show up, but contribute meaningfully.
            </p>
            <p>
              The problem isn't a shortage of talent or a shortage of need. It's a matching problem.
              A Python developer and a data-hungry NGO might be 10 minutes apart and never find each other.
              A bilingual student could be exactly what an Arab-Jewish community centre needs — but neither knows it.
            </p>
            <p>
              Hive fixes that. We use AI to read the meaning behind profiles — skills, experience, languages,
              values — and surface connections that would otherwise never happen.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-[1.9rem] font-extrabold text-center mb-12" style={{ color: C.primary }}>
          What we stand for
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => (
            <motion.div key={v.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border p-6 flex flex-col gap-3"
              style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
              <span className="text-3xl">{v.emoji}</span>
              <p className="text-[14px] font-bold" style={{ color: C.primary }}>{v.title}</p>
              <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl px-10 py-14 text-center"
          style={{ background: 'rgba(13,24,61,0.04)', border: '1px solid rgba(13,24,61,0.08)' }}>
          <p className="text-[2rem] font-extrabold mb-3" style={{ color: C.primary }}>Join the Hive.</p>
          <p className="text-[15px] mb-8" style={{ color: C.muted }}>
            Whether you're a student looking to make an impact, or an NGO looking for your next collaborator —
            we'd love to have you.
          </p>
          <motion.div className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}>
            <Link to="/auth?mode=signup"
              className="px-8 py-3.5 rounded-2xl text-[15px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#0D183D', boxShadow: '0 4px 20px rgba(13,24,61,0.2)' }}>
              Get started →
            </Link>
            <Link to="/how-it-works"
              className="px-8 py-3.5 rounded-2xl text-[15px] font-semibold border transition-all hover:bg-[rgba(13,24,61,0.04)]"
              style={{ color: C.primary, borderColor: 'rgba(13,24,61,0.15)' }}>
              See how it works
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
