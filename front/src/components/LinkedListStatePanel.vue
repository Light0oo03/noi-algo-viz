<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">📝 说明</div>
      <div class="note">{{ note }}</div>
    </div>

    <div class="section">
      <div class="section-title">🔎 指针</div>
      <div class="pointers">
        <div v-for="p in pointerEntries" :key="p.name" class="row">
          <span class="k">{{ p.name }}</span>
          <span class="v">{{ p.target }}</span>
        </div>
        <div v-if="pointerEntries.length === 0" class="empty">暂无指针</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📋 链表</div>
      <div class="lists">
        <div v-for="list in lists" :key="list.id" class="row">
          <span class="k">{{ list.label }}</span>
          <span class="v">{{ list.values }}</span>
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
  gap: 10px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

.note {
  padding: 8px;
  background: rgba(236, 253, 245, 0.7);
  border: 1px solid var(--border);
  border-radius: 6px;
  white-space: pre-wrap;
  color: var(--text);
  font-size: 11px;
  line-height: 1.4;
}

.pointers,
.lists {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.k {
  font-weight: 600;
  color: var(--text);
}

.v {
  color: var(--muted-2);
}

.empty {
  font-size: 11px;
  color: var(--muted-2);
}
</style>
