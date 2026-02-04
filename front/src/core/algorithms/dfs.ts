/**
 * DFS 算法实现 - 生成可视化 trace
 */

import type { Graph, NodeId } from '../graph/types';
import { buildAdjList, edgeKey } from '../graph/types';
import type { DfsStep, DfsTrace } from '../trace/types';
import { cloneVizState, createInitialVizState } from '../trace/types';
import { DFS_CODE_LINES } from './dfs-code';

/**
 * 生成 DFS 遍历的 trace（使用显式栈）
 * @param graph 图结构
 * @param start 起点节点 id
 * @returns DFS trace（包含每一步的状态快照）
 */
export function generateDfsTrace(graph: Graph, start: NodeId): DfsTrace {
  const steps: DfsStep[] = [];
  const adj = buildAdjList(graph);

  // 收集所有节点 id 和边 key
  const nodeIds = graph.nodes.map((n) => n.id);
  const edgeKeys = graph.edges.map((e) => edgeKey(e.u, e.v));

  // 初始状态
  let state = createInitialVizState(nodeIds, edgeKeys);

  // visited 集合
  const visited = new Set<NodeId>();

  // DFS 栈
  const stack: NodeId[] = [];

  // ========== Step 1: 初始化 - 起点入栈 ==========
  stack.push(start);
  visited.add(start);

  state = cloneVizState(state);
  state.nodeStates[start] = 'frontier';
  state.queue = [...stack];
  state.note = `初始化：将起点 ${start} 入栈，标记为已发现`;
  state.highlightLines = DFS_CODE_LINES['init'];

  steps.push({
    type: 'init',
    node: start,
    state: cloneVizState(state),
  });

  // ========== Step 2+: DFS 主循环 ==========
  while (stack.length > 0) {
    const current = stack.pop()!;

    // --- 出栈步骤 ---
    state = cloneVizState(state);
    state.nodeStates[current] = 'selected';
    state.queue = [...stack];
    state.note = `出栈：取出节点 ${current}，开始处理`;
    state.highlightLines = DFS_CODE_LINES['pop'];

    steps.push({
      type: 'pop',
      node: current,
      state: cloneVizState(state),
    });

    // --- 遍历邻居（逆序入栈保证访问顺序） ---
    const neighbors = adj.get(current) ?? [];
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      if (neighbor === undefined) continue;
      const ek = edgeKey(current, neighbor);

      // 检查邻居步骤
      state = cloneVizState(state);
      state.edgeStates[ek] = 'checking';
      state.note = `检查边 (${current}, ${neighbor})：邻居节点 ${neighbor}`;
      state.highlightLines = DFS_CODE_LINES['check-neighbor'];

      steps.push({
        type: 'check-neighbor',
        node: current,
        neighbor,
        state: cloneVizState(state),
      });

      if (visited.has(neighbor)) {
        // 已访问，跳过
        state = cloneVizState(state);
        state.edgeStates[ek] = 'default';
        state.note = `跳过：节点 ${neighbor} 已访问过`;
        state.highlightLines = DFS_CODE_LINES['skip-visited'];

        steps.push({
          type: 'skip-visited',
          node: current,
          neighbor,
          state: cloneVizState(state),
        });
      } else {
        // 未访问，入栈
        visited.add(neighbor);
        stack.push(neighbor);

        state = cloneVizState(state);
        state.nodeStates[neighbor] = 'frontier';
        state.edgeStates[ek] = 'tree';
        state.queue = [...stack];
        state.note = `入栈：将节点 ${neighbor} 加入栈，边 (${current}, ${neighbor}) 成为树边`;
        state.highlightLines = DFS_CODE_LINES['push'];

        steps.push({
          type: 'push',
          node: current,
          neighbor,
          state: cloneVizState(state),
        });
      }
    }

    // --- 当前节点处理完毕，标记为已访问 ---
    state = cloneVizState(state);
    state.nodeStates[current] = 'visited';
    state.note = `节点 ${current} 处理完毕，标记为已访问`;

    // 注意：这里不单独生成 step，直接在下一轮 pop 或 finish 时体现
  }

  // ========== 结束步骤 ==========
  state = cloneVizState(state);
  state.note = `DFS 遍历完成！共访问 ${visited.size} 个节点`;
  state.highlightLines = DFS_CODE_LINES['finish'];

  steps.push({
    type: 'finish',
    state: cloneVizState(state),
  });

  return { steps };
}
