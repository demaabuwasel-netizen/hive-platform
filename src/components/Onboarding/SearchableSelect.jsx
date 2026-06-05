import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, X } from 'lucide-react'
import { FormField } from './FormInputs'

export default function SearchableSelect({
  label,
  placeholder,
  options = [],
  value,
  onChange,
  required = false,
  error = null,
  helper = null,
  formatOption = (opt) => opt.label || opt,
  searchFields = ['label'],
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const filteredOptions = options.filter(opt => {
    const searchLower = searchTerm.toLowerCase()
    return searchFields.some(field => {
      const fieldValue = opt[field]?.toString().toLowerCase() || ''
      return fieldValue.includes(searchLower)
    })
  })

  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption ? formatOption(selectedOption) : ''

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-[#0B163F] mb-2">
          {label}
          {required && <span className="text-[#FFB400] ml-1">*</span>}
        </label>
      )}
      <div className="relative" ref={containerRef}>
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-2 rounded-[16px] border-2 transition-all font-medium text-sm text-[#0B163F] text-left flex items-center justify-between ${
            error
              ? 'border-[#FF4D4F] bg-[#FFF1F0] focus:border-[#FF4D4F]'
              : 'border-[#E6E8EF] bg-white hover:border-[#D4D8E0] focus:border-[#0B163F]'
          }`}
        >
          <span className={displayValue ? 'text-[#0B163F]' : 'text-[#9CA3AF]'}>
            {displayValue || placeholder}
          </span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-[#9CA3AF]" strokeWidth={1.5} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-[#E6E8EF] rounded-2xl shadow-lg"
            >
              {/* Search input */}
              <div className="sticky top-0 p-3 border-b border-[#E6E8EF] bg-white rounded-t-2xl">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.5} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 rounded-[12px] border border-[#E6E8EF] bg-[#F9FAFB] text-xs text-[#0B163F] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0B163F] focus:bg-white transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0B163F]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Options list */}
              <div className="max-h-[320px] overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  <div className="py-2">
                    {filteredOptions.map((option, idx) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          onChange(option.value)
                          setIsOpen(false)
                          setSearchTerm('')
                        }}
                        whileHover={{ backgroundColor: '#F9FAFB' }}
                        className={`w-full px-4 py-2.5 text-left transition-all text-xs font-medium ${
                          value === option.value
                            ? 'bg-[#FFB400]/10 text-[#0B163F] border-l-2 border-[#FFB400]'
                            : 'text-[#4E6385] hover:text-[#0B163F]'
                        }`}
                      >
                        {formatOption(option)}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-xs text-[#9CA3AF]">
                    No options found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <p className="text-[10px] text-[#FF4D4F] mt-1.5 font-medium">{error}</p>
      )}
      {helper && !error && (
        <p className="text-[10px] text-[#4E6385] mt-1.5 leading-relaxed">{helper}</p>
      )}
    </div>
  )
}
