import type { Graph, NodeId } from '../graph/types';
import { edgeKey } from '../graph/types';
import type { AlgorithmTrace, TraceStep } from '../trace/types';
import { cloneVizState, createInitialVizState } from '../trace/types';
import { FLOYD_CODE_LINES } from './floyd-code';

function formatDist(x: number): string {
  return Number.isFinite(x) ? String(x) : '∞';
}

function formatMatrix(nodeIds: NodeId[], dist: number[][]): string {
  const rows = nodeIds.map((id, i) => `${id}: ${nodeIds.map((_, j) => formatDist(dist[i]![j]!)).join(' ')}`);
  return rows.join(' | ');
}

export function generateFloydTrace(graph: Graph): AlgorithmTrace {
  const steps: TraceStep[] = [];
  const nodeIds = graph.nodes.map((n) => n.id).sort((a, b) => a - b);
  const edgeKeys = graph.edges.map((e) => edgeKey(e.u, e.v));

  let state = createInitialVizState(nodeIds, edgeKeys);

  const n = nodeIds.length;
  const index = new Map<NodeId, number>();
  nodeIds.forEach((id, i) => index.set(id, i));

  const dist: number[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => Infinity));
  for (let i = 0; i < n; i++) {
    dist[i]![i] = 0;
  }
  for (const e of graph.edges) {
    const iu = index.get(e.u);
    const iv = index.get(e.v);
    if (iu === undefined || iv === undefined) continue;
    dist[iu]![iv] = Math.min(dist[iu]![iv]!, e.w);
    dist[iv]![iu] = Math.min(dist[iv]![iu]!, e.w);
  }

  state = cloneVizState(state);
  state.note = `初始化完成。dist 矩阵：${formatMatrix(nodeIds, dist)}`;
  state.highlightLines = FLOYD_CODE_LINES.init;
  steps.push({ type: 'init', state: cloneVizState(state) });

  for (let kk = 0; kk < n; kk++) {
    const k = nodeIds[kk]!;
    state = cloneVizState(state);
    for (const id of nodeIds) state.nodeStates[id] = 'default';
    state.nodeStates[k] = 'selected';
    state.note = `选择中间点 k=${k}`;
    state.highlightLines = FLOYD_CODE_LINES.pickK;
    steps.push({ type: 'pick-k', node: k, state: cloneVizState(state) });

    for (let ii = 0; ii < n; ii++) {
      const i = nodeIds[ii]!;
      state = cloneVizState(state);
      state.nodeStates[i] = i === k ? 'selected' : 'frontier';
      state.highlightLines = FLOYD_CODE_LINES.pickI;
      state.note = `固定起点 i=${i}，尝试通过 k=${k} 优化`;
      steps.push({ type: 'pick-i', node: i, neighbor: k, state: cloneVizState(state) });

      for (let jj = 0; jj < n; jj++) {
        const j = nodeIds[jj]!;
        if (i === j) continue;

        state = cloneVizState(state);
        state.nodeStates[i] = i === k ? 'selected' : 'frontier';
        state.nodeStates[j] = j === k ? 'selected' : 'frontier';
        state.nodeStates[k] = 'selected';

        const ik = edgeKey(i, k);
        const kj = edgeKey(k, j);
        const ij = edgeKey(i, j);
        if (state.edgeStates[ik] !== undefined) state.edgeStates[ik] = 'checking';
        if (state.edgeStates[kj] !== undefined) state.edgeStates[kj] = 'checking';
        if (state.edgeStates[ij] !== undefined) state.edgeStates[ij] = 'checking';

        const nd = dist[ii]![kk]! + dist[kk]![jj]!;
        const old = dist[ii]![jj]!;

        state.note = `检查 i=${i}, j=${j}, k=${k}：${formatDist(dist[ii]![kk]!)} + ${formatDist(dist[kk]![jj]!)} vs ${formatDist(old)}`;
        state.highlightLines = FLOYD_CODE_LINES.check;
        steps.push({ type: 'check-pair', node: i, neighbor: j, state: cloneVizState(state) });

        if (nd < old) {
          dist[ii]![jj] = nd;
          state = cloneVizState(state);
          state.note = `更新 dist[${i}][${j}] = ${nd}`;
          state.highlightLines = FLOYD_CODE_LINES.relax;
          steps.push({ type: 'relax', node: i, neighbor: j, state: cloneVizState(state) });
        } else {
          state = cloneVizState(state);
          state.note = `不更新 dist[${i}][${j}]，保持 ${formatDist(old)}`;
          state.highlightLines = FLOYD_CODE_LINES.noRelax;
          steps.push({ type: 'no-relax', node: i, neighbor: j, state: cloneVizState(state) });
        }
      }
    }
  }

  state = cloneVizState(state);
  for (const id of nodeIds) state.nodeStates[id] = 'visited';
  state.note = `Floyd 完成。最终 dist：${formatMatrix(nodeIds, dist)}`;
  state.highlightLines = FLOYD_CODE_LINES.finish;
  steps.push({ type: 'finish', state: cloneVizState(state) });

  return { steps };
}
