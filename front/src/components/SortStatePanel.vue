<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">💡 当前步骤</div>
      <div class="note">{{ note }}</div>
    </div>

    <div class="section">
      <div class="section-title">📍 指针</div>
      <div class="meta">i: {{ pointerText(state.pointers.i) }}</div>
      <div class="meta">j: {{ pointerText(state.pointers.j) }}</div>
      <div class="meta">min: {{ pointerText(state.pointers.min) }}</div>
    </div>

    <div class="section">
      <div class="section-title">📊 当前数组</div>
      <div class="meta mono">{{ state.items.map(i => i.value).join(', ') }}</div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { SortVizState } from '../core/sort/types';

defineProps<{
  note: string;
  state: SortVizState;
}>();

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
  font-family: monospace;
}
</style>
