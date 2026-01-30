<template>
  <div class="home" ref="homeRef">
    <header class="home-header">
      <div class="logo">
        <img class="logo-icon" :src="logo" alt="Light03 logo" />
        <span class="logo-text">Light03</span>
      </div>
      <nav class="home-nav">
        <span class="nav-item nav-item--action" @click="goPlayground">算法可视化</span>
        <span class="nav-item nav-item--action">算法编辑器</span>
      </nav>
      <div class="home-actions">
        <template v-if="auth.isAuthed">
          <span class="auth-user">{{ auth.user?.email }}</span>
          <el-button size="small" type="primary" @click="onLogout">退出</el-button>
        </template>
        <template v-else>
          <el-button size="small" type="primary" @click="authDialogOpen = true">登录/注册</el-button>
        </template>
        <el-button class="ghost-btn" plain @click="goPlayground">进入可视化</el-button>
      </div>
    </header>

    <main class="hero">
      <div class="hero-title">
        学习算法，<span class="hero-highlight">更高效</span>
      </div>
      <div class="hero-sub">
        将每行代码执行时的数据结构以动画形式展示，可将指针变化、递归等抽象过程转化为直观的动画
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="algo-orbit">
          <span class="orbit-ring" />
          <span class="orbit-dot dot-1" />
          <span class="orbit-dot dot-2" />
          <span class="orbit-dot dot-3" />
        </div>
        <div class="algo-chips">
          <span class="algo-chip chip-1">BFS</span>
          <span class="algo-chip chip-2">DFS</span>
          <span class="algo-chip chip-3">Dijkstra</span>
          <span class="algo-chip chip-4">DP</span>
          <span class="algo-chip chip-5">Sort</span>
          <span class="algo-chip chip-6">Trie</span>
        </div>
        <div class="scan-track">
          <span class="scan-line" />
          <span class="scan-node node-1" />
          <span class="scan-node node-2" />
          <span class="scan-node node-3" />
        </div>
      </div>
      <div class="hero-actions">
        <el-button class="primary-btn" type="primary" @click="goPlayground">60+算法动画/含代码</el-button>
        <el-button class="secondary-btn" type="info">自定义代码转动画</el-button>
      </div>
      <div class="hero-tabs">
        <span class="tab active">链表</span>
        <span class="tab">栈</span>
        <span class="tab">队列</span>
        <span class="tab">树</span>
        <span class="tab">图</span>
        <span class="tab">查找</span>
        <span class="tab">排序</span>
      </div>
      <div class="preview">
        <el-card class="preview-card">
          <div class="preview-title">NOI 算法可视化学习平台</div>
          <div class="preview-sub">从基础数据结构到复杂图算法，一站式学习与演练。</div>
          <div class="preview-footer">
            <span>浅绿色风格</span>
            <span>交互式动画</span>
            <span>代码同步</span>
          </div>
        </el-card>
        <el-card class="preview-card image">
          <div class="image-placeholder">
            <div class="dot" />
            <div class="dot" />
            <div class="dot" />
          </div>
          <div class="image-caption">示意图预览区域</div>
        </el-card>
      </div>
    </main>

    <el-dialog v-model="authDialogOpen" title="登录 / 注册" width="360px">
      <el-form label-position="top" class="auth-form">
        <el-form-item label="邮箱">
          <el-input v-model="authEmail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="authPassword" placeholder="至少 8 位" show-password type="password" />
        </el-form-item>
      </el-form>
      <el-alert v-if="authError" class="auth-error" type="error" :closable="false" :title="authError" />
      <template #footer>
        <el-button @click="onRegister">注册</el-button>
        <el-button type="primary" @click="onLogin">登录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { gsap } from 'gsap';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/light03-logo.svg';

const router = useRouter();
const auth = useAuthStore();
const authDialogOpen = ref<boolean>(false);
const authEmail = ref<string>('');
const authPassword = ref<string>('');
const authError = ref<string>('');
const homeRef = ref<HTMLElement | null>(null);
let gsapCtx: gsap.Context | null = null;

function goPlayground() {
  void router.push('/playground');
}

type ToastKind = 'success' | 'error' | 'info';

function pushToast(kind: ToastKind, text: string) {
  ElMessage({
    type: kind,
    message: text,
    duration: 1500,
    showClose: false,
  });
}

function clearAuthForm() {
  authEmail.value = '';
  authPassword.value = '';
  authError.value = '';
}

function formatAuthError(e: any): string {
  if (!e) return '未知错误';
  if (e instanceof TypeError && (e.message.includes('fetch') || e.message.includes('Network'))) {
    return '服务器开小差了，请稍后再试';
  }
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
    pushToast('success', '注册成功');
    authDialogOpen.value = false;
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
    pushToast('success', '登录成功');
    authDialogOpen.value = false;
    clearAuthForm();
  } catch (e: any) {
    authError.value = formatAuthError(e) || '登录失败';
    pushToast('error', authError.value || '登录失败');
  }
}

function onLogout() {
  auth.logout();
  pushToast('info', '已退出登录');
}

watch(
  () => authDialogOpen.value,
  (open) => {
    if (!open) {
      clearAuthForm();
    }
  }
);

