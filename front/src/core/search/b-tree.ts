import type { SearchTrace, SearchTraceStep, SearchTreeNodeView } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { B_TREE_SEARCH_CODE_LINES } from './b-tree-code';

type BTreeNode = {
  id: string;
  keys: number[];
  children: BTreeNode[];
  leaf: boolean;
  start: number;
  end: number;
};

const MIN_DEGREE = 2; // 2-3-4 tree
const MAX_KEYS = 2 * MIN_DEGREE - 1;

function uniqueSorted(items: number[]): number[] {
  return Array.from(new Set(items)).sort((a, b) => a - b);
}

function createNode(leaf: boolean, id: string): BTreeNode {
  return { id, keys: [], children: [], leaf, start: -1, end: -1 };
}

function splitChild(parent: BTreeNode, idx: number) {
  const full = parent.children[idx]!;
  const right = createNode(full.leaf, `${full.id}R${idx}`);
  const midKey = full.keys[MIN_DEGREE - 1]!;

  right.keys = full.keys.slice(MIN_DEGREE);
  full.keys = full.keys.slice(0, MIN_DEGREE - 1);

  if (!full.leaf) {
    right.children = full.children.slice(MIN_DEGREE);
    full.children = full.children.slice(0, MIN_DEGREE);
  }

  parent.children.splice(idx + 1, 0, right);
  parent.keys.splice(idx, 0, midKey);
}

function insertNonFull(node: BTreeNode, key: number) {
  let i = node.keys.length - 1;
  if (node.leaf) {
    node.keys.push(key);
    while (i >= 0 && node.keys[i]! > key) {
      node.keys[i + 1] = node.keys[i]!;
      i--;
    }
    node.keys[i + 1] = key;
    return;
  }

  while (i >= 0 && key < node.keys[i]!) i--;
  i++;

  if (node.children[i]!.keys.length === MAX_KEYS) {
    splitChild(node, i);
    if (key > node.keys[i]!) i++;
  }
  insertNonFull(node.children[i]!, key);
}

function buildBTree(keys: number[]): BTreeNode | null {
  if (keys.length === 0) return null;
  let root = createNode(true, 'root');
  for (const key of keys) {
    if (root.keys.length === MAX_KEYS) {
      const next = createNode(false, `up-${key}`);
      next.children.push(root);
      splitChild(next, 0);
      root = next;
    }
    insertNonFull(root, key);
  }
  return root;
}

function annotateRange(node: BTreeNode, keyIndex: Map<number, number>) {
  if (node.leaf) {
    const indices = node.keys.map((k) => keyIndex.get(k)).filter((v): v is number => v !== undefined);
    node.start = indices.length > 0 ? Math.min(...indices) : -1;
    node.end = indices.length > 0 ? Math.max(...indices) : -1;
    return;
  }
  for (const child of node.children) annotateRange(child, keyIndex);
  const starts = node.children.map((c) => c.start).filter((v) => v >= 0);
  const ends = node.children.map((c) => c.end).filter((v) => v >= 0);
  node.start = starts.length > 0 ? Math.min(...starts) : -1;
  node.end = ends.length > 0 ? Math.max(...ends) : -1;
}

