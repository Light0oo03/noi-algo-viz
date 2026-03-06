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

export interface SearchVizState {
  items: SearchItem[];
  itemStates: Record<number, SearchItemState>;
  pointers: SearchPointers;
  target: number;
  resultIndex: number | null;
  note: string;
  highlightLines?: [number, number];
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
    highlightLines: state.highlightLines ? [...state.highlightLines] as [number, number] : undefined,
  };
}
