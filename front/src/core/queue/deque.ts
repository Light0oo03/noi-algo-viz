import type { QueueTrace, QueueTraceStep, QueueView } from './types';
import { cloneQueueVizState, createInitialQueueVizState } from './types';
import { DEQUE_CODE_LINES } from './deque-code';

type DequeOperation =
  | { type: 'pushFront'; value: number }
  | { type: 'pushBack'; value: number }
  | { type: 'popFront' }
  | { type: 'popBack' };

export function generateDequeTrace(operations: DequeOperation[]): QueueTrace {
  const steps: QueueTraceStep[] = [];
  const deque: QueueView = { id: 'deque', label: '双端队列', items: [] };
  const state = createInitialQueueVizState([deque]);

  state.note = '🚀 初始化双端队列\n支持两端操作';
  state.highlightLines = DEQUE_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneQueueVizState(state) });

  for (const op of operations) {
    if (op.type === 'pushFront') {
      const newId = deque.items.length > 0 ? Math.max(...deque.items.map(i => i.id)) + 1 : 1;
      deque.items.unshift({ id: newId, value: op.value });
      state.itemStates[deque.id]![newId] = 'enqueue';
      state.frontPointers[deque.id] = 0;
      state.rearPointers[deque.id] = deque.items.length - 1;
      state.note = `📥 PushFront(${op.value})\n从队首入队`;
      state.highlightLines = DEQUE_CODE_LINES['pushFront'];
      steps.push({ type: 'pushFront', state: cloneQueueVizState(state) });

      state.itemStates[deque.id]![newId] = 'default';
      steps.push({ type: 'pushed', state: cloneQueueVizState(state) });
    } else if (op.type === 'pushBack') {
      const newId = deque.items.length > 0 ? Math.max(...deque.items.map(i => i.id)) + 1 : 1;
      deque.items.push({ id: newId, value: op.value });
      state.itemStates[deque.id]![newId] = 'enqueue';
      state.frontPointers[deque.id] = 0;
      state.rearPointers[deque.id] = deque.items.length - 1;
      state.note = `📥 PushBack(${op.value})\n从队尾入队`;
      state.highlightLines = DEQUE_CODE_LINES['pushBack'];
      steps.push({ type: 'pushBack', state: cloneQueueVizState(state) });

      state.itemStates[deque.id]![newId] = 'default';
      steps.push({ type: 'pushed', state: cloneQueueVizState(state) });
    } else if (op.type === 'popFront') {
      if (deque.items.length === 0) {
        state.note = '❌ PopFront 失败\n队列为空';
        state.highlightLines = DEQUE_CODE_LINES['popFront'];
        steps.push({ type: 'empty', state: cloneQueueVizState(state) });
        continue;
      }

      const frontItem = deque.items[0]!;
      state.itemStates[deque.id]![frontItem.id] = 'dequeue';
      state.note = `📤 PopFront()\n移除队首元素 ${frontItem.value}`;
      state.highlightLines = DEQUE_CODE_LINES['popFront'];
      steps.push({ type: 'popFront', state: cloneQueueVizState(state) });

      deque.items.shift();
      delete state.itemStates[deque.id]![frontItem.id];
      state.frontPointers[deque.id] = deque.items.length > 0 ? 0 : -1;
      state.rearPointers[deque.id] = deque.items.length - 1;
      steps.push({ type: 'popped', state: cloneQueueVizState(state) });
    } else if (op.type === 'popBack') {
      if (deque.items.length === 0) {
        state.note = '❌ PopBack 失败\n队列为空';
        state.highlightLines = DEQUE_CODE_LINES['popBack'];
        steps.push({ type: 'empty', state: cloneQueueVizState(state) });
        continue;
      }

      const backItem = deque.items[deque.items.length - 1]!;
      state.itemStates[deque.id]![backItem.id] = 'dequeue';
      state.note = `📤 PopBack()\n移除队尾元素 ${backItem.value}`;
      state.highlightLines = DEQUE_CODE_LINES['popBack'];
      steps.push({ type: 'popBack', state: cloneQueueVizState(state) });

      deque.items.pop();
      delete state.itemStates[deque.id]![backItem.id];
      state.frontPointers[deque.id] = deque.items.length > 0 ? 0 : -1;
      state.rearPointers[deque.id] = deque.items.length - 1;
      steps.push({ type: 'popped', state: cloneQueueVizState(state) });
    }
  }

  state.note = '✅ 完成！\n所有操作已执行';
  steps.push({ type: 'finish', state: cloneQueueVizState(state) });

  return { steps };
}

export const DEQUE_DEFAULT_OPS: DequeOperation[] = [
  { type: 'pushBack', value: 1 },
  { type: 'pushBack', value: 2 },
  { type: 'pushFront', value: 3 },
  { type: 'pushFront', value: 4 },
  { type: 'popBack' },
  { type: 'popFront' },
  { type: 'pushBack', value: 5 },
  { type: 'popFront' },
];
