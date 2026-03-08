<template>
  <div class="search-canvas">
    <div v-if="isTreeSearch" ref="treeViewportRef" class="tree-viewport">
      <svg
        v-if="treeSvg.width > 0 && treeSvg.height > 0"
        class="tree-links"
        :viewBox="`0 0 ${treeSvg.width} ${treeSvg.height}`"
      >
        <defs>
          <marker id="leaf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" />
          </marker>
        </defs>
        <line
          v-for="edge in treeEdges"
          :key="`tree-${edge.from}-${edge.to}`"
          :class="[
            'tree-edge',
            {
              active: isActiveTreeEdge(edge.from, edge.to),
              visited: isVisitedTreeEdge(edge.from, edge.to),
            },
          ]"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
        />
        <g v-if="activeEdgeLabel">
          <rect
            class="edge-label-bg"
            :x="activeEdgeLabel.x - 28"
            :y="activeEdgeLabel.y - 10"
            width="56"
            height="20"
            rx="10"
          />
          <text class="edge-label-text" :x="activeEdgeLabel.x" :y="activeEdgeLabel.y + 4">
            child {{ activeEdgeLabel.childIndex }}
          </text>
        </g>
        <line
          v-for="edge in leafEdges"
          :key="`leaf-${edge.from}-${edge.to}`"
          class="leaf-edge"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          marker-end="url(#leaf-arrow)"
        />
      </svg>
      <div v-for="level in treeLevels" :key="`depth-${level.depth}`" class="tree-level">
        <div
          v-for="node in level.nodes"
          :key="node.id"
          :class="['tree-node', { active: state.activeTreeNodeId === node.id, leaf: node.leaf }]"
          :ref="(el) => setTreeNodeRef(node.id, el as Element | null)"
        >
          <div class="tree-node-head">
            <span>{{ node.leaf ? '叶' : '内' }}</span>
            <span>[{{ node.start }}, {{ node.end }}]</span>
          </div>
          <div class="tree-keys">
            <span v-for="key in node.keys" :key="`${node.id}-${key}`" class="tree-key">{{ key }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="array-row">
      <div
        v-for="(item, index) in state.items"
        :key="item.id"
        :class="['array-item', itemStateClass(item.id)]"
      >
        <div class="value">{{ item.value }}</div>
        <div class="index">{{ index }}</div>
      </div>
    </div>

    <div class="pointer-row">
      <div v-if="state.pointers.left !== undefined" class="pointer left" :style="pointerStyle(state.pointers.left)">L</div>
      <div v-if="state.pointers.right !== undefined" class="pointer right" :style="pointerStyle(state.pointers.right)">R</div>
      <div v-if="state.pointers.mid !== undefined" class="pointer mid" :style="pointerStyle(state.pointers.mid)">M</div>
      <div v-if="state.pointers.index !== undefined" class="pointer idx" :style="pointerStyle(state.pointers.index)">i</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { SearchTreeNodeView, SearchVizState } from '../core/search/types';

const props = defineProps<{
  state: SearchVizState;
  algoKey?: string;
}>();

const isTreeSearch = computed(() => (
  props.algoKey === 'b-tree-search' || props.algoKey === 'b-plus-tree-search'
));

const treeViewportRef = ref<HTMLElement | null>(null);
const treeEdges = ref<Array<{ from: string; to: string; x1: number; y1: number; x2: number; y2: number }>>([]);
const leafEdges = ref<Array<{ from: string; to: string; x1: number; y1: number; x2: number; y2: number }>>([]);
const activeEdgeLabel = ref<{ x: number; y: number; childIndex: number } | null>(null);
const treeSvg = reactive({ width: 0, height: 0 });
const nodeElMap = new Map<string, HTMLElement>();

const treeLevels = computed(() => {
  const nodes = props.state.treeNodes ?? [];
  const grouped = new Map<number, typeof nodes>();
  nodes.forEach((node) => {
    const list = grouped.get(node.depth) ?? [];
    list.push(node);
    grouped.set(node.depth, list);
  });
  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([depth, levelNodes]) => ({
      depth,
      nodes: [...levelNodes].sort((a, b) => a.order - b.order),
    }));
});

function setTreeNodeRef(nodeId: string, el: Element | null) {
  if (el instanceof HTMLElement) {
    nodeElMap.set(nodeId, el);
  } else {
    nodeElMap.delete(nodeId);
  }
}

function getPoint(node: SearchTreeNodeView, anchor: 'top' | 'bottom' | 'left' | 'right') {
  const root = treeViewportRef.value;
  const el = nodeElMap.get(node.id);
  if (!root || !el) return null;
  const rootRect = root.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  if (anchor === 'top') return { x: rect.left - rootRect.left + rect.width / 2, y: rect.top - rootRect.top };
  if (anchor === 'bottom') return { x: rect.left - rootRect.left + rect.width / 2, y: rect.bottom - rootRect.top };
  if (anchor === 'left') return { x: rect.left - rootRect.left, y: rect.top - rootRect.top + rect.height / 2 };
  return { x: rect.right - rootRect.left, y: rect.top - rootRect.top + rect.height / 2 };
}

