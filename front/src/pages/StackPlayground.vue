<template>
  <el-container class="page">
    <el-header class="header">
      <div class="title-row">
        <div class="title">NOI 算法可视化学习平台（栈）</div>
        <el-button class="ghost-btn" size="small" plain @click="goHome">返回首页</el-button>
      </div>
      <div class="sub">{{ currentAlgoDesc }}</div>
    </el-header>

    <el-container class="main">
      <el-main class="center">
        <StackCanvas :state="vizState" />
        <div class="floating-panel">
          <StackStatePanel :note="vizState.note" :state="vizState" />
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
          <el-option label="有效的括号" value="valid-parentheses" />
          <el-option label="最小栈" value="min-stack" />
          <el-option label="单调栈（柱状图）" value="monotonic-stack" />
          <el-option label="逆波兰表达式" value="rpn-calculator" />
          <el-option label="栈实现队列" value="queue-by-stack" />
        </el-select>
        <el-input
          v-model="inputString"
          :placeholder="inputPlaceholder"
          size="small"
          style="width: 200px"
          @change="onInputChange"
        />
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
import StackCanvas from '../components/StackCanvas.vue';
import StackStatePanel from '../components/StackStatePanel.vue';

import type { StackVizState } from '../core/stack/types';
import { createInitialStackVizState } from '../core/stack/types';
import { buildStack } from '../core/stack/utils';
import { StackTracePlayer, type StackPlayerStatus } from '../core/stack/TracePlayer';
import { generateValidParenthesesTrace } from '../core/stack/valid-parentheses';
import { VALID_PARENTHESES_CODE_JS } from '../core/stack/valid-parentheses-code';
import { generateMinStackTrace, MIN_STACK_DEFAULT_OPS } from '../core/stack/min-stack';
import { MIN_STACK_CODE_JS } from '../core/stack/min-stack-code';
import { generateMonotonicStackTrace, MONOTONIC_STACK_DEFAULT_HEIGHTS } from '../core/stack/monotonic-stack';
import { MONOTONIC_STACK_CODE_JS } from '../core/stack/monotonic-stack-code';
import { generateRPNCalculatorTrace, RPN_CALCULATOR_DEFAULT_TOKENS } from '../core/stack/rpn-calculator';
import { RPN_CALCULATOR_CODE_JS } from '../core/stack/rpn-calculator-code';
import { generateQueueByStackTrace, QUEUE_BY_STACK_DEFAULT_OPS } from '../core/stack/queue-by-stack';
import { QUEUE_BY_STACK_CODE_JS } from '../core/stack/queue-by-stack-code';

const router = useRouter();
const selectedAlgo = ref('valid-parentheses');
const inputString = ref('({[]})');

const inputPlaceholder = computed(() => {
  if (selectedAlgo.value === 'valid-parentheses') return '输入括号序列，如: ({[]})';
  if (selectedAlgo.value === 'min-stack') return '操作序列（自动生成）';
  if (selectedAlgo.value === 'monotonic-stack') return '柱状图高度，如: 2,1,5,6,2,3';
  if (selectedAlgo.value === 'rpn-calculator') return '后缀表达式，如: 2,1,+,3,*';
  if (selectedAlgo.value === 'queue-by-stack') return '操作序列（自动生成）';
  return '输入数据';
});

function buildInitialState(): StackVizState {
  const stack = buildStack([], { id: 'stack', label: '栈', startId: 1 });
  return createInitialStackVizState([stack], '提示：输入括号序列后点击播放。');
}

const vizState = reactive<StackVizState>(buildInitialState());

function syncVizState(state: StackVizState) {
  vizState.stacks = state.stacks;
  vizState.itemStates = state.itemStates;
  vizState.topPointers = state.topPointers;
  vizState.note = state.note;
  vizState.highlightLines = state.highlightLines;
}

const playerStatus = ref<StackPlayerStatus>('idle');
const currentStep = ref<number>(0);
const totalSteps = ref<number>(0);

