// Hand-drawn SVG illustrations for Web Works — indigo brand palette.
// All pure SVG: crisp at any size, zero network requests, no licensing.

const brand = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
}

/** Layered browser windows + code + network nodes. Hero, right column. */
export function HeroIllustration({ className }) {
  return (
    <svg viewBox="0 0 560 440" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="Overlapping browser windows with code and connected network nodes">
      {/* dotted backdrop grid */}
      <defs>
        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill={brand[100]} />
        </pattern>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={brand[500]} />
          <stop offset="100%" stopColor={brand[700]} />
        </linearGradient>
      </defs>
      <rect x="40" y="20" width="480" height="400" rx="24" fill="url(#dots)" opacity="0.7" />

      {/* connection lines behind windows */}
      <path d="M90 340 C 150 300, 170 180, 120 120" stroke={brand[200]} strokeWidth="2" strokeDasharray="5 6" />
      <path d="M470 100 C 510 180, 500 280, 440 350" stroke={brand[200]} strokeWidth="2" strokeDasharray="5 6" />

      {/* back window (client's project brief) */}
      <g transform="translate(210 40)">
        <rect width="300" height="220" rx="14" fill="white" stroke={brand[100]} strokeWidth="2" />
        <rect width="300" height="36" rx="14" fill={brand[50]} />
        <rect y="22" width="300" height="14" fill={brand[50]} />
        <circle cx="20" cy="18" r="5" fill="#f87171" />
        <circle cx="38" cy="18" r="5" fill="#fbbf24" />
        <circle cx="56" cy="18" r="5" fill="#34d399" />
        <rect x="90" y="11" width="180" height="14" rx="7" fill="white" />
        {/* page mock: heading, text, image block */}
        <rect x="24" y="56" width="140" height="14" rx="7" fill={brand[300]} />
        <rect x="24" y="82" width="250" height="8" rx="4" fill="#e2e8f0" />
        <rect x="24" y="98" width="220" height="8" rx="4" fill="#e2e8f0" />
        <rect x="24" y="122" width="118" height="74" rx="8" fill={brand[100]} />
        <path d="M36 180 l22 -26 14 15 18 -22 26 33 z" fill={brand[400]} />
        <circle cx="52" cy="140" r="7" fill="#fbbf24" />
        <rect x="156" y="122" width="118" height="8" rx="4" fill="#e2e8f0" />
        <rect x="156" y="138" width="100" height="8" rx="4" fill="#e2e8f0" />
        <rect x="156" y="162" width="84" height="26" rx="13" fill={brand[600]} />
        <rect x="168" y="171" width="60" height="8" rx="4" fill={brand[200]} />
      </g>

      {/* front window (freelancer's code editor) */}
      <g transform="translate(60 150)">
        <rect width="290" height="230" rx="14" fill="#1e1b4b" />
        <rect width="290" height="36" rx="14" fill="#312e81" />
        <rect y="22" width="290" height="14" fill="#312e81" />
        <circle cx="20" cy="18" r="5" fill="#f87171" />
        <circle cx="38" cy="18" r="5" fill="#fbbf24" />
        <circle cx="56" cy="18" r="5" fill="#34d399" />
        {/* code lines */}
        <rect x="24" y="54" width="34" height="9" rx="4.5" fill={brand[400]} />
        <rect x="64" y="54" width="90" height="9" rx="4.5" fill="#a78bfa" />
        <rect x="160" y="54" width="26" height="9" rx="4.5" fill="#67e8f9" />
        <rect x="40" y="74" width="60" height="9" rx="4.5" fill="#f0abfc" />
        <rect x="106" y="74" width="110" height="9" rx="4.5" fill="#818cf8" opacity="0.7" />
        <rect x="40" y="94" width="130" height="9" rx="4.5" fill="#67e8f9" opacity="0.8" />
        <rect x="176" y="94" width="40" height="9" rx="4.5" fill="#fbbf24" opacity="0.9" />
        <rect x="40" y="114" width="84" height="9" rx="4.5" fill="#a78bfa" opacity="0.8" />
        <rect x="24" y="134" width="20" height="9" rx="4.5" fill={brand[400]} />
        <rect x="24" y="162" width="52" height="9" rx="4.5" fill={brand[400]} opacity="0.9" />
        <rect x="82" y="162" width="120" height="9" rx="4.5" fill="#f0abfc" opacity="0.7" />
        <rect x="40" y="182" width="96" height="9" rx="4.5" fill="#67e8f9" opacity="0.7" />
        <rect x="40" y="202" width="140" height="9" rx="4.5" fill="#818cf8" opacity="0.6" />
        {/* cursor */}
        <rect x="186" y="200" width="3" height="13" fill="white">
          <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* globe / www node cluster */}
      <g transform="translate(420 250)">
        <circle r="58" fill="white" stroke={brand[200]} strokeWidth="2" />
        <circle r="58" fill={brand[50]} opacity="0.5" />
        <ellipse rx="58" ry="24" stroke={brand[300]} strokeWidth="2" fill="none" />
        <ellipse rx="24" ry="58" stroke={brand[300]} strokeWidth="2" fill="none" />
        <line x1="-58" y1="0" x2="58" y2="0" stroke={brand[300]} strokeWidth="2" />
        {/* nodes on the globe */}
        <circle cx="-38" cy="-18" r="6" fill="url(#glow)" />
        <circle cx="30" cy="-30" r="6" fill="url(#glow)" />
        <circle cx="44" cy="20" r="6" fill="url(#glow)" />
        <circle cx="-16" cy="34" r="6" fill="url(#glow)" />
        <path d="M-38 -18 L30 -30 L44 20 L-16 34 Z" stroke={brand[400]} strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
      </g>

      {/* handshake badge: the direct connection */}
      <g transform="translate(330 330)">
        <rect x="-64" y="-26" width="128" height="52" rx="26" fill="white" stroke={brand[100]} strokeWidth="2" />
        <circle cx="-34" cy="0" r="14" fill={brand[500]} />
        <text x="-34" y="5" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="white">D</text>
        <circle cx="34" cy="0" r="14" fill="#10b981" />
        <text x="34" y="5" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="white">C</text>
        <path d="M-16 0 H16" stroke={brand[300]} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 -6 L16 0 L8 6" stroke={brand[300]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* floating accents */}
      <g transform="translate(110 90)">
        <rect x="-30" y="-16" width="60" height="32" rx="16" fill="white" stroke={brand[100]} strokeWidth="2" />
        <text y="6" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fontWeight="700" fill={brand[600]}>&lt;/&gt;</text>
      </g>
      <circle cx="520" cy="60" r="10" fill={brand[100]} />
      <circle cx="60" cy="410" r="8" fill={brand[100]} />
      <path d="M496 396 l8 -18 8 18 -8 -6 z" fill={brand[300]} />
    </svg>
  )
}

