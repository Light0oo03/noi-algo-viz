/**
 * BFS 算法的代码模板 - 用于代码展示
 */

/** BFS JavaScript 代码 */
export const BFS_CODE_JS = `function bfs(graph, start) {
  const visited = new Set();
  const queue = [];
  
  // 初始化：起点入队
  queue.push(start);
  visited.add(start);
  
  // BFS 主循环
  while (queue.length > 0) {
    // 出队：取出队首节点
    const current = queue.shift();
    
    // 遍历当前节点的所有邻居
    for (const neighbor of graph[current]) {
      // 检查邻居是否已访问
      if (!visited.has(neighbor)) {
        // 未访问：标记并入队
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return visited;
}`;

/**
 * BFS 步骤类型对应的代码行范围
 * 行号从 1 开始
 */
export const BFS_CODE_LINES: Record<string, [number, number]> = {
  'init': [10, 12],           // queue.push(start); visited.add(start);
  'dequeue': [16, 17],        // const current = queue.shift();
  'check-neighbor': [20, 21], // for 循环 + if 判断
  'enqueue': [23, 25],        // visited.add(neighbor); queue.push(neighbor);
  'skip-visited': [21, 21],   // if (!visited.has(neighbor)) - 条件不满足
  'finish': [29, 29],         // return visited;
};
