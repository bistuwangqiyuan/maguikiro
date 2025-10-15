/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Create a unique cache name for this version
const CACHE_NAME = `magnetic-testing-v${version}`;
const DATA_CACHE_NAME = `magnetic-testing-data-v${version}`;

// Combine build files and static files for precaching
const precacheList = [
	...build.map((file) => ({ url: file, revision: version })),
	...files.map((file) => ({ url: file, revision: version }))
];

// Precache all static assets
precacheAndRoute(precacheList);

// Cache API requests with NetworkFirst strategy
// This ensures we get fresh data when online, but fall back to cache when offline
registerRoute(
	({ url }) => url.pathname.startsWith('/api/') || url.origin.includes('supabase'),
	new NetworkFirst({
		cacheName: DATA_CACHE_NAME,
		networkTimeoutSeconds: 10,
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 5 * 60 // 5 minutes
			})
		]
	})
);

// Cache images with CacheFirst strategy
registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		cacheName: 'images',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
			})
		]
	})
);

// Cache CSS and JS with StaleWhileRevalidate
registerRoute(
	({ request }) =>
		request.destination === 'style' ||
		request.destination === 'script' ||
		request.destination === 'worker',
	new StaleWhileRevalidate({
		cacheName: 'assets',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
			})
		]
	})
);

// Cache fonts with CacheFirst strategy
registerRoute(
	({ request }) => request.destination === 'font',
	new CacheFirst({
		cacheName: 'fonts',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 30,
				maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
			})
		]
	})
);

// Handle navigation requests (HTML pages)
const navigationRoute = new NavigationRoute(
	new NetworkFirst({
		cacheName: 'pages',
		networkTimeoutSeconds: 3,
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 24 * 60 * 60 // 24 hours
			})
		]
	})
);
registerRoute(navigationRoute);

// Listen for skip waiting message
sw.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		sw.skipWaiting();
	}
});

// Background sync for offline data
sw.addEventListener('sync', (event: any) => {
	if (event.tag === 'sync-testing-data') {
		event.waitUntil(syncTestingData());
	}
});

// Function to sync offline testing data
async function syncTestingData(): Promise<void> {
	try {
		// This will be called when the network is available
		// The actual sync logic will be handled by the IndexedDB service
		console.log('[Service Worker] Background sync triggered');
		
		// Notify all clients that sync is available
		const clients = await sw.clients.matchAll();
		clients.forEach((client) => {
			client.postMessage({
				type: 'SYNC_AVAILABLE'
			});
		});
	} catch (error) {
		console.error('[Service Worker] Background sync failed:', error);
	}
}

// Install event
sw.addEventListener('install', (event) => {
	console.log('[Service Worker] Installing version:', version);
	// Force the waiting service worker to become the active service worker
	event.waitUntil(sw.skipWaiting());
});

// Activate event
sw.addEventListener('activate', (event) => {
	console.log('[Service Worker] Activating version:', version);
	
	event.waitUntil(
		(async () => {
			// Clean up old caches
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME && name !== DATA_CACHE_NAME)
					.map((name) => caches.delete(name))
			);
			
			// Take control of all clients immediately
			await sw.clients.claim();
		})()
	);
});

// Fetch event - let Workbox handle it
sw.addEventListener('fetch', (event) => {
	// Skip chrome extension requests
	if (event.request.url.startsWith('chrome-extension://')) {
		return;
	}
	
	// Skip non-http(s) requests
	if (!event.request.url.startsWith('http')) {
		return;
	}
});

console.log('[Service Worker] Loaded version:', version);
