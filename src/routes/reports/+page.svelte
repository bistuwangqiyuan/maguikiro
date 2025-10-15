<script lang="ts">
	import { onMount } from 'svelte';
	import { reportExportService, supabaseService } from '$lib/services';
	import { authStore } from '$lib/stores/auth';
	import type { InternationalStandard } from '$lib/types';
	
	let reports = $state<any[]>([]);
	let sessions = $state<any[]>([]);
	let loading = $state(true);
	let loadingSessions = $state(false);
	let selectedStandard = $state<InternationalStandard>('ASME');
	let selectedSession = $state('');
	let generating = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	
	onMount(async () => {
		await Promise.all([loadReports(), loadSessions()]);
	});
	
	async function loadReports() {
		loading = true;
		errorMessage = '';
		try {
			reports = await reportExportService.getReportList({ limit: 50 });
		} catch (error) {
			console.error('Failed to load reports:', error);
			errorMessage = 'Failed to load reports';
		} finally {
			loading = false;
		}
	}
	
	async function loadSessions() {
		loadingSessions = true;
		try {
			const user = authStore.getUser();
			if (user) {
				sessions = await supabaseService.listSessions({
					operatorId: user.id,
					status: 'completed'
				});
			}
		} catch (error) {
			console.error('Failed to load sessions:', error);
		} finally {
			loadingSessions = false;
		}
	}
	
	async function generateReport() {
		if (!selectedSession) {
			errorMessage = '请选择检测会话 / Please select a testing session';
			return;
		}
		
		const user = authStore.getUser();
		if (!user) {
			errorMessage = '请先登录 / Please login first';
			return;
		}
		
		generating = true;
		errorMessage = '';
		successMessage = '';
		
		try {
			const result = await reportExportService.generateAndExportReport(
				selectedSession,
				user.id,
				user.user_metadata?.full_name || user.email || 'Unknown',
				{
					standard: selectedStandard,
					includeWaveform: true,
					includeDataTable: true,
					includeDefectDetails: true,
					uploadToStorage: true,
					downloadLocally: true,
					companyName: 'DOPPLER',
					equipmentModel: 'DOPPLER MT-2000'
				}
			);
			
			if (result.success) {
				successMessage = '报告生成成功 / Report generated successfully';
				await loadReports();
				// Reset selection
				selectedSession = '';
			} else {
				errorMessage = `报告生成失败 / Failed to generate report: ${result.error}`;
			}
		} catch (error) {
			console.error('Failed to generate report:', error);
			errorMessage = '报告生成失败 / Failed to generate report';
		} finally {
			generating = false;
		}
	}
	
	async function downloadReport(reportId: string) {
		try {
			await reportExportService.downloadExistingReport(reportId);
		} catch (error) {
			console.error('Failed to download report:', error);
			errorMessage = '下载失败 / Download failed';
		}
	}
	
	function viewReport(report: any) {
		if (report.pdfUrl) {
			window.open(report.pdfUrl, '_blank');
		} else {
			errorMessage = 'PDF URL not available';
		}
	}
	
	async function deleteReport(reportId: string) {
		if (!confirm('确定要删除此报告吗？/ Are you sure you want to delete this report?')) {
			return;
		}
		
		try {
			await reportExportService.deleteReport(reportId);
			successMessage = '报告已删除 / Report deleted';
			await loadReports();
		} catch (error) {
			console.error('Failed to delete report:', error);
			errorMessage = '删除失败 / Delete failed';
		}
	}
	
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}
	
	function clearMessages() {
		errorMessage = '';
		successMessage = '';
	}
</script>

