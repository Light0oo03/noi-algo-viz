import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { FIBONACCI_SEARCH_CODE_LINES } from './fibonacci-code';

export function generateFibonacciSearchTrace(items: number[], target: number): SearchTrace {
  const sorted = [...items].sort((a, b) => a - b);
  const state = createInitialSearchVizState(sorted, target);
  const steps: SearchTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  const n = state.items.length;
  if (n === 0) {
    state.note = '❌ 空数组，查找失败';
    state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.notFound;
    addStep('empty');
    return { steps };
  }

  let fibMMm2 = 0;
  let fibMMm1 = 1;
  let fibM = fibMMm2 + fibMMm1;

  state.note = `🚀 开始 Fibonacci 查找（数组已升序），target=${target}`;
  state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.init;
  addStep('start');

  while (fibM < n) {
    fibMMm2 = fibMMm1;
    fibMMm1 = fibM;
    fibM = fibMMm2 + fibMMm1;
    state.note = `扩展 Fibonacci：fibM=${fibM}`;
    state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.grow;
    addStep('grow');
  }

  let offset = -1;
  state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.offset;
  addStep('offset');

  while (fibM > 1) {
    const i = Math.min(offset + fibMMm2, n - 1);
    state.pointers.left = Math.max(0, offset + 1);
    state.pointers.right = n - 1;
    state.pointers.mid = i;
    state.itemStates[state.items[i]!.id] = 'pivot';
    state.note = `检查索引 i=${i}，值=${state.items[i]!.value}`;
    state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.loop;
    addStep('loop');

    if (state.items[i]!.value < target) {
      for (let j = 0; j <= i; j++) {
        state.itemStates[state.items[j]!.id] = 'eliminated';
      }
      fibM = fibMMm1;
      fibMMm1 = fibMMm2;
      fibMMm2 = fibM - fibMMm1;
      offset = i;
      state.note = `值偏小，右移 offset=${offset}`;
      state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.less;
      addStep('less');
    } else if (state.items[i]!.value > target) {
      for (let j = i; j < n; j++) {
        state.itemStates[state.items[j]!.id] = 'eliminated';
      }
      fibM = fibMMm2;
      fibMMm1 = fibMMm1 - fibMMm2;
      fibMMm2 = fibM - fibMMm1;
      state.note = '值偏大，缩小到左区间';
      state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.greater;
      addStep('greater');
    } else {
      state.itemStates[state.items[i]!.id] = 'found';
      state.resultIndex = i;
      state.note = `✅ 找到目标值 ${target}，索引=${i}`;
      state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.found;
      addStep('found');
      return { steps };
    }
  }

  if (fibMMm1 && offset + 1 < n && state.items[offset + 1]!.value === target) {
    const idx = offset + 1;
    state.itemStates[state.items[idx]!.id] = 'found';
    state.resultIndex = idx;
    state.pointers.mid = idx;
    state.note = `✅ 最终检查命中，索引=${idx}`;
    state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.finalCheck;
    addStep('final-found');
    return { steps };
  }

  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = FIBONACCI_SEARCH_CODE_LINES.notFound;
  addStep('not-found');
  return { steps };
}
