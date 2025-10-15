/**
 * Network Status Service
 * Detects and monitors network connectivity
 */

import { writable, derived } from 'svelte/store';

export interface NetworkStatus {
	online: boolean;
	effectiveType?: string;
	downlink?: number;
	rtt?: number;
	saveData?: boolean;
}

/**
 * Create a network status store
 */
function createNetworkStatusStore() {
	const { subscribe, set } = writable<NetworkStatus>({
		online: typeof navigator !== 'undefined' ? navigator.onLine : true
	});

	// Update network status
	const updateStatus = () => {
		const status: NetworkStatus = {
			online: navigator.onLine
		};

		// Get connection info if available
		if ('connection' in navigator) {
			const connection = (navigator as any).connection;
			if (connection) {
				status.effectiveType = connection.effectiveType;
				status.downlink = connection.downlink;
				status.rtt = connection.rtt;
				status.saveData = connection.saveData;
			}
		}

		set(status);
	};

	// Listen for online/offline events
	if (typeof window !== 'undefined') {
		window.addEventListener('online', updateStatus);
		window.addEventListener('offline', updateStatus);

		// Listen for connection changes
		if ('connection' in navigator) {
			const connection = (navigator as any).connection;
			if (connection) {
				connection.addEventListener('change', updateStatus);
			}
		}

		// Initial update
		updateStatus();
	}

	return {
		subscribe,
		refresh: updateStatus
	};
}

export const networkStatus = createNetworkStatusStore();

/**
 * Derived store for offline mode
 */
export const isOffline = derived(networkStatus, ($status) => !$status.online);

/**
 * Derived store for slow connection
 */
export const isSlowConnection = derived(networkStatus, ($status) => {
	if (!$status.online) return false;
	if ($status.effectiveType === 'slow-2g' || $status.effectiveType === '2g') return true;
	if ($status.downlink && $status.downlink < 0.5) return true;
	return false;
});

/**
 * Check if network is available by pinging a server
 */
export async function checkNetworkConnectivity(url: string = '/api/health'): Promise<boolean> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(url, {
			method: 'HEAD',
			signal: controller.signal,
			cache: 'no-cache'
		});

		clearTimeout(timeoutId);
		return response.ok;
	} catch (error) {
		return false;
	}
}

/**
 * Wait for network to be available
 */
export function waitForNetwork(timeoutMs: number = 30000): Promise<boolean> {
	return new Promise((resolve) => {
		if (navigator.onLine) {
			resolve(true);
			return;
		}

		const timeout = setTimeout(() => {
			cleanup();
			resolve(false);
		}, timeoutMs);

		const handleOnline = () => {
			cleanup();
			resolve(true);
		};

		const cleanup = () => {
			clearTimeout(timeout);
			window.removeEventListener('online', handleOnline);
		};

		window.addEventListener('online', handleOnline);
	});
}

/**
 * Network status manager class
 */
export class NetworkStatusManager {
	private listeners: Set<(online: boolean) => void> = new Set();

	constructor() {
		if (typeof window !== 'undefined') {
			window.addEventListener('online', () => this.notifyListeners(true));
			window.addEventListener('offline', () => this.notifyListeners(false));
		}
	}

	/**
	 * Check if currently online
	 */
	isOnline(): boolean {
		return typeof navigator !== 'undefined' ? navigator.onLine : true;
	}

	/**
	 * Add a listener for network status changes
	 */
	addListener(callback: (online: boolean) => void): () => void {
		this.listeners.add(callback);
		return () => this.listeners.delete(callback);
	}

	/**
	 * Notify all listeners of status change
	 */
	private notifyListeners(online: boolean): void {
		this.listeners.forEach((listener) => listener(online));
	}

	/**
	 * Test actual connectivity (not just browser status)
	 */
	async testConnectivity(url?: string): Promise<boolean> {
		return checkNetworkConnectivity(url);
	}
}

// Singleton instance
export const networkManager = new NetworkStatusManager();
