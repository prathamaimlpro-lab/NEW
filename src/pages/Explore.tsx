import { Chip } from '../components/common/ui';
import { Icon } from '../components/common/Icon';

const TOOLS = [
  { icon: 'cpu', title: 'AI Teacher', desc: 'Personalized explanations grounded in the curriculum content pipeline.' },
  { icon: 'terminal', title: 'Coding Playground', desc: 'Write and execute code inside isolated sandbox containers.' },
  { icon: 'learn', title: 'Linux Simulator', desc: 'Practice shell commands against a safe virtual filesystem.' },
  { icon: 'practice', title: 'Git Simulator', desc: 'Visualize working directory, staging, commits, and remotes.' },
  { icon: 'storage', title: 'SQL Simulator', desc: 'Query relational tables and inspect execution plans.' },
  { icon: 'explore', title: 'Networking Simulator', desc: 'Watch packets traverse routers, switches, and TLS handshakes.' },
];

export default function Explore() {
  return (
    <>
      <section>
        <div className="label-mono" style={{ marginBottom: 8 }}>EXPLORATION LAB</div>
        <h1 className="t-hlg" style={{ marginBottom: 8 }}>Simulators & Tools</h1>
        <p className="t-body-lg" style={{ maxWidth: 640 }}>Interactive instruments that will plug into the existing visualization architecture. None are simulated with fake UI — each ships when its engine is real.</p>
      </section>
      <section className="grid-3">
        {TOOLS.map(t => (
          <div key={t.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--fg-muted)' }}><Icon name={t.icon} size={20} /></span>
              <Chip tone="warning">COMING SOON</Chip>
            </div>
            <h3 className="t-hsm">{t.title}</h3>
            <p className="t-body-sm">{t.desc}</p>
          </div>
        ))}
      </section>
    </>
  );
}
