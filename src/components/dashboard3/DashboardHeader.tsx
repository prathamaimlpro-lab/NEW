import { useDashboardData } from '../../dashboard/useDashboard';

/*
 * Page-level context row only. Streak/XP and search already live in the
 * global Topbar (see components/navigation/Topbar.tsx) and Sidebar
 * (components/navigation/Sidebar.tsx) respectively — repeating them here
 * previously produced two visibly different streak/XP chips and two
 * functioning search boxes stacked on one page. This header now shows
 * only what neither of those already provides: the learner's current
 * World/Level/Lesson context.
 */
export function DashboardHeader() {
  const d = useDashboardData();
  const cont = d.continueLearning.data;
  return (
    <header className="d3-header">
      <h1 className="sr-only">Pixel Dashboard</h1>
      <div className="d3-header-id">
        <span className="d3-context">
          {cont ? `W${cont.worldNumber} · Level ${cont.levelNumber} · ${cont.lessonTitle}` : 'Curriculum overview'}
        </span>
      </div>
    </header>
  );
}
