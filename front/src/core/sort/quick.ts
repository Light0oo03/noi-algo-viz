import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { QUICK_SORT_CODE_LINES } from './quick-code';

export function generateQuickSortTrace(values: number[]): SortTrace {
  const state = createInitialSortVizState(values);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  state.note = '🚀 开始快速排序';
  state.highlightLines = QUICK_SORT_CODE_LINES.pivot;
  addStep('start');

  function clearNonSortedStates() {
    for (const item of state.items) {
      if (state.itemStates[item.id] !== 'sorted') {
        state.itemStates[item.id] = 'default';
      }
    }
  }

  function partition(left: number, right: number): number {
    const pivotItem = state.items[right]!;
    state.pointers.min = right;
    state.itemStates[pivotItem.id] = 'pivot';
    state.highlightLines = QUICK_SORT_CODE_LINES.pivot;
    state.note = `选择 pivot=索引 ${right}（值=${pivotItem.value}）`;
    addStep('pivot');

    let i = left - 1;
    state.pointers.i = i;

    for (let j = left; j < right; j++) {
      state.pointers.j = j;
      state.highlightLines = QUICK_SORT_CODE_LINES.loop;
      const cur = state.items[j]!;
      state.itemStates[cur.id] = 'active';
      state.note = `比较 nums[${j}]=${cur.value} 与 pivot=${pivotItem.value}`;
      addStep('compare');

      if (cur.value <= pivotItem.value) {
        i++;
        state.pointers.i = i;
        state.highlightLines = QUICK_SORT_CODE_LINES.moveI;
        addStep('move-i');

        if (i !== j) {
          const a = state.items[i]!;
          const b = state.items[j]!;
          state.itemStates[a.id] = 'swap';
          state.itemStates[b.id] = 'swap';
          state.highlightLines = QUICK_SORT_CODE_LINES.swap;
          state.note = `交换索引 ${i} 与 ${j}`;
          addStep('swap');
          state.items[i] = b;
          state.items[j] = a;
          addStep('swapped');
        }
      }

      clearNonSortedStates();
      state.itemStates[pivotItem.id] = 'pivot';
    }

    const p = i + 1;
    if (p !== right) {
      const a = state.items[p]!;
      const b = state.items[right]!;
      state.itemStates[a.id] = 'swap';
      state.itemStates[b.id] = 'swap';
      state.highlightLines = QUICK_SORT_CODE_LINES.pivotSwap;
      state.note = `将 pivot 放到最终位置 ${p}`;
      addStep('pivot-swap');
      state.items[p] = b;
      state.items[right] = a;
      addStep('pivot-swapped');
    }

    const fixed = state.items[p]!;
    state.itemStates[fixed.id] = 'sorted';
    state.pointers.min = p;
    clearNonSortedStates();
    state.itemStates[fixed.id] = 'sorted';
    addStep('pivot-fixed');
    return p;
  }

  function quick(left: number, right: number) {
    if (left > right) return;
    if (left === right) {
      state.itemStates[state.items[left]!.id] = 'sorted';
      state.highlightLines = QUICK_SORT_CODE_LINES.base;
      state.note = `单元素区间 [${left}, ${right}]，天然有序`;
      addStep('base-single');
      return;
    }

    state.highlightLines = QUICK_SORT_CODE_LINES.recurseLeft;
    state.note = `递归处理区间 [${left}, ${right}]`;
    addStep('recurse');

    const p = partition(left, right);

    state.highlightLines = QUICK_SORT_CODE_LINES.recurseLeft;
    state.note = `递归左区间 [${left}, ${p - 1}]`;
    addStep('left');
    quick(left, p - 1);

    state.highlightLines = QUICK_SORT_CODE_LINES.recurseRight;
    state.note = `递归右区间 [${p + 1}, ${right}]`;
    addStep('right');
    quick(p + 1, right);
  }

  if (state.items.length > 0) {
    quick(0, state.items.length - 1);
  }

  for (const item of state.items) {
    state.itemStates[item.id] = 'sorted';
  }
  state.pointers = {};
  state.highlightLines = QUICK_SORT_CODE_LINES.done;
  state.note = '✅ 排序完成';
  addStep('done');

  return { steps };
}
