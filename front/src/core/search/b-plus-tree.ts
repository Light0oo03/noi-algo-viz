import type { SearchTrace, SearchTraceStep, SearchTreeNodeView } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { B_PLUS_TREE_SEARCH_CODE_LINES } from './b-plus-tree-code';

type BPlusNode = {
  id: string;
  leaf: boolean;
  keys: number[];
  children: BPlusNode[];
  start: number;
  end: number;
};

const LEAF_CAPACITY = 4;
const BRANCHING = 4;

function uniqueSorted(items: number[]): number[] {
  return Array.from(new Set(items)).sort((a, b) => a - b);
}

function firstKey(node: BPlusNode): number {
  if (node.leaf) return node.keys[0]!;
  return firstKey(node.children[0]!);
}

function buildLeafLevel(keys: number[]): BPlusNode[] {
  const leaves: BPlusNode[] = [];
  for (let i = 0; i < keys.length; i += LEAF_CAPACITY) {
    const leafKeys = keys.slice(i, i + LEAF_CAPACITY);
    leaves.push({
      id: `L-${i / LEAF_CAPACITY}`,
      leaf: true,
      keys: leafKeys,
      children: [],
      start: i,
      end: i + leafKeys.length - 1,
    });
  }
  return leaves;
}

function buildParentLevel(level: BPlusNode[], depth: number): BPlusNode[] {
  const parents: BPlusNode[] = [];
  for (let i = 0; i < level.length; i += BRANCHING) {
    const children = level.slice(i, i + BRANCHING);
    const keys: number[] = [];
    for (let c = 1; c < children.length; c++) {
      keys.push(firstKey(children[c]!));
    }
    parents.push({
      id: `N-${depth}-${i / BRANCHING}`,
      leaf: false,
      keys,
      children,
      start: children[0]!.start,
      end: children[children.length - 1]!.end,
    });
  }
  return parents;
}

function buildBPlusTree(keys: number[]): BPlusNode | null {
  if (keys.length === 0) return null;
  let level = buildLeafLevel(keys);
  let depth = 1;
  while (level.length > 1) {
    level = buildParentLevel(level, depth);
    depth++;
  }
  return level[0]!;
}

function collectTreeNodes(node: BPlusNode, depth: number, orderBase: number, list: SearchTreeNodeView[]) {
  list.push({
    id: node.id,
    keys: [...node.keys],
    depth,
    order: orderBase,
    leaf: node.leaf,
    start: node.start,
    end: node.end,
  });
  node.children.forEach((child, idx) => {
    collectTreeNodes(child, depth + 1, orderBase * 10 + idx, list);
  });
}

