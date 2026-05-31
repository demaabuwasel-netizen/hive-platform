import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'

/**
 * TopicPicker — multi-select autocomplete for causes / interest tags.
 *
 * Props:
 *   value       string[]        controlled list of selected topics
 *   onChange    (string[]) => void
 *   options     string[]        suggestion list
 *   placeholder string
 */
export default function TopicPicker({
  value       = [],
  onChange,
  options     = [],
  placeholder = 'Search topics…',
}) {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  // Close on outside click
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const trimmed  = query.trim()
  const filtered = options
    .filter(o => !value.includes(o) && o.toLowerCase().includes(trimmed.toLowerCase()))
    .slice(0, 10)

  const hasExact   = options.some(o => o.toLowerCase() === trimmed.toLowerCase())
  const showCustom = trimmed.length > 0 && !hasExact && !value.includes(trimmed)
  const showDropdown = open && (filtered.length > 0 || showCustom)

  function add(topic) {
    if (!value.includes(topic)) onChange([...value, topic])
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function remove(topic) {
    onChange(value.filter(t => t !== topic))
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-3">

      {/* ── Selected chips ── */}
      <AnimatePresence initial={false}>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2">
            {value.map(topic => (
              <motion.span
                key={topic}
                layout
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.82 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-[12px] font-semibold"
                style={{
                  background:  'rgba(255,183,3,0.10)',
                  color:       '#92610a',
                  border:      '1.5px solid rgba(255,183,3,0.30)',
                }}>
                {topic}
                <button
                  type="button"
                  onClick={() => remove(topic)}
                  aria-label={`Remove ${topic}`}
                  className="w-4 h-4 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-[rgba(146,97,10,0.12)] transition-all ml-0.5">
                  <X size={9} />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search input ── */}
      <div className="relative">
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all"
          style={{
            background: 'white',
            border:     `1.5px solid ${focused ? '#FFB703' : 'rgba(13,24,61,0.1)'}`,
            boxShadow:  focused ? '0 0 0 3px rgba(255,183,3,0.1)' : 'none',
          }}>
          <Search size={13} className="shrink-0" style={{ color: '#4B6382' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => { setFocused(true); setOpen(true) }}
            onBlur={() => setFocused(false)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setOpen(false); setQuery('') }
              if (e.key === 'Enter') {
                e.preventDefault()
                if (filtered[0]) add(filtered[0])
                else if (showCustom) add(trimmed)
              }
              if (e.key === 'Backspace' && !query && value.length) {
                remove(value[value.length - 1])
              }
            }}
            placeholder={value.length ? 'Add another topic…' : placeholder}
            autoComplete="off"
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

        {/* ── Dropdown ── */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.11 }}
              className="absolute top-full left-0 right-0 z-30 mt-1.5 rounded-2xl overflow-y-auto"
              style={{
                background: 'white',
                border:     '1.5px solid rgba(13,24,61,0.09)',
                boxShadow:  '0 12px 40px rgba(13,24,61,0.12)',
                maxHeight:  220,
              }}>
              {filtered.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => add(opt)}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[rgba(13,24,61,0.04)] transition-colors"
                  style={{
                    color:     '#0D183D',
                    borderTop: i > 0 ? '1px solid rgba(13,24,61,0.04)' : 'none',
                  }}>
                  {opt}
                </button>
              ))}
              {showCustom && (
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => add(trimmed)}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[rgba(13,24,61,0.04)] transition-colors"
                  style={{
                    color:     '#4B6382',
                    borderTop: '1px solid rgba(13,24,61,0.07)',
                  }}>
                  Add "
                  <span className="font-semibold" style={{ color: '#0D183D' }}>{trimmed}</span>
                  "
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
