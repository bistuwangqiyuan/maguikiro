/**
 * Stores Index
 * 
 * Central export point for all store modules
 */

export {
	authStore,
	isAuthenticated,
	userRole,
	isAdmin,
	isEngineerOrAdmin,
	type UserRole,
	type UserProfile,
	type AuthState
} from './auth';

export {
	testingStore,
	isTesting,
	isPaused,
	canStartTesting,
	latestSignal,
	testingStats,
	type TestingState
} from './testing';

