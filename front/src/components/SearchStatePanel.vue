<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">💡 当前步骤</div>
      <div class="note">{{ note }}</div>
    </div>

    <div class="section">
      <div class="section-title">🎯 查找目标</div>
      <div class="meta">target = {{ state.target }}</div>
    </div>

    <div class="section">
      <div class="section-title">📍 指针</div>
      <div class="meta">left: {{ pointerText(state.pointers.left) }}</div>
      <div class="meta">right: {{ pointerText(state.pointers.right) }}</div>
      <div class="meta">mid: {{ pointerText(state.pointers.mid) }}</div>
      <div class="meta">index: {{ pointerText(state.pointers.index) }}</div>
    </div>

    <div v-if="state.treeNodes?.length" class="section">
      <div class="section-title">🧭 树路由</div>
      <div class="meta">active-node: {{ activeTreeNodeText }}</div>
      <div class="meta">rule: {{ state.routeHint || '-' }}</div>
      <div class="meta">visited-nodes: {{ visitedNodeCount }}</div>
      <div class="meta">visited-edges: {{ visitedEdgeCount }}</div>
      <div class="meta mono">node-path: {{ visitedNodePathText }}</div>
    </div>

    <div class="section">
      <div class="section-title">✅ 结果</div>
      <div class="meta">{{ state.resultIndex === null ? '未找到' : `找到，索引 ${state.resultIndex}` }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SearchVizState } from '../core/search/types';

const props = defineProps<{
  note: string;
  state: SearchVizState;
}>();

const activeTreeNodeText = computed(() => {
  if (!props.state.treeNodes?.length || !props.state.activeTreeNodeId) return '-';
  const node = props.state.treeNodes.find((item) => item.id === props.state.activeTreeNodeId);
  if (!node) return '-';
  return `${node.id} keys=[${node.keys.join(', ')}]`;
});

const visitedNodeCount = computed(() => props.state.visitedTreeNodeIds?.length ?? 0);
const visitedEdgeCount = computed(() => props.state.visitedTreeEdges?.length ?? 0);
const visitedNodePathText = computed(() => {
  const ids = props.state.visitedTreeNodeIds ?? [];
  return ids.length > 0 ? ids.join(' -> ') : '-';
});

function pointerText(value: number | undefined): string {
  return value === undefined ? '-' : String(value);
}
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
}

.meta {
  font-size: 12px;
  color: var(--muted-2);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  word-break: break-all;
}
</style>
