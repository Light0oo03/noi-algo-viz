export type QueueItemState = 'default' | 'active' | 'enqueue' | 'dequeue';

export type QueueItem = {
  id: number;
  value: number;
};

export type QueueView = {
  id: string;
  label: string;
  items: QueueItem[];
  capacity?: number;
};

export interface QueueVizState {
  queues: QueueView[];
  itemStates: Record<string, Record<number, QueueItemState>>;
  frontPointers: Record<string, number>;
  rearPointers: Record<string, number>;
  note: string;
  highlightLines?: [number, number];
}

export interface QueueTraceStep {
  type: string;
  state: QueueVizState;
}

export interface QueueTrace {
  steps: QueueTraceStep[];
}

export function createInitialQueueVizState(queues: QueueView[], note = '准备开始队列算法...'): QueueVizState {
  const itemStates: Record<string, Record<number, QueueItemState>> = {};
  const frontPointers: Record<string, number> = {};
  const rearPointers: Record<string, number> = {};

  for (const queue of queues) {
    const st: Record<number, QueueItemState> = {};
    for (const item of queue.items) {
      st[item.id] = 'default';
    }
    itemStates[queue.id] = st;
    frontPointers[queue.id] = 0;
    rearPointers[queue.id] = queue.items.length - 1;
  }

  return {
    queues,
    itemStates,
    frontPointers,
    rearPointers,
    note,
  };
}

export function cloneQueueVizState(state: QueueVizState): QueueVizState {
  return {
    queues: state.queues.map((queue) => ({
      ...queue,
      items: queue.items.map((item) => ({ ...item })),
    })),
    itemStates: Object.fromEntries(
      Object.entries(state.itemStates).map(([k, v]) => [k, { ...v }])
    ),
    frontPointers: { ...state.frontPointers },
    rearPointers: { ...state.rearPointers },
    note: state.note,
    highlightLines: state.highlightLines ? [...state.highlightLines] as [number, number] : undefined,
  };
}
