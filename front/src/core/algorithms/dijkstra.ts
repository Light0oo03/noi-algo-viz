/**
 * Dijkstra 算法实现 - 生成可视化 trace
 */

import type { Graph, NodeId } from '../graph/types';
import { buildWeightedAdjList, edgeKey } from '../graph/types';
import type { DijkstraStep, DijkstraTrace } from '../trace/types';
import { cloneVizState, createInitialVizState } from '../trace/types';
import { DIJKSTRA_CODE_LINES } from './dijkstra-code';

function formatDist(value: number): string {
  return Number.isFinite(value) ? String(value) : '∞';
}

function queueSnapshot(queue: NodeId[], dist: Map<NodeId, number>): NodeId[] {
  return [...queue].sort((a, b) => {
    const da = dist.get(a) ?? Infinity;
    const db = dist.get(b) ?? Infinity;
    if (da !== db) return da - db;
    return a - b;
  });
}

function extractMin(queue: NodeId[], dist: Map<NodeId, number>): NodeId {
  const first = queue[0];
  if (first === undefined) return 0;
  let bestIdx = 0;
  let bestNode = first;
  let bestDist = dist.get(bestNode) ?? Infinity;
  for (let i = 1; i < queue.length; i++) {
    const node = queue[i];
    if (node === undefined) continue;
    const d = dist.get(node) ?? Infinity;
    if (d < bestDist || (d === bestDist && node < bestNode)) {
      bestIdx = i;
      bestNode = node;
      bestDist = d;
    }
  }
  queue.splice(bestIdx, 1);
  return bestNode;
}

function distNote(nodeIds: NodeId[], dist: Map<NodeId, number>): string {
  return nodeIds
    .map((id) => `${id}:${formatDist(dist.get(id) ?? Infinity)}`)
    .join(' ');
}

/**
 * 生成 Dijkstra 遍历的 trace（最短路）
 * @param graph 图结构
 * @param start 起点节点 id
 * @returns Dijkstra trace（包含每一步的状态快照）
 */
export function generateDijkstraTrace(graph: Graph, start: NodeId): DijkstraTrace {
  const steps: DijkstraStep[] = [];
  const adj = buildWeightedAdjList(graph);

  // 收集所有节点 id 和边 key
  const nodeIds = graph.nodes.map((n) => n.id);
  const edgeKeys = graph.edges.map((e) => edgeKey(e.u, e.v));

  // 初始状态
  let state = createInitialVizState(nodeIds, edgeKeys);

  const dist = new Map<NodeId, number>();
  const prev = new Map<NodeId, NodeId>();
  const visited = new Set<NodeId>();
  const queue: NodeId[] = [];
  const inQueue = new Set<NodeId>();

  for (const id of nodeIds) {
    dist.set(id, Infinity);
  }
  dist.set(start, 0);
  queue.push(start);
  inQueue.add(start);

  state = cloneVizState(state);
  state.nodeStates[start] = 'frontier';
  state.queue = queueSnapshot(queue, dist);
  state.note = `初始化：起点 ${start} 距离=0；dist={${distNote(nodeIds, dist)}}`;
  state.highlightLines = DIJKSTRA_CODE_LINES['init'];

  steps.push({
    type: 'init',
    node: start,
    state: cloneVizState(state),
  });

  while (queue.length > 0) {
    const current = extractMin(queue, dist);
    inQueue.delete(current);

    // --- 取出最小距离节点 ---
    state = cloneVizState(state);
    state.nodeStates[current] = 'selected';
    state.queue = queueSnapshot(queue, dist);
    state.note = `取出最小距离节点 ${current}，dist=${formatDist(dist.get(current) ?? Infinity)}`;
    state.highlightLines = DIJKSTRA_CODE_LINES['extract-min'];

    steps.push({
      type: 'extract-min',
      node: current,
      state: cloneVizState(state),
    });

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const neighbors = adj.get(current) ?? [];
    for (const nb of neighbors) {
      const neighbor = nb.to;
      const w = nb.w;
      const ek = edgeKey(current, neighbor);

      state = cloneVizState(state);
      state.edgeStates[ek] = 'checking';
      state.note = `检查边 (${current}, ${neighbor})，权重=${w}`;
      state.highlightLines = DIJKSTRA_CODE_LINES['check-neighbor'];

      steps.push({
        type: 'check-neighbor',
        node: current,
        neighbor,
        state: cloneVizState(state),
      });

      if (visited.has(neighbor)) {
        state = cloneVizState(state);
        state.edgeStates[ek] = 'default';
        state.note = `跳过：节点 ${neighbor} 已确定最短路`;
        state.highlightLines = DIJKSTRA_CODE_LINES['skip-visited'];

        steps.push({
          type: 'skip-visited',
          node: current,
          neighbor,
          state: cloneVizState(state),
        });
        continue;
      }

      const nd = (dist.get(current) ?? Infinity) + w;
      const old = dist.get(neighbor) ?? Infinity;

      if (nd < old) {
        const oldPrev = prev.get(neighbor);
        if (oldPrev !== undefined) {
          const oldEk = edgeKey(oldPrev, neighbor);
          state.edgeStates[oldEk] = 'default';
        }

        dist.set(neighbor, nd);
        prev.set(neighbor, current);
        if (!inQueue.has(neighbor)) {
          queue.push(neighbor);
          inQueue.add(neighbor);
        }

        state = cloneVizState(state);
        state.nodeStates[neighbor] = 'frontier';
        state.edgeStates[ek] = 'tree';
        state.queue = queueSnapshot(queue, dist);
        state.note = `松弛成功：dist[${neighbor}] = ${nd}；dist={${distNote(nodeIds, dist)}}`;
        state.highlightLines = DIJKSTRA_CODE_LINES['relax'];

        steps.push({
          type: 'relax',
          node: current,
          neighbor,
          state: cloneVizState(state),
        });
      } else {
        state = cloneVizState(state);
        state.edgeStates[ek] = 'default';
        state.note = `无需更新：dist[${neighbor}] 仍为 ${formatDist(old)}`;
        state.highlightLines = DIJKSTRA_CODE_LINES['no-relax'];

        steps.push({
          type: 'no-relax',
          node: current,
          neighbor,
          state: cloneVizState(state),
        });
      }
    }

    state = cloneVizState(state);
    state.nodeStates[current] = 'visited';
    state.note = `节点 ${current} 最短路已确定`;
  }

  state = cloneVizState(state);
  state.note = `Dijkstra 完成！dist={${distNote(nodeIds, dist)}}`;
  state.highlightLines = DIJKSTRA_CODE_LINES['finish'];

  steps.push({
    type: 'finish',
    state: cloneVizState(state),
  });

  return { steps };
}
