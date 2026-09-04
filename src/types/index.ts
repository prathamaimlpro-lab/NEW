export type ContentStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AnalogyItem { icon: string; tag: string; title: string; description: string; }
export interface TableBlock { title?: string; columns: string[]; rows: string[][]; }

export type BlockType =
  | 'heading' | 'paragraph' | 'explanation' | 'objective' | 'analogy' | 'analogyCards'
  | 'callout' | 'tip' | 'warning' | 'code' | 'table' | 'visualization' | 'summary';

export interface ContentBlock {
  type: BlockType;
  content?: string;
  title?: string;
  language?: string;
  vizType?: string;
  items?: AnalogyItem[];
  table?: TableBlock;
}

export interface Question {
  id: string;
  lessonId: string;
  question: string;
  hint?: string;
  difficulty: Difficulty;
  options: string[];
  correctAnswer: string;
  explanation: string;
  xp: number;
  reference?: TableBlock;
}

export interface LessonSection { id: string; label?: string; title?: string; blocks: ContentBlock[]; }

export interface Lesson {
  id: string; courseId: string; levelId: number; index: number;
  title: string; slug: string; description: string;
  estimatedMinutes: number; difficulty: Difficulty; prerequisites: string[];
  sections: LessonSection[]; practice: Question[]; masteryTest: Question[];
  xpReward: number; status: ContentStatus; version: number; updatedAt: string;
}

export interface Course { id: string; levelId: number; title: string; description: string; lessons: string[]; }

export type LevelGroup = 'foundations' | 'systems' | 'software' | 'advanced';

export interface CurriculumLevel {
  id: number; title: string; description: string; group: LevelGroup;
  estimatedHours: number; objectives: string[]; courses: string[];
}

export interface PracticeRecord { difficulty: Difficulty; correct: boolean; tries: number; }

export interface PlayerStats {
  xp: number; level: number; streak: number; bestStreak: number;
  completedLessons: string[]; completedQuestions: string[];
  unlockedAchievements: string[]; visitedLessons: string[];
  practice: Record<string, PracticeRecord>;
  activity: Record<string, number>;
  firstActiveDate: string | null;
}

export interface Achievement {
  id: string; title: string; description: string; icon: string; xp: number;
  condition: (s: PlayerStats) => boolean;
}
