import { ReactNode, useEffect, useRef, useState } from 'react';

export function useCountUp(value: number, duration = 350): number {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { prev.current = value; setDisplay(value); return; }
    const from = prev.current; const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(Math.round(from + (value - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick); else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

export function DSection({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`dpanel ${className ?? ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span className="dsec">{title}</span>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatMetric({ label, value, unit, trend, trendDir, sub, tone }: {
  label: string; value: number; unit?: string; trend?: string; trendDir?: 'up' | 'down' | 'flat'; sub?: string; tone?: string;
}) {
  const shown = useCountUp(value);
  return (
    <div className="dmetric">
      <div className="dsec" style={{ marginBottom: 6 }}>{label}</div>
      <div className="t-hmd" style={{ color: tone ?? 'var(--d-fg)' }}>
        {shown.toLocaleString()}
        {unit && <span className="t-caption" style={{ color: 'var(--d-muted)', marginLeft: 4 }}>{unit}</span>}
      </div>
      {(trend || sub) && (
        <div className="t-caption" style={{ marginTop: 4, color: trendDir === 'up' ? 'var(--d-green)' : trendDir === 'down' ? 'var(--d-red)' : 'var(--d-muted)' }}>
          {trendDir === 'up' ? '▲ ' : trendDir === 'down' ? '▼ ' : ''}{trend ?? sub}
        </div>
      )}
    </div>
  );
}

export function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="dmetric">
      <div className="dsec" style={{ marginBottom: 6 }}>{label}</div>
      <div className="t-hmd" style={{ color: tone ?? 'var(--d-fg)' }}>{value}</div>
      {sub && <div className="t-caption" style={{ color: 'var(--d-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function HBar({ label, value, tone, caption }: { label: string; value: number; tone?: string; caption?: string }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr 40px', gap: 10, alignItems: 'center' }}>
        <span className="t-caption" style={{ color: 'var(--d-fg2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <div className="dtrack"><div style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: tone ?? 'var(--d-blue)' }} /></div>
        <span className="mono t-caption" style={{ color: 'var(--d-fg2)', textAlign: 'right' }}>{Math.round(value)}%</span>
      </div>
      {caption && <div className="t-caption" style={{ color: 'var(--d-muted)', marginTop: 4, marginLeft: 102 }}>{caption}</div>}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="t-body-sm" style={{ color: 'var(--d-muted)', padding: '8px 0' }}>{children}</p>;
}
