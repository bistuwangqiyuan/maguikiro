/**
 * 实用工具类型 / Utility Types
 * 
 * Helper types for common patterns and transformations
 */

/**
 * 使所有属性可选 / Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 使所有属性必需 / Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * 分页结果 / Paginated Result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API响应包装 / API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: Date;
}

/**
 * 加载状态 / Loading State
 */
export interface LoadingState {
  isLoading: boolean;
  error?: Error | null;
  lastUpdated?: Date;
}

/**
 * 数据状态包装 / Data State Wrapper
 */
export interface DataState<T> extends LoadingState {
  data: T | null;
}

/**
 * 排序配置 / Sort Configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * 过滤条件 / Filter Condition
 */
export interface FilterCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: unknown;
}

/**
 * 查询参数 / Query Parameters
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: SortConfig;
  filters?: FilterCondition[];
  search?: string;
}

/**
 * 时间范围 / Time Range
 */
export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * 坐标点 / Coordinate Point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 矩形区域 / Rectangle Area
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 颜色配置 / Color Configuration
 */
export interface ColorConfig {
  primary: string;
  secondary?: string;
  background?: string;
  border?: string;
}

/**
 * 验证结果 / Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 验证错误 / Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * 操作结果 / Operation Result
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 统计数据 / Statistics Data
 */
export interface Statistics {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

/**
 * 进度信息 / Progress Information
 */
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  message?: string;
}

/**
 * 键值对 / Key-Value Pair
 */
export interface KeyValuePair<K = string, V = unknown> {
  key: K;
  value: V;
}

/**
 * 选项项 / Option Item
 */
export interface OptionItem<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}

/**
 * 菜单项 / Menu Item
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action?: () => void;
  href?: string;
  disabled?: boolean;
  children?: MenuItem[];
}

/**
 * 通知消息 / Notification Message
 */
export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

/**
 * 文件信息 / File Information
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  url?: string;
}

/**
 * 导出选项 / Export Options
 */
export interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

/**
 * 图表数据点 / Chart Data Point
 */
export interface ChartDataPoint {
  x: number | Date;
  y: number;
  label?: string;
}

/**
 * 图表配置 / Chart Configuration
 */
export interface ChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: string[];
}
