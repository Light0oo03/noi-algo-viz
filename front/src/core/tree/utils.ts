import type { TreeView, TreeNode, TreeEdge, TreeVizState } from './types';

export function buildBinaryTree(
  values: (number | null)[],
  options: { id: string; label: string }
): TreeView {
  const nodes: TreeNode[] = [];
  const nodeMap = new Map<number, TreeNode>();

  values.forEach((value, index) => {
    if (value !== null) {
      const node: TreeNode = {
        id: index,
        value,
        left: null,
        right: null,
      };
      nodes.push(node);
      nodeMap.set(index, node);
    }
  });

  nodeMap.forEach((node, index) => {
    const leftIndex = 2 * index + 1;
    const rightIndex = 2 * index + 2;

    if (leftIndex < values.length && values[leftIndex] !== null) {
      node.left = leftIndex;
    }
    if (rightIndex < values.length && values[rightIndex] !== null) {
      node.right = rightIndex;
    }
  });

  return {
    id: options.id,
    label: options.label,
    nodes,
    root: values.length > 0 && values[0] !== null ? 0 : null,
  };
}

export function findNode(tree: TreeView, nodeId: number): TreeNode | undefined {
  return tree.nodes.find((n) => n.id === nodeId);
}

export function getParent(tree: TreeView, nodeId: number): TreeNode | undefined {
  return tree.nodes.find((n) => n.left === nodeId || n.right === nodeId);
}

export function getChildren(
  tree: TreeView,
  nodeId: number
): { left?: TreeNode; right?: TreeNode } {
  const node = findNode(tree, nodeId);
  if (!node) return {};

  return {
    left: node.left !== null ? findNode(tree, node.left) : undefined,
    right: node.right !== null ? findNode(tree, node.right) : undefined,
  };
}

export function getTreeEdges(tree: TreeView): TreeEdge[] {
  const edges: TreeEdge[] = [];

  tree.nodes.forEach((node) => {
    if (node.left !== null) {
      edges.push({ parent: node.id, child: node.left, direction: 'left' });
    }
    if (node.right !== null) {
      edges.push({ parent: node.id, child: node.right, direction: 'right' });
    }
  });

  return edges;
}

export function cloneTreeVizState(state: TreeVizState): TreeVizState {
  return {
    trees: state.trees.map((tree) => ({
      ...tree,
      nodes: tree.nodes.map((node) => ({ ...node })),
    })),
    nodeStates: JSON.parse(JSON.stringify(state.nodeStates)),
    edgeStates: JSON.parse(JSON.stringify(state.edgeStates)),
    pointers: JSON.parse(JSON.stringify(state.pointers)),
    queue: state.queue ? [...state.queue] : undefined,
    stack: state.stack ? [...state.stack] : undefined,
    note: state.note,
    highlightLines: state.highlightLines
      ? [state.highlightLines[0], state.highlightLines[1]]
      : undefined,
  };
}

export function createInitialTreeVizState(trees: TreeView[]): TreeVizState {
  const nodeStates: Record<string, Record<number, 'default'>> = {};
  const edgeStates: Record<string, Record<string, 'default'>> = {};

  trees.forEach((tree) => {
    nodeStates[tree.id] = {};
    tree.nodes.forEach((node) => {
      nodeStates[tree.id][node.id] = 'default';
    });

    edgeStates[tree.id] = {};
  });

  return {
    trees,
    nodeStates,
    edgeStates,
    pointers: {},
    note: '初始状态',
    highlightLines: undefined,
  };
}
