/**
 * Supabase客户端封装 / Supabase Client Wrapper
 * 
 * 提供与Supabase数据库交互的统一接口
 * Provides unified interface for Supabase database interactions
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { TestingSession, SessionFilters, CompleteSessionData } from '$lib/types/session';
import type { SignalData, Defect } from '$lib/types/signal';
import type { CalibrationData, Report } from '$lib/types/database';
import type {
	DbTestingSession,
	DbSignalData,
	DbDefect,
	DbCalibration,
	DbReport
} from '$lib/types/database';

/**
 * Supabase客户端单例 / Supabase Client Singleton
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * 获取Supabase客户端实例 / Get Supabase Client Instance
 */
export function getSupabaseClient(): SupabaseClient {
	if (!supabaseClient) {
		supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	}
	return supabaseClient;
}

/**
 * 数据转换工具 / Data Transformation Utilities
 */

// 将数据库时间戳转换为Date对象 / Convert database timestamp to Date
function parseDate(dateString: string | undefined): Date | undefined {
	return dateString ? new Date(dateString) : undefined;
}

// 将TestingSession转换为数据库格式 / Convert TestingSession to database format
function sessionToDb(session: Partial<TestingSession>): Partial<DbTestingSession> {
	return {
		id: session.id,
		project_name: session.projectName,
		operator_id: session.operatorId,
		start_time: session.startTime?.toISOString(),
		end_time: session.endTime?.toISOString(),
		status: session.status,
		parameters: session.parameters as unknown as Record<string, unknown>,
		metadata: session.metadata,
		created_at: session.createdAt?.toISOString(),
		updated_at: session.updatedAt?.toISOString()
	};
}

// 将数据库格式转换为TestingSession / Convert database format to TestingSession
function dbToSession(dbSession: DbTestingSession): TestingSession {
	return {
		id: dbSession.id,
		projectName: dbSession.project_name,
		operatorId: dbSession.operator_id,
		startTime: new Date(dbSession.start_time),
		endTime: parseDate(dbSession.end_time),
		status: dbSession.status,
		parameters: dbSession.parameters as any,
		metadata: dbSession.metadata,
		createdAt: new Date(dbSession.created_at),
		updatedAt: new Date(dbSession.updated_at)
	};
}

// 将SignalData转换为数据库格式 / Convert SignalData to database format
function signalToDb(sessionId: string, signal: SignalData): Omit<DbSignalData, 'id' | 'created_at'> {
	return {
		session_id: sessionId,
		timestamp: signal.timestamp,
		amplitude: signal.amplitude,
		phase: signal.phase,
		position: signal.position,
		frequency: signal.frequency
	};
}

// 将数据库格式转换为SignalData / Convert database format to SignalData
function dbToSignal(dbSignal: DbSignalData): SignalData {
	return {
		timestamp: dbSignal.timestamp,
		amplitude: dbSignal.amplitude,
		phase: dbSignal.phase || 0,
		position: dbSignal.position,
		frequency: dbSignal.frequency || 0
	};
}

// 将Defect转换为数据库格式 / Convert Defect to database format
function defectToDb(sessionId: string, defect: Partial<Defect>): Partial<DbDefect> {
	return {
		id: defect.id,
		session_id: sessionId,
		position: defect.position,
		amplitude: defect.amplitude,
		severity: defect.severity,
		gate_triggered: defect.gateTriggered,
		timestamp: defect.timestamp?.toISOString(),
		notes: defect.notes
	};
}

// 将数据库格式转换为Defect / Convert database format to Defect
function dbToDefect(dbDefect: DbDefect): Defect {
	return {
		id: dbDefect.id,
		position: dbDefect.position,
		amplitude: dbDefect.amplitude,
		severity: dbDefect.severity,
		timestamp: new Date(dbDefect.timestamp),
		gateTriggered: (dbDefect.gate_triggered || 'A') as 'A' | 'B' | 'both',
		notes: dbDefect.notes
	};
}

