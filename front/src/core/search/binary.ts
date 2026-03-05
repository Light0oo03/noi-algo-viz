import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { BINARY_SEARCH_CODE_LINES } from './binary-code';

export function generateBinarySearchTrace(items: number[], target: number): SearchTrace {
  const sorted = [...items].sort((a, b) => a - b);
  const state = createInitialSearchVizState(sorted, target);
  const steps: SearchTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  let left = 0;
  let right = state.items.length - 1;

  state.pointers.left = left;
  state.pointers.right = right;
  state.note = `🚀 开始二分查找（数组已升序），目标值: ${target}`;
  state.highlightLines = BINARY_SEARCH_CODE_LINES.init;
  addStep('start');

  while (left <= right) {
    state.pointers.left = left;
    state.pointers.right = right;
    state.highlightLines = BINARY_SEARCH_CODE_LINES.loop;
    state.note = `🔁 当前区间: [${left}, ${right}]`;
    addStep('loop');

    const mid = Math.floor((left + right) / 2);
    const midItem = state.items[mid]!;

    state.pointers.mid = mid;
    state.itemStates[midItem.id] = 'pivot';
    state.highlightLines = BINARY_SEARCH_CODE_LINES.mid;
    state.note = `📍 取中点 mid=${mid}，值=${midItem.value}`;
    addStep('mid');

    if (midItem.value === target) {
      state.itemStates[midItem.id] = 'found';
      state.resultIndex = mid;
      state.highlightLines = BINARY_SEARCH_CODE_LINES.found;
      state.note = `✅ 找到目标值 ${target}，索引=${mid}`;
      addStep('found');
      return { steps };
    }

    if (midItem.value < target) {
      for (let i = left; i <= mid; i++) {
        const item = state.items[i];
        if (item) state.itemStates[item.id] = 'eliminated';
      }
      left = mid + 1;
      state.highlightLines = BINARY_SEARCH_CODE_LINES.moveLeft;
      state.note = `➡️ 中点值小于目标，缩小到右半区间 [${left}, ${right}]`;
      addStep('move-right');
    } else {
      for (let i = mid; i <= right; i++) {
        const item = state.items[i];
        if (item) state.itemStates[item.id] = 'eliminated';
      }
      right = mid - 1;
      state.highlightLines = BINARY_SEARCH_CODE_LINES.moveRight;
      state.note = `⬅️ 中点值大于目标，缩小到左半区间 [${left}, ${right}]`;
      addStep('move-left');
    }
  }

  state.pointers.left = left;
  state.pointers.right = right;
  state.pointers.mid = undefined;
  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = BINARY_SEARCH_CODE_LINES.notFound;
  addStep('not-found');

  return { steps };
}
