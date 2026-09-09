import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';

export type Role = 'student' | 'reviewer' | 'content_admin' | 'super_admin';
export interface Session { email: string; role: Role; mode: 'supabase' | 'local' }

const SKEY = 'it_quest_admin_session';
const AKEY = 'it_quest_admin_accounts';
interface LocalAccount { email: string; hash: string; role: Role }

const PERMS: Record<Role, string[]> = {
  student: [],
  reviewer: ['content.write'],
  content_admin: ['structure.write', 'content.write', 'content.delete'],
  super_admin: ['structure.write', 'content.write', 'content.delete', 'theme.write', 'settings.write'],
};

let cachedRole: Role | null = null;
let cachedSession: Session | null = null;
const listeners = new Set<(s: Session | null) => void>();
export const onAuthChange = (fn: (s: Session | null) => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const emit = (s: Session | null) => { cachedSession = s; listeners.forEach(fn => fn(s)); };

async function sha(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const isSupabaseMode = isSupabaseConfigured;
export function getSession(): Session | null { return cachedSession; }
export function getRole(): Role | null { return cachedRole; }
export function can(action: string): boolean { const r = getRole(); return !!r && PERMS[r].includes(action); }

export async function signUp(email: string, password: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return 'Supabase is not configured on this deployment';
  const { error } = await sb.auth.signUp({ email, password });
  return error ? error.message : null;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return localSignIn(email, password);
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return error.message;
  await refreshSession();
  return null;
}

export async function resetPassword(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return 'Supabase is not configured on this deployment';
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/account' });
  return error ? error.message : null;
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  storageService.set(SKEY, null);
  cachedRole = null;
  emit(null);
}

export async function refreshSession(): Promise<Session | null> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.auth.getSession();
    const user = data.session?.user;
    if (!user) { cachedRole = null; emit(null); return null; }
    const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const role = (profile?.role as Role) ?? 'student';
    cachedRole = role;
    const s: Session = { email: user.email ?? '', role, mode: 'supabase' };
    emit(s);
    return s;
  }
  const local = storageService.get<{ email: string; role: Role; at: number } | null>(SKEY, null);
  if (local && Date.now() - local.at < 12 * 3600_000) {
    cachedRole = local.role;
    const s: Session = { email: local.email, role: local.role, mode: 'local' };
    emit(s);
    return s;
  }
  cachedRole = null;
  emit(null);
  return null;
}

export function initAuth(): Promise<Session | null> {
  const sb = getSupabase();
  if (sb) sb.auth.onAuthStateChange(() => { void refreshSession(); });
  return refreshSession();
}

// ---- DEV MODE ONLY (no backend configured). NOT a security boundary. ----
export const hasLocalAccounts = () => storageService.get<LocalAccount[]>(AKEY, []).length > 0;

export async function bootstrapLocalAdmin(email: string, password: string): Promise<boolean> {
  if (isSupabaseConfigured() || hasLocalAccounts()) return false;
  const accounts = storageService.get<LocalAccount[]>(AKEY, []);
  accounts.push({ email, hash: await sha(password + email), role: 'super_admin' });
  storageService.set(AKEY, accounts);
  storageService.set(SKEY, { email, role: 'super_admin', at: Date.now() });
  cachedRole = 'super_admin';
  emit({ email, role: 'super_admin', mode: 'local' });
  return true;
}

async function localSignIn(email: string, password: string): Promise<string | null> {
  const accounts = storageService.get<LocalAccount[]>(AKEY, []);
  const hash = await sha(password + email);
  const acc = accounts.find(a => a.email === email && a.hash === hash);
  if (!acc) return 'Invalid credentials';
  storageService.set(SKEY, { email: acc.email, role: acc.role, at: Date.now() });
  cachedRole = acc.role;
  emit({ email: acc.email, role: acc.role, mode: 'local' });
  return null;
}
