export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hexGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#F5D98B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>

      {/* Hexagon border */}
      <path
        d="M50 8 L88 29 L88 71 L50 92 L12 71 L12 29 Z"
        stroke="url(#hexGold)"
        strokeWidth="4"
        fill="none"
      />

      {/* Credit card body */}
      <rect x="24" y="36" width="46" height="32" rx="3" fill="#2a2200" stroke="#C9A84C" strokeWidth="1.5" />
      {/* Card stripe */}
      <rect x="24" y="43" width="46" height="7" fill="#C9A84C" opacity="0.7" />
      {/* Card dots */}
      <circle cx="34" cy="59" r="2" fill="#C9A84C" opacity="0.6" />
      <circle cx="41" cy="59" r="2" fill="#C9A84C" opacity="0.6" />
      <circle cx="48" cy="59" r="2" fill="#C9A84C" opacity="0.6" />

      {/* Dollar coin overlapping bottom-right of card */}
      <circle cx="63" cy="63" r="11" fill="#1a1200" stroke="#C9A84C" strokeWidth="1.5" />
      <circle cx="63" cy="63" r="8" fill="#2a2200" />
      <text
        x="63"
        y="63"
        fill="#F5D98B"
        fontSize="11"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="serif"
      >
        $
      </text>
    </svg>
  );
}
