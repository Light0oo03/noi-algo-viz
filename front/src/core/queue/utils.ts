import type { QueueView } from './types';

export function buildQueue(values: number[], options: { id: string; label: string; capacity?: number; startId?: number }): QueueView {
  const { id, label, capacity, startId = 1 } = options;
  const items = values.map((value, index) => ({
    id: startId + index,
    value,
  }));
  return { id, label, items, capacity };
}

export function enqueue(queue: QueueView, value: number): number {
  const newId = queue.items.length > 0 ? Math.max(...queue.items.map(i => i.id)) + 1 : 1;
  queue.items.push({ id: newId, value });
  return newId;
}

export function dequeue(queue: QueueView): number | null {
  const item = queue.items.shift();
  return item ? item.value : null;
}

export function peek(queue: QueueView): number | null {
  return queue.items.length > 0 ? queue.items[0]!.value : null;
}

export function isEmpty(queue: QueueView): boolean {
  return queue.items.length === 0;
}

export function isFull(queue: QueueView): boolean {
  return queue.capacity !== undefined && queue.items.length >= queue.capacity;
}
