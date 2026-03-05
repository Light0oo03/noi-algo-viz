import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { SELECTION_SORT_CODE_LINES } from './selection-code';

export function generateSelectionSortTrace(values: number[]): SortTrace {
  const state = createInitialSortVizState(values);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  state.note = '🚀 开始选择排序';
  state.highlightLines = SELECTION_SORT_CODE_LINES.outer;
  addStep('start');

  const n = state.items.length;
  for (let i = 0; i < n - 1; i++) {
    state.pointers.i = i;
    let minIndex = i;
    state.pointers.min = minIndex;
    const minItem = state.items[minIndex];
    if (minItem) state.itemStates[minItem.id] = 'pivot';
    state.highlightLines = SELECTION_SORT_CODE_LINES.initMin;
    state.note = `第 ${i + 1} 轮：初始最小值索引=${i}`;
    addStep('init-min');

    for (let j = i + 1; j < n; j++) {
      state.pointers.j = j;
      const current = state.items[j];
      const minCurrent = state.items[minIndex];
      if (!current || !minCurrent) continue;
      state.itemStates[current.id] = 'active';
      state.highlightLines = SELECTION_SORT_CODE_LINES.updateMin;
      state.note = `比较 ${current.value} 和当前最小值 ${minCurrent.value}`;
      addStep('compare');

      if (current.value < minCurrent.value) {
        state.itemStates[minCurrent.id] = 'default';
        minIndex = j;
        state.pointers.min = minIndex;
        state.itemStates[current.id] = 'pivot';
        state.highlightLines = SELECTION_SORT_CODE_LINES.updateMin;
        state.note = `更新最小值索引为 ${minIndex}`;
        addStep('update-min');
      } else {
        state.itemStates[current.id] = 'default';
      }
    }

    if (minIndex !== i) {
      const left = state.items[i]!;
      const min = state.items[minIndex]!;
      state.itemStates[left.id] = 'swap';
      state.itemStates[min.id] = 'swap';
      state.highlightLines = SELECTION_SORT_CODE_LINES.swap;
      state.note = `交换索引 ${i} 与 ${minIndex}`;
      addStep('swap');

      const temp = state.items[i]!;
      state.items[i] = state.items[minIndex]!;
      state.items[minIndex] = temp;
      addStep('swapped');
    }

    const sortedItem = state.items[i];
    if (sortedItem) state.itemStates[sortedItem.id] = 'sorted';
    state.pointers.j = undefined;
    state.pointers.min = undefined;
  }

  if (state.items.length > 0) {
    const last = state.items[state.items.length - 1]!;
    state.itemStates[last.id] = 'sorted';
  }
  state.pointers = {};
  state.note = '✅ 排序完成';
  state.highlightLines = SELECTION_SORT_CODE_LINES.done;
  addStep('done');

  return { steps };
}
