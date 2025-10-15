/**
 * 检测状态管理Store / Testing State Management Store
 * 
 * 管理当前检测会话状态、信号数据缓冲区和缺陷列表
 * Manages current testing session state, signal data buffer, and defect list
 */

import { writable, derived, get, type Readable } from 'svelte/store';
import type { SignalData, TestingParameters, Defect, GateConfig } from '$lib/types/signal';
import type { TestingSession, TestingStatus } from '$lib/types/session';
import { DataAcquisitionService } from '$lib/services/data-acquisition';
import { SignalProcessor } from '$lib/services/signal-processor';
import { getSupabaseClient } from '$lib/services/supabase';
import { authStore } from './auth';

/**
 * 检测状态接口 / Testing State Interface
 */
export interface TestingState {
	// 当前会话 / Current session
	currentSession: TestingSession | null;
	
	// 检测状态 / Testing status
	status: TestingStatus;
	
	// 实时信号数据缓冲区 / Real-time signal data buffer
	signalBuffer: SignalData[];
	
	// 处理后的信号数据缓冲区 / Processed signal data buffer
	processedBuffer: SignalData[];
	
	// 缺陷列表 / Defect list
	defects: Defect[];
	
	// 检测进度 / Testing progress
	progress: {
		startTime: Date | null;
		currentTime: number; // 当前时间位置 / Current time position
		duration: number; // 已运行时长（秒）/ Duration in seconds
		samplesCollected: number; // 已采集样本数 / Samples collected
		defectsDetected: number; // 检测到的缺陷数 / Defects detected
	};
	
	// 加载状态 / Loading state
	loading: boolean;
	
	// 错误信息 / Error message
	error: string | null;
}

const initialState: TestingState = {
	currentSession: null,
	status: 'completed',
	signalBuffer: [],
	processedBuffer: [],
	defects: [],
	progress: {
		startTime: null,
		currentTime: 0,
		duration: 0,
		samplesCollected: 0,
		defectsDetected: 0
	},
	loading: false,
	error: null
};

/**
 * 默认检测参数 / Default testing parameters
 */
const defaultParameters: TestingParameters = {
	gain: 40,
	filter: 'bandpass',
	velocity: 1.0,
	gateA: {
		enabled: true,
		start: 0,
		width: 1.0,
		height: 5.0,
		alarmThreshold: 1.5,
		color: '#FFD700'
	},
	gateB: {
		enabled: true,
		start: 1.0,
		width: 1.0,
		height: 5.0,
		alarmThreshold: 2.0,
		color: '#FF69B4'
	},
	threshold: 1.0
};

/**
 * 创建检测Store / Create Testing Store
 */
