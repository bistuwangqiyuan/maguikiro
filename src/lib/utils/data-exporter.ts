/**
 * 数据导出工具 / Data Exporter Utility
 * 
 * 支持多种格式的数据导出：CSV、Excel、JSON
 * Supports multiple export formats: CSV, Excel, JSON
 */

import * as XLSX from 'xlsx';
import type { CompleteSessionData, TestingSession } from '$lib/types/session';
import type { SignalData, Defect } from '$lib/types/signal';

/**
 * 导出格式 / Export Format
 */
export type ExportFormat = 'csv' | 'excel' | 'json';

/**
 * 导出选项 / Export Options
 */
export interface ExportOptions {
	format: ExportFormat;
	includeSignalData?: boolean;
	includeDefects?: boolean;
	includeParameters?: boolean;
}

/**
 * 数据导出器类 / Data Exporter Class
 */
export class DataExporter {
	/**
	 * 导出单个会话 / Export single session
	 */
	static exportSession(
		session: CompleteSessionData,
		options: ExportOptions = { format: 'csv', includeSignalData: true, includeDefects: true, includeParameters: true }
	): void {
		const filename = this.generateFilename(session, options.format);

		switch (options.format) {
			case 'csv':
				this.exportToCSV(session, filename, options);
				break;
			case 'excel':
				this.exportToExcel(session, filename, options);
				break;
			case 'json':
				this.exportToJSON(session, filename);
				break;
		}
	}

	/**
	 * 批量导出多个会话 / Batch export multiple sessions
	 */
	static exportMultipleSessions(
		sessions: CompleteSessionData[],
		options: ExportOptions = { format: 'excel', includeSignalData: true, includeDefects: true, includeParameters: true }
	): void {
		if (sessions.length === 0) {
			throw new Error('No sessions to export');
		}

		const filename = `batch_export_${new Date().toISOString().split('T')[0]}.${this.getFileExtension(options.format)}`;

		switch (options.format) {
			case 'csv':
				// For CSV, export each session separately
				sessions.forEach((session) => {
					this.exportToCSV(session, this.generateFilename(session, 'csv'), options);
				});
				break;
			case 'excel':
				this.exportMultipleToExcel(sessions, filename, options);
				break;
			case 'json':
				this.exportMultipleToJSON(sessions, filename);
				break;
		}
	}

	/**
	 * 导出为CSV格式 / Export to CSV format
	 */
	private static exportToCSV(
		session: CompleteSessionData,
		filename: string,
		options: ExportOptions
	): void {
		let csvContent = '';

		// Session metadata
		csvContent += this.sessionMetadataToCSV(session);
		csvContent += '\n\n';

		// Parameters
		if (options.includeParameters) {
			csvContent += this.parametersToCSV(session);
			csvContent += '\n\n';
		}

		// Signal data
		if (options.includeSignalData && session.signalData.length > 0) {
			csvContent += 'Signal Data\n';
			csvContent += this.signalDataToCSV(session.signalData);
			csvContent += '\n\n';
		}

		// Defects
		if (options.includeDefects && session.defects.length > 0) {
			csvContent += 'Defects\n';
			csvContent += this.defectsToCSV(session.defects);
		}

		this.downloadFile(csvContent, filename, 'text/csv');
	}

	/**
	 * 导出为Excel格式 / Export to Excel format
	 */
	private static exportToExcel(
		session: CompleteSessionData,
		filename: string,
		options: ExportOptions
	): void {
		const workbook = XLSX.utils.book_new();

		// Session info sheet
		const sessionInfo = this.sessionToSheetData(session, options.includeParameters || false);
		const sessionSheet = XLSX.utils.aoa_to_sheet(sessionInfo);
		XLSX.utils.book_append_sheet(workbook, sessionSheet, 'Session Info');

		// Signal data sheet
		if (options.includeSignalData && session.signalData.length > 0) {
			const signalSheet = XLSX.utils.json_to_sheet(
				session.signalData.map((signal) => ({
					Timestamp: signal.timestamp,
					Position: signal.position,
					Amplitude: signal.amplitude,
					Phase: signal.phase,
					Frequency: signal.frequency
				}))
			);
			XLSX.utils.book_append_sheet(workbook, signalSheet, 'Signal Data');
		}

		// Defects sheet
		if (options.includeDefects && session.defects.length > 0) {
			const defectsSheet = XLSX.utils.json_to_sheet(
				session.defects.map((defect) => ({
					Position: defect.position,
					Amplitude: defect.amplitude,
					Severity: defect.severity,
					'Gate Triggered': defect.gateTriggered,
					Timestamp: defect.timestamp.toISOString(),
					Notes: defect.notes || ''
				}))
			);
			XLSX.utils.book_append_sheet(workbook, defectsSheet, 'Defects');
		}

		// Write file
		XLSX.writeFile(workbook, filename);
	}

