import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 'proj-001', title: 'Explain Your Machine', levelId: 'level-1', difficulty: 'EASY', xp: 100, status: 'PUBLISHED',
    description: 'Write a short plain-language guide (5–10 sentences) that explains what happens inside your phone or computer when you open a photo, using input → processing → output and the roles of CPU, RAM and storage.',
    requirements: ['Use input → processing → output', 'Mention CPU, RAM and storage correctly', 'No unexplained jargon'],
  },
];
