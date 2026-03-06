# NOI Algorithm Visualizer - Claude 项目规则

## 项目概述

这是一个交互式算法可视化学习平台，专为信息学奥赛（NOI）和算法学习者打造。

**技术栈：**
- 前端：Vue 3 + TypeScript + Vite + Pinia + Konva.js + GSAP
- 后端：NestJS + Prisma + PostgreSQL
- 包管理：pnpm workspace

## 代码规范

### 通用原则
- **最小化原则**：只写必要的代码，避免过度设计
- **不添加未要求的功能**：不主动添加错误处理、类型注解、注释（除非逻辑复杂）
- **不重构无关代码**：只修改与需求直接相关的部分
- **不添加测试**：除非用户明确要求

### TypeScript
- 使用严格模式（`strict: true`）
- 优先使用 `type` 而非 `interface`
- 函数参数/返回值必须有类型
- 避免 `any`，必要时用 `unknown`

### Vue 3
- 统一使用 `<script setup>` + Composition API
- 使用 `ref`/`reactive` 管理状态
- Props 使用 `defineProps<T>()`
- Emits 使用 `defineEmits<T>()`
- 样式使用 `<style scoped>`

### 文件组织
```
front/src/
├── components/      # 可复用组件（Canvas、Controls、StatePanel）
├── pages/           # 页面组件（Home、Playground）
├── core/            # 核心逻辑
│   ├── algorithms/  # 算法实现（生成 trace）
│   ├── graph/       # 图数据结构
│   ├── linked-list/ # 链表数据结构
│   ├── stack/       # 栈数据结构
│   └── trace/       # 动画播放器
├── stores/          # Pinia 状态管理
├── router/          # 路由配置
├── api/             # API 封装
└── config/          # 配置文件
```

### 命名规范
- 组件：PascalCase（`GraphCanvas.vue`）
- 文件：kebab-case（`valid-parentheses.ts`）
- 变量/函数：camelCase（`generateTrace`）
- 类型：PascalCase（`StackVizState`）
- 常量：UPPER_SNAKE_CASE（`REVERSE_CODE_LINES`）

## 算法可视化架构

### 核心概念
1. **数据结构**（`types.ts`）：定义节点、边、状态
2. **算法实现**（`xxx.ts`）：生成 trace 步骤
3. **代码模板**（`xxx-code.ts`）：展示代码 + 行号映射
4. **播放器**（`TracePlayer.ts`）：控制动画播放
5. **画布**（`Canvas.vue`）：渲染可视化
6. **控制器**（`Controls.vue`）：播放/暂停/单步
7. **状态面板**（`StatePanel.vue`）：显示当前状态

### 添加新算法流程
1. 在 `core/xxx/` 创建算法文件
2. 实现 `generateXxxTrace()` 函数
3. 创建代码模板和行号映射
4. 在 Playground 页面添加算法选项
5. 更新路由（如需独立页面）

### Trace 结构
```typescript
type TraceStep = {
  type: string;           // 步骤类型
  state: VizState;        // 可视化状态
}

type VizState = {
  // 数据结构状态
  nodes/items: ...;
  // 节点/元素状态（颜色）
  nodeStates: Record<id, 'default' | 'active' | ...>;
  // 说明文字
  note: string;
  // 代码高亮行
  highlightLines?: [number, number];
}
```

### 动画设计原则
- 使用 GSAP 实现平滑过渡
- 状态变化要有视觉反馈（颜色、缩放、阴影）
- 关键操作添加动画（入栈/出栈/指针移动）
- 说明文字使用 emoji + 多行格式

## 样式规范

### CSS 变量
```css
--app-bg: 背景色
--panel-bg: 面板背景
--text: 主文字色
--muted: 次要文字色
--border: 边框色
--shadow: 阴影
```

### 颜色语义
- 蓝色（#3b82f6）：当前操作
- 绿色（#22c55e）：成功/新增
- 红色（#ef4444）：删除/错误
- 紫色（#7c3aed）：辅助指针
- 橙色（#f59e0b）：选中/高亮

### 动画时长
- 快速反馈：0.3s
- 状态切换：0.5s
- 播放间隔：600-800ms

## 开发流程

### 启动项目
```bash
# 前端
cd front && pnpm dev

# 后端
cd backend && pnpm dev
```

### 构建验证
```bash
pnpm -C front build
```

### Git 提交
- 提交信息格式：`类型:简短描述`
- 类型：feat/fix/refactor/docs/style/ci
- 示例：`feat:添加栈可视化`

## 修改记录规范

**每次修改代码后必须记录**（参考 `.cursor/rules/record.mdc`）

记录文件：`/record/YYYY-MM-DD.md`

模板：
```markdown
## HH:mm
目标/需求：
变更摘要：
影响文件：
关键实现点：
测试/验证：
风险/待办：
```

## 注意事项

1. **不要过度优化**：保持代码简单直接
2. **不要添加未使用的功能**：只实现需求
3. **不要重构现有代码**：除非影响新功能
4. **保持一致性**：参考现有代码风格
5. **记录修改**：每次改动都要记录到 record/

## 持久化规则（新增，必须遵守）

涉及“可视化结构修改”的功能（如图/树/链表/栈/队列的可编辑结构）必须同时实现以下持久化机制：

1. **本地持久化（localStorage）**  
   - 用户每次结构修改后立即保存到本地。  
   - 本地 key 必须按账号隔离（例如 `prefix:<userId>`），未登录使用 `guest` key。  

2. **后端持久化（按账号）**  
   - 登录状态下，每次结构修改都要自动同步到后端（可防抖）。  
   - 切换账号后读取该账号上次保存的数据，不同账号数据必须完全隔离。  

3. **加载优先级**  
   - 登录后优先读取后端数据；后端无数据时再回退本地缓存。  
   - 读取到后端数据后，应回写本地缓存，保证本地与云端一致。  

4. **退出登录处理**  
   - 退出登录前应尝试将当前结构同步到后端（若有 token）。  
   - 同时保持本地缓存可用。  
