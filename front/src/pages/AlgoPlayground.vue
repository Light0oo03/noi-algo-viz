<template>
  <el-container class="page">
    <el-header class="header">
      <div class="title-row">
        <div class="title">NOI 算法可视化学习平台（MVP）</div>
        <el-button class="ghost-btn" size="small" plain @click="goHome">返回首页</el-button>
      </div>
      <div class="sub">{{ currentAlgoDesc }}</div>
      <div class="auth">
        <template v-if="auth.isAuthed">
          <span class="auth-user">{{ auth.user?.email }}</span>
          <el-button size="small" type="primary" @click="onLogout">退出</el-button>
        </template>
        <template v-else>
          <el-button size="small" type="primary" @click="authDialogOpen = true">登录/注册</el-button>
        </template>
      </div>
    </el-header>

    <el-container class="main">
      <el-aside class="side-menu" :width="sideCollapsed ? '72px' : '240px'">
        <div class="side-title">
          <span v-if="!sideCollapsed">算法目录</span>
          <el-button
            class="collapse-btn"
            text
            circle
            :icon="sideCollapsed ? Expand : Fold"
            :aria-label="sideCollapsed ? '展开' : '收起'"
            @click="sideCollapsed = !sideCollapsed"
          />
        </div>
        <el-menu
          :default-active="selectedAlgo"
          :collapse="sideCollapsed"
          :collapse-transition="false"
          :unique-opened="false"
          :default-openeds="defaultOpeneds"
          @select="onMenuSelect"
        >
          <el-sub-menu v-for="section in menuSections" :key="section.id" :index="section.id">
            <template #title>
              <span>{{ section.title }}</span>
            </template>
            <el-menu-item
              v-for="item in section.items"
              :key="item.id"
              :index="item.algoKey || item.id"
              :disabled="item.disabled"
            >
              {{ item.label }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main class="center">
        <GraphCanvas
          v-if="!isListAlgo && !isStackAlgo && !isQueueAlgo && !isTreeAlgo"
          :graph="graph"
          :node-states="vizState.nodeStates"
          :edge-states="vizState.edgeStates"
          :disabled="!canEditGraph"
          :disabled-hint="disabledHint"
          @update:graph="onUpdateGraph"
          @note="setNote"
          @disabled-action="onDisabledGraphAction"
        />
        <LinkedListCanvas v-else-if="isListAlgo" :state="listVizState" />
        <StackCanvas v-else-if="isStackAlgo" :state="stackVizState" />
        <QueueCanvas v-else-if="isQueueAlgo" :state="queueVizState" />
        <TreeCanvas
          v-else-if="isTreeAlgo"
          :state="treeVizState"
          :disabled="treePlayerStatus === 'playing'"
          disabled-hint="播放中：已禁用树编辑"
          @update:tree="onUpdateTree"
          @note="setTreeNote"
          @disabled-action="onDisabledTreeAction"
        />
        <div class="floating-panel">
          <StatePanel
            v-if="!isListAlgo && !isStackAlgo && !isQueueAlgo && !isTreeAlgo"
            :note="vizState.note"
            :queue="vizState.queue"
            :player-status="graphPlayerStatus"
            :node-states="vizState.nodeStates"
            :algo="selectedAlgo"
          />
          <LinkedListStatePanel v-else-if="isListAlgo" :note="listVizState.note" :state="listVizState" />
          <StackStatePanel v-else-if="isStackAlgo" :note="stackVizState.note" :state="stackVizState" />
          <QueueStatePanel v-else-if="isQueueAlgo" :note="queueVizState.note" :state="queueVizState" />
          <TreeStatePanel v-else-if="isTreeAlgo" :note="treeVizState.note" :state="treeVizState" />
        </div>
      </el-main>

      <el-aside class="right" width="360px">
        <CodeViewer
          :code="currentAlgoCode"
          :title="currentAlgoTitle"
          language="JavaScript"
          :highlight-lines="currentHighlightLines"
        />
      </el-aside>
    </el-container>

    <el-footer class="footer">
      <PlayerControls
        v-if="!isListAlgo && !isStackAlgo && !isQueueAlgo && !isTreeAlgo"
        :status="graphPlayerStatus"
        :current-step="currentStep"
        :total-steps="totalSteps"
        :selected-algo="selectedAlgo"
        @update:selected-algo="selectedAlgo = $event"
        @play="play"
        @pause="pause"
        @step="step"
        @step-back="stepBack"
        @reset="reset"
        @reset-graph="resetGraphToDefault"
        @go-to-step="goToStep"
      />
      <LinkedListControls
        v-else-if="isListAlgo"
        :status="listPlayerStatus"
        :current-step="listCurrentStep"
        :total-steps="listTotalSteps"
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
      <LinkedListControls
        v-else-if="isStackAlgo"
        :status="stackPlayerStatus"
        :current-step="stackCurrentStep"
        :total-steps="stackTotalSteps"
        :selected-algo="selectedAlgo"
        @update:selected-algo="selectedAlgo = $event"
        @play="play"
        @pause="pause"
        @step="step"
        @step-back="stepBack"
        @reset="reset"
        @go-to-step="goToStep"
      />
      <LinkedListControls
        v-else-if="isQueueAlgo"
        :status="queuePlayerStatus"
        :current-step="queueCurrentStep"
        :total-steps="queueTotalSteps"
        :selected-algo="selectedAlgo"
        @update:selected-algo="selectedAlgo = $event"
        @play="play"
        @pause="pause"
        @step="step"
        @step-back="stepBack"
        @reset="reset"
        @go-to-step="goToStep"
      />
      <TreeControls
        v-else-if="isTreeAlgo"
        :status="treePlayerStatus"
        :current-step="treeCurrentStep"
        :total-steps="treeTotalSteps"
        :selected-algo="selectedAlgo"
        @update:selected-algo="selectedAlgo = $event"
        @play="play"
        @pause="pause"
        @step="step"
        @step-back="stepBack"
        @reset="reset"
        @reset-tree="resetTreeToDefault"
        @go-to-step="goToStep"
      >
        <template #extra>
          <el-input
            v-model="treeInput"
            size="small"
            class="tree-input"
            placeholder="层序数组，如 1,2,3,null,4"
            clearable
          />
        </template>
      </TreeControls>
    </el-footer>

    <el-dialog v-model="authDialogOpen" title="登录 / 注册" width="360px">
      <el-form label-position="top" class="auth-form">
        <el-form-item label="邮箱">
          <el-input v-model="authEmail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="authPassword" placeholder="至少 8 位" show-password type="password" />
        </el-form-item>
      </el-form>
      <el-alert v-if="authError" class="auth-error" type="error" :closable="false" :title="authError" />
      <template #footer>
        <el-button @click="onRegister">注册</el-button>
        <el-button type="primary" @click="onLogin">登录</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="loginModalOpen" title="需要登录" width="360px" :show-close="false">
      <div class="modal-body">登录后才能修改图（新增节点/连边/删除/拖拽）。</div>
      <template #footer>
        <el-button @click="loginModalOpen = false">关闭</el-button>
        <el-button type="primary" @click="goLogin">去登录</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Fold, Expand } from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia';
