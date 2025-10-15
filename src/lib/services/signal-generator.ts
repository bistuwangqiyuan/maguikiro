/**
 * 信号生成器服务 / Signal Generator Service
 * 
 * 生成模拟的磁检测信号，包括基础正弦波和缺陷信号
 * Generates simulated magnetic testing signals including base sine waves and defect signals
 */

import type { SignalData, DefectConfig } from '$lib/types/signal';

/**
 * 信号生成器类 / Signal Generator Class
 */
export class SignalGenerator {
  private baseFrequency: number;
  private baseAmplitude: number;
  private noiseLevel: number;
  private defects: DefectConfig[];

  constructor(
    frequency: number = 100,
    amplitude: number = 1.0,
    noiseLevel: number = 0.1
  ) {
    this.baseFrequency = frequency;
    this.baseAmplitude = amplitude;
    this.noiseLevel = noiseLevel;
    this.defects = [];
  }

  /**
   * 设置缺陷配置 / Set defect configurations
   */
  setDefects(defects: DefectConfig[]): void {
    this.defects = defects;
  }

  /**
   * 生成基础正弦波信号 / Generate base sine wave signal
   */
  private generateBaseSignal(time: number): number {
    const noise = (Math.random() - 0.5) * this.noiseLevel;
    return this.baseAmplitude * Math.sin(2 * Math.PI * this.baseFrequency * time) + noise;
  }

  /**
   * 生成缺陷信号（高斯脉冲）/ Generate defect signal (Gaussian pulse)
   */
  private generateDefectSignal(time: number, defect: DefectConfig): number {
    const sigma = defect.width || 0.01; // 脉冲宽度 / Pulse width
    const distance = time - defect.position;
    return defect.amplitude * Math.exp(-(distance * distance) / (2 * sigma * sigma));
  }

  /**
   * 计算相位 / Calculate phase
   */
  private calculatePhase(amplitude: number): number {
    // 简化的相位计算，基于幅值 / Simplified phase calculation based on amplitude
    return Math.atan2(amplitude, 1.0) * (180 / Math.PI);
  }

  /**
   * 生成完整信号数据点 / Generate complete signal data point
   */
  generateSignal(time: number): SignalData {
    // 生成基础信号 / Generate base signal
    let signal = this.generateBaseSignal(time);

    // 叠加所有缺陷信号 / Superimpose all defect signals
    for (const defect of this.defects) {
      signal += this.generateDefectSignal(time, defect);
    }

    return {
      timestamp: Date.now(),
      amplitude: signal,
      phase: this.calculatePhase(signal),
      position: time,
      frequency: this.baseFrequency
    };
  }

  /**
   * 批量生成信号数据 / Generate batch signal data
   */
  generateBatch(startTime: number, count: number, interval: number): SignalData[] {
    const batch: SignalData[] = [];
    for (let i = 0; i < count; i++) {
      const time = startTime + i * interval;
      batch.push(this.generateSignal(time));
    }
    return batch;
  }

  /**
   * 更新基础参数 / Update base parameters
   */
  updateParameters(frequency?: number, amplitude?: number, noiseLevel?: number): void {
    if (frequency !== undefined) this.baseFrequency = frequency;
    if (amplitude !== undefined) this.baseAmplitude = amplitude;
    if (noiseLevel !== undefined) this.noiseLevel = noiseLevel;
  }
}
