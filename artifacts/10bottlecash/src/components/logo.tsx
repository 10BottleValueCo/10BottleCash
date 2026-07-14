export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" stroke="#F5A623" strokeWidth="8" />
      {/* Bottle */}
      <path d="M42 22 L58 22 L58 35 L66 48 L66 80 L34 80 L34 48 L42 35 Z" fill="#F5A623" />
      <text x="50" y="55" fill="#000" fontSize="26" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fontFamily="monospace">$</text>
    </svg>
  );
}