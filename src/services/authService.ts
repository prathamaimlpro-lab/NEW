import { storageService } from './storageService';

export type Role = 'super-admin' | 'content-admin' | 'moderator';
const SKEY = 'it_quest_admin_session';
const AKEY = 'it_quest_admin_accounts';
interface Account { email: string; hash: string; role: Role }

async function sha(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const hasAccounts = () => storageService.get<Account[]>(AKEY, []).length > 0;

export async function bootstrapAdmin(email: string, password: string): Promise<boolean> {
  if (hasAccounts()) return false;
  const accounts = storageService.get<Account[]>(AKEY, []);
  accounts.push({ email, hash: await sha(password + email), role: 'super-admin' });
  storageService.set(AKEY, accounts);
  return true;
}

export async function login(email: string, password: string): Promise<Role | null> {
  const accounts = storageService.get<Account[]>(AKEY, []);
  const acc = accounts.find(a => a.email === email && a.hash === await sha(password + email));
  if (!acc) return null;
  storageService.set(SKEY, { email: acc.email, role: acc.role, at: Date.now() });
  return acc.role;
}

export function logout() { storageService.set(SKEY, null); }

export function getSession(): { email: string; role: Role } | null {
  const s = storageService.get<{ email: string; role: Role; at: number } | null>(SKEY, null);
  if (!s) return null;
  if (Date.now() - s.at > 12 * 3600_000) { logout(); return null; }
  return { email: s.email, role: s.role };
}

export const getRole = (): Role | null => getSession()?.role ?? null;

const PERMS: Record<Role, string[]> = {
  'super-admin': ['structure.write', 'content.write', 'content.delete', 'theme.write', 'settings.write'],
  'content-admin': ['structure.write', 'content.write', 'content.delete'],
  moderator: ['content.write'],
};
export const can = (action: string): boolean => { const r = getRole(); return !!r && PERMS[r].includes(action); };
