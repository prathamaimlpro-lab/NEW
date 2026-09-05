import { Link } from 'react-router-dom';
import { Chip } from '../components/common/ui';
import { Icon } from '../components/common/Icon';
import { listVisualizations } from '../components/visualization/registry';

const TOOLS = [
  { icon: 'cpu', title: 'AI Teacher', desc: 'Personalized explanations grounded in the curriculum content pipeline.' },
  { icon: 'terminal', title: 'Coding Playground', desc: 'Write and execute code inside isolated sandbox containers.' },
  { icon: 'learn', title: 'Linux Simulator', desc: 'Practice shell commands against a safe virtual filesystem.' },
  { icon: 'practice', title: 'Git Simulator', desc: 'Visualize working directory, staging, commits, and remotes.' },
  { icon: 'storage', title: 'SQL Simulator', desc: 'Query relational tables and inspect execution plans.' },
  { icon: 'explore', title: 'Networking Simulator', desc: 'Watch packets traverse routers, switches, and TLS handshakes.' },
];

export default function Explore() {
  const viz = listVisualizations();
  return (
    <>
      <section>
        <div className="label-mono" style={{ marginBottom: 8 }}>EXPLORATION LAB</div>
        <h1 className="t-hlg" style={{ marginBottom: 8 }}>Visualizations & Tools</h1>
        <p className="t-body-lg" style={{ maxWidth: 640 }}>Interactive instruments plugged into the shared visualization engine. New visualizations register without touching the engine.</p>
      </section>
      <section>
        <h2 className="t-hmd" style={{ marginBottom: 16 }}>Visualizations — Available Now</h2>
        <div className="grid-3">
          {viz.map(v => (
            <Link key={v.id} to={`/explore/viz/${v.id}`} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--fg-muted)' }}><Icon name="progress" size={20} /></span>
                <Chip tone="success">AVAILABLE</Chip>
              </div>
              <h3 className="t-hsm">{v.title}</h3>
              <p className="t-body-sm clamp-2">{v.description}</p>
              <div style={{ display: 'flex', gap: 8 }}><Chip tone="primary">{v.category.toUpperCase()}</Chip><Chip>{v.difficulty}</Chip></div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="t-hmd" style={{ marginBottom: 16 }}>Simulators — Coming Soon</h2>
        <div className="grid-3">
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
        </div>
      </section>
    </>
  );
}
