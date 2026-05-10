import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import Navbar from '../components/Navbar'
import HiveLogo from '../components/HiveLogo'

// ─── Assets ───────────────────────────────────────────────────────────────────
import img1 from '../assets/img1.png'   // hero: student with connection network
import img2 from '../assets/img2.png'   // For Students card
import img3 from '../assets/img3.png'   // For NGOs card
import img4 from '../assets/img4.png'   // For Impact card
import img5 from '../assets/img5.png'   // partner logos strip
import img6 from '../assets/img6.png'   // bee decorative (tiny, once)

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:      '#FAF6EF',
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
        <img
          src={img1}
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
    img: img2,
    imgBg: 'rgba(255,183,3,0.07)',
    tag: 'For Students',
    tagColor: C.honey,
    tagBg: 'rgba(255,183,3,0.1)',
    title: 'Build real-world experience',
    desc: 'Get matched with NGOs that need your exact skills. Build a portfolio with projects that genuinely matter.',
    cta: 'Join as a student →',
    href: '/auth?mode=signup&role=student',
    btnBg: C.honey,
    btnShadow: '0 4px 16px rgba(255,183,3,0.28)',
  },
  {
    img: img3,
    imgBg: 'rgba(13,24,61,0.05)',
    tag: 'For NGOs',
    tagColor: C.primary,
    tagBg: 'rgba(13,24,61,0.07)',
    title: 'Find the right volunteer',
    desc: 'Describe your mission in plain language. Hive surfaces students who truly fit — saving hours of screening.',
    cta: 'Register your NGO →',
    href: '/auth?mode=signup&role=ngo',
    btnBg: C.primary,
    btnShadow: '0 4px 16px rgba(13,24,61,0.2)',
  },
  {
    img: img4,
    imgBg: 'rgba(255,183,3,0.07)',
    tag: 'For Impact',
    tagColor: '#92610a',
    tagBg: 'rgba(255,213,106,0.22)',
    title: 'Create meaningful change',
    desc: 'Every Hive match creates a real contribution — a tool built, a campaign launched, a community served.',
    cta: 'See live matches →',
    href: '/matches',
    btnBg: '#f97316',
    btnShadow: '0 4px 16px rgba(249,115,22,0.24)',
  },
]

