export const DEQUE_CODE_JS = `class Deque {
  constructor() {
    this.items = [];
  }

  pushFront(element) {
    this.items.unshift(element);
  }

  pushBack(element) {
    this.items.push(element);
  }

  popFront() {
    return this.items.shift();
  }

  popBack() {
    return this.items.pop();
  }

  peekFront() {
    return this.items[0];
  }

  peekBack() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}`;

export const DEQUE_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 3],
  pushFront: [5, 6],
  pushBack: [8, 9],
  popFront: [11, 12],
  popBack: [14, 15],
  peekFront: [17, 18],
  peekBack: [20, 21],
};
