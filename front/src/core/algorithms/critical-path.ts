import type { Graph, NodeId } from '../graph/types';
import { edgeKey } from '../graph/types';
import type { AlgorithmTrace, TraceStep } from '../trace/types';
import { cloneVizState, createInitialVizState } from '../trace/types';
import { CRITICAL_PATH_CODE_LINES } from './critical-path-code';

type DEdge = { u: NodeId; v: NodeId; w: number };

function orientByNodeId(graph: Graph): DEdge[] {
  return graph.edges.map((e) => ({ u: Math.min(e.u, e.v), v: Math.max(e.u, e.v), w: e.w }));
}

function orientByInput(graph: Graph, directed: DEdge[]): DEdge[] {
  const nodeSet = new Set(graph.nodes.map((n) => n.id));
  const cleaned: DEdge[] = [];
  for (const e of directed) {
    if (!nodeSet.has(e.u) || !nodeSet.has(e.v) || e.u === e.v) continue;
    cleaned.push({ u: e.u, v: e.v, w: e.w });
  }
  return cleaned;
}

function topoByNodeId(nodeIds: NodeId[]): NodeId[] {
  return [...nodeIds].sort((a, b) => a - b);
}

function idxMap(nodeIds: NodeId[]): Map<NodeId, number> {
  const map = new Map<NodeId, number>();
  nodeIds.forEach((id, i) => map.set(id, i));
  return map;
}

function formatTimes(nodeIds: NodeId[], arr: number[]): string {
  return nodeIds.map((id, i) => `${id}:${arr[i] ?? 0}`).join(' ');
}

export function generateCriticalPathTrace(graph: Graph, directedInput?: DEdge[]): AlgorithmTrace {
  const steps: TraceStep[] = [];
  const nodeIds = graph.nodes.map((n) => n.id).sort((a, b) => a - b);
  const edgeKeys = graph.edges.map((e) => edgeKey(e.u, e.v));
  let state = createInitialVizState(nodeIds, edgeKeys);

  const directedEdges = directedInput && directedInput.length > 0
    ? orientByInput(graph, directedInput)
    : orientByNodeId(graph);
  const topo = topoByNodeId(nodeIds);
  const idToIndex = idxMap(nodeIds);
  const ve = Array(nodeIds.length).fill(0);

  state = cloneVizState(state);
  state.note = directedInput && directedInput.length > 0
    ? '初始化：使用自定义有向边，开始计算 ve（最早发生时间）'
    : '初始化：按小编号->大编号定向，开始计算 ve（最早发生时间）';
  state.highlightLines = CRITICAL_PATH_CODE_LINES.init;
  steps.push({ type: 'init', state: cloneVizState(state) });

  for (const u of topo) {
    state = cloneVizState(state);
    state.nodeStates[u] = 'selected';
    state.highlightLines = CRITICAL_PATH_CODE_LINES.forwardNode;
    state.note = `前向阶段：处理节点 ${u}`;
    steps.push({ type: 'forward-node', node: u, state: cloneVizState(state) });

    const uIdx = idToIndex.get(u);
    if (uIdx === undefined) continue;

    for (const e of directedEdges) {
      if (e.u !== u) continue;
      const vIdx = idToIndex.get(e.v);
      if (vIdx === undefined) continue;

      const ek = edgeKey(e.u, e.v);
      state = cloneVizState(state);
      if (state.edgeStates[ek] !== undefined) state.edgeStates[ek] = 'checking';
      state.nodeStates[e.v] = 'frontier';
      state.highlightLines = CRITICAL_PATH_CODE_LINES.forwardEdge;
      state.note = `检查边 ${e.u}->${e.v}(w=${e.w})：ve[${e.v}] = max(${ve[vIdx]}, ${ve[uIdx]}+${e.w})`;
      steps.push({ type: 'forward-edge', node: e.u, neighbor: e.v, state: cloneVizState(state) });

      ve[vIdx] = Math.max(ve[vIdx], ve[uIdx] + e.w);

      state = cloneVizState(state);
      state.note = `更新后 ve：${formatTimes(nodeIds, ve)}`;
      steps.push({ type: 'forward-relax', node: e.u, neighbor: e.v, state: cloneVizState(state) });
    }

    state = cloneVizState(state);
    state.nodeStates[u] = 'visited';
  }

  const projectTime = ve.length > 0 ? Math.max(...ve) : 0;
  const vl = Array(nodeIds.length).fill(projectTime);

  state = cloneVizState(state);
  state.note = `前向完成，工期 T=${projectTime}。初始化 vl 为 T。`;
  state.highlightLines = CRITICAL_PATH_CODE_LINES.initLatest;
  steps.push({ type: 'init-latest', state: cloneVizState(state) });

  for (let ti = topo.length - 1; ti >= 0; ti--) {
    const u = topo[ti]!;
    const uIdx = idToIndex.get(u);
    if (uIdx === undefined) continue;

    state = cloneVizState(state);
    state.nodeStates[u] = 'selected';
    state.highlightLines = CRITICAL_PATH_CODE_LINES.backwardNode;
    state.note = `后向阶段：处理节点 ${u}`;
    steps.push({ type: 'backward-node', node: u, state: cloneVizState(state) });

    for (const e of directedEdges) {
      if (e.u !== u) continue;
      const vIdx = idToIndex.get(e.v);
      if (vIdx === undefined) continue;

      const ek = edgeKey(e.u, e.v);
      state = cloneVizState(state);
      if (state.edgeStates[ek] !== undefined) state.edgeStates[ek] = 'checking';
      state.highlightLines = CRITICAL_PATH_CODE_LINES.backwardEdge;
      state.note = `检查边 ${e.u}->${e.v}(w=${e.w})：vl[${u}] = min(${vl[uIdx]}, ${vl[vIdx]}-${e.w})`;
      steps.push({ type: 'backward-edge', node: e.u, neighbor: e.v, state: cloneVizState(state) });

      vl[uIdx] = Math.min(vl[uIdx], vl[vIdx] - e.w);

      state = cloneVizState(state);
      state.note = `更新后 vl：${formatTimes(nodeIds, vl)}`;
      steps.push({ type: 'backward-relax', node: e.u, neighbor: e.v, state: cloneVizState(state) });
    }

    state = cloneVizState(state);
    state.nodeStates[u] = 'visited';
  }

  const criticalEdges: string[] = [];
  for (const e of directedEdges) {
    const uIdx = idToIndex.get(e.u);
    const vIdx = idToIndex.get(e.v);
    if (uIdx === undefined || vIdx === undefined) continue;
    if (ve[uIdx] === vl[vIdx] - e.w) {
      criticalEdges.push(edgeKey(e.u, e.v));
    }
  }

  state = cloneVizState(state);
  for (const k of criticalEdges) {
    if (state.edgeStates[k] !== undefined) state.edgeStates[k] = 'tree';
  }
  state.note = `关键路径完成。ve={${formatTimes(nodeIds, ve)}}；vl={${formatTimes(nodeIds, vl)}}；关键边=${criticalEdges.join(', ') || '无'}`;
  state.highlightLines = CRITICAL_PATH_CODE_LINES.collect;
  steps.push({ type: 'finish', state: cloneVizState(state) });

  return { steps };
}
