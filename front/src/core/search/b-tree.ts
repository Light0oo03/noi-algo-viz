import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { B_TREE_SEARCH_CODE_LINES } from './b-tree-code';

type BTreeNode = {
  keys: number[];
  children: BTreeNode[];
  leaf: boolean;
};

const MIN_DEGREE = 2; // 2-3-4 tree
const MAX_KEYS = 2 * MIN_DEGREE - 1;

function uniqueSorted(items: number[]): number[] {
  return Array.from(new Set(items)).sort((a, b) => a - b);
}

function createNode(leaf: boolean): BTreeNode {
  return { keys: [], children: [], leaf };
}

function splitChild(parent: BTreeNode, idx: number) {
  const full = parent.children[idx]!;
  const right = createNode(full.leaf);
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
  let root = createNode(true);
  for (const key of keys) {
    if (root.keys.length === MAX_KEYS) {
      const next = createNode(false);
      next.children.push(root);
      splitChild(next, 0);
      root = next;
    }
    insertNonFull(root, key);
  }
  return root;
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
  state.note = `🚀 开始 B 树查找（已对输入去重并排序，共 ${keys.length} 个键）`;
  state.highlightLines = B_TREE_SEARCH_CODE_LINES.init;
  addStep('start');

  let node: BTreeNode | null = root;
  while (node) {
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
      state.highlightLines = B_TREE_SEARCH_CODE_LINES.notFound;
      state.pointers.mid = undefined;
      addStep('leaf-not-found');
      return { steps };
    }

    state.note = `未命中，下降到第 ${i} 个子节点`;
    state.highlightLines = B_TREE_SEARCH_CODE_LINES.descend;
    state.pointers.mid = undefined;
    addStep('descend');
    node = node.children[i] ?? null;
  }

  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = B_TREE_SEARCH_CODE_LINES.notFound;
  addStep('not-found');
  return { steps };
}
