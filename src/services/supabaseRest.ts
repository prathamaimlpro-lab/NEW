import { getSupabase, isSupabaseConfigured } from './supabaseClient';

export const sbEnabled = isSupabaseConfigured;

export async function sbSelect<T = Record<string, unknown>>(table: string, query = ''): Promise<T[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let req = sb.from(table).select('*');
  for (const part of query.split('&').filter(Boolean)) {
    const [k, v] = part.split('=');
    if (k && v) req = req.eq(k, decodeURIComponent(v));
  }
  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function sbUpsert(table: string, rows: unknown[]): Promise<void> {
  const sb = getSupabase();
  if (!sb || rows.length === 0) return;
  const { error } = await sb.from(table).upsert(rows);
  if (error) throw new Error(error.message);
}

export async function sbDelete(table: string, id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
