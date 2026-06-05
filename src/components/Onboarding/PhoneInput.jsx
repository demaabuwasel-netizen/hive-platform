import { useState } from 'react'
import { FormField } from './FormInputs'
import SearchableSelect from './SearchableSelect'
import { COUNTRIES, PHONE_FORMATS, formatPhoneNumber } from '../../utils/countries'

export default function PhoneInput({ label, value = '', onChange, required = false, error = null, helper = null }) {
  const [countryCode, setCountryCode] = useState('+972')

  const handlePhoneChange = (newValue) => {
    const formatted = formatPhoneNumber(newValue, countryCode)
    onChange(formatted)
  }

  const countryCodeOptions = COUNTRIES.map(country => ({
    value: country.code,
    label: country.name,
    code: country.code,
  }))

  const getPlaceholder = () => {
    const format = PHONE_FORMATS[countryCode]
    return format?.placeholder || 'Enter phone number'
  }

  return (
    <div className="flex gap-4">
      <div className="w-32">
        <SearchableSelect
          label=""
          placeholder="Code"
          options={countryCodeOptions}
          value={countryCode}
          onChange={setCountryCode}
          formatOption={(opt) => `${opt.label} (${opt.code})`}
          searchFields={['label', 'code']}
        />
      </div>

      <FormField label={label} required={required} error={error} helper={helper} className="flex-1">
        <input
          type="tel"
          value={value}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={getPlaceholder()}
          className={`w-full px-4 py-3 rounded-[16px] border-2 transition-all font-medium text-sm text-[#0B163F] placeholder-[#9CA3AF] focus:outline-none ${
            error
              ? 'border-[#FF4D4F] bg-[#FFF1F0] focus:border-[#FF4D4F]'
              : 'border-[#E6E8EF] bg-white hover:border-[#D4D8E0] focus:border-[#0B163F] focus:shadow-sm focus:shadow-[rgba(11,22,63,0.08)]'
          }`}
        />
      </FormField>
    </div>
  )
}
