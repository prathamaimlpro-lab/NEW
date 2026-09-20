import { Link } from 'react-router-dom';
import { formatWhen, selectWhatChangedInsights } from '../../dashboard/changeSelectors';
import { usePlayer } from '../../store/PlayerContext';

const KIND_LABEL: Record<string, string> = {
  lesson: 'Lesson', practice: 'Practice', revision: 'Revision', project: 'Project',
  visual: 'Visualization', level: 'Level', world: 'World', velocity: 'Velocity', accuracy: 'Accuracy',
};

export function WhatChanged() {
  const { stats } = usePlayer();
  const insights = selectWhatChangedInsights(stats);

  return (
    <section className="d7-panel" aria-label="What changed">
      <div className="d3-chart-head"><span className="d3-eyebrow">What Changed</span></div>
      {insights.length === 0 ? (
        <div className="dempty">No progress changes recorded yet. Completed lessons, solved problems, revisions and milestones will appear here as they happen.</div>
      ) : (
        <ol className="d7-list">
          {insights.map(i => (
            <li key={i.id} className="d7-item">
              <span className={`d7-dot d7-dot-${i.kind}`} aria-hidden="true" />
              <div className="d7-body">
                <div className="d7-top">
                  <span className="d7-title">{i.title}</span>
                  <span className="d7-time">{formatWhen(i.when)}</span>
                </div>
                <div className="d7-ev">
                  <span className="d7-kind">{KIND_LABEL[i.kind]}</span> · {i.evidence}
                  {i.delta && <span className="d7-delta"> · {i.delta}</span>}
                </div>
                {i.action && <Link className="d7-action" to={i.action.to}>{i.action.label} →</Link>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
