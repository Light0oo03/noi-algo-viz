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
  state.note = '初始化：prev 指向 null，curr 指向头结点';
  state.highlightLines = REVERSE_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneListVizState(state) });

  while (curr !== null) {
    const currNode = findNode(list, curr);
    const next = currNode?.next ?? null;

    setPointer(state, 'next', list.id, next);
    applyPointerStyles(state, list, { prev: 'frontier', curr: 'selected', next: 'frontier' });
    state.note = `保存 next：next = ${next ?? 'null'}`;
    state.highlightLines = REVERSE_CODE_LINES['save-next'];
    steps.push({ type: 'save-next', state: cloneListVizState(state) });

    highlightEdge(state, list.id, curr, next, 'checking');
    state.note = `反转指针：${curr} -> ${prev ?? 'null'}`;
    state.highlightLines = REVERSE_CODE_LINES['reverse'];
    steps.push({ type: 'reverse', state: cloneListVizState(state) });

    setNext(list, curr, prev);
    setPointer(state, 'prev', list.id, curr);
    setPointer(state, 'curr', list.id, next);
    applyPointerStyles(state, list, { prev: 'selected', curr: 'selected', next: 'frontier' });
    state.note = '指针后移：prev = curr，curr = next';
    state.highlightLines = REVERSE_CODE_LINES['move'];
    steps.push({ type: 'move', state: cloneListVizState(state) });

    prev = curr;
    curr = next;
  }

  updateHead(list, prev);
  setPointer(state, 'prev', list.id, prev);
  setPointer(state, 'curr', list.id, null);
  applyPointerStyles(state, list, { prev: 'selected' });
  state.note = `完成：新头结点为 ${prev ?? 'null'}`;
  state.highlightLines = REVERSE_CODE_LINES['finish'];
  steps.push({ type: 'finish', state: cloneListVizState(state) });

  return { steps };
}
