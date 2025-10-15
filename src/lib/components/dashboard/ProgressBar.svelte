<script lang="ts">
	/**
	 * 进度条组件 / Progress Bar Component
	 * 
	 * 显示检测进度
	 * Displays detection progress
	 */
	
	export let progress: number = 0; // 0-100
	export let label: string = '';
	export let status: string = '';
	export let showPercentage: boolean = true;
	export let animated: boolean = true;
	
	// 确保进度在0-100之间 / Ensure progress is between 0-100
	$: clampedProgress = Math.min(Math.max(progress, 0), 100);
</script>

<div class="progress-card">
	<div class="progress-header">
		<h3 class="progress-title">{label}</h3>
		{#if showPercentage}
			<span class="progress-percentage">{clampedProgress.toFixed(0)}%</span>
		{/if}
	</div>
	
	<div class="progress-bar-container">
		<div class="progress-bar">
			<div 
				class="progress-fill"
				class:animated
				style="width: {clampedProgress}%"
			></div>
		</div>
	</div>
	
	{#if status}
		<div class="progress-status">
			{status}
		</div>
	{/if}
</div>

<style>
	.progress-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	
	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.progress-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.progress-percentage {
		font-size: 18px;
		font-weight: bold;
		color: var(--primary-orange);
		font-family: 'Roboto Mono', monospace;
	}
	
	.progress-bar-container {
		width: 100%;
	}
	
	.progress-bar {
		width: 100%;
		height: 24px;
		background: var(--bg-dark);
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid var(--bg-light);
		position: relative;
	}
	
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--primary-orange) 0%, var(--primary-orange-light) 100%);
		transition: width 0.3s ease;
		position: relative;
	}
	
	.progress-fill.animated::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.3) 50%,
			transparent 100%
		);
		animation: shimmer 2s infinite;
	}
	
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
	
	.progress-status {
		text-align: center;
		font-size: 13px;
		color: var(--text-primary);
		font-weight: 500;
	}
</style>
