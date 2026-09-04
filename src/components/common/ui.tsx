import { ReactNode } from 'react';
import { lastNDays } from '../../services/xpService';
import { Icon } from './Icon';

export function Chip({ tone = 'default', icon, children }: { tone?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'; icon?: string; children: ReactNode }) {
  const cls = tone === 'default' ? 'chip' : `chip chip-${tone}`;
  return <span className={cls}>{icon && <Icon name={icon} size={12} />}{children}</span>;
}

export function Progress({ value, tone = 'primary' }: { value: number; tone?: 'primary' | 'info' }) {
  return (
    <div className={`pbar ${tone === 'info' ? 'pbar-info' : ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: string; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ color: 'var(--fg-subtle)' }}><Icon name={icon} size={32} /></div>
      <h3 className="t-hsm">{title}</h3>
      <p className="t-body clamp-3" style={{ maxWidth: 420 }}>{message}</p>
      {action}
    </div>
  );
}

export function CadenceChart({ activity }: { activity: Record<string, number> }) {
  const days = lastNDays(activity, 7);
  const max = Math.max(20, ...days.map(d => d.minutes));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, alignItems: 'end' }} aria-label="Last 7 days of study time">
      {days.map(d => (
        <div key={d.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: '100%', height: 56, borderRadius: 'var(--r-md)', display: 'grid', placeItems: 'center',
            background: d.minutes > 0 ? `rgba(79,70,229,${0.25 + 0.65 * (d.minutes / max)})` : 'var(--elevated)',
            border: '1px solid var(--border-subtle)',
          }}>
            <span className="mono" style={{ fontSize: 11, color: d.minutes > 0 ? '#e0e0ff' : 'var(--fg-subtle)' }}>{d.minutes > 0 ? `${d.minutes}m` : '—'}</span>
          </div>
          <span className="label-mono">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
