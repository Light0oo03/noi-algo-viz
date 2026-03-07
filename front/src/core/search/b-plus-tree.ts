import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { B_PLUS_TREE_SEARCH_CODE_LINES } from './b-plus-tree-code';

type BPlusNode = {
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
      leaf: true,
      keys: leafKeys,
      children: [],
      start: i,
      end: i + leafKeys.length - 1,
    });
  }
  return leaves;
}

function buildParentLevel(level: BPlusNode[]): BPlusNode[] {
  const parents: BPlusNode[] = [];
  for (let i = 0; i < level.length; i += BRANCHING) {
    const children = level.slice(i, i + BRANCHING);
    const keys: number[] = [];
    for (let c = 1; c < children.length; c++) {
      keys.push(firstKey(children[c]!));
    }
    parents.push({
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
  while (level.length > 1) {
    level = buildParentLevel(level);
  }
  return level[0]!;
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
  state.note = `🚀 开始 B+ 树查找（去重排序后 ${keys.length} 个键）`;
  state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.init;
  addStep('start');

  let node = root;
  while (node && !node.leaf) {
    state.pointers.left = node.start;
    state.pointers.right = node.end;
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.routeLoop;
    state.note = `访问内部节点 keys=[${node.keys.join(', ')}]，覆盖区间 [${node.start}, ${node.end}]`;
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

    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.descend;
    state.note = `下降到第 ${i} 个子节点`;
    addStep('descend');
    node = node.children[i] ?? null;
    state.pointers.mid = undefined;
  }

  if (!node) {
    state.note = `❌ 查找结束，未找到 ${target}`;
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.notFound;
    addStep('not-found');
    return { steps };
  }

  state.pointers.left = node.start;
  state.pointers.right = node.end;
  state.note = `到达叶子节点 keys=[${node.keys.join(', ')}]，线性扫描`;
  state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.leafLoop;
  addStep('leaf-start');

  for (const key of node.keys) {
    const idx = indexByValue.get(key);
    if (idx === undefined) continue;
    state.pointers.index = idx;
    state.itemStates[state.items[idx]!.id] = 'active';
    state.note = `检查叶子键 ${key}`;
    state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.leafLoop;
    addStep('leaf-check');

    if (key === target) {
      state.itemStates[state.items[idx]!.id] = 'found';
      state.resultIndex = idx;
      state.note = `✅ 命中键 ${target}`;
      state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.found;
      addStep('found');
      return { steps };
    }

    state.itemStates[state.items[idx]!.id] = 'checked';
  }

  state.pointers.index = undefined;
  state.note = `❌ 叶子扫描结束，未找到 ${target}`;
  state.highlightLines = B_PLUS_TREE_SEARCH_CODE_LINES.notFound;
  addStep('leaf-not-found');
  return { steps };
}
