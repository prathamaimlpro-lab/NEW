import { PixelWordmark } from '../brand/PixelLogo';
import { QuickFind } from '../navigation/QuickFind';
import { useDashboardData } from '../../dashboard/useDashboard';

export function DashboardHeader() {
  const d = useDashboardData();
  const cont = d.continueLearning.data;
  const band = d.analyticsBand.data;
  return (
    <header className="d3-header">
      <div className="d3-header-id">
        <PixelWordmark size={14} />
        <span className="d3-context">
          {cont ? `W${cont.worldNumber} · Level ${cont.levelNumber} · ${cont.lessonTitle}` : 'Curriculum overview'}
        </span>
      </div>
      <div className="d3-header-tools">
        <div className="d3-xpstrip" aria-label="Learner stats">
          <span className="chip chip-success">{band?.streak ?? 0}D streak</span>
          <span className="chip">{(band?.xp ?? 0).toLocaleString()} XP</span>
          <span className="chip">Lv {band?.level ?? 1}</span>
        </div>
        <div className="d3-search"><QuickFind /></div>
      </div>
    </header>
  );
}
