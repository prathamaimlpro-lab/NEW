export function Emblem({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="1.5" y="1.5" width="45" height="45" rx="12" fill="#0b0d12" stroke="#232732" strokeWidth="3" />
      <path d="M15 17h18" stroke="#e8eaf2" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M24 17v16" stroke="#e8eaf2" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M18 33h12" stroke="#e8eaf2" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="33" cy="17" r="5" fill="#4f46e5" />
    </svg>
  );
}
