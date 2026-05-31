import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { SKILL_CATS, ALL_SKILLS, getSkillCat } from '../data/skills'

// {label, color, bg} — used for chip display and level buttons
const LEVELS = [
  { label: 'Beginner',     color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
  { label: 'Intermediate', color: '#3B82F6', bg: 'rgba(59,130,246,0.10)'  },
  { label: 'Advanced',     color: '#D99E00', bg: 'rgba(217,158,0,0.10)'   },
  { label: 'Expert',       color: '#059669', bg: 'rgba(5,150,105,0.10)'   },
]

// Public export so callers (e.g. match scoring) can reference the same set
export { LEVELS as SKILL_LEVELS }

/**
 * SkillPicker
 *
 * Props:
 *   value       {name: string, level: string}[]   controlled list of skills
 *   onChange    (newValue) => void
 *   placeholder string
 *   levelLabel  string — shown in level-picker prompt:
 *                 "Your proficiency" (students) | "Minimum level required" (NGOs)
 */
export default function SkillPicker({
  value       = [],
  onChange,
  placeholder = 'Search skills…',
  levelLabel  = 'Your proficiency',
}) {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [pending, setPending] = useState(null)   // skill name waiting for level
  const [editing, setEditing] = useState(null)   // {name,level} chip being re-leveled
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  // Close on outside click
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setPending(null)
        setEditing(null)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const selectedNames = value.map(s => s.name)

  // Filter by query, exclude already-selected
  const matched = ALL_SKILLS.filter(
    s => !selectedNames.includes(s) && s.toLowerCase().includes(query.toLowerCase())
  )

  // Group matches by category (only non-empty groups)
  const groups = SKILL_CATS
    .map(cat => ({ cat, items: cat.items.filter(s => matched.includes(s)) }))
    .filter(g => g.items.length > 0)

  const trimmed        = query.trim()
  const hasExactMatch  = ALL_SKILLS.some(s => s.toLowerCase() === trimmed.toLowerCase())
  const showCustom     = trimmed.length > 0 && !hasExactMatch && !selectedNames.includes(trimmed)

  // Which skill is currently waiting for a level (pending new, or editing existing)
  const activeName = pending ?? editing?.name

  // ── Actions ────────────────────────────────────────────────────────────────

  function selectSkill(name) {
    setQuery('')
    setOpen(false)
    setPending(name)
    setEditing(null)
    inputRef.current?.focus()
  }

  function confirmLevel(name, level) {
    if (editing) {
      onChange(value.map(s => s.name === name ? { name, level } : s))
      setEditing(null)
    } else {
      onChange([...value, { name, level }])
      setPending(null)
    }
    inputRef.current?.focus()
  }

  function remove(name) {
    onChange(value.filter(s => s.name !== name))
    if (editing?.name === name) setEditing(null)
  }

  function startEdit(skill) {
    setEditing(skill)
    setPending(null)
    setOpen(false)
    setQuery('')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={wrapRef} className="flex flex-col gap-3">

      {/* ── Selected skill chips ── */}
      <AnimatePresence initial={false}>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2">
            {value.map(skill => {
              const cat       = getSkillCat(skill.name)
              const lvl       = LEVELS.find(l => l.label === skill.level)
              const isEditing = editing?.name === skill.name
              return (
                <motion.span
                  key={skill.name}
                  layout
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-[12px] font-semibold select-none"
                  style={{
                    background:   isEditing ? 'rgba(255,183,3,0.12)' : (cat?.bg  ?? 'rgba(107,114,128,0.09)'),
                    color:        isEditing ? '#D99E00'               : (cat?.color ?? '#6B7280'),
                    border:       `1.5px solid ${isEditing ? 'rgba(255,183,3,0.4)' : `${cat?.color ?? '#6B7280'}30`}`,
                  }}>
                  <span>{skill.name}</span>

                  {/* Level badge — click to re-pick level */}
                  {skill.level ? (
                    <>
                      <span className="opacity-35">·</span>
                      <button
                        type="button"
                        onClick={() => startEdit(skill)}
                        title="Click to change level"
                        className="text-[10px] font-medium opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ color: isEditing ? '#D99E00' : (lvl?.color ?? 'inherit') }}>
                        {skill.level}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(skill)}
                      className="text-[10px] font-medium opacity-40 hover:opacity-80 transition-opacity">
                      + level
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => remove(skill.name)}
                    aria-label={`Remove ${skill.name}`}
                    className="w-4 h-4 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-black/10 transition-all ml-0.5">
                    <X size={9} />
                  </button>
                </motion.span>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Level picker (shown while a skill is pending or being edited) ── */}
      <AnimatePresence>
        {activeName && (
          <motion.div
            key={activeName}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden">
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(255,183,3,0.05)', border: '1.5px solid rgba(255,183,3,0.22)' }}>
              <p className="text-[12px] font-bold text-[#0D183D] mb-3">
                {levelLabel} in{' '}
                <span style={{ color: '#FFB703' }}>{activeName}</span>:
              </p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(lvl => (
                  <button
                    key={lvl.label}
                    type="button"
                    onClick={() => confirmLevel(activeName, lvl.label)}
                    className="px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]"
                    style={{
                      background:  lvl.bg,
                      borderColor: `${lvl.color}40`,
                      color:       lvl.color,
                    }}>
                    {lvl.label}
                  </button>
                ))}
              </div>
              {/* Allow cancelling without picking a level */}
              <button
                type="button"
                onClick={() => { setPending(null); setEditing(null) }}
                className="mt-3 text-[11px] text-[#4B6382] hover:text-[#0D183D] transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search input + autocomplete dropdown ── */}
      {!activeName && (
        <div className="relative">
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all"
            style={{
              background:  'white',
              border:      `1.5px solid ${open ? '#FFB703' : 'rgba(13,24,61,0.1)'}`,
              boxShadow:   open ? '0 0 0 3px rgba(255,183,3,0.1)' : 'none',
            }}>
            <Search size={13} className="shrink-0" style={{ color: '#4B6382' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setOpen(false); setQuery('') }
                // Backspace on empty query removes the last chip
                if (e.key === 'Backspace' && !query && value.length) {
                  remove(value[value.length - 1].name)
                }
                // Enter selects the first suggestion (or custom if no suggestions)
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (groups[0]?.items[0]) selectSkill(groups[0].items[0])
                  else if (showCustom) selectSkill(trimmed)
                }
              }}
              placeholder={value.length ? 'Add another skill…' : placeholder}
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: '#0D183D' }}
            />
            {query && (
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setQuery(''); setOpen(false) }}
                className="shrink-0 opacity-40 hover:opacity-80 transition-opacity">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {open && (groups.length > 0 || showCustom) && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.11 }}
                className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-2xl overflow-hidden overflow-y-auto"
                style={{
                  background:  'white',
                  border:      '1.5px solid rgba(13,24,61,0.09)',
                  boxShadow:   '0 12px 40px rgba(13,24,61,0.13)',
                  maxHeight:   264,
                }}>

                {groups.map(({ cat, items }) => (
                  <div key={cat.cat}>
                    <p className="px-4 pt-3 pb-1 text-[9px] font-extrabold uppercase tracking-widest"
                      style={{ color: cat.color }}>
                      {cat.cat}
                    </p>
                    {items.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => selectSkill(skill)}
                        className="w-full text-left px-4 py-2 text-[13px] font-medium transition-colors hover:bg-[rgba(13,24,61,0.04)]"
                        style={{ color: '#0D183D' }}>
                        {/* Highlight matching portion */}
                        {query
                          ? highlightMatch(skill, query)
                          : skill}
                      </button>
                    ))}
                  </div>
                ))}

                {showCustom && (
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => selectSkill(trimmed)}
                    className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[rgba(13,24,61,0.04)]"
                    style={{
                      color:       '#4B6382',
                      borderTop:   groups.length ? '1px solid rgba(13,24,61,0.06)' : 'none',
                    }}>
                    Add "<span className="font-semibold" style={{ color: '#0D183D' }}>{trimmed}</span>"
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// Wrap the matched substring in a bold span
function highlightMatch(skill, query) {
  const idx = skill.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return skill
  return (
    <>
      {skill.slice(0, idx)}
      <strong style={{ color: '#FFB703' }}>{skill.slice(idx, idx + query.length)}</strong>
      {skill.slice(idx + query.length)}
    </>
  )
}
