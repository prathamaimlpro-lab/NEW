import { useMemo } from 'react';
import { ActivityAnalytics, HeatmapSection, MasteryBridge, PracticeAnalytics } from '../components/dashboard/analytics';
import { OnboardingPanel, StrengthWeakness, TimelineSection, VisualizationActivity } from '../components/dashboard/panels';
import { SkillMap } from '../components/dashboard/SkillMap';
import { CurriculumJourney3 } from '../components/dashboard3/CurriculumJourney3';
import { DashboardHeader } from '../components/dashboard3/DashboardHeader';
import { LearningWorkspace } from '../components/dashboard3/LearningWorkspace';
import { ProjectPanel3 } from '../components/dashboard3/ProjectPanel3';
import '../components/dashboard3/dashboard3.css';
import { useDashboardData } from '../dashboard/useDashboard';
import { buildSkillGraph } from '../services/dashboardService';
import { usePlayer } from '../store/PlayerContext';
import '../styles/dashboard.css';
import '../styles/dashboard-motion.css';

export default function Home() {
  const d = useDashboardData();
  const { stats } = usePlayer();
  const graph = useMemo(() => buildSkillGraph(stats), [stats]);

  return (
    <div className="dash">
      <DashboardHeader />
      <LearningWorkspace />
      {d.stage === 'day0' && <OnboardingPanel />}
      <CurriculumJourney3 />
      <ProjectPanel3 />

      {/* Existing analytics zones retained until D3–D6 replace them */}
      <div className="dgrid" style={{ marginTop: 8 }}>
        {d.activity.status === 'ready' && <div className="span12"><ActivityAnalytics /></div>}
        {d.heatmap.status === 'ready' && <div className="span7"><HeatmapSection /></div>}
        {d.mastery.status === 'ready' && <div className="span5"><MasteryBridge /></div>}
        {d.practice.summary.status === 'ready' && <div className="span7"><PracticeAnalytics /></div>}
        {d.strength.status === 'ready' && <div className="span5"><StrengthWeakness /></div>}
        {d.knowledgeGraph.status === 'ready' && <div className="span12"><SkillMap graph={graph} /></div>}
        {d.visualizations.status === 'ready' && <div className="span6"><VisualizationActivity /></div>}
        {d.whatChanged.status === 'ready' && <div className="span6"><TimelineSection /></div>}
      </div>
    </div>
  );
}
