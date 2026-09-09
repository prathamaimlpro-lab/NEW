import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, NumInput, SelectInput, TextInput } from '../../components/admin/fields';
import { Icon } from '../../components/common/Icon';
import { levels, worlds } from '../../data/curriculum';
import { lessons } from '../../data/lessons';
import { can } from '../../services/authService';
import { admin } from '../../services/contentStore';
import { ContentStatus, Difficulty, Level, World } from '../../types';

const DIFFS = ['EASY', 'MEDIUM', 'HARD'].map(d => ({ value: d, label: d }));
const STATUSES: ContentStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

export default function ContentAdmin() {
  const [worldSel, setWorldSel] = useState(worlds[0]?.id ?? '');
  const [levelSel, setLevelSel] = useState('');
  const [error, setError] = useState('');
  const canStruct = can('structure.write'); const canDel = can('content.delete');
  const worldLevels = levels.filter(l => l.worldId === worldSel);
  const levelLessons = levelSel ? Object.values(lessons).filter(x => x.levelId === levelSel) : [];
  const run = (err: string | null) => setError(err ?? '');

  const addWorld = () => run(admin.createWorld({ id: `world-${Date.now()}`, number: worlds.length + 1, title: 'New World', description: '', levelRange: [1, 10], icon: 'explore' } as World));
  const addLevel = () => run(admin.createLevel({ id: `level-${Date.now()}`, number: (worldLevels.length ? worldLevels[worldLevels.length - 1].number : 0) + 1, worldId: worldSel, title: 'New Level', description: '', difficulty: 'EASY', estimatedHours: 5, status: 'DRAFT', prerequisites: [], lessons: [], projects: [], xpReward: 50 } as Level));

  return (
    <>
      <div><div className="label-mono" style={{ marginBottom: 8 }}>STRUCTURE</div><h1 className="t-hlg">Worlds · Levels · Lessons</h1>
        <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--fg-2)' }}>Learners only see PUBLISHED levels and lessons. Drafts and archived items stay here in the Control Plane.</p></div>
      {error && <div className="card" style={{ borderColor: 'rgba(239,107,107,.5)' }}><p className="t-body" style={{ color: 'var(--error)' }}>{error}</p></div>}

      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="label-mono">WORLDS</span>{canStruct && <button className="btn btn-secondary btn-sm" onClick={addWorld}>+ World</button>}</div>
        {worlds.map(w => (
          <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '60px minmax(0,2fr) minmax(0,3fr) auto', gap: 8, alignItems: 'center' }}>
            <TextInput value={String(w.number)} onChange={v => run(admin.updateWorld(w.id, { number: Number(v) }))} />
            <TextInput value={w.title} onChange={v => run(admin.updateWorld(w.id, { title: v }))} />
            <TextInput value={w.description} onChange={v => run(admin.updateWorld(w.id, { description: v }))} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setWorldSel(w.id)}>Levels</button>
              {canDel && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => run(admin.deleteWorld(w.id))} aria-label="Delete world"><Icon name="x" size={14} /></button>}
            </div>
          </div>
        ))}
      </section>

      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="label-mono">LEVELS IN WORLD</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <SelectInput value={worldSel} onChange={setWorldSel} options={worlds.map(w => ({ value: w.id, label: w.title }))} />
            {canStruct && <button className="btn btn-secondary btn-sm" onClick={addLevel}>+ Level</button>}
          </div>
        </div>
        {worldLevels.map((l, i) => (
          <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '52px minmax(0,2fr) 110px 90px 80px auto', gap: 8, alignItems: 'center' }}>
            <TextInput value={String(l.number)} onChange={v => run(admin.updateLevel(l.id, { number: Number(v) }))} />
            <TextInput value={l.title} onChange={v => run(admin.updateLevel(l.id, { title: v }))} />
            <SelectInput value={l.status} onChange={v => run(admin.updateLevel(l.id, { status: v as ContentStatus }))} options={STATUSES.map(s => ({ value: s, label: s }))} />
            <SelectInput value={l.difficulty} onChange={v => run(admin.updateLevel(l.id, { difficulty: v as Difficulty }))} options={DIFFS} />
            <NumInput value={l.estimatedHours} onChange={v => run(admin.updateLevel(l.id, { estimatedHours: v }))} />
            <div style={{ display: 'flex', gap: 4 }}>
              {canStruct && <><button className="btn btn-ghost btn-sm" onClick={() => run(admin.moveLevel(l.id, -1))} disabled={i === 0} aria-label="Move up"><Icon name="chevron-left" size={14} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => run(admin.moveLevel(l.id, 1))} disabled={i === worldLevels.length - 1} aria-label="Move down"><Icon name="chevron-right" size={14} /></button></>}
              <button className="btn btn-ghost btn-sm" onClick={() => setLevelSel(l.id)}>Lessons</button>
              {canDel && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => run(admin.deleteLevel(l.id))} aria-label="Delete level"><Icon name="x" size={14} /></button>}
            </div>
          </div>
        ))}
      </section>

      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="label-mono">LESSONS IN LEVEL</span>
          {levelSel && <Link className="btn btn-primary btn-sm" to={`/admin/content/lesson/new?level=${levelSel}`}>+ Lesson</Link>}
        </div>
        {levelLessons.length === 0 && <p className="t-body-sm" style={{ color: 'var(--fg-2)' }}>Select a level above, or create one, then add lessons.</p>}
        {levelLessons.map((ls, i) => (
          <div key={ls.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <span className="t-body" style={{ color: 'var(--fg-0)' }}>{ls.title} <span className="chip" style={{ marginLeft: 8 }}>{ls.status}</span></span>
            <div style={{ display: 'flex', gap: 6 }}>
              {canStruct && <><button className="btn btn-ghost btn-sm" onClick={() => run(admin.moveLesson(ls.levelId, ls.id, -1))} disabled={i === 0} aria-label="Move lesson up"><Icon name="chevron-left" size={14} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => run(admin.moveLesson(ls.levelId, ls.id, 1))} disabled={i === levelLessons.length - 1} aria-label="Move lesson down"><Icon name="chevron-right" size={14} /></button></>}
              <Link className="btn btn-secondary btn-sm" to={`/admin/content/lesson/${ls.id}`}>Edit</Link>
              {canDel && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => run(admin.deleteLesson(ls.id))} aria-label="Delete lesson"><Icon name="x" size={14} /></button>}
            </div>
          </div>
        ))}
      </section>
      <Field label=""><span /></Field>
    </>
  );
}
