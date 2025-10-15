<script lang="ts">
	import { dataSync } from '$lib/services/data-sync';
	import { offlineStorage } from '$lib/services/offline-storage';
	import { onMount } from 'svelte';

	let autoSyncEnabled = $state(true);
	let syncInterval = $state(60); // seconds
	let clearDataDays = $state(7);
	let syncStatus = $state({
		isSyncing: false,
		pendingCount: 0,
		lastSyncTime: undefined as number | undefined
	});
	let storageStats = $state({
		sessionsCount: 0,
		signalDataCount: 0,
		defectsCount: 0,
		pendingSyncCount: 0,
		storageUsage: 0,
		storageQuota: 0
	});
	let showClearConfirm = $state(false);
	let isClearing = $state(false);

	onMount(async () => {
		await loadSettings();
		await updateStatus();

		// Update status periodically
		const interval = setInterval(updateStatus, 5000);
		return () => clearInterval(interval);
	});

	async function loadSettings() {
		// Load settings from localStorage
		const savedAutoSync = localStorage.getItem('autoSyncEnabled');
		if (savedAutoSync !== null) {
			autoSyncEnabled = savedAutoSync === 'true';
		}

		const savedInterval = localStorage.getItem('syncInterval');
		if (savedInterval !== null) {
			syncInterval = parseInt(savedInterval, 10);
		}

		const savedClearDays = localStorage.getItem('clearDataDays');
		if (savedClearDays !== null) {
			clearDataDays = parseInt(savedClearDays, 10);
		}

		// Apply settings
		if (autoSyncEnabled) {
			dataSync.enableAutoSync();
			dataSync.startPeriodicSync(syncInterval * 1000);
		} else {
			dataSync.disableAutoSync();
			dataSync.stopPeriodicSync();
		}
	}

	async function updateStatus() {
		syncStatus = await dataSync.getSyncStatus();
		storageStats = await offlineStorage.getStorageStats();
	}

	function handleAutoSyncToggle() {
		autoSyncEnabled = !autoSyncEnabled;
		localStorage.setItem('autoSyncEnabled', autoSyncEnabled.toString());

		if (autoSyncEnabled) {
			dataSync.enableAutoSync();
			dataSync.startPeriodicSync(syncInterval * 1000);
		} else {
			dataSync.disableAutoSync();
			dataSync.stopPeriodicSync();
		}
	}

	function handleIntervalChange() {
		localStorage.setItem('syncInterval', syncInterval.toString());
		if (autoSyncEnabled) {
			dataSync.startPeriodicSync(syncInterval * 1000);
		}
	}

	function handleClearDaysChange() {
		localStorage.setItem('clearDataDays', clearDataDays.toString());
	}

	async function handleManualSync() {
		try {
			await dataSync.forceSyncNow();
			await updateStatus();
		} catch (error) {
			console.error('Manual sync failed:', error);
			alert('同步失败: ' + (error instanceof Error ? error.message : '未知错误'));
		}
	}

	async function handleClearOldData() {
		if (!showClearConfirm) {
			showClearConfirm = true;
			return;
		}

		isClearing = true;
		try {
			await dataSync.clearOldData(clearDataDays);
			await updateStatus();
			showClearConfirm = false;
			alert(`已清理 ${clearDataDays} 天前的已同步数据`);
		} catch (error) {
			console.error('Clear data failed:', error);
			alert('清理失败: ' + (error instanceof Error ? error.message : '未知错误'));
		} finally {
			isClearing = false;
		}
	}

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	}

	function getStoragePercentage(): number {
		if (storageStats.storageQuota === 0) return 0;
		return Math.round((storageStats.storageUsage / storageStats.storageQuota) * 100);
	}
</script>

