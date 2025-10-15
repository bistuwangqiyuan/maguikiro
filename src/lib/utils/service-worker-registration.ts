import { Workbox } from 'workbox-window';

let wb: Workbox | null = null;

export interface ServiceWorkerStatus {
	isSupported: boolean;
	isRegistered: boolean;
	isOnline: boolean;
	needsUpdate: boolean;
}

// Extend Navigator interface for TypeScript
declare global {
	interface Navigator {
		onLine: boolean;
	}
	interface ServiceWorkerRegistration {
		sync?: SyncManager;
	}
	interface SyncManager {
		register(tag: string): Promise<void>;
	}
}

// Callback types
type StatusCallback = (status: ServiceWorkerStatus) => void;
type SyncCallback = () => void;

let statusCallback: StatusCallback | null = null;
let syncCallback: SyncCallback | null = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<void> {
	const isOnlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;
	
	if (!('serviceWorker' in navigator)) {
		console.warn('[SW Registration] Service Workers are not supported');
		notifyStatus({
			isSupported: false,
			isRegistered: false,
			isOnline: isOnlineNow,
			needsUpdate: false
		});
		return;
	}

	try {
		wb = new Workbox('/service-worker.js');

		// Listen for waiting service worker
		wb.addEventListener('waiting', () => {
			console.log('[SW Registration] New service worker waiting');
			notifyStatus({
				isSupported: true,
				isRegistered: true,
				isOnline: navigator.onLine,
				needsUpdate: true
			});
		});

		// Listen for controlling service worker change
		wb.addEventListener('controlling', () => {
			console.log('[SW Registration] Service worker is now controlling');
			window.location.reload();
		});

		// Listen for messages from service worker
		navigator.serviceWorker.addEventListener('message', (event) => {
			if (event.data && event.data.type === 'SYNC_AVAILABLE') {
				console.log('[SW Registration] Sync available');
				if (syncCallback) {
					syncCallback();
				}
			}
		});

		// Register the service worker
		await wb.register();

		console.log('[SW Registration] Service worker registered successfully');
		notifyStatus({
			isSupported: true,
			isRegistered: true,
			isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
			needsUpdate: false
		});

		// Listen for online/offline events
		window.addEventListener('online', () => {
			console.log('[SW Registration] Network online');
			notifyStatus({
				isSupported: true,
				isRegistered: true,
				isOnline: true,
				needsUpdate: false
			});
			
			// Trigger background sync when coming back online
			if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
				navigator.serviceWorker.ready.then((registration) => {
					if (registration.sync) {
						return registration.sync.register('sync-testing-data');
					}
				}).catch((error) => {
					console.error('[SW Registration] Background sync failed:', error);
					if (syncCallback) {
						syncCallback();
					}
				});
			} else if (syncCallback) {
				// Fallback if background sync is not supported
				syncCallback();
			}
		});

		window.addEventListener('offline', () => {
			console.log('[SW Registration] Network offline');
			notifyStatus({
				isSupported: true,
				isRegistered: true,
				isOnline: false,
				needsUpdate: false
			});
		});
	} catch (error) {
		console.error('[SW Registration] Registration failed:', error);
		notifyStatus({
			isSupported: true,
			isRegistered: false,
			isOnline: navigator.onLine,
			needsUpdate: false
		});
	}
}

/**
 * Update the service worker to the latest version
 */
export async function updateServiceWorker(): Promise<void> {
	if (!wb) {
		console.warn('[SW Registration] Workbox not initialized');
		return;
	}

	// Send skip waiting message to the waiting service worker
	wb.messageSkipWaiting();
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
	return 'serviceWorker' in navigator;
}

/**
 * Get current online status
 */
export function isOnline(): boolean {
	return navigator.onLine;
}

/**
 * Subscribe to service worker status changes
 */
export function onStatusChange(callback: StatusCallback): () => void {
	statusCallback = callback;
	
	// Immediately notify with current status
	notifyStatus({
		isSupported: isServiceWorkerSupported(),
		isRegistered: wb !== null,
		isOnline: navigator.onLine,
		needsUpdate: false
	});
	
	// Return unsubscribe function
	return () => {
		statusCallback = null;
	};
}

/**
 * Subscribe to sync events
 */
export function onSyncAvailable(callback: SyncCallback): () => void {
	syncCallback = callback;
	
	// Return unsubscribe function
	return () => {
		syncCallback = null;
	};
}

/**
 * Notify status callback
 */
function notifyStatus(status: ServiceWorkerStatus): void {
	if (statusCallback) {
		statusCallback(status);
	}
}

/**
 * Unregister the service worker (for development/testing)
 */
export async function unregisterServiceWorker(): Promise<void> {
	if (!('serviceWorker' in navigator)) {
		return;
	}

	try {
		const registrations = await navigator.serviceWorker.getRegistrations();
		for (const registration of registrations) {
			await registration.unregister();
		}
		console.log('[SW Registration] Service worker unregistered');
	} catch (error) {
		console.error('[SW Registration] Unregistration failed:', error);
	}
}
