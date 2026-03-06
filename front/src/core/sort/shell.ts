import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { SHELL_SORT_CODE_LINES } from './shell-code';

export function generateShellSortTrace(values: number[]): SortTrace {
  const state = createInitialSortVizState(values);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  state.note = '🚀 开始希尔排序';
  state.highlightLines = SHELL_SORT_CODE_LINES.gapLoop;
  addStep('start');

  const n = state.items.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    state.note = `当前 gap=${gap}`;
    state.highlightLines = SHELL_SORT_CODE_LINES.gapLoop;
    addStep('gap');

    for (let i = gap; i < n; i++) {
      state.pointers.i = i;
      state.note = `处理索引 ${i}`;
      state.highlightLines = SHELL_SORT_CODE_LINES.iLoop;
      addStep('i-loop');

      let j = i;
      while (j >= gap && state.items[j - gap]!.value > state.items[j]!.value) {
        state.pointers.j = j;
        const left = state.items[j - gap]!;
        const right = state.items[j]!;
        state.itemStates[left.id] = 'active';
        state.itemStates[right.id] = 'active';
        state.note = `比较 nums[${j - gap}]=${left.value} 与 nums[${j}]=${right.value}`;
        state.highlightLines = SHELL_SORT_CODE_LINES.compare;
        addStep('compare');

        state.itemStates[left.id] = 'swap';
        state.itemStates[right.id] = 'swap';
        state.highlightLines = SHELL_SORT_CODE_LINES.swap;
        state.note = `交换索引 ${j - gap} 与 ${j}`;
        addStep('swap');

        state.items[j - gap] = right;
        state.items[j] = left;
        addStep('swapped');

        state.itemStates[left.id] = 'default';
        state.itemStates[right.id] = 'default';
        j -= gap;
        state.highlightLines = SHELL_SORT_CODE_LINES.move;
        addStep('move');
      }
    }
  }

  for (const item of state.items) {
    state.itemStates[item.id] = 'sorted';
  }
  state.pointers = {};
  state.note = '✅ 排序完成';
  state.highlightLines = SHELL_SORT_CODE_LINES.done;
  addStep('done');

  return { steps };
}
