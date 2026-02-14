import type { TreeView, TreeTrace, TreeTraceStep, TreeVizState } from './types';
import { cloneTreeVizState, createInitialTreeVizState, findNode } from './utils';

export function generateLevelOrderTrace(tree: TreeView): TreeTrace {
  const steps: TreeTraceStep[] = [];
  const initialState = createInitialTreeVizState([tree]);
  const visited: number[] = [];

  function addStep(state: TreeVizState, type: string): void {
    steps.push({ type, state: cloneTreeVizState(state) });
  }

  const state = cloneTreeVizState(initialState);
  state.note = '🌲 开始层序遍历（BFS）';
  state.highlightLines = [1, 1];
  addStep(state, 'start');

  if (tree.root === null) {
    state.note = '❌ 树为空';
    addStep(state, 'empty');
    return { steps };
  }

  const queue: number[] = [tree.root];
  state.queue = [...queue];
  state.note = '📥 将根节点加入队列';
  state.highlightLines = [2, 2];
  addStep(state, 'init-queue');

  while (queue.length > 0) {
    state.highlightLines = [3, 3];
    state.note = `🔄 队列非空，继续遍历\n当前队列: [${queue.map((id) => findNode(tree, id)?.value).join(', ')}]`;
    addStep(state, 'check-queue');

    const nodeId = queue.shift()!;
    state.queue = [...queue];
    const node = findNode(tree, nodeId);
    if (!node) continue;

    state.nodeStates[tree.id][nodeId] = 'active';
    state.highlightLines = [4, 4];
    state.note = `📤 出队节点 ${node.value}`;
    addStep(state, 'dequeue');

    visited.push(node.value);
    state.nodeStates[tree.id][nodeId] = 'visited';
    state.note = `✅ 访问节点 ${node.value}\n已访问: [${visited.join(', ')}]`;
    state.highlightLines = [5, 5];
    addStep(state, 'visit');

    if (node.left !== null) {
      const leftNode = findNode(tree, node.left);
      if (leftNode && state.nodeStates[tree.id][node.left] === 'default') {
        queue.push(node.left);
        state.queue = [...queue];
        state.nodeStates[tree.id][node.left] = 'frontier';
        state.note = `⬅️ 将左子节点 ${leftNode.value} 加入队列`;
        state.highlightLines = [6, 6];
        addStep(state, 'enqueue-left');
      }
    }

    if (node.right !== null) {
      const rightNode = findNode(tree, node.right);
      if (rightNode && state.nodeStates[tree.id][node.right] === 'default') {
        queue.push(node.right);
        state.queue = [...queue];
        state.nodeStates[tree.id][node.right] = 'frontier';
        state.note = `➡️ 将右子节点 ${rightNode.value} 加入队列`;
        state.highlightLines = [7, 7];
        addStep(state, 'enqueue-right');
      }
    }
  }

  state.note = `🎉 层序遍历完成！\n结果: [${visited.join(', ')}]`;
  state.queue = [];
  state.highlightLines = undefined;
  addStep(state, 'complete');

  return { steps };
}
