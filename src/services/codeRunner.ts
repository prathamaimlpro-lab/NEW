import type { CodingTask } from '../data/codingTasks';

export interface RunCaseResult { name: string; ok: boolean; detail: string }
export interface RunResult {
  ok: boolean; passed: number; total: number; cases: RunCaseResult[];
  error?: string; timedOut?: boolean; ms: number;
}

/* Learner code runs inside a disposable Web Worker: no DOM access, hard timeout,
   terminated after every run. No external dependencies. */
const WORKER_SOURCE = `
self.onmessage = function (e) {
  var code = e.data.code, fnName = e.data.fnName, tests = e.data.tests;
  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== typeof b || a === null || b === null) return false;
    if (typeof a !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return deepEqual(a[k], b[k]); });
  }
  function fmt(v) { try { return JSON.stringify(v); } catch (err) { return String(v); } }
  var fn;
  try {
    fn = new Function(code + '\\n;return typeof ' + fnName + ' === "function" ? ' + fnName + ' : null;')();
  } catch (err) {
    self.postMessage({ ok: false, passed: 0, total: tests.length, cases: [], error: 'Syntax error: ' + err.message, ms: 0 });
    return;
  }
  if (!fn) {
    self.postMessage({ ok: false, passed: 0, total: tests.length, cases: [], error: 'Define a function named ' + fnName + '.', ms: 0 });
    return;
  }
  var cases = [], passed = 0;
  for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    try {
      var args = t.input.map(function (v) { return (typeof v === 'object' && v !== null) ? JSON.parse(JSON.stringify(v)) : v; });
      var got = fn.apply(null, args);
      var ok = deepEqual(got, t.expected);
      if (ok) passed++;
      cases.push({ name: t.name, ok: ok, detail: ok ? 'passed' : 'expected ' + fmt(t.expected) + ' but got ' + fmt(got) });
    } catch (err) {
      cases.push({ name: t.name, ok: false, detail: 'runtime error: ' + err.message });
    }
  }
  self.postMessage({ ok: passed === tests.length, passed: passed, total: tests.length, cases: cases, ms: 0 });
};
`;

export function runCodingTask(task: CodingTask, code: string, timeoutMs = 2500): Promise<RunResult> {
  return new Promise(resolve => {
    const started = performance.now();
    let settled = false;
    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const finish = (r: RunResult) => {
      if (settled) return;
      settled = true;
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ...r, ms: Math.round(performance.now() - started) });
    };
    const timer = window.setTimeout(() => {
      finish({ ok: false, passed: 0, total: task.tests.length, cases: [], error: 'Stopped: the code took too long (possible infinite loop).', timedOut: true, ms: 0 });
    }, timeoutMs);
    worker.onmessage = (e: MessageEvent<RunResult>) => { window.clearTimeout(timer); finish(e.data); };
    worker.onerror = e => { window.clearTimeout(timer); finish({ ok: false, passed: 0, total: task.tests.length, cases: [], error: e.message || 'The code runner failed to start.', ms: 0 }); };
    worker.postMessage({ code, fnName: task.fnName, tests: task.tests });
  });
}
