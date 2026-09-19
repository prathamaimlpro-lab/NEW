import { useState } from 'react';
import { ConceptFacets } from '../../components/lesson/ConceptFacets';
import { getRole } from '../../services/authService';
import * as repo from '../../services/contentRepo';
import type { ContentStatus } from '../../content/types';

const EDITABLE = ['topics', 'concepts', 'examples', 'visuals', 'practice', 'projects', 'revisions', 'assessments', 'mastery'] as const;
type K = (typeof EDITABLE)[number];

function blank(k: K): any {
  const id = `${k.slice(0, -1)}-new-${Date.now().toString(36)}`;
  const updatedAt = new Date().toISOString();
  const base = { id, status: 'DRAFT' as ContentStatus, updatedAt };
  switch (k) {
    case 'concepts': return { ...base, title: '', topicIds: [], facets: [], exampleIds: [], visualIds: [], practiceIds: [], projectIds: [], revisionIds: [], prerequisiteConceptIds: [] };
    case 'practice': return { ...base, conceptId: '', difficulty: 'EASY', prompt: '', options: ['', ''], answerIndex: 0, explanation: '' };
    case 'examples': return { ...base, conceptId: '', title: '', kind: 'analogy', body: '' };
    case 'visuals': return { ...base, conceptId: '', visualizationId: '', caption: '' };
    case 'projects': return { ...base, conceptIds: [], title: '', summary: '', requirements: [], xp: 0 };
    case 'revisions': return { ...base, conceptId: '', intervalDays: 7, prompt: '' };
    case 'assessments': return { ...base, lessonId: '', questionIds: [], passThreshold: 70 };
    case 'mastery': return { ...base, conceptId: '', minAccuracy: 80, minApplications: 3, requiresRevision: true, description: '' };
    default: return { ...base, title: '', conceptIds: [] };
  }
}

export default function ContentStudio() {
  const role = getRole();
  const allowed = role === 'content_admin' || role === 'super_admin';
  const [coll, setColl] = useState<K>('concepts');
  const [selId, setSelId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [, bump] = useState(0);
  const refresh = () => bump(x => x + 1);

  if (!allowed) {
    return <div className="card"><p className="t-body">You need the <strong>content_admin</strong> or <strong>super_admin</strong> role to open the Content Studio.</p></div>;
  }

  const items = repo.listCollection(coll) as any[];
  const issues = repo.validate();
  const drafts = repo.listDrafts();

  const open = (id: string | null) => {
    setSelId(id);
    setText(id ? JSON.stringify(repo.getEntity(coll, id), null, 2) : JSON.stringify(blank(coll), null, 2));
    setMsg('');
  };
  const parse = (): any | null => {
    try { return JSON.parse(text); } catch (e) { setMsg('Invalid JSON: ' + (e as Error).message); return null; }
  };
  const run = (fn: () => void, ok: string) => { try { fn(); setMsg(ok); refresh(); } catch (e) { setMsg((e as Error).message); } };
  const preview = coll === 'concepts' ? parse() : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 320px) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="label-mono">Collection</div>
        <select className="input" value={coll} onChange={e => { setColl(e.target.value as K); setSelId(null); setText(''); }}>
          {EDITABLE.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => open(null)}>+ New {coll.slice(0, -1)}</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflowY: 'auto' }}>
          {items.map(it => (
            <button key={it.id} className={`btn btn-sm ${selId === it.id ? 'btn-secondary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }} onClick={() => open(it.id)}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title || it.prompt || it.id}</span>
              <span className="chip" style={{ marginLeft: 'auto' }}>{it.status}</span>
            </button>
          ))}
        </div>
        {drafts.length > 0 && (
          <>
            <div className="label-mono" style={{ marginTop: 8 }}>Drafts (not live)</div>
            {drafts.map(d => (
              <div key={d.key} className="d-micro" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.key}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => run(() => repo.discardDraft(d.key), 'Draft discarded.')}>discard</button>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="label-mono">Editor — {coll}{selId ? ` · ${selId}` : ' · new'}</div>
        <textarea
          className="input-area"
          style={{ minHeight: 260, fontFamily: 'var(--font-mono)', fontSize: 12 }}
          value={text}
          onChange={e => setText(e.target.value)}
          aria-label="Content entity JSON"
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { const e = parse(); if (e) run(() => repo.saveDraft(coll, e), 'Draft saved (learners do not see it).'); }}>Save draft</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { const e = parse(); if (e) run(() => repo.upsertEntity(coll, e), 'Saved.'); }}>Save</button>
          <button className="btn btn-primary btn-sm" onClick={() => { const e = parse(); if (e) run(() => repo.publish(coll, e), 'Published — live for learners.'); }}>Publish</button>
          {selId && <button className="btn btn-secondary btn-sm" onClick={() => run(() => repo.setStatus(coll, selId, 'DEPRECATED'), 'Deprecated (hidden from learners).')}>Deprecate</button>}
          {selId && <button className="btn btn-destructive btn-sm" onClick={() => run(() => repo.removeEntity(coll, selId), 'Removed.')}>Delete</button>}
        </div>
        {msg && <p className="t-body-sm" role="status" style={{ color: msg.startsWith('Invalid') || msg.startsWith('Validation') || msg.startsWith('Not') ? 'var(--danger)' : 'var(--success)' }}>{msg}</p>}

        {issues.length > 0 && (
          <div>
            <div className="label-mono" style={{ marginBottom: 6 }}>Validation</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {issues.slice(0, 12).map((i, idx) => <li key={idx} className="d-micro" style={{ color: i.severity === 'error' ? 'var(--danger)' : 'var(--warning)' }}>{i.message}</li>)}
            </ul>
          </div>
        )}

        {preview && preview.facets && (
          <div>
            <div className="label-mono" style={{ marginBottom: 6 }}>Preview</div>
            <ConceptFacets concept={preview} />
          </div>
        )}
      </div>
    </div>
  );
}
