/**
 * Kruskal 算法的代码模板 - 用于代码展示
 */

/** Kruskal JavaScript 代码 */
export const KRUSKAL_CODE_JS = `function kruskal(edges, n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = Array(n).fill(0);
  
  edges.sort((a, b) => a.w - b.w);
  
  for (const e of edges) {
    const ru = find(parent, e.u);
    const rv = find(parent, e.v);
    if (ru === rv) continue;
    union(parent, rank, ru, rv);
    // 选择边 e
  }
}`;

/**
 * Kruskal 步骤类型对应的代码行范围
 * 行号从 1 开始
 */
export const KRUSKAL_CODE_LINES: Record<string, [number, number]> = {
  'init': [2, 6],        // parent/rank 初始化 + sort
  'check-edge': [9, 11], // find + if 判断
  'add-edge': [12, 13],  // union + 选择边
  'skip-edge': [11, 11], // ru === rv
  'finish': [14, 14],    // 结束
};