import GraphCanvas from '../components/GraphCanvas.vue';
import PlayerControls from '../components/PlayerControls.vue';
import StatePanel from '../components/StatePanel.vue';
import LinkedListCanvas from '../components/LinkedListCanvas.vue';
import LinkedListControls from '../components/LinkedListControls.vue';
import LinkedListStatePanel from '../components/LinkedListStatePanel.vue';
import StackCanvas from '../components/StackCanvas.vue';
import StackStatePanel from '../components/StackStatePanel.vue';
import QueueCanvas from '../components/QueueCanvas.vue';
import QueueStatePanel from '../components/QueueStatePanel.vue';
import TreeCanvas from '../components/TreeCanvas.vue';
import TreeStatePanel from '../components/TreeStatePanel.vue';
import TreeControls from '../components/TreeControls.vue';
import CodeViewer from '../components/CodeViewer.vue';
import { sideMenuSections } from '../config/sideMenu';

// 导入 core 模块
import type { Graph } from '../core/graph/types';
import { edgeKey } from '../core/graph/types';
import { generateBfsTrace } from '../core/algorithms/bfs';
import { generateDfsTrace } from '../core/algorithms/dfs';
import { generateDijkstraTrace } from '../core/algorithms/dijkstra';
import { generatePrimTrace } from '../core/algorithms/prim';
import { generateKruskalTrace } from '../core/algorithms/kruskal';
import { BFS_CODE_JS } from '../core/algorithms/bfs-code';
import { DFS_CODE_JS } from '../core/algorithms/dfs-code';
import { DIJKSTRA_CODE_JS } from '../core/algorithms/dijkstra-code';
import { PRIM_CODE_JS } from '../core/algorithms/prim-code';
import { KRUSKAL_CODE_JS } from '../core/algorithms/kruskal-code';
import { TracePlayer, createInitialStateFromGraph } from '../core/trace/TracePlayer';
import type { PlayerStatus } from '../core/trace/TracePlayer';
import type { VizState } from '../core/trace/types';
import { ListTracePlayer, type ListPlayerStatus } from '../core/linked-list/TracePlayer';
import type { ListView, ListVizState } from '../core/linked-list/types';
import { createInitialListVizState } from '../core/linked-list/types';
import { buildList } from '../core/linked-list/utils';
import { generateReverseTrace } from '../core/linked-list/reverse';
import { generateMiddleTrace } from '../core/linked-list/middle';
import { StackTracePlayer, type StackPlayerStatus } from '../core/stack/TracePlayer';
import type { StackVizState } from '../core/stack/types';
import { createInitialStackVizState } from '../core/stack/types';
import { buildStack } from '../core/stack/utils';
import { generateValidParenthesesTrace } from '../core/stack/valid-parentheses';
import { VALID_PARENTHESES_CODE_JS } from '../core/stack/valid-parentheses-code';
import { generateMinStackTrace, MIN_STACK_DEFAULT_OPS } from '../core/stack/min-stack';
import { MIN_STACK_CODE_JS } from '../core/stack/min-stack-code';
import { generateMonotonicStackTrace } from '../core/stack/monotonic-stack';
import { MONOTONIC_STACK_CODE_JS } from '../core/stack/monotonic-stack-code';
import { generateRPNCalculatorTrace } from '../core/stack/rpn-calculator';
import { RPN_CALCULATOR_CODE_JS } from '../core/stack/rpn-calculator-code';
import { generateQueueByStackTrace, QUEUE_BY_STACK_DEFAULT_OPS } from '../core/stack/queue-by-stack';
import { QUEUE_BY_STACK_CODE_JS } from '../core/stack/queue-by-stack-code';
import { QueueTracePlayer, type QueuePlayerStatus } from '../core/queue/TracePlayer';
import type { QueueVizState } from '../core/queue/types';
import { createInitialQueueVizState } from '../core/queue/types';
import { generateQueueBasicTrace, QUEUE_BASIC_DEFAULT_OPS } from '../core/queue/basic';
import { QUEUE_BASIC_CODE_JS } from '../core/queue/basic-code';
import { generateCircularQueueTrace, CIRCULAR_QUEUE_DEFAULT_OPS } from '../core/queue/circular-queue';
import { CIRCULAR_QUEUE_CODE_JS } from '../core/queue/circular-queue-code';
import { generateDequeTrace, DEQUE_DEFAULT_OPS } from '../core/queue/deque';
import { DEQUE_CODE_JS } from '../core/queue/deque-code';
import { TreeTracePlayer, type TreePlayerStatus } from '../core/tree/TracePlayer';
import type { TreeView, TreeVizState } from '../core/tree/types';
import { createInitialTreeVizState, buildBinaryTree } from '../core/tree/utils';
import { generateTraversalTrace } from '../core/tree/traversal';
import { TRAVERSAL_CODE_JS } from '../core/tree/traversal-code';
import { generateLevelOrderTrace } from '../core/tree/level-order';
import { LEVEL_ORDER_CODE_JS } from '../core/tree/level-order-code';
import { generateCycleTrace } from '../core/linked-list/cycle';
import { generateMergeTrace } from '../core/linked-list/merge';
import { generateRemoveKTrace } from '../core/linked-list/remove-k';
import { REVERSE_CODE_JS } from '../core/linked-list/reverse-code';
import { MIDDLE_CODE_JS } from '../core/linked-list/middle-code';
import { CYCLE_CODE_JS } from '../core/linked-list/cycle-code';
import { MERGE_CODE_JS } from '../core/linked-list/merge-code';
import { REMOVE_K_CODE_JS } from '../core/linked-list/remove-k-code';

// 导入 Pinia store
import { useGraphStore } from '../stores/graphStore';
import type { UpdateGraphOptions } from '../stores/graphStore';
import { useAuthStore } from '../stores/authStore';
import { apiUrl } from '../config/api';

const ALGO_STORAGE_KEY = 'noi-algo-viz:selected-algo';
const TREE_STORAGE_KEY_PREFIX = 'noi-algo-viz:tree';

function getAllEnabledAlgoKeys(): string[] {
  return sideMenuSections
    .flatMap((section) => section.items)
    .filter((item) => !item.disabled)
    .map((item) => item.algoKey || item.id);
}

function getInitialAlgo(): string {
  const fallback = 'bfs';
  const enabledKeys = getAllEnabledAlgoKeys();
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(ALGO_STORAGE_KEY);
  if (!stored) return fallback;
  return enabledKeys.includes(stored) ? stored : fallback;
}

