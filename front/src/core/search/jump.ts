import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { JUMP_SEARCH_CODE_LINES } from './jump-code';

export function generateJumpSearchTrace(items: number[], target: number): SearchTrace {
  const sorted = [...items].sort((a, b) => a - b);
  const state = createInitialSearchVizState(sorted, target);
  const steps: SearchTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  const n = state.items.length;
  if (n === 0) {
    state.note = '❌ 空数组，查找失败';
    state.highlightLines = JUMP_SEARCH_CODE_LINES.notFound;
    addStep('empty');
    return { steps };
  }

  const jump = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0;
  let next = jump;

  state.note = `🚀 开始跳跃查找（步长=${jump}），目标值: ${target}`;
  state.highlightLines = JUMP_SEARCH_CODE_LINES.init;
  addStep('start');

  while (prev < n && state.items[Math.min(next, n) - 1]!.value < target) {
    const end = Math.min(next, n) - 1;
    state.pointers.index = end;
    state.itemStates[state.items[end]!.id] = 'pivot';
    state.note = `检查分块末尾索引 ${end}，值=${state.items[end]!.value}，继续向后跳`; 
    state.highlightLines = JUMP_SEARCH_CODE_LINES.blockLoop;
    addStep('block-check');

    for (let i = prev; i <= end; i++) {
      state.itemStates[state.items[i]!.id] = 'eliminated';
    }

    prev = next;
    next += jump;
    state.highlightLines = JUMP_SEARCH_CODE_LINES.moveBlock;
    state.note = `跳到下一块区间 [${prev}, ${Math.min(next, n) - 1}]`;
    addStep('block-move');

    if (prev >= n) {
      state.pointers.index = undefined;
      state.note = `❌ 查找结束，未找到 ${target}`;
      state.highlightLines = JUMP_SEARCH_CODE_LINES.notFound;
      addStep('not-found');
      return { steps };
    }
  }

  const end = Math.min(next, n);
  for (let i = prev; i < end; i++) {
    const cur = state.items[i]!;
    state.pointers.index = i;
    state.itemStates[cur.id] = 'active';
    state.note = `块内线性检查索引 ${i}，值=${cur.value}`;
    state.highlightLines = JUMP_SEARCH_CODE_LINES.linearLoop;
    addStep('linear-check');

    if (cur.value === target) {
      state.itemStates[cur.id] = 'found';
      state.resultIndex = i;
      state.note = `✅ 找到目标值 ${target}，索引=${i}`;
      state.highlightLines = JUMP_SEARCH_CODE_LINES.found;
      addStep('found');
      return { steps };
    }

    state.itemStates[cur.id] = 'checked';
  }

  state.pointers.index = undefined;
  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = JUMP_SEARCH_CODE_LINES.notFound;
  addStep('not-found');

  return { steps };
}
