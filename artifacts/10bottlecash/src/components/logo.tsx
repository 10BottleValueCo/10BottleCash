export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#F5D060" />
          <stop offset="40%" stopColor="#C9A030" />
          <stop offset="100%" stopColor="#8B6410" />
        </linearGradient>
        <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D060" />
          <stop offset="50%" stopColor="#D4A820" />
          <stop offset="100%" stopColor="#9A7010" />
        </linearGradient>
      </defs>

      {/* Hexagon — flat-top orientation, prominent stroke */}
      <path
        d="M60 8 L104 32 L104 88 L60 112 L16 88 L16 32 Z"
        stroke="url(#goldGrad)"
        strokeWidth="3.5"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Credit card — outline only */}
      <rect
        x="26"
        y="38"
        width="58"
        height="40"
        rx="4"
        stroke="url(#goldGrad2)"
        strokeWidth="2"
        fill="none"
      />
      {/* Card magnetic stripe */}
      <rect
        x="26"
        y="46"
        width="58"
        height="9"
        fill="url(#goldGrad2)"
        opacity="0.35"
      />
      {/* Card chip */}
      <rect
        x="34"
        y="62"
        width="10"
        height="8"
        rx="1.5"
        stroke="url(#goldGrad2)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Card dots (contactless lines) */}
      <line x1="52" y1="63" x2="62" y2="63" stroke="url(#goldGrad2)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="52" y1="67" x2="62" y2="67" stroke="url(#goldGrad2)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="52" y1="71" x2="62" y2="71" stroke="url(#goldGrad2)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Dollar coin — circle overlapping bottom-right of card */}
      <circle
        cx="82"
        cy="76"
        r="14"
        fill="#0d0d0d"
        stroke="url(#goldGrad)"
        strokeWidth="2"
      />
      <circle
        cx="82"
        cy="76"
        r="10"
        stroke="url(#goldGrad)"
        strokeWidth="1"
        fill="none"
        opacity="0.4"
      />
      <text
        x="82"
        y="76"
        fill="url(#goldGrad)"
        fontSize="13"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, serif"
      >
        $
      </text>
    </svg>
  );
}
