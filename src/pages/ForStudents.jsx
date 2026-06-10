import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import studentLandingPage from '../assets/student_landing_page.png'
import { CheckCircle2, Sparkles, Users, Briefcase, Award } from 'lucide-react'

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

      {/* Your Journey Section */}
      <section className="py-32 px-6 bg-white" style={{ marginTop: '-15px' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6" style={{ color: C.primary }}>
              Your journey in four steps
            </h2>
            <p className="text-xl" style={{ color: C.muted }}>
              From building your profile to making real impact
            </p>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              { num: '01', icon: CheckCircle2, title: 'Build your profile', desc: 'Share your skills, interests, languages, and what kind of impact you want to make. The more details, the better your matches.' },
              { num: '02', icon: Sparkles, title: 'Get matched with purpose', desc: 'Hive\'s AI reads the meaning behind your profile - not just keywords. We find NGOs whose missions align with your values.' },
              { num: '03', icon: Users, title: 'Apply with confidence', desc: 'See exactly why each match fits. An AI-drafted application is ready for you to personalize and send.' },
              { num: '04', icon: Award, title: 'Build real experience', desc: 'Start contributing to something that matters. Build skills, make connections, and create impact on your CV.' },
            ].map((step, i) => {
              const IconComponent = step.icon
              return (
                <motion.div key={step.num}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-2xl p-8 bg-white border transition-all hover:shadow-lg hover:border-amber-200"
                  style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <div className="flex gap-8 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl"
                        style={{ background: 'rgba(255,183,3,0.1)', color: C.honey }}>
                        {step.num}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold" style={{ color: C.primary }}>
                          {step.title}
                        </h3>
                      </div>
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

      {/* Why Students Choose Hive */}
      <section className="py-28 px-6" style={{ background: 'rgba(255, 183, 3, 0.03)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold text-center mb-20" style={{ color: C.primary }}>
            Why students choose Hive
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-10">
            {[
              { title: 'AI-matched to your values', desc: 'We read meaning, not keywords. Matches that feel right from day one.' },
              { title: 'Real-world projects', desc: 'Work on live issues with actual impact. Build a portfolio piece you\'re proud of.' },
              { title: 'Meaningful connections', desc: 'Meet professionals who share your passion. Relationships that extend beyond the project.' },
              { title: 'Career building', desc: 'Every completed project is a concrete outcome for interviews and your CV.' },
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
              Ready to make an impact?
            </h2>
            <p className="text-xl mb-10 leading-relaxed" style={{ color: C.muted }}>
              Join hundreds of students building real experience that matters. Create your profile in minutes.
            </p>
            <Link to="/auth?mode=signup&role=student"
              className="inline-block px-10 py-5 rounded-2xl text-lg font-bold text-white transition-all hover:shadow-xl active:scale-95"
              style={{ background: C.primary, boxShadow: '0 12px 32px rgba(13,24,61,0.2)' }}>
              Start your journey →
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
