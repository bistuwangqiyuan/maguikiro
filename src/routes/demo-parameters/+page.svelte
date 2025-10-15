<script lang="ts">
	import { ParameterPanel } from '$lib/components/settings';
	import { testingStore } from '$lib/stores/testing';
	import { onMount } from 'svelte';

	let isRunning = false;

	// Subscribe to testing status
	$: isRunning = $testingStore.status === 'running';

	// Initialize with a mock session if none exists
	onMount(() => {
		if (!$testingStore.currentSession) {
			// Create a mock session for demo purposes
			testingStore.startTesting('Demo Project', {
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
			}).then(() => {
				// Stop immediately for demo
				testingStore.stopTesting();
			});
		}
	});

	function toggleTesting() {
		if (isRunning) {
			testingStore.pauseTesting();
		} else if ($testingStore.status === 'paused') {
			testingStore.resumeTesting();
		} else {
			testingStore.startTesting('Demo Project');
		}
	}
</script>

<svelte:head>
	<title>Parameter Panel Demo - DOPPLER</title>
</svelte:head>

<div class="demo-container">
	<div class="demo-header">
		<h1 class="demo-title">参数设置面板演示</h1>
		<p class="demo-subtitle">Parameter Panel Demo</p>
	</div>

	<div class="demo-content">
		<div class="demo-section">
			<h2 class="section-title">控制面板 / Control Panel</h2>
			<div class="control-panel">
				<button type="button" on:click={toggleTesting} class="btn-control">
					{isRunning ? '暂停检测 (Pause)' : '开始检测 (Start)'}
				</button>
				<div class="status-indicator" class:running={isRunning}>
					<span class="status-dot"></span>
					<span class="status-text">
						{isRunning ? '检测中 (Running)' : '已停止 (Stopped)'}
					</span>
				</div>
			</div>
		</div>

		<div class="demo-section">
			<h2 class="section-title">参数面板 / Parameter Panel</h2>
			<div class="panel-container">
				<ParameterPanel disabled={isRunning} />
			</div>
		</div>

		<div class="demo-section">
			<h2 class="section-title">当前参数 / Current Parameters</h2>
			<div class="parameters-display">
				{#if $testingStore.currentSession}
					<div class="param-item">
						<span class="param-label">增益 (Gain):</span>
						<span class="param-value">{$testingStore.currentSession.parameters.gain.toFixed(1)} dB</span>
					</div>
					<div class="param-item">
						<span class="param-label">滤波器 (Filter):</span>
						<span class="param-value">{$testingStore.currentSession.parameters.filter}</span>
					</div>
					<div class="param-item">
						<span class="param-label">速度 (Velocity):</span>
						<span class="param-value">{$testingStore.currentSession.parameters.velocity.toFixed(2)} m/s</span>
					</div>
					<div class="param-item">
						<span class="param-label">阈值 (Threshold):</span>
						<span class="param-value">{$testingStore.currentSession.parameters.threshold.toFixed(2)}</span>
					</div>
				{:else}
					<p class="no-session">无活动会话 / No active session</p>
				{/if}
			</div>
		</div>

		<div class="demo-section">
			<h2 class="section-title">使用说明 / Instructions</h2>
			<div class="instructions">
				<ol>
					<li>调整增益滑块以改变信号放大倍数 (0-100 dB)</li>
					<li>选择滤波器类型以过滤不同频率的信号</li>
					<li>输入检测速度 (0.1-10 m/s)</li>
					<li>调整阈值以设置缺陷检测灵敏度 (0.1-10)</li>
					<li>点击"保存参数"按钮将参数保存到数据库</li>
					<li>检测运行时参数面板将被禁用</li>
				</ol>
			</div>
		</div>
	</div>
</div>

<style>
	.demo-container {
		min-height: 100vh;
		background: var(--bg-dark, #1a1a1a);
		padding: 2rem;
		color: var(--text-primary, #ffffff);
		font-family: 'Roboto', sans-serif;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid var(--primary-orange, #ff6b35);
	}

	.demo-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--primary-orange, #ff6b35);
	}

	.demo-subtitle {
		font-size: 1.25rem;
		margin: 0;
		color: var(--text-secondary, #b0b0b0);
	}

	.demo-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.demo-section {
		background: var(--bg-medium, #2d2d2d);
		border-radius: 8px;
		padding: 1.5rem;
		border: 1px solid var(--bg-light, #3d3d3d);
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--primary-orange, #ff6b35);
	}

	.control-panel {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.btn-control {
		padding: 0.75rem 2rem;
		background: var(--primary-orange, #ff6b35);
		border: none;
		border-radius: 4px;
		color: var(--text-primary, #ffffff);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.btn-control:hover {
		background: var(--primary-orange-dark, #e55a2b);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transform: translateY(-1px);
	}

	.btn-control:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--bg-dark, #1a1a1a);
		border-radius: 4px;
		border: 1px solid var(--bg-light, #3d3d3d);
	}

	.status-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--text-disabled, #666666);
		transition: background 0.3s;
	}

	.status-indicator.running .status-dot {
		background: var(--success, #4caf50);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.status-text {
		font-size: 0.95rem;
		color: var(--text-secondary, #b0b0b0);
	}

	.panel-container {
		max-width: 600px;
	}

	.parameters-display {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.param-item {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem;
		background: var(--bg-dark, #1a1a1a);
		border-radius: 4px;
		border: 1px solid var(--bg-light, #3d3d3d);
	}

	.param-label {
		color: var(--text-secondary, #b0b0b0);
		font-size: 0.95rem;
	}

	.param-value {
		color: var(--primary-orange, #ff6b35);
		font-family: 'Roboto Mono', monospace;
		font-weight: 600;
	}

	.no-session {
		text-align: center;
		color: var(--text-secondary, #b0b0b0);
		font-style: italic;
	}

	.instructions {
		background: var(--bg-dark, #1a1a1a);
		border-radius: 4px;
		padding: 1.5rem;
		border: 1px solid var(--bg-light, #3d3d3d);
	}

	.instructions ol {
		margin: 0;
		padding-left: 1.5rem;
		color: var(--text-secondary, #b0b0b0);
		line-height: 1.8;
	}

	.instructions li {
		margin-bottom: 0.5rem;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.demo-container {
			padding: 1rem;
		}

		.demo-title {
			font-size: 1.75rem;
		}

		.demo-subtitle {
			font-size: 1rem;
		}

		.control-panel {
			flex-direction: column;
			align-items: stretch;
		}

		.btn-control {
			width: 100%;
		}

		.parameters-display {
			grid-template-columns: 1fr;
		}
	}
</style>
