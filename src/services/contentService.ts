import { Lesson } from '../types';

// Future Claude/Admin pipeline boundary: validate → normalize → draft.
export const contentService = {
  validateLesson(lesson: Partial<Lesson>): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!lesson.id) errors.push('lesson.id missing');
    if (!lesson.title) errors.push('lesson.title missing');
    if (!Array.isArray(lesson.sections)) errors.push('lesson.sections must be an array');
    return { ok: errors.length === 0, errors };
  },
  // Placeholder for: importContent() → validate → normalize → saveDraft (never auto-publish).
  importContent(): { status: 'not-implemented' } { return { status: 'not-implemented' }; },
};
