import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import studentLandingPage from '../assets/student_landing_page.png'
import { CheckCircle2, Sparkles, Users, Award } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

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

      {/* Your Journey Section - Visual */}
      <section className="py-28 px-6 bg-white" style={{ marginTop: '-15px' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4" style={{ color: C.primary }}>
              Four simple steps
            </h2>
            <p className="text-lg" style={{ color: C.muted }}>
              From profile to impact
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { num: '1', icon: CheckCircle2, title: 'Build profile' },
              { num: '2', icon: Sparkles, title: 'Get matched' },
              { num: '3', icon: Users, title: 'Apply & connect' },
              { num: '4', icon: Award, title: 'Make impact' },
            ].map((step, i) => {
              const IconComponent = step.icon
              return (
                <motion.div key={step.num}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(255,183,3,0.1)' }}>
                    <IconComponent size={32} style={{ color: C.honey }} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-sm" style={{ color: C.primary }}>
                    {step.title}
                  </h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Hive - Brief */}
      <section className="py-24 px-6" style={{ background: 'rgba(255, 183, 3, 0.03)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-16" style={{ color: C.primary }}>
            Why Hive
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Real opportunities', desc: 'Work on actual projects with real impact.' },
              { title: 'AI-matched', desc: 'Connected to NGOs aligned with your values.' },
              { title: 'Build portfolio', desc: 'Concrete outcomes for your CV and future.' },
              { title: 'Meaningful connections', desc: 'Meet professionals who care about impact.' },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="p-6 bg-white rounded-xl border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="font-bold mb-2" style={{ color: C.primary }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: C.muted }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-bold mb-4" style={{ color: C.primary }}>
              Ready to start?
            </h2>
            <p className="text-base mb-8" style={{ color: C.muted }}>
              Build your profile and get matched with opportunities that matter.
            </p>
            <Link to="/auth?mode=signup&role=student"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg"
              style={{ background: C.primary, boxShadow: '0 8px 20px rgba(13,24,61,0.15)' }}>
              Get started
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="py-8 text-center text-xs" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive
      </div>
    </div>
  )
}