const VOICES = [
  { quote: "Hive helped me land my first real-world project — building a registration site for a youth NGO that genuinely needed the help.", name:'Maya Cohen',   role:'CS Student · Tel Aviv University' },
  { quote: "The match felt authentic. Hive understood what I was looking for — not just the skills on my CV, but the impact I wanted to have.", name:'Omar Khatib',   role:'Info Systems · Univ. of Haifa'   },
  { quote: "We described our needs in plain language and got a volunteer who understood our community from day one.", name:'Rania Nassar',  role:'Director · Majd – Arab Youth Hub' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="flex flex-col" style={{ background: C.bg }}>
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO
          Left: copy — Right: img1 (natural blend) + match card
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-14 lg:py-20" style={{ background: C.bg }}>

        {/* Subtle honeycomb tile */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.028]" aria-hidden="true"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z' fill='%23FFB703'/%3E%3C/svg%3E")` }} />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[48fr_52fr] gap-8 lg:gap-14 items-center relative">

          {/* ── Left copy ── */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-[520px]">

            <motion.div variants={fadeUp} className="mb-5">
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border"
                style={{ background:'rgba(255,183,3,0.08)', borderColor:'rgba(255,183,3,0.2)', color:C.honey }}>
                <HiveLogo size={13} showName={false} />
                AI-powered opportunity matching
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-[3.2rem] md:text-[3.6rem] font-extrabold leading-[1.05] tracking-tight mb-5"
              style={{ color: C.primary }}>
              Find meaningful<br />opportunities.<br />
              Make real{' '}
              <span className="relative inline-block" style={{ color: C.honey }}>
                impact.
                <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 3.5 Q50 0 100 3.5" stroke={C.honey} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp}
              className="text-[1.05rem] leading-relaxed mb-8 max-w-[400px]"
              style={{ color: C.muted }}>
              Hive is an AI-powered platform that connects ambitious students with NGOs to build meaningful experience and create real-world impact.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link to="/auth?mode=signup&role=student"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                style={{ background:C.honey, boxShadow:'0 4px 20px rgba(255,183,3,0.3)' }}>
                I'm a Student →
              </Link>
              <Link to="/auth?mode=signup&role=ngo"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl text-base font-semibold border transition-all hover:bg-white active:scale-[0.97]"
                style={{ color:C.primary, borderColor:'rgba(13,24,61,0.13)', background:'transparent' }}>
                I'm an NGO →
              </Link>
            </motion.div>

            {/* Avatar trust row */}
            <motion.div variants={fadeUp} className="flex items-center gap-3" style={{ color:C.muted }}>
              <div className="flex -space-x-2.5">
                {[['Maya Cohen','#6366F1','#8B5CF6'],['Omar Khatib','#10B981','#059669'],['Lina Mansour','#06B6D4','#3B82F6'],['Noor Ahmad','#EC4899','#F43F5E'],['Ahmad S','#FFB703','#F97316']].map(([name,c1,c2])=>(
                  <div key={name}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white select-none font-bold shrink-0"
                    style={{ background:`linear-gradient(135deg,${c1},${c2})`, fontSize:10 }}
                    title={name}>
                    {name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                ))}
              </div>
              <span className="text-sm">
                Joined by <strong style={{ color:C.primary }}>200+ students</strong> from around the world
              </span>
            </motion.div>
          </motion.div>

          {/* ── Right illustration ── */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.18, duration:0.65, ease:'easeOut' }}>
            <HeroRight />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VALUE PROPS — 4 small chips below hero
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 pb-10" style={{ background: C.bg }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {VALUE_PROPS.map((v, i) => (
            <motion.div key={v.title}
              initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.06, duration:0.35 }}
              className="flex items-start gap-3 rounded-2xl px-4 py-3.5 bg-white border"
              style={{ borderColor:'rgba(13,24,61,0.07)' }}>
              <span className="text-xl mt-0.5 shrink-0" aria-hidden="true">{v.icon}</span>
              <div>
                <p className="text-[12px] font-bold mb-0.5" style={{ color:C.primary }}>{v.title}</p>
                <p className="text-[11px] leading-snug" style={{ color:C.muted }}>{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURE CARDS — For Students | For NGOs | For Impact
          img2 / img3 / img4 — equal height, clean composition
      ══════════════════════════════════════════════════════ */}
      {/* invisible anchor so both For Students and For NGOs nav links land here */}
      <span id="for-ngos" style={{ display:'block', height:0, visibility:'hidden' }}/>

      <section id="for-students" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-12">
            <h2 className="text-[1.85rem] font-bold mb-2.5" style={{ color:C.primary }}>
              Built for everyone in the hive
            </h2>
            <p className="text-base max-w-sm mx-auto" style={{ color:C.muted }}>
              Whether you're building experience or finding talent — Hive connects you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURE_CARDS.map((card, i) => (
              <motion.div key={card.tag}
                initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.45 }}
                whileHover={{ y:-4, transition:{ duration:0.18 } }}
                className="rounded-3xl overflow-hidden flex flex-col bg-white border"
                style={{ borderColor:'rgba(13,24,61,0.08)', boxShadow:'0 2px 16px rgba(13,24,61,0.05)' }}>

                {/* Illustration area — multiply blend removes white bg, gradient bridges into card body */}
                <div className="relative overflow-hidden"
                  style={{ height: 210, background: card.imgBg }}>
                  <img src={card.img} alt={card.tag}
                    className="w-full h-full object-contain object-bottom"
                    style={{
                      mixBlendMode: 'multiply',
                      transform: 'scale(1.03)',
                      maskImage: 'linear-gradient(to bottom, black 35%, rgba(0,0,0,0.75) 68%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 35%, rgba(0,0,0,0.75) 68%, transparent 100%)',
                    }}
                    draggable={false} />
                  {/* White gradient bridge so illustration flows into card content */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-10"
                    style={{ background: 'linear-gradient(to bottom, transparent, #ffffff)' }} />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-[1rem]" style={{ color:C.primary }}>{card.tag}</h3>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background:card.tagBg, color:card.tagColor }}>
                      {card.tag === 'For Students' ? 'Build experience' : card.tag === 'For NGOs' ? 'Get skilled help' : 'Together'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold leading-snug" style={{ color:C.primary }}>{card.title}</h4>
                  <p className="text-sm leading-relaxed flex-1" style={{ color:C.muted }}>{card.desc}</p>
                  <Link to={card.href}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 mt-1"
                    style={{ background:card.btnBg, boxShadow:card.btnShadow }}>
                    {card.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-14">
            <h2 className="text-[1.85rem] font-bold mb-3" style={{ color:C.primary }}>How Hive works</h2>
            <p className="text-base max-w-sm mx-auto" style={{ color:C.muted }}>
              No checkbox forms. No keyword matching. Just describe who you are.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step:'01', icon:'📝', title:'Describe yourself',       desc:'Students share skills and goals in their own words. NGOs describe their mission and what kind of help they need.' },
              { step:'02', icon:'✦',  title:'Hive finds the fit',      desc:'Our semantic AI reads meaning, not keywords. "Built a site for a food bank" signals skills, ownership, and mission alignment.' },
              { step:'03', icon:'🤝', title:'Connect with confidence', desc:"Every match includes a plain-language explanation of why you're compatible, so both sides decide with clarity." },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.42 }}
                whileHover={{ y:-4, transition:{ duration:0.18 } }}
                className="rounded-3xl p-7 cursor-default"
                style={{ background:C.bg, border:'1px solid rgba(13,24,61,0.06)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background:'rgba(255,183,3,0.1)' }}>{item.icon}</div>
                  <span className="text-xs font-extrabold tracking-widest" style={{ color:C.honey }}>{item.step}</span>
                </div>
                <h3 className="text-[0.95rem] font-bold mb-2" style={{ color:C.primary }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:C.muted }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 relative overflow-hidden" style={{ background:C.primary }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z' fill='white'/%3E%3C/svg%3E")` }}
          aria-hidden="true" />
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-10 relative">
          <AnimatedStat raw="200+" label="Students matched"  delay={0}   />
          <AnimatedStat raw="50+"  label="NGO partners"       delay={0.1} />
          <AnimatedStat raw="94%"  label="Match satisfaction" delay={0.2} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VOICES
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background:C.bg }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-14">
            <h2 className="text-[1.85rem] font-bold mb-3" style={{ color:C.primary }}>Voices from the hive</h2>
            <p className="text-base" style={{ color:C.muted }}>From students and NGOs doing real work around the world.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {VOICES.map((v, i) => (
              <motion.div key={v.name}
                initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.42 }}
                className="bg-white rounded-3xl p-7 flex flex-col gap-5 border"
                style={{ borderColor:'rgba(13,24,61,0.07)', boxShadow:'0 2px 16px rgba(13,24,61,0.05)' }}>
                <p className="text-sm leading-relaxed italic flex-1" style={{ color:C.muted }}>
                  "{v.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4"
                  style={{ borderTop:'1px solid rgba(13,24,61,0.07)' }}>
                  <GAvatar name={v.name} size={40} />
                  <div>
                    <p className="text-sm font-bold" style={{ color:C.primary }}>{v.name}</p>
                    <p className="text-xs" style={{ color:C.muted }}>{v.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ABOUT — Mission, AI, Impact
      ══════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 px-6 bg-white" style={{ borderTop:'1px solid rgba(13,24,61,0.07)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border mb-5"
              style={{ background:'rgba(255,183,3,0.08)', borderColor:'rgba(255,183,3,0.2)', color:C.honey }}>
              <HiveLogo size={13} showName={false} />
              Our mission
            </span>
            <h2 className="text-[2rem] font-bold mb-4 leading-tight" style={{ color:C.primary }}>
              We believe skills should serve<br />more than careers.
            </h2>
            <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color:C.muted }}>
              Hive was built on one idea: the most capable students and the most mission-driven organisations rarely find each other — not because the fit doesn't exist, but because the path to discovery is broken.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {[
              {
                icon: '✦',
                iconBg: 'rgba(255,183,3,0.1)',
                iconColor: C.honey,
                title: 'Semantic AI matching',
                body: 'We don\'t match on keywords. Our AI reads context — "built a CRM for a refugee clinic" signals skills, ownership, and compassion simultaneously. The result: matches that feel right from day one.',
              },
              {
                icon: '🌍',
                iconBg: 'rgba(6,182,212,0.1)',
                iconColor: '#0891B2',
                title: 'Inclusive by design',
                body: 'Hive was designed for diverse communities — Arab, Jewish, immigrant, and international students. Language signals matter in our model. Arabic native speakers get surfaced to NGOs that genuinely need that bridge.',
              },
              {
                icon: '🤝',
                iconBg: 'rgba(16,185,129,0.1)',
                iconColor: '#059669',
                title: 'Transparent connections',
                body: 'Every match comes with a plain-language explanation. Students know exactly why an NGO appeared. NGOs understand what makes a student the right fit. No black boxes, no guessing.',
              },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.42 }}
                className="rounded-3xl p-7 border"
                style={{ background:C.bg, borderColor:'rgba(13,24,61,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-5"
                  style={{ background:item.iconBg }}>
                  {item.icon}
                </div>
                <h3 className="text-[0.95rem] font-bold mb-3" style={{ color:C.primary }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:C.muted }}>{item.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Vision strip */}
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.5 }}
            className="rounded-3xl px-10 py-10 text-center relative overflow-hidden"
            style={{ background:C.primary }}>
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z' fill='white'/%3E%3C/svg%3E")` }}
              aria-hidden="true" />
            <div className="relative">
              <p className="text-[1.15rem] font-semibold text-white leading-relaxed max-w-2xl mx-auto mb-6">
                "A student who helps an NGO reach 500 more people — that's not just a portfolio line.<br />
                <span style={{ color:C.honey }}>That's a life changed. Sometimes several."</span>
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.3)' }}>
                Hive's founding vision
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 text-center relative overflow-hidden" style={{ background:C.primary }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.49L26 15v14.98l-13.02 7.5L0 29.99V15z' fill='white'/%3E%3C/svg%3E")` }}
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
            <Link to="/auth?mode=signup&role=student"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background:C.honey }}>
              Get started free →
            </Link>
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
