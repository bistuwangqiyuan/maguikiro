/**
 * 数据库表类型定义 / Database Table Type Definitions
 */

/**
 * 用户角色 / User Role
 */
export type UserRole = 'operator' | 'engineer' | 'admin';

/**
 * 用户配置表 / Profiles Table
 */
export interface Profile {
  id: string;
  username: string;
  fullName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 校准数据 / Calibration Data
 */
export interface CalibrationData {
  id: string;
  operatorId: string;
  calibrationType: string;
  referenceSignal: Record<string, unknown>;
  coefficients: Record<string, unknown>;
  standardBlock?: string;
  calibrationDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

/**
 * 报告元数据 / Report Metadata
 */
export interface Report {
  id: string;
  sessionId: string;
  reportType: string;
  standard?: string;
  content: Record<string, unknown>;
  pdfUrl?: string;
  generatedBy: string;
  generatedAt: Date;
  createdAt: Date;
}

/**
 * 数据导出格式 / Data Export Format
 */
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

/**
 * 同步状态 / Sync Status
 */
export interface PendingSyncItem {
  id?: number;
  type: 'session' | 'signal' | 'defect' | 'calibration';
  data: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
}
