/**
 * Bellman-Ford 算法代码模板
 */

export const BELLMAN_FORD_CODE_JS = `function bellmanFord(edges, nodes, start) {
  const dist = new Map();                              // 1
  for (const v of nodes) dist.set(v, Infinity);        // 2
  dist.set(start, 0);                                  // 3

  for (let i = 1; i <= nodes.length - 1; i++) {        // 4
    let updated = false;                               // 5
    for (const [u, v, w] of edges) {                   // 6
      if (dist.get(u) + w < dist.get(v)) {             // 7
        dist.set(v, dist.get(u) + w);                  // 8
        updated = true;                                // 9
      }
      if (dist.get(v) + w < dist.get(u)) {             // 10
        dist.set(u, dist.get(v) + w);                  // 11
        updated = true;                                // 12
      }
    }
    if (!updated) break;                               // 13
  }

  return dist;                                         // 14
}`;

export const BELLMAN_FORD_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 3],
  round: [4, 5],
  checkEdge: [6, 7],
  relaxForward: [8, 9],
  checkReverse: [10, 10],
  relaxReverse: [11, 12],
  earlyStop: [13, 13],
  finish: [14, 14],
};
