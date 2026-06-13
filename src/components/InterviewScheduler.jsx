import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'

const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30']
const INTERVIEW_TYPES = [
  { id: 'video',  emoji: '🎥', label: 'Video'    },
  { id: 'phone',  emoji: '📞', label: 'Phone'    },
  { id: 'onsite', emoji: '🤝', label: 'In-person'},
]

export default function InterviewScheduler({ applicant, onSchedule, onCancel }) {
  const [date, setDate]      = useState('')
  const [time, setTime]      = useState('10:00')
  const [type, setType]      = useState('video')
  const [note, setNote]      = useState('')
  const [done, setDone]      = useState(false)
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
