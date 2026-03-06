<template>
  <div ref="wrapRef" class="wrap" @mousedown.self="onPointerDownOutside">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @dblclick="onDblClickStage"
      @click="onClickStage"
      @contextmenu="onStageContextMenu"
    >
      <v-layer>
        <!-- Edges -->
        <template v-for="e in graph.edges" v-if="!props.directedMode" :key="edgeKey(e.u, e.v)">
          <v-line 
            :config="edgeLineConfig(e)" 
            @click="onClickEdge(e, $event)"
            @contextmenu="onRightClickEdge(e, $event)"
          />
          <v-text :config="edgeLabelConfig(e)" />
        </template>

        <!-- Directed edges overlay -->
        <template v-for="e in directedEdgesSafe" v-if="props.directedMode" :key="directedEdgeKey(e.u, e.v, e.w)">
          <v-arrow
            :config="directedEdgeConfig(e)"
            @click="onClickDirectedEdge(e, $event)"
            @contextmenu="onRightClickDirectedEdge(e, $event)"
          />
          <v-text :config="directedEdgeLabelConfig(e)" />
        </template>

        <!-- Nodes -->
        <template v-for="n in graph.nodes" :key="n.id">
          <v-group
            :config="{ x: n.x, y: n.y, draggable: !disabled }"
            @click="onClickNode(n.id, $event)"
            @contextmenu="onRightClickNode(n.id, $event)"
            @dragstart="onDragStart(n.id, $event)"
            @dragmove="onDragMove(n.id, $event)"
            @dragend="onDragEnd(n.id, $event)"
          >
            <v-circle :config="nodeCircleConfig(n)" />
            <v-text :config="nodeTextConfig(n)" />
          </v-group>
        </template>
      </v-layer>
    </v-stage>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="context-menu-item delete" @click="onConfirmDelete">
        🗑️ 删除{{
          contextMenu.type === 'node'
            ? '节点 ' + contextMenu.targetId
            : (
              contextMenu.edgeDirected
                ? '有向边 (' + contextMenu.edgeU + '->' + contextMenu.edgeV + ')'
                : '边 (' + contextMenu.edgeU + '-' + contextMenu.edgeV + ')'
            )
        }}
      </div>
    </div>

    <div ref="hintRef" class="hint" :style="hintStyle">
      <div class="hint-drag-handle" @mousedown="onHintDragStart">操作：</div>
      <ul>
        <li>双击空白：新增节点</li>
        <li>拖拽节点：移动</li>
        <li v-if="props.directedMode">点击两个节点：创建有向边（起点->终点）</li>
        <li v-else>点击两个节点：创建无向边</li>
        <li>单击选中边/节点，右键删除</li>
        <li>点击空白：取消选中</li>
        <li v-if="disabled">{{ disabledHint || '已禁用编辑' }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';

type NodeId = number;
type GraphNode = { id: NodeId; x: number; y: number };
type GraphEdge = { u: NodeId; v: NodeId; w: number };
type DirectedEdge = { u: NodeId; v: NodeId; w: number };
type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

type NodeVizState = 'default' | 'visited' | 'selected' | 'frontier';
type EdgeVizState = 'default' | 'checking' | 'tree';
type UpdateGraphOptions = { history?: 'push' | 'replace' | 'none' | 'checkpoint' };

const props = defineProps<{
  graph: Graph;
  nodeStates: Record<number, NodeVizState>;
  edgeStates: Record<string, EdgeVizState>;
  disabled: boolean;
  disabledHint?: string;
  directedMode?: boolean;
  directedEdges?: DirectedEdge[];
}>();

const emit = defineEmits<{
  (e: 'update:graph', g: Graph, options?: UpdateGraphOptions): void;
  (e: 'update:directed-edges', edges: DirectedEdge[]): void;
  (e: 'note', text: string): void;
  (e: 'disabled-action'): void;
}>();

const width = 900;
const height = 640;

const stageRef = ref<any>(null);
const wrapRef = ref<HTMLElement | null>(null);
const hintRef = ref<HTMLElement | null>(null);
const stageConfig = computed(() => ({
  width,
  height,
}));

const hintPos = reactive({
  x: 0,
  y: 12,
  initialized: false,
});

const hintStyle = computed(() => {
  if (!hintPos.initialized) return {};
  return {
    left: `${hintPos.x}px`,
    top: `${hintPos.y}px`,
    right: 'auto',
  };
});

const hintDragState = reactive({
  dragging: false,
  startMouseX: 0,
  startMouseY: 0,
  startX: 0,
  startY: 0,
});

function clampHintPos(x: number, y: number) {
  const container = wrapRef.value;
  const panel = hintRef.value;
  if (!container || !panel) return { x, y };
  const maxX = Math.max(0, container.clientWidth - panel.offsetWidth);
  const maxY = Math.max(0, container.clientHeight - panel.offsetHeight);
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  };
}

