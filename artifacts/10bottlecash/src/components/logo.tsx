export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main gold gradient — top-left bright, bottom-right dark */}
        <linearGradient id="g1" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%"   stopColor="#F7E080" />
          <stop offset="35%"  stopColor="#D4A520" />
          <stop offset="70%"  stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6208" />
        </linearGradient>
        {/* Slightly brighter for card interior lines */}
        <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#F0CC50" />
          <stop offset="100%" stopColor="#A07810" />
        </linearGradient>
      </defs>

      {/*
        Flat-top hexagon (flat edges at top & bottom, points at left & right)
        Center (80, 80), circumradius 68
        Vertices at 0°,60°,120°,180°,240°,300°:
          0°  → (148, 80)
          60° → (114, 21.1)
          120°→ (46,  21.1)
          180°→ (12,  80)
          240°→ (46,  138.9)
          300°→ (114, 138.9)
      */}
      <polygon
        points="148,80 114,21 46,21 12,80 46,139 114,139"
        stroke="url(#g1)"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
      />

      {/*
        Credit card
        — rect from (33,50) to (113,105), rounded 4px
        — top stripe: solid fill, y=50 to y=63
        — chip: rect (41,70) to (57,83), rx2, with inner detail
        — 3 horizontal lines right of chip
      */}

      {/* Card outline */}
      <rect
        x="33" y="50" width="80" height="55"
        rx="4"
        stroke="url(#g1)"
        strokeWidth="2.2"
        fill="none"
      />

      {/* Top magnetic stripe — filled gold */}
      <rect
        x="33" y="60" width="80" height="11"
        fill="url(#g2)"
        opacity="0.55"
      />

      {/* Chip body */}
      <rect
        x="41" y="75" width="17" height="13"
        rx="2"
        stroke="url(#g1)"
        strokeWidth="1.6"
        fill="none"
      />
      {/* Chip inner grid lines */}
      <line x1="49.5" y1="75" x2="49.5" y2="88" stroke="url(#g1)" strokeWidth="0.8" opacity="0.7" />
      <line x1="41"   y1="81.5" x2="58" y2="81.5" stroke="url(#g1)" strokeWidth="0.8" opacity="0.7" />

      {/* Three horizontal lines right of chip */}
      <line x1="65" y1="76" x2="95" y2="76" stroke="url(#g1)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="65" y1="81" x2="95" y2="81" stroke="url(#g1)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="65" y1="86" x2="88" y2="86" stroke="url(#g1)" strokeWidth="1.8" strokeLinecap="round" />

      {/*
        Dollar coin
        Center (113, 103), radius 20
        Overlapping bottom-right corner of card
      */}

      {/* Coin background — pure black to cover card edge cleanly */}
      <circle cx="113" cy="103" r="21" fill="#0c0c0c" />

      {/* Coin outer ring */}
      <circle
        cx="113" cy="103" r="20"
        stroke="url(#g1)"
        strokeWidth="2.2"
        fill="none"
      />

      {/* Coin inner ring — subtle detail */}
      <circle
        cx="113" cy="103" r="15"
        stroke="url(#g1)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.4"
      />

      {/* Dollar sign */}
      <text
        x="113" y="103"
        fill="url(#g1)"
        fontSize="18"
        fontWeight="700"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        $
      </text>
    </svg>
  );
}
