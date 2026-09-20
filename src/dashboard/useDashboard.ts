import { useMemo } from 'react';
import type { Range } from '../services/dashboardService';
import { usePlayer } from '../store/PlayerContext';
import {
  classifyLearner, selectAnalyticsBand, selectContinueLearning, selectCurriculumJourney,
  selectKnowledgeGraph, selectLearningActivity, selectLearningHeatmap, selectLearningVelocity,
  selectMasteryAnalytics, selectNextBestAction, selectPracticeAnalytics, selectProjectAnalytics,
  selectRevisionQueue, selectStrengthIntelligence, selectVisualizationActivity, selectWeaknessIntelligence,
  selectWhatChanged,
} from './selectors';

/* Single memoized dashboard data object. Recomputes only when learner stats identity
   changes (local mutation or Supabase sync) or the activity range changes.
   No polling; realtime behaviour is inherited from PlayerContext. */
export function useDashboardData(range: Range = '30D') {
  const { stats } = usePlayer();
  return useMemo(() => ({
    stage: classifyLearner(stats),
    continueLearning: selectContinueLearning(stats),
    nextBestAction: selectNextBestAction(stats),
    analyticsBand: selectAnalyticsBand(stats),
    activity: selectLearningActivity(stats, range),
    mastery: selectMasteryAnalytics(stats),
    practice: selectPracticeAnalytics(stats),
    knowledgeGraph: selectKnowledgeGraph(stats),
    journey: selectCurriculumJourney(stats),
    weakness: selectWeaknessIntelligence(stats),
    strength: selectStrengthIntelligence(stats),
    revision: selectRevisionQueue(stats),
    whatChanged: selectWhatChanged(stats),
    projects: selectProjectAnalytics(stats),
    visualizations: selectVisualizationActivity(stats),
    heatmap: selectLearningHeatmap(stats),
    velocity: selectLearningVelocity(stats),
  }), [stats, range]);
}

export type DashboardData = ReturnType<typeof useDashboardData>;
