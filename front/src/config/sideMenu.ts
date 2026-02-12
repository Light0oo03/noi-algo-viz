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
    items: [{ id: 'tree-placeholder', label: '敬请期待', disabled: true }],
  },
  {
    id: 'search',
    title: '查找',
    items: [{ id: 'search-placeholder', label: '敬请期待', disabled: true }],
  },
  {
    id: 'sort',
    title: '排序',
    items: [{ id: 'sort-placeholder', label: '敬请期待', disabled: true }],
  },
];
