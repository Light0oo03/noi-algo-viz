/**
 * 链表可视化类型定义
 */

export type ListNodeState = 'default' | 'visited' | 'selected' | 'frontier';

export type ListNode = {
  id: number;
  value: number;
  next: number | null;
  label?: string;
};

export type ListView = {
  id: string;
  label: string;
  nodes: ListNode[];
  head: number | null;
};

export type ListPointer = {
  listId: string;
  nodeId: number | null;
};

export type ListEdgeHighlight = {
  listId: string;
  from: number;
  to: number | null;
  state: 'checking' | 'tree' | 'default';
};

export interface ListVizState {
  lists: ListView[];
  nodeStates: Record<string, Record<number, ListNodeState>>;
  pointers: Record<string, ListPointer>;
  edgeHighlights: ListEdgeHighlight[];
  note: string;
  highlightLines?: [number, number];
}

export interface ListTraceStep {
  type: string;
  state: ListVizState;
}

export interface ListTrace {
  steps: ListTraceStep[];
}

export function createInitialListVizState(lists: ListView[], note = '准备开始链表算法...'): ListVizState {
  const nodeStates: Record<string, Record<number, ListNodeState>> = {};
  for (const list of lists) {
    const st: Record<number, ListNodeState> = {};
    for (const node of list.nodes) {
      st[node.id] = 'default';
    }
    nodeStates[list.id] = st;
  }
  return {
    lists,
    nodeStates,
    pointers: {},
    edgeHighlights: [],
    note,
  };
}

export function cloneListVizState(state: ListVizState): ListVizState {
  return {
    lists: state.lists.map((list) => ({
      ...list,
      nodes: list.nodes.map((n) => ({ ...n })),
    })),
    nodeStates: Object.fromEntries(
      Object.entries(state.nodeStates).map(([k, v]) => [k, { ...v }])
    ),
    pointers: Object.fromEntries(
      Object.entries(state.pointers).map(([k, v]) => [k, { ...v }])
    ),
    edgeHighlights: state.edgeHighlights.map((e) => ({ ...e })),
    note: state.note,
    highlightLines: state.highlightLines ? [...state.highlightLines] as [number, number] : undefined,
  };
}
