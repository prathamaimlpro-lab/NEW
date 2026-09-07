import { useState } from 'react';
import { Field, NumInput, SelectInput, TextInput, AreaInput, lines } from '../../components/admin/fields';
import { listVisualizations } from '../../components/visualization/registry';
import { achievementsData } from '../../data/achievements';
import { levels } from '../../data/curriculum';
import { problems } from '../../data/problems';
import { admin, getVizMeta } from '../../services/contentStore';
import { Achievement, Difficulty, Problem } from '../../types';

const DIFFS = ['EASY', 'MEDIUM', 'HARD'].map(d => ({ value: d, label: d }));
const RULES = ['lessons', 'questions', 'problems', 'streak', 'playerLevel', 'xp', 'visualizations'].map(k => ({ value: k, label: k }));

export default function CollectionAdmin() {
  const [tab, setTab] = useState<'problems' | 'achievements' | 'visualizers'>('problems');
  const [editProblem, setEditProblem] = useState<Problem | null>(null);
  const [editAch, setEditAch] = useState<Achievement | null>(null);

  const newProblem = (): Problem => ({ id: `prb-${Date.now()}`, title: 'New Problem', slug: 'new-problem', difficulty: 'EASY', topics: [], subtopics: [], pattern: '', source: 'Admin', collection: 'General', description: '', status: 'PUBLISHED', xp: 20, hints: [], solution: '', options: ['', ''], correctAnswer: '', explanation: '', examples: [], constraints: [], relatedLessons: [], relatedProblems: [], relatedLevel: 'level-1' });
  const newAch = (): Achievement => ({ id: `ach-${Date.now()}`, title: 'New Achievement', description: '', icon: 'award', xp: 0, rule: { kind: 'lessons', value: 1 } });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <h1 className="t-hlg">Collections</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['problems', 'achievements', 'visualizers'] as const).map(t => <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>
      </div>

      {tab === 'problems' && (
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setEditProblem(newProblem())}>+ Problem</button>
          {problems.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <span className="t-body" style={{ color: 'var(--fg-primary)' }}>{p.title} <span className="chip" style={{ marginLeft: 8 }}>{p.difficulty}</span></span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditProblem(JSON.parse(JSON.stringify(p)))}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => admin.deleteProblem(p.id)}>Delete</button>
              </div>
            </div>
          ))}
          {editProblem && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, borderColor: 'var(--border-strong)' }}>
              <Field label="Title"><TextInput value={editProblem.title} onChange={v => setEditProblem({ ...editProblem, title: v })} /></Field>
              <Field label="Description"><AreaInput value={editProblem.description} onChange={v => setEditProblem({ ...editProblem, description: v })} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Field label="Difficulty"><SelectInput value={editProblem.difficulty} onChange={v => setEditProblem({ ...editProblem, difficulty: v as Difficulty })} options={DIFFS} /></Field>
                <Field label="XP"><NumInput value={editProblem.xp} onChange={v => setEditProblem({ ...editProblem, xp: v })} /></Field>
                <Field label="Related level"><SelectInput value={editProblem.relatedLevel} onChange={v => setEditProblem({ ...editProblem, relatedLevel: v })} options={levels.map(l => ({ value: l.id, label: `L${l.number} ${l.title}` }))} /></Field>
              </div>
              <Field label="Topics (comma)"><TextInput value={editProblem.topics.join(', ')} onChange={v => setEditProblem({ ...editProblem, topics: v.split(',').map(x => x.trim()).filter(Boolean) })} /></Field>
              <Field label="Pattern"><TextInput value={editProblem.pattern} onChange={v => setEditProblem({ ...editProblem, pattern: v })} /></Field>
              <Field label="Options (one per line)"><AreaInput rows={4} value={editProblem.options.join('\n')} onChange={v => setEditProblem({ ...editProblem, options: lines(v) })} /></Field>
              <Field label="Correct answer"><SelectInput value={editProblem.correctAnswer} onChange={v => setEditProblem({ ...editProblem, correctAnswer: v })} options={editProblem.options.map(o => ({ value: o, label: o || '—' }))} /></Field>
              <Field label="Explanation"><AreaInput value={editProblem.explanation} onChange={v => setEditProblem({ ...editProblem, explanation: v })} /></Field>
              <Field label="Hints (one per line)"><AreaInput rows={2} value={editProblem.hints.join('\n')} onChange={v => setEditProblem({ ...editProblem, hints: lines(v) })} /></Field>
              <Field label="Solution"><AreaInput rows={2} value={editProblem.solution} onChange={v => setEditProblem({ ...editProblem, solution: v })} /></Field>
              <Field label="Constraints (one per line)"><AreaInput rows={2} value={editProblem.constraints.join('\n')} onChange={v => setEditProblem({ ...editProblem, constraints: lines(v) })} /></Field>
              <Field label="Test cases (input | output per line)"><AreaInput rows={2} value={editProblem.examples.map(e => `${e.input} | ${e.output}`).join('\n')} onChange={v => setEditProblem({ ...editProblem, examples: lines(v).map(l => { const [input, output = ''] = l.split('|'); return { input: input.trim(), output: output.trim() }; }) })} /></Field>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { admin.saveProblem(editProblem); setEditProblem(null); }}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditProblem(null)}>Cancel</button>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'achievements' && (
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setEditAch(newAch())}>+ Achievement</button>
          {achievementsData.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <span className="t-body" style={{ color: 'var(--fg-primary)' }}>{a.title}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditAch(JSON.parse(JSON.stringify(a)))}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => admin.deleteAchievement(a.id)}>Delete</button>
              </div>
            </div>
          ))}
          {editAch && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, borderColor: 'var(--border-strong)' }}>
              <Field label="Title"><TextInput value={editAch.title} onChange={v => setEditAch({ ...editAch, title: v })} /></Field>
              <Field label="Description"><TextInput value={editAch.description} onChange={v => setEditAch({ ...editAch, description: v })} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Field label="Icon"><SelectInput value={editAch.icon} onChange={v => setEditAch({ ...editAch, icon: v })} options={['flag', 'check-circle', 'bolt', 'terminal', 'flame', 'shield', 'award'].map(i => ({ value: i, label: i }))} /></Field>
                <Field label="Bonus XP"><NumInput value={editAch.xp} onChange={v => setEditAch({ ...editAch, xp: v })} /></Field>
                <Field label="Unlock rule"><SelectInput value={editAch.rule?.kind ?? 'lessons'} onChange={v => setEditAch({ ...editAch, rule: { kind: v as 'lessons', value: editAch.rule?.value ?? 1 } })} options={RULES} /></Field>
              </div>
              <Field label="Rule value"><NumInput value={editAch.rule?.value ?? 1} onChange={v => setEditAch({ ...editAch, rule: { kind: editAch.rule?.kind ?? 'lessons', value: v } })} /></Field>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { admin.saveAchievement(editAch); setEditAch(null); }}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditAch(null)}>Cancel</button>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'visualizers' && (
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>Registered visualization engines. XP rewards are editable here; new engines register in code via the visualization registry (architecture already supports it).</p>
          {listVisualizations().map(v => (
            <div key={v.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12, display: 'grid', gridTemplateColumns: 'minmax(0,2fr) 100px auto', gap: 10, alignItems: 'center' }}>
              <div><div className="t-body" style={{ color: 'var(--fg-primary)' }}>{v.title}</div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>{v.category} · controls: {v.controls.join(', ')}</div></div>
              <NumInput value={getVizMeta(v.id, { xpReward: v.xpReward }).xpReward} onChange={val => admin.setVizMeta(v.id, { xpReward: val })} />
              <span className="chip">{v.difficulty}</span>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
