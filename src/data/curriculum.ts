  import { Level, Lesson, World } from '../types';

const W = (number: number, title: string, description: string, range: [number, number]): World => ({ id: `world-${number}`, number, title, description, levelRange: range });

export const worlds: World[] = [
  W(1, 'Computer Foundations', 'How machines turn electricity into information: hardware, OS basics and terminal first steps.', [1, 7]),
  W(2, 'Programming Foundations', 'Control flow, functions, types, recursion and memory-aware thinking across Python and C.', [8, 15]),
  W(3, 'Linux & Terminal', 'Shell semantics, POSIX streams, permissions, scripting and filesystem fluency.', [16, 22]),
  W(4, 'Git & GitHub', 'Atomic commits, branching models, merge mechanics and collaborative workflows.', [23, 28]),
  W(5, 'Data Structures & Algorithms', 'Complexity analysis, arrays to graphs, sorting, searching and dynamic programming.', [29, 38]),
  W(6, 'Databases & SQL', 'Relational modeling, normalization, indexes, transactions and query planning.', [39, 46]),
  W(7, 'Operating Systems', 'Processes, threads, scheduling, virtual memory, concurrency and syscalls.', [47, 54]),
  W(8, 'Computer Networking', 'OSI layers, TCP/TLS, UDP datagrams, HTTP/2–3, routing and sockets.', [55, 62]),
  W(9, 'Web Development', 'Browser pipeline, DOM, event loop, frameworks, SSR/CSR and hydration.', [63, 72]),
  W(10, 'Software Engineering', 'Clean boundaries, testing strategy, CI pipelines, reviews and static analysis.', [73, 79]),
  W(11, 'Cloud & DevOps', 'Containers, orchestration, infrastructure as code, observability and deploys.', [80, 87]),
  W(12, 'Cybersecurity + AI/ML', 'Threat modeling, cryptography basics, ML fundamentals and model serving.', [88, 94]),
  W(13, 'System Design + Advanced Engineering', 'Distributed consensus, scaling patterns and production capstone systems.', [95, 100]),
];

const LEVEL_META: Record<number, { title: string; description: string; hours: number; lessons: string[] }> = {
  1: { title: 'What Is a Computer?', description: 'How machines turn raw signals into computation, memory and output.', hours: 3, lessons: ['what-is-a-computer'] },
  2: { title: 'Bits, Bytes & Binary', description: 'How binary states encode instructions, text and multimedia.', hours: 3, lessons: ['bits-bytes-binary'] },
  3: { title: 'Operating Systems & The Kernel', description: 'Process management, memory paging and hardware orchestration.', hours: 4, lessons: ['operating-systems-kernel'] },
  4: { title: 'The Terminal & File Systems', description: 'Shell commands, relative pathing and directory tree navigation.', hours: 4, lessons: ['terminal-file-systems'] },
  5: { title: 'CPU — How Processors Work', description: 'Caches, pipelines and the arithmetic logic unit.', hours: 4, lessons: [] },
  6: { title: 'Memory & RAM', description: 'Volatility, addressing and the memory hierarchy.', hours: 3, lessons: [] },
  7: { title: 'Storage, Files & Paths', description: 'Blocks, filesystems and path resolution.', hours: 3, lessons: [] },
};

export const levels: Level[] = worlds.flatMap(w => {
  const out: Level[] = [];
  for (let n = w.levelRange[0]; n <= w.levelRange[1]; n++) {
    const m = LEVEL_META[n];
    out.push({
      id: `level-${n}`, number: n, worldId: w.id,
      title: m?.title ?? `${w.title} — Stage ${n - w.levelRange[0] + 1}`,
      description: m?.description ?? 'Structured level in authoring. Lessons publish here after review.',
      difficulty: n <= 4 ? 'EASY' : n <= 40 ? 'MEDIUM' : 'HARD',
      estimatedHours: m?.hours ?? 6, status: 'PUBLISHED',
      prerequisites: n > 1 ? [`level-${n - 1}`] : [], lessons: m?.lessons ?? [], projects: [], xpReward: 50,
    });
  }
  return out;
});

