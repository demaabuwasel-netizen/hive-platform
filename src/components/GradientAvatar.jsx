// Soft pastel gradients, each paired with a deeper ink color in the same hue
// for legible initials — no bright/saturated backgrounds.
const GRADS = [
  { from: '#E4DEFB', to: '#D6CCFA', text: '#6449C7' }, // lavender
  { from: '#FFE3D1', to: '#FFD3B0', text: '#C2632B' }, // peach
  { from: '#DCEEFB', to: '#CCE4FA', text: '#2B6CA3' }, // sky
  { from: '#DBF3E7', to: '#C9EEDC', text: '#227A55' }, // mint
  { from: '#FBE0E6', to: '#F8D0DA', text: '#B34C64' }, // rose
  { from: '#EFE1F7', to: '#E5CEF5', text: '#7A3FAE' }, // lilac
  { from: '#FFF3D0', to: '#FFEBB0', text: '#9C7A15' }, // butter
  { from: '#D8F0EF', to: '#C7EAE8', text: '#1F7A76' }, // aqua
]

function nameHash(s) { return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0) }
function getInitials(n) {
  return n.trim().split(/\s+/).filter(w => /^[\p{L}]/u.test(w)).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function GradientAvatar({ name = '?', size = 40, radius = '0.75rem', className = '' }) {
  const { from, to, text } = GRADS[nameHash(name) % GRADS.length]
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center shrink-0 select-none font-bold ${className}`}
      style={{
        width: size, height: size, borderRadius: radius,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        color: text,
        fontSize: Math.round(size * 0.34), letterSpacing: '0.03em',
        boxShadow: '0 2px 8px rgba(17,24,39,0.08)',
      }}>
      {getInitials(name)}
    </div>
  )
}