function rebuildTreeLinks() {
  const root = treeViewportRef.value;
  if (!root || !isTreeSearch.value) {
    treeEdges.value = [];
    leafEdges.value = [];
    activeEdgeLabel.value = null;
    treeSvg.width = 0;
    treeSvg.height = 0;
    return;
  }
  treeSvg.width = root.clientWidth;
  treeSvg.height = root.clientHeight;

  const nodes = props.state.treeNodes ?? [];
  const nodeMap = new Map<string, SearchTreeNodeView>();
  const byDepthOrder = new Map<string, SearchTreeNodeView>();
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    byDepthOrder.set(`${node.depth}:${node.order}`, node);
  });

  const nextTreeEdges: Array<{ from: string; to: string; x1: number; y1: number; x2: number; y2: number }> = [];
  for (const child of nodes) {
    if (child.depth <= 0) continue;
    const parent = byDepthOrder.get(`${child.depth - 1}:${Math.floor(child.order / 10)}`);
    if (!parent) continue;
    const p1 = getPoint(parent, 'bottom');
    const p2 = getPoint(child, 'top');
    if (!p1 || !p2) continue;
    nextTreeEdges.push({ from: parent.id, to: child.id, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
  }
  treeEdges.value = nextTreeEdges;
  const active = props.state.activeTreeEdge;
  const activeIndex = props.state.activeChildIndex;
  if (active && activeIndex !== null && activeIndex !== undefined) {
    const edge = nextTreeEdges.find((item) => item.from === active.from && item.to === active.to);
    if (edge) {
      activeEdgeLabel.value = {
        x: (edge.x1 + edge.x2) / 2,
        y: (edge.y1 + edge.y2) / 2 - 6,
        childIndex: activeIndex,
      };
    } else {
      activeEdgeLabel.value = null;
    }
  } else {
    activeEdgeLabel.value = null;
  }

  if (props.algoKey === 'b-plus-tree-search') {
    const leaves = nodes.filter((n) => n.leaf).sort((a, b) => a.order - b.order);
    const nextLeafEdges: Array<{ from: string; to: string; x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < leaves.length - 1; i++) {
      const left = leaves[i]!;
      const right = leaves[i + 1]!;
      const p1 = getPoint(left, 'right');
      const p2 = getPoint(right, 'left');
      if (!p1 || !p2) continue;
      nextLeafEdges.push({ from: left.id, to: right.id, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
    }
    leafEdges.value = nextLeafEdges;
  } else {
    leafEdges.value = [];
  }
}

function scheduleRebuild() {
  nextTick(() => rebuildTreeLinks());
}

function onResize() {
  scheduleRebuild();
}

onMounted(() => {
  window.addEventListener('resize', onResize);
  scheduleRebuild();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});

watch(
  () => [props.state.treeNodes, props.algoKey],
  () => scheduleRebuild(),
  { deep: true }
);

function itemStateClass(id: number): string {
  const st = props.state.itemStates[id] ?? 'default';
  return `item-${st}`;
}

function isActiveTreeEdge(from: string, to: string): boolean {
  const edge = props.state.activeTreeEdge;
  return !!edge && edge.from === from && edge.to === to;
}

function isVisitedTreeEdge(from: string, to: string): boolean {
  const list = props.state.visitedTreeEdges ?? [];
  return list.some((edge) => edge.from === from && edge.to === to);
}

function pointerStyle(index: number): Record<string, string> {
  return {
    left: `${index * 90 + 35}px`,
  };
}
</script>

<style scoped>
.search-canvas {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 60px 40px;
  min-height: 500px;
  overflow-x: auto;
}

.tree-viewport {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 10px 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
}

.tree-links {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.tree-edge {
  stroke: #64748b;
  stroke-width: 2;
}

.tree-edge.visited {
  stroke: #38bdf8;
  stroke-width: 2.5;
}

.tree-edge.active {
  stroke: #2563eb;
  stroke-width: 3;
}

.leaf-edge {
  stroke: #16a34a;
  stroke-width: 2;
  stroke-dasharray: 4 4;
}

.edge-label-bg {
  fill: rgba(37, 99, 235, 0.92);
}

.edge-label-text {
  fill: #ffffff;
  font-size: 10px;
  font-weight: 700;
  text-anchor: middle;
}

.tree-level {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.tree-node {
  min-width: 120px;
  padding: 8px;
  border-radius: 10px;
  border: 2px solid #94a3b8;
  background: #ffffff;
  transition: all 0.2s ease;
}

.tree-node.active {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.tree-node.leaf {
  border-color: #22c55e;
}

.tree-node-head {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #475569;
  margin-bottom: 6px;
}

.tree-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tree-key {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  background: #e2e8f0;
}

.array-row {
  display: flex;
  gap: 10px;
  position: relative;
}

.array-item {
  width: 80px;
  height: 80px;
  border: 3px solid #94a3b8;
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.index {
  margin-top: 6px;
  font-size: 11px;
  color: #64748b;
}

.pointer-row {
  position: relative;
  height: 24px;
}

.pointer {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 8px;
  color: #fff;
}

.left { background: #2563eb; }
.right { background: #7c3aed; }
.mid { background: #f59e0b; }
.idx { background: #14b8a6; }

.item-default { border-color: #94a3b8; background: #fff; }
.item-active { border-color: #3b82f6; background: #dbeafe; transform: scale(1.05); }
.item-checked { border-color: #64748b; background: #f1f5f9; }
.item-found { border-color: #22c55e; background: #dcfce7; transform: scale(1.08); }
.item-eliminated { border-color: #cbd5e1; background: #f8fafc; opacity: 0.55; }
.item-pivot { border-color: #f59e0b; background: #fef3c7; transform: scale(1.05); }
</style>
