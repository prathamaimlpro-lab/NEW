import { ActivityChart } from '../components/dashboard3/ActivityChart';
import { AccuracyRing } from '../components/dashboard3/AccuracyRing';
import { ContextCard } from '../components/dashboard3/ContextCard';
import { GraphMini } from '../components/dashboard3/GraphMini';
import { Heatmap8 } from '../components/dashboard3/Heatmap8';
import { InsightsRail } from '../components/dashboard3/InsightsRail';
import { JourneyStrip } from '../components/dashboard3/JourneyStrip';
import { LearningWorkspace } from '../components/dashboard3/LearningWorkspace';
import { MasteryAnalytics } from '../components/dashboard3/MasteryAnalytics';
import { QuickActions } from '../components/dashboard3/QuickActions';
import { VitalsBand } from '../components/dashboard3/VitalsBand';
import { WhatChanged } from '../components/dashboard3/WhatChanged';
import '../components/dashboard3/dashboard3.css';
import '../components/dashboard3/dashboardv3.css';
import '../components/dashboard3/practice4.css';
import '../components/dashboard3/heatmap8.css';
import '../components/dashboard3/motion9.css';
import '../components/dashboard3/a11y10.css';
import { OnboardingPanel } from '../components/dashboard/panels';
import { SectionIndex, StatementHeader } from '../components/ui/primitives';
import { useDashboardData } from '../dashboard/useDashboard';
import { useRealtimeRefresh } from '../dashboard/useRealtimeRefresh';
import { usePlayer } from '../store/PlayerContext';
import '../styles/dashboard.css';
import '../styles/dashboard-motion.css';

export default function Home() {
  const d = useDashboardData();
  useRealtimeRefresh();
  const { stats } = usePlayer();

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const vel = d.velocity.status === 'ready' && d.velocity.data ? d.velocity.data.lessonsPerWeek : null;
  const hasEvidence = stats.completedLessons.length > 0 || (stats.events ?? []).length > 0;
  const evidence = hasEvidence
    ? `${stats.streak}-day streak${vel !== null ? ` · ${vel} lessons/week` : ''}`
    : 'your learning command center is ready';

  return (
    <div className="dash">
      <h1 className="sr-only">Pixel Dashboard</h1>

      <div className="v3-top">
        <StatementHeader lead={`${greet} —`} emphasis={evidence} />
        <ContextCard />
      </div>

      {d.stage === 'day0' && <OnboardingPanel />}

      <SectionIndex index="01" label="Vitals" />
      <VitalsBand />

      <SectionIndex index="02" label="Continue" />
      <LearningWorkspace />

      <div className="v3-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div className="v3-row-75">
            <ActivityChart />
            <MasteryAnalytics />
          </div>
          <div className="v3-row-trio">
            <AccuracyRing />
            <JourneyStrip />
            <GraphMini />
          </div>
        </div>
        <aside className="v3-rail">
          <InsightsRail />
          <QuickActions />
        </aside>
      </div>

      <SectionIndex index="03" label="What changed" />
      <WhatChanged />

      <SectionIndex index="04" label="Long-term activity" />
      <Heatmap8 />
    </div>
  );
}
