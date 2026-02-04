/**
 * 删除倒数第 k 个节点 trace
 */

import type { ListTrace, ListTraceStep, ListView } from './types';
import { cloneListVizState, createInitialListVizState } from './types';
import { findNode, setNext, updateHead } from './utils';
import { applyPointerStyles, setPointer } from './trace-helpers';
import { REMOVE_K_CODE_LINES } from './remove-k-code';

function listLength(list: ListView): number {
  let count = 0;
  let cur = list.head;
  const seen = new Set<number>();
  while (cur != null && !seen.has(cur)) {
    seen.add(cur);
    count++;
    cur = findNode(list, cur)?.next ?? null;
  }
  return count;
}

export function generateRemoveKTrace(list: ListView, k: number): ListTrace {
  const steps: ListTraceStep[] = [];

  const maxId = Math.max(0, ...list.nodes.map((n) => n.id));
  const dummyId = maxId + 1;
  list.nodes.unshift({ id: dummyId, value: -1, next: list.head, label: 'dummy' });
  updateHead(list, dummyId);

  const state = createInitialListVizState([list]);

  let fast: number | null = dummyId;
  let slow: number | null = dummyId;

  setPointer(state, 'fast', list.id, fast);
  setPointer(state, 'slow', list.id, slow);
  applyPointerStyles(state, list, { fast: 'frontier', slow: 'selected' });
  state.note = `初始化：k=${k}`;
  state.highlightLines = REMOVE_K_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneListVizState(state) });

  const len = listLength(list) - 1;
  if (k <= 0 || k > len) {
    state.note = `k 不合法（1~${len}），不执行删除`;
    state.highlightLines = REMOVE_K_CODE_LINES['finish'];
    steps.push({ type: 'finish', state: cloneListVizState(state) });
    return { steps };
  }

  for (let i = 0; i < k; i++) {
    const nextNode: number | null = findNode(list, fast)?.next ?? null;
    fast = nextNode;
    setPointer(state, 'fast', list.id, fast);
    applyPointerStyles(state, list, { fast: 'frontier', slow: 'selected' });
    state.note = `fast 前进第 ${i + 1} 步`;
    state.highlightLines = REMOVE_K_CODE_LINES['advance-fast'];
    steps.push({ type: 'advance-fast', state: cloneListVizState(state) });
  }

  while (fast != null && findNode(list, fast)?.next != null) {
    fast = findNode(list, fast)?.next ?? null;
    slow = findNode(list, slow)?.next ?? null;
    setPointer(state, 'fast', list.id, fast);
    setPointer(state, 'slow', list.id, slow);
    applyPointerStyles(state, list, { fast: 'frontier', slow: 'selected' });
    state.note = 'fast 与 slow 同步前进';
    state.highlightLines = REMOVE_K_CODE_LINES['move'];
    steps.push({ type: 'move', state: cloneListVizState(state) });
  }

  const target = findNode(list, slow)?.next ?? null;
  if (target != null) {
    const targetNext = findNode(list, target)?.next ?? null;
    setNext(list, slow!, targetNext);
    list.nodes = list.nodes.filter((n) => n.id !== target);
    state.note = `删除节点 ${target}`;
    state.highlightLines = REMOVE_K_CODE_LINES['remove'];
    steps.push({ type: 'remove', state: cloneListVizState(state) });
  }

  const newHead = findNode(list, dummyId)?.next ?? null;
  list.nodes = list.nodes.filter((n) => n.id !== dummyId);
  updateHead(list, newHead);
  setPointer(state, 'slow', list.id, null);
  setPointer(state, 'fast', list.id, null);
  applyPointerStyles(state, list, {});
  state.note = '删除完成';
  state.highlightLines = REMOVE_K_CODE_LINES['finish'];
  steps.push({ type: 'finish', state: cloneListVizState(state) });

  return { steps };
}
