import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { HASH_OPEN_SEARCH_CODE_LINES } from './hash-open-code';

function nextTableSize(n: number): number {
  return Math.max(7, n * 2 + 1);
}

function hash(x: number, m: number): number {
  return ((x % m) + m) % m;
}

export function generateHashOpenSearchTrace(items: number[], target: number): SearchTrace {
  const m = nextTableSize(items.length);
  const table = Array(m).fill(-1);

  for (const x of items) {
    let idx = hash(x, m);
    let step = 0;
    while (step < m && table[idx] !== -1) {
      idx = (idx + 1) % m;
      step++;
    }
    if (step < m) table[idx] = x;
  }

  const state = createInitialSearchVizState(table, target);
  const steps: SearchTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  state.note = `🚀 开始哈希查找（开放定址），表长=${m}，空槽=-1`;
  state.highlightLines = HASH_OPEN_SEARCH_CODE_LINES.init;
  addStep('start');

  let idx = hash(target, m);
  let step = 0;

  while (step < m && state.items[idx]!.value !== -1) {
    state.pointers.index = idx;
    state.itemStates[state.items[idx]!.id] = 'active';
    state.note = `探测槽位 ${idx}，值=${state.items[idx]!.value}`;
    state.highlightLines = HASH_OPEN_SEARCH_CODE_LINES.loop;
    addStep('probe');

    if (state.items[idx]!.value === target) {
      state.resultIndex = idx;
      state.itemStates[state.items[idx]!.id] = 'found';
      state.note = `✅ 找到目标值 ${target}，槽位=${idx}`;
      state.highlightLines = HASH_OPEN_SEARCH_CODE_LINES.found;
      addStep('found');
      return { steps };
    }

    state.itemStates[state.items[idx]!.id] = 'checked';
    idx = (idx + 1) % m;
    step++;
    state.highlightLines = HASH_OPEN_SEARCH_CODE_LINES.probe;
    addStep('next-probe');
  }

  state.pointers.index = idx;
  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = HASH_OPEN_SEARCH_CODE_LINES.notFound;
  addStep('not-found');
  return { steps };
}