function initHintPos() {
  const container = wrapRef.value;
  const panel = hintRef.value;
  if (!container || !panel) return;
  const x = Math.max(0, container.clientWidth - panel.offsetWidth - 12);
  const y = 12;
  const clamped = clampHintPos(x, y);
  hintPos.x = clamped.x;
  hintPos.y = clamped.y;
  hintPos.initialized = true;
}

function onHintDragMove(evt: MouseEvent) {
  if (!hintDragState.dragging) return;
  const dx = evt.clientX - hintDragState.startMouseX;
  const dy = evt.clientY - hintDragState.startMouseY;
  const clamped = clampHintPos(hintDragState.startX + dx, hintDragState.startY + dy);
  hintPos.x = clamped.x;
  hintPos.y = clamped.y;
}

function stopHintDrag() {
  hintDragState.dragging = false;
  window.removeEventListener('mousemove', onHintDragMove);
  window.removeEventListener('mouseup', stopHintDrag);
}

function onHintDragStart(evt: MouseEvent) {
  if (evt.button !== 0) return;
  evt.preventDefault();
  hintDragState.dragging = true;
  hintDragState.startMouseX = evt.clientX;
  hintDragState.startMouseY = evt.clientY;
  hintDragState.startX = hintPos.x;
  hintDragState.startY = hintPos.y;
  window.addEventListener('mousemove', onHintDragMove);
  window.addEventListener('mouseup', stopHintDrag);
}

function onWindowResize() {
  if (!hintPos.initialized) {
    initHintPos();
    return;
  }
  const clamped = clampHintPos(hintPos.x, hintPos.y);
  hintPos.x = clamped.x;
  hintPos.y = clamped.y;
}

onMounted(async () => {
  await nextTick();
  initHintPos();
  window.addEventListener('resize', onWindowResize);
});

onUnmounted(() => {
  stopHintDrag();
  window.removeEventListener('resize', onWindowResize);
});

function edgeKey(u: number, v: number) {
  const a = Math.min(u, v);
  const b = Math.max(u, v);
  return a + '-' + b;
}

function directedEdgeKey(u: number, v: number, w: number) {
  return `${u}>${v}:${w}`;
}

function nextNodeId(nodes: GraphNode[]): number {
  if (nodes.length === 0) return 0;
  return Math.max(...nodes.map((n) => n.id)) + 1;
}

function findNode(id: number): GraphNode | undefined {
  return props.graph.nodes.find((n) => n.id === id);
}

function hasEdge(u: number, v: number): boolean {
  const k = edgeKey(u, v);
  return props.graph.edges.some((e) => edgeKey(e.u, e.v) === k);
}

const directedEdgesSafe = computed<DirectedEdge[]>(() => props.directedEdges ?? []);

function hasDirectedEdge(u: number, v: number): boolean {
  return directedEdgesSafe.value.some((e) => e.u === u && e.v === v);
}

// ---------------------------
// 选中状态
// ---------------------------
const selectedNode = ref<NodeId | null>(null);
const selectedEdge = ref<string | null>(null);
const selectedDirectedEdge = ref<string | null>(null);

