import { useEffect, useRef, useState } from 'react';
import { Icon } from '../common/Icon';

const STEPS = [
  { n: '01', name: 'User', sub: 'Tap', title: 'User Intent', desc: 'Your finger double-clicks document.txt. The touchscreen turns the tap into an electrical signal the machine can understand.' },
  { n: '02', name: 'OS', sub: 'Request', title: 'OS Receives the Request', desc: 'The operating system receives the signal, works out which application should open the file, and asks storage for it.' },
  { n: '03', name: 'Storage', sub: 'Locate', title: 'Storage Locates the File', desc: 'The SSD finds the blocks of the file and streams them out of permanent flash memory.' },
  { n: '04', name: 'RAM', sub: 'Load', title: 'RAM Loads the Data', desc: 'The file is copied into RAM so the CPU can reach it in nanoseconds instead of milliseconds.' },
  { n: '05', name: 'CPU', sub: 'Process', title: 'CPU Processes Instructions', desc: 'The CPU executes the application’s instructions on the data sitting in RAM.' },
  { n: '06', name: 'App', sub: 'Use', title: 'Application Uses the Data', desc: 'The application receives the processed data and lays out the document in memory.' },
  { n: '07', name: 'Output', sub: 'Render', title: 'Output Appears', desc: 'The finished frame is sent to the display — the open document appears on your screen.' },
];

export function ComputerProcessingViz({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!auto) return;
    timer.current = window.setInterval(() => {
      setStep(s => { if (s >= STEPS.length - 1) { setAuto(false); return s; } return s + 1; });
    }, 1600);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [auto]);

  useEffect(() => { if (step === STEPS.length - 1) onComplete?.(); }, [step, onComplete]);

  return (
    <div className="card" style={{ background: 'var(--canvas)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <span className="label-mono" style={{ color: 'var(--fg-secondary)' }}>
          STAGE {String(step + 1).padStart(2, '0')} OF 07 · <span style={{ color: 'var(--fg-primary)' }}>{STEPS[step].title}</span>
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setAuto(false); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}><Icon name="chevron-left" size={14} /> Prev</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setAuto(false); setStep(s => Math.min(STEPS.length - 1, s + 1)); }} disabled={step === STEPS.length - 1}>Next <Icon name="chevron-right" size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => { if (!auto && step === STEPS.length - 1) setStep(0); setAuto(v => !v); }} aria-pressed={auto}><Icon name="play" size={12} /> {auto ? 'Pause' : 'Autoplay'}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 8 }} role="tablist" aria-label="Processing stages">
        {STEPS.map((s, i) => (
          <button key={s.n} role="tab" aria-selected={i === step} className={`viz-tile ${i === step ? 'active' : ''}`} onClick={() => { setAuto(false); setStep(i); }}>
            <span className="n">{s.n}</span>
            <span className="name">{s.name}</span>
            <span className="sub">{s.sub}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12, background: 'var(--elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 16 }}>
        <p className="t-body" style={{ color: 'var(--fg-secondary)' }}>{STEPS[step].desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
          <span className="t-caption" style={{ color: 'var(--fg-muted)' }}>Click any stage above to inspect</span>
          <button className="btn btn-ghost btn-sm" style={{ color: '#a5a1ff' }} onClick={() => { setStep(0); setAuto(true); }}>Simulate opening a file</button>
        </div>
      </div>
    </div>
  );
}
