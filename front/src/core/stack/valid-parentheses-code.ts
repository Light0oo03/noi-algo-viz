export const VALID_PARENTHESES_CODE_JS = `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.length === 0) return false;
      if (stack[stack.length - 1] !== map[char]) return false;
      stack.pop();
    }
  }

  return stack.length === 0;
}`;

export const VALID_PARENTHESES_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 2],
  'check-open': [4, 6],
  'check-empty': [8, 8],
  'check-match': [9, 9],
  pop: [10, 10],
  finish: [13, 13],
};
