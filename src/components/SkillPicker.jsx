import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { SKILL_CATS, ALL_SKILLS, groupSkills } from '../data/skills'

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
  extraSkills  = [],
}) {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [customMode, setCustomMode] = useState(false)
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
        setCustomMode(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const selectedNames = value.map(s => s.name)
  const extraPool = Array.from(new Set(
    (Array.isArray(extraSkills) ? extraSkills : [])
      .map(s => typeof s === 'string' ? s : s?.name)
      .filter(Boolean)
  ))

  // Filter by query, exclude already-selected
  const pool = Array.from(new Set([...ALL_SKILLS, ...extraPool]))
  const matched = pool.filter(
    s => !selectedNames.includes(s) && s.toLowerCase().includes(query.toLowerCase())
  )

  // Group matches by category (only non-empty groups)
  const groups = SKILL_CATS
    .map(cat => ({ cat, items: cat.items.filter(s => matched.includes(s)) }))
    .filter(g => g.items.length > 0)

  const customMatches = matched.filter(skill => !ALL_SKILLS.includes(skill))
  if (customMatches.length) {
    groups.push({ cat: { cat: 'Other', color: '#6B7280', bg: 'rgba(107,114,128,0.09)' }, items: customMatches })
  }

  const trimmed        = query.trim()
  const hasExactMatch  = pool.some(s => s.toLowerCase() === trimmed.toLowerCase())
  const showCustom     = trimmed.length > 0 && (customMode || !hasExactMatch) && !selectedNames.includes(trimmed)
  const visibleGroups  = customMode ? [] : groups

  // Which skill is currently waiting for a level (pending new, or editing existing)
  const activeName = pending ?? editing?.name

  // ── Actions ────────────────────────────────────────────────────────────────

  function selectSkill(name) {
    setQuery('')
    setOpen(false)
    setCustomMode(false)
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
    setCustomMode(false)
  }

  function startCustomSkill() {
    setCustomMode(true)
    setQuery('')
    setOpen(true)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={wrapRef} className="flex flex-col gap-3">

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
            <div
              className="rounded-[18px] px-3.5 py-3 sm:px-4"
              style={{
                background: '#FBFCFE',
                border: '1px solid rgba(125,153,190,0.16)',
              }}>
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-[#687386]">
                  {levelLabel} for{' '}
                  <span className="font-semibold" style={{ color: '#202124' }}>{activeName}</span>
                </p>
                {/* Allow cancelling without picking a level */}
                <button
                  type="button"
                  onClick={() => { setPending(null); setEditing(null) }}
                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#8A93A6] transition-colors hover:bg-white hover:text-[#202124]">
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {LEVELS.map(lvl => (
                  <button
                    key={lvl.label}
                    type="button"
                    onClick={() => confirmLevel(activeName, lvl.label)}
                    className="rounded-full border bg-white px-3 py-1.5 text-[11px] font-semibold text-[#4B5563] transition-colors hover:bg-[#F4F7FC] hover:text-[#202124] active:scale-[0.98]"
                    style={{
                      borderColor: 'rgba(125,153,190,0.18)',
                    }}>
                    {lvl.label}
                  </button>
                ))}
              </div>
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
                if (e.key === 'Escape') { setOpen(false); setQuery(''); setCustomMode(false) }
                // Backspace on empty query removes the last chip
                if (e.key === 'Backspace' && !query && value.length) {
                  remove(value[value.length - 1].name)
                }
                // Enter selects the first suggestion (or custom if no suggestions)
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (visibleGroups[0]?.items[0]) selectSkill(visibleGroups[0].items[0])
                  else if (showCustom) selectSkill(trimmed)
                }
              }}
              placeholder={customMode ? 'Type a custom skill…' : (value.length ? 'Add another skill…' : placeholder)}
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: '#0D183D' }}
            />
            {query && (
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setQuery(''); setOpen(false); setCustomMode(false) }}
                className="shrink-0 opacity-40 hover:opacity-80 transition-opacity">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {open && (visibleGroups.length > 0 || showCustom || !customMode) && (
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

                {visibleGroups.map(({ cat, items }) => (
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

                {!customMode && (
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={startCustomSkill}
                    className="w-full text-left px-4 py-3 text-[13px] font-semibold transition-colors hover:bg-[rgba(13,24,61,0.04)]"
                    style={{
                      color:       '#4B6382',
                      borderTop:   visibleGroups.length ? '1px solid rgba(13,24,61,0.06)' : 'none',
                    }}>
                    Other (type custom skill)
                  </button>
                )}

                {showCustom && (
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => selectSkill(trimmed)}
                    className="w-full text-left px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[rgba(13,24,61,0.04)]"
                    style={{
                      color:       '#4B6382',
                      borderTop:   (visibleGroups.length || !customMode) ? '1px solid rgba(13,24,61,0.06)' : 'none',
                    }}>
                  Other: "<span className="font-semibold" style={{ color: '#0D183D' }}>{trimmed}</span>"
                </button>
              )}
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Selected skill summary ── */}
      <AnimatePresence initial={false}>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="rounded-[18px] border bg-[#FBFCFE] px-4 py-3"
            style={{ borderColor: 'rgba(125,153,190,0.16)' }}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A93A6]">
                Selected skills
              </p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A93A6]">
                {value.length}
              </span>
            </div>

            <div className="divide-y divide-[rgba(125,153,190,0.12)]">
              {groupSkills(value).map(({ cat, items }) => (
                <div key={cat.cat} className="grid gap-2 py-2.5 sm:grid-cols-[118px_1fr] sm:items-start">
                  <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A93A6]">
                    {cat.cat}
                  </p>

                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {items.map(skill => {
                      const isEditing = editing?.name === skill.name
                      return (
                        <motion.span
                          key={skill.name}
                          layout
                          initial={{ opacity: 0, y: -3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          className="inline-flex min-w-0 items-center gap-1.5 rounded-full border bg-white px-2.5 py-1.5"
                          style={{
                            borderColor: isEditing ? 'rgba(13,24,61,0.22)' : 'rgba(125,153,190,0.16)',
                            boxShadow: isEditing ? '0 0 0 3px rgba(13,24,61,0.04)' : 'none',
                          }}>
                          <button
                            type="button"
                            onClick={() => startEdit(skill)}
                            className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#4B6382] transition-colors hover:text-[#202124]">
                            <span className="max-w-[9rem] truncate font-semibold">
                              {skill.name}
                            </span>
                            <span className="text-[#C7CFDD]">/</span>
                            <span className="text-[10px] text-[#6B7280]">
                              {skill.level || 'Level'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); remove(skill.name) }}
                            aria-label={`Remove ${skill.name}`}
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[#B8C0CC] transition-all hover:bg-[rgba(13,24,61,0.06)] hover:text-[#202124]">
                            <X size={8} />
                          </button>
                        </motion.span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
