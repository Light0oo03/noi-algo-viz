/**
 * 图的基础类型定义
 */

export type NodeId = number;

/** 图节点 */
export interface GraphNode {
  id: NodeId;
  x: number;
  y: number;
}

/** 图边（无向图，u < v 规范化存储） */
export interface GraphEdge {
  u: NodeId;
  v: NodeId;
  w: number; // 权重
}

/** 图结构 */
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** 边的唯一标识符（无向边：小端-大端） */
export function edgeKey(u: NodeId, v: NodeId): string {
  const a = Math.min(u, v);
  const b = Math.max(u, v);
  return `${a}-${b}`;
}

/** 从图构建邻接表 */
export function buildAdjList(graph: Graph): Map<NodeId, NodeId[]> {
  const adj = new Map<NodeId, NodeId[]>();

  // 初始化所有节点
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }

  // 添加边（无向图，双向添加）
  for (const edge of graph.edges) {
    adj.get(edge.u)!.push(edge.v);
    adj.get(edge.v)!.push(edge.u);
  }

  // 按 id 升序排列邻居（保证 BFS 遍历顺序一致）
  for (const [, neighbors] of adj) {
    neighbors.sort((a, b) => a - b);
  }

  return adj;
}
