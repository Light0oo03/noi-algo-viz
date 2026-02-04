<div align="center">

# 🎯 NOI Algorithm Visualizer

**交互式算法可视化学习平台**

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3.x-FFD859?style=flat-square)](https://pinia.vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

[English](#english) | [简体中文](#简体中文)

</div>

---

## 简体中文

### 📖 项目简介

**NOI Algorithm Visualizer** 是一个专为信息学奥赛（NOI）和算法学习者打造的**交互式算法可视化平台**。通过直观的动画演示和代码同步高亮，帮助你深入理解图论算法的执行过程。

> 🎓 **让抽象的算法变得可见，让复杂的逻辑变得简单！**

### ✨ 核心特性

- 🎨 **可视化图编辑器** - 双击添加节点，点击连边，拖拽移动，所见即所得
- 🎬 **动画播放控制** - 支持播放、暂停、单步前进/后退、进度条跳转
- 💻 **代码同步高亮** - 动画执行时自动高亮对应代码行，理解算法执行流程
- 📊 **实时状态面板** - 展示队列内容、节点状态等关键数据结构变化
- 💾 **数据持久化** - 自动保存你创建的图结构，刷新不丢失
- 🌙 **暗色主题** - 护眼的深色界面，长时间学习更舒适

### 🛠️ 技术栈

| 类别     | 技术                                       |
| -------- | ------------------------------------------ |
| 框架     | Vue 3 (Composition API + `<script setup>`) |
| 语言     | TypeScript 5                               |
| 构建工具 | Vite 6                                     |
| 状态管理 | Pinia + pinia-plugin-persistedstate        |
| 图形渲染 | Konva.js + vue-konva                       |
| 样式     | Scoped CSS + CSS Grid                      |

### 📦 已实现算法

- [x] **链表算法** - 反转链表 / 中点 / 判环 / 合并有序链表 / 删除倒数第 k 个
- [x] **BFS** - 广度优先搜索
- [x] **DFS** - 深度优先搜索
- [x] **Dijkstra** - 最短路径算法
- [x] **Prim/Kruskal** - 最小生成树

### 🚀 快速开始

#### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 9.0.0

#### 克隆仓库

```bash
git clone https://github.com/Lighto00o3/noi-algo-viz.git
cd noi-algo-viz
```

#### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

#### 启动开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 即可开始体验！

#### 构建生产版本

```bash
pnpm build
```

### 📁 项目结构

```
noi-algo-viz/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── GraphCanvas.vue  # 图形画布（节点/边的渲染与交互）
│   │   ├── CodeViewer.vue   # 代码展示（带高亮）
│   │   ├── PlayerControls.vue # 播放控制器
│   │   └── StatePanel.vue   # 状态面板
│   ├── core/                # 核心逻辑
│   │   ├── algorithms/      # 算法实现
│   │   ├── graph/           # 图数据结构
│   │   └── trace/           # 动画轨迹播放器
│   ├── pages/               # 页面组件
│   ├── stores/              # Pinia 状态管理
│   └── main.ts              # 应用入口
├── public/                  # 静态资源
└── package.json
```

### 🎮 使用指南

1. **编辑图结构**

   - 双击画布空白处添加新节点
   - 依次点击两个节点创建边
   - 拖拽节点调整位置

2. **运行算法**

   - 从下拉菜单选择算法
   - 点击「播放」按钮开始动画
   - 使用「上一步」「下一步」逐帧调试
   - 拖动进度条跳转到任意步骤

3. **理解代码**
   - 观察右侧代码区域的黄色高亮
   - 高亮行与当前动画步骤对应
   - 结合状态面板理解数据变化

### 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

### 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

---

## English

### 📖 About

**NOI Algorithm Visualizer** is an interactive algorithm visualization platform designed for competitive programming learners (NOI/ICPC). It helps you understand graph algorithms through intuitive animations and synchronized code highlighting.

> 🎓 **Making abstract algorithms visible, making complex logic simple!**

### ✨ Features

- 🎨 **Interactive Graph Editor** - Add nodes, create edges, drag to move
- 🎬 **Animation Controls** - Play, pause, step forward/backward, progress bar
- 💻 **Code Sync Highlighting** - Auto-highlight corresponding code lines
- 📊 **Real-time State Panel** - Display queue, node states and more
- 💾 **Data Persistence** - Auto-save your graph structure
- 🌙 **Dark Theme** - Eye-friendly dark interface

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Lighto00o3/noi-algo-viz.git
cd noi-algo-viz

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173) to get started!

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star 支持一下！**

Made with ❤️ by [Lighto00o3](https://github.com/Lighto00o3)

</div>