onMounted(() => {
  if (!homeRef.value) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsapCtx = gsap.context((self) => {
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
    });

    tl.from('.home-header', { y: -16, opacity: 0, duration: 0.6 })
      .from('.hero-title', { y: 16, opacity: 0, duration: 0.6 }, '-=0.35')
      .from('.hero-sub', { y: 12, opacity: 0, duration: 0.5 }, '-=0.35')
      .from('.hero-visual', { scale: 0.98, opacity: 0, duration: 0.6 }, '-=0.25')
      .from('.hero-actions', { y: 16, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.hero-tabs .tab', { y: 8, opacity: 0, duration: 0.4, stagger: 0.06 }, '-=0.2')
      .from('.preview-card', { y: 20, opacity: 0, duration: 0.55, stagger: 0.12 }, '-=0.25');

    gsap.to('.algo-orbit', { rotate: 360, duration: 18, repeat: -1, ease: 'none' });
    gsap.to('.orbit-dot', {
      scale: 1.25,
      opacity: 1,
      duration: 1.6,
      stagger: 0.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const chips = self.selector?.('.algo-chip') ?? [];
    chips.forEach((chip: Element, index: number) => {
      gsap.to(chip, {
        y: 8 + (index % 3) * 4,
        x: index % 2 === 0 ? 6 : -6,
        duration: 2.4 + index * 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to(chip, {
        rotate: index % 2 === 0 ? 2 : -2,
        duration: 3.2 + index * 0.15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    gsap.to('.scan-line', {
      x: 220,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    gsap.to('.scan-node', {
      scale: 1.2,
      opacity: 1,
      duration: 1.4,
      stagger: 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, homeRef.value);
});

onBeforeUnmount(() => {
  gsapCtx?.revert();
  gsapCtx = null;
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(1200px 600px at 30% 0%, rgba(34, 197, 94, 0.12), transparent 60%),
    radial-gradient(900px 500px at 80% 20%, rgba(16, 185, 129, 0.14), transparent 55%),
    var(--app-bg);
  color: var(--text);
}
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 36px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 18px;
}
.logo-icon {
  width: 32px;
  height: 32px;
  display: block;
}
.logo-text {
  color: #0f766e;
  letter-spacing: 0.5px;
}
.home-nav {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: var(--muted);
}
.nav-item {
  cursor: default;
}
.nav-item--action {
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.08);
  transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.12s ease,
    box-shadow 0.18s ease;
}
.nav-item--action:hover {
  color: #0b4f4a;
  border-color: rgba(15, 118, 110, 0.25);
  background: rgba(15, 118, 110, 0.16);
  box-shadow: 0 6px 14px rgba(15, 118, 110, 0.18);
}
.nav-item--action:active {
  transform: translateY(1px) scale(0.98);
  background: rgba(15, 118, 110, 0.24);
}
.nav-item--action:focus-visible {
  outline: 2px solid rgba(16, 185, 129, 0.6);
  outline-offset: 2px;
}
.nav-badge {
  margin-left: 6px;
  border-radius: 999px;
}
.home-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.ghost-btn {
  border-radius: 999px;
  color: var(--muted);
}
.auth-user {
  font-size: 12px;
  color: var(--muted-2);
}
.auth-error {
  margin-top: 6px;
}
.hero {
  max-width: 1100px;
  margin: 0 auto;
  padding: 70px 24px 80px;
  text-align: center;
}
.hero-title {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 1px;
}
.hero-highlight {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.08);
  padding: 4px 8px;
  border-radius: 12px;
}
.hero-sub {
  margin-top: 18px;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.8;
}
.hero-visual {
  position: relative;
  margin: 26px auto 10px;
  width: min(680px, 92vw);
  height: 160px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(59, 130, 246, 0.12));
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 16px 34px rgba(15, 118, 110, 0.12);
  overflow: hidden;
}
.algo-orbit {
  position: absolute;
  inset: 18px auto auto 22px;
  width: 120px;
  height: 120px;
}
.orbit-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px dashed rgba(15, 118, 110, 0.4);
}
.orbit-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.7);
  opacity: 0.6;
}
.orbit-dot.dot-1 {
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
}
.orbit-dot.dot-2 {
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}
.orbit-dot.dot-3 {
  bottom: 10px;
  left: 20%;
}
.algo-chips {
  position: absolute;
  inset: 20px 24px auto auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.algo-chip {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: #0f766e;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 118, 110, 0.2);
  box-shadow: 0 8px 18px rgba(15, 118, 110, 0.1);
  min-width: 64px;
}
.scan-track {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 26px;
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
}
.scan-line {
  position: absolute;
  left: 8px;
  top: 50%;
  width: 120px;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
}
.scan-node {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: rgba(59, 130, 246, 0.7);
  opacity: 0.7;
}
.scan-node.node-1 {
  left: 16%;
}
.scan-node.node-2 {
  left: 46%;
}
.scan-node.node-3 {
  left: 78%;
}
.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 28px 0 30px;
}
.primary-btn {
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25);
}
.secondary-btn {
  border-radius: 10px;
  background: #111827;
  border-color: #111827;
  color: #f9fafb;
}
.hero-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 38px;
}
.tab {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--border);
  color: var(--muted);
  background: rgba(255, 255, 255, 0.7);
}
.tab.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}
.preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}
.preview-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  text-align: left;
  box-shadow: var(--shadow);
}
.preview-card :deep(.el-card__body) {
  padding: 24px;
}
.preview-card.image {
  display: grid;
  place-items: center;
}
.preview-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}
.preview-sub {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.7;
}
.preview-footer {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--muted);
}
.image-placeholder {
  width: 100%;
  height: 180px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(37, 99, 235, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.image-placeholder .dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
}
.image-caption {
  margin-top: 12px;
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 960px) {
  .home-header {
    flex-direction: column;
    gap: 10px;
  }
  .hero {
    padding-top: 40px;
  }
  .preview {
    grid-template-columns: 1fr;
  }
}
</style>