// ---------------------------
// 右键菜单状态
// ---------------------------
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  type: '' as 'node' | 'edge' | '',
  targetId: null as NodeId | null,
  edgeU: null as NodeId | null,
  edgeV: null as NodeId | null,
  edgeDirected: false,
});
let contextMenuOpenedAt = 0;
let suppressNextStageClick = false;

function hideContextMenu() {
  contextMenu.visible = false;
  contextMenu.type = '';
  contextMenu.targetId = null;
  contextMenu.edgeU = null;
  contextMenu.edgeV = null;
  contextMenu.edgeDirected = false;
}

function clearSelection() {
  selectedNode.value = null;
  selectedEdge.value = null;
  selectedDirectedEdge.value = null;
  hideContextMenu();
}

// ---------------------------
// 交互：连边模式（两次点击）
// ---------------------------
const draftStart = ref<NodeId | null>(null);

function onClickNode(id: NodeId, evt: any) {
  if (evt?.evt?.button === 2) return;
  evt.cancelBubble = true;
  if (props.disabled) {
    emit('disabled-action');
    return;
  }
  
  hideContextMenu();

  if (draftStart.value != null) {
    const u = draftStart.value;
    const v = id;
    draftStart.value = null;
    selectedNode.value = null;

    if (u === v) {
      emit('note', '不支持自环（节点不能连自己）。');
      return;
    }
    if (props.directedMode) {
      if (hasDirectedEdge(u, v)) {
        emit('note', `有向边 (${u}->${v}) 已存在。`);
        return;
      }
      const edge: DirectedEdge = { u, v, w: 1 };
      emit('update:directed-edges', [...directedEdgesSafe.value, edge]);
      emit('note', `已创建有向边 (${u}->${v})，权重=1。`);
      return;
    } else if (hasEdge(u, v)) {
      emit('note', '边 (' + Math.min(u, v) + ', ' + Math.max(u, v) + ') 已存在。');
      return;
    }

    const edge: GraphEdge = { u: Math.min(u, v), v: Math.max(u, v), w: 1 };
    emit('update:graph', { ...props.graph, edges: [...props.graph.edges, edge] });
    emit('note', '已创建边 (' + edge.u + ', ' + edge.v + ')，权重=1。');
    return;
  }

  draftStart.value = id;
  selectedNode.value = id;
  selectedEdge.value = null;
  selectedDirectedEdge.value = null;
  emit('note', props.directedMode
    ? `已选中节点 ${id}。点击另一个节点创建有向边（${id}->x），或右键删除。`
    : `已选中节点 ${id}。点击另一个节点创建边，或右键删除。`);
}

function onClickEdge(edge: GraphEdge, evt: any) {
  if (evt?.evt?.button === 2) return;
  evt.cancelBubble = true;
  if (props.disabled) {
    emit('disabled-action');
    return;
  }
  
  hideContextMenu();
  draftStart.value = null;
  
  const key = edgeKey(edge.u, edge.v);
  selectedEdge.value = key;
  selectedDirectedEdge.value = null;
  selectedNode.value = null;
  emit('note', '已选中边 (' + edge.u + ', ' + edge.v + ')。右键可删除。');
}

function onClickDirectedEdge(edge: DirectedEdge, evt: any) {
  if (evt?.evt?.button === 2) return;
  evt.cancelBubble = true;
  if (props.disabled) {
    emit('disabled-action');
    return;
  }
  hideContextMenu();
  draftStart.value = null;
  selectedDirectedEdge.value = directedEdgeKey(edge.u, edge.v, edge.w);
  selectedEdge.value = null;
  selectedNode.value = null;
  emit('note', `已选中有向边 (${edge.u}->${edge.v})。右键可删除。`);
}

function onClickStage(evt: any) {
  if (suppressNextStageClick) {
    suppressNextStageClick = false;
    return;
  }
  if (!evt?.evt || evt.evt.button !== 0) return;
  if (Date.now() - contextMenuOpenedAt < 400) return;
  const target = evt.target;
  const stage = stageRef.value?.getStage?.() ?? stageRef.value;
  
  if (target === stage) {
    clearSelection();
    draftStart.value = null;
    emit('note', props.directedMode
      ? '已取消选中。双击空白添加节点；点击两个节点创建有向边。'
      : '已取消选中。双击空白添加节点；点击两个节点创建边。');
  }
}

