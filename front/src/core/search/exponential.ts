import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { EXPONENTIAL_SEARCH_CODE_LINES } from './exponential-code';

export function generateExponentialSearchTrace(items: number[], target: number): SearchTrace {
  const sorted = [...items].sort((a, b) => a - b);
  const state = createInitialSearchVizState(sorted, target);
  const steps: SearchTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  const n = state.items.length;
  if (n === 0) {
    state.note = '❌ 空数组，查找失败';
    state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.empty;
    addStep('empty');
    return { steps };
  }

  if (state.items[0]!.value === target) {
    state.resultIndex = 0;
    state.itemStates[state.items[0]!.id] = 'found';
    state.note = `✅ 首元素即目标值 ${target}`;
    state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.first;
    addStep('first');
    return { steps };
  }

  let bound = 1;
  state.note = `🚀 开始指数查找（数组已升序），目标值: ${target}`;
  state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.init;
  addStep('start');

  while (bound < n && state.items[bound]!.value < target) {
    state.pointers.index = bound;
    state.itemStates[state.items[bound]!.id] = 'pivot';
    state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.rangeLoop;
    state.note = `bound=${bound}，值=${state.items[bound]!.value} < ${target}，范围继续扩大`;
    addStep('range-loop');

    for (let i = 0; i <= bound; i++) {
      state.itemStates[state.items[i]!.id] = 'eliminated';
    }

    bound *= 2;
    state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.rangeGrow;
    state.note = `bound 扩大到 ${bound}`;
    addStep('range-grow');
  }

  let left = Math.floor(bound / 2);
  let right = Math.min(bound, n - 1);
  state.pointers.index = undefined;
  state.pointers.left = left;
  state.pointers.right = right;
  state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.initBinary;
  state.note = `确定二分区间 [${left}, ${right}]`;
  addStep('init-binary');

  while (left <= right) {
    state.pointers.left = left;
    state.pointers.right = right;
    state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.loop;
    state.note = `🔁 二分区间 [${left}, ${right}]`;
    addStep('loop');

    const mid = Math.floor((left + right) / 2);
    const midItem = state.items[mid]!;
    state.pointers.mid = mid;
    state.itemStates[midItem.id] = 'pivot';
    state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.mid;
    state.note = `📍 mid=${mid}，值=${midItem.value}`;
    addStep('mid');

    if (midItem.value === target) {
      state.itemStates[midItem.id] = 'found';
      state.resultIndex = mid;
      state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.found;
      state.note = `✅ 找到目标值 ${target}，索引=${mid}`;
      addStep('found');
      return { steps };
    }

    if (midItem.value < target) {
      for (let i = left; i <= mid; i++) {
        state.itemStates[state.items[i]!.id] = 'eliminated';
      }
      left = mid + 1;
      state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.moveLow;
      state.note = `➡️ 缩小为右半区间 [${left}, ${right}]`;
      addStep('move-low');
    } else {
      for (let i = mid; i <= right; i++) {
        state.itemStates[state.items[i]!.id] = 'eliminated';
      }
      right = mid - 1;
      state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.moveHigh;
      state.note = `⬅️ 缩小为左半区间 [${left}, ${right}]`;
      addStep('move-high');
    }
  }

  state.pointers.mid = undefined;
  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = EXPONENTIAL_SEARCH_CODE_LINES.notFound;
  addStep('not-found');

  return { steps };
}
