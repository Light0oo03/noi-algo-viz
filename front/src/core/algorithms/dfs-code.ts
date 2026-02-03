/**
 * DFS 算法的代码模板 - 用于代码展示
 */

/** DFS JavaScript 代码 */
export const DFS_CODE_JS = `function dfs(graph, start) {
  const visited = new Set();
  const stack = [];
  
  // 初始化：起点入栈
  stack.push(start);
  visited.add(start);
  
  // DFS 主循环
  while (stack.length > 0) {
    // 出栈：取出栈顶节点
    const current = stack.pop();
    
    // 逆序遍历邻居，保证按 id 升序访问
    const neighbors = graph[current];
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      // 检查邻居是否已访问
      if (!visited.has(neighbor)) {
        // 未访问：标记并入栈
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  
  return visited;
}`;

/**
 * DFS 步骤类型对应的代码行范围
 * 行号从 1 开始
 */
export const DFS_CODE_LINES: Record<string, [number, number]> = {
  'init': [6, 7],            // stack.push(start); visited.add(start);
  'pop': [12, 12],           // const current = stack.pop();
  'check-neighbor': [16, 19],// for 循环 + if 判断
  'push': [21, 22],          // visited.add(neighbor); stack.push(neighbor);
  'skip-visited': [19, 19],  // if (!visited.has(neighbor)) - 条件不满足
  'finish': [27, 27],        // return visited;
};