function onPointerDownOutside(evt: MouseEvent) {
  // 仅左键点击空白时关闭菜单；右键不触发关闭，避免“必须按住右键”现象
  if (evt.button !== 0) return;
  if (suppressNextStageClick) {
    suppressNextStageClick = false;
    return;
  }
  if (Date.now() - contextMenuOpenedAt < 120) return;
  clearSelection();
  draftStart.value = null;
}

// ---------------------------
// 右键菜单
// ---------------------------
function onRightClickNode(id: NodeId, evt: any) {
  evt.evt?.preventDefault?.();
  evt.cancelBubble = true;
  
  if (props.disabled) {
    emit('disabled-action');
    return;
  }

  selectedNode.value = id;
  selectedEdge.value = null;
  selectedDirectedEdge.value = null;
  draftStart.value = null;

  const stage = stageRef.value?.getStage?.() ?? stageRef.value;
  const pointerPos = stage?.getPointerPosition?.();
  
  if (pointerPos) {
    contextMenu.x = pointerPos.x;
    contextMenu.y = pointerPos.y;
  } else {
    contextMenu.x = evt.evt?.offsetX ?? 100;
    contextMenu.y = evt.evt?.offsetY ?? 100;
  }

  contextMenu.type = 'node';
  contextMenu.targetId = id;
  contextMenu.visible = true;
  contextMenuOpenedAt = Date.now();
  suppressNextStageClick = true;
}

function onRightClickEdge(edge: GraphEdge, evt: any) {
  evt.evt?.preventDefault?.();
  evt.cancelBubble = true;
  
  if (props.disabled) {
    emit('disabled-action');
    return;
  }

  selectedEdge.value = edgeKey(edge.u, edge.v);
  selectedDirectedEdge.value = null;
  selectedNode.value = null;
  draftStart.value = null;

  const stage = stageRef.value?.getStage?.() ?? stageRef.value;
  const pointerPos = stage?.getPointerPosition?.();

  if (pointerPos) {
    contextMenu.x = pointerPos.x;
    contextMenu.y = pointerPos.y;
  } else {
    contextMenu.x = evt.evt?.offsetX ?? 100;
    contextMenu.y = evt.evt?.offsetY ?? 100;
  }

  contextMenu.type = 'edge';
  contextMenu.edgeU = edge.u;
  contextMenu.edgeV = edge.v;
  contextMenu.edgeDirected = false;
  contextMenu.visible = true;
  contextMenuOpenedAt = Date.now();
  suppressNextStageClick = true;
}

function onRightClickDirectedEdge(edge: DirectedEdge, evt: any) {
  evt.evt?.preventDefault?.();
  evt.cancelBubble = true;
  if (props.disabled) {
    emit('disabled-action');
    return;
  }

  selectedDirectedEdge.value = directedEdgeKey(edge.u, edge.v, edge.w);
  selectedEdge.value = null;
  selectedNode.value = null;
  draftStart.value = null;

  const stage = stageRef.value?.getStage?.() ?? stageRef.value;
  const pointerPos = stage?.getPointerPosition?.();
  if (pointerPos) {
    contextMenu.x = pointerPos.x;
    contextMenu.y = pointerPos.y;
  } else {
    contextMenu.x = evt.evt?.offsetX ?? 100;
    contextMenu.y = evt.evt?.offsetY ?? 100;
  }

  contextMenu.type = 'edge';
  contextMenu.edgeU = edge.u;
  contextMenu.edgeV = edge.v;
  contextMenu.edgeDirected = true;
  contextMenu.visible = true;
  contextMenuOpenedAt = Date.now();
  suppressNextStageClick = true;
}

function onStageContextMenu(evt: any) {
  evt.evt?.preventDefault?.();
}

