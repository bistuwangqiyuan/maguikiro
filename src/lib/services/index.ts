/**
 * Services Index
 * 
 * Central export point for all service modules
 */

export { supabaseService, getSupabaseClient, SupabaseService } from './supabase';
export { SignalGenerator } from './signal-generator';
export { DataAcquisitionService } from './data-acquisition';
export type { DataAcquisitionConfig, DataCallback } from './data-acquisition';
export { SignalProcessor, createSignalProcessor } from './signal-processor';
export { ReportGenerator, createReportGenerator } from './report-generator';
export type { ReportGenerationConfig } from './report-generator';
export { ReportExportService, reportExportService } from './report-export';
export type { ReportExportOptions, ReportExportResult } from './report-export';
export * from './report-templates';
export { db, AppDatabase } from './offline-db';
export type { PendingSyncItem, OfflineSession } from './offline-db';
export { offlineStorage, OfflineStorageService } from './offline-storage';
export {
	networkStatus,
	isOffline,
	isSlowConnection,
	networkManager,
	NetworkStatusManager,
	checkNetworkConnectivity,
	waitForNetwork
} from './network-status';
export type { NetworkStatus } from './network-status';
