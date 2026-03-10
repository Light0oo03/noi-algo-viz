<template>
  <div class="list-canvas">
    <div v-for="list in state.lists" :key="list.id" class="list-row">
      <div class="list-title">{{ list.label }}</div>
      <div class="list-track">
        <div v-for="segment in listSegments(list)" :key="segment.key" class="list-segment">
          <template v-for="(node, index) in segment.nodes" :key="node.id">
            <div class="node-wrap" :ref="el => setNodeRef(list.id, node.id, el)">
              <div class="pointer-tags">
                <span
                  v-for="name in pointerLabels(list.id, node.id)"
                  :key="name"
                  :class="['pointer-tag', `pointer-${name}`]"
                >
                  {{ name }}
                </span>
              </div>
              <div :class="['node', nodeStateClass(list.id, node.id)]">
                <div class="node-value">{{ node.value }}</div>
                <div class="node-id">#{{ node.id }}</div>
                <div v-if="node.label" class="node-label">{{ node.label }}</div>
              </div>
            </div>
            <div v-if="index < segment.nodes.length - 1" :class="['arrow', edgeClass(list, node.id)]">
              <span class="arrow-line">→</span>
            </div>
          </template>
          <div v-if="segment.tailType === 'null'" class="null-node">null</div>
          <div v-else-if="segment.tailTarget != null" :class="['cycle-tag', segment.tailType === 'link' ? 'link-tag' : '']">
            ↩ 指向 #{{ segment.tailTarget }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import gsap from 'gsap';
import type { ListNode, ListView, ListVizState } from '../core/linked-list/types';

const props = defineProps<{
  state: ListVizState;
}>();

const nodeRefs = ref<Map<string, HTMLElement>>(new Map());
const POINTER_PRIORITY = ['prev', 'curr', 'next', 'slow', 'fast', 'p1', 'p2', 'tail'] as const;

type ListSegment = {
  key: string;
  nodes: ListNode[];
  tailType: 'null' | 'link' | 'cycle';
  tailTarget: number | null;
};

function setNodeRef(listId: string, nodeId: number, el: any) {
  if (el) {
    nodeRefs.value.set(`${listId}-${nodeId}`, el as HTMLElement);
  }
}

function orderedNodes(list: ListView): ListNode[] {
  const res: ListNode[] = [];
  const visited = new Set<number>();
  let cur = list.head;
  while (cur != null && !visited.has(cur)) {
    const node = list.nodes.find((n) => n.id === cur);
    if (!node) break;
    res.push(node);
    visited.add(cur);
    cur = node.next;
  }
  return res;
}

function listSegments(list: ListView): ListSegment[] {
  const nodeMap = new Map(list.nodes.map((n) => [n.id, n]));
  const visitedGlobal = new Set<number>();
  const roots = buildRoots(list, nodeMap);
  const segments: ListSegment[] = [];

  roots.forEach((rootId, index) => {
    if (!nodeMap.has(rootId) || visitedGlobal.has(rootId)) return;
    const seg = buildSegment(list, rootId, index, nodeMap, visitedGlobal);
    if (seg.nodes.length > 0) segments.push(seg);
  });

  if (segments.length === 0 && list.nodes.length > 0) {
    const fallback = orderedNodes(list);
    segments.push({
      key: `${list.id}-fallback`,
      nodes: fallback.length > 0 ? fallback : [list.nodes[0]!],
      tailType: 'null',
      tailTarget: null,
    });
  }

  return segments;
}

function buildRoots(list: ListView, nodeMap: Map<number, ListNode>): number[] {
  const roots: number[] = [];
  const pointerEntries = Object.entries(props.state.pointers)
    .filter(([, p]) => p.listId === list.id && p.nodeId != null) as Array<[string, { listId: string; nodeId: number }]>;
  const pointerMap = new Map(pointerEntries.map(([name, p]) => [name, p.nodeId]));
  const reverseMode = pointerMap.has('prev') || pointerMap.has('curr') || pointerMap.has('next');

  const pushRoot = (id: number | null | undefined) => {
    if (id == null || !nodeMap.has(id) || roots.includes(id)) return;
    roots.push(id);
  };

  if (reverseMode) {
    pushRoot(pointerMap.get('prev'));
    pushRoot(pointerMap.get('curr'));
    pushRoot(pointerMap.get('next'));
  }

  pushRoot(list.head);

  const sortedPointers = pointerEntries
    .sort((a, b) => {
      const ai = POINTER_PRIORITY.indexOf(a[0] as (typeof POINTER_PRIORITY)[number]);
      const bi = POINTER_PRIORITY.indexOf(b[0] as (typeof POINTER_PRIORITY)[number]);
      const av = ai < 0 ? 999 : ai;
      const bv = bi < 0 ? 999 : bi;
      if (av !== bv) return av - bv;
      return a[0].localeCompare(b[0]);
    });

  sortedPointers.forEach(([name, p]) => {
    if (reverseMode && (name === 'prev' || name === 'curr' || name === 'next')) return;
    pushRoot(p.nodeId);
  });

  list.nodes.forEach((node) => pushRoot(node.id));
  return roots;
}

