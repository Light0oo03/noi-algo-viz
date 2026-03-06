export const MONOTONIC_STACK_CODE_JS = `function largestRectangleArea(heights) {
  const stack = [];
  let maxArea = 0;

  for (let i = 0; i < heights.length; i++) {
    while (stack.length > 0 && heights[i] < heights[stack[stack.length - 1]]) {
      const h = stack.pop();
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, heights[h] * width);
    }
    stack.push(i);
  }

  while (stack.length > 0) {
    const h = stack.pop();
    const width = stack.length === 0 ? heights.length : heights.length - stack[stack.length - 1] - 1;
    maxArea = Math.max(maxArea, heights[h] * width);
  }

  return maxArea;
}`;

export const MONOTONIC_STACK_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 2],
  'check-pop': [5, 5],
  pop: [6, 6],
  'calc-area': [7, 8],
  push: [10, 10],
  'final-pop': [13, 17],
  return: [19, 19],
};
