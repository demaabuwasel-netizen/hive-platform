// Hive brand mark — bee inside a honey hexagon, with optional wordmark.
// The bee character IS the logo; the "H" lettermark has been retired.

export default function HiveLogo({
  size = 36,
  showName = true,
  light = false,
  nameSize = 'text-lg',
  className = '',
}) {
  // Point-top hexagon: viewBox 0 0 40 46
  const h = Math.round(size * 46 / 40)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={h} viewBox="0 0 40 46" fill="none" aria-label="Hive bee logo">

        {/* ── Hexagon background ── */}
        <polygon points="20,1 39,12 39,34 20,45 1,34 1,12" fill="#FFB703"/>

        {/* ── Wings (translucent white, above body) ── */}
        <ellipse cx="11" cy="19" rx="8.5" ry="5" fill="white" fillOpacity="0.82"
          transform="rotate(-20 11 19)"/>
        <ellipse cx="29" cy="19" rx="8.5" ry="5" fill="white" fillOpacity="0.82"
          transform="rotate(20 29 19)"/>

        {/* ── Body ── */}
        <ellipse cx="20" cy="31" rx="6" ry="8" fill="#FEF9E7"/>
        <rect x="14.5" y="26" width="11" height="3.5" rx="1.75" fill="#0D183D" fillOpacity="0.35"/>
        <rect x="14.5" y="31" width="11" height="3.5" rx="1.75" fill="#0D183D" fillOpacity="0.35"/>

        {/* ── Head ── */}
        <circle cx="20" cy="18" r="5.5" fill="#FEF9E7"/>

        {/* ── Eyes ── */}
        <circle cx="17.6" cy="17.4" r="1.3" fill="#0D183D"/>
        <circle cx="22.4" cy="17.4" r="1.3" fill="#0D183D"/>
        <circle cx="18.1" cy="16.9" r="0.5" fill="white" opacity="0.65"/>
        <circle cx="22.9" cy="16.9" r="0.5" fill="white" opacity="0.65"/>

        {/* ── Smile ── */}
        <path d="M17.5 22 Q20 24.5 22.5 22"
          stroke="#0D183D" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

        {/* ── Antennae ── */}
        <path d="M18.5 13.5 Q16.5 10 14.5 8.5"
          stroke="#0D183D" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="14" cy="8" r="1.6" fill="#FFD56A" stroke="#0D183D" strokeWidth="0.8"/>

        <path d="M21.5 13.5 Q23.5 10 25.5 8.5"
          stroke="#0D183D" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="26" cy="8" r="1.6" fill="#FFD56A" stroke="#0D183D" strokeWidth="0.8"/>

        {/* ── Stinger ── */}
        <path d="M20 39 L18.5 43 L21.5 43 Z" fill="#D97706"/>
      </svg>

      {showName && (
        <span className={`font-bold tracking-tight leading-none select-none ${nameSize} ${
          light ? 'text-white' : 'text-[#0D183D]'
        }`}>
          Hive
        </span>
      )}
    </div>
  )
}
