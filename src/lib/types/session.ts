/**
 * 检测会话相关类型定义 / Testing Session Type Definitions
 */

import type { SignalData, TestingParameters, Defect } from './signal';

/**
 * 检测状态 / Testing Status
 */
export type TestingStatus = 'running' | 'paused' | 'completed' | 'error';

/**
 * 检测会话 / Testing Session
 */
export interface TestingSession {
  id: string;
  projectName: string;
  operatorId: string;
  startTime: Date;
  endTime?: Date;
  status: TestingStatus;
  parameters: TestingParameters;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 会话过滤器 / Session Filters
 */
export interface SessionFilters {
  operatorId?: string;
  status?: TestingStatus;
  startDate?: Date;
  endDate?: Date;
  projectName?: string;
}

/**
 * 完整会话数据（包含信号和缺陷）/ Complete Session Data
 */
export interface CompleteSessionData extends TestingSession {
  signalData: SignalData[];
  defects: Defect[];
}
