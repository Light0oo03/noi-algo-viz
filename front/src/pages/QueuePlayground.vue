<template>
  <el-container class="page">
    <el-header class="header">
      <div class="title-row">
        <div class="title">NOI 算法可视化学习平台（队列）</div>
        <el-button class="ghost-btn" size="small" plain @click="goHome">返回首页</el-button>
      </div>
      <div class="sub">{{ currentAlgoDesc }}</div>
    </el-header>

    <el-container class="main">
      <el-main class="center">
        <QueueCanvas :state="vizState" />
        <div class="floating-panel">
          <QueueStatePanel :note="vizState.note" :state="vizState" />
        </div>
      </el-main>

      <el-aside class="right" width="360px">
        <CodeViewer
          :code="currentAlgoCode"
          :title="currentAlgoTitle"
          language="JavaScript"
          :highlight-lines="vizState.highlightLines"
        />
      </el-aside>
    </el-container>

    <el-footer class="footer">
      <div class="controls">
        <el-select
          v-model="selectedAlgo"
          placeholder="选择算法"
          size="small"
          style="width: 180px"
          @change="onAlgoChange"
        >
          <el-option label="队列基本操作" value="basic" />
          <el-option label="循环队列" value="circular" />
          <el-option label="双端队列" value="deque" />
        </el-select>
        <el-button-group>
          <el-button size="small" @click="play">播放</el-button>
          <el-button size="small" @click="pause">暂停</el-button>
          <el-button size="small" @click="step">单步</el-button>
          <el-button size="small" @click="stepBack">后退</el-button>
          <el-button size="small" @click="reset">重置</el-button>
        </el-button-group>
        <el-slider
          v-model="currentStep"
          :min="0"
          :max="totalSteps"
          :show-tooltip="false"
          style="width: 200px"
          @change="goToStep"
        />
        <span class="step-info">{{ currentStep }} / {{ totalSteps }}</span>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import CodeViewer from '../components/CodeViewer.vue';
import QueueCanvas from '../components/QueueCanvas.vue';
import QueueStatePanel from '../components/QueueStatePanel.vue';

import type { QueueVizState } from '../core/queue/types';
import { createInitialQueueVizState } from '../core/queue/types';
import { buildQueue } from '../core/queue/utils';
import { QueueTracePlayer, type QueuePlayerStatus } from '../core/queue/TracePlayer';
import { generateQueueBasicTrace, QUEUE_BASIC_DEFAULT_OPS } from '../core/queue/basic';
import { QUEUE_BASIC_CODE_JS } from '../core/queue/basic-code';
import { generateCircularQueueTrace, CIRCULAR_QUEUE_DEFAULT_CAPACITY, CIRCULAR_QUEUE_DEFAULT_OPS } from '../core/queue/circular-queue';
import { CIRCULAR_QUEUE_CODE_JS } from '../core/queue/circular-queue-code';
import { generateDequeTrace, DEQUE_DEFAULT_OPS } from '../core/queue/deque';
import { DEQUE_CODE_JS } from '../core/queue/deque-code';

const router = useRouter();
const selectedAlgo = ref('basic');

function buildInitialState(): QueueVizState {
  const queue = buildQueue([], { id: 'queue', label: '队列', startId: 1 });
  return createInitialQueueVizState([queue], '提示：点击播放开始演示。');
}

const vizState = reactive<QueueVizState>(buildInitialState());

function syncVizState(state: QueueVizState) {
  vizState.queues = state.queues;
  vizState.itemStates = state.itemStates;
  vizState.frontPointers = state.frontPointers;
  vizState.rearPointers = state.rearPointers;
  vizState.note = state.note;
  vizState.highlightLines = state.highlightLines;
}

const playerStatus = ref<QueuePlayerStatus>('idle');
const currentStep = ref<number>(0);
const totalSteps = ref<number>(0);

