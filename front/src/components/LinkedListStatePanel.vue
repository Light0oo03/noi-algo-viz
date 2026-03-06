<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">💡 当前步骤</div>
      <div class="note">{{ note }}</div>
    </div>

    <div class="section">
      <div class="section-title">🎯 指针位置</div>
      <div class="pointers">
        <div v-for="p in pointerEntries" :key="p.name" :class="['row', `pointer-row-${p.name}`]">
          <span :class="['k', `pointer-label-${p.name}`]">{{ p.name }}</span>
          <span class="v">{{ p.target }}</span>
        </div>
        <div v-if="pointerEntries.length === 0" class="empty">暂无指针</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📋 链表结构</div>
      <div class="lists">
        <div v-for="list in lists" :key="list.id" class="list-item">
          <span class="list-label">{{ list.label }}</span>
          <span class="list-values">{{ list.values }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ListView, ListVizState } from '../core/linked-list/types';

const props = defineProps<{
  note: string;
  state: ListVizState;
}>();

type PointerEntry = { name: string; target: string };

const pointerEntries = computed<PointerEntry[]>(() => {
  return Object.entries(props.state.pointers).map(([name, p]) => ({
    name,
    target: `${p.listId}:${p.nodeId ?? 'null'}`,
  }));
});

function listValues(list: ListView): string {
  const ordered: number[] = [];
  const visited = new Set<number>();
  let cur = list.head;
  while (cur != null && !visited.has(cur)) {
    const node = list.nodes.find((n) => n.id === cur);
    if (!node) break;
    ordered.push(node.value);
    visited.add(cur);
    cur = node.next;
  }
  if (cur != null) ordered.push(NaN);
  return ordered.map((v) => (Number.isNaN(v) ? '↩' : v)).join(' -> ');
}

const lists = computed(() =>
  props.state.lists.map((list) => ({
    id: list.id,
    label: list.label,
    values: listValues(list),
  }))
);
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.3px;
}

.note {
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.8), rgba(209, 250, 229, 0.6));
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  white-space: pre-wrap;
  color: #065f46;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.1);
}

.pointers,
.lists {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.pointer-row-prev {
  background: rgba(168, 85, 247, 0.08);
  border-left: 3px solid #7c3aed;
}

.pointer-row-curr {
  background: rgba(59, 130, 246, 0.08);
  border-left: 3px solid #1d4ed8;
}

.pointer-row-next {
  background: rgba(34, 197, 94, 0.08);
  border-left: 3px solid #15803d;
}

.pointer-row-slow, .pointer-row-fast {
  background: rgba(245, 158, 11, 0.08);
  border-left: 3px solid #b45309;
}

.k {
  font-weight: 700;
  color: var(--text);
  min-width: 50px;
}

.pointer-label-prev {
  color: #7c3aed;
}

.pointer-label-curr {
  color: #1d4ed8;
}

.pointer-label-next {
  color: #15803d;
}

.pointer-label-slow, .pointer-label-fast {
  color: #b45309;
}

.v {
  color: var(--muted-2);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 11px;
}

.list-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.list-label {
  font-weight: 600;
  color: var(--text);
  font-size: 11px;
}

.list-values {
  color: var(--muted-2);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  word-break: break-all;
}

.empty {
  font-size: 11px;
  color: var(--muted-2);
  font-style: italic;
  padding: 6px 8px;
}
</style>
