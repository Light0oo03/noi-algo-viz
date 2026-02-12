export type StackItemState = 'default' | 'active' | 'popping' | 'pushing';

export type StackItem = {
  id: number;
  value: number;
};

export type StackView = {
  id: string;
  label: string;
  items: StackItem[];
};

export interface StackVizState {
  stacks: StackView[];
  itemStates: Record<string, Record<number, StackItemState>>;
  topPointers: Record<string, number>;
  note: string;
  highlightLines?: [number, number];
}

export interface StackTraceStep {
  type: string;
  state: StackVizState;
}

export interface StackTrace {
  steps: StackTraceStep[];
}

export function createInitialStackVizState(stacks: StackView[], note = '准备开始栈算法...'): StackVizState {
  const itemStates: Record<string, Record<number, StackItemState>> = {};
  const topPointers: Record<string, number> = {};

  for (const stack of stacks) {
    const st: Record<number, StackItemState> = {};
    for (const item of stack.items) {
      st[item.id] = 'default';
    }
    itemStates[stack.id] = st;
    topPointers[stack.id] = stack.items.length - 1;
  }

  return {
    stacks,
    itemStates,
    topPointers,
    note,
  };
}

export function cloneStackVizState(state: StackVizState): StackVizState {
  return {
    stacks: state.stacks.map((stack) => ({
      ...stack,
      items: stack.items.map((item) => ({ ...item })),
    })),
    itemStates: Object.fromEntries(
      Object.entries(state.itemStates).map(([k, v]) => [k, { ...v }])
    ),
    topPointers: { ...state.topPointers },
    note: state.note,
    highlightLines: state.highlightLines ? [...state.highlightLines] as [number, number] : undefined,
  };
}
