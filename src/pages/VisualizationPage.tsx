import { Link, useParams } from 'react-router-dom';
import { Chip, EmptyState } from '../components/common/ui';
import { getVisualization, VisualizationRenderer } from '../components/visualization/registry';
import { usePlayer } from '../store/PlayerContext';

export default function VisualizationPage() {
  const { vizId } = useParams();
  const def = vizId ? getVisualization(vizId) : undefined;
  const { completeVisualization } = usePlayer();

  if (!def) return <EmptyState icon="explore" title="Visualization not found" message="This visualization is not registered in the engine yet." action={<Link className="btn btn-primary" to="/explore">Back to Explore</Link>} />;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Link to="/explore" className="t-body" style={{ color: 'var(--fg-muted)' }}>← Explore</Link>
      <header>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <Chip tone="primary">{def.category.toUpperCase()}</Chip><Chip>{def.difficulty}</Chip>
          {def.complexity && <><Chip tone="warning">TIME {def.complexity.time}</Chip><Chip tone="info">SPACE {def.complexity.space}</Chip></>}
        </div>
        <h1 className="t-hlg" style={{ marginBottom: 8 }}>{def.title}</h1>
        <p className="t-body-lg" style={{ maxWidth: 720 }}>{def.description}</p>
      </header>
      <VisualizationRenderer id={def.id} onCompleted={(id, xp) => completeVisualization(id, xp)} />
      {def.legend && (
        <div className="card" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {def.legend.map(l => (
            <span key={l.label} className="t-body-sm" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--fg-secondary)' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} /> {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
