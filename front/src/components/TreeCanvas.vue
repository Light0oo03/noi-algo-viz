<template>
  <div class="tree-canvas">
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
    <div class="tree-nodes">
      <div
        v-for="node in nodes"
        :key="node.id"
        :class="['tree-node', nodeStateClass(node.id)]"
        :style="nodeStyle(node.id)"
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
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import gsap from 'gsap';
import type { TreeVizState, TreeEdge } from '../core/tree/types';
import { calculateTreeLayout } from '../core/tree/layout';
import { getTreeEdges } from '../core/tree/utils';

const props = defineProps<{
  state: TreeVizState;
}>();

const currentTree = computed(() => props.state.trees[0]);
const nodes = computed(() => currentTree.value?.nodes ?? []);
const edges = computed(() => currentTree.value ? getTreeEdges(currentTree.value) : []);

const layout = computed(() => {
  if (!currentTree.value) return {};
  return calculateTreeLayout(currentTree.value, {
    nodeWidth: 50,
    nodeHeight: 50,
    horizontalGap: 80,
    verticalGap: 80,
  });
});

const nodePositions = computed(() => layout.value);

const activePointers = computed(() => {
  const result: Record<string, { name: string; nodeId: number; color: string }> = {};
  Object.entries(props.state.pointers).forEach(([key, ptr]) => {
    const node = nodes.value.find((n) => n.id === ptr.nodeId);
    if (node) {
      result[key] = ptr;
    }
  });
  return result;
});

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

watch(() => props.state, () => {
  const nodeElements = document.querySelectorAll('.tree-node');
  nodeElements.forEach((el) => {
    gsap.fromTo(el,
      { scale: 0.9, opacity: 0.7 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
    );
  });
}, { deep: true });
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
  pointer-events: none;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
