import type { SortTrace, SortTraceStep, SortItem } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { MERGE_SORT_CODE_LINES } from './merge-code';

export function generateMergeSortTrace(values: number[]): SortTrace {
  const state = createInitialSortVizState(values);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  function resetActiveStates() {
    for (const item of state.items) {
      if (state.itemStates[item.id] !== 'sorted') {
        state.itemStates[item.id] = 'default';
      }
    }
  }

  function merge(left: number, mid: number, right: number) {
    state.pointers.i = left;
    state.pointers.min = mid;
    state.pointers.j = right;
    state.highlightLines = MERGE_SORT_CODE_LINES.temp;
    state.note = `合并区间 [${left}, ${mid}] 与 [${mid + 1}, ${right}]`;
    addStep('merge-start');

    const leftPart: SortItem[] = state.items.slice(left, mid + 1).map((x) => ({ ...x }));
    const rightPart: SortItem[] = state.items.slice(mid + 1, right + 1).map((x) => ({ ...x }));

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftPart.length && j < rightPart.length) {
      state.highlightLines = MERGE_SORT_CODE_LINES.compareLoop;
      state.note = `比较 ${leftPart[i]!.value} 与 ${rightPart[j]!.value}`;
      state.pointers.i = left + i;
      state.pointers.j = mid + 1 + j;
      state.itemStates[leftPart[i]!.id] = 'active';
      state.itemStates[rightPart[j]!.id] = 'active';
      addStep('compare');

      if (leftPart[i]!.value <= rightPart[j]!.value) {
        state.highlightLines = MERGE_SORT_CODE_LINES.takeLeft;
        state.items[k] = { ...leftPart[i]! };
        i++;
      } else {
        state.highlightLines = MERGE_SORT_CODE_LINES.takeRight;
        state.items[k] = { ...rightPart[j]! };
        j++;
      }
      state.note = `写入索引 ${k}`;
      addStep('write');
      k++;
      resetActiveStates();
    }

    while (i < leftPart.length) {
      state.highlightLines = MERGE_SORT_CODE_LINES.restLeft;
      state.items[k] = { ...leftPart[i]! };
      state.note = `左半剩余元素写入索引 ${k}`;
      addStep('left-rest');
      i++;
      k++;
    }

    while (j < rightPart.length) {
      state.highlightLines = MERGE_SORT_CODE_LINES.restRight;
      state.items[k] = { ...rightPart[j]! };
      state.note = `右半剩余元素写入索引 ${k}`;
      addStep('right-rest');
      j++;
      k++;
    }

    for (let t = left; t <= right; t++) {
      state.itemStates[state.items[t]!.id] = 'sorted';
    }
    state.highlightLines = MERGE_SORT_CODE_LINES.writeBack;
    state.note = `区间 [${left}, ${right}] 合并完成`;
    addStep('merge-done');
  }

  function mergeSort(left: number, right: number) {
    if (left >= right) {
      if (left === right) {
        state.itemStates[state.items[left]!.id] = 'sorted';
      }
      state.highlightLines = MERGE_SORT_CODE_LINES.base;
      addStep('base');
      return;
    }
    const mid = Math.floor((left + right) / 2);
    state.highlightLines = MERGE_SORT_CODE_LINES.mid;
    state.note = `拆分区间 [${left}, ${right}]，mid=${mid}`;
    addStep('split');

    state.highlightLines = MERGE_SORT_CODE_LINES.recurseLeft;
    addStep('left');
    mergeSort(left, mid);

    state.highlightLines = MERGE_SORT_CODE_LINES.recurseRight;
    addStep('right');
    mergeSort(mid + 1, right);

    merge(left, mid, right);
  }

  state.note = '🚀 开始归并排序';
  state.highlightLines = MERGE_SORT_CODE_LINES.mid;
  addStep('start');

  if (state.items.length > 0) {
    mergeSort(0, state.items.length - 1);
  }

  for (const item of state.items) {
    state.itemStates[item.id] = 'sorted';
  }
  state.pointers = {};
  state.note = '✅ 排序完成';
  state.highlightLines = MERGE_SORT_CODE_LINES.writeBack;
  addStep('done');

  return { steps };
}
