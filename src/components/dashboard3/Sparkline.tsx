export function Sparkline({ values, label, color = 'var(--action)' }: { values: number[]; label: string; color?: string }) {
  if (!values || values.length === 0) return null;
  const w = 72, h = 20;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * (w - 4) + 2},${h - 2 - (v / max) * (h - 4)}`).join(' ');
  return (
    <svg width={w} height={h} role="img" aria-label={label} style={{ flex: 'none' }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
    </svg>
  );
}
