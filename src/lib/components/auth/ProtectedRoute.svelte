<script lang="ts">
	/**
	 * 受保护路由组件 / Protected Route Component
	 * 
	 * 用于包装需要特定权限才能访问的内容
	 * Used to wrap content that requires specific permissions to access
	 */
	import { isAuthenticated, userRole } from '$lib/stores/auth';
	import { canAccess, type UserRole } from '$lib/utils/auth';

	interface Props {
		requiredRole?: UserRole;
		requiredFeature?: string;
		fallback?: any;
		children?: any;
	}

	let { requiredRole, requiredFeature, fallback, children }: Props = $props();

	// 检查权限 / Check permissions
	const hasPermission = $derived(() => {
		if (!$isAuthenticated) return false;
		
		if (requiredRole) {
			const roleHierarchy: Record<UserRole, number> = {
				operator: 1,
				engineer: 2,
				admin: 3
			};
			const currentRoleLevel = $userRole ? roleHierarchy[$userRole] : 0;
			const requiredRoleLevel = roleHierarchy[requiredRole];
			return currentRoleLevel >= requiredRoleLevel;
		}
		
		if (requiredFeature) {
			return canAccess($userRole, requiredFeature);
		}
		
		return true;
	});
</script>

{#if hasPermission()}
	{@render children?.()}
{:else if fallback}
	{@render fallback?.()}
{:else}
	<div class="alert alert-warning">
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
		<div>
			<div class="font-bold">权限不足 / Insufficient Permissions</div>
			<div class="text-sm">您没有权限访问此功能 / You don't have permission to access this feature</div>
		</div>
	</div>
{/if}
