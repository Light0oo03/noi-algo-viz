import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { COUNTING_SORT_CODE_LINES } from './counting-code';

export function generateCountingSortTrace(values: number[]): SortTrace {
  const normalized = values.map((x) => Math.max(0, x));
  const state = createInitialSortVizState(normalized);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  if (state.items.length === 0) {
    state.note = '✅ 空数组，无需排序';
    state.highlightLines = COUNTING_SORT_CODE_LINES.done;
    addStep('empty');
    return { steps };
  }

  const maxVal = Math.max(...state.items.map((x) => x.value));
  const cnt = Array(maxVal + 1).fill(0);

  state.note = `🚀 开始计数排序（值域 0..${maxVal}）`;
  state.highlightLines = COUNTING_SORT_CODE_LINES.max;
  addStep('start');

  for (let i = 0; i < state.items.length; i++) {
    const it = state.items[i]!;
    state.pointers.i = i;
    state.itemStates[it.id] = 'active';
    cnt[it.value]++;
    state.note = `计数：值 ${it.value}，cnt[${it.value}]=${cnt[it.value]}`;
    state.highlightLines = COUNTING_SORT_CODE_LINES.count;
    addStep('count');
    state.itemStates[it.id] = 'default';
  }

  let idx = 0;
  state.highlightLines = COUNTING_SORT_CODE_LINES.init;
  addStep('init-write');

  for (let v = 0; v <= maxVal; v++) {
    state.pointers.j = v;
    state.highlightLines = COUNTING_SORT_CODE_LINES.valueLoop;
    addStep('value-loop');

    while (cnt[v] > 0) {
      const item = state.items[idx]!;
      item.value = v;
      state.pointers.i = idx;
      state.itemStates[item.id] = 'swap';
      state.note = `写回：nums[${idx}] = ${v}`;
      state.highlightLines = COUNTING_SORT_CODE_LINES.write;
      addStep('write');
      state.itemStates[item.id] = 'sorted';
      idx++;
      cnt[v]--;
      state.highlightLines = COUNTING_SORT_CODE_LINES.writeLoop;
      addStep('decrease-count');
    }
  }

  state.pointers = {};
  state.note = '✅ 排序完成';
  state.highlightLines = COUNTING_SORT_CODE_LINES.done;
  addStep('done');

  return { steps };
}
