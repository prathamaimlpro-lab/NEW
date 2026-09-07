import { Lesson } from '../types';

const latencyTable = { title: 'LATENCY REFERENCE // SPEED COMPARISON', columns: ['Component', 'Latency'], rows: [['CPU Cycle', '~0.3 ns'], ['L1 / L2 Cache', '1 – 4 ns'], ['RAM (DDR5)', '~50 ns'], ['NVMe SSD', '~25,000 ns']] };

export const lessons: Record<string, Lesson> = {
  'what-is-a-computer': {
    id: 'what-is-a-computer', levelId: 'level-1', order: 1, title: 'What Is a Computer?', slug: 'what-is-a-computer',
    description: 'What a computer is, why it exists, and the two halves — hardware and software — that make it work.',
    objectives: ['Explain in your own words what a computer is', 'Say why computers exist at all', 'Separate hardware from software with examples'],
    topics: ['Architecture', 'Hardware'],
    estimatedMinutes: 12, difficulty: 'EASY', prerequisites: [], xpReward: 10, status: 'PUBLISHED', version: 5, updatedAt: '2026-09-07',
    sections: [
      { id: 's1', label: 'START SIMPLE', title: 'A Machine That Follows Rules', blocks: [
        { type: 'paragraph', content: 'A **computer** is a machine that takes information in (**input**), follows exact rules to work on it (**processing**), and gives you a result (**output**). Nothing magical happens inside — every app, game and video is just billions of tiny rule-steps per second.' },
        { type: 'why', content: 'Humans are slow and error-prone at repetitive, exact work. A computer repeats the same rule a billion times without getting tired or making careless mistakes — which is why they now run everything from phones to hospitals to banks.' },
        { type: 'paragraph', content: 'Every computer is two halves working together. **Hardware** is the physical parts you can touch. **Software** is the invisible list of instructions that tells the hardware what to do.' },
        { type: 'table', table: { title: 'HARDWARE VS SOFTWARE', columns: ['Half', 'What it is', 'Examples'], rows: [['Hardware', 'Physical parts you can touch', 'Screen, battery, CPU chip, keyboard'], ['Software', 'Instructions that tell hardware what to do', 'Operating system, apps, games']] } },
        { type: 'objective', content: 'Explain in your own words what a computer is, why it exists, and the difference between hardware and software.' }] },
      { id: 's2', label: 'SUMMARY', title: 'Lesson Summary', blocks: [
        { type: 'summary', content: 'A computer is an input → processing → output machine. Hardware is the body, software is the instructions. Computers exist to run exact rules faster and more reliably than any human.' }] },
    ],
    practice: [
      { id: 'l1-e1', lessonId: 'what-is-a-computer', difficulty: 'EASY', xp: 20, question: 'Which of these is a computer?', options: ['Only desktop machines', 'A smartphone, a laptop and a desktop — all of them', 'Only machines with a keyboard', 'None of them are computers'], correctAnswer: 'A smartphone, a laptop and a desktop — all of them', explanation: 'All of them take input, run stored instructions, and produce output — the definition of a computer.' },
      { id: 'wiac-q2', lessonId: 'what-is-a-computer', difficulty: 'MEDIUM', xp: 40, question: 'Which of the following is an example of software?', options: ['Keyboard', 'Web Browser', 'Monitor', 'CPU'], correctAnswer: 'Web Browser', explanation: 'A web browser is a set of instructions executed by hardware. The keyboard, monitor, and CPU are physical components you can touch.' },
      { id: 'l1-h1', lessonId: 'what-is-a-computer', difficulty: 'HARD', xp: 80, question: 'A calculator does one job. A computer can do millions of different jobs. What makes the difference?', hint: 'The hardware stays the same… what changes?', options: ['A bigger screen', 'It can store and run many different programs (software) on the same hardware', 'More physical buttons', 'A faster battery'], correctAnswer: 'It can store and run many different programs (software) on the same hardware', explanation: 'Computer hardware is general-purpose. Swapping the software swaps the job — the same chips can run a game, a browser or a spreadsheet.' },
    ],
    masteryTest: [
      { id: 'l1-m1', lessonId: 'what-is-a-computer', difficulty: 'EASY', xp: 20, question: 'Software is the physical part of a computer you can touch.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Software is instructions. Hardware is the physical part.' },
      { id: 'l1-m2', lessonId: 'what-is-a-computer', difficulty: 'MEDIUM', xp: 40, question: 'Which pairing is correct?', options: ['Hardware = instructions, Software = physical parts', 'Hardware = physical parts, Software = instructions', 'Both mean the same thing', 'Hardware only exists in servers'], correctAnswer: 'Hardware = physical parts, Software = instructions', explanation: 'Hardware is the body; software is the set of instructions that drives it.' },
    ],
  },
  'inside-the-machine': {
    id: 'inside-the-machine', levelId: 'level-1', order: 2, title: 'Inside the Machine: CPU, RAM & Storage', slug: 'inside-the-machine',
    description: 'The three parts that do most of the work — and why data moves between them.',
    objectives: ['Describe the roles of CPU, RAM and storage', 'Explain why data moves from storage to RAM before the CPU uses it'],
    topics: ['Hardware', 'Memory Hierarchy'],
    estimatedMinutes: 15, difficulty: 'EASY', prerequisites: ['what-is-a-computer'], xpReward: 10, status: 'PUBLISHED', version: 1, updatedAt: '2026-09-07',
    sections: [
      { id: 's1', label: 'START SIMPLE', title: 'Three Jobs: Think, Remember, Keep', blocks: [
        { type: 'paragraph', content: 'Inside every computer three parts do most of the work. The **CPU** thinks — it executes instructions. **RAM** remembers — it holds whatever is being used right now. **Storage** keeps — it saves everything permanently, even when power is off.' },
        { type: 'analogyCards', items: [
          { icon: 'storage', tag: 'STORAGE', title: 'Pantry (SSD)', description: 'Massive shelf capacity that retains food overnight when the power is shut off, but takes time to walk to and retrieve items.' },
          { icon: 'memory', tag: 'MEMORY', title: 'Countertop (RAM)', description: "Arm's-reach workspace right in front of the cook. Holds ingredients currently being used, wiped clean at the end of every shift." },
          { icon: 'cpu', tag: 'PROCESSOR', title: 'The Chef (CPU)', description: 'Chops, seasons, and combines ingredients at blistering speed. Operates solely on what is set directly upon the countertop.' }] },
        { type: 'example', title: 'Example: loading a game', content: 'When you press play, the game’s files are read from **storage** and copied into **RAM**. The **CPU** then runs the game using that copy. If the power cuts, your unsaved progress in RAM is gone — but the game itself is still safe on storage.' }] },
      { id: 's2', label: 'TECHNICAL DEPTH', title: 'Why Speed Is Everything', blocks: [
        { type: 'explanation', content: 'The CPU is millions of times faster than storage, so data is staged: storage (huge, slow, permanent) → RAM (fast, temporary) → CPU (extremely fast). Each step up is smaller, faster and more expensive.' },
        { type: 'table', table: latencyTable }] },
      { id: 's3', label: 'SUMMARY', title: 'Lesson Summary', blocks: [
        { type: 'summary', content: 'CPU executes, RAM holds working data, storage keeps data permanently. Programs are copied into RAM first because the CPU cannot wait for slow storage.' }] },
    ],
    practice: [
      { id: 'wiac-m1', lessonId: 'inside-the-machine', difficulty: 'EASY', xp: 20, question: 'In the kitchen analogy, which component is the countertop?', options: ['SSD', 'RAM', 'CPU', 'Display'], correctAnswer: 'RAM', explanation: "RAM is the arm's-reach workspace holding data currently in use; the pantry (SSD) holds everything permanently." },
      { id: 'wiac-q1', lessonId: 'inside-the-machine', difficulty: 'MEDIUM', xp: 40, question: 'Why does a computer copy files from persistent Storage into RAM before running them?', hint: 'Think back to the analogy of the Pantry versus the Countertop.', options: ['Because storage drives automatically delete files immediately once read to conserve disk capacity.', 'RAM operates thousands of times faster, delivering the nanosecond access speeds needed for the processor to work without waiting.', 'Because CPU arithmetic registers cannot read data files that exceed 1 kilobyte in file size.'], correctAnswer: 'RAM operates thousands of times faster, delivering the nanosecond access speeds needed for the processor to work without waiting.', explanation: 'RAM delivers direct nanosecond bus access, allowing the CPU to execute instructions without stalling. Storage is permanent but ~500× slower.', reference: latencyTable },
      { id: 'l2-h1', lessonId: 'inside-the-machine', difficulty: 'HARD', xp: 80, question: 'Why can’t the CPU simply execute a program directly from storage?', options: ['The display would flicker.', 'The instruction pipeline would stall waiting on millisecond-speed reads.', 'The file would be deleted.', 'The OS shuts down safely first.'], correctAnswer: 'The instruction pipeline would stall waiting on millisecond-speed reads.', explanation: 'The CPU consumes billions of instructions per second; storage supplies reads thousands of times slower, so the pipeline would starve.' },
    ],
    masteryTest: [
      { id: 'l2-m1', lessonId: 'inside-the-machine', difficulty: 'EASY', xp: 20, question: 'Which component loses its contents when power is cut?', options: ['RAM', 'NVMe SSD', 'Hard drive', 'Flash memory card'], correctAnswer: 'RAM', explanation: 'RAM is volatile; storage technologies keep data without power.' },
      { id: 'wiac-m2', lessonId: 'inside-the-machine', difficulty: 'MEDIUM', xp: 40, question: 'A CPU can execute a program directly from storage without involving RAM.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Programs must be paged into RAM first; the CPU fetches instructions from the memory hierarchy, not from slow flash storage.' },
    ],
  },
  'input-output-os': {
    id: 'input-output-os', levelId: 'level-1', order: 3, title: 'Input, Output, Operating Systems & Apps', slug: 'input-output-os',
    description: 'How your intent gets in, how results get out, and who manages everything in between.',
    objectives: ['Identify input and output devices', 'Describe the operating system as the manager of hardware', 'Trace a real action from tap to screen'],
    topics: ['Operating Systems', 'Hardware'],
    estimatedMinutes: 15, difficulty: 'EASY', prerequisites: ['inside-the-machine'], xpReward: 10, status: 'PUBLISHED', version: 1, updatedAt: '2026-09-07', visualizationId: 'computer-processing',
    sections: [
      { id: 's1', label: 'START SIMPLE', title: 'Talking to the Machine', blocks: [
        { type: 'paragraph', content: '**Input** is how you speak to a computer: keyboard, touchscreen, microphone, mouse. **Output** is how it answers back: screen, speakers, printer.' },
        { type: 'paragraph', content: 'The **operating system** (OS) is the always-running manager: it decides which app gets the CPU, where files live in RAM, and what may touch the hardware. **Applications** (apps) are programs that do specific jobs on top of it.' },
        { type: 'analogy', content: 'The OS is an air-traffic controller: many planes (apps) want the same runway (CPU) at once. The controller sequences them safely so nothing collides.' }] },
      { id: 's2', label: 'INTERACTIVE FLOW', title: 'Scenario: opening document.txt', blocks: [
        { type: 'paragraph', content: 'Use the interactive flow below to watch one tap travel through seven stages — from your finger to glowing pixels.' }] },
      { id: 's3', label: 'SUMMARY', title: 'Lesson Summary', blocks: [
        { type: 'summary', content: 'Input devices carry your intent in, the OS arbitrates, apps do the work, and output devices carry results back. Every interaction with a computer follows this loop.' }] },
    ],
    practice: [
      { id: 'l3-e1', lessonId: 'input-output-os', difficulty: 'EASY', xp: 20, question: 'Which device is an input device?', options: ['Microphone', 'Printer', 'Speaker', 'Monitor'], correctAnswer: 'Microphone', explanation: 'A microphone sends your voice into the computer; the others send results out.' },
      { id: 'osk-q1', lessonId: 'input-output-os', difficulty: 'MEDIUM', xp: 40, question: 'Which component schedules which program uses the CPU?', options: ['The web browser', 'The operating system', 'The SSD controller', 'The display driver'], correctAnswer: 'The operating system', explanation: 'CPU scheduling is a core OS responsibility.' },
      { id: 'osk-q3', lessonId: 'input-output-os', difficulty: 'HARD', xp: 80, question: 'If the kernel (the OS core) crashes, why does the whole machine stop working?', options: ['Applications depend on the kernel for every hardware service.', 'The RAM is erased instantly.', 'The CPU overheats without the kernel.', 'The network disconnects first.'], correctAnswer: 'Applications depend on the kernel for every hardware service.', explanation: 'With the arbitrator gone, no program can safely request CPU, memory, or I/O — the system halts.' },
    ],
    masteryTest: [
      { id: 'l3-m1', lessonId: 'input-output-os', difficulty: 'EASY', xp: 20, question: 'When you tap a file icon, which software layer handles the tap first?', options: ['The operating system', 'The web browser', 'The storage chip', 'The display driver'], correctAnswer: 'The operating system', explanation: 'Input reaches the OS first; it routes the request to the right application.' },
      { id: 'osk-m1', lessonId: 'input-output-os', difficulty: 'MEDIUM', xp: 40, question: 'Applications talk to the kernel through…', options: ['System calls', 'Magic packets', 'Voltage spikes', 'CSS'], correctAnswer: 'System calls', explanation: 'Syscalls are the controlled interface into kernel space.' },
    ],
  },
  'bits-bytes-binary': {
    id: 'bits-bytes-binary', levelId: 'level-2', order: 1, title: 'Bits, Bytes & Binary', slug: 'bits-bytes-binary',
    description: 'How binary states encode complex instructions, text strings, and multimedia.',
    objectives: ['Define bit and byte', 'Convert small binary values to decimal'], topics: ['Hardware', 'Binary'],
    estimatedMinutes: 18, difficulty: 'EASY', prerequisites: ['input-output-os'], xpReward: 10, status: 'PUBLISHED', version: 3, updatedAt: '2026-09-07',
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
    id: 'operating-systems-kernel', levelId: 'level-7', order: 1, title: 'Operating Systems & The Kernel', slug: 'operating-systems-kernel',
    description: 'Process management, memory paging, and hardware orchestration abstractions.',
    objectives: ['Describe the OS as hardware arbitrator', 'Explain the kernel and system calls'], topics: ['Operating Systems'],
    estimatedMinutes: 25, difficulty: 'MEDIUM', prerequisites: ['bits-bytes-binary'], xpReward: 10, status: 'PUBLISHED', version: 2, updatedAt: '2026-09-05',
    sections: [
      { id: 's1', label: 'THE MANAGER', title: 'What the OS Actually Does', blocks: [
        { type: 'paragraph', content: 'The **operating system** is the software layer that arbitrates hardware: it decides which program uses the CPU, where data lives in RAM, and what may touch disks and network cards.' },
        { type: 'analogy', content: 'The kernel is an air-traffic controller: many planes (programs) want the same runway (CPU) at once. The controller sequences them safely so nothing collides.' },
        { type: 'explanation', content: 'The **kernel** is the core of the OS, always resident in memory. Applications request services through **system calls** — controlled doors into kernel space.' }] },
      { id: 's2', label: 'SUMMARY', title: 'Lesson Summary', blocks: [{ type: 'summary', content: 'The OS orchestrates hardware on behalf of applications; the kernel is its always-running core, accessed only through system calls.' }] },
    ],
    practice: [
      { id: 'osk-q1b', lessonId: 'operating-systems-kernel', difficulty: 'EASY', xp: 20, question: 'The kernel is…', options: ['The always-running core of the OS', 'A type of SSD', 'A browser extension', 'A programming language'], correctAnswer: 'The always-running core of the OS', explanation: 'The kernel stays resident in memory and arbitrates all hardware access.' },
      { id: 'osk-q2', lessonId: 'operating-systems-kernel', difficulty: 'MEDIUM', xp: 40, question: 'Which of these is an operating system?', options: ['Linux', 'Chrome', 'Excel', 'HTTP'], correctAnswer: 'Linux', explanation: 'Linux is a kernel/OS; Chrome and Excel are applications, HTTP is a protocol.' },
      { id: 'osk-q3b', lessonId: 'operating-systems-kernel', difficulty: 'HARD', xp: 80, question: 'Why do applications never touch hardware directly on a modern OS?', options: ['Safety and fairness: the kernel arbitrates every request.', 'Hardware refuses connections.', 'Apps are too small.', 'It would only use more battery.'], correctAnswer: 'Safety and fairness: the kernel arbitrates every request.', explanation: 'Direct access would let any app corrupt or monopolize hardware; the kernel enforces isolation.' },
    ],
    masteryTest: [{ id: 'osk-m1b', lessonId: 'operating-systems-kernel', difficulty: 'EASY', xp: 20, question: 'Virtual memory gives each process…', options: ['Its own address space view', 'A second CPU', 'Permanent storage', 'Faster network'], correctAnswer: 'Its own address space view', explanation: 'Virtual memory isolates processes and maps their views onto physical RAM.' }],
  },
  'terminal-file-systems': {
    id: 'terminal-file-systems', levelId: 'level-33', order: 1, title: 'The Terminal & File Systems', slug: 'terminal-file-systems',
    description: 'Shell commands, relative pathing, and directory tree navigation.',
    objectives: ['Use core shell commands', 'Reason with absolute and relative paths'], topics: ['Linux', 'Terminal'],
    estimatedMinutes: 30, difficulty: 'MEDIUM', prerequisites: ['operating-systems-kernel'], xpReward: 10, status: 'PUBLISHED', version: 2, updatedAt: '2026-09-05',
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
