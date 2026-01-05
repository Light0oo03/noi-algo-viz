<template>
  <div class="page">
    <header class="header">
      <div class="title">NOI 算法可视化学习平台（MVP）</div>
      <div class="sub">当前：无向图 / BFS（起点固定为 0，邻居按 id 升序）</div>
    </header>

    <main class="main">
      <section class="left">
        <GraphCanvas
          :graph="graph"
          :node-states="vizState.nodeStates"
          :edge-states="vizState.edgeStates"
          :disabled="playerStatus === 'playing'"
          @update:graph="onUpdateGraph"
          @note="setNote"
        />
        <!-- 悬浮状态面板 -->
        <div class="floating-panel">
          <StatePanel
            :note="vizState.note"
            :queue="vizState.queue"
            :player-status="playerStatus"
            :node-states="vizState.nodeStates"
          />
        </div>
      </section>

      <aside class="right">
        <CodeViewer
          :code="currentAlgoCode"
          :title="currentAlgoTitle"
          language="JavaScript"
          :highlight-lines="vizState.highlightLines"
        />
      </aside>
    </main>

    <footer class="footer">
      <PlayerControls
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
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import GraphCanvas from '../components/GraphCanvas.vue';
import PlayerControls from '../components/PlayerControls.vue';
import StatePanel from '../components/StatePanel.vue';
import CodeViewer from '../components/CodeViewer.vue';

// 导入 core 模块
import type { Graph } from '../core/graph/types';
import { edgeKey } from '../core/graph/types';
import { generateBfsTrace } from '../core/algorithms/bfs';
import { BFS_CODE_JS } from '../core/algorithms/bfs-code';
import { TracePlayer, createInitialStateFromGraph } from '../core/trace/TracePlayer';
import type { PlayerStatus } from '../core/trace/TracePlayer';
import type { VizState } from '../core/trace/types';

// 导入 Pinia store
import { useGraphStore } from '../stores/graphStore';

// ---------------------------
// 图数据（使用 Pinia 持久化）
// ---------------------------
const graphStore = useGraphStore();
const { graph } = storeToRefs(graphStore);

// ---------------------------
// 可视化状态（方案1：用 reactive 维护，TracePlayer 通过回调更新）
// ---------------------------
function getInitialState(g: Graph): VizState {
  const nodeIds = g.nodes.map((n) => n.id);
  const edgeKeys = g.edges.map((e) => edgeKey(e.u, e.v));
  return {
    ...createInitialStateFromGraph(nodeIds, edgeKeys),
    note: '提示：双击空白添加节点；点击两个节点创建边；拖拽节点移动。',
  };
}

const vizState = reactive<VizState>(getInitialState(graph.value));

// 同步 VizState 到 reactive
function syncVizState(state: VizState) {
  vizState.nodeStates = state.nodeStates;
  vizState.edgeStates = state.edgeStates;
  vizState.queue = state.queue;
  vizState.note = state.note;
  vizState.highlightLines = state.highlightLines;
}

// ---------------------------
// 播放器状态
// ---------------------------
const playerStatus = ref<PlayerStatus>('idle');
const currentStep = ref<number>(0);
const totalSteps = ref<number>(0);
const selectedAlgo = ref<string>('bfs');

// ---------------------------
// 算法代码展示
// ---------------------------
const currentAlgoCode = computed(() => {
  switch (selectedAlgo.value) {
    case 'bfs':
      return BFS_CODE_JS;
    default:
      return BFS_CODE_JS;
  }
});

const currentAlgoTitle = computed(() => {
  switch (selectedAlgo.value) {
    case 'bfs':
      return 'BFS 广度优先搜索';
    default:
      return '算法代码';
  }
});

// ---------------------------
// TracePlayer 实例
// ---------------------------
const player = new TracePlayer(getInitialState(graph.value), {
  interval: 600,
  onStateChange: (state) => {
    syncVizState(state);
    // 更新步骤信息（stepIndex 是 0-based，显示时 +1）
    currentStep.value = player.stepIndex + 1;
  },
  onStatusChange: (status) => {
    playerStatus.value = status;
    totalSteps.value = player.totalSteps;
    currentStep.value = player.stepIndex + 1;
  },
});

// ---------------------------
// 图编辑回调
// ---------------------------
function onUpdateGraph(next: Graph) {
  graphStore.updateGraph(next);
  // 图变化时，清除播放器并更新初始状态
  // 这样下次播放时会重新生成基于新图的 trace
  if (playerStatus.value !== 'playing') {
    const newState = getInitialState(next);
    player.updateInitialState(newState);
    player.clear(); // 完全清除旧的 trace，重置为 idle 状态
    syncVizState(newState);
    // 重置步骤计数
    currentStep.value = 0;
    totalSteps.value = 0;
  }
}

function setNote(text: string) {
  vizState.note = text;
}

// ---------------------------
// 播放控制
// ---------------------------
function generateTrace() {
  // 根据选择的算法生成 trace
  if (selectedAlgo.value === 'bfs') {
    const startNode = 0;
    
    // 检查起点是否存在
    if (!graph.value.nodes.some((n) => n.id === startNode)) {
      vizState.note = `错误：起点节点 ${startNode} 不存在！请先添加节点 0。`;
      return false;
    }

    const trace = generateBfsTrace(graph.value, startNode);
    
    // 更新播放器初始状态
    player.updateInitialState(getInitialState(graph.value));
    
    // 加载 trace
    player.load(trace);
    return true;
  }
  
  // 后续可以在这里添加其他算法
  return false;
}

function play() {
  // 如果是 idle 状态，需要先生成 trace
  if (playerStatus.value === 'idle') {
    if (!generateTrace()) {
      return;
    }
  }
  player.play();
}

function pause() {
  player.pause();
}

function step() {
  // 如果是 idle 状态，需要先生成 trace
  if (playerStatus.value === 'idle') {
    if (!generateTrace()) {
      return;
    }
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
  // 重置后恢复提示文本
  vizState.note = '已重置。双击空白添加节点；点击两个节点创建边。';
}

// 监听图变化，重置播放器
watch(graph, () => {
  if (playerStatus.value === 'playing') {
    // 播放中不应该改图，但如果改了就暂停
    player.pause();
  }
}, { deep: true });
</script>

<style scoped>
.page {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #0b0f14;
  color: #e6edf3;
}
.header {
  padding: 12px 16px;
  border-bottom: 1px solid #1f2a37;
}
.title {
  font-size: 16px;
  font-weight: 600;
}
.sub {
  margin-top: 6px;
  font-size: 12px;
  color: #9fb0c0;
}
.main {
  display: grid;
  grid-template-columns: 1fr 360px;
  min-height: 0;
}
.left {
  position: relative;
  min-height: 0;
  padding: 12px;
}
.floating-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 260px;
  max-height: calc(100% - 40px);
  overflow: auto;
  background: rgba(11, 15, 20, 0.9);
  border: 1px solid #1f2a37;
  border-radius: 8px;
  padding: 12px;
  pointer-events: auto;
  z-index: 10;
}
.right {
  border-left: 1px solid #1f2a37;
  padding: 12px;
  overflow: auto;
}
.footer {
  border-top: 1px solid #1f2a37;
  padding: 10px 12px;
}
</style>
