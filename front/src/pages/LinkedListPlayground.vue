<template>
  <el-container class="page">
    <el-header class="header">
      <div class="title-row">
        <div class="title">NOI 算法可视化学习平台（链表）</div>
        <el-button class="ghost-btn" size="small" plain @click="goHome">返回首页</el-button>
      </div>
      <div class="sub">{{ currentAlgoDesc }}</div>
    </el-header>

    <el-container class="main">
      <el-main class="center">
        <LinkedListCanvas :state="vizState" />
        <div class="floating-panel">
          <LinkedListStatePanel :note="vizState.note" :state="vizState" />
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
      <LinkedListControls
        :status="playerStatus"
        :current-step="currentStep"
        :total-steps="totalSteps"
        :selected-algo="selectedAlgo"
        @update:selected-algo="selectedAlgo = $event"
        @play="play"
        @pause="pause"
        @step="step"
        @step-back="stepBack"
        @reset="reset"
        @go-to-step="goToStep"
      >
        <template #extra>
          <el-input-number
            v-if="selectedAlgo === 'remove-k'"
            v-model="removeK"
            :min="1"
            :max="8"
            size="small"
            class="k-input"
            controls-position="right"
          />
        </template>
      </LinkedListControls>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import CodeViewer from '../components/CodeViewer.vue';
import LinkedListCanvas from '../components/LinkedListCanvas.vue';
import LinkedListControls from '../components/LinkedListControls.vue';
import LinkedListStatePanel from '../components/LinkedListStatePanel.vue';

import type { ListView, ListVizState } from '../core/linked-list/types';
import { createInitialListVizState } from '../core/linked-list/types';
import { buildList } from '../core/linked-list/utils';
import { ListTracePlayer, type ListPlayerStatus } from '../core/linked-list/TracePlayer';
import { generateReverseTrace } from '../core/linked-list/reverse';
import { generateMiddleTrace } from '../core/linked-list/middle';
import { generateCycleTrace } from '../core/linked-list/cycle';
import { generateMergeTrace } from '../core/linked-list/merge';
import { generateRemoveKTrace } from '../core/linked-list/remove-k';
import { REVERSE_CODE_JS } from '../core/linked-list/reverse-code';
import { MIDDLE_CODE_JS } from '../core/linked-list/middle-code';
import { CYCLE_CODE_JS } from '../core/linked-list/cycle-code';
import { MERGE_CODE_JS } from '../core/linked-list/merge-code';
import { REMOVE_K_CODE_JS } from '../core/linked-list/remove-k-code';

const router = useRouter();

const selectedAlgo = ref<string>('reverse');
const removeK = ref<number>(2);

function buildListsForAlgo(algo: string): ListView[] {
  switch (algo) {
    case 'merge': {
      const listA = buildList([1, 4, 7], { id: 'list-a', label: '链表 A', startId: 1 });
      const listB = buildList([2, 3, 8], { id: 'list-b', label: '链表 B', startId: 10 });
      return [listA, listB];
    }
    case 'cycle': {
      const list = buildList([1, 2, 3, 4, 5, 6], {
        id: 'list',
        label: '链表',
        startId: 1,
        cycleAtIndex: 2,
      });
      return [list];
    }
    default: {
      const list = buildList([1, 2, 3, 4, 5, 6], { id: 'list', label: '链表', startId: 1 });
      return [list];
    }
  }
}

function buildInitialState(algo: string): ListVizState {
  const lists = buildListsForAlgo(algo);
  return createInitialListVizState(lists, '提示：选择算法后点击播放或单步。');
}

const vizState = reactive<ListVizState>(buildInitialState(selectedAlgo.value));

function syncVizState(state: ListVizState) {
  vizState.lists = state.lists;
  vizState.nodeStates = state.nodeStates;
  vizState.pointers = state.pointers;
  vizState.edgeHighlights = state.edgeHighlights;
  vizState.note = state.note;
  vizState.highlightLines = state.highlightLines;
}

const playerStatus = ref<ListPlayerStatus>('idle');
const currentStep = ref<number>(0);
const totalSteps = ref<number>(0);

