import { Lesson } from '../../types';
import { Chip } from '../common/ui';
import { ContentRenderer } from '../lesson/ContentRenderer';
import { VisualizationRenderer } from '../visualization/registry';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function LessonPreview({ lesson }: { lesson: Lesson }) {
  return (
    <div className="reading" style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <Chip tone="warning">PREVIEW — LEARNER VIEW</Chip><Chip>{lesson.status}</Chip><Chip>{lesson.difficulty}</Chip><Chip tone="info">+{lesson.xpReward} XP</Chip>
      </div>
      <h1 className="t-hlg" style={{ marginBottom: 8 }}>{lesson.title || 'Untitled lesson'}</h1>
      <p className="t-body-lg" style={{ marginBottom: 16 }}>{lesson.description}</p>
      {lesson.objectives.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>LESSON OBJECTIVE</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lesson.objectives.map(o => <li key={o} className="t-body">· {o}</li>)}
          </ul>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {lesson.sections.map(s => (
          <section key={s.id}>
            {s.label && <div className="label-mono" style={{ marginBottom: 8 }}>{s.label}</div>}
            {s.title && <h2 className="t-hmd" style={{ marginBottom: 12 }}>{s.title}</h2>}
            <ContentRenderer blocks={s.blocks} />
          </section>
        ))}
        {lesson.visualizationId && (
          <section>
            <div className="label-mono" style={{ marginBottom: 8 }}>INTERACTIVE VISUALIZATION</div>
            <VisualizationRenderer id={lesson.visualizationId} />
          </section>
        )}
        {(['practice', 'masteryTest'] as const).map(kind => lesson[kind].length > 0 && (
          <section key={kind}>
            <div className="label-mono" style={{ marginBottom: 12 }}>{kind === 'practice' ? 'PRACTICE / KNOWLEDGE CHECK' : 'MASTERY CHECK'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {lesson[kind].map(q => (
                <div key={q.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Chip tone={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'MEDIUM' ? 'warning' : 'error'}>{q.difficulty}</Chip>
                    <Chip tone="info">+{q.xp} XP</Chip>
                  </div>
                  <p className="t-body" style={{ color: 'var(--fg-0)', marginBottom: 10 }}>{q.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {q.options.map((o, i) => (
                      <div key={o} className="q-option" style={{ cursor: 'default', borderColor: o === q.correctAnswer ? 'rgba(78,222,163,.55)' : undefined }}>
                        <span className="letter">{LETTERS[i]}</span><span>{o}</span>
                      </div>
                    ))}
                  </div>
                  <p className="t-caption" style={{ marginTop: 8 }}>{q.explanation}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
        {lesson.revision && lesson.revision.length > 0 && (
          <section className="card">
            <div className="label-mono" style={{ marginBottom: 8 }}>REVISION</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>{lesson.revision.map(r => <li key={r} className="t-body-sm">· {r}</li>)}</ul>
          </section>
        )}
      </div>
    </div>
  );
}
