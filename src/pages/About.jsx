import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import aboutLandingPage from '../assets/about_landing_page.png'
import { Target, Users, Lightbulb, Zap, Heart } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

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

      <div style={{
        height: '40px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,1) 100%)',
        pointerEvents: 'none',
        marginTop: '-1px'
      }}/>

      {/* The Problem - Visual */}
      <section className="py-28 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <h2 className="text-4xl font-bold" style={{ color: C.primary }}>
              The problem we solve
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { title: 'Students want to help', items: ['Real skills', 'Real passion', 'Real impact'] },
              { title: 'Organizations need support', items: ['Capable people', 'Committed volunteers', 'Mission fit'] },
              { title: 'But they don\'t meet', items: ['Discovery is broken', 'Hidden from each other', 'Waiting to connect'] },
            ].map((problem, i) => (
              <motion.div key={problem.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                <h3 className="text-2xl font-bold mb-6" style={{ color: C.primary }}>
                  {problem.title}
                </h3>
                <div className="space-y-3">
                  {problem.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: C.honey }}/>
                      <span style={{ color: C.muted }}>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Hive - Visual journey */}
      <section className="py-28 px-6" style={{ background: 'rgba(255,183,3,0.04)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>
            Why we call it Hive
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {[
              {
                num: '1',
                title: 'Many small actions',
                desc: 'Every bee contributes something.',
                color: 'rgba(255,183,3,0.1)'
              },
              {
                num: '2',
                title: 'Working together',
                desc: 'Organized, purposeful effort.',
                color: 'rgba(59, 130, 246, 0.1)'
              },
              {
                num: '3',
                title: 'Creating impact',
                desc: 'Something bigger than any one person.',
                color: 'rgba(16, 185, 129, 0.1)'
              },
            ].map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold"
                  style={{ background: step.color, color: C.honey }}>
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: C.primary }}>
                  {step.title}
                </h3>
                <p style={{ color: C.muted }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Key insight */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-3xl mx-auto rounded-3xl p-12 border text-center bg-white"
            style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
            <p className="text-3xl font-bold mb-4" style={{ color: C.primary }}>
              One student + one opportunity = change
            </p>
            <p className="text-lg" style={{ color: C.muted }}>
              Thousands of connections creating massive impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hive Meaning - Visual cards */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>
            What Hive represents
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, label: 'Skills', color: 'rgba(255,183,3,0.1)', accent: C.honey },
              { icon: Heart, label: 'Mission', color: 'rgba(239, 68, 68, 0.1)', accent: '#EF4444' },
              { icon: Users, label: 'Community', color: 'rgba(59, 130, 246, 0.1)', accent: '#3B82F6' },
              { icon: Lightbulb, label: 'Trust', color: 'rgba(16, 185, 129, 0.1)', accent: '#10B981' },
              { icon: Zap, label: 'Impact', color: 'rgba(168, 85, 247, 0.1)', accent: '#A855F7' },
              { icon: Target, label: 'Connection', color: 'rgba(59, 130, 246, 0.1)', accent: '#3B82F6' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={item.label}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="text-center p-8 rounded-2xl border"
                  style={{ borderColor: 'rgba(13,24,61,0.08)', background: item.color }}>
                  <Icon size={32} style={{ color: item.accent, margin: '0 auto 12px' }} strokeWidth={1.5} />
                  <h3 className="font-bold" style={{ color: C.primary }}>
                    {item.label}
                  </h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Beliefs - Minimal */}
      <section className="py-28 px-6" style={{ background: 'rgba(13,24,61,0.02)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>
            What we believe
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Skills should serve more than careers',
              'Students deserve real experience',
              'NGOs deserve volunteers who fit',
              'Opportunity should be obvious',
            ].map((belief, i) => (
              <motion.div key={belief}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="p-8 rounded-2xl border bg-white"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-lg font-bold" style={{ color: C.primary }}>
                  {belief}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: C.primary }}>
              Be part of it
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup&role=student"
                className="px-8 py-3 rounded-xl text-base font-bold text-white transition-all hover:shadow-lg"
                style={{ background: C.primary }}>
                I'm a student
              </Link>
              <Link to="/auth?mode=signup&role=ngo"
                className="px-8 py-3 rounded-xl text-base font-bold border transition-all hover:bg-slate-50"
                style={{ color: C.primary, borderColor: 'rgba(13,24,61,0.2)' }}>
                I'm an organization
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="py-8 text-center text-xs bg-white" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive
      </div>
    </div>
  )
}
