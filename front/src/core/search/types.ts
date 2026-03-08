export type SearchItemState = 'default' | 'active' | 'checked' | 'found' | 'eliminated' | 'pivot';

export type SearchItem = {
  id: number;
  value: number;
};

export interface SearchPointers {
  index?: number;
  left?: number;
  right?: number;
  mid?: number;
}

export interface SearchTreeNodeView {
  id: string;
  keys: number[];
  depth: number;
  order: number;
  leaf: boolean;
  start: number;
  end: number;
}

export interface SearchVizState {
  items: SearchItem[];
  itemStates: Record<number, SearchItemState>;
  pointers: SearchPointers;
  target: number;
  resultIndex: number | null;
  note: string;
  routeHint?: string;
  highlightLines?: [number, number];
  treeNodes?: SearchTreeNodeView[];
  activeTreeNodeId?: string | null;
  activeTreeEdge?: { from: string; to: string } | null;
}

export interface SearchTraceStep {
  type: string;
  state: SearchVizState;
}

export interface SearchTrace {
  steps: SearchTraceStep[];
}

export function createInitialSearchVizState(items: number[], target: number): SearchVizState {
  const list: SearchItem[] = items.map((value, index) => ({ id: index, value }));
  const itemStates: Record<number, SearchItemState> = {};
  list.forEach((item) => {
    itemStates[item.id] = 'default';
  });

  return {
    items: list,
    itemStates,
    pointers: {},
    target,
    resultIndex: null,
    note: '准备开始查找... ',
    routeHint: undefined,
    treeNodes: undefined,
    activeTreeNodeId: null,
    activeTreeEdge: null,
  };
}

export function cloneSearchVizState(state: SearchVizState): SearchVizState {
  return {
    items: state.items.map((item) => ({ ...item })),
    itemStates: { ...state.itemStates },
    pointers: { ...state.pointers },
    target: state.target,
    resultIndex: state.resultIndex,
    note: state.note,
    routeHint: state.routeHint,
    highlightLines: state.highlightLines ? [...state.highlightLines] as [number, number] : undefined,
    treeNodes: state.treeNodes?.map((node) => ({
      id: node.id,
      keys: [...node.keys],
      depth: node.depth,
      order: node.order,
      leaf: node.leaf,
      start: node.start,
      end: node.end,
    })),
    activeTreeNodeId: state.activeTreeNodeId ?? null,
    activeTreeEdge: state.activeTreeEdge ? { ...state.activeTreeEdge } : null,
  };
}
