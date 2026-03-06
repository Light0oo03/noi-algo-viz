import type { SearchTrace, SearchTraceStep } from './types';
import { cloneSearchVizState, createInitialSearchVizState } from './types';
import { HASH_CHAIN_SEARCH_CODE_LINES } from './hash-chain-code';

function bucketSize(n: number): number {
  return Math.max(5, n);
}

function hash(x: number, m: number): number {
  return ((x % m) + m) % m;
}

export function generateHashChainSearchTrace(items: number[], target: number): SearchTrace {
  const m = bucketSize(items.length);
  const buckets: number[][] = Array.from({ length: m }, () => []);
  for (const x of items) {
    buckets[hash(x, m)]!.push(x);
  }

  const flat: number[] = [];
  const bucketRanges = new Map<number, [number, number]>();
  for (let b = 0; b < m; b++) {
    const start = flat.length;
    const list = buckets[b]!;
    if (list.length === 0) {
      flat.push(-1);
    } else {
      for (const x of list) flat.push(x);
    }
    const end = flat.length - 1;
    bucketRanges.set(b, [start, end]);
  }

  const state = createInitialSearchVizState(flat, target);
  const steps: SearchTraceStep[] = [];

  function addStep(type: string) {
    steps.push({ type, state: cloneSearchVizState(state) });
  }

  state.note = `🚀 开始哈希查找（拉链法），桶数=${m}，空桶=-1`;
  state.highlightLines = HASH_CHAIN_SEARCH_CODE_LINES.init;
  addStep('start');

  const b = hash(target, m);
  const [start, end] = bucketRanges.get(b)!;
  state.pointers.left = start;
  state.pointers.right = end;
  state.note = `目标值映射到桶 ${b}，扫描区间 [${start}, ${end}]`;
  state.highlightLines = HASH_CHAIN_SEARCH_CODE_LINES.pickBucket;
  addStep('pick-bucket');

  for (let i = start; i <= end; i++) {
    const item = state.items[i]!;
    state.pointers.index = i;
    state.itemStates[item.id] = 'active';
    state.note = `检查桶 ${b} 中位置 ${i - start}，值=${item.value}`;
    state.highlightLines = HASH_CHAIN_SEARCH_CODE_LINES.loop;
    addStep('scan');

    if (item.value === target) {
      state.resultIndex = i;
      state.itemStates[item.id] = 'found';
      state.note = `✅ 找到目标值 ${target}（桶 ${b}）`;
      state.highlightLines = HASH_CHAIN_SEARCH_CODE_LINES.found;
      addStep('found');
      return { steps };
    }

    state.itemStates[item.id] = 'checked';
  }

  state.note = `❌ 查找结束，未找到 ${target}`;
  state.highlightLines = HASH_CHAIN_SEARCH_CODE_LINES.notFound;
  addStep('not-found');
  return { steps };
}
