import type { StackTrace, StackTraceStep, StackView } from './types';
import { cloneStackVizState, createInitialStackVizState } from './types';
import { push, pop } from './utils';
import { VALID_PARENTHESES_CODE_LINES } from './valid-parentheses-code';

export function generateValidParenthesesTrace(input: string): StackTrace {
  const steps: StackTraceStep[] = [];
  const stack: StackView = { id: 'stack', label: '栈', items: [] };
  const state = createInitialStackVizState([stack]);

  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  state.note = '🚀 初始化\n创建空栈用于匹配括号';
  state.highlightLines = VALID_PARENTHESES_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneStackVizState(state) });

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '(' || char === '{' || char === '[') {
      const newId = push(stack, char.charCodeAt(0));
      state.itemStates[stack.id]![newId] = 'pushing';
      state.topPointers[stack.id] = stack.items.length - 1;
      state.note = `📥 遇到左括号 '${char}'\n入栈，等待匹配的右括号`;
      state.highlightLines = VALID_PARENTHESES_CODE_LINES['check-open'];
      steps.push({ type: 'push', state: cloneStackVizState(state) });

      state.itemStates[stack.id]![newId] = 'default';
      steps.push({ type: 'pushed', state: cloneStackVizState(state) });
    } else {
      if (stack.items.length === 0) {
        state.note = `❌ 遇到右括号 '${char}' 但栈为空\n无法匹配，返回 false`;
        state.highlightLines = VALID_PARENTHESES_CODE_LINES['check-empty'];
        steps.push({ type: 'invalid', state: cloneStackVizState(state) });
        return { steps };
      }

      const topItem = stack.items[stack.items.length - 1]!;
      const topChar = String.fromCharCode(topItem.value);
      state.itemStates[stack.id]![topItem.id] = 'active';

      const expectedChar = map[char as keyof typeof map];
      if (topChar !== expectedChar) {
        state.note = `❌ 遇到右括号 '${char}'\n栈顶是 '${topChar}'，不匹配！`;
        state.highlightLines = VALID_PARENTHESES_CODE_LINES['check-match'];
        steps.push({ type: 'mismatch', state: cloneStackVizState(state) });
        return { steps };
      }

      state.note = `✓ 遇到右括号 '${char}'\n与栈顶 '${topChar}' 匹配，准备出栈`;
      state.highlightLines = VALID_PARENTHESES_CODE_LINES['check-match'];
      steps.push({ type: 'match', state: cloneStackVizState(state) });

      state.itemStates[stack.id]![topItem.id] = 'popping';
      state.note = `📤 出栈 '${topChar}'`;
      state.highlightLines = VALID_PARENTHESES_CODE_LINES['pop'];
      steps.push({ type: 'pop', state: cloneStackVizState(state) });

      pop(stack);
      delete state.itemStates[stack.id]![topItem.id];
      state.topPointers[stack.id] = stack.items.length - 1;
      steps.push({ type: 'popped', state: cloneStackVizState(state) });
    }
  }

  const isValid = stack.items.length === 0;
  state.note = isValid
    ? '✅ 完成！\n栈为空，所有括号都已匹配'
    : '❌ 完成！\n栈不为空，还有未匹配的左括号';
  state.highlightLines = VALID_PARENTHESES_CODE_LINES['finish'];
  steps.push({ type: 'finish', state: cloneStackVizState(state) });

  return { steps };
}
