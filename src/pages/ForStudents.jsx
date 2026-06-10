import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import studentLandingPage from '../assets/student_landing_page.png'
import { CheckCircle2, Sparkles, Users, Award, MapPin, Clock } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function ForStudents() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F9FAFB' }}>
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center" style={{ background: C.bg }}>
        <img src={studentLandingPage} alt="Student working on NGO project" className="w-full h-full object-cover" />
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
            Build your career<br />while making a<br />
            <span style={{ color: C.honey }}>real difference.</span>
          </h1>
        </motion.div>
      </section>

      <div style={{
        height: '40px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,1) 100%)',
        pointerEvents: 'none',
        marginTop: '-1px'
      }}/>

      {/* Your Journey */}
      <section className="py-28 px-6 bg-white" style={{ marginTop: '-30px' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6" style={{ color: C.primary }}>
              Four steps to impact
            </h2>
            <p className="text-xl" style={{ color: C.muted }}>
              From your first profile to real-world experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {[
              { num: '1', title: 'Build profile', icon: CheckCircle2 },
              { num: '2', title: 'Discover roles', icon: Sparkles },
              { num: '3', title: 'Apply & connect', icon: Users },
              { num: '4', title: 'Build experience', icon: Award },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div key={step.num}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="text-center">
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(255,183,3,0.12)' }}>
                    <Icon size={32} style={{ color: C.honey, strokeWidth: 1.5 }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: C.primary }}>
                    {step.title}
                  </h3>
                </motion.div>
              )
            })}
          </div>

          {/* Profile Example Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-2xl mx-auto rounded-3xl p-8 border bg-gradient-to-br from-blue-50 to-white"
            style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
            <p className="text-xs font-bold tracking-wide mb-6" style={{ color: C.honey, textTransform: 'uppercase' }}>
              Your Student Profile
            </p>
            <div className="space-y-4">
              {['Skills: Python, Design, Marketing', 'Interests: Education, Environment', 'Languages: English, Spanish', 'Available: Flexible hours'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: C.honey }}/>
                  <span style={{ color: C.primary, fontWeight: '500' }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Example Opportunities */}
      <section className="py-28 px-6" style={{ background: 'rgba(255,183,3,0.03)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>
            Opportunities you'll discover
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Design a landing page',
                org: 'Community Tech Center',
                match: '92% match',
                location: 'Remote',
                hours: '10h/week',
                skills: ['Design', 'UI/UX']
              },
              {
                title: 'Lead marketing campaign',
                org: 'Education for All',
                match: '88% match',
                location: 'On-site',
                hours: '8h/week',
                skills: ['Marketing', 'English']
              },
            ].map((opp, i) => (
              <motion.div key={opp.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-8 rounded-2xl border bg-white"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg flex-1" style={{ color: C.primary }}>
                    {opp.title}
                  </h3>
                  <span className="text-xs font-bold px-3 py-1 rounded-full ml-2"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                    {opp.match}
                  </span>
                </div>
                <p style={{ color: C.muted, marginBottom: '12px' }}>{opp.org}</p>
                <div className="flex flex-wrap gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-1" style={{ color: C.muted }}>
                    <MapPin size={14}/>{opp.location}
                  </div>
                  <div className="flex items-center gap-1" style={{ color: C.muted }}>
                    <Clock size={14}/>{opp.hours}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.map(skill => (
                    <span key={skill} className="text-xs px-2.5 py-1 rounded-md border"
                      style={{ borderColor: 'rgba(13,24,61,0.1)', color: C.muted }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Students Trust Hive */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-20" style={{ color: C.primary }}>
            Why students choose Hive
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Real projects', desc: 'Work on actual problems with real impact.' },
              { title: 'Smart matching', desc: 'Find roles that match your skills and values.' },
              { title: 'Build portfolio', desc: 'Concrete outcomes for your resume.' },
              { title: 'Grow professionally', desc: 'Learn from experienced organizations.' },
            ].map((benefit, i) => (
              <motion.div key={benefit.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="p-8 rounded-2xl border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
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
              Ready to get started?
            </h2>
            <Link to="/auth?mode=signup&role=student"
              className="inline-block px-8 py-3 rounded-xl text-base font-bold text-white transition-all hover:shadow-lg"
              style={{ background: C.primary, boxShadow: '0 8px 24px rgba(13,24,61,0.15)' }}>
              Build your profile
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
