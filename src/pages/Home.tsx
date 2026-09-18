import { useMemo } from 'react';
import { ActivityAnalytics, CurriculumJourney, HeatmapSection, MasteryBridge, PracticeAnalytics } from '../components/dashboard/analytics';
import { CompactStrip } from '../components/dashboard/CompactStrip';
import { ContinueLearning } from '../components/dashboard/ContinueLearning';
import { NextBestAction } from '../components/dashboard/NextBestAction';
import { OnboardingPanel, ProjectAnalytics, StrengthWeakness, TimelineSection, VisualizationActivity } from '../components/dashboard/panels';
import { SkillMap } from '../components/dashboard/SkillMap';
import { getSession } from '../services/authService';
import { buildSkillGraph, getDashboardDisclosure, getCurrentLearningState } from '../services/dashboardService';
import { usePlayer } from '../store/PlayerContext';
import '../styles/dashboard.css';
import '../styles/dashboard-motion.css';

export default function Home() {
  const { stats } = usePlayer();
  const session = getSession();
  const name = session?.email?.split('@')[0] ?? 'engineer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const learning = useMemo(() => getCurrentLearningState(stats), [stats]);
  const disclosure = useMemo(() => getDashboardDisclosure(stats), [stats]);
  const graph = useMemo(() => buildSkillGraph(stats), [stats]);

  return (
    <div className="dash">
      <header style={{ padding: '24px 2px 0' }}>
        <h1 className="d-h1">{greeting}, {name}</h1>
        <p className="d-body" style={{ marginTop: 8 }}>
          {learning ? `${learning.worldTitle} · Level ${learning.levelNumber} · ${learning.lessonTitle}` : 'Learning Command Center'}
        </p>
      </header>

      <div className="dgrid" style={{ marginTop: 32 }}>
        <div className="span8"><ContinueLearning state={learning} /></div>
        <div className="span4"><NextBestAction /></div>

        <div className="span12"><CompactStrip /></div>

        {disclosure.isNew && <div className="span12"><OnboardingPanel /></div>}

        {disclosure.showActivity && <div className="span12"><ActivityAnalytics /></div>}

        {disclosure.showHeat && <div className="span7"><HeatmapSection /></div>}
        {disclosure.showMastery && <div className="span5"><MasteryBridge /></div>}

        <div className="span12"><CurriculumJourney /></div>

        {disclosure.showSkill && <div className="span12"><SkillMap graph={graph} /></div>}

        {disclosure.showPractice && <div className="span7"><PracticeAnalytics /></div>}
        {disclosure.showInsights && <div className="span5"><StrengthWeakness /></div>}

        {disclosure.showProjects && <div className="span6"><ProjectAnalytics /></div>}
        {disclosure.showViz && <div className="span6"><VisualizationActivity /></div>}

        {disclosure.showTimeline && <div className="span12"><TimelineSection /></div>}
      </div>
    </div>
  );
}
