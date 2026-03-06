export const RPN_CALCULATOR_CODE_JS = `function evalRPN(tokens) {
  const stack = [];

  for (let token of tokens) {
    if (['+', '-', '*', '/'].includes(token)) {
      const b = stack.pop();
      const a = stack.pop();
      let result;

      if (token === '+') result = a + b;
      else if (token === '-') result = a - b;
      else if (token === '*') result = a * b;
      else if (token === '/') result = Math.trunc(a / b);

      stack.push(result);
    } else {
      stack.push(Number(token));
    }
  }

  return stack[0];
}`;

export const RPN_CALCULATOR_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 1],
  'check-operator': [4, 4],
  'pop-operands': [5, 6],
  calculate: [9, 12],
  'push-result': [14, 14],
  'push-number': [16, 16],
  return: [20, 20],
};
