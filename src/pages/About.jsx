import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import aboutLandingPage from '../assets/about_landing_page.png'
import { Target, Users, Lightbulb, Zap } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      {/* Hero */}
      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img src={aboutLandingPage} alt="About Hive" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, #FFFFFF 100%)',
          pointerEvents: 'none'
        }}/>
        <motion.div className="absolute inset-0 flex items-center justify-center"
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

      {/* Transition */}
      <div style={{
        height: '40px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,1) 100%)',
        pointerEvents: 'none',
        marginTop: '-1px'
      }}/>

      {/* The Problem - Visual */}
      <section className="py-20 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-16" style={{ color: C.primary }}>
              The problem we solve
            </h2>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                { title: 'Students want to help', desc: 'Passion. Skills. Energy.' },
                { title: 'Organizations need support', desc: 'Real work. Real impact.' },
                { title: 'But they never meet', desc: 'Discovery is broken.' },
              ].map((item, i) => (
                <motion.div key={item.title}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: C.primary }}>
                    {item.title}
                  </h3>
                  <p className="text-lg" style={{ color: C.honey, fontWeight: 'bold' }}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Hive - Visual with nature theme */}
      <section className="py-28 px-6" style={{ background: 'rgba(255, 183, 3, 0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>
            Why we call it Hive
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Visual explanation */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}>
              <div className="space-y-8">
                {[
                  { title: 'Many small actions', desc: 'Every bee contributes' },
                  { title: 'Working together', desc: 'Organized effort' },
                  { title: 'Creating something bigger', desc: 'Real collective impact' },
                ].map((item, i) => (
                  <div key={item.title} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ background: 'rgba(255,183,3,0.15)', color: C.honey }}>
                        {i + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1" style={{ color: C.primary }}>
                        {item.title}
                      </h4>
                      <p style={{ color: C.muted }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Key insight */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl p-12 border"
              style={{ borderColor: 'rgba(13,24,61,0.08)', background: 'rgba(255,255,255,0.5)' }}>
              <p className="text-3xl font-bold mb-6 leading-tight" style={{ color: C.primary }}>
                One student + one opportunity = real change
              </p>
              <p className="text-xl" style={{ color: C.muted }}>
                Thousands of connections.<br />Massive impact.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Believe - Icons + titles only */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>
            What we stand for
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              { icon: Target, title: 'Skills create impact' },
              { icon: Users, title: 'Real experience matters' },
              { icon: Lightbulb, title: 'Right fit is everything' },
              { icon: Zap, title: 'Discovery should be obvious' },
            ].map((item, i) => {
              const IconComponent = item.icon
              return (
                <motion.div key={item.title}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-6 p-8 rounded-2xl border"
                  style={{ borderColor: 'rgba(13,24,61,0.08)', background: 'rgba(255,255,255,0.5)' }}>
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,183,3,0.1)' }}>
                    <IconComponent size={32} style={{ color: C.honey }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: C.primary }}>
                    {item.title}
                  </h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ background: 'rgba(13, 24, 61, 0.02)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: C.primary }}>
              Be part of it
            </h2>
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
