import { ReactNode } from 'react';

const FILLED = new Set(['bolt', 'play', 'flame']);
const P: Record<string, ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></>,
  learn: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m8 10-2.5 2.5L8 15" /><path d="m16 10 2.5 2.5L16 15" /></>,
  practice: <><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /></>,
  explore: <><circle cx="12" cy="12" r="9" /><path d="m14.8 9.2-1.9 4.4-4.4 1.9 1.9-4.4z" /></>,
  progress: <><path d="M5 20v-8" /><path d="M11 20V5" /><path d="M17 20v-5" /><path d="M3 20h18" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></>,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  flame: <path d="M12 2s5 4.6 5 9.5a5 5 0 0 1-10 0c0-2 1-3.6 2.2-5.2.4 1.8 1.6 2.7 1.6 2.7S12 5 12 2z" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  'check-circle': <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 5-5.5" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  'arrow-right': <><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></>,
  'arrow-left': <><path d="M20 12H4" /><path d="m10 6-6 6 6 6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4h13l-2.5 4L18 12H5" /></>,
  play: <path d="M8 5.5v13l10-6.5z" />,
  notes: <><path d="M4 6h16" /><path d="M4 11h16" /><path d="M4 16h10" /></>,
  shield: <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />,
  x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>,
  storage: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M4 9h16" /><path d="M4 15h16" /></>,
  memory: <><path d="M3 9h18" /><path d="M5 9v10" /><path d="M19 9v10" /><path d="M9 9v4" /><path d="M15 9v4" /></>,
  cpu: <><rect x="7" y="7" width="10" height="10" rx="1" /><rect x="10.5" y="10.5" width="3" height="3" /><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /></>,
  award: <><circle cx="12" cy="9" r="5" /><path d="m9 13-2 8 5-3 5 3-2-8" /></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3" /><path d="M12 15h5" /></>,
};

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const filled = FILLED.has(name);
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {P[name] ?? null}
    </svg>
  );
}
