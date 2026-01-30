<template>
  <div class="code-viewer">
    <div class="code-header">
      <span class="code-title">{{ title }}</span>
      <span class="code-lang">{{ language }}</span>
    </div>
    <div class="code-content" ref="codeContentRef">
      <pre><code><template v-for="(line, index) in codeLines" :key="index"><span 
        :ref="el => setLineRef(el, index + 1)"
        :class="['code-line', { 'highlighted': isLineHighlighted(index + 1) }]"
      ><span class="line-number">{{ index + 1 }}</span><span class="line-content">{{ line }}</span></span>
</template></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';

const props = defineProps<{
  code: string;
  title?: string;
  language?: string;
  highlightLines?: [number, number];
}>();

const codeLines = computed(() => props.code.split('\n'));
const codeContentRef = ref<HTMLElement | null>(null);
const lineRefs = ref<Map<number, HTMLElement>>(new Map());

function setLineRef(el: any, lineNumber: number) {
  if (el) {
    lineRefs.value.set(lineNumber, el as HTMLElement);
  }
}

function isLineHighlighted(lineNumber: number): boolean {
  if (!props.highlightLines) return false;
  const [start, end] = props.highlightLines;
  return lineNumber >= start && lineNumber <= end;
}

// 自动滚动到高亮行
watch(
  () => props.highlightLines,
  async (newLines) => {
    if (!newLines) return;
    
    await nextTick();
    
    const [startLine] = newLines;
    const lineEl = lineRefs.value.get(startLine);
    const container = codeContentRef.value;
    
    if (lineEl && container) {
      const containerRect = container.getBoundingClientRect();
      const lineRect = lineEl.getBoundingClientRect();
      
      // 检查行是否在可视区域内
      const isVisible = 
        lineRect.top >= containerRect.top && 
        lineRect.bottom <= containerRect.bottom;
      
      if (!isVisible) {
        // 滚动到高亮行，让它在容器中间位置
        const scrollTop = lineEl.offsetTop - container.clientHeight / 2 + lineEl.clientHeight / 2;
        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.code-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(220, 252, 231, 0.7);
  border-bottom: 1px solid var(--border);
}

.code-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.code-lang {
  font-size: 11px;
  color: rgba(6, 95, 70, 0.8);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.18);
  padding: 2px 8px;
  border-radius: 4px;
}

.code-content {
  flex: 1;
  overflow: auto;
  padding: 10px 0 6px;
}

pre {
  margin: 0;
  padding: 0;
}

code {
  display: block;
}

.code-line {
  display: block;
  padding: 0 6px 0 0;
  line-height: 1px;
  position: relative;
  transition: background-color 0.3s ease;
}

.code-line.highlighted::before {
  content: '';
  position: absolute;
  inset: -6px 0;
  background: rgba(34, 197, 94, 0.14);
  box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.5);
  border-left: 3px solid #22c55e;
  border-radius: 2px;
  z-index: 0;
  pointer-events: none;
}

.line-number {
  display: inline-block;
  width: 24px;
  padding-right: 6px;
  text-align: right;
  color: rgba(6, 95, 70, 0.45);
  font-size: 12px;
  user-select: none;
  position: relative;
  z-index: 1;
}

.line-content {
  color: var(--text);
  font-size: 14px;
  white-space: pre;
  position: relative;
  z-index: 1;
}

.code-line.highlighted .line-number {
  color: #16a34a;
}

.code-line.highlighted .line-content {
  color: #052e16;
}
</style>
