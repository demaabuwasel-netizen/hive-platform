import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import HiveLogo from '../components/HiveLogo'
import HeroParallaxWithImages from '../components/HeroParallaxWithImages'
import { useApp } from '../context/AppContext'
import { Sparkles, Users, Eye, Heart, Zap } from 'lucide-react'

// ─── Assets ───────────────────────────────────────────────────────────────────
import home2 from '../assets/home2.png'   // hero: home landing page image
import img2 from '../assets/img2.png'   // For Students card
import img3 from '../assets/img3.png'   // For NGOs card
import img4 from '../assets/img4.png'   // For Impact card
import img5 from '../assets/img5.png'   // partner logos strip
import img6 from '../assets/img6.png'   // bee decorative (tiny, once)
import cardsBackground from '../assets/cards_background.png'
import studentBox from '../assets/student_box.png'
import ngoBox from '../assets/ngo2_box.png'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:      '#FFFFFF',
  primary: '#0D183D',
  honey:   '#FFB703',
  muted:   '#4B6382',
  white:   '#FFFFFF',
}

// ─── Motion ───────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.52, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

function Float({ children, y = 5, dur = 5, delay = 0, className = '' }) {
  return (
    <motion.div className={className}
      animate={{ y: [0, -y, 0] }}
      transition={{ repeat: Infinity, duration: dur, ease: 'easeInOut', delay }}>
      {children}
    </motion.div>
  )
}

// ─── Gradient avatar (trust row + voices) ─────────────────────────────────────
const GRADS = [
  ['#6366F1','#8B5CF6'],['#FFB703','#F97316'],['#06B6D4','#3B82F6'],
  ['#10B981','#059669'],['#EC4899','#F43F5E'],['#F59E0B','#EF4444'],
]
function gHash(s) { return s.split('').reduce((a,c)=>a+c.charCodeAt(0),0) }
function gInit(n) { return n.trim().split(/\s+/).filter(w=>/^\p{L}/u.test(w)).map(w=>w[0]).join('').slice(0,2).toUpperCase() }
function GAvatar({ name, size=40, round='full' }) {
  const [c1,c2] = GRADS[gHash(name) % GRADS.length]
  return (
    <div className="flex items-center justify-center shrink-0 select-none font-bold text-white"
      style={{ width:size, height:size, borderRadius:round==='full'?'50%':'0.65rem',
        background:`linear-gradient(135deg,${c1},${c2})`, fontSize:Math.round(size*.34),
        boxShadow:'0 2px 8px rgba(0,0,0,0.13)' }}>
      {gInit(name)}
    </div>
  )
}

