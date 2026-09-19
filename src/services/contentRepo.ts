import { buildBundle } from '../content/adapters';
import { validateContent, type ContentIssue } from '../content/validate';
import type { ContentBundle, ContentStatus } from '../content/types';
import { storageService } from './storageService';
import { can } from './authService';

const NEWKEY = 'pixel_content_new_v1';
const DRAFTKEY = 'pixel_content_drafts_v1';

export type EditableKey = 'topics' | 'concepts' | 'examples' | 'visuals' | 'practice' | 'projects' | 'revisions' | 'assessments' | 'mastery';
const EDITABLE: EditableKey[] = ['topics', 'concepts', 'examples', 'visuals', 'practice', 'projects', 'revisions', 'assessments', 'mastery'];

let bundle: ContentBundle | null = null;
let drafts: Record<string, any> = {};

function load(): ContentBundle {
  if (bundle) return bundle;
  const base = buildBundle();
  const stored = storageService.get<Partial<ContentBundle> | null>(NEWKEY, null);
  bundle = { ...base };
  for (const k of EDITABLE) {
    const v = (stored as any)?.[k];
    if (Array.isArray(v)) (bundle as any)[k] = v;
  }
  drafts = storageService.get<Record<string, any>>(DRAFTKEY, {});
  return bundle;
}

function persistNew() {
  const b = load();
  const slice: any = {};
  for (const k of EDITABLE) slice[k] = (b as any)[k];
  storageService.set(NEWKEY, slice);
  storageService.set(DRAFTKEY, drafts);
  void pushRemote(slice);
}

/* Additive, non-fatal Supabase hook: stores the editable slice in a dedicated table
   if it exists. Never deletes/replaces existing schema; RLS still governs access. */
async function pushRemote(slice: any) {
  try {
    const { getSupabase, isSupabaseConfigured } = await import('./supabaseClient');
    if (!isSupabaseConfigured()) return;
    const sb = getSupabase(); if (!sb) return;
    await sb.from('content_studio').upsert({ id: 'bundle', data: slice, updated_at: new Date().toISOString() });
  } catch { /* table optional; local persistence still authoritative for this device */ }
}

export async function hydrateRemote() {
  try {
    const { getSupabase, isSupabaseConfigured } = await import('./supabaseClient');
    if (!isSupabaseConfigured()) return;
    const sb = getSupabase(); if (!sb) return;
    const { data } = await sb.from('content_studio').select('data').eq('id', 'bundle').maybeSingle();
    if (data?.data) { storageService.set(NEWKEY, data.data); bundle = null; load(); }
  } catch { /* ignore */ }
}

function requireWrite(_k: EditableKey) {
  if (!(can('content.write') || can('structure.write'))) throw new Error('Not authorized to edit content.');
}

const LIFECYCLE: ContentStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'DEPRECATED', 'ARCHIVED'];
export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  if (from === to) return true;
  if (from === 'PUBLISHED' && (to === 'DEPRECATED' || to === 'ARCHIVED')) return true;
  return LIFECYCLE.indexOf(to) === LIFECYCLE.indexOf(from) + 1;
}

export function getBundle(): ContentBundle { return load(); }
export function listCollection<K extends EditableKey>(k: K): ContentBundle[K] { return [...(load() as any)[k]]; }
export function getEntity(k: EditableKey, id: string) { return (listCollection(k) as any[]).find(e => e.id === id); }
export function validate(): ContentIssue[] { return validateContent(load()); }

function upsertedArr(arr: any[], rec: any) { const i = arr.findIndex(e => e.id === rec.id); const out = [...arr]; if (i >= 0) out[i] = rec; else out.push(rec); return out; }

export function upsertEntity(k: EditableKey, entity: any) {
  requireWrite(k);
  if (!entity?.id) throw new Error('Entity requires an id.');
  if (!entity.title && !entity.prompt && !entity.name) throw new Error('Entity requires a title, name or prompt.');
  const b = load() as any;
  b[k] = upsertedArr(b[k], { ...entity, updatedAt: new Date().toISOString() });
  persistNew();
}

export function removeEntity(k: EditableKey, id: string) {
  requireWrite(k);
  const b = load() as any;
  b[k] = (b[k] as any[]).filter(e => e.id !== id);
  persistNew();
}

export function setStatus(k: EditableKey, id: string, status: ContentStatus) {
  requireWrite(k);
  const e = getEntity(k, id); if (!e) throw new Error('Entity not found.');
  if (!canTransition(e.status, status)) throw new Error(`Invalid lifecycle transition ${e.status} → ${status}.`);
  upsertEntity(k, { ...e, status });
}

export function saveDraft(k: EditableKey, entity: any) {
  requireWrite(k);
  if (!entity?.id) throw new Error('Draft requires an id.');
  drafts[`${k}:${entity.id}`] = { ...entity, status: entity.status ?? 'DRAFT', updatedAt: new Date().toISOString() };
  persistNew();
}
export function listDrafts() { return Object.entries(drafts).map(([key, value]) => ({ key, value })); }
export function discardDraft(key: string) { requireWrite(key.split(':')[0] as EditableKey); delete drafts[key]; persistNew(); }

/* Publish = validate the whole bundle with this entity applied; block on errors. */
export function publish(k: EditableKey, entity: any) {
  requireWrite(k);
  const candidate = { ...entity, status: 'PUBLISHED' as ContentStatus, updatedAt: new Date().toISOString() };
  const b = load() as any;
  const trial: ContentBundle = { ...b, [k]: upsertedArr(b[k], candidate) };
  const errs = validateContent(trial).filter(i => i.severity === 'error');
  if (errs.length) throw new Error('Validation failed: ' + errs.map(e => e.message).join('; '));
  b[k] = upsertedArr(b[k], candidate);
  delete drafts[`${k}:${candidate.id}`];
  persistNew();
}
