export type ContentStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AnalogyItem { icon: string; tag: string; title: string; description: string }
export interface TableBlock { title?: string; columns: string[]; rows: string[][] }
export type BlockType = 'heading' | 'paragraph' | 'explanation' | 'objective' | 'analogy' | 'analogyCards' | 'callout' | 'tip' | 'warning' | 'code' | 'table' | 'visualization' | 'summary';
export interface ContentBlock { type: BlockType; content?: string; title?: string; language?: string; vizType?: string; items?: AnalogyItem[]; table?: TableBlock }
export interface Question { id: string; lessonId: string; question: string; hint?: string; difficulty: Difficulty; options: string[]; correctAnswer: string; explanation: string; xp: number; reference?: TableBlock }
export interface LessonSection { id: string; label?: string; title?: string; blocks: ContentBlock[] }

export interface Lesson {
  id: string; levelId: string; order: number; title: string; slug: string; description: string;
  objectives: string[]; estimatedMinutes: number; difficulty: Difficulty; prerequisites: string[];
  sections: LessonSection[]; visualizationId?: string;
  practice: Question[]; masteryTest: Question[]; xpReward: number;
  status: ContentStatus; version: number; updatedAt: string;
}

export interface World { id: string; number: number; title: string; description: string; levelRange: [number, number] }
export interface Level {
  id: string; number: number; worldId: string; title: string; description: string;
  difficulty: Difficulty; estimatedHours: number; status: ContentStatus;
  prerequisites: string[]; lessons: string[]; projects: string[]; xpReward: number;
}

export interface Problem {
  id: string; title: string; slug: string; difficulty: Difficulty; topics: string[]; subtopics: string[];
  source: string; collection: string; description: string; status: ContentStatus;
  xp: number; hints: string[]; solution: string; options: string[]; correctAnswer: string; explanation: string;
  relatedLessons: string[]; relatedProblems: string[];
}
export interface ProblemRecord { attempts: number; solved: boolean; favourite: boolean; review: boolean; notes: string; timeSpent: number; lastAttempted: string | null }
export interface DayActivity { minutes: number; problemsSolved: number; submissions: number; xpEarned: number }
export interface PracticeRecord { difficulty: Difficulty; correct: boolean; tries: number }

export interface PlayerStats {
  xp: number; level: number; streak: number; bestStreak: number;
  completedLessons: string[]; completedQuestions: string[]; unlockedAchievements: string[]; visitedLessons: string[];
  practice: Record<string, PracticeRecord>; problems: Record<string, ProblemRecord>;
  completedVisualizations: string[]; activity: Record<string, DayActivity>; firstActiveDate: string | null;
}

export interface Achievement { id: string; title: string; description: string; icon: string; xp: number; condition: (s: PlayerStats) => boolean }
export type VizCategory = 'Algorithm' | 'Data Structure' | 'Memory' | 'CPU' | 'Operating System' | 'Networking' | 'Database' | 'Git' | 'Programming' | 'System Design';
export interface ComplexityInfo { time: string; space: string }
