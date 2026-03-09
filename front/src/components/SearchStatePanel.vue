<template>
  <div class="panel">
    <div class="section">
      <div class="section-title">💡 当前步骤</div>
      <div class="note">{{ note }}</div>
    </div>

    <div class="section">
      <div class="section-title">🎯 查找目标</div>
      <div class="meta">target = {{ state.target }}</div>
    </div>

    <div class="section">
      <div class="section-title">📍 指针</div>
      <div class="meta">left: {{ pointerText(state.pointers.left) }}</div>
      <div class="meta">right: {{ pointerText(state.pointers.right) }}</div>
      <div class="meta">mid: {{ pointerText(state.pointers.mid) }}</div>
      <div class="meta">index: {{ pointerText(state.pointers.index) }}</div>
    </div>

    <div v-if="state.treeNodes?.length" class="section">
      <div class="section-title">🧭 树路由</div>
      <div class="meta">active-node: {{ activeTreeNodeText }}</div>
      <div class="meta">rule: {{ state.routeHint || '-' }}</div>
      <div class="meta">visited-nodes: {{ visitedNodeCount }}</div>
      <div class="meta">visited-edges: {{ visitedEdgeCount }}</div>
      <div class="path-head">
        <span class="meta">node-path:</span>
        <div v-if="hasNodePath" class="path-actions">
          <button type="button" class="path-btn" @click="togglePathExpanded">
            {{ isPathExpanded ? '收起' : '展开' }}
          </button>
          <button type="button" class="path-btn" @click="copyNodePath">
            {{ copyButtonText }}
          </button>
        </div>
      </div>
      <div class="meta mono node-path" :class="{ collapsed: !isPathExpanded }">{{ visitedNodePathText }}</div>
      <div v-if="showManualCopyFallback" class="manual-copy">
        <div class="manual-copy-head">
          <span>浏览器限制复制，请手动复制以下路径：</span>
          <div class="manual-copy-actions">
            <button type="button" class="path-btn" @click="retryCopy">重试复制</button>
            <button type="button" class="path-btn" @click="hideManualFallback">关闭</button>
          </div>
        </div>
        <textarea
          ref="manualCopyTextareaRef"
          class="manual-copy-input mono"
          readonly
          :value="visitedNodePathText"
          @focus="selectManualCopyText"
        />
        <div class="manual-copy-hint">快捷键：{{ copyShortcutHint }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">✅ 结果</div>
      <div class="meta">{{ state.resultIndex === null ? '未找到' : `找到，索引 ${state.resultIndex}` }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SearchVizState } from '../core/search/types';

const props = defineProps<{
  note: string;
  state: SearchVizState;
}>();

const activeTreeNodeText = computed(() => {
  if (!props.state.treeNodes?.length || !props.state.activeTreeNodeId) return '-';
  const node = props.state.treeNodes.find((item) => item.id === props.state.activeTreeNodeId);
  if (!node) return '-';
  return `${node.id} keys=[${node.keys.join(', ')}]`;
});

const visitedNodeCount = computed(() => props.state.visitedTreeNodeIds?.length ?? 0);
const visitedEdgeCount = computed(() => props.state.visitedTreeEdges?.length ?? 0);
const visitedNodePathText = computed(() => {
  const ids = props.state.visitedTreeNodeIds ?? [];
  return ids.length > 0 ? ids.join(' -> ') : '-';
});
const hasNodePath = computed(() => (props.state.visitedTreeNodeIds?.length ?? 0) > 0);
const isPathExpanded = ref(false);
const copyButtonText = ref('复制');
const showManualCopyFallback = ref(false);
const manualCopyTextareaRef = ref<HTMLTextAreaElement | null>(null);
const copyShortcutHint = computed(() => (
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform) ? 'Command + C' : 'Ctrl + C'
));

watch(
  () => visitedNodePathText.value,
  (path) => {
    isPathExpanded.value = path.length <= 48;
    copyButtonText.value = '复制';
    showManualCopyFallback.value = false;
  },
  { immediate: true }
);

function togglePathExpanded() {
  isPathExpanded.value = !isPathExpanded.value;
}

async function copyNodePath() {
  if (!hasNodePath.value) return;
  const ok = await copyText(visitedNodePathText.value);
  copyButtonText.value = ok ? '已复制' : '复制失败，请手动复制';
  showManualCopyFallback.value = !ok;
  if (!ok) {
    requestAnimationFrame(() => selectManualCopyText());
  }
}

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to execCommand for restricted clipboard environments.
    }
  }

  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    if (textarea?.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
  }
}

function pointerText(value: number | undefined): string {
  return value === undefined ? '-' : String(value);
}

function hideManualFallback() {
  showManualCopyFallback.value = false;
}

function selectManualCopyText() {
  if (!manualCopyTextareaRef.value) return;
  manualCopyTextareaRef.value.focus();
  manualCopyTextareaRef.value.select();
}

async function retryCopy() {
  const ok = await copyText(visitedNodePathText.value);
  copyButtonText.value = ok ? '已复制' : '复制失败，请手动复制';
  showManualCopyFallback.value = !ok;
  if (!ok) {
    requestAnimationFrame(() => selectManualCopyText());
  }
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.note {
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.8), rgba(209, 250, 229, 0.6));
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  white-space: pre-wrap;
  color: #065f46;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 500;
}

.meta {
  font-size: 12px;
  color: var(--muted-2);
}

.path-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.path-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.path-btn {
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.4;
  color: #065f46;
  background: rgba(236, 253, 245, 0.9);
  cursor: pointer;
}

.path-btn:hover {
  background: rgba(209, 250, 229, 0.9);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  word-break: break-all;
}

.node-path.collapsed {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.manual-copy {
  margin-top: 4px;
  padding: 8px;
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 8px;
  background: rgba(255, 251, 235, 0.85);
}

.manual-copy-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #92400e;
  margin-bottom: 6px;
}

.manual-copy-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.manual-copy-input {
  width: 100%;
  min-height: 58px;
  resize: vertical;
  border: 1px solid rgba(217, 119, 6, 0.35);
  border-radius: 6px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  font-size: 12px;
}

.manual-copy-hint {
  margin-top: 6px;
  font-size: 11px;
  color: #a16207;
}
</style>
