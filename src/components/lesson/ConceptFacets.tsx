import type { Concept } from '../../content/types';

const ORDER = ['WHAT', 'WHY', 'HOW', 'INTERNALS', 'EXAMPLE', 'MISTAKES', 'PRACTICE', 'REAL_WORLD', 'CONNECTIONS'] as const;

export function ConceptFacets({ concept }: { concept: Concept }) {
  const facets = ORDER.map(k => concept.facets.find(f => f.key === k)).filter(Boolean);
  if (facets.length === 0) return null;
  return (
    <section className="block-stack" aria-label={concept.title}>
      <h3 className="t-hmd">{concept.title}</h3>
      {facets.map(f => (
        <div key={f!.key} className="block-stack" style={{ gap: 8 }}>
          <div className="label-mono">{f!.key === 'REAL_WORLD' ? 'REAL WORLD' : f!.key}</div>
          {f!.body && <p className="t-body">{f!.body}</p>}
          {f!.bullets && f!.bullets.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {f!.bullets.map(b => <li key={b} className="t-body">{b}</li>)}
            </ul>
          )}
          {f!.code && (
            <div className="code-block"><pre>{f!.code}</pre></div>
          )}
        </div>
      ))}
    </section>
  );
}
