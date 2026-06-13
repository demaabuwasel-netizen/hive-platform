import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserRound, Sparkles, Handshake } from 'lucide-react'
import Navbar from '../components/Navbar'

const C = { bg: '#FAF6EF', primary: '#0D183D', honey: '#FFB703', muted: '#4B6382' }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

const VALUES = [
  { emoji: '🎯', title: 'Precision over volume', desc: 'One well-matched placement beats ten random ones. We optimise for quality and genuine fit.' },
  { emoji: '🔍', title: 'Transparency',          desc: 'Every match comes with a full explanation. No black boxes — you always know why.' },
  { emoji: '🌍', title: 'Inclusion',              desc: 'We build for diverse communities. Language, background, and geography are features, not obstacles.' },
  { emoji: '🤝', title: 'Mutual benefit',         desc: 'A good match works for both sides. Students grow. NGOs move their mission forward.' },
]

const HOW_STEPS = [
  {
    n: '01',
    icon: UserRound,
    title: 'Build your profile',
    body: 'Students share skills, experience, languages, and goals. NGOs describe their mission, open roles, and what kind of collaborator they need.',
  },
  {
    n: '02',
    icon: Sparkles,
    title: 'Hive AI matches',
    body: 'Our AI reads between the lines — pairing skills with needs, passions with missions, and availability with opportunities that actually fit.',
  },
  {
    n: '03',
    icon: Handshake,
    title: 'Connect & contribute',
    body: 'Students gain real-world experience that matters. NGOs get skilled, motivated collaborators. Both sides move their mission forward.',
  },
]

