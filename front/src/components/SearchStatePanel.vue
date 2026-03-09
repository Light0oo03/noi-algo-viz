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
      <div class="path-head">
        <span class="meta">node-path:</span>
        <div class="path-actions" v-if="hasNodePath">
          <button type="button" class="path-btn" @click="togglePathExpanded">
            {{ isPathExpanded ? '收起' : '展开' }}
          </button>
          <button type="button" class="path-btn" @click="copyNodePath">
            {{ copyButtonText }}
          </button>
        </div>
      </div>
      <div class="meta mono node-path" :class="{ collapsed: !isPathExpanded }">{{ visitedNodePathText }}</div>
    </div>

    <div class="section">
      <div class="section-title">✅ 结果</div>
      <div class="meta">{{ state.resultIndex === null ? '未找到' : `找到，索引 ${state.resultIndex}` }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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
const hasNodePath = computed(() => (props.state.visitedTreeNodeIds?.length ?? 0) > 0);
const isPathExpanded = ref(false);
const copyButtonText = ref('复制');

watch(
  () => visitedNodePathText.value,
  (next) => {
    isPathExpanded.value = next.length <= 48;
    copyButtonText.value = '复制';
  },
  { immediate: true }
);

function togglePathExpanded() {
  isPathExpanded.value = !isPathExpanded.value;
}

async function copyNodePath() {
  if (!hasNodePath.value) return;
  try {
    await navigator.clipboard.writeText(visitedNodePathText.value);
    copyButtonText.value = '已复制';
  } catch {
    copyButtonText.value = '复制失败';
  }
}

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

.path-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.path-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.path-btn {
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.4;
  color: #065f46;
  background: rgba(236, 253, 245, 0.9);
  cursor: pointer;
}

.path-btn:hover {
  background: rgba(209, 250, 229, 0.9);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  word-break: break-all;
}

.node-path.collapsed {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
