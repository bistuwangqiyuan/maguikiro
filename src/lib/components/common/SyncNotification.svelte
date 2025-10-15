<script lang="ts">
	import { dataSync, type SyncProgress, type SyncResult } from '$lib/services/data-sync';
	import { networkStatus } from '$lib/services/network-status';
	import { onMount, onDestroy } from 'svelte';

	let syncProgress = $state<SyncProgress | null>(null);
	let syncResult = $state<SyncResult | null>(null);
	let showNotification = $state(false);
	let notificationType = $state<'syncing' | 'success' | 'error'>('syncing');
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		// Listen for sync progress
		unsubscribe = dataSync.addSyncListener((progress) => {
			syncProgress = progress;
			showNotification = true;
			notificationType = 'syncing';
		});

		// Start periodic sync
		dataSync.startPeriodicSync(60000); // Every minute
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
		dataSync.stopPeriodicSync();
	});

	async function handleManualSync() {
		try {
			showNotification = true;
			notificationType = 'syncing';
			syncResult = null;

			const result = await dataSync.forceSyncNow();
			syncResult = result;

			if (result.success && result.synced > 0) {
				notificationType = 'success';
				setTimeout(() => {
					showNotification = false;
				}, 3000);
			} else if (result.failed > 0) {
				notificationType = 'error';
			} else {
				// No items to sync
				showNotification = false;
			}
		} catch (error) {
			notificationType = 'error';
			syncResult = {
				success: false,
				synced: 0,
				failed: 0,
				errors: [{ item: {} as any, error: error instanceof Error ? error.message : 'Unknown error' }]
			};
		}
	}

	function getSyncPercentage(): number {
		if (!syncProgress || syncProgress.total === 0) return 0;
		return Math.round(((syncProgress.completed + syncProgress.failed) / syncProgress.total) * 100);
	}

	function closeNotification() {
		showNotification = false;
		syncProgress = null;
		syncResult = null;
	}
</script>

{#if showNotification}
	<div class="toast toast-top toast-end z-50">
		{#if notificationType === 'syncing'}
			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current shrink-0 h-6 w-6 animate-spin"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				<div class="flex-1">
					<h3 class="font-bold">正在同步数据</h3>
					{#if syncProgress}
						<div class="text-xs">
							{syncProgress.completed + syncProgress.failed} / {syncProgress.total} 项
						</div>
						<progress
							class="progress progress-info w-full mt-1"
							value={getSyncPercentage()}
							max="100"
						></progress>
					{/if}
				</div>
			</div>
		{:else if notificationType === 'success'}
			<div class="alert alert-success">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div class="flex-1">
					<h3 class="font-bold">同步成功</h3>
					{#if syncResult}
						<div class="text-xs">已同步 {syncResult.synced} 项数据</div>
					{/if}
				</div>
				<button class="btn btn-sm btn-ghost" onclick={closeNotification}>关闭</button>
			</div>
		{:else if notificationType === 'error'}
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div class="flex-1">
					<h3 class="font-bold">同步失败</h3>
					{#if syncResult}
						<div class="text-xs">
							{syncResult.failed} 项失败
							{#if syncResult.errors.length > 0}
								<br />
								<span class="opacity-70">{syncResult.errors[0].error}</span>
							{/if}
						</div>
					{/if}
				</div>
				<button class="btn btn-sm btn-ghost" onclick={closeNotification}>关闭</button>
			</div>
		{/if}
	</div>
{/if}

<!-- Manual sync button (floating action button) -->
{#if $networkStatus.online}
	<div class="fixed bottom-6 right-6 z-40">
		<button
			class="btn btn-circle btn-primary shadow-lg"
			onclick={handleManualSync}
			title="手动同步数据"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
		</button>
	</div>
{/if}

<style>
	.toast {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.btn-circle {
		transition: transform 0.2s ease;
	}

	.btn-circle:hover {
		transform: scale(1.1);
	}

	.btn-circle:active {
		transform: scale(0.95);
	}
</style>
