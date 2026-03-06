/**
 * 反转链表 trace
 */

import type { ListTrace, ListTraceStep, ListView } from './types';
import { cloneListVizState, createInitialListVizState } from './types';
import { findNode, setNext, updateHead } from './utils';
import { applyPointerStyles, highlightEdge, setPointer } from './trace-helpers';
import { REVERSE_CODE_LINES } from './reverse-code';

export function generateReverseTrace(list: ListView): ListTrace {
  const steps: ListTraceStep[] = [];
  const state = createInitialListVizState([list]);

  let prev: number | null = null;
  let curr: number | null = list.head;

  setPointer(state, 'prev', list.id, prev);
  setPointer(state, 'curr', list.id, curr);
  applyPointerStyles(state, list, { prev: 'frontier', curr: 'selected' });
  state.note = '🚀 初始化\nprev → null（新链表的尾部）\ncurr → 头结点（开始遍历）';
  state.highlightLines = REVERSE_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneListVizState(state) });

  let stepCount = 1;
  while (curr !== null) {
    const currNode = findNode(list, curr);
    const next = currNode?.next ?? null;

    setPointer(state, 'next', list.id, next);
    applyPointerStyles(state, list, { prev: 'frontier', curr: 'selected', next: 'frontier' });
    state.note = `📍 步骤 ${stepCount}: 保存下一个节点\nnext → 节点 ${next ?? 'null'}\n（防止反转后丢失后续节点）`;
    state.highlightLines = REVERSE_CODE_LINES['save-next'];
    steps.push({ type: 'save-next', state: cloneListVizState(state) });

    highlightEdge(state, list.id, curr, next, 'checking');
    state.note = `🔄 步骤 ${stepCount}: 反转指针\n节点 ${curr} 的 next 从 ${next ?? 'null'} 改为 ${prev ?? 'null'}\n（将当前节点指向前一个节点）`;
    state.highlightLines = REVERSE_CODE_LINES['reverse'];
    steps.push({ type: 'reverse', state: cloneListVizState(state) });

    setNext(list, curr, prev);
    setPointer(state, 'prev', list.id, curr);
    setPointer(state, 'curr', list.id, next);
    applyPointerStyles(state, list, { prev: 'selected', curr: 'selected', next: 'frontier' });
    state.note = `➡️ 步骤 ${stepCount}: 指针后移\nprev → 节点 ${curr}\ncurr → 节点 ${next ?? 'null'}\n（继续处理下一个节点）`;
    state.highlightLines = REVERSE_CODE_LINES['move'];
    steps.push({ type: 'move', state: cloneListVizState(state) });

    prev = curr;
    curr = next;
    stepCount++;
  }

  updateHead(list, prev);
  setPointer(state, 'prev', list.id, prev);
  setPointer(state, 'curr', list.id, null);
  applyPointerStyles(state, list, { prev: 'selected' });
  state.note = `✅ 完成！\n新的头结点：${prev ?? 'null'}\n链表已完全反转`;
  state.highlightLines = REVERSE_CODE_LINES['finish'];
  steps.push({ type: 'finish', state: cloneListVizState(state) });

  return { steps };
}
