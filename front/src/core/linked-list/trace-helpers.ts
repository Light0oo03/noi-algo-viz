/**
 * 链表 trace 辅助方法
 */

import type { ListVizState, ListView, ListNodeState } from './types';

export function resetNodeStates(state: ListVizState, list: ListView) {
  const map = state.nodeStates[list.id] ?? {};
  for (const node of list.nodes) {
    map[node.id] = 'default';
  }
  state.nodeStates[list.id] = map;
}

export function setPointer(
  state: ListVizState,
  name: string,
  listId: string,
  nodeId: number | null
) {
  state.pointers[name] = { listId, nodeId };
}

export function applyPointerStyles(
  state: ListVizState,
  list: ListView,
  pointerStyles: Record<string, ListNodeState>
) {
  resetNodeStates(state, list);
  state.nodeStates[list.id] ??= {};
  for (const [name, style] of Object.entries(pointerStyles)) {
    const p = state.pointers[name];
    if (!p || p.listId !== list.id || p.nodeId == null) continue;
    state.nodeStates[list.id]![p.nodeId] = style;
  }
}

export function clearEdgeHighlights(state: ListVizState) {
  state.edgeHighlights = [];
}

export function highlightEdge(
  state: ListVizState,
  listId: string,
  from: number,
  to: number | null,
  edgeState: 'checking' | 'tree' | 'default'
) {
  state.edgeHighlights = [{ listId, from, to, state: edgeState }];
}

export function snapshotQueue(values: Array<number | null>): number[] {
  return values.filter((v): v is number => v != null);
}
