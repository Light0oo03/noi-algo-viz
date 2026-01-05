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
      </section>

      <aside class="right">
        <StatePanel
          :note="vizState.note"
          :queue="vizState.queue"
          :player-status="playerStatus"
          :node-states="vizState.nodeStates"
        />
      </aside>
    </main>

    <footer class="footer">
      <PlayerControls
        :status="playerStatus"
        @run="runBfs"
        @play="play"
        @pause="pause"
        @step="step"
        @reset="reset"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import GraphCanvas from '../components/GraphCanvas.vue';
import PlayerControls from '../components/PlayerControls.vue';
import StatePanel from '../components/StatePanel.vue';

// 导入 core 模块
import type { Graph } from '../core/graph/types';
import { edgeKey } from '../core/graph/types';
import { generateBfsTrace } from '../core/algorithms/bfs';
import { TracePlayer, createInitialStateFromGraph } from '../core/trace/TracePlayer';
import type { PlayerStatus } from '../core/trace/TracePlayer';
import type { VizState } from '../core/trace/types';

// ---------------------------
// 图数据
// ---------------------------
const graph = ref<Graph>({
  nodes: [
    { id: 0, x: 120, y: 120 },
    { id: 1, x: 280, y: 180 },
    { id: 2, x: 200, y: 300 },
  ],
  edges: [
    { u: 0, v: 1, w: 1 },
    { u: 1, v: 2, w: 1 },
  ],
});

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
}

// ---------------------------
// 播放器状态
// ---------------------------
const playerStatus = ref<PlayerStatus>('idle');

// ---------------------------
// TracePlayer 实例
// ---------------------------
const player = new TracePlayer(getInitialState(graph.value), {
  interval: 600,
  onStateChange: (state) => {
    syncVizState(state);
  },
  onStatusChange: (status) => {
    playerStatus.value = status;
  },
});

// ---------------------------
// 图编辑回调
// ---------------------------
function onUpdateGraph(next: Graph) {
  graph.value = next;
  // 图变化时（非播放状态），更新播放器初始状态
  if (playerStatus.value !== 'playing') {
    const newState = getInitialState(next);
    player.updateInitialState(newState);
    syncVizState(newState);
  }
}

function setNote(text: string) {
  vizState.note = text;
}

// ---------------------------
// 播放控制
// ---------------------------
function runBfs() {
  // 1. 生成 BFS trace（起点固定为 0）
  const startNode = 0;
  
  // 检查起点是否存在
  if (!graph.value.nodes.some((n) => n.id === startNode)) {
    vizState.note = `错误：起点节点 ${startNode} 不存在！请先添加节点 0。`;
    return;
  }

  const trace = generateBfsTrace(graph.value, startNode);
  
  // 2. 更新播放器初始状态
  player.updateInitialState(getInitialState(graph.value));
  
  // 3. 加载 trace 并播放
  player.load(trace);
  player.play();
}

function play() {
  player.play();
}

function pause() {
  player.pause();
}

function step() {
  player.stepOnce();
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
  grid-template-columns: 1fr 320px;
  min-height: 0;
}
.left {
  min-height: 0;
  padding: 12px;
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