function createTestingStore() {
	const { subscribe, set, update } = writable<TestingState>(initialState);
	
	// 服务实例 / Service instances
	let dataAcquisition: DataAcquisitionService | null = null;
	let signalProcessor: SignalProcessor | null = null;
	let progressInterval: ReturnType<typeof setInterval> | null = null;
	let batchSaveInterval: ReturnType<typeof setInterval> | null = null;
	
	const supabase = getSupabaseClient();

	return {
		subscribe,

		/**
		 * 开始检测 / Start testing
		 */
		async startTesting(projectName: string, parameters: TestingParameters = defaultParameters) {
			try {
				update(state => ({ ...state, loading: true, error: null }));

				// 获取当前用户 / Get current user
				const auth = get(authStore);
				if (!auth.user) {
					throw new Error('User not authenticated');
				}

				// 创建新会话 / Create new session
				const session: Omit<TestingSession, 'id' | 'createdAt' | 'updatedAt'> = {
					projectName,
					operatorId: auth.user.id,
					startTime: new Date(),
					status: 'running',
					parameters,
					metadata: {}
				};

				// 保存会话到数据库 / Save session to database
				const { data: sessionData, error: sessionError } = await supabase
					.from('testing_sessions')
					.insert({
						project_name: session.projectName,
						operator_id: session.operatorId,
						start_time: session.startTime.toISOString(),
						status: session.status,
						parameters: session.parameters,
						metadata: session.metadata
					})
					.select()
					.single();

				if (sessionError) throw sessionError;

				const newSession: TestingSession = {
					id: sessionData.id,
					projectName: sessionData.project_name,
					operatorId: sessionData.operator_id,
					startTime: new Date(sessionData.start_time),
					endTime: sessionData.end_time ? new Date(sessionData.end_time) : undefined,
					status: sessionData.status as TestingStatus,
					parameters: sessionData.parameters as TestingParameters,
					metadata: sessionData.metadata || {},
					createdAt: new Date(sessionData.created_at),
					updatedAt: new Date(sessionData.updated_at)
				};

				// 初始化信号处理器 / Initialize signal processor
				signalProcessor = new SignalProcessor();
				signalProcessor.setGain(parameters.gain);
				signalProcessor.setFilter(parameters.filter);

				// 初始化数据采集服务 / Initialize data acquisition service
				dataAcquisition = new DataAcquisitionService({
					samplingRate: 100,
					frequency: 100,
					amplitude: 1.0,
					noiseLevel: 0.1,
					defects: [] // 可以从参数中配置 / Can be configured from parameters
				});

				// 注册数据回调 / Register data callback
				dataAcquisition.onData((rawData) => {
					this.handleNewSignalData(rawData);
				});

				// 启动数据采集 / Start data acquisition
				dataAcquisition.start();

				// 启动进度跟踪 / Start progress tracking
				this.startProgressTracking();

				// 启动批量保存 / Start batch saving
				this.startBatchSaving();

				update(state => ({
					...state,
					currentSession: newSession,
					status: 'running',
					signalBuffer: [],
					processedBuffer: [],
					defects: [],
					progress: {
						startTime: new Date(),
						currentTime: 0,
						duration: 0,
						samplesCollected: 0,
						defectsDetected: 0
					},
					loading: false
				}));

				return { success: true, sessionId: newSession.id };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to start testing';
				update(state => ({ ...state, loading: false, error: errorMessage }));
				return { success: false, error: errorMessage };
			}
		},

		/**
		 * 暂停检测 / Pause testing
		 */
		pauseTesting() {
			if (dataAcquisition) {
				dataAcquisition.pause();
			}
			
			this.stopProgressTracking();
			
			update(state => ({
				...state,
				status: 'paused'
			}));

			// 更新数据库状态 / Update database status
			this.updateSessionStatus('paused');
		},

		/**
		 * 恢复检测 / Resume testing
		 */
		resumeTesting() {
			if (dataAcquisition) {
				dataAcquisition.resume();
			}
			
			this.startProgressTracking();
			
			update(state => ({
				...state,
				status: 'running'
			}));

			// 更新数据库状态 / Update database status
			this.updateSessionStatus('running');
		},

		/**
		 * 停止检测 / Stop testing
		 */
		async stopTesting() {
			try {
				update(state => ({ ...state, loading: true }));

				// 停止数据采集 / Stop data acquisition
				if (dataAcquisition) {
					dataAcquisition.stop();
					dataAcquisition = null;
				}

				// 停止进度跟踪 / Stop progress tracking
				this.stopProgressTracking();

				// 停止批量保存 / Stop batch saving
				this.stopBatchSaving();

				// 保存剩余数据 / Save remaining data
				await this.saveBatchData();

				// 更新会话状态 / Update session status
				const state = get({ subscribe });
				if (state.currentSession) {
					await supabase
						.from('testing_sessions')
						.update({
							status: 'completed',
							end_time: new Date().toISOString(),
							updated_at: new Date().toISOString()
						})
						.eq('id', state.currentSession.id);
				}

				update(state => ({
					...state,
					status: 'completed',
					loading: false
				}));

				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to stop testing';
				update(state => ({ ...state, loading: false, error: errorMessage }));
				return { success: false, error: errorMessage };
			}
		},

		/**
		 * 处理新信号数据 / Handle new signal data
		 */
		handleNewSignalData(rawData: SignalData) {
			if (!signalProcessor) return;

			// 处理信号 / Process signal
			const processedData = signalProcessor.processSignal(rawData);

			update(state => {
				const newSignalBuffer = [...state.signalBuffer, rawData];
				const newProcessedBuffer = [...state.processedBuffer, processedData];

				return {
					...state,
					signalBuffer: newSignalBuffer,
					processedBuffer: newProcessedBuffer,
					progress: {
						...state.progress,
						currentTime: rawData.position,
						samplesCollected: state.progress.samplesCollected + 1
					}
				};
			});
		},

		/**
		 * 检测缺陷 / Detect defects
		 */
		detectDefects() {
			const state = get({ subscribe });
			if (!signalProcessor || !state.currentSession) return;

			const { parameters } = state.currentSession;
			const defects = signalProcessor.detectDefects(
				state.processedBuffer,
				parameters.threshold,
				parameters.gateA,
				parameters.gateB
			);

			if (defects.length > 0) {
				update(s => ({
					...s,
					defects: [...s.defects, ...defects],
					progress: {
						...s.progress,
						defectsDetected: s.progress.defectsDetected + defects.length
					}
				}));

				// 保存缺陷到数据库 / Save defects to database
				this.saveDefects(defects);
			}
		},

		/**
		 * 保存缺陷到数据库 / Save defects to database
		 */
		async saveDefects(defects: Defect[]) {
			const state = get({ subscribe });
			if (!state.currentSession) return;

			try {
				const defectRecords = defects.map(d => ({
					session_id: state.currentSession!.id,
					position: d.position,
					amplitude: d.amplitude,
					severity: d.severity,
					gate_triggered: d.gateTriggered,
					timestamp: d.timestamp.toISOString(),
					notes: d.notes
				}));

				await supabase.from('defects').insert(defectRecords);
			} catch (error) {
				console.error('Failed to save defects:', error);
			}
		},

		/**
		 * 批量保存数据 / Batch save data
		 */
		async saveBatchData() {
			const state = get({ subscribe });
			if (!state.currentSession || state.processedBuffer.length === 0) return;

			try {
				// 检测缺陷 / Detect defects
				this.detectDefects();

				// 保存信号数据 / Save signal data
				const signalRecords = state.processedBuffer.map(d => ({
					session_id: state.currentSession!.id,
					timestamp: d.timestamp,
					amplitude: d.amplitude,
					phase: d.phase,
					position: d.position,
					frequency: d.frequency
				}));

				await supabase.from('signal_data').insert(signalRecords);

				// 清空缓冲区 / Clear buffers
				update(s => ({
					...s,
					signalBuffer: [],
					processedBuffer: []
				}));
			} catch (error) {
				console.error('Failed to save batch data:', error);
			}
		},

		/**
		 * 启动进度跟踪 / Start progress tracking
		 */
		startProgressTracking() {
			if (progressInterval) return;

			progressInterval = setInterval(() => {
				update(state => {
					if (!state.progress.startTime) return state;

					const duration = (Date.now() - state.progress.startTime.getTime()) / 1000;

					return {
						...state,
						progress: {
							...state.progress,
							duration
						}
					};
				});
			}, 1000); // 每秒更新 / Update every second
		},

		/**
		 * 停止进度跟踪 / Stop progress tracking
		 */
		stopProgressTracking() {
			if (progressInterval) {
				clearInterval(progressInterval);
				progressInterval = null;
			}
		},

		/**
		 * 启动批量保存 / Start batch saving
		 */
		startBatchSaving() {
			if (batchSaveInterval) return;

			batchSaveInterval = setInterval(() => {
				const state = get({ subscribe });
				// 每100个样本保存一次 / Save every 100 samples
				if (state.processedBuffer.length >= 100) {
					this.saveBatchData();
				}
			}, 1000); // 每秒检查 / Check every second
		},

		/**
		 * 停止批量保存 / Stop batch saving
		 */
		stopBatchSaving() {
			if (batchSaveInterval) {
				clearInterval(batchSaveInterval);
				batchSaveInterval = null;
			}
		},

		/**
		 * 更新会话状态 / Update session status
		 */
		async updateSessionStatus(status: TestingStatus) {
			const state = get({ subscribe });
			if (!state.currentSession) return;

			try {
				await supabase
					.from('testing_sessions')
					.update({
						status,
						updated_at: new Date().toISOString()
					})
					.eq('id', state.currentSession.id);
			} catch (error) {
				console.error('Failed to update session status:', error);
			}
		},

		/**
		 * 更新检测参数 / Update testing parameters
		 */
		async updateParameters(parameters: Partial<TestingParameters>) {
			update(state => {
				if (!state.currentSession) return state;

				const updatedParameters = {
					...state.currentSession.parameters,
					...parameters
				};

				// 更新信号处理器 / Update signal processor
				if (signalProcessor) {
					if (parameters.gain !== undefined) {
						signalProcessor.setGain(parameters.gain);
					}
					if (parameters.filter !== undefined) {
						signalProcessor.setFilter(parameters.filter);
					}
				}

				return {
					...state,
					currentSession: {
						...state.currentSession,
						parameters: updatedParameters
					}
				};
			});

			// 保存到数据库 / Save to database
			const state = get({ subscribe });
			if (state.currentSession) {
				try {
					await supabase
						.from('testing_sessions')
						.update({
							parameters: state.currentSession.parameters,
							updated_at: new Date().toISOString()
						})
						.eq('id', state.currentSession.id);
				} catch (error) {
					console.error('Failed to update parameters:', error);
				}
			}
		},

		/**
		 * 加载历史会话 / Load historical session
		 */
		async loadSession(sessionId: string) {
			try {
				update(state => ({ ...state, loading: true, error: null }));

				// 加载会话 / Load session
				const { data: sessionData, error: sessionError } = await supabase
					.from('testing_sessions')
					.select('*')
					.eq('id', sessionId)
					.single();

				if (sessionError) throw sessionError;

				const session: TestingSession = {
					id: sessionData.id,
					projectName: sessionData.project_name,
					operatorId: sessionData.operator_id,
					startTime: new Date(sessionData.start_time),
					endTime: sessionData.end_time ? new Date(sessionData.end_time) : undefined,
					status: sessionData.status as TestingStatus,
					parameters: sessionData.parameters as TestingParameters,
					metadata: sessionData.metadata || {},
					createdAt: new Date(sessionData.created_at),
					updatedAt: new Date(sessionData.updated_at)
				};

				// 加载信号数据 / Load signal data
				const { data: signalData, error: signalError } = await supabase
					.from('signal_data')
					.select('*')
					.eq('session_id', sessionId)
					.order('timestamp', { ascending: true });

				if (signalError) throw signalError;

				const signals: SignalData[] = signalData.map(d => ({
					timestamp: d.timestamp,
					amplitude: d.amplitude,
					phase: d.phase,
					position: d.position,
					frequency: d.frequency
				}));

				// 加载缺陷 / Load defects
				const { data: defectData, error: defectError } = await supabase
					.from('defects')
					.select('*')
					.eq('session_id', sessionId)
					.order('timestamp', { ascending: true });

				if (defectError) throw defectError;

				const defects: Defect[] = defectData.map(d => ({
					id: d.id,
					position: d.position,
					amplitude: d.amplitude,
					severity: d.severity as Defect['severity'],
					timestamp: new Date(d.timestamp),
					gateTriggered: d.gate_triggered as Defect['gateTriggered'],
					notes: d.notes
				}));

				update(state => ({
					...state,
					currentSession: session,
					status: session.status,
					signalBuffer: signals,
					processedBuffer: signals,
					defects,
					progress: {
						startTime: session.startTime,
						currentTime: signals.length > 0 ? signals[signals.length - 1].position : 0,
						duration: session.endTime 
							? (session.endTime.getTime() - session.startTime.getTime()) / 1000 
							: 0,
						samplesCollected: signals.length,
						defectsDetected: defects.length
					},
					loading: false
				}));

				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to load session';
				update(state => ({ ...state, loading: false, error: errorMessage }));
				return { success: false, error: errorMessage };
			}
		},

		/**
		 * 清除当前会话 / Clear current session
		 */
		clearSession() {
			// 停止所有服务 / Stop all services
			if (dataAcquisition) {
				dataAcquisition.stop();
				dataAcquisition = null;
			}
			
			this.stopProgressTracking();
			this.stopBatchSaving();

			set(initialState);
		},

		/**
		 * 清除错误 / Clear error
		 */
		clearError() {
			update(state => ({ ...state, error: null }));
		}
	};
}

