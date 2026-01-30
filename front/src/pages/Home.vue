<template>
  <div class="home" ref="homeRef">
    <header class="home-header">
      <div class="logo">
        <img class="logo-icon" :src="logo" alt="Light03 logo" />
        <span class="logo-text">Light03</span>
      </div>
      <nav class="home-nav">
        <span class="nav-item nav-item--action" @click="goPlayground">{{ t.nav.visual }}</span>
        <span class="nav-item nav-item--action">{{ t.nav.editor }}</span>
      </nav>
      <div class="home-actions">
        <div class="lang-switch">
          <el-button
            size="small"
            :type="locale === 'zh' ? 'primary' : 'default'"
            class="lang-btn"
            plain
            @click="setLocale('zh')"
          >
            中文
          </el-button>
          <el-button
            size="small"
            :type="locale === 'en' ? 'primary' : 'default'"
            class="lang-btn"
            plain
            @click="setLocale('en')"
          >
            EN
          </el-button>
        </div>
        <template v-if="auth.isAuthed">
          <span class="auth-user">{{ auth.user?.email }}</span>
          <el-button size="small" type="primary" @click="onLogout">{{ t.actions.logout }}</el-button>
        </template>
        <template v-else>
          <el-button size="small" type="primary" @click="authDialogOpen = true">
            {{ t.actions.login }}
          </el-button>
        </template>
        <el-button class="ghost-btn" plain @click="goPlayground">{{ t.actions.enter }}</el-button>
      </div>
    </header>

    <main class="hero">
      <section class="hero-layout">
        <div class="hero-content">
          <div class="hero-badge">{{ t.hero.badge }}</div>
          <div class="hero-title">
            {{ t.hero.titlePrefix }}
            <span class="hero-highlight">{{ t.hero.titleHighlight }}</span>
            {{ t.hero.titleSuffix }}
          </div>
          <div class="hero-sub">{{ t.hero.sub }}</div>
          <div class="hero-actions">
            <el-button class="primary-btn" type="primary" @click="goPlayground">
              {{ t.actions.primary }}
            </el-button>
            <el-button class="secondary-btn" type="info" plain @click="authDialogOpen = true">
              {{ t.actions.secondary }}
            </el-button>
          </div>
          <div class="hero-metrics">
            <div v-for="metric in t.metrics" :key="metric.label" class="metric">
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
            </div>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="algo-orbit">
            <span class="orbit-ring" />
            <span class="orbit-dot dot-1" />
            <span class="orbit-dot dot-2" />
            <span class="orbit-dot dot-3" />
          </div>
          <div class="algo-chips">
            <span v-for="(chip, index) in t.visual.chips" :key="chip" class="algo-chip" :class="`chip-${index + 1}`">
              {{ chip }}
            </span>
          </div>
          <div class="scan-track">
            <span class="scan-line" />
            <span class="scan-node node-1" />
            <span class="scan-node node-2" />
            <span class="scan-node node-3" />
          </div>
        </div>
      </section>

      <section class="modules">
        <div class="section-head">
          <div class="section-title">{{ t.modules.title }}</div>
          <div class="section-sub">{{ t.modules.subtitle }}</div>
        </div>
        <div class="hero-tabs">
          <span
            v-for="tab in algoTabs"
            :key="tab.key"
            class="tab"
            :class="{ active: tab.key === activeTabKey }"
            @click="onTabClick(tab.key)"
          >
            {{ tab.title }}
          </span>
        </div>
        <div class="tab-panel" ref="tabPanelRef">
          <div class="tab-panel-inner">
            <div class="tab-panel-title">{{ activeTab?.title }}</div>
            <div class="tab-panel-desc">{{ activeTab?.desc }}</div>
            <div class="tab-panel-tags">
              <span v-for="item in activeTab?.tags" :key="item" class="tag">
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="preview">
        <el-card class="preview-card">
          <div class="preview-title">{{ previewCards[0]?.title }}</div>
          <div class="preview-sub">{{ previewCards[0]?.desc }}</div>
          <div class="preview-footer">
            <span v-for="item in previewCards[0]?.points ?? []" :key="item">{{ item }}</span>
          </div>
        </el-card>
        <el-card class="preview-card image">
          <div class="image-placeholder">
            <div class="dot" />
            <div class="dot" />
            <div class="dot" />
          </div>
          <div class="image-caption">{{ previewCards[1]?.title }}</div>
          <div class="image-sub">{{ previewCards[1]?.desc }}</div>
        </el-card>
      </section>
    </main>

    <el-dialog v-model="authDialogOpen" :title="t.auth.title" width="360px">
      <el-form label-position="top" class="auth-form">
        <el-form-item :label="t.auth.emailLabel">
          <el-input v-model="authEmail" :placeholder="t.auth.emailPlaceholder" />
        </el-form-item>
        <el-form-item :label="t.auth.passwordLabel">
          <el-input v-model="authPassword" :placeholder="t.auth.passwordPlaceholder" show-password type="password" />
        </el-form-item>
      </el-form>
      <el-alert v-if="authError" class="auth-error" type="error" :closable="false" :title="authError" />
      <template #footer>
        <el-button @click="onRegister">{{ t.auth.register }}</el-button>
        <el-button type="primary" @click="onLogin">{{ t.auth.login }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
const tabPanelRef = ref<HTMLElement | null>(null);
let gsapCtx: gsap.Context | null = null;
let autoRotateTimer: number | null = null;
let handleKeydown: ((event: KeyboardEvent) => void) | null = null;

type Locale = 'zh' | 'en';

const locale = ref<Locale>('zh');
const copy = {
  zh: {
    nav: {
      visual: '算法可视化',
      editor: '算法编辑器',
    },
    actions: {
      login: '登录/注册',
      logout: '退出',
      enter: '进入可视化',
      primary: '立即体验可视化',
      secondary: '登录以保存进度',
    },
    hero: {
      badge: '教育平台 · 算法可视化',
      titlePrefix: '让算法学习更',
      titleHighlight: '直观',
      titleSuffix: '与系统',
      sub: '将代码执行过程与数据结构变化实时映射为动画，帮助学生理解指针、递归与复杂状态转移。',
    },
    metrics: [
      { value: '60+', label: '算法动画' },
      { value: '8+', label: '数据结构' },
      { value: '100+', label: '可视步骤' },
    ],
    visual: {
      chips: ['BFS', 'DFS', 'Dijkstra', 'DP', 'Sort', 'Trie'],
    },
    modules: {
      title: '算法模块速览',
      subtitle: '点击模块查看核心概念与学习重点，课程内容可持续扩展。',
      tabs: [
        {
          key: 'linked-list',
          title: '链表',
          desc: '链表通过节点与指针连接数据，支持高效的插入与删除；理解头尾指针与遍历方式是关键。',
          tags: ['头插法', '尾插法', '双向链表', '快慢指针'],
        },
        {
          key: 'stack',
          title: '栈',
          desc: '栈遵循后进先出（LIFO），常用于函数调用、括号匹配与路径回溯等场景。',
          tags: ['入栈/出栈', '括号匹配', '表达式求值', '单调栈'],
        },
        {
          key: 'queue',
          title: '队列',
          desc: '队列遵循先进先出（FIFO），适合层序遍历、任务调度与异步队列的建模。',
          tags: ['循环队列', '双端队列', '层序遍历', 'BFS'],
        },
        {
          key: 'tree',
          title: '树',
          desc: '树结构描述层级关系，掌握遍历方式与节点关系是理解二叉树与搜索树的核心。',
          tags: ['前中后序', '二叉搜索树', '堆', '线段树'],
        },
        {
          key: 'graph',
          title: '图',
          desc: '图表示复杂关系网络，掌握 DFS/BFS、最短路与最小生成树是基础能力。',
          tags: ['DFS/BFS', '最短路', '最小生成树', '拓扑排序'],
        },
        {
          key: 'search',
          title: '查找',
          desc: '查找关注如何快速定位目标元素，理解有序数据结构与哈希映射的特性。',
          tags: ['二分查找', '哈希表', '字符串匹配', '查找优化'],
        },
        {
          key: 'sort',
          title: '排序',
          desc: '排序是算法核心模块，比较型与非比较型算法在稳定性与复杂度上各有侧重。',
          tags: ['快速排序', '归并排序', '计数排序', '稳定性'],
        },
      ],
    },
    preview: {
      cards: [
        {
          title: '课堂可视化一体化',
          desc: '从概念讲解到动画演示与代码复现，形成完整的算法学习闭环。',
          points: ['课堂演示', '分步播放', '代码同步'],
        },
        {
          title: '算法画布预览',
          desc: '支持节点、边、指针等多种可视化组件，满足教学场景。',
        },
      ],
    },
    auth: {
      title: '登录 / 注册',
      emailLabel: '邮箱',
      emailPlaceholder: '请输入邮箱',
      passwordLabel: '密码',
      passwordPlaceholder: '至少 8 位',
      register: '注册',
      login: '登录',
    },
    toast: {
      registerSuccess: '注册成功',
      loginSuccess: '登录成功',
      logout: '已退出登录',
      registerFailed: '注册失败',
      loginFailed: '登录失败',
    },
    errors: {
      unknown: '未知错误',
      server: '服务器开小差了，请稍后再试',
      failed: '操作失败',
    },
  },
  en: {
    nav: {
      visual: 'Visualization',
      editor: 'Algorithm Editor',
    },
    actions: {
      login: 'Sign in / Register',
      logout: 'Sign out',
      enter: 'Enter Playground',
      primary: 'Start Visualizing',
      secondary: 'Sign in to save progress',
    },
    hero: {
      badge: 'Education Platform · Algorithm Visualization',
      titlePrefix: 'Make algorithm learning ',
      titleHighlight: 'visual',
      titleSuffix: ' and structured',
      sub: 'Turn every code step into intuitive animations so students can see pointers, recursion, and state transitions.',
    },
    metrics: [
      { value: '60+', label: 'Algorithm demos' },
      { value: '8+', label: 'Data structures' },
      { value: '100+', label: 'Visual steps' },
    ],
    visual: {
      chips: ['BFS', 'DFS', 'Dijkstra', 'DP', 'Sort', 'Trie'],
    },
    modules: {
      title: 'Module highlights',
      subtitle: 'Click a module to preview core concepts and learning focus.',
      tabs: [
        {
          key: 'linked-list',
          title: 'Linked List',
          desc: 'Linked lists connect nodes with pointers and support efficient insertions and deletions.',
          tags: ['Head insert', 'Tail insert', 'Doubly linked', 'Fast & slow'],
        },
        {
          key: 'stack',
          title: 'Stack',
          desc: 'Stacks follow LIFO and are great for call stacks, bracket matching, and backtracking.',
          tags: ['Push/Pop', 'Bracket match', 'Expression eval', 'Monotonic'],
        },
        {
          key: 'queue',
          title: 'Queue',
          desc: 'Queues follow FIFO and are ideal for level-order traversal and task scheduling.',
          tags: ['Circular queue', 'Deque', 'Level order', 'BFS'],
        },
        {
          key: 'tree',
          title: 'Tree',
          desc: 'Trees model hierarchical relations; traversals are key to understanding search trees.',
          tags: ['Traversals', 'BST', 'Heap', 'Segment tree'],
        },
        {
          key: 'graph',
          title: 'Graph',
          desc: 'Graphs model networks; learn DFS/BFS, shortest paths, and spanning trees.',
          tags: ['DFS/BFS', 'Shortest path', 'MST', 'Topological sort'],
        },
        {
          key: 'search',
          title: 'Search',
          desc: 'Search focuses on locating targets efficiently using order and hashing.',
          tags: ['Binary search', 'Hashing', 'String match', 'Optimization'],
        },
        {
          key: 'sort',
          title: 'Sorting',
          desc: 'Sorting balances stability and complexity across comparison and non-comparison methods.',
          tags: ['Quick sort', 'Merge sort', 'Counting sort', 'Stability'],
        },
      ],
    },
    preview: {
      cards: [
        {
          title: 'Teaching-ready visualization',
          desc: 'From explanation to animation and code, deliver a complete learning loop.',
          points: ['Classroom demos', 'Step playback', 'Code sync'],
        },
        {
          title: 'Visualization canvas',
          desc: 'Nodes, edges, pointers, and more components are ready for learning scenes.',
        },
      ],
    },
    auth: {
      title: 'Sign in / Register',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      register: 'Register',
      login: 'Sign in',
    },
    toast: {
      registerSuccess: 'Registration successful',
      loginSuccess: 'Signed in',
      logout: 'Signed out',
      registerFailed: 'Registration failed',
      loginFailed: 'Sign in failed',
    },
    errors: {
      unknown: 'Unknown error',
      server: 'Server is busy, please try again later',
      failed: 'Operation failed',
    },
  },
};
const t = computed(() => copy[locale.value]);
const algoTabs = computed(() => t.value.modules.tabs);
const previewCards = computed(() => t.value.preview.cards);
const activeTabKey = ref(algoTabs.value[0]?.key ?? 'linked-list');
const prevTabIndex = ref(0);
const isTabAnimating = ref(false);

const activeTab = computed(() => algoTabs.value.find((tab) => tab.key === activeTabKey.value));

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
  if (!e) return t.value.errors.unknown;
  if (e instanceof TypeError && (e.message.includes('fetch') || e.message.includes('Network'))) {
    return t.value.errors.server;
  }
  if (e?.name === 'TypeError' && (e?.message?.includes('fetch') || e?.message?.includes('Network'))) {
    return t.value.errors.server;
  }
  const msg = e?.message ?? e?.reason ?? e?.error ?? e;
  if (Array.isArray(msg)) return msg.join('；');
  if (typeof msg === 'string') return msg;
  try {
    return JSON.stringify(msg);
  } catch {
    return t.value.errors.failed;
  }
}

