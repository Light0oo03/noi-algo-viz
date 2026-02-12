export const QUEUE_BASIC_CODE_JS = `class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    this.items.push(element);
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}`;

export const QUEUE_BASIC_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 3],
  enqueue: [5, 6],
  dequeue: [8, 9],
  peek: [11, 12],
  isEmpty: [14, 16],
  size: [18, 19],
};
