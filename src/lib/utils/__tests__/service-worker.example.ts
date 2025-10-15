/**
 * Service Worker 使用示例
 * 
 * 本文件展示如何在应用程序中使用 Service Worker 功能
 */

import {
	registerServiceWorker,
	updateServiceWorker,
	isServiceWorkerSupported,
	isOnline,
	onStatusChange,
	onSyncAvailable,
	unregisterServiceWorker
} from '../service-worker-registration';

// ============================================
// 示例 1: 基本注册
// ============================================

async function example1_BasicRegistration() {
	console.log('=== 示例 1: 基本注册 ===');

	// 检查浏览器是否支持 Service Worker
	if (!isServiceWorkerSupported()) {
		console.warn('浏览器不支持 Service Worker');
		return;
	}

	// 注册 Service Worker
	try {
		await registerServiceWorker();
		console.log('Service Worker 注册成功');
	} catch (error) {
		console.error('Service Worker 注册失败:', error);
	}
}

// ============================================
// 示例 2: 监听状态变化
// ============================================

function example2_StatusMonitoring() {
	console.log('=== 示例 2: 监听状态变化 ===');

	// 订阅状态变化
	const unsubscribe = onStatusChange((status) => {
		console.log('Service Worker 状态更新:');
		console.log('  - 是否支持:', status.isSupported);
		console.log('  - 是否已注册:', status.isRegistered);
		console.log('  - 是否在线:', status.isOnline);
		console.log('  - 是否需要更新:', status.needsUpdate);

		// 根据状态执行不同的操作
		if (!status.isOnline) {
			console.log('⚠️ 应用程序处于离线模式');
			// 显示离线提示
			// 切换到离线数据源
		}

		if (status.needsUpdate) {
			console.log('🔄 有新版本可用');
			// 显示更新通知
			// 提示用户刷新页面
		}
	});

	// 在组件卸载时取消订阅
	// unsubscribe();
}

// ============================================
// 示例 3: 处理离线/在线切换
// ============================================

function example3_OfflineOnlineHandling() {
	console.log('=== 示例 3: 处理离线/在线切换 ===');

	let isCurrentlyOnline = isOnline();

	onStatusChange((status) => {
		// 检测从离线到在线的转换
		if (!isCurrentlyOnline && status.isOnline) {
			console.log('✅ 网络已恢复');
			handleNetworkRestored();
		}

		// 检测从在线到离线的转换
		if (isCurrentlyOnline && !status.isOnline) {
			console.log('❌ 网络已断开');
			handleNetworkLost();
		}

		isCurrentlyOnline = status.isOnline;
	});
}

function handleNetworkRestored() {
	console.log('执行网络恢复后的操作:');
	console.log('  - 同步离线数据');
	console.log('  - 刷新数据');
	console.log('  - 隐藏离线提示');
}

function handleNetworkLost() {
	console.log('执行网络断开后的操作:');
	console.log('  - 切换到离线模式');
	console.log('  - 显示离线提示');
	console.log('  - 启用本地数据存储');
}

// ============================================
// 示例 4: 后台同步
// ============================================

function example4_BackgroundSync() {
	console.log('=== 示例 4: 后台同步 ===');

	// 订阅同步事件
	const unsubscribe = onSyncAvailable(() => {
		console.log('🔄 后台同步可用，开始同步数据...');
		syncOfflineData();
	});

	// 在组件卸载时取消订阅
	// unsubscribe();
}

async function syncOfflineData() {
	console.log('同步离线数据到服务器:');

	// 1. 从 IndexedDB 获取离线数据
	const offlineData = await getOfflineDataFromIndexedDB();
	console.log(`  - 找到 ${offlineData.length} 条离线记录`);

	// 2. 批量上传到服务器
	for (const data of offlineData) {
		try {
			await uploadToServer(data);
			console.log(`  ✅ 已同步: ${data.id}`);

			// 3. 同步成功后从 IndexedDB 删除
			await deleteFromIndexedDB(data.id);
		} catch (error) {
			console.error(`  ❌ 同步失败: ${data.id}`, error);
			// 保留在 IndexedDB 中，下次再试
		}
	}

	console.log('✅ 数据同步完成');
}

// 模拟函数
async function getOfflineDataFromIndexedDB() {
	return [
		{ id: '1', type: 'session', data: {} },
		{ id: '2', type: 'signal', data: {} }
	];
}

async function uploadToServer(data: any) {
	// 实际的上传逻辑
	console.log('上传数据到服务器:', data.id);
}

async function deleteFromIndexedDB(id: string) {
	// 从 IndexedDB 删除
	console.log('从 IndexedDB 删除:', id);
}

// ============================================
// 示例 5: 手动更新 Service Worker
// ============================================

