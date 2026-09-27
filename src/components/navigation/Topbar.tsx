import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { achievementsData } from '../../data/achievements';
import { getCurrentLearningState } from '../../services/dashboardService';
import { PixelWordmark } from '../brand/PixelLogo';
import { Icon } from '../common/Icon';
import { QuickFind } from './QuickFind';
import { usePlayer } from '../../store/PlayerContext';

const LABELS: [string, string][] = [
  ['/learn/lesson', 'LESSON'], ['/learn/level', 'LEVEL'], ['/learn', 'CURRICULUM'],
  ['/practice/problems', 'PROBLEM'], ['/practice', 'PRACTICE'], ['/progress', 'PROGRESS'],
  ['/achievements', 'MILESTONES'], ['/profile', 'PROFILE'], ['/explore/viz', 'VISUALIZATION LAB'],
  ['/explore', 'EXPLORE'], ['/', 'LEARNING OS'],
];

export function Topbar() {
  const { stats } = usePlayer();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const routeLabel = LABELS.find(([p]) => (p === '/' ? pathname === '/' : pathname.startsWith(p)))?.[1] ?? 'LEARNING OS';
  const cont = getCurrentLearningState(stats);
  const context = cont ? `W${cont.worldNumber} · Level ${cont.levelNumber} · ${cont.lessonTitle}` : routeLabel;
  const recent = [...stats.unlockedAchievements].slice(-3).reverse();

  useEffect(() => {
    if (!bellOpen) return;
    popRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setBellOpen(false); bellRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bellOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        (document.querySelector('.tb-search button') as HTMLButtonElement | null)?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, color: 'var(--text-primary)' }}>
        <PixelWordmark size={11} />
        <span style={{ color: 'var(--text-subtle)' }} aria-hidden="true">/</span>
        <span className="label-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{context}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="chip chip-success"><Icon name="flame" size={12} /> {stats.streak}D</span>
        <span className="chip"><Icon name="bolt" size={12} /> {stats.xp.toLocaleString()} XP</span>
        <div className="tb-search"><QuickFind /></div>
        <div style={{ position: 'relative' }}>
          <button ref={bellRef} type="button" className="btn btn-ghost btn-icon" aria-label="Notifications" aria-expanded={bellOpen} aria-haspopup="dialog" onClick={() => setBellOpen(v => !v)}>
            <Icon name="bell" size={18} />
          </button>
          {bellOpen && (
            <>
              <button type="button" className="dialog-scrim" style={{ zIndex: 55, background: 'transparent' }} aria-label="Close notifications" onClick={() => { setBellOpen(false); bellRef.current?.focus(); }} />
              <div ref={popRef} tabIndex={-1} role="dialog" aria-label="Notifications" className="dialog" style={{ position: 'absolute', right: 0, top: 44, width: 280, zIndex: 56, padding: 12 }}>
                <div className="label-mono" style={{ padding: '4px 8px 8px' }}>NOTIFICATIONS</div>
                {recent.length === 0 && <p className="t-body-sm" style={{ padding: 8, color: 'var(--text-secondary)' }}>No milestones yet.</p>}
                {recent.map(id => {
                  const a = achievementsData.find(x => x.id === id);
                  return a ? (
                    <div key={id} style={{ display: 'flex', gap: 10, padding: 8, alignItems: 'center' }}>
                      <span aria-hidden="true" style={{ color: 'var(--success)' }}><Icon name={a.icon} size={16} /></span>
                      <div><div className="t-body" style={{ color: 'var(--text-primary)' }}>{a.title}</div><div className="t-caption">Milestone unlocked</div></div>
                    </div>
                  ) : null;
                })}
              </div>
            </>
          )}
        </div>
        <Link to="/profile" aria-label="Open profile" className="avatar"><Icon name="profile" size={18} /></Link>
      </div>
    </header>
  );
}
