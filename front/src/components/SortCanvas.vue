<template>
  <div class="sort-canvas">
    <div class="sort-stage">
      <div v-if="state.callStack.length > 0" class="stack-strip">
        <div class="stack-strip-head">
          <div class="stack-title">递归栈视图</div>
          <div class="stack-subtitle">主画布同步展示调用链</div>
        </div>
        <TransitionGroup tag="div" class="stack-row" name="stack-flow">
          <div
            v-for="(frame, index) in state.callStack"
            :key="`${frame.label}-${frame.left}-${frame.right}-${index}`"
            :class="['stack-item', `phase-${frame.phase}`, { active: index === state.callStack.length - 1 }]"
          >
            <div class="stack-topline">
              <div class="stack-index">#{{ index }}</div>
              <div class="stack-phase">{{ phaseText(frame.phase) }}</div>
            </div>
            <div class="stack-main">{{ frame.label }}({{ frame.left }}, {{ frame.right }})</div>
            <div class="stack-visual">
              <div class="stack-track">
                <div class="stack-range" :style="rangeStyle(frame)"></div>
              </div>
              <div class="stack-markers">
                <span class="marker">L{{ frame.left }}</span>
                <span class="marker">R{{ frame.right }}</span>
              </div>
            </div>
            <div v-if="index < state.callStack.length - 1" class="stack-arrow">
              <span class="arrow-line"></span>
              <span class="arrow-head"></span>
            </div>
          </div>
        </TransitionGroup>
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
    left: `${index * 62 + 26}px`,
  };
}

function rangeStyle(frame: SortVizState['callStack'][number]): Record<string, string> {
  const total = Math.max(props.state.items.length, 1);
  const left = Math.max(0, Math.min(frame.left, total - 1));
  const right = Math.max(left, Math.min(frame.right, total - 1));
  const width = ((right - left + 1) / total) * 100;
  const offset = (left / total) * 100;
  return {
    left: `${offset}%`,
    width: `${width}%`,
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
  padding-top: 6px;
  overflow-x: auto;
  overflow-y: visible;
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
  position: relative;
  overflow: hidden;
}

.stack-item.active {
  border-color: rgba(37, 99, 235, 0.28);
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.95), rgba(239, 246, 255, 0.95));
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.12);
  transform: translateY(-4px) scale(1.02);
}

.phase-enter {
  border-color: rgba(59, 130, 246, 0.18);
}

.phase-left,
.phase-right {
  border-color: rgba(124, 58, 237, 0.2);
}

.phase-merge {
  border-color: rgba(16, 185, 129, 0.24);
}

.phase-base,
.phase-done {
  border-color: rgba(245, 158, 11, 0.24);
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

.stack-visual {
  margin-top: 10px;
}

.stack-track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: rgba(203, 213, 225, 0.55);
  overflow: hidden;
}

.stack-range {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #34d399, #10b981);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.24);
}

.phase-left .stack-range,
.phase-right .stack-range {
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.22);
}

.phase-base .stack-range,
.phase-done .stack-range {
  background: linear-gradient(90deg, #f59e0b, #f97316);
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.22);
}

.stack-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10px;
  color: #64748b;
}

.marker {
  font-weight: 600;
}

.stack-phase {
  font-size: 11px;
  color: #475569;
}

.stack-arrow {
  position: absolute;
  right: -18px;
  top: 50%;
  width: 18px;
  height: 12px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.arrow-line {
  width: 12px;
  height: 2px;
  background: rgba(15, 118, 110, 0.45);
  border-radius: 999px;
}

.arrow-head {
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid rgba(15, 118, 110, 0.6);
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

.stack-flow-enter-active,
.stack-flow-leave-active,
.stack-flow-move {
  transition: transform 0.28s ease, opacity 0.28s ease;
}

.stack-flow-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.94);
}

.stack-flow-leave-to {
  opacity: 0;
  transform: translateY(-18px) scale(0.9);
}

@media (max-width: 980px) {
  .stack-strip-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
