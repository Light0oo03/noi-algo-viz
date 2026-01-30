/**
 * TracePlayer - 控制算法 trace 的播放
 * 采用方案1：每步播放后通过回调通知外部更新 Vue 响应式状态
 */

import type { BfsTrace } from './types';
import type { VizState } from './types';
import { cloneVizState, createInitialVizState } from './types';

export type PlayerStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'ended';

export interface TracePlayerOptions {
  /** 每步之间的间隔时间（毫秒） */
  interval?: number;
  /** 状态变化回调 */
  onStateChange?: (state: VizState) => void;
  /** 播放器状态变化回调 */
  onStatusChange?: (status: PlayerStatus) => void;
}

export class TracePlayer {
  private trace: BfsTrace | null = null;
  private currentIndex: number = 0;
  private timer: number | null = null;
  private _status: PlayerStatus = 'idle';
  private interval: number;
  private onStateChange?: (state: VizState) => void;
  private onStatusChange?: (status: PlayerStatus) => void;

  /** 初始状态（用于 reset） */
  private initialState: VizState;

  constructor(initialState: VizState, options: TracePlayerOptions = {}) {
    this.initialState = cloneVizState(initialState);
    this.interval = options.interval ?? 600;
    this.onStateChange = options.onStateChange;
    this.onStatusChange = options.onStatusChange;
  }

  /** 当前播放器状态 */
  get status(): PlayerStatus {
    return this._status;
  }

  /** 当前步骤索引 */
  get stepIndex(): number {
    return this.currentIndex;
  }

  /** 总步骤数 */
  get totalSteps(): number {
    return this.trace?.steps.length ?? 0;
  }

  /** 当前状态 */
  get currentState(): VizState {
    if (!this.trace || this.currentIndex < 0) {
      return this.initialState;
    }
    if (this.currentIndex >= this.trace.steps.length) {
      return this.trace.steps[this.trace.steps.length - 1]?.state ?? this.initialState;
    }
    return this.trace.steps[this.currentIndex]?.state ?? this.initialState;
  }

  /** 设置播放器状态 */
  private setStatus(status: PlayerStatus) {
    this._status = status;
    this.onStatusChange?.(status);
  }

  /** 加载 trace */
  load(trace: BfsTrace) {
    this.stop();
    this.trace = trace;
    this.currentIndex = -1; // -1 表示还没开始
    this.setStatus('ready');
    // 通知初始状态
    this.onStateChange?.(this.initialState);
  }

  /** 更新初始状态（图编辑后调用） */
  updateInitialState(state: VizState) {
    this.initialState = cloneVizState(state);
    if (this._status === 'idle' || this._status === 'ready') {
      this.onStateChange?.(this.initialState);
    }
  }

  /** 开始/继续播放 */
  play() {
    if (!this.trace) return;

    if (this._status === 'ended') {
      // 已结束，重新开始
      this.currentIndex = -1;
    }

    this.setStatus('playing');
    this.scheduleNext();
  }

  /** 暂停播放 */
  pause() {
    this.clearTimer();
    if (this._status === 'playing') {
      this.setStatus('paused');
    }
  }

  /** 停止播放并重置 */
  stop() {
    this.clearTimer();
    this.currentIndex = -1;
    this.setStatus(this.trace ? 'ready' : 'idle');
    this.onStateChange?.(this.initialState);
  }

  /** 完全清除 trace 并重置到 idle 状态 */
  clear() {
    this.clearTimer();
    this.trace = null;
    this.currentIndex = -1;
    this.setStatus('idle');
    this.onStateChange?.(this.initialState);
  }

  /** 单步向前执行 */
  stepOnce() {
    if (!this.trace) return;

    this.clearTimer();

    if (this._status === 'ended') {
      // 已结束，不能再单步
      return;
    }

    this.executeStep();

    // executeStep 可能会把状态改成 ended，需要重新检查
    if (this._status as PlayerStatus !== 'ended') {
      this.setStatus('paused');
    }
  }

  /** 单步向后执行（回退） */
  stepBack() {
    if (!this.trace) return;

    this.clearTimer();

    // 如果当前是初始状态（-1），不能再回退
    if (this.currentIndex < 0) {
      return;
    }

    this.currentIndex--;

    if (this.currentIndex < 0) {
      // 回到初始状态
      this.onStateChange?.(this.initialState);
      this.setStatus('ready');
    } else {
      const step = this.trace.steps[this.currentIndex];
      if (step) {
        this.onStateChange?.(cloneVizState(step.state));
      }
      this.setStatus('paused');
    }
  }

  /** 跳转到指定步骤 */
  goToStep(index: number) {
    if (!this.trace) return;

    this.clearTimer();

    // 限制范围
    const targetIndex = Math.max(-1, Math.min(index, this.trace.steps.length - 1));
    this.currentIndex = targetIndex;

    if (this.currentIndex < 0) {
      this.onStateChange?.(this.initialState);
      this.setStatus('ready');
    } else {
      const step = this.trace.steps[this.currentIndex];
      if (step) {
        this.onStateChange?.(cloneVizState(step.state));
      }
      if (this.currentIndex >= this.trace.steps.length - 1) {
        this.setStatus('ended');
      } else {
        this.setStatus('paused');
      }
    }
  }

  /** 重置到开始 */
  reset() {
    this.stop();
  }

  /** 设置播放速度 */
  setInterval(ms: number) {
    this.interval = ms;
  }

  /** 清除定时器 */
  private clearTimer() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /** 安排下一步 */
  private scheduleNext() {
    this.clearTimer();
    this.timer = window.setTimeout(() => {
      this.executeStep();
      if (this._status === 'playing') {
        this.scheduleNext();
      }
    }, this.interval);
  }

  /** 执行一步 */
  private executeStep() {
    if (!this.trace) return;

    this.currentIndex++;

    if (this.currentIndex >= this.trace.steps.length) {
      // 播放结束
      this.clearTimer();
      this.setStatus('ended');
      return;
    }

    const step = this.trace.steps[this.currentIndex];
    if (step) {
      this.onStateChange?.(cloneVizState(step.state));
    }
  }
}

/** 工厂函数：从节点/边列表创建初始 VizState */
export function createInitialStateFromGraph(
  nodeIds: number[],
  edgeKeys: string[]
): VizState {
  return createInitialVizState(nodeIds, edgeKeys);
}
