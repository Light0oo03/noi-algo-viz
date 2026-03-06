<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">💡 当前步骤</div>
      <div class="note">{{ note }}</div>
    </div>

    <div v-if="tree" class="section">
      <div class="section-title">🌳 树状态</div>
      <div class="tree-info">
        <div class="tree-label">{{ tree.label }}</div>
        <div class="tree-size">节点数: {{ tree.nodes.length }}</div>
        <div v-if="tree.root !== null" class="tree-root">
          根节点: {{ findNode(tree, tree.root)?.value }}
        </div>
      </div>
    </div>

    <div v-if="activePointers.length > 0" class="section">
      <div class="section-title">👆 指针状态</div>
      <div class="pointers">
        <div v-for="ptr in activePointers" :key="ptr[0]" class="pointer-item">
          <span class="pointer-name" :style="{ color: ptr[1].color }">{{ ptr[1].name }}</span>
          <span>→ 节点 {{ ptr[1].nodeId }}</span>
        </div>
      </div>
    </div>

    <div v-if="state.queue && state.queue.length > 0" class="section">
      <div class="section-title">📦 队列</div>
      <div class="aux-data">
        <div class="aux-label">内容: {{ state.queue.map(id => findNode(tree!, id)?.value ?? '?').join(', ') }}</div>
        <div class="aux-size">大小: {{ state.queue.length }}</div>
      </div>
    </div>

    <div v-if="state.stack && state.stack.length > 0" class="section">
      <div class="section-title">📚 栈</div>
      <div class="aux-data">
        <div class="aux-label">内容: {{ state.stack.map(id => findNode(tree!, id)?.value ?? '?').join(', ') }}</div>
        <div class="aux-size">大小: {{ state.stack.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TreeVizState } from '../core/tree/types';
import { findNode } from '../core/tree/utils';

const props = defineProps<{
  note: string;
  state: TreeVizState;
}>();

const tree = computed(() => props.state.trees[0]);

const activePointers = computed(() => {
  return Object.entries(props.state.pointers);
});
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

.tree-info {
  padding: 10px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.tree-label {
  font-weight: 600;
  color: var(--text);
  font-size: 12px;
  margin-bottom: 4px;
}

.tree-size, .tree-root {
  font-size: 11px;
  color: var(--muted-2);
}

.pointers {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pointer-item {
  padding: 8px 10px;
  background: rgba(251, 244, 247, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(168, 85, 247, 0.2);
  font-size: 11px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pointer-name {
  font-weight: 700;
  font-family: monospace;
}

.aux-data {
  padding: 10px;
  background: rgba(234, 254, 255, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.aux-label {
  font-size: 11px;
  color: var(--text);
  margin-bottom: 4px;
  font-family: monospace;
}

.aux-size {
  font-size: 11px;
  color: var(--muted-2);
}
</style>
