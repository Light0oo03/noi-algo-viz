import type { QueueTrace, QueueTraceStep, QueueView } from './types';
import { cloneQueueVizState, createInitialQueueVizState } from './types';
import { enqueue, dequeue } from './utils';
import { QUEUE_BASIC_CODE_LINES } from './basic-code';

type QueueOperation = { type: 'enqueue'; value: number } | { type: 'dequeue' } | { type: 'peek' };

export function generateQueueBasicTrace(operations: QueueOperation[]): QueueTrace {
  const steps: QueueTraceStep[] = [];
  const queue: QueueView = { id: 'queue', label: '队列', items: [] };
  const state = createInitialQueueVizState([queue]);

  state.note = '🚀 初始化队列\n创建空队列';
  state.highlightLines = QUEUE_BASIC_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneQueueVizState(state) });

  for (const op of operations) {
    if (op.type === 'enqueue') {
      const newId = enqueue(queue, op.value);
      state.itemStates[queue.id]![newId] = 'enqueue';
      state.frontPointers[queue.id] = 0;
      state.rearPointers[queue.id] = queue.items.length - 1;
      state.note = `📥 Enqueue(${op.value})\n元素从队尾入队`;
      state.highlightLines = QUEUE_BASIC_CODE_LINES['enqueue'];
      steps.push({ type: 'enqueue', state: cloneQueueVizState(state) });

      state.itemStates[queue.id]![newId] = 'default';
      steps.push({ type: 'enqueued', state: cloneQueueVizState(state) });
    } else if (op.type === 'dequeue') {
      if (queue.items.length === 0) {
        state.note = '❌ Dequeue 失败\n队列为空';
        state.highlightLines = QUEUE_BASIC_CODE_LINES['dequeue'];
        steps.push({ type: 'empty', state: cloneQueueVizState(state) });
        continue;
      }

      const frontItem = queue.items[0]!;
      state.itemStates[queue.id]![frontItem.id] = 'dequeue';
      state.note = `📤 Dequeue()\n移除队首元素 ${frontItem.value}`;
      state.highlightLines = QUEUE_BASIC_CODE_LINES['dequeue'];
      steps.push({ type: 'dequeue', state: cloneQueueVizState(state) });

      dequeue(queue);
      delete state.itemStates[queue.id]![frontItem.id];
      state.frontPointers[queue.id] = queue.items.length > 0 ? 0 : -1;
      state.rearPointers[queue.id] = queue.items.length - 1;
      steps.push({ type: 'dequeued', state: cloneQueueVizState(state) });
    } else if (op.type === 'peek') {
      if (queue.items.length === 0) {
        state.note = '❌ Peek 失败\n队列为空';
        state.highlightLines = QUEUE_BASIC_CODE_LINES['peek'];
        steps.push({ type: 'empty', state: cloneQueueVizState(state) });
        continue;
      }

      const frontItem = queue.items[0]!;
      state.itemStates[queue.id]![frontItem.id] = 'active';
      state.note = `👁️ Peek()\n查看队首元素 ${frontItem.value}`;
      state.highlightLines = QUEUE_BASIC_CODE_LINES['peek'];
      steps.push({ type: 'peek', state: cloneQueueVizState(state) });

      state.itemStates[queue.id]![frontItem.id] = 'default';
      steps.push({ type: 'peeked', state: cloneQueueVizState(state) });
    }
  }

  state.note = '✅ 完成！\n所有操作已执行';
  steps.push({ type: 'finish', state: cloneQueueVizState(state) });

  return { steps };
}

export const QUEUE_BASIC_DEFAULT_OPS: QueueOperation[] = [
  { type: 'enqueue', value: 1 },
  { type: 'enqueue', value: 2 },
  { type: 'enqueue', value: 3 },
  { type: 'peek' },
  { type: 'dequeue' },
  { type: 'peek' },
  { type: 'enqueue', value: 4 },
  { type: 'dequeue' },
  { type: 'dequeue' },
];
