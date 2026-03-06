import type { StackTrace, StackTraceStep, StackView } from './types';
import { cloneStackVizState, createInitialStackVizState } from './types';
import { push, pop } from './utils';
import { MIN_STACK_CODE_LINES } from './min-stack-code';

type Operation = { type: 'push'; value: number } | { type: 'pop' } | { type: 'getMin' };

export function generateMinStackTrace(operations: Operation[]): StackTrace {
  const steps: StackTraceStep[] = [];
  const mainStack: StackView = { id: 'main', label: '主栈', items: [] };
  const minStack: StackView = { id: 'min', label: '最小值栈', items: [] };
  const state = createInitialStackVizState([mainStack, minStack]);

  state.note = '🚀 初始化最小栈\n创建主栈和最小值栈';
  state.highlightLines = MIN_STACK_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneStackVizState(state) });

  for (const op of operations) {
    if (op.type === 'push') {
      const newMainId = push(mainStack, op.value);
      state.itemStates[mainStack.id]![newMainId] = 'pushing';
      state.topPointers[mainStack.id] = mainStack.items.length - 1;
      state.note = `📥 Push(${op.value})\n主栈入栈 ${op.value}`;
      state.highlightLines = MIN_STACK_CODE_LINES['push-main'];
      steps.push({ type: 'push-main', state: cloneStackVizState(state) });

      state.itemStates[mainStack.id]![newMainId] = 'default';

      const currentMin = minStack.items.length === 0
        ? op.value
        : Math.min(op.value, minStack.items[minStack.items.length - 1]!.value);

      state.note = `🔍 计算最小值\nmin(${op.value}, ${minStack.items.length > 0 ? minStack.items[minStack.items.length - 1]!.value : '∅'}) = ${currentMin}`;
      state.highlightLines = MIN_STACK_CODE_LINES['calc-min'];
      steps.push({ type: 'calc-min', state: cloneStackVizState(state) });

      const newMinId = push(minStack, currentMin);
      state.itemStates[minStack.id]![newMinId] = 'pushing';
      state.topPointers[minStack.id] = minStack.items.length - 1;
      state.note = `📥 最小值栈入栈\n当前最小值: ${currentMin}`;
      state.highlightLines = MIN_STACK_CODE_LINES['push-min'];
      steps.push({ type: 'push-min', state: cloneStackVizState(state) });

      state.itemStates[minStack.id]![newMinId] = 'default';
      steps.push({ type: 'pushed', state: cloneStackVizState(state) });
    } else if (op.type === 'pop') {
      if (mainStack.items.length === 0) {
        state.note = '❌ Pop 失败\n栈为空';
        steps.push({ type: 'empty', state: cloneStackVizState(state) });
        continue;
      }

      const mainTop = mainStack.items[mainStack.items.length - 1]!;
      const minTop = minStack.items[minStack.items.length - 1]!;

      state.itemStates[mainStack.id]![mainTop.id] = 'popping';
      state.itemStates[minStack.id]![minTop.id] = 'popping';
      state.note = `📤 Pop()\n移除主栈顶: ${mainTop.value}\n同步移除最小值栈顶`;
      state.highlightLines = MIN_STACK_CODE_LINES['pop'];
      steps.push({ type: 'pop', state: cloneStackVizState(state) });

      pop(mainStack);
      pop(minStack);
      delete state.itemStates[mainStack.id]![mainTop.id];
      delete state.itemStates[minStack.id]![minTop.id];
      state.topPointers[mainStack.id] = mainStack.items.length - 1;
      state.topPointers[minStack.id] = minStack.items.length - 1;
      steps.push({ type: 'popped', state: cloneStackVizState(state) });
    } else if (op.type === 'getMin') {
      if (minStack.items.length === 0) {
        state.note = '❌ GetMin 失败\n栈为空';
        steps.push({ type: 'empty', state: cloneStackVizState(state) });
        continue;
      }

      const minTop = minStack.items[minStack.items.length - 1]!;
      state.itemStates[minStack.id]![minTop.id] = 'active';
      state.note = `✨ GetMin()\n当前最小值: ${minTop.value}`;
      state.highlightLines = MIN_STACK_CODE_LINES['getMin'];
      steps.push({ type: 'getMin', state: cloneStackVizState(state) });

      state.itemStates[minStack.id]![minTop.id] = 'default';
      steps.push({ type: 'getMin-done', state: cloneStackVizState(state) });
    }
  }

  state.note = '✅ 完成！\n所有操作已执行';
  steps.push({ type: 'finish', state: cloneStackVizState(state) });

  return { steps };
}

export const MIN_STACK_DEFAULT_OPS: Operation[] = [
  { type: 'push', value: 3 },
  { type: 'push', value: 5 },
  { type: 'getMin' },
  { type: 'push', value: 2 },
  { type: 'push', value: 1 },
  { type: 'getMin' },
  { type: 'pop' },
  { type: 'getMin' },
  { type: 'pop' },
  { type: 'getMin' },
];
