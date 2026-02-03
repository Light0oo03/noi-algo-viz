<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">📝 说明</div>
      <div class="note">{{ note }}</div>
    </div>

    <div class="section">
      <div class="section-title">📋 {{ queueTitle }}</div>
      <div class="queue">
        <span v-if="queue.length === 0" class="empty">空</span>
        <span v-for="(id, idx) in queue" :key="idx" class="pill">{{ id }}</span>
      </div>
    </div>

    <div class="section collapsible">
      <div class="section-title" @click="showNodeStates = !showNodeStates">
        {{ showNodeStates ? '▼' : '▶' }} 节点状态
      </div>
      <div v-show="showNodeStates" class="states">
        <div v-for="(st, id) in sortedNodeStates" :key="id" class="row">
          <span class="k">{{ st[0] }}</span>
          <span :class="['v', st[1]]">{{ stateText(st[1]) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type NodeVizState = 'default' | 'visited' | 'selected' | 'frontier';

const props = defineProps<{
  note: string;
  queue: number[];
  playerStatus: 'idle' | 'ready' | 'playing' | 'paused' | 'ended';
  nodeStates: Record<number, NodeVizState>;
  algo: string;
}>();

const showNodeStates = ref(false);

const sortedNodeStates = computed(() => {
  const entries = Object.entries(props.nodeStates).map(([k, v]) => [Number(k), v] as const);
  entries.sort((a, b) => a[0] - b[0]);
  return entries;
});

const queueTitle = computed(() => (props.algo === 'dfs' ? '栈' : '队列'));

function stateText(st: NodeVizState) {
  switch (st) {
    case 'default': return '默认';
    case 'frontier': return props.algo === 'dfs' ? '已入栈' : '已入队';
    case 'selected': return '当前';
    case 'visited': return '已访问';
  }
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

.collapsible .section-title {
  cursor: pointer;
  user-select: none;
}

.collapsible .section-title:hover {
  color: var(--text);
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

.queue {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: #22c55e;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

.empty {
  color: var(--muted-2);
  font-size: 11px;
}

.states {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: rgba(220, 252, 231, 0.6);
  border: 1px solid rgba(16, 185, 129, 0.18);
  border-radius: 4px;
  font-size: 11px;
}

.k {
  color: var(--text);
  font-weight: 600;
}

.v {
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
}

.v.default {
  background: rgba(6, 95, 70, 0.12);
  color: rgba(6, 95, 70, 0.8);
}

.v.frontier {
  background: #22c55e;
  color: #fff;
}

.v.selected {
  background: #f59e0b;
  color: #fff;
}

.v.visited {
  background: #6366f1;
  color: #fff;
}
</style>
