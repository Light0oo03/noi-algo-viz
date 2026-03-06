<template>
  <div class="queue-canvas">
    <div v-for="queue in state.queues" :key="queue.id" class="queue-container">
      <div class="queue-title">{{ queue.label }}</div>
      <div class="queue-wrapper">
        <div v-if="state.frontPointers[queue.id]! >= 0" class="front-pointer">
          front ↓
        </div>
        <div class="queue-items">
          <div
            v-for="(item, index) in queue.items"
            :key="item.id"
            :class="['queue-item', itemStateClass(queue.id, item.id)]"
            :style="{ left: `${index * 90}px` }"
          >
            <div class="item-value">{{ item.value >= 0 ? item.value : '' }}</div>
            <div v-if="item.value >= 0" class="item-id">#{{ item.id }}</div>
            <div v-if="queue.capacity && item.value < 0" class="item-empty">-</div>
          </div>
          <div v-if="queue.items.length === 0" class="empty-queue">空队列</div>
        </div>
        <div
          v-if="state.rearPointers[queue.id]! >= 0"
          class="rear-pointer"
          :style="{ left: `${state.rearPointers[queue.id]! * 90}px` }"
        >
          rear ↑
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import gsap from 'gsap';
import type { QueueVizState } from '../core/queue/types';

const props = defineProps<{
  state: QueueVizState;
}>();

function itemStateClass(queueId: string, itemId: number): string {
  const st = props.state.itemStates[queueId]?.[itemId] ?? 'default';
  return `item-${st}`;
}

watch(() => props.state, () => {
  const items = document.querySelectorAll('.queue-item');
  items.forEach((el) => {
    gsap.fromTo(el,
      { scale: 0.9, opacity: 0.7 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
  });
}, { deep: true });
</script>

<style scoped>
.queue-canvas {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 60px 40px;
  min-height: 500px;
  overflow-x: auto;
}

.queue-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.queue-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.queue-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.queue-items {
  position: relative;
  min-width: 600px;
  height: 70px;
  display: flex;
  align-items: center;
}

.queue-item {
  position: absolute;
  width: 80px;
  height: 60px;
  border: 3px solid #94a3b8;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.item-id {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
}

.item-empty {
  font-size: 18px;
  color: #cbd5e1;
}

.empty-queue {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #94a3b8;
  font-size: 14px;
}

.front-pointer {
  position: absolute;
  top: -30px;
  left: 0;
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
}

.rear-pointer {
  position: absolute;
  bottom: -30px;
  font-size: 12px;
  font-weight: 600;
  color: #7c3aed;
  transition: left 0.3s ease-out;
}

.item-default {
  border-color: #94a3b8;
  background: #fff;
}

.item-active {
  border-color: #3b82f6;
  background: #dbeafe;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: scale(1.05);
}

.item-enqueue {
  border-color: #22c55e;
  background: #dcfce7;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
  transform: scale(1.1);
}

.item-dequeue {
  border-color: #ef4444;
  background: #fee2e2;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
  opacity: 0.6;
  transform: scale(0.9);
}
</style>