function getCurrentTreeStorageKey(): string {
  const userId = auth.user?.id;
  return userId ? `${TREE_STORAGE_KEY_PREFIX}:${userId}` : `${TREE_STORAGE_KEY_PREFIX}:guest`;
}

function isValidTreeView(value: unknown): value is TreeView {
  if (!value || typeof value !== 'object') return false;
  const tree = value as any;
  if (typeof tree.id !== 'string' || typeof tree.label !== 'string') return false;
  if (!Array.isArray(tree.nodes)) return false;
  const nodesOk = tree.nodes.every((node: any) =>
    node
    && typeof node === 'object'
    && Number.isFinite(node.id)
    && Number.isFinite(node.value)
    && (node.left === null || Number.isFinite(node.left))
    && (node.right === null || Number.isFinite(node.right))
    && (node.x === undefined || Number.isFinite(node.x))
    && (node.y === undefined || Number.isFinite(node.y))
  );
  if (!nodesOk) return false;
  return tree.root === null || Number.isFinite(tree.root);
}

function saveTreeToLocal(nextTree: TreeView) {
  if (typeof window === 'undefined') return;
  const key = getCurrentTreeStorageKey();
  window.localStorage.setItem(key, JSON.stringify(nextTree));
}

function loadTreeFromLocal(): TreeView | null {
  if (typeof window === 'undefined') return null;
  const key = getCurrentTreeStorageKey();
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isValidTreeView(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function restoreTreeFromLocal(note: string): boolean {
  const localTree = loadTreeFromLocal();
  if (!localTree) return false;
  resetTreePlayer(localTree, note);
  return true;
}

// ---------------------------
// 图数据（使用 Pinia 持久化）
// ---------------------------
const graphStore = useGraphStore();
const { graph } = storeToRefs(graphStore);

const auth = useAuthStore();
const router = useRouter();
const authDialogOpen = ref<boolean>(false);
const loginModalOpen = ref<boolean>(false);
const authEmail = ref<string>('');
const authPassword = ref<string>('');
const authError = ref<string>('');

type ToastKind = 'success' | 'error' | 'info';

function pushToast(kind: ToastKind, text: string) {
  ElMessage({
    type: kind,
    message: text,
    duration: 1500,
    showClose: false,
  });
}

function clearAuthForm() {
  authEmail.value = '';
  authPassword.value = '';
  authError.value = '';
}

const isListAlgo = computed(() => (
  selectedAlgo.value === 'reverse'
  || selectedAlgo.value === 'middle'
  || selectedAlgo.value === 'cycle'
  || selectedAlgo.value === 'merge'
  || selectedAlgo.value === 'remove-k'
));

const isStackAlgo = computed(() => (
  selectedAlgo.value === 'valid-parentheses'
  || selectedAlgo.value === 'min-stack'
  || selectedAlgo.value === 'monotonic-stack'
  || selectedAlgo.value === 'rpn-calculator'
  || selectedAlgo.value === 'queue-by-stack'
));

const isQueueAlgo = computed(() => (
  selectedAlgo.value === 'basic'
  || selectedAlgo.value === 'circular'
  || selectedAlgo.value === 'deque'
));

const isTreeAlgo = computed(() => (
  selectedAlgo.value === 'preorder'
  || selectedAlgo.value === 'inorder'
  || selectedAlgo.value === 'postorder'
  || selectedAlgo.value === 'level-order'
));

const canEditGraph = computed(() => (
  auth.isAuthed
  && graphPlayerStatus.value !== 'playing'
  && !isListAlgo.value
  && !isStackAlgo.value
  && !isQueueAlgo.value
  && !isTreeAlgo.value
));
const disabledHint = computed(() => {
  if (graphPlayerStatus.value === 'playing') return '播放中：已禁用编辑';
  if (!auth.isAuthed) return '未登录：请先登录后编辑';
  return '已禁用编辑';
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
  vizState.highlightLines = state.highlightLines;
}

// ---------------------------
// 播放器状态（图）
// ---------------------------
const graphPlayerStatus = ref<PlayerStatus>('idle');
const currentStep = ref<number>(0);
const totalSteps = ref<number>(0);
const selectedAlgo = ref<string>(getInitialAlgo());
const sideCollapsed = ref<boolean>(false);
const defaultOpeneds = ref<string[]>([]);

const menuSections = ref(sideMenuSections);

function getSectionIdByAlgo(algo: string): string {
  const section = menuSections.value.find((group) =>
    group.items.some((item) => (item.algoKey || item.id) === algo && !item.disabled)
  );
  return section?.id ?? 'graph';
}

defaultOpeneds.value = [getSectionIdByAlgo(selectedAlgo.value)];

// ---------------------------
// 算法代码展示
// ---------------------------
const currentAlgoCode = computed(() => {
  switch (selectedAlgo.value) {
    case 'bfs':
      return BFS_CODE_JS;
    case 'dfs':
      return DFS_CODE_JS;
    case 'dijkstra':
      return DIJKSTRA_CODE_JS;
    case 'prim':
      return PRIM_CODE_JS;
    case 'kruskal':
      return KRUSKAL_CODE_JS;
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
    case 'valid-parentheses':
      return VALID_PARENTHESES_CODE_JS;
    case 'min-stack':
      return MIN_STACK_CODE_JS;
    case 'monotonic-stack':
      return MONOTONIC_STACK_CODE_JS;
    case 'rpn-calculator':
      return RPN_CALCULATOR_CODE_JS;
    case 'queue-by-stack':
      return QUEUE_BY_STACK_CODE_JS;
    case 'basic':
      return QUEUE_BASIC_CODE_JS;
    case 'circular':
      return CIRCULAR_QUEUE_CODE_JS;
    case 'deque':
      return DEQUE_CODE_JS;
    case 'preorder':
      return TRAVERSAL_CODE_JS.preorder;
    case 'inorder':
      return TRAVERSAL_CODE_JS.inorder;
    case 'postorder':
      return TRAVERSAL_CODE_JS.postorder;
    case 'level-order':
      return LEVEL_ORDER_CODE_JS;
    default:
      return BFS_CODE_JS;
  }
});

const currentAlgoTitle = computed(() => {
  switch (selectedAlgo.value) {
    case 'bfs':
      return 'BFS 广度优先搜索';
    case 'dfs':
      return 'DFS 深度优先搜索';
    case 'dijkstra':
      return 'Dijkstra 最短路径';
    case 'prim':
      return 'Prim 最小生成树';
    case 'kruskal':
      return 'Kruskal 最小生成树';
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
    case 'valid-parentheses':
      return '有效的括号';
    case 'min-stack':
      return '最小栈';
    case 'monotonic-stack':
      return '单调栈（柱状图）';
    case 'rpn-calculator':
      return '逆波兰表达式';
    case 'queue-by-stack':
      return '栈实现队列';
    case 'basic':
      return '队列基本操作';
    case 'circular':
      return '循环队列';
    case 'deque':
      return '双端队列';
    case 'preorder':
      return '二叉树前序遍历';
    case 'inorder':
      return '二叉树中序遍历';
    case 'postorder':
      return '二叉树后序遍历';
    case 'level-order':
      return '二叉树层序遍历';
    default:
      return '算法代码';
  }
});

const currentAlgoName = computed(() => {
  switch (selectedAlgo.value) {
    case 'bfs':
      return 'BFS 广度优先搜索';
    case 'dfs':
      return 'DFS 深度优先搜索';
    case 'dijkstra':
      return 'Dijkstra 最短路径';
    case 'prim':
      return 'Prim 最小生成树';
    case 'kruskal':
      return 'Kruskal 最小生成树';
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
    case 'valid-parentheses':
      return '有效的括号';
    case 'min-stack':
      return '最小栈';
    case 'monotonic-stack':
      return '单调栈（柱状图）';
    case 'rpn-calculator':
      return '逆波兰表达式';
    case 'queue-by-stack':
      return '栈实现队列';
    case 'basic':
      return '队列基本操作';
    case 'circular':
      return '循环队列';
    case 'deque':
      return '双端队列';
    case 'preorder':
      return '前序遍历';
    case 'inorder':
      return '中序遍历';
    case 'postorder':
      return '后序遍历';
    case 'level-order':
      return '层序遍历';
    default:
      return '算法';
  }
});

const currentAlgoDesc = computed(() => {
  switch (selectedAlgo.value) {
    case 'bfs':
      return '当前：无向图 / BFS（起点固定为 0，邻居按 id 升序）';
    case 'dfs':
      return '当前：无向图 / DFS（起点固定为 0，邻居按 id 升序，入栈时逆序）';
    case 'dijkstra':
      return '当前：无向图 / Dijkstra（起点固定为 0，边权参与计算）';
    case 'prim':
      return '当前：无向图 / Prim（起点固定为 0，边权参与计算）';
    case 'kruskal':
      return '当前：无向图 / Kruskal（边权参与计算）';
    case 'reverse':
      return '当前：链表 / 反转链表';
    case 'middle':
      return '当前：链表 / 中点（快慢指针）';
    case 'cycle':
      return '当前：链表 / 判断环（Floyd）';
    case 'merge':
      return '当前：链表 / 合并两个有序链表';
    case 'remove-k':
      return `当前：链表 / 删除倒数第 k 个（k=${removeK.value}）`;
    case 'valid-parentheses':
      return '当前：栈 / 有效的括号';
    case 'min-stack':
      return '当前：栈 / 最小栈';
    case 'monotonic-stack':
      return '当前：栈 / 单调栈（柱状图）';
    case 'rpn-calculator':
      return '当前：栈 / 逆波兰表达式';
    case 'queue-by-stack':
      return '当前：栈 / 栈实现队列';
    case 'basic':
      return '当前：队列 / 基本操作';
    case 'circular':
      return '当前：队列 / 循环队列';
    case 'deque':
      return '当前：队列 / 双端队列';
    case 'preorder':
      return '当前：树 / 前序遍历（根-左-右）';
    case 'inorder':
      return '当前：树 / 中序遍历（左-根-右）';
    case 'postorder':
      return '当前：树 / 后序遍历（左-右-根）';
    case 'level-order':
      return '当前：树 / 层序遍历（BFS）';
    default:
      return '当前：无向图 / 算法未选择';
  }
});

const currentHighlightLines = computed(() => {
  if (isListAlgo.value) return listVizState.highlightLines;
  if (isStackAlgo.value) return stackVizState.highlightLines;
  if (isQueueAlgo.value) return queueVizState.highlightLines;
  if (isTreeAlgo.value) return treeVizState.highlightLines;
  return vizState.highlightLines;
});

// ---------------------------
// TracePlayer 实例（图）
// ---------------------------
const graphPlayer = new TracePlayer(getInitialState(graph.value), {
  interval: 600,
  onStateChange: (state) => {
    syncVizState(state);
    // 更新步骤信息（stepIndex 是 0-based，显示时 +1）
    currentStep.value = graphPlayer.stepIndex + 1;
  },
  onStatusChange: (status) => {
    graphPlayerStatus.value = status;
    totalSteps.value = graphPlayer.totalSteps;
    currentStep.value = graphPlayer.stepIndex + 1;
  },
});

// ---------------------------
// 链表可视化状态与播放器
// ---------------------------
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

function buildInitialListState(algo: string): ListVizState {
  const lists = buildListsForAlgo(algo);
  return createInitialListVizState(lists, '提示：选择算法后点击播放或单步。');
}

const listVizState = reactive<ListVizState>(buildInitialListState(selectedAlgo.value));

function syncListVizState(state: ListVizState) {
  listVizState.lists = state.lists;
  listVizState.nodeStates = state.nodeStates;
  listVizState.pointers = state.pointers;
  listVizState.edgeHighlights = state.edgeHighlights;
  listVizState.note = state.note;
  listVizState.highlightLines = state.highlightLines;
}

const listPlayerStatus = ref<ListPlayerStatus>('idle');
const listCurrentStep = ref<number>(0);
const listTotalSteps = ref<number>(0);

const listPlayer = new ListTracePlayer(buildInitialListState(selectedAlgo.value), {
  interval: 600,
  onStateChange: (state) => {
    syncListVizState(state);
    listCurrentStep.value = listPlayer.stepIndex + 1;
  },
  onStatusChange: (status) => {
    listPlayerStatus.value = status;
    listTotalSteps.value = listPlayer.totalSteps;
    listCurrentStep.value = listPlayer.stepIndex + 1;
  },
});

// ---------------------------
// 栈可视化状态与播放器
// ---------------------------
const stackVizState = reactive<StackVizState>(
  createInitialStackVizState([buildStack([], { id: 'stack', label: '栈' })])
);

function syncStackVizState(state: StackVizState) {
  stackVizState.stacks = state.stacks;
  stackVizState.itemStates = state.itemStates;
  stackVizState.topPointers = state.topPointers;
  stackVizState.note = state.note;
  stackVizState.highlightLines = state.highlightLines;
}

const stackPlayerStatus = ref<StackPlayerStatus>('idle');
const stackCurrentStep = ref<number>(0);
const stackTotalSteps = ref<number>(0);

const stackPlayer = new StackTracePlayer(
  createInitialStackVizState([buildStack([], { id: 'stack', label: '栈' })]),
  {
    interval: 800,
    onStateChange: (state) => {
      syncStackVizState(state);
      stackCurrentStep.value = stackPlayer.stepIndex + 1;
    },
    onStatusChange: (status) => {
      stackPlayerStatus.value = status;
      stackTotalSteps.value = stackPlayer.totalSteps;
      stackCurrentStep.value = stackPlayer.stepIndex + 1;
    },
  }
);

// ---------------------------
// 队列可视化状态与播放器
// ---------------------------
const queueVizState = reactive<QueueVizState>(
  createInitialQueueVizState([{ id: 'queue', label: '队列', items: [] }])
);

function syncQueueVizState(state: QueueVizState) {
  queueVizState.queues = state.queues;
  queueVizState.itemStates = state.itemStates;
  queueVizState.frontPointers = state.frontPointers;
  queueVizState.rearPointers = state.rearPointers;
  queueVizState.note = state.note;
  queueVizState.highlightLines = state.highlightLines;
}

const queuePlayerStatus = ref<QueuePlayerStatus>('idle');
const queueCurrentStep = ref<number>(0);
const queueTotalSteps = ref<number>(0);

const queuePlayer = new QueueTracePlayer(
  createInitialQueueVizState([{ id: 'queue', label: '队列', items: [] }]),
  {
    interval: 800,
    onStateChange: (state) => {
      syncQueueVizState(state);
      queueCurrentStep.value = queuePlayer.stepIndex + 1;
    },
    onStatusChange: (status) => {
      queuePlayerStatus.value = status;
      queueTotalSteps.value = queuePlayer.totalSteps;
      queueCurrentStep.value = queuePlayer.stepIndex + 1;
    },
  }
);

// ---------------------------
// 树可视化状态与播放器
// ---------------------------
const treeInput = ref<string>('1,2,3,4,5,6,7');

function parseTreeInput(input: string): (number | null)[] | null {
  const normalized = input.trim();
  if (!normalized) return null;
  const parts = normalized.split(',').map((part) => part.trim());
  if (parts.length === 0) return null;
  const values: (number | null)[] = [];
  for (const token of parts) {
    if (!token) return null;
    if (token.toLowerCase() === 'null') {
      values.push(null);
      continue;
    }
    const value = Number(token);
    if (!Number.isInteger(value)) return null;
    values.push(value);
  }
  return values;
}

function cloneTree(tree: TreeView): TreeView {
  return {
    ...tree,
    nodes: tree.nodes.map((node) => ({ ...node })),
  };
}

function buildInitialTreeState(tree: TreeView): TreeVizState {
  const state = createInitialTreeVizState([tree]);
  state.note = '提示：输入层序数组后点击播放或单步。';
  return state;
}

const initialTreeValues = parseTreeInput(treeInput.value) ?? [1, 2, 3, 4, 5, 6, 7];
const treeModel = ref<TreeView>(buildBinaryTree(initialTreeValues, { id: 'tree', label: '二叉树' }));

const treeVizState = reactive<TreeVizState>(buildInitialTreeState(treeModel.value));

function syncTreeVizState(state: TreeVizState) {
  treeVizState.trees = state.trees;
  treeVizState.nodeStates = state.nodeStates;
  treeVizState.edgeStates = state.edgeStates;
  treeVizState.pointers = state.pointers;
  treeVizState.queue = state.queue;
  treeVizState.stack = state.stack;
  treeVizState.note = state.note;
  treeVizState.highlightLines = state.highlightLines;
}

const treePlayerStatus = ref<TreePlayerStatus>('idle');
const treeCurrentStep = ref<number>(0);
const treeTotalSteps = ref<number>(0);

const treePlayer = new TreeTracePlayer(buildInitialTreeState(treeModel.value), {
  interval: 800,
  onStateChange: (state) => {
    syncTreeVizState(state);
    treeCurrentStep.value = treePlayer.stepIndex + 1;
  },
  onStatusChange: (status) => {
    treePlayerStatus.value = status;
    treeTotalSteps.value = treePlayer.totalSteps;
    treeCurrentStep.value = treePlayer.stepIndex + 1;
  },
});

function resetTreePlayer(nextTree: TreeView, note: string) {
  treeModel.value = cloneTree(nextTree);
  const newState = buildInitialTreeState(treeModel.value);
  treePlayer.updateInitialState(newState);
  treePlayer.clear();
  syncTreeVizState(newState);
  treeCurrentStep.value = 0;
  treeTotalSteps.value = 0;
  treeVizState.note = note;
}


// ---------------------------
// 图编辑回调
// ---------------------------
let saveTimer: number | null = null;
let treeSaveTimer: number | null = null;

async function saveGraphDebounced(next: Graph) {
  if (!auth.token) return;
  if (saveTimer != null) {
    window.clearTimeout(saveTimer);
  }
  saveTimer = window.setTimeout(async () => {
    saveTimer = null;
    const res = await fetch(apiUrl('/graph'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ graph: next }),
    });
    if (res.status === 401) {
      auth.logout();
      vizState.note = '登录已失效，请重新登录后编辑。';
      return;
    }
  }, 300);
}

async function saveTreeDebounced(nextTree: TreeView) {
  saveTreeToLocal(nextTree);
  if (!auth.token) return;
  if (treeSaveTimer != null) {
    window.clearTimeout(treeSaveTimer);
  }
  treeSaveTimer = window.setTimeout(async () => {
    treeSaveTimer = null;
    const res = await fetch(apiUrl('/tree'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ tree: nextTree }),
    });
    if (res.status === 401) {
      auth.logout();
      treeVizState.note = '登录已失效，请重新登录后编辑树。';
      return;
    }
    if (!res.ok) {
      treeVizState.note = '树已保存到本地，云端保存失败，请稍后重试。';
    }
  }, 300);
}

