/**
 * 应用常量定义 / Application Constants
 */

// 信号采集参数 / Signal Acquisition Parameters
export const SAMPLING_RATE = 100; // Hz
export const MAX_GAIN_DB = 100;
export const MIN_GAIN_DB = 0;
export const DEFAULT_GAIN_DB = 60;

// 闸门参数 / Gate Parameters
export const MAX_GATE_WIDTH = 1000;
export const MIN_GATE_WIDTH = 10;
export const DEFAULT_GATE_WIDTH = 100;

// 数据批量写入间隔 / Data Batch Write Interval
export const DATA_WRITE_INTERVAL_MS = 1000;

// 波形显示参数 / Waveform Display Parameters
export const WAVEFORM_REFRESH_RATE_FPS = 30;
export const WAVEFORM_BUFFER_SIZE = 1000;

// 用户角色 / User Roles
export const USER_ROLES = {
  OPERATOR: 'operator',
  ENGINEER: 'engineer',
  ADMIN: 'admin'
} as const;

// 检测状态 / Testing Status
export const TESTING_STATUS = {
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;

// 缺陷严重程度 / Defect Severity
export const DEFECT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// 滤波器类型 / Filter Types
export const FILTER_TYPES = {
  LOWPASS: 'lowpass',
  HIGHPASS: 'highpass',
  BANDPASS: 'bandpass',
  NONE: 'none'
} as const;

// 国际标准 / International Standards
export const STANDARDS = {
  ASME_V: 'ASME-V-Article-7',
  ISO_9712: 'ISO-9712-Level-2',
  EN_10228: 'EN-10228',
  ASTM_E709: 'ASTM-E709'
} as const;

// 报告类型 / Report Types
export const REPORT_TYPES = {
  STANDARD: 'standard',
  DETAILED: 'detailed',
  SUMMARY: 'summary'
} as const;

// 颜色常量 / Color Constants
export const COLORS = {
  PRIMARY_ORANGE: '#FF6B35',
  PRIMARY_ORANGE_DARK: '#E55A2B',
  PRIMARY_ORANGE_LIGHT: '#FF8555',
  BG_DARK: '#1A1A1A',
  BG_MEDIUM: '#2D2D2D',
  BG_LIGHT: '#3D3D3D',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#B0B0B0',
  TEXT_DISABLED: '#666666',
  WAVEFORM_SIGNAL: '#00FF00',
  WAVEFORM_GRID: '#333333',
  WAVEFORM_GATE_A: '#FFD700',
  WAVEFORM_GATE_B: '#FF69B4',
  SUCCESS: '#4CAF50',
  WARNING: '#FFC107',
  ERROR: '#F44336',
  INFO: '#2196F3'
} as const;
