/**
 * 报告导出服务 / Report Export Service
 * 
 * Handles PDF generation, export, and storage operations for reports.
 */

import { createReportGenerator, type ReportGenerationConfig } from './report-generator';
import { supabaseService } from './supabase';
import type { CompleteSessionData, InternationalStandard } from '$lib/types';

/**
 * 报告导出选项 / Report Export Options
 */
export interface ReportExportOptions extends ReportGenerationConfig {
	uploadToStorage?: boolean;
	downloadLocally?: boolean;
	fileName?: string;
}

/**
 * 报告导出结果 / Report Export Result
 */
export interface ReportExportResult {
	reportId: string;
	pdfUrl?: string;
	localDownload?: boolean;
	success: boolean;
	error?: string;
}

/**
 * 报告导出服务类 / Report Export Service Class
 */
export class ReportExportService {
	/**
	 * 生成并导出报告 / Generate and Export Report
	 */
	async generateAndExportReport(
		sessionId: string,
		operatorId: string,
		operatorName: string,
		options: ReportExportOptions = {}
	): Promise<ReportExportResult> {
		try {
			// 1. Fetch complete session data
			const sessionData = await supabaseService.getCompleteSessionData(sessionId);

			// 2. Generate PDF
			const generator = createReportGenerator();
			const pdfBlob = await generator.generateReport(sessionData, operatorName, options);

			// 3. Prepare report metadata
			const reportMetadata = this.prepareReportMetadata(sessionData, options);

			// 4. Save report metadata to database
			const reportId = await supabaseService.saveReport({
				sessionId: sessionData.id,
				reportType: 'standard',
				standard: options.standard || 'ASME',
				content: reportMetadata,
				generatedBy: operatorId,
				generatedAt: new Date()
			});

			let pdfUrl: string | undefined;

			// 5. Upload to Supabase Storage if requested
			if (options.uploadToStorage !== false) {
				try {
					pdfUrl = await supabaseService.uploadReportPDF(reportId, pdfBlob);
				} catch (uploadError) {
					console.error('Failed to upload PDF to storage:', uploadError);
					// Continue even if upload fails
				}
			}

			// 6. Download locally if requested
			if (options.downloadLocally !== false) {
				this.downloadPDF(pdfBlob, options.fileName || `report-${sessionData.projectName}-${Date.now()}.pdf`);
			}

			return {
				reportId,
				pdfUrl,
				localDownload: options.downloadLocally !== false,
				success: true
			};
		} catch (error) {
			console.error('Failed to generate and export report:', error);
			return {
				reportId: '',
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	/**
	 * 下载已存在的报告 / Download Existing Report
	 */
	async downloadExistingReport(reportId: string, fileName?: string): Promise<void> {
		try {
			// Try to download from storage
			const pdfBlob = await supabaseService.downloadReportPDF(reportId);
			this.downloadPDF(pdfBlob, fileName || `report-${reportId}.pdf`);
		} catch (error) {
			console.error('Failed to download report:', error);
			throw new Error('Failed to download report. The PDF may not be available.');
		}
	}

	/**
	 * 重新生成报告 / Regenerate Report
	 */
	async regenerateReport(
		reportId: string,
		operatorName: string,
		options: ReportExportOptions = {}
	): Promise<ReportExportResult> {
		try {
			// Get existing report
			const report = await supabaseService.getReport(reportId);

			// Regenerate with same session
			return await this.generateAndExportReport(
				report.sessionId,
				report.generatedBy,
				operatorName,
				{
					...options,
					standard: (report.standard as InternationalStandard) || 'ASME'
				}
			);
		} catch (error) {
			console.error('Failed to regenerate report:', error);
			return {
				reportId: '',
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	/**
	 * 批量导出报告 / Batch Export Reports
	 */
	async batchExportReports(
		sessionIds: string[],
		operatorId: string,
		operatorName: string,
		options: ReportExportOptions = {}
	): Promise<ReportExportResult[]> {
		const results: ReportExportResult[] = [];

		for (const sessionId of sessionIds) {
			const result = await this.generateAndExportReport(
				sessionId,
				operatorId,
				operatorName,
				{
					...options,
					downloadLocally: false // Don't auto-download in batch mode
				}
			);
			results.push(result);
		}

		return results;
	}

	/**
	 * 获取报告列表 / Get Report List
	 */
	async getReportList(filters?: {
		sessionId?: string;
		standard?: string;
		generatedBy?: string;
		limit?: number;
	}): Promise<any[]> {
		try {
			// Use raw query to get joined data
			const client = supabaseService['client'];
			
			let query = client
				.from('reports')
				.select(`
					*,
					testing_sessions!inner (
						project_name,
						start_time,
						status
					),
					profiles!inner (
						username,
						full_name
					)
				`)
				.order('generated_at', { ascending: false });

			if (filters?.sessionId) {
				query = query.eq('session_id', filters.sessionId);
			}

			if (filters?.standard) {
				query = query.eq('standard', filters.standard);
			}

			if (filters?.generatedBy) {
				query = query.eq('generated_by', filters.generatedBy);
			}

			if (filters?.limit) {
				query = query.limit(filters.limit);
			}

			const { data, error } = await query;

			if (error) throw error;

			// Transform data to a more usable format
			return (data || []).map((report: any) => ({
				id: report.id,
				sessionId: report.session_id,
				projectName: report.testing_sessions?.project_name || 'Unknown',
				standard: report.standard,
				reportType: report.report_type,
				pdfUrl: report.pdf_url,
				generatedAt: report.generated_at,
				generatedBy: report.generated_by,
				operatorName: report.profiles?.full_name || report.profiles?.username || 'Unknown',
				sessionStartTime: report.testing_sessions?.start_time,
				sessionStatus: report.testing_sessions?.status,
				content: report.content
			}));
		} catch (error) {
			console.error('Failed to get report list:', error);
			return [];
		}
	}

	/**
	 * 删除报告 / Delete Report
	 */
	async deleteReport(reportId: string): Promise<void> {
		try {
			// Get report to find PDF URL
			const report = await supabaseService.getReport(reportId);

			// Delete PDF from storage if exists
			if (report.pdfUrl) {
				try {
					const client = supabaseService['client'];
					const filePath = `${reportId}/report.pdf`;
					await client.storage.from('report-pdfs').remove([filePath]);
				} catch (storageError) {
					console.warn('Failed to delete PDF from storage:', storageError);
					// Continue with database deletion
				}
			}

			// Delete report record from database
			const client = supabaseService['client'];
			const { error } = await client
				.from('reports')
				.delete()
				.eq('id', reportId);

			if (error) throw error;
		} catch (error) {
			console.error('Failed to delete report:', error);
			throw new Error('Failed to delete report');
		}
	}

	/**
	 * 准备报告元数据 / Prepare Report Metadata
	 */
	private prepareReportMetadata(
		sessionData: CompleteSessionData,
		options: ReportExportOptions
	): any {
		const criticalDefects = sessionData.defects.filter(d => d.severity === 'critical').length;
		const highDefects = sessionData.defects.filter(d => d.severity === 'high').length;
		const mediumDefects = sessionData.defects.filter(d => d.severity === 'medium').length;
		const lowDefects = sessionData.defects.filter(d => d.severity === 'low').length;

		return {
			projectInfo: {
				name: sessionData.projectName,
				sessionId: sessionData.id,
				startTime: sessionData.startTime,
				endTime: sessionData.endTime,
				status: sessionData.status
			},
			testInfo: {
				parameters: sessionData.parameters,
				standard: options.standard || 'ASME',
				equipmentModel: options.equipmentModel || 'DOPPLER MT-2000',
				equipmentSerial: options.equipmentSerial || 'N/A',
				testLocation: options.testLocation || 'N/A'
			},
			results: {
				totalDataPoints: sessionData.signalData.length,
				totalDefects: sessionData.defects.length,
				criticalDefects,
				highDefects,
				mediumDefects,
				lowDefects,
				averageAmplitude: this.calculateAverage(sessionData.signalData.map(d => d.amplitude)),
				maxAmplitude: Math.max(...sessionData.signalData.map(d => d.amplitude)),
				minAmplitude: Math.min(...sessionData.signalData.map(d => d.amplitude))
			},
			defects: sessionData.defects.map(d => ({
				position: d.position,
				amplitude: d.amplitude,
				severity: d.severity,
				gateTriggered: d.gateTriggered,
				timestamp: d.timestamp,
				notes: d.notes
			})),
			conclusion: this.generateConclusion(criticalDefects, highDefects, sessionData.defects.length)
		};
	}

	/**
	 * 生成结论 / Generate Conclusion
	 */
	private generateConclusion(critical: number, high: number, total: number): string {
		if (critical > 0) {
			return `REJECT: ${critical} critical defect(s) detected. Component does not meet acceptance criteria.`;
		} else if (high > 0) {
			return `CONDITIONAL: ${high} high-severity defect(s) detected. Further evaluation recommended.`;
		} else if (total > 0) {
			return `ACCEPT WITH NOTES: ${total} minor defect(s) detected within acceptable limits.`;
		} else {
			return 'ACCEPT: No defects detected. Component meets all acceptance criteria.';
		}
	}

	/**
	 * 计算平均值 / Calculate Average
	 */
	private calculateAverage(values: number[]): number {
		if (values.length === 0) return 0;
		return values.reduce((sum, val) => sum + val, 0) / values.length;
	}

	/**
	 * 触发浏览器下载PDF / Trigger Browser PDF Download
	 */
	private downloadPDF(blob: Blob, fileName: string): void {
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
}

/**
 * 导出默认实例 / Export Default Instance
 */
export const reportExportService = new ReportExportService();
