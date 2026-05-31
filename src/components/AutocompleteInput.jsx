import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AutocompleteInput — controlled text input with suggestion dropdown.
 *
 * Props:
 *   value      string          controlled value
 *   onChange   (string) => void
 *   options    string[]        suggestion list
 *   placeholder string
 *   error      boolean         shows red border / background
 */
export default function AutocompleteInput({
  value       = '',
  onChange,
  options     = [],
  placeholder = '',
  error       = false,
}) {
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const trimmed  = value.trim()
  const filtered = trimmed
    ? options.filter(o => o.toLowerCase().includes(trimmed.toLowerCase())).slice(0, 9)
    : options.slice(0, 9)

  const hasExact  = options.some(o => o.toLowerCase() === trimmed.toLowerCase())
  const showCustom = trimmed.length > 0 && !hasExact

  function select(val) {
    onChange(val)
    setOpen(false)
    setFocused(false)
  }

  const border = error
    ? '1.5px solid #EF4444'
    : focused
    ? '1.5px solid #FFB703'
    : '1.5px solid rgba(13,24,61,0.1)'

  const showDropdown = open && (filtered.length > 0 || showCustom)

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => { setFocused(true); setOpen(true) }}
        onBlur={() => setFocused(false)}
        onKeyDown={e => {
          if (e.key === 'Escape') setOpen(false)
          if (e.key === 'Enter' && open) {
            e.preventDefault()
            if (filtered[0]) select(filtered[0])
            else if (showCustom) select(trimmed)
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all placeholder-[#4B6382]/40"
        style={{
          background: error ? '#FEF2F2' : 'white',
          color:      '#0D183D',
          border,
          boxShadow: focused && !error ? '0 0 0 3px rgba(255,183,3,0.1)' : 'none',
        }}
      />

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.11 }}
            className="absolute top-full left-0 right-0 z-30 mt-1.5 rounded-2xl overflow-y-auto"
            style={{
              background:  'white',
              border:      '1.5px solid rgba(13,24,61,0.09)',
              boxShadow:   '0 12px 40px rgba(13,24,61,0.12)',
              maxHeight:   220,
            }}>
            {filtered.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onMouseDown={e => { e.preventDefault(); select(opt) }}
                className="w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[rgba(13,24,61,0.04)] transition-colors"
                style={{
                  color:      '#0D183D',
                  borderTop:  i > 0 ? '1px solid rgba(13,24,61,0.04)' : 'none',
                }}>
                {opt}
              </button>
            ))}

            {showCustom && (
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); select(trimmed) }}
                className="w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[rgba(13,24,61,0.04)] transition-colors"
                style={{
                  color:      '#4B6382',
                  borderTop:  '1px solid rgba(13,24,61,0.07)',
                }}>
                Use "
                <span className="font-semibold" style={{ color: '#0D183D' }}>{trimmed}</span>
                "
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
