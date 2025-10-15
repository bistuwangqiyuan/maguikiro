/**
 * 数据采集服务 / Data Acquisition Service
 * 
 * 管理数据采集循环，控制采样率和数据缓冲
 * Manages data acquisition loop, controls sampling rate and data buffering
 */

import type { SignalData, DefectConfig } from '$lib/types/signal';
import { SignalGenerator } from './signal-generator';
import { SAMPLING_RATE } from '$lib/utils/constants';

/**
 * 数据采集配置 / Data Acquisition Configuration
 */
export interface DataAcquisitionConfig {
  samplingRate?: number; // Hz
  frequency?: number; // Signal frequency in Hz
  amplitude?: number; // Signal amplitude
  noiseLevel?: number; // Noise level (0-1)
  defects?: DefectConfig[]; // Defect configurations
}

/**
 * 数据采集回调 / Data Acquisition Callback
 */
export type DataCallback = (data: SignalData) => void;

/**
 * 数据采集服务类 / Data Acquisition Service Class
 */
export class DataAcquisitionService {
  private generator: SignalGenerator;
  private samplingRate: number;
  private isRunning: boolean;
  private intervalId: number | null;
  private currentTime: number;
  private callbacks: DataCallback[];

  constructor(config: DataAcquisitionConfig = {}) {
    this.samplingRate = config.samplingRate || SAMPLING_RATE;
    this.generator = new SignalGenerator(
      config.frequency,
      config.amplitude,
      config.noiseLevel
    );
    
    if (config.defects) {
      this.generator.setDefects(config.defects);
    }

    this.isRunning = false;
    this.intervalId = null;
    this.currentTime = 0;
    this.callbacks = [];
  }

  /**
   * 注册数据回调 / Register data callback
   */
  onData(callback: DataCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * 移除数据回调 / Remove data callback
   */
  offData(callback: DataCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 通知所有回调 / Notify all callbacks
   */
  private notifyCallbacks(data: SignalData): void {
    for (const callback of this.callbacks) {
      callback(data);
    }
  }

  /**
   * 开始数据采集 / Start data acquisition
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Data acquisition is already running');
      return;
    }

    this.isRunning = true;
    this.currentTime = 0;

    const intervalMs = 1000 / this.samplingRate;

    this.intervalId = window.setInterval(() => {
      if (!this.isRunning) return;

      // 生成信号数据 / Generate signal data
      const data = this.generator.generateSignal(this.currentTime);
      
      // 通知所有回调 / Notify all callbacks
      this.notifyCallbacks(data);

      // 更新时间 / Update time
      this.currentTime += 1 / this.samplingRate;
    }, intervalMs);
  }

  /**
   * 停止数据采集 / Stop data acquisition
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 暂停数据采集 / Pause data acquisition
   */
  pause(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
  }

  /**
   * 恢复数据采集 / Resume data acquisition
   */
  resume(): void {
    if (this.isRunning) {
      return;
    }

    this.start();
  }

  /**
   * 重置数据采集 / Reset data acquisition
   */
  reset(): void {
    this.stop();
    this.currentTime = 0;
    this.callbacks = [];
  }

  /**
   * 更新配置 / Update configuration
   */
  updateConfig(config: DataAcquisitionConfig): void {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      this.stop();
    }

    if (config.samplingRate !== undefined) {
      this.samplingRate = config.samplingRate;
    }

    this.generator.updateParameters(
      config.frequency,
      config.amplitude,
      config.noiseLevel
    );

    if (config.defects !== undefined) {
      this.generator.setDefects(config.defects);
    }

    if (wasRunning) {
      this.start();
    }
  }

  /**
   * 设置缺陷配置 / Set defect configurations
   */
  setDefects(defects: DefectConfig[]): void {
    this.generator.setDefects(defects);
  }

  /**
   * 获取当前状态 / Get current status
   */
  getStatus(): {
    isRunning: boolean;
    currentTime: number;
    samplingRate: number;
  } {
    return {
      isRunning: this.isRunning,
      currentTime: this.currentTime,
      samplingRate: this.samplingRate
    };
  }

  /**
   * 获取当前时间 / Get current time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * 检查是否正在运行 / Check if running
   */
  isAcquiring(): boolean {
    return this.isRunning;
  }
}