// ─── Hero right — img1 integrated into design system ─────────────────────────
function HeroRight() {
  return (
    <div className="relative w-full" style={{ minHeight: 520 }}>

      {/* Layer 1 — ambient honey glow (large, behind everything) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[42%] left-[44%] -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,183,3,0.16) 0%, rgba(255,183,3,0.04) 55%, transparent 75%)' }} />
        {/* Secondary cool glow for depth */}
        <div className="absolute top-[18%] right-[12%] w-32 h-32 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* Layer 2 — img1: multiply blend removes white bg, radial mask softens all edges */}
      <motion.div
        className="relative z-10 w-full flex justify-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.8, ease: 'easeOut' }}>
        <div className="relative w-full flex justify-center">
          <img
            src={home2}
            alt="Student connecting with NGOs through Hive"
            className="w-full object-contain"
            style={{
              maxWidth: 480,
              mixBlendMode: 'multiply',
              maskImage: 'radial-gradient(ellipse 88% 86% at 50% 52%, black 25%, rgba(0,0,0,0.9) 48%, rgba(0,0,0,0.5) 68%, transparent 88%)',
              WebkitMaskImage: 'radial-gradient(ellipse 88% 86% at 50% 52%, black 25%, rgba(0,0,0,0.9) 48%, rgba(0,0,0,0.5) 68%, transparent 88%)',
            }}
            draggable={false}
          />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(250,246,239,0.8) 100%)',
            maskImage: 'radial-gradient(ellipse 88% 86% at 50% 52%, black 25%, rgba(0,0,0,0.9) 48%, rgba(0,0,0,0.5) 68%, transparent 88%)',
            WebkitMaskImage: 'radial-gradient(ellipse 88% 86% at 50% 52%, black 25%, rgba(0,0,0,0.9) 48%, rgba(0,0,0,0.5) 68%, transparent 88%)',
          }}/>
        </div>
      </motion.div>

      {/* Layer 3 — match card: slightly inside illustration area, overlapping it */}
      <Float y={4} dur={6.5} delay={0.5}
        className="absolute right-0 top-[8%] z-30 hidden lg:block"
        style={{ marginRight: '-8px' }}>
        <motion.div
          initial={{ opacity: 0, x: 16, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.8, duration: 0.55, ease: 'easeOut' }}
          className="rounded-2xl p-5"
          style={{
            background: C.primary,
            width: 202,
            boxShadow: '0 8px 20px rgba(13,24,61,0.12), 0 24px 64px rgba(13,24,61,0.22)',
          }}>

          <p className="text-[11px] font-bold mb-0.5" style={{ color: C.honey }}>Good morning, Noa! 👋</p>
          <p className="text-[10px] mb-4 leading-snug" style={{ color: 'rgba(255,255,255,0.32)' }}>
            Your next match is ready.
          </p>

          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {[{ n: '24', l: 'Matches' }, { n: '12', l: 'NGOs' }, { n: '94%', l: 'Fit' }].map(s => (
              <div key={s.l} className="rounded-xl p-2 text-center"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                <p className="font-extrabold text-[13px] text-white leading-none">{s.n}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.l}</p>
              </div>
            ))}
          </div>

          <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] mb-2"
            style={{ color: 'rgba(255,183,3,0.65)' }}>Top match for you</p>

          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] font-extrabold"
                style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>G</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[10px] font-bold truncate leading-snug">GreenFuture</p>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.28)' }}>Tel Aviv</p>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>88%</span>
            </div>
            <div className="w-full rounded-lg py-1.5 text-center text-[10px] font-bold text-white"
              style={{ background: C.honey }}>View match →</div>
          </div>
        </motion.div>
      </Float>

      {/* Layer 4 — img6: tiny bee, multiply blend, fades into background */}
      <motion.img
        src={img6}
        alt="" aria-hidden="true"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-0 right-2 w-16 object-contain pointer-events-none hidden lg:block"
        style={{ mixBlendMode: 'multiply', opacity: 0.3 }}
        draggable={false}
      />
    </div>
  )
}