function buildSegment(
  list: ListView,
  rootId: number,
  index: number,
  nodeMap: Map<number, ListNode>,
  visitedGlobal: Set<number>
): ListSegment {
  const nodes: ListNode[] = [];
  const visitedLocal = new Set<number>();
  let tailType: 'null' | 'link' | 'cycle' = 'null';
  let tailTarget: number | null = null;
  let cur: number | null = rootId;

  while (cur != null) {
    if (visitedLocal.has(cur)) {
      tailType = 'cycle';
      tailTarget = cur;
      break;
    }
    if (visitedGlobal.has(cur)) {
      tailType = 'link';
      tailTarget = cur;
      break;
    }

    const node = nodeMap.get(cur);
    if (!node) {
      tailType = 'null';
      tailTarget = null;
      break;
    }

    nodes.push(node);
    visitedLocal.add(cur);
    visitedGlobal.add(cur);
    cur = node.next;
  }

  if (cur == null) {
    tailType = 'null';
    tailTarget = null;
  }

  return {
    key: `${list.id}-${rootId}-${index}`,
    nodes,
    tailType,
    tailTarget,
  };
}

function pointerLabels(listId: string, nodeId: number): string[] {
  return Object.entries(props.state.pointers)
    .filter(([, p]) => p.listId === listId && p.nodeId === nodeId)
    .map(([name]) => name);
}

function nodeStateClass(listId: string, nodeId: number): string {
  const st = props.state.nodeStates[listId]?.[nodeId] ?? 'default';
  return `node-${st}`;
}

function edgeClass(list: ListView, fromId: number): string {
  const toId = list.nodes.find((n) => n.id === fromId)?.next ?? null;
  const hit = props.state.edgeHighlights.find(
    (e) => e.listId === list.id && e.from === fromId && e.to === toId
  );
  const st = hit?.state ?? 'default';
  return `arrow-${st}`;
}

watch(() => props.state, () => {
  nodeRefs.value.forEach((el) => {
    gsap.fromTo(el,
      { scale: 0.95, opacity: 0.7 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
  });
}, { deep: true });
</script>

<style scoped>
.list-canvas {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  min-height: 400px;
}

.list-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.3px;
}

.list-track {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.list-segment {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.55);
}

.node-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s ease;
}

.pointer-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
  min-height: 20px;
}

.pointer-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  animation: pointerPulse 0.5s ease-out;
}

@keyframes pointerPulse {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.pointer-prev {
  background: rgba(168, 85, 247, 0.15);
  color: #7c3aed;
  border: 1px solid rgba(168, 85, 247, 0.4);
}

.pointer-curr {
  background: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.pointer-next {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.pointer-slow, .pointer-fast {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.node {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  border: 3px solid #94a3b8;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.node-value {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.node-id {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
}

.node-label {
  font-size: 10px;
  color: #0f766e;
  font-weight: 600;
}

.node-default {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.node-selected {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.05));
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2), 0 4px 12px rgba(245, 158, 11, 0.3);
  transform: scale(1.05);
}

.node-frontier {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05));
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2), 0 4px 12px rgba(34, 197, 94, 0.3);
}

.node-visited {
  border-color: #6366f1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.arrow {
  font-size: 26px;
  color: #94a3b8;
  transition: all 0.3s ease;
  position: relative;
}

.arrow-line {
  display: inline-block;
  transition: transform 0.3s ease;
}

.arrow-checking {
  color: #3b82f6;
  animation: arrowPulse 1s ease-in-out infinite;
}

.arrow-checking .arrow-line {
  transform: scale(1.2);
}

@keyframes arrowPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.arrow-tree {
  color: #22c55e;
  font-weight: 700;
}

.arrow-tree .arrow-line {
  filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.6));
}

.null-node,
.cycle-tag {
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px dashed rgba(148, 163, 184, 0.6);
  color: var(--muted-2);
  font-weight: 500;
}

.cycle-tag {
  border-style: solid;
  border-color: rgba(245, 158, 11, 0.5);
  color: #b45309;
  background: rgba(251, 191, 36, 0.15);
  font-weight: 600;
  animation: cycleBlink 1.5s ease-in-out infinite;
}

@keyframes cycleBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.link-tag {
  border-color: rgba(59, 130, 246, 0.4);
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.12);
  animation: none;
}
</style>
