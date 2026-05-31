import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Zap, FileText, MessageSquare, Bookmark,
  MessageCircle, Settings, Briefcase, MapPin, Trash2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import GradientAvatar from '../components/GradientAvatar'

const STUDENT_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/dashboard/student' },
  { icon: Zap,             label: 'Matches',      to: '/matches'           },
  { icon: Briefcase,       label: 'Opportunities',to: '/opportunities'     },
  { icon: FileText,        label: 'Applications', to: '/applications'      },
  { icon: MessageSquare,   label: 'Interviews',   to: '/interviews'        },
  { icon: Bookmark,        label: 'Saved',        to: '/saved'             },
  { icon: MessageCircle,   label: 'Messages',     to: '/messages', badge:'3' },
  { icon: Settings,        label: 'Settings',     to: '/settings'          },
]

const SAVED_ITEMS = []

export default function Saved() {
  const [items, setItems] = useState(SAVED_ITEMS)
  const remove = id => setItems(p => p.filter(i => i.id !== id))

  return (
      <div className="max-w-4xl mx-auto px-8 py-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.15rem] font-extrabold text-[#0D183D]">Saved</h1>
            <p className="text-[13px] text-[#4B6382] mt-0.5">{items.length} saved opportunities</p>
          </div>
          <Link to="/opportunities"
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background:'#FFB703' }}>
            Browse more
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[rgba(13,24,61,0.08)] flex items-center justify-center mx-auto mb-4">
              <Bookmark size={22} className="text-[#4B6382]"/>
            </div>
            <p className="text-[14px] font-semibold text-[#0D183D] mb-1">No saved opportunities yet</p>
            <p className="text-[13px] text-[#4B6382]">Browse opportunities and save the ones you like</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, x:-10 }}
                transition={{ delay:i*0.07 }}
                className="bg-white rounded-2xl border border-[rgba(13,24,61,0.08)] p-5 flex flex-col gap-3 hover:shadow-[0_4px_20px_rgba(13,24,61,0.07)] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <GradientAvatar name={item.ngo} size={40} radius="0.65rem"/>
                    <div>
                      <p className="text-[13px] font-bold text-[#0D183D] leading-snug">{item.ngo}</p>
                      <p className="text-[11px] text-[#4B6382]">{item.cat} · <span className="inline-flex items-center gap-0.5"><MapPin size={9}/>{item.loc}</span></p>
                    </div>
                  </div>
                  <button onClick={() => remove(item.id)}
                    className="p-1.5 rounded-lg text-[#4B6382] hover:text-red-400 hover:bg-red-50 transition-all">
                    <Trash2 size={13}/>
                  </button>
                </div>

                <span className="self-start text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">{item.match}% match</span>

                <p className="text-[12px] text-[#4B6382] leading-relaxed flex-1">{item.desc}</p>

                <div className="flex flex-wrap gap-1.5">
                  {item.skills.map(s => (
                    <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-[rgba(13,24,61,0.08)]"
                      style={{ background:'#F8F9FB', color:'#4B6382' }}>{s}</span>
                  ))}
                </div>

                <Link to="/opportunities"
                  className="flex items-center justify-center py-2 rounded-xl text-[12px] font-semibold text-white mt-1 transition-all hover:opacity-90"
                  style={{ background:'#0D183D' }}>
                  Apply now
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
  )
}
