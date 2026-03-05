import type { Graph, NodeId } from '../graph/types';
import { edgeKey } from '../graph/types';
import type { AlgorithmTrace, TraceStep } from '../trace/types';
import { cloneVizState, createInitialVizState } from '../trace/types';
import { BELLMAN_FORD_CODE_LINES } from './bellman-ford-code';

function formatDist(value: number): string {
  return Number.isFinite(value) ? String(value) : '∞';
}

function distNote(nodeIds: NodeId[], dist: Map<NodeId, number>): string {
  return nodeIds
    .map((id) => `${id}:${formatDist(dist.get(id) ?? Infinity)}`)
    .join(' ');
}

export function generateBellmanFordTrace(graph: Graph, start: NodeId): AlgorithmTrace {
  const steps: TraceStep[] = [];
  const nodeIds = graph.nodes.map((n) => n.id).sort((a, b) => a - b);
  const edgeKeys = graph.edges.map((e) => edgeKey(e.u, e.v));

  let state = createInitialVizState(nodeIds, edgeKeys);
  const dist = new Map<NodeId, number>();

  for (const id of nodeIds) dist.set(id, Infinity);
  dist.set(start, 0);

  state = cloneVizState(state);
  state.nodeStates[start] = 'frontier';
  state.note = `初始化：起点 ${start} 距离=0；dist={${distNote(nodeIds, dist)}}`;
  state.highlightLines = BELLMAN_FORD_CODE_LINES.init;
  steps.push({ type: 'init', node: start, state: cloneVizState(state) });

  const rounds = Math.max(0, nodeIds.length - 1);
  for (let i = 1; i <= rounds; i++) {
    let updated = false;

    state = cloneVizState(state);
    state.note = `第 ${i} 轮松弛开始`;
    state.highlightLines = BELLMAN_FORD_CODE_LINES.round;
    steps.push({ type: 'round', state: cloneVizState(state) });

    for (const e of graph.edges) {
      const ek = edgeKey(e.u, e.v);
      const du = dist.get(e.u) ?? Infinity;
      const dv = dist.get(e.v) ?? Infinity;

      state = cloneVizState(state);
      state.nodeStates[e.u] = 'selected';
      state.nodeStates[e.v] = 'selected';
      if (state.edgeStates[ek] !== undefined) state.edgeStates[ek] = 'checking';
      state.note = `检查边 (${e.u}, ${e.v}, w=${e.w})`;
      state.highlightLines = BELLMAN_FORD_CODE_LINES.checkEdge;
      steps.push({ type: 'check-edge', node: e.u, neighbor: e.v, state: cloneVizState(state) });

      if (du + e.w < dv) {
        dist.set(e.v, du + e.w);
        updated = true;

        state = cloneVizState(state);
        state.nodeStates[e.v] = 'frontier';
        if (state.edgeStates[ek] !== undefined) state.edgeStates[ek] = 'tree';
        state.note = `更新 dist[${e.v}] = ${du + e.w}；dist={${distNote(nodeIds, dist)}}`;
        state.highlightLines = BELLMAN_FORD_CODE_LINES.relaxForward;
        steps.push({ type: 'relax-forward', node: e.u, neighbor: e.v, state: cloneVizState(state) });
      }

      state = cloneVizState(state);
      state.highlightLines = BELLMAN_FORD_CODE_LINES.checkReverse;
      steps.push({ type: 'check-reverse', node: e.v, neighbor: e.u, state: cloneVizState(state) });

      const du2 = dist.get(e.u) ?? Infinity;
      const dv2 = dist.get(e.v) ?? Infinity;
      if (dv2 + e.w < du2) {
        dist.set(e.u, dv2 + e.w);
        updated = true;

        state = cloneVizState(state);
        state.nodeStates[e.u] = 'frontier';
        if (state.edgeStates[ek] !== undefined) state.edgeStates[ek] = 'tree';
        state.note = `更新 dist[${e.u}] = ${dv2 + e.w}；dist={${distNote(nodeIds, dist)}}`;
        state.highlightLines = BELLMAN_FORD_CODE_LINES.relaxReverse;
        steps.push({ type: 'relax-reverse', node: e.v, neighbor: e.u, state: cloneVizState(state) });
      }

      state = cloneVizState(state);
      state.nodeStates[e.u] = 'default';
      state.nodeStates[e.v] = 'default';
      if (state.edgeStates[ek] === 'checking') state.edgeStates[ek] = 'default';
    }

    if (!updated) {
      state = cloneVizState(state);
      state.note = `第 ${i} 轮无更新，提前结束`;
      state.highlightLines = BELLMAN_FORD_CODE_LINES.earlyStop;
      steps.push({ type: 'early-stop', state: cloneVizState(state) });
      break;
    }
  }

  state = cloneVizState(state);
  for (const id of nodeIds) {
    state.nodeStates[id] = Number.isFinite(dist.get(id) ?? Infinity) ? 'visited' : 'default';
  }
  state.note = `Bellman-Ford 完成！dist={${distNote(nodeIds, dist)}}`;
  state.highlightLines = BELLMAN_FORD_CODE_LINES.finish;
  steps.push({ type: 'finish', state: cloneVizState(state) });

  return { steps };
}