	/**
	 * 批量导出为Excel格式 / Batch export to Excel format
	 */
	private static exportMultipleToExcel(
		sessions: CompleteSessionData[],
		filename: string,
		options: ExportOptions
	): void {
		const workbook = XLSX.utils.book_new();

		// Summary sheet
		const summaryData = sessions.map((session) => ({
			'Session ID': session.id,
			'Project Name': session.projectName,
			'Start Time': session.startTime.toISOString(),
			'End Time': session.endTime?.toISOString() || 'N/A',
			Status: session.status,
			'Signal Points': session.signalData.length,
			'Defects Count': session.defects.length
		}));
		const summarySheet = XLSX.utils.json_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

		// Individual session sheets (limit to first 10 to avoid too many sheets)
		sessions.slice(0, 10).forEach((session, index) => {
			const sessionInfo = this.sessionToSheetData(session, options.includeParameters || false);
			const sessionSheet = XLSX.utils.aoa_to_sheet(sessionInfo);
			const sheetName = `Session ${index + 1}`;
			XLSX.utils.book_append_sheet(workbook, sessionSheet, sheetName);

			// Add signal data if requested
			if (options.includeSignalData && session.signalData.length > 0) {
				const signalSheet = XLSX.utils.json_to_sheet(
					session.signalData.map((signal) => ({
						Timestamp: signal.timestamp,
						Position: signal.position,
						Amplitude: signal.amplitude,
						Phase: signal.phase,
						Frequency: signal.frequency
					}))
				);
				XLSX.utils.book_append_sheet(workbook, signalSheet, `S${index + 1} Signals`);
			}

			// Add defects if requested
			if (options.includeDefects && session.defects.length > 0) {
				const defectsSheet = XLSX.utils.json_to_sheet(
					session.defects.map((defect) => ({
						Position: defect.position,
						Amplitude: defect.amplitude,
						Severity: defect.severity,
						'Gate Triggered': defect.gateTriggered,
						Timestamp: defect.timestamp.toISOString(),
						Notes: defect.notes || ''
					}))
				);
				XLSX.utils.book_append_sheet(workbook, defectsSheet, `S${index + 1} Defects`);
			}
		});

		// Write file
		XLSX.writeFile(workbook, filename);
	}

	/**
	 * 导出为JSON格式 / Export to JSON format
	 */
	private static exportToJSON(session: CompleteSessionData, filename: string): void {
		const jsonData = JSON.stringify(session, null, 2);
		this.downloadFile(jsonData, filename, 'application/json');
	}

	/**
	 * 批量导出为JSON格式 / Batch export to JSON format
	 */
	private static exportMultipleToJSON(sessions: CompleteSessionData[], filename: string): void {
		const jsonData = JSON.stringify(sessions, null, 2);
		this.downloadFile(jsonData, filename, 'application/json');
	}

	/**
	 * 辅助方法：会话元数据转CSV / Helper: Session metadata to CSV
	 */
	private static sessionMetadataToCSV(session: TestingSession): string {
		return [
			'Session Information',
			`Session ID,${session.id}`,
			`Project Name,${session.projectName}`,
			`Operator ID,${session.operatorId}`,
			`Start Time,${session.startTime.toISOString()}`,
			`End Time,${session.endTime?.toISOString() || 'N/A'}`,
			`Status,${session.status}`
		].join('\n');
	}

