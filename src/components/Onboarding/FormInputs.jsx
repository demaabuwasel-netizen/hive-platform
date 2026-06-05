export function FormField({ label, required = false, error = null, children, helper = null }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-[#0B163F] mb-2">
          {label}
          {required && <span className="text-[#FFB400] ml-1">*</span>}
        </label>
      )}
      {children}
      {helper && !error && (
        <p className="text-xs text-[#4E6385] mt-2 leading-relaxed">{helper}</p>
      )}
      {error && (
        <p className="text-xs text-[#FF4D4F] mt-2">{error}</p>
      )}
    </div>
  )
}

export function TextInput({ label, placeholder, value, onChange, required = false, error = null, helper = null, type = 'text' }) {
  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg border-2 transition-all font-medium text-[#0B163F] placeholder-[#4E6385]/40 focus:outline-none ${
          error
            ? 'border-[#FF4D4F] bg-[#FFF1F0]'
            : 'border-[#E6E8EF] bg-white hover:border-[#D4D8E0] focus:border-[#0B163F] focus:shadow-sm'
        }`}
      />
    </FormField>
  )
}

export function SelectInput({ label, placeholder, options = [], value, onChange, required = false, error = null, helper = null }) {
  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-lg border-2 transition-all font-medium text-[#0B163F] focus:outline-none ${
          error
            ? 'border-[#FF4D4F] bg-[#FFF1F0]'
            : 'border-[#E6E8EF] bg-white hover:border-[#D4D8E0] focus:border-[#0B163F] focus:shadow-sm'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </FormField>
  )
}

export function TextArea({ label, placeholder, value, onChange, required = false, error = null, helper = null, rows = 4 }) {
  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <textarea
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg border-2 transition-all font-medium text-[#0B163F] placeholder-[#4E6385]/40 focus:outline-none resize-none ${
          error
            ? 'border-[#FF4D4F] bg-[#FFF1F0]'
            : 'border-[#E6E8EF] bg-white hover:border-[#D4D8E0] focus:border-[#0B163F] focus:shadow-sm'
        }`}
      />
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
            <button
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
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[#0B163F] text-white shadow-md'
                  : 'bg-white border-2 border-[#E6E8EF] text-[#0B163F] hover:border-[#FFB400]'
              }`}
            >
              {opt.label || opt}
            </button>
          )
        })}
      </div>
    </FormField>
  )
}
