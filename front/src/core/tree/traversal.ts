import type { TreeView, TreeTrace, TreeTraceStep, TreeVizState } from './types';
import { cloneTreeVizState, createInitialTreeVizState, findNode } from './utils';

export function generateTraversalTrace(
  tree: TreeView,
  mode: 'preorder' | 'inorder' | 'postorder'
): TreeTrace {
  const steps: TreeTraceStep[] = [];
  const initialState = createInitialTreeVizState([tree]);
  const visited: number[] = [];

  function addStep(state: TreeVizState, type: string): void {
    steps.push({ type, state: cloneTreeVizState(state) });
  }

  function preorder(nodeId: number | null, state: TreeVizState): void {
    if (nodeId === null) return;
    const nodeStates = state.nodeStates[tree.id];
    if (!nodeStates) return;

    const node = findNode(tree, nodeId);
    if (!node) return;

    nodeStates[nodeId] = 'active';
    state.note = `🔍 访问节点 ${node.value}`;
    state.highlightLines = [2, 2];
    addStep(state, 'visit');

    visited.push(node.value);
    nodeStates[nodeId] = 'visited';
    state.note = `✅ 已访问: [${visited.join(', ')}]`;
    addStep(state, 'mark-visited');

    if (node.left !== null) {
      state.highlightLines = [3, 3];
      state.note = `⬅️ 遍历左子树`;
      addStep(state, 'go-left');
      preorder(node.left, state);
    }

    if (node.right !== null) {
      state.highlightLines = [4, 4];
      state.note = `➡️ 遍历右子树`;
      addStep(state, 'go-right');
      preorder(node.right, state);
    }
  }

  function inorder(nodeId: number | null, state: TreeVizState): void {
    if (nodeId === null) return;
    const nodeStates = state.nodeStates[tree.id];
    if (!nodeStates) return;

    const node = findNode(tree, nodeId);
    if (!node) return;

    nodeStates[nodeId] = 'active';
    state.note = `🔍 到达节点 ${node.value}`;
    addStep(state, 'reach');

    if (node.left !== null) {
      state.highlightLines = [2, 2];
      state.note = `⬅️ 先遍历左子树`;
      addStep(state, 'go-left');
      inorder(node.left, state);
    }

    state.highlightLines = [3, 3];
    state.note = `📍 访问节点 ${node.value}`;
    addStep(state, 'visit');

    visited.push(node.value);
    nodeStates[nodeId] = 'visited';
    state.note = `✅ 已访问: [${visited.join(', ')}]`;
    addStep(state, 'mark-visited');

    if (node.right !== null) {
      state.highlightLines = [4, 4];
      state.note = `➡️ 再遍历右子树`;
      addStep(state, 'go-right');
      inorder(node.right, state);
    }
  }

  function postorder(nodeId: number | null, state: TreeVizState): void {
    if (nodeId === null) return;
    const nodeStates = state.nodeStates[tree.id];
    if (!nodeStates) return;

    const node = findNode(tree, nodeId);
    if (!node) return;

    nodeStates[nodeId] = 'active';
    state.note = `🔍 到达节点 ${node.value}`;
    addStep(state, 'reach');

    if (node.left !== null) {
      state.highlightLines = [2, 2];
      state.note = `⬅️ 先遍历左子树`;
      addStep(state, 'go-left');
      postorder(node.left, state);
    }

    if (node.right !== null) {
      state.highlightLines = [3, 3];
      state.note = `➡️ 再遍历右子树`;
      addStep(state, 'go-right');
      postorder(node.right, state);
    }

    state.highlightLines = [4, 4];
    state.note = `📍 访问节点 ${node.value}`;
    addStep(state, 'visit');

    visited.push(node.value);
    nodeStates[nodeId] = 'visited';
    state.note = `✅ 已访问: [${visited.join(', ')}]`;
    addStep(state, 'mark-visited');
  }

  const state = cloneTreeVizState(initialState);

  if (mode === 'preorder') {
    state.note = '🌲 开始前序遍历（根-左-右）';
    state.highlightLines = [1, 5];
    addStep(state, 'start');
    preorder(tree.root, state);
  } else if (mode === 'inorder') {
    state.note = '🌲 开始中序遍历（左-根-右）';
    state.highlightLines = [1, 5];
    addStep(state, 'start');
    inorder(tree.root, state);
  } else {
    state.note = '🌲 开始后序遍历（左-右-根）';
    state.highlightLines = [1, 5];
    addStep(state, 'start');
    postorder(tree.root, state);
  }

  state.note = `🎉 遍历完成！结果: [${visited.join(', ')}]`;
  state.highlightLines = undefined;
  addStep(state, 'complete');

  return { steps };
}
