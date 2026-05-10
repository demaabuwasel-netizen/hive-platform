import { useState } from 'react'

export default function TagInput({ value = [], onChange, placeholder, color = 'navy' }) {
  const [input, setInput] = useState('')

  const tagClass =
    color === 'orange'
      ? 'bg-orange-50 text-orange-700 border border-orange-100'
      : 'bg-navy-50 text-navy-700 border border-navy-100'

  function commit() {
    const trimmed = input.trim().replace(/,+$/, '')
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function handleBlur() {
    if (input.trim()) commit()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const items = pasted.split(/[,\n]+/).map(s => s.trim()).filter(Boolean)
    const unique = items.filter(t => !value.includes(t))
    if (unique.length) onChange([...value, ...unique])
  }

  return (
    <div className="w-full min-h-[48px] bg-cream-50 border border-cream-300 rounded-2xl px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-navy-400 focus-within:border-transparent transition-all duration-200 cursor-text">
      {value.map(tag => (
        <span
          key={tag}
          className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${tagClass}`}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter(t => t !== tag))}
            className="opacity-50 hover:opacity-100 ml-0.5 leading-none text-base transition-opacity"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPaste={handlePaste}
        placeholder={value.length === 0 ? placeholder : 'Add another…'}
        className="bg-transparent outline-none text-[#0D183D] placeholder-navy-300 text-sm flex-1 min-w-[120px] py-1"
      />
    </div>
  )
}
