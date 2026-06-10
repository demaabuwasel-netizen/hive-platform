import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import aboutLandingPage from '../assets/about_landing_page.png'
import { Target, Users, Lightbulb, Zap, Heart, ArrowRight } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img src={aboutLandingPage} alt="About Hive" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, #FFFFFF 100%)', pointerEvents: 'none' }}/>
        <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-center max-w-3xl px-6" style={{ color: C.primary }}>
            We believe talent and<br />mission belong<br />
            <span style={{ color: C.honey }}>together.</span>
          </h1>
        </motion.div>
      </section>

      <div style={{ height: '40px', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,1) 100%)', pointerEvents: 'none', marginTop: '-1px' }}/>

      {/* Why We Built Hive */}
      <section className="py-36 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-bold mb-10" style={{ color: C.primary }}>Why we built Hive</h2>
            <div className="space-y-8 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>Students have skills and passion. Organizations have missions and real work. The problem? <span style={{ color: C.primary, fontWeight: 'bold' }}>Discovery is broken.</span></p>
              <p>A student passionate about education doesn't know about the organization building schools. An NGO needs a designer but can't find one. Both want meaningful connections but never find each other.</p>
              <p style={{ color: C.primary, fontWeight: '600', fontSize: '1.1rem' }}>We built Hive to fix that. To make connection inevitable.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Hive - The Metaphor */}
      <section className="py-36 px-6 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-5xl font-bold mb-20" style={{ color: C.primary }}>
            Why the name<br />
            <span style={{ color: C.honey }}>Hive</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { num: '1', title: 'Many small actions', desc: 'Every bee contributes something meaningful.' },
              { num: '2', title: 'Working together', desc: 'Organized, purposeful collective effort.' },
              { num: '3', title: 'Creating impact', desc: 'Something bigger than any one person.' },
            ].map((item, i) => (
              <motion.div key={item.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl p-8 bg-white border" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <div className="text-4xl font-bold mb-4" style={{ color: C.honey }}>{item.num}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: C.primary }}>{item.title}</h3>
                <p style={{ color: C.muted }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-12 bg-gradient-to-br from-amber-50 to-white border text-center"
            style={{ borderColor: `${C.honey}40` }}>
            <p className="text-3xl font-bold" style={{ color: C.primary }}>
              One student<br />+ One opportunity = Change
            </p>
            <p className="text-lg mt-6" style={{ color: C.muted }}>
              Thousands of connections creating massive impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-36 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-20" style={{ color: C.primary }}>What we believe</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Skills serve impact', desc: 'Every student skill should go toward something that matters.' },
              { title: 'Real experience', desc: 'Internships should mean something meaningful.' },
              { title: 'Right fit matters', desc: 'Organizations deserve volunteers aligned with their mission.' },
              { title: 'Discovery is hard', desc: 'But connection doesn\'t have to be complicated.' },
            ].map((belief, i) => (
              <motion.div key={belief.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                className="p-8 rounded-2xl bg-white border" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: C.primary }}>{belief.title}</h3>
                <p style={{ color: C.muted }}>{belief.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Hive Represents */}
      <section className="py-28 px-6 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-20" style={{ color: C.primary }}>Hive represents</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, label: 'Skill' },
              { icon: Heart, label: 'Mission' },
              { icon: Users, label: 'Community' },
              { icon: Lightbulb, label: 'Trust' },
              { icon: Zap, label: 'Impact' },
              { icon: ArrowRight, label: 'Connection' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="text-center p-8 rounded-2xl bg-white border" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <Icon size={32} style={{ color: C.honey, margin: '0 auto 12px' }} strokeWidth={1.5} />
                  <h3 className="font-bold" style={{ color: C.primary }}>{item.label}</h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: C.primary }}>Be part of the hive</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth?mode=signup&role=student"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:shadow-lg"
              style={{ background: C.primary }}>
              I'm a student
            </Link>
            <Link to="/auth?mode=signup&role=ngo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold border transition-all hover:bg-slate-50"
              style={{ color: C.primary, borderColor: 'rgba(13,24,61,0.2)' }}>
              I'm an organization
            </Link>
          </div>
        </div>
      </section>

      <div className="py-8 text-center text-xs bg-white" style={{ color: C.muted }}>© {new Date().getFullYear()} Hive</div>
    </div>
  )
}