async function saveTreeImmediately(nextTree: TreeView): Promise<boolean> {
  saveTreeToLocal(nextTree);
  if (!auth.token) return true;
  const res = await fetch(apiUrl('/tree'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ tree: nextTree }),
  });
  if (res.status === 401) {
    auth.logout();
    treeVizState.note = '登录已失效，请重新登录后编辑树。';
    return false;
  }
  if (!res.ok) {
    treeVizState.note = '树已保存到本地，云端保存失败，请稍后重试。';
    return false;
  }
  return true;
}

function onUpdateGraph(next: Graph, options?: UpdateGraphOptions) {
  if (!auth.isAuthed) {
    loginModalOpen.value = true;
    return;
  }
  graphStore.updateGraph(next, options);
  if (options?.history !== 'checkpoint') {
    void saveGraphDebounced(next);
  }
}

function onDisabledGraphAction() {
  if (!auth.isAuthed) {
    loginModalOpen.value = true;
  }
}

function setNote(text: string) {
  vizState.note = text;
}

function onUpdateTree(nextTree: TreeView) {
  resetTreePlayer(nextTree, '已更新树结构，可点击播放或单步开始。');
  void saveTreeDebounced(nextTree);
}

function setTreeNote(text: string) {
  treeVizState.note = text;
}

