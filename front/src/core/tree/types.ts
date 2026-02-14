export type TreeNode = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
};

export type TreeView = {
  id: string;
  label: string;
  nodes: TreeNode[];
  root: number | null;
};

export type TreeEdge = {
  parent: number;
  child: number;
  direction: 'left' | 'right';
};

export type TreeNodeState = 'default' | 'active' | 'visited' | 'frontier' | 'selected';

export type TreeEdgeState = 'default' | 'checking' | 'path';

export type TreePointer = {
  name: string;
  nodeId: number;
  color: string;
};

export type TreeVizState = {
  trees: TreeView[];
  nodeStates: Record<string, Record<number, TreeNodeState>>;
  edgeStates: Record<string, Record<string, TreeEdgeState>>;
  pointers: Record<string, TreePointer>;
  queue?: number[];
  stack?: number[];
  note: string;
  highlightLines?: [number, number];
};

export type TreeTraceStep = {
  type: string;
  state: TreeVizState;
};

export type TreeTrace = {
  steps: TreeTraceStep[];
};
