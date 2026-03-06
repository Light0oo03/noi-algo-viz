<template>
  <div
    ref="canvasRef"
    class="tree-canvas"
    :class="{ disabled }"
    @dblclick="onCanvasDblClick"
    @click.self="onClickCanvas"
    @contextmenu.prevent="onCanvasContextMenu"
  >
    <svg class="tree-svg">
      <line
        v-for="edge in edges"
        :key="edgeKey(edge)"
        :x1="nodePositions[edge.parent]?.x"
        :y1="nodePositions[edge.parent]?.y"
        :x2="nodePositions[edge.child]?.x"
        :y2="nodePositions[edge.child]?.y"
        :class="['tree-edge', edgeStateClass(edge)]"
      />
    </svg>

    <div class="tree-nodes" @click="onNodeLayerClick">
      <div
        v-for="node in nodes"
        :key="node.id"
        :class="[
          'tree-node',
          nodeStateClass(node.id),
          { 'is-selected': selectedNodeId === node.id, dragging: draggingNodeId === node.id },
        ]"
        :style="nodeStyle(node.id)"
        @mousedown="onNodeMouseDown(node.id, $event)"
        @click="onNodeClick(node.id, $event)"
        @contextmenu.prevent="onNodeContextMenu(node.id, $event)"
      >
        {{ node.value }}
      </div>
    </div>

    <div
      v-for="(ptr, name) in activePointers"
      :key="name"
      class="tree-pointer"
      :style="pointerStyle(ptr)"
    >
      {{ ptr.name }}
    </div>

    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
    >
      <div class="context-menu-item delete" @click="onConfirmDeleteNode">
        🗑️ 删除节点 {{ contextMenu.nodeId }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import gsap from 'gsap';
import type { TreeVizState, TreeEdge, TreeView, TreeNode } from '../core/tree/types';
import { calculateTreeLayout } from '../core/tree/layout';
import { getParent, getTreeEdges } from '../core/tree/utils';

const props = withDefaults(defineProps<{
  state: TreeVizState;
  disabled?: boolean;
  disabledHint?: string;
}>(), {
  disabled: false,
  disabledHint: '当前状态不可编辑',
});

const emit = defineEmits<{
  (e: 'update:tree', tree: TreeView): void;
  (e: 'note', note: string): void;
  (e: 'disabled-action'): void;
}>();

const canvasRef = ref<HTMLElement | null>(null);
const selectedNodeId = ref<number | null>(null);
const draggingNodeId = ref<number | null>(null);
const dragMoved = ref<boolean>(false);
const customPositions = reactive<Record<number, { x: number; y: number }>>({});
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  nodeId: -1,
});

const currentTree = computed(() => props.state.trees[0]);
const nodes = computed(() => currentTree.value?.nodes ?? []);
const edges = computed(() => (currentTree.value ? getTreeEdges(currentTree.value) : []));

const layout = computed(() => {
  if (!currentTree.value) return {} as Record<number, { x: number; y: number }>;
  return calculateTreeLayout(currentTree.value, {
    nodeWidth: 50,
    nodeHeight: 50,
    horizontalGap: 80,
    verticalGap: 80,
  });
});

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

const nodePositions = computed(() => {
  const positions: Record<number, { x: number; y: number }> = { ...layout.value };

  let orphanIndex = 0;
  for (const node of nodes.value) {
    if (!positions[node.id]) {
      positions[node.id] = {
        x: 80 + (orphanIndex % 8) * 90,
        y: 420 + Math.floor(orphanIndex / 8) * 90,
      };
      orphanIndex++;
    }
  }

  for (const node of nodes.value) {
    if (isFiniteNumber(node.x) && isFiniteNumber(node.y)) {
      positions[node.id] = { x: node.x, y: node.y };
      continue;
    }
    const custom = customPositions[node.id];
    if (custom) {
      positions[node.id] = custom;
    }
  }

  return positions;
});

const activePointers = computed(() => {
  const result: Record<string, { name: string; nodeId: number; color: string }> = {};
  Object.entries(props.state.pointers).forEach(([key, ptr]) => {
    const node = nodes.value.find((n) => n.id === ptr.nodeId);
    if (node) result[key] = ptr;
  });
  return result;
});

const dragState = ref<{
  nodeId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
} | null>(null);

function nodeStateClass(nodeId: number): string {
  const treeId = currentTree.value?.id ?? '';
  const st = props.state.nodeStates[treeId]?.[nodeId] ?? 'default';
  return `node-${st}`;
}