function onDisabledTreeAction() {
  treeVizState.note = '播放中：已禁用树编辑';
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
    graphPlayer.updateInitialState(getInitialState(graph.value));

    // 加载 trace
    graphPlayer.load(trace);
    return true;
  }
  if (selectedAlgo.value === 'dfs') {
    const startNode = 0;

    // 检查起点是否存在
    if (!graph.value.nodes.some((n) => n.id === startNode)) {
      vizState.note = `错误：起点节点 ${startNode} 不存在！请先添加节点 0。`;
      return false;
    }

    const trace = generateDfsTrace(graph.value, startNode);

    // 更新播放器初始状态
    graphPlayer.updateInitialState(getInitialState(graph.value));

    // 加载 trace
    graphPlayer.load(trace);
    return true;
  }
  if (selectedAlgo.value === 'dijkstra') {
    const startNode = 0;

    if (!graph.value.nodes.some((n) => n.id === startNode)) {
      vizState.note = `错误：起点节点 ${startNode} 不存在！请先添加节点 0。`;
      return false;
    }

    const trace = generateDijkstraTrace(graph.value, startNode);
    graphPlayer.updateInitialState(getInitialState(graph.value));
    graphPlayer.load(trace);
    return true;
  }
  if (selectedAlgo.value === 'prim') {
    const startNode = 0;

    if (!graph.value.nodes.some((n) => n.id === startNode)) {
      vizState.note = `错误：起点节点 ${startNode} 不存在！请先添加节点 0。`;
      return false;
    }

    const trace = generatePrimTrace(graph.value, startNode);
    graphPlayer.updateInitialState(getInitialState(graph.value));
    graphPlayer.load(trace);
    return true;
  }
  if (selectedAlgo.value === 'kruskal') {
    if (graph.value.nodes.length === 0) {
      vizState.note = '错误：图中没有节点，无法运行 Kruskal。';
      return false;
    }

    const trace = generateKruskalTrace(graph.value);
    graphPlayer.updateInitialState(getInitialState(graph.value));
    graphPlayer.load(trace);
    return true;
  }

  if (isListAlgo.value) {
    const lists = buildListsForAlgo(selectedAlgo.value);
    const initialState = createInitialListVizState(lists, '提示：选择算法后点击播放或单步。');
    listPlayer.updateInitialState(initialState);

    switch (selectedAlgo.value) {
      case 'reverse': {
        const list = lists[0];
        if (!list) return false;
        listPlayer.load(generateReverseTrace(list));
        return true;
      }
      case 'middle': {
        const list = lists[0];
        if (!list) return false;
        listPlayer.load(generateMiddleTrace(list));
        return true;
      }
      case 'cycle': {
        const list = lists[0];
        if (!list) return false;
        listPlayer.load(generateCycleTrace(list));
        return true;
      }
      case 'merge': {
        const listA = lists[0];
        const listB = lists[1];
        if (!listA || !listB) return false;
        listPlayer.load(generateMergeTrace(listA, listB));
        return true;
      }
      case 'remove-k': {
        const list = lists[0];
        if (!list) return false;
        listPlayer.load(generateRemoveKTrace(list, removeK.value));
        return true;
      }
    }
  }

  if (isStackAlgo.value) {
    const initialState = createInitialStackVizState([buildStack([], { id: 'stack', label: '栈' })]);
    stackPlayer.updateInitialState(initialState);

    switch (selectedAlgo.value) {
      case 'valid-parentheses': {
        const trace = generateValidParenthesesTrace('({[]})');
        stackPlayer.load(trace);
        return true;
      }
      case 'min-stack': {
        const trace = generateMinStackTrace(MIN_STACK_DEFAULT_OPS);
        stackPlayer.load(trace);
        return true;
      }
      case 'monotonic-stack': {
        const heights = [2, 1, 5, 6, 2, 3];
        const trace = generateMonotonicStackTrace(heights);
        stackPlayer.load(trace);
        return true;
      }
      case 'rpn-calculator': {
        const tokens = ['2', '1', '+', '3', '*'];
        const trace = generateRPNCalculatorTrace(tokens);
        stackPlayer.load(trace);
        return true;
      }
      case 'queue-by-stack': {
        const trace = generateQueueByStackTrace(QUEUE_BY_STACK_DEFAULT_OPS);
        stackPlayer.load(trace);
        return true;
      }
    }
  }

  if (isQueueAlgo.value) {
    const initialQueueState = createInitialQueueVizState([{ id: 'queue', label: '队列', items: [] }]);
    queuePlayer.updateInitialState(initialQueueState);

    switch (selectedAlgo.value) {
      case 'basic': {
        const trace = generateQueueBasicTrace(QUEUE_BASIC_DEFAULT_OPS);
        queuePlayer.load(trace);
        return true;
      }
      case 'circular': {
        const trace = generateCircularQueueTrace(5, CIRCULAR_QUEUE_DEFAULT_OPS);
        queuePlayer.load(trace);
        return true;
      }
      case 'deque': {
        const trace = generateDequeTrace(DEQUE_DEFAULT_OPS);
        queuePlayer.load(trace);
        return true;
      }
    }
  }

  if (isTreeAlgo.value) {
    const tree = cloneTree(treeModel.value);
    const initialTreeState = createInitialTreeVizState([tree]);
    initialTreeState.note = '提示：选择算法后点击播放或单步。';
    treePlayer.updateInitialState(initialTreeState);

    if (selectedAlgo.value === 'level-order') {
      treePlayer.load(generateLevelOrderTrace(tree));
      return true;
    }
    if (selectedAlgo.value === 'preorder' || selectedAlgo.value === 'inorder' || selectedAlgo.value === 'postorder') {
      treePlayer.load(generateTraversalTrace(tree, selectedAlgo.value));
      return true;
    }
  }

  // 后续可以在这里添加其他算法
  return false;
}

