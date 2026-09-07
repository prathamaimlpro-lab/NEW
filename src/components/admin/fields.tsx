import { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className="t-caption"><span style={{ color: 'var(--fg-muted)' }}>{label}</span>{children}</label>;
}
export const TextInput = (p: { value: string; onChange: (v: string) => void; placeholder?: string }) =>
  <input className="input" value={p.value} placeholder={p.placeholder} onChange={e => p.onChange(e.target.value)} />;
export const NumInput = (p: { value: number; onChange: (v: number) => void }) =>
  <input className="input" type="number" value={p.value} onChange={e => p.onChange(Number(e.target.value))} />;
export const AreaInput = (p: { value: string; onChange: (v: string) => void; rows?: number }) =>
  <textarea className="input" style={{ height: 'auto', padding: 10, resize: 'vertical' }} rows={p.rows ?? 3} value={p.value} onChange={e => p.onChange(e.target.value)} />;
export const SelectInput = (p: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) =>
  <select className="input" value={p.value} onChange={e => p.onChange(e.target.value)}>{p.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
export const lines = (s: string) => s.split('\n').filter(x => x.trim() !== '');
