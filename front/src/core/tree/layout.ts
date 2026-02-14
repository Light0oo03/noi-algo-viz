import type { TreeView } from './types';

export type TreePosition = {
  x: number;
  y: number;
};

export type TreeLayout = Record<number, TreePosition>;

export function calculateTreeLayout(
  tree: TreeView,
  options: {
    nodeWidth: number;
    nodeHeight: number;
    horizontalGap: number;
    verticalGap: number;
  }
): TreeLayout {
  const layout: TreeLayout = {};

  if (tree.root === null || tree.nodes.length === 0) {
    return layout;
  }

  const { horizontalGap, verticalGap } = options;
  const levelNodes = new Map<number, number[]>();

  function getLevel(nodeId: number, level: number): void {
    if (!levelNodes.has(level)) {
      levelNodes.set(level, []);
    }
    levelNodes.get(level)!.push(nodeId);

    const node = tree.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    if (node.left !== null) getLevel(node.left, level + 1);
    if (node.right !== null) getLevel(node.right, level + 1);
  }

  getLevel(tree.root, 0);

  const maxLevel = Math.max(...levelNodes.keys());
  const baseWidth = Math.pow(2, maxLevel) * horizontalGap;

  levelNodes.forEach((nodes, level) => {
    const levelWidth = Math.pow(2, maxLevel - level) * horizontalGap;
    const startX = (baseWidth - (nodes.length - 1) * levelWidth) / 2;

    nodes.forEach((nodeId, index) => {
      layout[nodeId] = {
        x: startX + index * levelWidth,
        y: level * verticalGap + 60,
      };
    });
  });

  return layout;
}