function play() {
  // 如果是 idle 状态，需要先生成 trace
  if (isListAlgo.value) {
    if (listPlayerStatus.value === 'idle') {
      if (!generateTrace()) return;
    }
    listPlayer.play();
    return;
  }
  if (isStackAlgo.value) {
    if (stackPlayerStatus.value === 'idle') {
      if (!generateTrace()) return;
    }
    stackPlayer.play();
    return;
  }
  if (isQueueAlgo.value) {
    if (queuePlayerStatus.value === 'idle') {
      if (!generateTrace()) return;
    }
    queuePlayer.play();
    return;
  }
  if (isTreeAlgo.value) {
    if (treePlayerStatus.value === 'idle') {
      if (!generateTrace()) return;
    }
    treePlayer.play();
    return;
  }
  if (graphPlayerStatus.value === 'idle') {
    if (!generateTrace()) return;
  }
  graphPlayer.play();
}

function pause() {
  if (isListAlgo.value) {
    listPlayer.pause();
    return;
  }
  if (isStackAlgo.value) {
    stackPlayer.pause();
    return;
  }
  if (isQueueAlgo.value) {
    queuePlayer.pause();
    return;
  }
  if (isTreeAlgo.value) {
    treePlayer.pause();
    return;
  }
  graphPlayer.pause();
}