export function generateBPlusTreeSearchTrace(items: number[], target: number): SearchTrace {
  const keys = uniqueSorted(items);
  const state = createInitialSearchVizState(keys, target);
  const steps: SearchTraceStep[] = [];
  const indexByValue = new Map<number, number>();
  state.items.forEach((item, index) => indexByValue.set(item.value, index));

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  if (keys.length === 0) {
    state.note = '❌ B+ 树为空，无法查找';
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.notFound;
    addStep('empty');
    return { steps };
  }

  const root = buildBPlusTree(keys);
  if (!root) {
    state.note = '❌ B+ 树为空，无法查找';
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.notFound;
    addStep('empty');
    return { steps };
  }
  const treeNodes: SearchTreeNodeView[] = [];
  collectTreeNodes(root, 0, 1, treeNodes);
  state.treeNodes = treeNodes;
  state.activeTreeNodeId = root.id;
  state.activeTreeEdge = null;
  state.activeChildIndex = null;
  state.visitedTreeEdges = [];
  state.note = `🚀 开始 B+ 树查找（去重排序后 ${keys.length} 个键）`;
  state.routeHint = '规则：内部节点按分隔键路由，叶子节点顺序扫描';
  state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.init;
  addStep('start');

  let node: BPlusNode | null = root;
  while (node && !node.leaf) {
    state.activeTreeNodeId = node.id;
    state.pointers.left = node.start;
    state.pointers.right = node.end;
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.routeLoop;
    state.note = `访问内部节点 keys=[${node.keys.join(', ')}]，覆盖区间 [${node.start}, ${node.end}]`;
    state.routeHint = `内部路由：比较目标 ${target} 与分隔键 ${node.keys.join(', ')}`;
    addStep('route-node');

    let i = 0;
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.routeInit;
    addStep('route-init');

    while (i < node.keys.length && target >= node.keys[i]!) {
      const idx = indexByValue.get(node.keys[i]!);
      if (idx !== undefined) {
        state.pointers.mid = idx;
        state.itemStates[state.items[idx]!.id] = 'pivot';
      }
      state.note = `${target} >= 分隔键 ${node.keys[i]!}，继续向右`;
      state.routeHint = `${target} >= ${node.keys[i]!}，路由索引右移`;
      state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.routeMove;
      addStep('route-move');
      i++;
    }

    for (const sep of node.keys) {
      const idx = indexByValue.get(sep);
      if (idx !== undefined && state.itemStates[state.items[idx]!.id] !== 'found') {
        state.itemStates[state.items[idx]!.id] = 'checked';
      }
    }

    const nextNode: BPlusNode | null = node.children[i] ?? null;
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.descend;
    state.note = `下降到第 ${i} 个子节点`;
    state.routeHint = `根据分隔键比较选择第 ${i} 个子节点`;
    state.activeTreeEdge = nextNode ? { from: node.id, to: nextNode.id } : null;
    state.activeChildIndex = nextNode ? i : null;
    if (state.activeTreeEdge) {
      state.visitedTreeEdges = [...(state.visitedTreeEdges ?? []), { ...state.activeTreeEdge }];
    }
    addStep('descend');
    node = nextNode;
    state.pointers.mid = undefined;
  }

  if (!node) {
    state.activeTreeNodeId = null;
    state.activeTreeEdge = null;
    state.activeChildIndex = null;
    state.note = `❌ 查找结束，未找到 ${target}`;
    state.routeHint = '路由失败，未定位到有效叶子';
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.notFound;
    addStep('not-found');
    return { steps };
  }

  state.activeTreeNodeId = node.id;
  state.activeTreeEdge = null;
  state.activeChildIndex = null;
  state.pointers.left = node.start;
  state.pointers.right = node.end;
  state.note = `到达叶子节点 keys=[${node.keys.join(', ')}]，线性扫描`;
  state.routeHint = '叶子层查找：从左到右顺序比较';
  state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.leafLoop;
  addStep('leaf-start');

  for (const key of node.keys) {
    const idx = indexByValue.get(key);
    if (idx === undefined) continue;
    state.pointers.index = idx;
    state.itemStates[state.items[idx]!.id] = 'active';
    state.note = `检查叶子键 ${key}`;
    state.routeHint = `叶子比较：${key} ${key === target ? '==' : '!='} ${target}`;
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.leafLoop;
    addStep('leaf-check');

    if (key === target) {
      state.itemStates[state.items[idx]!.id] = 'found';
      state.resultIndex = idx;
      state.note = `✅ 命中键 ${target}`;
      state.routeHint = '命中叶子键，查找结束';
      state.activeTreeEdge = null;
      state.activeChildIndex = null;
      state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.found;
      addStep('found');
      return { steps };
    }

    state.itemStates[state.items[idx]!.id] = 'checked';
  }

  state.pointers.index = undefined;
  state.activeTreeNodeId = null;
  state.activeTreeEdge = null;
  state.activeChildIndex = null;
  state.note = `❌ 叶子扫描结束，未找到 ${target}`;
  state.routeHint = '叶子节点扫描完成，未命中';
  state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.notFound;
  addStep('leaf-not-found');
  return { steps };
}
