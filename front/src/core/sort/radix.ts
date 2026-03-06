import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { RADIX_SORT_CODE_LINES } from './radix-code';

export function generateRadixSortTrace(values: number[]): SortTrace {
  const normalized = values.map((x) => Math.max(0, x));
  const state = createInitialSortVizState(normalized);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  if (state.items.length === 0) {
    state.note = '✅ 空数组，无需排序';
    state.highlightLines = RADIX_SORT_CODE_LINES.done;
    addStep('empty');
    return { steps };
  }

  const arr = state.items;
  const maxVal = Math.max(...arr.map((x) => x.value));

  state.note = `🚀 开始基数排序（非负整数）`; 
  state.highlightLines = RADIX_SORT_CODE_LINES.max;
  addStep('start');

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    state.note = `处理位权 exp=${exp}`;
    state.highlightLines = RADIX_SORT_CODE_LINES.expLoop;
    addStep('exp-loop');

    const buckets: typeof arr[] = Array.from({ length: 10 }, () => []);
    state.highlightLines = RADIX_SORT_CODE_LINES.bucketInit;
    addStep('bucket-init');

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]!;
      const digit = Math.floor(item.value / exp) % 10;
      state.pointers.i = i;
      state.pointers.j = digit;
      state.itemStates[item.id] = 'active';
      state.note = `读取 nums[${i}]=${item.value}，digit=${digit}`;
      state.highlightLines = RADIX_SORT_CODE_LINES.scan;
      addStep('scan');
      buckets[digit]!.push({ ...item });
      state.highlightLines = RADIX_SORT_CODE_LINES.push;
      addStep('push');
      state.itemStates[item.id] = 'default';
    }

    const merged = ([] as typeof arr).concat(...buckets);
    for (let i = 0; i < merged.length; i++) {
      const next = merged[i]!;
      arr[i] = { ...next };
    }
    state.note = `按位 exp=${exp} 收集完成`;
    state.highlightLines = RADIX_SORT_CODE_LINES.flatten;
    addStep('flatten');
  }

  for (const item of arr) {
    state.itemStates[item.id] = 'sorted';
  }
  state.pointers = {};
  state.note = '✅ 排序完成';
  state.highlightLines = RADIX_SORT_CODE_LINES.done;
  addStep('done');

  return { steps };
}