const player = new QueueTracePlayer(buildInitialState(), {
  interval: 800,
  onStateChange: (state) => {
    syncVizState(state);
    currentStep.value = player.stepIndex + 1;
  },
  onStatusChange: (status) => {
    playerStatus.value = status;
    totalSteps.value = player.totalSteps;
    currentStep.value = player.stepIndex + 1;
  },
});

const currentAlgoCode = computed(() => {
  if (selectedAlgo.value === 'basic') return QUEUE_BASIC_CODE_JS;
  if (selectedAlgo.value === 'circular') return CIRCULAR_QUEUE_CODE_JS;
  if (selectedAlgo.value === 'deque') return DEQUE_CODE_JS;
  return '';
});

const currentAlgoTitle = computed(() => {
  const titles: Record<string, string> = {
    'basic': '队列基本操作',
    'circular': '循环队列',
    'deque': '双端队列',
  };
  return titles[selectedAlgo.value] || '';
});

const currentAlgoDesc = computed(() => {
  if (selectedAlgo.value === 'basic') return '当前：队列基本操作（Enqueue/Dequeue/Peek）';
  if (selectedAlgo.value === 'circular') return '当前：循环队列（固定容量数组实现）';
  if (selectedAlgo.value === 'deque') return '当前：双端队列（两端操作）';
  return '';
});

function generateTrace(): boolean {
  const initialState = buildInitialState();
  player.updateInitialState(initialState);

  let trace;
  if (selectedAlgo.value === 'basic') {
    trace = generateQueueBasicTrace(QUEUE_BASIC_DEFAULT_OPS);
  } else if (selectedAlgo.value === 'circular') {
    trace = generateCircularQueueTrace(CIRCULAR_QUEUE_DEFAULT_CAPACITY, CIRCULAR_QUEUE_DEFAULT_OPS);
  } else if (selectedAlgo.value === 'deque') {
    trace = generateDequeTrace(DEQUE_DEFAULT_OPS);
  } else {
    return false;
  }

  player.load(trace);
  return true;
}

function play() {
  if (playerStatus.value === 'idle') {
    if (!generateTrace()) return;
  }
  player.play();
}

function pause() {
  player.pause();
}

function step() {
  if (playerStatus.value === 'idle') {
    if (!generateTrace()) return;
  }
  player.stepOnce();
}

function stepBack() {
  player.stepBack();
}

function goToStep(index: number) {
  player.goToStep(index - 1);
}

function reset() {
  player.reset();
  vizState.note = '已重置。点击播放开始演示。';
}

function onAlgoChange() {
  if (playerStatus.value === 'playing') {
    player.pause();
  }

  const newState = buildInitialState();
  player.updateInitialState(newState);
  player.clear();
  syncVizState(newState);
  currentStep.value = 0;
  totalSteps.value = 0;
  vizState.note = `已切换算法至 "${currentAlgoTitle.value}"`;
}

function goHome() {
  void router.push('/');
}
</script>

<style scoped>
.page {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  background: radial-gradient(1200px 600px at 20% 0%, rgba(147, 51, 234, 0.14), transparent 60%),
    radial-gradient(900px 500px at 90% 20%, rgba(168, 85, 247, 0.14), transparent 55%),
    var(--app-bg);
  color: var(--text);
}

.header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--muted-2);
}

.ghost-btn {
  border: 1px solid var(--border);
  background: transparent;
}

.main {
  min-height: 0;
  overflow: hidden;
}

.center {
  position: relative;
  min-height: 0;
  padding: 12px;
  overflow: hidden;
}

.floating-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 260px;
  max-height: calc(100% - 40px);
  overflow: auto;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  z-index: 10;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.right {
  border-left: 1px solid var(--border);
  padding: 12px;
  overflow: auto;
}

.footer {
  border-top: 1px solid var(--border);
  padding: 12px;
  height: auto;
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.step-info {
  font-size: 12px;
  color: var(--muted-2);
}
</style>
