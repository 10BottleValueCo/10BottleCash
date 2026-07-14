import logoImg from '@/assets/logo.png';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logoImg}
      alt="10BOTTLECASH"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
