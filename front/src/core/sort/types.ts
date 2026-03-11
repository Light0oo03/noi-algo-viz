export type SortItemState = 'default' | 'active' | 'sorted' | 'pivot' | 'swap';

export type SortItem = {
  id: number;
  value: number;
};

export interface SortPointers {
  i?: number;
  j?: number;
  min?: number;
}

export interface SortCallFrame {
  label: string;
  left: number;
  right: number;
  phase: 'enter' | 'left' | 'right' | 'merge' | 'base' | 'done';
}

export interface SortVizState {
  items: SortItem[];
  itemStates: Record<number, SortItemState>;
  pointers: SortPointers;
  callStack: SortCallFrame[];
  note: string;
  highlightLines?: [number, number];
}

export interface SortTraceStep {
  type: string;
  state: SortVizState;
}

export interface SortTrace {
  steps: SortTraceStep[];
}

export function createInitialSortVizState(values: number[]): SortVizState {
  const items = values.map((value, index) => ({ id: index, value }));
  const itemStates: Record<number, SortItemState> = {};
  items.forEach((item) => {
    itemStates[item.id] = 'default';
  });
  return {
    items,
    itemStates,
    pointers: {},
    callStack: [],
    note: '准备开始排序... ',
  };
}

export function cloneSortVizState(state: SortVizState): SortVizState {
  return {
    items: state.items.map((item) => ({ ...item })),
    itemStates: { ...state.itemStates },
    pointers: { ...state.pointers },
    callStack: state.callStack.map((frame) => ({ ...frame })),
    note: state.note,
    highlightLines: state.highlightLines ? [...state.highlightLines] as [number, number] : undefined,
  };
}
