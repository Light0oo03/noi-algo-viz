<template>
  <div class="list-canvas">
    <div v-for="list in state.lists" :key="list.id" class="list-row">
      <div class="list-title">{{ list.label }}</div>
      <div class="list-track">
        <template v-for="(node, index) in orderedNodes(list)" :key="node.id">
          <div class="node-wrap">
            <div class="pointer-tags">
              <span v-for="name in pointerLabels(list.id, node.id)" :key="name" class="pointer-tag">
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
            →
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
import type { ListNode, ListView, ListVizState } from '../core/linked-list/types';

const props = defineProps<{
  state: ListVizState;
}>();

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
</script>

<style scoped>
.list-canvas {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  min-height: 360px;
}

.list-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}

.list-track {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.node-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pointer-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.pointer-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.node {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  border: 2px solid #94a3b8;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.node-value {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.node-id {
  font-size: 10px;
  color: #64748b;
}

.node-label {
  font-size: 10px;
  color: #0f766e;
}

.node-default {
  background: #f8fafc;
}

.node-selected {
  border-color: #f59e0b;
  background: rgba(251, 191, 36, 0.15);
}

.node-frontier {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
}

.node-visited {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}

.arrow {
  font-size: 22px;
  color: #64748b;
}

.arrow-checking {
  color: #60a5fa;
}

.arrow-tree {
  color: #22c55e;
  font-weight: 700;
}

.null-node,
.cycle-tag {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px dashed rgba(148, 163, 184, 0.6);
  color: var(--muted-2);
}

.cycle-tag {
  border-style: solid;
  border-color: rgba(245, 158, 11, 0.4);
  color: #b45309;
  background: rgba(251, 191, 36, 0.15);
}
</style>
