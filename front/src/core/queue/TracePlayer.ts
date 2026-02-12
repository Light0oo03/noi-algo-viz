import type { QueueVizState } from './types';

export class QueueTracePlayer {
  private steps: any[] = [];
  private currentIndex = -1;
  private timer: number | null = null;
  private initialState: QueueVizState;
  private interval: number;
  private onStateChange: (state: QueueVizState) => void;
  private onStatusChange: (status: QueuePlayerStatus) => void;
  private status: QueuePlayerStatus = 'idle';

  constructor(
    initialState: QueueVizState,
    options: {
      interval?: number;
      onStateChange: (state: QueueVizState) => void;
      onStatusChange: (status: QueuePlayerStatus) => void;
    }
  ) {
    this.initialState = initialState;
    this.interval = options.interval ?? 600;
    this.onStateChange = options.onStateChange;
    this.onStatusChange = options.onStatusChange;
  }

  load(trace: { steps: any[] }) {
    this.steps = trace.steps;
    this.currentIndex = -1;
    this.setStatus('ready');
  }

  play() {
    if (this.status === 'playing') return;
    this.setStatus('playing');
    this.playNext();
  }

  pause() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.setStatus('paused');
  }

  stepOnce() {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.onStateChange(this.steps[this.currentIndex].state);
      this.setStatus('paused');
    }
  }

  stepBack() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.onStateChange(this.steps[this.currentIndex].state);
      this.setStatus('paused');
    }
  }

  goToStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentIndex = index;
      this.onStateChange(this.steps[this.currentIndex].state);
      this.setStatus('paused');
    }
  }

  reset() {
    this.pause();
    this.currentIndex = -1;
    this.onStateChange(this.initialState);
    this.setStatus('idle');
  }

  clear() {
    this.pause();
    this.steps = [];
    this.currentIndex = -1;
    this.setStatus('idle');
  }

  updateInitialState(state: QueueVizState) {
    this.initialState = state;
  }

  get stepIndex() {
    return this.currentIndex;
  }

  get totalSteps() {
    return this.steps.length;
  }

  private playNext() {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.onStateChange(this.steps[this.currentIndex].state);
      this.timer = window.setTimeout(() => this.playNext(), this.interval);
    } else {
      this.setStatus('ended');
    }
  }

  private setStatus(status: QueuePlayerStatus) {
    this.status = status;
    this.onStatusChange(status);
  }
}

export type QueuePlayerStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'ended';
