<script lang="ts">
	/**
	 * 状态指示器组件 / Status Indicator Component
	 * 
	 * 显示设备状态和系统健康度
	 * Displays device status and system health
	 */
	
	export let status: 'idle' | 'running' | 'paused' | 'error' | 'warning' = 'idle';
	export let label: string = '';
	export let details: Array<{ label: string; value: string }> = [];
	export let showWarning: boolean = false;
	
	// 状态配置 / Status configuration
	const statusConfig = {
		idle: {
			color: 'var(--text-disabled)',
			text: '就绪 / Ready',
			icon: '●'
		},
		running: {
			color: 'var(--success)',
			text: '运行中 / Running',
			icon: '●'
		},
		paused: {
			color: 'var(--warning)',
			text: '暂停 / Paused',
			icon: '●'
		},
		error: {
			color: 'var(--error)',
			text: '错误 / Error',
			icon: '⚠'
		},
		warning: {
			color: 'var(--warning)',
			text: '警告 / Warning',
			icon: '⚠'
		}
	};
	
	$: currentStatus = statusConfig[status];
</script>

<div class="status-card">
	<div class="status-header">
		<h3 class="status-title">{label}</h3>
		{#if showWarning}
			<span class="warning-icon" title="异常警告 / Warning">⚠</span>
		{/if}
	</div>
	
	<div class="status-body">
		<div class="status-indicator" class:active={status === 'running'}>
			<span 
				class="status-dot" 
				class:pulse={status === 'running'}
				style="background: {currentStatus.color}"
			></span>
			<span class="status-text">{currentStatus.text}</span>
		</div>
		
		{#if details.length > 0}
			<div class="status-details">
				{#each details as detail}
					<div class="detail-item">
						<span class="detail-label">{detail.label}:</span>
						<span class="detail-value">{detail.value}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.status-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	
	.status-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.status-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.warning-icon {
		font-size: 20px;
		color: var(--warning);
		animation: blink 1.5s ease-in-out infinite;
	}
	
	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}
	
	.status-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	
	.status-indicator {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 20px;
		background: var(--bg-dark);
		border-radius: 24px;
		border: 2px solid var(--bg-light);
		transition: border-color 0.3s ease;
	}
	
	.status-indicator.active {
		border-color: var(--success);
	}
	
	.status-dot {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		transition: all 0.3s ease;
	}
	
	.status-dot.pulse {
		box-shadow: 0 0 12px currentColor;
		animation: pulse 2s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { 
			opacity: 1;
			transform: scale(1);
		}
		50% { 
			opacity: 0.6;
			transform: scale(1.1);
		}
	}
	
	.status-text {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary);
	}
	
	.status-details {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.detail-item {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		padding: 4px 0;
	}
	
	.detail-label {
		color: var(--text-secondary);
	}
	
	.detail-value {
		color: var(--text-primary);
		font-weight: 600;
		font-family: 'Roboto Mono', monospace;
	}
</style>