function edgeStateClass(edge: TreeEdge): string {
  const treeId = currentTree.value?.id ?? '';
  const key = `${edge.parent}-${edge.child}`;
  const st = props.state.edgeStates[treeId]?.[key] ?? 'default';
  return `edge-${st}`;
}

function nodeStyle(nodeId: number): Record<string, string> {
  const pos = nodePositions.value[nodeId];
  if (!pos) return {};
  return {
    left: `${pos.x - 25}px`,
    top: `${pos.y - 25}px`,
  };
}

function pointerStyle(ptr: { name: string; nodeId: number; color: string }): Record<string, string> {
  const pos = nodePositions.value[ptr.nodeId];
  if (!pos) return {};
  return {
    left: `${pos.x + 30}px`,
    top: `${pos.y - 10}px`,
    color: ptr.color,
  };
}

function edgeKey(edge: TreeEdge): string {
  return `${edge.parent}-${edge.child}`;
}

function cloneTree(tree: TreeView): TreeView {
  return {
    ...tree,
    nodes: tree.nodes.map((node) => ({ ...node })),
  };
}

function snapshotTreePositions(tree: TreeView): TreeView {
  return {
    ...tree,
    nodes: tree.nodes.map((node) => {
      const pos = nodePositions.value[node.id];
      if (!pos) return { ...node };
      return { ...node, x: pos.x, y: pos.y };
    }),
  };
}

function isDescendant(tree: TreeView, ancestorId: number, targetId: number): boolean {
  const nodeMap = new Map(tree.nodes.map((n) => [n.id, n]));
  const stack = [ancestorId];
  const visited = new Set<number>();

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (currentId == null || visited.has(currentId)) continue;
    if (currentId === targetId) return true;
    visited.add(currentId);

    const node = nodeMap.get(currentId);
    if (!node) continue;
    if (node.left !== null) stack.push(node.left);
    if (node.right !== null) stack.push(node.right);
  }

  return false;
}

function emitDisabledHint() {
  emit('disabled-action');
  emit('note', props.disabledHint);
}

function hideContextMenu() {
  contextMenu.visible = false;
}

function onClickCanvas() {
  selectedNodeId.value = null;
  hideContextMenu();
}

function onNodeLayerClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    selectedNodeId.value = null;
    hideContextMenu();
  }
}

function onCanvasContextMenu() {
  hideContextMenu();
}

function onCanvasDblClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.closest('.tree-node')) return;

  if (props.disabled) {
    emitDisabledHint();
    return;
  }

  const tree = currentTree.value;
  const el = canvasRef.value;
  if (!tree || !el) return;

  const rect = el.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const nextTree = cloneTree(tree);
  const maxId = nextTree.nodes.reduce((max, node) => Math.max(max, node.id), -1);
  const newId = maxId + 1;
  const maxValue = nextTree.nodes.reduce((max, node) => Math.max(max, node.value), -1);
  const newValue = maxValue + 1;
  const newNode: TreeNode = { id: newId, value: newValue, left: null, right: null };
  nextTree.nodes.push(newNode);

  if (nextTree.root === null) {
    nextTree.root = newId;
    emit('note', `已新增根节点 ${newValue}`);
  } else {
    emit('note', `已新增节点 ${newValue}。请点击父节点再点击该节点进行连线。`);
  }

  customPositions[newId] = { x, y };
  hideContextMenu();
  emit('update:tree', snapshotTreePositions(nextTree));
}

function onNodeMouseDown(nodeId: number, event: MouseEvent) {
  if (props.disabled) {
    emitDisabledHint();
    return;
  }

  event.stopPropagation();
  hideContextMenu();
  const pos = nodePositions.value[nodeId];
  if (!pos) return;

  dragMoved.value = false;
  draggingNodeId.value = nodeId;
  dragState.value = {
    nodeId,
    startX: event.clientX,
    startY: event.clientY,
    originX: pos.x,
    originY: pos.y,
  };

  window.addEventListener('mousemove', onWindowMouseMove);
  window.addEventListener('mouseup', onWindowMouseUp);
}

function onWindowMouseMove(event: MouseEvent) {
  if (!dragState.value) return;

  const dx = event.clientX - dragState.value.startX;
  const dy = event.clientY - dragState.value.startY;

  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    dragMoved.value = true;
  }

  customPositions[dragState.value.nodeId] = {
    x: dragState.value.originX + dx,
    y: dragState.value.originY + dy,
  };
}