// 将CalibrationData转换为数据库格式 / Convert CalibrationData to database format
function calibrationToDb(calibration: Partial<CalibrationData>): Partial<DbCalibration> {
	return {
		id: calibration.id,
		operator_id: calibration.operatorId,
		calibration_type: calibration.calibrationType,
		reference_signal: calibration.referenceSignal,
		coefficients: calibration.coefficients,
		standard_block: calibration.standardBlock,
		calibration_date: calibration.calibrationDate?.toISOString(),
		expiry_date: calibration.expiryDate?.toISOString(),
		is_active: calibration.isActive,
		notes: calibration.notes
	};
}

// 将数据库格式转换为CalibrationData / Convert database format to CalibrationData
function dbToCalibration(dbCalibration: DbCalibration): CalibrationData {
	return {
		id: dbCalibration.id,
		operatorId: dbCalibration.operator_id,
		calibrationType: dbCalibration.calibration_type,
		referenceSignal: dbCalibration.reference_signal,
		coefficients: dbCalibration.coefficients,
		standardBlock: dbCalibration.standard_block,
		calibrationDate: new Date(dbCalibration.calibration_date),
		expiryDate: parseDate(dbCalibration.expiry_date),
		isActive: dbCalibration.is_active,
		notes: dbCalibration.notes,
		createdAt: new Date(dbCalibration.created_at)
	};
}

// 将Report转换为数据库格式 / Convert Report to database format
function reportToDb(report: Partial<Report>): Partial<DbReport> {
	return {
		id: report.id,
		session_id: report.sessionId,
		report_type: report.reportType,
		standard: report.standard,
		content: report.content,
		pdf_url: report.pdfUrl,
		generated_by: report.generatedBy,
		generated_at: report.generatedAt?.toISOString()
	};
}

// 将数据库格式转换为Report / Convert database format to Report
function dbToReport(dbReport: DbReport): Report {
	return {
		id: dbReport.id,
		sessionId: dbReport.session_id,
		reportType: dbReport.report_type,
		standard: dbReport.standard,
		content: dbReport.content,
		pdfUrl: dbReport.pdf_url,
		generatedBy: dbReport.generated_by,
		generatedAt: new Date(dbReport.generated_at),
		createdAt: new Date(dbReport.created_at)
	};
}

/**
 * Supabase服务类 / Supabase Service Class
 */
export class SupabaseService {
	private client: SupabaseClient;

	constructor() {
		this.client = getSupabaseClient();
	}

	/**
	 * 会话管理 / Session Management
	 */