export const testingStore = createTestingStore();

/**
 * 派生Store：是否正在检测 / Derived store: is testing
 */
export const isTesting: Readable<boolean> = derived(
	testingStore,
	$testing => $testing.status === 'running'
);

/**
 * 派生Store：是否已暂停 / Derived store: is paused
 */
export const isPaused: Readable<boolean> = derived(
	testingStore,
	$testing => $testing.status === 'paused'
);

/**
 * 派生Store：可以开始检测 / Derived store: can start testing
 */
export const canStartTesting: Readable<boolean> = derived(
	testingStore,
	$testing => $testing.status === 'completed' || $testing.status === 'error'
);

/**
 * 派生Store：最新信号数据 / Derived store: latest signal data
 */
export const latestSignal: Readable<SignalData | null> = derived(
	testingStore,
	$testing => {
		const buffer = $testing.processedBuffer;
		return buffer.length > 0 ? buffer[buffer.length - 1] : null;
	}
);

/**
 * 派生Store：检测统计 / Derived store: testing statistics
 */
export const testingStats: Readable<{
	duration: string;
	samplesCollected: number;
	defectsDetected: number;
	samplingRate: number;
}> = derived(
	testingStore,
	$testing => {
		const { duration, samplesCollected, defectsDetected } = $testing.progress;
		
		// 格式化时长 / Format duration
		const hours = Math.floor(duration / 3600);
		const minutes = Math.floor((duration % 3600) / 60);
		const seconds = Math.floor(duration % 60);
		const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		
		// 计算采样率 / Calculate sampling rate
		const samplingRate = duration > 0 ? samplesCollected / duration : 0;
		
		return {
			duration: durationStr,
			samplesCollected,
			defectsDetected,
			samplingRate: Math.round(samplingRate)
		};
	}
);

