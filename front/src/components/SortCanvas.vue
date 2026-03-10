<template>
  <div class="sort-canvas">
    <div class="sort-stage">
      <div v-if="state.callStack.length > 0" class="stack-strip">
        <div class="stack-strip-head">
          <div class="stack-title">递归栈视图</div>
          <div class="stack-subtitle">主画布同步展示调用链</div>
        </div>
        <div class="stack-row">
          <div
            v-for="(frame, index) in state.callStack"
            :key="`${frame.label}-${frame.left}-${frame.right}-${index}`"
            :class="['stack-item', { active: index === state.callStack.length - 1 }]"
          >
            <div class="stack-topline">
              <div class="stack-index">#{{ index }}</div>
              <div class="stack-phase">{{ phaseText(frame.phase) }}</div>
            </div>
            <div class="stack-main">{{ frame.label }}({{ frame.left }}, {{ frame.right }})</div>
          </div>
        </div>
      </div>

      <div class="bar-stage">
        <div class="bar-cluster">
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
      </div>
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
    left: `${(index + 1) * 62 + 26}px`,
  };
}

function phaseText(phase: SortVizState['callStack'][number]['phase']): string {
  switch (phase) {
    case 'enter':
      return '进入当前区间';
    case 'left':
      return '准备递归左侧';
    case 'right':
      return '准备递归右侧';
    case 'merge':
      return '执行合并';
    case 'base':
      return '到达递归基线';
    case 'done':
      return '当前调用返回';
    default:
      return phase;
  }
}
</script>

<style scoped>
.sort-canvas {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px;
  min-height: 500px;
  overflow: auto;
}

.sort-stage {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-height: 440px;
}

.stack-strip {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(16, 185, 129, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(240, 253, 250, 0.92)),
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.14), transparent 45%);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.stack-strip-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
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

.bar-stage {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 0;
}

.bar-cluster {
  display: inline-flex;
  flex-direction: column;
  gap: 18px;
  align-items: stretch;
  padding: 0 62px;
}

.pointer-row {
  position: relative;
  height: 24px;
}

.stack-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f766e;
}

.stack-subtitle {
  font-size: 11px;
  color: #64748b;
}

.stack-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  overflow: auto;
}

.stack-item {
  display: flex;
  flex-direction: column;
  min-width: 180px;
  max-width: 240px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(248, 250, 252, 0.9);
}

.stack-item.active {
  border-color: rgba(37, 99, 235, 0.28);
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.95), rgba(239, 246, 255, 0.95));
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.12);
}

.stack-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stack-index {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #0f766e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.stack-main {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  font-family: monospace;
  word-break: break-word;
}

.stack-phase {
  font-size: 11px;
  color: #475569;
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

@media (max-width: 980px) {
  .stack-strip-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
