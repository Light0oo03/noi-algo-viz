<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">💡 当前步骤</div>
      <div class="note">{{ note }}</div>
    </div>

    <div class="section">
      <div class="section-title">📚 队列状态</div>
      <div class="queues">
        <div v-for="queue in state.queues" :key="queue.id" class="queue-info">
          <div class="queue-label">{{ queue.label }}</div>
          <div class="queue-size">大小: {{ queue.items.filter(i => i.value >= 0).length }}</div>
          <div v-if="queue.capacity" class="queue-capacity">容量: {{ queue.capacity }}</div>
          <div v-if="queue.items.length > 0 && queue.items[0]!.value >= 0" class="queue-front">
            队首: {{ queue.items[0]!.value }}
          </div>
          <div v-if="queue.items.length > 0 && queue.items[queue.items.length - 1]!.value >= 0" class="queue-rear">
            队尾: {{ queue.items[queue.items.length - 1]!.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QueueVizState } from '../core/queue/types';

defineProps<{
  note: string;
  state: QueueVizState;
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

.queues {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-info {
  padding: 10px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.queue-label {
  font-weight: 600;
  color: var(--text);
  font-size: 12px;
  margin-bottom: 4px;
}

.queue-size, .queue-capacity, .queue-front, .queue-rear {
  font-size: 11px;
  color: var(--muted-2);
}
</style>
