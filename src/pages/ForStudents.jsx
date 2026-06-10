import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import studentLandingPage from '../assets/student_landing_page.png'
import { ArrowRight, Sparkles, Users, Award, BarChart3, Zap } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function ForStudents() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-white">
        <img src={studentLandingPage} alt="Student" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, rgba(255,255,255,0.95) 100%)', pointerEvents: 'none' }}/>
        <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h1 className="text-[3.5rem] font-extrabold leading-[1.1] text-center max-w-3xl px-6" style={{ color: C.primary }}>
            Build your career<br />while making a<br />
            <span style={{ color: C.honey }}>real difference.</span>
          </h1>
        </motion.div>
      </section>

      <div style={{ height: '60px', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', pointerEvents: 'none', marginTop: '-20px' }}/>

      {/* The Opportunity Section */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-32">
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              Why Hive is different for students
            </h2>
            <p className="text-xl max-w-3xl leading-relaxed" style={{ color: C.muted }}>
              Instead of scrolling through generic internship boards, Hive connects you with real organizations doing meaningful work. We match you based on your actual skills, values, and goals—not just keywords.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Sparkles,
                title: 'Meaningful opportunities',
                desc: 'Projects from organizations whose missions align with your values, not just any job posting.'
              },
              {
                icon: BarChart3,
                title: 'Real portfolio building',
                desc: 'Work on actual projects you can show employers. Concrete outcomes, not just resume padding.'
              },
              {
                icon: Users,
                title: 'Professional mentoring',
                desc: 'Connect with experienced professionals. Learn real skills while contributing real value.'
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border"
                  style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,183,3,0.15)' }}>
                    <Icon size={28} style={{ color: C.honey }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: C.primary }}>
                    {item.title}
                  </h3>
                  <p style={{ color: C.muted, lineHeight: '1.6' }}>
                    {item.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Your Journey */}
      <section className="py-40 px-6 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-32">
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: C.primary }}>
              Your journey from interested<br />to impactful
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: C.muted }}>
              Four straightforward steps to find the opportunity that fits your future.
            </p>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto mb-20">
            {[
              {
                num: '01',
                title: 'Build your profile',
                desc: 'Tell us about your skills, languages, interests, and what kind of impact you want to make.',
                details: ['Your skills & expertise', 'Languages you speak', 'Values & causes you care about', 'Availability & commitment']
              },
              {
                num: '02',
                title: 'Get matched intelligently',
                desc: 'Our system finds organizations whose missions align with your values, not just keyword matches.',
                details: ['Skill-based recommendations', 'Mission alignment', 'Growth opportunities', 'Organization credibility']
              },
              {
                num: '03',
                title: 'Apply and connect',
                desc: 'Review opportunities, see why you match, and apply to the ones that excite you.',
                details: ['See the match reasoning', 'Learn about the organization', 'Personalize your application', 'Start real conversations']
              },
              {
                num: '04',
                title: 'Build your future',
                desc: 'Work on meaningful projects, develop real skills, and create portfolio pieces you\'re proud of.',
                details: ['Contribute to real impact', 'Develop marketable skills', 'Build professional relationships', 'Create portfolio outcomes']
              },
            ].map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl p-10 bg-white border transition-all hover:shadow-lg"
                style={{ borderColor: 'rgba(13,24,61,0.08)', boxShadow: '0 4px 12px rgba(13,24,61,0.04)' }}>
                <div className="flex gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl"
                      style={{ background: 'rgba(255,183,3,0.15)', color: C.honey }}>
                      {step.num}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: C.primary }}>
                      {step.title}
                    </h3>
                    <p className="text-base mb-6 leading-relaxed" style={{ color: C.muted }}>
                      {step.desc}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {step.details.map((detail, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: C.honey }}/>
                          <span className="text-sm" style={{ color: C.primary }}>
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-20">
            <h2 className="text-4xl font-bold mb-6" style={{ color: C.primary }}>
              Built for real students. Built for real growth.
            </h2>
            <p className="text-lg max-w-3xl" style={{ color: C.muted }}>
              Every feature of Hive is designed specifically for student success. From the matching algorithm to the application process, everything prioritizes finding you the right fit.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Verified organizations', desc: 'Only legitimate, vetted organizations post on Hive. No spam or fake opportunities.' },
              { title: 'Transparent matching', desc: 'See exactly why you matched with each opportunity. Know what to expect.' },
              { title: 'Skill-first discovery', desc: 'Found by your actual abilities and interests, not just school name or resume keywords.' },
              { title: 'Community support', desc: 'Join thousands of students building meaningful experience through Hive.' },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <h3 className="text-lg font-bold mb-3" style={{ color: C.primary }}>
                  {item.title}
                </h3>
                <p style={{ color: C.muted }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              Your next meaningful opportunity is waiting
            </h2>
            <p className="text-xl mb-12" style={{ color: C.muted }}>
              Create your profile in minutes. Get matched with real opportunities. Start building your impact.
            </p>
            <Link to="/auth?mode=signup&role=student"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-xl text-lg font-bold text-white transition-all hover:shadow-xl active:scale-95"
              style={{ background: C.primary, boxShadow: '0 12px 40px rgba(13,24,61,0.2)' }}>
              Build your profile <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-white text-center text-sm" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. Connecting talent with purpose.
      </footer>
    </div>
  )
}
