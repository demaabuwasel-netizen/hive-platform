import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import ngoLandingPage from '../assets/ngo_landing_page.png'
import { FileText, Users, Zap, MessageCircle, CheckCircle2, TrendingUp } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function ForNGOs() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F9FAFB' }}>
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img src={ngoLandingPage} alt="NGO team collaborating" className="w-full h-full object-cover" />
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
            Find volunteers<br />who actually fit<br />
            <span style={{ color: C.honey }}>your mission.</span>
          </h1>
        </motion.div>
      </section>

      <div style={{
        height: '40px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,1) 100%)',
        pointerEvents: 'none',
        marginTop: '-1px'
      }}/>

      {/* The Process */}
      <section className="py-28 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6" style={{ color: C.primary }}>
              Five steps to growth
            </h2>
            <p className="text-xl" style={{ color: C.muted }}>
              From describing your needs to real collaboration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto mb-16">
            {[
              { num: '1', title: 'Create profile', icon: FileText },
              { num: '2', title: 'Post roles', icon: Users },
              { num: '3', title: 'Get matches', icon: Zap },
              { num: '4', title: 'Connect', icon: MessageCircle },
              { num: '5', title: 'Grow impact', icon: TrendingUp },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div key={step.num}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(13,24,61,0.08)' }}>
                    <Icon size={28} style={{ color: C.primary, strokeWidth: 1.5 }} />
                  </div>
                  <h3 className="text-base font-bold" style={{ color: C.primary }}>
                    {step.title}
                  </h3>
                </motion.div>
              )
            })}
          </div>

          {/* Role Card Example */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-2xl mx-auto rounded-3xl p-8 border bg-gradient-to-br from-emerald-50 to-white"
            style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
            <p className="text-xs font-bold tracking-wide mb-6" style={{ color: C.honey, textTransform: 'uppercase' }}>
              Example: Post a Volunteer Role
            </p>
            <div className="space-y-4">
              {['Title: Marketing Volunteer', 'Hours: 8-10 per week', 'Skills needed: Social media, writing', 'Location: Remote or hybrid'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: C.honey }}/>
                  <span style={{ color: C.primary, fontWeight: '500' }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Matching & Applicants */}
      <section className="py-28 px-6" style={{ background: 'rgba(13,24,61,0.02)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>
            How Hive helps NGOs
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Smart candidate matching',
                desc: 'Get ranked candidates who match your mission and skill requirements.'
              },
              {
                title: 'Save time screening',
                desc: 'No more endless applications. Only qualified candidates reach you.'
              },
              {
                title: 'Built-in management',
                desc: 'Message, interview, and track all in one place.'
              },
              {
                title: 'Mission-aligned volunteers',
                desc: 'Connect with people who care about your cause.'
              },
            ].map((benefit, i) => (
              <motion.div key={benefit.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="p-8 rounded-2xl border"
                style={{ borderColor: 'rgba(13,24,61,0.08)', background: C.bg }}>
                <h3 className="font-bold mb-3" style={{ color: C.primary }}>
                  {benefit.title}
                </h3>
                <p style={{ color: C.muted }}>
                  {benefit.desc}
                </p>
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
              Ready to find your volunteers?
            </h2>
            <Link to="/auth?mode=signup&role=ngo"
              className="inline-block px-8 py-3 rounded-xl text-base font-bold text-white transition-all hover:shadow-lg"
              style={{ background: C.primary, boxShadow: '0 8px 24px rgba(13,24,61,0.15)' }}>
              Create organization profile
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="py-8 text-center text-xs" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive
      </div>
    </div>
  )
}
