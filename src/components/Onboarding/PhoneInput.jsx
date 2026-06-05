import { useState } from 'react'
import { FormField } from './FormInputs'
import { Phone } from 'lucide-react'

const COUNTRY_CODES = [
  { country: 'Israel', code: '+972', format: 'XX XXXX XXX' },
  { country: 'United States', code: '+1', format: 'XXX XXX XXXX' },
  { country: 'United Kingdom', code: '+44', format: 'XXXX XXXXXX' },
  { country: 'Germany', code: '+49', format: 'XXX XXXXXXXX' },
  { country: 'France', code: '+33', format: 'X XX XX XX XX' },
  { country: 'Canada', code: '+1', format: 'XXX XXX XXXX' },
  { country: 'Australia', code: '+61', format: 'X XXXX XXXX' },
  { country: 'India', code: '+91', format: 'XXXXX XXXXX' },
]

const FORMATTING_RULES = {
  '+972': (num) => {
    const digits = num.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 9)}`
  },
  '+1': (num) => {
    const digits = num.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
  },
}

export default function PhoneInput({ label, value = '', onChange, required = false, error = null, helper = null }) {
  const [countryCode, setCountryCode] = useState('+972')

  const handlePhoneChange = (newValue) => {
    const formatter = FORMATTING_RULES[countryCode] || ((num) => num.replace(/\D/g, ''))
    const formatted = formatter(newValue)
    onChange(formatted)
  }

  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <div className="flex gap-3">
        {/* Country code selector */}
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="px-3 py-3.5 rounded-[16px] border-2 border-[#E6E8EF] bg-white font-semibold text-[#0B163F] focus:outline-none focus:border-[#0B163F] focus:shadow-sm transition-all min-w-[110px]"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code + c.country} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>

        {/* Phone number input */}
        <input
          type="tel"
          value={value}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="XX XXXX XXX"
          className={`flex-1 px-4 py-3.5 rounded-[16px] border-2 transition-all font-medium text-[#0B163F] placeholder-[#9CA3AF] focus:outline-none ${
            error
              ? 'border-[#FF4D4F] bg-[#FFF1F0] focus:border-[#FF4D4F]'
              : 'border-[#E6E8EF] bg-white hover:border-[#D4D8E0] focus:border-[#0B163F] focus:shadow-sm focus:shadow-[rgba(11,22,63,0.08)]'
          }`}
        />
      </div>
      {!error && (
        <p className="text-xs text-[#4E6385] mt-2">
          Phone format adapts to the selected country.
        </p>
      )}
    </FormField>
  )
}
