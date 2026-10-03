export interface CodingTestCase { name: string; input: unknown[]; expected: unknown }
export interface CodingTask {
  id: string; title: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string; worldNumber: number; xp: number;
  prompt: string; fnName: string; starterCode: string; hints: string[];
  tests: CodingTestCase[]; status: 'PUBLISHED';
}

export const codingTasks: CodingTask[] = [
  {
    id: 'ct-sum-array', title: 'Sum an Array', difficulty: 'EASY', topic: 'Arrays', worldNumber: 6, xp: 15,
    prompt: 'Write a function that returns the sum of all numbers in an array. An empty array sums to 0.',
    fnName: 'sumArray',
    starterCode: 'function sumArray(numbers) {\n  // your code here\n}\n',
    hints: ['Start with let total = 0 and loop over the array.', 'A for...of loop keeps this short.'],
    tests: [
      { name: 'sums [1,2,3]', input: [[1, 2, 3]], expected: 6 },
      { name: 'empty array', input: [[]], expected: 0 },
      { name: 'negatives', input: [[-5, 5, 10]], expected: 10 },
    ],
    status: 'PUBLISHED',
  },
  {
    id: 'ct-palindrome', title: 'Palindrome Check', difficulty: 'EASY', topic: 'Strings', worldNumber: 1, xp: 15,
    prompt: 'Return true when a string reads the same forwards and backwards. An empty string counts as a palindrome.',
    fnName: 'isPalindrome',
    starterCode: 'function isPalindrome(text) {\n  // your code here\n}\n',
    hints: ['Compare the string with a reversed copy.', 'Split, reverse, join.'],
    tests: [
      { name: 'racecar', input: ['racecar'], expected: true },
      { name: 'hello', input: ['hello'], expected: false },
      { name: 'empty', input: [''], expected: true },
    ],
    status: 'PUBLISHED',
  },
  {
    id: 'ct-fizzbuzz', title: 'FizzBuzz List', difficulty: 'EASY', topic: 'Loops', worldNumber: 1, xp: 20,
    prompt: 'Return an array of strings for 1..n: "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both, otherwise the number as a string.',
    fnName: 'fizzBuzzList',
    starterCode: 'function fizzBuzzList(n) {\n  // your code here\n}\n',
    hints: ['Check the multiple-of-15 case first.', 'Push into an array and return it at the end.'],
    tests: [
      { name: 'n = 5', input: [5], expected: ['1', '2', 'Fizz', '4', 'Buzz'] },
      { name: 'n = 3', input: [3], expected: ['1', '2', 'Fizz'] },
      { name: 'n = 15 last item', input: [15], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'] },
    ],
    status: 'PUBLISHED',
  },
  {
    id: 'ct-binary-search', title: 'Binary Search', difficulty: 'MEDIUM', topic: 'Searching', worldNumber: 7, xp: 30,
    prompt: 'Given a sorted array and a target, return the target index or -1 when absent. Aim for O(log n) — halve the search range each step.',
    fnName: 'binarySearch',
    starterCode: 'function binarySearch(sorted, target) {\n  // your code here\n}\n',
    hints: ['Keep low and high pointers; compare the middle element.', 'Move low = mid + 1 or high = mid - 1 based on the comparison.'],
    tests: [
      { name: 'found at 1', input: [[1, 3, 5, 7], 3], expected: 1 },
      { name: 'missing', input: [[1, 3, 5, 7], 4], expected: -1 },
      { name: 'empty', input: [[], 9], expected: -1 },
    ],
    status: 'PUBLISHED',
  },
  {
    id: 'ct-max-subarray', title: 'Maximum Subarray Sum', difficulty: 'MEDIUM', topic: 'Dynamic Programming', worldNumber: 7, xp: 30,
    prompt: 'Return the largest sum of any contiguous (non-empty) subarray. Kadane\'s algorithm solves this in one pass.',
    fnName: 'maxSubarraySum',
    starterCode: 'function maxSubarraySum(numbers) {\n  // your code here\n}\n',
    hints: ['Track the best sum ending at the current position.', 'bestEndingHere = max(x, bestEndingHere + x).'],
    tests: [
      { name: 'classic', input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { name: 'all positive', input: [[1, 2, 3]], expected: 6 },
      { name: 'single negative', input: [[-1]], expected: -1 },
    ],
    status: 'PUBLISHED',
  },
  {
    id: 'ct-word-frequency', title: 'Word Frequency', difficulty: 'MEDIUM', topic: 'Objects', worldNumber: 1, xp: 25,
    prompt: 'Given a string of space-separated words, return an object mapping each word to its count. An empty string returns an empty object.',
    fnName: 'wordFrequency',
    starterCode: 'function wordFrequency(text) {\n  // your code here\n}\n',
    hints: ['Split on spaces and filter out empty strings.', 'counts[word] = (counts[word] || 0) + 1.'],
    tests: [
      { name: 'sentence', input: ['the cat and the dog'], expected: { the: 2, cat: 1, and: 1, dog: 1 } },
      { name: 'single', input: ['a'], expected: { a: 1 } },
      { name: 'empty', input: [''], expected: {} },
    ],
    status: 'PUBLISHED',
  },
  {
    id: 'ct-longest-run', title: 'Longest Unique Run', difficulty: 'HARD', topic: 'Strings', worldNumber: 7, xp: 40,
    prompt: 'Return the length of the longest substring without repeating characters. A sliding window over the string solves it in one pass.',
    fnName: 'longestUniqueRun',
    starterCode: 'function longestUniqueRun(text) {\n  // your code here\n}\n',
    hints: ['Remember the last index seen for each character.', 'When a repeat appears inside the window, move the window start past it.'],
    tests: [
      { name: 'abcabcbb', input: ['abcabcbb'], expected: 3 },
      { name: 'bbbbb', input: ['bbbbb'], expected: 1 },
      { name: 'empty', input: [''], expected: 0 },
    ],
    status: 'PUBLISHED',
  },
];

export function getCodingTasks(difficulty?: string): CodingTask[] {
  return codingTasks.filter(t => t.status === 'PUBLISHED' && (!difficulty || difficulty === 'all' || t.difficulty === difficulty));
}
