<template>
  <div class="list-canvas">
    <div v-for="list in state.lists" :key="list.id" class="list-row">
      <div class="list-title">{{ list.label }}</div>
      <div class="list-track">
        <template v-for="(node, index) in orderedNodes(list)" :key="node.id">
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
          <div v-if="index < orderedNodes(list).length - 1" :class="['arrow', edgeClass(list, node.id)]">
            <span class="arrow-line">→</span>
          </div>
        </template>
        <div v-if="cycleTarget(list) != null" class="cycle-tag">
          ↩ 指回 #{{ cycleTarget(list) }}
        </div>
        <div v-else class="null-node">null</div>
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

function cycleTarget(list: ListView): number | null {
  const visited = new Set<number>();
  let cur = list.head;
  while (cur != null) {
    if (visited.has(cur)) return cur;
    visited.add(cur);
    const node = list.nodes.find((n) => n.id === cur);
    if (!node) break;
    cur = node.next;
  }
  return null;
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
  gap: 12px;
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
</style>
