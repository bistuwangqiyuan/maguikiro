/**
 * Offline Storage Example Usage
 * 
 * This file demonstrates how to use the offline storage service
 * in various scenarios.
 */

import { offlineStorage } from '../offline-storage';
import { networkManager, waitForNetwork } from '../network-status';
import type { TestingSession, SignalData, Defect } from '$lib/types';

/**
 * Example 1: Save a testing session offline
 */
export async function example1_SaveSessionOffline() {
	const session: TestingSession = {
		id: crypto.randomUUID(),
		projectName: 'Offline Test Project',
		operator: 'user-123',
		startTime: Date.now(),
		status: 'running',
		parameters: {
			gain: 60,
			filter: 'bandpass',
			velocity: 100,
			threshold: 0.5,
			gateA: {
				enabled: true,
				start: 0,
				width: 100,
				height: 50,
				alarmThreshold: 0.8,
				color: '#FFD700'
			},
			gateB: {
				enabled: false,
				start: 0,
				width: 0,
				height: 0,
				alarmThreshold: 0,
				color: '#FF69B4'
			}
		}
	};

	// Save session to offline storage
	await offlineStorage.saveSession(session);
	console.log('Session saved offline:', session.id);

	// Retrieve it back
	const retrieved = await offlineStorage.getSession(session.id);
	console.log('Retrieved session:', retrieved);
}

/**
 * Example 2: Save signal data in batches
 */
export async function example2_SaveSignalDataBatch() {
	const sessionId = 'session-123';
	const batchSize = 100;
	const totalPoints = 1000;

	// Generate and save signal data in batches
	for (let i = 0; i < totalPoints; i += batchSize) {
		const batch: SignalData[] = [];

		for (let j = 0; j < batchSize && i + j < totalPoints; j++) {
			batch.push({
				timestamp: Date.now() + (i + j) * 10,
				amplitude: Math.sin((i + j) * 0.1) + Math.random() * 0.1,
				phase: Math.cos((i + j) * 0.1),
				position: (i + j) * 0.1,
				frequency: 100
			});
		}

		await offlineStorage.saveSignalData(sessionId, batch);
		console.log(`Saved batch ${i / batchSize + 1}, ${batch.length} points`);
	}

	// Get all signal data for the session
	const allData = await offlineStorage.getSignalData(sessionId);
	console.log(`Total signal data points: ${allData.length}`);
}

/**
 * Example 3: Save defects detected during testing
 */
export async function example3_SaveDefects() {
	const sessionId = 'session-123';

	const defects: Defect[] = [
		{
			id: crypto.randomUUID(),
			position: 10.5,
			amplitude: 2.5,
			severity: 'high',
			gateTriggered: 'A',
			timestamp: new Date(),
			notes: 'Large amplitude spike detected'
		},
		{
			id: crypto.randomUUID(),
			position: 25.3,
			amplitude: 1.8,
			severity: 'medium',
			gateTriggered: 'A',
			timestamp: new Date(),
			notes: 'Moderate defect indication'
		}
	];

	// Save each defect
	for (const defect of defects) {
		await offlineStorage.saveDefect(sessionId, defect);
		console.log(`Saved defect at position ${defect.position}`);
	}

	// Retrieve all defects for the session
	const savedDefects = await offlineStorage.getDefects(sessionId);
	console.log(`Total defects: ${savedDefects.length}`);
}

/**
 * Example 4: Check network status and handle offline mode
 */
export async function example4_HandleOfflineMode() {
	const session: TestingSession = {
		id: crypto.randomUUID(),
		projectName: 'Network-Aware Test',
		operator: 'user-123',
		startTime: Date.now(),
		status: 'running',
		parameters: {} as any
	};

	// Check if online
	if (networkManager.isOnline()) {
		console.log('Online: Saving to server...');
		// In real app, would save to Supabase
		// await supabaseService.createSession(session);
	} else {
		console.log('Offline: Saving locally...');
		await offlineStorage.saveSession(session);
	}

	// Listen for network status changes
	const unsubscribe = networkManager.addListener((online) => {
		if (online) {
			console.log('Network restored! Starting sync...');
			// Trigger sync process
		} else {
			console.log('Network lost! Switching to offline mode...');
		}
	});

	// Clean up listener when done
	// unsubscribe();
}

/**
 * Example 5: Monitor storage usage
 */
export async function example5_MonitorStorage() {
	const stats = await offlineStorage.getStorageStats();

	console.log('Storage Statistics:');
	console.log(`- Sessions: ${stats.sessionsCount}`);
	console.log(`- Signal Data Points: ${stats.signalDataCount.toLocaleString()}`);
	console.log(`- Defects: ${stats.defectsCount}`);
	console.log(`- Pending Sync: ${stats.pendingSyncCount}`);

	const usageMB = (stats.storageUsage / (1024 * 1024)).toFixed(2);
	const quotaMB = (stats.storageQuota / (1024 * 1024)).toFixed(2);
	const usagePercent = ((stats.storageUsage / stats.storageQuota) * 100).toFixed(1);

	console.log(`\nStorage Usage: ${usageMB} MB / ${quotaMB} MB (${usagePercent}%)`);

	// Warn if storage is getting full
	if (parseFloat(usagePercent) > 80) {
		console.warn('Warning: Storage usage is above 80%!');
		console.log('Consider clearing old synced data...');

		// Clear data older than 7 days
		await offlineStorage.clearSyncedData(7);
		console.log('Old data cleared');
	}
}

