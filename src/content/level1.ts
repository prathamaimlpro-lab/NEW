import type { Concept, Example, MasteryCriteria, PracticeQuestion, Project, Revision, Visual } from './types';

const NOW = '2026-01-01T00:00:00.000Z';

export const level1Examples: Example[] = [
  { id: 'l1-ex-thermostat', status: 'PUBLISHED', updatedAt: NOW, conceptId: 'l1-c-input-process-output', title: 'Thermostat loop', kind: 'analogy', body: 'A thermostat reads temperature (input), compares it to a target (process), then switches heating on/off (output) — a continuous input→process→output cycle.' },
  { id: 'l1-ex-binary', status: 'PUBLISHED', updatedAt: NOW, conceptId: 'l1-c-binary', title: 'Counting in binary', kind: 'code', body: 'Decimal 5 is 0101 in binary: each position is a power of two (8,4,2,1).', code: '5  ->  0 1 0 1\n      8 4 2 1' },
];

export const level1Visuals: Visual[] = [
  { id: 'l1-v-processing', status: 'PUBLISHED', updatedAt: NOW, conceptId: 'l1-c-input-process-output', visualizationId: 'computer-processing', caption: 'Follow one value from input through processing to output.' },
];

export const level1Practice: PracticeQuestion[] = [
  { id: 'l1-q-easy-1', status: 'PUBLISHED', updatedAt: NOW, conceptId: 'l1-c-what-is-a-computer', difficulty: 'EASY', prompt: 'A computer is best described as a machine that…', options: ['stores only pictures', 'accepts input, processes it, and produces output', 'requires internet to function', 'can only run one program'], answerIndex: 1, explanation: 'The input→process→output model is the core definition.' },
  { id: 'l1-q-med-1', status: 'PUBLISHED', updatedAt: NOW, conceptId: 'l1-c-input-process-output', difficulty: 'MEDIUM', prompt: 'In a calculator app, pressing "=" corresponds to which stage?', options: ['Input', 'Process', 'Output', 'Storage'], answerIndex: 2, explanation: 'Displaying the computed result is the output stage.' },
  { id: 'l1-q-hard-1', status: 'PUBLISHED', updatedAt: NOW, conceptId: 'l1-c-binary', difficulty: 'HARD', prompt: 'Why do computers use binary rather than decimal internally?', options: ['Binary is faster for humans to read', 'Two stable voltage states are reliable to detect', 'Decimal needs more memory chips', 'Binary avoids the need for storage'], answerIndex: 1, explanation: 'Hardware distinguishes two voltage levels robustly; decimal would need many fragile levels.' },
];

export const level1Projects: Project[] = [
  { id: 'l1-project', status: 'PUBLISHED', updatedAt: NOW, conceptIds: ['l1-c-what-is-a-computer', 'l1-c-input-process-output'], title: 'Map a device you use daily', summary: 'Identify the inputs, processing steps and outputs of one everyday device.', requirements: ['List 3 inputs', 'Describe the processing', 'List 2 outputs'], xp: 40 },
];

export const level1Revisions: Revision[] = [
  { id: 'l1-rev-1', status: 'PUBLISHED', updatedAt: NOW, conceptId: 'l1-c-what-is-a-computer', intervalDays: 7, prompt: 'Restate the input→process→output model from memory and give one new example.' },
];

export const level1Mastery: MasteryCriteria[] = [
  { id: 'l1-m-1', status: 'PUBLISHED', updatedAt: NOW, conceptId: 'l1-c-what-is-a-computer', minAccuracy: 80, minApplications: 3, requiresRevision: true, description: 'Correctly apply the input→process→output model across 3 contexts with ≥80% accuracy and complete one revision.' },
];

export const level1Concepts: Concept[] = [
  {
    id: 'l1-c-what-is-a-computer', status: 'PUBLISHED', updatedAt: NOW, title: 'What Is a Computer?',
    topicIds: ['topic:Computer Basics'],
    facets: [
      { key: 'WHAT', body: 'A computer is a machine that accepts input, processes it under a stored program, and produces output.' },
      { key: 'WHY', body: 'Everything else in computing — OS, networks, apps — is an elaboration of this one loop.' },
      { key: 'HOW', bullets: ['Input devices capture data', 'The CPU executes stored instructions', 'Output devices present results'] },
      { key: 'MISTAKES', bullets: ['Equating "computer" with "screen"', 'Assuming processing requires internet'] },
      { key: 'REAL_WORLD', body: 'Phones, cars, thermostats and cards all embed this loop.' },
    ],
    exampleIds: ['l1-ex-thermostat'], visualIds: ['l1-v-processing'], practiceIds: ['l1-q-easy-1'],
    projectIds: ['l1-project'], revisionIds: ['l1-rev-1'], prerequisiteConceptIds: [], masteryCriteriaId: 'l1-m-1',
  },
  {
    id: 'l1-c-input-process-output', status: 'PUBLISHED', updatedAt: NOW, title: 'Input → Process → Output',
    topicIds: ['topic:Computer Basics'],
    facets: [
      { key: 'WHAT', body: 'The three-stage cycle every computation follows.' },
      { key: 'HOW', code: 'input -> process -> output', body: 'Data enters, instructions transform it, results leave.' },
      { key: 'CONNECTIONS', body: 'Feeds directly into Level 2 (how programs store and move data).' },
    ],
    exampleIds: ['l1-ex-thermostat'], visualIds: ['l1-v-processing'], practiceIds: ['l1-q-med-1'],
    projectIds: ['l1-project'], revisionIds: ['l1-rev-1'], prerequisiteConceptIds: ['l1-c-what-is-a-computer'],
  },
  {
    id: 'l1-c-binary', status: 'PUBLISHED', updatedAt: NOW, title: 'Binary: Two States',
    topicIds: ['topic:Computer Basics'],
    facets: [
      { key: 'WHAT', body: 'Computers represent data as two stable states (0/1).' },
      { key: 'WHY', body: 'Two voltage levels are cheap and reliable to detect; ten are not.' },
      { key: 'EXAMPLE', body: 'Decimal 5 = binary 0101.', code: '5 -> 0101' },
    ],
    exampleIds: ['l1-ex-binary'], visualIds: [], practiceIds: ['l1-q-hard-1'],
    projectIds: [], revisionIds: [], prerequisiteConceptIds: ['l1-c-input-process-output'],
  },
];
