import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera } from 'lucide-react'

function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?'
}

const INIT_COLORS = [
  'bg-rose-100', 'bg-blue-100', 'bg-emerald-100',
  'bg-purple-100', 'bg-amber-100', 'bg-pink-100',
  'bg-cyan-100', 'bg-stone-100', 'bg-slate-100', 'bg-red-100',
]
function initialsColor(name = '') {
  const n = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return INIT_COLORS[n % INIT_COLORS.length]
}

// Resize an image file to max 240px, returns base64 JPEG
function resizeImage(file) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 240
      const ratio = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

// ── AvatarDisplay ─────────────────────────────────────────────────────────────
// Renders a profile image (URL or base64) or falls back to coloured initials.

const SIZE = {
  xs: 'w-8  h-8  text-xs  rounded-xl',
  sm: 'w-10 h-10 text-sm  rounded-xl',
  md: 'w-14 h-14 text-base rounded-2xl',
  lg: 'w-20 h-20 text-xl  rounded-2xl',
  xl: 'w-24 h-24 text-2xl rounded-2xl',
}

export function AvatarDisplay({ src, name = '', size = 'md', className = '' }) {
  const [error, setError] = useState(false)
  const cls = `${SIZE[size] ?? SIZE.md} object-cover bg-cream-200 shrink-0 ${className}`

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cls}
        onError={() => setError(true)}
      />
    )
  }

  return (
    <div className={`${SIZE[size] ?? SIZE.md} ${initialsColor(name)} flex items-center justify-center shrink-0 ${className}`}>
      <span className="text-[#4B6382] font-bold leading-none select-none">{getInitials(name)}</span>
    </div>
  )
}

// ── AvatarPicker ──────────────────────────────────────────────────────────────
// Upload-only picker: shows initials placeholder when no photo, file upload button.

export function AvatarPicker({ value, onChange, name = '' }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const resized = await resizeImage(file)
    if (resized) onChange(resized)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-5">
      {/* Photo preview / initials placeholder */}
      <motion.div
        key={value || 'placeholder'}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative shrink-0 cursor-pointer group"
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
        aria-label="Upload profile photo"
      >
        <AvatarDisplay src={value} name={name} size="lg" />
        {/* Hover overlay with camera icon */}
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: 'rgba(13,24,61,0.38)' }}>
          <Camera size={18} className="text-white" />
        </div>
      </motion.div>

      {/* Text + upload button */}
      <div className="flex flex-col gap-2.5 flex-1">
        <div>
          <p className="text-sm font-semibold text-[#0D183D] leading-snug">Profile photo</p>
          <p className="text-xs text-[#4B6382] mt-0.5">
            {value ? 'Looking good! You can replace it anytime.' : 'Optional — your initials are shown if you skip.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
          style={{ background: uploading ? 'rgba(13,24,61,0.06)' : 'rgba(13,24,61,0.07)', color: '#0D183D', border: '1px solid rgba(13,24,61,0.1)' }}
        >
          <Upload size={13} aria-hidden="true" />
          {uploading ? 'Processing…' : value ? 'Change photo' : 'Upload a photo'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-[#4B6382] hover:text-red-400 transition-colors self-start"
          >
            Remove photo
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-label="Upload profile photo"
      />
    </div>
  )
}
