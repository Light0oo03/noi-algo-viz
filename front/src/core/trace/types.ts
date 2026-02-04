/**
 * Trace 类型定义 - 用于记录算法执行的每一步
 */

import type { NodeId } from '../graph/types';

/** 节点可视化状态 */
export type NodeVizState = 'default' | 'visited' | 'selected' | 'frontier';

/** 边可视化状态 */
export type EdgeVizState = 'default' | 'checking' | 'tree';

/** 可视化状态快照 */
export interface VizState {
  nodeStates: Record<NodeId, NodeVizState>;
  edgeStates: Record<string, EdgeVizState>;
  queue: NodeId[];
  note: string;
  /** 当前高亮的代码行范围 [startLine, endLine]，行号从 1 开始 */
  highlightLines?: [number, number];
}

/** 通用步骤类型 */
export interface TraceStep {
  type: string;
  node?: NodeId;
  neighbor?: NodeId;
  state: VizState;
}

/** 通用 trace */
export interface AlgorithmTrace {
  steps: TraceStep[];
}

/** BFS 步骤类型 */
export type BfsStepType =
  | 'init'           // 初始化：起点入队
  | 'dequeue'        // 出队：取出队首节点
  | 'check-neighbor' // 检查邻居
  | 'enqueue'        // 入队：邻居入队
  | 'skip-visited'   // 跳过：已访问的邻居
  | 'finish';        // 结束

/** BFS 单步 trace */
export interface BfsStep extends TraceStep {
  type: BfsStepType;
  node?: NodeId;      // 当前处理的节点
  neighbor?: NodeId;  // 当前检查的邻居
  state: VizState;    // 这一步执行后的可视化状态
}

/** BFS 完整 trace */
export interface BfsTrace extends AlgorithmTrace {
  steps: BfsStep[];
}

/** DFS 步骤类型 */
export type DfsStepType =
  | 'init'           // 初始化：起点入栈
  | 'pop'            // 出栈：取出栈顶节点
  | 'check-neighbor' // 检查邻居
  | 'push'           // 入栈：邻居入栈
  | 'skip-visited'   // 跳过：已访问的邻居
  | 'finish';        // 结束

/** DFS 单步 trace */
export interface DfsStep extends TraceStep {
  type: DfsStepType;
  node?: NodeId;
  neighbor?: NodeId;
  state: VizState;
}

/** DFS 完整 trace */
export interface DfsTrace extends AlgorithmTrace {
  steps: DfsStep[];
}

/** Dijkstra 步骤类型 */
export type DijkstraStepType =
  | 'init'           // 初始化
  | 'extract-min'    // 取出最小距离节点
  | 'check-neighbor' // 检查邻居
  | 'relax'          // 松弛更新
  | 'no-relax'       // 未更新
  | 'skip-visited'   // 跳过已访问邻居
  | 'finish';        // 结束

/** Dijkstra 单步 trace */
export interface DijkstraStep extends TraceStep {
  type: DijkstraStepType;
  node?: NodeId;
  neighbor?: NodeId;
  state: VizState;
}

/** Dijkstra 完整 trace */
export interface DijkstraTrace extends AlgorithmTrace {
  steps: DijkstraStep[];
}

/** Prim 步骤类型 */
export type PrimStepType =
  | 'init'        // 初始化
  | 'pick-edge'   // 选取最小边
  | 'check-edge'  // 检查边
  | 'add-edge'    // 加入生成树
  | 'skip-edge'   // 跳过无效边
  | 'finish';     // 结束

/** Prim 单步 trace */
export interface PrimStep extends TraceStep {
  type: PrimStepType;
  node?: NodeId;
  neighbor?: NodeId;
  state: VizState;
}

/** Prim 完整 trace */
export interface PrimTrace extends AlgorithmTrace {
  steps: PrimStep[];
}

/** Kruskal 步骤类型 */
export type KruskalStepType =
  | 'init'       // 初始化
  | 'check-edge' // 检查边
  | 'add-edge'   // 加入生成树
  | 'skip-edge'  // 跳过成环边
  | 'finish';    // 结束

/** Kruskal 单步 trace */
export interface KruskalStep extends TraceStep {
  type: KruskalStepType;
  node?: NodeId;
  neighbor?: NodeId;
  state: VizState;
}

/** Kruskal 完整 trace */
export interface KruskalTrace extends AlgorithmTrace {
  steps: KruskalStep[];
}

/** 创建初始可视化状态 */
export function createInitialVizState(
  nodeIds: NodeId[],
  edgeKeys: string[]
): VizState {
  const nodeStates: Record<NodeId, NodeVizState> = {};
  for (const id of nodeIds) {
    nodeStates[id] = 'default';
  }

  const edgeStates: Record<string, EdgeVizState> = {};
  for (const key of edgeKeys) {
    edgeStates[key] = 'default';
  }

  return {
    nodeStates,
    edgeStates,
    queue: [],
    note: '准备开始遍历...',
  };
}

/** 深拷贝 VizState */
export function cloneVizState(state: VizState): VizState {
  return {
    nodeStates: { ...state.nodeStates },
    edgeStates: { ...state.edgeStates },
    queue: [...state.queue],
    note: state.note,
    highlightLines: state.highlightLines ? [...state.highlightLines] as [number, number] : undefined,
  };
}