export const getWorld = (id: string) => worlds.find(w => w.id === id);
export const getLevel = (id: string) => levels.find(l => l.id === id);

const latencyTable = { title: 'LATENCY REFERENCE // SPEED COMPARISON', columns: ['Component', 'Latency'], rows: [['CPU Cycle', '~0.3 ns'], ['L1 / L2 Cache', '1 – 4 ns'], ['RAM (DDR5)', '~50 ns'], ['NVMe SSD', '~25,000 ns']] };

export const lessons: Record<string, Lesson> = {
  'what-is-a-computer': {
    id: 'what-is-a-computer', levelId: 'level-1', order: 1, title: 'What is a Computer?', slug: 'what-is-a-computer',
    description: 'Discover how physical silicon chips translate electricity into modern software architectures and interactive user interfaces.',
    objectives: ['Explain the Input → Computation → Output model', 'Distinguish the roles of storage, RAM and CPU'],
    estimatedMinutes: 12, difficulty: 'EASY', prerequisites: [], xpReward: 10, status: 'PUBLISHED', version: 3, updatedAt: '2026-09-05', visualizationId: 'computer-processing',
    sections: [
      { id: 's1', label: 'FOUNDATIONAL ARCHITECTURE', title: 'Deterministic by Design', blocks: [
        { type: 'paragraph', content: 'At its fundamental essence, a computer is a deterministic machine designed to turn physical reality into information. It receives raw signals (**Input**), carries out mathematical rules upon them (**Computation**), and returns practical results (**Output** or permanent **Storage**).' },
        { type: 'objective', content: 'Follow the uninterrupted physical journey that occurs inside hardware whenever you interact with software: from a mouse-click interrupt, through memory caches, to logic computations, and out to glowing pixels.' }] },
      { id: 's2', label: 'INTUITIVE ANALOGY', title: 'The Chef in the Kitchen', blocks: [
        { type: 'paragraph', content: 'To make sense of how different hardware components collaborate without feeling lost in terminology, imagine a computer as a busy professional kitchen preparing a dish:' },
        { type: 'analogyCards', items: [
          { icon: 'storage', tag: 'STORAGE', title: 'Pantry (SSD)', description: 'Massive shelf capacity that retains food overnight when the power is shut off, but takes time to walk to and retrieve items.' },
          { icon: 'memory', tag: 'MEMORY', title: 'Countertop (RAM)', description: "Arm's-reach workspace right in front of the cook. Holds ingredients currently being used, wiped clean at the end of every shift." },
          { icon: 'cpu', tag: 'PROCESSOR', title: 'The Chef (CPU)', description: 'Chops, seasons, and combines ingredients at blistering speed. Operates solely on what is set directly upon the countertop.' }] }] },
      { id: 's3', label: 'TECHNICAL DEPTH', title: 'Why Speed Is Everything', blocks: [
        { type: 'explanation', content: 'The entire architecture above exists to solve one problem: the CPU is millions of times faster than storage. Every layer of the memory hierarchy is a compromise between speed, size, and cost — which is exactly why files are copied into RAM before programs run.' },
        { type: 'table', table: latencyTable }] },
      { id: 's4', label: 'SUMMARY', title: 'Lesson Summary', blocks: [
        { type: 'summary', content: 'A computer is a deterministic Input → Computation → Output machine. Storage keeps data permanently but slowly, RAM keeps working data fast, and the CPU only computes on what RAM hands it. Every interaction you make travels this exact path.' }] },
    ],
    practice: [
      { id: 'wiac-q1', lessonId: 'what-is-a-computer', difficulty: 'EASY', xp: 20, question: 'Why does a computer copy files from persistent Storage into RAM before running them?', hint: 'Think back to the analogy of the Pantry versus the Prep Counter.', options: ['Because storage drives automatically delete files immediately once read to conserve disk capacity.', 'RAM operates thousands of times faster, delivering the nanosecond access speeds needed for the processor to work without waiting.', 'Because CPU arithmetic registers cannot read data files that exceed 1 kilobyte in file size.'], correctAnswer: 'RAM operates thousands of times faster, delivering the nanosecond access speeds needed for the processor to work without waiting.', explanation: 'RAM delivers direct nanosecond bus access, allowing the CPU to execute instructions without stalling. Storage is permanent but ~500× slower.', reference: latencyTable },
      { id: 'wiac-q2', lessonId: 'what-is-a-computer', difficulty: 'MEDIUM', xp: 40, question: 'Which of the following is an example of software?', options: ['Keyboard', 'Web Browser', 'Monitor', 'CPU'], correctAnswer: 'Web Browser', explanation: 'A web browser is a set of instructions executed by hardware. The keyboard, monitor, and CPU are physical components you can touch.' },
      { id: 'wiac-q3', lessonId: 'what-is-a-computer', difficulty: 'HARD', xp: 80, question: 'A machine has powerful hardware but no operating system installed. What happens when it is powered on?', hint: 'Who coordinates the hardware when no program is in charge?', options: ['It runs normally but slightly slower.', 'It cannot coordinate hardware or launch programs, so no useful work happens.', 'It automatically downloads an operating system from the internet.', 'It runs applications directly from storage without RAM.'], correctAnswer: 'It cannot coordinate hardware or launch programs, so no useful work happens.', explanation: 'The OS is the manager that arbitrates hardware access and launches applications. Without it, the CPU has no instruction pipeline to execute user work.' },
    ],
    masteryTest: [
      { id: 'wiac-m1', lessonId: 'what-is-a-computer', difficulty: 'EASY', xp: 20, question: 'In the kitchen analogy, which component is the countertop?', options: ['SSD', 'RAM', 'CPU', 'Display'], correctAnswer: 'RAM', explanation: "RAM is the arm's-reach workspace holding data currently in use; the pantry (SSD) holds everything permanently." },
      { id: 'wiac-m2', lessonId: 'what-is-a-computer', difficulty: 'MEDIUM', xp: 40, question: 'A CPU can execute a program directly from storage without involving RAM.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Programs must be paged into RAM first; the CPU fetches instructions from the memory hierarchy, not from slow flash storage.' },
    ],
  },
  'bits-bytes-binary': {
    id: 'bits-bytes-binary', levelId: 'level-2', order: 1, title: 'Bits, Bytes & Binary', slug: 'bits-bytes-binary',
    description: 'How binary states encode complex instructions, text strings, and multimedia.',
    objectives: ['Define bit and byte', 'Convert small binary values to decimal'],
    estimatedMinutes: 18, difficulty: 'EASY', prerequisites: ['what-is-a-computer'], xpReward: 10, status: 'PUBLISHED', version: 1, updatedAt: '2026-09-05',
    sections: [
      { id: 's1', label: 'THE ATOM OF INFORMATION', title: 'One Bit, Two States', blocks: [
        { type: 'paragraph', content: 'A **bit** is the smallest unit of information: a single switch that is either 0 or 1. Physically, it is a voltage level — low or high — stored in a transistor.' },
        { type: 'analogy', content: 'A bit is a light switch: on or off, nothing in between. A **byte** is a row of eight switches; their combined pattern encodes one character, like the letter "A".' },
        { type: 'explanation', content: 'Eight bits form a **byte**, giving 2⁸ = 256 unique patterns — enough to encode letters, digits, and symbols. Everything you see on screen is an agreed-upon mapping of byte patterns.' },
        { type: 'code', language: 'text', title: 'binary-example.txt', content: '01000001  =  65  =  "A"\n01000010  =  66  =  "B"\n00100000  =  32  =  " "' }] },
      { id: 's2', label: 'SUMMARY', title: 'Lesson Summary', blocks: [{ type: 'summary', content: 'Computers encode everything as bits (0/1 voltages). Bytes group eight bits into 256 patterns, and standard mappings turn those patterns into text, numbers, and media.' }] },
    ],
    practice: [
      { id: 'bbb-q1', lessonId: 'bits-bytes-binary', difficulty: 'EASY', xp: 20, question: 'How many bits are in one byte?', options: ['4', '8', '16', '64'], correctAnswer: '8', explanation: 'A byte is defined as 8 bits, yielding 256 distinct patterns.' },
      { id: 'bbb-q2', lessonId: 'bits-bytes-binary', difficulty: 'MEDIUM', xp: 40, question: 'What decimal value does the binary pattern 00001010 represent?', options: ['5', '10', '20', '101'], correctAnswer: '10', explanation: 'Reading powers of two: 8 + 2 = 10.' },
      { id: 'bbb-q3', lessonId: 'bits-bytes-binary', difficulty: 'HARD', xp: 80, question: 'Why do computers use binary instead of ten voltage levels?', options: ['Binary is culturally traditional in engineering.', 'Two clearly separated states are far more reliable to detect than ten fine-grained voltage levels.', 'Ten levels would require more transistors per bit.', 'Binary uses less electricity per calculation at equal precision.'], correctAnswer: 'Two clearly separated states are far more reliable to detect than ten fine-grained voltage levels.', explanation: 'Noise margins: distinguishing on/off survives electrical noise, heat, and degradation; ten levels would collapse under tiny variations.' },
    ],
    masteryTest: [{ id: 'bbb-m1', lessonId: 'bits-bytes-binary', difficulty: 'EASY', xp: 20, question: 'How many unique patterns can one byte represent?', options: ['8', '64', '256', '1024'], correctAnswer: '256', explanation: '2⁸ = 256 unique combinations.' }],
  },
  'operating-systems-kernel': {
    id: 'operating-systems-kernel', levelId: 'level-3', order: 1, title: 'Operating Systems & The Kernel', slug: 'operating-systems-kernel',
    description: 'Process management, memory paging, and hardware orchestration abstractions.',
    objectives: ['Describe the OS as hardware arbitrator', 'Explain the kernel and system calls'],
    estimatedMinutes: 25, difficulty: 'MEDIUM', prerequisites: ['bits-bytes-binary'], xpReward: 10, status: 'PUBLISHED', version: 1, updatedAt: '2026-09-05',
    sections: [
      { id: 's1', label: 'THE MANAGER', title: 'What the OS Actually Does', blocks: [
        { type: 'paragraph', content: 'The **operating system** is the software layer that arbitrates hardware: it decides which program uses the CPU, where data lives in RAM, and what may touch disks and network cards.' },
        { type: 'analogy', content: 'The kernel is an air-traffic controller: many planes (programs) want the same runway (CPU) at once. The controller sequences them safely so nothing collides.' },
        { type: 'explanation', content: 'The **kernel** is the core of the OS, always resident in memory. Applications request services through **system calls** — controlled doors into kernel space.' }] },
      { id: 's2', label: 'SUMMARY', title: 'Lesson Summary', blocks: [{ type: 'summary', content: 'The OS orchestrates hardware on behalf of applications; the kernel is its always-running core, accessed only through system calls.' }] },
    ],
    practice: [
      { id: 'osk-q1', lessonId: 'operating-systems-kernel', difficulty: 'EASY', xp: 20, question: 'Which component schedules which program uses the CPU?', options: ['The web browser', 'The operating system', 'The SSD controller', 'The display driver'], correctAnswer: 'The operating system', explanation: 'CPU scheduling is a core OS responsibility.' },
      { id: 'osk-q2', lessonId: 'operating-systems-kernel', difficulty: 'MEDIUM', xp: 40, question: 'Which of these is an operating system?', options: ['Linux', 'Chrome', 'Excel', 'HTTP'], correctAnswer: 'Linux', explanation: 'Linux is a kernel/OS; Chrome and Excel are applications, HTTP is a protocol.' },
      { id: 'osk-q3', lessonId: 'operating-systems-kernel', difficulty: 'HARD', xp: 80, question: 'If the kernel crashes, why does the whole machine stop working?', options: ['Applications depend on the kernel for every hardware service.', 'The RAM is erased instantly.', 'The CPU overheats without the kernel.', 'The network disconnects first.'], correctAnswer: 'Applications depend on the kernel for every hardware service.', explanation: 'With the arbitrator gone, no program can safely request CPU, memory, or I/O — the system halts.' },
    ],
    masteryTest: [{ id: 'osk-m1', lessonId: 'operating-systems-kernel', difficulty: 'EASY', xp: 20, question: 'Applications talk to the kernel through…', options: ['System calls', 'Magic packets', 'Voltage spikes', 'CSS'], correctAnswer: 'System calls', explanation: 'Syscalls are the controlled interface into kernel space.' }],
  },
  'terminal-file-systems': {
    id: 'terminal-file-systems', levelId: 'level-4', order: 1, title: 'The Terminal & File Systems', slug: 'terminal-file-systems',
    description: 'Shell commands, relative pathing, and directory tree navigation.',
    objectives: ['Use core shell commands', 'Reason with absolute and relative paths'],
    estimatedMinutes: 30, difficulty: 'MEDIUM', prerequisites: ['operating-systems-kernel'], xpReward: 10, status: 'PUBLISHED', version: 1, updatedAt: '2026-09-05',
    sections: [
      { id: 's1', label: 'TEXT IS POWER', title: 'Driving the OS With Words', blocks: [
        { type: 'paragraph', content: 'The **terminal** is a text interface to the operating system: you type commands, the shell interprets them, and the kernel executes them.' },
        { type: 'code', language: 'bash', title: 'shell-session', content: '$ pwd\n/home/quest\n$ ls\ndocs  projects  notes.md\n$ cd docs\n$ ls\nlesson-01.txt' },
        { type: 'explanation', content: 'Files live in a **tree**. An absolute path starts at the root (`/home/quest/docs`); a relative path starts where you stand (`cd ..` moves up one level).' }] },
      { id: 's2', label: 'SUMMARY', title: 'Lesson Summary', blocks: [{ type: 'summary', content: 'The terminal turns text into OS actions; the file system organizes data as a tree navigated with absolute and relative paths.' }] },
    ],
    practice: [
      { id: 'tfs-q1', lessonId: 'terminal-file-systems', difficulty: 'EASY', xp: 20, question: 'Which command lists the files in the current directory?', options: ['cd', 'ls', 'pwd', 'rm'], correctAnswer: 'ls', explanation: '`ls` lists directory contents.' },
      { id: 'tfs-q2', lessonId: 'terminal-file-systems', difficulty: 'MEDIUM', xp: 40, question: 'What does `cd ..` do?', options: ['Deletes a directory', 'Moves up one directory level', 'Copies the current directory', 'Moves to the home directory'], correctAnswer: 'Moves up one directory level', explanation: '`..` is the parent directory in the tree.' },
      { id: 'tfs-q3', lessonId: 'terminal-file-systems', difficulty: 'HARD', xp: 80, question: 'You are in `/home/quest/docs`. Which relative path reaches `/home/quest/projects`?', options: ['../projects', './docs/projects', '/projects', 'cd projects'], correctAnswer: '../projects', explanation: 'Up one level to `/home/quest`, then down into `projects`.' },
    ],
    masteryTest: [{ id: 'tfs-m1', lessonId: 'terminal-file-systems', difficulty: 'EASY', xp: 20, question: 'Which command prints your current directory?', options: ['pwd', 'ls', 'cat', 'mv'], correctAnswer: 'pwd', explanation: '`pwd` = print working directory.' }],
  },
};
