/**
 * 链表工具方法
 */

import type { ListNode, ListView } from './types';

type BuildListOptions = {
  id: string;
  label: string;
  startId?: number;
  cycleAtIndex?: number | null;
  nodeLabelPrefix?: string;
};

export function buildList(values: number[], options: BuildListOptions): ListView {
  const nodes: ListNode[] = [];
  let nextId = options.startId ?? 1;
  const ids: number[] = [];

  for (const value of values) {
    const id = nextId++;
    ids.push(id);
    nodes.push({
      id,
      value,
      next: null,
      label: options.nodeLabelPrefix ? `${options.nodeLabelPrefix}${value}` : undefined,
    });
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const next = nodes[i + 1];
    node.next = next ? next.id : null;
  }

  if (options.cycleAtIndex != null && options.cycleAtIndex >= 0 && options.cycleAtIndex < nodes.length) {
    const tail = nodes[nodes.length - 1];
    if (tail) {
      tail.next = nodes[options.cycleAtIndex]!.id;
    }
  }

  return {
    id: options.id,
    label: options.label,
    nodes,
    head: nodes[0]?.id ?? null,
  };
}

export function findNode(list: ListView, nodeId: number | null): ListNode | undefined {
  if (nodeId == null) return undefined;
  return list.nodes.find((n) => n.id === nodeId);
}

export function setNext(list: ListView, fromId: number, toId: number | null) {
  const node = list.nodes.find((n) => n.id === fromId);
  if (node) {
    node.next = toId;
  }
}

export function updateHead(list: ListView, headId: number | null) {
  list.head = headId;
}
