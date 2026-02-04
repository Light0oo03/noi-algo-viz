/**
 * Kruskal 算法实现 - 生成可视化 trace（最小生成树）
 */

import type { Graph, NodeId } from '../graph/types';
import { edgeKey } from '../graph/types';
import type { KruskalStep, KruskalTrace } from '../trace/types';
import { cloneVizState, createInitialVizState } from '../trace/types';
import { KRUSKAL_CODE_LINES } from './kruskal-code';

type DSU = {
  parent: Map<NodeId, NodeId>;
  rank: Map<NodeId, number>;
};

function makeSet(nodeIds: NodeId[]): DSU {
  const parent = new Map<NodeId, NodeId>();
  const rank = new Map<NodeId, number>();
  for (const id of nodeIds) {
    parent.set(id, id);
    rank.set(id, 0);
  }
  return { parent, rank };
}

function findSet(dsu: DSU, x: NodeId): NodeId {
  const p = dsu.parent.get(x);
  if (p === undefined || p === x) return x;
  const root = findSet(dsu, p);
  dsu.parent.set(x, root);
  return root;
}

function unionSet(dsu: DSU, a: NodeId, b: NodeId) {
  const ra = findSet(dsu, a);
  const rb = findSet(dsu, b);
  if (ra === rb) return;
  const rka = dsu.rank.get(ra) ?? 0;
  const rkb = dsu.rank.get(rb) ?? 0;
  if (rka < rkb) {
    dsu.parent.set(ra, rb);
  } else if (rka > rkb) {
    dsu.parent.set(rb, ra);
  } else {
    dsu.parent.set(rb, ra);
    dsu.rank.set(ra, rka + 1);
  }
}

/**
 * 生成 Kruskal 遍历的 trace
 * @param graph 图结构
 * @returns Kruskal trace（包含每一步的状态快照）
 */
export function generateKruskalTrace(graph: Graph): KruskalTrace {
  const steps: KruskalStep[] = [];

  // 收集所有节点 id 和边 key
  const nodeIds = graph.nodes.map((n) => n.id);
  const edgeKeys = graph.edges.map((e) => edgeKey(e.u, e.v));

  // 初始状态
  let state = createInitialVizState(nodeIds, edgeKeys);

  const dsu = makeSet(nodeIds);
  const edges = [...graph.edges].sort((a, b) => {
    if (a.w !== b.w) return a.w - b.w;
    if (a.u !== b.u) return a.u - b.u;
    return a.v - b.v;
  });

  state = cloneVizState(state);
  state.note = `初始化：对边按权重排序，共 ${edges.length} 条边`;
  state.highlightLines = KRUSKAL_CODE_LINES['init'];

  steps.push({
    type: 'init',
    state: cloneVizState(state),
  });

  for (const e of edges) {
    const ek = edgeKey(e.u, e.v);

    state = cloneVizState(state);
    state.edgeStates[ek] = 'checking';
    state.nodeStates[e.u] = 'selected';
    state.nodeStates[e.v] = 'selected';
    state.note = `检查边 (${e.u}, ${e.v})，权重=${e.w}`;
    state.highlightLines = KRUSKAL_CODE_LINES['check-edge'];

    steps.push({
      type: 'check-edge',
      node: e.u,
      neighbor: e.v,
      state: cloneVizState(state),
    });

    const ru = findSet(dsu, e.u);
    const rv = findSet(dsu, e.v);

    if (ru === rv) {
      state = cloneVizState(state);
      state.edgeStates[ek] = 'default';
      state.nodeStates[e.u] = 'visited';
      state.nodeStates[e.v] = 'visited';
      state.note = `跳过：边 (${e.u}, ${e.v}) 会形成环`;
      state.highlightLines = KRUSKAL_CODE_LINES['skip-edge'];

      steps.push({
        type: 'skip-edge',
        node: e.u,
        neighbor: e.v,
        state: cloneVizState(state),
      });
      continue;
    }

    unionSet(dsu, ru, rv);
    state = cloneVizState(state);
    state.edgeStates[ek] = 'tree';
    state.nodeStates[e.u] = 'visited';
    state.nodeStates[e.v] = 'visited';
    state.note = `选择边 (${e.u}, ${e.v}) 进入最小生成树`;
    state.highlightLines = KRUSKAL_CODE_LINES['add-edge'];

    steps.push({
      type: 'add-edge',
      node: e.u,
      neighbor: e.v,
      state: cloneVizState(state),
    });
  }

  state = cloneVizState(state);
  state.note = 'Kruskal 完成！';
  state.highlightLines = KRUSKAL_CODE_LINES['finish'];

  steps.push({
    type: 'finish',
    state: cloneVizState(state),
  });

  return { steps };
}
