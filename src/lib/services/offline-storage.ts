/**
 * Offline Storage Service
 * Manages offline data storage and retrieval using IndexedDB
 */

import { db, type OfflineSession, type PendingSyncItem } from './offline-db';
import type { TestingSession, SignalData, Defect, CalibrationData } from '$lib/types';

export class OfflineStorageService {
	/**
	 * Save a testing session to offline storage
	 */
	async saveSession(session: TestingSession): Promise<void> {
		const offlineSession: OfflineSession = {
			...session,
			syncStatus: 'pending'
		};

		await db.sessions.put(offlineSession);

		// Add to sync queue
		await this.addToSyncQueue({
			type: 'session',
			action: 'create',
			data: session,
			timestamp: Date.now(),
			retryCount: 0,
			sessionId: session.id
		});
	}

	/**
	 * Update a testing session in offline storage
	 */
	async updateSession(sessionId: string, updates: Partial<TestingSession>): Promise<void> {
		await db.sessions.update(sessionId, updates);

		// Add to sync queue
		await this.addToSyncQueue({
			type: 'session',
			action: 'update',
			data: { id: sessionId, ...updates },
			timestamp: Date.now(),
			retryCount: 0,
			sessionId
		});
	}

	/**
	 * Get a session from offline storage
	 */
	async getSession(sessionId: string): Promise<OfflineSession | undefined> {
		return await db.sessions.get(sessionId);
	}

	/**
	 * Get all sessions from offline storage
	 */
	async getAllSessions(): Promise<OfflineSession[]> {
		return await db.sessions.toArray();
	}

	/**
	 * Save signal data to offline storage
	 */
	async saveSignalData(sessionId: string, data: SignalData[]): Promise<void> {
		const dataWithSession = data.map((d) => ({
			...d,
			sessionId
		}));

		await db.signalData.bulkAdd(dataWithSession);

		// Add to sync queue (batch)
		await this.addToSyncQueue({
			type: 'signal_data',
			action: 'create',
			data: dataWithSession,
			timestamp: Date.now(),
			retryCount: 0,
			sessionId
		});
	}

	/**
	 * Get signal data for a session
	 */
	async getSignalData(sessionId: string): Promise<SignalData[]> {
		return await db.signalData.where('sessionId').equals(sessionId).toArray();
	}

	/**
	 * Save a defect to offline storage
	 */
	async saveDefect(sessionId: string, defect: Defect): Promise<void> {
		await db.defects.put({
			...defect,
			sessionId
		});

		// Add to sync queue
		await this.addToSyncQueue({
			type: 'defect',
			action: 'create',
			data: { ...defect, sessionId },
			timestamp: Date.now(),
			retryCount: 0,
			sessionId
		});
	}

	/**
	 * Get defects for a session
	 */
	async getDefects(sessionId: string): Promise<Defect[]> {
		return await db.defects.where('sessionId').equals(sessionId).toArray();
	}

	/**
	 * Save calibration data to offline storage
	 */
	async saveCalibration(calibration: CalibrationData): Promise<void> {
		await db.calibrations.put(calibration);

		// Add to sync queue
		await this.addToSyncQueue({
			type: 'calibration',
			action: 'create',
			data: calibration,
			timestamp: Date.now(),
			retryCount: 0
		});
	}

	/**
	 * Get the latest calibration
	 */
	async getLatestCalibration(): Promise<CalibrationData | undefined> {
		return await db.calibrations
			.where('isActive')
			.equals(1)
			.reverse()
			.sortBy('calibrationDate')
			.then((calibrations) => calibrations[0]);
	}

	/**
	 * Add an item to the sync queue
	 */
	private async addToSyncQueue(item: Omit<PendingSyncItem, 'id'>): Promise<void> {
		await db.pendingSync.add(item as PendingSyncItem);
	}

	/**
	 * Get all pending sync items
	 */
	async getPendingSyncItems(): Promise<PendingSyncItem[]> {
		return await db.pendingSync.orderBy('timestamp').toArray();
	}

	/**
	 * Remove a sync item after successful sync
	 */
	async removeSyncItem(id: number): Promise<void> {
		await db.pendingSync.delete(id);
	}

	/**
	 * Update sync item retry count
	 */
	async updateSyncItemRetry(id: number): Promise<void> {
		const item = await db.pendingSync.get(id);
		if (item) {
			await db.pendingSync.update(id, {
				retryCount: item.retryCount + 1
			});
		}
	}

	/**
	 * Mark session as synced
	 */
	async markSessionSynced(sessionId: string): Promise<void> {
		await db.sessions.update(sessionId, {
			syncStatus: 'synced'
		});
	}

	/**
	 * Mark session sync as error
	 */
	async markSessionSyncError(sessionId: string, error: string): Promise<void> {
		await db.sessions.update(sessionId, {
			syncStatus: 'error',
			syncError: error,
			lastSyncAttempt: Date.now()
		});
	}

	/**
	 * Get storage usage statistics
	 */
	async getStorageStats(): Promise<{
		sessionsCount: number;
		signalDataCount: number;
		defectsCount: number;
		pendingSyncCount: number;
		storageUsage: number;
		storageQuota: number;
	}> {
		const [sessionsCount, signalDataCount, defectsCount, pendingSyncCount, estimate] =
			await Promise.all([
				db.sessions.count(),
				db.signalData.count(),
				db.defects.count(),
				db.pendingSync.count(),
				db.getStorageEstimate()
			]);

		return {
			sessionsCount,
			signalDataCount,
			defectsCount,
			pendingSyncCount,
			storageUsage: estimate.usage,
			storageQuota: estimate.quota
		};
	}

	/**
	 * Clear old synced data to free up space
	 */
	async clearSyncedData(olderThanDays: number = 7): Promise<void> {
		const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

		// Get synced sessions older than cutoff
		const oldSessions = await db.sessions
			.where('syncStatus')
			.equals('synced')
			.and((session) => session.startTime.getTime() < cutoffTime)
			.toArray();

		// Delete sessions and related data
		for (const session of oldSessions) {
			await db.signalData.where('sessionId').equals(session.id).delete();
			await db.defects.where('sessionId').equals(session.id).delete();
			await db.sessions.delete(session.id);
		}
	}
}

// Singleton instance
export const offlineStorage = new OfflineStorageService();
