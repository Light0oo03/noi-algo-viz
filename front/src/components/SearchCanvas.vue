<template>
  <div class="search-canvas">
    <div class="array-row">
      <div
        v-for="(item, index) in state.items"
        :key="item.id"
        :class="['array-item', itemStateClass(item.id)]"
      >
        <div class="value">{{ item.value }}</div>
        <div class="index">{{ index }}</div>
      </div>
    </div>

    <div class="pointer-row">
      <div v-if="state.pointers.left !== undefined" class="pointer left" :style="pointerStyle(state.pointers.left)">L</div>
      <div v-if="state.pointers.right !== undefined" class="pointer right" :style="pointerStyle(state.pointers.right)">R</div>
      <div v-if="state.pointers.mid !== undefined" class="pointer mid" :style="pointerStyle(state.pointers.mid)">M</div>
      <div v-if="state.pointers.index !== undefined" class="pointer idx" :style="pointerStyle(state.pointers.index)">i</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchVizState } from '../core/search/types';

const props = defineProps<{
  state: SearchVizState;
}>();

function itemStateClass(id: number): string {
  const st = props.state.itemStates[id] ?? 'default';
  return `item-${st}`;
}

function pointerStyle(index: number): Record<string, string> {
  return {
    left: `${index * 90 + 35}px`,
  };
}
</script>

<style scoped>
.search-canvas {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 60px 40px;
  min-height: 500px;
  overflow-x: auto;
}

.array-row {
  display: flex;
  gap: 10px;
  position: relative;
}

.array-item {
  width: 80px;
  height: 80px;
  border: 3px solid #94a3b8;
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.index {
  margin-top: 6px;
  font-size: 11px;
  color: #64748b;
}

.pointer-row {
  position: relative;
  height: 24px;
}

.pointer {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 8px;
  color: #fff;
}

.left { background: #2563eb; }
.right { background: #7c3aed; }
.mid { background: #f59e0b; }
.idx { background: #14b8a6; }

.item-default { border-color: #94a3b8; background: #fff; }
.item-active { border-color: #3b82f6; background: #dbeafe; transform: scale(1.05); }
.item-checked { border-color: #64748b; background: #f1f5f9; }
.item-found { border-color: #22c55e; background: #dcfce7; transform: scale(1.08); }
.item-eliminated { border-color: #cbd5e1; background: #f8fafc; opacity: 0.55; }
.item-pivot { border-color: #f59e0b; background: #fef3c7; transform: scale(1.05); }
</style>
