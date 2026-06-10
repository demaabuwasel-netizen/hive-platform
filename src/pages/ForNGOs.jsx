import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import ngoLandingPage from '../assets/ngo_landing_page.png'
import { FileText, Users, Zap, MessageCircle, CheckCircle2 } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function ForNGOs() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F9FAFB' }}>
      {/* Hero - Full Screen with Navbar Overlay */}
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img
          src={ngoLandingPage}
          alt="NGO team collaborating"
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
            Find volunteers<br />who actually fit<br />
            <span style={{ color: C.honey }}>your mission.</span>
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

      {/* The Process Section */}
      <section className="py-32 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6" style={{ color: C.primary }}>
              From need to collaboration
            </h2>
            <p className="text-xl" style={{ color: C.muted }}>
              Five straightforward steps to find and onboard the right volunteers
            </p>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              { num: '01', icon: FileText, title: 'Create your organization profile', desc: 'Tell us about your mission, what you do, and the impact you want to make. Help students understand your organization.' },
              { num: '02', icon: Users, title: 'Post your needs', desc: 'Describe the roles and projects you need help with. No formal job descriptions needed—just describe what you\'re looking for.' },
              { num: '03', icon: Zap, title: 'Get matched candidates', desc: 'Hive surfaces students whose skills, experience, and values align with your mission. See why each match fits.' },
              { num: '04', icon: MessageCircle, title: 'Connect and interview', desc: 'Message candidates directly on Hive. Schedule interviews and review AI-generated insights to guide conversations.' },
              { num: '05', icon: CheckCircle2, title: 'Welcome your volunteer', desc: 'Confirm placements and start collaborating. Track relationships and manage multiple volunteers in one place.' },
            ].map((step, i) => {
              const IconComponent = step.icon
              return (
                <motion.div key={step.num}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl p-8 bg-white border transition-all hover:shadow-lg hover:border-blue-200"
                  style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <div className="flex gap-8 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl"
                        style={{ background: 'rgba(13,24,61,0.08)', color: C.primary }}>
                        {step.num}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3" style={{ color: C.primary }}>
                        {step.title}
                      </h3>
                      <p className="text-lg leading-relaxed" style={{ color: C.muted }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Organizations Choose Hive */}
      <section className="py-28 px-6" style={{ background: 'rgba(13, 24, 61, 0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold text-center mb-20" style={{ color: C.primary }}>
            Why organizations trust Hive
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-10">
            {[
              { title: 'Smart matching saves time', desc: 'No more sifting through unqualified applications. Hive surfaces ranked candidates with detailed match explanations.' },
              { title: 'Quality over quantity', desc: 'Access motivated, capable students who are genuinely interested in your mission and have relevant skills.' },
              { title: 'Built-in communication', desc: 'Message candidates, schedule interviews, and manage placements—all in one place without email chaos.' },
              { title: 'Transparent relationships', desc: 'See exactly why each candidate matches your needs. Every decision is informed and intentional.' },
            ].map((benefit, i) => (
              <motion.div key={benefit.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl p-8 bg-white border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: C.primary }}>
                  {benefit.title}
                </h3>
                <p className="text-lg leading-relaxed" style={{ color: C.muted }}>
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            <h2 className="text-5xl font-bold mb-6" style={{ color: C.primary }}>
              Find your next volunteer today
            </h2>
            <p className="text-xl mb-10 leading-relaxed" style={{ color: C.muted }}>
              Register your organization and post your first opportunity. It takes less than 10 minutes to get started.
            </p>
            <Link to="/auth?mode=signup&role=ngo"
              className="inline-block px-10 py-5 rounded-2xl text-lg font-bold text-white transition-all hover:shadow-xl active:scale-95"
              style={{ background: C.primary, boxShadow: '0 12px 32px rgba(13,24,61,0.2)' }}>
              Get started →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="py-12 text-center text-sm" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
