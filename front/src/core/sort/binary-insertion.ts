import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { BINARY_INSERTION_SORT_CODE_LINES } from './binary-insertion-code';

export function generateBinaryInsertionSortTrace(values: number[]): SortTrace {
  const state = createInitialSortVizState(values);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  if (state.items.length > 0) {
    state.itemStates[state.items[0]!.id] = 'sorted';
  }

  state.note = '🚀 开始折半插入排序';
  state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.outer;
  addStep('start');

  const n = state.items.length;
  for (let i = 1; i < n; i++) {
    state.pointers = { i };
    state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.outer;
    state.note = `处理索引 ${i}，使用二分法确定插入位置`;
    addStep('outer');

    const keyItem = state.items[i]!;
    state.itemStates[keyItem.id] = 'active';
    let left = 0;
    let right = i - 1;
    state.pointers = { i, min: left, j: right };
    state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.init;
    state.note = `当前待插入值 ${keyItem.value}，二分区间 [${left}, ${right}]`;
    addStep('init');

    while (left <= right) {
      state.pointers = { i, min: left, j: right };
      state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.bsearchLoop;
      addStep('bsearch-loop');

      const mid = (left + right) >> 1;
      state.pointers = { i, min: left, j: mid };
      state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.mid;
      state.note = `mid=${mid}，比较 nums[mid]=${state.items[mid]!.value} 与 key=${keyItem.value}`;
      addStep('mid');

      if (state.items[mid]!.value > keyItem.value) {
        state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.cmpLeft;
        state.note = `${state.items[mid]!.value} > ${keyItem.value}，收缩右边界到 ${mid - 1}`;
        addStep('cmp-left');
        right = mid - 1;
      } else {
        state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.cmpRight;
        state.note = `${state.items[mid]!.value} <= ${keyItem.value}，收缩左边界到 ${mid + 1}`;
        addStep('cmp-right');
        left = mid + 1;
      }
    }

    state.pointers = { i, min: left };
    state.note = `插入位置确定为 ${left}，开始右移区间 [${left}, ${i - 1}]`;
    addStep('insert-pos');

    for (let j = i - 1; j >= left; j--) {
      const moving = state.items[j]!;
      state.pointers = { i, j, min: left };
      state.itemStates[moving.id] = 'swap';
      state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.shift;
      state.note = `右移 nums[${j}]=${moving.value} 到位置 ${j + 1}`;
      addStep('shift');

      state.items[j + 1] = moving;
      addStep('shifted');
      state.itemStates[moving.id] = 'default';
    }

    state.items[left] = keyItem;
    state.itemStates[keyItem.id] = 'default';
    state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.place;
    state.pointers = { i, min: left };
    state.note = `将 ${keyItem.value} 插入到位置 ${left}`;
    addStep('place');

    for (let k = 0; k <= i; k++) {
      state.itemStates[state.items[k]!.id] = 'sorted';
    }
  }

  state.pointers = {};
  state.note = '✅ 排序完成';
  state.highlightLines = BINARY_INSERTION_SORT_CODE_LINES.done;
  addStep('done');

  return { steps };
}
