/**
 * 信号相关类型定义 / Signal-related Type Definitions
 */

/**
 * 信号数据点 / Signal Data Point
 */
export interface SignalData {
  timestamp: number;
  amplitude: number;
  phase: number;
  position: number;
  frequency: number;
}

/**
 * 滤波器类型 / Filter Type
 */
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'none';

/**
 * 闸门配置 / Gate Configuration
 */
export interface GateConfig {
  enabled: boolean;
  start: number;
  width: number;
  height: number;
  alarmThreshold: number;
  color: string;
}

/**
 * 检测参数 / Testing Parameters
 */
export interface TestingParameters {
  gain: number;
  filter: FilterType;
  velocity: number;
  gateA: GateConfig;
  gateB: GateConfig;
  threshold: number;
}

/**
 * 缺陷严重程度 / Defect Severity
 */
export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * 缺陷记录 / Defect Record
 */
export interface Defect {
  id: string;
  position: number;
  amplitude: number;
  severity: DefectSeverity;
  timestamp: Date;
  gateTriggered: 'A' | 'B' | 'both';
  notes?: string;
}

/**
 * 缺陷配置（用于信号生成）/ Defect Configuration (for signal generation)
 */
export interface DefectConfig {
  position: number;
  amplitude: number;
  width: number;
}
