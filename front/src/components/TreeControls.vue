<template>
  <div class="player-controls">
    <div class="progress-wrapper">
      <el-slider
        v-if="totalSteps > 0"
        v-model="sliderValue"
        :min="1"
        :max="totalSteps"
        :show-tooltip="true"
        :format-tooltip="formatTooltip"
      />
      <div v-else class="progress-empty">未开始</div>
      <div v-if="totalSteps > 0" class="progress-text">{{ currentStep }} / {{ totalSteps }}</div>
      <div v-else class="progress-text">0 / 0</div>
    </div>

    <div class="bar">
      <el-select v-model="algoValue" size="small" class="algo-select">
        <el-option label="前序遍历" value="preorder" />
        <el-option label="中序遍历" value="inorder" />
        <el-option label="后序遍历" value="postorder" />
        <el-option label="层序遍历" value="level-order" />
      </el-select>

      <slot name="extra" />

      <el-button size="small" :disabled="currentStep <= 0 || status === 'playing'" @click="$emit('stepBack')">上一步</el-button>
      <el-button size="small" type="primary" @click="onPlayPause">{{ status === 'playing' ? '暂停' : '播放' }}</el-button>
      <el-button size="small" :disabled="status === 'ended'" @click="$emit('step')">下一步</el-button>
      <el-button size="small" @click="$emit('reset')">重置动画</el-button>
      <el-button size="small" type="warning" @click="$emit('resetTree')">恢复默认图</el-button>
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
  (e: 'resetTree'): void;
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

function formatTooltip(value: number) {
  return `${value} / ${props.totalSteps}`;
}

const sliderValue = computed({
  get() {
    return Math.max(props.currentStep, 1);
  },
  set(value: number) {
    emit('goToStep', value - 1);
  },
});

const algoValue = computed({
  get() {
    return props.selectedAlgo;
  },
  set(value: string) {
    emit('update:selectedAlgo', value);
  },
});

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
  gap: 8px;
}

.progress-wrapper {
  position: relative;
  width: 100%;
  padding: 0 4px;
  min-height: 40px;
}

.progress-empty {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
}

.progress-text {
  margin-top: 6px;
  text-align: right;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted-2);
}

.bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.algo-select {
  min-width: 160px;
  width: 180px;
}

.status {
  margin-left: auto;
  font-size: 12px;
  color: var(--muted-2);
}

::deep(.el-slider__runway) {
  margin-top: 6px;
}
</style>
