/**
 * 合并两个有序链表 trace
 */

import type { ListTrace, ListTraceStep, ListView, ListNode } from './types';
import { cloneListVizState, createInitialListVizState } from './types';
import { findNode, updateHead } from './utils';
import { applyPointerStyles, setPointer } from './trace-helpers';
import { MERGE_CODE_LINES } from './merge-code';

function appendNode(list: ListView, node: ListNode) {
  if (list.nodes.length === 0) {
    list.nodes.push(node);
    list.head = node.id;
    return;
  }
  const tail = list.nodes[list.nodes.length - 1]!;
  tail.next = node.id;
  list.nodes.push(node);
}

export function generateMergeTrace(listA: ListView, listB: ListView): ListTrace {
  const steps: ListTraceStep[] = [];
  const maxId = Math.max(
    0,
    ...listA.nodes.map((n) => n.id),
    ...listB.nodes.map((n) => n.id)
  );
  let nextId = maxId + 1;

  const merged: ListView = {
    id: 'merged',
    label: '合并结果',
    nodes: [],
    head: null,
  };

  const state = createInitialListVizState([listA, listB, merged]);

  let p1 = listA.head;
  let p2 = listB.head;
  let tail: number | null = null;

  setPointer(state, 'p1', listA.id, p1);
  setPointer(state, 'p2', listB.id, p2);
  setPointer(state, 'tail', merged.id, tail);
  applyPointerStyles(state, listA, { p1: 'selected' });
  applyPointerStyles(state, listB, { p2: 'selected' });
  applyPointerStyles(state, merged, { tail: 'frontier' });
  state.note = '初始化：准备合并两个有序链表';
  state.highlightLines = MERGE_CODE_LINES['init'];
  steps.push({ type: 'init', state: cloneListVizState(state) });

  while (p1 != null && p2 != null) {
    const n1 = findNode(listA, p1);
    const n2 = findNode(listB, p2);
    if (!n1 || !n2) break;

    state.note = `比较：${n1.value} 和 ${n2.value}`;
    state.highlightLines = MERGE_CODE_LINES['compare'];
    steps.push({ type: 'compare', state: cloneListVizState(state) });

    if (n1.value <= n2.value) {
      const node: ListNode = { id: nextId++, value: n1.value, next: null };
      appendNode(merged, node);
      tail = node.id;
      p1 = n1.next;
      setPointer(state, 'tail', merged.id, tail);
      setPointer(state, 'p1', listA.id, p1);
      applyPointerStyles(state, merged, { tail: 'selected' });
      state.note = `接入左链表节点 ${n1.value}`;
      state.highlightLines = MERGE_CODE_LINES['attach-left'];
      steps.push({ type: 'attach-left', state: cloneListVizState(state) });
    } else {
      const node: ListNode = { id: nextId++, value: n2.value, next: null };
      appendNode(merged, node);
      tail = node.id;
      p2 = n2.next;
      setPointer(state, 'tail', merged.id, tail);
      setPointer(state, 'p2', listB.id, p2);
      applyPointerStyles(state, merged, { tail: 'selected' });
      state.note = `接入右链表节点 ${n2.value}`;
      state.highlightLines = MERGE_CODE_LINES['attach-right'];
      steps.push({ type: 'attach-right', state: cloneListVizState(state) });
    }

    applyPointerStyles(state, listA, { p1: 'selected' });
    applyPointerStyles(state, listB, { p2: 'selected' });
    state.highlightLines = MERGE_CODE_LINES['move-tail'];
    steps.push({ type: 'move-tail', state: cloneListVizState(state) });
  }

  const restList = p1 != null ? listA : listB;
  let rest = p1 ?? p2;
  while (rest != null) {
    const node = findNode(restList, rest);
    if (!node) break;
    appendNode(merged, { id: nextId++, value: node.value, next: null });
    const last = merged.nodes[merged.nodes.length - 1];
    if (last) {
      tail = last.id;
    }
    rest = node.next;
  }
  setPointer(state, 'tail', merged.id, tail);
  applyPointerStyles(state, merged, { tail: 'selected' });
  state.note = '接入剩余节点';
  state.highlightLines = MERGE_CODE_LINES['append-rest'];
  steps.push({ type: 'append-rest', state: cloneListVizState(state) });

  updateHead(merged, merged.head);
  state.note = '合并完成';
  state.highlightLines = MERGE_CODE_LINES['finish'];
  steps.push({ type: 'finish', state: cloneListVizState(state) });

  return { steps };
}
