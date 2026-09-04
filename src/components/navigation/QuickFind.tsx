import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessons } from '../../data/curriculum';
import { Icon } from '../common/Icon';

export function QuickFind() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(v => !v); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const items = useMemo(() => {
    const pages = [
      { label: 'Home', to: '/', tag: 'PAGE' }, { label: 'Learn', to: '/learn', tag: 'PAGE' },
      { label: 'Practice', to: '/practice', tag: 'PAGE' }, { label: 'Progress', to: '/progress', tag: 'PAGE' },
      { label: 'Profile', to: '/profile', tag: 'PAGE' }, { label: 'Explore', to: '/explore', tag: 'PAGE' },
    ];
    const ls = Object.values(lessons).filter(l => l.status === 'PUBLISHED').map(l => ({ label: l.title, to: `/learn/lesson/${l.id}`, tag: 'LESSON' }));
    const all = [...pages, ...ls];
    const q = query.trim().toLowerCase();
    return q ? all.filter(i => i.label.toLowerCase().includes(q)) : all;
  }, [query]);

  const go = (to: string) => { navigate(to); setOpen(false); setQuery(''); };

  return (
    <>
      <button className="sb-search" onClick={() => setOpen(true)} aria-label="Quick find (Ctrl+K)">
        <Icon name="search" size={16} /> <span style={{ flex: 1, textAlign: 'left' }}>Quick Find</span>
        <span className="chip">⌘K</span>
      </button>
      {open && (
        <div className="dialog-scrim" onClick={() => setOpen(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()} role="dialog" aria-label="Quick find">
            <div style={{ padding: 12, borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Icon name="search" size={16} />
              <input ref={inputRef} className="input" style={{ border: 'none', boxShadow: 'none', height: 32 }}
                placeholder="Search pages and lessons…" value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && items[0]) go(items[0].to); }} />
            </div>
            <div style={{ padding: 8, maxHeight: 320, overflowY: 'auto' }}>
              {items.length === 0 && <p className="t-body-sm" style={{ padding: 12, color: 'var(--fg-muted)' }}>No matches for “{query}”.</p>}
              {items.map(i => (
                <button key={i.to} className="q-option" style={{ padding: '10px 12px' }} onClick={() => go(i.to)}>
                  <span className="letter">{i.tag === 'PAGE' ? 'P' : 'L'}</span>
                  <span style={{ flex: 1 }}>{i.label}</span>
                  <span className="label-mono">{i.tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
