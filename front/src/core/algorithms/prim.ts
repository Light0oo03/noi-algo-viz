/**
 * Prim 算法实现 - 生成可视化 trace（最小生成树）
 */

import type { Graph, NodeId } from '../graph/types';
import { buildWeightedAdjList, edgeKey } from '../graph/types';
import type { PrimStep, PrimTrace } from '../trace/types';
import { cloneVizState, createInitialVizState } from '../trace/types';
import { PRIM_CODE_LINES } from './prim-code';

type EdgeItem = { u: NodeId; v: NodeId; w: number };

function queueSnapshot(queue: EdgeItem[]): NodeId[] {
  return queue.map((e) => e.v);
}

function extractMinEdge(queue: EdgeItem[]): EdgeItem {
  const first = queue[0];
  if (!first) return { u: 0, v: 0, w: 0 };
  let bestIdx = 0;
  let best = first;
  for (let i = 1; i < queue.length; i++) {
    const e = queue[i];
    if (!e) continue;
    if (e.w < best.w || (e.w === best.w && (e.u < best.u || (e.u === best.u && e.v < best.v)))) {
      best = e;
      bestIdx = i;
    }
  }
  queue.splice(bestIdx, 1);
  return best;
}

/**
 * 生成 Prim 遍历的 trace
 * @param graph 图结构
 * @param start 起点节点 id
 * @returns Prim trace（包含每一步的状态快照）
 */
export function generatePrimTrace(graph: Graph, start: NodeId): PrimTrace {
  const steps: PrimStep[] = [];
  const adj = buildWeightedAdjList(graph);

  // 收集所有节点 id 和边 key
  const nodeIds = graph.nodes.map((n) => n.id);
  const edgeKeys = graph.edges.map((e) => edgeKey(e.u, e.v));

  // 初始状态
  let state = createInitialVizState(nodeIds, edgeKeys);

  const visited = new Set<NodeId>();
  const queue: EdgeItem[] = [];

  visited.add(start);
  state = cloneVizState(state);
  state.nodeStates[start] = 'visited';
  state.note = `初始化：从起点 ${start} 开始构建最小生成树`;
  state.highlightLines = PRIM_CODE_LINES['init'];

  const neighbors = adj.get(start) ?? [];
  for (const nb of neighbors) {
    queue.push({ u: start, v: nb.to, w: nb.w });
    state.nodeStates[nb.to] = 'frontier';
  }
  state.queue = queueSnapshot(queue);

  steps.push({
    type: 'init',
    node: start,
    state: cloneVizState(state),
  });

  while (queue.length > 0) {
    const edge = extractMinEdge(queue);
    const { u, v, w } = edge;
    const ek = edgeKey(u, v);

    state = cloneVizState(state);
    state.edgeStates[ek] = 'checking';
    state.nodeStates[u] = 'selected';
    state.nodeStates[v] = 'selected';
    state.queue = queueSnapshot(queue);
    state.note = `取出最小边 (${u}, ${v})，权重=${w}`;
    state.highlightLines = PRIM_CODE_LINES['pick-edge'];

    steps.push({
      type: 'pick-edge',
      node: u,
      neighbor: v,
      state: cloneVizState(state),
    });

    if (visited.has(v)) {
      state = cloneVizState(state);
      state.edgeStates[ek] = 'default';
      state.nodeStates[u] = visited.has(u) ? 'visited' : 'selected';
      state.nodeStates[v] = 'visited';
      state.note = `跳过：节点 ${v} 已在生成树中`;
      state.highlightLines = PRIM_CODE_LINES['skip-edge'];

      steps.push({
        type: 'skip-edge',
        node: u,
        neighbor: v,
        state: cloneVizState(state),
      });
      continue;
    }

    visited.add(v);
    state = cloneVizState(state);
    state.edgeStates[ek] = 'tree';
    state.nodeStates[v] = 'visited';
    state.nodeStates[u] = visited.has(u) ? 'visited' : 'selected';
    state.note = `加入边 (${u}, ${v})，节点 ${v} 进入生成树`;
    state.highlightLines = PRIM_CODE_LINES['add-edge'];

    steps.push({
      type: 'add-edge',
      node: u,
      neighbor: v,
      state: cloneVizState(state),
    });

    const nextNeighbors = adj.get(v) ?? [];
    for (const nb of nextNeighbors) {
      if (visited.has(nb.to)) continue;
      queue.push({ u: v, v: nb.to, w: nb.w });
      state.nodeStates[nb.to] = 'frontier';
    }

    state = cloneVizState(state);
    state.queue = queueSnapshot(queue);
    state.note = `扩展候选边：当前队列大小 ${queue.length}`;
    state.highlightLines = PRIM_CODE_LINES['add-edge'];
  }

  state = cloneVizState(state);
  state.note = `Prim 完成！生成树节点数 ${visited.size}`;
  state.highlightLines = PRIM_CODE_LINES['finish'];

  steps.push({
    type: 'finish',
    state: cloneVizState(state),
  });

  return { steps };
}