	/**
	 * 创建新的检测会话 / Create new testing session
	 */
	async createSession(session: Omit<TestingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
		const dbSession = sessionToDb({
			...session,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		const { data, error } = await this.client
			.from('testing_sessions')
			.insert(dbSession)
			.select('id')
			.single();

		if (error) throw new Error(`Failed to create session: ${error.message}`);
		return data.id;
	}

	/**
	 * 更新检测会话 / Update testing session
	 */
	async updateSession(id: string, updates: Partial<TestingSession>): Promise<void> {
		const dbUpdates = sessionToDb({
			...updates,
			updatedAt: new Date()
		});

		const { error } = await this.client
			.from('testing_sessions')
			.update(dbUpdates)
			.eq('id', id);

		if (error) throw new Error(`Failed to update session: ${error.message}`);
	}

	/**
	 * 获取单个检测会话 / Get single testing session
	 */
	async getSession(id: string): Promise<TestingSession> {
		const { data, error } = await this.client
			.from('testing_sessions')
			.select('*')
			.eq('id', id)
			.single();

		if (error) throw new Error(`Failed to get session: ${error.message}`);
		return dbToSession(data);
	}

	/**
	 * 获取会话列表 / Get session list
	 */
	async listSessions(filters?: SessionFilters): Promise<TestingSession[]> {
		let query = this.client.from('testing_sessions').select('*');

		if (filters?.operatorId) {
			query = query.eq('operator_id', filters.operatorId);
		}
		if (filters?.status) {
			query = query.eq('status', filters.status);
		}
		if (filters?.startDate) {
			query = query.gte('start_time', filters.startDate.toISOString());
		}
		if (filters?.endDate) {
			query = query.lte('start_time', filters.endDate.toISOString());
		}
		if (filters?.projectName) {
			query = query.ilike('project_name', `%${filters.projectName}%`);
		}

		query = query.order('start_time', { ascending: false });

		const { data, error } = await query;

		if (error) throw new Error(`Failed to list sessions: ${error.message}`);
		return data.map(dbToSession);
	}

	/**
	 * 删除会话（软删除）/ Delete session (soft delete)
	 */
	async deleteSession(id: string): Promise<void> {
		await this.updateSession(id, { status: 'error' });
	}

	/**
	 * 信号数据管理 / Signal Data Management
	 */

	/**
	 * 批量保存信号数据 / Batch save signal data
	 */
	async saveSignalData(sessionId: string, data: SignalData[]): Promise<void> {
		const dbData = data.map((signal) => signalToDb(sessionId, signal));

		const { error } = await this.client.from('signal_data').insert(dbData);

		if (error) throw new Error(`Failed to save signal data: ${error.message}`);
	}

	/**
	 * 获取会话的信号数据 / Get signal data for session
	 */
	async getSignalData(sessionId: string, limit?: number): Promise<SignalData[]> {
		let query = this.client
			.from('signal_data')
			.select('*')
			.eq('session_id', sessionId)
			.order('timestamp', { ascending: true });

		if (limit) {
			query = query.limit(limit);
		}

		const { data, error } = await query;

		if (error) throw new Error(`Failed to get signal data: ${error.message}`);
		return data.map(dbToSignal);
	}

	/**
	 * 获取信号数据数量 / Get signal data count
	 */
	async getSignalDataCount(sessionId: string): Promise<number> {
		const { count, error } = await this.client
			.from('signal_data')
			.select('*', { count: 'exact', head: true })
			.eq('session_id', sessionId);

		if (error) throw new Error(`Failed to count signal data: ${error.message}`);
		return count || 0;
	}

	/**
	 * 缺陷管理 / Defect Management
	 */

	/**
	 * 保存缺陷记录 / Save defect record
	 */
	async saveDefect(sessionId: string, defect: Omit<Defect, 'id'>): Promise<string> {
		const dbDefect = defectToDb(sessionId, defect);

		const { data, error } = await this.client
			.from('defects')
			.insert(dbDefect)
			.select('id')
			.single();

		if (error) throw new Error(`Failed to save defect: ${error.message}`);
		return data.id;
	}

	/**
	 * 批量保存缺陷记录 / Batch save defect records
	 */
	async saveDefects(sessionId: string, defects: Omit<Defect, 'id'>[]): Promise<void> {
		const dbDefects = defects.map((defect) => defectToDb(sessionId, defect));

		const { error } = await this.client.from('defects').insert(dbDefects);

		if (error) throw new Error(`Failed to save defects: ${error.message}`);
	}

	/**
	 * 获取会话的缺陷列表 / Get defects for session
	 */
	async getDefects(sessionId: string): Promise<Defect[]> {
		const { data, error } = await this.client
			.from('defects')
			.select('*')
			.eq('session_id', sessionId)
			.order('timestamp', { ascending: true });

		if (error) throw new Error(`Failed to get defects: ${error.message}`);
		return data.map(dbToDefect);
	}

	/**
	 * 更新缺陷记录 / Update defect record
	 */
	async updateDefect(id: string, updates: Partial<Defect>): Promise<void> {
		const dbUpdates = defectToDb('', updates);
		delete dbUpdates.session_id;

		const { error } = await this.client.from('defects').update(dbUpdates).eq('id', id);

		if (error) throw new Error(`Failed to update defect: ${error.message}`);
	}

	/**
	 * 校准数据管理 / Calibration Data Management
	 */

	/**
	 * 保存校准数据 / Save calibration data
	 */
	async saveCalibration(calibration: Omit<CalibrationData, 'id' | 'createdAt'>): Promise<string> {
		const dbCalibration = calibrationToDb(calibration);

		const { data, error } = await this.client
			.from('calibrations')
			.insert(dbCalibration)
			.select('id')
			.single();

		if (error) throw new Error(`Failed to save calibration: ${error.message}`);
		return data.id;
	}

	/**
	 * 获取最新的活动校准 / Get latest active calibration
	 */
	async getLatestCalibration(calibrationType?: string): Promise<CalibrationData | null> {
		let query = this.client
			.from('calibrations')
			.select('*')
			.eq('is_active', true)
			.order('calibration_date', { ascending: false })
			.limit(1);

		if (calibrationType) {
			query = query.eq('calibration_type', calibrationType);
		}

		const { data, error } = await query.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // No rows returned
			throw new Error(`Failed to get latest calibration: ${error.message}`);
		}

		return dbToCalibration(data);
	}

	/**
	 * 获取所有校准记录 / Get all calibration records
	 */
	async getCalibrations(operatorId?: string): Promise<CalibrationData[]> {
		let query = this.client
			.from('calibrations')
			.select('*')
			.order('calibration_date', { ascending: false });

		if (operatorId) {
			query = query.eq('operator_id', operatorId);
		}

		const { data, error } = await query;

		if (error) throw new Error(`Failed to get calibrations: ${error.message}`);
		return data.map(dbToCalibration);
	}

	/**
	 * 停用校准 / Deactivate calibration
	 */
	async deactivateCalibration(id: string): Promise<void> {
		const { error } = await this.client
			.from('calibrations')
			.update({ is_active: false })
			.eq('id', id);

		if (error) throw new Error(`Failed to deactivate calibration: ${error.message}`);
	}

	/**
	 * 报告管理 / Report Management
	 */

	/**
	 * 保存报告元数据 / Save report metadata
	 */
	async saveReport(report: Omit<Report, 'id' | 'createdAt'>): Promise<string> {
		const dbReport = reportToDb(report);

		const { data, error } = await this.client
			.from('reports')
			.insert(dbReport)
			.select('id')
			.single();

		if (error) throw new Error(`Failed to save report: ${error.message}`);
		return data.id;
	}

	/**
	 * 获取报告 / Get report
	 */
	async getReport(id: string): Promise<Report> {
		const { data, error } = await this.client
			.from('reports')
			.select('*')
			.eq('id', id)
			.single();

		if (error) throw new Error(`Failed to get report: ${error.message}`);
		return dbToReport(data);
	}

	/**
	 * 获取会话的报告列表 / Get reports for session
	 */
	async getReportsForSession(sessionId: string): Promise<Report[]> {
		const { data, error } = await this.client
			.from('reports')
			.select('*')
			.eq('session_id', sessionId)
			.order('generated_at', { ascending: false });

		if (error) throw new Error(`Failed to get reports: ${error.message}`);
		return data.map(dbToReport);
	}

	/**
	 * 上传报告PDF / Upload report PDF
	 */
	async uploadReportPDF(reportId: string, pdfBlob: Blob): Promise<string> {
		const filePath = `${reportId}/report.pdf`;

		const { error: uploadError } = await this.client.storage
			.from('report-pdfs')
			.upload(filePath, pdfBlob, {
				contentType: 'application/pdf',
				upsert: true
			});

		if (uploadError) throw new Error(`Failed to upload PDF: ${uploadError.message}`);

		const { data } = this.client.storage.from('report-pdfs').getPublicUrl(filePath);

		// Update report with PDF URL
		const { error: updateError } = await this.client
			.from('reports')
			.update({ pdf_url: data.publicUrl })
			.eq('id', reportId);

		if (updateError) throw new Error(`Failed to update report with PDF URL: ${updateError.message}`);

		return data.publicUrl;
	}

	/**
	 * 下载报告PDF / Download report PDF
	 */
	async downloadReportPDF(reportId: string): Promise<Blob> {
		const filePath = `${reportId}/report.pdf`;

		const { data, error } = await this.client.storage.from('report-pdfs').download(filePath);

		if (error) throw new Error(`Failed to download PDF: ${error.message}`);
		return data;
	}

	/**
	 * 综合查询 / Complex Queries
	 */

	/**
	 * 获取完整的会话数据（包含信号和缺陷）/ Get complete session data
	 */
	async getCompleteSessionData(sessionId: string): Promise<CompleteSessionData> {
		const [session, signalData, defects] = await Promise.all([
			this.getSession(sessionId),
			this.getSignalData(sessionId),
			this.getDefects(sessionId)
		]);

		return {
			...session,
			signalData,
			defects
		};
	}
}

/**
 * 导出默认实例 / Export default instance
 */
export const supabaseService = new SupabaseService();