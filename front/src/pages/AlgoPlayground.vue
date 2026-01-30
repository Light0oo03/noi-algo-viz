<template>
  <div class="page">
    <div class="toast-wrap" aria-live="polite" aria-atomic="true">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.kind]">
        {{ t.text }}
      </div>
    </div>
    <header class="header">
      <div class="title">NOI 算法可视化学习平台（MVP）</div>
      <div class="sub">当前：无向图 / BFS（起点固定为 0，邻居按 id 升序）</div>
      <div class="auth">
        <template v-if="auth.isAuthed">
          <span class="auth-user">{{ auth.user?.email }}</span>
          <button class="auth-btn" @click="onLogout">退出</button>
        </template>
        <template v-else>
          <button class="auth-btn" @click="authPanelOpen = !authPanelOpen">登录/注册</button>
        </template>
      </div>
      <div v-if="!auth.isAuthed && authPanelOpen" class="auth-panel">
        <input v-model="authEmail" class="auth-input" placeholder="邮箱" />
        <input v-model="authPassword" class="auth-input" placeholder="密码（至少8位）" type="password" />
        <div class="auth-actions">
          <button class="auth-btn" @click="onRegister">注册</button>
          <button class="auth-btn" @click="onLogin">登录</button>
        </div>
        <div v-if="authError" class="auth-error">{{ authError }}</div>
      </div>
    </header>

    <main class="main">
      <section class="left">
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
        @reset-graph="resetGraphToDefault"
        @go-to-step="goToStep"
      />
    </footer>

    <div v-if="loginModalOpen" class="modal-mask" @click.self="loginModalOpen = false">
      <div class="modal">
        <div class="modal-title">需要登录</div>
        <div class="modal-body">登录后才能修改图（新增节点/连边/删除/拖拽）。</div>
        <div class="modal-actions">
          <button class="auth-btn" @click="goLogin">去登录</button>
          <button class="auth-btn" @click="loginModalOpen = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted, onUnmounted } from 'vue';
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
import type { UpdateGraphOptions } from '../stores/graphStore';
import { useAuthStore } from '../stores/authStore';
import { apiUrl } from '../config/api';

// ---------------------------
// 图数据（使用 Pinia 持久化）
// ---------------------------
const graphStore = useGraphStore();
const { graph } = storeToRefs(graphStore);

const auth = useAuthStore();
const authPanelOpen = ref<boolean>(false);
const loginModalOpen = ref<boolean>(false);
const authEmail = ref<string>('');
const authPassword = ref<string>('');
const authError = ref<string>('');

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: string; kind: ToastKind; text: string };
const toasts = ref<Toast[]>([]);

function pushToast(kind: ToastKind, text: string) {
  const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  toasts.value = [...toasts.value, { id, kind, text }];
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 1500);
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
    authPanelOpen.value = false;
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
    authPanelOpen.value = false;
    clearAuthForm();
    vizState.note = '登录成功。现在可以编辑图。';
    pushToast('success', '登录成功');
    await loadGraphFromServer();
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
  authPanelOpen.value = true;
}

watch(
  () => authPanelOpen.value,
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
.toast-wrap {
  position: fixed;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
  pointer-events: none;
}
.toast {
  min-width: 220px;
  max-width: 360px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(6, 78, 59, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.25);
  background: rgba(236, 253, 245, 0.96);
  color: #064e3b;
}
.toast.success {
  border-color: rgba(16, 185, 129, 0.35);
}
.toast.error {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(254, 242, 242, 0.96);
  color: #991b1b;
}
.toast.info {
  border-color: rgba(34, 197, 94, 0.25);
}

.page {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: radial-gradient(1200px 600px at 20% 0%, rgba(34, 197, 94, 0.14), transparent 60%),
    radial-gradient(900px 500px at 90% 20%, rgba(16, 185, 129, 0.14), transparent 55%),
    var(--app-bg);
  color: var(--text);
}
.header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  position: relative;
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
  z-index: 50;
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
.auth-btn {
  background: var(--btn-bg);
  color: var(--btn-text);
  border: 1px solid var(--btn-border);
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 6px 18px rgba(6, 78, 59, 0.08);
}
.auth-btn:hover {
  border-color: var(--border-strong);
}
.auth-panel {
  position: absolute;
  top: 44px;
  right: 16px;
  width: 260px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  display: grid;
  gap: 8px;
  z-index: 200;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}
.auth-input {
  width: 100%;
  background: var(--panel-solid);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
}
.auth-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.auth-error {
  font-size: 12px;
  color: #991b1b;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(6, 78, 59, 0.18);
  display: grid;
  place-items: center;
  z-index: 50;
}
.modal {
  width: 340px;
  background: var(--panel-solid);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  display: grid;
  gap: 10px;
  box-shadow: var(--shadow);
}
.modal-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
.modal-body {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
  padding: 10px 12px;
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
}
</style>
