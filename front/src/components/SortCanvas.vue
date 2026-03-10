<template>
  <div class="sort-canvas">
    <div :class="['sort-layout', { 'has-stack': state.callStack.length > 0 }]">
      <div class="sort-stage">
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

      <div v-if="state.callStack.length > 0" class="stack-panel">
        <div class="stack-title">递归栈视图</div>
        <div class="stack-subtitle">当前调用链会随步骤同步变化</div>
        <div class="stack-list">
          <div
            v-for="(frame, index) in state.callStack"
            :key="`${frame.label}-${frame.left}-${frame.right}-${index}`"
            :class="['stack-item', { active: index === state.callStack.length - 1 }]"
          >
            <div class="stack-index">#{{ index }}</div>
            <div class="stack-body">
              <div class="stack-main">{{ frame.label }}({{ frame.left }}, {{ frame.right }})</div>
              <div class="stack-phase">{{ phaseText(frame.phase) }}</div>
            </div>
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
    left: `${index * 62 + 28}px`,
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
  overflow-x: auto;
}

.sort-layout {
  display: flex;
  gap: 24px;
  min-height: 440px;
}

.sort-layout.has-stack .sort-stage {
  flex: 1;
  min-width: 420px;
}

.sort-stage {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
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

.stack-panel {
  width: 260px;
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(16, 185, 129, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(240, 253, 250, 0.92)),
    radial-gradient(circle at top, rgba(16, 185, 129, 0.16), transparent 55%);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.stack-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f766e;
}

.stack-subtitle {
  margin-top: 4px;
  font-size: 11px;
  color: #64748b;
}

.stack-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}

.stack-item {
  display: flex;
  gap: 10px;
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

.stack-body {
  min-width: 0;
}

.stack-main {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  font-family: monospace;
  word-break: break-word;
}

.stack-phase {
  margin-top: 4px;
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
  .sort-layout {
    flex-direction: column;
  }

  .sort-layout.has-stack .sort-stage {
    min-width: 0;
  }

  .stack-panel {
    width: 100%;
    flex-basis: auto;
  }
}
</style>
