// Shared SVG illustration system for Hive empty states and page heroes.
// All illustrations use the brand palette: navy #0D183D, honey #FFB703, teal #3BBFB0, cream #FFF7E6.

const VARIANTS = {

  opportunities: (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background hexagon grid */}
      <polygon points="120,8 148,24 148,56 120,72 92,56 92,24" fill="#FFF7E6" stroke="#FFB703" strokeWidth="1.2" opacity="0.5"/>
      <polygon points="160,36 180,48 180,72 160,84 140,72 140,48" fill="#FFF7E6" stroke="#FFB703" strokeWidth="0.8" opacity="0.3"/>
      <polygon points="80,36 100,48 100,72 80,84 60,72 60,48" fill="#FFF7E6" stroke="#FFB703" strokeWidth="0.8" opacity="0.3"/>

      {/* Briefcase body */}
      <rect x="70" y="90" width="100" height="72" rx="10" fill="white" stroke="#0D183D" strokeWidth="1.6"/>
      <rect x="70" y="90" width="100" height="72" rx="10" fill="url(#oppGrad)" opacity="0.06"/>
      {/* Briefcase handle */}
      <path d="M97 90 V82 Q97 74 120 74 Q143 74 143 82 V90" stroke="#0D183D" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      {/* Briefcase middle bar */}
      <line x1="70" y1="120" x2="170" y2="120" stroke="#0D183D" strokeWidth="1.2" opacity="0.15"/>
      {/* Clasp */}
      <rect x="112" y="113" width="16" height="14" rx="4" fill="white" stroke="#FFB703" strokeWidth="1.6"/>

      {/* Sparkles */}
      <circle cx="50" cy="80" r="3" fill="#FFB703" opacity="0.7"/>
      <circle cx="195" cy="95" r="2.5" fill="#3BBFB0" opacity="0.6"/>
      <line x1="45" y1="68" x2="45" y2="78" stroke="#FFB703" strokeWidth="1.4" opacity="0.5" strokeLinecap="round"/>
      <line x1="40" y1="73" x2="50" y2="73" stroke="#FFB703" strokeWidth="1.4" opacity="0.5" strokeLinecap="round"/>
      <line x1="190" y1="108" x2="190" y2="116" stroke="#3BBFB0" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
      <line x1="186" y1="112" x2="194" y2="112" stroke="#3BBFB0" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>

      <defs>
        <linearGradient id="oppGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB703"/>
          <stop offset="100%" stopColor="#3BBFB0"/>
        </linearGradient>
      </defs>
    </svg>
  ),

  applications: (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Doc stack shadow */}
      <rect x="82" y="58" width="82" height="108" rx="10" fill="#FFB703" opacity="0.12" transform="rotate(6 82 58)"/>
      {/* Main doc */}
      <rect x="70" y="50" width="100" height="120" rx="10" fill="white" stroke="#0D183D" strokeWidth="1.5"/>
      {/* Doc lines */}
      <line x1="86" y1="80" x2="154" y2="80" stroke="#0D183D" strokeWidth="1.4" strokeLinecap="round" opacity="0.18"/>
      <line x1="86" y1="96" x2="154" y2="96" stroke="#0D183D" strokeWidth="1.4" strokeLinecap="round" opacity="0.14"/>
      <line x1="86" y1="112" x2="140" y2="112" stroke="#0D183D" strokeWidth="1.4" strokeLinecap="round" opacity="0.14"/>
      <line x1="86" y1="128" x2="132" y2="128" stroke="#0D183D" strokeWidth="1.4" strokeLinecap="round" opacity="0.10"/>
      {/* Checkmark badge */}
      <circle cx="154" cy="148" r="18" fill="#3BBFB0"/>
      <path d="M145 148 l6 6 l12 -12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Honey dot accent */}
      <circle cx="86" cy="65" r="5" fill="#FFB703" opacity="0.85"/>
      {/* Top corner fold */}
      <path d="M152 50 L170 68 L152 68 Z" fill="#F5F7FA" stroke="#0D183D" strokeWidth="1.2" opacity="0.5"/>
      {/* Tiny sparkle */}
      <circle cx="58" cy="90" r="3" fill="#FFB703" opacity="0.5"/>
      <line x1="54" y1="80" x2="54" y2="88" stroke="#FFB703" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
      <line x1="50" y1="84" x2="58" y2="84" stroke="#FFB703" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
    </svg>
  ),

  interviews: (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Mic stand base */}
      <rect x="112" y="158" width="16" height="6" rx="3" fill="#0D183D" opacity="0.3"/>
      <line x1="120" y1="140" x2="120" y2="158" stroke="#0D183D" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      {/* Mic body */}
      <rect x="106" y="92" width="28" height="50" rx="14" fill="white" stroke="#0D183D" strokeWidth="1.6"/>
      <rect x="106" y="92" width="28" height="50" rx="14" fill="#FFB703" opacity="0.1"/>
      {/* Mic grille lines */}
      <line x1="110" y1="108" x2="130" y2="108" stroke="#0D183D" strokeWidth="1" opacity="0.2" strokeLinecap="round"/>
      <line x1="109" y1="116" x2="131" y2="116" stroke="#0D183D" strokeWidth="1" opacity="0.2" strokeLinecap="round"/>
      <line x1="110" y1="124" x2="130" y2="124" stroke="#0D183D" strokeWidth="1" opacity="0.2" strokeLinecap="round"/>
      {/* Sound waves */}
      <path d="M148 110 Q158 120 148 130" stroke="#FFB703" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M155 104 Q170 120 155 136" stroke="#FFB703" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M92 110 Q82 120 92 130" stroke="#3BBFB0" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M85 104 Q70 120 85 136" stroke="#3BBFB0" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* Honey hex */}
      <polygon points="120,42 134,50 134,66 120,74 106,66 106,50" fill="#FFB703" opacity="0.12" stroke="#FFB703" strokeWidth="1"/>
      <polygon points="120,48 130,54 130,66 120,72 110,66 110,54" fill="#FFB703" opacity="0.2"/>
      <path d="M114 60 l4 4 l8 -8" stroke="#0D183D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  messages: (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Back bubble (teal) */}
      <rect x="88" y="50" width="110" height="70" rx="18" fill="#3BBFB0" opacity="0.15" stroke="#3BBFB0" strokeWidth="1.2"/>
      <path d="M140 120 L130 136 L150 120" fill="#3BBFB0" opacity="0.15"/>
      {/* Front bubble (white/navy) */}
      <rect x="42" y="90" width="110" height="68" rx="18" fill="white" stroke="#0D183D" strokeWidth="1.5"/>
      <path d="M90 158 L78 174 L102 158" fill="white" stroke="#0D183D" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Bubble content lines */}
      <line x1="58" y1="110" x2="134" y2="110" stroke="#0D183D" strokeWidth="1.4" strokeLinecap="round" opacity="0.18"/>
      <line x1="58" y1="124" x2="118" y2="124" stroke="#0D183D" strokeWidth="1.4" strokeLinecap="round" opacity="0.14"/>
      {/* Back bubble lines */}
      <line x1="104" y1="70" x2="178" y2="70" stroke="#3BBFB0" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <line x1="104" y1="84" x2="160" y2="84" stroke="#3BBFB0" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      {/* Honey dot */}
      <circle cx="58" cy="110" r="5" fill="#FFB703" opacity="0.8"/>
      {/* Small sparkle */}
      <circle cx="195" cy="62" r="3" fill="#FFB703" opacity="0.5"/>
      <line x1="195" y1="52" x2="195" y2="58" stroke="#FFB703" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
      <line x1="189" y1="56" x2="201" y2="56" stroke="#FFB703" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
    </svg>
  ),

  saved: (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Card stack */}
      <rect x="80" y="68" width="92" height="104" rx="12" fill="#FFF7E6" stroke="#FFB703" strokeWidth="1" opacity="0.6" transform="rotate(-5 80 68)"/>
      <rect x="74" y="62" width="92" height="104" rx="12" fill="white" stroke="#0D183D" strokeWidth="1.4"/>
      {/* Bookmark ribbon */}
      <path d="M138 62 L138 102 L120 92 L102 102 L102 62 Z" fill="#FFB703" opacity="0.9"/>
      <path d="M138 62 L138 102 L120 92 L102 102 L102 62 Z" stroke="#0D183D" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Card content lines */}
      <line x1="90" y1="120" x2="150" y2="120" stroke="#0D183D" strokeWidth="1.3" strokeLinecap="round" opacity="0.15"/>
      <line x1="90" y1="134" x2="138" y2="134" stroke="#0D183D" strokeWidth="1.3" strokeLinecap="round" opacity="0.12"/>
      <line x1="90" y1="148" x2="128" y2="148" stroke="#0D183D" strokeWidth="1.3" strokeLinecap="round" opacity="0.10"/>
      {/* Teal dot accent */}
      <circle cx="90" cy="106" r="4" fill="#3BBFB0" opacity="0.7"/>
      {/* Floating sparkle */}
      <line x1="55" y1="80" x2="55" y2="90" stroke="#FFB703" strokeWidth="1.4" opacity="0.5" strokeLinecap="round"/>
      <line x1="50" y1="85" x2="60" y2="85" stroke="#FFB703" strokeWidth="1.4" opacity="0.5" strokeLinecap="round"/>
      <circle cx="55" cy="95" r="2.5" fill="#FFB703" opacity="0.4"/>
    </svg>
  ),

  profile: (
    <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Card */}
      <rect x="60" y="48" width="120" height="128" rx="16" fill="white" stroke="#0D183D" strokeWidth="1.5"/>
      {/* Avatar circle */}
      <circle cx="120" cy="96" r="28" fill="#FFF7E6" stroke="#FFB703" strokeWidth="1.8"/>
      <circle cx="120" cy="88" r="11" fill="#FFB703" opacity="0.7"/>
      <path d="M96 118 Q100 106 120 106 Q140 106 144 118" fill="#FFB703" opacity="0.4"/>
      {/* Name line */}
      <rect x="88" y="132" width="64" height="8" rx="4" fill="#0D183D" opacity="0.2"/>
      {/* Subtitle line */}
      <rect x="96" y="146" width="48" height="6" rx="3" fill="#0D183D" opacity="0.12"/>
      {/* Detail dots */}
      <circle cx="92" cy="166" r="3" fill="#3BBFB0" opacity="0.7"/>
      <rect x="100" y="163" width="40" height="5" rx="2.5" fill="#0D183D" opacity="0.1"/>
      {/* Honey hex badge */}
      <polygon points="168,50 178,56 178,68 168,74 158,68 158,56" fill="#FFB703" opacity="0.2" stroke="#FFB703" strokeWidth="1"/>
      <polygon points="168,56 175,60 175,66 168,70 161,66 161,60" fill="#FFB703" opacity="0.5"/>
    </svg>
  ),

  dashboard: (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Hex grid */}
      <polygon points="160,10 188,26 188,58 160,74 132,58 132,26" fill="#FFF7E6" stroke="#FFB703" strokeWidth="1.2" opacity="0.6"/>
      <polygon points="200,38 220,50 220,74 200,86 180,74 180,50" fill="#FFF7E6" stroke="#3BBFB0" strokeWidth="0.8" opacity="0.4"/>
      <polygon points="120,38 140,50 140,74 120,86 100,74 100,50" fill="#FFF7E6" stroke="#FFB703" strokeWidth="0.8" opacity="0.35"/>
      {/* Stats cards */}
      <rect x="40" y="100" width="72" height="60" rx="12" fill="white" stroke="#0D183D" strokeWidth="1.3"/>
      <rect x="124" y="100" width="72" height="60" rx="12" fill="white" stroke="#0D183D" strokeWidth="1.3"/>
      <rect x="208" y="100" width="72" height="60" rx="12" fill="white" stroke="#0D183D" strokeWidth="1.3"/>
      {/* Card content */}
      <circle cx="56" cy="118" r="7" fill="#FFB703" opacity="0.8"/>
      <rect x="68" y="114" width="34" height="5" rx="2.5" fill="#0D183D" opacity="0.2"/>
      <rect x="48" y="132" width="54" height="14" rx="5" fill="#FFF7E6" stroke="#FFB703" strokeWidth="1"/>
      <circle cx="140" cy="118" r="7" fill="#3BBFB0" opacity="0.8"/>
      <rect x="152" y="114" width="34" height="5" rx="2.5" fill="#0D183D" opacity="0.2"/>
      <rect x="132" y="132" width="54" height="14" rx="5" fill="#E6F7F6" stroke="#3BBFB0" strokeWidth="1"/>
      <circle cx="224" cy="118" r="7" fill="#0D183D" opacity="0.4"/>
      <rect x="236" y="114" width="34" height="5" rx="2.5" fill="#0D183D" opacity="0.2"/>
      <rect x="216" y="132" width="54" height="14" rx="5" fill="#F5F7FA" stroke="#0D183D" strokeWidth="1" opacity="0.5"/>
      {/* Sparkles */}
      <circle cx="30" cy="85" r="3.5" fill="#FFB703" opacity="0.6"/>
      <line x1="26" y1="73" x2="26" y2="83" stroke="#FFB703" strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
      <line x1="22" y1="78" x2="30" y2="78" stroke="#FFB703" strokeWidth="1.4" opacity="0.4" strokeLinecap="round"/>
    </svg>
  ),
}

export default function HiveIllustration({ variant = 'opportunities', className = '' }) {
  const svg = VARIANTS[variant] || VARIANTS.opportunities
  return (
    <div className={`select-none ${className}`}>
      {svg}
    </div>
  )
}
