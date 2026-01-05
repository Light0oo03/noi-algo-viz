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
  background: #0d1117;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.code-title {
  font-size: 12px;
  font-weight: 600;
  color: #e6edf3;
}

.code-lang {
  font-size: 11px;
  color: #7d8590;
  background: #21262d;
  padding: 2px 8px;
  border-radius: 4px;
}

.code-content {
  flex: 1;
  overflow: auto;
  padding: 6px 0;
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
  line-height: 1.3;
  transition: background-color 0.3s ease;
}

.code-line.highlighted {
  background: rgba(255, 217, 102, 0.15);
  border: 1px dashed rgba(255, 217, 102, 0.6);
  border-left: 3px solid #ffd966;
  margin: -1px 0;
}

.line-number {
  display: inline-block;
  width: 24px;
  padding-right: 6px;
  text-align: right;
  color: #6e7681;
  font-size: 11px;
  user-select: none;
}

.line-content {
  color: #e6edf3;
  font-size: 12px;
  white-space: pre;
}

.code-line.highlighted .line-number {
  color: #ffd966;
}

.code-line.highlighted .line-content {
  color: #fff;
}
</style>