function step() {
  // 如果是 idle 状态，需要先生成 trace
  if (isListAlgo.value) {
    if (listPlayerStatus.value === 'idle') {
      if (!generateTrace()) return;
    }
    listPlayer.stepOnce();
    return;
  }
  if (isStackAlgo.value) {
    if (stackPlayerStatus.value === 'idle') {
      if (!generateTrace()) return;
    }
    stackPlayer.stepOnce();
    return;
  }
  if (isQueueAlgo.value) {
    if (queuePlayerStatus.value === 'idle') {
      if (!generateTrace()) return;
    }
    queuePlayer.stepOnce();
    return;
  }
  if (isTreeAlgo.value) {
    if (treePlayerStatus.value === 'idle') {
      if (!generateTrace()) return;
    }
    treePlayer.stepOnce();
    return;
  }
  if (graphPlayerStatus.value === 'idle') {
    if (!generateTrace()) return;
  }
  graphPlayer.stepOnce();
}

function stepBack() {
  if (isListAlgo.value) {
    listPlayer.stepBack();
    return;
  }
  if (isStackAlgo.value) {
    stackPlayer.stepBack();
    return;
  }
  if (isQueueAlgo.value) {
    queuePlayer.stepBack();
    return;
  }
  if (isTreeAlgo.value) {
    treePlayer.stepBack();
    return;
  }
  graphPlayer.stepBack();
}

function goToStep(index: number) {
  if (isListAlgo.value) {
    listPlayer.goToStep(index);
    return;
  }
  if (isStackAlgo.value) {
    stackPlayer.goToStep(index);
    return;
  }
  if (isQueueAlgo.value) {
    queuePlayer.goToStep(index);
    return;
  }
  if (isTreeAlgo.value) {
    treePlayer.goToStep(index);
    return;
  }
  graphPlayer.goToStep(index);
}

function reset() {
  if (isListAlgo.value) {
    listPlayer.reset();
    listVizState.note = '已重置。选择算法后点击播放或单步。';
    return;
  }
  if (isStackAlgo.value) {
    stackPlayer.reset();
    stackVizState.note = '已重置。选择算法后点击播放或单步。';
    return;
  }
  if (isQueueAlgo.value) {
    queuePlayer.reset();
    queueVizState.note = '已重置。选择算法后点击播放或单步。';
    return;
  }
  if (isTreeAlgo.value) {
    treePlayer.reset();
    treeVizState.note = '已重置。输入层序数组后可点击播放或单步。';
    return;
  }
  graphPlayer.reset();
  // 重置后恢复提示文本
  vizState.note = '已重置。双击空白添加节点；点击两个节点创建边。';
}

function resetGraphToDefault() {
  // 恢复默认图
  vizState.note = '已恢复默认图。双击空白添加节点；点击两个节点创建边。';
  graphStore.resetGraph();
}

function resetTreeToDefault() {
  const defaultInput = '1,2,3,4,5,6,7';
  treeInput.value = defaultInput;
  const values = parseTreeInput(defaultInput) ?? [1, 2, 3, 4, 5, 6, 7];
  const nextTree = buildBinaryTree(values, { id: 'tree', label: '二叉树' });
  resetTreePlayer(nextTree, '已恢复默认树，可点击播放或单步开始。');
  void saveTreeDebounced(nextTree);
}

function graphTopologySignature(g: Graph): string {
  const nodeIds = [...g.nodes].map((n) => n.id).sort((a, b) => a - b).join(',');
  const edgeIds = g.edges.map((e) => edgeKey(e.u, e.v)).sort().join(',');
  return `n=${nodeIds};e=${edgeIds}`;
}

const topoSig = ref<string>(graphTopologySignature(graph.value));

function resetPlayerByGraph(next: Graph) {
  const keepNote = vizState.note;
  const newState = getInitialState(next);
  graphPlayer.updateInitialState(newState);
  graphPlayer.clear();
  syncVizState(newState);
  vizState.note = keepNote;
  currentStep.value = 0;
  totalSteps.value = 0;
}

watch(
  graph,
  (next) => {
    const nextSig = graphTopologySignature(next);
    const sigChanged = nextSig !== topoSig.value;
    topoSig.value = nextSig;

    if (!sigChanged) return;
    if (graphPlayerStatus.value === 'playing') {
      graphPlayer.pause();
    }
    resetPlayerByGraph(next);
  },
  { deep: false }
);

watch(
  selectedAlgo,
  () => {
    defaultOpeneds.value = [getSectionIdByAlgo(selectedAlgo.value)];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ALGO_STORAGE_KEY, selectedAlgo.value);
    }

    if (isListAlgo.value) {
      if (listPlayerStatus.value === 'playing') {
        listPlayer.pause();
      }
      const newState = buildInitialListState(selectedAlgo.value);
      listPlayer.updateInitialState(newState);
      listPlayer.clear();
      syncListVizState(newState);
      listCurrentStep.value = 0;
      listTotalSteps.value = 0;
      listVizState.note = `已切换到 ${currentAlgoName.value}，可点击播放或单步开始。`;
      return;
    }
    if (isStackAlgo.value) {
      if (stackPlayerStatus.value === 'playing') {
        stackPlayer.pause();
      }
      const newState = createInitialStackVizState([buildStack([], { id: 'stack', label: '栈' })]);
      stackPlayer.updateInitialState(newState);
      stackPlayer.clear();
      syncStackVizState(newState);
      stackCurrentStep.value = 0;
      stackTotalSteps.value = 0;
      stackVizState.note = `已切换到 ${currentAlgoName.value}，可点击播放或单步开始。`;
      return;
    }
    if (isQueueAlgo.value) {
      if (queuePlayerStatus.value === 'playing') {
        queuePlayer.pause();
      }
      const newState = createInitialQueueVizState([{ id: 'queue', label: '队列', items: [] }]);
      queuePlayer.updateInitialState(newState);
      queuePlayer.clear();
      syncQueueVizState(newState);
      queueCurrentStep.value = 0;
      queueTotalSteps.value = 0;
      queueVizState.note = `已切换到 ${currentAlgoName.value}，可点击播放或单步开始。`;
      return;
    }
    if (isTreeAlgo.value) {
      if (treePlayerStatus.value === 'playing') {
        treePlayer.pause();
      }
      const newState = buildInitialTreeState(treeModel.value);
      treePlayer.updateInitialState(newState);
      treePlayer.clear();
      syncTreeVizState(newState);
      treeCurrentStep.value = 0;
      treeTotalSteps.value = 0;
      treeVizState.note = `已切换到 ${currentAlgoName.value}，可点击播放或单步开始。`;
      return;
    }
    if (graphPlayerStatus.value === 'playing') {
      graphPlayer.pause();
    }
    const newState = getInitialState(graph.value);
    graphPlayer.updateInitialState(newState);
    graphPlayer.clear();
    syncVizState(newState);
    currentStep.value = 0;
    totalSteps.value = 0;
    vizState.note = `已切换到 ${currentAlgoName.value}，可点击播放或单步开始。`;
  }
);

