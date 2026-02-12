import type { StackTrace, StackTraceStep, StackView } from './types';
import { cloneStackVizState, createInitialStackVizState } from './types';
import { push, pop } from './utils';
import { QUEUE_BY_STACK_CODE_LINES } from './queue-by-stack-code';

type QueueOperation = { type: 'push'; value: number } | { type: 'pop' } | { type: 'peek' };

export function generateQueueByStackTrace(operations: QueueOperation[]): StackTrace {
  const steps: StackTraceStep[] = [];
  const inStack: StackView = { id: 'in', label: '入栈', items: [] };
  const outStack: StackView = { id: 'out', label: '出栈', items: [] };
  const state = createInitialStackVizState([inStack, outStack]);

  state.note = '🚀 初始化队列\n使用两个栈实现队列';
  state.highlightLines = QUEUE_BY_STACK_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneStackVizState(state) });

  for (const op of operations) {
    if (op.type === 'push') {
      const newId = push(inStack, op.value);
      state.itemStates[inStack.id]![newId] = 'pushing';
      state.topPointers[inStack.id] = inStack.items.length - 1;
      state.note = `📥 Push(${op.value})\n入栈压入 ${op.value}`;
      state.highlightLines = QUEUE_BY_STACK_CODE_LINES['push'];
      steps.push({ type: 'push', state: cloneStackVizState(state) });

      state.itemStates[inStack.id]![newId] = 'default';
      steps.push({ type: 'pushed', state: cloneStackVizState(state) });
    } else if (op.type === 'pop' || op.type === 'peek') {
      if (outStack.items.length === 0) {
        state.note = '🔍 出栈为空\n需要从入栈转移元素';
        state.highlightLines = QUEUE_BY_STACK_CODE_LINES['check-out'];
        steps.push({ type: 'check-out', state: cloneStackVizState(state) });

        if (inStack.items.length === 0) {
          state.note = '❌ 队列为空\n无法执行操作';
          steps.push({ type: 'empty', state: cloneStackVizState(state) });
          continue;
        }

        while (inStack.items.length > 0) {
          const topItem = inStack.items[inStack.items.length - 1]!;
          state.itemStates[inStack.id]![topItem.id] = 'popping';
          state.note = `🔄 转移元素 ${topItem.value}\n从入栈到出栈`;
          state.highlightLines = QUEUE_BY_STACK_CODE_LINES['transfer'];
          steps.push({ type: 'transfer-pop', state: cloneStackVizState(state) });

          const value = pop(inStack)!;
          delete state.itemStates[inStack.id]![topItem.id];
          state.topPointers[inStack.id] = inStack.items.length - 1;

          const newId = push(outStack, value);
          state.itemStates[outStack.id]![newId] = 'pushing';
          state.topPointers[outStack.id] = outStack.items.length - 1;
          steps.push({ type: 'transfer-push', state: cloneStackVizState(state) });

          state.itemStates[outStack.id]![newId] = 'default';
          steps.push({ type: 'transferred', state: cloneStackVizState(state) });
        }
      }

      if (op.type === 'pop') {
        if (outStack.items.length === 0) {
          state.note = '❌ 队列为空';
          steps.push({ type: 'empty', state: cloneStackVizState(state) });
          continue;
        }

        const topItem = outStack.items[outStack.items.length - 1]!;
        state.itemStates[outStack.id]![topItem.id] = 'popping';
        state.note = `📤 Pop()\n移除队首元素 ${topItem.value}`;
        state.highlightLines = QUEUE_BY_STACK_CODE_LINES['pop'];
        steps.push({ type: 'pop', state: cloneStackVizState(state) });

        pop(outStack);
        delete state.itemStates[outStack.id]![topItem.id];
        state.topPointers[outStack.id] = outStack.items.length - 1;
        steps.push({ type: 'popped', state: cloneStackVizState(state) });
      } else {
        if (outStack.items.length === 0) {
          state.note = '❌ 队列为空';
          steps.push({ type: 'empty', state: cloneStackVizState(state) });
          continue;
        }

        const topItem = outStack.items[outStack.items.length - 1]!;
        state.itemStates[outStack.id]![topItem.id] = 'active';
        state.note = `👁️ Peek()\n查看队首元素 ${topItem.value}`;
        state.highlightLines = QUEUE_BY_STACK_CODE_LINES['peek'];
        steps.push({ type: 'peek', state: cloneStackVizState(state) });

        state.itemStates[outStack.id]![topItem.id] = 'default';
        steps.push({ type: 'peeked', state: cloneStackVizState(state) });
      }
    }
  }

  state.note = '✅ 完成！\n所有操作已执行';
  steps.push({ type: 'finish', state: cloneStackVizState(state) });

  return { steps };
}

export const QUEUE_BY_STACK_DEFAULT_OPS: QueueOperation[] = [
  { type: 'push', value: 1 },
  { type: 'push', value: 2 },
  { type: 'peek' },
  { type: 'pop' },
  { type: 'push', value: 3 },
  { type: 'peek' },
  { type: 'pop' },
  { type: 'pop' },
];
