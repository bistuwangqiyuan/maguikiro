/**
 * 认证状态Store / Authentication State Store
 * 
 * 管理用户认证状态和会话信息
 * Manages user authentication state and session information
 */

import { writable, derived, type Readable } from 'svelte/store';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '$lib/services/supabase';

export type UserRole = 'operator' | 'engineer' | 'admin';

export interface UserProfile {
	id: string;
	username: string;
	fullName?: string;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuthState {
	user: User | null;
	profile: UserProfile | null;
	session: Session | null;
	loading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	profile: null,
	session: null,
	loading: true,
	error: null
};

/**
 * 创建认证Store / Create Auth Store
 */
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);
	const supabase = getSupabaseClient();

	return {
		subscribe,

		/**
		 * 初始化认证状态 / Initialize auth state
		 */
		async initialize() {
			try {
				update(state => ({ ...state, loading: true, error: null }));

				// 获取当前会话 / Get current session
				const { data: { session }, error: sessionError } = await supabase.auth.getSession();
				
				if (sessionError) throw sessionError;

				if (session?.user) {
					// 获取用户profile / Get user profile
					const profile = await this.fetchUserProfile(session.user.id);
					
					update(state => ({
						...state,
						user: session.user,
						session,
						profile,
						loading: false
					}));
				} else {
					update(state => ({ ...state, loading: false }));
				}

				// 监听认证状态变化 / Listen to auth state changes
				supabase.auth.onAuthStateChange(async (event, session) => {
					if (event === 'SIGNED_IN' && session?.user) {
						const profile = await this.fetchUserProfile(session.user.id);
						update(state => ({
							...state,
							user: session.user,
							session,
							profile,
							error: null
						}));
					} else if (event === 'SIGNED_OUT') {
						update(state => ({
							...state,
							user: null,
							session: null,
							profile: null,
							error: null
						}));
					} else if (event === 'TOKEN_REFRESHED' && session) {
						update(state => ({ ...state, session }));
					}
				});
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to initialize auth';
				update(state => ({ ...state, loading: false, error: errorMessage }));
			}
		},

		/**
		 * 登录 / Sign in
		 */
		async signIn(email: string, password: string) {
			try {
				update(state => ({ ...state, loading: true, error: null }));

				const { data, error } = await supabase.auth.signInWithPassword({
					email,
					password
				});

				if (error) throw error;

				if (data.user) {
					const profile = await this.fetchUserProfile(data.user.id);
					update(state => ({
						...state,
						user: data.user,
						session: data.session,
						profile,
						loading: false
					}));
				}

				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
				update(state => ({ ...state, loading: false, error: errorMessage }));
				return { success: false, error: errorMessage };
			}
		},

		/**
		 * 登出 / Sign out
		 */
		async signOut() {
			try {
				update(state => ({ ...state, loading: true, error: null }));

				const { error } = await supabase.auth.signOut();
				
				if (error) throw error;

				update(state => ({
					...state,
					user: null,
					session: null,
					profile: null,
					loading: false
				}));

				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
				update(state => ({ ...state, loading: false, error: errorMessage }));
				return { success: false, error: errorMessage };
			}
		},

		/**
		 * 获取用户profile / Fetch user profile
		 */
		async fetchUserProfile(userId: string): Promise<UserProfile | null> {
			try {
				const { data, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', userId)
					.single();

				if (error) throw error;

				return {
					id: data.id,
					username: data.username,
					fullName: data.full_name,
					role: data.role as UserRole,
					createdAt: new Date(data.created_at),
					updatedAt: new Date(data.updated_at)
				};
			} catch (error) {
				console.error('Failed to fetch user profile:', error);
				return null;
			}
		},

		/**
		 * 更新用户profile / Update user profile
		 */
		async updateProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>) {
			try {
				update(state => ({ ...state, loading: true, error: null }));

				const { data: { user } } = await supabase.auth.getUser();
				if (!user) throw new Error('No user logged in');

				const dbUpdates: any = {};
				if (updates.username) dbUpdates.username = updates.username;
				if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
				if (updates.role) dbUpdates.role = updates.role;
				dbUpdates.updated_at = new Date().toISOString();

				const { error } = await supabase
					.from('profiles')
					.update(dbUpdates)
					.eq('id', user.id);

				if (error) throw error;

				const profile = await this.fetchUserProfile(user.id);
				update(state => ({ ...state, profile, loading: false }));

				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
				update(state => ({ ...state, loading: false, error: errorMessage }));
				return { success: false, error: errorMessage };
			}
		},

		/**
		 * 清除错误 / Clear error
		 */
		clearError() {
			update(state => ({ ...state, error: null }));
		}
	};
}

export const authStore = createAuthStore();

/**
 * 派生Store：是否已认证 / Derived store: is authenticated
 */
export const isAuthenticated: Readable<boolean> = derived(
	authStore,
	$auth => $auth.user !== null && $auth.profile !== null
);

/**
 * 派生Store：用户角色 / Derived store: user role
 */
export const userRole: Readable<UserRole | null> = derived(
	authStore,
	$auth => $auth.profile?.role || null
);

/**
 * 派生Store：是否为管理员 / Derived store: is admin
 */
export const isAdmin: Readable<boolean> = derived(
	userRole,
	$role => $role === 'admin'
);

/**
 * 派生Store：是否为工程师或管理员 / Derived store: is engineer or admin
 */
export const isEngineerOrAdmin: Readable<boolean> = derived(
	userRole,
	$role => $role === 'engineer' || $role === 'admin'
);
