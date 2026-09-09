import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { achievementsData } from '../../data/achievements';
import { PixelWordmark } from '../brand/PixelLogo';
import { Icon } from '../common/Icon';
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
  const { pathname } = useLocation();
  const label = LABELS.find(([p]) => (p === '/' ? pathname === '/' : pathname.startsWith(p)))?.[1] ?? 'LEARNING OS';
  const recent = [...stats.unlockedAchievements].slice(-3).reverse();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, color: 'var(--fg-0)' }}>
        <PixelWordmark size={11} />
        <span style={{ color: 'var(--fg-3)' }}>/</span>
        <span className="label-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="chip chip-success"><Icon name="flame" size={12} /> {stats.streak}D</span>
        <span className="chip chip-info"><Icon name="bolt" size={12} /> {stats.xp.toLocaleString()} XP</span>
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-sm" aria-label="Notifications" onClick={() => setBellOpen(v => !v)}><Icon name="bell" size={18} /></button>
          {bellOpen && (
            <>
              <button className="dialog-scrim" style={{ zIndex: 55, background: 'transparent' }} aria-label="Close notifications" onClick={() => setBellOpen(false)} />
              <div className="dialog" style={{ position: 'absolute', right: 0, top: 44, width: 280, zIndex: 56, padding: 12 }}>
                <div className="label-mono" style={{ padding: '4px 8px 8px' }}>NOTIFICATIONS</div>
                {recent.length === 0 && <p className="t-body-sm" style={{ padding: 8, color: 'var(--fg-2)' }}>No milestones yet.</p>}
                {recent.map(id => {
                  const a = achievementsData.find(x => x.id === id);
                  return a ? (
                    <div key={id} style={{ display: 'flex', gap: 10, padding: 8, alignItems: 'center' }}>
                      <span style={{ color: 'var(--success)' }}><Icon name={a.icon} size={16} /></span>
                      <div><div className="t-body" style={{ color: 'var(--fg-0)' }}>{a.title}</div><div className="t-caption">Milestone unlocked</div></div>
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