function onConfirmDelete() {
  if (contextMenu.type === 'node' && contextMenu.targetId != null) {
    const id = contextMenu.targetId;
    const newNodes = props.graph.nodes.filter((n) => n.id !== id);
    const newEdges = props.graph.edges.filter((e) => e.u !== id && e.v !== id);
    const deletedEdgeCount = props.graph.edges.length - newEdges.length;
    
    emit('update:graph', { nodes: newNodes, edges: newEdges });
    const newDirectedEdges = directedEdgesSafe.value.filter((e) => e.u !== id && e.v !== id);
    if (newDirectedEdges.length !== directedEdgesSafe.value.length) {
      emit('update:directed-edges', newDirectedEdges);
    }
    
    if (deletedEdgeCount > 0) {
      emit('note', '已删除节点 ' + id + ' 及其关联的 ' + deletedEdgeCount + ' 条边。');
    } else {
      emit('note', '已删除节点 ' + id + '。');
    }
  } else if (contextMenu.type === 'edge' && contextMenu.edgeU != null && contextMenu.edgeV != null) {
    if (contextMenu.edgeDirected) {
      const newDirectedEdges = directedEdgesSafe.value.filter((e) => !(e.u === contextMenu.edgeU && e.v === contextMenu.edgeV));
      emit('update:directed-edges', newDirectedEdges);
      emit('note', `已删除有向边 (${contextMenu.edgeU}->${contextMenu.edgeV})。`);
    } else {
      const key = edgeKey(contextMenu.edgeU, contextMenu.edgeV);
      const newEdges = props.graph.edges.filter((e) => edgeKey(e.u, e.v) !== key);
      emit('update:graph', { ...props.graph, edges: newEdges });
      emit('note', '已删除边 (' + contextMenu.edgeU + ', ' + contextMenu.edgeV + ')。');
    }
  }

  clearSelection();
}

// ---------------------------
// 双击空白新增节点
// ---------------------------
function onDblClickStage() {
  if (props.disabled) {
    emit('disabled-action');
    return;
  }
  hideContextMenu();
  
  const stage = stageRef.value?.getStage?.() ?? stageRef.value;
  if (!stage) return;

  const pos = stage.getPointerPosition();
  if (!pos) return;

  const id = nextNodeId(props.graph.nodes);
  const node: GraphNode = { id, x: pos.x, y: pos.y };

  emit('update:graph', { ...props.graph, nodes: [...props.graph.nodes, node] });
  emit('note', '已新增节点 ' + id + '。');
}

// ---------------------------
// 拖拽更新坐标
// ---------------------------
function updateNodePos(id: NodeId, x: number, y: number, options?: UpdateGraphOptions) {
  const nodes = props.graph.nodes.map((n) => (n.id === id ? { ...n, x, y } : n));
  emit('update:graph', { ...props.graph, nodes }, options);
}

function onDragStart(_id: NodeId, evt: any) {
  if (props.disabled) {
    emit('disabled-action');
    return;
  }
  evt.cancelBubble = true;
  hideContextMenu();
  draftStart.value = null;
  emit('update:graph', props.graph, { history: 'checkpoint' });
}

function onDragMove(id: NodeId, evt: any) {
  if (props.disabled) {
    emit('disabled-action');
    return;
  }
  hideContextMenu();
  const { x, y } = evt.target.position();
  updateNodePos(id, x, y, { history: 'replace' });
}

function onDragEnd(id: NodeId, evt: any) {
  if (props.disabled) {
    emit('disabled-action');
    return;
  }
  const { x, y } = evt.target.position();
  updateNodePos(id, x, y, { history: 'replace' });
}

// ---------------------------
// 样式映射
// ---------------------------
function nodeColor(state: NodeVizState | undefined, isSelected: boolean) {
  if (isSelected) return '#f472b6';
  switch (state) {
    case 'visited': return '#6366f1';
    case 'selected': return '#f59e0b';
    case 'frontier': return '#22c55e';
    default: return '#94a3b8';
  }
}

function edgeStyle(state: EdgeVizState | undefined, isSelected: boolean) {
  if (isSelected) {
    return { stroke: '#f472b6', strokeWidth: 4, dash: [] as number[] };
  }
  switch (state) {
    case 'checking': return { stroke: '#60a5fa', strokeWidth: 3, dash: [10, 6] as number[] };
    case 'tree': return { stroke: '#22c55e', strokeWidth: 4, dash: [] as number[] };
    default: return { stroke: '#64748b', strokeWidth: 2, dash: [] as number[] };
  }
}

