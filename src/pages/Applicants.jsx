import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Star, Calendar, X, CheckCircle2, XCircle,
  MapPin, Clock, Globe, Sparkles, MessageCircle, Users,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

// ─── Data ─────────────────────────────────────────────────────────────────────

const APPLICANTS = [
  {
    id: 1, name: 'Maya Cohen', field: 'Computer Science', uni: 'Tel Aviv University', year: '3rd year',
    match: 93, status: 'shortlisted',
    skills: ['React', 'TypeScript', 'UX Design', 'Figma', 'Python'],
    languages: ['English', 'Hebrew'],
    interests: ['Human-Computer Interaction', 'Social Good', 'Accessibility'],
    availability: 'Immediately', weeklyHours: '15–20 hrs/week', location: 'Tel Aviv',
    bio: 'CS student with a strong design sensibility. Rare combo of frontend engineering and UX. Has completed two nonprofit tech projects with measurable outcomes.',
    applied: '1 day ago',
    matchReasons: [
      'React + TypeScript + UX design is a rare full-stack/design hybrid that matches your exact gap',
      'Accessibility focus is directly relevant to your platform\'s inclusion goals',
      'Available immediately in Tel Aviv — fastest possible start time',
    ],
    projects: ['Accessible web app for a disability NGO (React + ARIA)', 'UX research study for a youth organization'],
  },
  {
    id: 2, name: 'Ethan Galvin', field: 'Computer Science', uni: 'Tel Aviv University', year: '3rd year',
    match: 90, status: 'new',
    skills: ['Python', 'React', 'ML', 'Data Analysis'],
    languages: ['English', 'Hebrew'],
    interests: ['Social Impact Tech', 'Open Source', 'Education'],
    availability: 'Immediately', weeklyHours: '15–20 hrs/week', location: 'Tel Aviv',
    bio: 'CS student focused on data-driven solutions for social good. Strong background in ML pipelines and open-source contribution. Looking to apply technical skills where data drives meaningful decisions.',
    applied: '2 days ago',
    matchReasons: [
      'Python and ML expertise directly supports your data tracking and program analytics needs',
      'Prior open-source work shows strong independent ownership and initiative',
      'Based in Tel Aviv — available for on-site collaboration',
    ],
    projects: ['Automated data pipeline for a food bank serving 4,000 families', 'Open-source ML library with 220+ GitHub stars'],
  },
  {
    id: 3, name: 'Sharon Bloomstein', field: 'Digital Marketing', uni: 'Hebrew University', year: '4th year',
    match: 85, status: 'interview',
    skills: ['SEO', 'Social Media', 'Canva', 'Google Analytics'],
    languages: ['English', 'Hebrew', 'Russian'],
    interests: ['Community Building', 'Content Strategy', 'NGO Communications'],
    availability: 'Part-time', weeklyHours: '20 hrs/week', location: 'Jerusalem',
    bio: 'Digital marketing specialist with 3 years helping nonprofits grow their online presence. Passionate about amplifying meaningful missions through strategic content and community-driven campaigns.',
    applied: '4 days ago',
    matchReasons: [
      'SEO and social media expertise directly addresses your community outreach goals',
      'Track record growing nonprofit audiences by 300% — proven, measurable results',
      'Trilingual (English, Hebrew, Russian) — valuable for your diverse community',
    ],
    projects: ['Grew NGO social media from 1,200 to 4,800 followers in 6 months', 'Content strategy for 5 nonprofits in 2024'],
  },
  {
    id: 4, name: 'Nour Haddad', field: 'Public Health', uni: 'Ben-Gurion University', year: '2nd year MSc',
    match: 80, status: 'new',
    skills: ['Research', 'Statistics', 'Arabic', 'Academic Writing'],
    languages: ['Arabic', 'English', 'Hebrew'],
    interests: ['Health Equity', 'Community Research', 'Youth Programs'],
    availability: 'Flexible', weeklyHours: '10–15 hrs/week', location: 'Beer Sheva',
    bio: 'Public health researcher specializing in health equity for underserved communities. Published in 2 peer-reviewed journals. Evidence-based approach with deep community connection.',
    applied: '5 days ago',
    matchReasons: [
      'Native Arabic speaker with community research background — rare for fieldwork',
      'Health equity focus aligns strongly with your youth mission and target communities',
      'Peer-reviewed research strengthens grant applications and impact reporting',
    ],
    projects: ['Community health study across 3 regions with 1,200+ participants', 'Data analysis internship at WHO Geneva'],
  },
  {
    id: 5, name: 'Daniel Reiss', field: 'Software Engineering', uni: 'Technion', year: '4th year',
    match: 78, status: 'new',
    skills: ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    languages: ['English', 'Hebrew'],
    interests: ['Ed-Tech', 'Open Source', 'Social Innovation'],
    availability: '20 hrs/week', weeklyHours: '20 hrs/week', location: 'Haifa',
    bio: 'Full-stack developer with experience in nonprofit-sector projects. Built and maintained production systems for two NGOs during his studies.',
    applied: '1 week ago',
    matchReasons: [
      'Full-stack Node.js + React covers your technical infrastructure needs end-to-end',
      'Prior NGO project experience means less onboarding and faster first contribution',
      'Haifa location — can do hybrid on-site if needed',
    ],
    projects: ['Volunteer tracking system for a nonprofit (PostgreSQL + Node)', 'Contributed to open-source ed-tech platform'],
  },
  {
    id: 6, name: 'Emma Weiss', field: 'Graphic Design', uni: 'Bezalel Academy', year: '3rd year',
    match: 74, status: 'rejected',
    skills: ['Figma', 'Illustrator', 'Brand Design', 'Animation'],
    languages: ['English', 'Hebrew', 'German'],
    interests: ['Visual Storytelling', 'Social Impact', 'Accessibility Design'],
    availability: 'Freelance', weeklyHours: '5–10 hrs/week', location: 'Jerusalem',
    bio: 'Visual storyteller passionate about social impact design. Creates brand identities and campaigns for mission-driven organizations.',
    applied: '1 week ago',
    matchReasons: [
      'Figma and brand design skills directly support your visual communication needs',
      'Bezalel training brings professional design standards to NGO materials',
      'Freelance availability offers scheduling flexibility',
    ],
    projects: ['Brand identity for a youth literacy NGO', 'Annual report design for 3 organizations'],
  },
]

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'text-indigo-600',  bg: 'bg-indigo-50'   },
  shortlisted: { label: 'Shortlisted', color: 'text-[#D99E00]',   bg: 'bg-amber-50'    },
  interview:   { label: 'Interview',   color: 'text-emerald-700', bg: 'bg-emerald-50'  },
  rejected:    { label: 'Rejected',    color: 'text-red-500',     bg: 'bg-red-50'      },
}

