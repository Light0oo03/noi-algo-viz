import type { SortTrace, SortTraceStep } from './types';
import { cloneSortVizState, createInitialSortVizState } from './types';
import { HEAP_SORT_CODE_LINES } from './heap-code';

export function generateHeapSortTrace(values: number[]): SortTrace {
  const state = createInitialSortVizState(values);
  const steps: SortTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSortVizState(state) });
  }

  function clearStates() {
    for (const item of state.items) {
      if (state.itemStates[item.id] !== 'sorted') {
        state.itemStates[item.id] = 'default';
      }
    }
  }

  function swap(i: number, j: number) {
    if (i === j) return;
    const a = state.items[i]!;
    const b = state.items[j]!;
    state.itemStates[a.id] = 'swap';
    state.itemStates[b.id] = 'swap';
    state.highlightLines = HEAP_SORT_CODE_LINES.swap;
    state.note = `交换索引 ${i} 与 ${j}`;
    addStep('swap');
    state.items[i] = b;
    state.items[j] = a;
    addStep('swapped');
    clearStates();
  }

  function heapify(size: number, root: number) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    state.pointers.i = root;
    state.pointers.j = left < size ? left : undefined;
    state.pointers.min = right < size ? right : undefined;
    state.highlightLines = HEAP_SORT_CODE_LINES.heapifyDef;
    state.note = `heapify(size=${size}, root=${root})`;
    addStep('heapify-enter');

    if (left < size) {
      state.highlightLines = HEAP_SORT_CODE_LINES.compareLeft;
      state.note = `比较左子节点 ${state.items[left]!.value} 与根节点 ${state.items[largest]!.value}`;
      state.itemStates[state.items[left]!.id] = 'active';
      state.itemStates[state.items[largest]!.id] = 'pivot';
      addStep('compare-left');
      if (state.items[left]!.value > state.items[largest]!.value) largest = left;
      clearStates();
    }

    if (right < size) {
      state.highlightLines = HEAP_SORT_CODE_LINES.compareRight;
      state.note = `比较右子节点 ${state.items[right]!.value} 与当前最大值 ${state.items[largest]!.value}`;
      state.itemStates[state.items[right]!.id] = 'active';
      state.itemStates[state.items[largest]!.id] = 'pivot';
      addStep('compare-right');
      if (state.items[right]!.value > state.items[largest]!.value) largest = right;
      clearStates();
    }

    state.highlightLines = HEAP_SORT_CODE_LINES.checkSwap;
    state.note = largest !== root ? `最大值索引更新为 ${largest}，需要交换` : '根节点已是最大，无需交换';
    addStep('check-swap');

    if (largest !== root) {
      swap(root, largest);
      state.highlightLines = HEAP_SORT_CODE_LINES.recurse;
      state.note = `继续下沉索引 ${largest}`;
      addStep('recurse');
      heapify(size, largest);
    }
  }

  const n = state.items.length;
  state.note = '🚀 开始堆排序（先建大顶堆）';
  state.highlightLines = HEAP_SORT_CODE_LINES.init;
  addStep('start');

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    state.highlightLines = HEAP_SORT_CODE_LINES.build;
    state.note = `建堆：处理非叶子节点 ${i}`;
    addStep('build');
    heapify(n, i);
  }

  for (let end = n - 1; end > 0; end--) {
    state.highlightLines = HEAP_SORT_CODE_LINES.extractLoop;
    state.note = `将堆顶最大值放到索引 ${end}`;
    addStep('extract');

    swap(0, end);
    state.itemStates[state.items[end]!.id] = 'sorted';
    state.highlightLines = HEAP_SORT_CODE_LINES.moveMax;
    state.note = `索引 ${end} 已就位`;
    addStep('placed');

    state.highlightLines = HEAP_SORT_CODE_LINES.fixHeap;
    state.note = `修复剩余区间 [0, ${end - 1}] 的堆`; 
    addStep('fix-heap');
    heapify(end, 0);
  }

  if (n > 0) {
    state.itemStates[state.items[0]!.id] = 'sorted';
  }
  state.pointers = {};
  state.highlightLines = HEAP_SORT_CODE_LINES.done;
  state.note = '✅ 排序完成';
  addStep('done');

  return { steps };
}
