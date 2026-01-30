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
      { id: 'dfs', label: 'DFS 深度优先搜索', disabled: true },
    ],
  },
  {
    id: 'list',
    title: '链表',
    items: [{ id: 'list-placeholder', label: '敬请期待', disabled: true }],
  },
  {
    id: 'stack',
    title: '栈',
    items: [{ id: 'stack-placeholder', label: '敬请期待', disabled: true }],
  },
  {
    id: 'queue',
    title: '队列',
    items: [{ id: 'queue-placeholder', label: '敬请期待', disabled: true }],
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
