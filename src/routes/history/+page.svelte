<script lang="ts">
	import { onMount } from 'svelte';
	import type { TestingSession, CompleteSessionData } from '$lib/types';
	import { supabaseService } from '$lib/services/supabase';
	import { DataExporter, type ExportFormat } from '$lib/utils/data-exporter';
	
	let sessions = $state<TestingSession[]>([]);
	let loading = $state(true);
	let searchTerm = $state('');
	let filterStatus = $state<string>('all');
	let selectedSession = $state<CompleteSessionData | null>(null);
	let loadingDetails = $state(false);
	let error = $state<string | null>(null);
	let dateFrom = $state('');
	let dateTo = $state('');
	let operatorFilter = $state('');
	let selectedSessionIds = $state<string[]>([]);
	let showExportModal = $state(false);
	let exportFormat = $state<ExportFormat>('excel');
	let includeSignalData = $state(true);
	let includeDefects = $state(true);
	let includeParameters = $state(true);
	let exporting = $state(false);
	
	onMount(async () => {
		await loadSessions();
	});
	
	async function loadSessions() {
		loading = true;
		error = null;
		
		try {
			const filters: any = {};
			
			if (filterStatus !== 'all') {
				filters.status = filterStatus;
			}
			if (searchTerm) {
				filters.projectName = searchTerm;
			}
			if (dateFrom) {
				filters.startDate = new Date(dateFrom);
			}
			if (dateTo) {
				filters.endDate = new Date(dateTo);
			}
			if (operatorFilter) {
				filters.operatorId = operatorFilter;
			}
			
			sessions = await supabaseService.listSessions(filters);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load sessions';
			console.error('Error loading sessions:', err);
		} finally {
			loading = false;
		}
	}
	
	async function viewSession(session: TestingSession) {
		loadingDetails = true;
		error = null;
		
		try {
			// Load complete session data including signal data and defects
			const completeData = await supabaseService.getCompleteSessionData(session.id);
			selectedSession = completeData;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load session details';
			console.error('Error loading session details:', err);
		} finally {
			loadingDetails = false;
		}
	}
	
	function closeDetails() {
		selectedSession = null;
	}
	
	async function deleteSession(sessionId: string) {
		if (!confirm('确认删除此记录？此操作将标记记录为已删除。\nConfirm delete this record? This will mark the record as deleted.')) {
			return;
		}
		
		try {
			await supabaseService.deleteSession(sessionId);
			// Reload sessions to reflect the change
			await loadSessions();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete session';
			console.error('Error deleting session:', err);
		}
	}
	
	function clearFilters() {
		searchTerm = '';
		filterStatus = 'all';
		dateFrom = '';
		dateTo = '';
		operatorFilter = '';
		loadSessions();
	}
	
	$: filteredSessions = sessions.filter(session => {
		const matchesSearch = !searchTerm || session.projectName.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
		return matchesSearch && matchesStatus;
	});
	
	// Trigger reload when filters change
	$: if (dateFrom || dateTo || operatorFilter) {
		loadSessions();
	}
	
	function toggleSessionSelection(sessionId: string) {
		if (selectedSessionIds.includes(sessionId)) {
			selectedSessionIds = selectedSessionIds.filter(id => id !== sessionId);
		} else {
			selectedSessionIds = [...selectedSessionIds, sessionId];
		}
	}
	
	function selectAllSessions() {
		if (selectedSessionIds.length === filteredSessions.length) {
			selectedSessionIds = [];
		} else {
			selectedSessionIds = filteredSessions.map(s => s.id);
		}
	}
	
	async function exportSession(sessionId: string, format: ExportFormat) {
		exporting = true;
		error = null;
		
		try {
			const completeData = await supabaseService.getCompleteSessionData(sessionId);
			DataExporter.exportSession(completeData, {
				format,
				includeSignalData,
				includeDefects,
				includeParameters
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'Export failed';
			console.error('Error exporting session:', err);
		} finally {
			exporting = false;
		}
	}
	
	async function exportSelectedSessions() {
		if (selectedSessionIds.length === 0) {
			error = '请选择要导出的会话 / Please select sessions to export';
			return;
		}
		
		exporting = true;
		error = null;
		
		try {
			const completeSessions = await Promise.all(
				selectedSessionIds.map(id => supabaseService.getCompleteSessionData(id))
			);
			
			DataExporter.exportMultipleSessions(completeSessions, {
				format: exportFormat,
				includeSignalData,
				includeDefects,
				includeParameters
			});
			
			showExportModal = false;
			selectedSessionIds = [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Batch export failed';
			console.error('Error exporting sessions:', err);
		} finally {
			exporting = false;
		}
	}
	
	function openExportModal() {
		if (selectedSessionIds.length === 0) {
			error = '请选择要导出的会话 / Please select sessions to export';
			return;
		}
		showExportModal = true;
	}
</script>

<div class="history-container">
	<div class="history-header">
		<h1 class="text-3xl font-bold" style="color: var(--primary-orange);">
			历史记录管理 / Historical Records Management
		</h1>
		<p class="text-sm" style="color: var(--text-secondary);">
			查看和管理检测记录 / View and Manage Testing Records
		</p>
	</div>

	<!-- 搜索和筛选 / Search and Filter -->
	<div class="filter-bar">
		<input
			type="text"
			placeholder="搜索项目名称... / Search project name..."
			bind:value={searchTerm}
			class="search-input"
			oninput={loadSessions}
		/>
		
		<select bind:value={filterStatus} class="filter-select" onchange={loadSessions}>
			<option value="all">全部状态 / All Status</option>
			<option value="completed">已完成 / Completed</option>
			<option value="running">进行中 / Running</option>
			<option value="paused">已暂停 / Paused</option>
			<option value="error">错误 / Error</option>
		</select>
		
		<input
			type="date"
			placeholder="开始日期 / From Date"
			bind:value={dateFrom}
			class="date-input"
		/>
		
		<input
			type="date"
			placeholder="结束日期 / To Date"
			bind:value={dateTo}
			class="date-input"
		/>
		
		<button class="btn-refresh" onclick={loadSessions}>
			刷新 / Refresh
		</button>
		
		<button class="btn-clear" onclick={clearFilters}>
			清除筛选 / Clear
		</button>
		
		<button class="btn-export" onclick={openExportModal} disabled={selectedSessionIds.length === 0}>
			📤 批量导出 ({selectedSessionIds.length})
		</button>
	</div>
	
	<!-- 错误提示 / Error Message -->
	{#if error}
		<div class="error-banner">
			<span class="error-icon">⚠️</span>
			<span>{error}</span>
			<button class="error-close" onclick={() => error = null}>✕</button>
		</div>
	{/if}

	<!-- 记录列表 / Records List -->
	{#if loading}
		<div class="loading-container">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p>加载中... / Loading...</p>
		</div>
	{:else if filteredSessions.length === 0}
		<div class="empty-state">
			<p class="text-lg">暂无记录 / No Records</p>
			<p class="text-sm" style="color: var(--text-secondary);">
				开始新的检测以创建记录 / Start a new test to create records
			</p>
		</div>
	{:else}
		<div class="records-table">
			<table>
				<thead>
					<tr>
						<th>
							<input 
								type="checkbox" 
								checked={selectedSessionIds.length === filteredSessions.length && filteredSessions.length > 0}
								onchange={selectAllSessions}
								class="checkbox checkbox-sm"
							/>
						</th>
						<th>日期 / Date</th>
						<th>项目名称 / Project Name</th>
						<th>操作员 / Operator</th>
						<th>状态 / Status</th>
						<th>缺陷数 / Defects</th>
						<th>操作 / Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredSessions as session (session.id)}
						<tr class:selected={selectedSessionIds.includes(session.id)}>
							<td>
								<input 
									type="checkbox" 
									checked={selectedSessionIds.includes(session.id)}
									onchange={() => toggleSessionSelection(session.id)}
									class="checkbox checkbox-sm"
								/>
							</td>
							<td>{new Date(session.startTime).toLocaleString()}</td>
							<td>{session.projectName}</td>
							<td>{session.operator || 'N/A'}</td>
							<td>
								<span class="status-badge {session.status}">
									{session.status}
								</span>
							</td>
							<td>{session.defects?.length || 0}</td>
							<td>
								<div class="action-buttons">
									<button 
										class="btn-action view"
										onclick={() => viewSession(session)}
									>
										查看 / View
									</button>
									<div class="dropdown dropdown-end">
										<button class="btn-action export" tabindex="0">
											导出 / Export ▼
										</button>
										<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
											<li><button onclick={() => exportSession(session.id, 'csv')}>CSV 格式</button></li>
											<li><button onclick={() => exportSession(session.id, 'excel')}>Excel 格式</button></li>
											<li><button onclick={() => exportSession(session.id, 'json')}>JSON 格式</button></li>
										</ul>
									</div>
									<button 
										class="btn-action delete"
										onclick={() => deleteSession(session.id)}
									>
										删除 / Delete
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- 详情模态框 / Details Modal -->
{#if selectedSession}
	<div class="modal modal-open">
		<div class="modal-box max-w-6xl max-h-[90vh] overflow-y-auto">
			{#if loadingDetails}
				<div class="loading-container">
					<span class="loading loading-spinner loading-lg text-primary"></span>
					<p>加载详情... / Loading details...</p>
				</div>
			{:else}
				<h3 class="font-bold text-2xl mb-6" style="color: var(--primary-orange);">
					检测记录详情 / Testing Record Details
				</h3>
				
				<!-- 基本信息 / Basic Information -->
				<div class="section-title">基本信息 / Basic Information</div>
				<div class="details-grid">
					<div class="detail-item">
						<span class="detail-label">项目名称 / Project:</span>
						<span class="detail-value">{selectedSession.projectName}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">会话ID / Session ID:</span>
						<span class="detail-value">{selectedSession.id}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">开始时间 / Start Time:</span>
						<span class="detail-value">{new Date(selectedSession.startTime).toLocaleString()}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">结束时间 / End Time:</span>
						<span class="detail-value">
							{selectedSession.endTime ? new Date(selectedSession.endTime).toLocaleString() : 'N/A'}
						</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">状态 / Status:</span>
						<span class="status-badge {selectedSession.status}">{selectedSession.status}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">操作员 / Operator:</span>
						<span class="detail-value">{selectedSession.operator || selectedSession.operatorId || 'N/A'}</span>
					</div>
				</div>
				
				<!-- 检测参数 / Testing Parameters -->
				{#if selectedSession.parameters}
					<div class="section-title mt-6">检测参数 / Testing Parameters</div>
					<div class="details-grid">
						<div class="detail-item">
							<span class="detail-label">增益 / Gain:</span>
							<span class="detail-value">{selectedSession.parameters.gain} dB</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">滤波器 / Filter:</span>
							<span class="detail-value">{selectedSession.parameters.filter}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">速度 / Velocity:</span>
							<span class="detail-value">{selectedSession.parameters.velocity} mm/s</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">阈值 / Threshold:</span>
							<span class="detail-value">{selectedSession.parameters.threshold}</span>
						</div>
					</div>
					
					<!-- 闸门配置 / Gate Configuration -->
					{#if selectedSession.parameters.gateA || selectedSession.parameters.gateB}
						<div class="section-title mt-4">闸门配置 / Gate Configuration</div>
						<div class="gate-config-grid">
							{#if selectedSession.parameters.gateA}
								<div class="gate-config">
									<h4 class="gate-title">闸门 A / Gate A</h4>
									<div class="gate-details">
										<div><span class="gate-label">启用 / Enabled:</span> {selectedSession.parameters.gateA.enabled ? '是 / Yes' : '否 / No'}</div>
										<div><span class="gate-label">起始 / Start:</span> {selectedSession.parameters.gateA.start}</div>
										<div><span class="gate-label">宽度 / Width:</span> {selectedSession.parameters.gateA.width}</div>
										<div><span class="gate-label">高度 / Height:</span> {selectedSession.parameters.gateA.height}</div>
										<div><span class="gate-label">报警阈值 / Alarm:</span> {selectedSession.parameters.gateA.alarmThreshold}</div>
									</div>
								</div>
							{/if}
							{#if selectedSession.parameters.gateB}
								<div class="gate-config">
									<h4 class="gate-title">闸门 B / Gate B</h4>
									<div class="gate-details">
										<div><span class="gate-label">启用 / Enabled:</span> {selectedSession.parameters.gateB.enabled ? '是 / Yes' : '否 / No'}</div>
										<div><span class="gate-label">起始 / Start:</span> {selectedSession.parameters.gateB.start}</div>
										<div><span class="gate-label">宽度 / Width:</span> {selectedSession.parameters.gateB.width}</div>
										<div><span class="gate-label">高度 / Height:</span> {selectedSession.parameters.gateB.height}</div>
										<div><span class="gate-label">报警阈值 / Alarm:</span> {selectedSession.parameters.gateB.alarmThreshold}</div>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				{/if}
				
				<!-- 数据统计 / Data Statistics -->
				<div class="section-title mt-6">数据统计 / Data Statistics</div>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-value">{selectedSession.signalData?.length || 0}</div>
						<div class="stat-label">信号数据点 / Signal Points</div>
					</div>
					<div class="stat-card">
						<div class="stat-value">{selectedSession.defects?.length || 0}</div>
						<div class="stat-label">检测到缺陷 / Defects Found</div>
					</div>
					<div class="stat-card">
						<div class="stat-value">
							{selectedSession.defects?.filter(d => d.severity === 'critical').length || 0}
						</div>
						<div class="stat-label">严重缺陷 / Critical</div>
					</div>
					<div class="stat-card">
						<div class="stat-value">
							{selectedSession.defects?.filter(d => d.severity === 'high').length || 0}
						</div>
						<div class="stat-label">高级缺陷 / High</div>
					</div>
				</div>
				
				<!-- 缺陷列表 / Defects List -->
				{#if selectedSession.defects && selectedSession.defects.length > 0}
					<div class="section-title mt-6">缺陷列表 / Defects List</div>
					<div class="defects-table">
						<table>
							<thead>
								<tr>
									<th>位置 / Position</th>
									<th>幅值 / Amplitude</th>
									<th>严重程度 / Severity</th>
									<th>触发闸门 / Gate</th>
									<th>时间 / Time</th>
								</tr>
							</thead>
							<tbody>
								{#each selectedSession.defects as defect}
									<tr>
										<td>{defect.position.toFixed(2)}</td>
										<td>{defect.amplitude.toFixed(3)}</td>
										<td>
											<span class="severity-badge {defect.severity}">
												{defect.severity}
											</span>
										</td>
										<td>{defect.gateTriggered}</td>
										<td>{new Date(defect.timestamp).toLocaleTimeString()}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
				
				<div class="modal-action mt-6">
					<button class="btn btn-secondary" onclick={closeDetails}>关闭 / Close</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- 导出模态框 / Export Modal -->
{#if showExportModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="font-bold text-2xl mb-6" style="color: var(--primary-orange);">
				批量导出设置 / Batch Export Settings
			</h3>
			
			<div class="export-options">
				<div class="form-group">
					<label class="form-label">导出格式 / Export Format:</label>
					<select bind:value={exportFormat} class="select-input">
						<option value="csv">CSV - 逗号分隔值</option>
						<option value="excel">Excel - 工作簿格式（推荐）</option>
						<option value="json">JSON - 结构化数据</option>
					</select>
				</div>
				
				<div class="form-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={includeSignalData} class="checkbox" />
						<span>包含信号数据 / Include Signal Data</span>
					</label>
					<p class="help-text">导出所有信号数据点（可能导致文件较大）</p>
				</div>
				
				<div class="form-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={includeDefects} class="checkbox" />
						<span>包含缺陷数据 / Include Defects</span>
					</label>
					<p class="help-text">导出检测到的所有缺陷记录</p>
				</div>
				
				<div class="form-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={includeParameters} class="checkbox" />
						<span>包含参数配置 / Include Parameters</span>
					</label>
					<p class="help-text">导出检测参数和闸门配置</p>
				</div>
				
				<div class="export-summary">
					<p><strong>已选择:</strong> {selectedSessionIds.length} 个会话</p>
					<p><strong>导出格式:</strong> {exportFormat.toUpperCase()}</p>
				</div>
			</div>
			
			<div class="modal-action mt-6">
				<button 
					class="btn btn-secondary" 
					onclick={() => showExportModal = false}
					disabled={exporting}
				>
					取消 / Cancel
				</button>
				<button 
					class="btn btn-primary" 
					onclick={exportSelectedSessions}
					disabled={exporting}
				>
					{#if exporting}
						<span class="loading loading-spinner loading-sm"></span>
						导出中...
					{:else}
						开始导出 / Export
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.history-container {
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
	}

	.history-header {
		margin-bottom: 24px;
	}

	.filter-bar {
		display: flex;
		gap: 12px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.search-input {
		flex: 1;
		min-width: 200px;
		padding: 10px 16px;
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--primary-orange);
	}

	.filter-select {
		padding: 10px 16px;
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
		cursor: pointer;
	}

	.btn-refresh {
		padding: 10px 24px;
		background: var(--primary-orange);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-refresh:hover {
		background: var(--primary-orange-dark);
	}

	.loading-container, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		gap: 16px;
	}

	.records-table {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: var(--bg-dark);
	}

	th {
		padding: 16px;
		text-align: left;
		font-size: 13px;
		font-weight: 600;
		color: var(--primary-orange);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	td {
		padding: 16px;
		border-top: 1px solid var(--bg-light);
		color: var(--text-primary);
		font-size: 14px;
	}

	tbody tr:hover {
		background: var(--bg-dark);
	}

	.status-badge {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-badge.completed {
		background: rgba(76, 175, 80, 0.2);
		color: var(--success);
	}

	.status-badge.running {
		background: rgba(33, 150, 243, 0.2);
		color: var(--info);
	}

	.status-badge.paused {
		background: rgba(255, 193, 7, 0.2);
		color: var(--warning);
	}

	.status-badge.error {
		background: rgba(244, 67, 54, 0.2);
		color: var(--error);
	}

	.action-buttons {
		display: flex;
		gap: 8px;
	}

	.btn-action {
		padding: 6px 16px;
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

	.btn-action.delete {
		background: var(--error);
		color: white;
	}

	.btn-action.delete:hover {
		background: #D32F2F;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		margin-bottom: 24px;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.detail-label {
		font-size: 12px;
		color: var(--text-secondary);
		text-transform: uppercase;
	}

	.detail-value {
		font-size: 14px;
		color: var(--text-primary);
		font-weight: 600;
	}

	.date-input {
		padding: 10px 16px;
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
		cursor: pointer;
	}

	.date-input:focus {
		outline: none;
		border-color: var(--primary-orange);
	}

	.btn-clear {
		padding: 10px 24px;
		background: var(--bg-light);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		color: var(--text-primary);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-clear:hover {
		background: var(--bg-medium);
		border-color: var(--text-secondary);
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: rgba(244, 67, 54, 0.1);
		border: 2px solid var(--error);
		border-radius: 8px;
		margin-bottom: 24px;
		color: var(--error);
	}

	.error-icon {
		font-size: 20px;
	}

	.error-close {
		margin-left: auto;
		background: none;
		border: none;
		color: var(--error);
		font-size: 20px;
		cursor: pointer;
		padding: 4px 8px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--primary-orange);
		margin-bottom: 16px;
		padding-bottom: 8px;
		border-bottom: 2px solid var(--bg-light);
	}

	.gate-config-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}

	.gate-config {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		padding: 16px;
	}

	.gate-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--primary-orange);
		margin-bottom: 12px;
	}

	.gate-details {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 14px;
		color: var(--text-primary);
	}

	.gate-label {
		color: var(--text-secondary);
		font-weight: 600;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
	}

	.stat-card {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		padding: 20px;
		text-align: center;
	}

	.stat-value {
		font-size: 32px;
		font-weight: 700;
		color: var(--primary-orange);
		margin-bottom: 8px;
	}

	.stat-label {
		font-size: 12px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.defects-table {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		overflow: hidden;
	}

	.defects-table table {
		width: 100%;
	}

	.severity-badge {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.severity-badge.critical {
		background: rgba(244, 67, 54, 0.2);
		color: var(--error);
	}

	.severity-badge.high {
		background: rgba(255, 152, 0, 0.2);
		color: #FF9800;
	}

	.severity-badge.medium {
		background: rgba(255, 193, 7, 0.2);
		color: var(--warning);
	}

	.severity-badge.low {
		background: rgba(76, 175, 80, 0.2);
		color: var(--success);
	}

	.modal-box {
		background: var(--bg-dark);
		border: 2px solid var(--primary-orange);
	}

	.btn-secondary {
		background: var(--bg-medium);
		color: var(--text-primary);
		border: 2px solid var(--bg-light);
	}

	.btn-secondary:hover {
		background: var(--bg-light);
	}

	.btn-export {
		padding: 10px 24px;
		background: var(--success);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-export:hover:not(:disabled) {
		background: #388E3C;
	}

	.btn-export:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-action.export {
		background: var(--success);
		color: white;
		position: relative;
	}

	.btn-action.export:hover {
		background: #388E3C;
	}

	.dropdown-content {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		margin-top: 8px;
	}

	.dropdown-content li button {
		width: 100%;
		text-align: left;
		padding: 12px 16px;
		background: none;
		border: none;
		color: var(--text-primary);
		cursor: pointer;
		font-size: 14px;
		transition: background 0.2s ease;
	}

	.dropdown-content li button:hover {
		background: var(--bg-light);
	}

	tbody tr.selected {
		background: rgba(255, 107, 53, 0.1);
	}

	.checkbox {
		cursor: pointer;
	}

	.export-options {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.select-input {
		padding: 10px 16px;
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
		cursor: pointer;
	}

	.select-input:focus {
		outline: none;
		border-color: var(--primary-orange);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		font-size: 14px;
		color: var(--text-primary);
	}

	.checkbox-label input[type="checkbox"] {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.help-text {
		font-size: 12px;
		color: var(--text-secondary);
		margin-left: 32px;
	}

	.export-summary {
		padding: 16px;
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		font-size: 14px;
		color: var(--text-primary);
	}

	.export-summary p {
		margin: 4px 0;
	}

	.btn-primary {
		background: var(--primary-orange);
		color: white;
		border: none;
		padding: 10px 24px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-orange-dark);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.filter-bar {
			flex-direction: column;
		}

		.search-input, .date-input {
			width: 100%;
		}

		.records-table {
			overflow-x: auto;
		}

		table {
			min-width: 800px;
		}

		.details-grid {
			grid-template-columns: 1fr;
		}

		.gate-config-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
