export const QUEUE_BY_STACK_CODE_JS = `class MyQueue {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }

  push(x) {
    this.inStack.push(x);
  }

  pop() {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop());
      }
    }
    return this.outStack.pop();
  }

  peek() {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop());
      }
    }
    return this.outStack[this.outStack.length - 1];
  }

  empty() {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }
}`;

export const QUEUE_BY_STACK_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 4],
  push: [6, 7],
  'check-out': [10, 10],
  transfer: [11, 13],
  pop: [15, 15],
  peek: [24, 24],
};