const player = new StackTracePlayer(buildInitialState(), {
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
  if (selectedAlgo.value === 'valid-parentheses') return VALID_PARENTHESES_CODE_JS;
  if (selectedAlgo.value === 'min-stack') return MIN_STACK_CODE_JS;
  if (selectedAlgo.value === 'monotonic-stack') return MONOTONIC_STACK_CODE_JS;
  if (selectedAlgo.value === 'rpn-calculator') return RPN_CALCULATOR_CODE_JS;
  if (selectedAlgo.value === 'queue-by-stack') return QUEUE_BY_STACK_CODE_JS;
  return '';
});

const currentAlgoTitle = computed(() => {
  const titles: Record<string, string> = {
    'valid-parentheses': '有效的括号',
    'min-stack': '最小栈',
    'monotonic-stack': '单调栈（柱状图最大矩形）',
    'rpn-calculator': '逆波兰表达式求值',
    'queue-by-stack': '栈实现队列',
  };
  return titles[selectedAlgo.value] || '';
});

const currentAlgoDesc = computed(() => {
  if (selectedAlgo.value === 'valid-parentheses') return `当前：有效的括号 - "${inputString.value}"`;
  if (selectedAlgo.value === 'min-stack') return '当前：最小栈（支持常数时间获取最小值）';
  if (selectedAlgo.value === 'monotonic-stack') return '当前：单调栈（柱状图最大矩形）';
  if (selectedAlgo.value === 'rpn-calculator') return `当前：逆波兰表达式 - "${inputString.value}"`;
  if (selectedAlgo.value === 'queue-by-stack') return '当前：栈实现队列';
  return '';
});

function generateTrace(): boolean {
  const initialState = buildInitialState();
  player.updateInitialState(initialState);

  let trace;
  if (selectedAlgo.value === 'valid-parentheses') {
    trace = generateValidParenthesesTrace(inputString.value);
  } else if (selectedAlgo.value === 'min-stack') {
    trace = generateMinStackTrace(MIN_STACK_DEFAULT_OPS);
  } else if (selectedAlgo.value === 'monotonic-stack') {
    const heights = inputString.value
      ? inputString.value.split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n))
      : MONOTONIC_STACK_DEFAULT_HEIGHTS;
    trace = generateMonotonicStackTrace(heights);
  } else if (selectedAlgo.value === 'rpn-calculator') {
    const tokens = inputString.value
      ? inputString.value.split(',').map(s => s.trim())
      : RPN_CALCULATOR_DEFAULT_TOKENS;
    trace = generateRPNCalculatorTrace(tokens);
  } else if (selectedAlgo.value === 'queue-by-stack') {
    trace = generateQueueByStackTrace(QUEUE_BY_STACK_DEFAULT_OPS);
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
  vizState.note = '已重置。输入括号序列后点击播放。';
}

function onInputChange() {
  if (playerStatus.value === 'playing') {
    player.pause();
  }
  const newState = buildInitialState();
  player.updateInitialState(newState);
  player.clear();
  syncVizState(newState);
  currentStep.value = 0;
  totalSteps.value = 0;
  vizState.note = `已更新输入，可重新播放。`;
}

function onAlgoChange() {
  if (playerStatus.value === 'playing') {
    player.pause();
  }

  // 设置默认输入
  if (selectedAlgo.value === 'valid-parentheses') {
    inputString.value = '({[]})';
  } else if (selectedAlgo.value === 'monotonic-stack') {
    inputString.value = MONOTONIC_STACK_DEFAULT_HEIGHTS.join(',');
  } else if (selectedAlgo.value === 'rpn-calculator') {
    inputString.value = RPN_CALCULATOR_DEFAULT_TOKENS.join(',');
  } else {
    inputString.value = '';
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
  background: radial-gradient(1200px 600px at 20% 0%, rgba(34, 197, 94, 0.14), transparent 60%),
    radial-gradient(900px 500px at 90% 20%, rgba(16, 185, 129, 0.14), transparent 55%),
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