/** Step 1 — post your ad (classified card with $ tag). */
export function PostAdSpot({ className }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="22" y="18" width="76" height="84" rx="10" fill="white" stroke={brand[200]} strokeWidth="2.5" />
      <rect x="34" y="32" width="40" height="9" rx="4.5" fill={brand[400]} />
      <rect x="34" y="50" width="52" height="6" rx="3" fill="#e2e8f0" />
      <rect x="34" y="62" width="44" height="6" rx="3" fill="#e2e8f0" />
      <rect x="34" y="78" width="30" height="14" rx="7" fill={brand[600]} />
      <circle cx="88" cy="88" r="20" fill="#10b981" />
      <text x="88" y="95" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="800" fill="white">$</text>
    </svg>
  )
}

/** Step 2 — get found (search over listings). */
export function GetFoundSpot({ className }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="16" y="26" width="60" height="16" rx="8" fill={brand[100]} />
      <rect x="16" y="52" width="60" height="16" rx="8" fill={brand[100]} />
      <rect x="16" y="78" width="60" height="16" rx="8" fill={brand[600]} />
      <circle cx="82" cy="62" r="26" fill="white" stroke={brand[500]} strokeWidth="5" />
      <line x1="101" y1="81" x2="114" y2="94" stroke={brand[500]} strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}

/** Step 3 — connect directly (two chat bubbles, no middleman). */
export function ConnectSpot({ className }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M16 34 a10 10 0 0 1 10 -10 h44 a10 10 0 0 1 10 10 v20 a10 10 0 0 1 -10 10 h-30 l-14 12 v-12 h0 a10 10 0 0 1 -10 -10 z" fill={brand[600]} />
      <circle cx="38" cy="44" r="4" fill="white" />
      <circle cx="53" cy="44" r="4" fill="white" />
      <circle cx="68" cy="44" r="4" fill="white" />
      <path d="M104 62 a10 10 0 0 0 -10 -10 h-38 a10 10 0 0 0 -10 10 v18 a10 10 0 0 0 10 10 h26 l14 12 v-12 a10 10 0 0 0 8 -9.8 z" fill="white" stroke={brand[300]} strokeWidth="2.5" />
      <rect x="56" y="62" width="30" height="5" rx="2.5" fill={brand[300]} />
      <rect x="56" y="73" width="22" height="5" rx="2.5" fill={brand[200]} />
    </svg>
  )
}
