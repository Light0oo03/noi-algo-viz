/**
 * 链表判环 trace
 */

import type { ListTrace, ListTraceStep, ListView } from './types';
import { cloneListVizState, createInitialListVizState } from './types';
import { findNode } from './utils';
import { applyPointerStyles, setPointer } from './trace-helpers';
import { CYCLE_CODE_LINES } from './cycle-code';

export function generateCycleTrace(list: ListView): ListTrace {
  const steps: ListTraceStep[] = [];
  const state = createInitialListVizState([list]);

  let slow = list.head;
  let fast = list.head;

  setPointer(state, 'slow', list.id, slow);
  setPointer(state, 'fast', list.id, fast);
  applyPointerStyles(state, list, { slow: 'selected', fast: 'frontier' });
  state.note = '初始化：slow 和 fast 指向头结点';
  state.highlightLines = CYCLE_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneListVizState(state) });

  let hasCycle = false;

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
    state.highlightLines = CYCLE_CODE_LINES['move'];
    steps.push({ type: 'move', state: cloneListVizState(state) });

    if (slow != null && fast != null && slow === fast) {
      hasCycle = true;
      state.note = `相遇：节点 ${slow}，链表有环`;
      state.highlightLines = CYCLE_CODE_LINES['meet'];
      steps.push({ type: 'meet', state: cloneListVizState(state) });
      break;
    }
  }

  state.note = hasCycle ? '判定结束：存在环' : '判定结束：无环';
  state.highlightLines = CYCLE_CODE_LINES['finish'];
  steps.push({ type: 'finish', state: cloneListVizState(state) });

  return { steps };
}
