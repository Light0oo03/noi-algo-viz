import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Graph } from '../core/graph/types';

/** 默认图结构 */
const DEFAULT_GRAPH: Graph = {
  nodes: [
    { id: 0, x: 120, y: 120 },
    { id: 1, x: 280, y: 180 },
    { id: 2, x: 200, y: 300 },
  ],
  edges: [
    { u: 0, v: 1, w: 1 },
    { u: 1, v: 2, w: 1 },
  ],
};

export const useGraphStore = defineStore(
  'graph',
  () => {
    // 图数据
    const graph = ref<Graph>(structuredClone(DEFAULT_GRAPH));

    // 更新图
    function updateGraph(newGraph: Graph) {
      graph.value = newGraph;
    }

    // 重置为默认图
    function resetGraph() {
      graph.value = structuredClone(DEFAULT_GRAPH);
    }

    return {
      graph,
      updateGraph,
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
