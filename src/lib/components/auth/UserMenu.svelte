<script lang="ts">
	/**
	 * 用户菜单组件 / User Menu Component
	 * 
	 * 显示当前用户信息和登出按钮
	 * Displays current user information and sign out button
	 */
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	async function handleSignOut() {
		await authStore.signOut();
		goto('/login');
	}

	const roleLabels = {
		operator: '操作员 / Operator',
		engineer: '工程师 / Engineer',
		admin: '管理员 / Admin'
	};
</script>

{#if $authStore.user && $authStore.profile}
	<div class="dropdown dropdown-end">
		<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
			<div class="bg-neutral text-neutral-content rounded-full w-10">
				<span class="text-xl">{$authStore.profile.username.charAt(0).toUpperCase()}</span>
			</div>
		</div>
		<ul
			tabindex="0"
			class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-64"
		>
			<li class="menu-title">
				<span class="text-base font-semibold">{$authStore.profile.username}</span>
			</li>
			{#if $authStore.profile.fullName}
				<li class="disabled">
					<span class="text-sm">{$authStore.profile.fullName}</span>
				</li>
			{/if}
			<li class="disabled">
				<span class="text-xs text-base-content/70">
					{roleLabels[$authStore.profile.role]}
				</span>
			</li>
			<div class="divider my-1"></div>
			<li>
				<a href="/settings">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					设置 / Settings
				</a>
			</li>
			<li>
				<button onclick={handleSignOut} class="text-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					登出 / Sign Out
				</button>
			</li>
		</ul>
	</div>
{/if}
