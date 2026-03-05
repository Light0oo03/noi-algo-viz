<template>
  <div class="sort-canvas">
    <div class="bars-row">
      <div
        v-for="(item, index) in state.items"
        :key="item.id"
        :class="['bar-wrap', itemStateClass(item.id)]"
      >
        <div class="bar" :style="barStyle(item.value)"></div>
        <div class="value">{{ item.value }}</div>
        <div class="index">{{ index }}</div>
      </div>
    </div>

    <div class="pointer-row">
      <div v-if="state.pointers.i !== undefined" class="pointer i" :style="pointerStyle(state.pointers.i)">i</div>
      <div v-if="state.pointers.j !== undefined" class="pointer j" :style="pointerStyle(state.pointers.j)">j</div>
      <div v-if="state.pointers.min !== undefined" class="pointer min" :style="pointerStyle(state.pointers.min)">min</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortVizState } from '../core/sort/types';

const props = defineProps<{
  state: SortVizState;
}>();

function itemStateClass(id: number): string {
  const st = props.state.itemStates[id] ?? 'default';
  return `item-${st}`;
}

function barStyle(value: number): Record<string, string> {
  const h = Math.max(16, value * 6);
  return { height: `${h}px` };
}

function pointerStyle(index: number): Record<string, string> {
  return {
    left: `${index * 62 + 28}px`,
  };
}
</script>

<style scoped>
.sort-canvas {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 50px 30px;
  min-height: 500px;
  overflow-x: auto;
}

.bars-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  min-height: 280px;
}

.bar-wrap {
  width: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.25s ease;
}

.bar {
  width: 34px;
  border-radius: 8px 8px 4px 4px;
  background: #94a3b8;
  transition: all 0.25s ease;
}

.value {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.index {
  font-size: 10px;
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

.i { background: #2563eb; }
.j { background: #7c3aed; }
.min { background: #f59e0b; }

.item-default .bar { background: #94a3b8; }
.item-active .bar { background: #3b82f6; }
.item-sorted .bar { background: #22c55e; }
.item-pivot .bar { background: #f59e0b; }
.item-swap .bar { background: #ef4444; }
</style>
