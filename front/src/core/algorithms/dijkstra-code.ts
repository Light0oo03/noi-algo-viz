/**
 * Dijkstra 算法的代码模板 - 用于代码展示
 */

/** Dijkstra JavaScript 代码 */
export const DIJKSTRA_CODE_JS = `function dijkstra(graph, start) {
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  const pq = [];
  
  // 初始化
  for (const node of Object.keys(graph)) {
    dist.set(Number(node), Infinity);
  }
  dist.set(start, 0);
  pq.push(start);
  
  // 主循环
  while (pq.length > 0) {
    const u = extractMin(pq, dist);
    if (visited.has(u)) continue;
    visited.add(u);
    
    for (const [v, w] of graph[u]) {
      if (visited.has(v)) continue;
      const nd = dist.get(u) + w;
      if (nd < dist.get(v)) {
        dist.set(v, nd);
        prev.set(v, u);
        pq.push(v);
      }
    }
  }
  
  return dist;
}`;

/**
 * Dijkstra 步骤类型对应的代码行范围
 * 行号从 1 开始
 */
export const DIJKSTRA_CODE_LINES: Record<string, [number, number]> = {
  'init': [8, 12],           // dist 初始化 + dist.set(start,0) + pq.push
  'extract-min': [16, 16],   // const u = extractMin(...)
  'check-neighbor': [21, 23],// for 循环 + visited 判断 + nd
  'relax': [24, 27],         // dist.set/prev.set/pq.push
  'no-relax': [24, 24],      // if (nd < dist.get(v)) - 条件不满足
  'skip-visited': [22, 22],  // if (visited.has(v)) continue;
  'finish': [30, 30],        // return dist;
};
