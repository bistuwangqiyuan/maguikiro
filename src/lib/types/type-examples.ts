/**
 * Type Examples and Verification
 * 
 * This file demonstrates the usage of all defined types and serves as
 * a compile-time verification that all types are correctly defined.
 */

import type {
  // Signal types
  SignalData,
  GateConfig,
  TestingParameters,
  Defect,
  DefectConfig,
  FilterType,
  DefectSeverity,
  // Session types
  TestingSession,
  SessionFilters,
  CompleteSessionData,
  TestingStatus,
  // Database types
  Profile,
  CalibrationData,
  CalibrationCoefficients,
  Report,
  ReportContent,
  UserRole,
  ExportFormat,
  PendingSyncItem,
  // Raw database types
  DbProfile,
  DbTestingSession,
  DbSignalData,
  DbDefect,
  DbCalibration,
  DbReport,
  // Utility types
  PaginatedResult,
  ApiResponse,
  DataState,
  ValidationResult,
  OperationResult,
  QueryParams,
  TimeRange,
  Point,
  Rectangle,
  NotificationMessage,
  FileInfo,
  ExportOptions,
  ChartDataPoint,
  ChartConfig
} from './index';

import {
  // Enums
  UserRoleEnum,
  TestingStatusEnum,
  DefectSeverityEnum,
  GateIdentifier,
  FilterTypeEnum,
  CalibrationTypeEnum,
  ReportTypeEnum,
  InternationalStandardEnum,
  ExportFormatEnum,
  SyncItemType,
  NetworkStatus,
  NotificationType,
  CalibrationStatus,
  AcquisitionMode,
  DisplayMode
} from './index';

// ============================================================================
// Signal Type Examples
// ============================================================================

export const exampleSignalData: SignalData = {
  timestamp: Date.now(),
  amplitude: 1.5,
  phase: 0.5,
  position: 10.0,
  frequency: 100
};

export const exampleGateConfig: GateConfig = {
  enabled: true,
  start: 0,
  width: 100,
  height: 50,
  alarmThreshold: 0.8,
  color: '#FFD700'
};

export const exampleTestingParameters: TestingParameters = {
  gain: 60,
  filter: 'bandpass',
  velocity: 1.5,
  gateA: exampleGateConfig,
  gateB: {
    enabled: false,
    start: 0,
    width: 100,
    height: 50,
    alarmThreshold: 0.8,
    color: '#FF69B4'
  },
  threshold: 0.5
};

export const exampleDefect: Defect = {
  id: 'defect-1',
  position: 25.5,
  amplitude: 2.5,
  severity: 'high',
  timestamp: new Date(),
  gateTriggered: 'A',
  notes: 'Critical defect detected'
};

export const exampleDefectConfig: DefectConfig = {
  position: 25.5,
  amplitude: 2.5,
  width: 0.5
};

// ============================================================================
// Session Type Examples
// ============================================================================

