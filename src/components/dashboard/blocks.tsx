import { ReactNode } from 'react';

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

export function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="dmetric">
      <div className="dsec" style={{ marginBottom: 6 }}>{label}</div>
      <div className="t-hmd" style={{ color: tone ?? 'var(--d-fg)' }}>{value}</div>
      {sub && <div className="t-caption" style={{ color: 'var(--d-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function HBar({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr 40px', gap: 10, alignItems: 'center' }}>
      <span className="t-caption" style={{ color: 'var(--d-fg2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <div className="dtrack"><div style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: tone ?? 'var(--d-blue)' }} /></div>
      <span className="mono t-caption" style={{ color: 'var(--d-fg2)', textAlign: 'right' }}>{Math.round(value)}%</span>
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="t-body-sm" style={{ color: 'var(--d-muted)', padding: '8px 0' }}>{children}</p>;
}