const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30']
const INTERVIEW_TYPES = [
  { id: 'video',  emoji: '🎥', label: 'Video'    },
  { id: 'phone',  emoji: '📞', label: 'Phone'    },
  { id: 'onsite', emoji: '🤝', label: 'In-person'},
]

// ─── Match ring ───────────────────────────────────────────────────────────────

function MatchRing({ score }) {
  const r = 22, circ = 2 * Math.PI * r
  const color = score >= 90 ? '#10B981' : score >= 80 ? '#FFB703' : '#6366F1'
  const trackColor = score >= 90 ? '#D1FAE5' : score >= 80 ? '#FEF3C7' : '#EEF2FF'
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-label={`${score}% match`}>
      <circle cx="26" cy="26" r={r} fill="none" stroke={trackColor} strokeWidth="4.5"/>
      <motion.circle cx="26" cy="26" r={r} fill="none"
        stroke={color} strokeWidth="4.5" strokeDasharray={circ}
        strokeLinecap="round" transform="rotate(-90 26 26)"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}/>
      <text x="26" y="26" textAnchor="middle" dominantBaseline="central"
        fontSize="10" fontWeight="800" fill="#0D183D">{score}%</text>
    </svg>
  )
}

// ─── Interview Scheduler ──────────────────────────────────────────────────────

