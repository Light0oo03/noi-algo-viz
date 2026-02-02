export type HomeLocale = 'zh' | 'en';

export const homeCopy = {
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
      secondaryAuthed: '继续学习',
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
    sections: {
      features: {
        title: '教学能力组件',
        subtitle: '用可视化把抽象算法拆成可讲、可练、可追踪的学习过程。',
        items: [
          {
            title: '讲解脚本',
            desc: '通过剧情化步骤分解每一行代码执行结果，便于课堂逐步讲解。',
            tags: ['逐步高亮', '状态面板', '变量跟踪'],
          },
          {
            title: '课堂演示',
            desc: '支持暂停、回放与多速率播放，让学生跟上老师的演示节奏。',
            tags: ['播放控制', '时间轴', '标注提示'],
          },
          {
            title: '自主练习',
            desc: '提供标准模板与自定义输入，鼓励学生反复验证算法理解。',
            tags: ['题目模板', '自定义输入', '结果对比'],
          },
        ],
      },
      path: {
        title: '学习路径',
        subtitle: '从基础结构到高级算法，层层递进形成系统化能力。',
        steps: [
          { index: '01', title: '基础结构', desc: '链表、栈、队列的行为可视化。' },
          { index: '02', title: '树与递归', desc: '遍历、构建、递归状态理解。' },
          { index: '03', title: '图与搜索', desc: 'BFS/DFS/最短路结构化掌握。' },
          { index: '04', title: '动态规划', desc: '状态转移图与表格同步演示。' },
          { index: '05', title: '综合实战', desc: '题型拆解、复杂场景建模。' },
        ],
      },
      methods: {
        title: '课堂方法论',
        subtitle: '围绕“看得见的思维过程”设计教学流程。',
        items: [
          {
            title: '讲解 + 演示',
            desc: '理论知识配合实时动画，帮助学生建立图像化记忆。',
            points: ['思路拆解', '代码同步', '关键节点标注'],
          },
          {
            title: '练习 + 反馈',
            desc: '学生即时看到算法结果，形成闭环纠错机制。',
            points: ['自测题库', '结果对比', '错误定位'],
          },
          {
            title: '复盘 + 迁移',
            desc: '复盘算法步骤并迁移到相似题型。',
            points: ['步骤回放', '思维导图', '迁移训练'],
          },
        ],
      },
      outcomes: {
        title: '学习成效',
        subtitle: '从“理解算法”到“掌握算法”的可衡量成长。',
        items: [
          { value: '4x', title: '理解速度', desc: '抽象概念转为动态图像降低理解门槛。' },
          { value: '92%', title: '课堂互动率', desc: '可视化步骤让讨论更聚焦。' },
          { value: '3x', title: '复盘效率', desc: '反复播放关键步骤并精准定位错误。' },
        ],
      },
      cta: {
        title: '开启你的算法可视化课堂',
        desc: '用更直观的方式讲授算法，让学生真正看懂每一步。',
        secondary: '申请课堂体验',
      },
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
      secondaryAuthed: 'Continue learning',
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
    sections: {
      features: {
        title: 'Teaching-ready features',
        subtitle: 'Turn abstract algorithms into teachable, trackable learning journeys.',
        items: [
          {
            title: 'Guided scripting',
            desc: 'Break down every line with step-by-step narration for classrooms.',
            tags: ['Step highlight', 'State panel', 'Variable tracking'],
          },
          {
            title: 'Classroom demo',
            desc: 'Pause, replay, and speed control keep students in sync with teaching.',
            tags: ['Playback', 'Timeline', 'Annotations'],
          },
          {
            title: 'Self practice',
            desc: 'Templates and custom input help students verify their understanding.',
            tags: ['Templates', 'Custom input', 'Result compare'],
          },
        ],
      },
      path: {
        title: 'Learning path',
        subtitle: 'Progress from fundamentals to advanced algorithms step by step.',
        steps: [
          { index: '01', title: 'Foundations', desc: 'Visualize lists, stacks, and queues.' },
          { index: '02', title: 'Trees & recursion', desc: 'Traverse and reason about recursion states.' },
          { index: '03', title: 'Graphs & search', desc: 'Master BFS/DFS and shortest paths.' },
          { index: '04', title: 'Dynamic programming', desc: 'See transitions in tables and graphs.' },
          { index: '05', title: 'Capstone practice', desc: 'Apply patterns to complex scenarios.' },
        ],
      },
      methods: {
        title: 'Teaching methodology',
        subtitle: 'Design the class flow around visible thinking.',
        items: [
          {
            title: 'Explain + visualize',
            desc: 'Synchronize concepts with animations to build mental models.',
            points: ['Concept breakdown', 'Code sync', 'Key markers'],
          },
          {
            title: 'Practice + feedback',
            desc: 'Students validate results instantly and fix mistakes faster.',
            points: ['Practice sets', 'Result compare', 'Error pinpoint'],
          },
          {
            title: 'Review + transfer',
            desc: 'Replay key steps and transfer patterns to new problems.',
            points: ['Step replay', 'Mind map', 'Pattern transfer'],
          },
        ],
      },
      outcomes: {
        title: 'Learning impact',
        subtitle: 'Measure progress from understanding to mastery.',
        items: [
          { value: '4x', title: 'Faster comprehension', desc: 'Dynamic visuals reduce cognitive load.' },
          { value: '92%', title: 'Class engagement', desc: 'Stepwise animation keeps discussion focused.' },
          { value: '3x', title: 'Review efficiency', desc: 'Replay critical steps and locate mistakes.' },
        ],
      },
      cta: {
        title: 'Launch your visualization class',
        desc: 'Teach algorithms with clarity so every step is visible.',
        secondary: 'Request classroom access',
      },
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
