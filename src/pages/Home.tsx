import { OnboardingPanel } from '../components/dashboard/panels';
import { ActivityChart } from '../components/dashboard3/ActivityChart';
import { CurriculumJourney3 } from '../components/dashboard3/CurriculumJourney3';
import { Heatmap8 } from '../components/dashboard3/Heatmap8';
import { IntelligenceArea } from '../components/dashboard3/IntelligenceArea';
import { KnowledgeGraph } from '../components/dashboard3/KnowledgeGraph';
import { LearningWorkspace } from '../components/dashboard3/LearningWorkspace';
import { MasteryAnalytics } from '../components/dashboard3/MasteryAnalytics';
import { PracticeAnalytics4 } from '../components/dashboard3/PracticeAnalytics4';
import { ProjectPanel3 } from '../components/dashboard3/ProjectPanel3';
import { VizActivity8 } from '../components/dashboard3/VizActivity8';
import { VitalsBand } from '../components/dashboard3/VitalsBand';
import { WhatChanged } from '../components/dashboard3/WhatChanged';
import { SectionIndex, StatementHeader } from '../components/ui/primitives';
import '../components/dashboard3/dashboard3.css';
import '../components/dashboard3/practice4.css';
import '../components/dashboard3/knowledgegraph.css';
import '../components/dashboard3/intelligence.css';
import '../components/dashboard3/whatchanged.css';
import '../components/dashboard3/heatmap8.css';
import '../components/dashboard3/motion9.css';
import '../components/dashboard3/a11y10.css';
import { useDashboardData } from '../dashboard/useDashboard';
import { useRealtimeRefresh } from '../dashboard/useRealtimeRefresh';
import '../styles/dashboard.css';
import '../styles/dashboard-motion.css';

export default function Home() {
  const d = useDashboardData();
  useRealtimeRefresh();
  const cont = d.continueLearning.data;

  return (
    <div className="dash">
      <h1 className="sr-only">Pixel Dashboard</h1>

      <SectionIndex index="01" label="Context" />
      <StatementHeader
        lead={cont ? 'Current position' : 'Welcome to Pixel'}
        emphasis={cont ? `W${cont.worldNumber} · Level ${cont.levelNumber} · ${cont.lessonTitle}` : 'Your learning command center is ready.'}
      />
      <LearningWorkspace />
      {d.stage === 'day0' && <OnboardingPanel />}

      <SectionIndex index="02" label="Vitals" />
      <VitalsBand />

      <SectionIndex index="03" label="Activity" />
      <ActivityChart />

      <SectionIndex index="04" label="Mastery" />
      <MasteryAnalytics />

      <SectionIndex index="05" label="Practice" />
      <PracticeAnalytics4 />

      <SectionIndex index="06" label="Knowledge" />
      <KnowledgeGraph />

      <SectionIndex index="07" label="Journey" />
      <CurriculumJourney3 />

      <SectionIndex index="08" label="Intelligence" />
      <IntelligenceArea />

      <SectionIndex index="09" label="What changed" />
      <WhatChanged />

      <SectionIndex index="10" label="Building" />
      <div className="dgrid">
        <div className="span7"><ProjectPanel3 /></div>
        <div className="span5"><VizActivity8 /></div>
      </div>

      <SectionIndex index="11" label="Long-term" />
      <Heatmap8 />
    </div>
  );
}
