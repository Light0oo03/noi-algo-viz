import type { StackTrace, StackTraceStep, StackView } from './types';
import { cloneStackVizState, createInitialStackVizState } from './types';
import { push, pop } from './utils';
import { RPN_CALCULATOR_CODE_LINES } from './rpn-calculator-code';

export function generateRPNCalculatorTrace(tokens: string[]): StackTrace {
  const steps: StackTraceStep[] = [];
  const stack: StackView = { id: 'stack', label: '栈', items: [] };
  const state = createInitialStackVizState([stack]);

  state.note = '🚀 初始化栈\n用于逆波兰表达式求值';
  state.highlightLines = RPN_CALCULATOR_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneStackVizState(state) });

  for (const token of tokens) {
    if (['+', '-', '*', '/'].includes(token)) {
      state.note = `🔍 遇到运算符 '${token}'\n准备弹出两个操作数`;
      state.highlightLines = RPN_CALCULATOR_CODE_LINES['check-operator'];
      steps.push({ type: 'operator', state: cloneStackVizState(state) });

      if (stack.items.length < 2) {
        state.note = '❌ 错误：栈中元素不足';
        steps.push({ type: 'error', state: cloneStackVizState(state) });
        return { steps };
      }

      const bItem = stack.items[stack.items.length - 1]!;
      const aItem = stack.items[stack.items.length - 2]!;

      state.itemStates[stack.id]![bItem.id] = 'active';
      state.itemStates[stack.id]![aItem.id] = 'active';
      state.note = `📤 弹出操作数\nb = ${bItem.value}, a = ${aItem.value}`;
      state.highlightLines = RPN_CALCULATOR_CODE_LINES['pop-operands'];
      steps.push({ type: 'pop-operands', state: cloneStackVizState(state) });

      const b = pop(stack)!;
      const a = pop(stack)!;
      delete state.itemStates[stack.id]![bItem.id];
      delete state.itemStates[stack.id]![aItem.id];
      state.topPointers[stack.id] = stack.items.length - 1;

      let result: number;
      if (token === '+') result = a + b;
      else if (token === '-') result = a - b;
      else if (token === '*') result = a * b;
      else result = Math.trunc(a / b);

      state.note = `🔢 计算\n${a} ${token} ${b} = ${result}`;
      state.highlightLines = RPN_CALCULATOR_CODE_LINES['calculate'];
      steps.push({ type: 'calculate', state: cloneStackVizState(state) });

      const newId = push(stack, result);
      state.itemStates[stack.id]![newId] = 'pushing';
      state.topPointers[stack.id] = stack.items.length - 1;
      state.note = `📥 入栈结果\n${result}`;
      state.highlightLines = RPN_CALCULATOR_CODE_LINES['push-result'];
      steps.push({ type: 'push-result', state: cloneStackVizState(state) });

      state.itemStates[stack.id]![newId] = 'default';
      steps.push({ type: 'pushed', state: cloneStackVizState(state) });
    } else {
      const num = Number(token);
      const newId = push(stack, num);
      state.itemStates[stack.id]![newId] = 'pushing';
      state.topPointers[stack.id] = stack.items.length - 1;
      state.note = `📥 入栈数字\n${num}`;
      state.highlightLines = RPN_CALCULATOR_CODE_LINES['push-number'];
      steps.push({ type: 'push-number', state: cloneStackVizState(state) });

      state.itemStates[stack.id]![newId] = 'default';
      steps.push({ type: 'pushed', state: cloneStackVizState(state) });
    }
  }

  const result = stack.items.length > 0 ? stack.items[0]!.value : 0;
  state.note = `✅ 完成！\n计算结果: ${result}`;
  state.highlightLines = RPN_CALCULATOR_CODE_LINES['return'];
  steps.push({ type: 'finish', state: cloneStackVizState(state) });

  return { steps };
}

export const RPN_CALCULATOR_DEFAULT_TOKENS = ['2', '1', '+', '3', '*'];
