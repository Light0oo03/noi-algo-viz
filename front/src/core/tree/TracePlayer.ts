import type { TreeVizState, TreeTrace } from './types';
import { cloneTreeVizState } from './utils';

export type TreePlayerStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'ended';

export class TreeTracePlayer {
  private initialState: TreeVizState;
  private trace: TreeTrace = { steps: [] };
  public stepIndex = -1;
  private status: TreePlayerStatus = 'idle';
  private timer: number | null = null;
  private options: {
    interval: number;
    onStateChange: (state: TreeVizState) => void;
    onStatusChange: (status: TreePlayerStatus) => void;
  };

  constructor(
    initialState: TreeVizState,
    options: {
      interval: number;
      onStateChange: (state: TreeVizState) => void;
      onStatusChange: (status: TreePlayerStatus) => void;
    }
  ) {
    this.initialState = cloneTreeVizState(initialState);
    this.options = options;
  }

  get totalSteps(): number {
    return this.trace.steps.length;
  }

  load(trace: TreeTrace): void {
    this.pause();
    this.trace = trace;
    this.stepIndex = -1;
    this.setStatus('ready');
    this.options.onStateChange(cloneTreeVizState(this.initialState));
  }

  play(): void {
    if (this.status === 'ended') {
      this.reset();
    }

    if (this.status === 'idle' || this.trace.steps.length === 0) {
      return;
    }

    this.setStatus('playing');

    if (this.stepIndex < 0) {
      this.stepOnce();
    }

    this.timer = window.setInterval(() => {
      if (this.stepIndex >= this.trace.steps.length - 1) {
        this.pause();
        this.setStatus('ended');
      } else {
        this.stepOnce();
      }
    }, this.options.interval);
  }

  pause(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.status === 'playing') {
      this.setStatus('paused');
    }
  }

  stepOnce(): void {
    if (this.stepIndex >= this.trace.steps.length - 1) {
      return;
    }

    this.stepIndex++;
    const step = this.trace.steps[this.stepIndex];
    if (!step) return;
    this.options.onStateChange(cloneTreeVizState(step.state));

    if (this.stepIndex >= this.trace.steps.length - 1 && this.status === 'playing') {
      this.pause();
      this.setStatus('ended');
    }
  }

  stepBack(): void {
    if (this.stepIndex <= 0) {
      this.stepIndex = -1;
      this.options.onStateChange(cloneTreeVizState(this.initialState));
      return;
    }

    this.stepIndex--;
    const step = this.trace.steps[this.stepIndex];
    if (!step) return;
    this.options.onStateChange(cloneTreeVizState(step.state));
  }

  goToStep(index: number): void {
    if (index < 0 || index >= this.trace.steps.length) {
      return;
    }

    this.stepIndex = index;
    const step = this.trace.steps[this.stepIndex];
    if (!step) return;
    this.options.onStateChange(cloneTreeVizState(step.state));
  }

  reset(): void {
    this.pause();
    this.stepIndex = -1;
    this.setStatus('ready');
    this.options.onStateChange(cloneTreeVizState(this.initialState));
  }

  clear(): void {
    this.pause();
    this.trace = { steps: [] };
    this.stepIndex = -1;
    this.setStatus('idle');
    this.options.onStateChange(cloneTreeVizState(this.initialState));
  }

  updateInitialState(state: TreeVizState): void {
    this.initialState = cloneTreeVizState(state);
    this.clear();
  }

  private setStatus(status: TreePlayerStatus): void {
    this.status = status;
    this.options.onStatusChange(status);
  }
}
