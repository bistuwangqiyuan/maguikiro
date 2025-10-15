/**
 * 数据库表类型定义 / Database Table Type Definitions
 * 
 * These types correspond to the Supabase database schema.
 * Field names use camelCase in TypeScript but map to snake_case in the database.
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
 * 数据库表的原始类型（snake_case字段名）/ Raw Database Types (snake_case fields)
 * 用于直接与Supabase交互 / Used for direct Supabase interactions
 */
export interface DbProfile {
  id: string;
  username: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface DbTestingSession {
  id: string;
  project_name: string;
  operator_id: string;
  start_time: string;
  end_time?: string;
  status: 'running' | 'paused' | 'completed' | 'error';
  parameters: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbSignalData {
  id: number;
  session_id: string;
  timestamp: number;
  amplitude: number;
  phase?: number;
  position: number;
  frequency?: number;
  created_at: string;
}

export interface DbDefect {
  id: string;
  session_id: string;
  position: number;
  amplitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  gate_triggered?: 'A' | 'B' | 'both';
  timestamp: string;
  notes?: string;
  created_at: string;
}

export interface DbCalibration {
  id: string;
  operator_id: string;
  calibration_type: string;
  reference_signal: Record<string, unknown>;
  coefficients: Record<string, unknown>;
  standard_block?: string;
  calibration_date: string;
  expiry_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export interface DbReport {
  id: string;
  session_id: string;
  report_type: string;
  standard?: string;
  content: Record<string, unknown>;
  pdf_url?: string;
  generated_by: string;
  generated_at: string;
  created_at: string;
}

/**
 * 校准类型 / Calibration Type
 */
export type CalibrationType = 'standard_block' | 'reference_signal' | 'system_check' | 'custom';

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
  notes?: string;
  createdAt: Date;
}

/**
 * 校准系数 / Calibration Coefficients
 */
export interface CalibrationCoefficients {
  gainCorrection: number;
  phaseCorrection: number;
  offsetCorrection: number;
  temperatureCoefficient?: number;
}

/**
 * 报告类型 / Report Type
 */
export type ReportType = 'standard' | 'summary' | 'detailed' | 'custom';

/**
 * 国际标准 / International Standards
 */
export type InternationalStandard = 'ASME' | 'ISO' | 'EN' | 'ASTM' | 'custom';

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
 * 报告内容结构 / Report Content Structure
 */
export interface ReportContent {
  projectInfo: {
    name: string;
    location?: string;
    equipment?: string;
  };
  testInfo: {
    date: Date;
    operator: string;
    standard?: string;
    parameters: Record<string, unknown>;
  };
  results: {
    totalDefects: number;
    criticalDefects: number;
    summary: string;
  };
  defects: Array<{
    position: number;
    severity: string;
    description?: string;
  }>;
  conclusion: string;
  recommendations?: string[];
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
