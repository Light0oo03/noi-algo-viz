/**
 * 拓扑排序（Kahn）代码模板
 * 说明：当前图为无向边可编辑，演示时按节点编号定向（小 -> 大）
 */

export const TOPOLOGICAL_SORT_CODE_JS = `function topoSort(edges, nodes) {
  const { adj, indeg } = buildDirectedByNodeId(edges, nodes); // 1
  const queue = nodes.filter((x) => indeg[x] === 0);          // 2
  const order = [];                                            // 3
  while (queue.length) {                                       // 4
    const u = queue.shift();                                   // 5
    order.push(u);                                             // 6
    for (const v of adj[u]) {                                  // 7
      indeg[v]--;                                              // 8
      if (indeg[v] === 0) queue.push(v);                       // 9
    }
  }
  return order.length === nodes.length ? order : null;         // 10
}`;

export const TOPOLOGICAL_SORT_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 3],
  loop: [4, 4],
  dequeue: [5, 6],
  checkNeighbor: [7, 8],
  enqueue: [9, 9],
  finish: [10, 10],
};