// ─── Animated stat ────────────────────────────────────────────────────────────
function AnimatedStat({ raw, label, delay=0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-40px' })
  const [shown, setShown] = useState('0')
  const num = parseInt(raw); const suffix = raw.replace(/\d/g,'')
  useEffect(()=>{
    if (!inView) return
    let s=0; const inc=num/60
    const t=setInterval(()=>{ s+=inc; if(s>=num){setShown(raw);clearInterval(t)}else setShown(Math.floor(s)+suffix) },1200/60)
    return ()=>clearInterval(t)
  },[inView,num,raw,suffix])
  return (
    <motion.div ref={ref} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}}
      viewport={{once:true}} transition={{delay,duration:0.4}} className="text-center">
      <p className="text-4xl font-extrabold text-white tracking-tight">{shown}</p>
      <p className="text-sm mt-1.5" style={{color:'rgba(255,255,255,0.42)'}}>{label}</p>
    </motion.div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const VALUE_PROPS = [
  { icon: '✦', title: 'AI Matching',       desc: 'Semantic AI that reads meaning, not keywords' },
  { icon: '🌍', title: 'Real Impact',       desc: 'Work on projects that genuinely matter'       },
  { icon: '👥', title: 'Community',         desc: 'Join 200+ students from leading universities'  },
  { icon: '🚀', title: 'Build Your Future', desc: 'Gain experience that sets you apart'           },
]

const FEATURE_CARDS = [
  {
    img: studentBox,
    imgBg: 'rgba(255,183,3,0.07)',
    tag: 'For Students',
    tagColor: C.honey,
    tagBg: 'rgba(255,183,3,0.1)',
    title: 'Find projects that help you grow.',
    desc: 'Get matched with real opportunities.',
    cta: 'Find opportunities →',
    href: '/auth?mode=signup&role=student',
    btnBg: '#050A15',
    btnShadow: '0 4px 16px rgba(5,10,21,0.3)',
  },
  {
    img: ngoBox,
    imgBg: 'rgba(13,24,61,0.05)',
    tag: 'For Organizations',
    tagColor: C.primary,
    tagBg: 'rgba(13,24,61,0.07)',
    title: 'Find volunteers who fit your mission.',
    desc: 'Collaborate with people who bring the skills your work needs.',
    cta: 'Post a project →',
    href: '/auth?mode=signup&role=ngo',
    btnBg: '#1a2d5a',
    btnShadow: '0 4px 16px rgba(26,45,90,0.3)',
  },
]

// ─── Seed testimonials ────────────────────────────────────────────────────────
// Polished but real-sounding; reference actual platform features and Israeli orgs.
const SEED_VOICES = [
  {
    id: 'seed-1',
    name: 'Rotem A.',
    role: 'student',
    org: 'Computer Science · Tel Aviv University',
    quote: "Hive matched me with Elem Youth Association and I spent a semester building their volunteer scheduling system. The match was precise — they needed React and someone who'd worked with youth programs. I walked away with a production app in my portfolio and a strong letter of recommendation.",
  },
  {
    id: 'seed-2',
    name: 'Majd K.',
    role: 'ngo',
    org: 'Arab-Jewish Community Center, Jaffa',
    quote: "We needed a developer who also understood our bilingual community work. Hive found us a student who speaks Arabic natively and had built civic tools before. The AI match explanation convinced us before we even looked at the CV.",
  },
  {
    id: 'seed-3',
    name: 'Yael S.',
    role: 'student',
    org: 'Data Science · Hebrew University',
    quote: "As a data science student I always struggled to make NGOs understand what I could offer. Hive translated my profile into language organisations understood. Three interview requests arrived in my first week.",
  },
]

// ─── Voice modal ──────────────────────────────────────────────────────────────
function VoiceModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', role: 'student', quote: '', org: '' })
  const [done, setDone]   = useState(false)
  const [err, setErr]     = useState('')

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim())  { setErr('Please add your name.'); return }
    if (!form.quote.trim()) { setErr('Please write a short testimonial.'); return }
    if (form.quote.trim().length < 30) { setErr('Please write at least 30 characters.'); return }
    setErr('')
    onSubmit({ ...form, name: form.name.trim(), quote: form.quote.trim(), org: form.org.trim() })
    setDone(true)
    setTimeout(onClose, 2200)
  }

  const iStyle = active => ({
    background: 'white', color: C.primary,
    border: `1.5px solid ${active ? C.honey : 'rgba(13,24,61,0.12)'}`,
    outline: 'none', transition: 'border-color .15s',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,18,48,0.52)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 24px 80px rgba(10,18,48,0.25)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {done ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5 text-3xl"
              style={{ background: 'rgba(255,183,3,0.12)' }}>
              🐝
            </motion.div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: C.primary }}>Thanks for sharing!</h3>
            <p className="text-sm" style={{ color: C.muted }}>Your voice has been added to the hive.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-7 pt-7 pb-5 shrink-0"
              style={{ borderBottom: '1px solid rgba(13,24,61,0.07)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold mb-1" style={{ color: C.primary }}>
                    🐝 Add your voice
                  </h3>
                  <p className="text-sm" style={{ color: C.muted }}>
                    Tell us how Hive worked for you.
                  </p>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-lg leading-none shrink-0 transition-colors"
                  style={{ color: C.muted }}
                  aria-label="Close">×</button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: C.primary }}>
                  Your name *
                </label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Yael S. or Majd K."
                  className="w-full px-4 py-3 rounded-xl text-sm placeholder-[#4B6382]/40"
                  style={iStyle(!!form.name)} />
              </div>

              {/* Role toggle */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: C.primary }}>
                  I am a *
                </label>
                <div className="flex gap-2">
                  {[{ v: 'student', label: '🎓 Student' }, { v: 'ngo', label: '🌍 NGO' }].map(({ v, label }) => (
                    <button key={v} type="button"
                      onClick={() => setForm(f => ({ ...f, role: v }))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={form.role === v
                        ? { background: C.honey, color: 'white', border: '1.5px solid transparent' }
                        : { background: 'white', color: C.muted, border: '1.5px solid rgba(13,24,61,0.12)' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: C.primary }}>
                  Your story * <span className="font-normal normal-case tracking-normal" style={{ color: C.muted }}>(min 30 chars)</span>
                </label>
                <textarea value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                  rows={4} placeholder="Tell us how Hive helped you connect with the right opportunity…"
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none placeholder-[#4B6382]/40"
                  style={{ ...iStyle(!!form.quote), lineHeight: 1.65 }} />
                <p className="text-[11px] mt-1 text-right" style={{ color: 'rgba(13,24,61,0.3)' }}>
                  {form.quote.trim().length} / 30+
                </p>
              </div>

              {/* Org — optional */}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: C.primary }}>
                  University or organisation <span className="font-normal normal-case" style={{ color: C.muted }}>(optional)</span>
                </label>
                <input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))}
                  placeholder="e.g. Tel Aviv University, Elem, Sikkuy…"
                  className="w-full px-4 py-3 rounded-xl text-sm placeholder-[#4B6382]/40"
                  style={iStyle(false)} />
              </div>

              {err && (
                <p className="text-red-500 text-xs px-1">{err}</p>
              )}

              <button type="submit"
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] mt-1"
                style={{ background: C.honey, boxShadow: '0 4px 16px rgba(255,183,3,0.3)' }}>
                Share my story →
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const { user } = useApp()
  const navigate = useNavigate()

  // ── Voices state — seed + user-submitted (localStorage) ─────────────────────
  const [customVoices, setCustomVoices] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hive_voices') ?? '[]') } catch { return [] }
  })
  const [voiceModal, setVoiceModal] = useState(false)
  const allVoices = [...SEED_VOICES, ...customVoices]

  const handleGetStarted = () => {
    if (user && user.role) {
      // If authenticated with a role, go to dashboard
      navigate(user.role === 'student' ? '/dashboard/student' : '/dashboard/ngo')
    } else {
      // Otherwise go to student signup
      navigate('/auth?mode=signup&role=student')
    }
  }

  function handleVoiceSubmit(data) {
    const entry = { id: `u-${Date.now()}`, ...data }
    const next = [...customVoices, entry]
    setCustomVoices(next)
    try { localStorage.setItem('hive_voices', JSON.stringify(next)) } catch {}
  }

  return (
    <div className="flex flex-col">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO PARALLAX — Premium interactive hero section
      ══════════════════════════════════════════════════════ */}
      <HeroParallaxWithImages />

      {/* Subtle transition between hero and content */}
      <div style={{
        height: '40px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,1) 100%)',
        pointerEvents: 'none',
        marginTop: '-1px'
      }}/>

      {/* ══════════════════════════════════════════════════════
          FEATURE CARDS — For Students | For NGOs | For Impact
          img2 / img3 / img4 — equal height, clean composition
      ══════════════════════════════════════════════════════ */}
      {/* invisible anchor so both For Students and For NGOs nav links land here */}
      <span id="for-ngos" style={{ display:'block', height:0, visibility:'hidden' }}/>

      <section id="for-students" className="py-28 px-6 bg-white" style={{ marginTop: '-20px' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color:C.primary }}>
              Two paths, one mission:<br />
              <span style={{ color: C.honey }}>meaningful connection</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color:C.muted }}>
              Whether you're a student seeking real experience or an organization looking for capable volunteers, Hive brings the right people together with purpose and intention.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {FEATURE_CARDS.map((card, i) => (
              <motion.div key={card.tag}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.15, duration:0.6 }}
                whileHover={{ y:-16, boxShadow:'0 40px 80px rgba(13,24,61,0.2)', transition:{ duration:0.3 } }}
                className="group rounded-3xl overflow-hidden flex flex-col bg-white border transition-all duration-300"
                style={{ borderColor:'rgba(13,24,61,0.1)', boxShadow:'0 12px 40px rgba(13,24,61,0.1)' }}>

                {/* Premium image area */}
                <div className="relative overflow-hidden w-full bg-gradient-to-br from-slate-100 to-slate-50" style={{ height: 340 }}>
                  <motion.img src={card.img} alt={card.tag}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05, transition:{ duration:0.6 } }}
                    draggable={false} />

                  {/* Elegant gradient fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-white/10 to-transparent pointer-events-none" />
                </div>

                {/* Premium content */}
                <div className="px-8 py-10 flex flex-col gap-7 flex-1">
                  <div>
                    <p className="text-xs font-bold tracking-widest mb-3" style={{ color: C.honey, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {card.tag}
                    </p>
                    <h3 className="text-3xl font-bold mb-4 leading-tight" style={{ color:C.primary }}>
                      {card.title}
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: C.muted }}>
                      {card.desc}
                    </p>
                  </div>

                  <Link to={card.href}
                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:shadow-xl active:scale-95 mt-auto w-full"
                    style={{ background:card.btnBg, boxShadow:`0 8px 24px ${card.btnBg}40` }}>
                    {card.cta} →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — Premium visual flow
      ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-36 px-6 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-28">
            <h2 className="text-6xl font-bold mb-6 leading-tight" style={{ color:C.primary }}>How Hive connects<br /><span style={{ color: C.honey }}>talent with purpose</span></h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color:C.muted }}>
              A simple, powerful process that brings the right people together.
            </p>
          </motion.div>

          {/* Premium step cards */}
          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-28">
            {[
              { num: '01', title: 'Create profile', desc: 'Share who you are' },
              { num: '02', title: 'Find matches', desc: 'Hive connects the dots' },
              { num: '03', title: 'Apply & connect', desc: 'Real conversations start' },
              { num: '04', title: 'Create impact', desc: 'Make it real' },
            ].map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }}
                className="rounded-2xl p-8 border bg-white transition-all hover:shadow-lg"
                style={{ borderColor: 'rgba(13,24,61,0.08)', boxShadow: '0 4px 16px rgba(13,24,61,0.06)' }}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl"
                    style={{ background: `${C.honey}20`, color: C.honey }}>
                    {step.num}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color:C.primary }}>
                  {step.title}
                </h3>
                <p style={{ color:C.muted }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Large visual preview section */}
          <div className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto">
            {[
              {
                title: 'Student',
                subtitle: 'What you share',
                items: ['Your unique skills', 'Interests & values', 'Languages spoken', 'Availability'],
              },
              {
                title: 'Organization',
                subtitle: 'What you post',
                items: ['Role & mission', 'Skills you need', 'Time commitment', 'Impact area'],
              },
            ].map((section, i) => (
              <motion.div key={section.title}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.12, duration:0.5 }}
                className="rounded-3xl p-12 border bg-white"
                style={{ borderColor: 'rgba(13,24,61,0.08)', boxShadow: '0 4px 16px rgba(13,24,61,0.06)' }}>
                <h3 className="text-2xl font-bold mb-2" style={{ color:C.primary }}>
                  {section.title}
                </h3>
                <p className="text-sm font-semibold mb-8" style={{ color: C.honey }}>
                  {section.subtitle}
                </p>
                <div className="space-y-4">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ background: C.honey }}/>
                      <span className="text-base font-medium" style={{ color:C.primary }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY HIVE IS DIFFERENT — Premium differentiators
      ══════════════════════════════════════════════════════ */}
      <section className="py-36 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-28">
            <h2 className="text-6xl font-bold leading-tight mb-6" style={{ color:C.primary }}>
              Why Hive is<br />
              <span style={{ color: C.honey }}>different</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color:C.muted }}>
              Built specifically to solve the real problems of connecting talent with purpose.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Sparkles,
                title: 'Meaning-based matching',
                desc: 'Our AI reads what\'s real, not just keywords. It understands mission fit and actual compatibility.'
              },
              {
                icon: Heart,
                title: 'Mission comes first',
                desc: 'Students find roles aligned with their values. Organizations find people who care about the cause.'
              },
              {
                icon: Eye,
                title: 'Total transparency',
                desc: 'Every match shows why you fit. No mystery. Just clarity and confidence in every connection.'
              },
              {
                icon: Zap,
                title: 'Built for real work',
                desc: 'From profile creation to application, every step is designed for students and nonprofits.'
              },
            ].map((benefit, i) => {
              const IconComponent = benefit.icon
              return (
                <motion.div key={benefit.title}
                  initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.08, duration:0.5 }}
                  className="p-10 rounded-3xl border bg-white transition-all hover:shadow-lg"
                  style={{ borderColor: 'rgba(13,24,61,0.08)', boxShadow: '0 4px 20px rgba(13,24,61,0.05)' }}>
                  <div className="mb-6" style={{ color: C.honey }}>
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color:C.primary }}>
                    {benefit.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color:C.muted }}>
                    {benefit.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VOICES
      ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6" style={{ background:C.bg }}>
        <div className="max-w-5xl mx-auto">

          {/* Section header */}
          <motion.div initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-14">
            {/* Honeycomb accent */}
            <div className="flex justify-center mb-4" aria-hidden="true">
              <div className="flex items-center gap-2 opacity-30">
                {[28,20,28].map((s,i) => (
                  <svg key={i} width={s} height={s} viewBox="0 0 24 24">
                    <path d="M12 2 L20.7 7 L20.7 17 L12 22 L3.3 17 L3.3 7 Z"
                      stroke={C.honey} strokeWidth="1.5" fill="rgba(255,183,3,0.2)" />
                  </svg>
                ))}
              </div>
            </div>
            <h2 className="text-[1.85rem] font-bold mb-3" style={{ color:C.primary }}>Voices from the hive</h2>
            <p className="text-base" style={{ color:C.muted }}>
              From students and NGOs doing real work — in their own words.
            </p>
          </motion.div>

          {/* Testimonial grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {allVoices.map((v, i) => (
              <motion.div key={v.id}
                initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:(i % 3)*0.1, duration:0.42 }}
                whileHover={{ y:-4, transition:{ duration:0.18 } }}
                className="bg-white rounded-3xl p-7 flex flex-col gap-5 border relative overflow-hidden"
                style={{ borderColor:'rgba(13,24,61,0.07)', boxShadow:'0 2px 16px rgba(13,24,61,0.05)' }}>

                {/* Faint hex watermark in corner */}
                <div className="absolute top-5 right-5 opacity-[0.055]" aria-hidden="true">
                  <svg width="34" height="34" viewBox="0 0 24 24">
                    <path d="M12 2 L20.7 7 L20.7 17 L12 22 L3.3 17 L3.3 7 Z" fill={C.honey}/>
                  </svg>
                </div>

                {/* Opening quote mark */}
                <div className="text-5xl leading-none font-serif select-none"
                  style={{ color:'rgba(255,183,3,0.28)', marginTop:'-8px' }}
                  aria-hidden="true">"</div>

                <p className="text-sm leading-relaxed flex-1 -mt-3" style={{ color:C.muted }}>
                  {v.quote}
                </p>

                <div className="flex items-center gap-3 pt-4"
                  style={{ borderTop:'1px solid rgba(13,24,61,0.07)' }}>
                  <GAvatar name={v.name} size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color:C.primary }}>{v.name}</p>
                    <p className="text-xs truncate" style={{ color:C.muted }}>
                      {v.role === 'student' ? '🎓 Student' : '🌍 NGO'}
                      {v.org ? ` · ${v.org}` : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Voice submission modal ── */}
      <AnimatePresence>
        {voiceModal && (
          <VoiceModal
            onClose={() => setVoiceModal(false)}
            onSubmit={handleVoiceSubmit}
          />
        )}
      </AnimatePresence>


      {/* ══════════════════════════════════════════════════════
          TRUST — Israeli universities + NGOs ecosystem
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 px-6 bg-white" style={{ borderTop:'1px solid rgba(13,24,61,0.07)', borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }}
            viewport={{ once:true }} transition={{ duration:0.4 }}
            className="text-center text-[11px] font-extrabold uppercase tracking-[0.14em] mb-8"
            style={{ color:C.muted }}>
            A growing ecosystem of students, universities &amp; NGOs across Israel
          </motion.p>

          {/* Universities row */}
          <motion.div initial={{ opacity:0, y:8 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.45, delay:0.05 }}
            className="mb-3">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color:'rgba(13,24,61,0.3)' }}>Universities &amp; Colleges</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Hebrew University','Tel Aviv University','Technion','Ben-Gurion University','University of Haifa',
                'Bar-Ilan University','Reichman University','Open University','Hadassah Academic College',
                'Shenkar','Bezalel Academy','Sapir College','Ono Academic College','Ariel University'].map((name, i) => (
                <motion.span key={name}
                  initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }}
                  viewport={{ once:true }} transition={{ delay:0.05 + i*0.02, duration:0.25 }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-default hover:shadow-sm"
                  style={{ background:C.bg, color:C.primary, border:'1px solid rgba(13,24,61,0.1)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703] shrink-0"/>
                  {name}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* NGOs row */}
          <motion.div initial={{ opacity:0, y:8 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.45, delay:0.15 }}>
            <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-3 mt-5"
              style={{ color:'rgba(13,24,61,0.3)' }}>NGOs &amp; Social Organizations</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Elem','Sikkuy-Aufoq','PHR Israel','Arab Jewish Community Center','BINA',
                'Latet','Perach','Itach Maaki','Kav Mashve','MadeinJLM',
                'Israel Digital','Hasoub','Tsofen','Access Israel'].map((name, i) => (
                <motion.span key={name}
                  initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }}
                  viewport={{ once:true }} transition={{ delay:0.1 + i*0.02, duration:0.25 }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-default hover:shadow-sm"
                  style={{ background:'rgba(13,24,61,0.04)', color:C.primary, border:'1px solid rgba(13,24,61,0.08)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D183D] opacity-40 shrink-0"/>
                  {name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 text-center relative overflow-hidden" style={{ background:C.primary }}>
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{ backgroundImage: `url(${cardsBackground})`, backgroundSize: 'auto', backgroundRepeat: 'repeat' }}
          aria-hidden="true" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-px"
          style={{ background:`linear-gradient(90deg,transparent,${C.honey}35,transparent)` }}
          aria-hidden="true" />

        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} className="max-w-xl mx-auto relative">
          <div className="flex justify-center mb-7">
            <HiveLogo size={36} showName={false} />
          </div>
          <h2 className="text-[2.4rem] font-extrabold text-white mb-4 leading-tight">
            You bring the skills.<br />
            <span style={{ color:C.honey }}>We'll help you make them matter.</span>
          </h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color:'rgba(255,255,255,0.38)' }}>
            Join a growing community of students turning their skills into real-world experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background:C.honey }}>
              {user && user.role ? 'Go to dashboard' : 'Get started free'} →
            </button>
            <Link to="/matches"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold border transition-all hover:bg-white/5"
              style={{ color:'white', borderColor:'rgba(255,255,255,0.18)' }}>
              Browse matches
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="py-10 px-6 text-center" style={{ background:'#070c1a' }}>
        <HiveLogo size={26} light showName nameSize="text-sm" className="justify-center mb-3" />
        <p className="text-sm" style={{ color:'rgba(255,255,255,0.26)' }}>
          Connecting skills with impact — wherever you are in the world.
        </p>
      </footer>
    </div>
  )
}
