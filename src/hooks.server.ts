/**
 * SvelteKit服务器钩子 / SvelteKit Server Hooks
 * 
 * 处理服务器端请求拦截和认证检查
 * Handles server-side request interception and authentication checks
 */

import type { Handle } from '@sveltejs/kit';

/**
 * 公开路由列表（不需要认证）/ Public routes (no authentication required)
 */
const publicRoutes = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
	// 对于公开路由，直接放行 / Allow public routes
	if (publicRoutes.some(route => event.url.pathname.startsWith(route))) {
		return resolve(event);
	}

	// 对于其他路由，在客户端进行认证检查
	// For other routes, authentication check is done on client side
	return resolve(event);
};
