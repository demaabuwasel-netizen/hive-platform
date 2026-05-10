const GRADS = [
  ['#6366F1','#8B5CF6'], ['#FFB703','#F97316'], ['#06B6D4','#3B82F6'],
  ['#10B981','#059669'], ['#EC4899','#F43F5E'], ['#8B5CF6','#A855F7'],
  ['#F59E0B','#EF4444'], ['#14B8A6','#06B6D4'],
]

function nameHash(s) { return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0) }
function getInitials(n) {
  return n.trim().split(/\s+/).filter(w => /^[\p{L}]/u.test(w)).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function GradientAvatar({ name = '?', size = 40, radius = '0.75rem', className = '' }) {
  const [c1, c2] = GRADS[nameHash(name) % GRADS.length]
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center shrink-0 select-none font-bold text-white ${className}`}
      style={{
        width: size, height: size, borderRadius: radius,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        fontSize: Math.round(size * 0.34), letterSpacing: '0.03em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}>
      {getInitials(name)}
    </div>
  )
}
