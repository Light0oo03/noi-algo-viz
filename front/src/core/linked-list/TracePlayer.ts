/**
 * ListTracePlayer - 控制链表 trace 播放
 */

import type { ListTrace, ListVizState } from './types';
import { cloneListVizState } from './types';

export type ListPlayerStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'ended';

export interface ListTracePlayerOptions {
  interval?: number;
  onStateChange?: (state: ListVizState) => void;
  onStatusChange?: (status: ListPlayerStatus) => void;
}

export class ListTracePlayer {
  private trace: ListTrace | null = null;
  private currentIndex = 0;
  private timer: number | null = null;
  private _status: ListPlayerStatus = 'idle';
  private interval: number;
  private onStateChange?: (state: ListVizState) => void;
  private onStatusChange?: (status: ListPlayerStatus) => void;
  private initialState: ListVizState;

  constructor(initialState: ListVizState, options: ListTracePlayerOptions = {}) {
    this.initialState = cloneListVizState(initialState);
    this.interval = options.interval ?? 600;
    this.onStateChange = options.onStateChange;
    this.onStatusChange = options.onStatusChange;
  }

  get status(): ListPlayerStatus {
    return this._status;
  }

  get stepIndex(): number {
    return this.currentIndex;
  }

  get totalSteps(): number {
    return this.trace?.steps.length ?? 0;
  }

  private setStatus(status: ListPlayerStatus) {
    this._status = status;
    this.onStatusChange?.(status);
  }

  load(trace: ListTrace) {
    this.stop();
    this.trace = trace;
    this.currentIndex = -1;
    this.setStatus('ready');
    this.onStateChange?.(this.initialState);
  }

  updateInitialState(state: ListVizState) {
    this.initialState = cloneListVizState(state);
    if (this._status === 'idle' || this._status === 'ready') {
      this.onStateChange?.(this.initialState);
    }
  }

  play() {
    if (!this.trace) return;
    if (this._status === 'ended') {
      this.currentIndex = -1;
    }
    this.setStatus('playing');
    this.scheduleNext();
  }

  pause() {
    this.clearTimer();
    if (this._status === 'playing') {
      this.setStatus('paused');
    }
  }

  stop() {
    this.clearTimer();
    this.currentIndex = -1;
    this.setStatus(this.trace ? 'ready' : 'idle');
    this.onStateChange?.(this.initialState);
  }

  clear() {
    this.clearTimer();
    this.trace = null;
    this.currentIndex = -1;
    this.setStatus('idle');
    this.onStateChange?.(this.initialState);
  }

  stepOnce() {
    if (!this.trace) return;
    this.clearTimer();
    if (this._status === 'ended') return;
    const ended = this.executeStep();
    if (!ended) {
      this.setStatus('paused');
    }
  }

  stepBack() {
    if (!this.trace) return;
    this.clearTimer();
    if (this.currentIndex < 0) return;
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.onStateChange?.(this.initialState);
      this.setStatus('ready');
    } else {
      const step = this.trace.steps[this.currentIndex];
      if (step) {
        this.onStateChange?.(cloneListVizState(step.state));
      }
      this.setStatus('paused');
    }
  }

  goToStep(index: number) {
    if (!this.trace) return;
    this.clearTimer();
    const targetIndex = Math.max(-1, Math.min(index, this.trace.steps.length - 1));
    this.currentIndex = targetIndex;
    if (this.currentIndex < 0) {
      this.onStateChange?.(this.initialState);
      this.setStatus('ready');
    } else {
      const step = this.trace.steps[this.currentIndex];
      if (step) {
        this.onStateChange?.(cloneListVizState(step.state));
      }
      if (this.currentIndex >= this.trace.steps.length - 1) {
        this.setStatus('ended');
      } else {
        this.setStatus('paused');
      }
    }
  }

  reset() {
    this.stop();
  }

  private clearTimer() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNext() {
    this.clearTimer();
    this.timer = window.setTimeout(() => {
      this.executeStep();
      if (this._status === 'playing') {
        this.scheduleNext();
      }
    }, this.interval);
  }

  private executeStep(): boolean {
    if (!this.trace) return false;
    this.currentIndex++;
    if (this.currentIndex >= this.trace.steps.length) {
      this.clearTimer();
      this.setStatus('ended');
      return true;
    }
    const step = this.trace.steps[this.currentIndex];
    if (step) {
      this.onStateChange?.(cloneListVizState(step.state));
    }
    return false;
  }
}
