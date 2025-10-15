<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore, isAuthenticated } from '$lib/stores/auth';
	import { SessionTimeoutManager } from '$lib/utils/auth';
	import { InstrumentShell } from '$lib/components/instrument';
	import OfflineIndicator from '$lib/components/common/OfflineIndicator.svelte';
	import SyncNotification from '$lib/components/common/SyncNotification.svelte';
	import { registerServiceWorker } from '$lib/utils/service-worker-registration';
	import '../app.css';

	let { children } = $props();
	let sessionManager: SessionTimeoutManager | null = null;
	let showTimeoutWarning = $state(false);
	let remainingTime = $state('');

	// 初始化认证 / Initialize authentication
	onMount(() => {
		authStore.initialize();

		// 注册 Service Worker / Register Service Worker
		if (browser) {
			registerServiceWorker().catch((error) => {
				console.error('Failed to register service worker:', error);
			});
		}

		// 设置会话超时管理 / Setup session timeout management
		sessionManager = new SessionTimeoutManager(
			// 超时回调 / Timeout callback
			async () => {
				showTimeoutWarning = false;
				await authStore.signOut();
				goto('/login');
			},
			// 警告回调 / Warning callback
			() => {
				showTimeoutWarning = true;
				updateRemainingTime();
			}
		);

		return () => {
			sessionManager?.stop();
		};
	});

	// 监听认证状态变化 / Watch authentication state changes
	$effect(() => {
		if ($isAuthenticated) {
			// 用户已登录，启动会话超时监控 / User logged in, start session timeout monitoring
			sessionManager?.start();
		} else {
			// 用户未登录，停止监控 / User not logged in, stop monitoring
			sessionManager?.stop();
			showTimeoutWarning = false;
		}
	});

	// 监听路由变化，检查认证状态 / Watch route changes, check authentication
	$effect(() => {
		const currentPath = $page.url.pathname;
		const isPublicRoute = currentPath === '/login';

		if (!$isAuthenticated && !isPublicRoute && !$authStore.loading) {
			// 未认证且不在公开路由，重定向到登录页 / Not authenticated and not on public route, redirect to login
			goto('/login');
		} else if ($isAuthenticated && isPublicRoute) {
			// 已认证但在登录页，重定向到主页 / Authenticated but on login page, redirect to home
			goto('/');
		}
	});

	// 更新剩余时间显示 / Update remaining time display
	function updateRemainingTime() {
		if (!sessionManager) return;
		
		const interval = setInterval(() => {
			const ms = sessionManager.getRemainingTime();
			if (ms <= 0) {
				clearInterval(interval);
				return;
			}
			const minutes = Math.floor(ms / 60000);
			const seconds = Math.floor((ms % 60000) / 1000);
			remainingTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		}, 1000);
	}

	// 继续会话 / Continue session
	function continueSession() {
		showTimeoutWarning = false;
		sessionManager?.resetTimer();
	}

	// 立即登出 / Sign out immediately
	async function signOutNow() {
		showTimeoutWarning = false;
		await authStore.signOut();
		goto('/login');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- 离线状态指示器 / Offline status indicator -->
<OfflineIndicator />

<!-- 数据同步通知 / Data sync notification -->
{#if $isAuthenticated}
	<SyncNotification />
{/if}

<!-- 会话超时警告模态框 / Session timeout warning modal -->
{#if showTimeoutWarning}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="font-bold text-lg">会话即将超时 / Session Timeout Warning</h3>
			<p class="py-4">
				您的会话将在 <span class="font-bold text-warning">{remainingTime}</span> 后超时。
				<br />
				Your session will timeout in <span class="font-bold text-warning">{remainingTime}</span>.
			</p>
			<p class="text-sm text-base-content/70">
				点击"继续"以保持登录状态，或点击"登出"立即退出。
				<br />
				Click "Continue" to stay logged in, or "Sign Out" to logout now.
			</p>
			<div class="modal-action">
				<button class="btn btn-ghost" onclick={signOutNow}>
					登出 / Sign Out
				</button>
				<button class="btn btn-primary" onclick={continueSession}>
					继续 / Continue
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- 加载状态 / Loading state -->
{#if $authStore.loading}
	<div class="min-h-screen flex items-center justify-center bg-base-300">
		<div class="text-center">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p class="mt-4 text-lg">加载中... / Loading...</p>
		</div>
	</div>
{:else if $isAuthenticated && $page.url.pathname !== '/login'}
	<!-- 已认证用户使用仪器外壳 / Authenticated users use instrument shell -->
	<InstrumentShell>
		{@render children?.()}
	</InstrumentShell>
{:else}
	<!-- 未认证用户或登录页面 / Unauthenticated users or login page -->
	{@render children?.()}
{/if}