	/**
	 * 辅助方法：参数转CSV / Helper: Parameters to CSV
	 */
	private static parametersToCSV(session: TestingSession): string {
		const params = session.parameters;
		return [
			'Testing Parameters',
			`Gain,${params.gain}`,
			`Filter,${params.filter}`,
			`Velocity,${params.velocity}`,
			`Threshold,${params.threshold}`,
			'',
			'Gate A Configuration',
			`Enabled,${params.gateA.enabled}`,
			`Start,${params.gateA.start}`,
			`Width,${params.gateA.width}`,
			`Height,${params.gateA.height}`,
			`Alarm Threshold,${params.gateA.alarmThreshold}`,
			'',
			'Gate B Configuration',
			`Enabled,${params.gateB.enabled}`,
			`Start,${params.gateB.start}`,
			`Width,${params.gateB.width}`,
			`Height,${params.gateB.height}`,
			`Alarm Threshold,${params.gateB.alarmThreshold}`
		].join('\n');
	}

	/**
	 * 辅助方法：信号数据转CSV / Helper: Signal data to CSV
	 */
	private static signalDataToCSV(signalData: SignalData[]): string {
		const header = 'Timestamp,Position,Amplitude,Phase,Frequency';
		const rows = signalData.map(
			(signal) =>
				`${signal.timestamp},${signal.position},${signal.amplitude},${signal.phase},${signal.frequency}`
		);
		return [header, ...rows].join('\n');
	}

	/**
	 * 辅助方法：缺陷数据转CSV / Helper: Defects data to CSV
	 */
	private static defectsToCSV(defects: Defect[]): string {
		const header = 'Position,Amplitude,Severity,Gate Triggered,Timestamp,Notes';
		const rows = defects.map(
			(defect) =>
				`${defect.position},${defect.amplitude},${defect.severity},${defect.gateTriggered},${defect.timestamp.toISOString()},"${defect.notes || ''}"`
		);
		return [header, ...rows].join('\n');
	}

	/**
	 * 辅助方法：会话转工作表数据 / Helper: Session to sheet data
	 */
	private static sessionToSheetData(session: TestingSession, includeParameters: boolean): any[][] {
		const data: any[][] = [
			['Session Information'],
			['Session ID', session.id],
			['Project Name', session.projectName],
			['Operator ID', session.operatorId],
			['Start Time', session.startTime.toISOString()],
			['End Time', session.endTime?.toISOString() || 'N/A'],
			['Status', session.status],
			[]
		];

		if (includeParameters) {
			const params = session.parameters;
			data.push(
				['Testing Parameters'],
				['Gain', params.gain],
				['Filter', params.filter],
				['Velocity', params.velocity],
				['Threshold', params.threshold],
				[],
				['Gate A Configuration'],
				['Enabled', params.gateA.enabled],
				['Start', params.gateA.start],
				['Width', params.gateA.width],
				['Height', params.gateA.height],
				['Alarm Threshold', params.gateA.alarmThreshold],
				[],
				['Gate B Configuration'],
				['Enabled', params.gateB.enabled],
				['Start', params.gateB.start],
				['Width', params.gateB.width],
				['Height', params.gateB.height],
				['Alarm Threshold', params.gateB.alarmThreshold]
			);
		}

		return data;
	}

	/**
	 * 辅助方法：生成文件名 / Helper: Generate filename
	 */
	private static generateFilename(session: TestingSession, format: ExportFormat): string {
		const timestamp = new Date().toISOString().split('T')[0];
		const projectName = session.projectName.replace(/[^a-zA-Z0-9]/g, '_');
		const extension = this.getFileExtension(format);
		return `${projectName}_${session.id.substring(0, 8)}_${timestamp}.${extension}`;
	}

	/**
	 * 辅助方法：获取文件扩展名 / Helper: Get file extension
	 */
	private static getFileExtension(format: ExportFormat): string {
		switch (format) {
			case 'csv':
				return 'csv';
			case 'excel':
				return 'xlsx';
			case 'json':
				return 'json';
		}
	}

	/**
	 * 辅助方法：触发文件下载 / Helper: Trigger file download
	 */
	private static downloadFile(content: string, filename: string, mimeType: string): void {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
}
