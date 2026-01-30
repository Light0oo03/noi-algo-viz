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

/** BFS 步骤类型 */
export type BfsStepType =
  | 'init'           // 初始化：起点入队
  | 'dequeue'        // 出队：取出队首节点
  | 'check-neighbor' // 检查邻居
  | 'enqueue'        // 入队：邻居入队
  | 'skip-visited'   // 跳过：已访问的邻居
  | 'finish';        // 结束

/** BFS 单步 trace */
export interface BfsStep {
  type: BfsStepType;
  node?: NodeId;      // 当前处理的节点
  neighbor?: NodeId;  // 当前检查的邻居
  state: VizState;    // 这一步执行后的可视化状态
}

/** BFS 完整 trace */
export interface BfsTrace {
  steps: BfsStep[];
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
    note: '准备开始 BFS...',
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
