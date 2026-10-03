import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toasts } from '../feedback/Toasts';
import { BottomTabBar } from '../navigation/BottomTabBar';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';
import { usePlayer } from '../../store/PlayerContext';
import { getLessonProgress } from '../../services/progressService';
import { lessons as dataLessons } from '../../data/lessons';

function FocusHeader({ lessonId }: { lessonId?: string }) {
  const { stats } = usePlayer();
  const lesson = lessonId ? (dataLessons as any)[lessonId] : undefined;
  const progress = lesson ? getLessonProgress(stats, lesson) : 0;
  return (
    <div className="focus-header">
      <a className="btn btn-ghost btn-sm" href={lesson ? `/learn/level/${lesson.levelId}` : '/practice'} aria-label="Back">←</a>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--fs-sm)', color: 'var(--text-2)' }}>
        {lesson ? lesson.title : 'Practice problem'}
      </span>
      <div className="hero-bar" style={{ width: 90 }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Lesson progress">
        <div style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} aria-busy="true" aria-label="Loading">
      <div className="skel" style={{ height: 34, width: '45%' }} />
      <div className="skel" style={{ height: 150 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 16 }}>
        <div className="skel" style={{ height: 90 }} /><div className="skel" style={{ height: 90 }} /><div className="skel" style={{ height: 90 }} />
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { dataState, syncState, retrySync } = usePlayer();
  const { pathname } = useLocation();
  const lessonMatch = pathname.match(/^\/learn\/lesson\/([^/]+)/);
  const inProblem = pathname.startsWith('/practice/problems/');
  const focus = !!lessonMatch || inProblem;

  const [showSkeleton, setShowSkeleton] = useState(false);
  useEffect(() => {
    if (dataState !== 'loading') { setShowSkeleton(false); return; }
    const t = window.setTimeout(() => setShowSkeleton(true), 150);
    return () => window.clearTimeout(t);
  }, [dataState]);

  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <div className={`shell ${focus ? 'focus' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Sidebar />
      <div className="shell-main">
        <Topbar />
        {(offline || syncState === 'error') && (
          <div className="offline-banner" role="status">
            <span>{offline ? 'You are offline. Saved progress is still available on this device.' : 'Connection problem. Your saved progress is still available on this device.'}</span>
            {!offline && <button type="button" className="btn btn-ghost btn-sm" onClick={retrySync}>Retry</button>}
          </div>
        )}
        {focus && <FocusHeader lessonId={lessonMatch?.[1]} />}
        <main id="main" className="page" tabIndex={-1}>
          {dataState === 'loading'
            ? (showSkeleton ? <PageSkeleton /> : null)
            : dataState === 'error' ? (
              <div className="state-error" role="alert">
                <span>We couldn't load your progress.</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={retrySync}>Retry</button>
              </div>
            ) : (
              <Outlet />
            )}
        </main>
      </div>
      <BottomTabBar />
      <Toasts />
    </div>
  );
}
