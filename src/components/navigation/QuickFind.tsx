import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { levels, worlds } from '../../data/curriculum';
import { problems } from '../../data/problems';
import { getCurrentLearningState } from '../../services/dashboardService';
import { storageService } from '../../services/storageService';
import { usePlayer } from '../../store/PlayerContext';
import '../../styles/quickfind.css';

interface Item { group: string; label: string; sub?: string; to: string }
const RECENT_KEY = 'pixel_recent_search';

export function QuickFind() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { stats } = usePlayer();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recents = useMemo<Item[]>(() => (open ? storageService.get<Item[]>(RECENT_KEY, []) : []), [open]);

  const suggestions = useMemo<Item[]>(() => {
    const cont = getCurrentLearningState(stats);
    const s: Item[] = [];
    if (cont) s.push({ group: 'Suggestions', label: `Continue lesson: ${cont.lessonTitle}`, sub: 'Your current position', to: `/learn/lesson/${cont.lessonId}` });
    s.push({ group: 'Suggestions', label: 'Practice', sub: 'Questions, assessments and revision', to: '/practice' });
    s.push({ group: 'Suggestions', label: 'Curriculum', sub: 'Worlds and levels', to: '/learn' });
    return s;
  }, [stats]);

  const results = useMemo<Item[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const pages: Item[] = [
      { group: 'Pages', label: 'Home', to: '/' },
      { group: 'Pages', label: 'Curriculum', to: '/learn' },
      { group: 'Pages', label: 'Practice', to: '/practice' },
      { group: 'Pages', label: 'Visualizations', to: '/explore' },
      { group: 'Pages', label: 'Knowledge graph', to: '/graph' },
      { group: 'Pages', label: 'Projects', to: '/projects' },
      { group: 'Pages', label: 'Progress', to: '/progress' },
      { group: 'Pages', label: 'Profile', to: '/profile' },
      { group: 'Pages', label: 'Settings', to: '/settings' },
    ].filter(p => p.label.toLowerCase().includes(query));
    const ws: Item[] = worlds.filter(w => w.title.toLowerCase().includes(query))
      .map(w => ({ group: 'Worlds', label: `World ${w.number} · ${w.title}`, to: '/learn' }));
    const ls: Item[] = levels.filter(l => l.title.toLowerCase().includes(query))
      .map(l => ({ group: 'Levels', label: `Level ${l.number} · ${l.title}`, to: `/learn/level/${l.id}` }));
    const qs: Item[] = problems.filter(p => p.title.toLowerCase().includes(query)).slice(0, 8)
      .map(p => ({ group: 'Questions', label: p.title, sub: (p.topics ?? []).slice(0, 2).join(' · '), to: `/practice/problems/${p.id}` }));
    return [...pages, ...ws, ...ls, ...qs].slice(0, 12);
  }, [q]);

  const items = q.trim() ? results : [...recents.slice(0, 4), ...suggestions];

  const close = () => { setOpen(false); setQ(''); setActive(0); triggerRef.current?.focus(); };

  const select = (item: Item) => {
    const all = storageService.get<Item[]>(RECENT_KEY, []);
    const next = [item, ...all.filter(r => r.to !== item.to)].slice(0, 6);
    storageService.set(RECENT_KEY, next);
    close();
    navigate(item.to);
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (items[active]) select(items[active]); }
  };

  let lastGroup = '';

  return (
    <>
      <button ref={triggerRef} type="button" className="sb-search" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Search lessons, concepts, projects…</span>
        <span className="sb-kbd" aria-hidden="true">⌘K</span>
      </button>

      {open && (
        <>
          <button type="button" className="qf-scrim" aria-label="Close search" onClick={close} />
          <div className="qf-dialog" role="dialog" aria-modal="true" aria-label="Search Pixel">
            <div className="qf-head">
              <button type="button" className="qf-back" onClick={close} aria-label="Close search">←</button>
              <input
                ref={inputRef}
                value={q}
                onChange={e => { setQ(e.target.value); setActive(0); }}
                onKeyDown={onInputKey}
                role="combobox"
                aria-expanded="true"
                aria-controls="qf-list"
                aria-activedescendant={items[active] ? `qf-opt-${active}` : undefined}
                aria-autocomplete="list"
                placeholder="Search pages, worlds, levels, questions"
              />
            </div>
            <div id="qf-list" className="qf-list" role="listbox" aria-label="Search results">
              {items.length === 0 && (
                <div className="qf-empty">
                  No results for "{q}".
                  <button type="button" className="qf-item" style={{ marginTop: 8 }} onClick={() => select({ group: 'Pages', label: 'Curriculum', to: '/learn' })}>
                    <span>Closest page: Curriculum</span>
                    <span className="qf-item-sub">Browse worlds and levels</span>
                  </button>
                </div>
              )}
              {items.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                return (
                  <div key={`${item.group}-${item.to}-${item.label}`}>
                    {header && <div className="qf-group">{header}</div>}
                    <button
                      type="button"
                      id={`qf-opt-${i}`}
                      role="option"
                      aria-selected={i === active}
                      className="qf-item"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => select(item)}
                    >
                      <span>{item.label}</span>
                      {item.sub && <span className="qf-item-sub">{item.sub}</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
