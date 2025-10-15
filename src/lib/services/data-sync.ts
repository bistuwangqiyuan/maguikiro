/**
 * Data Synchronization Service
 * Handles syncing offline data to Supabase when network is restored
 */

import { supabase } from './supabase';
import { offlineStorage } from './offline-storage';
import { networkManager } from './network-status';
import type { PendingSyncItem } from './offline-db';
import type { TestingSession, SignalData, Defect, CalibrationData } from '$lib/types';

export interface SyncProgress {
	total: number;
	completed: number;
	failed: number;
	current?: string;
}

export interface SyncResult {
	success: boolean;
	synced: number;
	failed: number;
	errors: Array<{ item: PendingSyncItem; error: string }>;
}

export interface SyncConflict {
	type: 'session' | 'signal_data' | 'defect' | 'calibration';
	localData: any;
	remoteData: any;
	timestamp: number;
}

/**
 * Data Synchronization Service
 */
export class DataSyncService {
	private isSyncing = false;
	private syncListeners: Set<(progress: SyncProgress) => void> = new Set();
	private autoSyncEnabled = true;
	private syncInterval: number | null = null;

	constructor() {
		this.setupNetworkListener();
	}

	/**
	 * Setup network status listener for auto-sync
	 */
	private setupNetworkListener(): void {
		networkManager.addListener(async (online) => {
			if (online && this.autoSyncEnabled && !this.isSyncing) {
				// Wait a bit to ensure connection is stable
				setTimeout(() => {
					this.syncAll().catch(console.error);
				}, 2000);
			}
		});
	}

	/**
	 * Enable auto-sync when network is restored
	 */
	enableAutoSync(): void {
		this.autoSyncEnabled = true;
	}

	/**
	 * Disable auto-sync
	 */
	disableAutoSync(): void {
		this.autoSyncEnabled = false;
	}

	/**
	 * Start periodic sync (for background sync)
	 */
	startPeriodicSync(intervalMs: number = 60000): void {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
		}

