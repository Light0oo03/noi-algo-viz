/**
 * 链表中点 trace
 */

import type { ListTrace, ListTraceStep, ListView } from './types';
import { cloneListVizState, createInitialListVizState } from './types';
import { findNode } from './utils';
import { applyPointerStyles, setPointer } from './trace-helpers';
import { MIDDLE_CODE_LINES } from './middle-code';

export function generateMiddleTrace(list: ListView): ListTrace {
  const steps: ListTraceStep[] = [];
  const state = createInitialListVizState([list]);

  let slow = list.head;
  let fast = list.head;

  setPointer(state, 'slow', list.id, slow);
  setPointer(state, 'fast', list.id, fast);
  applyPointerStyles(state, list, { slow: 'selected', fast: 'frontier' });
  state.note = '初始化：slow 和 fast 指向头结点';
  state.highlightLines = MIDDLE_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneListVizState(state) });

  while (fast !== null) {
    const fastNode = findNode(list, fast);
    const fastNext = fastNode?.next ?? null;
    if (fastNext == null) break;
    const fastNextNode = findNode(list, fastNext);
    const fastNextNext = fastNextNode?.next ?? null;

    slow = findNode(list, slow)?.next ?? null;
    fast = fastNextNext;

    setPointer(state, 'slow', list.id, slow);
    setPointer(state, 'fast', list.id, fast);
    applyPointerStyles(state, list, { slow: 'selected', fast: 'frontier' });
    state.note = `移动：slow -> ${slow ?? 'null'}，fast -> ${fast ?? 'null'}`;
    state.highlightLines = MIDDLE_CODE_LINES['move'];
    steps.push({ type: 'move', state: cloneListVizState(state) });
  }

  state.note = `完成：中点为 ${slow ?? 'null'}`;
  state.highlightLines = MIDDLE_CODE_LINES['finish'];
  steps.push({ type: 'finish', state: cloneListVizState(state) });

  return { steps };
}