function onWindowMouseUp() {
  if (dragState.value && currentTree.value) {
    const nodeId = dragState.value.nodeId;
    const pos = customPositions[nodeId];
    if (pos) {
      const nextTree = cloneTree(currentTree.value);
      const target = nextTree.nodes.find((node) => node.id === nodeId);
      if (target) {
        target.x = pos.x;
        target.y = pos.y;
        emit('update:tree', snapshotTreePositions(nextTree));
      }
    }
  }
  dragState.value = null;
  draggingNodeId.value = null;
  window.removeEventListener('mousemove', onWindowMouseMove);
  window.removeEventListener('mouseup', onWindowMouseUp);
}

function onNodeClick(nodeId: number, event: MouseEvent) {
  event.stopPropagation();

  if (props.disabled) {
    emitDisabledHint();
    return;
  }

  if (dragMoved.value) {
    dragMoved.value = false;
    return;
  }
  hideContextMenu();

  if (selectedNodeId.value === null) {
    selectedNodeId.value = nodeId;
    emit('note', `已选择节点 ${nodeId}，请再点击另一个节点自动判断连线方向。`);
    return;
  }

  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = null;
    emit('note', '已取消选择。');
    return;
  }

  const tree = currentTree.value;
  if (!tree) return;

  const firstId = selectedNodeId.value;
  const secondId = nodeId;
  const nextTree = cloneTree(tree);

  function detachChildFromOldParent(childId: number): number | null {
    const oldParent = getParent(nextTree, childId);
    if (!oldParent) return null;
    const oldParentNode = nextTree.nodes.find((n) => n.id === oldParent.id);
    if (!oldParentNode) return null;
    if (oldParentNode.left === childId) oldParentNode.left = null;
    if (oldParentNode.right === childId) oldParentNode.right = null;
    return oldParent.id;
  }

  function makeParentSlot(parentNode: TreeNode, preferLeft: boolean): number | null {
    if (parentNode.left === null || parentNode.right === null) return null;
    if (preferLeft) {
      const displaced = parentNode.left;
      parentNode.left = null;
      return displaced;
    }
    const displaced = parentNode.right;
    parentNode.right = null;
    return displaced;
  }

  function tryAttach(parentId: number, childId: number): { ok: boolean; reason?: string; displacedId?: number | null } {
    const parentNode = nextTree.nodes.find((n) => n.id === parentId);
    const childNode = nextTree.nodes.find((n) => n.id === childId);
    if (!parentNode || !childNode) return { ok: false, reason: '节点不存在。' };

    if (isDescendant(nextTree, childId, parentId)) return { ok: false, reason: '连线会形成环。' };

    const parentPos = nodePositions.value[parentId] ?? { x: 0, y: 0 };
    const childPos = nodePositions.value[childId] ?? { x: 0, y: 0 };
    const preferLeft = childPos.x < parentPos.x;

    // 若 child 已有父节点，先解除旧关系，支持重挂接
    detachChildFromOldParent(childId);

    const displacedId = makeParentSlot(parentNode, preferLeft);

    if (parentNode.left === null && parentNode.right === null) {
      if (preferLeft) {
        parentNode.left = childId;
      } else {
        parentNode.right = childId;
      }
    } else if (parentNode.left === null) {
      parentNode.left = childId;
    } else {
      parentNode.right = childId;
    }
    return { ok: true, displacedId };
  }

  const firstHasParent = !!getParent(nextTree, firstId);
  const secondHasParent = !!getParent(nextTree, secondId);
  let parentCandidate = firstId;
  let childCandidate = secondId;

  // 优先让“已有父节点的节点”继续做父节点，让“新节点/无父节点”做子节点
  if (!firstHasParent && secondHasParent) {
    parentCandidate = secondId;
    childCandidate = firstId;
  }

  const firstTry = tryAttach(parentCandidate, childCandidate);
  let finalParent = parentCandidate;
  let finalChild = childCandidate;
  let displacedId: number | null | undefined = firstTry.displacedId;

  if (!firstTry.ok) {
    const reverseTry = tryAttach(childCandidate, parentCandidate);
    if (!reverseTry.ok) {
      emit('note', firstTry.reason ?? reverseTry.reason ?? '无法连线，请检查父子关系。');
      selectedNodeId.value = null;
      return;
    }
    finalParent = childCandidate;
    finalChild = parentCandidate;
    displacedId = reverseTry.displacedId;
  }

  if (nextTree.root === null) {
    nextTree.root = finalParent;
  } else if (nextTree.root === finalChild) {
    nextTree.root = findRoot(nextTree);
  }

  selectedNodeId.value = null;
  emit('update:tree', snapshotTreePositions(nextTree));
  if (displacedId != null) {
    emit('note', `已连接节点 ${finalParent} -> ${finalChild}，并释放原子节点 ${displacedId}。`);
  } else {
    emit('note', `已连接节点 ${finalParent} -> ${finalChild}`);
  }
}

