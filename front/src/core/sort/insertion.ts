import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { INSERTION_SORT_CODE_LINES } from './insertion-code';

export function generateInsertionSortTrace(values: number[]): SortTrace {
  const state = createInitialSortVizState(values);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  if (state.items.length > 0) {
    state.itemStates[state.items[0]!.id] = 'sorted';
  }

  state.note = '🚀 开始插入排序';
  state.highlightLines = INSERTION_SORT_CODE_LINES.outer;
  addStep('start');

  const n = state.items.length;
  for (let i = 1; i < n; i++) {
    state.pointers.i = i;
    state.highlightLines = INSERTION_SORT_CODE_LINES.init;
    state.note = `处理索引 ${i}，向前插入`;
    addStep('outer');

    let j = i;
    while (j > 0 && state.items[j - 1]!.value > state.items[j]!.value) {
      state.pointers.j = j;
      const left = state.items[j - 1]!;
      const right = state.items[j]!;
      state.itemStates[left.id] = 'active';
      state.itemStates[right.id] = 'active';
      state.highlightLines = INSERTION_SORT_CODE_LINES.loop;
      state.note = `比较 ${left.value} 与 ${right.value}`;
      addStep('compare');

      state.itemStates[left.id] = 'swap';
      state.itemStates[right.id] = 'swap';
      state.highlightLines = INSERTION_SORT_CODE_LINES.swap;
      state.note = `交换 ${left.value} 与 ${right.value}`;
      addStep('swap');

      state.items[j - 1] = right;
      state.items[j] = left;
      addStep('swapped');

      state.itemStates[left.id] = 'default';
      state.itemStates[right.id] = 'default';

      j--;
      state.highlightLines = INSERTION_SORT_CODE_LINES.dec;
      addStep('dec-j');
    }

    for (let k = 0; k <= i; k++) {
      state.itemStates[state.items[k]!.id] = 'sorted';
    }
  }

  state.pointers = {};
  state.note = '✅ 排序完成';
  state.highlightLines = INSERTION_SORT_CODE_LINES.done;
  addStep('done');

  return { steps };
}
