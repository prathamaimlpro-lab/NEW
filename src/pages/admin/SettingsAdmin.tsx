// SettingsAdmin.tsx
import { useState } from 'react';
import { Field, NumInput } from '../../components/admin/fields';
import { admin, getSettings } from '../../services/contentStore';

export default function SettingsAdmin() {
  const [s, setS] = useState({ ...getSettings() });
  return (
    <>
      <h1 className="t-hlg">Tracker & XP Settings</h1>
      <section className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12 }}>
        <Field label="Daily goal (min)"><NumInput value={s.dailyGoalMinutes} onChange={v => setS({ ...s, dailyGoalMinutes: v })} /></Field>
        <Field label="Lesson XP"><NumInput value={s.xpLesson} onChange={v => setS({ ...s, xpLesson: v })} /></Field>
        <Field label="Easy XP"><NumInput value={s.xpEasy} onChange={v => setS({ ...s, xpEasy: v })} /></Field>
        <Field label="Medium XP"><NumInput value={s.xpMedium} onChange={v => setS({ ...s, xpMedium: v })} /></Field>
        <Field label="Hard XP"><NumInput value={s.xpHard} onChange={v => setS({ ...s, xpHard: v })} /></Field>
        <Field label="Visualization XP"><NumInput value={s.xpViz} onChange={v => setS({ ...s, xpViz: v })} /></Field>
      </section>
      <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => admin.saveSettings(s)}>Save settings</button>
    </>
  );
}
