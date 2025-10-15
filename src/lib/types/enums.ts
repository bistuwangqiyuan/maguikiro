/**
 * 枚举类型定义 / Enum Type Definitions
 * 
 * Centralized enums for the magnetic testing instrument application
 */

/**
 * 用户角色枚举 / User Role Enum
 */
export enum UserRole {
  OPERATOR = 'operator',
  ENGINEER = 'engineer',
  ADMIN = 'admin'
}

/**
 * 检测状态枚举 / Testing Status Enum
 */
export enum TestingStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * 缺陷严重程度枚举 / Defect Severity Enum
 */
export enum DefectSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 闸门标识枚举 / Gate Identifier Enum
 */
export enum GateIdentifier {
  A = 'A',
  B = 'B',
  BOTH = 'both'
}

/**
 * 滤波器类型枚举 / Filter Type Enum
 */
export enum FilterType {
  NONE = 'none',
  LOWPASS = 'lowpass',
  HIGHPASS = 'highpass',
  BANDPASS = 'bandpass'
}

/**
 * 校准类型枚举 / Calibration Type Enum
 */
export enum CalibrationType {
  STANDARD_BLOCK = 'standard_block',
  REFERENCE_SIGNAL = 'reference_signal',
  SYSTEM_CHECK = 'system_check',
  CUSTOM = 'custom'
}

/**
 * 报告类型枚举 / Report Type Enum
 */
export enum ReportType {
  STANDARD = 'standard',
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  CUSTOM = 'custom'
}

/**
 * 国际标准枚举 / International Standard Enum
 */
export enum InternationalStandard {
  ASME = 'ASME',
  ISO = 'ISO',
  EN = 'EN',
  ASTM = 'ASTM',
  CUSTOM = 'custom'
}

/**
 * 数据导出格式枚举 / Export Format Enum
 */
export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  PDF = 'pdf'
}

/**
 * 同步项类型枚举 / Sync Item Type Enum
 */
export enum SyncItemType {
  SESSION = 'session',
  SIGNAL = 'signal',
  DEFECT = 'defect',
  CALIBRATION = 'calibration',
  REPORT = 'report'
}

/**
 * 网络状态枚举 / Network Status Enum
 */
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SYNCING = 'syncing'
}

/**
 * 通知类型枚举 / Notification Type Enum
 */
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * 校准状态枚举 / Calibration Status Enum
 */
export enum CalibrationStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon',
  INVALID = 'invalid'
}

/**
 * 数据采集模式枚举 / Data Acquisition Mode Enum
 */
export enum AcquisitionMode {
  CONTINUOUS = 'continuous',
  TRIGGERED = 'triggered',
  MANUAL = 'manual'
}

/**
 * 显示模式枚举 / Display Mode Enum
 */
export enum DisplayMode {
  WAVEFORM = 'waveform',
  DATA_TABLE = 'data_table',
  SPLIT = 'split',
  DASHBOARD = 'dashboard'
}
