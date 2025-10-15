/**
 * 信号处理服务 / Signal Processing Service
 * 
 * 提供信号处理功能，包括增益调整、滤波、相位计算和缺陷检测
 * Provides signal processing functions including gain adjustment, filtering, phase calculation, and defect detection
 */

import type { SignalData, FilterType, GateConfig, Defect, DefectSeverity } from '$lib/types/signal';

/**
 * 信号处理器类 / Signal Processor Class
 */
export class SignalProcessor {
  private gain: number = 1.0;
  private filterType: FilterType = 'none';
  private filterBuffer: number[] = [];
  private readonly bufferSize: number = 10;

  /**
   * 设置增益 / Set gain
   * @param gainDb 增益值（dB）/ Gain value in dB (0-100)
   */
  setGain(gainDb: number): void {
    // 将dB转换为线性增益 / Convert dB to linear gain
    // gain = 10^(gainDb/20)
    this.gain = Math.pow(10, gainDb / 20);
  }

  /**
   * 设置滤波器类型 / Set filter type
   */
  setFilter(filterType: FilterType): void {
    this.filterType = filterType;
    // 清空滤波器缓冲区 / Clear filter buffer
    this.filterBuffer = [];
  }

  /**
   * 应用增益调整 / Apply gain adjustment
   */
  private applyGain(amplitude: number): number {
    return amplitude * this.gain;
  }

  /**
   * 应用滤波器 / Apply filter
   * 使用简单的移动平均滤波器实现 / Implemented using simple moving average filter
   */
  private applyFilter(amplitude: number): number {
    if (this.filterType === 'none') {
      return amplitude;
    }

    // 添加到缓冲区 / Add to buffer
    this.filterBuffer.push(amplitude);
    if (this.filterBuffer.length > this.bufferSize) {
      this.filterBuffer.shift();
    }

    // 根据滤波器类型处理 / Process based on filter type
    switch (this.filterType) {
      case 'lowpass':
        return this.lowPassFilter();
      case 'highpass':
        return this.highPassFilter(amplitude);
      case 'bandpass':
        return this.bandPassFilter(amplitude);
      default:
        return amplitude;
    }
  }

  /**
   * 低通滤波器 / Low-pass filter
   * 使用移动平均 / Using moving average
   */
  private lowPassFilter(): number {
    const sum = this.filterBuffer.reduce((acc, val) => acc + val, 0);
    return sum / this.filterBuffer.length;
  }

  /**
   * 高通滤波器 / High-pass filter
   * 当前值减去移动平均 / Current value minus moving average
   */
  private highPassFilter(currentValue: number): number {
    if (this.filterBuffer.length < 2) {
      return currentValue;
    }
    const average = this.filterBuffer.reduce((acc, val) => acc + val, 0) / this.filterBuffer.length;
    return currentValue - average;
  }

  /**
   * 带通滤波器 / Band-pass filter
   * 组合低通和高通 / Combination of low-pass and high-pass
   */
  private bandPassFilter(currentValue: number): number {
    const lowPass = this.lowPassFilter();
    const highPass = this.highPassFilter(currentValue);
    return (lowPass + highPass) / 2;
  }

  /**
   * 计算相位 / Calculate phase
   * 基于幅值和频率的相位估算 / Phase estimation based on amplitude and frequency
   */
  calculatePhase(amplitude: number, frequency: number): number {
    // 使用反正切函数计算相位 / Calculate phase using arctangent
    const phase = Math.atan2(amplitude, 1.0) * (180 / Math.PI);
    return phase;
  }

  /**
   * 处理单个信号数据点 / Process single signal data point
   */
  processSignal(signal: SignalData): SignalData {
    // 1. 应用增益 / Apply gain
    let processedAmplitude = this.applyGain(signal.amplitude);

    // 2. 应用滤波器 / Apply filter
    processedAmplitude = this.applyFilter(processedAmplitude);

    // 3. 重新计算相位 / Recalculate phase
    const processedPhase = this.calculatePhase(processedAmplitude, signal.frequency);

    return {
      ...signal,
      amplitude: processedAmplitude,
      phase: processedPhase
    };
  }

  /**
   * 批量处理信号数据 / Process batch signal data
   */
  processBatch(signals: SignalData[]): SignalData[] {
    return signals.map(signal => this.processSignal(signal));
  }

  /**
   * 检测缺陷 / Detect defects
   * 使用阈值比较算法 / Using threshold comparison algorithm
   */
  detectDefects(
    signals: SignalData[],
    threshold: number,
    gateA: GateConfig,
    gateB: GateConfig
  ): Defect[] {
    const defects: Defect[] = [];

    for (const signal of signals) {
      // 检查信号是否在闸门范围内 / Check if signal is within gate range
      const inGateA = this.isInGate(signal, gateA);
      const inGateB = this.isInGate(signal, gateB);

      if (!inGateA && !inGateB) {
        continue;
      }

      // 检查是否超过阈值 / Check if exceeds threshold
      const absAmplitude = Math.abs(signal.amplitude);
      
      let gateTriggered: 'A' | 'B' | 'both' | null = null;
      let alarmThreshold = threshold;

      if (inGateA && inGateB) {
        gateTriggered = 'both';
        alarmThreshold = Math.min(gateA.alarmThreshold, gateB.alarmThreshold);
      } else if (inGateA) {
        gateTriggered = 'A';
        alarmThreshold = gateA.alarmThreshold;
      } else if (inGateB) {
        gateTriggered = 'B';
        alarmThreshold = gateB.alarmThreshold;
      }

      if (gateTriggered && absAmplitude > alarmThreshold) {
        // 检测到缺陷 / Defect detected
        const severity = this.calculateSeverity(absAmplitude, alarmThreshold);
        
        defects.push({
          id: `defect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: signal.position,
          amplitude: absAmplitude,
          severity,
          timestamp: new Date(signal.timestamp),
          gateTriggered
        });
      }
    }

    return defects;
  }

  /**
   * 检查信号是否在闸门范围内 / Check if signal is within gate range
   */
  private isInGate(signal: SignalData, gate: GateConfig): boolean {
    if (!gate.enabled) {
      return false;
    }

    const inPositionRange = 
      signal.position >= gate.start && 
      signal.position <= gate.start + gate.width;
    
    const inAmplitudeRange = Math.abs(signal.amplitude) <= gate.height;

    return inPositionRange && inAmplitudeRange;
  }

  /**
   * 计算缺陷严重程度 / Calculate defect severity
   */
  private calculateSeverity(amplitude: number, threshold: number): DefectSeverity {
    const ratio = amplitude / threshold;

    if (ratio >= 3.0) {
      return 'critical';
    } else if (ratio >= 2.0) {
      return 'high';
    } else if (ratio >= 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 创建信号处理管道 / Create signal processing pipeline
   * 链式处理多个信号数据 / Chain process multiple signal data
   */
  createPipeline(
    gainDb: number,
    filterType: FilterType
  ): (signals: SignalData[]) => SignalData[] {
    return (signals: SignalData[]) => {
      this.setGain(gainDb);
      this.setFilter(filterType);
      return this.processBatch(signals);
    };
  }

  /**
   * 重置处理器状态 / Reset processor state
   */
  reset(): void {
    this.filterBuffer = [];
  }
}

/**
 * 创建默认信号处理器实例 / Create default signal processor instance
 */
export function createSignalProcessor(): SignalProcessor {
  return new SignalProcessor();
}

