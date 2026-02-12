import type { StackTrace, StackTraceStep, StackView } from './types';
import { cloneStackVizState, createInitialStackVizState } from './types';
import { push, pop } from './utils';
import { MONOTONIC_STACK_CODE_LINES } from './monotonic-stack-code';

export function generateMonotonicStackTrace(heights: number[]): StackTrace {
  const steps: StackTraceStep[] = [];
  const stack: StackView = { id: 'stack', label: '单调栈（索引）', items: [] };
  const state = createInitialStackVizState([stack]);

  let maxArea = 0;

  state.note = '🚀 初始化单调栈\n用于计算柱状图最大矩形面积';
  state.highlightLines = MONOTONIC_STACK_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneStackVizState(state) });

  for (let i = 0; i < heights.length; i++) {
    state.note = `📍 扫描索引 ${i}，高度 ${heights[i]}\n检查是否需要弹出栈顶`;
    state.highlightLines = MONOTONIC_STACK_CODE_LINES['check-pop'];
    steps.push({ type: 'scan', state: cloneStackVizState(state) });

    while (stack.items.length > 0 && heights[i]! < heights[stack.items[stack.items.length - 1]!.value]!) {
      const topItem = stack.items[stack.items.length - 1]!;
      const h = topItem.value;

      state.itemStates[stack.id]![topItem.id] = 'popping';
      state.note = `📤 弹出索引 ${h}\n高度 ${heights[h]} > 当前高度 ${heights[i]}`;
      state.highlightLines = MONOTONIC_STACK_CODE_LINES['pop'];
      steps.push({ type: 'pop', state: cloneStackVizState(state) });

      pop(stack);
      delete state.itemStates[stack.id]![topItem.id];
      state.topPointers[stack.id] = stack.items.length - 1;

      const width = stack.items.length === 0 ? i : i - stack.items[stack.items.length - 1]!.value - 1;
      const area = heights[h]! * width;
      maxArea = Math.max(maxArea, area);

      state.note = `🔍 计算矩形面积\n高度=${heights[h]}, 宽度=${width}, 面积=${area}\n当前最大面积=${maxArea}`;
      state.highlightLines = MONOTONIC_STACK_CODE_LINES['calc-area'];
      steps.push({ type: 'calc-area', state: cloneStackVizState(state) });
    }

    const newId = push(stack, i);
    state.itemStates[stack.id]![newId] = 'pushing';
    state.topPointers[stack.id] = stack.items.length - 1;
    state.note = `📥 入栈索引 ${i}\n高度 ${heights[i]}，维护递增顺序`;
    state.highlightLines = MONOTONIC_STACK_CODE_LINES['push'];
    steps.push({ type: 'push', state: cloneStackVizState(state) });

    state.itemStates[stack.id]![newId] = 'default';
    steps.push({ type: 'pushed', state: cloneStackVizState(state) });
  }

  state.note = '🔄 处理剩余元素\n栈中还有未处理的索引';
  state.highlightLines = MONOTONIC_STACK_CODE_LINES['final-pop'];
  steps.push({ type: 'final-phase', state: cloneStackVizState(state) });

  while (stack.items.length > 0) {
    const topItem = stack.items[stack.items.length - 1]!;
    const h = topItem.value;

    state.itemStates[stack.id]![topItem.id] = 'popping';
    state.note = `📤 弹出索引 ${h}`;
    state.highlightLines = MONOTONIC_STACK_CODE_LINES['final-pop'];
    steps.push({ type: 'final-pop', state: cloneStackVizState(state) });

    pop(stack);
    delete state.itemStates[stack.id]![topItem.id];
    state.topPointers[stack.id] = stack.items.length - 1;

    const width = stack.items.length === 0 ? heights.length : heights.length - stack.items[stack.items.length - 1]!.value - 1;
    const area = heights[h]! * width;
    maxArea = Math.max(maxArea, area);

    state.note = `🔍 计算矩形面积\n高度=${heights[h]}, 宽度=${width}, 面积=${area}\n当前最大面积=${maxArea}`;
    state.highlightLines = MONOTONIC_STACK_CODE_LINES['calc-area'];
    steps.push({ type: 'final-calc', state: cloneStackVizState(state) });
  }

  state.note = `✅ 完成！\n最大矩形面积: ${maxArea}`;
  state.highlightLines = MONOTONIC_STACK_CODE_LINES['return'];
  steps.push({ type: 'finish', state: cloneStackVizState(state) });

  return { steps };
}

export const MONOTONIC_STACK_DEFAULT_HEIGHTS = [2, 1, 5, 6, 2, 3];
