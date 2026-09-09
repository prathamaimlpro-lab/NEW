import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AreaInput, Field, NumInput, SelectInput, TextInput, lines } from '../../components/admin/fields';
import { LessonPreview } from '../../components/admin/LessonPreview';
import { Icon } from '../../components/common/Icon';
import { lessons } from '../../data/lessons';
import { listVisualizations } from '../../components/visualization/registry';
import { admin, getSettings } from '../../services/contentStore';
import { BlockType, ContentBlock, ContentStatus, Difficulty, Lesson, Question } from '../../types';

const BLOCK_TYPES: BlockType[] = ['paragraph', 'explanation', 'objective', 'why', 'example', 'analogy', 'callout', 'tip', 'warning', 'code', 'summary', 'image', 'video'];
const DIFFS = ['EASY', 'MEDIUM', 'HARD'].map(d => ({ value: d, label: d }));
const STATUSES: ContentStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];
const move = <T,>(arr: T[], i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };

export default function LessonEditor() {
  const { lessonId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const existing = lessonId && lessonId !== 'new' ? lessons[lessonId] : undefined;
  const [draft, setDraft] = useState<Lesson>(() => existing ? JSON.parse(JSON.stringify(existing)) : {
    id: `lesson-${Date.now()}`, levelId: params.get('level') ?? 'level-1', order: 1, title: 'New Lesson', slug: 'new-lesson',
    description: '', objectives: [], topics: [], estimatedMinutes: 10, difficulty: 'EASY', prerequisites: [],
    sections: [{ id: 's1', label: 'START SIMPLE', title: 'Introduction', blocks: [{ type: 'paragraph', content: '' }] }],
    visualizationId: undefined, revision: [], practice: [], masteryTest: [], xpReward: getSettings().xpLesson, status: 'DRAFT', version: 1, updatedAt: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const set = (patch: Partial<Lesson>) => setDraft(d => ({ ...d, ...patch }));
  const vizOptions = useMemo(() => [{ value: '', label: 'None' }, ...listVisualizations().map(v => ({ value: v.id, label: v.title }))], []);

  const save = (publish: boolean) => {
    const final: Lesson = { ...draft, status: publish ? 'PUBLISHED' : draft.status, updatedAt: new Date().toISOString().slice(0, 10) };
    const err = admin.saveLesson(final);
    if (err) { setError(err); return; }
    setError('');
    navigate('/admin/content');
  };

  const setBlock = (si: number, bi: number, patch: Partial<ContentBlock>) => setDraft(d => { const s = [...d.sections]; s[si] = { ...s[si], blocks: s[si].blocks.map((b, i) => i === bi ? { ...b, ...patch } : b) }; return { ...d, sections: s }; });
  const setQuestion = (kind: 'practice' | 'masteryTest', qi: number, patch: Partial<Question>) => setDraft(d => ({ ...d, [kind]: d[kind].map((q, i) => i === qi ? { ...q, ...patch } : q) }));
  const addQuestion = (kind: 'practice' | 'masteryTest', difficulty: Difficulty) => setDraft(d => ({ ...d, [kind]: [...d[kind], { id: `q-${Date.now()}`, lessonId: d.id, difficulty, xp: difficulty === 'EASY' ? getSettings().xpEasy : difficulty === 'MEDIUM' ? getSettings().xpMedium : getSettings().xpHard, question: '', options: ['', ''], correctAnswer: '', explanation: '' }] }));

  const questionEditor = (kind: 'practice' | 'masteryTest', label: string) => (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="label-mono">{label}</span>
        <div style={{ display: 'flex', gap: 6 }}>{DIFFS.map(d => <button key={d.value} className="btn btn-ghost btn-sm" onClick={() => addQuestion(kind, d.value as Difficulty)}>+ {d.label}</button>)}</div>
      </div>
      {draft[kind].map((q, qi) => (
        <div key={q.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Question"><AreaInput rows={2} value={q.question} onChange={v => setQuestion(kind, qi, { question: v })} /></Field>
          <Field label="Options (one per line)"><AreaInput rows={4} value={q.options.join('\n')} onChange={v => setQuestion(kind, qi, { options: lines(v) })} /></Field>
          <Field label="Correct answer"><SelectInput value={q.correctAnswer} onChange={v => setQuestion(kind, qi, { correctAnswer: v })} options={q.options.map(o => ({ value: o, label: o || '—' }))} /></Field>
          <Field label="Explanation"><AreaInput rows={2} value={q.explanation} onChange={v => setQuestion(kind, qi, { explanation: v })} /></Field>
          <Field label="Hint (optional)"><TextInput value={q.hint ?? ''} onChange={v => setQuestion(kind, qi, { hint: v })} /></Field>
          <div style={{ display: 'flex', gap: 8 }}>
            <SelectInput value={q.difficulty} onChange={v => setQuestion(kind, qi, { difficulty: v as Difficulty })} options={DIFFS} />
            <NumInput value={q.xp} onChange={v => setQuestion(kind, qi, { xp: v })} />
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => setDraft(d => ({ ...d, [kind]: d[kind].filter((_, i) => i !== qi) }))}>Delete</button>
          </div>
        </div>
      ))}
    </section>
  );

  if (preview) {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="t-hlg">Preview</h1>
          <button className="btn btn-secondary" onClick={() => setPreview(false)}><Icon name="chevron-left" size={14} /> Back to editor</button>
        </div>
        <LessonPreview lesson={draft} />
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <h1 className="t-hlg">Lesson Editor</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/content')}>Back</button>
          <button className="btn btn-secondary" onClick={() => setPreview(true)}><Icon name="explore" size={14} /> Preview</button>
          <button className="btn btn-secondary" onClick={() => save(false)}>Save</button>
          <button className="btn btn-primary" onClick={() => save(true)}>Save & Publish</button>
        </div>
      </div>
      {error && <div className="card" style={{ borderColor: 'rgba(239,107,107,.5)' }}><p className="t-body" style={{ color: 'var(--error)' }}>{error}</p></div>}

      <section className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12 }}>
        <Field label="Title"><TextInput value={draft.title} onChange={v => set({ title: v })} /></Field>
        <Field label="Description"><TextInput value={draft.description} onChange={v => set({ description: v })} /></Field>
        <Field label="Status"><SelectInput value={draft.status} onChange={v => set({ status: v as ContentStatus })} options={STATUSES.map(s => ({ value: s, label: s }))} /></Field>
        <Field label="Difficulty"><SelectInput value={draft.difficulty} onChange={v => set({ difficulty: v as Difficulty })} options={DIFFS} /></Field>
        <Field label="XP reward"><NumInput value={draft.xpReward} onChange={v => set({ xpReward: v })} /></Field>
        <Field label="Minutes"><NumInput value={draft.estimatedMinutes} onChange={v => set({ estimatedMinutes: v })} /></Field>
        <Field label="Visualization"><SelectInput value={draft.visualizationId ?? ''} onChange={v => set({ visualizationId: v || undefined })} options={vizOptions} /></Field>
        <Field label="Objectives (one per line)"><AreaInput rows={2} value={draft.objectives.join('\n')} onChange={v => set({ objectives: lines(v) })} /></Field>
        <Field label="Topics (comma separated)"><TextInput value={draft.topics.join(', ')} onChange={v => set({ topics: v.split(',').map(x => x.trim()).filter(Boolean) })} /></Field>
        <Field label="Prerequisites (lesson ids, comma)"><TextInput value={draft.prerequisites.join(', ')} onChange={v => set({ prerequisites: v.split(',').map(x => x.trim()).filter(Boolean) })} /></Field>
        <Field label="Revision points (one per line)"><AreaInput rows={2} value={(draft.revision ?? []).join('\n')} onChange={v => set({ revision: lines(v) })} /></Field>
      </section>

      {draft.sections.map((s, si) => (
        <section key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
            <Field label="Section label"><TextInput value={s.label ?? ''} onChange={v => setDraft(d => { const x = [...d.sections]; x[si] = { ...x[si], label: v }; return { ...d, sections: x }; })} /></Field>
            <Field label="Section title"><TextInput value={s.title ?? ''} onChange={v => setDraft(d => { const x = [...d.sections]; x[si] = { ...x[si], title: v }; return { ...d, sections: x }; })} /></Field>
            <div style={{ alignSelf: 'end', display: 'flex', gap: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setDraft(d => { const x = [...d.sections]; move(x, si, -1); return { ...d, sections: x }; })} aria-label="Section up"><Icon name="chevron-left" size={14} /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => setDraft(d => { const x = [...d.sections]; move(x, si, 1); return { ...d, sections: x }; })} aria-label="Section down"><Icon name="chevron-right" size={14} /></button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => setDraft(d => ({ ...d, sections: d.sections.filter((_, i) => i !== si) }))} aria-label="Delete section"><Icon name="x" size={14} /></button>
            </div>
          </div>
          {s.blocks.map((b, bi) => (
            <div key={bi} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <SelectInput value={b.type} onChange={v => setBlock(si, bi, { type: v as BlockType })} options={BLOCK_TYPES.map(t => ({ value: t, label: t }))} />
                {(b.type === 'image' || b.type === 'video') && <div style={{ flex: 1 }}><TextInput value={b.url ?? ''} onChange={v => setBlock(si, bi, { url: v })} placeholder="https://… media URL" /></div>}
                {b.type === 'code' && <TextInput value={b.language ?? 'text'} onChange={v => setBlock(si, bi, { language: v })} placeholder="language" />}
                <button className="btn btn-ghost btn-sm" onClick={() => setDraft(d => { const x = [...d.sections]; const bl = [...x[si].blocks]; move(bl, bi, -1); x[si] = { ...x[si], blocks: bl }; return { ...d, sections: x }; })} aria-label="Block up"><Icon name="chevron-left" size={14} /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => setDraft(d => { const x = [...d.sections]; const bl = [...x[si].blocks]; move(bl, bi, 1); x[si] = { ...x[si], blocks: bl }; return { ...d, sections: x }; })} aria-label="Block down"><Icon name="chevron-right" size={14} /></button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => setDraft(d => { const x = [...d.sections]; x[si] = { ...x[si], blocks: x[si].blocks.filter((_, i) => i !== bi) }; return { ...d, sections: x }; })} aria-label="Delete block"><Icon name="x" size={14} /></button>
              </div>
              <AreaInput rows={3} value={b.content ?? ''} onChange={v => setBlock(si, bi, { content: v })} />
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={() => setDraft(d => { const x = [...d.sections]; x[si] = { ...x[si], blocks: [...x[si].blocks, { type: 'paragraph', content: '' }] }; return { ...d, sections: x }; })}>+ Block</button>
        </section>
      ))}
      <button className="btn btn-secondary" onClick={() => setDraft(d => ({ ...d, sections: [...d.sections, { id: `s-${Date.now()}`, label: 'SECTION', title: '', blocks: [{ type: 'paragraph', content: '' }] }] }))}>+ Section</button>

      {questionEditor('practice', 'PRACTICE QUESTIONS (EASY / MEDIUM / HARD)')}
      {questionEditor('masteryTest', 'MASTERY CHECK')}
    </>
  );
    }
