import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePlayer } from '../../store/PlayerContext';
import { achievementsData } from '../../data/achievements';
import { Icon } from '../common/Icon';

const LABELS: [string, string][] = [
  ['/learn/lesson', 'LESSON WORKSPACE'], ['/learn/level', 'LEVEL DETAIL'], ['/learn', 'CURRICULUM CONSOLE'],
  ['/practice', 'PRACTICE RANGE'], ['/progress', 'TELEMETRY'], ['/achievements', 'MILESTONES'],
  ['/profile', 'OPERATOR PROFILE'], ['/explore', 'EXPLORATION LAB'], ['/', 'LEARNING OS'],
];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { stats } = usePlayer();
  const [bellOpen, setBellOpen] = useState(false);
  const { pathname } = useLocation();
  const label = LABELS.find(([p]) => p === '/' ? pathname === '/' : pathname.startsWith(p))?.[1] ?? 'LEARNING OS';
  const recent = [...stats.unlockedAchievements].slice(-3).reverse();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button className="btn btn-ghost btn-sm" style={{ display: 'none' }} aria-label="Open navigation" onClick={onMenu}
          ref={el => { if (el) el.style.display = window.matchMedia('(max-width: 1023px)').matches ? 'inline-flex' : 'none'; }}>
          <Icon name="menu" size={20} />
        </button>
        <span className="label-mono" style={{ color: 'var(--fg-primary)' }}>IT QUEST</span>
        <span className="label-mono">/</span>
        <span className="label-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="chip chip-success"><Icon name="flame" size={12} /> {stats.streak} DAYS</span>
        <span className="chip chip-primary"><Icon name="bolt" size={12} /> {stats.xp.toLocaleString()} XP</span>
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-sm" aria-label="Notifications" onClick={() => setBellOpen(v => !v)}>
            <Icon name="bell" size={18} />
          </button>
          {bellOpen && (
            <>
              <button className="scrim" style={{ zIndex: 55 }} aria-label="Close notifications" onClick={() => setBellOpen(false)} />
              <div className="dialog" style={{ position: 'absolute', right: 0, top: 40, width: 280, zIndex: 56, padding: 12 }}>
                <div className="label-mono" style={{ padding: '4px 8px 8px' }}>NOTIFICATIONS</div>
                {recent.length === 0 && <p className="t-body-sm" style={{ padding: 8, color: 'var(--fg-muted)' }}>No milestones yet. Complete your first lesson.</p>}
                {recent.map(id => {
                  const a = achievementsData.find(x => x.id === id);
                  return a ? (
                    <div key={id} style={{ display: 'flex', gap: 10, padding: 8, alignItems: 'center' }}>
                      <span style={{ color: 'var(--success)' }}><Icon name={a.icon} size={16} /></span>
                      <div><div className="t-body" style={{ color: 'var(--fg-primary)' }}>{a.title}</div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Milestone unlocked</div></div>
                    </div>
                  ) : null;
                })}
              </div>
            </>
          )}
        </div>
        <Link to="/profile" aria-label="Open profile" style={{ borderRadius: '50%', boxShadow: '0 0 0 1px var(--border-strong)' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-subtle)', color: '#a5a1ff' }}>
            <Icon name="profile" size={18} />
          </span>
        </Link>
      </div>
    </header>
  );
}
