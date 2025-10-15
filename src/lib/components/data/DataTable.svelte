<script lang="ts">
	import type { SignalData } from '$lib/types/signal';
	import { testingStore } from '$lib/stores/testing';

	/**
	 * 数据表格组件 / Data Table Component
	 * 显示检测数据的表格视图 / Display testing data in table view
	 */

	// Props
	export let data: SignalData[] = [];
	export let pageSize: number = 20;
	export let showPagination: boolean = true;

	// 本地状态 / Local state
	let currentPage = 0;
	let sortColumn: keyof SignalData | 'index' = 'index';
	let sortDirection: 'asc' | 'desc' = 'asc';
	let selectedIndex: number | null = null;

	// 订阅store数据 / Subscribe to store data
	$: if (data.length === 0 && $testingStore.processedBuffer.length > 0) {
		data = $testingStore.processedBuffer;
	}

	// 计算总页数 / Calculate total pages
	$: totalPages = Math.ceil(data.length / pageSize);

	// 排序数据 / Sort data
	$: sortedData = [...data].sort((a, b) => {
		let aVal: number;
		let bVal: number;

		if (sortColumn === 'index') {
			aVal = data.indexOf(a);
			bVal = data.indexOf(b);
		} else {
			aVal = a[sortColumn] as number;
			bVal = b[sortColumn] as number;
		}

		return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
	});

	// 分页数据 / Paginated data
	$: paginatedData = sortedData.slice(
		currentPage * pageSize,
		(currentPage + 1) * pageSize
	);

	// 处理排序 / Handle sorting
	function handleSort(column: keyof SignalData | 'index') {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	// 处理行选择 / Handle row selection
	function handleRowClick(index: number) {
		selectedIndex = index;
	}

	// 分页控制 / Pagination controls
	function goToPage(page: number) {
		currentPage = Math.max(0, Math.min(page, totalPages - 1));
	}

	function nextPage() {
		if (currentPage < totalPages - 1) {
			currentPage++;
		}
	}

	function prevPage() {
		if (currentPage > 0) {
			currentPage--;
		}
	}

	// 判断是否为异常数据 / Check if data is abnormal
	function isAbnormal(signal: SignalData): boolean {
		const session = $testingStore.currentSession;
		if (!session) return false;

		const threshold = session.parameters.threshold;
		return Math.abs(signal.amplitude) > threshold;
	}

	// 格式化数字 / Format number
	function formatNumber(value: number, decimals: number = 3): string {
		return value.toFixed(decimals);
	}

	// 获取状态文本 / Get status text
	function getStatus(signal: SignalData): string {
		return isAbnormal(signal) ? '异常' : '正常';
	}
</script>

<div class="data-table-container">
	<!-- 表格头部信息 / Table header info -->
	<div class="table-info">
		<div class="info-item">
			<span class="label">总数据点:</span>
			<span class="value">{data.length}</span>
		</div>
		<div class="info-item">
			<span class="label">当前页:</span>
			<span class="value">{currentPage + 1} / {totalPages || 1}</span>
		</div>
		<div class="info-item">
			<span class="label">异常数据:</span>
			<span class="value text-error">{data.filter(isAbnormal).length}</span>
		</div>
	</div>

	<!-- 数据表格 / Data table -->
	<div class="table-wrapper">
		<table class="data-table">
			<thead>
				<tr>
					<th class="sortable" on:click={() => handleSort('index')}>
						<div class="th-content">
							<span>序号</span>
							{#if sortColumn === 'index'}
								<span class="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
							{/if}
						</div>
					</th>
					<th class="sortable" on:click={() => handleSort('position')}>
						<div class="th-content">
							<span>位置 (s)</span>
							{#if sortColumn === 'position'}
								<span class="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
							{/if}
						</div>
					</th>
					<th class="sortable" on:click={() => handleSort('amplitude')}>
						<div class="th-content">
							<span>幅值 (V)</span>
							{#if sortColumn === 'amplitude'}
								<span class="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
							{/if}
						</div>
					</th>
					<th class="sortable" on:click={() => handleSort('phase')}>
						<div class="th-content">
							<span>相位 (°)</span>
							{#if sortColumn === 'phase'}
								<span class="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
							{/if}
						</div>
					</th>
					<th class="sortable" on:click={() => handleSort('frequency')}>
						<div class="th-content">
							<span>频率 (Hz)</span>
							{#if sortColumn === 'frequency'}
								<span class="sort-icon">{sortDirection === 'asc' ? '▲' : '▼'}</span>
							{/if}
						</div>
					</th>
					<th>状态</th>
				</tr>
			</thead>
			<tbody>
				{#each paginatedData as signal, i}
					{@const globalIndex = currentPage * pageSize + i}
					<tr
						class:selected={selectedIndex === globalIndex}
						class:abnormal={isAbnormal(signal)}
						on:click={() => handleRowClick(globalIndex)}
					>
						<td>{globalIndex + 1}</td>
						<td>{formatNumber(signal.position)}</td>
						<td>{formatNumber(signal.amplitude)}</td>
						<td>{formatNumber(signal.phase || 0)}</td>
						<td>{formatNumber(signal.frequency || 0, 1)}</td>
						<td>
							<span class="status-badge" class:status-abnormal={isAbnormal(signal)}>
								{getStatus(signal)}
							</span>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="no-data">暂无数据</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- 分页控件 / Pagination controls -->
	{#if showPagination && totalPages > 1}
		<div class="pagination">
			<button class="btn-page" on:click={prevPage} disabled={currentPage === 0}>
				上一页
			</button>

			<div class="page-numbers">
				{#each Array(totalPages) as _, i}
					{#if i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 2}
						<button
							class="btn-page-num"
							class:active={i === currentPage}
							on:click={() => goToPage(i)}
						>
							{i + 1}
						</button>
					{:else if Math.abs(i - currentPage) === 3}
						<span class="page-ellipsis">...</span>
					{/if}
				{/each}
			</div>

			<button class="btn-page" on:click={nextPage} disabled={currentPage === totalPages - 1}>
				下一页
			</button>
		</div>
	{/if}
</div>

<style>
	.data-table-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
		background: var(--bg-dark, #1a1a1a);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.table-info {
		display: flex;
		gap: 2rem;
		padding: 0.75rem 1rem;
		background: var(--bg-medium, #2d2d2d);
		border-radius: 0.375rem;
		border: 1px solid var(--bg-light, #3d3d3d);
	}

	.info-item {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.info-item .label {
		color: var(--text-secondary, #b0b0b0);
		font-size: 0.875rem;
	}

	.info-item .value {
		color: var(--text-primary, #ffffff);
		font-weight: 600;
		font-family: 'Roboto Mono', monospace;
	}

	.text-error {
		color: var(--error, #f44336);
	}

	.table-wrapper {
		flex: 1;
		overflow: auto;
		border: 1px solid var(--bg-light, #3d3d3d);
		border-radius: 0.375rem;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.data-table thead {
		position: sticky;
		top: 0;
		background: var(--bg-medium, #2d2d2d);
		z-index: 10;
	}

	.data-table th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: var(--primary-orange, #ff6b35);
		border-bottom: 2px solid var(--primary-orange, #ff6b35);
		white-space: nowrap;
	}

	.data-table th.sortable {
		cursor: pointer;
		user-select: none;
	}

	.data-table th.sortable:hover {
		background: var(--bg-light, #3d3d3d);
	}

	.th-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sort-icon {
		font-size: 0.75rem;
		color: var(--primary-orange, #ff6b35);
	}

	.data-table tbody tr {
		border-bottom: 1px solid var(--bg-light, #3d3d3d);
		transition: background-color 0.2s;
		cursor: pointer;
	}

	.data-table tbody tr:hover {
		background: var(--bg-medium, #2d2d2d);
	}

	.data-table tbody tr.selected {
		background: rgba(255, 107, 53, 0.1);
		border-left: 3px solid var(--primary-orange, #ff6b35);
	}

	.data-table tbody tr.abnormal {
		background: rgba(244, 67, 54, 0.05);
	}

	.data-table tbody tr.abnormal.selected {
		background: rgba(244, 67, 54, 0.15);
		border-left: 3px solid var(--error, #f44336);
	}

	.data-table td {
		padding: 0.75rem 1rem;
		color: var(--text-primary, #ffffff);
		font-family: 'Roboto Mono', monospace;
	}

	.no-data {
		text-align: center;
		color: var(--text-secondary, #b0b0b0);
		padding: 2rem !important;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--success, #4caf50);
		color: white;
	}

	.status-badge.status-abnormal {
		background: var(--error, #f44336);
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--bg-medium, #2d2d2d);
		border-radius: 0.375rem;
		border: 1px solid var(--bg-light, #3d3d3d);
	}

	.btn-page,
	.btn-page-num {
		padding: 0.5rem 1rem;
		background: var(--bg-light, #3d3d3d);
		color: var(--text-primary, #ffffff);
		border: 1px solid var(--bg-light, #3d3d3d);
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.btn-page:hover:not(:disabled),
	.btn-page-num:hover:not(.active) {
		background: var(--primary-orange, #ff6b35);
		border-color: var(--primary-orange, #ff6b35);
	}

	.btn-page:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-page-num.active {
		background: var(--primary-orange, #ff6b35);
		border-color: var(--primary-orange, #ff6b35);
		font-weight: 600;
	}

	.page-numbers {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.page-ellipsis {
		color: var(--text-secondary, #b0b0b0);
		padding: 0 0.5rem;
	}

	/* 响应式设计 / Responsive design */
	@media (max-width: 768px) {
		.table-info {
			flex-direction: column;
			gap: 0.5rem;
		}

		.data-table {
			font-size: 0.75rem;
		}

		.data-table th,
		.data-table td {
			padding: 0.5rem;
		}

		.pagination {
			flex-wrap: wrap;
		}

		.btn-page,
		.btn-page-num {
			padding: 0.375rem 0.75rem;
			font-size: 0.75rem;
		}
	}
</style>
