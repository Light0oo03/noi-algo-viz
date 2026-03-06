import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Graph } from '../core/graph/types';

/** 默认图结构 */
const DEFAULT_GRAPH: Graph = {
  nodes: [
    { id: 0, x: 450, y: 170 },
    { id: 1, x: 290, y: 280 },
    { id: 2, x: 610, y: 280 },
    { id: 3, x: 170, y: 430 },
    { id: 4, x: 360, y: 430 },
    { id: 5, x: 540, y: 430 },
    { id: 6, x: 730, y: 430 },
  ],
  edges: [
    { u: 0, v: 1, w: 1 },
    { u: 0, v: 2, w: 1 },
    { u: 1, v: 3, w: 1 },
    { u: 1, v: 4, w: 1 },
    { u: 2, v: 5, w: 1 },
    { u: 2, v: 6, w: 1 },
  ],
};

export type UpdateGraphHistoryMode = 'push' | 'replace' | 'none' | 'checkpoint';
export interface UpdateGraphOptions {
  history?: UpdateGraphHistoryMode;
}

const MAX_HISTORY = 200;

function cloneGraph(g: Graph): Graph {
  return {
    nodes: g.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
    edges: g.edges.map((e) => ({ u: e.u, v: e.v, w: e.w })),
  };
}

function graphSignature(g: Graph): string {
  const nodes = g.nodes
    .map((n) => `${n.id}:${Math.round(n.x * 1000) / 1000},${Math.round(n.y * 1000) / 1000}`)
    .join('|');
  const edges = g.edges.map((e) => `${e.u}-${e.v}:${e.w}`).join('|');
  return `n=${nodes};e=${edges}`;
}

export const useGraphStore = defineStore(
  'graph',
  () => {
    // 图数据
    const graph = ref<Graph>(structuredClone(DEFAULT_GRAPH));

    const past = ref<Graph[]>([]);
    const future = ref<Graph[]>([]);

    function pushPastSnapshot() {
      const current = graph.value;
      const last = past.value[past.value.length - 1];
      if (last && graphSignature(last) === graphSignature(current)) return;
      past.value.push(cloneGraph(current));
      if (past.value.length > MAX_HISTORY) {
        past.value.shift();
      }
    }

    // 更新图
    function updateGraph(newGraph: Graph, options?: UpdateGraphOptions) {
      const mode: UpdateGraphHistoryMode = options?.history ?? 'push';
      const rawNew = cloneGraph(newGraph);

      if (mode === 'checkpoint') {
        pushPastSnapshot();
        future.value = [];
        return;
      }

      if (mode === 'replace' || mode === 'none') {
        graph.value = rawNew;
        return;
      }

      const sigChanged = graphSignature(rawNew) !== graphSignature(graph.value);
      if (sigChanged) {
        pushPastSnapshot();
        future.value = [];
      }
      graph.value = rawNew;
    }

    function undo(): boolean {
      if (past.value.length === 0) return false;
      const prev = past.value.pop()!;
      future.value.push(cloneGraph(graph.value));
      graph.value = cloneGraph(prev);
      return true;
    }

    function redo(): boolean {
      if (future.value.length === 0) return false;
      const next = future.value.pop()!;
      past.value.push(cloneGraph(graph.value));
      graph.value = cloneGraph(next);
      return true;
    }

    function clearHistory() {
      past.value = [];
      future.value = [];
    }

    // 重置为默认图
    function resetGraph() {
      clearHistory();
      graph.value = structuredClone(DEFAULT_GRAPH);
    }

    return {
      graph,
      updateGraph,
      undo,
      redo,
      resetGraph,
    };
  },
  {
    persist: {
      key: 'noi-algo-viz-graph',
      storage: localStorage,
    },
  }
);