<div class="reports-container">
	<div class="reports-header">
		<h1 class="text-3xl font-bold" style="color: var(--primary-orange);">
			报告生成与管理 / Report Generation and Management
		</h1>
		<p class="text-sm" style="color: var(--text-secondary);">
			生成符合国际标准的检测报告 / Generate Testing Reports Compliant with International Standards
		</p>
	</div>

	<!-- Messages -->
	{#if errorMessage}
		<div class="alert alert-error">
			<span>{errorMessage}</span>
			<button onclick={clearMessages} class="btn btn-sm btn-ghost">✕</button>
		</div>
	{/if}
	
	{#if successMessage}
		<div class="alert alert-success">
			<span>{successMessage}</span>
			<button onclick={clearMessages} class="btn btn-sm btn-ghost">✕</button>
		</div>
	{/if}

	<!-- 报告生成区域 / Report Generation Area -->
	<div class="generation-section">
		<h2 class="section-title">生成新报告 / Generate New Report</h2>
		
		<div class="generation-form">
			<div class="form-row">
				<div class="form-item">
					<label class="form-label">选择检测会话 / Select Testing Session</label>
					<select bind:value={selectedSession} class="form-select" disabled={loadingSessions || generating}>
						<option value="">
							{loadingSessions ? '加载中... / Loading...' : '请选择... / Please select...'}
						</option>
						{#each sessions as session}
							<option value={session.id}>
								{session.projectName} - {formatDate(session.startTime)}
							</option>
						{/each}
					</select>
				</div>
				
				<div class="form-item">
					<label class="form-label">报告标准 / Report Standard</label>
					<select bind:value={selectedStandard} class="form-select" disabled={generating}>
						<option value="ASME">ASME Section V, Article 7</option>
						<option value="ISO">ISO 9712</option>
						<option value="EN">EN 10228</option>
						<option value="ASTM">ASTM E709</option>
					</select>
				</div>
			</div>
			
			<div class="form-actions">
				<button 
					class="btn-generate"
					onclick={generateReport}
					disabled={generating || !selectedSession}
				>
					{#if generating}
						<span class="loading loading-spinner loading-sm"></span>
						生成中... / Generating...
					{:else}
						生成报告 / Generate Report
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- 报告列表 / Reports List -->
	<div class="reports-list-section">
		<h2 class="section-title">历史报告 / Historical Reports</h2>
		
		{#if loading}
			<div class="loading-container">
				<span class="loading loading-spinner loading-lg text-primary"></span>
				<p>加载中... / Loading...</p>
			</div>
		{:else if reports.length === 0}
			<div class="empty-state">
				<p class="text-lg">暂无报告 / No Reports</p>
				<p class="text-sm" style="color: var(--text-secondary);">
					生成新报告以开始 / Generate a new report to get started
				</p>
			</div>
		{:else}
			<div class="reports-grid">
				{#each reports as report (report.id)}
					<div class="report-card">
						<div class="report-header">
							<h3 class="report-title">{report.projectName}</h3>
							<span class="report-standard">{report.standard || 'N/A'}</span>
						</div>
						
						<div class="report-info">
							<div class="info-item">
								<span class="info-label">生成时间 / Generated:</span>
								<span class="info-value">{formatDate(report.generatedAt)}</span>
							</div>
							<div class="info-item">
								<span class="info-label">操作员 / Operator:</span>
								<span class="info-value">{report.operatorName}</span>
							</div>
							<div class="info-item">
								<span class="info-label">会话状态 / Status:</span>
								<span class="info-value status-{report.sessionStatus}">
									{report.sessionStatus?.toUpperCase() || 'N/A'}
								</span>
							</div>
							{#if report.content?.results}
								<div class="info-item">
									<span class="info-label">缺陷数 / Defects:</span>
									<span class="info-value">
										{report.content.results.totalDefects || 0}
										{#if report.content.results.criticalDefects > 0}
											<span class="critical-badge">
												{report.content.results.criticalDefects} Critical
											</span>
										{/if}
									</span>
								</div>
							{/if}
						</div>
						
						<div class="report-actions">
							{#if report.pdfUrl}
								<button 
									class="btn-action view"
									onclick={() => viewReport(report)}
									title="在新窗口查看 / View in new window"
								>
									查看 / View
								</button>
								<button 
									class="btn-action download"
									onclick={() => downloadReport(report.id)}
									title="下载PDF / Download PDF"
								>
									下载 / Download
								</button>
							{:else}
								<button 
									class="btn-action disabled"
									disabled
									title="PDF不可用 / PDF not available"
								>
									PDF不可用 / N/A
								</button>
							{/if}
							<button 
								class="btn-action delete"
								onclick={() => deleteReport(report.id)}
								title="删除报告 / Delete report"
							>
								删除 / Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.reports-container {
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
	}

	.reports-header {
		margin-bottom: 32px;
	}

	.generation-section, .reports-list-section {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 24px;
	}

	.section-title {
		font-size: 20px;
		font-weight: 600;
		color: var(--primary-orange);
		margin-bottom: 20px;
	}

	.generation-form {
		max-width: 800px;
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 24px;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.form-select {
		padding: 12px 16px;
		background: var(--bg-dark);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
		cursor: pointer;
	}

	.form-select:focus {
		outline: none;
		border-color: var(--primary-orange);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
	}

	.btn-generate {
		padding: 12px 32px;
		background: var(--primary-orange);
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.btn-generate:hover:not(:disabled) {
		background: var(--primary-orange-dark);
	}

	.btn-generate:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.loading-container, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		gap: 16px;
	}

	.reports-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 20px;
	}

	.report-card {
		background: var(--bg-dark);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		padding: 20px;
		transition: all 0.3s ease;
	}

	.report-card:hover {
		border-color: var(--primary-orange);
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
	}

	.report-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 16px;
	}

	.report-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.report-standard {
		padding: 4px 12px;
		background: rgba(255, 107, 53, 0.2);
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--primary-orange);
	}

	.report-info {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 16px;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
	}

	.info-label {
		color: var(--text-secondary);
	}

	.info-value {
		color: var(--text-primary);
		font-weight: 600;
	}

	.report-actions {
		display: flex;
		gap: 8px;
	}

	.btn-action {
		flex: 1;
		padding: 8px 16px;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-action.view {
		background: var(--info);
		color: white;
	}

	.btn-action.view:hover {
		background: #1976D2;
	}

	.btn-action.download {
		background: var(--success);
		color: white;
	}

	.btn-action.download:hover {
		background: #388E3C;
	}

	.btn-action.delete {
		background: var(--error);
		color: white;
	}

	.btn-action.delete:hover {
		background: #C62828;
	}

	.btn-action.disabled {
		background: var(--bg-light);
		color: var(--text-disabled);
		cursor: not-allowed;
	}

	.alert {
		padding: 16px;
		border-radius: 8px;
		margin-bottom: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.alert-error {
		background: rgba(244, 67, 54, 0.2);
		border: 1px solid var(--error);
		color: var(--error);
	}

	.alert-success {
		background: rgba(76, 175, 80, 0.2);
		border: 1px solid var(--success);
		color: var(--success);
	}

	.status-completed {
		color: var(--success);
	}

	.status-running {
		color: var(--info);
	}

	.status-paused {
		color: var(--warning);
	}

	.status-error {
		color: var(--error);
	}

	.critical-badge {
		display: inline-block;
		padding: 2px 8px;
		background: var(--error);
		color: white;
		border-radius: 10px;
		font-size: 11px;
		margin-left: 8px;
	}

	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.reports-grid {
			grid-template-columns: 1fr;
		}

		.report-actions {
			flex-wrap: wrap;
		}

		.btn-action {
			flex: 1 1 45%;
		}
	}
</style>