<div class="card bg-base-200 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-primary">
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
			离线数据同步设置
		</h2>

		<!-- Sync Status -->
		<div class="stats shadow mb-4">
			<div class="stat">
				<div class="stat-title">同步状态</div>
				<div class="stat-value text-sm">
					{#if syncStatus.isSyncing}
						<span class="loading loading-spinner loading-sm"></span>
						同步中
					{:else if syncStatus.pendingCount > 0}
						<span class="badge badge-warning">待同步</span>
					{:else}
						<span class="badge badge-success">已同步</span>
					{/if}
				</div>
				<div class="stat-desc">
					{syncStatus.pendingCount} 项待同步
				</div>
			</div>

			<div class="stat">
				<div class="stat-title">本地存储</div>
				<div class="stat-value text-sm">
					{formatBytes(storageStats.storageUsage)}
				</div>
				<div class="stat-desc">
					{getStoragePercentage()}% 已使用
				</div>
			</div>

			<div class="stat">
				<div class="stat-title">数据统计</div>
				<div class="stat-value text-sm">
					{storageStats.sessionsCount} 会话
				</div>
				<div class="stat-desc">
					{storageStats.signalDataCount.toLocaleString()} 数据点
				</div>
			</div>
		</div>

		<!-- Auto Sync Settings -->
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">
					<span class="font-semibold">自动同步</span>
					<br />
					<span class="text-xs opacity-70">网络恢复时自动同步离线数据</span>
				</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					checked={autoSyncEnabled}
					onchange={handleAutoSyncToggle}
				/>
			</label>
		</div>

		<div class="divider"></div>

		<!-- Sync Interval -->
		<div class="form-control">
			<label class="label">
				<span class="label-text font-semibold">同步间隔</span>
				<span class="label-text-alt">{syncInterval} 秒</span>
			</label>
			<input
				type="range"
				min="30"
				max="300"
				step="30"
				bind:value={syncInterval}
				onchange={handleIntervalChange}
				class="range range-primary"
				disabled={!autoSyncEnabled}
			/>
			<div class="w-full flex justify-between text-xs px-2 opacity-70">
				<span>30s</span>
				<span>1min</span>
				<span>2min</span>
				<span>5min</span>
			</div>
		</div>

		<div class="divider"></div>

		<!-- Clear Old Data -->
		<div class="form-control">
			<label class="label">
				<span class="label-text font-semibold">自动清理已同步数据</span>
				<span class="label-text-alt">{clearDataDays} 天前</span>
			</label>
			<input
				type="range"
				min="1"
				max="30"
				step="1"
				bind:value={clearDataDays}
				onchange={handleClearDaysChange}
				class="range range-secondary"
			/>
			<div class="w-full flex justify-between text-xs px-2 opacity-70">
				<span>1天</span>
				<span>7天</span>
				<span>14天</span>
				<span>30天</span>
			</div>
		</div>

		<div class="divider"></div>

		<!-- Storage Progress -->
		<div class="mb-4">
			<div class="flex justify-between mb-2">
				<span class="text-sm font-semibold">存储空间使用</span>
				<span class="text-sm">
					{formatBytes(storageStats.storageUsage)} / {formatBytes(storageStats.storageQuota)}
				</span>
			</div>
			<progress
				class="progress progress-primary w-full"
				value={getStoragePercentage()}
				max="100"
			></progress>
		</div>

		<!-- Action Buttons -->
		<div class="card-actions justify-end gap-2">
			{#if !showClearConfirm}
				<button class="btn btn-outline btn-secondary" onclick={handleClearOldData}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					清理旧数据
				</button>
			{:else}
				<button
					class="btn btn-error"
					onclick={handleClearOldData}
					disabled={isClearing}
				>
					{#if isClearing}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					确认清理
				</button>
				<button class="btn btn-ghost" onclick={() => (showClearConfirm = false)}>
					取消
				</button>
			{/if}

			<button
				class="btn btn-primary"
				onclick={handleManualSync}
				disabled={syncStatus.isSyncing || syncStatus.pendingCount === 0}
			>
				{#if syncStatus.isSyncing}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
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
				{/if}
				立即同步
			</button>
		</div>
	</div>
</div>

<style>
	.range {
		height: 0.5rem;
	}
</style>
