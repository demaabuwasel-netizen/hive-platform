import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import studentLandingPage from '../assets/student_landing_page.png'
import { Sparkles, Users, Award, ArrowRight } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function ForStudents() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FAFBFC' }}>
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img src={studentLandingPage} alt="Student" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, #FFFFFF 100%)', pointerEvents: 'none' }}/>
        <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-center max-w-3xl px-6" style={{ color: C.primary }}>
            Build your career<br />while making a<br />
            <span style={{ color: C.honey }}>real difference.</span>
          </h1>
        </motion.div>
      </section>

      <div style={{ height: '40px', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,1) 100%)', pointerEvents: 'none', marginTop: '-1px' }}/>

      {/* Your Journey - Premium */}
      <section className="py-36 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-28">
            <h2 className="text-6xl font-bold leading-tight mb-6" style={{ color: C.primary }}>
              Your journey to<br />
              <span style={{ color: C.honey }}>meaningful impact</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: C.muted }}>
              From first profile to real experience. Every step matters.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
            {[
              { num: '01', title: 'Build profile', desc: 'Share skills & values' },
              { num: '02', title: 'Discover roles', desc: 'AI-matched opportunities' },
              { num: '03', title: 'Apply & connect', desc: 'Real conversations' },
              { num: '04', title: 'Build experience', desc: 'Create your impact' },
            ].map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl p-8 bg-white border transition-all hover:shadow-lg"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <div className="text-3xl font-bold mb-4" style={{ color: C.honey }}>{step.num}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: C.primary }}>{step.title}</h3>
                <p style={{ color: C.muted }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Profile + Opportunity Preview */}
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {[
              { title: 'Your Profile', items: ['Skills in design', 'Values: environment', 'Speaks Spanish', 'Flexible hours'], bg: 'from-blue-50 to-white' },
              { title: 'Perfect Match', items: ['Design a website', 'Climate nonprofit', 'Remote role', '10hrs/week'], bg: 'from-emerald-50 to-white' },
            ].map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`rounded-3xl p-12 border bg-gradient-to-br ${card.bg}`} style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-2xl font-bold mb-8" style={{ color: C.primary }}>{card.title}</h3>
                <div className="space-y-4">
                  {card.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ background: C.honey }}/>
                      <span className="text-base" style={{ color: C.primary }}>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Students Choose Hive */}
      <section className="py-28 px-6 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>Why students choose Hive</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Real projects', icon: '🚀' },
              { title: 'Smart matching', icon: '⚡' },
              { title: 'Portfolio ready', icon: '📊' },
              { title: 'Grow skills', icon: '🌱' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-center p-8 rounded-2xl bg-white border" style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-bold" style={{ color: C.primary }}>{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: C.primary }}>Ready to start?</h2>
          <Link to="/auth?mode=signup&role=student"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-lg font-bold text-white transition-all hover:shadow-xl"
            style={{ background: C.primary, boxShadow: '0 12px 32px rgba(13,24,61,0.2)' }}>
            Build your profile <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <div className="py-8 text-center text-xs" style={{ color: C.muted }}>© {new Date().getFullYear()} Hive</div>
    </div>
  )
}