function onNodeContextMenu(nodeId: number, event: MouseEvent) {
  event.stopPropagation();
  if (props.disabled) {
    emitDisabledHint();
    return;
  }
  selectedNodeId.value = nodeId;
  const el = canvasRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  contextMenu.x = event.clientX - rect.left;
  contextMenu.y = event.clientY - rect.top;
  contextMenu.nodeId = nodeId;
  contextMenu.visible = true;
}

function findRoot(tree: TreeView): number | null {
  if (tree.nodes.length === 0) return null;
  const childIds = new Set<number>();
  tree.nodes.forEach((node) => {
    if (node.left !== null) childIds.add(node.left);
    if (node.right !== null) childIds.add(node.right);
  });
  const root = tree.nodes.find((node) => !childIds.has(node.id));
  return root?.id ?? tree.nodes[0]?.id ?? null;
}

function onConfirmDeleteNode() {
  const tree = currentTree.value;
  if (!tree || contextMenu.nodeId < 0) return;
  const targetId = contextMenu.nodeId;
  const nextTree = cloneTree(tree);
  nextTree.nodes = nextTree.nodes.filter((node) => node.id !== targetId);
  nextTree.nodes = nextTree.nodes.map((node) => ({
    ...node,
    left: node.left === targetId ? null : node.left,
    right: node.right === targetId ? null : node.right,
  }));
  nextTree.root = findRoot(nextTree);
  selectedNodeId.value = null;
  hideContextMenu();
  delete customPositions[targetId];
  emit('update:tree', snapshotTreePositions(nextTree));
  emit('note', `已删除节点 ${targetId}`);
}

watch(
  () => nodes.value.map((node) => node.id),
  (ids) => {
    const idSet = new Set(ids);
    ids.forEach((id) => {
      if (!customPositions[id]) {
        const basePos = nodePositions.value[id];
        if (basePos) {
          customPositions[id] = { x: basePos.x, y: basePos.y };
        }
      }
    });
    Object.keys(customPositions).forEach((key) => {
      const id = Number(key);
      if (!idSet.has(id)) {
        delete customPositions[id];
      }
    });

    if (selectedNodeId.value !== null && !idSet.has(selectedNodeId.value)) {
      selectedNodeId.value = null;
    }
  },
  { immediate: true }
);

watch(
  () => props.state,
  () => {
    const nodeElements = canvasRef.value?.querySelectorAll('.tree-node') ?? [];
    nodeElements.forEach((el) => {
      gsap.fromTo(
        el,
        { scale: 0.9, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    });
  },
  { deep: true }
);

onBeforeUnmount(() => {
  onWindowMouseUp();
  hideContextMenu();
});
</script>

<style scoped>
.tree-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.tree-canvas.disabled {
  cursor: not-allowed;
}

.tree-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tree-edge {
  stroke-width: 3;
  stroke-linecap: round;
  transition: all 0.3s ease;
}

.edge-default {
  stroke: #94a3b8;
}

.edge-checking {
  stroke: #7c3aed;
  stroke-width: 4;
}

.edge-path {
  stroke: #14b8a6;
  stroke-width: 4;
}

.tree-nodes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.tree-node {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  background: #fff;
  border: 3px solid #94a3b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: grab;
  user-select: none;
}

.tree-node.dragging {
  cursor: grabbing;
}

.tree-node.is-selected {
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.25), 0 4px 12px rgba(34, 197, 94, 0.25);
}

.node-default {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.node-active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05));
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: scale(1.1);
}

.node-visited {
  border-color: #6366f1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05));
}

.node-frontier {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05));
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.node-selected {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05));
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.tree-pointer {
  position: absolute;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid currentColor;
  white-space: nowrap;
  transition: all 0.3s ease-out;
  animation: pointerBlink 1.5s ease-in-out infinite;
}

@keyframes pointerBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.context-menu {
  position: absolute;
  background: var(--panel-solid, #ffffff);
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
}

.context-menu-item.delete {
  color: #b91c1c;
}

.context-menu-item.delete:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}
</style>
