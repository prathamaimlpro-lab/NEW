interface LogoProps { size?: number; tone?: 'current' | 'light' | 'dark' }

const colorFor = (tone: NonNullable<LogoProps['tone']>) =>
  tone === 'light' ? '#FFFFFF' : tone === 'dark' ? '#111111' : 'currentColor';

export function PixelIconMark({ size = 24, tone = 'current' }: LogoProps) {
  const c = colorFor(tone);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="Pixel mark">
      <g stroke={c} strokeWidth={7} strokeLinecap="butt">
        <path d="M16 16 L26 26" />
        <path d="M38 38 L48 48" />
        <path d="M48 16 L38 26" />
        <path d="M26 38 L16 48" />
      </g>
    </svg>
  );
}

export function PixelWordmark({ size = 16, tone = 'current' }: LogoProps) {
  const c = colorFor(tone);
  return (
    <svg width={size * 3.08} height={size} viewBox="0 0 74 24" fill="none" role="img" aria-label="Pixel">
      <g stroke={c} strokeWidth={3.2} strokeLinecap="butt" strokeLinejoin="miter">
        <path d="M2 22 V2 h6.4 a5 5 0 0 1 0 10 H2" />
        <path d="M18.5 2 V22" />
        <path d="M25 2 L29.4 8.4" />
        <path d="M34.6 15.6 L39 22" />
        <path d="M39 2 L34.6 8.4" />
        <path d="M29.4 15.6 L25 22" />
        <path d="M45.5 2 V22" />
        <path d="M45.5 2 H55" />
        <path d="M45.5 12 H53" />
        <path d="M45.5 22 H55" />
        <path d="M61.5 2 V22" />
        <path d="M61.5 22 H72" />
      </g>
    </svg>
  );
}

export function PixelLogo({ size = 24, tone = 'current', wordmark = true }: LogoProps & { wordmark?: boolean }) {
  return wordmark ? <PixelWordmark size={size} tone={tone} /> : <PixelIconMark size={size} tone={tone} />;
}
