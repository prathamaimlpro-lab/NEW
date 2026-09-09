export type ContentStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AnalogyItem { icon: string; tag: string; title: string; description: string }
export interface TableBlock { title?: string; columns: string[]; rows: string[][] }
export type BlockType = 'heading' | 'paragraph' | 'explanation' | 'objective' | 'why' | 'example' | 'analogy' | 'analogyCards' | 'callout' | 'tip' | 'warning' | 'code' | 'table' | 'visualization' | 'summary' | 'image' | 'video';
export interface ContentBlock { type: BlockType; content?: string; title?: string; language?: string; vizType?: string; items?: AnalogyItem[]; table?: TableBlock; url?: string; alt?: string }
export interface Question { id: string; lessonId: string; question: string; hint?: string; difficulty: Difficulty; options: string[]; correctAnswer: string; explanation: string; xp: number; reference?: TableBlock }
export interface LessonSection { id: string; label?: string; title?: string; blocks: ContentBlock[] }

export interface Lesson {
  id: string; levelId: string; order: number; title: string; slug: string; description: string;
  objectives: string[]; topics: string[]; estimatedMinutes: number; difficulty: Difficulty; prerequisites: string[];
  sections: LessonSection[]; visualizationId?: string; revision?: string[];
  practice: Question[]; masteryTest: Question[]; xpReward: number;
  status: ContentStatus; version: number; updatedAt: string;
}

export interface World { id: string; number: number; title: string; description: string; levelRange: [number, number]; icon?: string }
export interface Level {
  id: string; number: number; worldId: string; title: string; description: string;
  difficulty: Difficulty; estimatedHours: number; status: ContentStatus;
  prerequisites: string[]; lessons: string[]; projects: string[]; xpReward: number;
  concepts?: string[]; project?: string; masteryRequirement?: string; revision?: string;
}

export interface Project {
  id: string; title: string; description: string; worldId?: string; levelId?: string; lessonId?: string;
  difficulty: Difficulty; xp: number; requirements: string[]; status: ContentStatus;
}

export interface ProblemExample { input: string; output: string; note?: string }
export interface Problem {
  id: string; title: string; slug: string; difficulty: Difficulty; topics: string[]; subtopics: string[];
  pattern: string; source: string; collection: string; description: string; status: ContentStatus;
  xp: number; hints: string[]; solution: string; options: string[]; correctAnswer: string; explanation: string;
  examples: ProblemExample[]; constraints: string[];
  relatedLessons: string[]; relatedProblems: string[]; relatedLevel: string;
}
export interface ProblemRecord {
  attempts: number; solved: boolean; solvedDate: string | null; favourite: boolean; review: boolean;
  mastered: boolean; confidence: 0 | 1 | 2 | 3; notes: string; scratchCode: string; timeSpent: number; lastAttempted: string | null;
}
export interface DayActivity { minutes: number; problemsSolved: number; submissions: number; xpEarned: number; count: number }
export interface PracticeRecord { difficulty: Difficulty; correct: boolean; tries: number }

export type ActivityKind = 'lesson_completed' | 'problem_solved' | 'visualization_completed' | 'project_completed' | 'revision_completed';
export interface ActivityEvent { at: string; kind: ActivityKind; id?: string; title?: string; to?: string; context?: string }

export interface PlayerStats {
  xp: number; level: number; streak: number; bestStreak: number;
  completedLessons: string[]; completedQuestions: string[]; unlockedAchievements: string[]; visitedLessons: string[];
  lessonCompletedAt: Record<string, string>; completedProjects: string[];
  practice: Record<string, PracticeRecord>; problems: Record<string, ProblemRecord>;
  completedVisualizations: string[]; activity: Record<string, DayActivity>;
  events: ActivityEvent[]; firstActiveDate: string | null;
}

export interface Achievement { id: string; title: string; description: string; icon: string; xp: number; rule?: AchievementRule; condition?: (s: PlayerStats) => boolean }
export interface AchievementRule { kind: 'lessons' | 'questions' | 'problems' | 'streak' | 'playerLevel' | 'xp' | 'visualizations'; value: number }
export type VizCategory = 'Algorithm' | 'Data Structure' | 'Memory' | 'CPU' | 'Operating System' | 'Networking' | 'Database' | 'Git' | 'Programming' | 'System Design';
export interface ComplexityInfo { time: string; space: string }
export interface ThemeSettings { primary: string; primaryHover: string; success: string; warning: string; error: string; info: string; radiusMd: number }
export interface AppSettings { dailyGoalMinutes: number; xpLesson: number; xpEasy: number; xpMedium: number; xpHard: number; xpViz: number }
export interface VisualizerMeta { xpReward: number }
