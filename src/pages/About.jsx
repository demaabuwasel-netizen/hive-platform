import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import aboutLandingPage from '../assets/about_landing_page.png'
import { Heart, Users, Lightbulb, Zap, ArrowRight } from 'lucide-react'

const C = { bg: '#FFFFFF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </section>

      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-white">
        <img src={aboutLandingPage} alt="About" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 65%, rgba(255,255,255,0.95) 100%)', pointerEvents: 'none' }}/>
        <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
          <div className="text-center max-w-3xl px-6">
            <h1 className="text-7xl font-bold leading-tight mb-6" style={{ color: C.primary }}>
              Talent and purpose<br />
              <span style={{ color: C.honey }}>should belong together.</span>
            </h1>
            <p className="text-2xl leading-relaxed" style={{ color: C.muted }}>
              At Hive, we believe the right connection changes everything.
            </p>
          </div>
        </motion.div>
      </section>

      <div style={{ height: '60px', background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', pointerEvents: 'none', marginTop: '-30px' }}/>

      {/* Our Story */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl font-bold mb-12 leading-tight" style={{ color: C.primary }}>
              Why we built Hive
            </h2>

            <div className="space-y-8 text-lg leading-relaxed" style={{ color: C.muted }}>
              <p>
                We saw a problem that affected millions of people. Capable students with real skills couldn't find meaningful work. Organizations with important missions struggled to find volunteers who actually understood their cause.
              </p>

              <p>
                The disconnect wasn't because the right people didn't exist. It was because <span style={{ color: C.primary, fontWeight: 'bold' }}>discovery was broken.</span> Job boards treated every role the same. Students applied to any opportunity with a title that looked right. Organizations sifted through hundreds of applications to find a handful of viable candidates.
              </p>

              <p>
                Something was clearly missing: a way for students and organizations to find each other based on real alignment. Not keywords or resumes. Real values. Real skills. Real fit.
              </p>

              <div className="rounded-2xl p-10 border-l-4" style={{ borderColor: C.honey, background: 'rgba(255,183,3,0.05)' }}>
                <p className="text-xl font-bold" style={{ color: C.primary }}>
                  That's why Hive exists.
                </p>
                <p className="mt-4" style={{ color: C.muted }}>
                  To create a platform where meaningful connections happen naturally. Where students find work that matters. Where organizations find people who care.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Hive Metaphor */}
      <section className="py-40 px-6 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-28">
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              Why "Hive"
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: C.muted }}>
              The name isn't just poetic. It represents everything we believe about how meaningful work happens.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                num: '1',
                title: 'Many contributions matter',
                desc: 'A hive isn\'t built by one bee. Every role is essential. Every skill adds value.'
              },
              {
                num: '2',
                title: 'Organized effort',
                desc: 'Bees work together with purpose. No wasted effort. Every action serves the whole.'
              },
              {
                num: '3',
                title: 'Something bigger emerges',
                desc: 'Individual effort creates collective impact. Something no single person could achieve alone.'
              },
            ].map((item, i) => (
              <motion.div key={item.num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-8 rounded-2xl bg-white border"
                style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-6"
                  style={{ background: 'rgba(255,183,3,0.15)', color: C.honey }}>
                  {item.num}
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: C.primary }}>
                  {item.title}
                </h3>
                <p style={{ color: C.muted, lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-2xl p-12 bg-gradient-to-br from-amber-50 to-white border text-center"
            style={{ borderColor: `${C.honey}40` }}>
            <p className="text-3xl font-bold mb-6 leading-tight" style={{ color: C.primary }}>
              One student.<br />
              One opportunity.<br />
              One connection at a time.
            </p>
            <p className="text-lg" style={{ color: C.muted }}>
              Thousands of these connections create movements. Movements create real change.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              What we believe
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: C.muted }}>
              These aren't just words. They shape every decision we make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Heart,
                title: 'Skills should serve more than résumés.',
                desc: 'Every person has valuable skills. They should go toward work that matters—work that aligns with their values.'
              },
              {
                icon: Users,
                title: 'Students deserve meaningful experience.',
                desc: 'Internships and volunteer work should mean something. Real projects. Real responsibility. Real growth.'
              },
              {
                icon: Lightbulb,
                title: 'Organizations deserve the right fit.',
                desc: 'Your mission deserves people who understand it. Not just anyone. The right person changes everything.'
              },
              {
                icon: Zap,
                title: 'Discovery should be obvious.',
                desc: 'The right opportunity should feel inevitable, not hidden. Matching on meaning, not just keywords.'
              },
            ].map((belief, i) => {
              const Icon = belief.icon
              return (
                <motion.div key={belief.title}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="p-10 rounded-2xl bg-gradient-to-br from-slate-50 to-white border"
                  style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,183,3,0.15)' }}>
                    <Icon size={28} style={{ color: C.honey }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: C.primary }}>
                    {belief.title}
                  </h3>
                  <p style={{ color: C.muted, lineHeight: '1.6' }}>
                    {belief.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How Hive Works */}
      <section className="py-40 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-28">
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: C.primary }}>
              How the Hive works
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: C.muted }}>
              Three core principles that guide everything we build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: 'Smart matching',
                desc: 'Our system reads meaning. It understands mission fit, actual skills, and real compatibility—not just keywords.'
              },
              {
                title: 'Transparent connection',
                desc: 'Every match explains why. No mystery. No guessing. Just clarity about compatibility from the start.'
              },
              {
                title: 'Real collaboration',
                desc: 'Once matched, students and organizations have tools to communicate, interview, and build trust together.'
              },
            ].map((principle, i) => (
              <motion.div key={principle.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 font-bold text-3xl"
                  style={{ background: 'rgba(255,183,3,0.15)', color: C.honey }}>
                  {i + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: C.primary }}>
                  {principle.title}
                </h3>
                <p style={{ color: C.muted, lineHeight: '1.7' }}>
                  {principle.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: C.primary }}>
              Be part of the Hive
            </h2>
            <p className="text-xl mb-12" style={{ color: C.muted }}>
              Whether you're a student seeking meaningful work or an organization looking for the right fit, your next connection is waiting.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=signup&role=student"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-lg"
                style={{ background: C.primary }}>
                I'm a student <ArrowRight size={20} />
              </Link>
              <Link to="/auth?mode=signup&role=ngo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold border transition-all hover:bg-slate-50"
                style={{ color: C.primary, borderColor: 'rgba(13,24,61,0.2)' }}>
                I'm an organization <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-white text-center text-sm" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. Connecting talent with purpose.
      </footer>
    </div>
  )
}
