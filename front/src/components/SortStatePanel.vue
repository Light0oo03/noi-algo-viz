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

    <div v-if="state.callStack.length > 0" class="section">
      <div class="section-title">🧠 递归栈</div>
      <div class="stack-list">
        <div
          v-for="(frame, index) in stackFrames"
          :key="`${frame.label}-${frame.left}-${frame.right}-${index}`"
          :class="['stack-item', { active: index === stackFrames.length - 1 }]"
        >
          <div class="stack-main mono">{{ frame.label }}({{ frame.left }}, {{ frame.right }})</div>
          <div class="stack-phase">{{ phaseText(frame.phase) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SortVizState } from '../core/sort/types';

const props = defineProps<{
  note: string;
  state: SortVizState;
}>();

const stackFrames = computed(() => props.state.callStack);

function pointerText(value: number | undefined): string {
  return value === undefined ? '-' : String(value);
}

function phaseText(phase: SortVizState['callStack'][number]['phase']): string {
  switch (phase) {
    case 'enter':
      return '进入';
    case 'left':
      return '处理左侧';
    case 'right':
      return '处理右侧';
    case 'merge':
      return '执行合并';
    case 'base':
      return '基线返回';
    case 'done':
      return '完成返回';
    default:
      return phase;
  }
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

.stack-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stack-item {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(241, 245, 249, 0.72);
}

.stack-item.active {
  border-color: rgba(59, 130, 246, 0.35);
  background: rgba(219, 234, 254, 0.75);
}

.stack-main {
  font-size: 12px;
  color: var(--text);
}

.stack-phase {
  margin-top: 4px;
  font-size: 11px;
  color: var(--muted-2);
}
</style>