/**
 * Example 6: Handle sync queue
 */
export async function example6_ProcessSyncQueue() {
	// Get all pending sync items
	const pendingItems = await offlineStorage.getPendingSyncItems();
	console.log(`Processing ${pendingItems.length} pending items...`);

	for (const item of pendingItems) {
		try {
			console.log(`Syncing ${item.type} (${item.action})...`);

			// In real app, would sync to Supabase based on type
			switch (item.type) {
				case 'session':
					// await supabaseService.createSession(item.data);
					break;
				case 'signal_data':
					// await supabaseService.saveSignalData(item.sessionId, item.data);
					break;
				case 'defect':
					// await supabaseService.saveDefect(item.data);
					break;
			}

			// Remove from sync queue on success
			await offlineStorage.removeSyncItem(item.id!);
			console.log(`✓ Synced ${item.type}`);

			// Mark session as synced if this was the last item
			if (item.sessionId) {
				const remaining = await offlineStorage
					.getPendingSyncItems()
					.then((items) => items.filter((i) => i.sessionId === item.sessionId));

				if (remaining.length === 0) {
					await offlineStorage.markSessionSynced(item.sessionId);
					console.log(`✓ Session ${item.sessionId} fully synced`);
				}
			}
		} catch (error) {
			console.error(`✗ Failed to sync ${item.type}:`, error);

			// Update retry count
			await offlineStorage.updateSyncItemRetry(item.id!);

			// Mark as error if too many retries
			if (item.retryCount >= 3 && item.sessionId) {
				await offlineStorage.markSessionSyncError(
					item.sessionId,
					`Failed after ${item.retryCount} retries`
				);
			}
		}
	}
}

/**
 * Example 7: Wait for network and sync
 */
export async function example7_WaitForNetworkAndSync() {
	console.log('Waiting for network connection...');

	// Wait up to 30 seconds for network
	const isOnline = await waitForNetwork(30000);

	if (isOnline) {
		console.log('Network available! Starting sync...');
		await example6_ProcessSyncQueue();
	} else {
		console.log('Network timeout. Will retry later.');
	}
}

/**
 * Example 8: Complete offline workflow
 */
export async function example8_CompleteOfflineWorkflow() {
	console.log('=== Starting Offline Workflow ===\n');

	// 1. Create a new session
	const session: TestingSession = {
		id: crypto.randomUUID(),
		projectName: 'Complete Offline Test',
		operator: 'user-123',
		startTime: Date.now(),
		status: 'running',
		parameters: {} as any
	};

	await offlineStorage.saveSession(session);
	console.log('1. Session created:', session.id);

	// 2. Generate and save signal data
	const signalData: SignalData[] = Array.from({ length: 100 }, (_, i) => ({
		timestamp: Date.now() + i * 10,
		amplitude: Math.sin(i * 0.1),
		phase: Math.cos(i * 0.1),
		position: i * 0.1,
		frequency: 100
	}));

	await offlineStorage.saveSignalData(session.id, signalData);
	console.log('2. Signal data saved:', signalData.length, 'points');

	// 3. Detect and save defects
	const defect: Defect = {
		id: crypto.randomUUID(),
		position: 5.5,
		amplitude: 2.0,
		severity: 'high',
		gateTriggered: 'A',
		timestamp: new Date()
	};

	await offlineStorage.saveDefect(session.id, defect);
	console.log('3. Defect saved at position', defect.position);

	// 4. Update session status
	await offlineStorage.updateSession(session.id, {
		status: 'completed',
		endTime: Date.now()
	});
	console.log('4. Session completed');

	// 5. Check storage stats
	const stats = await offlineStorage.getStorageStats();
	console.log('\n5. Storage Stats:');
	console.log(`   - Pending sync items: ${stats.pendingSyncCount}`);
	console.log(`   - Total sessions: ${stats.sessionsCount}`);
	console.log(`   - Total signal points: ${stats.signalDataCount}`);

	// 6. Simulate network recovery and sync
	if (networkManager.isOnline()) {
		console.log('\n6. Network available, syncing...');
		await example6_ProcessSyncQueue();
	} else {
		console.log('\n6. Offline - data will sync when network is available');
	}

	console.log('\n=== Workflow Complete ===');
}

/**
 * Run all examples
 */
export async function runAllExamples() {
	try {
		console.log('Running Offline Storage Examples...\n');

		await example1_SaveSessionOffline();
		console.log('\n---\n');

		await example2_SaveSignalDataBatch();
		console.log('\n---\n');

		await example3_SaveDefects();
		console.log('\n---\n');

		await example4_HandleOfflineMode();
		console.log('\n---\n');

		await example5_MonitorStorage();
		console.log('\n---\n');

		await example8_CompleteOfflineWorkflow();

		console.log('\nAll examples completed!');
	} catch (error) {
		console.error('Error running examples:', error);
	}
}
