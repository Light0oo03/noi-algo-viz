/**
 * Floyd-Warshall 算法代码模板
 */

export const FLOYD_CODE_JS = `function floydWarshall(graph, nodes) {
  const dist = initDistance(graph, nodes);             // 1
  for (const k of nodes) {                             // 2
    for (const i of nodes) {                           // 3
      for (const j of nodes) {                         // 4
        const nd = dist[i][k] + dist[k][j];            // 5
        if (nd < dist[i][j]) {                         // 6
          dist[i][j] = nd;                             // 7
        }
      }
    }
  }
  return dist;                                         // 8
}`;

export const FLOYD_CODE_LINES: Record<string, [number, number]> = {
  init: [1, 1],
  pickK: [2, 2],
  pickI: [3, 3],
  pickJ: [4, 4],
  check: [5, 6],
  relax: [7, 7],
  noRelax: [6, 6],
  finish: [8, 8],
};
