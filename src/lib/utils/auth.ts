/**
 * 认证工具函数 / Authentication Utility Functions
 * 
 * 提供权限检查和会话管理工具
 * Provides permission checking and session management utilities
 */

import type { UserRole } from '$lib/stores/auth';

/**
 * 角色权限层级 / Role permission hierarchy
 * 数字越大权限越高 / Higher number means higher permission
 */
const roleHierarchy: Record<UserRole, number> = {
	operator: 1,
	engineer: 2,
	admin: 3
};

/**
 * 检查用户是否有指定角色或更高权限 / Check if user has specified role or higher
 */
export function hasRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
	if (!userRole) return false;
	return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * 检查用户是否有权限访问功能 / Check if user has permission to access feature
 */
export function canAccess(userRole: UserRole | null, feature: string): boolean {
	if (!userRole) return false;

	// 定义功能权限映射 / Define feature permission mapping
	const featurePermissions: Record<string, UserRole> = {
		// 所有用户都可以访问 / All users can access
		'view-waveform': 'operator',
		'view-data': 'operator',
		'start-testing': 'operator',
		'stop-testing': 'operator',
		'view-dashboard': 'operator',
		
		// 工程师及以上 / Engineer and above
		'edit-parameters': 'engineer',
		'edit-gates': 'engineer',
		'calibration': 'engineer',
		'generate-report': 'engineer',
		'export-data': 'engineer',
		'view-history': 'engineer',
		
		// 仅管理员 / Admin only
		'system-settings': 'admin',
		'user-management': 'admin',
		'delete-records': 'admin'
	};

	const requiredRole = featurePermissions[feature];
	if (!requiredRole) return false;

	return hasRole(userRole, requiredRole);
}

/**
 * 会话超时配置 / Session timeout configuration
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30分钟 / 30 minutes
export const SESSION_WARNING_MS = 5 * 60 * 1000; // 提前5分钟警告 / 5 minutes warning

/**
 * 会话超时管理器 / Session timeout manager
 */
export class SessionTimeoutManager {
	private timeoutId: number | null = null;
	private warningTimeoutId: number | null = null;
	private lastActivityTime: number = Date.now();
	private onTimeout: () => void;
	private onWarning: () => void;

	constructor(onTimeout: () => void, onWarning: () => void) {
		this.onTimeout = onTimeout;
		this.onWarning = onWarning;
	}

	/**
	 * 开始监控会话超时 / Start monitoring session timeout
	 */
	start() {
		this.resetTimer();
		this.setupActivityListeners();
	}

	/**
	 * 停止监控 / Stop monitoring
	 */
	stop() {
		this.clearTimers();
		this.removeActivityListeners();
	}

	/**
	 * 重置计时器 / Reset timer
	 */
	resetTimer() {
		this.lastActivityTime = Date.now();
		this.clearTimers();

		// 设置警告定时器 / Set warning timer
		this.warningTimeoutId = window.setTimeout(() => {
			this.onWarning();
		}, SESSION_TIMEOUT_MS - SESSION_WARNING_MS);

		// 设置超时定时器 / Set timeout timer
		this.timeoutId = window.setTimeout(() => {
			this.onTimeout();
		}, SESSION_TIMEOUT_MS);
	}

	/**
	 * 清除定时器 / Clear timers
	 */
	private clearTimers() {
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
		if (this.warningTimeoutId !== null) {
			clearTimeout(this.warningTimeoutId);
			this.warningTimeoutId = null;
		}
	}

	/**
	 * 处理用户活动 / Handle user activity
	 */
	private handleActivity = () => {
		const now = Date.now();
		// 只有在距离上次活动超过1分钟时才重置计时器，避免频繁重置
		// Only reset timer if more than 1 minute since last activity to avoid frequent resets
		if (now - this.lastActivityTime > 60000) {
			this.resetTimer();
		}
	};

	/**
	 * 设置活动监听器 / Setup activity listeners
	 */
	private setupActivityListeners() {
		const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
		events.forEach(event => {
			document.addEventListener(event, this.handleActivity);
		});
	}

	/**
	 * 移除活动监听器 / Remove activity listeners
	 */
	private removeActivityListeners() {
		const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
		events.forEach(event => {
			document.removeEventListener(event, this.handleActivity);
		});
	}

	/**
	 * 获取剩余时间（毫秒）/ Get remaining time in milliseconds
	 */
	getRemainingTime(): number {
		const elapsed = Date.now() - this.lastActivityTime;
		return Math.max(0, SESSION_TIMEOUT_MS - elapsed);
	}
}

/**
 * 格式化剩余时间 / Format remaining time
 */
export function formatRemainingTime(ms: number): string {
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
