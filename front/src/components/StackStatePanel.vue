<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">💡 当前步骤</div>
      <div class="note">{{ note }}</div>
    </div>

    <div class="section">
      <div class="section-title">📚 栈状态</div>
      <div class="stacks">
        <div v-for="stack in state.stacks" :key="stack.id" class="stack-info">
          <div class="stack-label">{{ stack.label }}</div>
          <div class="stack-size">大小: {{ stack.items.length }}</div>
          <div v-if="stack.items.length > 0" class="stack-top">
            栈顶: {{ String.fromCharCode(stack.items[stack.items.length - 1]!.value) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StackVizState } from '../core/stack/types';

defineProps<{
  note: string;
  state: StackVizState;
}>();
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

.stacks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stack-info {
  padding: 10px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.stack-label {
  font-weight: 600;
  color: var(--text);
  font-size: 12px;
  margin-bottom: 4px;
}

.stack-size, .stack-top {
  font-size: 11px;
  color: var(--muted-2);
}
</style>
