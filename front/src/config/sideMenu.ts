export type MenuItem = {
  id: string;
  label: string;
  algoKey?: string;
  disabled?: boolean;
};

export type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
};

export const sideMenuSections: MenuSection[] = [
  {
    id: 'graph',
    title: '图',
    items: [
      { id: 'bfs', label: 'BFS 广度优先搜索', algoKey: 'bfs' },
      { id: 'dfs', label: 'DFS 深度优先搜索', algoKey: 'dfs' },
      { id: 'dijkstra', label: 'Dijkstra 最短路径', algoKey: 'dijkstra' },
      { id: 'prim', label: 'Prim 最小生成树', algoKey: 'prim' },
      { id: 'kruskal', label: 'Kruskal 最小生成树', algoKey: 'kruskal' },
      { id: 'floyd', label: 'Floyd 全源最短路', algoKey: 'floyd' },
      { id: 'bellman-ford', label: 'Bellman-Ford 最短路径', algoKey: 'bellman-ford' },
      { id: 'topological-sort', label: '拓扑排序（Kahn）', algoKey: 'topological-sort' },
      { id: 'critical-path', label: '关键路径（AOE）', algoKey: 'critical-path' },
    ],
  },
  {
    id: 'list',
    title: '链表',
    items: [
      { id: 'reverse', label: '反转链表', algoKey: 'reverse' },
      { id: 'middle', label: '链表中点（快慢指针）', algoKey: 'middle' },
      { id: 'cycle', label: '判断环（Floyd）', algoKey: 'cycle' },
      { id: 'merge', label: '合并有序链表', algoKey: 'merge' },
      { id: 'remove-k', label: '删除倒数第 k 个', algoKey: 'remove-k' },
    ],
  },
  {
    id: 'stack',
    title: '栈',
    items: [
      { id: 'valid-parentheses', label: '有效的括号', algoKey: 'valid-parentheses' },
      { id: 'min-stack', label: '最小栈', algoKey: 'min-stack' },
      { id: 'monotonic-stack', label: '单调栈（柱状图）', algoKey: 'monotonic-stack' },
      { id: 'rpn-calculator', label: '逆波兰表达式', algoKey: 'rpn-calculator' },
      { id: 'queue-by-stack', label: '栈实现队列', algoKey: 'queue-by-stack' },
    ],
  },
  {
    id: 'queue',
    title: '队列',
    items: [
      { id: 'basic', label: '队列基本操作', algoKey: 'basic' },
      { id: 'circular', label: '循环队列', algoKey: 'circular' },
      { id: 'deque', label: '双端队列', algoKey: 'deque' },
    ],
  },
  {
    id: 'tree',
    title: '树',
    items: [
      { id: 'preorder', label: '前序遍历', algoKey: 'preorder' },
      { id: 'inorder', label: '中序遍历', algoKey: 'inorder' },
      { id: 'postorder', label: '后序遍历', algoKey: 'postorder' },
      { id: 'level-order', label: '层序遍历', algoKey: 'level-order' },
    ],
  },
  {
    id: 'search',
    title: '查找',
    items: [
      { id: 'linear-search', label: '线性查找', algoKey: 'linear-search' },
      { id: 'binary-search', label: '二分查找', algoKey: 'binary-search' },
      { id: 'jump-search', label: '跳跃查找', algoKey: 'jump-search' },
      { id: 'interpolation-search', label: '插值查找', algoKey: 'interpolation-search' },
      { id: 'exponential-search', label: '指数查找', algoKey: 'exponential-search' },
      { id: 'fibonacci-search', label: 'Fibonacci 查找', algoKey: 'fibonacci-search' },
      { id: 'hash-open-search', label: '哈希查找（开放定址）', algoKey: 'hash-open-search' },
      { id: 'hash-chain-search', label: '哈希查找（拉链法）', algoKey: 'hash-chain-search' },
    ],
  },
  {
    id: 'sort',
    title: '排序',
    items: [
      { id: 'bubble-sort', label: '冒泡排序', algoKey: 'bubble-sort' },
      { id: 'selection-sort', label: '选择排序', algoKey: 'selection-sort' },
      { id: 'insertion-sort', label: '插入排序', algoKey: 'insertion-sort' },
      { id: 'quick-sort', label: '快速排序', algoKey: 'quick-sort' },
      { id: 'merge-sort', label: '归并排序', algoKey: 'merge-sort' },
      { id: 'heap-sort', label: '堆排序', algoKey: 'heap-sort' },
      { id: 'shell-sort', label: '希尔排序', algoKey: 'shell-sort' },
      { id: 'counting-sort', label: '计数排序', algoKey: 'counting-sort' },
      { id: 'radix-sort', label: '基数排序', algoKey: 'radix-sort' },
    ],
  },
];
