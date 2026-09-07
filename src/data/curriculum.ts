import { Level, World } from '../types';
import { lessons } from './lessons';

const W = (number: number, title: string, description: string, range: [number, number], icon: string): World => ({ id: `world-${number}`, number, title, description, levelRange: range, icon });

export const worlds: World[] = [
  W(1, 'Computer Foundations', 'How machines turn electricity into information: hardware, memory, storage, OS basics and troubleshooting.', [1, 10], 'cpu'),
  W(2, 'Programming Foundations', 'What programming is, languages, variables, types, operators, I/O, conditions, loops, functions and debugging.', [11, 20], 'practice'),
  W(3, 'Programming — Intermediate', 'Scope, strings, collections, recursion, error handling, modules and object-oriented programming.', [21, 30], 'practice'),
  W(4, 'Linux + Terminal + Dev Tools', 'Linux fundamentals, filesystem, terminal, commands, permissions, processes, scripting and environment setup.', [31, 40], 'terminal'),
  W(5, 'Git + GitHub + Workflow', 'Version control theory, Git mechanics, branches, merges, remotes and professional GitHub workflows.', [41, 50], 'flag'),
  W(6, 'Data Structures', 'Big-O, arrays, linked lists, stacks, queues, hash tables, trees, BSTs, heaps and graphs.', [51, 60], 'memory'),
  W(7, 'Algorithms', 'Searching, sorting, two pointers, sliding window, backtracking, divide & conquer, greedy, DP and graph algorithms.', [61, 70], 'bolt'),
  W(8, 'Databases + SQL', 'Relational modeling, keys, SQL, joins, normalization, transactions, indexes and database projects.', [71, 80], 'storage'),
  W(9, 'Systems + Networking + Web', 'OS architecture, threads, memory, scheduling, networking, TCP/UDP/DNS/HTTP and web fundamentals.', [81, 90], 'explore'),
  W(10, 'Professional Software Engineering', 'APIs, testing, security, cloud, DevOps, system design, AI foundations and the final capstone.', [91, 100], 'shield'),
];

const T: string[] = [
  'What Is a Computer?', 'Hardware Fundamentals', 'CPU and How Instructions Execute', 'RAM, ROM and Memory', 'Storage and File Systems',
  'Files, Folders and Paths', 'Operating System Fundamentals', 'Applications and Processes', 'Input, Output and Peripherals', 'Computer Troubleshooting Fundamentals',
  'What Is Programming?', 'Programming Languages', 'Variables and Data', 'Data Types', 'Operators',
  'Input and Output', 'Conditions', 'Loops', 'Functions', 'Debugging Fundamentals',
  'Scope and Lifetime', 'Strings', 'Arrays / Lists', 'Dictionaries / Maps', 'Sets',
  'Tuples / Structured Data', 'Recursion', 'Error Handling', 'Modules and Packages', 'Object-Oriented Programming',
  'Linux Fundamentals', 'Linux Filesystem', 'Terminal Fundamentals', 'Essential Linux Commands', 'Permissions and Ownership',
  'Processes and Jobs', 'Shell Scripting', 'Environment Variables', 'Package Management', 'Developer Environment Setup',
  'Why Version Control Exists', 'Git Fundamentals', 'Repository Structure', 'Working Tree and Staging', 'Commits',
  'Branches', 'Merging', 'Remote Repositories', 'GitHub Workflow', 'Professional Git Workflow',
  'Complexity and Big-O', 'Arrays', 'Linked Lists', 'Stacks', 'Queues',
  'Hash Tables', 'Trees', 'Binary Search Trees', 'Heaps and Priority Queues', 'Graphs',
  'Searching', 'Sorting', 'Two Pointers', 'Sliding Window', 'Recursion and Backtracking',
  'Divide and Conquer', 'Greedy Algorithms', 'Dynamic Programming', 'Graph Algorithms', 'Advanced Algorithmic Problem Solving',
  'What Is a Database?', 'Relational Databases', 'Tables, Rows and Columns', 'Primary and Foreign Keys', 'SQL Fundamentals',
  'Filtering, Sorting and Aggregation', 'JOINs', 'Database Design and Normalization', 'Transactions and Indexes', 'Database Projects',
  'Operating System Architecture', 'Processes and Threads', 'Memory Management', 'CPU Scheduling', 'Networking Fundamentals',
  'IP Addresses and Routing', 'TCP, UDP, DNS and HTTP', 'HTML and CSS', 'JavaScript and Browser Fundamentals', 'Full-Stack Web Fundamentals',
  'Software Engineering Principles', 'APIs and Backend Development', 'Testing and Debugging', 'Security Fundamentals', 'Cloud Computing',
  'DevOps and CI/CD', 'System Design', 'AI and Machine Learning Foundations', 'Production-Grade Engineering', 'IT QUEST CAPSTONE — Build a Real System',
];

const LESSON_MAP: Record<number, string[]> = {
  1: ['what-is-a-computer', 'inside-the-machine', 'input-output-os'],
  2: ['bits-bytes-binary'],
  7: ['operating-systems-kernel'],
  33: ['terminal-file-systems'],
};

export const levels: Level[] = worlds.flatMap(w => {
  const out: Level[] = [];
  for (let n = w.levelRange[0]; n <= w.levelRange[1]; n++) {
    const has = !!LESSON_MAP[n];
    out.push({
      id: `level-${n}`, number: n, worldId: w.id, title: T[n - 1],
      description: has ? 'Published level — lessons available now.' : 'Structured level in authoring. Lessons publish here after review.',
      difficulty: n <= 20 ? 'EASY' : n <= 60 ? 'MEDIUM' : 'HARD',
      estimatedHours: n === 100 ? 80 : 5, status: 'PUBLISHED',
      prerequisites: n > 1 ? [`level-${n - 1}`] : [], lessons: LESSON_MAP[n] ?? [], projects: [], xpReward: 50,
      masteryRequirement: has ? 'Complete all lessons, practice and the mastery check.' : undefined,
    });
  }
  return out;
});

export const getWorld = (id: string) => worlds.find(w => w.id === id);
export const getLevel = (id: string) => levels.find(l => l.id === id);
export { lessons };
