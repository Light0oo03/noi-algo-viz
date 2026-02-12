# 栈和队列模块 - 快速验证步骤

## ✅ 已完成的实现

根据修复计划的步骤 1-10，所有代码改动已完成：

### 1. AlgoPlayground.vue 完整实现
- ✅ 导入所有栈和队列算法模块
- ✅ 添加 StackTracePlayer 和 stackVizState
- ✅ 添加 QueueTracePlayer 和 queueVizState
- ✅ generateTrace() 支持栈和队列算法
- ✅ 模板条件渲染（StackCanvas, QueueCanvas, StackStatePanel, QueueStatePanel）
- ✅ 播放控制逻辑（play/pause/step/stepBack/reset/goToStep）
- ✅ 计算属性（isStackAlgo, isQueueAlgo, canEditGraph）
- ✅ 代码显示逻辑（currentAlgoCode）
- ✅ 算法切换 watch 逻辑

### 2. 组件实现
- ✅ StackCanvas.vue - 栈可视化（top 指针动态跟随）
- ✅ StackStatePanel.vue - 栈状态面板
- ✅ QueueCanvas.vue - 队列可视化（front/rear 指针）
- ✅ QueueStatePanel.vue - 队列状态面板

### 3. 算法实现（8个）
**栈算法（5个）**：
- ✅ valid-parentheses - 有效的括号
- ✅ min-stack - 最小栈
- ✅ monotonic-stack - 单调栈（柱状图）
- ✅ rpn-calculator - 逆波兰表达式
- ✅ queue-by-stack - 栈实现队列

**队列算法（3个）**：
- ✅ basic - 队列基本操作
- ✅ circular - 循环队列
- ✅ deque - 双端队列

### 4. 配置和路由
- ✅ sideMenu.ts - 所有算法菜单项已配置
- ✅ 路由正常工作

### 5. 代码质量检查
- ✅ TypeScript 类型检查：无错误
- ✅ 开发服务器：正常运行（http://localhost:5177/）

---

## 🧪 快速验证步骤（5分钟）

### 方法 1：核心功能验证（必做）

访问 http://localhost:5177/playground

**栈算法验证**（测试 2-3 个即可）：
1. 侧边栏 → 栈 → 有效的括号 → 点击"播放"
   - 观察：栈动画正常，括号入栈/弹出，top 指针在栈顶

2. 侧边栏 → 栈 → 最小栈 → 点击"播放"
   - 观察：两个栈（左右布局），top 指针分别在左右

3. 侧边栏 → 栈 → 单调栈 → 点击"播放"
   - 观察：柱状图计算，元素高亮和弹出动画

**队列算法验证**（测试 2-3 个即可）：
1. 侧边栏 → 队列 → 队列基本操作 → 点击"播放"
   - 观察：队列动画正常，front/rear 指针正确，enqueue/dequeue 动画流畅

2. 侧边栏 → 队列 → 循环队列 → 点击"播放"
   - 观察：固定容量队列，空槽位显示"-"，front/rear 循环移动

3. 侧边栏 → 队列 → 双端队列 → 点击"播放"
   - 观察：两端操作正常，addFront/addRear/removeFront/removeRear

**通用功能验证**：
1. 菜单切换：栈 → 队列 → 链表 → 图
   - 检查：切换流畅，无报错（F12 Console）

2. 播放控制：播放/暂停/单步/后退/重置
   - 检查：所有按钮正常工作，进度条正确

3. 代码高亮：观察右侧代码面板
   - 检查：代码高亮与动画步骤同步

---

### 方法 2：完整测试（可选，详见 TEST_GUIDE.md）

如果需要详尽测试，请参考 `TEST_GUIDE.md`，包含：
- 所有 8 个算法的详细测试步骤
- 每个算法的检查点清单
- 性能和稳定性测试
- 问题记录模板

---

## 🐛 常见问题排查

如果发现问题，按以下步骤排查：

1. **浏览器控制台错误**：
   - 打开 F12 → Console，查看错误信息
   - 常见问题：模块导入错误、类型错误、未定义的属性

2. **动画不显示**：
   - 检查 Canvas 组件是否正确渲染（F12 → Elements）
   - 检查 state 数据是否正确传递（Vue DevTools）

3. **指针位置错误**：
   - 检查 top/front/rear 指针的计算逻辑
   - 查看 CSS 样式是否正确应用

4. **播放控制无效**：
   - 检查 player 实例是否正确创建
   - 检查 trace 是否正确生成（Console 输出）

---

## 📋 测试报告模板

测试完成后，请在 `record/2026-02-12.md` 中记录：

```markdown
## HH:mm - 栈和队列模块测试验证

**目标**：验证栈和队列算法在 AlgoPlayground.vue 中正常工作

**测试范围**：
- 栈算法：有效的括号、最小栈、单调栈、逆波兰表达式、栈实现队列
- 队列算法：队列基本操作、循环队列、双端队列
- 通用功能：菜单导航、播放控制、代码高亮、状态面板

**测试结果**：
- [ ] 所有栈算法正常工作
- [ ] 所有队列算法正常工作
- [ ] 菜单切换流畅，无报错
- [ ] 播放控制正常
- [ ] 代码高亮同步
- [ ] 浏览器控制台无错误

**发现的问题**：
（如有）

**结论**：
✅ 通过 / ❌ 失败（需要修复）
```

---

## ✅ 下一步

**如果测试通过**：
1. ✅ 更新 record/2026-02-12.md（测试结果）
2. ✅ 标记任务完成
3. ✅ 可选：提交 Git commit（feat:完整实现栈和队列可视化）

**如果发现问题**：
1. 记录问题详情（算法名、重现步骤、错误信息）
2. 修复问题
3. 重新测试
4. 更新 record

---

**开发服务器地址**：http://localhost:5177/playground
**测试指南**：TEST_GUIDE.md
**修改记录**：record/2026-02-12.md
