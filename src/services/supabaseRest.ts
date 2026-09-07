const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
const KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

export const sbEnabled = () => !!URL && !!KEY;

async function req(path: string, init: RequestInit = {}, token?: string) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${token ?? KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json().catch(() => null);
}

export const sbSelect = (table: string, query = '') => req(`${table}?${query}`);
export const sbUpsert = (table: string, rows: unknown[]) => req(table, { method: 'POST', body: JSON.stringify(rows) });
export const sbDelete = (table: string, id: string) => req(`${table}?id=eq.${id}`, { method: 'DELETE' });

export async function sbSignIn(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!res.ok) throw new Error('Authentication failed');
  return res.json();
}
