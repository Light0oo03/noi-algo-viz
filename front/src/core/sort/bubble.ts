import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { BUBBLE_SORT_CODE_LINES } from './bubble-code';

export function generateBubbleSortTrace(values: number[]): SortTrace {
  const state = createInitialSortVizState(values);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  state.note = '🚀 开始冒泡排序';
  state.highlightLines = BUBBLE_SORT_CODE_LINES.outer;
  addStep('start');

  const n = state.items.length;
  for (let i = 0; i < n - 1; i++) {
    state.pointers.i = i;
    state.highlightLines = BUBBLE_SORT_CODE_LINES.inner;
    state.note = `第 ${i + 1} 轮冒泡`;
    addStep('outer');

    for (let j = 0; j < n - 1 - i; j++) {
      state.pointers.j = j;
      const a = state.items[j];
      const b = state.items[j + 1];
      if (!a || !b) continue;
      state.itemStates[a.id] = 'active';
      state.itemStates[b.id] = 'active';
      state.highlightLines = BUBBLE_SORT_CODE_LINES.compare;
      state.note = `比较 ${a.value} 和 ${b.value}`;
      addStep('compare');

      if (a.value > b.value) {
        state.highlightLines = BUBBLE_SORT_CODE_LINES.swap;
        state.note = `交换 ${a.value} 与 ${b.value}`;
        state.itemStates[a.id] = 'swap';
        state.itemStates[b.id] = 'swap';
        addStep('swap');

        const temp = state.items[j]!;
        state.items[j] = state.items[j + 1]!;
        state.items[j + 1] = temp;
        addStep('swapped');
      }

      state.itemStates[a.id] = 'default';
      state.itemStates[b.id] = 'default';
    }

    const sortedItem = state.items[n - 1 - i];
    if (sortedItem) state.itemStates[sortedItem.id] = 'sorted';
  }

  if (state.items.length > 0) {
    const first = state.items[0]!;
    state.itemStates[first.id] = 'sorted';
  }
  state.pointers = {};
  state.note = '✅ 排序完成';
  state.highlightLines = BUBBLE_SORT_CODE_LINES.done;
  addStep('done');

  return { steps };
}
