<template>
  <div class="player-controls">
    <!-- 进度条 -->
    <div class="progress-wrapper" v-if="totalSteps > 0">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercent + '%' }"
        ></div>
        <div class="progress-text">{{ currentStep }} / {{ totalSteps }}</div>
      </div>
      <input
        type="range"
        class="progress-slider"
        :min="0"
        :max="totalSteps"
        :value="currentStep"
        @input="onSliderChange"
      />
    </div>

    <!-- 控制按钮 -->
    <div class="bar">
      <select class="algo-select" :value="selectedAlgo" @change="onAlgoChange">
        <option value="bfs">BFS（广度优先搜索）</option>
      </select>

      <button @click="$emit('stepBack')" :disabled="currentStep <= 0 || status === 'playing'">上一步</button>
      <button @click="onPlayPause">{{ status === 'playing' ? '暂停' : '播放' }}</button>
      <button @click="$emit('step')" :disabled="status === 'ended'">下一步</button>
      <button @click="$emit('reset')">重置动画</button>
      <button class="reset-graph-btn" @click="$emit('resetGraph')">恢复默认图</button>

      <div class="status">状态：{{ statusLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'idle' | 'ready' | 'playing' | 'paused' | 'ended';
  currentStep: number;
  totalSteps: number;
  selectedAlgo: string;
}>();

const emit = defineEmits<{
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'step'): void;
  (e: 'stepBack'): void;
  (e: 'reset'): void;
  (e: 'resetGraph'): void;
  (e: 'goToStep', step: number): void;
  (e: 'update:selectedAlgo', algo: string): void;
}>();

const statusLabel = computed(() => {
  switch (props.status) {
    case 'idle': return '未运行';
    case 'ready': return '就绪';
    case 'playing': return '播放中';
    case 'paused': return '已暂停';
    case 'ended': return '已结束';
  }
});

const progressPercent = computed(() => {
  if (props.totalSteps === 0) return 0;
  return (props.currentStep / props.totalSteps) * 100;
});

function onSliderChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const step = parseInt(target.value, 10);
  emit('goToStep', step - 1); // 转换为 index（0-based），0 表示第一步
}

function onAlgoChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('update:selectedAlgo', target.value);
}

function onPlayPause() {
  if (props.status === 'playing') {
    emit('pause');
  } else {
    emit('play');
  }
}
</script>

<style scoped>
.player-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-wrapper {
  position: relative;
  width: 100%;
}

.progress-bar {
  height: 12px;
  background: rgba(6, 95, 70, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 600;
  color: var(--text);
}

.progress-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 12px;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

.bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.algo-select {
  background: var(--panel-solid);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

button {
  background: var(--btn-bg);
  color: var(--btn-text);
  border: 1px solid var(--btn-border);
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}
button:hover {
  border-color: var(--border-strong);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.reset-graph-btn {
  background: rgba(234, 88, 12, 0.12);
  border-color: rgba(234, 88, 12, 0.4);
  color: #9a3412;
}
.reset-graph-btn:hover {
  background: rgba(234, 88, 12, 0.16);
}
.status {
  margin-left: auto;
  font-size: 12px;
  color: var(--muted-2);
}
</style>
