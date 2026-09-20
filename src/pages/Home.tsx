import { useMemo } from 'react';
import { HeatmapSection } from '../components/dashboard/analytics';
import { OnboardingPanel, VisualizationActivity } from '../components/dashboard/panels';
import { ActivityChart } from '../components/dashboard3/ActivityChart';
import { AnalyticsBand } from '../components/dashboard3/AnalyticsBand';
import { CurriculumJourney3 } from '../components/dashboard3/CurriculumJourney3';
import { DashboardHeader } from '../components/dashboard3/DashboardHeader';
import { IntelligenceArea } from '../components/dashboard3/IntelligenceArea';
import { KnowledgeGraph } from '../components/dashboard3/KnowledgeGraph';
import { LearningWorkspace } from '../components/dashboard3/LearningWorkspace';
import { MasteryAnalytics } from '../components/dashboard3/MasteryAnalytics';
import { PracticeAnalytics4 } from '../components/dashboard3/PracticeAnalytics4';
import { ProjectPanel3 } from '../components/dashboard3/ProjectPanel3';
import { WhatChanged } from '../components/dashboard3/WhatChanged';
import '../components/dashboard3/dashboard3.css';
import '../components/dashboard3/practice4.css';
import '../components/dashboard3/knowledgegraph.css';
import '../components/dashboard3/intelligence.css';
import '../components/dashboard3/whatchanged.css';
import { useDashboardData } from '../dashboard/useDashboard';
import { usePlayer } from '../store/PlayerContext';
import '../styles/dashboard.css';
import '../styles/dashboard-motion.css';

export default function Home() {
  const d = useDashboardData();
  const { stats } = usePlayer();
  void useMemo; void stats;

  return (
    <div className="dash">
      <DashboardHeader />
      <LearningWorkspace />
      {d.stage === 'day0' && <OnboardingPanel />}
      <AnalyticsBand />
      <ActivityChart />
      <MasteryAnalytics />
      <PracticeAnalytics4 />
      <KnowledgeGraph />
      <IntelligenceArea />
      <WhatChanged />
      <CurriculumJourney3 />
      <ProjectPanel3 />

      <div className="dgrid" style={{ marginTop: 8 }}>
        {d.heatmap.status === 'ready' && <div className="span7"><HeatmapSection /></div>}
        {d.visualizations.status === 'ready' && <div className="span6"><VisualizationActivity /></div>}
      </div>
    </div>
  );
}
