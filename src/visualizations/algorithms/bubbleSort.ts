import { ArrayAlgorithm, ArrayVizStep } from '../types';

export const bubbleSort: ArrayAlgorithm = {
  id: 'bubble-sort',
  title: 'Bubble Sort',
  shortDescription: 'Repeatedly compare neighbouring elements and swap them when they are out of order. Each pass pushes the largest remaining value to the end.',
  complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  complexityExplained: 'Big-O describes how the work grows as the input grows; "n" is the number of items. O(n²) means doubling the items makes the work grow about four times, because bubble sort compares almost every pair. The best case O(n) happens when the list is already sorted: one pass with zero swaps proves it and this version stops early. Space O(1) means it sorts in place — it only needs room for a couple of temporary values, never a second list.',
  pseudocode: [
    'pass = 0',
    'repeat',
    '  swapped = false',
    '  for j = 0 … n-2-pass',
    '    compare a[j], a[j+1]',
    '    if out of order: swap, swapped = true',
    '  lock position n-1-pass as sorted',
    '  pass = pass + 1',
    'until not swapped',
  ],
  generateSteps(items) {
    const arr = items.map(x => ({ ...x }));
    const n = arr.length;
    const steps: ArrayVizStep[] = [];
    let comparisons = 0, swaps = 0, pass = 0, sortedFrom = n;
    const snap = (kind: ArrayVizStep['kind'], active: [number, number] | null, swappedNow: boolean, explanation: string, codeLine: number) => {
      steps.push({ kind, items: arr.map(x => ({ ...x })), active, pass, comparisons, swaps, sortedFrom, swappedNow, explanation, codeLine });
    };
    snap('initial', null, false, `Starting array: ${arr.map(x => x.value).join(', ')}. Press Step or Play to begin.`, 0);
    if (n <= 1) { sortedFrom = 0; snap('sorted', null, false, 'An array with 0 or 1 elements is already sorted.', 8); return steps; }
    for (let end = n - 1; end > 0; end--) {
      pass += 1;
      sortedFrom = end + 1;
      let swapped = false;
      for (let j = 0; j < end; j++) {
        comparisons += 1;
        snap('compare', [j, j + 1], false, `Pass ${pass}: comparing ${arr[j].value} and ${arr[j + 1].value}.`, 4);
        if (arr[j].value > arr[j + 1].value) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps += 1; swapped = true;
          snap('swap', [j, j + 1], true, `${arr[j + 1].value} is larger than ${arr[j].value}, so they swap places.`, 5);
        } else {
          snap('no-swap', [j, j + 1], false, `${arr[j].value} is already before ${arr[j + 1].value} — these two are in the correct relative order, no swap needed.`, 4);
        }
      }
      if (!swapped) {
        sortedFrom = 0;
        snap('pass-complete', null, false, `Pass ${pass} finished with zero swaps — nothing moved, so the whole array is already sorted and we stop early.`, 8);
        break;
      }
      sortedFrom = end;
      snap('pass-complete', null, false, `Pass ${pass} complete — the largest remaining value (${arr[end].value}) is now locked at position ${end}.`, 6);
    }
    sortedFrom = 0;
    snap('sorted', null, false, `Sorting complete: ${pass} passes, ${comparisons} comparisons, ${swaps} swaps. Every element is in its final position.`, 8);
    return steps;
  },
};