		this.syncInterval = window.setInterval(async () => {
			if (networkManager.isOnline() && !this.isSyncing) {
				await this.syncAll().catch(console.error);
			}
		}, intervalMs);
	}

	/**
	 * Stop periodic sync
	 */
	stopPeriodicSync(): void {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
			this.syncInterval = null;
		}
	}

	/**
	 * Add a sync progress listener
	 */
	addSyncListener(callback: (progress: SyncProgress) => void): () => void {
		this.syncListeners.add(callback);
		return () => this.syncListeners.delete(callback);
	}

	/**
	 * Notify all listeners of sync progress
	 */
	private notifyProgress(progress: SyncProgress): void {
		this.syncListeners.forEach((listener) => listener(progress));
	}

	/**
	 * Sync all pending items
	 */
	async syncAll(): Promise<SyncResult> {
		if (this.isSyncing) {
			throw new Error('Sync already in progress');
		}

		if (!networkManager.isOnline()) {
			throw new Error('Network is offline');
		}

		this.isSyncing = true;

		const result: SyncResult = {
			success: true,
			synced: 0,
			failed: 0,
			errors: []
		};

		try {
			// Get all pending sync items
			const pendingItems = await offlineStorage.getPendingSyncItems();

			if (pendingItems.length === 0) {
				return result;
			}

			const progress: SyncProgress = {
				total: pendingItems.length,
				completed: 0,
				failed: 0
			};

			this.notifyProgress(progress);

			// Group items by session for batch processing
			const itemsBySession = this.groupItemsBySession(pendingItems);

			// Sync each session's data
			for (const [sessionId, items] of itemsBySession.entries()) {
				try {
					await this.syncSessionData(sessionId, items);
					
					// Update progress
					progress.completed += items.length;
					result.synced += items.length;
					
					// Remove synced items from queue
					for (const item of items) {
						if (item.id) {
							await offlineStorage.removeSyncItem(item.id);
						}
					}

					// Mark session as synced
					if (sessionId) {
						await offlineStorage.markSessionSynced(sessionId);
					}
				} catch (error) {
					progress.failed += items.length;
					result.failed += items.length;
					result.success = false;

					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					
					// Record errors
					for (const item of items) {
						result.errors.push({ item, error: errorMessage });
						
						// Update retry count
						if (item.id) {
							await offlineStorage.updateSyncItemRetry(item.id);
						}
					}

					// Mark session sync error
					if (sessionId) {
						await offlineStorage.markSessionSyncError(sessionId, errorMessage);
					}
				}

				this.notifyProgress(progress);
			}
		} finally {
			this.isSyncing = false;
		}

		return result;
	}

	/**
	 * Group sync items by session ID
	 */
	private groupItemsBySession(items: PendingSyncItem[]): Map<string, PendingSyncItem[]> {
		const grouped = new Map<string, PendingSyncItem[]>();

		for (const item of items) {
			const key = item.sessionId || 'no-session';
			if (!grouped.has(key)) {
				grouped.set(key, []);
			}
			grouped.get(key)!.push(item);
		}

		return grouped;
	}

	/**
	 * Sync data for a specific session
	 */
	private async syncSessionData(sessionId: string, items: PendingSyncItem[]): Promise<void> {
		// Sort items by type and action to ensure proper order
		const sortedItems = this.sortSyncItems(items);

		for (const item of sortedItems) {
			await this.syncItem(item);
		}
	}

	/**
	 * Sort sync items to ensure proper sync order
	 * Order: session create/update -> signal_data -> defects -> calibrations
	 */
	private sortSyncItems(items: PendingSyncItem[]): PendingSyncItem[] {
		const typeOrder = { session: 0, signal_data: 1, defect: 2, calibration: 3 };
		const actionOrder = { create: 0, update: 1, delete: 2 };

		return items.sort((a, b) => {
			const typeCompare = typeOrder[a.type] - typeOrder[b.type];
			if (typeCompare !== 0) return typeCompare;
			return actionOrder[a.action] - actionOrder[b.action];
		});
	}

	/**
	 * Sync a single item
	 */
	private async syncItem(item: PendingSyncItem): Promise<void> {
		switch (item.type) {
			case 'session':
				await this.syncSession(item);
				break;
			case 'signal_data':
				await this.syncSignalData(item);
				break;
			case 'defect':
				await this.syncDefect(item);
				break;
			case 'calibration':
				await this.syncCalibration(item);
				break;
		}
	}

	/**
	 * Sync a testing session
	 */
	private async syncSession(item: PendingSyncItem): Promise<void> {
		const session = item.data as TestingSession;

		if (item.action === 'create') {
			// Check if session already exists (conflict detection)
			const { data: existing } = await supabase
				.from('testing_sessions')
				.select('id')
				.eq('id', session.id)
				.single();

			if (existing) {
				// Session already exists, update instead
				await this.updateSession(session);
			} else {
				// Create new session
				const { error } = await supabase.from('testing_sessions').insert({
					id: session.id,
					project_name: session.projectName,
					operator_id: session.operator,
					start_time: session.startTime.toISOString(),
					end_time: session.endTime?.toISOString(),
					status: session.status,
					parameters: session.parameters,
					metadata: session.metadata || {}
				});

				if (error) throw error;
			}
		} else if (item.action === 'update') {
			await this.updateSession(session);
		}
	}

	/**
	 * Update a testing session
	 */
	private async updateSession(session: Partial<TestingSession> & { id: string }): Promise<void> {
		const updates: any = {
			updated_at: new Date().toISOString()
		};

		if (session.projectName) updates.project_name = session.projectName;
		if (session.status) updates.status = session.status;
		if (session.endTime) updates.end_time = session.endTime.toISOString();
		if (session.parameters) updates.parameters = session.parameters;
		if (session.metadata) updates.metadata = session.metadata;

		const { error } = await supabase
			.from('testing_sessions')
			.update(updates)
			.eq('id', session.id);

		if (error) throw error;
	}

	/**
	 * Sync signal data (batch)
	 */
	private async syncSignalData(item: PendingSyncItem): Promise<void> {
		const signalData = item.data as (SignalData & { sessionId: string })[];

		if (!Array.isArray(signalData)) {
			throw new Error('Signal data must be an array');
		}

		// Batch insert signal data
		const records = signalData.map((data) => ({
			session_id: data.sessionId,
			timestamp: data.timestamp,
			amplitude: data.amplitude,
			phase: data.phase,
			position: data.position,
			frequency: data.frequency
		}));

		// Insert in chunks to avoid payload size limits
		const chunkSize = 1000;
		for (let i = 0; i < records.length; i += chunkSize) {
			const chunk = records.slice(i, i + chunkSize);
			const { error } = await supabase.from('signal_data').insert(chunk);
			if (error) throw error;
		}
	}

	/**
	 * Sync a defect record
	 */
	private async syncDefect(item: PendingSyncItem): Promise<void> {
		const defect = item.data as Defect & { sessionId: string };

		if (item.action === 'create') {
			const { error } = await supabase.from('defects').insert({
				id: defect.id,
				session_id: defect.sessionId,
				position: defect.position,
				amplitude: defect.amplitude,
				severity: defect.severity,
				gate_triggered: defect.gateTriggered,
				timestamp: defect.timestamp.toISOString(),
				notes: defect.notes
			});

			if (error) throw error;
		}
	}

	/**
	 * Sync calibration data
	 */
	private async syncCalibration(item: PendingSyncItem): Promise<void> {
		const calibration = item.data as CalibrationData;

		if (item.action === 'create') {
			const { error } = await supabase.from('calibrations').insert({
				id: calibration.id,
				operator_id: calibration.operatorId,
				calibration_type: calibration.calibrationType,
				reference_signal: calibration.referenceSignal,
				coefficients: calibration.coefficients,
				standard_block: calibration.standardBlock,
				calibration_date: calibration.calibrationDate.toISOString(),
				expiry_date: calibration.expiryDate?.toISOString(),
				is_active: calibration.isActive
			});

			if (error) throw error;
		}
	}

	/**
	 * Detect and resolve sync conflicts
	 */
	async detectConflicts(sessionId: string): Promise<SyncConflict[]> {
		const conflicts: SyncConflict[] = [];

		// Get local session
		const localSession = await offlineStorage.getSession(sessionId);
		if (!localSession) return conflicts;

		// Get remote session
		const { data: remoteSession } = await supabase
			.from('testing_sessions')
			.select('*')
			.eq('id', sessionId)
			.single();

		if (remoteSession) {
			// Compare timestamps to detect conflicts
			const localTime = localSession.startTime.getTime();
			const remoteTime = new Date(remoteSession.updated_at).getTime();

			if (Math.abs(localTime - remoteTime) > 1000) {
				// Timestamps differ by more than 1 second
				conflicts.push({
					type: 'session',
					localData: localSession,
					remoteData: remoteSession,
					timestamp: Date.now()
				});
			}
		}

		return conflicts;
	}

	/**
	 * Resolve a sync conflict by choosing local or remote data
	 */
	async resolveConflict(conflict: SyncConflict, useLocal: boolean): Promise<void> {
		if (useLocal) {
			// Force sync local data to remote
			const item: PendingSyncItem = {
				type: conflict.type,
				action: 'update',
				data: conflict.localData,
				timestamp: Date.now(),
				retryCount: 0,
				sessionId: conflict.localData.id
			};
			await this.syncItem(item);
		} else {
			// Use remote data, update local
			if (conflict.type === 'session') {
				const remoteSession = conflict.remoteData;
				const session: TestingSession = {
					id: remoteSession.id,
					projectName: remoteSession.project_name,
					operator: remoteSession.operator_id,
					startTime: new Date(remoteSession.start_time),
					endTime: remoteSession.end_time ? new Date(remoteSession.end_time) : undefined,
					status: remoteSession.status,
					parameters: remoteSession.parameters,
					metadata: remoteSession.metadata,
					signalData: [],
					defects: []
				};
				await offlineStorage.saveSession(session);
				await offlineStorage.markSessionSynced(session.id);
			}
		}
	}

	/**
	 * Get sync status
	 */
	async getSyncStatus(): Promise<{
		isSyncing: boolean;
		pendingCount: number;
		lastSyncTime?: number;
	}> {
		const stats = await offlineStorage.getStorageStats();
		return {
			isSyncing: this.isSyncing,
			pendingCount: stats.pendingSyncCount,
			lastSyncTime: undefined // Could be stored in localStorage
		};
	}

	/**
	 * Force sync now (manual trigger)
	 */
	async forceSyncNow(): Promise<SyncResult> {
		if (!networkManager.isOnline()) {
			throw new Error('Cannot sync while offline');
		}

		return await this.syncAll();
	}

	/**
	 * Clear all synced data older than specified days
	 */
	async clearOldData(days: number = 7): Promise<void> {
		await offlineStorage.clearSyncedData(days);
	}
}

// Singleton instance
export const dataSync = new DataSyncService();