// ── Honeycomb SVG ─────────────────────────────────────────────────────────────
// Seven flat-top hexagonal cells in a flower arrangement.
// All points are pre-computed: flat-top hex vertices at 30°, 90°, 150°, 210°, 270°, 330°
// with outer radius r = 44. Neighbour centre-to-centre distance = r√3 ≈ 76.
function HoneycombGraphic() {
  // hex(cx, cy) → SVG polygon points for flat-top hexagon, r = 44
  const hex = (cx, cy) => [
    [cx + 38, cy + 22], [cx,      cy + 44], [cx - 38, cy + 22],
    [cx - 38, cy - 22], [cx,      cy - 44], [cx + 38, cy - 22],
  ].map(([x, y]) => `${x},${y}`).join(' ')

  // 7-cell flower; centre at (200, 180)
  const cells = [
    { cx: 200, cy: 180, label: 'Hive',      sub: null,          main: true  },
    { cx: 200, cy: 104, label: 'Purpose',   sub: null,          main: false },
    { cx: 266, cy: 142, label: 'Skills',    sub: null,          main: false },
    { cx: 266, cy: 218, label: 'Impact',    sub: null,          main: false },
    { cx: 200, cy: 256, label: 'Mission',   sub: null,          main: false },
    { cx: 134, cy: 218, label: 'Community', sub: null,          main: false },
    { cx: 134, cy: 142, label: 'Growth',    sub: null,          main: false },
  ]

  return (
    <svg viewBox="0 0 400 360" aria-hidden="true"
      className="w-full max-w-[360px] mx-auto">

      {/* Soft glow behind the centre hex */}
      <circle cx="200" cy="180" r="60" fill="rgba(255,183,3,0.12)"/>

      {cells.map(({ cx, cy, label, main }) => (
        <g key={label}>
          <polygon
            points={hex(cx, cy)}
            fill={main ? '#FFB703' : 'rgba(255,183,3,0.1)'}
            stroke={main ? '#E8A500' : 'rgba(255,183,3,0.45)'}
            strokeWidth={main ? 0 : 1.5}
          />
          {main && (
            /* Bee icon in the centre cell */
            <text x={cx} y={cy - 14} textAnchor="middle" fontSize="22">🐝</text>
          )}
          <text
            x={cx} y={main ? cy + 12 : cy}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={main ? '15' : '11'}
            fontWeight={main ? '800' : '600'}
            fill={main ? 'white' : '#0D183D'}
            fontFamily="system-ui, sans-serif">
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── About page ────────────────────────────────────────────────────────────────

export default function About() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: C.bg }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-10 text-center">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.h1 variants={fadeUp}
            className="text-[3rem] font-extrabold leading-[1.08] tracking-tight mb-5"
            style={{ color: C.primary }}>
            We believe talent and<br />mission belong together.
          </motion.h1>
          <motion.p variants={fadeUp}
            className="text-[1.05rem] leading-relaxed max-w-2xl mx-auto"
            style={{ color: C.muted }}>
            Hive was built to close the gap between ambitious students who want to make an impact
            and NGOs that need skilled, motivated collaborators — but struggle to find them.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Why Hive? ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', border: '1px solid rgba(13,24,61,0.07)',
                   boxShadow: '0 4px 32px rgba(13,24,61,0.06)' }}>

          <div className="grid lg:grid-cols-2 gap-0">

            {/* Left — text */}
            <div className="px-10 py-12 lg:py-16 flex flex-col justify-center">
              {/* Label */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">🐝</span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest"
                  style={{ color: C.honey }}>The name</span>
              </div>

              <h2 className="text-[2rem] font-extrabold mb-6 leading-tight"
                style={{ color: C.primary }}>
                Why Hive?
              </h2>

              <div className="flex flex-col gap-4 text-[14px] leading-[1.75]"
                style={{ color: C.muted }}>
                <p>
                  A hive is more than just a home for bees — it is a community built around
                  collaboration, purpose, and impact.
                </p>
                <p>
                  Every bee contributes unique skills toward a shared mission. Some gather
                  resources, some build, and some support the growth of the hive. Together,
                  they create something much greater than any individual could achieve alone.
                </p>
                <p className="font-semibold" style={{ color: C.primary }}>
                  Hive was built on the same idea.
                </p>
                <p>
                  Students have valuable skills, energy, and potential. NGOs have meaningful
                  challenges and opportunities to create impact. Hive brings them together,
                  helping students gain real-world experience while supporting organisations
                  that make a difference in their communities.
                </p>
                <p
                  className="border-l-4 pl-4 py-1 italic"
                  style={{ borderColor: C.honey, color: C.primary }}>
                  Instead of simply matching people to opportunities, Hive matches skills,
                  passions, and purpose.
                </p>
              </div>
            </div>

            {/* Right — honeycomb graphic */}
            <div className="flex items-center justify-center px-6 py-12 lg:py-0"
              style={{ background: 'rgba(255,183,3,0.04)',
                       borderLeft: '1px solid rgba(255,183,3,0.12)' }}>
              <HoneycombGraphic />
            </div>

          </div>
        </motion.div>
      </section>

      {/* ── How Hive Works ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-center mb-3"
            style={{ color: C.honey }}>The process</p>
          <h2 className="text-[1.9rem] font-extrabold text-center mb-12"
            style={{ color: C.primary }}>
            How Hive works
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden sm:block absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,183,3,0.5) 20%, rgba(255,183,3,0.5) 80%, transparent)' }}/>

          {HOW_STEPS.map(({ n, icon: Icon, title, body }, i) => (
            <motion.div key={n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl border p-7 flex flex-col gap-4 relative"
              style={{ borderColor: 'rgba(13,24,61,0.08)',
                       boxShadow: '0 2px 16px rgba(13,24,61,0.04)' }}>

              {/* Step icon circle */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,183,3,0.1)' }}>
                  <Icon size={20} style={{ color: C.honey }} strokeWidth={2}/>
                </div>
                <span className="text-[11px] font-extrabold" style={{ color: 'rgba(13,24,61,0.25)' }}>
                  {n}
                </span>
              </div>

              <div>
                <p className="text-[15px] font-extrabold mb-2" style={{ color: C.primary }}>
                  {title}
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Mission quote ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-3xl p-10"
          style={{ background: C.primary }}>
          <p className="text-[1.5rem] font-extrabold text-white leading-snug">
            "Make every student's skills accessible to every NGO that needs them —
            and make every NGO's mission accessible to every student who cares."
          </p>
        </motion.div>
      </section>

      {/* ── The problem we're solving ─────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45 }}
          className="bg-white rounded-2xl border p-10"
          style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
          <h2 className="text-[1.6rem] font-extrabold mb-5" style={{ color: C.primary }}>
            The problem we're solving
          </h2>
          <div className="flex flex-col gap-4 text-[14px] leading-relaxed" style={{ color: C.muted }}>
            <p>
              Every year, thousands of students graduate with strong technical and creative skills,
              desperate for real-world experience that matters. At the same time, NGOs across the
              country struggle to find volunteers who can actually help — not just show up, but
              contribute meaningfully.
            </p>
            <p>
              The problem isn't a shortage of talent or a shortage of need. It's a matching
              problem. A Python developer and a data-hungry NGO might be 10 minutes apart and
              never find each other. A bilingual student could be exactly what an Arab-Jewish
              community centre needs — but neither knows it.
            </p>
            <p>
              Hive fixes that. We use AI to read the meaning behind profiles — skills,
              experience, languages, values — and surface connections that would otherwise
              never happen.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45 }}
          className="text-[1.9rem] font-extrabold text-center mb-12"
          style={{ color: C.primary }}>
          What we stand for
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => (
            <motion.div key={v.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl border p-6 flex flex-col gap-3"
              style={{ borderColor: 'rgba(13,24,61,0.08)' }}>
              <span className="text-3xl">{v.emoji}</span>
              <p className="text-[14px] font-bold" style={{ color: C.primary }}>{v.title}</p>
              <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-3xl px-10 py-14 text-center"
          style={{ background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.2)' }}>
          <p className="text-[2rem] font-extrabold mb-3" style={{ color: C.primary }}>
            Join the Hive.
          </p>
          <p className="text-[15px] mb-8" style={{ color: C.muted }}>
            Whether you're a student looking to make an impact, or an NGO looking for your
            next collaborator — we'd love to have you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/auth?mode=signup"
              className="px-8 py-3.5 rounded-2xl text-[15px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: C.honey, boxShadow: '0 4px 20px rgba(255,183,3,0.35)' }}>
              Get started →
            </Link>
            <Link to="/how-it-works"
              className="px-8 py-3.5 rounded-2xl text-[15px] font-semibold border transition-all hover:bg-[rgba(13,24,61,0.04)]"
              style={{ color: C.primary, borderColor: 'rgba(13,24,61,0.15)' }}>
              See how it works
            </Link>
          </div>
        </motion.div>
      </section>

      <div className="py-10 text-center text-[12px]" style={{ color: C.muted }}>
        © {new Date().getFullYear()} Hive. All rights reserved.
      </div>
    </div>
  )
}