const player = new ListTracePlayer(buildInitialState(selectedAlgo.value), {
  interval: 600,
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
  switch (selectedAlgo.value) {
    case 'reverse':
      return REVERSE_CODE_JS;
    case 'middle':
      return MIDDLE_CODE_JS;
    case 'cycle':
      return CYCLE_CODE_JS;
    case 'merge':
      return MERGE_CODE_JS;
    case 'remove-k':
      return REMOVE_K_CODE_JS;
    default:
      return REVERSE_CODE_JS;
  }
});

const currentAlgoTitle = computed(() => {
  switch (selectedAlgo.value) {
    case 'reverse':
      return '反转链表';
    case 'middle':
      return '链表中点（快慢指针）';
    case 'cycle':
      return '判断环（Floyd）';
    case 'merge':
      return '合并两个有序链表';
    case 'remove-k':
      return '删除倒数第 k 个节点';
    default:
      return '链表算法';
  }
});

const currentAlgoDesc = computed(() => {
  switch (selectedAlgo.value) {
    case 'reverse':
      return '当前：反转链表（双指针）';
    case 'middle':
      return '当前：链表中点（快慢指针）';
    case 'cycle':
      return '当前：判断环（快慢指针）';
    case 'merge':
      return '当前：合并两个有序链表';
    case 'remove-k':
      return `当前：删除倒数第 k 个节点（k=${removeK.value}）`;
    default:
      return '当前：链表算法';
  }
});

function generateTrace(): boolean {
  const lists = buildListsForAlgo(selectedAlgo.value);
  const initialState = createInitialListVizState(lists, '提示：选择算法后点击播放或单步。');
  player.updateInitialState(initialState);

  switch (selectedAlgo.value) {
    case 'reverse': {
      const list = lists[0];
      if (!list) return false;
      const trace = generateReverseTrace(list);
      player.load(trace);
      return true;
    }
    case 'middle': {
      const list = lists[0];
      if (!list) return false;
      const trace = generateMiddleTrace(list);
      player.load(trace);
      return true;
    }
    case 'cycle': {
      const list = lists[0];
      if (!list) return false;
      const trace = generateCycleTrace(list);
      player.load(trace);
      return true;
    }
    case 'merge': {
      const listA = lists[0];
      const listB = lists[1];
      if (!listA || !listB) return false;
      const trace = generateMergeTrace(listA, listB);
      player.load(trace);
      return true;
    }
    case 'remove-k': {
      const list = lists[0];
      if (!list) return false;
      const trace = generateRemoveKTrace(list, removeK.value);
      player.load(trace);
      return true;
    }
  }
  return false;
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
  player.goToStep(index);
}

function reset() {
  player.reset();
  vizState.note = '已重置。选择算法后点击播放或单步。';
}

watch(
  selectedAlgo,
  () => {
    if (playerStatus.value === 'playing') {
      player.pause();
    }
    const newState = buildInitialState(selectedAlgo.value);
    player.updateInitialState(newState);
    player.clear();
    syncVizState(newState);
    currentStep.value = 0;
    totalSteps.value = 0;
    vizState.note = `已切换到 ${currentAlgoTitle.value}。`;
  }
);

watch(removeK, () => {
  if (selectedAlgo.value !== 'remove-k') return;
  const newState = buildInitialState(selectedAlgo.value);
  player.updateInitialState(newState);
  player.clear();
  syncVizState(newState);
  currentStep.value = 0;
  totalSteps.value = 0;
  vizState.note = `已更新 k=${removeK.value}，可重新播放。`;
});

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
  padding-bottom: 60px;
  border-bottom: 1px solid var(--border);
  position: relative;
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
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--muted-2);
}

.ghost-btn {
  border: 1px solid var(--border);
  background: transparent;
}

.ghost-btn:hover {
  border-color: var(--border-strong);
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
  pointer-events: auto;
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
  padding: 6px 12px 16px;
  height: auto;
  min-height: 76px;
  overflow: visible;
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
}

.k-input {
  width: 120px;
}
</style>
