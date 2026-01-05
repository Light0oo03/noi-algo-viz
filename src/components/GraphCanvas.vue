<template>
  <div class="wrap">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @dblclick="onDblClickStage"
    >
      <v-layer>
        <!-- Edges -->
        <template v-for="e in graph.edges" :key="edgeKey(e.u, e.v)">
          <v-line :config="edgeLineConfig(e)" />
          <v-text :config="edgeLabelConfig(e)" />
        </template>

        <!-- Nodes -->
        <template v-for="n in graph.nodes" :key="n.id">
          <v-group
            :config="{ x: n.x, y: n.y, draggable: !disabled }"
            @click="onClickNode(n.id)"
            @dragmove="onDragMove(n.id, $event)"
            @dragend="onDragEnd(n.id, $event)"
          >
            <v-circle :config="nodeCircleConfig(n)" />
            <v-text :config="nodeTextConfig(n)" />
          </v-group>
        </template>
      </v-layer>
    </v-stage>

    <div class="hint">
      <div>操作：</div>
      <ul>
        <li>双击空白：新增节点</li>
        <li>拖拽节点：移动</li>
        <li>点击两个节点：创建无向边（不支持自环/重边）</li>
        <li v-if="disabled">播放中：已禁用编辑</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type NodeId = number;
type GraphNode = { id: NodeId; x: number; y: number };
type GraphEdge = { u: NodeId; v: NodeId; w: number };
type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

type NodeVizState = 'default' | 'visited' | 'selected' | 'frontier';
type EdgeVizState = 'default' | 'checking' | 'tree';

const props = defineProps<{
  graph: Graph;
  nodeStates: Record<number, NodeVizState>;
  edgeStates: Record<string, EdgeVizState>;
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:graph', g: Graph): void;
  (e: 'note', text: string): void;
}>();

const width = 900;
const height = 640;

const stageRef = ref<any>(null);
const stageConfig = computed(() => ({
  width,
  height,
}));

function edgeKey(u: number, v: number) {
  const a = Math.min(u, v);
  const b = Math.max(u, v);
  return `${a}-${b}`;
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

// ---------------------------
// 交互：连边模式（两次点击）
// ---------------------------
const draftStart = ref<NodeId | null>(null);

function onClickNode(id: NodeId) {
  if (props.disabled) return;

  if (draftStart.value == null) {
    draftStart.value = id;
    emit('note', `已选择起点节点 ${id}，请点击另一个节点创建边。`);
    return;
  }

  const u = draftStart.value;
  const v = id;
  draftStart.value = null;

  if (u === v) {
    emit('note', '不支持自环（节点不能连自己）。');
    return;
  }
  if (hasEdge(u, v)) {
    emit('note', `边 (${Math.min(u, v)}, ${Math.max(u, v)}) 已存在。`);
    return;
  }

  const edge: GraphEdge = { u: Math.min(u, v), v: Math.max(u, v), w: 1 };
  emit('update:graph', { ...props.graph, edges: [...props.graph.edges, edge] });
  emit('note', `已创建边 (${edge.u}, ${edge.v})，权重=1。`);
}


// ---------------------------
// 双击空白新增节点
// ---------------------------
function onDblClickStage() {
  if (props.disabled) return;
  const stage = stageRef.value?.getStage?.() ?? stageRef.value;
  if (!stage) return;

  const pos = stage.getPointerPosition();
  if (!pos) return;

  const id = nextNodeId(props.graph.nodes);
  const node: GraphNode = { id, x: pos.x, y: pos.y };

  emit('update:graph', { ...props.graph, nodes: [...props.graph.nodes, node] });
  emit('note', `已新增节点 ${id}。`);
}

// ---------------------------
// 拖拽更新坐标
// ---------------------------
function updateNodePos(id: NodeId, x: number, y: number) {
  const nodes = props.graph.nodes.map((n) => (n.id === id ? { ...n, x, y } : n));
  emit('update:graph', { ...props.graph, nodes });
}

function onDragMove(id: NodeId, evt: any) {
  if (props.disabled) return;
  const { x, y } = evt.target.position();
  updateNodePos(id, x, y);
}

function onDragEnd(id: NodeId, evt: any) {
  if (props.disabled) return;
  const { x, y } = evt.target.position();
  updateNodePos(id, x, y);
}

// ---------------------------
// 样式映射
// ---------------------------
function nodeColor(state: NodeVizState | undefined) {
  switch (state) {
    case 'visited': return '#22c55e';
    case 'selected': return '#f59e0b';
    case 'frontier': return '#38bdf8';
    default: return '#94a3b8';
  }
}

function edgeStyle(state: EdgeVizState | undefined) {
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

  return {
    x: 0,  // 位置由 group 控制
    y: 0,
    radius: 22,
    fill: isDraft ? '#a78bfa' : nodeColor(state),
    stroke: '#0b0f14',
    strokeWidth: 2,
  };
}

function nodeTextConfig(n: GraphNode) {
  return {
    x: -6,  // 相对于 group 中心
    y: -7,
    text: String(n.id),
    fontSize: 14,
    fill: '#0b0f14',
    fontStyle: 'bold',
    listening: false,  // 文字不拦截事件
  };
}

function edgeLineConfig(e: GraphEdge) {
  const a = findNode(e.u);
  const b = findNode(e.v);
  if (!a || !b) return { points: [0, 0, 0, 0], stroke: '#64748b' };

  const st = props.edgeStates[edgeKey(e.u, e.v)];
  const { stroke, strokeWidth, dash } = edgeStyle(st);

  return {
    points: [a.x, a.y, b.x, b.y],
    stroke,
    strokeWidth,
    dash,
    lineCap: 'round',
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
    fill: '#e6edf3',
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
  right: 12px;
  top: 12px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid #1f2a37;
  border-radius: 8px;
  font-size: 12px;
  color: #cbd5e1;
}
.hint ul {
  margin: 6px 0 0 16px;
  padding: 0;
}
</style>
