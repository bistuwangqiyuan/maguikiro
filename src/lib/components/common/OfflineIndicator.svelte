<script lang="ts">
	import { networkStatus, isOffline } from '$lib/services/network-status';
	import { offlineStorage } from '$lib/services/offline-storage';
	import { onMount } from 'svelte';

	let storageStats = $state({
		sessionsCount: 0,
		signalDataCount: 0,
		defectsCount: 0,
		pendingSyncCount: 0,
		storageUsage: 0,
		storageQuota: 0
	});

	let showDetails = $state(false);

	onMount(async () => {
		// Update storage stats periodically
		const updateStats = async () => {
			storageStats = await offlineStorage.getStorageStats();
		};

		await updateStats();
		const interval = setInterval(updateStats, 10000); // Update every 10 seconds

		return () => clearInterval(interval);
	});

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}

	function getStoragePercentage(): number {
		if (storageStats.storageQuota === 0) return 0;
		return Math.round((storageStats.storageUsage / storageStats.storageQuota) * 100);
	}
</script>

{#if $isOffline}
	<div class="fixed top-4 right-4 z-50">
		<div class="alert alert-warning shadow-lg max-w-md">
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
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
			<div class="flex-1">
				<h3 class="font-bold">离线模式</h3>
				<div class="text-xs">
					数据将保存到本地，网络恢复后自动同步
					{#if storageStats.pendingSyncCount > 0}
						<br />
						<span class="badge badge-sm badge-warning mt-1">
							{storageStats.pendingSyncCount} 项待同步
						</span>
					{/if}
				</div>
			</div>
			<button class="btn btn-sm btn-ghost" onclick={() => (showDetails = !showDetails)}>
				{showDetails ? '隐藏' : '详情'}
			</button>
		</div>

		{#if showDetails}
			<div class="card bg-base-100 shadow-xl mt-2 max-w-md">
				<div class="card-body p-4">
					<h4 class="card-title text-sm">离线存储状态</h4>

					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span>检测会话:</span>
							<span class="font-mono">{storageStats.sessionsCount}</span>
						</div>
						<div class="flex justify-between">
							<span>信号数据点:</span>
							<span class="font-mono">{storageStats.signalDataCount.toLocaleString()}</span>
						</div>
						<div class="flex justify-between">
							<span>缺陷记录:</span>
							<span class="font-mono">{storageStats.defectsCount}</span>
						</div>
						<div class="flex justify-between">
							<span>待同步项:</span>
							<span class="font-mono badge badge-warning badge-sm">
								{storageStats.pendingSyncCount}
							</span>
						</div>

						<div class="divider my-2"></div>

						<div>
							<div class="flex justify-between mb-1">
								<span>存储使用:</span>
								<span class="font-mono text-xs">
									{formatBytes(storageStats.storageUsage)} / {formatBytes(
										storageStats.storageQuota
									)}
								</span>
							</div>
							<progress
								class="progress progress-primary w-full"
								value={getStoragePercentage()}
								max="100"
							></progress>
							<div class="text-xs text-center mt-1 opacity-70">
								{getStoragePercentage()}% 已使用
							</div>
						</div>
					</div>

					<div class="card-actions justify-end mt-2">
						<button class="btn btn-xs btn-ghost" onclick={() => (showDetails = false)}>
							关闭
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else if storageStats.pendingSyncCount > 0}
	<!-- Show sync indicator when online but have pending items -->
	<div class="fixed top-4 right-4 z-50">
		<div class="alert alert-info shadow-lg max-w-md">
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
				<h3 class="font-bold">正在同步</h3>
				<div class="text-xs">
					正在同步 {storageStats.pendingSyncCount} 项离线数据...
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.alert {
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
</style>
