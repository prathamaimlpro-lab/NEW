import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionIndex, StatementHeader } from '../components/ui/primitives';
import { getMotionPref, setMotionPref, type MotionPref } from '../services/motionPref';

export default function SettingsPage() {
  const [motion, setMotion] = useState<MotionPref>(getMotionPref());
  return (
    <>
      <SectionIndex index="01" label="Settings" />
      <StatementHeader lead="Environment —" emphasis="single command-dark theme by design." />

      <div className="ui-panel">
        <div className="ui-index">Motion</div>
        <p className="t-body-sm">Pixel respects your system's reduced-motion preference. You can also force reduced motion here.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['auto', 'reduced'] as MotionPref[]).map(m => (
            <button key={m} type="button" className={`btn btn-sm ${motion === m ? 'btn-secondary' : 'btn-ghost'}`} aria-pressed={motion === m}
              onClick={() => { setMotion(m); setMotionPref(m); }}>
              {m === 'auto' ? 'Follow system' : 'Reduced motion'}
            </button>
          ))}
        </div>
      </div>

      <div className="ui-panel">
        <div className="ui-index">Data</div>
        <p className="t-body-sm">Progress resets and account data live in your profile.</p>
        <Link className="btn btn-secondary btn-sm" to="/profile">Open Profile</Link>
      </div>

      <div className="ui-panel">
        <div className="ui-index">About</div>
        <p className="t-body-sm">Pixel · 13 Worlds · 100 Levels · command-dark design system v2.</p>
      </div>
    </>
  );
}
