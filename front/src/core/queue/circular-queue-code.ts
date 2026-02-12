export const CIRCULAR_QUEUE_CODE_JS = `class CircularQueue {
  constructor(k) {
    this.capacity = k;
    this.items = new Array(k).fill(null);
    this.front = -1;
    this.rear = -1;
    this.size = 0;
  }

  enqueue(value) {
    if (this.isFull()) return false;

    if (this.isEmpty()) {
      this.front = 0;
    }
    this.rear = (this.rear + 1) % this.capacity;
    this.items[this.rear] = value;
    this.size++;
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return false;

    this.items[this.front] = null;
    if (this.front === this.rear) {
      this.front = -1;
      this.rear = -1;
    } else {
      this.front = (this.front + 1) % this.capacity;
    }
    this.size--;
    return true;
  }

  isFull() {
    return this.size === this.capacity;
  }

  isEmpty() {
    return this.size === 0;
  }
}`;

export const CIRCULAR_QUEUE_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 7],
  'check-full': [10, 10],
  'check-empty-enqueue': [12, 14],
  'calc-rear': [15, 15],
  enqueue: [16, 17],
  'check-empty-dequeue': [22, 22],
  'clear-front': [24, 24],
  'check-last': [25, 29],
  'move-front': [30, 30],
};
