<template>
  <div class="stack-canvas">
    <div v-for="(stack, stackIndex) in state.stacks" :key="stack.id" class="stack-container">
      <div class="stack-title">{{ stack.label }}</div>
      <div class="stack-wrapper">
        <div class="stack-items">
          <div
            v-for="(item, index) in stack.items"
            :key="item.id"
            :class="['stack-item', itemStateClass(stack.id, item.id)]"
            :style="{ bottom: `${index * 60}px` }"
          >
            <div class="item-value">{{ String.fromCharCode(item.value) }}</div>
            <div class="item-id">#{{ item.id }}</div>
          </div>
          <div v-if="stack.items.length === 0" class="empty-stack">空栈</div>
        </div>
        <div
          v-if="stack.items.length > 0"
          :class="['top-pointer', stackIndex === 0 ? 'top-pointer-left' : 'top-pointer-right']"
          :style="{ bottom: `${(stack.items.length - 1) * 60 + 25}px` }"
        >
          {{ stackIndex === 0 ? 'top →' : '← top' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import gsap from 'gsap';
import type { StackVizState } from '../core/stack/types';

const props = defineProps<{
  state: StackVizState;
}>();

function itemStateClass(stackId: string, itemId: number): string {
  const st = props.state.itemStates[stackId]?.[itemId] ?? 'default';
  return `item-${st}`;
}

watch(() => props.state, () => {
  const items = document.querySelectorAll('.stack-item');
  items.forEach((el) => {
    gsap.fromTo(el,
      { scale: 0.9, opacity: 0.7 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
  });
}, { deep: true });
</script>

<style scoped>
.stack-canvas {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 40px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 40px;
  min-height: 500px;
}

.stack-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.stack-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.stack-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.stack-items {
  position: relative;
  width: 120px;
  min-height: 400px;
  border-bottom: 4px solid #64748b;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.stack-item {
  position: absolute;
  width: 100%;
  height: 50px;
  border: 3px solid #94a3b8;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-value {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.item-id {
  font-size: 9px;
  color: #64748b;
}

.item-default {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.item-active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05));
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

.item-pushing {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05));
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  animation: pushAnim 0.5s ease-out;
}

.item-popping {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05));
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  animation: popAnim 0.5s ease-out;
}

@keyframes pushAnim {
  0% { transform: translateY(-20px) scale(0.8); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes popAnim {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: translateY(-20px) scale(0.8); opacity: 0; }
}

.top-pointer {
  position: absolute;
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  white-space: nowrap;
  transition: bottom 0.3s ease-out;
  animation: pointerBlink 1.5s ease-in-out infinite;
}

.top-pointer-left {
  left: -70px;
}

.top-pointer-right {
  right: -60px;
}

@keyframes pointerBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-stack {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  color: var(--muted-2);
  font-style: italic;
}
</style>
