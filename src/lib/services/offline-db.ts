/**
 * IndexedDB Database for Offline Storage
 * Uses Dexie.js for simplified IndexedDB operations
 */

import Dexie, { type Table } from 'dexie';
import type { TestingSession, SignalData, Defect, CalibrationData } from '$lib/types';

/**
 * Pending sync item for offline data synchronization
 */
export interface PendingSyncItem {
	id?: number;
	type: 'session' | 'signal_data' | 'defect' | 'calibration';
	action: 'create' | 'update' | 'delete';
	data: any;
	timestamp: number;
	retryCount: number;
	sessionId?: string;
}

/**
 * Offline session metadata
 */
export interface OfflineSession extends TestingSession {
	syncStatus: 'pending' | 'synced' | 'error';
	lastSyncAttempt?: number;
	syncError?: string;
}

/**
 * Main application database using Dexie
 */
export class AppDatabase extends Dexie {
	// Tables
	sessions!: Table<OfflineSession, string>;
	signalData!: Table<SignalData & { sessionId: string }, number>;
	defects!: Table<Defect & { sessionId: string }, string>;
	calibrations!: Table<CalibrationData, string>;
	pendingSync!: Table<PendingSyncItem, number>;

	constructor() {
		super('MagneticTestingDB');

		// Define database schema
		this.version(1).stores({
			sessions: 'id, startTime, status, syncStatus, operator',
			signalData: '++id, sessionId, timestamp, position',
			defects: 'id, sessionId, position, severity, timestamp',
			calibrations: 'id, calibrationDate, isActive',
			pendingSync: '++id, type, timestamp, sessionId'
		});
	}

	/**
	 * Clear all data from the database
	 */
	async clearAll(): Promise<void> {
		await this.sessions.clear();
		await this.signalData.clear();
		await this.defects.clear();
		await this.calibrations.clear();
		await this.pendingSync.clear();
	}

	/**
	 * Get database size estimate
	 */
	async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
		if ('storage' in navigator && 'estimate' in navigator.storage) {
			const estimate = await navigator.storage.estimate();
			return {
				usage: estimate.usage || 0,
				quota: estimate.quota || 0
			};
		}
		return { usage: 0, quota: 0 };
	}
}

// Singleton instance
export const db = new AppDatabase();