export const exampleTestingSession: TestingSession = {
  id: 'session-1',
  projectName: 'Pipeline Inspection',
  operatorId: 'user-1',
  startTime: new Date(),
  endTime: undefined,
  status: 'running',
  parameters: exampleTestingParameters,
  metadata: {
    location: 'Site A',
    equipment: 'DOPPLER-2000'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export const exampleSessionFilters: SessionFilters = {
  operatorId: 'user-1',
  status: 'completed',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  projectName: 'Pipeline'
};

export const exampleCompleteSessionData: CompleteSessionData = {
  ...exampleTestingSession,
  signalData: [exampleSignalData],
  defects: [exampleDefect]
};

// ============================================================================
// Database Type Examples
// ============================================================================

export const exampleProfile: Profile = {
  id: 'user-1',
  username: 'john.doe',
  fullName: 'John Doe',
  role: 'operator',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const exampleCalibrationCoefficients: CalibrationCoefficients = {
  gainCorrection: 1.05,
  phaseCorrection: 0.02,
  offsetCorrection: 0.01,
  temperatureCoefficient: 0.001
};

export const exampleCalibrationData: CalibrationData = {
  id: 'cal-1',
  operatorId: 'user-1',
  calibrationType: 'standard_block',
  referenceSignal: { amplitude: 1.0, frequency: 100 },
  coefficients: exampleCalibrationCoefficients,
  standardBlock: 'ASME-STD-001',
  calibrationDate: new Date(),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  isActive: true,
  notes: 'Annual calibration',
  createdAt: new Date()
};

export const exampleReportContent: ReportContent = {
  projectInfo: {
    name: 'Pipeline Inspection',
    location: 'Site A',
    equipment: 'DOPPLER-2000'
  },
  testInfo: {
    date: new Date(),
    operator: 'John Doe',
    standard: 'ASME',
    parameters: exampleTestingParameters
  },
  results: {
    totalDefects: 5,
    criticalDefects: 1,
    summary: 'Inspection completed with 5 defects detected'
  },
  defects: [
    {
      position: 25.5,
      severity: 'high',
      description: 'Critical defect at weld joint'
    }
  ],
  conclusion: 'Further investigation required for critical defect',
  recommendations: [
    'Schedule repair for critical defect',
    'Re-inspect after repair'
  ]
};

export const exampleReport: Report = {
  id: 'report-1',
  sessionId: 'session-1',
  reportType: 'standard',
  standard: 'ASME',
  content: exampleReportContent,
  pdfUrl: 'https://storage.example.com/reports/report-1.pdf',
  generatedBy: 'user-1',
  generatedAt: new Date(),
  createdAt: new Date()
};

export const examplePendingSyncItem: PendingSyncItem = {
  id: 1,
  type: 'session',
  data: exampleTestingSession,
  timestamp: new Date(),
  retryCount: 0
};

// ============================================================================
// Raw Database Type Examples
// ============================================================================

export const exampleDbProfile: DbProfile = {
  id: 'user-1',
  username: 'john.doe',
  full_name: 'John Doe',
  role: 'operator',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const exampleDbTestingSession: DbTestingSession = {
  id: 'session-1',
  project_name: 'Pipeline Inspection',
  operator_id: 'user-1',
  start_time: new Date().toISOString(),
  end_time: undefined,
  status: 'running',
  parameters: exampleTestingParameters,
  metadata: { location: 'Site A' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// ============================================================================
// Utility Type Examples
// ============================================================================

export const examplePaginatedResult: PaginatedResult<SignalData> = {
  data: [exampleSignalData],
  total: 100,
  page: 1,
  pageSize: 10,
  totalPages: 10
};

export const exampleApiResponse: ApiResponse<TestingSession> = {
  success: true,
  data: exampleTestingSession,
  timestamp: new Date()
};

export const exampleApiErrorResponse: ApiResponse<never> = {
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid parameters',
    details: { field: 'gain', value: 150 }
  },
  timestamp: new Date()
};

export const exampleDataState: DataState<TestingSession> = {
  data: exampleTestingSession,
  isLoading: false,
  error: null,
  lastUpdated: new Date()
};

export const exampleValidationResult: ValidationResult = {
  isValid: false,
  errors: [
    {
      field: 'gain',
      message: 'Gain must be between 0 and 100',
      code: 'OUT_OF_RANGE'
    }
  ]
};

export const exampleOperationResult: OperationResult<string> = {
  success: true,
  data: 'session-1'
};

export const exampleQueryParams: QueryParams = {
  page: 1,
  pageSize: 20,
  sort: {
    field: 'startTime',
    direction: 'desc'
  },
  filters: [
    {
      field: 'status',
      operator: 'eq',
      value: 'completed'
    }
  ],
  search: 'pipeline'
};

export const exampleTimeRange: TimeRange = {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
};

export const examplePoint: Point = {
  x: 100,
  y: 50
};

export const exampleRectangle: Rectangle = {
  x: 0,
  y: 0,
  width: 200,
  height: 100
};

export const exampleNotificationMessage: NotificationMessage = {
  id: 'notif-1',
  type: 'success',
  title: 'Session Saved',
  message: 'Testing session has been saved successfully',
  duration: 5000,
  timestamp: new Date()
};

export const exampleFileInfo: FileInfo = {
  name: 'report.pdf',
  size: 1024000,
  type: 'application/pdf',
  lastModified: new Date(),
  url: 'https://storage.example.com/reports/report.pdf'
};

export const exampleExportOptions: ExportOptions = {
  format: 'csv',
  filename: 'signal-data-export',
  includeHeaders: true,
  dateFormat: 'YYYY-MM-DD HH:mm:ss'
};

export const exampleChartDataPoint: ChartDataPoint = {
  x: Date.now(),
  y: 1.5,
  label: 'Signal Peak'
};

export const exampleChartConfig: ChartConfig = {
  title: 'Magnetic Signal Waveform',
  xAxisLabel: 'Time (ms)',
  yAxisLabel: 'Amplitude (V)',
  showGrid: true,
  showLegend: true,
  colors: ['#00FF00', '#FFD700']
};

// ============================================================================
// Enum Usage Examples
// ============================================================================

export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRoleEnum.OPERATOR:
      return 'Operator';
    case UserRoleEnum.ENGINEER:
      return 'Engineer';
    case UserRoleEnum.ADMIN:
      return 'Administrator';
    default:
      return 'Unknown';
  }
}

export function getStatusColor(status: TestingStatus): string {
  switch (status) {
    case TestingStatusEnum.RUNNING:
      return '#4CAF50';
    case TestingStatusEnum.PAUSED:
      return '#FFC107';
    case TestingStatusEnum.COMPLETED:
      return '#2196F3';
    case TestingStatusEnum.ERROR:
      return '#F44336';
    default:
      return '#666666';
  }
}

export function getSeverityPriority(severity: DefectSeverity): number {
  switch (severity) {
    case DefectSeverityEnum.LOW:
      return 1;
    case DefectSeverityEnum.MEDIUM:
      return 2;
    case DefectSeverityEnum.HIGH:
      return 3;
    case DefectSeverityEnum.CRITICAL:
      return 4;
    default:
      return 0;
  }
}

export function getFilterLabel(filter: FilterType): string {
  switch (filter) {
    case FilterTypeEnum.NONE:
      return 'No Filter';
    case FilterTypeEnum.LOWPASS:
      return 'Low Pass';
    case FilterTypeEnum.HIGHPASS:
      return 'High Pass';
    case FilterTypeEnum.BANDPASS:
      return 'Band Pass';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// Type Guard Examples
// ============================================================================

export function isValidSignalData(data: unknown): data is SignalData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'timestamp' in data &&
    'amplitude' in data &&
    'position' in data
  );
}

export function isCompleteSession(
  session: TestingSession | CompleteSessionData
): session is CompleteSessionData {
  return 'signalData' in session && 'defects' in session;
}

export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

// ============================================================================
// Type Conversion Examples
// ============================================================================

export function dbProfileToProfile(dbProfile: DbProfile): Profile {
  return {
    id: dbProfile.id,
    username: dbProfile.username,
    fullName: dbProfile.full_name,
    role: dbProfile.role,
    createdAt: new Date(dbProfile.created_at),
    updatedAt: new Date(dbProfile.updated_at)
  };
}

export function profileToDbProfile(profile: Partial<Profile>): Partial<DbProfile> {
  return {
    id: profile.id,
    username: profile.username,
    full_name: profile.fullName,
    role: profile.role,
    created_at: profile.createdAt?.toISOString(),
    updated_at: profile.updatedAt?.toISOString()
  };
}

export function dbSessionToSession(dbSession: DbTestingSession): TestingSession {
  return {
    id: dbSession.id,
    projectName: dbSession.project_name,
    operatorId: dbSession.operator_id,
    startTime: new Date(dbSession.start_time),
    endTime: dbSession.end_time ? new Date(dbSession.end_time) : undefined,
    status: dbSession.status,
    parameters: dbSession.parameters as TestingParameters,
    metadata: dbSession.metadata,
    createdAt: new Date(dbSession.created_at),
    updatedAt: new Date(dbSession.updated_at)
  };
}

export function sessionToDbSession(
  session: Partial<TestingSession>
): Partial<DbTestingSession> {
  return {
    id: session.id,
    project_name: session.projectName,
    operator_id: session.operatorId,
    start_time: session.startTime?.toISOString(),
    end_time: session.endTime?.toISOString(),
    status: session.status,
    parameters: session.parameters as unknown as Record<string, unknown>,
    metadata: session.metadata,
    created_at: session.createdAt?.toISOString(),
    updated_at: session.updatedAt?.toISOString()
  };
}
