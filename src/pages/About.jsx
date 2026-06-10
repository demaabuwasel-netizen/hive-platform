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
        marginTop: '-15px'
      }}/>

      {/* Why Hive */}
      <section className="py-24 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-bold mb-8" style={{ color: C.primary }}>
              Why we built Hive
            </h2>
            <p className="text-xl leading-relaxed mb-8" style={{ color: C.muted }}>
              Talented students and mission-driven organizations often miss each other. Not because the fit doesn't exist, but because discovery is broken.
            </p>
            <p className="text-xl leading-relaxed" style={{ color: C.muted }}>
              A student passionate about education doesn't know about the NGO building schools in rural communities. An organization with an urgent need can't find the right volunteer. Both sides want to help, but the connection never happens.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Hive Metaphor */}
      <section className="py-24 px-6" style={{ background: 'rgba(255, 183, 3, 0.03)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }} className="mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: C.primary }}>
              Why Hive?
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: C.muted }}>
              A hive is built by many small actions working together. Every bee plays a role. Every contribution matters. No single bee creates the honey, builds the comb, or raises the young. It's the collective effort that creates something bigger than any individual.
            </p>
          </motion.div>

          <p className="text-lg leading-relaxed" style={{ color: C.muted }}>
            We named Hive because we believe the same is true for meaningful work. A student's skills combined with an NGO's mission. One volunteer and one opportunity. Thousands of small connections creating massive impact. That's the hive.
          </p>
        </div>
      </section>

      {/* What we believe */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }} className="mb-16">
            <h2 className="text-4xl font-bold text-center" style={{ color: C.primary }}>
              What we believe
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Skills should create impact',
                desc: 'Every student has something to offer. Their skills should go to work on something that matters, not get filed away in a resume.'
              },
              {
                title: 'Opportunities should be easy to discover',
                desc: 'Finding the right role shouldn\'t require endless scrolling or reading generic job descriptions. Match on meaning, not keywords.'
              },
              {
                title: 'Organizations deserve the right fit',
                desc: 'NGOs don\'t have time to sift through unqualified applications. They should get candidates who genuinely fit their mission and needs.'
              },
              {
                title: 'Experience should be real',
                desc: 'Internships and volunteer work should mean something. Real projects. Real impact. Real relationships that last beyond the contract.'
              },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}
                className="rounded-2xl p-8 border bg-white"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: C.primary }}>
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: C.muted }}>
                  {item.desc}
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
            <h2 className="text-3xl font-bold mb-4" style={{ color: C.primary }}>Join the Hive</h2>
            <p className="text-lg mb-8" style={{ color: C.muted }}>
              Whether you're a student looking to make an impact, or an organization looking for your next collaborator—
              we'd love to have you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/auth?mode=signup"
                className="px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
                style={{ background: C.primary, boxShadow: '0 8px 20px rgba(13,24,61,0.15)' }}>
                Get started →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
