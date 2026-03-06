export const MIN_STACK_CODE_JS = `class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }

  push(val) {
    this.stack.push(val);
    const min = this.minStack.length === 0
      ? val
      : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(min);
  }

  pop() {
    this.stack.pop();
    this.minStack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}`;

export const MIN_STACK_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 4],
  'push-main': [6, 6],
  'calc-min': [7, 9],
  'push-min': [10, 10],
  pop: [13, 15],
  getMin: [22, 23],
};
