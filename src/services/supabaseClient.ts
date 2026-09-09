import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => url.length > 0 && anon.length > 0;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
