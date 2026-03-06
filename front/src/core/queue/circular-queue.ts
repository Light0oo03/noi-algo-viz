import type { QueueTrace, QueueTraceStep, QueueView, QueueItem } from './types';
import { cloneQueueVizState, createInitialQueueVizState } from './types';
import { CIRCULAR_QUEUE_CODE_LINES } from './circular-queue-code';

type CircularQueueOperation = { type: 'enqueue'; value: number } | { type: 'dequeue' };

export function generateCircularQueueTrace(capacity: number, operations: CircularQueueOperation[]): QueueTrace {
  const steps: QueueTraceStep[] = [];
  const items: QueueItem[] = new Array(capacity).fill(null).map((_, i) => ({ id: i + 1, value: -1 }));
  const queue: QueueView = { id: 'queue', label: `循环队列（容量=${capacity}）`, items, capacity };
  const state = createInitialQueueVizState([queue]);

  state.frontPointers[queue.id] = -1;
  state.rearPointers[queue.id] = -1;
  let size = 0;

  state.note = `🚀 初始化循环队列\n容量: ${capacity}`;
  state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneQueueVizState(state) });

  for (const op of operations) {
    if (op.type === 'enqueue') {
      if (size === capacity) {
        state.note = `❌ Enqueue(${op.value}) 失败\n队列已满`;
        state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['check-full'];
        steps.push({ type: 'full', state: cloneQueueVizState(state) });
        continue;
      }

      state.note = `🔍 检查队列状态\n当前大小: ${size}`;
      state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['check-full'];
      steps.push({ type: 'check', state: cloneQueueVizState(state) });

      if (size === 0) {
        state.frontPointers[queue.id] = 0;
        state.note = '📍 队列为空\n设置 front = 0';
        state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['check-empty-enqueue'];
        steps.push({ type: 'set-front', state: cloneQueueVizState(state) });
      }

      const newRear = size === 0 ? 0 : (state.rearPointers[queue.id]! + 1) % capacity;
      state.rearPointers[queue.id] = newRear;
      state.note = `🔄 计算新 rear 位置\nrear = ${newRear}`;
      state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['calc-rear'];
      steps.push({ type: 'calc-rear', state: cloneQueueVizState(state) });

      queue.items[newRear]!.value = op.value;
      state.itemStates[queue.id]![queue.items[newRear]!.id] = 'enqueue';
      size++;
      state.note = `📥 Enqueue(${op.value})\n入队到位置 ${newRear}`;
      state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['enqueue'];
      steps.push({ type: 'enqueue', state: cloneQueueVizState(state) });

      state.itemStates[queue.id]![queue.items[newRear]!.id] = 'default';
      steps.push({ type: 'enqueued', state: cloneQueueVizState(state) });
    } else if (op.type === 'dequeue') {
      if (size === 0) {
        state.note = '❌ Dequeue 失败\n队列为空';
        state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['check-empty-dequeue'];
        steps.push({ type: 'empty', state: cloneQueueVizState(state) });
        continue;
      }

      const front = state.frontPointers[queue.id]!;
      const value = queue.items[front]!.value;

      state.itemStates[queue.id]![queue.items[front]!.id] = 'dequeue';
      state.note = `📤 Dequeue()\n移除位置 ${front} 的元素 ${value}`;
      state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['clear-front'];
      steps.push({ type: 'dequeue', state: cloneQueueVizState(state) });

      queue.items[front]!.value = -1;
      delete state.itemStates[queue.id]![queue.items[front]!.id];

      if (size === 1) {
        state.frontPointers[queue.id] = -1;
        state.rearPointers[queue.id] = -1;
        state.note = '🔄 队列变空\nfront = rear = -1';
        state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['check-last'];
      } else {
        state.frontPointers[queue.id] = (front + 1) % capacity;
        state.note = `🔄 移动 front 指针\nfront = ${state.frontPointers[queue.id]}`;
        state.highlightLines = CIRCULAR_QUEUE_CODE_LINES['move-front'];
      }

      size--;
      steps.push({ type: 'dequeued', state: cloneQueueVizState(state) });
    }
  }

  state.note = '✅ 完成！\n所有操作已执行';
  steps.push({ type: 'finish', state: cloneQueueVizState(state) });

  return { steps };
}

export const CIRCULAR_QUEUE_DEFAULT_CAPACITY = 5;
export const CIRCULAR_QUEUE_DEFAULT_OPS: CircularQueueOperation[] = [
  { type: 'enqueue', value: 1 },
  { type: 'enqueue', value: 2 },
  { type: 'enqueue', value: 3 },
  { type: 'dequeue' },
  { type: 'enqueue', value: 4 },
  { type: 'enqueue', value: 5 },
  { type: 'enqueue', value: 6 },
  { type: 'dequeue' },
  { type: 'enqueue', value: 7 },
];