function InterviewScheduler({ applicant, onSchedule, onCancel }) {
  const [date, setDate]   = useState('')
  const [time, setTime]   = useState('10:00')
  const [type, setType]   = useState('video')
  const [note, setNote]   = useState('')
  const [done, setDone]   = useState(false)
  const [focusKey, setFocus] = useState(null)

  function confirm() {
    if (!date) return
    onSchedule({ date, time, type, note })
    setDone(true)
  }

  if (done) {
    return (
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        className="text-center py-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={22} className="text-emerald-500"/>
        </div>
        <p className="text-[14px] font-extrabold text-[#0D183D] mb-1">Interview scheduled!</p>
        <p className="text-[12px] text-[#4B6382] leading-relaxed">
          {applicant.name.split(' ')[0]} will receive an invitation via Hive.<br />
          <span className="font-semibold">{date} at {time}</span>
        </p>
      </motion.div>
    )
  }

  const iStyle = (k) => ({
    background: 'white', color: '#0D183D',
    border: `1.5px solid ${focusKey === k ? '#FFB703' : 'rgba(13,24,61,0.1)'}`,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[13px] font-extrabold text-[#0D183D]">Schedule interview</p>
        <button onClick={onCancel} className="text-[#4B6382] hover:text-[#0D183D] p-1">
          <X size={14}/>
        </button>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[#4B6382] mb-1.5">Date</p>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          onFocus={() => setFocus('date')} onBlur={() => setFocus(null)}
          className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none transition-all"
          style={iStyle('date')}/>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[#4B6382] mb-1.5">Time</p>
        <select value={time} onChange={e => setTime(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none cursor-pointer"
          style={{ background:'white', color:'#0D183D', border:'1.5px solid rgba(13,24,61,0.1)' }}>
          {TIMES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[#4B6382] mb-1.5">Interview type</p>
        <div className="grid grid-cols-3 gap-2">
          {INTERVIEW_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[11px] font-semibold border transition-all"
              style={type === t.id
                ? { background:'#0D183D', color:'white', borderColor:'#0D183D' }
                : { background:'white', color:'#4B6382', borderColor:'rgba(13,24,61,0.1)' }}>
              <span className="text-base">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[#4B6382] mb-1.5">Note to candidate (optional)</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="Preparation tips or context for the candidate…"
          onFocus={() => setFocus('note')} onBlur={() => setFocus(null)}
          className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none resize-none transition-all placeholder-[#4B6382]/50"
          style={{ ...iStyle('note'), lineHeight:1.55 }}/>
      </div>

      <button onClick={confirm} disabled={!date}
        className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-35"
        style={{ background:'#0D183D' }}>
        Confirm interview →
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Applicants() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [q, setQ]           = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [scheduling, setScheduling] = useState(false)
  const [toast, setToast]   = useState(null)
  const [statuses, setStatuses] = useState(
    () => Object.fromEntries(APPLICANTS.map(a => [a.id, a.status]))
  )

  const visible = APPLICANTS.filter(a =>
    (filter === 'all' || statuses[a.id] === filter) &&
    (a.name.toLowerCase().includes(q.toLowerCase()) ||
     a.field.toLowerCase().includes(q.toLowerCase()))
  )

  function setStatus(id, s) {
    setStatuses(p => ({ ...p, [id]: s }))
    const name = APPLICANTS.find(a => a.id === id)?.name.split(' ')[0] || ''
    const msgs = {
      shortlisted: `${name} shortlisted`,
      interview:   'Interview scheduled',
      rejected:    'Applicant passed',
      new:         'Status reset',
    }
    showToast(msgs[s] || '')
    if (selected?.id === id) setSelected(prev => ({ ...prev, _statusForce: s }))
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSchedule(data) {
    if (selected) { setStatus(selected.id, 'interview'); setScheduling(false) }
  }

  const statusCounts = {
    new:         Object.values(statuses).filter(s => s === 'new').length,
    shortlisted: Object.values(statuses).filter(s => s === 'shortlisted').length,
    interview:   Object.values(statuses).filter(s => s === 'interview').length,
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-7">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Applicants</h1>
          <p className="text-[13px] text-[#4B6382] mt-0.5">{APPLICANTS.length} students applied to your opportunities</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label:'New',         count: statusCounts.new,         color:'#6366F1' },
            { label:'Shortlisted', count: statusCounts.shortlisted, color:'#D99E00' },
            { label:'Interview',   count: statusCounts.interview,   color:'#10B981' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border"
              style={{ borderColor:`${color}30`, background:`${color}12`, color }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }}/>
              {count} {label}
            </div>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[rgba(13,24,61,0.08)] flex-1 min-w-[200px]">
          <Search size={13} className="text-[#4B6382] shrink-0"/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search applicants…"
            className="flex-1 bg-transparent text-[13px] outline-none text-[#0D183D] placeholder-[#4B6382]/50"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all','new','shortlisted','interview','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold capitalize transition-all ${
                filter === f ? 'text-white' : 'text-[#4B6382] bg-white border border-[rgba(13,24,61,0.08)] hover:bg-[#F8F9FB]'
              }`}
              style={filter === f ? { background:'#0D183D' } : {}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-5">

        {/* ── Applicant list ── */}
        <div className="flex flex-col gap-2.5">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-[rgba(13,24,61,0.08)]">
              <Search size={28} className="text-[#4B6382] mb-3 opacity-30"/>
              <p className="text-[13px] font-semibold text-[#0D183D] mb-1">No applicants found</p>
              <p className="text-[12px] text-[#4B6382]">Try adjusting your filter or search term.</p>
            </div>
          ) : visible.map((a, i) => {
            const st = STATUS_CONFIG[statuses[a.id]]
            const scoreColor = a.match >= 90 ? '#059669' : a.match >= 80 ? '#D99E00' : '#6366F1'
            const isActive = selected?.id === a.id
            return (
              <motion.div key={a.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.05 }}
                onClick={() => { setSelected(a); setScheduling(false) }}
                className={`bg-white rounded-2xl border px-5 py-4 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] ${
                  isActive ? 'border-[#FFB703] shadow-[0_0_0_3px_rgba(255,183,3,0.1)]' : 'border-[rgba(13,24,61,0.08)]'
                }`}>
                <GradientAvatar name={a.name} size={44} radius="0.65rem"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-bold text-[#0D183D] truncate">{a.name}</p>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4B6382] mb-2 truncate">{a.field} · {a.uni}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {a.skills.slice(0,3).map(s => (
                      <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border"
                        style={{ background:'#F8F9FB', color:'#4B6382', borderColor:'rgba(13,24,61,0.08)' }}>{s}</span>
                    ))}
                    {a.skills.length > 3 && <span className="text-[10px] text-[#4B6382]/60 font-medium">+{a.skills.length-3}</span>}
                    <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background:`${scoreColor}15`, color: scoreColor }}>{a.match}%</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Detail panel ── */}
        <div className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] flex flex-col sticky top-6 overflow-hidden"
          style={{ maxHeight:'calc(100vh - 120px)' }}>

          {selected ? (
            <>
              {/* Header */}
              <div className="px-6 pt-5 pb-4 shrink-0"
                style={{ background:'linear-gradient(160deg, #FFF7E6 0%, #F0EEFF 100%)', borderBottom:'1px solid rgba(13,24,61,0.07)' }}>
                <div className="flex items-start gap-4">
                  <GradientAvatar name={selected.name} size={52} radius="0.85rem"
                    className="ring-[3px] ring-white shadow shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-[15px] font-extrabold text-[#0D183D]">{selected.name}</p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${STATUS_CONFIG[statuses[selected.id]].bg} ${STATUS_CONFIG[statuses[selected.id]].color}`}>
                        {STATUS_CONFIG[statuses[selected.id]].label}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#4B6382] mb-2">{selected.field} · {selected.uni}</p>
                    <div className="flex items-center gap-3">
                      <MatchRing score={selected.match}/>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-[#4B6382]">Applied {selected.applied}</span>
                        <span className="text-[11px] text-[#4B6382] flex items-center gap-1">
                          <Clock size={10}/> {selected.weeklyHours}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                {scheduling ? (
                  <InterviewScheduler
                    applicant={selected}
                    onSchedule={handleSchedule}
                    onCancel={() => setScheduling(false)}
                  />
                ) : (
                  <>
                    {/* Bio */}
                    <p className="text-[12px] text-[#4B6382] leading-relaxed">{selected.bio}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-[11px]">
                      <span className="flex items-center gap-1.5 text-[#4B6382]"><MapPin size={11}/>{selected.location}</span>
                      <span className="flex items-center gap-1.5 text-[#4B6382]"><Globe size={11}/>{selected.languages.join(', ')}</span>
                    </div>

                    {/* Skills */}
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.skills.map(s => (
                          <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border"
                            style={{ background:'#F8F9FB', color:'#0D183D', borderColor:'rgba(13,24,61,0.09)' }}>{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="h-px" style={{ background:'rgba(13,24,61,0.07)' }}/>

                    {/* AI compatibility */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{ background:'#FFB703' }}>
                          <Sparkles size={11} strokeWidth={2.5} className="text-white"/>
                        </div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0D183D]">
                          AI compatibility
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {selected.matchReasons.map((r, i) => (
                          <motion.div key={i}
                            initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                            transition={{ delay: 0.05 + i*0.06 }}
                            className="flex items-start gap-2.5 rounded-xl p-3 text-[11px] text-[#4B6382] leading-relaxed"
                            style={{ background:'rgba(255,183,3,0.05)', border:'1px solid rgba(255,183,3,0.14)' }}>
                            <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color:'#FFB703' }}/>
                            {r}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Notable work */}
                    {selected.projects?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#4B6382] mb-2.5">Notable work</p>
                        <ul className="flex flex-col gap-2">
                          {selected.projects.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px] text-[#4B6382]">
                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background:'#FFB703' }}/>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer actions */}
              {!scheduling && (
                <div className="shrink-0 px-6 py-4 border-t flex flex-col gap-2"
                  style={{ borderColor:'rgba(13,24,61,0.08)', background:'#FAFAFA' }}>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStatus(selected.id, statuses[selected.id] === 'shortlisted' ? 'new' : 'shortlisted')}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90"
                      style={statuses[selected.id] === 'shortlisted'
                        ? { background:'rgba(255,183,3,0.12)', color:'#D99E00', border:'1.5px solid rgba(255,183,3,0.3)' }
                        : { background:'#FFB703', color:'white', boxShadow:'0 2px 10px rgba(255,183,3,0.28)' }}>
                      <Star size={12}/> {statuses[selected.id] === 'shortlisted' ? 'Shortlisted ✓' : 'Shortlist'}
                    </button>
                    <button
                      onClick={() => setScheduling(true)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                      style={{ background:'#0D183D' }}>
                      <Calendar size={12}/> Schedule
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate('/messages')}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold text-[#0D183D] border border-[rgba(13,24,61,0.1)] hover:bg-[rgba(13,24,61,0.03)] transition-colors">
                      <MessageCircle size={12}/> Message
                    </button>
                    <button
                      onClick={() => setStatus(selected.id, statuses[selected.id] === 'rejected' ? 'new' : 'rejected')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-colors ${
                        statuses[selected.id] === 'rejected'
                          ? 'text-[#4B6382] border border-[rgba(13,24,61,0.1)] hover:bg-[rgba(13,24,61,0.03)]'
                          : 'text-red-500 border border-red-100 hover:bg-red-50'
                      }`}>
                      <XCircle size={12}/> {statuses[selected.id] === 'rejected' ? 'Undo' : 'Pass'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background:'rgba(255,183,3,0.08)' }}>
                <Users size={22} style={{ color:'#FFB703' }}/>
              </div>
              <p className="text-[13px] font-bold text-[#0D183D] mb-1">Select an applicant</p>
              <p className="text-[12px] text-[#4B6382] max-w-[200px] leading-relaxed">
                Click any card to review their profile and AI compatibility
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:16, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:16, scale:0.96 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-[13px] font-semibold z-50 pointer-events-none"
            style={{ background:'#0D183D', boxShadow:'0 8px 24px rgba(13,24,61,0.3)' }}>
            <CheckCircle2 size={14}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
