<template>
  <div class="panel">
    <h3>说明</h3>
    <div class="note">{{ note }}</div>

    <h3>队列（BFS）</h3>
    <div class="queue">
      <span v-if="queue.length === 0" class="empty">空</span>
      <span v-for="(id, idx) in queue" :key="idx" class="pill">{{ id }}</span>
    </div>

    <h3>节点状态</h3>
    <div class="states">
      <div v-for="(st, id) in sortedNodeStates" :key="id" class="row">
        <span class="k">节点 {{ st[0] }}</span>
        <span class="v">{{ stateText(st[1]) }}</span>
      </div>
    </div>

    <div class="meta">播放器：{{ playerStatus }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type NodeVizState = 'default' | 'visited' | 'selected' | 'frontier';

const props = defineProps<{
  note: string;
  queue: number[];
  playerStatus: 'idle' | 'ready' | 'playing' | 'paused' | 'ended';
  nodeStates: Record<number, NodeVizState>;
}>();

const sortedNodeStates = computed(() => {
  const entries = Object.entries(props.nodeStates).map(([k, v]) => [Number(k), v] as const);
  entries.sort((a, b) => a[0] - b[0]);
  return entries;
});

function stateText(st: NodeVizState) {
  switch (st) {
    case 'default': return '默认';
    case 'frontier': return '已入队';
    case 'selected': return '当前处理';
    case 'visited': return '已访问';
  }
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
h3 {
  margin: 10px 0 4px;
  font-size: 13px;
  color: #e6edf3;
}
.note {
  padding: 10px;
  background: #0f172a;
  border: 1px solid #1f2a37;
  border-radius: 8px;
  min-height: 72px;
  white-space: pre-wrap;
  color: #cbd5e1;
  font-size: 12px;
}
.queue {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pill {
  padding: 4px 8px;
  border-radius: 999px;
  background: #111827;
  border: 1px solid #334155;
  font-size: 12px;
}
.empty {
  color: #94a3b8;
  font-size: 12px;
}
.states {
  border: 1px solid #1f2a37;
  border-radius: 8px;
  overflow: hidden;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  background: #0b1220;
  border-bottom: 1px solid #111827;
  font-size: 12px;
}
.row:last-child {
  border-bottom: none;
}
.k { color: #cbd5e1; }
.v { color: #9fb0c0; }
.meta {
  margin-top: 10px;
  font-size: 12px;
  color: #9fb0c0;
}
</style>
