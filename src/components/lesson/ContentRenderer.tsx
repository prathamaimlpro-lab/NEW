import { ReactNode } from 'react';
import { ContentBlock } from '../../types';
import { Icon } from '../common/Icon';
import { ComputerProcessingViz } from '../visualization/ComputerProcessingViz';

function inline(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>));
}

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="block-stack">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading': return <h3 key={i} className="t-hsm">{b.content}</h3>;
          case 'paragraph': return <p key={i} className="t-body-lg">{inline(b.content ?? '')}</p>;
          case 'explanation': return <p key={i} className="t-body-lg" style={{ color: 'var(--fg-primary)' }}>{inline(b.content ?? '')}</p>;
          case 'analogy':
            return (
              <div key={i} className="card" style={{ borderLeft: '2px solid var(--warning)' }}>
                <div className="label-mono" style={{ marginBottom: 8, color: 'var(--warning)' }}>INTUITIVE ANALOGY</div>
                <p className="t-body-lg">{inline(b.content ?? '')}</p>
              </div>
            );
          case 'objective':
            return (
              <div key={i} className="card">
                <div className="label-mono" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--fg-secondary)' }}>
                  <Icon name="flag" size={14} /> LESSON OBJECTIVE
                </div>
                <p className="t-body-lg" style={{ color: 'var(--fg-secondary)' }}>{b.content}</p>
              </div>
            );
          case 'analogyCards':
            return (
              <div key={i} className="grid-3">
                {(b.items ?? []).map(item => (
                  <div key={item.title} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, color: 'var(--fg-muted)' }}>
                      <Icon name={item.icon} size={18} />
                      <span className="label-mono">{item.tag}</span>
                    </div>
                    <div className="t-body" style={{ color: 'var(--fg-primary)', fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                    <p className="t-body-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            );
          case 'callout':
            return <div key={i} className="card" style={{ borderLeft: '2px solid var(--info)' }}><p className="t-body-lg">{b.content}</p></div>;
          case 'tip':
            return <div key={i} className="card" style={{ borderLeft: '2px solid var(--success)' }}><div className="label-mono" style={{ color: 'var(--success)', marginBottom: 6 }}>TIP</div><p className="t-body">{b.content}</p></div>;
          case 'warning':
            return <div key={i} className="card" style={{ borderLeft: '2px solid var(--warning)' }}><div className="label-mono" style={{ color: 'var(--warning)', marginBottom: 6 }}>WARNING</div><p className="t-body">{b.content}</p></div>;
          case 'code':
            return (
              <div key={i} className="code-block">
                <div className="code-head"><span className="label-mono">{b.title ?? 'snippet'}</span><span className="label-mono">{b.language ?? 'text'}</span></div>
                <pre>{b.content}</pre>
              </div>
            );
          case 'table':
            return (
              <div key={i}>
                {b.table?.title && <div className="label-mono" style={{ marginBottom: 8 }}>{b.table.title}</div>}
                <div className="table-wrap">
                  <table>
                    <thead><tr>{b.table?.columns.map(c => <th key={c} className="label-mono">{c}</th>)}</tr></thead>
                    <tbody>{b.table?.rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </div>
            );
          case 'visualization':
            return b.vizType === 'computer-processing' ? <ComputerProcessingViz key={i} /> : null;
          case 'summary':
            return (
              <div key={i} className="card" style={{ borderLeft: '2px solid var(--success)' }}>
                <div className="label-mono" style={{ color: 'var(--success)', marginBottom: 8 }}>SUMMARY</div>
                <p className="t-body-lg" style={{ color: 'var(--fg-primary)' }}>{b.content}</p>
              </div>
            );
          default: return null;
        }
      })}
    </div>
  );
}
