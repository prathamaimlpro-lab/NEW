import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { achievementsData } from '../data/achievements';
import { getSession, signOut } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { usePlayer } from '../store/PlayerContext';
import '../styles/profile8.css';

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
};
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function Profile() {
  const player = usePlayer();
  const { stats } = player;
  const resetProgress = (player as any).resetProgress ?? (player as any).reset ?? null;
  const session = getSession();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => { setOpen(false); setText(''); triggerRef.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const confirmReset = () => { if (typeof resetProgress === 'function') resetProgress(); close(); };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bestStreak = Math.max(stats.bestStreak ?? 0, stats.streak ?? 0);
  const correct = Object.values(stats.practice).filter(r => r.correct).length;
  const solvedProblems = Object.values(stats.problems).filter(r => r.solved).length;
  const milestones = stats.unlockedAchievements
    .map(id => achievementsData.find(a => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="pf-cards">
      <header className="ui-statement">
        <h1 className="ui-h1">Profile</h1>
        <p className="ui-desc">
          Your learning summary{isSupabaseConfigured() ? ', synced to your account.' : ', stored on this device.'}
        </p>
      </header>

      <section className="pf-card" aria-label="Account">
        <h2 className="ui-h2">Account</h2>
        <div className="pf-rows">
          <div className="pf-row"><span>Learner</span><strong>{session?.email ?? 'Local learner'}</strong></div>
          <div className="pf-row"><span>Level</span><strong>{stats.level}</strong></div>
          <div className="pf-row"><span>XP</span><strong>{stats.xp.toLocaleString()}</strong></div>
          <div className="pf-row"><span>Current streak</span><strong>{plural(stats.streak, 'day')}</strong></div>
          <div className="pf-row"><span>Best streak</span><strong>{plural(bestStreak, 'day')}</strong></div>
          <div className="pf-row"><span>Learning since</span><strong>{fmtDate(stats.firstActiveDate)}</strong></div>
          <div className="pf-row"><span>Storage</span><strong>{isSupabaseConfigured() ? 'Supabase account' : 'This device only'}</strong></div>
        </div>
        {session && (
          <div className="pf-actions">
            <button type="button" className="btn btn-secondary" onClick={async () => { await signOut(); }}>Sign out</button>
          </div>
        )}
      </section>

      <section className="pf-card" aria-label="Milestones">
        <h2 className="ui-h2">Milestones</h2>
        {milestones.length === 0 ? (
          <p className="ui-desc">No milestones yet. They unlock as you complete lessons and practice.</p>
        ) : (
          <div className="pf-milestones">
            {milestones.map(a => (
              <div key={a.id} className="pf-milestone">
                <span aria-hidden="true" style={{ color: 'var(--ok)' }}>✓</span>
                <span><strong>{a.title}</strong>{a.description ? ` · ${a.description}` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pf-card" aria-label="Your data">
        <h2 className="ui-h2">Your data</h2>
        <div className="pf-rows">
          <div className="pf-row"><span>Lessons completed</span><strong>{plural(stats.completedLessons.length, 'lesson')}</strong></div>
          <div className="pf-row"><span>Questions correct</span><strong>{plural(correct, 'question')}</strong></div>
          <div className="pf-row"><span>Problems solved</span><strong>{plural(solvedProblems, 'problem')}</strong></div>
          <div className="pf-row"><span>Projects completed</span><strong>{plural(stats.completedProjects.length, 'project')}</strong></div>
          <div className="pf-row"><span>Visualizations completed</span><strong>{plural(stats.completedVisualizations.length, 'visualization')}</strong></div>
        </div>
        <div className="pf-actions">
          <Link className="btn btn-secondary" to="/progress">View progress</Link>
          <button type="button" className="btn btn-secondary" onClick={exportData}>Export data (JSON)</button>
        </div>
      </section>

      <section className="pf-card pf-danger" aria-label="Danger zone">
        <h2 className="ui-h2">Danger zone</h2>
        <p className="ui-desc">Resetting clears lessons, practice, projects and activity on this device only. This cannot be undone.</p>
        <div className="pf-actions">
          <button ref={triggerRef} type="button" className="btn btn-destructive" onClick={() => setOpen(true)}>
            Reset local progress
          </button>
        </div>
      </section>

      {open && (
        <>
          <button type="button" className="dialog-scrim" style={{ zIndex: 59, background: 'rgba(4,5,6,.66)' }} aria-label="Cancel reset" onClick={close} />
          <div className="pf-modal" role="dialog" aria-modal="true" aria-label="Reset local progress">
            <div className="sheet-handle" aria-hidden="true" />
            <h2 className="ui-h2">Reset local progress?</h2>
            <p className="ui-desc">Type RESET to confirm. Everything on this device will be cleared.</p>
            <label className="ui-index" htmlFor="reset-confirm">Confirmation</label>
            <input id="reset-confirm" className="input" value={text} onChange={e => setText(e.target.value)} autoComplete="off" placeholder="RESET" />
            <div className="pf-modal-actions">
              <button ref={cancelRef} type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
              <button type="button" className="btn btn-destructive" disabled={text !== 'RESET' || typeof resetProgress !== 'function'} onClick={confirmReset}>
                Reset progress
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