function collectTreeNodes(node: BTreeNode, depth: number, orderBase: number, list: SearchTreeNodeView[]) {
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

export function generateBTreeSearchTrace(items: number[], target: number): SearchTrace {
  const keys = uniqueSorted(items);
  const state = createInitialSearchVizState(keys, target);
  const steps: SearchTraceStep[] = [];
  const keyIndex = new Map<number, number>();
  state.items.forEach((item, index) => {
    keyIndex.set(item.value, index);
  });

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  if (keys.length === 0) {
    state.note = '❌ B 树为空，无法查找';
    state.highlightLines = B_TREE_SEARCH_CODE_LINES.notFound;
    addStep('empty');
    return { steps };
  }

  const root = buildBTree(keys);
  if (!root) {
    state.note = '❌ B 树为空，无法查找';
    state.highlightLines = B_TREE_SEARCH_CODE_LINES.notFound;
    addStep('empty');
    return { steps };
  }
  annotateRange(root, keyIndex);
  const treeNodes: SearchTreeNodeView[] = [];
  collectTreeNodes(root, 0, 1, treeNodes);
  state.treeNodes = treeNodes;
  state.activeTreeNodeId = root.id;
  state.activeTreeEdge = null;
  state.note = `🚀 开始 B 树查找（已对输入去重并排序，共 ${keys.length} 个键）`;
  state.routeHint = '规则：节点内从左到右比较；命中则结束，未命中下降到对应子节点';
  state.highlightLines = B_TREE_SEARCH_CODE_LINES.init;
  addStep('start');

  let node: BTreeNode | null = root;
  while (node) {
    state.activeTreeNodeId = node.id;
    state.highlightLines = B_TREE_SEARCH_CODE_LINES.loop;
    for (const k of node.keys) {
      const idx = keyIndex.get(k);
      if (idx !== undefined) state.itemStates[state.items[idx]!.id] = 'active';
    }
    const nodeIndices = node.keys.map((k) => keyIndex.get(k)).filter((v): v is number => v !== undefined);
    if (nodeIndices.length > 0) {
      state.pointers.left = Math.min(...nodeIndices);
      state.pointers.right = Math.max(...nodeIndices);
    }
    state.note = `访问节点 keys=[${node.keys.join(', ')}]`;
    state.routeHint = `当前节点键：${node.keys.join(', ')}；比较目标 ${target}`;
    addStep('visit-node');

    state.highlightLines = B_TREE_SEARCH_CODE_LINES.setI;
    addStep('init-i');

    let i = 0;
    while (i < node.keys.length && target > node.keys[i]!) {
      const idx = keyIndex.get(node.keys[i]!);
      if (idx !== undefined) {
        state.pointers.mid = idx;
        state.itemStates[state.items[idx]!.id] = 'pivot';
      }
      state.note = `${target} > ${node.keys[i]!}，继续比较下一键`;
      state.routeHint = `${target} 大于 ${node.keys[i]!}，比较游标右移`;
      state.highlightLines = B_TREE_SEARCH_CODE_LINES.moveI;
      addStep('move-i');
      i++;
    }

    if (i < node.keys.length && target === node.keys[i]!) {
      const idx = keyIndex.get(node.keys[i]!);
      if (idx !== undefined) {
        state.pointers.mid = idx;
        state.itemStates[state.items[idx]!.id] = 'found';
        state.resultIndex = idx;
      }
      state.note = `✅ 命中键 ${target}`;
      state.routeHint = '命中当前节点键，查找结束';
      state.activeTreeEdge = null;
      state.highlightLines = B_TREE_SEARCH_CODE_LINES.found;
      addStep('found');
      return { steps };
    }

    for (const k of node.keys) {
      const idx = keyIndex.get(k);
      if (idx !== undefined && state.itemStates[state.items[idx]!.id] !== 'found') {
        state.itemStates[state.items[idx]!.id] = 'checked';
      }
    }

    if (node.leaf) {
      state.note = `❌ 到达叶子节点仍未找到 ${target}`;
      state.routeHint = '叶子节点无目标键，查找失败';
      state.activeTreeEdge = null;
      state.highlightLines = B_TREE_SEARCH_CODE_LINES.notFound;
      state.pointers.mid = undefined;
      addStep('leaf-not-found');
      return { steps };
    }

    const nextNode: BTreeNode | null = node.children[i] ?? null;
    state.note = `未命中，下降到第 ${i} 个子节点`;
    state.routeHint = `根据比较结果选择第 ${i} 个子节点继续搜索`;
    state.activeTreeEdge = nextNode ? { from: node.id, to: nextNode.id } : null;
    state.highlightLines = B_TREE_SEARCH_CODE_LINES.descend;
    state.pointers.mid = undefined;
    addStep('descend');
    node = nextNode;
  }

  state.activeTreeNodeId = null;
  state.activeTreeEdge = null;
  state.note = `❌ 查找结束，未找到 ${target}`;
  state.routeHint = '未命中任何路径';
  state.highlightLines = B_TREE_SEARCH_CODE_LINES.notFound;
  addStep('not-found');
  return { steps };
}
