import { useEffect, useRef, useState } from 'react';
import { Icon } from '../common/Icon';

const STEPS = [
  { n: '01', name: 'Input', sub: 'Interrupt', title: 'User Intent Trigger', desc: "The mouse sensor records a double-click hardware interrupt at desktop coordinates (X:420, Y:812), identifying 'document.txt' on the desktop." },
  { n: '02', name: 'OS', sub: 'Syscall', title: 'OS Syscall', desc: 'The operating system receives the interrupt, resolves the file path, and issues a syscall requesting the file from storage.' },
  { n: '03', name: 'Storage', sub: 'Flash Read', title: 'Storage Flash Read', desc: 'The NVMe SSD locates the file blocks and streams them off flash memory toward the memory controller.' },
  { n: '04', name: 'RAM', sub: 'Load Page', title: 'RAM Load Page', desc: 'The file is paged into RAM so the CPU can reach it in nanoseconds instead of milliseconds.' },
  { n: '05', name: 'CPU', sub: 'Compute', title: 'CPU Compute', desc: 'The CPU fetches, decodes, and executes instructions on data sitting in caches and RAM.' },
  { n: '06', name: 'Display', sub: 'Render', title: 'Display Render', desc: 'The finished frame is written to the display buffer and the screen lights up with the open document.' },
];

export function ComputerProcessingViz({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!auto) return;
    timer.current = window.setInterval(() => {
      setStep(s => {
        if (s >= STEPS.length - 1) { setAuto(false); return s; }
        return s + 1;
      });
    }, 1600);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [auto]);

  useEffect(() => { if (step === STEPS.length - 1) onComplete?.(); }, [step, onComplete]);

  return (
    <div className="card" style={{ background: 'var(--canvas)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <span className="label-mono" style={{ color: 'var(--fg-secondary)' }}>
          PHASE {String(step + 1).padStart(2, '0')} OF 06 · <span style={{ color: 'var(--fg-primary)' }}>{STEPS[step].title}</span>
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setAuto(false); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}>
            <Icon name="chevron-left" size={14} /> Prev
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setAuto(false); setStep(s => Math.min(STEPS.length - 1, s + 1)); }} disabled={step === STEPS.length - 1}>
            Next <Icon name="chevron-right" size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { if (!auto && step === STEPS.length - 1) setStep(0); setAuto(v => !v); }} aria-pressed={auto}>
            <Icon name="play" size={12} /> {auto ? 'Pause' : 'Autoplay'}
          </button>
        </div>
      </div>

      <div className="viz-tiles" role="tablist" aria-label="Processing stages">
        {STEPS.map((s, i) => (
          <button key={s.n} role="tab" aria-selected={i === step}
            className={`viz-tile ${i === step ? 'active' : ''}`} onClick={() => { setAuto(false); setStep(i); }}>
            <span className="n">{s.n}</span>
            <span className="name">{s.name}</span>
            <span className="sub">{s.sub}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12, background: 'var(--elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 16 }}>
        <p className="t-body" style={{ color: 'var(--fg-secondary)' }}>{STEPS[step].desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
          <span className="t-caption" style={{ color: 'var(--fg-muted)' }}>Click any step above to inspect</span>
          <button className="btn btn-ghost btn-sm" style={{ color: '#a5a1ff' }} onClick={() => { setStep(0); setAuto(true); }}>
            Simulate click event
          </button>
        </div>
      </div>
    </div>
  );
}
