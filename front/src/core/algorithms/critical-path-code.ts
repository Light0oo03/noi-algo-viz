/**
 * 关键路径（AOE）代码模板
 * 说明：当前图为无向边编辑，演示时按节点编号定向（小 -> 大）
 */

export const CRITICAL_PATH_CODE_JS = `function criticalPath(edges, nodes) {
  const dag = orientByNodeId(edges);                     // 1
  const topo = topoOrder(dag, nodes);                    // 2
  const ve = Array(nodes.length).fill(0);                // 3
  for (const u of topo) {                                // 4
    for (const [v, w] of dag[u]) {                       // 5
      ve[v] = Math.max(ve[v], ve[u] + w);                // 6
    }
  }
  const T = Math.max(...ve);                             // 7
  const vl = Array(nodes.length).fill(T);                // 8
  for (let i = topo.length - 1; i >= 0; i--) {           // 9
    const u = topo[i];                                    // 10
    for (const [v, w] of dag[u]) {                       // 11
      vl[u] = Math.min(vl[u], vl[v] - w);                // 12
    }
  }
  return edges.filter(([u, v, w]) => ve[u] === vl[v] - w); // 13
}`;

export const CRITICAL_PATH_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 3] as [number, number],
  forwardNode: [4, 4] as [number, number],
  forwardEdge: [5, 6] as [number, number],
  initLatest: [7, 8] as [number, number],
  backwardNode: [9, 10] as [number, number],
  backwardEdge: [11, 12] as [number, number],
  collect: [13, 13] as [number, number],
};
