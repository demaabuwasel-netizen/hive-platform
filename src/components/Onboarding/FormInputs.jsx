import { motion } from 'framer-motion'

export function FormField({ label, required = false, error = null, children, helper = null }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-[#202124] mb-2">
          {label}
          {required && <span className="text-[#1A73E8] ml-1">*</span>}
        </label>
      )}
      {children}
      {helper && !error && (
        <p className="text-[10px] text-[#5F6368] mt-1.5 leading-relaxed">{helper}</p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-[#FF4D4F] mt-1.5 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

export function TextInput({ label, placeholder, value, onChange, required = false, error = null, helper = null, type = 'text', icon: Icon = null }) {
  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
            <Icon size={18} strokeWidth={1.5} />
          </div>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-[16px] border-2 transition-all font-medium text-sm text-[#202124] placeholder-[#9CA3AF] focus:outline-none ${
            Icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-[#FF4D4F] bg-[#FFF1F0] focus:border-[#FF4D4F] focus:shadow-sm'
              : 'border-[#DADCE0] bg-white hover:border-[#D4D8E0] focus:border-[#1A73E8] focus:shadow-sm focus:shadow-[rgba(26,115,232,0.12)]'
          }`}
        />
      </div>
    </FormField>
  )
}

export function SelectInput({ label, placeholder, options = [], value, onChange, required = false, error = null, helper = null, icon: Icon = null }) {
  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF] z-10">
            <Icon size={18} strokeWidth={1.5} />
          </div>
        )}
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 rounded-[16px] border-2 transition-all font-medium text-sm text-[#202124] focus:outline-none appearance-none ${
            Icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-[#FF4D4F] bg-[#FFF1F0] focus:border-[#FF4D4F]'
              : 'border-[#DADCE0] bg-white hover:border-[#D4D8E0] focus:border-[#1A73E8] focus:shadow-sm focus:shadow-[rgba(26,115,232,0.12)]'
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      </div>
    </FormField>
  )
}

export function TextArea({ label, placeholder, value, onChange, required = false, error = null, helper = null, rows = 4, icon: Icon = null }) {
  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-4 pointer-events-none text-[#9CA3AF]">
            <Icon size={18} strokeWidth={1.5} />
          </div>
        )}
        <textarea
          rows={rows}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-[16px] border-2 transition-all font-medium text-sm text-[#202124] placeholder-[#9CA3AF] focus:outline-none resize-none ${
            Icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-[#FF4D4F] bg-[#FFF1F0] focus:border-[#FF4D4F]'
              : 'border-[#DADCE0] bg-white hover:border-[#D4D8E0] focus:border-[#1A73E8] focus:shadow-sm focus:shadow-[rgba(26,115,232,0.12)]'
          }`}
        />
      </div>
    </FormField>
  )
}

export function ChipSelector({ label, options = [], value = [], onChange, required = false, error = null, multi = true }) {
  return (
    <FormField label={label} required={required} error={error}>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const isSelected = Array.isArray(value) ? value.includes(opt.value || opt) : value === (opt.value || opt)
          return (
            <motion.button
              key={opt.value || opt}
              type="button"
              onClick={() => {
                if (multi) {
                  if (isSelected) {
                    onChange(value.filter(v => v !== (opt.value || opt)))
                  } else {
                    onChange([...value, opt.value || opt])
                  }
                } else {
                  onChange(isSelected ? null : opt.value || opt)
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#1A73E8] text-white shadow-md'
                  : 'bg-white border-2 border-[#DADCE0] text-[#202124] hover:border-[#1A73E8] hover:shadow-sm'
              }`}
            >
              {opt.label || opt}
            </motion.button>
          )
        })}
      </div>
    </FormField>
  )
}

export function CharacterCounter({ current = 0, max = 500 }) {
  return (
    <p className="text-xs text-[#9CA3AF]">
      {current} / {max}
    </p>
  )
}
