import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { LINEAR_SEARCH_CODE_LINES } from './linear-code';

export function generateLinearSearchTrace(items: number[], target: number): SearchTrace {
  const steps: SearchTraceStep[] = [];
  const state = createInitialSearchVizState(items, target);

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  state.note = `🚀 开始线性查找，目标值: ${target}`;
  state.highlightLines = LINEAR_SEARCH_CODE_LINES.loop;
  addStep('start');

  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i]!;
    state.pointers.index = i;
    state.itemStates[item.id] = 'active';
    state.note = `🔍 检查索引 ${i}，值=${item.value}`;
    state.highlightLines = LINEAR_SEARCH_CODE_LINES.check;
    addStep('check');

    if (item.value === target) {
      state.itemStates[item.id] = 'found';
      state.resultIndex = i;
      state.note = `✅ 找到目标值 ${target}，索引=${i}`;
      state.highlightLines = LINEAR_SEARCH_CODE_LINES.found;
      addStep('found');
      return { steps };
    }

    state.itemStates[item.id] = 'checked';
    state.note = `❌ 索引 ${i} 不匹配，继续向后查找`;
    state.highlightLines = LINEAR_SEARCH_CODE_LINES.loop;
    addStep('continue');
  }

  state.pointers.index = undefined;
  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = LINEAR_SEARCH_CODE_LINES.notFound;
  addStep('not-found');

  return { steps };
}