// ---------------------------
// 绘制 config
// ---------------------------
function nodeCircleConfig(n: GraphNode) {
  const state = props.nodeStates[n.id];
  const isDraft = draftStart.value === n.id;
  const isSelected = selectedNode.value === n.id;

  return {
    x: 0,
    y: 0,
    radius: 22,
    fill: isDraft ? '#a78bfa' : nodeColor(state, isSelected),
    stroke: isSelected ? '#16a34a' : '#065f46',
    strokeWidth: isSelected ? 3 : 2,
  };
}

function nodeTextConfig(n: GraphNode) {
  return {
    x: -6,
    y: -7,
    text: String(n.id),
    fontSize: 14,
    fill: '#052e16',
    fontStyle: 'bold',
    listening: false,
  };
}

function edgeLineConfig(e: GraphEdge) {
  const a = findNode(e.u);
  const b = findNode(e.v);
  if (!a || !b) return { points: [0, 0, 0, 0], stroke: '#64748b' };

  const key = edgeKey(e.u, e.v);
  const st = props.edgeStates[key];
  const isSelected = selectedEdge.value === key;
  const { stroke, strokeWidth, dash } = edgeStyle(st, isSelected);

  return {
    points: [a.x, a.y, b.x, b.y],
    stroke,
    strokeWidth,
    dash,
    lineCap: 'round',
    hitStrokeWidth: 16,
  };
}

function edgeLabelConfig(e: GraphEdge) {
  const a = findNode(e.u);
  const b = findNode(e.v);
  if (!a || !b) return { x: 0, y: 0, text: '' };

  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;

  return {
    x: mx + 6,
    y: my + 6,
    text: String(e.w),
    fontSize: 12,
    fill: '#064e3b',
  };
}

function directedEdgeConfig(e: DirectedEdge) {
  const a = findNode(e.u);
  const b = findNode(e.v);
  if (!a || !b) {
    return { points: [0, 0, 0, 0], stroke: '#fb7185' };
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) {
    return { points: [a.x, a.y, b.x, b.y], stroke: '#fb7185' };
  }
  const ux = dx / len;
  const uy = dy / len;
  const pad = 24;
  const sx = a.x + ux * pad;
  const sy = a.y + uy * pad;
  const ex = b.x - ux * pad;
  const ey = b.y - uy * pad;
  const isSelected = selectedDirectedEdge.value === directedEdgeKey(e.u, e.v, e.w);
  return {
    points: [sx, sy, ex, ey],
    stroke: isSelected ? '#f43f5e' : '#e11d48',
    fill: isSelected ? '#f43f5e' : '#e11d48',
    strokeWidth: isSelected ? 4 : 3,
    pointerLength: 10,
    pointerWidth: 9,
    hitStrokeWidth: 18,
  };
}

function directedEdgeLabelConfig(e: DirectedEdge) {
  const a = findNode(e.u);
  const b = findNode(e.v);
  if (!a || !b) return { x: 0, y: 0, text: '' };
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return {
    x: mx + 4,
    y: my - 14,
    text: `${e.w}`,
    fontSize: 11,
    fill: '#9f1239',
  };
}
</script>

<style scoped>
.wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
.hint {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 10px 12px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}
.hint-drag-handle {
  cursor: move;
  user-select: none;
  font-weight: 600;
}
.hint ul {
  margin: 6px 0 0 16px;
  padding: 0;
}

/* 右键菜单 */
.context-menu {
  position: absolute;
  background: var(--panel-solid);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: var(--shadow);
  z-index: 1000;
  min-width: 120px;
  overflow: hidden;
}
.context-menu-item {
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text);
  transition: background 0.15s;
}
.context-menu-item:hover {
  background: rgba(220, 252, 231, 0.75);
}
.context-menu-item.delete {
  color: #b91c1c;
}
.context-menu-item.delete:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}
</style>
