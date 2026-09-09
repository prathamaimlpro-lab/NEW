import { PlayerStats } from '../types';
import { getSupabase } from './supabaseClient';

export interface RemoteProgress { stats: PlayerStats; updatedAt: number }

export async function loadRemoteProgress(): Promise<RemoteProgress | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await sb.from('trackers').select('data, updated_at').eq('user_id', user.id).maybeSingle();
  if (error || !data) return null;
  return { stats: data.data as PlayerStats, updatedAt: new Date(String(data.updated_at)).getTime() };
}

export async function saveRemoteProgress(stats: PlayerStats): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  const { error } = await sb.from('trackers').upsert(
    { user_id: user.id, data: stats, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) throw new Error(error.message);
}
