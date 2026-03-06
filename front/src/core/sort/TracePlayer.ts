import type { SortVizState } from './types';

export class SortTracePlayer {
  private steps: any[] = [];
  private currentIndex = -1;
  private timer: number | null = null;
  private initialState: SortVizState;
  private interval: number;
  private onStateChange: (state: SortVizState) => void;
  private onStatusChange: (status: SortPlayerStatus) => void;
  private status: SortPlayerStatus = 'idle';

  constructor(
    initialState: SortVizState,
    options: {
      interval?: number;
      onStateChange: (state: SortVizState) => void;
      onStatusChange: (status: SortPlayerStatus) => void;
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

  updateInitialState(state: SortVizState) {
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

  private setStatus(status: SortPlayerStatus) {
    this.status = status;
    this.onStatusChange(status);
  }
}

export type SortPlayerStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'ended';
