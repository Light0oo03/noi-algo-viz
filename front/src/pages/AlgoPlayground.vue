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
          :graph="graph"
          :node-states="vizState.nodeStates"
          :edge-states="vizState.edgeStates"
          :disabled="!canEditGraph"
          :disabled-hint="disabledHint"
          @update:graph="onUpdateGraph"
          @note="setNote"
          @disabled-action="onDisabledGraphAction"
        />
        <div class="floating-panel">
        <StatePanel
          :note="vizState.note"
          :queue="vizState.queue"
          :player-status="playerStatus"
          :node-states="vizState.nodeStates"
          :algo="selectedAlgo"
        />
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
        @reset-graph="resetGraphToDefault"
        @go-to-step="goToStep"
      />
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
import CodeViewer from '../components/CodeViewer.vue';
import { sideMenuSections } from '../config/sideMenu';

// 导入 core 模块
import type { Graph } from '../core/graph/types';
import { edgeKey } from '../core/graph/types';
import { generateBfsTrace } from '../core/algorithms/bfs';
import { generateDfsTrace } from '../core/algorithms/dfs';
import { BFS_CODE_JS } from '../core/algorithms/bfs-code';
import { DFS_CODE_JS } from '../core/algorithms/dfs-code';
import { TracePlayer, createInitialStateFromGraph } from '../core/trace/TracePlayer';
import type { PlayerStatus } from '../core/trace/TracePlayer';
import type { VizState } from '../core/trace/types';

// 导入 Pinia store
import { useGraphStore } from '../stores/graphStore';
import type { UpdateGraphOptions } from '../stores/graphStore';
import { useAuthStore } from '../stores/authStore';
import { apiUrl } from '../config/api';

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

const canEditGraph = computed(() => auth.isAuthed && playerStatus.value !== 'playing');
const disabledHint = computed(() => {
  if (playerStatus.value === 'playing') return '播放中：已禁用编辑';
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
// 播放器状态
// ---------------------------
const playerStatus = ref<PlayerStatus>('idle');
const currentStep = ref<number>(0);
const totalSteps = ref<number>(0);
const selectedAlgo = ref<string>('bfs');
const sideCollapsed = ref<boolean>(false);
const defaultOpeneds = ['graph'];

const menuSections = ref(sideMenuSections);

// ---------------------------
// 算法代码展示
// ---------------------------
const currentAlgoCode = computed(() => {
  switch (selectedAlgo.value) {
    case 'bfs':
      return BFS_CODE_JS;
    case 'dfs':
      return DFS_CODE_JS;
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
    default:
      return '算法代码';
  }
});

const currentAlgoDesc = computed(() => {
  switch (selectedAlgo.value) {
    case 'bfs':
      return '当前：无向图 / BFS（起点固定为 0，邻居按 id 升序）';
    case 'dfs':
      return '当前：无向图 / DFS（起点固定为 0，邻居按 id 升序，入栈时逆序）';
    default:
      return '当前：无向图 / 算法未选择';
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
let saveTimer: number | null = null;

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
  if (selectedAlgo.value === 'dfs') {
    const startNode = 0;

    // 检查起点是否存在
    if (!graph.value.nodes.some((n) => n.id === startNode)) {
      vizState.note = `错误：起点节点 ${startNode} 不存在！请先添加节点 0。`;
      return false;
    }

    const trace = generateDfsTrace(graph.value, startNode);

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

function resetGraphToDefault() {
  // 恢复默认图
  vizState.note = '已恢复默认图。双击空白添加节点；点击两个节点创建边。';
  graphStore.resetGraph();
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
  player.updateInitialState(newState);
  player.clear();
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
    if (playerStatus.value === 'playing') {
      player.pause();
    }
    resetPlayerByGraph(next);
  },
  { deep: false }
);

function isEditingText(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function onKeyDown(evt: KeyboardEvent) {
  if (isEditingText()) return;
  if (playerStatus.value === 'playing') return;
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
    await router.push('/');
  } catch (e: any) {
    authError.value = formatAuthError(e) || '登录失败';
    pushToast('error', authError.value || '登录失败');
  }
}

function onLogout() {
  auth.logout();
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
    if (!ok && playerStatus.value !== 'playing') {
      vizState.note = '未登录：可以浏览页面，登录后才能编辑图。';
    }
    if (ok) {
      void loadGraphFromServer();
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