async function example5_ManualUpdate() {
	console.log('=== 示例 5: 手动更新 Service Worker ===');

	// 监听更新通知
	onStatusChange((status) => {
		if (status.needsUpdate) {
			console.log('检测到新版本');

			// 显示更新对话框
			const shouldUpdate = confirm('有新版本可用，是否立即更新？');

			if (shouldUpdate) {
				console.log('用户确认更新');
				updateServiceWorker();
				// 页面将自动刷新
			} else {
				console.log('用户取消更新');
				// 下次刷新时会自动更新
			}
		}
	});
}

// ============================================
// 示例 6: 在 Svelte 组件中使用
// ============================================

/**
 * 在 Svelte 组件中使用 Service Worker
 * 
 * ```svelte
 * <script lang="ts">
 *   import { onMount, onDestroy } from 'svelte';
 *   import { onStatusChange, onSyncAvailable } from '$lib/utils/service-worker-registration';
 * 
 *   let isOnline = $state(true);
 *   let needsUpdate = $state(false);
 *   let unsubscribeStatus: (() => void) | null = null;
 *   let unsubscribeSync: (() => void) | null = null;
 * 
 *   onMount(() => {
 *     // 监听状态变化
 *     unsubscribeStatus = onStatusChange((status) => {
 *       isOnline = status.isOnline;
 *       needsUpdate = status.needsUpdate;
 *     });
 * 
 *     // 监听同步事件
 *     unsubscribeSync = onSyncAvailable(() => {
 *       console.log('Syncing offline data...');
 *       // 执行同步逻辑
 *     });
 *   });
 * 
 *   onDestroy(() => {
 *     unsubscribeStatus?.();
 *     unsubscribeSync?.();
 *   });
 * 
 *   function handleUpdate() {
 *     updateServiceWorker();
 *   }
 * </script>
 * 
 * {#if !isOnline}
 *   <div class="alert alert-warning">
 *     离线模式：数据将保存到本地
 *   </div>
 * {/if}
 * 
 * {#if needsUpdate}
 *   <div class="alert alert-info">
 *     <span>有新版本可用</span>
 *     <button onclick={handleUpdate}>更新</button>
 *   </div>
 * {/if}
 * ```
 */

// ============================================
// 示例 7: 开发环境中卸载 Service Worker
// ============================================

async function example7_UnregisterForDevelopment() {
	console.log('=== 示例 7: 卸载 Service Worker (开发用) ===');

	// 在开发环境中，有时需要完全卸载 Service Worker
	if (import.meta.env.DEV) {
		try {
			await unregisterServiceWorker();
			console.log('Service Worker 已卸载');
			console.log('请刷新页面以完全清除缓存');
		} catch (error) {
			console.error('卸载失败:', error);
		}
	}
}

// ============================================
// 示例 8: 完整的应用程序集成
// ============================================

class ServiceWorkerManager {
	private statusUnsubscribe: (() => void) | null = null;
	private syncUnsubscribe: (() => void) | null = null;
	private isOnline = true;

	async initialize() {
		console.log('初始化 Service Worker Manager');

		// 注册 Service Worker
		if (isServiceWorkerSupported()) {
			await registerServiceWorker();
		}

		// 监听状态变化
		this.statusUnsubscribe = onStatusChange((status) => {
			this.handleStatusChange(status);
		});

		// 监听同步事件
		this.syncUnsubscribe = onSyncAvailable(() => {
			this.handleSync();
		});
	}

	private handleStatusChange(status: any) {
		// 处理离线/在线切换
		if (this.isOnline !== status.isOnline) {
			this.isOnline = status.isOnline;

			if (status.isOnline) {
				this.onNetworkRestored();
			} else {
				this.onNetworkLost();
			}
		}

		// 处理更新
		if (status.needsUpdate) {
			this.onUpdateAvailable();
		}
	}

	private onNetworkRestored() {
		console.log('网络已恢复');
		// 触发数据同步
		// 刷新数据
		// 显示成功通知
	}

	private onNetworkLost() {
		console.log('网络已断开');
		// 切换到离线模式
		// 显示离线提示
	}

	private onUpdateAvailable() {
		console.log('有新版本可用');
		// 显示更新通知
	}

	private async handleSync() {
		console.log('开始后台同步');
		// 执行数据同步逻辑
	}

	destroy() {
		this.statusUnsubscribe?.();
		this.syncUnsubscribe?.();
	}
}

// 使用示例
const swManager = new ServiceWorkerManager();
// swManager.initialize();

// ============================================
// 运行示例
// ============================================

export function runServiceWorkerExamples() {
	console.log('🚀 Service Worker 示例');
	console.log('='.repeat(50));

	// 取消注释以运行特定示例
	// example1_BasicRegistration();
	// example2_StatusMonitoring();
	// example3_OfflineOnlineHandling();
	// example4_BackgroundSync();
	// example5_ManualUpdate();
	// example7_UnregisterForDevelopment();
}

// 导出供其他模块使用
export {
	example1_BasicRegistration,
	example2_StatusMonitoring,
	example3_OfflineOnlineHandling,
	example4_BackgroundSync,
	example5_ManualUpdate,
	example7_UnregisterForDevelopment,
	ServiceWorkerManager
};