watch(removeK, () => {
  if (!isListAlgo.value || selectedAlgo.value !== 'remove-k') return;
  const newState = buildInitialListState(selectedAlgo.value);
  listPlayer.updateInitialState(newState);
  listPlayer.clear();
  syncListVizState(newState);
  listCurrentStep.value = 0;
  listTotalSteps.value = 0;
  listVizState.note = `已更新 k=${removeK.value}，可重新播放。`;
});

watch(treeInput, () => {
  if (!isTreeAlgo.value) return;
  const values = parseTreeInput(treeInput.value);
  if (!values) {
    treeVizState.note = '输入格式错误：请使用层序逗号分隔，例如 1,2,3,null,4';
    return;
  }
  const nextTree = buildBinaryTree(values, { id: 'tree', label: '二叉树' });
  resetTreePlayer(nextTree, '已更新树结构，可点击播放或单步开始。');
  void saveTreeDebounced(nextTree);
});

function isEditingText(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function onKeyDown(evt: KeyboardEvent) {
  if (isEditingText()) return;
  if (graphPlayerStatus.value === 'playing') return;
  if (isListAlgo.value || isStackAlgo.value || isQueueAlgo.value || isTreeAlgo.value) return;
  if (evt.altKey) return;

  const key = evt.key.toLowerCase();
  const isMac = /mac|iphone|ipad|ipod/i.test(navigator.platform);
  const hasModifier = isMac ? evt.metaKey : evt.ctrlKey;
  if (!hasModifier) return;

  const isUndo = key === 'z' && !evt.shiftKey;
  const isRedo = isMac ? (key === 'z' && evt.shiftKey) : (key === 'y' || (key === 'z' && evt.shiftKey));

  if (isUndo) {
    evt.preventDefault();
    const ok = graphStore.undo();
    vizState.note = ok ? '已撤回。' : '没有可撤回的操作。';
    return;
  }

  if (isRedo) {
    evt.preventDefault();
    const ok = graphStore.redo();
    vizState.note = ok ? '已取消撤回。' : '没有可取消撤回的操作。';
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});

async function loadGraphFromServer() {
  if (!auth.token) return;
  const res = await fetch(apiUrl('/graph'), {
    headers: { authorization: `Bearer ${auth.token}` },
  });
  if (res.status === 401) {
    auth.logout();
    return;
  }
  if (!res.ok) return;
  const data = await res.json();
  if (data?.graph) {
    graphStore.updateGraph(data.graph, { history: 'none' });
    vizState.note = '已加载云端图。';
  }
}

async function loadTreeFromServer(): Promise<boolean> {
  if (!auth.token) return false;
  const res = await fetch(apiUrl('/tree'), {
    headers: { authorization: `Bearer ${auth.token}` },
  });
  if (res.status === 401) {
    auth.logout();
    return false;
  }
  if (!res.ok) return false;
  const data = await res.json();
  if (isValidTreeView(data?.tree)) {
    const tree = data.tree as TreeView;
    resetTreePlayer(tree, '已加载云端树。');
    saveTreeToLocal(tree);
    return true;
  }
  return false;
}

function formatAuthError(e: any): string {
  if (!e) return '未知错误';
  
  // Handle network errors (fetch failure)
  if (e instanceof TypeError && (e.message.includes('fetch') || e.message.includes('Network'))) {
    return '服务器开小差了，请稍后再试';
  }
  // Fallback for object-like errors that might mimic TypeError
  if (e?.name === 'TypeError' && (e?.message?.includes('fetch') || e?.message?.includes('Network'))) {
    return '服务器开小差了，请稍后再试';
  }

  const msg = e?.message ?? e?.reason ?? e?.error ?? e;
  if (Array.isArray(msg)) return msg.join('；');
  if (typeof msg === 'string') return msg;
  try {
    return JSON.stringify(msg);
  } catch {
    return '操作失败';
  }
}

async function onRegister() {
  authError.value = '';
  try {
    await auth.register(authEmail.value, authPassword.value);
    vizState.note = '注册成功，请点击“登录”后再编辑图。';
    pushToast('success', '注册成功');
    authDialogOpen.value = false;
    clearAuthForm();
  } catch (e: any) {
    authError.value = formatAuthError(e) || '注册失败';
    pushToast('error', authError.value || '注册失败');
  }
}

async function onLogin() {
  authError.value = '';
  try {
    await auth.login(authEmail.value, authPassword.value);
    authDialogOpen.value = false;
    clearAuthForm();
    vizState.note = '登录成功。现在可以编辑图。';
    pushToast('success', '登录成功');
    await loadGraphFromServer();
    const loaded = await loadTreeFromServer();
    if (!loaded) {
      restoreTreeFromLocal('云端无数据，已加载本地树。');
    }
    await router.push('/');
  } catch (e: any) {
    authError.value = formatAuthError(e) || '登录失败';
    pushToast('error', authError.value || '登录失败');
  }
}

async function onLogout() {
  await saveTreeImmediately(treeModel.value);
  await auth.logout();
  vizState.note = '已退出登录。现在只能浏览，无法编辑图。';
  pushToast('info', '已退出登录');
}

function goLogin() {
  loginModalOpen.value = false;
  authDialogOpen.value = true;
}

function goHome() {
  void router.push('/');
}

function onMenuSelect(index: string) {
  const algo = menuSections.value
    .flatMap((section) => section.items)
    .find((item) => (item.algoKey || item.id) === index)?.algoKey;
  if (algo) {
    selectedAlgo.value = algo;
  }
}

watch(
  () => authDialogOpen.value,
  (open) => {
    if (!open) {
      clearAuthForm();
    }
  }
);

watch(
  () => auth.isAuthed,
  (ok) => {
    if (!ok && graphPlayerStatus.value !== 'playing') {
      vizState.note = '未登录：可以浏览页面，登录后才能编辑图。';
    }
    if (ok) {
      void loadGraphFromServer();
      void loadTreeFromServer().then((loaded) => {
        if (!loaded) {
          restoreTreeFromLocal('云端无数据，已加载本地树。');
        }
      });
    }
  },
  { immediate: true }
);
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
  padding-bottom: 70px;
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
.auth {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.auth-user {
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
.auth-error {
  margin-top: 6px;
}
.modal-body {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}
.main {
  min-height: 0;
  overflow: hidden;
}
.side-menu {
  border-right: 1px solid var(--border);
  padding: 12px 10px;
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
  overflow: auto;
}
.side-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text);
}
.collapse-btn {
  font-size: 12px;
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

.tree-input {
  width: 260px;
}
:deep(.el-menu) {
  border-right: none;
  background: transparent;
}
:deep(.el-menu-item.is-active) {
  background: rgba(16, 185, 129, 0.12);
}
:deep(.el-sub-menu__title) {
  font-weight: 600;
}
</style>
