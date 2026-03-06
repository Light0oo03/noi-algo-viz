import type { Graph, NodeId } from '../graph/types';
import { edgeKey } from '../graph/types';
import type { AlgorithmTrace, TraceStep } from '../trace/types';
import { cloneVizState, createInitialVizState } from '../trace/types';
import { TOPOLOGICAL_SORT_CODE_LINES } from './topological-sort-code';

type DirectedEdge = { u: NodeId; v: NodeId; w: number };

function buildDirectedByNodeId(graph: Graph): Map<NodeId, NodeId[]> {
  const adj = new Map<NodeId, NodeId[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const e of graph.edges) {
    const from = Math.min(e.u, e.v);
    const to = Math.max(e.u, e.v);
    adj.get(from)?.push(to);
  }
  for (const [, list] of adj) {
    list.sort((a, b) => a - b);
  }
  return adj;
}

function buildDirectedByInput(graph: Graph, directed: DirectedEdge[]): Map<NodeId, NodeId[]> {
  const adj = new Map<NodeId, NodeId[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const e of directed) {
    if (!adj.has(e.u) || !adj.has(e.v) || e.u === e.v) continue;
    adj.get(e.u)!.push(e.v);
  }
  for (const [, list] of adj) {
    const uniq = [...new Set(list)];
    uniq.sort((a, b) => a - b);
    list.splice(0, list.length, ...uniq);
  }
  return adj;
}

export function generateTopologicalSortTrace(graph: Graph, directedInput?: DirectedEdge[]): AlgorithmTrace {
  const steps: TraceStep[] = [];
  const nodeIds = graph.nodes.map((n) => n.id).sort((a, b) => a - b);
  const edgeKeys = graph.edges.map((e) => edgeKey(e.u, e.v));

  let state = createInitialVizState(nodeIds, edgeKeys);
  const adj = directedInput && directedInput.length > 0
    ? buildDirectedByInput(graph, directedInput)
    : buildDirectedByNodeId(graph);
  const indeg = new Map<NodeId, number>();

  for (const id of nodeIds) indeg.set(id, 0);
  for (const [, list] of adj) {
    for (const v of list) {
      indeg.set(v, (indeg.get(v) ?? 0) + 1);
    }
  }

  const queue: NodeId[] = nodeIds.filter((id) => (indeg.get(id) ?? 0) === 0);
  const order: NodeId[] = [];

  state = cloneVizState(state);
  state.queue = [...queue];
  for (const id of queue) state.nodeStates[id] = 'frontier';
  state.note = directedInput && directedInput.length > 0
    ? `初始化入度完成（使用自定义有向边）。初始队列=[${queue.join(', ')}]`
    : `初始化入度完成（按无向边定向为小->大）。初始队列=[${queue.join(', ')}]`;
  state.highlightLines = TOPOLOGICAL_SORT_CODE_LINES.init;
  steps.push({ type: 'init', state: cloneVizState(state) });

  while (queue.length > 0) {
    state = cloneVizState(state);
    state.highlightLines = TOPOLOGICAL_SORT_CODE_LINES.loop;
    steps.push({ type: 'loop', state: cloneVizState(state) });

    const u = queue.shift()!;
    order.push(u);

    state = cloneVizState(state);
    state.nodeStates[u] = 'selected';
    state.queue = [...queue];
    state.note = `出队节点 ${u}，加入拓扑序列 [${order.join(', ')}]`;
    state.highlightLines = TOPOLOGICAL_SORT_CODE_LINES.dequeue;
    steps.push({ type: 'dequeue', node: u, state: cloneVizState(state) });

    const neighbors = adj.get(u) ?? [];
    for (const v of neighbors) {
      state = cloneVizState(state);
      const ek = edgeKey(u, v);
      if (state.edgeStates[ek] !== undefined) state.edgeStates[ek] = 'checking';
      state.note = `处理有向边 ${u} -> ${v}`;
      state.highlightLines = TOPOLOGICAL_SORT_CODE_LINES.checkNeighbor;
      steps.push({ type: 'check-neighbor', node: u, neighbor: v, state: cloneVizState(state) });

      const nextIn = (indeg.get(v) ?? 0) - 1;
      indeg.set(v, nextIn);

      state = cloneVizState(state);
      if (state.edgeStates[ek] !== undefined) state.edgeStates[ek] = 'tree';
      state.note = `入度更新：indeg[${v}] = ${nextIn}`;
      state.highlightLines = TOPOLOGICAL_SORT_CODE_LINES.checkNeighbor;
      steps.push({ type: 'decrease-indeg', node: u, neighbor: v, state: cloneVizState(state) });

      if (nextIn === 0) {
        queue.push(v);
        queue.sort((a, b) => a - b);
        state = cloneVizState(state);
        state.nodeStates[v] = 'frontier';
        state.queue = [...queue];
        state.note = `节点 ${v} 入度为 0，入队。队列=[${queue.join(', ')}]`;
        state.highlightLines = TOPOLOGICAL_SORT_CODE_LINES.enqueue;
        steps.push({ type: 'enqueue', node: u, neighbor: v, state: cloneVizState(state) });
      }
    }

    state = cloneVizState(state);
    state.nodeStates[u] = 'visited';
  }

  state = cloneVizState(state);
  for (const id of order) {
    state.nodeStates[id] = 'visited';
  }
  const ok = order.length === nodeIds.length;
  state.note = ok
    ? `拓扑排序完成（${directedInput && directedInput.length > 0 ? '自定义有向边' : '小->大定向'}）：[${order.join(', ')}]`
    : '拓扑排序失败：存在环（当前定向规则下不应出现）';
  state.highlightLines = TOPOLOGICAL_SORT_CODE_LINES.finish;
  steps.push({ type: 'finish', state: cloneVizState(state) });

  return { steps };
}
