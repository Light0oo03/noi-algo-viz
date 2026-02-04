/**
 * Prim 算法的代码模板 - 用于代码展示
 */

/** Prim JavaScript 代码 */
export const PRIM_CODE_JS = `function prim(graph, start) {
  const visited = new Set();
  const pq = [];
  
  // 初始化
  visited.add(start);
  for (const [to, w] of graph[start]) {
    pq.push([start, to, w]);
  }
  
  // 主循环
  while (pq.length > 0) {
    const [u, v, w] = extractMinEdge(pq);
    if (visited.has(v)) continue;
    visited.add(v);
    
    for (const [to, w2] of graph[v]) {
      if (!visited.has(to)) {
        pq.push([v, to, w2]);
      }
    }
  }
}`;

/**
 * Prim 步骤类型对应的代码行范围
 * 行号从 1 开始
 */
export const PRIM_CODE_LINES: Record<string, [number, number]> = {
  'init': [6, 9],         // visited.add + push 起点边
  'pick-edge': [14, 14],  // extractMinEdge
  'check-edge': [15, 15], // if (visited.has(v)) continue;
  'add-edge': [16, 17],   // visited.add(v)
  'skip-edge': [15, 15],  // 访问过跳过
  'finish': [23, 23],     // 结束
};
