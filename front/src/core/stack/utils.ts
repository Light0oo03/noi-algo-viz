import type { StackView } from './types';

export function buildStack(values: number[], options: { id: string; label: string; startId?: number }): StackView {
  const { id, label, startId = 1 } = options;
  const items = values.map((value, index) => ({
    id: startId + index,
    value,
  }));
  return { id, label, items };
}

export function push(stack: StackView, value: number): number {
  const newId = stack.items.length > 0 ? Math.max(...stack.items.map(i => i.id)) + 1 : 1;
  stack.items.push({ id: newId, value });
  return newId;
}

export function pop(stack: StackView): number | null {
  const item = stack.items.pop();
  return item ? item.value : null;
}

export function peek(stack: StackView): number | null {
  return stack.items.length > 0 ? stack.items[stack.items.length - 1]!.value : null;
}
