// ThemeAdmin.tsx
import { useState } from 'react';
import { Field, NumInput } from '../../components/admin/fields';
import { admin, defaultTheme, getTheme } from '../../services/contentStore';
import { ThemeSettings } from '../../types';

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <Field label={label}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 44, height: 36, background: 'var(--canvas)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} /><span className="mono t-caption">{value}</span></div></Field>
);

export default function ThemeAdmin() {
  const [t, setT] = useState<ThemeSettings>({ ...getTheme() });
  return (
    <>
      <h1 className="t-hlg">Theme Editor</h1>
      <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>Changes apply live across the whole product and persist for every visitor of this deployment.</p>
      <section className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12 }}>
        <ColorField label="Primary accent" value={t.primary} onChange={v => setT({ ...t, primary: v })} />
        <ColorField label="Primary hover" value={t.primaryHover} onChange={v => setT({ ...t, primaryHover: v })} />
        <ColorField label="Success" value={t.success} onChange={v => setT({ ...t, success: v })} />
        <ColorField label="Warning" value={t.warning} onChange={v => setT({ ...t, warning: v })} />
        <ColorField label="Error" value={t.error} onChange={v => setT({ ...t, error: v })} />
        <ColorField label="Info" value={t.info} onChange={v => setT({ ...t, info: v })} />
        <Field label="Card radius (px)"><NumInput value={t.radiusMd} onChange={v => setT({ ...t, radiusMd: v })} /></Field>
      </section>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={() => admin.saveTheme(t)}>Save theme</button>
        <button className="btn btn-secondary" onClick={() => { setT({ ...defaultTheme }); admin.saveTheme({ ...defaultTheme }); }}>Reset to Obsidian Precision</button>
      </div>
    </>
  );
}
