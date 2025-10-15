<script lang="ts">
	import DataTable from '$lib/components/data/DataTable.svelte';
	import { testingStore } from '$lib/stores/testing';
	import { onMount } from 'svelte';

	/**
	 * 数据表格演示页面 / Data Table Demo Page
	 */

	let isTestingStarted = false;

	onMount(() => {
		// 清理之前的会话 / Clean up previous session
		return () => {
			if (isTestingStarted) {
				testingStore.stopTesting();
			}
		};
	});

	async function startDemo() {
		const result = await testingStore.startTesting('数据表格演示', {
			gain: 50,
			filter: 'bandpass',
			velocity: 1.0,
			gateA: {
				enabled: true,
				start: 0.5,
				width: 1.0,
				height: 5.0,
				alarmThreshold: 1.5,
				color: '#FFD700'
			},
			gateB: {
				enabled: true,
				start: 2.0,
				width: 1.0,
				height: 5.0,
				alarmThreshold: 2.0,
				color: '#FF69B4'
			},
			threshold: 1.2
		});

		if (result.success) {
			isTestingStarted = true;
		}
	}

	async function stopDemo() {
		await testingStore.stopTesting();
		isTestingStarted = false;
	}

	function pauseDemo() {
		testingStore.pauseTesting();
	}

	function resumeDemo() {
		testingStore.resumeTesting();
	}
</script>

<div class="demo-page">
	<div class="demo-header">
		<h1>数据表格组件演示</h1>
		<p class="subtitle">Data Table Component Demo</p>
	</div>

	<div class="demo-controls">
		<div class="control-group">
			<h3>控制面板</h3>
			<div class="button-group">
				{#if !isTestingStarted}
					<button class="btn btn-primary" on:click={startDemo}>
						开始检测
					</button>
				{:else if $testingStore.status === 'running'}
					<button class="btn btn-warning" on:click={pauseDemo}>
						暂停检测
					</button>
					<button class="btn btn-error" on:click={stopDemo}>
						停止检测
					</button>
				{:else if $testingStore.status === 'paused'}
					<button class="btn btn-success" on:click={resumeDemo}>
						继续检测
					</button>
					<button class="btn btn-error" on:click={stopDemo}>
						停止检测
					</button>
				{/if}
			</div>
		</div>

		<div class="stats-group">
			<div class="stat-card">
				<span class="stat-label">状态</span>
				<span class="stat-value status-{$testingStore.status}">
					{$testingStore.status === 'running' ? '运行中' : 
					 $testingStore.status === 'paused' ? '已暂停' : 
					 $testingStore.status === 'completed' ? '已完成' : '错误'}
				</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">数据点数</span>
				<span class="stat-value">{$testingStore.processedBuffer.length}</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">缺陷数</span>
				<span class="stat-value text-error">{$testingStore.defects.length}</span>
			</div>
			<div class="stat-card">
				<span class="stat-label">采样率</span>
				<span class="stat-value">{$testingStore.progress.samplesCollected > 0 ? 
					Math.round($testingStore.progress.samplesCollected / ($testingStore.progress.duration || 1)) : 0} Hz</span>
			</div>
		</div>
	</div>

	<div class="demo-content">
		<div class="section-header">
			<h2>实时数据表格</h2>
			<p>显示检测过程中采集的信号数据，支持排序、分页和异常数据高亮</p>
		</div>

		<div class="table-container">
			<DataTable pageSize={15} />
		</div>
	</div>

	{#if $testingStore.error}
		<div class="error-message">
			<strong>错误:</strong> {$testingStore.error}
		</div>
	{/if}
</div>

<style>
	.demo-page {
		min-height: 100vh;
		background: var(--bg-dark, #1a1a1a);
		color: var(--text-primary, #ffffff);
		padding: 2rem;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--primary-orange, #ff6b35);
	}

	.demo-header h1 {
		font-size: 2rem;
		color: var(--primary-orange, #ff6b35);
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		color: var(--text-secondary, #b0b0b0);
		margin: 0;
	}

	.demo-controls {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--bg-medium, #2d2d2d);
		border-radius: 0.5rem;
		border: 1px solid var(--bg-light, #3d3d3d);
	}

	.control-group h3 {
		margin: 0 0 1rem 0;
		color: var(--primary-orange, #ff6b35);
		font-size: 1rem;
	}

	.button-group {
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.btn-primary {
		background: var(--primary-orange, #ff6b35);
		color: white;
	}

	.btn-primary:hover {
		background: var(--primary-orange-dark, #e55a2b);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
	}

	.btn-warning {
		background: var(--warning, #ffc107);
		color: #1a1a1a;
	}

	.btn-warning:hover {
		background: #ffb300;
	}

	.btn-success {
		background: var(--success, #4caf50);
		color: white;
	}

	.btn-success:hover {
		background: #45a049;
	}

	.btn-error {
		background: var(--error, #f44336);
		color: white;
	}

	.btn-error:hover {
		background: #da190b;
	}

	.stats-group {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--bg-dark, #1a1a1a);
		border-radius: 0.375rem;
		border: 1px solid var(--bg-light, #3d3d3d);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-secondary, #b0b0b0);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		font-family: 'Roboto Mono', monospace;
		color: var(--text-primary, #ffffff);
	}

	.stat-value.status-running {
		color: var(--success, #4caf50);
	}

	.stat-value.status-paused {
		color: var(--warning, #ffc107);
	}

	.stat-value.status-completed {
		color: var(--info, #2196f3);
	}

	.stat-value.status-error {
		color: var(--error, #f44336);
	}

	.text-error {
		color: var(--error, #f44336);
	}

	.demo-content {
		margin-bottom: 2rem;
	}

	.section-header {
		margin-bottom: 1rem;
	}

	.section-header h2 {
		font-size: 1.5rem;
		color: var(--primary-orange, #ff6b35);
		margin: 0 0 0.5rem 0;
	}

	.section-header p {
		color: var(--text-secondary, #b0b0b0);
		margin: 0;
	}

	.table-container {
		height: 600px;
		background: var(--bg-medium, #2d2d2d);
		border-radius: 0.5rem;
		border: 2px solid var(--primary-orange, #ff6b35);
		overflow: hidden;
	}

	.error-message {
		padding: 1rem;
		background: rgba(244, 67, 54, 0.1);
		border: 1px solid var(--error, #f44336);
		border-radius: 0.375rem;
		color: var(--error, #f44336);
	}

	@media (max-width: 768px) {
		.demo-page {
			padding: 1rem;
		}

		.demo-controls {
			grid-template-columns: 1fr;
		}

		.button-group {
			flex-direction: column;
		}

		.table-container {
			height: 500px;
		}
	}
</style>
