import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { INTERPOLATION_SEARCH_CODE_LINES } from './interpolation-code';

export function generateInterpolationSearchTrace(items: number[], target: number): SearchTrace {
  const sorted = [...items].sort((a, b) => a - b);
  const state = createInitialSearchVizState(sorted, target);
  const steps: SearchTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  let low = 0;
  let high = state.items.length - 1;

  state.note = `🚀 开始插值查找（数组已升序），目标值: ${target}`;
  state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.init;
  state.pointers.left = low;
  state.pointers.right = high;
  addStep('start');

  while (
    low <= high
    && low >= 0
    && high < state.items.length
    && target >= state.items[low]!.value
    && target <= state.items[high]!.value
  ) {
    state.pointers.left = low;
    state.pointers.right = high;
    state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.loop;
    state.note = `🔁 当前区间 [${low}, ${high}]`;
    addStep('loop');

    if (low === high) {
      state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.edge;
      if (state.items[low]!.value === target) {
        state.resultIndex = low;
        state.itemStates[state.items[low]!.id] = 'found';
        state.note = `✅ 找到目标值 ${target}，索引=${low}`;
        state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.found;
        addStep('found');
      } else {
        state.note = `❌ 仅剩一个元素且不匹配，未找到 ${target}`;
        state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.notFound;
        addStep('not-found');
      }
      return { steps };
    }

    const lowVal = state.items[low]!.value;
    const highVal = state.items[high]!.value;
    if (highVal === lowVal) {
      break;
    }

    const pos = low + Math.floor(((target - lowVal) * (high - low)) / (highVal - lowVal));
    const safePos = Math.max(low, Math.min(pos, high));
    state.pointers.mid = safePos;
    state.itemStates[state.items[safePos]!.id] = 'pivot';
    state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.pos;
    state.note = `📍 估算位置 pos=${safePos}，值=${state.items[safePos]!.value}`;
    addStep('pos');

    const posVal = state.items[safePos]!.value;
    if (posVal === target) {
      state.resultIndex = safePos;
      state.itemStates[state.items[safePos]!.id] = 'found';
      state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.found;
      state.note = `✅ 找到目标值 ${target}，索引=${safePos}`;
      addStep('found');
      return { steps };
    }

    if (posVal < target) {
      for (let i = low; i <= safePos; i++) {
        state.itemStates[state.items[i]!.id] = 'eliminated';
      }
      low = safePos + 1;
      state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.moveLow;
      state.note = `➡️ 目标在右侧，区间更新为 [${low}, ${high}]`;
      addStep('move-low');
    } else {
      for (let i = safePos; i <= high; i++) {
        state.itemStates[state.items[i]!.id] = 'eliminated';
      }
      high = safePos - 1;
      state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.moveHigh;
      state.note = `⬅️ 目标在左侧，区间更新为 [${low}, ${high}]`;
      addStep('move-high');
    }
  }

  state.pointers.mid = undefined;
  state.pointers.left = low;
  state.pointers.right = high;
  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = INTERPOLATION_SEARCH_CODE_LINES.notFound;
  addStep('not-found');

  return { steps };
}
