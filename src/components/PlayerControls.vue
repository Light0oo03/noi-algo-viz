<template>
  <div class="bar">
    <button class="primary" @click="$emit('run')">运行 BFS</button>

    <button @click="$emit('play')" :disabled="status === 'playing'">播放</button>
    <button @click="$emit('pause')" :disabled="status !== 'playing'">暂停</button>
    <button @click="$emit('step')">单步</button>
    <button @click="$emit('reset')">重置</button>

    <div class="status">状态：{{ statusLabel }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'idle' | 'ready' | 'playing' | 'paused' | 'ended';
}>();

defineEmits<{
  (e: 'run'): void;
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'step'): void;
  (e: 'reset'): void;
}>();

const statusLabel = computed(() => {
  switch (props.status) {
    case 'idle': return '未运行';
    case 'ready': return '就绪';
    case 'playing': return '播放中';
    case 'paused': return '已暂停';
    case 'ended': return '已结束';
  }
});
</script>

<style scoped>
.bar {
  display: flex;
  gap: 10px;
  align-items: center;
}
button {
  background: #111827;
  color: #e6edf3;
  border: 1px solid #334155;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.primary {
  background: #2563eb;
  border-color: #1d4ed8;
}
.status {
  margin-left: auto;
  font-size: 12px;
  color: #9fb0c0;
}
</style>