async function onRegister() {
  authError.value = '';
  try {
    await auth.register(authEmail.value, authPassword.value);
    pushToast('success', t.value.toast.registerSuccess);
    authDialogOpen.value = false;
    clearAuthForm();
  } catch (e: any) {
    authError.value = formatAuthError(e) || t.value.toast.registerFailed;
    pushToast('error', authError.value || t.value.toast.registerFailed);
  }
}

async function onLogin() {
  authError.value = '';
  try {
    await auth.login(authEmail.value, authPassword.value);
    pushToast('success', t.value.toast.loginSuccess);
    authDialogOpen.value = false;
    clearAuthForm();
  } catch (e: any) {
    authError.value = formatAuthError(e) || t.value.toast.loginFailed;
    pushToast('error', authError.value || t.value.toast.loginFailed);
  }
}

function onLogout() {
  auth.logout();
  pushToast('info', t.value.toast.logout);
}

watch(
  () => authDialogOpen.value,
  (open) => {
    if (!open) {
      clearAuthForm();
    }
  }
);

function shouldReduceMotion(): boolean {
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

function getNextTabKey(direction: 1 | -1): string {
  const tabs = algoTabs.value;
  const currentIndex = tabs.findIndex((tab) => tab.key === activeTabKey.value);
  const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
  return tabs[nextIndex]?.key ?? tabs[0]?.key ?? 'linked-list';
}

function onTabClick(key: string) {
  if (key === activeTabKey.value || isTabAnimating.value) return;
  prevTabIndex.value = algoTabs.value.findIndex((tab) => tab.key === activeTabKey.value);
  const nextIndex = algoTabs.value.findIndex((tab) => tab.key === key);
  const direction = nextIndex >= prevTabIndex.value ? 1 : -1;

  if (shouldReduceMotion() || !tabPanelRef.value) {
    activeTabKey.value = key;
    return;
  }

  isTabAnimating.value = true;
  gsap.to(tabPanelRef.value, {
    x: -34 * direction,
    opacity: 0,
    duration: 0.22,
    ease: 'power1.in',
    onComplete: () => {
      activeTabKey.value = key;
      gsap.fromTo(
        tabPanelRef.value,
        { x: 34 * direction, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.34,
          ease: 'power2.out',
          onComplete: () => {
            isTabAnimating.value = false;
          },
        }
      );
    },
  });
}

function setLocale(next: Locale) {
  locale.value = next;
}

onMounted(() => {
  if (!homeRef.value) return;
  if (!shouldReduceMotion()) {
    gsapCtx = gsap.context((self) => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
      });

      tl.from('.home-header', { y: -16, opacity: 0, duration: 0.6 })
        .from('.hero-badge', { y: 10, opacity: 0, duration: 0.45 }, '-=0.35')
        .from('.hero-title', { y: 16, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.hero-sub', { y: 12, opacity: 0, duration: 0.5 }, '-=0.35')
        .from('.hero-visual', { scale: 0.98, opacity: 0, duration: 0.6 }, '-=0.25')
        .from('.hero-actions', { y: 16, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.hero-metrics .metric', { y: 10, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.2')
        .from('.section-head', { y: 12, opacity: 0, duration: 0.45 }, '-=0.2')
        .from('.hero-tabs .tab', { y: 8, opacity: 0, duration: 0.4, stagger: 0.06 }, '-=0.25')
        .from('.tab-panel', { y: 12, opacity: 0, duration: 0.45 }, '-=0.2')
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
  }

  handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      onTabClick(getNextTabKey(1));
    }
    if (event.key === 'ArrowLeft') {
      onTabClick(getNextTabKey(-1));
    }
  };
  window.addEventListener('keydown', handleKeydown);

  if (!shouldReduceMotion()) {
    autoRotateTimer = window.setInterval(() => {
      if (!isTabAnimating.value) {
        onTabClick(getNextTabKey(1));
      }
    }, 5500);
  }
});

onBeforeUnmount(() => {
  gsapCtx?.revert();
  gsapCtx = null;
  if (handleKeydown) {
    window.removeEventListener('keydown', handleKeydown);
    handleKeydown = null;
  }
  if (autoRotateTimer) {
    window.clearInterval(autoRotateTimer);
    autoRotateTimer = null;
  }
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
  gap: 16px;
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
  flex-wrap: wrap;
  justify-content: flex-end;
}
.lang-switch {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  border: 1px solid rgba(15, 118, 110, 0.16);
}
.lang-btn {
  border-radius: 999px;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 70px 24px 90px;
}
.hero-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
}
.hero-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.hero-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.12);
  border: 1px solid rgba(15, 118, 110, 0.2);
}
.hero-title {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.4px;
}
.hero-highlight {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.08);
  padding: 4px 8px;
  border-radius: 12px;
}
.hero-sub {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.8;
}
.hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.hero-visual {
  position: relative;
  width: min(520px, 92vw);
  height: 220px;
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
  inset: 24px 24px auto auto;
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
  bottom: 32px;
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
.primary-btn {
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25);
}
.secondary-btn {
  border-radius: 10px;
  border-color: rgba(15, 118, 110, 0.25);
  color: #0f766e;
  background: rgba(255, 255, 255, 0.85);
}
.hero-metrics {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.metric {
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 10px 22px rgba(15, 118, 110, 0.08);
}
.metric-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f766e;
}
.metric-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}
.modules {
  margin-top: 40px;
}
.section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f766e;
}
.section-sub {
  font-size: 13px;
  color: var(--muted);
}
.hero-tabs {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.tab {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--border);
  color: var(--muted);
  background: rgba(255, 255, 255, 0.7);
  transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.15s ease,
    box-shadow 0.18s ease;
}
.tab:hover {
  color: #0f766e;
  border-color: rgba(15, 118, 110, 0.35);
  background: rgba(15, 118, 110, 0.08);
  box-shadow: 0 8px 16px rgba(15, 118, 110, 0.12);
  transform: translateY(-1px);
}
.tab.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}
.tab.active:hover {
  box-shadow: none;
  transform: none;
}
.tab-panel {
  margin: 0 0 36px;
  max-width: 760px;
  text-align: left;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 118, 110, 0.15);
  border-radius: 18px;
  padding: 18px 22px;
  box-shadow: 0 12px 24px rgba(15, 118, 110, 0.08);
  overflow: hidden;
}
.tab-panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f766e;
}
.tab-panel-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--muted);
}
.tab-panel-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tab-panel-tags .tag {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.18);
  color: #2563eb;
  background: rgba(59, 130, 246, 0.08);
}
.preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
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
  text-align: center;
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
.image-sub {
  margin-top: 6px;
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
  .home-actions {
    justify-content: center;
  }
  .home-nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  .hero {
    padding-top: 40px;
  }
  .hero-layout {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-content {
    align-items: center;
  }
  .hero-badge {
    align-self: center;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-metrics {
    justify-content: center;
  }
  .hero-tabs {
    justify-content: center;
  }
  .tab-panel {
    margin: 0 auto 30px;
  }
  .preview {
    grid-template-columns: 1fr;
  }
}
</style>
