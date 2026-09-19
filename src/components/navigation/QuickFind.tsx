import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { lessons } from '../../data/curriculum';
import { Icon } from '../common/Icon';

const PAGES: { to: string; label: string }[] = [
  { to: '/', label: 'Home' },
  { to: '/learn', label: 'Curriculum' },
  { to: '/practice', label: 'Practice' },
  { to: '/explore', label: 'Explore' },
  { to: '/progress', label: 'Progress' },
  { to: '/profile', label: 'Profile' },
];

export function QuickFind() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const ls = Object.values(lessons)
      .filter(l => l.status === 'PUBLISHED' && (l.title + l.description).toLowerCase().includes(term))
      .slice(0, 6)
      .map(l => ({ to: `/learn/lesson/${l.id}`, label: `Lesson: ${l.title}` }));
    const ps = PAGES.filter(p => p.label.toLowerCase().includes(term)).map(p => ({ to: p.to, label: `Page: ${p.label}` }));
    return [...ps, ...ls].slice(0, 8);
  }, [q]);

  return (
    <>
      <button ref={triggerRef} type="button" className="sb-search" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <Icon name="search" size={14} /> Search lessons and pages
      </button>
      {open && (
        <div className="dialog-scrim" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}>
          <div className="dialog" role="dialog" aria-modal="true" aria-label="Quick find" onClick={e => e.stopPropagation()} style={{ padding: 12 }}>
            <input
              ref={inputRef}
              className="input"
              placeholder="Search lessons and pages…"
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Search lessons and pages"
            />
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {results.length === 0 && q.trim() !== '' && (
                <p className="t-body-sm" style={{ color: 'var(--text-muted)', padding: 8 }}>No matches for “{q}”. Try a lesson topic or page name.</p>
              )}
              {results.map(r => (
                <Link
                  key={r.to}
                  className="lrow"
                  to={r.to}
                  onClick={() => { setOpen(false); navigate(r.to); }}
                >
                  <span className="rail"><span className="dot" style={{ background: 'var(--border-strong)' }} /></span>
                  <span className="d-body" style={{ color: 'var(--text-primary)' }}>{r.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
